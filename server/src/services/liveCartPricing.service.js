const Product = require("../models/product.model");
const ApiError = require("../utils/ApiError");
const { calculatePrice } = require("../utils/priceCalculator");

// Cart records retain a checkout snapshot only; every returned amount is refreshed
// from the central price calculator first.
const refreshCartPrices = async (cart) => {
  let changed = false;
  for (const item of cart.items) {
    const product = await Product.findOne({
      SKU: item.productId,
      isActive: true,
    });
    if (!product)
      throw new ApiError(400, `${item.name} is no longer available`);
    const price = await calculatePrice(product, item.karat);
    if (
      Math.round(Number(item.price) * 100) !==
      Math.round(Number(price.finalPrice) * 100)
    ) {
      item.price = price.finalPrice;
      changed = true;
    }
  }
  if (changed) await cart.save();
  return changed;
};

module.exports = { refreshCartPrices };
