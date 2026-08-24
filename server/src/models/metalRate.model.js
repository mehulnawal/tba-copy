const mongoose = require("mongoose");
const schema = new mongoose.Schema(
  {
    // B2B has no independently stored gold or silver fields; both are composed from B2C on read.
    key: { type: String, enum: ["B2C", "B2B"], unique: true, required: true },
    gold24kt: { type: Number, min: 0 },
    silver: { type: Number, min: 0 },
    makingRatePerGram: { type: Number, required: true, min: 0, default: 850 },
    certificateRatePerGram: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    silverMoissaniteMakingRate: {
      type: Number,
      required: true,
      min: 0,
      default: 500,
    },
    silverPolkiMakingRate: {
      type: Number,
      required: true,
      min: 0,
      default: 350,
    },
    moissaniteRatePerCarat: { type: Number, min: 0, default: undefined },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true },
);
schema.pre("validate", function () {
  if (
    this.key === "B2B" &&
    (this.gold24kt !== undefined || this.silver !== undefined)
  )
    throw new Error("B2B metal rates cannot store gold or silver rates");
  if (
    this.key === "B2C" &&
    (this.gold24kt === undefined || this.silver === undefined)
  )
    throw new Error("B2C metal rates require gold and silver rates");
});
schema.pre("findOneAndUpdate", function () {
  const update = this.getUpdate() || {};
  const values = { ...update, ...(update.$set || {}) };
  if (
    this.getQuery().key === "B2B" &&
    (values.gold24kt !== undefined || values.silver !== undefined)
  )
    throw new Error("B2B metal rates cannot store gold or silver rates");
});
module.exports = mongoose.model("MetalRate", schema);
