const Product = require("../models/product.model");

const SITE_URL = "https://www.thebrillianceatelier.com";
const STATIC_URLS = [
  "/",
  "/gold-jewellery",
  "/silver-jewellery",
  "/silver-jewellery/polki",
  "/silver-jewellery/moissanite",
];

const XML_ENTITIES = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&apos;",
};

const escapeXml = (value) =>
  String(value).replace(/[&<>"']/g, (character) => XML_ENTITIES[character]);

const toLastmod = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
};

const getSitemap = async (req, res, next) => {
  try {
    const products = await Product.find({ isActive: true })
      .select("slug updatedAt -_id")
      .sort({ updatedAt: -1 })
      .lean();

    const staticEntries = STATIC_URLS.map(
      (path) => `  <url>\n    <loc>${SITE_URL}${path}</loc>\n  </url>`,
    );
    const productEntries = products
      .filter(
        (product) =>
          typeof product.slug === "string" && product.slug.trim().length > 0,
      )
      .map((product) => {
        const lastmod = toLastmod(product.updatedAt);
        return [
          "  <url>",
          `    <loc>${SITE_URL}/product/${escapeXml(product.slug)}</loc>`,
          ...(lastmod ? [`    <lastmod>${lastmod}</lastmod>`] : []),
          "  </url>",
        ].join("\n");
      });

    const xml = [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
      ...staticEntries,
      ...productEntries,
      "</urlset>",
    ].join("\n");

    res.type("application/xml").status(200).send(xml);
  } catch (error) {
    console.error("Unable to generate sitemap", error);
    next(error);
  }
};

module.exports = { getSitemap };
