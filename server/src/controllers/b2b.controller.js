const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const Product = require("../models/product.model");
const B2BAccess = require("../models/b2bAccess.model");
const Category = require("../models/category.model");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");
const { toProductResponse } = require("../services/catalog.service");
const { B2B_COOKIE, b2bSecret } = require("../middlewares/b2b.middleware");

const populated = query => query.populate("mainCategory", "name").populate("subCategory", "name").populate("certificates", "name logoUrl");
const cookieOptions = { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", maxAge: 7 * 24 * 60 * 60 * 1000 };
const statusPayload = access => ({ active: Boolean(access?.isActive), lastChanged: access?.updatedAt || null });
const signAccess = access => jwt.sign({ version: access.sessionVersion, scope: "b2b" }, b2bSecret(), { expiresIn: process.env.JWT_B2B_ACCESS_EXPIRY || "7d" });

const access = asyncHandler(async (req, res) => {
  const password = String(req.body?.password || "");
  if (!password) throw new ApiError(400, "B2B access password is required");
  const current = await B2BAccess.findOne({ key: "current" }).select("+passwordHash");
  if (!current?.isActive || !current.passwordHash || !(await bcrypt.compare(password, current.passwordHash))) throw new ApiError(401, "Invalid or revoked B2B access password");
  res.cookie(B2B_COOKIE, signAccess(current), cookieOptions);
  res.json(new ApiResponse(200, { active: true }, "B2B access granted"));
});
const logout = asyncHandler(async (req, res) => { res.cookie(B2B_COOKIE, "", { ...cookieOptions, maxAge: 0 }); res.json(new ApiResponse(200, null, "B2B session cleared")); });
const listProducts = asyncHandler(async (req, res) => {
  const metal = String(req.query.metal || "gold").trim().toLowerCase();
  const { mainCategory, subCategory } = req.query;
  if (!["gold", "silver"].includes(metal)) throw new ApiError(400, "Metal must be gold or silver");
  // B2B-only catalogue filters: keep the selected metal while narrowing by category.
  const filter = { isActive: true, metal };
  if (subCategory) filter.subCategory = subCategory;
  else if (mainCategory) filter.mainCategory = mainCategory;
  const products = await populated(Product.find(filter).sort({ createdAt: -1 }));
  res.json(new ApiResponse(200, await Promise.all(products.map(product => toProductResponse(product, "B2B"))), `B2B ${metal} catalogue fetched`));
});
const getProduct = asyncHandler(async (req, res) => {
  const identifier = req.params.identifier;
  const match = [{ slug: identifier }, { SKU: identifier }];
  if (/^[a-f\d]{24}$/i.test(identifier)) match.push({ _id: identifier });
  const product = await populated(Product.findOne({ isActive: true, $or: match }));
  if (!product) throw new ApiError(404, "B2B product not found");
  res.json(new ApiResponse(200, await toProductResponse(product, "B2B"), "B2B product fetched"));
});
const status = asyncHandler(async (req, res) => { const current = await B2BAccess.findOne({ key: "current" }).lean(); res.json(new ApiResponse(200, statusPayload(current), "B2B access status fetched")); });
const setPassword = asyncHandler(async (req, res) => {
  const password = String(req.body?.password || "").trim();
  if (password.length < 8) throw new ApiError(400, "B2B password must be at least 8 characters");
  const passwordHash = await bcrypt.hash(password, 12);
  const current = await B2BAccess.findOneAndUpdate({ key: "current" }, { key: "current", passwordHash, isActive: true, sessionVersion: crypto.randomUUID(), changedBy: req.admin._id }, { new: true, upsert: true, setDefaultsOnInsert: true });
  res.json(new ApiResponse(200, statusPayload(current), "B2B password is active; prior B2B sessions were invalidated"));
});
const revoke = asyncHandler(async (req, res) => {
  const current = await B2BAccess.findOneAndUpdate({ key: "current" }, { key: "current", isActive: false, passwordHash: null, sessionVersion: crypto.randomUUID(), changedBy: req.admin._id }, { new: true, upsert: true, setDefaultsOnInsert: true });
  res.json(new ApiResponse(200, statusPayload(current), "B2B access revoked; all B2B sessions are invalidated"));
});
module.exports = { access, logout, listProducts, getProduct, status, setPassword, revoke };