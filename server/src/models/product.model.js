const mongoose = require("mongoose");
const productSchema = new mongoose.Schema({
  SKU: { type: String, required: true, unique: true, index: true },
  slug: { type: String, required: true, unique: true, index: true },
  data: { type: mongoose.Schema.Types.Mixed, required: true },
}, { timestamps: true });
module.exports = mongoose.model("Product", productSchema);