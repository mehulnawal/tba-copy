const CATEGORY_COUPON_CATEGORIES = Object.freeze({
  GOLD: "gold",
  POLKI: "polki",
  MOISSANITE: "moissanite",
});
const CATEGORY_COUPON_PRICING_KEYS = Object.freeze({
  gold: ["GOLD_STANDARD", "GOLD_LAB_GROWN"],
  polki: ["SILVER_POLKI"],
  moissanite: ["SILVER_MOISSANITE"],
});
const categoryCouponForPricingKey = (pricingKey) =>
  Object.entries(CATEGORY_COUPON_PRICING_KEYS).find(([, keys]) =>
    keys.includes(
      String(pricingKey || "")
        .trim()
        .toUpperCase(),
    ),
  )?.[0] || null;
module.exports = {
  CATEGORY_COUPON_CATEGORIES,
  CATEGORY_COUPON_PRICING_KEYS,
  categoryCouponForPricingKey,
};
