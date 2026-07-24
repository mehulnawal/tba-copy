const MetalRate = require("../models/metalRate.model");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");

const apply = rate => {
  global.TBA_METAL_RATES = { gold24kt: rate.gold24kt, silver: rate.silver, makingRatePerGram: rate.makingRatePerGram, certificateRatePerGram: rate.certificateRatePerGram };
  return rate;
};
const get = asyncHandler(async (req, res) => { const rate = await MetalRate.findOne({ key: "current" }); if (!rate) throw new ApiError(503, "Metal rates have not been configured"); res.json(new ApiResponse(200, apply(rate), "Metal rates fetched")); });
const getPublic = asyncHandler(async (req, res) => { const rate = await MetalRate.findOne({ key: "current" }); if (!rate) throw new ApiError(503, "Metal rates have not been configured"); const rates = apply(rate); res.json(new ApiResponse(200, { ...rates, updatedAt: rate.updatedAt }, "Metal rates fetched")); });
const update = asyncHandler(async (req, res) => { const fields = ["gold24kt", "silver", "makingRatePerGram", "certificateRatePerGram"]; for (const field of fields) if (req.body[field] === undefined || !Number.isFinite(Number(req.body[field])) || Number(req.body[field]) < 0) throw new ApiError(400, "gold24kt, silver, makingRatePerGram, and certificateRatePerGram must all be non-negative numbers"); const payload = Object.fromEntries(fields.map(field => [field, Number(req.body[field])])); const rate = await MetalRate.findOneAndUpdate({ key: "current" }, { ...payload, key: "current", updatedBy: req.admin._id }, { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }); res.json(new ApiResponse(200, apply(rate), "Metal rates updated")); });
const initialize = async () => { let rate = await MetalRate.findOne({ key: "current" }); if (!rate) rate = await MetalRate.create({ key: "current", gold24kt: 9000, silver: 90, makingRatePerGram: 850, certificateRatePerGram: 0 }); apply(rate); };
module.exports = { get, update, initialize, getPublic };