const express = require("express");
const {
  adminLogin,
  adminLogout,
  adminRefreshToken,
  getAdminMe,
} = require("../controllers/admin.auth.controller");
const {
  createBanner,
  updateBanner,
  deleteBanner,
  listBanners,
  activateBanner,
  deactivateBanner,
} = require("../controllers/banner.controller");
const {
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  listAnnouncements,
  activateAnnouncement,
  deactivateAnnouncement,
} = require("../controllers/announcement.controller");
const {
  createCoupon,
  updateCoupon,
  deleteCoupon,
  listCoupons,
} = require("../controllers/coupon.controller");
const {
  listUsers,
  blockUser,
  unblockUser,
} = require("../controllers/admin.user.controller");
const {
  authenticateAdmin,
  requireAdmin,
  requireSuperAdmin,
} = require("../middlewares/admin.middleware");
const upload = require("../middlewares/upload.middleware");
const { authLimiter } = require("../middlewares/rateLimiter.middleware");
const { listOrders } = require("../controllers/admin.order.controller");
const {
  listAdmin,
  create: createCategory,
  update: updateCategory,
  remove: deleteCategory,
} = require("../controllers/category.controller");
const {
  get: getMetalRates,
  update: updateMetalRates,
} = require("../controllers/metalRate.controller");
const {
  adminList,
  moderate,
  remove: removeReview,
} = require("../controllers/review.controller");

const { adminListProducts, adminGetProduct, createProduct, updateProduct, deleteProduct, previewPrice, uploadImageHandler } = require("../controllers/product.controller");

const router = express.Router();

router.post("/auth/login", authLimiter, adminLogin);
router.post("/auth/logout", adminLogout);
router.post("/auth/refresh", adminRefreshToken);
router.get("/auth/me", authenticateAdmin, getAdminMe);

router.use(authenticateAdmin, requireAdmin);

router.get("/banners", listBanners);
router.post("/banners", upload.single("image"), createBanner);
router.patch("/banners/:bannerId", upload.single("image"), updateBanner);
router.delete("/banners/:bannerId", deleteBanner);
router.patch("/banners/:bannerId/activate", activateBanner);
router.patch("/banners/:bannerId/deactivate", deactivateBanner);

router.get("/announcements", listAnnouncements);
router.post("/announcements", createAnnouncement);
router.patch("/announcements/:announcementId", updateAnnouncement);
router.delete("/announcements/:announcementId", deleteAnnouncement);
router.patch("/announcements/:announcementId/activate", activateAnnouncement);
router.patch(
  "/announcements/:announcementId/deactivate",
  deactivateAnnouncement,
);

router.get("/coupons", listCoupons);
router.post("/coupons", createCoupon);
router.patch("/coupons/:couponId", updateCoupon);
router.delete("/coupons/:couponId", deleteCoupon);

router.get("/orders", listOrders);
router.post("/upload-image", upload.single("image"), uploadImageHandler);
router.post("/products/preview-price", previewPrice);
router.get("/products", adminListProducts);
router.get("/products/:productId", adminGetProduct);
router.post("/products", createProduct);
router.patch("/products/:productId", updateProduct);
router.delete("/products/:productId", deleteProduct);

router.get("/categories", listAdmin);
router.post("/categories", createCategory);
router.patch("/categories/:categoryId", updateCategory);
router.delete("/categories/:categoryId", deleteCategory);
router.get("/metal-rates", getMetalRates);
router.put("/metal-rates", updateMetalRates);
router.get("/reviews", adminList);
router.patch("/reviews/:reviewId", moderate);
router.delete("/reviews/:reviewId", removeReview);

router.get("/users", listUsers);
router.patch("/users/:userId/block", blockUser);
router.patch("/users/:userId/unblock", unblockUser);

module.exports = router;
