const User = require("../models/user.model");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const { verifyAdminAccessToken } = require("../utils/tokenUtils");
const { ADMIN_ROLES, ROLES } = require("../constants/roles");

const authenticateAdmin = asyncHandler(async (req, res, next) => {
  const token = req.cookies?.adminAccessToken;

  if (!token) {
    throw new ApiError(401, "Admin authentication required");
  }

  let decoded;
  try {
    decoded = verifyAdminAccessToken(token);
  } catch {
    throw new ApiError(401, "Invalid or expired admin access token");
  }

  const admin = await User.findById(decoded.id).select("-password");

  if (!admin) {
    throw new ApiError(401, "Admin not found");
  }

  if (!ADMIN_ROLES.includes(admin.role)) {
    throw new ApiError(403, "Admin access denied");
  }

  if (admin.isBlocked) {
    throw new ApiError(403, "Your admin account has been blocked");
  }

  req.admin = admin;
  next();
});

const authorizeAdminRoles = (...roles) =>
  asyncHandler(async (req, res, next) => {
    if (!req.admin) {
      throw new ApiError(401, "Admin authentication required");
    }

    if (!roles.includes(req.admin.role)) {
      throw new ApiError(403, "Insufficient admin permissions");
    }

    next();
  });

const requireAdmin = authorizeAdminRoles(ROLES.ADMIN, ROLES.SUPER_ADMIN);

const requireSuperAdmin = authorizeAdminRoles(ROLES.SUPER_ADMIN);

module.exports = {
  authenticateAdmin,
  authorizeAdminRoles,
  requireAdmin,
  requireSuperAdmin,
};
