const User = require("../models/user.model");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");
const {
  generateAdminAccessToken,
  generateAdminRefreshToken,
  verifyAdminRefreshToken,
} = require("../utils/tokenUtils");
const {
  accessTokenCookieOptions,
  refreshTokenCookieOptions,
  clearCookieOptions,
} = require("../utils/cookieUtils");
const { ADMIN_ROLES, ROLES } = require("../constants/roles");

const setAdminAuthCookies = (res, adminId) => {
  const accessToken = generateAdminAccessToken(adminId);
  const refreshToken = generateAdminRefreshToken(adminId);

  res.cookie("adminAccessToken", accessToken, accessTokenCookieOptions);
  res.cookie("adminRefreshToken", refreshToken, refreshTokenCookieOptions);
};

const clearAdminAuthCookies = (res) => {
  res.cookie("adminAccessToken", "", clearCookieOptions);
  res.cookie("adminRefreshToken", "", clearCookieOptions);
};

const formatAdminResponse = (admin) => ({
  id: admin._id,
  name: admin.name,
  email: admin.email,
  role: admin.role,
});

const adminLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }

  const admin = await User.findOne({ email: email.toLowerCase() }).select("+password");

  if (!admin || !(await admin.comparePassword(password))) {
    throw new ApiError(401, "Invalid admin credentials");
  }

  if (!ADMIN_ROLES.includes(admin.role)) {
    throw new ApiError(403, "Admin access denied");
  }

  if (admin.isBlocked) {
    throw new ApiError(403, "Your admin account has been blocked");
  }

  setAdminAuthCookies(res, admin._id);

  res.status(200).json(
    new ApiResponse(200, formatAdminResponse(admin), "Admin logged in successfully"),
  );
});

const adminLogout = asyncHandler(async (req, res) => {
  clearAdminAuthCookies(res);
  res.status(200).json(new ApiResponse(200, null, "Admin logged out successfully"));
});

const adminRefreshToken = asyncHandler(async (req, res) => {
  const token = req.cookies?.adminRefreshToken;

  if (!token) {
    throw new ApiError(401, "Admin refresh token not found");
  }

  let decoded;
  try {
    decoded = verifyAdminRefreshToken(token);
  } catch {
    throw new ApiError(401, "Invalid or expired admin refresh token");
  }

  const admin = await User.findById(decoded.id);

  if (!admin || !ADMIN_ROLES.includes(admin.role) || admin.isBlocked) {
    throw new ApiError(401, "Admin session is no longer valid");
  }

  setAdminAuthCookies(res, admin._id);

  res.status(200).json(
    new ApiResponse(200, formatAdminResponse(admin), "Admin session refreshed"),
  );
});

const getAdminMe = asyncHandler(async (req, res) => {
  res.status(200).json(
    new ApiResponse(200, formatAdminResponse(req.admin), "Admin fetched successfully"),
  );
});

module.exports = {
  adminLogin,
  adminLogout,
  adminRefreshToken,
  getAdminMe,
};
