const express = require("express");
const { getActiveAnnouncements } = require("../controllers/announcement.controller");

const router = express.Router();

router.get("/", getActiveAnnouncements);

module.exports = router;
