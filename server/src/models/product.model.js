const mongoose = require("mongoose");
const weightSchema = new mongoose.Schema({ "9kt": { type: Number, required: true, min: 0 }, "14kt": { type: Number, required: true, min: 0 }, "18kt": { type: Number, required: true, min: 0 } }, { _id: false });
const diamondSchema = new mongoose.Schema({ roundPrice: { type: Number, default: 0, min: 0 }, roundCarat: { type: Number, default: 0, min: 0 }, fancyPrice: { type: Number, default: 0, min: 0 }, fancyCarat: { type: Number, default: 0, min: 0 } }, { _id: false });
const imageSchema = new mongoose.Schema({ url: { type: String, required: true }, source: { type: String, enum: ["link", "upload"], required: true } }, { _id: false });
const productSchema = new mongoose.Schema({
  SKU: { type: String, required: true, unique: true, trim: true, index: true }, slug: { type: String, required: true, unique: true, index: true }, title: { type: String, required: true, trim: true }, description: { type: String, default: "" }, businessType: { type: String, enum: ["B2C", "B2B"], required: true, default: "B2C" },
  mainCategory: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true }, subCategory: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true }, isBestSeller: { type: Boolean, default: false }, isNewProduct: { type: Boolean, default: false },
  images: { type: [imageSchema], required: true, validate: { validator: arr => arr.length > 0 && arr.length <= 3, message: "Between 1 and 3 images are required" } }, videoLink: { type: String, default: "" }, colors: { type: [String], default: [] }, grossWeight: { type: weightSchema, required: true }, netWeight: { type: weightSchema, required: true }, diamond: { type: diamondSchema, default: () => ({}) }, certificateCharges: { type: Number, default: 0, min: 0 }, makingChargeRatePerGram: { type: Number, required: true, min: 0 }, isActive: { type: Boolean, default: true },
}, { timestamps: true });
module.exports = mongoose.model("Product", productSchema);
