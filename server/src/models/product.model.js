const mongoose = require("mongoose");

const PRODUCT_COLORS = ["Yellow Gold", "White Gold", "Rose Gold"];
const DIAMOND_COLOR_CLARITY = "EF/VVSVS";
const weightSchema = new mongoose.Schema(
  {
    "14kt": { type: Number, required: true, min: 0 },
    "18kt": { type: Number, required: true, min: 0 },
  },
  { _id: false },
);
const diamondEntrySchema = new mongoose.Schema(
  {
    // This master row is the source of truth for the entry B2B/B2C rate.
    diamondCategoryRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DiamondCategory",
    },
    category: { type: String, required: true, trim: true },
    subType: { type: String, trim: true, default: "" },
    caratWeight: { type: Number, required: true, min: 0 },
    ratePerCt: { type: Number, min: 0 }, // Legacy rate retained for existing products.
    ratePerCtB2B: { type: Number, required: true, min: 0 },
    ratePerCtB2C: { type: Number, required: true, min: 0 },
    colorClarity: {
      type: String,
      required: true,
      trim: true,
      default: DIAMOND_COLOR_CLARITY,
    },
  },
  { _id: false },
);
const moissaniteEntrySchema = new mongoose.Schema(
  {
    caratWeight: { type: Number, required: true, min: 0 },
    colorClarity: { type: String, default: "" }, // Optional/inactive pending client confirmation.
  },
  { _id: false },
);
const imageSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    source: { type: String, enum: ["link", "upload"], required: true },
    slot: { type: Number, min: 1, max: 6 },
  },
  { _id: false },
);
const diamondPriceOverrideSchema = new mongoose.Schema(
  {
    b2bPrice: { type: Number, required: true },
    b2cPrice: { type: Number, required: true },
  },
  { _id: false },
);

const productSchema = new mongoose.Schema(
  {
    SKU: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    // Internal integration data. It is selected only for authenticated admin reads.
    cadFolderUrl: { type: String, default: "", select: false },
    slug: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    metal: { type: String, required: true, enum: ["gold", "silver"] },
    // TEMPORARY FLOW — silver only: manually entered base price, before GST.
    price: {
      type: Number,
      min: 0,
      required: function () {
        return this.metal === "silver";
      },
    },
    mainCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    subCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    isBestSeller: { type: Boolean, default: false },
    isNewProduct: { type: Boolean, default: false },
    isPrimeCollection: { type: Boolean, default: false },
    images: {
      type: [imageSchema],
      required: true,
      validate: {
        validator: (arr) =>
          Array.isArray(arr) && arr.length > 0 && arr.length <= 6,
        message: "Between 1 and 6 images are required",
      },
    },
    videoLink: { type: String, default: "" },
    certificates: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Certificate",
      default: [],
    },
    sizes: {
      type: [Number],
      default: [],
      validate: {
        validator: (arr) =>
          arr.every(
            (size) => Number.isInteger(size) && size >= 5 && size <= 25,
          ),
        message: "Sizes must be whole numbers from 5 to 25",
      },
    },
    colors: { type: [String], enum: PRODUCT_COLORS, default: [] },
    // Existing products retain their scalar weights. New Gold products store separate
    // 14kt/18kt weights; Mixed keeps the rollout backward compatible.
    grossWeight: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
      validate: {
        validator: (value) =>
          typeof value === "number"
            ? value >= 0
            : value &&
              ["14kt", "18kt"].every(
                (karat) =>
                  Number.isFinite(Number(value[karat])) &&
                  Number(value[karat]) >= 0,
              ),
        message:
          "Gross weight must be a non-negative number or valid 14kt/18kt weights",
      },
    },
    netWeight: {
      type: mongoose.Schema.Types.Mixed,
      validate: {
        validator: (value) =>
          value === undefined || typeof value === "number"
            ? value === undefined || value >= 0
            : value &&
              ["14kt", "18kt"].every(
                (karat) =>
                  Number.isFinite(Number(value[karat])) &&
                  Number(value[karat]) >= 0,
              ),
        message:
          "Net weight must be a non-negative number or valid 14kt/18kt weights",
      },
      required: function () {
        return this.metal === "gold";
      },
    },
    // Legacy single-value field is retained for existing products; new Silver products use entries.
    moissaniteCaratWeight: { type: Number, min: 0 },
    moissaniteEntries: { type: [moissaniteEntrySchema], default: [] },
    diamonds: { type: [diamondEntrySchema], default: [] },
    totalNumberOfDiamonds: { type: Number, required: true, min: 0 },
    certificateWeight: { type: Number, min: 0 },
    diamondCategoryRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DiamondCategory",
    },
    diamondPriceOverride: { type: diamondPriceOverrideSchema },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Product", productSchema);
module.exports.PRODUCT_COLORS = PRODUCT_COLORS;
module.exports.DIAMOND_COLOR_CLARITY = DIAMOND_COLOR_CLARITY;
