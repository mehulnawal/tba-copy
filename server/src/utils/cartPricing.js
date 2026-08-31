const { calculatePrice, resolveSettings } = require("./priceCalculator");
const {
  calculateCouponDiscount,
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
  let discount = 0;
  let label = "";

  const productTotal = basePrice * quantity;
  const productDiscountConfig = productDiscountFor(product);
  const productDiscount = roundMoney(calculateProductDiscount(productDiscountConfig, productTotal));
  if (productDiscount > 0) {
    discount = productDiscount;
    label = productDiscountConfig.productDiscountType === "percentage" ? `${productDiscountConfig.productDiscountValue}% OFF` : `₹${productDiscountConfig.productDiscountValue} OFF`;
    item.categoryCouponApplied = false;
  } else if (item.categoryCouponApplied) {
    const settings = await resolveSettings(product);
    const coupon = await resolveActiveCategoryCouponForPricingKey(settings.key, product.SKU);
    if (coupon) {
      try {
        const categoryCouponType = categoryCouponForPricingKey(settings.key);
        const isGoldCoupon = categoryCouponType === "gold";
        const isPolkiCoupon = categoryCouponType === "polki";
        const appliesTo = categoryCouponAppliesTo(categoryCouponType, coupon.appliesTo);
        const productTotal = basePrice * quantity;
        const eligibleValue = isGoldCoupon
          ? Number(price.diamondValue || 0) * quantity
          : isPolkiCoupon || appliesTo === "making"
            ? Number(price.makingValue || price.makingCharge || 0) * quantity
            : Number(price.moissaniteValue || 0) * quantity;
        discount = roundMoney(
          isGoldCoupon
            ? calculateGoldCategoryCouponDiscount(coupon, eligibleValue)
            : isPolkiCoupon
              ? calculatePolkiCategoryCouponDiscount(coupon, eligibleValue, productTotal)
              : calculateMoissaniteCategoryCouponDiscount(coupon, eligibleValue, productTotal),
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
  item.lineTotal = roundMoney(basePrice * quantity - discount);
  return { price, basePrice, discount, lineTotal: item.lineTotal };
};

module.exports = { roundMoney, lineTotal, repriceCartItem };
