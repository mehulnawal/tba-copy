const { calculatePrice, resolveSettings } = require("./priceCalculator");
const { calculateCouponDiscount } = require("./checkoutUtils");
const {
  resolveActiveCategoryCouponForPricingKey,
} = require("../controllers/categoryCoupon.controller");

const roundMoney = (value) =>
  Math.round((Number(value || 0) + Number.EPSILON) * 100) / 100;
const lineTotal = (item) =>
  roundMoney(
    item.lineTotal === undefined
      ? Number(item.price || 0) * Number(item.quantity || 0)
      : item.lineTotal,
  );

const repriceCartItem = async (item, product) => {
  const price = await calculatePrice(product, item.karat, "B2C");
  const basePrice = Math.max(0, roundMoney(price.totalCost));
  const quantity = Math.max(1, Number(item.quantity || 1));
  let discount = 0;
  let label = "";

  if (item.categoryCouponApplied) {
    const settings = await resolveSettings(product);
    const coupon = await resolveActiveCategoryCouponForPricingKey(settings.key);
    if (coupon) {
      try {
        discount = roundMoney(
          calculateCouponDiscount(coupon, basePrice * quantity),
        );
        label =
          coupon.discountType === "percentage"
            ? `${coupon.discountValue}% OFF`
            : `₹${coupon.discountValue} OFF`;
      } catch {
        item.categoryCouponApplied = false;
      }
    } else {
      item.categoryCouponApplied = false;
    }
  }

  item.price = basePrice;
  item.basePrice = basePrice;
  item.categoryCouponDiscount = discount;
  item.categoryCouponLabel = label;
  item.lineTotal = roundMoney(Math.max(0, basePrice * quantity - discount));
  return { price, basePrice, discount, lineTotal: item.lineTotal };
};

module.exports = { roundMoney, lineTotal, repriceCartItem };
