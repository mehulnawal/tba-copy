const Category = require("../models/category.model");
const Product = require("../models/product.model");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");

const withParent = (query) => query.populate("parent", "name").sort({ displayOrder: 1, name: 1 });
const validateParent = async (parent, categoryId) => {
  if (parent === undefined || parent === null || parent === "") return null;
  if (!require("mongoose").isValidObjectId(parent)) throw new ApiError(400, "Parent category does not exist");
  if (String(parent) === String(categoryId)) throw new ApiError(400, "A category cannot be its own parent");
  const parentCategory = await Category.findById(parent);
  if (!parentCategory) throw new ApiError(400, "Parent category does not exist");
  if (parentCategory.parent) throw new ApiError(400, "Sub-categories cannot have sub-categories");
  return parentCategory._id;
};
const listPublic = asyncHandler(async (req, res) => res.json(new ApiResponse(200, await withParent(Category.find({ isActive: true })), "Categories fetched")));
const listAdmin = asyncHandler(async (req, res) => res.json(new ApiResponse(200, await withParent(Category.find()), "Categories fetched")));
const create = asyncHandler(async (req, res) => {
  const { name, displayOrder = 0, isActive = true } = req.body;
  if (!name?.trim()) throw new ApiError(400, "Category name is required");
  const parent = await validateParent(req.body.parent);
  const c = await Category.create({ name: name.trim(), parent, displayOrder, isActive });
  await c.populate("parent", "name");
  res.status(201).json(new ApiResponse(201, c, "Category created"));
});
const update = asyncHandler(async (req, res) => {
  const existing = await Category.findById(req.params.categoryId);
  if (!existing) throw new ApiError(404, "Category not found");
  const patch = { ...req.body };
  if (Object.prototype.hasOwnProperty.call(patch, "parent")) patch.parent = await validateParent(patch.parent, existing._id);
  const c = await Category.findByIdAndUpdate(existing._id, patch, { new: true, runValidators: true }).populate("parent", "name");
  res.json(new ApiResponse(200, c, "Category updated"));
});
const remove = asyncHandler(async (req, res) => {
  const c = await Category.findById(req.params.categoryId);
  if (!c) throw new ApiError(404, "Category not found");
  if (!c.parent && await Category.exists({ parent: c._id })) throw new ApiError(400, "Delete or reassign sub-categories first");
  if (await Product.exists({ $or: [{ mainCategory: c._id }, { subCategory: c._id }] })) throw new ApiError(400, "Category is used by products and cannot be deleted");
  await c.deleteOne();
  res.json(new ApiResponse(200, null, "Category deleted"));
});
module.exports = { listPublic, listAdmin, create, update, remove };
