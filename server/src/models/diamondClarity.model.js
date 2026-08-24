const mongoose = require("mongoose");

const diamondClaritySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, unique: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

diamondClaritySchema.index({ name: 1 }, { unique: true });
module.exports = mongoose.model("DiamondClarity", diamondClaritySchema);
