const express = require("express");
const {
  getCartSummary,
  applyCoupon,
  removeCoupon,
  getOrderSummary,
} = require("../controllers/checkout.controller");
const { authenticate } = require("../middlewares/auth.middleware");

const router = express.Router();

router.use(authenticate);

router.get("/summary", getCartSummary);
router.post("/apply-coupon", applyCoupon);
router.delete("/coupon", removeCoupon);
router.get("/order-summary", getOrderSummary);

module.exports = router;
