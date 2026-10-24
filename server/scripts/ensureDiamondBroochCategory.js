require("dotenv").config();
const fs = require("fs");
const os = require("os");
const path = require("path");
const crypto = require("crypto");
const mongoose = require("mongoose");
const Category = require("../src/models/category.model");
const Product = require("../src/models/product.model");
const { effectiveCode } = require("../src/services/productSku.service");

const run = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  const diamond = await Category.findOne({
    name: /^Diamond$/i,
    metal: "gold",
    categoryKind: "metal-root",
  });
  if (!diamond) throw new Error("The active Diamond gold root is missing");
  if (!diamond.isActive) throw new Error("The Diamond parent is inactive");
  const named = await Category.find({ name: /^Diamond brooch$/i });
  if (named.length > 1 || named.some((row) => String(row.parent) !== String(diamond._id)))
    throw new Error("Diamond brooch name is already used by a different category");
  const existing = named[0];
  const categories = await Category.find({ metal: "gold", categoryKind: "subcategory" }).lean();
  const conflict = categories.find(
    (category) => String(category._id) !== String(existing?._id) && effectiveCode(category) === "BH",
  );
  if (conflict) throw new Error(`BH is already assigned to ${conflict.name}`);
  const bhProducts = await Product.find({ SKU: /^TBA-GLD-BH-?\d+$/ })
    .select("SKU subCategory").lean();
  const conflictingProduct = bhProducts.find(
    (product) => String(product.subCategory) !== String(existing?._id),
  );
  if (conflictingProduct)
    throw new Error(`BH product ${conflictingProduct.SKU} belongs to another category`);
  const target = {
    name: "Diamond brooch",
    metal: "gold",
    categoryKind: "subcategory",
    parent: diamond._id,
    shortCode: "BH",
    isActive: true,
    showOnHomepage: false,
  };
  if (!process.argv.includes("--apply")) {
    console.log(JSON.stringify({ action: existing ? "update" : "create", parent: diamond.name, ...target, parent: String(diamond._id), existingId: existing ? String(existing._id) : null }));
    return;
  }
  // Save and verify a local category snapshot before changing live data.
  const snapshot = await Category.collection.find({}).toArray();
  const backupPath = path.join(os.tmpdir(), `tba-categories-${Date.now()}.json`);
  const backup = JSON.stringify(snapshot, null, 2);
  fs.writeFileSync(backupPath, backup, { flag: "wx" });
  const digest = (value) => crypto.createHash("sha256").update(value).digest("hex");
  if (digest(fs.readFileSync(backupPath, "utf8")) !== digest(backup))
    throw new Error("Category backup verification failed");
  const category = existing
    ? await Category.findByIdAndUpdate(existing._id, { $set: target }, { new: true, runValidators: true })
    : await Category.create(target);
  const stored = await Category.findById(category._id).lean();
  if (!stored || stored.shortCode !== "BH" || String(stored.parent) !== String(diamond._id) || !stored.isActive || stored.showOnHomepage)
    throw new Error("Diamond brooch verification failed");
  console.log(JSON.stringify({ status: existing ? "updated" : "created", id: String(stored._id), parent: String(stored.parent), code: stored.shortCode, backupPath, backupSha256: digest(backup) }));
};

run()
  .catch((error) => { console.error(error.message); process.exitCode = 1; })
  .finally(() => mongoose.disconnect());
