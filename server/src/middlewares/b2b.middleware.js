const jwt = require("jsonwebtoken");
const B2BAccess = require("../models/b2bAccess.model");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const B2B_COOKIE = "b2bAccessToken";
const secret = () => process.env.JWT_B2B_ACCESS_SECRET || process.env.JWT_ACCESS_SECRET;
const requireB2BAccess = asyncHandler(async (req, res, next) => {
  const token = req.cookies?.[B2B_COOKIE];
  if (!token) throw new ApiError(401, "B2B access password required");
  let decoded;
  try { decoded = jwt.verify(token, secret()); } catch { throw new ApiError(401, "B2B session is invalid or expired"); }
  const access = await B2BAccess.findOne({ key: "current" }).select("+passwordHash");
  if (!access?.isActive || decoded.version !== access.sessionVersion) throw new ApiError(401, "B2B access has been revoked");
  req.b2bAccess = access;
  req.b2b = decoded;
  next();
});
module.exports = { requireB2BAccess, B2B_COOKIE, b2bSecret: secret };