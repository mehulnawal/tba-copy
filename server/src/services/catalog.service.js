const { calculatePrice } = require("../utils/priceCalculator");
const { hydrateLiveDiamondEntryRates } = require("../utils/diamondPricing");
const slugify = (value) =>
  String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
const toProductResponse = async (doc, buyerOverride) => {
  const rawProduct = doc.toObject ? doc.toObject() : doc;
  const product = await hydrateLiveDiamondEntryRates(rawProduct);
  const buyer = buyerOverride || product.buyerType || "B2C";
  const karats = product.metal === "silver" ? [undefined] : ["14kt", "18kt"];
  const displayTitle = String(product.title || "").replace(
    /Moisaanite/gi,
    "Moissanite",
  );
  return {
    ...product,
    title: displayTitle,
    id: String(product._id),
    Title: displayTitle,
    Description: product.description,
    Category: product.subCategory?.name || "",
    "image_link-1": product.images?.[0]?.url || "",
    "image_link-2": product.images?.[1]?.url || "",
    "image_link-3": product.images?.[2]?.url || "",
    Is_Best_Seller: product.isBestSeller,
    Is_New_Product: product.isNewProduct,
    prices: await Promise.all(
      karats.map(async (karat) => {
        const price = await calculatePrice(product, karat, buyer);
        if (String(buyer).toUpperCase() !== "B2B") return price;
        const b2cPrice = await calculatePrice(product, karat, "B2C");
        return {
          ...price,
          b2bFinalPrice: price.finalPrice,
          b2cFinalPrice: b2cPrice.finalPrice,
        };
      }),
    ),
  };
};
module.exports = { toProductResponse, slugify };
