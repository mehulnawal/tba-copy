import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  let cachedRates: any = null;
  let cacheExpiry = 0;

  app.get("/api/gold-price", async (req, res) => {
    res.set("Cache-Control", "no-store");

    try {
      const now = Date.now();
      if (cachedRates && now < cacheExpiry) {
        return res.json(cachedRates);
      }

      // ── STEP 1: Fetch live USD → INR rate ──────────────────────────────
      let usdToInr = 83.5; // safe fallback if currency API fails
      try {
        const fxResponse = await fetch("https://open.er-api.com/v6/latest/USD");
        if (fxResponse.ok) {
          const fxData = await fxResponse.json();
          usdToInr = fxData.rates?.INR ?? 83.5;
        }
      } catch {
        // currency API failed — silently use fallback 83.5
      }

      // ── STEP 2: Fetch live gold price (XAU in USD per troy ounce) ──────
      const response = await fetch("https://api.gold-api.com/price/XAU");
      if (!response.ok) {
        throw new Error(`Gold API returned status ${response.status}`);
      }
      const data: any = await response.json();
      const price = data.price;

      // ── STEP 3: Calculate per-gram INR rates for each karat ────────────
      // gramsPerOunce = 31.1035 is a physical constant, never changes
      const pricePerGramInr = (price / 31.1035) * usdToInr * 1.1467;

      cachedRates = {
        "9K": Math.round(pricePerGramInr * 0.375), // 37.5% pure gold
        "12K": Math.round(pricePerGramInr * 0.5), // 50.0% pure gold
        "14K": Math.round(pricePerGramInr * 0.5833), // 58.33% pure gold
        "18K": Math.round(pricePerGramInr * 0.75), // 75.0% pure gold
        "22K": Math.round(pricePerGramInr * 0.9167), // 91.67% pure gold
        "24K": Math.round(pricePerGramInr * 0.999), // 99.9% pure gold
        updatedAt: new Date().toISOString(),
        isFallback: false,
        isCachedFallback: false,
      };

      // Cache expires in 5 minutes — matches hook refetchInterval exactly
      cacheExpiry = now + 5 * 60 * 1000;

      return res.json(cachedRates);
    } catch (err: any) {
      console.error("Gold rate fetch failed:", err.message);

      // ── FALLBACK: return cached data if available ───────────────────────
      if (cachedRates) {
        return res.json({
          ...cachedRates,
          updatedAt: new Date().toISOString(),
          isCachedFallback: true,
        });
      }

      // ── LAST RESORT: static fallback with live USD/INR if possible ──────
      // Try to get USD/INR one more time for accurate fallback
      let usdToInr = 83.5;
      try {
        const fxResponse = await fetch("https://open.er-api.com/v6/latest/USD");
        if (fxResponse.ok) {
          const fxData = await fxResponse.json();
          usdToInr = fxData.rates?.INR ?? 83.5;
        }
      } catch {
        // use 83.5
      }

      // 2450 USD/oz is a conservative safe fallback gold price
      const fallbackPricePerGramInr = (2450 / 31.1035) * usdToInr * 1.1467;

      return res.json({
        "9K": Math.round(fallbackPricePerGramInr * 0.375),
        "12K": Math.round(fallbackPricePerGramInr * 0.5),
        "14K": Math.round(fallbackPricePerGramInr * 0.5833),
        "18K": Math.round(fallbackPricePerGramInr * 0.75),
        "22K": Math.round(fallbackPricePerGramInr * 0.9167),
        "24K": Math.round(fallbackPricePerGramInr * 0.999),
        updatedAt: new Date().toISOString(),
        isFallback: true,
        isCachedFallback: false,
      });
    }
  });

  // ── Vite middleware (dev) or static files (prod) ──────────────────────────
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
