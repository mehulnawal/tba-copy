const express = require("express");
const {
  folderCreated,
} = require("../controllers/googleCadIntegration.controller");
const router = express.Router();
router.post("/google-cad/folder-created", folderCreated);
module.exports = router;
