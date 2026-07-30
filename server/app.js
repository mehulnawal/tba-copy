require("dotenv").config();

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const sanitizeRequest = require("./src/middlewares/sanitize.middleware");

const authRoutes = require("./src/routes/auth.routes");
const userRoutes = require("./src/routes/user.routes");
const wishlistRoutes = require("./src/routes/wishlist.routes");
const cartRoutes = require("./src/routes/cart.routes");
const checkoutRoutes = require("./src/routes/checkout.routes");
const couponRoutes = require("./src/routes/coupon.routes");
const bannerRoutes = require("./src/routes/banner.routes");
const announcementRoutes = require("./src/routes/announcement.routes");
const adminRoutes = require("./src/routes/admin.routes");
const metalRateRoutes = require("./src/routes/metalRate.routes");
const productRoutes = require("./src/routes/product.routes");
const reviewRoutes = require("./src/routes/review.routes");
const orderRoutes = require("./src/routes/order.routes");
const categoryRoutes = require("./src/routes/category.routes");
const b2bRoutes = require("./src/routes/b2b.routes");
const errorHandler = require("./src/middlewares/error.middleware");
const { apiLimiter } = require("./src/middlewares/rateLimiter.middleware");
const ApiError = require("./src/utils/ApiError");

const app = express();

app.use((req, res, next) => { res.charset = 'utf-8'; next(); });

app.set("trust proxy", 1);

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
);

const configuredClientOrigins = [process.env.CLIENT_URL, process.env.CLIENT_URL_WWW, process.env.CLIENT_URL_ALT].filter(Boolean); const productionAliases = configuredClientOrigins.flatMap((origin) => { try { const url = new URL(origin); if (!/^(www\.)?thebrillianceatelier\.com$/i.test(url.hostname)) return [url.origin]; const alternate = url.hostname.startsWith("www.") ? "thebrillianceatelier.com" : "www.thebrillianceatelier.com"; return [url.origin, `${url.protocol}//${alternate}`]; } catch { return []; } }); const allowedOrigins = new Set([...configuredClientOrigins, ...productionAliases, "http://localhost:3000", "http://localhost:5173"]);
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.has(origin)) return callback(null, true);
      return callback(new Error("CORS origin not allowed"));
    },
    credentials: true,
  }),
);

app.use("/api/v1/orders/webhook", express.raw({ type: "application/json" }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());
app.use(sanitizeRequest);

app.use("/api/v1", apiLimiter);

app.get("/health", (req, res) => {
  res.status(200).json({ success: true, message: "TBA API is running" });
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/wishlist", wishlistRoutes);
app.use("/api/v1/cart", cartRoutes);
app.use("/api/v1/checkout", checkoutRoutes);
app.use("/api/v1/coupons", couponRoutes);
app.use("/api/v1/banners", bannerRoutes);
app.use("/api/v1/announcements", announcementRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/metal-rates", metalRateRoutes);
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/reviews", reviewRoutes);
app.use("/api/v1/orders", orderRoutes);
app.use("/api/v1/categories", categoryRoutes);
app.use("/api/v1/b2b", b2bRoutes);

app.use((req, res, next) => {
  next(new ApiError(404, `Route ${req.originalUrl} not found`));
});

console.log("Coupon routes mounted");
app.use("/api/v1/coupons", couponRoutes);

app.use(errorHandler);

module.exports = app;
