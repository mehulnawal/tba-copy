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
      `Minimum cart value of Ã¢â€šÂ¹${coupon.minimumCartValue} required for this coupon`,
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

const calculateCartSummary = (items, discount = 0, referenceDiscount = 0) => {
  const roundMoney = (value) =>
    Math.round((Number(value || 0) + Number.EPSILON) * 100) / 100;
  const subtotal = roundMoney(
    items.reduce(
      (sum, item) =>
        sum +
        (item.lineTotal === undefined
          ? Number(item.price || 0) * Number(item.quantity || 0)
          : Number(item.lineTotal || 0)),
      0,
    ),
  );
  const checkoutDiscount = roundMoney(
    Math.min(Number(discount || 0), subtotal),
  );
  const appliedReferenceDiscount = roundMoney(
    Math.min(
      Number(referenceDiscount || 0),
      Math.max(subtotal - checkoutDiscount, 0),
    ),
  );
  const taxableSubtotal = roundMoney(
    Math.max(subtotal - checkoutDiscount - appliedReferenceDiscount, 0),
  );
  const gst = roundMoney(taxableSubtotal * 0.03);
  const shippingFee = items.length ? 150 : 0;
  return {
    subtotal,
    discount: checkoutDiscount,
    referenceDiscount: appliedReferenceDiscount,
    taxableSubtotal,
    gst,
    shippingFee,
    total: roundMoney(taxableSubtotal + gst + shippingFee),
    itemCount: items.reduce((sum, item) => sum + Number(item.quantity || 0), 0),
  };
};
module.exports = {
  calculateCouponDiscount,
  calculateCartSummary,
};
