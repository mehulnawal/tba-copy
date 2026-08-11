const mongoose = require("mongoose");
const b2bAccessSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true, default: "current" },
  passwordHash: { type: String, default: null, select: false },
  sessionVersion: { type: String, required: true, default: () => new mongoose.Types.ObjectId().toString() },
  isActive: { type: Boolean, required: true, default: false },
  lastAccessMobile: { type: String, default: "" },
  changedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
}, { timestamps: true });
module.exports = mongoose.model("B2BAccess", b2bAccessSchema);