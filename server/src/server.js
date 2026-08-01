require("dotenv").config();

const app = require("../app");
const connectDB = require("./database/connectDB");
const {
  initialize: initializeMetalRates,
} = require("./controllers/metalRate.controller");
const {
  initializeCategoryStructure,
} = require("./controllers/category.controller");
const { initializePricingConfigs } = require("./config/pricingConfigBootstrap");
const { synchronizeCertificates } = require("./config/certificates");

const startServer = async () => {
  await connectDB();
  await initializeMetalRates();
  await initializePricingConfigs();
  await synchronizeCertificates();
  // await initializeCategoryStructure();
  const PORT = process.env.PORT || 8000;
  app.listen(PORT, () =>
    process.stdout.write(`TBA server running on port ${PORT}\n`),
  );
};

startServer().catch((error) => {
  process.stderr.write(`Failed to start server: ${error.message}\n`);
  process.exit(1);
});
