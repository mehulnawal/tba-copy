const Product = require("../models/product.model");
const Category = require("../models/category.model");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");
const { toProductResponse, slugify } = require("../services/catalog.service");
const { calculatePrice } = require("../utils/priceCalculator");
const { uploadToCloudinary } = require("../utils/cloudinaryUpload");
const CategoryPricingConfig = require("../models/categoryPricingConfig.model");
const populated = query => query.populate("mainCategory", "name").populate("subCategory", "name");
const listForMetal = metal => asyncHandler(async (req, res) => {
  const { search = "", mainCategory, subCategory, minPrice, maxPrice, sort, karat } = req.query;
  const filter = { isActive: true, metal }; if (mainCategory) filter.mainCategory = mainCategory; if (subCategory) filter.subCategory = subCategory;
  let products = await Promise.all((await populated(Product.find(filter))).map(toProductResponse));
  products = products.filter(product => !search || `${product.title} ${product.SKU}`.toLowerCase().includes(String(search).toLowerCase()));
const selectedKarat = karat ? String(karat).toLowerCase() : null;
  if (selectedKarat && !["14kt", "18kt"].includes(selectedKarat)) throw new ApiError(400, "karat must be 14kt or 18kt");
  const matchingPrices = product => selectedKarat ? product.prices.filter(item => item.karat === selectedKarat) : product.prices;
  const inRange = product => matchingPrices(product).map(item => Number(item.finalPrice)).some(value => (minPrice === undefined || value >= Number(minPrice)) && (maxPrice === undefined || value <= Number(maxPrice)));
  if (minPrice !== undefined || maxPrice !== undefined) products = products.filter(inRange);
  const sortPrice = product => { const prices = matchingPrices(product).map(item => Number(item.finalPrice)); return prices.length ? Math.min(...prices) : Number.POSITIVE_INFINITY; };
  if (sort === "price-low-high") products.sort((a, b) => sortPrice(a) - sortPrice(b));
  if (sort === "price-high-low") products.sort((a, b) => sortPrice(b) - sortPrice(a));
  if (sort === "newest") products.sort((a, b) => Number(b.isNewProduct) - Number(a.isNewProduct));
  if (sort === "best-sellers") products.sort((a, b) => Number(b.isBestSeller) - Number(a.isBestSeller));
  res.json(new ApiResponse(200, products, `${metal} products fetched successfully`));
});
const listGoldProducts = listForMetal("gold");
const listSilverProducts = listForMetal("silver");
const listProducts = asyncHandler(async (req, res) => { throw new ApiError(410, "Use /products/gold or /products/silver; mixed-metal catalog listings are not available"); });
const getProduct = asyncHandler(async (req, res) => { const product = await populated(Product.findOne({ $or: [{ slug: req.params.identifier }, { SKU: req.params.identifier }], isActive: true })); if (!product) throw new ApiError(404, "Product not found"); res.json(new ApiResponse(200, await toProductResponse(product), "Product fetched")); });
const validateCategories = async body => {
  const main = await Category.findById(body.mainCategory);
  const sub = await Category.findById(body.subCategory);
  if (!main || !sub || main.metal !== sub.metal) throw new ApiError(400, "Valid categories from one metal are required");
  if (main.metal === "gold" && (main.categoryKind !== "metal-root" || String(sub.parent) !== String(main._id))) throw new ApiError(400, "Gold products require a Gold sub-category");
  if (main.metal === "silver" && (main.categoryKind !== "type" || String(sub.parent) !== String(main._id))) throw new ApiError(400, "Silver products require a Silver type and its sub-category");
  if (body.metal && body.metal !== main.metal) throw new ApiError(400, "Product metal must match its category metal");
  const key = String(body.pricingConfigKey || "").trim().toUpperCase();
  const config = await CategoryPricingConfig.findOne({ key, isActive: true }).lean();
  if (!config || config.metal !== main.metal) throw new ApiError(400, "Pricing configuration must match the selected metal");
  if (main.metal === "silver" && String(config.categoryType).toLowerCase() !== String(main.name).toLowerCase()) throw new ApiError(400, "Pricing configuration must match the selected Silver type");
};
const adminListProducts = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.search) filter.$or = [{ title: new RegExp(req.query.search, "i") }, { SKU: new RegExp(req.query.search, "i") }];
  const documents = await populated(Product.find(filter).sort({ createdAt: -1 }));
  const products = await Promise.all(documents.map(async (product) => {
    try { return await toProductResponse(product); }
    catch (error) {
      // Keep the admin catalogue usable when a legacy product has no valid pricing setup.
      const raw = product.toObject();
      return { ...raw, id: String(raw._id), prices: [], pricingError: error.message };
    }
  }));
  res.json(new ApiResponse(200, products, "Products fetched"));
});
const listPricingConfigs = asyncHandler(async (req, res) => {
  const configs = await CategoryPricingConfig.find({ isActive: true }).sort({ metal: 1, categoryType: 1, key: 1 }).lean();
  res.json(new ApiResponse(200, configs, "Active pricing configurations fetched"));
});
const updatePricingConfig = asyncHandler(async (req, res) => {
  const key = String(req.params.key || "").trim().toUpperCase();
  const update = {};
  for (const field of ["makingRatePerGram", "moissaniteRatePerCarat", "polkiValuePerUnit", "silverB2BMakingChargeRate"]) {
    if (req.body?.[field] === undefined) continue;
    if (req.body[field] === null || req.body[field] === "") { update[field] = undefined; continue; }
    const value = Number(req.body[field]);
    if (!Number.isFinite(value) || value < 0) throw new ApiError(400, `${field} must be a non-negative number or blank`);
    update[field] = value;
  }
  if (!Object.keys(update).length) throw new ApiError(400, "At least one pricing setting is required");
  const config = await CategoryPricingConfig.findOneAndUpdate({ key }, { $set: update }, { new: true, runValidators: true });
  if (!config) throw new ApiError(404, "Pricing configuration not found");
  res.json(new ApiResponse(200, config, "Pricing configuration updated"));
});
const adminGetProduct = asyncHandler(async (req, res) => { const product = await populated(Product.findById(req.params.productId)); if (!product) throw new ApiError(404, "Product not found"); res.json(new ApiResponse(200, await toProductResponse(product), "Product fetched")); });
const createProduct = asyncHandler(async (req, res) => { await validateCategories(req.body); const product = await Product.create({ ...req.body, slug: slugify(req.body.title) }); res.status(201).json(new ApiResponse(201, await toProductResponse(await populated(Product.findById(product._id))), "Product created")); });
const updateProduct = asyncHandler(async (req, res) => { const current = await Product.findById(req.params.productId); if (!current) throw new ApiError(404, "Product not found"); const update = { ...req.body }; if (update.title) update.slug = slugify(update.title); if (update.mainCategory || update.subCategory || update.pricingConfigKey || update.metal) await validateCategories({ ...current.toObject(), ...update }); const product = await Product.findByIdAndUpdate(current._id, update, { new: true, runValidators: true }); res.json(new ApiResponse(200, await toProductResponse(await populated(Product.findById(product._id))), "Product updated")); });
const deleteProduct = asyncHandler(async (req, res) => { const product = await Product.findByIdAndDelete(req.params.productId); if (!product) throw new ApiError(404, "Product not found"); res.json(new ApiResponse(200, null, "Product deleted")); });
const previewPrice = asyncHandler(async (req, res) => { const karats = req.body.metal === "silver" ? [undefined] : ["14kt", "18kt"]; res.json(new ApiResponse(200, await Promise.all(karats.map(karat => calculatePrice(req.body, karat, req.body.buyer || "B2C"))), "Price preview")); });
const uploadImageHandler = asyncHandler(async (req, res) => { const url = await uploadToCloudinary(req.file, "tba-products", { quality: "auto", fetch_format: "auto", width: 1600, crop: "limit" }); res.status(201).json(new ApiResponse(201, { url }, "Image uploaded")); });
module.exports = { listProducts, listGoldProducts, listSilverProducts, getProduct, adminListProducts, adminGetProduct, listPricingConfigs, updatePricingConfig, createProduct, updateProduct, deleteProduct, previewPrice, uploadImageHandler };
