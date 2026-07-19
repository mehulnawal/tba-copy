const axios = require("axios");
const GoldRate = require("../models/goldRate.model");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");

const CACHE_KEY = "current";
const DEFAULT_CACHE_TTL_MS = 15 * 60 * 1000;

const serializeRate = (rate) => ({
  "9K": rate["9K"], "12K": rate["12K"], "14K": rate["14K"],
  "18K": rate["18K"], "22K": rate["22K"], "24K": rate["24K"],
  updatedAt: rate.updatedAt,
});

const fetchLiveRates = async () => {
  if (!process.env.GOLD_API_KEY) throw new ApiError(503, "Gold-rate service is not configured");
  const response = await axios.get(
    process.env.GOLD_RATE_API_URL || "https://www.goldapi.io/api/XAU/INR",
    { headers: { "x-access-token": process.env.GOLD_API_KEY }, timeout: 10000 },
  );
  const sourcePrice = Number(response.data.price_gram_24k || response.data.price / 31.1035);
  const price24K = Math.round(sourcePrice * 1.12);
  if (!Number.isFinite(price24K) || price24K <= 0) {
    throw new ApiError(502, "Gold-rate provider returned invalid data");
  }
  return {
    "24K": price24K, "22K": Math.round(price24K * 0.916),
    "18K": Math.round(price24K * 0.75), "14K": Math.round(price24K * 0.585),
    "12K": Math.round(price24K * 0.5), "9K": Math.round(price24K * 0.375),
  };
};

const getGoldRates = asyncHandler(async (req, res) => {
  const cachedRate = await GoldRate.findOne({ cacheKey: CACHE_KEY });
  const configuredTtl = Number(process.env.GOLD_RATE_CACHE_TTL_MS);
  const ttl = Number.isFinite(configuredTtl) && configuredTtl > 0 ? configuredTtl : DEFAULT_CACHE_TTL_MS;
  if (cachedRate && Date.now() - cachedRate.updatedAt.getTime() < ttl) {
    return res.status(200).json(new ApiResponse(200, serializeRate(cachedRate), "Gold rates fetched successfully"));
  }
  try {
    const rates = await fetchLiveRates();
    const storedRate = await GoldRate.findOneAndUpdate(
      { cacheKey: CACHE_KEY }, { $set: rates, $setOnInsert: { cacheKey: CACHE_KEY } },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    );
    return res.status(200).json(new ApiResponse(200, serializeRate(storedRate), "Gold rates fetched successfully"));
  } catch (error) {
    if (cachedRate) {
      return res.status(200).json(new ApiResponse(200, serializeRate(cachedRate), "Cached gold rates fetched successfully"));
    }
    throw error;
  }
});

module.exports = { getGoldRates };
