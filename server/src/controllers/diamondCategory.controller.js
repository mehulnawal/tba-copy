const DiamondCategory = require("../models/diamondCategory.model");
const Product = require("../models/product.model");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");

const list = asyncHandler(async (req, res) => {
  const rows = await DiamondCategory.find({}).sort({ categoryName: 1 }).collation({ locale: "en", strength: 2 }).lean();
  res.json(new ApiResponse(200, rows, "Diamond categories fetched"));
});

const get = asyncHandler(async (req, res) => {
  const row = await DiamondCategory.findById(req.params.diamondCategoryId).lean();
  if (!row) throw new ApiError(404, "Diamond category not found");
  res.json(new ApiResponse(200, row, "Diamond category fetched"));
});

const create = asyncHandler(async (req, res) => {
  const categoryName = String(req.body.categoryName || req.body.name || "").trim();
  const { size, b2bPrice, b2cPrice } = req.body;
  if (!categoryName) throw new ApiError(400, "Diamond category name is required");
  const row = await DiamondCategory.create({ categoryName, size, b2bPrice, b2cPrice });
  res.status(201).json(new ApiResponse(201, row, "Diamond category created"));
});

const listSizes = asyncHandler(async (req, res) => {
  const categoryName = String(req.query.categoryName || req.params.categoryName || "").trim();
  if (!categoryName) throw new ApiError(400, "categoryName is required");
  const sizes = await DiamondCategory.distinct("size", { categoryName });
  res.json(new ApiResponse(200, sizes, "Diamond sizes fetched"));
});

const update = asyncHandler(async (req, res) => {
  const current = await DiamondCategory.findById(req.params.diamondCategoryId);
  if (!current) throw new ApiError(404, "Diamond category not found");
  const categoryName = String(req.body.categoryName ?? current.categoryName).trim();
  const size = String(req.body.size ?? current.size).trim();
  const b2bPrice = Number(req.body.b2bPrice);
  const b2cPrice = Number(req.body.b2cPrice);
  if (!categoryName || !size) throw new ApiError(400, "Diamond category name and size are required");
  if (!Number.isFinite(b2bPrice) || b2bPrice < 0 || !Number.isFinite(b2cPrice) || b2cPrice < 0) throw new ApiError(400, "B2B and B2C prices must be non-negative numbers");
  const previousCategoryName = current.categoryName;
  const previousSize = current.size;
  current.set({ categoryName, size, b2bPrice, b2cPrice });
  await current.save();
  if (previousCategoryName !== categoryName || previousSize !== size) {
    await Product.updateMany(
      { diamonds: { $elemMatch: { $or: [{ diamondCategoryRef: current._id }, { category: previousCategoryName, subType: previousSize }] } } },
      { $set: { "diamonds.$[diamond].category": categoryName, "diamonds.$[diamond].subType": size } },
      { arrayFilters: [{ $or: [{ "diamond.diamondCategoryRef": current._id }, { "diamond.category": previousCategoryName, "diamond.subType": previousSize }] }] },
    );
  }
  res.json(new ApiResponse(200, current, "Diamond category updated"));
});
const remove = asyncHandler(async (req, res) => {
  const row = await DiamondCategory.findById(req.params.diamondCategoryId);
  if (!row) throw new ApiError(404, "Diamond category not found");
  const referenced = await Product.exists({ diamonds: { $elemMatch: { $or: [{ category: row.categoryName, subType: row.size }, { categoryName: row.categoryName, size: row.size }] } } });
  if (referenced) throw new ApiError(409, "Diamond category is in use by an existing product");
  await row.deleteOne();
  res.json(new ApiResponse(200, null, "Diamond category deleted"));
});

module.exports = { list, get, create, listSizes, update, remove };