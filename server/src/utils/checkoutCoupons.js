const Coupon = require("../models/coupon.model");
const Order = require("../models/order.model");
const User = require("../models/user.model");
const ApiError = require("./ApiError");
const { calculateCouponDiscount } = require("./checkoutUtils");

const WELCOME_COUPON = {
  code: "WELCOME1000",
  discountType: "flat",
  discountValue: 1000,
  minimumCartValue: 0,
  eligibilityLabel: "For first-time customers only",
};

const isWelcomeCoupon = (code) =>
  String(code || "").toUpperCase() === WELCOME_COUPON.code;

const isWelcomeEligible = async (user) => {
  const phone = String(user?.phone || "").trim();
  if (!phone) return false;

  const matchingUsers = await User.find({ phone }).select("_id").lean();
  if (!matchingUsers.length) return false;

  const priorOrder = await Order.exists({
    customer: { $in: matchingUsers.map((entry) => entry._id) },
    orderStatus: "confirmed",
    paymentStatus: "paid",
  });
  return !priorOrder;
};

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
  // Keep the legacy field populated for existing carts and integrations.
  cart.appliedCoupon = normalized[0] || null;
};

const resolveCoupons = async ({ codes, user, subtotal }) => {
  const entries = [];
  let totalDiscount = 0;

  for (const code of codes) {
    const remaining = Math.max(subtotal - totalDiscount, 0);
    if (remaining <= 0) break;

    if (isWelcomeCoupon(code)) {
      if (!(await isWelcomeEligible(user))) {
        throw new ApiError(
          400,
          "WELCOME1000 is only available for first-time customers",
        );
      }
      const discount = Math.min(WELCOME_COUPON.discountValue, remaining);
      entries.push({
        ...WELCOME_COUPON,
        discount,
        discountDisplay: "?1000 OFF",
      });
      totalDiscount += discount;
      continue;
    }

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
          : `?${coupon.discountValue} OFF`,
    });
    totalDiscount += discount;
  }

  return { entries, totalDiscount };
};

module.exports = {
  WELCOME_COUPON,
  getAppliedCodes,
  isWelcomeCoupon,
  isWelcomeEligible,
  resolveCoupons,
  setAppliedCodes,
};
