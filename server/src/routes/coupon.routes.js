const express = require("express");
const {
  validateCoupon,
  listPublicCoupons,
} = require("../controllers/coupon.controller");

const router = express.Router();

router.get("/", listPublicCoupons);

router.post("/validate", validateCoupon);

module.exports = router;
