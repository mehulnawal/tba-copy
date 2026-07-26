require("dotenv").config();
const connectDB = require("../src/database/connectDB");
const Category = require("../src/models/category.model");

(async () => {
  await connectDB();
  const result = await Category.deleteMany({ parent: null, categoryKind: { $ne: "metal-root" } });
  const roots = await Category.find({ parent: null, categoryKind: "metal-root" }).select("name metal").lean();
  console.log(`Deleted ${result.deletedCount} orphaned categories.`);
  console.log(`Remaining roots: ${roots.map((root) => `${root.name} (${root.metal})`).join(", ") || "none"}`);
  if (roots.length !== 2 || !roots.some((root) => root.name === "Gold") || !roots.some((root) => root.name === "Silver")) {
    throw new Error("Expected Gold and Silver to be the only root categories");
  }
  process.exit(0);
})().catch((error) => { console.error(error); process.exit(1); });