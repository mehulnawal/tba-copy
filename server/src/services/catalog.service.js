const fs = require("fs");
const path = require("path");
const Product = require("../models/product.model");
const Category = require("../models/category.model");
const { calculatePrice } = require("../utils/priceCalculator");
const productFile = path.resolve(__dirname, "../../../product.json");
const slugify = (value) => String(value || "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
const readCatalogFile = () => {
  const raw = fs.readFileSync(productFile, "utf8").trim();
  if (!raw) return [];
  const products = JSON.parse(raw);
  if (!Array.isArray(products)) throw new Error("product.json must contain an array of products");
  return products;
};
const toProductResponse = (doc) => {
  const product = doc.data || doc;
  return { ...product, id: String(doc._id || product._id), slug: doc.slug || slugify(product.Title), prices: ["9kt", "14kt", "18kt"].map((karat) => calculatePrice(product, karat)) };
};
const importCatalog = async () => {
  const products = readCatalogFile();
  for (const product of products) {
    await Category.updateOne({ name: product.Category }, { $setOnInsert: { name: product.Category, displayOrder: 0, isActive: true } }, { upsert: true });
    if (!product.SKU || !product.Title || !product.Category) throw new Error("Each product requires SKU, Title, and Category");
    await Product.updateOne({ SKU: product.SKU }, { $set: { SKU: product.SKU, slug: slugify(product.Title), data: product } }, { upsert: true });
  }
  return products.length;
};
module.exports = { readCatalogFile, toProductResponse, importCatalog, slugify };