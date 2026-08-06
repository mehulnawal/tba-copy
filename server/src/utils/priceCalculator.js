const CategoryPricingConfig = require("../models/categoryPricingConfig.model");
const Category = require("../models/category.model");
const { calculateGoldPrice } = require("./goldPricing");
const { calculateSilverPrice } = require("./silverPricing");

const categoryName = (value) =>
  typeof value === "string" ? "" : String(value?.name || "").trim();
const escapeRegex = (value) =>
  String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const categoryFor = async (value) =>
  categoryName(value) ||
  (value
    ? String((await Category.findById(value).select("name").lean())?.name || "")
    : "");

// Product pricing is selected automatically from the product's metal and categories.
// Products never store or submit a manual settings key.
const resolveSettings = async (product) => {
  const metal = String(product?.metal || "").toLowerCase();
  if (!["gold", "silver"].includes(metal))
    throw new Error("Product metal is required for pricing");
  const [mainCategoryName, subCategoryName] = await Promise.all([
    categoryFor(product?.mainCategory),
    categoryFor(product?.subCategory),
  ]);
  const categoryType =
    metal === "silver"
      ? mainCategoryName
      : /lab[\s-]*grown/i.test(`${mainCategoryName} ${subCategoryName}`)
        ? "Lab Grown"
        : "Standard";
  if (!categoryType)
    throw new Error("Product category is required for pricing");

  // A category-specific entry can refine pricing, but a product never needs a matching entry.
  // Any active configuration for the selected metal is the universal fallback.

  const settings =
    (await CategoryPricingConfig.findOne({
      metal,
      categoryType: new RegExp(`^${escapeRegex(categoryType)}$`, "i"),
      isActive: true,
    }).lean()) ||
    (await CategoryPricingConfig.findOne({ metal, isActive: true })
      .sort({ createdAt: 1 })
      .lean());
  if (!settings)
    throw new Error(
      `Active universal pricing settings for ${metal} are required`,
    );
  return settings;
};

const calculatePrice = async (
  product,
  karat,
  buyer = "B2C",
  rates = global.TBA_METAL_RATES,
) => {
  // TEMPORARY FLOW — silver only: rate/category settings for manual Price + GST.
  if (String(product?.metal || "").toLowerCase() === "silver")
    return calculateSilverPrice({ product, buyer });

  if (!rates) throw new Error("Live metal rates are required for pricing");
  const settings = await resolveSettings(product);
  return calculateGoldPrice({ product, karat, buyer, rates, settings });
};

module.exports = { calculatePrice, resolveSettings };
