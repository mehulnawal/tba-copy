const mongoose = require("mongoose");
const { DISCOUNT_TYPES } = require("../constants/coupon.constants");
const {
  CATEGORY_COUPON_CATEGORIES,
} = require("../constants/categoryCoupon.constants");

const categoryCouponSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      enum: Object.values(CATEGORY_COUPON_CATEGORIES),
      required: true,
      index: true,
    },
    code: { type: String, required: true, uppercase: true, trim: true },
    discountType: {
      type: String,
      enum: Object.values(DISCOUNT_TYPES),
      required: true,
    },
    discountValue: { type: Number, required: true, min: 0 },
    minimumCartValue: { type: Number, default: 0, min: 0 },
    appliesTo: {
      type: String,
      enum: ["diamond", "making", "moissanite"],
      default: "making",
    },
    expiryDate: { type: Date, required: true },
    usageLimit: { type: Number, default: null, min: 1 },
    usedCount: { type: Number, default: 0 },
    activeStatus: { type: Boolean, default: true },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true },
);

categoryCouponSchema.index({ category: 1, appliesTo: 1 }, { unique: true });

module.exports = mongoose.model("CategoryCoupon", categoryCouponSchema);
