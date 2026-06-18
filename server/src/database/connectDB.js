const mongoose = require("mongoose");

const connectDB = async () => {
  const conn = await mongoose.connect(process.env.MONGODB_URI);
  return conn;
};

module.exports = connectDB;
