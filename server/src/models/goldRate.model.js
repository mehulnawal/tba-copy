const mongoose = require("mongoose");

const goldRateSchema = new mongoose.Schema(
  {
    cacheKey: { type: String, default: "current", unique: true, immutable: true },
    "9K": { type: Number, required: true },
    "12K": { type: Number, required: true },
    "14K": { type: Number, required: true },
    "18K": { type: Number, required: true },
    "22K": { type: Number, required: true },
    "24K": { type: Number, required: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model("GoldRate", goldRateSchema);
