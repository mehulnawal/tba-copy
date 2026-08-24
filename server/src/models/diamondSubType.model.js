const mongoose = require("mongoose");
module.exports = mongoose.model(
  "DiamondSubType",
  new mongoose.Schema(
    { name: { type: String, required: true, trim: true, unique: true } },
    { timestamps: true },
  ),
);
