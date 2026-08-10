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
  const diamonds = Array.isArray(product?.diamonds) ? product.diamonds : [];
  const ids = [...new Set(diamonds.map((entry) => entry?.diamondCategoryRef).filter(Boolean).map(String))];
  if (!ids.length) return product;
  const categories = await DiamondCategory.find({ _id: { $in: ids } }).select("b2bPrice b2cPrice").lean();
  const byId = new Map(categories.map((category) => [String(category._id), category]));
  return { ...product, diamonds: diamonds.map((entry, index) => {
    if (!entry?.diamondCategoryRef) return entry;
    const category = byId.get(String(entry.diamondCategoryRef));
    if (!category) throw new Error(`Diamond ${index + 1} category not found`);
    return { ...entry, ratePerCtB2B: validPrice(category.b2bPrice, `Diamond ${index + 1} B2B rate`), ratePerCtB2C: validPrice(category.b2cPrice, `Diamond ${index + 1} B2C rate`) };
  }) };
};

module.exports = { getDiamondPricing, hydrateLiveDiamondEntryRates };