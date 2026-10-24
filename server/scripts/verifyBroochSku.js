// Run explicitly: node scripts/verifyBroochSku.js --run
// Uses a randomly named isolated database on the configured MongoDB cluster.
require("dotenv").config({ quiet: true });
const crypto = require("crypto");
const mongoose = require("mongoose");
const Category = require("../src/models/category.model");
const Product = require("../src/models/product.model");
const Order = require("../src/models/order.model");
const CategoryPricingConfig = require("../src/models/categoryPricingConfig.model");
require("../src/models/certificate.model");
const productController = require("../src/controllers/product.controller");
const SkuCounter = require("../src/models/skuCounter.model");
const { nextProductSku } = require("../src/services/productSku.service");

const run = async () => {
  if (!process.argv.includes("--run")) throw new Error("Pass --run to start the isolated SKU verification");
  const dbName = `tba_brooch_verify_${crypto.randomBytes(8).toString("hex")}`;
  const uri = new URL(process.env.MONGODB_URI);
  uri.pathname = `/${dbName}`;
  let owned = false;
  try {
    await mongoose.connect(uri.toString(), { serverSelectionTimeoutMS: 10000 });
    if (mongoose.connection.name !== dbName) throw new Error("Isolated database guard failed");
    const counts = await Promise.all([
      Category.countDocuments(), Product.countDocuments(), Order.countDocuments(), SkuCounter.countDocuments(), CategoryPricingConfig.countDocuments(),
    ]);
    if (counts.some(Boolean)) throw new Error("Isolated database is not empty");
    owned = true;
    await Promise.all([Category.init(), Product.init()]);
    const root = await Category.create({ name: "Diamond", metal: "gold", categoryKind: "metal-root" });
    const brooch = await Category.create({ name: "Diamond brooch", metal: "gold", categoryKind: "subcategory", parent: root._id, shortCode: "BH" });
    const other = await Category.create({ name: "Other test", metal: "gold", categoryKind: "subcategory", parent: root._id, shortCode: "ZZ" });
    const createProduct = (SKU, category) => Product.create({
      SKU, slug: `test-${SKU.toLowerCase()}`, title: `Test ${SKU}`, metal: "gold",
      mainCategory: root._id, subCategory: category._id,
      images: [{ url: "https://example.com/test.jpg", source: "link" }],
      grossWeight: { "14kt": 1, "18kt": 1 },
      netWeight: { "14kt": 1, "18kt": 1 }, totalNumberOfDiamonds: 0,
    });
    await createProduct("TBA-GLD-BH0009", brooch);
    await createProduct("TBA-GLD-BH-0012", brooch);
    // A deleted product can still appear in an order; its SKU stays reserved.
    await Order.create({ customer: new mongoose.Types.ObjectId(), amount: 0, items: [{ productSku: "TBA-GLD-BH0015" }] });
    const reserved = await Promise.all(Array.from({ length: 20 }, () => nextProductSku("gold", brooch._id)));
    const numbers = reserved.map((sku) => Number(sku.match(/\d+$/)[0]));
    if (new Set(reserved).size !== 20 || Math.min(...numbers) !== 16 || Math.max(...numbers) !== 35)
      throw new Error("Concurrent SKU reservations failed");
    await Promise.all(reserved.map((sku) => createProduct(sku, brooch)));
    const found = await Product.findOne({ SKU: reserved[0] });
    if (!found || String(found.subCategory) !== String(brooch._id)) throw new Error("Product lookup or category failed");
    await Product.findByIdAndUpdate(found._id, { description: "Edited" });
    if ((await Product.findById(found._id)).SKU !== reserved[0]) throw new Error("Edit changed SKU");
    await mongoose.disconnect();
    await mongoose.connect(uri.toString(), { serverSelectionTimeoutMS: 10000 });
    const afterRestart = await nextProductSku("gold", brooch._id);
    if (afterRestart !== "TBA-GLD-BH0036") throw new Error(`Restart sequence failed: ${afterRestart}`);
    await createProduct("TBA-GLD-ZZ0999", other);
    const above999 = await nextProductSku("gold", other._id);
    const above1000 = await nextProductSku("gold", other._id);
    if (above999 !== "TBA-GLD-ZZ1000" || above1000 !== "TBA-GLD-ZZ1001")
      throw new Error("Numbering beyond 999 failed");
    await CategoryPricingConfig.create({ key: "GOLD_STANDARD", metal: "gold", categoryType: "Standard", makingRatePerGram: 0, weightBasis: "net", certificateApplies: false });
    global.TBA_METAL_RATES = { B2C: { gold24kt: 100000, makingRatePerGram: 100, certificateRatePerGram: 0 } };
    const call = (handler, req) => new Promise((resolve, reject) => handler(req, {
      status(code) { this.statusCode = code; return this; },
      json(value) { resolve(value); },
    }, reject));
    const created = await call(productController.createProduct, { body: {
      title: "Controller brooch test", metal: "gold", mainCategory: root._id,
      subCategory: brooch._id, colors: ["Yellow Gold"],
      images: [{ url: "https://example.com/controller.jpg", source: "link", slot: 1 }],
      grossWeight: { "14kt": 1, "18kt": 1 }, totalNumberOfDiamonds: 0,
    } });
    if (!/^TBA-GLD-BH[0-9]+$/.test(created.data.SKU)) throw new Error("Controller create did not generate BH SKU");
    const edited = await call(productController.updateProduct, {
      params: { productId: String(created.data._id) }, body: { description: "Edited via controller" },
    });
    if (edited.data.SKU !== created.data.SKU || edited.data.description !== "Edited via controller")
      throw new Error("Controller edit changed SKU or lost description");
    const searched = await call(productController.adminListProducts, { query: { search: created.data.SKU } });
    if (!searched.data.some((product) => product.SKU === created.data.SKU))
      throw new Error("Controller search did not find the brooch product");
    const filtered = await call(productController.listGoldProducts, {
      query: { subCategory: String(brooch._id), search: created.data.SKU },
    });
    if (filtered.data.length !== 1 || filtered.data[0].SKU !== created.data.SKU)
      throw new Error("Public category filter did not find the brooch product");
    console.log(JSON.stringify({ result: "PASS", concurrentProducts: 20, firstSku: "TBA-GLD-BH0016", afterRestart, above999, above1000, controllerSku: created.data.SKU, searchFound: true, publicFilterFound: true, filteredCount: await Product.countDocuments({ subCategory: brooch._id }) }));
  } finally {
    if (owned && mongoose.connection.readyState === 1 && mongoose.connection.name === dbName) {
      await mongoose.connection.dropDatabase();
      console.log(`Removed isolated test database ${dbName}`);
    }
    await mongoose.disconnect();
  }
};
run().catch((error) => { console.error(error.message); process.exitCode = 1; });
