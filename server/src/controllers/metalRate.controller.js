const MetalRate = require("../models/metalRate.model");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");
const apply = (rate) => {
  global.TBA_METAL_RATES = {
    gold9kt: rate.gold9kt,
    gold14kt: rate.gold14kt,
    gold18kt: rate.gold18kt,
    silver: rate.silver,
  };
  return rate;
};
const get = asyncHandler(async (req, res) => {
  const rate = await MetalRate.findOne({ key: "current" });
  if (!rate) throw new ApiError(503, "Metal rates have not been configured");
  res.json(new ApiResponse(200, apply(rate), "Metal rates fetched"));
});
const update = asyncHandler(async (req, res) => {
  const fields = ["gold9kt", "gold14kt", "gold18kt", "silver"];
  for (const f of fields)
    if (req.body[f] === undefined || Number(req.body[f]) < 0)
      throw new ApiError(400, "All non-negative metal rates are required");
  const rate = await MetalRate.findOneAndUpdate(
    { key: "current" },
    { ...req.body, key: "current", updatedBy: req.admin._id },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  );
  res.json(new ApiResponse(200, apply(rate), "Metal rates updated"));
});

const initialize = async () => {
  console.log("initializeMetalRates called");

  let rate = await MetalRate.findOne({ key: "current" });

  if (!rate) {
    const GoldRate = require("../models/goldRate.model");
    const legacy = await GoldRate.findOne({ cacheKey: "current" });

    if (legacy) {
      rate = await MetalRate.create({
        key: "current",
        gold9kt: legacy["9K"] || 0,
        gold14kt: legacy["14K"] || 0,
        gold18kt: legacy["18K"] || 0,
        silver: 0,
      });
    } else {
      // Create default rates so products never fail
      rate = await MetalRate.create({
        key: "current",
        gold9kt: 3500,
        gold14kt: 5200,
        gold18kt: 6700,
        silver: 90,
      });
    }

    if (rate) {
      console.log(rate);
      apply(rate);
      console.log(global.TBA_METAL_RATES);
    }
  }

  apply(rate);
};

module.exports = { get, update, initialize };
