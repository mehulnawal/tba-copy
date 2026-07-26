const Cart = require("../models/cart.model");
const Coupon = require("../models/coupon.model");
const Address = require("../models/address.model");
const Product = require("../models/product.model");
const { calculatePrice } = require("../utils/priceCalculator");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");
const {
  calculateCouponDiscount,
  calculateCartSummary,
} = require("../utils/checkoutUtils");

const getOrCreateCart = async (userId) => {
  let cart = await Cart.findOne({ user: userId });
  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] });
  }
  return cart;
};

const refreshCartPrices = async (cart) => {
  let changed = false;
  for (const item of cart.items) {
    const product = await Product.findOne({ SKU: item.productId });
    if (!product) throw new ApiError(400, `${item.name} is no longer available`);
    const current = await calculatePrice(product, item.karat);
    if (Math.round(Number(item.price) * 100) !== Math.round(Number(current.finalPrice) * 100)) { item.price = current.finalPrice; changed = true; }
  }
  if (changed) await cart.save();
  return changed;
};
const getCartSummary = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.user._id);
  const priceChanged = await refreshCartPrices(cart);
  let discount = 0;

  if (cart.appliedCoupon) {
    const coupon = await Coupon.findOne({
      code: cart.appliedCoupon.toUpperCase(),
    });
    if (coupon) {
      try {
        const subtotal = cart.items.reduce(
          (acc, item) => acc + item.price * item.quantity,
          0,
        );
        discount = calculateCouponDiscount(coupon, subtotal);
      } catch {
        cart.appliedCoupon = null;
        await cart.save();
      }
    }
  }

  const summary = calculateCartSummary(cart.items, discount);

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { cart, summary, priceChanged },
        priceChanged ? "Prices updated to current rates" : "Cart summary fetched successfully",
      ),
    );
});

const applyCoupon = asyncHandler(async (req, res) => {
  const { code } = req.body;

  if (!code) {
    throw new ApiError(400, "Coupon code is required");
  }

  const coupon = await Coupon.findOne({ code: code.toUpperCase() });
  if (!coupon) {
    throw new ApiError(404, "Invalid coupon code");
  }

  const cart = await getOrCreateCart(req.user._id);
  const subtotal = cart.items.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0,
  );

  const discount = calculateCouponDiscount(coupon, subtotal);
  cart.appliedCoupon = coupon.code;
  await cart.save();

  const summary = calculateCartSummary(cart.items, discount);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        cart,
        summary,
        coupon: {
          code: coupon.code,
          discountType: coupon.discountType,
          discountValue: coupon.discountValue,
        },
      },
      "Coupon applied successfully",
    ),
  );
});

const removeCoupon = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.user._id);
  cart.appliedCoupon = null;
  await cart.save();

  const summary = calculateCartSummary(cart.items, 0);

  res
    .status(200)
    .json(
      new ApiResponse(200, { cart, summary }, "Coupon removed successfully"),
    );
});

const getOrderSummary = asyncHandler(async (req, res) => {
  const { addressId } = req.query;

  const cart = await getOrCreateCart(req.user._id);

  if (cart.items.length === 0) {
    throw new ApiError(400, "Cart is empty");
  }

  let address = null;
  if (addressId) {
    address = await Address.findOne({
      _id: addressId,
      user: req.user._id,
    });
    if (!address) {
      throw new ApiError(404, "Selected address not found");
    }
  } else {
    address = await Address.findOne({
      user: req.user._id,
      isDefault: true,
    });
  }

  const priceChanged = await refreshCartPrices(cart);
  let discount = 0;
  let coupon = null;

  if (cart.appliedCoupon) {
    coupon = await Coupon.findOne({ code: cart.appliedCoupon.toUpperCase() });
    if (coupon) {
      const subtotal = cart.items.reduce(
        (acc, item) => acc + item.price * item.quantity,
        0,
      );
      try {
        discount = calculateCouponDiscount(coupon, subtotal);
      } catch {
        cart.appliedCoupon = null;
        coupon = null;
        await cart.save();
      }
    }
  }

  const summary = calculateCartSummary(cart.items, discount);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        items: cart.items,
        address,
        coupon,
        summary,
        priceChanged,
      },
      priceChanged ? "Prices updated to current rates; please review your cart" : "Order summary fetched successfully",
    ),
  );
});

module.exports = {
  getCartSummary,
  applyCoupon,
  removeCoupon,
  getOrderSummary,
};
