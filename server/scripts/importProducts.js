require("dotenv").config();
const connectDB = require("../src/database/connectDB");
const { importCatalog } = require("../src/services/catalog.service");
connectDB().then(importCatalog).then((count) => { process.stdout.write(`Imported ${count} products\n`); process.exit(0); }).catch((error) => { process.stderr.write(`${error.message}\n`); process.exit(1); });