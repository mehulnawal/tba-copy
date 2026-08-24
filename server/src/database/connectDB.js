const mongoose = require("mongoose");
const DiamondCategory = require("../models/diamondCategory.model");

const connectDB = async () => {
  const conn = await mongoose.connect(process.env.MONGODB_URI);
  try {
    const indexes = await DiamondCategory.collection.indexes();
    // Older versions stored a unique `name` field. The current master-data
    // model uses `categoryName`, and a leftover unique index on either field
    // would reject every record after the first (missing fields index as null).
    const legacy = indexes.find(
      (index) =>
        index.unique &&
        (index.name === "name_1" ||
          index.name === "categoryName_1" ||
          index.key?.name === 1 ||
          index.key?.categoryName === 1),
    );
    if (legacy) await DiamondCategory.collection.dropIndex(legacy.name);
  } catch (error) {
    console.warn("Could not reconcile DiamondCategory indexes", error.message);
  }
  return conn;
};

module.exports = connectDB;
