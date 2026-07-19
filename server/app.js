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
const goldRateRoutes = require("./src/routes/goldRate.routes");
const productRoutes = require("./src/routes/product.routes");
const reviewRoutes = require("./src/routes/review.routes");
const orderRoutes = require("./src/routes/order.routes");
const errorHandler = require("./src/middlewares/error.middleware");
const { apiLimiter } = require("./src/middlewares/rateLimiter.middleware");
const ApiError = require("./src/utils/ApiError");

const app = express();

app.set("trust proxy", 1);

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
);

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  }),
);

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
app.use("/api/v1/gold-rates", goldRateRoutes);
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/reviews", reviewRoutes);
app.use("/api/v1/orders", orderRoutes);

app.use((req, res, next) => {
  next(new ApiError(404, `Route ${req.originalUrl} not found`));
});

app.use(errorHandler);

module.exports = app;
