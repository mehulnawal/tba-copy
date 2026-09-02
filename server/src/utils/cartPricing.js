const { calculatePrice, resolveSettings } = require("./priceCalculator");
const {
  calculateGoldCategoryCouponDiscount,
  calculatePolkiCategoryCouponDiscount,
  calculateMoissaniteCategoryCouponDiscount,
  productDiscountFor,
  calculateProductDiscount,
} = require("./checkoutUtils");
const { categoryCouponForPricingKey } = require("../constants/categoryCoupon.constants");
const {
  resolveActiveCategoryCouponForPricingKey,
  categoryCouponAppliesTo,
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
  const productTotal = basePrice * quantity;
  const productDiscountConfig = productDiscountFor(product);
  const productDiscount = roundMoney(
    calculateProductDiscount(productDiscountConfig, productTotal),
  );
  const settings = await resolveSettings(product);
  const category = categoryCouponForPricingKey(settings.key);
  const coupons = await resolveActiveCategoryCouponForPricingKey(
    settings.key,
    product.SKU,
  );
  const selectedTargets = item.categoryCouponsApplied?.length
    ? item.categoryCouponsApplied
    : [];
  const results = coupons
    .filter((coupon) => selectedTargets.includes(coupon.appliesTo))
    .flatMap((coupon) => {
      try {
        const appliesTo = categoryCouponAppliesTo(category, coupon.appliesTo);
        const eligibleValue = appliesTo === "diamond"
          ? Number(price.diamondValue || 0) * quantity
          : appliesTo === "moissanite"
            ? Number(price.moissaniteValue || 0) * quantity
            : Number(price.makingValue || price.makingCharge || 0) * quantity;
        const value = appliesTo === "diamond"
          ? calculateGoldCategoryCouponDiscount(coupon, eligibleValue)
          : category === "polki"
            ? calculatePolkiCategoryCouponDiscount(coupon, eligibleValue, productTotal)
            : calculateMoissaniteCategoryCouponDiscount(coupon, eligibleValue, productTotal);
        return [{ coupon, value }];
      } catch {
        return [];
      }
    });
  item.categoryCouponsApplied = results.map(({ coupon }) => coupon.appliesTo);
  item.categoryCouponApplied = item.categoryCouponsApplied.length > 0;
  const categoryDiscount = roundMoney(
    results.reduce((sum, entry) => sum + entry.value, 0),
  );
  const discount = roundMoney(productDiscount + categoryDiscount);
  const labels = [
    productDiscount > 0
      ? productDiscountConfig.productDiscountType === "percentage"
        ? `${productDiscountConfig.productDiscountValue}% OFF`
        : `\u20b9${productDiscountConfig.productDiscountValue} OFF`
      : "",
    ...results.map(({ coupon }) =>
      coupon.discountType === "percentage"
        ? `${coupon.discountValue}% OFF`
        : `\u20b9${coupon.discountValue} OFF`,
    ),
  ].filter(Boolean);

  item.price = basePrice;
  item.basePrice = basePrice;
  item.categoryCouponDiscount = discount;
  item.categoryCouponLabel = labels.join(" + ");
  item.lineTotal = roundMoney(Math.max(0, productTotal - discount));
  return { price, basePrice, discount, lineTotal: item.lineTotal };
};

module.exports = { roundMoney, lineTotal, repriceCartItem };
