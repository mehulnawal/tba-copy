const crypto = require("crypto");
const User = require("../models/user.model");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} = require("../utils/tokenUtils");
const {
  accessTokenCookieOptions,
  refreshTokenCookieOptions,
  clearCookieOptions,
} = require("../utils/cookieUtils");
const { sendEmail } = require("../utils/emailUtils");
const { verifyGoogleToken } = require("../utils/oauthUtils");
const { verifyFacebookToken } = require("../utils/facebookOAuthUtils");
const { ROLES } = require("../constants/roles");

const setAuthCookies = (res, userId) => {
  const accessToken = generateAccessToken(userId);
  const refreshToken = generateRefreshToken(userId);

  res.cookie("accessToken", accessToken, accessTokenCookieOptions);
  res.cookie("refreshToken", refreshToken, refreshTokenCookieOptions);
};

const clearAuthCookies = (res) => {
  res.cookie("accessToken", "", clearCookieOptions);
  res.cookie("refreshToken", "", clearCookieOptions);
};

const formatUserResponse = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  role: user.role,
});

const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone } = req.body;

  if (!name || !email || !password) {
    throw new ApiError(400, "Name, email, and password are required");
  }

  if (password.length < 8) {
    throw new ApiError(400, "Password must be at least 8 characters");
  }

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    throw new ApiError(409, "Email is already registered");
  }

  const user = await User.create({
    name,
    email,
    password,
    phone: phone || null,
    role: ROLES.USER,
  });

  setAuthCookies(res, user._id);

  res.status(201).json(
    new ApiResponse(201, formatUserResponse(user), "Account created successfully"),
  );
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select("+password");

  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, "Invalid email or password");
  }

  if (user.isBlocked) {
    throw new ApiError(403, "Your account has been blocked");
  }

  if (![ROLES.USER, ROLES.BUSINESS].includes(user.role)) {
    throw new ApiError(403, "Please use the admin login portal");
  }

  setAuthCookies(res, user._id);

  res.status(200).json(
    new ApiResponse(200, formatUserResponse(user), "Logged in successfully"),
  );
});

const logout = asyncHandler(async (req, res) => {
  clearAuthCookies(res);
  res.status(200).json(new ApiResponse(200, null, "Logged out successfully"));
});

const refreshToken = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken;

  if (!token) {
    throw new ApiError(401, "Refresh token not found");
  }

  let decoded;
  try {
    decoded = verifyRefreshToken(token);
  } catch {
    throw new ApiError(401, "Invalid or expired refresh token");
  }

  const user = await User.findById(decoded.id);

  if (!user || user.isBlocked) {
    throw new ApiError(401, "User session is no longer valid");
  }

  setAuthCookies(res, user._id);

  res.status(200).json(
    new ApiResponse(200, formatUserResponse(user), "Session refreshed successfully"),
  );
});

const getMe = asyncHandler(async (req, res) => {
  res.status(200).json(
    new ApiResponse(200, formatUserResponse(req.user), "User fetched successfully"),
  );
});

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw new ApiError(400, "Email is required");
  }

  const user = await User.findOne({ email: email.toLowerCase() });

  if (!user) {
    res.status(200).json(
      new ApiResponse(
        200,
        null,
        "If an account exists with this email, a reset link has been sent",
      ),
    );
    return;
  }

  const resetToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;

  try {
    await sendEmail({
      to: user.email,
      subject: "TBA Password Reset Request",
      html: `
        <p>Hello ${user.name},</p>
        <p>You requested a password reset. Click the link below to reset your password:</p>
        <a href="${resetUrl}">${resetUrl}</a>
        <p>This link expires in 15 minutes.</p>
        <p>If you did not request this, please ignore this email.</p>
      `,
    });
  } catch {
    user.resetPasswordToken = null;
    user.resetPasswordExpire = null;
    await user.save({ validateBeforeSave: false });
    throw new ApiError(503, "Unable to send reset email. Please try again later.");
  }

  res.status(200).json(
    new ApiResponse(
      200,
      null,
      "If an account exists with this email, a reset link has been sent",
    ),
  );
});

const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;

  if (!token || !password) {
    throw new ApiError(400, "Token and new password are required");
  }

  if (password.length < 8) {
    throw new ApiError(400, "Password must be at least 8 characters");
  }

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() },
  }).select("+password");

  if (!user) {
    throw new ApiError(400, "Invalid or expired reset token");
  }

  user.password = password;
  user.resetPasswordToken = null;
  user.resetPasswordExpire = null;
  await user.save();

  setAuthCookies(res, user._id);

  res.status(200).json(
    new ApiResponse(200, formatUserResponse(user), "Password reset successfully"),
  );
});

const googleLogin = asyncHandler(async (req, res) => {
  const { idToken } = req.body;

  if (!idToken) {
    throw new ApiError(400, "Google ID token is required");
  }

  if (!process.env.GOOGLE_CLIENT_ID) {
    throw new ApiError(503, "Google login is not configured yet");
  }

  const profile = await verifyGoogleToken(idToken);

  if (!profile?.email) {
    throw new ApiError(401, "Unable to verify Google account");
  }

  let user = await User.findOne({ email: profile.email.toLowerCase() });

  if (!user) {
    user = await User.create({
      name: profile.name || profile.email.split("@")[0],
      email: profile.email,
      password: crypto.randomBytes(32).toString("hex"),
      role: ROLES.USER,
    });
  }

  if (user.isBlocked) {
    throw new ApiError(403, "Your account has been blocked");
  }

  setAuthCookies(res, user._id);

  res.status(200).json(
    new ApiResponse(200, formatUserResponse(user), "Google login successful"),
  );
});

const facebookLogin = asyncHandler(async (req, res) => {
  const { accessToken } = req.body;

  if (!accessToken) {
    throw new ApiError(400, "Facebook access token is required");
  }

  if (!process.env.FACEBOOK_APP_ID || !process.env.FACEBOOK_APP_SECRET) {
    throw new ApiError(503, "Facebook login is not configured yet");
  }

  const profile = await verifyFacebookToken(accessToken);

  if (!profile?.email) {
    throw new ApiError(401, "Unable to verify Facebook account. Email permission required.");
  }

  let user = await User.findOne({ email: profile.email.toLowerCase() });

  if (!user) {
    user = await User.create({
      name: profile.name || profile.email.split("@")[0],
      email: profile.email,
      password: crypto.randomBytes(32).toString("hex"),
      role: ROLES.USER,
    });
  }

  if (user.isBlocked) {
    throw new ApiError(403, "Your account has been blocked");
  }

  setAuthCookies(res, user._id);

  res.status(200).json(
    new ApiResponse(200, formatUserResponse(user), "Facebook login successful"),
  );
});

module.exports = {
  register,
  login,
  logout,
  refreshToken,
  getMe,
  forgotPassword,
  resetPassword,
  googleLogin,
  facebookLogin,
};
