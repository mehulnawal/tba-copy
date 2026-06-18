const User = require("../models/user.model");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const { verifyAccessToken } = require("../utils/tokenUtils");
const { ROLES } = require("../constants/roles");

const authenticate = asyncHandler(async (req, res, next) => {
  const token = req.cookies?.accessToken;

  if (!token) {
    throw new ApiError(401, "Authentication required");
  }

  let decoded;
  try {
    decoded = verifyAccessToken(token);
  } catch {
    throw new ApiError(401, "Invalid or expired access token");
  }

  const user = await User.findById(decoded.id).select("-password");

  if (!user) {
    throw new ApiError(401, "User not found");
  }

  if (user.isBlocked) {
    throw new ApiError(403, "Your account has been blocked");
  }

  req.user = user;
  next();
});

const authorizeRoles = (...roles) =>
  asyncHandler(async (req, res, next) => {
    if (!req.user) {
      throw new ApiError(401, "Authentication required");
    }

    if (!roles.includes(req.user.role)) {
      throw new ApiError(403, "You do not have permission to perform this action");
    }

    next();
  });

const requireUser = authorizeRoles(ROLES.USER);

module.exports = {
  authenticate,
  authorizeRoles,
  requireUser,
};
