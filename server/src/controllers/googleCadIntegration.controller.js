const crypto = require("crypto");
const Product = require("../models/product.model");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");

const validGoogleDriveFolderUrl = (value) => {
  try {
    const url = new URL(String(value || "").trim());
    return url.protocol === "https:" && /^(www\.)?drive\.google\.com$/i.test(url.hostname)
      && /^\/drive\/folders\/[^/?#]+\/?$/.test(url.pathname);
  } catch { return false; }
};
const secretsMatch = (received, expected) => {
  if (typeof received !== "string" || typeof expected !== "string" || !expected) return false;
  const actual = Buffer.from(received);
  const configured = Buffer.from(expected);
  return actual.length === configured.length && crypto.timingSafeEqual(actual, configured);
};
const folderCreated = asyncHandler(async (req, res) => {
  if (!secretsMatch(req.get("X-CAD-Webhook-Secret"), process.env.CAD_WEBHOOK_SECRET)) throw new ApiError(401, "Unauthorized CAD webhook request");
  const sku = typeof req.body?.sku === "string" ? req.body.sku.trim() : "";
  const cadFolderUrl = typeof req.body?.cadFolderUrl === "string" ? req.body.cadFolderUrl.trim() : "";
  if (!sku) throw new ApiError(400, "SKU is required");
  if (!validGoogleDriveFolderUrl(cadFolderUrl)) throw new ApiError(400, "A valid HTTPS Google Drive folder URL is required");
  const product = await Product.findOneAndUpdate({ SKU: sku }, { $set: { cadFolderUrl } }, { new: true, runValidators: true }).select("SKU cadFolderUrl");
  if (!product) throw new ApiError(404, "Product not found for SKU");
  res.status(200).json(new ApiResponse(200, { sku: product.SKU, cadFolderUrl: product.cadFolderUrl }, "CAD folder saved"));
});
module.exports = { folderCreated, validGoogleDriveFolderUrl, secretsMatch };