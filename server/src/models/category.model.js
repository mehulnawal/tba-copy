const mongoose = require("mongoose");
const schema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  metal: { type: String, required: true, enum: ["gold", "silver"] },
  categoryKind: { type: String, required: true, enum: ["metal-root", "type", "subcategory"] },
  parent: { type: mongoose.Schema.Types.ObjectId, ref: "Category", default: null },
  displayOrder: { type: Number, default: 0 },
  showOnHomepage: { type: Boolean, default: false },
  homepageCoverImage: { type: String, default: "", trim: true },
  shortCode: { type: String, default: "", trim: true, uppercase: true, validate: { validator: value => !value || /^[A-Z]{2,4}$/.test(value), message: "Category short code must contain 2 to 4 letters" } },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });
schema.index({ name: 1, parent: 1, metal: 1 }, { unique: true });
module.exports = mongoose.model("Category", schema);