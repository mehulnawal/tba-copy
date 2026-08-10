require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });
const connectDB = require("../src/database/connectDB");
const Product = require("../src/models/product.model");
const DiamondCategory = require("../src/models/diamondCategory.model");

const sameNumber = (left, right) => Number(left) === Number(right);

const run = async () => {
  await connectDB();
  const categories = await DiamondCategory.find({}).lean();
  const products = await Product.find({ "diamonds.0": { $exists: true } });
  let linked = 0;
  let ambiguous = 0;

  for (const product of products) {
    let changed = false;
    for (const entry of product.diamonds) {
      if (entry.diamondCategoryRef) continue;
      const matches = categories.filter((category) =>
        category.categoryName === entry.category &&
        sameNumber(category.b2bPrice, entry.ratePerCtB2B ?? entry.ratePerCt) &&
        sameNumber(category.b2cPrice, entry.ratePerCtB2C ?? entry.ratePerCt)
      );
      if (matches.length === 1) {
        entry.diamondCategoryRef = matches[0]._id;
        linked += 1;
        changed = true;
      } else if (matches.length > 1) {
        ambiguous += 1;
      }
    }
    if (changed) await product.save();
  }

  console.log(JSON.stringify({ linked, ambiguous }, null, 2));
  process.exit(0);
};

run().catch((error) => { console.error(error); process.exit(1); });
