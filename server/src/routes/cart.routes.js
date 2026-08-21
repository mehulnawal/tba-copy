const express = require("express");
const {
  getCart,
  addToCart,
  updateCartItem,
  setCategoryCoupon,
  removeFromCart,
  clearCart,
} = require("../controllers/cart.controller");
const { authenticate } = require("../middlewares/auth.middleware");

const router = express.Router();

router.use(authenticate);

router.get("/", getCart);
router.post("/", addToCart);
router.patch("/category-coupon", setCategoryCoupon);
router.patch("/:itemId", updateCartItem);
router.delete("/:itemId", removeFromCart);
router.delete("/", clearCart);

module.exports = router;
