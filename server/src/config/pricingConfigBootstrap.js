const CategoryPricingConfig = require("../models/categoryPricingConfig.model");

const DEFAULT_PRICING_CONFIGS = Object.freeze([
  {
    key: "GOLD_STANDARD",
    metal: "gold",
    categoryType: "Standard",
    makingRatePerGram: 0,
    weightBasis: "net",
    stoneRatePerUnit: 0,
    certificateApplies: true,
    usesLabGrownFixedDiamondRates: false,
    b2bDisplay: { showMaking: true, showCertificate: true, showGst: true },
    isActive: true,
  },
  {
    key: "GOLD_LAB_GROWN",
    metal: "gold",
    categoryType: "Lab Grown",
    makingRatePerGram: 0,
    weightBasis: "net",
    stoneRatePerUnit: 0,
    certificateApplies: true,
    usesLabGrownFixedDiamondRates: true,
    b2bDisplay: { showMaking: false, showCertificate: false, showGst: false },
    b2bExcludeCharges: true,
    isActive: true,
  },
  {
    key: "SILVER_MOISSANITE",
    metal: "silver",
    categoryType: "Moissanite",
    makingRatePerGram: 500,
    weightBasis: "gross",
    stoneRatePerUnit: 0,
    certificateApplies: false,
    usesLabGrownFixedDiamondRates: false,
    b2bDisplay: { showMaking: true, showCertificate: true, showGst: true },
    isActive: true,
  },
  {
    key: "SILVER_POLKI",
    metal: "silver",
    categoryType: "Polki",
    makingRatePerGram: 350,
    weightBasis: "gross",
    stoneRatePerUnit: 0,
    certificateApplies: false,
    usesLabGrownFixedDiamondRates: false,
    b2bDisplay: { showMaking: true, showCertificate: true, showGst: true },
    isActive: true,
  },
]);

const initializePricingConfigs = async () => {
  await Promise.all(
    DEFAULT_PRICING_CONFIGS.map((config) =>
      CategoryPricingConfig.updateOne(
        { key: config.key },
        { $setOnInsert: config },
        { upsert: true, setDefaultsOnInsert: true },
      ),
    ),
  );

  // Migrate the existing Lab-Grown config once; do not overwrite future admin changes.
  await CategoryPricingConfig.updateOne(
    { key: "GOLD_LAB_GROWN", b2bExcludeCharges: { $ne: true } },
    { $set: { b2bExcludeCharges: true } },
  );

  return CategoryPricingConfig.find({
    key: { $in: DEFAULT_PRICING_CONFIGS.map((config) => config.key) },
  })
    .select("key metal categoryType isActive")
    .lean();
};

module.exports = { DEFAULT_PRICING_CONFIGS, initializePricingConfigs };
