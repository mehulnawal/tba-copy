const { DISCOUNT_TYPES } = require("../constants/coupon.constants");
const ApiError = require("./ApiError");

const calculateCouponDiscount = (coupon, cartTotal) => {
  if (!coupon.activeStatus) {
    throw new ApiError(400, "This coupon is inactive");
  }

  if (new Date(coupon.expiryDate) < new Date()) {
    throw new ApiError(400, "This coupon has expired");
  }

  if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
    throw new ApiError(400, "This coupon has reached its usage limit");
  }

  if (cartTotal < coupon.minimumCartValue) {
    throw new ApiError(
      400,
      `Minimum cart value of ₹${coupon.minimumCartValue} required for this coupon`,
    );
  }

  let discount = 0;

  if (coupon.discountType === DISCOUNT_TYPES.PERCENTAGE) {
    discount = (cartTotal * coupon.discountValue) / 100;
  } else {
    discount = coupon.discountValue;
  }

  return Math.min(discount, cartTotal);
};

const calculateCartSummary = (items, discount = 0) => {
  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  const shippingFee = subtotal > 25000 || subtotal === 0 ? 0 : 150;

  return {
    subtotal,
    discount,
    shippingFee,
    total: Math.max(subtotal - discount + shippingFee, 0),
    itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
  };
};

module.exports = {
  calculateCouponDiscount,
  calculateCartSummary,
};
