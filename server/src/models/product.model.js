const mongoose = require("mongoose");

const GOLD_KARATS = ["14kt", "18kt"];
const PRODUCT_COLORS = ["Yellow Gold", "White Gold", "Rose Gold"];
const DIAMOND_COLOR_CLARITY = "EF/VVSVS";
const weightSchema = new mongoose.Schema({
  "14kt": { type: Number, required: true, min: 0 },
  "18kt": { type: Number, required: true, min: 0 },
}, { _id: false });
const diamondEntrySchema = new mongoose.Schema({
  category: { type: String, required: true, trim: true },
  subType: { type: String, trim: true, default: "" },
  caratWeight: { type: Number, required: true, min: 0 },
  ratePerCt: { type: Number, min: 0 },
  colorClarity: { type: String, required: true, default: DIAMOND_COLOR_CLARITY, enum: [DIAMOND_COLOR_CLARITY] },
}, { _id: false });
const imageSchema = new mongoose.Schema({ url: { type: String, required: true }, source: { type: String, enum: ["link", "upload"], required: true } }, { _id: false });

const productSchema = new mongoose.Schema({
  SKU: { type: String, required: true, unique: true, trim: true, index: true },
  slug: { type: String, required: true, unique: true, index: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, default: "" },
  metal: { type: String, required: true, enum: ["gold", "silver"] },
  pricingConfigKey: { type: String, required: true, trim: true, uppercase: true },
  mainCategory: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
  subCategory: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
  isBestSeller: { type: Boolean, default: false },
  isNewProduct: { type: Boolean, default: false },
  images: { type: [imageSchema], required: true, validate: { validator: arr => Array.isArray(arr) && arr.length > 0 && arr.length <= 6, message: "Between 1 and 6 images are required" } },
  videoLink: { type: String, default: "" },
  sizes: { type: [Number], default: [], validate: { validator: arr => arr.every(size => Number.isInteger(size) && size >= 5 && size <= 25), message: "Sizes must be whole numbers from 5 to 25" } },
  colors: { type: [String], enum: PRODUCT_COLORS, default: [] },
  grossWeight: { type: mongoose.Schema.Types.Mixed, required: true },
  netWeight: { type: mongoose.Schema.Types.Mixed },
  moissaniteCaratWeight: { type: Number, min: 0 },
  diamonds: { type: [diamondEntrySchema], default: [] },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model("Product", productSchema);
module.exports.GOLD_KARATS = GOLD_KARATS;
module.exports.PRODUCT_COLORS = PRODUCT_COLORS;
module.exports.DIAMOND_COLOR_CLARITY = DIAMOND_COLOR_CLARITY;