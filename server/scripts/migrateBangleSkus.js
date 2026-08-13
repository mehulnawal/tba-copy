require("dotenv").config();
const mongoose = require("mongoose");
const Category = require("../src/models/category.model");
const Product = require("../src/models/product.model");
const Cart = require("../src/models/cart.model");
const Wishlist = require("../src/models/wishlist.model");
const Order = require("../src/models/order.model");

const run = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  const bangleCategories = await Category.find({ name: /bangle/i, shortCode: "BG" }).select("_id").lean();
  const categoryIds = bangleCategories.map(category => category._id);
  const products = await Product.find({ subCategory: { $in: categoryIds }, SKU: /^TBA-(GLD|SLV)-DI(\d{4})$/ }).select("SKU metal").lean();
  const changes = products.map(product => ({
    id: product._id,
    from: product.SKU,
    to: product.SKU.replace(/^TBA-(GLD|SLV)-DI(\d{4})$/, (_, metal, number) => `TBA-${metal}-BG${number}`),
  }));
  const targetSkus = changes.map(change => change.to);
  if (new Set(targetSkus).size !== targetSkus.length) throw new Error("Bangle SKU migration would create duplicate targets");
  const collisions = await Product.find({ SKU: { $in: targetSkus }, _id: { $nin: changes.map(change => change.id) } }).select("SKU").lean();
  if (collisions.length) throw new Error(`Bangle SKU migration would collide with: ${collisions.map(product => product.SKU).join(", ")}`);
  if (!changes.length) return console.log("No legacy Bangle SKUs require migration.");

  await Product.bulkWrite(changes.map(change => ({ updateOne: { filter: { _id: change.id, SKU: change.from }, update: { $set: { SKU: change.to } } } })));
  for (const change of changes) {
    await Promise.all([
      Cart.updateMany({ "items.productId": change.from }, { $set: { "items.$[item].productId": change.to } }, { arrayFilters: [{ "item.productId": change.from }] }),
      Wishlist.updateMany({ "items.productId": change.from }, { $set: { "items.$[item].productId": change.to } }, { arrayFilters: [{ "item.productId": change.from }] }),
      Order.updateMany({ "items.productSku": change.from }, { $set: { "items.$[item].productSku": change.to } }, { arrayFilters: [{ "item.productSku": change.from }] }),
    ]);
  }
  console.log(`Migrated ${changes.length} Bangle SKU(s): ${changes.map(change => `${change.from} -> ${change.to}`).join(", ")}`);
};

run().catch(error => { console.error(error.message); process.exitCode = 1; }).finally(() => mongoose.disconnect());