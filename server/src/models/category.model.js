const mongoose = require("mongoose");
const schema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  metal: { type: String, required: true, enum: ["gold", "silver"] },
  categoryKind: { type: String, required: true, enum: ["metal-root", "type", "subcategory"] },
  parent: { type: mongoose.Schema.Types.ObjectId, ref: "Category", default: null },
  displayOrder: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });
schema.index({ name: 1, parent: 1, metal: 1 }, { unique: true });
module.exports = mongoose.model("Category", schema);