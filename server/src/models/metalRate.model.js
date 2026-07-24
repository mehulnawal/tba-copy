const mongoose = require("mongoose");
const schema = new mongoose.Schema({
  key: { type: String, default: "current", unique: true },
  gold24kt: { type: Number, required: true, min: 0 },
  silver: { type: Number, required: true, min: 0 },
  makingRatePerGram: { type: Number, required: true, min: 0, default: 850 },
  certificateRatePerGram: { type: Number, required: true, min: 0, default: 0 },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
}, { timestamps: true });
module.exports = mongoose.model("MetalRate", schema);