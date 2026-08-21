const DiamondCategory = require("../models/diamondCategory.model");
const Product = require("../models/product.model");

const validPrice = (value, label) => {
  if (value === undefined || value === null || !Number.isFinite(Number(value))) throw new Error(`${label} is required for diamond pricing`);
  return Number(value);
};

/**
 * Resolve the current prices for a diamond product. Product overrides are
 * intentionally checked first; otherwise the master row is read live.
 */
const getDiamondPricing = async ({ productId, diamondCategoryRef, product } = {}) => {
  const resolvedProduct = product || (productId ? await Product.findById(productId).lean() : null);
  if (productId && !resolvedProduct) throw new Error("Product not found");
  const override = resolvedProduct?.diamondPriceOverride;
  if (override) return { b2bPrice: validPrice(override.b2bPrice, "Diamond B2B price"), b2cPrice: validPrice(override.b2cPrice, "Diamond B2C price") };

  const categoryRef = resolvedProduct?.diamondCategoryRef || diamondCategoryRef;
  if (!categoryRef) throw new Error("Diamond category reference is required for pricing");
  const category = await DiamondCategory.findById(categoryRef).lean();
  if (!category) throw new Error("Diamond category not found");
  return { b2bPrice: validPrice(category.b2bPrice, "Diamond category B2B price"), b2cPrice: validPrice(category.b2cPrice, "Diamond category B2C price") };
};

// Resolve referenced diamond-entry rates at request time. Legacy entries with
// no reference retain their stored rate until an admin assigns a master row.
const hydrateLiveDiamondEntryRates = async (product) => {
  // Mongoose documents do not expose schema fields through object spread. Convert
  // them first so rebuilding diamond entries never loses fields such as `metal`.
  const rawProduct = product?.toObject ? product.toObject() : product;
  const diamonds = Array.isArray(rawProduct?.diamonds) ? rawProduct.diamonds : [];
  const productCategoryRef = rawProduct?.metal === "gold" ? rawProduct.diamondCategoryRef : null;
  const ids = [...new Set([...diamonds.map((entry) => entry?.diamondCategoryRef), productCategoryRef].filter(Boolean).map(String))];
  const names = [...new Set(diamonds.map((entry) => String(entry?.category || "").trim()).filter(Boolean))];
  if (!ids.length && !names.length) return rawProduct;
  const categories = await DiamondCategory.find({ $or: [{ _id: { $in: ids } }, { categoryName: { $in: names } }] }).select("categoryName size b2bPrice b2cPrice").lean();
  const byId = new Map(categories.map((category) => [String(category._id), category]));
  const productCategory = productCategoryRef ? byId.get(String(productCategoryRef)) : null;
  const byName = new Map(categories.reduce((groups, category) => {
    const key = String(category.categoryName || "").trim().toLowerCase();
    groups.set(key, [...(groups.get(key) || []), category]);
    return groups;
  }, new Map()));
  return { ...rawProduct, diamonds: diamonds.map((entry, index) => {
    const candidates = byName.get(String(entry?.category || "").trim().toLowerCase()) || [];
    const category = entry?.diamondCategoryRef
      ? byId.get(String(entry.diamondCategoryRef))
      : candidates.find((item) => String(item.size || "").trim().toLowerCase() === String(entry?.subType || "").trim().toLowerCase()) || (candidates.length === 1 ? candidates[0] : productCategory);
    if (entry?.diamondCategoryRef && !category) throw new Error(`Diamond ${index + 1} category not found`);
    if (!category) return entry;
    return { ...entry, diamondCategoryRef: entry.diamondCategoryRef || category._id, ratePerCtB2B: validPrice(category.b2bPrice, `Diamond ${index + 1} B2B rate`), ratePerCtB2C: validPrice(category.b2cPrice, `Diamond ${index + 1} B2C rate`) };
  }) };
};

module.exports = { getDiamondPricing, hydrateLiveDiamondEntryRates };