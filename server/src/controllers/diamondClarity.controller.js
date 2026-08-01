const DiamondClarity = require("../models/diamondClarity.model");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");

const defaults = ["EF/VVSVS"];

const list = asyncHandler(async (req, res) => {
  if (await DiamondClarity.countDocuments() === 0) {
    await DiamondClarity.insertMany(defaults.map((name) => ({ name })));
  }
  const clarities = await DiamondClarity.find({ isActive: true }).sort({ name: 1 }).lean();
  res.json(new ApiResponse(200, clarities, "Diamond clarity options fetched"));
});

const save = asyncHandler(async (req, res) => {
  const name = String(req.body.name || "").trim();
  if (!name) throw new ApiError(400, "Diamond clarity is required");
  const clarity = await DiamondClarity.findOneAndUpdate(
    { name },
    { $setOnInsert: { name, isActive: true } },
    { upsert: true, new: true, runValidators: true },
  );
  res.status(201).json(new ApiResponse(201, clarity, "Diamond clarity option saved"));
});

module.exports = { list, save };