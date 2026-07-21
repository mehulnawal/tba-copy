const express = require("express");
const { getPublic } = require("../controllers/metalRate.controller");
const router = express.Router();
router.get("/", getPublic);
module.exports = router;
