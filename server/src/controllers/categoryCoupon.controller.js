const CategoryCoupon = require("../models/categoryCoupon.model");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");
const { DISCOUNT_TYPES } = require("../constants/coupon.constants");
const {
  CATEGORY_COUPON_CATEGORIES,
  categoryCouponForPricingKey,
} = require("../constants/categoryCoupon.constants");

const couponFields = [
  "code",
  "discountType",
  "discountValue",
  "minimumCartValue",
  "expiryDate",
  "usageLimit",
  "activeStatus",
];
const allowedTargets = (category) => {
  if (category === CATEGORY_COUPON_CATEGORIES.GOLD)
    return ["making", "diamond"];
  if (category === CATEGORY_COUPON_CATEGORIES.POLKI) return ["making"];
  return ["making", "moissanite"];
};
const categoryCouponAppliesTo = (category, appliesTo) => {
  const target = String(appliesTo || "making").toLowerCase();
  if (!allowedTargets(category).includes(target))
    throw new ApiError(400, "Invalid coupon target for this category");
  return target;
};
const validatePayload = (payload, partial = false) => {
  if (
    !partial &&
    [
      "code",
      "discountType",
      "discountValue",
      "minimumCartValue",
      "expiryDate",
    ].some((field) => payload[field] === undefined || payload[field] === "")
  )
    throw new ApiError(400, "Required coupon fields are missing");
  if (
    payload.discountType !== undefined &&
    !Object.values(DISCOUNT_TYPES).includes(payload.discountType)
  )
    throw new ApiError(400, "Invalid discount type");
  if (
    payload.discountValue !== undefined &&
    (!Number.isFinite(Number(payload.discountValue)) ||
      Number(payload.discountValue) <= 0)
  )
    throw new ApiError(400, "Discount value must be greater than 0");
  if (
    payload.discountType === DISCOUNT_TYPES.PERCENTAGE &&
    Number(payload.discountValue) > 100
  )
    throw new ApiError(400, "Percentage discount cannot exceed 100%");
  if (
    payload.minimumCartValue !== undefined &&
    (!Number.isFinite(Number(payload.minimumCartValue)) ||
      Number(payload.minimumCartValue) < 0)
  )
    throw new ApiError(400, "Minimum cart value cannot be negative");
  if (
    payload.usageLimit !== undefined &&
    payload.usageLimit !== null &&
    (!Number.isInteger(Number(payload.usageLimit)) ||
      Number(payload.usageLimit) < 1)
  )
    throw new ApiError(400, "Usage limit must be at least 1 or left blank");
  if (
    payload.expiryDate !== undefined &&
    Number.isNaN(new Date(payload.expiryDate).getTime())
  )
    throw new ApiError(400, "Invalid expiry date");
  if (
    payload.appliesTo !== undefined &&
    !["diamond", "making", "moissanite"].includes(payload.appliesTo)
  )
    throw new ApiError(400, "Invalid coupon target");
};
const categoryIsValid = (category) =>
  Object.values(CATEGORY_COUPON_CATEGORIES).includes(category);
const listCategoryCoupons = asyncHandler(async (_req, res) => {
  const coupons = await CategoryCoupon.find().sort({ category: 1 });
  res
    .status(200)
    .json(
      new ApiResponse(200, coupons, "Category coupons fetched successfully"),
    );
});
const createCategoryCoupon = asyncHandler(async (req, res) => {
  const { category } = req.params;
  if (!categoryIsValid(category))
    throw new ApiError(400, "Invalid coupon category");
  validatePayload(req.body);
  const data = Object.fromEntries(
    couponFields
      .filter((field) => req.body[field] !== undefined)
      .map((field) => [
        field,
        field === "code"
          ? String(req.body[field]).toUpperCase()
          : req.body[field],
      ]),
  );
  const appliesTo = categoryCouponAppliesTo(category, req.body.appliesTo);
  const coupon = await CategoryCoupon.create({
    category,
    ...data,
    appliesTo,
    createdBy: req.admin._id,
  });
  res
    .status(201)
    .json(new ApiResponse(201, coupon, "Category coupon created successfully"));
});
const updateCategoryCoupon = asyncHandler(async (req, res) => {
  const { category } = req.params;
  if (!categoryIsValid(category))
    throw new ApiError(400, "Invalid coupon category");
  validatePayload(req.body, true);
  const appliesTo = categoryCouponAppliesTo(category, req.query.appliesTo ?? req.body.appliesTo);
  const coupon = await CategoryCoupon.findOne({ category, appliesTo });
  if (!coupon) throw new ApiError(404, "Category coupon not found");
  couponFields.forEach((field) => {
    if (req.body[field] !== undefined)
      coupon[field] =
        field === "code"
          ? String(req.body[field]).toUpperCase()
          : req.body[field];
  });
  coupon.appliesTo = appliesTo;
  await coupon.save();
  res
    .status(200)
    .json(new ApiResponse(200, coupon, "Category coupon updated successfully"));
});
const deleteCategoryCoupon = asyncHandler(async (req, res) => {
  const coupon = await CategoryCoupon.findOneAndDelete({
    category: req.params.category,
    appliesTo: req.query.appliesTo,
  });
  if (!coupon) throw new ApiError(404, "Category coupon not found");
  res
    .status(200)
    .json(new ApiResponse(200, null, "Category coupon deleted successfully"));
});
const resolveActiveCategoryCouponForPricingKey = async (
  pricingKey,
  productSku,
) => {
  const category = categoryCouponForPricingKey(pricingKey);
  if (!category) return [];
  return CategoryCoupon.find({
    category,
    activeStatus: true,
    expiryDate: { $gt: new Date() },
  }).sort({ appliesTo: 1 }).lean();
};
module.exports = {
  listCategoryCoupons,
  createCategoryCoupon,
  updateCategoryCoupon,
  deleteCategoryCoupon,
  resolveActiveCategoryCouponForPricingKey,
  categoryCouponAppliesTo,
};
