const mongoose = require("mongoose");

const diamondCategorySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, unique: true },
  subTypes: { type: [String], default: ["Round Brilliant", "Princess", "Cushion", "Emerald", "Oval", "Radiant", "Pear", "Marquise", "Asscher", "Heart"] },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

diamondCategorySchema.index({ name: 1 }, { unique: true });
module.exports = mongoose.model("DiamondCategory", diamondCategorySchema);