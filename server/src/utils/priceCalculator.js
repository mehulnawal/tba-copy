const CategoryPricingConfig = require("../models/categoryPricingConfig.model");
const Category = require("../models/category.model");
const { calculateGoldPrice } = require("./goldPricing");
const { calculateSilverPrice } = require("./silverPricing");

const categoryName = value => typeof value === "string" ? "" : String(value?.name || "").trim();
const escapeRegex = value => String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const categoryFor = async value => categoryName(value) || (value ? String((await Category.findById(value).select("name").lean())?.name || "") : "");

// Product pricing is selected automatically from the product's metal and categories.
// Products never store or submit a manual settings key.
const resolveSettings = async product => {
  const metal = String(product?.metal || "").toLowerCase();
  if (!['gold', 'silver'].includes(metal)) throw new Error("Product metal is required for pricing");
  const [mainCategoryName, subCategoryName] = await Promise.all([categoryFor(product?.mainCategory), categoryFor(product?.subCategory)]);
  const categoryType = metal === "silver"
    ? mainCategoryName
    : /lab[\s-]*grown/i.test(`${mainCategoryName} ${subCategoryName}`) ? "Lab Grown" : "Standard";
  if (!categoryType) throw new Error("Product category is required for pricing");
  const settings = await CategoryPricingConfig.findOne({ metal, categoryType: new RegExp(`^${escapeRegex(categoryType)}$`, "i"), isActive: true }).lean();
  if (!settings) throw new Error(`Active charge settings for ${metal} ${categoryType} are required`);
  return settings;
};

const calculatePrice = async (product, karat, buyer = "B2C", rates = global.TBA_METAL_RATES) => {
  if (!rates) throw new Error("Live metal rates are required for pricing");
  const settings = await resolveSettings(product);
  return settings.metal === "gold"
    ? calculateGoldPrice({ product, karat, buyer, rates, settings })
    : calculateSilverPrice({ product, rates, settings });
};

module.exports = { calculatePrice, resolveSettings };

