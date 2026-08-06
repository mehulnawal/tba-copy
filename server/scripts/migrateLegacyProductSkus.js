require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../src/database/connectDB");
const Product = require("../src/models/product.model");

const legacySkuPattern = /^TBA-(GLD|SLV)-([A-Z0-9]+)-(\d{3})$/;

(async () => {
  await connectDB();
  const products = await Product.find({ SKU: legacySkuPattern }).select("SKU").lean();
  const changes = products.map(product => ({ id: product._id, from: product.SKU, to: product.SKU.replace(legacySkuPattern, (_, metal, category, number) => `TBA-${metal}-${category}${number.padStart(4, "0")}`) }));
  const targetSkus = changes.map(change => change.to);
  if (new Set(targetSkus).size !== targetSkus.length) throw new Error("Legacy SKU migration would create duplicate target SKUs");
  const collisions = await Product.find({ SKU: { $in: targetSkus }, _id: { $nin: changes.map(change => change.id) } }).select("SKU").lean();
  if (collisions.length) throw new Error(`Legacy SKU migration would collide with existing SKUs: ${collisions.map(product => product.SKU).join(", ")}`);
  if (changes.length) await Product.bulkWrite(changes.map(change => ({ updateOne: { filter: { _id: change.id, SKU: change.from }, update: { $set: { SKU: change.to } } } })));
  console.log(JSON.stringify({ migrated: changes.length, changes }));
  await mongoose.disconnect();
})().catch(async error => { console.error(error); await mongoose.disconnect().catch(() => {}); process.exit(1); });