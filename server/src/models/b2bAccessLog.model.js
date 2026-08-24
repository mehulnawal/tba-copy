const mongoose = require("mongoose");

const b2bAccessLogSchema = new mongoose.Schema(
  {
    mobile: { type: String, required: true, trim: true },
  },
  { timestamps: true },
);

b2bAccessLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model("B2BAccessLog", b2bAccessLogSchema);
