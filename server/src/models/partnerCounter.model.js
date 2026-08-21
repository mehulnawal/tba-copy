const mongoose = require("mongoose");
module.exports = mongoose.model("PartnerCounter", new mongoose.Schema({ key: { type: String, unique: true }, value: { type: Number, default: 0 } }));
