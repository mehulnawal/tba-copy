const crypto = require("crypto");
const Razorpay = require("razorpay");
const Order = require("../models/order.model");
const Cart = require("../models/cart.model");
const Product = require("../models/product.model");
const Coupon = require("../models/coupon.model");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");
const { calculatePrice } = require("../utils/priceCalculator");
const { calculateCartSummary } = require("../utils/checkoutUtils");
const { getAppliedCodes, resolveCoupons, setAppliedCodes, isWelcomeCoupon } = require("../utils/checkoutCoupons");

const client = () => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) throw new ApiError(503, "Razorpay is not configured");
  return new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });
};

const confirm = async (order, paymentId) => {
  if (order.orderStatus === "confirmed") return order;
  order.orderStatus = "confirmed";
  order.paymentStatus = "paid";
  order.razorpayPaymentId = paymentId;
  const coupons = order.coupons?.length ? order.coupons : (order.coupon?.code ? [order.coupon] : []);
  for (const coupon of coupons) {
    if (coupon.code && !isWelcomeCoupon(coupon.code)) await Coupon.updateOne({ code: coupon.code }, { $inc: { usedCount: 1 } });
  }
  await order.save();
  await Cart.updateOne({ user: order.customer }, { $set: { items: [], appliedCoupon: null, appliedCoupons: [] } });
  return order;
};

const place = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart?.items.length) throw new ApiError(400, "Cart is empty");

  const items = [];
  for (const entry of cart.items) {
    const product = await Product.findOne({ SKU: entry.productId });
    if (!product) throw new ApiError(400, "A cart product is no longer available");
    const price = await calculatePrice(product, entry.karat);
    items.push({ productSku: entry.productId, title: product.title, image: entry.image, karat: entry.karat, color: entry.color, size: entry.size, quantity: entry.quantity, priceSnapshot: price });
  }

  const pricedItems = items.map((item) => ({ productId: item.productSku, category: cart.items.find((cartItem) => cartItem.productId === item.productSku)?.category, price: item.priceSnapshot.finalPrice, quantity: item.quantity }));
  const subtotal = pricedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const { entries, totalDiscount } = await resolveCoupons({ codes: getAppliedCodes(cart), user: req.user, subtotal });
  const summary = calculateCartSummary(pricedItems, totalDiscount);
  const storedCoupons = entries.map((coupon) => ({ code: coupon.code, discount: coupon.discount }));

  let order = await Order.findOne({ customer: req.user._id, orderStatus: "pending", paymentStatus: "pending" });
  if (order) {
    order.items = items;
    order.amount = summary.total;
    order.coupon = storedCoupons[0];
    order.coupons = storedCoupons;
  } else {
    order = new Order({ customer: req.user._id, items, amount: summary.total, coupon: storedCoupons[0], coupons: storedCoupons });
  }

  const razorpayOrder = await client().orders.create({ amount: Math.round(summary.total * 100), currency: "INR", receipt: String(order._id) });
  order.razorpayOrderId = razorpayOrder.id;
  await order.save();
  res.status(201).json(new ApiResponse(201, { order, razorpayOrder, keyId: process.env.RAZORPAY_KEY_ID }, "Payment order created"));
});

const verify = asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  const expected = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET).update(`${razorpay_order_id}|${razorpay_payment_id}`).digest("hex");
  if (expected !== razorpay_signature) throw new ApiError(400, "Invalid payment signature");
  const order = await Order.findOne({ razorpayOrderId: razorpay_order_id, customer: req.user._id });
  if (!order) throw new ApiError(404, "Order not found");
  await confirm(order, razorpay_payment_id);
  res.json(new ApiResponse(200, order, "Payment confirmed"));
});

const getMyOrders = asyncHandler(async (req, res) => res.json(new ApiResponse(200, await Order.find({ customer: req.user._id }).sort({ createdAt: -1 }), "Orders fetched")));
const getMyOrder = asyncHandler(async (req, res) => { const order = await Order.findOne({ _id: req.params.orderId, customer: req.user._id }); if (!order) throw new ApiError(404, "Order not found"); res.json(new ApiResponse(200, order, "Order fetched")); });
const webhook = asyncHandler(async (req, res) => { const signature = req.headers["x-razorpay-signature"]; const rawBody = req.body; if (!signature || !Buffer.isBuffer(rawBody)) throw new ApiError(400, "Invalid webhook signature"); const expected = crypto.createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET || "").update(rawBody).digest("hex"); if (expected.length !== signature.length || !crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature))) throw new ApiError(400, "Invalid webhook signature"); const event = JSON.parse(rawBody.toString("utf8")); const payment = event.payload?.payment?.entity; const order = await Order.findOne({ razorpayOrderId: payment?.order_id }); if (order && event.event === "payment.captured") await confirm(order, payment.id); if (order && event.event === "payment.failed" && order.orderStatus !== "confirmed") { order.orderStatus = "failed"; order.paymentStatus = "failed"; await order.save(); } res.status(200).json({ ok: true }); });
module.exports = { place, verify, getMyOrders, getMyOrder, webhook };
