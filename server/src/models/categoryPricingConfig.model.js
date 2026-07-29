const mongoose = require("mongoose");
const schema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    metal: { type: String, required: true, enum: ["gold", "silver"] },
    categoryType: { type: String, required: true, trim: true },
    makingRatePerGram: { type: Number, required: true, min: 0 },
    weightBasis: { type: String, required: true, enum: ["net", "gross"] },
    // Kept unset until Admin configures the universal Moissanite rate.
    moissaniteRatePerCarat: { type: Number, min: 0, default: undefined },
    // Placeholder only: Polki formula/value has not been confirmed.
    polkiValuePerUnit: { type: Number, min: 0, default: undefined },
    // Placeholder only: Silver B2B pricing is intentionally pending.
    silverB2BMakingChargeRate: { type: Number, min: 0, default: undefined },
    certificateApplies: { type: Boolean, required: true, default: false },
    usesLabGrownFixedDiamondRates: {
      type: Boolean,
      required: true,
      default: false,
    },
    b2bDisplay: {
      showMaking: { type: Boolean, required: true, default: true },
      showCertificate: { type: Boolean, required: true, default: true },
      showGst: { type: Boolean, required: true, default: true },
    },
    b2bExcludeCharges: { type: Boolean, required: true, default: false },
    isActive: { type: Boolean, required: true, default: true },
  },
  { timestamps: true },
);
schema.index({ metal: 1, categoryType: 1 }, { unique: true });
module.exports = mongoose.model("CategoryPricingConfig", schema);
