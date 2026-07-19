const express = require("express");
const { getGoldRates } = require("../controllers/goldRate.controller");

const router = express.Router();

router.get("/", getGoldRates);

module.exports = router;
