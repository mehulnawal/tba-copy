const DiamondCategory = require("../models/diamondCategory.model");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");

const defaults = [
  { name: "Center", subTypes: ["Round", "Fancy"], isActive: true },
  { name: "Small", subTypes: ["Round", "Fancy"], isActive: true },
];

const list = asyncHandler(async (req, res) => {
  if (await DiamondCategory.countDocuments() === 0) await DiamondCategory.insertMany(defaults);
  const categories = await DiamondCategory.find({ isActive: true }).sort({ name: 1 }).lean();
  res.json(new ApiResponse(200, categories, "Diamond categories fetched"));
});

const save = asyncHandler(async (req, res) => {
  const name = String(req.body.name || "").trim();
  const subType = String(req.body.subType || "").trim();
  if (!name) throw new ApiError(400, "Diamond category name is required");
  const category = await DiamondCategory.findOneAndUpdate(
    { name },
    { $setOnInsert: { name, isActive: true }, ...(subType ? { $addToSet: { subTypes: subType } } : {}) },
    { upsert: true, new: true, runValidators: true },
  );
  res.status(201).json(new ApiResponse(201, category, "Diamond category saved"));
});

module.exports = { list, save };