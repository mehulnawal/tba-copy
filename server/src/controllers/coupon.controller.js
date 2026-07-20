const Coupon = require("../models/coupon.model");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");
const { DISCOUNT_TYPES } = require("../constants/coupon.constants");
const { calculateCouponDiscount } = require("../utils/checkoutUtils");

const validateCoupon = asyncHandler(async (req, res) => {
  const { code, cartTotal } = req.body;

  if (!code) {
    throw new ApiError(400, "Coupon code is required");
  }

  const coupon = await Coupon.findOne({ code: code.toUpperCase() });
  if (!coupon) {
    throw new ApiError(404, "Invalid coupon code");
  }

  const total = Number(cartTotal) || 0;
  const discount = calculateCouponDiscount(coupon, total);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discount,
        minimumCartValue: coupon.minimumCartValue,
      },
      "Coupon is valid",
    ),
  );
});

// const listEligibleForProduct = asyncHandler(async (req, res) => {
//   const product = await require("../models/product.model").findOne({
//     $or: [{ SKU: req.params.productId }, { slug: req.params.productId }],
//   });
//   if (!product) throw new ApiError(404, "Product not found");
//   const coupons = await Coupon.find({
//     activeStatus: true,
//     expiryDate: { $gt: new Date() },
//     $or: [
//       { scope: "all" },
//       { scope: "category", scopeCategory: product.data.Category },
//       { scope: "product", scopeProduct: product.SKU },
//     ],
//   });
//   res.json(new ApiResponse(200, coupons, "Eligible coupons fetched"));
// });

const createCoupon = asyncHandler(async (req, res) => {
  console.log("createCoupon called");
  console.log(req.body);

  const {
    code,
    discountType,
    discountValue,
    minimumCartValue,
    expiryDate,
    usageLimit,
    activeStatus,
  } = req.body;

  if (!code || !discountType || discountValue === undefined || !expiryDate) {
    throw new ApiError(400, "Required coupon fields are missing");
  }

  if (!Object.values(DISCOUNT_TYPES).includes(discountType)) {
    throw new ApiError(400, "Invalid discount type");
  }

  console.log("before create");
  const coupon = await Coupon.create({
    code: code.toUpperCase(),
    discountType,
    discountValue,
    minimumCartValue: minimumCartValue || 0,
    expiryDate,
    usageLimit: usageLimit ?? null,
    activeStatus: activeStatus !== undefined ? activeStatus : true,
    createdBy: req.admin._id,
  });

  console.log("before create");

  res
    .status(201)
    .json(new ApiResponse(201, coupon, "Coupon created successfully"));
});

const updateCoupon = asyncHandler(async (req, res) => {
  const { couponId } = req.params;

  const coupon = await Coupon.findById(couponId);
  if (!coupon) {
    throw new ApiError(404, "Coupon not found");
  }

  const fields = [
    "discountType",
    "discountValue",
    "minimumCartValue",
    "expiryDate",
    "usageLimit",
    "activeStatus",
  ];

  fields.forEach((field) => {
    if (req.body[field] !== undefined) {
      coupon[field] = req.body[field];
    }
  });

  if (req.body.code) {
    coupon.code = req.body.code.toUpperCase();
  }

  await coupon.save();

  res
    .status(200)
    .json(new ApiResponse(200, coupon, "Coupon updated successfully"));
});

const deleteCoupon = asyncHandler(async (req, res) => {
  const { couponId } = req.params;

  const coupon = await Coupon.findByIdAndDelete(couponId);
  if (!coupon) {
    throw new ApiError(404, "Coupon not found");
  }

  res
    .status(200)
    .json(new ApiResponse(200, null, "Coupon deleted successfully"));
});

const listCoupons = asyncHandler(async (req, res) => {
  const coupons = await Coupon.find().sort({ createdAt: -1 });

  res
    .status(200)
    .json(new ApiResponse(200, coupons, "Coupons fetched successfully"));
});

const listPublicCoupons = asyncHandler(async (req, res) => {
  const coupons = await Coupon.find({
    activeStatus: true,
    expiryDate: { $gt: new Date() },
    $or: [
      { usageLimit: null },
      { $expr: { $lt: ["$usedCount", "$usageLimit"] } },
    ],
  })
    .select(
      "code discountType discountValue minimumCartValue expiryDate usageLimit usedCount",
    )
    .sort({ createdAt: -1 });

  res
    .status(200)
    .json(
      new ApiResponse(200, coupons, "Available coupons fetched successfully"),
    );
});

module.exports = {
  validateCoupon,
  listPublicCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  listCoupons,
};
