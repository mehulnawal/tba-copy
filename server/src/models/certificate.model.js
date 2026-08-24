const mongoose = require("mongoose");
const schema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, unique: true },
    logoUrl: { type: String, default: "", trim: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);
module.exports = mongoose.model("Certificate", schema);
