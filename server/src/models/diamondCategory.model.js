const mongoose = require("mongoose");

const diamondCategorySchema = new mongoose.Schema({
  categoryName: { type: String, required: true, trim: true },
  size: { type: String, required: true, trim: true },
  b2bPrice: { type: Number, required: true },
  b2cPrice: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
}, { timestamps: false });

module.exports = mongoose.model("DiamondCategory", diamondCategorySchema);