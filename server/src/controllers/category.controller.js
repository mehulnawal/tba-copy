const mongoose = require("mongoose");
const Category = require("../models/category.model");
const Product = require("../models/product.model");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");

const FIXED_SUBCATEGORIES = ["Rings", "Earrings", "Necklaces", "Bangles", "Pendants"];
const withParent = query => query.populate("parent", "name metal categoryKind").sort({ metal: 1, displayOrder: 1, name: 1 });
const rootFor = async metal => Category.findOne({ metal, categoryKind: "metal-root" });
const deriveHierarchy = async ({ name, parent, categoryId }) => {
  if (!parent) {
    if (!["Gold", "Silver"].includes(name)) throw new ApiError(400, "Only the fixed Gold and Silver roots may have no parent");
    return { metal: name.toLowerCase(), categoryKind: "metal-root", parent: null };
  }
  if (!mongoose.isValidObjectId(parent)) throw new ApiError(400, "Parent category does not exist");
  if (String(parent) === String(categoryId)) throw new ApiError(400, "A category cannot be its own parent");
  const parentCategory = await Category.findById(parent);
  if (!parentCategory) throw new ApiError(400, "Parent category does not exist");
  if (parentCategory.categoryKind === "metal-root") return { metal: parentCategory.metal, categoryKind: parentCategory.metal === "gold" ? "subcategory" : "type", parent: parentCategory._id };
  if (parentCategory.categoryKind === "type" && parentCategory.metal === "silver") return { metal: "silver", categoryKind: "subcategory", parent: parentCategory._id };
  throw new ApiError(400, "Only Gold, Silver, or a Silver category type can contain categories");
};
const categoryFilter = req => { const filter = { isActive: true }; if (req.query.metal) { if (!["gold", "silver"].includes(req.query.metal)) throw new ApiError(400, "metal must be gold or silver"); filter.metal = req.query.metal; } return filter; };
const listPublic = asyncHandler(async (req, res) => res.json(new ApiResponse(200, await withParent(Category.find(categoryFilter(req))), "Categories fetched")));
const listAdmin = asyncHandler(async (req, res) => { const filter = {}; if (req.query.metal) filter.metal = req.query.metal; res.json(new ApiResponse(200, await withParent(Category.find(filter)), "Categories fetched")); });
const create = asyncHandler(async (req, res) => { const name = String(req.body.name || "").trim(); if (!name) throw new ApiError(400, "Category name is required"); const hierarchy = await deriveHierarchy({ name, parent: req.body.parent }); const category = await Category.create({ name, ...hierarchy, displayOrder: Number(req.body.displayOrder || 0), isActive: req.body.isActive !== false }); await category.populate("parent", "name metal categoryKind"); res.status(201).json(new ApiResponse(201, category, "Category created")); });
const update = asyncHandler(async (req, res) => { const existing = await Category.findById(req.params.categoryId); if (!existing) throw new ApiError(404, "Category not found"); const name = req.body.name === undefined ? existing.name : String(req.body.name).trim(); if (!name) throw new ApiError(400, "Category name is required"); const parent = Object.prototype.hasOwnProperty.call(req.body, "parent") ? req.body.parent : existing.parent; const hierarchy = await deriveHierarchy({ name, parent, categoryId: existing._id }); if (existing.categoryKind === "metal-root" && (hierarchy.categoryKind !== "metal-root" || name !== existing.name)) throw new ApiError(400, "Gold and Silver roots cannot be renamed or moved"); const category = await Category.findByIdAndUpdate(existing._id, { ...req.body, name, ...hierarchy }, { new: true, runValidators: true }).populate("parent", "name metal categoryKind"); res.json(new ApiResponse(200, category, "Category updated")); });
const remove = asyncHandler(async (req, res) => { const category = await Category.findById(req.params.categoryId); if (!category) throw new ApiError(404, "Category not found"); if (category.categoryKind === "metal-root") throw new ApiError(400, "Gold and Silver roots cannot be deleted"); if (await Category.exists({ parent: category._id })) throw new ApiError(400, "Delete or reassign child categories first"); if (await Product.exists({ $or: [{ mainCategory: category._id }, { subCategory: category._id }] })) throw new ApiError(400, "Category is used by products and cannot be deleted"); await category.deleteOne(); res.json(new ApiResponse(200, null, "Category deleted")); });
const initializeCategoryStructure = async () => { const gold = await Category.findOneAndUpdate({ name: "Gold", categoryKind: "metal-root" }, { $setOnInsert: { name: "Gold", metal: "gold", categoryKind: "metal-root", displayOrder: 1, isActive: true } }, { upsert: true, new: true }); const silver = await Category.findOneAndUpdate({ name: "Silver", categoryKind: "metal-root" }, { $setOnInsert: { name: "Silver", metal: "silver", categoryKind: "metal-root", displayOrder: 2, isActive: true } }, { upsert: true, new: true }); for (const [index, name] of FIXED_SUBCATEGORIES.entries()) await Category.findOneAndUpdate({ name, parent: gold._id, metal: "gold" }, { $setOnInsert: { name, metal: "gold", categoryKind: "subcategory", parent: gold._id, displayOrder: index + 1, isActive: true } }, { upsert: true, new: true }); for (const [typeIndex, typeName] of ["Moissanite", "Polki"].entries()) { const type = await Category.findOneAndUpdate({ name: typeName, parent: silver._id, metal: "silver" }, { $setOnInsert: { name: typeName, metal: "silver", categoryKind: "type", parent: silver._id, displayOrder: typeIndex + 1, isActive: true } }, { upsert: true, new: true }); for (const [index, name] of FIXED_SUBCATEGORIES.entries()) await Category.findOneAndUpdate({ name, parent: type._id, metal: "silver" }, { $setOnInsert: { name, metal: "silver", categoryKind: "subcategory", parent: type._id, displayOrder: index + 1, isActive: true } }, { upsert: true, new: true }); }
};
module.exports = { listPublic, listAdmin, create, update, remove, initializeCategoryStructure, FIXED_SUBCATEGORIES };