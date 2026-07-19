const express = require("express");
const { listProducts, getCategories, getProduct } = require("../controllers/product.controller");
const router = express.Router();
router.get("/categories", getCategories);
router.get("/", listProducts);
router.get("/:identifier", getProduct);
module.exports = router;