const express = require("express");
const { getActiveBanners } = require("../controllers/banner.controller");

const router = express.Router();

router.get("/", getActiveBanners);

module.exports = router;
