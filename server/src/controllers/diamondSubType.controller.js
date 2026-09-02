const DiamondSubType = require("../models/diamondSubType.model");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");

const canonicalName = (value) =>
  `${value.charAt(0).toUpperCase()}${value.slice(1).toLowerCase()}`;

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const list = asyncHandler(async (req, res) =>
  res.json(
    new ApiResponse(
      200,
      await DiamondSubType.find().sort({ name: 1 }).lean(),
      "Diamond subcategories fetched",
    ),
  ),
);
const create = asyncHandler(async (req, res) => {
  const input = String(req.body.name || "").trim();
  if (!input) throw new ApiError(400, "Diamond subcategory name is required");

  const name = canonicalName(input);
  // The existing unique index is case-sensitive. Look up with an exact,
  // case-insensitive match first so legacy data and new submissions both use
  // one logical subcategory regardless of input casing.
  const existing = await DiamondSubType.findOne({
    name: { $regex: `^${escapeRegex(name)}$`, $options: "i" },
  });
  const row =
    existing ||
    (await DiamondSubType.findOneAndUpdate(
      { name },
      { $setOnInsert: { name } },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    ));
  res.status(201).json(new ApiResponse(201, row, "Diamond subcategory saved"));
});
module.exports = { list, create, canonicalName };
