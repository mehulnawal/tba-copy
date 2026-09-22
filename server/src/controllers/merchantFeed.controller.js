const Product = require("../models/product.model");
const { calculatePrice } = require("../utils/priceCalculator");

const SITE_URL = "https://www.thebrillianceatelier.com";
const BRAND = "The Brilliance Atelier";
const XML_ENTITIES = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&apos;",
};

const escapeXml = (value) =>
  String(value).replace(/[&<>"']/g, (character) => XML_ENTITIES[character]);

const stripHtml = (value) =>
  String(value || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const firstPublicImage = (images) =>
  (Array.isArray(images) ? images : [])
    .map((image) => String(image?.url || "").trim())
    .find((url) => /^https:\/\//i.test(url));

const xmlTag = (name, value) =>
  value === undefined || value === null || value === ""
    ? ""
    : `    <${name}>${escapeXml(value)}</${name}>`;

const buildItem = ({ product, price, imageUrl }) =>
  [
    "  <item>",
    xmlTag("g:id", product._id),
    xmlTag("g:title", product.title),
    xmlTag("g:description", stripHtml(product.description)),
    xmlTag("g:link", `${SITE_URL}/product/${product.slug}`),
    xmlTag("g:image_link", imageUrl),
    xmlTag("g:availability", "in_stock"),
    xmlTag("g:price", `${price.toFixed(2)} INR`),
    xmlTag("g:condition", "new"),
    xmlTag("g:brand", BRAND),
    xmlTag("g:identifier_exists", "no"),
    "  </item>",
  ]
    .filter(Boolean)
    .join("\n");

const merchantFeed = async (req, res, next) => {
  try {
    const products = await Product.find({ isActive: true }).sort({ _id: 1 }).lean();
    const items = [];
    const skipped = {};

    for (const product of products) {
      const title = String(product.title || "").trim();
      const slug = String(product.slug || "").trim();
      const imageUrl = firstPublicImage(product.images);
      if (!title || !slug || !imageUrl) {
        const reason = !title ? "missing_title" : !slug ? "missing_slug" : "missing_public_image";
        skipped[reason] = (skipped[reason] || 0) + 1;
        continue;
      }

      try {
        // The B2C product page starts gold items on 14kt; silver has one live price.
        const livePrice = await calculatePrice(
          product,
          product.metal === "gold" ? "14kt" : undefined,
          "B2C",
        );
        const price = Number(livePrice?.finalPrice);
        if (!Number.isFinite(price) || price <= 0) {
          skipped.invalid_live_price = (skipped.invalid_live_price || 0) + 1;
          continue;
        }
        items.push(buildItem({ product, price, imageUrl }));
      } catch (error) {
        skipped.unpriceable = (skipped.unpriceable || 0) + 1;
        console.warn(`Merchant feed skipped ${product._id}: ${error.message}`);
      }
    }

    const xml = [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">',
      "<channel>",
      `  <title>${BRAND} Product Feed</title>`,
      `  <link>${SITE_URL}</link>`,
      `  <description>${BRAND} active product catalogue</description>`,
      ...items,
      "</channel>",
      "</rss>",
    ].join("\n");

    res
      .type("application/xml")
      .set("X-Merchant-Feed-Products", String(items.length))
      .set("X-Merchant-Feed-Skipped", JSON.stringify(skipped))
      .status(200)
      .send(xml);
  } catch (error) {
    console.error("Unable to generate merchant feed", error);
    next(error);
  }
};

module.exports = { merchantFeed, stripHtml, firstPublicImage, buildItem };
