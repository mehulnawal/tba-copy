const mongoose = require("mongoose");

const skuCounterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  value: { type: Number, required: true, min: 0 },
});

module.exports = mongoose.model("SkuCounter", skuCounterSchema);
