require("dotenv").config();

const app = require("../app");
const connectDB = require("./database/connectDB");
const User = require("./models/user.model");
const { ROLES } = require("./constants/roles");

const seedAdmin = async () => {
  const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;

  if (!ADMIN_EMAIL || !ADMIN_PASSWORD || ADMIN_PASSWORD === "CHANGE_ME") {
    return;
  }

  const existingAdmin = await User.findOne({
    email: ADMIN_EMAIL.toLowerCase(),
  });

  if (existingAdmin) {
    return;
  }

  await User.create({
    name: ADMIN_NAME || "Admin",
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    role: ROLES.ADMIN,
  });
};

const startServer = async () => {
  await connectDB();
  await seedAdmin();

  const PORT = process.env.PORT || 8000;

  app.listen(PORT, () => {
    process.stdout.write(`TBA server running on port ${PORT}\n`);
  });
};

startServer().catch((error) => {
  process.stderr.write(`Failed to start server: ${error.message}\n`);
  process.exit(1);
});
