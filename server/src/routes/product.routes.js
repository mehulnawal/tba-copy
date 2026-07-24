const express = require("express");
const { listProducts, listGoldProducts, listSilverProducts, getProduct } = require("../controllers/product.controller");
const router = express.Router();
router.get("/gold", listGoldProducts);
router.get("/silver", listSilverProducts);
router.get("/", listProducts);
router.get("/:identifier", getProduct);
module.exports = router;