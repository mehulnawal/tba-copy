const Category = require("../models/category.model");
const Product = require("../models/product.model");
const Order = require("../models/order.model");
const Cart = require("../models/cart.model");
const Wishlist = require("../models/wishlist.model");
const SkuCounter = require("../models/skuCounter.model");
const ApiError = require("../utils/ApiError");

const effectiveCode = (category) =>
  category.shortCode ||
  String(category.name || "")
    .replace(/[^a-z]/gi, "")
    .slice(0, 2)
    .toUpperCase()
    .padEnd(2, "X");

const skuPrefix = (metal, category) =>
  `TBA-${metal === "gold" ? "GLD" : "SLV"}-${effectiveCode(category)}`;

const categorySkuPrefix = async (metal, subCategory) => {
  const category = await Category.findById(subCategory).lean();
  if (!category) throw new ApiError(400, "Product subcategory does not exist");
  return skuPrefix(metal, category);
};

const highestExistingNumber = async (prefix) => {
  const pattern = new RegExp(`^${prefix}-?(\\d+)$`);
  const [products, orders, carts, wishlists] = await Promise.all([
    Product.find({ SKU: pattern }).select("SKU").lean(),
    Order.find({ "items.productSku": pattern }).select("items.productSku").lean(),
    Cart.find({ "items.productId": pattern }).select("items.productId").lean(),
    Wishlist.find({ "items.productId": pattern }).select("items.productId").lean(),
  ]);
  const historical = [
    ...products.map((item) => item.SKU),
    ...orders.flatMap((order) => order.items.map((item) => item.productSku)),
    ...carts.flatMap((cart) => cart.items.map((item) => item.productId)),
    ...wishlists.flatMap((wishlist) => wishlist.items.map((item) => item.productId)),
  ];
  return historical.reduce((highest, sku) => {
    const match = String(sku || "").match(pattern);
    const number = Number(match?.[1]);
    return match && Number.isSafeInteger(number) ? Math.max(highest, number) : highest;
  }, 0);
};

const nextProductSku = async (metal, subCategory) => {
  const prefix = await categorySkuPrefix(metal, subCategory);
  // Seed from both historical separator styles. The unique counter ID handles
  // simultaneous first use; subsequent reservations use an atomic increment.
  if (!(await SkuCounter.exists({ _id: prefix }))) {
    const highest = await highestExistingNumber(prefix);
    try {
      await SkuCounter.updateOne(
        { _id: prefix },
        { $setOnInsert: { value: highest } },
        { upsert: true },
      );
    } catch (error) {
      if (error.code !== 11000) throw error;
    }
  }
  const counter = await SkuCounter.findOneAndUpdate(
    { _id: prefix, value: { $lt: Number.MAX_SAFE_INTEGER } },
    { $inc: { value: 1 } },
    { returnDocument: "after" },
  );
  if (!counter) throw new ApiError(409, `SKU sequence for ${prefix} is unavailable`);
  // The existing production format has four minimum digits and no separator.
  return `${prefix}${String(counter.value).padStart(4, "0")}`;
};

module.exports = { effectiveCode, skuPrefix, categorySkuPrefix, nextProductSku };
