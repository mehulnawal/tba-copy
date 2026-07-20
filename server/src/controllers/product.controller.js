const Product = require("../models/product.model");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");
const { toProductResponse } = require("../services/catalog.service");
const Category = require("../models/category.model");
const listProducts = asyncHandler(async (req, res) => {
  const { search = "", category, minPrice, maxPrice, sort } = req.query;
  const docs = await Product.find();
  let products = docs.map(toProductResponse).filter((product) => !search || `${product.Title} ${product.Description} ${product.SKU}`.toLowerCase().includes(String(search).toLowerCase()));
  if (category) products = products.filter((product) => product.Category === category);
  const selectedPrice = (product) => product.prices.find((price) => price.karat === "14kt").finalPrice;
  if (minPrice !== undefined) products = products.filter((product) => selectedPrice(product) >= Number(minPrice));
  if (maxPrice !== undefined) products = products.filter((product) => selectedPrice(product) <= Number(maxPrice));
  if (sort === "price-low-high") products.sort((a, b) => selectedPrice(a) - selectedPrice(b));
  if (sort === "price-high-low") products.sort((a, b) => selectedPrice(b) - selectedPrice(a));
  if (sort === "newest") products.sort((a, b) => Number(b.Is_New_Product) - Number(a.Is_New_Product));
  if (sort === "best-sellers") products.sort((a, b) => Number(b.Is_Best_Seller) - Number(a.Is_Best_Seller));
  res.status(200).json(new ApiResponse(200, products, "Products fetched successfully"));
});
const getCategories = asyncHandler(async (req, res) => { const categories = await Category.find({ isActive: true }).sort({ displayOrder: 1, name: 1 }); res.status(200).json(new ApiResponse(200, categories, "Categories fetched successfully")); });
const getProduct = asyncHandler(async (req, res) => {
  const doc = await Product.findOne({ $or: [{ slug: req.params.identifier }, { SKU: req.params.identifier }] });
  if (!doc) throw new ApiError(404, "Product not found");
  res.status(200).json(new ApiResponse(200, toProductResponse(doc), "Product fetched successfully"));
});
module.exports = { listProducts, getCategories, getProduct };