const mongoose = require("mongoose");
const cartItemSchema = new mongoose.Schema(
  {
    productId: { type: String, required: true },
    slug: { type: String, required: true },
    name: { type: String, required: true },
    category: { type: String, default: "" },
    image: { type: String, required: true },
    karat: { type: String, enum: ["9kt", "14kt", "18kt"], default: "14kt" },
    color: { type: String, default: "" },
    size: { type: String, default: "" },
    price: { type: Number, required: true, min: 0 },
    basePrice: { type: Number, min: 0 },
    lineTotal: { type: Number, min: 0 },
    categoryCouponApplied: { type: Boolean, default: false },
    categoryCouponDiscount: { type: Number, default: 0, min: 0 },
    categoryCouponLabel: { type: String, default: "" },
    quantity: { type: Number, required: true, min: 1, default: 1 },
  },
  { _id: true },
);
const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    items: { type: [cartItemSchema], default: [] },
    appliedCoupon: { type: String, default: null },
    appliedCoupons: { type: [String], default: [] },
    referenceId: { type: String, default: null },
  },
  { timestamps: true },
);
module.exports = mongoose.model("Cart", cartSchema);
