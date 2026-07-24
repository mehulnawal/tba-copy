const mongoose = require("mongoose");
const schema = new mongoose.Schema({
  key: { type: String, required: true, unique: true, trim: true, uppercase: true },
  metal: { type: String, required: true, enum: ["gold", "silver"] },
  categoryType: { type: String, required: true, trim: true },
  makingRatePerGram: { type: Number, required: true, min: 0 },
  weightBasis: { type: String, required: true, enum: ["net", "gross"] },
  stoneRatePerUnit: { type: Number, min: 0 },
  certificateApplies: { type: Boolean, required: true, default: false },
  usesLabGrownFixedDiamondRates: { type: Boolean, required: true, default: false },
  b2bDisplay: { showMaking: { type: Boolean, required: true, default: true }, showCertificate: { type: Boolean, required: true, default: true }, showGst: { type: Boolean, required: true, default: true } },
  isActive: { type: Boolean, required: true, default: true },
}, { timestamps: true });
schema.index({ metal: 1, categoryType: 1 }, { unique: true });
module.exports = mongoose.model("CategoryPricingConfig", schema);