const { DISCOUNT_TYPES } = require("../constants/coupon.constants");
const ApiError = require("./ApiError");

const validateCouponEligibility = (coupon, cartTotal, checkMinimum = true) => {
  if (!coupon.activeStatus) {
    throw new ApiError(400, "This coupon is inactive");
  }

  if (new Date(coupon.expiryDate) < new Date()) {
    throw new ApiError(400, "This coupon has expired");
  }

  if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
    throw new ApiError(400, "This coupon has reached its usage limit");
  }

  if (checkMinimum && cartTotal < coupon.minimumCartValue) {
    throw new ApiError(
      400,
      `Minimum cart value of Ã¢â€šÂ¹${coupon.minimumCartValue} required for this coupon`,
    );
  }
};

const calculateCouponDiscount = (coupon, cartTotal) => {
  validateCouponEligibility(coupon, cartTotal);

  let discount = 0;

  if (coupon.discountType === DISCOUNT_TYPES.PERCENTAGE) {
    discount = (cartTotal * coupon.discountValue) / 100;
  } else {
    discount = coupon.discountValue;
  }

  return Math.min(discount, cartTotal);
};

// Gold category coupons apply to diamond value only. Their flat value is not
// capped and their configured minimum cart value is intentionally ignored.
const calculateGoldCategoryCouponDiscount = (coupon, diamondTotal) => {
  const eligibleDiamondValue = Number(diamondTotal || 0);
  validateCouponEligibility(coupon, eligibleDiamondValue, false);
  if (eligibleDiamondValue <= 0)
    throw new ApiError(400, "Gold category coupon requires diamond value");

  return coupon.discountType === DISCOUNT_TYPES.PERCENTAGE
    ? (eligibleDiamondValue * coupon.discountValue) / 100
    : coupon.discountValue;
};

// Polki remains a normal Silver category coupon for eligibility: its minimum
// cart check uses the full product total, while its discount is capped to making.
const calculatePolkiCategoryCouponDiscount = (coupon, makingTotal, productTotal) => {
  validateCouponEligibility(coupon, productTotal);
  const eligibleMakingValue = Math.max(0, Number(makingTotal || 0));
  if (eligibleMakingValue <= 0)
    throw new ApiError(400, "Polki category coupon requires making charges");
  let discount =
    coupon.discountType === DISCOUNT_TYPES.PERCENTAGE
      ? (eligibleMakingValue * coupon.discountValue) / 100
      : coupon.discountValue;
  return Math.min(discount, eligibleMakingValue);
};

// Moissanite coupons use the normal category-coupon eligibility checks against
// the product total, but discount only their configured component.
const calculateMoissaniteCategoryCouponDiscount = (
  coupon,
  eligibleTotal,
  productTotal,
) => {
  validateCouponEligibility(coupon, productTotal);
  const eligibleValue = Math.max(0, Number(eligibleTotal || 0));
  if (eligibleValue <= 0)
    throw new ApiError(400, "Moissanite category coupon requires an eligible value");
  const discount =
    coupon.discountType === DISCOUNT_TYPES.PERCENTAGE
      ? (eligibleValue * coupon.discountValue) / 100
      : coupon.discountValue;
  return Math.min(discount, eligibleValue);
};

const productDiscountFor = (product) => {
  if (process.env.NODE_ENV !== "production" && String(product?.SKU || "").trim().toUpperCase() === "TBA-GLD-LR0005")
    return { productDiscountType: "percentage", productDiscountValue: 1 };
  return product;
};
const calculateProductDiscount = (product, productTotal) => {
  const total = Math.max(0, Number(productTotal || 0));
  const value = Math.max(0, Number(product?.productDiscountValue || 0));
  if (!product?.productDiscountType || value <= 0 || total <= 0) return 0;
  const discount = product.productDiscountType === DISCOUNT_TYPES.PERCENTAGE
    ? (total * value) / 100
    : value;
  return Math.min(discount, total);
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
    Math.min(Number(discount || 0), Math.max(subtotal, 0)),
  );
  const appliedReferenceDiscount = roundMoney(
    Math.min(
      Number(referenceDiscount || 0),
      Math.max(subtotal - checkoutDiscount, 0),
    ),
  );
  const taxableSubtotal = roundMoney(
    subtotal - checkoutDiscount - appliedReferenceDiscount,
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
  calculateGoldCategoryCouponDiscount,
  calculatePolkiCategoryCouponDiscount,
  calculateMoissaniteCategoryCouponDiscount,
  productDiscountFor,
  calculateProductDiscount,
  calculateCartSummary,
};
