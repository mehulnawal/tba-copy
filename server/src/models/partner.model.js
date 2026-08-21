const mongoose = require("mongoose");
const truncatePoints = (value) => Math.trunc(Number(value || 0) * 100) / 100;
const schema = new mongoose.Schema({
  referenceId: { type: String, required: true, unique: true, immutable: true },
  firstName: { type: String, required: true, trim: true }, lastName: { type: String, required: true, trim: true },
  mobile: { type: String, required: true, unique: true, match: /^\d{10}$/ }, dateOfBirth: { type: Date, required: true },
  city: { type: String, required: true, trim: true }, address: { type: String, default: "", trim: true },
  points: { type: Number, default: 0, set: truncatePoints },
}, { timestamps: true });
schema.set("toJSON", { transform: (_doc, value) => ({ ...value, points: truncatePoints(value.points).toFixed(2) }) });
module.exports = mongoose.model("Partner", schema);
module.exports.truncatePoints = truncatePoints;
