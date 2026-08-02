const Cart = require("../models/cart.model");
const Coupon = require("../models/coupon.model");
const Address = require("../models/address.model");
const Product = require("../models/product.model");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");
const { calculateCartSummary } = require("../utils/checkoutUtils");
const {
  WELCOME_COUPON,
  getAppliedCodes,
  isWelcomeCoupon,
  isWelcomeEligible,
  resolveCoupons,
  setAppliedCodes,
} = require("../utils/checkoutCoupons");

const getOrCreateCart = async (userId) => {
  let cart = await Cart.findOne({ user: userId });
  if (!cart) cart = await Cart.create({ user: userId, items: [] });
  return cart;
};

const refreshCartPrices = async (cart) => {
  let changed = false;
  for (const item of cart.items) {
    const product = await Product.findOne({ SKU: item.productId });
    if (!product) throw new ApiError(400, `${item.name} is no longer available`);
    const current = await require("../utils/priceCalculator").calculatePrice(product, item.karat);
    if (Math.round(Number(item.price) * 100) !== Math.round(Number(current.finalPrice) * 100)) {
      item.price = current.finalPrice;
      changed = true;
    }
  }
  if (changed) await cart.save();
  return changed;
};

const getCouponState = async (cart, user) => {
  const codes = getAppliedCodes(cart);
  const subtotal = cart.items.reduce((total, item) => total + item.price * item.quantity, 0);
  const validCodes = [];
  const entries = [];
  let totalDiscount = 0;

  for (const code of codes) {
    try {
      const resolved = await resolveCoupons({ codes: [code], user, subtotal: Math.max(subtotal - totalDiscount, 0) });
      validCodes.push(code);
      entries.push(...resolved.entries);
      totalDiscount += resolved.totalDiscount;
    } catch {
      // Invalid, expired, exhausted, or no-longer-first-time coupons disappear from the cart.
    }
  }

  if (codes.length !== validCodes.length || cart.appliedCoupon !== (validCodes[0] || null)) {
    setAppliedCodes(cart, validCodes);
    await cart.save();
  }
  return { entries, totalDiscount };
};

const getCartSummary = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.user._id);
  const priceChanged = await refreshCartPrices(cart);
  const { entries: coupons, totalDiscount } = await getCouponState(cart, req.user);
  const summary = calculateCartSummary(cart.items, totalDiscount);

  res.status(200).json(new ApiResponse(200, { cart, summary, coupons, coupon: coupons[0] || null, priceChanged }, priceChanged ? "Prices updated to current rates" : "Cart summary fetched successfully"));
});

const applyCoupon = asyncHandler(async (req, res) => {
  const code = String(req.body?.code || "").trim().toUpperCase();
  if (!code) throw new ApiError(400, "Coupon code is required");

  if (isWelcomeCoupon(code)) {
    if (!(await isWelcomeEligible(req.user))) throw new ApiError(400, "WELCOME1000 is only available for first-time customers");
  } else if (!(await Coupon.findOne({ code }))) {
    throw new ApiError(404, "Invalid coupon code");
  }

  const cart = await getOrCreateCart(req.user._id);
  const codes = getAppliedCodes(cart);
  if (codes.includes(code)) throw new ApiError(400, "This coupon has already been applied");

  const subtotal = cart.items.reduce((total, item) => total + item.price * item.quantity, 0);
  const { entries: existing, totalDiscount: existingDiscount } = await resolveCoupons({ codes, user: req.user, subtotal });
  const { entries: added, totalDiscount: addedDiscount } = await resolveCoupons({ codes: [code], user: req.user, subtotal: Math.max(subtotal - existingDiscount, 0) });
  const coupons = [...existing, ...added];
  setAppliedCodes(cart, [...codes, code]);
  await cart.save();

  res.status(200).json(new ApiResponse(200, { cart, summary: calculateCartSummary(cart.items, existingDiscount + addedDiscount), coupons, coupon: coupons[0] || null }, "Coupon applied successfully"));
});

const removeCoupon = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.user._id);
  const code = String(req.body?.code || "").trim().toUpperCase();
  const remaining = code ? getAppliedCodes(cart).filter((entry) => entry !== code) : [];
  setAppliedCodes(cart, remaining);
  await cart.save();
  const { entries: coupons, totalDiscount } = await getCouponState(cart, req.user);
  res.status(200).json(new ApiResponse(200, { cart, summary: calculateCartSummary(cart.items, totalDiscount), coupons, coupon: coupons[0] || null }, "Coupon removed successfully"));
});

const getAvailableCoupons = asyncHandler(async (req, res) => {
  const coupons = (await isWelcomeEligible(req.user)) ? [WELCOME_COUPON] : [];
  res.status(200).json(new ApiResponse(200, coupons, "Available checkout coupons fetched successfully"));
});

const getOrderSummary = asyncHandler(async (req, res) => {
  const { addressId } = req.query;
  const cart = await getOrCreateCart(req.user._id);
  if (!cart.items.length) throw new ApiError(400, "Cart is empty");

  let address = null;
  if (addressId) {
    address = await Address.findOne({ _id: addressId, user: req.user._id });
    if (!address) throw new ApiError(404, "Selected address not found");
  } else {
    address = await Address.findOne({ user: req.user._id, isDefault: true });
  }

  const priceChanged = await refreshCartPrices(cart);
  const { entries: coupons, totalDiscount } = await getCouponState(cart, req.user);
  res.status(200).json(new ApiResponse(200, { items: cart.items, address, coupons, coupon: coupons[0] || null, summary: calculateCartSummary(cart.items, totalDiscount), priceChanged }, priceChanged ? "Prices updated to current rates; please review your cart" : "Order summary fetched successfully"));
});

module.exports = { getCartSummary, applyCoupon, removeCoupon, getAvailableCoupons, getOrderSummary };
