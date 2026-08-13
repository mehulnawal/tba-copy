const Product = require("../models/product.model");
const Category = require("../models/category.model");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");
const { toProductResponse, slugify } = require("../services/catalog.service");
const { calculatePrice } = require("../utils/priceCalculator");
const { uploadToCloudinary } = require("../utils/cloudinaryUpload");
const CategoryPricingConfig = require("../models/categoryPricingConfig.model");
const populated = query => query.populate("mainCategory", "name").populate("subCategory", "name").populate("certificates", "name logoUrl");
const sharedDiamondWeightGrams = diamonds => (Array.isArray(diamonds) ? diamonds : []).reduce((total, diamond) => total + Number(diamond?.caratWeight || 0), 0) / 5;
const normalizeGoldWeights = (body, metal = body?.metal) => {
  if (metal !== "gold" || !body?.grossWeight || typeof body.grossWeight !== "object" || Array.isArray(body.grossWeight)) return body;
  const diamondWeight = sharedDiamondWeightGrams(body.diamonds);
  const grossWeight = {};
  const netWeight = {};
  for (const karat of ["14kt", "18kt"]) {
    const gross = Number(body.grossWeight[karat]);
    if (!Number.isFinite(gross) || gross < 0) throw new ApiError(400, `${karat} gross weight must be a non-negative number`);
    if (gross < diamondWeight) throw new ApiError(400, `${karat} gross weight cannot be less than the shared diamond weight`);
    grossWeight[karat] = gross;
    netWeight[karat] = gross - diamondWeight;
  }
  return { ...body, grossWeight, netWeight };
};
const listForMetal = metal => asyncHandler(async (req, res) => {
  const { search = "", mainCategory, subCategory, minPrice, maxPrice, sort, karat } = req.query;
  const filter = { isActive: true, metal };
  if (String(req.query.primeCollection || "").toLowerCase() === "true") filter.isPrimeCollection = true;
  if (subCategory) { filter.subCategory = subCategory; } else if (mainCategory) { const children = await Category.find({ parent: mainCategory }).select("_id").lean(); const childIds = children.map((category) => category._id); filter.$or = [{ mainCategory }, { subCategory: { $in: childIds } }]; }
  const documents = await populated(Product.find(filter));
  // One legacy product with incomplete pricing must not make the entire public
  // catalogue (and consequently the Best Seller section) disappear.
  let products = await Promise.all(documents.map(async product => {
    try { return await toProductResponse(product); }
    catch (error) {
      const raw = product.toObject();
      return { ...raw, id: String(raw._id), Title: raw.title, Description: raw.description, Category: raw.subCategory?.name || "", "image_link-1": raw.images?.[0]?.url || "", "image_link-2": raw.images?.[1]?.url || "", "image_link-3": raw.images?.[2]?.url || "", Is_Best_Seller: raw.isBestSeller, Is_New_Product: raw.isNewProduct, prices: [], pricingError: error.message };
    }
  }));
  products = products.filter(product => !search || `${product.title} ${product.SKU}`.toLowerCase().includes(String(search).toLowerCase()));
const selectedKarat = karat ? String(karat).toLowerCase() : null;
  if (selectedKarat && !["14kt", "18kt"].includes(selectedKarat)) throw new ApiError(400, "karat must be 14kt or 18kt");
  const matchingPrices = product => selectedKarat ? product.prices.filter(item => item.karat === selectedKarat) : product.prices;
  const hasMinPrice = minPrice !== undefined && String(minPrice).trim() !== "";
  const hasMaxPrice = maxPrice !== undefined && String(maxPrice).trim() !== "";
  const inRange = product => matchingPrices(product).map(item => Number(item.finalPrice)).some(value => (!hasMinPrice || value >= Number(minPrice)) && (!hasMaxPrice || value <= Number(maxPrice)));
  if (hasMinPrice || hasMaxPrice) products = products.filter(inRange);
  const sortPrice = product => { const prices = matchingPrices(product).map(item => Number(item.finalPrice)); return prices.length ? Math.min(...prices) : Number.POSITIVE_INFINITY; };
  if (!sort || sort === "price-low-high") products.sort((a, b) => sortPrice(a) - sortPrice(b));
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
};
const adminListProducts = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.search) filter.$or = [{ title: new RegExp(req.query.search, "i") }, { SKU: new RegExp(req.query.search, "i") }];
  const documents = await populated(Product.find(filter).sort({ createdAt: -1 }));
  const products = await Promise.all(documents.map(async (product) => {
    try { return await toProductResponse(product); }
    catch (error) {
      // Keep the admin catalogue usable when a legacy product cannot be priced.
      const raw = product.toObject();
      return { ...raw, id: String(raw._id), prices: [], pricingError: error.message };
    }
  }));
  res.json(new ApiResponse(200, products, "Products fetched"));
});
const listPricingConfigs = asyncHandler(async (req, res) => {
  const configs = await CategoryPricingConfig.find({ isActive: true }).sort({ metal: 1, categoryType: 1, key: 1 }).lean();
  res.json(new ApiResponse(200, configs, "Active charge settings fetched"));
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
  if (!config) throw new ApiError(404, "Charge settings not found");
  res.json(new ApiResponse(200, config, "Charge settings updated"));
});
const adminGetProduct = asyncHandler(async (req, res) => { const product = await populated(Product.findById(req.params.productId)); if (!product) throw new ApiError(404, "Product not found"); res.json(new ApiResponse(200, await toProductResponse(product), "Product fetched")); });
const productSkuPrefix = async (metal, subCategory) => {
  const category = await Category.findById(subCategory).select("name shortCode").lean();
  const metalCode = metal === "gold" ? "GLD" : "SLV";
  const categoryCode = category?.shortCode || String(category?.name || "XX").replace(/[^a-z]/gi, "").slice(0, 2).toUpperCase().padEnd(2, "X");
  return `TBA-${metalCode}-${categoryCode}`;
};
const nextProductSku = async (metal, subCategory, excludedProductId) => {
  const seriesPrefix = await productSkuPrefix(metal, subCategory);
  const filter = { SKU: new RegExp(`^${seriesPrefix}-?\\d{3,4}$`) };
  if (excludedProductId) filter._id = { $ne: excludedProductId };
  const matchingSkus = await Product.find(filter).select("SKU").lean();
  const nextNumber = matchingSkus.reduce((highest, product) => Math.max(highest, Number(String(product.SKU).match(/(\d+)$/)?.[1] || 0)), 0) + 1;
  return `${seriesPrefix}${String(nextNumber).padStart(4, "0")}`;
};
const createProduct = asyncHandler(async (req, res) => {
  const body = normalizeGoldWeights(req.body);
  await validateCategories(body);
  const SKU = body.SKU && !String(body.SKU).startsWith("TBA-") ? body.SKU : await nextProductSku(body.metal, body.subCategory);
  const product = await Product.create({ ...body, SKU, slug: slugify(body.title) });
  res.status(201).json(new ApiResponse(201, await toProductResponse(await populated(Product.findById(product._id))), "Product created"));
});
const updateProduct = asyncHandler(async (req, res) => { const current = await Product.findById(req.params.productId); if (!current) throw new ApiError(404, "Product not found"); const update = normalizeGoldWeights({ ...req.body, grossWeight: req.body.grossWeight === undefined ? current.grossWeight : req.body.grossWeight, diamonds: req.body.diamonds === undefined ? current.diamonds : req.body.diamonds }, req.body.metal || current.metal); if (update.title) update.slug = slugify(update.title); if (update.mainCategory || update.subCategory || update.metal) { const nextProduct = { ...current.toObject(), ...update }; await validateCategories(nextProduct); const expectedPrefix = await productSkuPrefix(nextProduct.metal, nextProduct.subCategory); if (String(current.SKU || "").startsWith("TBA-") && !String(current.SKU).startsWith(expectedPrefix)) update.SKU = await nextProductSku(nextProduct.metal, nextProduct.subCategory, current._id); } const product = await Product.findByIdAndUpdate(current._id, update, { new: true, runValidators: true }); res.json(new ApiResponse(200, await toProductResponse(await populated(Product.findById(product._id))), "Product updated")); });
const deleteProduct = asyncHandler(async (req, res) => { const product = await Product.findByIdAndDelete(req.params.productId); if (!product) throw new ApiError(404, "Product not found"); res.json(new ApiResponse(200, null, "Product deleted")); });
const previewPrice = asyncHandler(async (req, res) => {
  const previewProduct = normalizeGoldWeights(req.body);
  const karats = previewProduct.metal === "silver" ? [undefined] : ["14kt", "18kt"];
  const prices = await Promise.all(karats.map(async karat => {
    const [b2c, b2b] = await Promise.all([calculatePrice(previewProduct, karat, "B2C"), calculatePrice(previewProduct, karat, "B2B")]);
    return { ...b2c, b2bFinalPrice: b2b.finalPrice };
  }));
  res.json(new ApiResponse(200, prices, "Price preview"));
});
const uploadImageHandler = asyncHandler(async (req, res) => { const url = await uploadToCloudinary(req.file, "tba-products", { quality: "auto", fetch_format: "auto", width: 1600, crop: "limit" }); res.status(201).json(new ApiResponse(201, { url }, "Image uploaded")); });
module.exports = { listProducts, listGoldProducts, listSilverProducts, getProduct, adminListProducts, adminGetProduct, listPricingConfigs, updatePricingConfig, createProduct, updateProduct, deleteProduct, previewPrice, uploadImageHandler };
