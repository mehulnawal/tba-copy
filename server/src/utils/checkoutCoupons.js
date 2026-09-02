const Coupon = require("../models/coupon.model");
const ApiError = require("./ApiError");
const { calculateCouponDiscount } = require("./checkoutUtils");

const getAppliedCodes = (cart) =>
  Array.from(
    new Set(
      [
        ...(Array.isArray(cart.appliedCoupons) ? cart.appliedCoupons : []),
        ...(cart.appliedCoupon ? [cart.appliedCoupon] : []),
      ].map((code) => String(code).toUpperCase()),
    ),
  );

const setAppliedCodes = (cart, codes) => {
  const normalized = Array.from(
    new Set(codes.map((code) => String(code).toUpperCase())),
  );
  cart.appliedCoupons = normalized;
  cart.appliedCoupon = normalized[0] || null;
};

const resolveCoupons = async ({ codes, subtotal }) => {
  const entries = [];
  let totalDiscount = 0;

  for (const code of codes) {
    const remaining = Math.max(subtotal - totalDiscount, 0);
    if (remaining <= 0) break;
    const coupon = await Coupon.findOne({ code: String(code).toUpperCase() });
    if (!coupon) throw new ApiError(400, `${code} is no longer available`);

    const discount = Math.min(
      calculateCouponDiscount(coupon, remaining),
      remaining,
    );
    entries.push({
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      discount,
      discountDisplay:
        coupon.discountType === "percentage"
          ? `${coupon.discountValue}% OFF`
          : `\u20b9${coupon.discountValue} OFF`,
    });
    totalDiscount += discount;
  }

  return { entries, totalDiscount };
};

module.exports = { getAppliedCodes, resolveCoupons, setAppliedCodes };
