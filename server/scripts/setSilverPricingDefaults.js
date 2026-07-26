require("dotenv").config();
const connectDB = require("../src/database/connectDB");
const CategoryPricingConfig = require("../src/models/categoryPricingConfig.model");

(async () => {
  await connectDB();
  const defaults = [
    { key: "SILVER_MOISSANITE", metal: "silver", categoryType: "Moissanite", makingRatePerGram: 500, weightBasis: "gross", certificateApplies: false },
    { key: "SILVER_POLKI", metal: "silver", categoryType: "Polki", makingRatePerGram: 350, weightBasis: "gross", certificateApplies: false },
  ];
  for (const config of defaults) {
    const { makingRatePerGram, ...insertOnly } = config; await CategoryPricingConfig.findOneAndUpdate({ key: config.key }, { $set: { makingRatePerGram }, $setOnInsert: insertOnly }, { upsert: true, new: true, setDefaultsOnInsert: true });
  }
  const configs = await CategoryPricingConfig.find({ key: { $in: defaults.map(item => item.key) } }).select("key makingRatePerGram metal categoryType").lean();
  console.log(JSON.stringify(configs));
  process.exit(0);
})().catch(error => { console.error(error); process.exit(1); });