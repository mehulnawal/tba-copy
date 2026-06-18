const jwt = require("jsonwebtoken");

const generateAccessToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRY || "15m",
  });
};

const generateRefreshToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRY || "7d",
  });
};

const generateAdminAccessToken = (adminId) => {
  return jwt.sign({ id: adminId }, process.env.JWT_ADMIN_ACCESS_SECRET, {
    expiresIn: process.env.JWT_ADMIN_ACCESS_EXPIRY || "15m",
  });
};

const generateAdminRefreshToken = (adminId) => {
  return jwt.sign({ id: adminId }, process.env.JWT_ADMIN_REFRESH_SECRET, {
    expiresIn: process.env.JWT_ADMIN_REFRESH_EXPIRY || "7d",
  });
};

const verifyAccessToken = (token) => {
  return jwt.verify(token, process.env.JWT_ACCESS_SECRET);
};

const verifyRefreshToken = (token) => {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
};

const verifyAdminAccessToken = (token) => {
  return jwt.verify(token, process.env.JWT_ADMIN_ACCESS_SECRET);
};

const verifyAdminRefreshToken = (token) => {
  return jwt.verify(token, process.env.JWT_ADMIN_REFRESH_SECRET);
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  generateAdminAccessToken,
  generateAdminRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  verifyAdminAccessToken,
  verifyAdminRefreshToken,
};
