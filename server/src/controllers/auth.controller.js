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
const { verifyGoogleAccessToken } = require("../utils/oauthUtils");
const { verifyFacebookToken } = require("../utils/facebookOAuthUtils");
const { ROLES } = require("../constants/roles");
const { startOtpSession, resendOtpSession, verifyOtpSession } = require("../utils/otpSession");


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

  res
    .status(201)
    .json(
      new ApiResponse(
        201,
        formatUserResponse(user),
        "Account created successfully",
      ),
    );
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select(
    "+password",
  );

  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, "Invalid email or password");
  }

  if (user.isBlocked) {
    throw new ApiError(403, "Your account has been blocked");
  }


  setAuthCookies(res, user._id);

  res
    .status(200)
    .json(
      new ApiResponse(200, formatUserResponse(user), "Logged in successfully"),
    );
});

const startOtp = asyncHandler(async (req, res) => {
  const { requestId, resendAvailableAt } = await startOtpSession(req.body?.mobile);
  res.json(new ApiResponse(200, { requestId, resendAvailableAt }, "OTP sent"));
});

const resendOtp = asyncHandler(async (req, res) => {
  const result = await resendOtpSession(req.body?.mobile, String(req.body?.requestId || ""));
  res.json(new ApiResponse(200, { requestId: result.requestId, resendCount: result.resendCount, resendAvailableAt: result.resendAvailableAt }, "OTP resent"));
});

const otpLogin = asyncHandler(async (req, res) => {
  const mobile = await verifyOtpSession(req.body?.mobile, req.body?.otp, String(req.body?.requestId || ""));
  const phoneVariants = [mobile, `91${mobile}`, `+91${mobile}`];
  let user = await User.findOne({ phone: { $in: phoneVariants } });
  if (!user) user = await User.create({ name: "TBA Customer", email: `otp-${mobile}@tba.local`, password: crypto.randomBytes(32).toString("hex"), phone: `91${mobile}`, role: ROLES.USER });
  if (user.isBlocked) throw new ApiError(403, "Your account has been blocked");
  setAuthCookies(res, user._id);
  res.status(200).json(new ApiResponse(200, formatUserResponse(user), "OTP login successful"));
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

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        formatUserResponse(user),
        "Session refreshed successfully",
      ),
    );
});

const getMe = asyncHandler(async (req, res) => {
  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        formatUserResponse(req.user),
        "User fetched successfully",
      ),
    );
});

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw new ApiError(400, "Email is required");
  }

  const user = await User.findOne({ email: email.toLowerCase() });

  if (!user) {
    res
      .status(200)
      .json(
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

  const clientUrl = (process.env.CLIENT_URL || "http://localhost:5173").replace(/\/+$/, "");
  const resetUrl = `${clientUrl}/reset-password?token=${encodeURIComponent(resetToken)}`;
  const emailText = `Hello,

We received a request to reset the password for your TBA – The Brilliance Atelier account.

Reset your password using this secure link (valid for 15 minutes):
${resetUrl}

If you did not request a password reset, you can safely ignore this email. Your password will remain unchanged.

TBA – The Brilliance Atelier`;
  const emailHtml = `<!doctype html>
<html lang="en">
  <body style="margin:0;padding:0;background:#f7f5f1;color:#172f2b;font-family:Arial,sans-serif;">
    <div style="max-width:600px;margin:32px auto;background:#ffffff;border:1px solid #e6e0d8;">
      <div style="padding:28px 32px;border-bottom:1px solid #e6e0d8;">
        <p style="margin:0;color:#7f6a43;font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">TBA</p>
        <h1 style="margin:12px 0 0;font-family:Georgia,serif;font-size:28px;font-weight:400;">Reset your password</h1>
      </div>
      <div style="padding:32px;line-height:1.6;font-size:15px;">
        <p>Hello,</p>
        <p>We received a request to reset the password for your TBA – The Brilliance Atelier account.</p>
        <p style="margin:28px 0;text-align:center;"><a href="${resetUrl}" style="display:inline-block;background:#173d36;color:#ffffff;padding:14px 24px;text-decoration:none;font-size:13px;font-weight:700;letter-spacing:1px;text-transform:uppercase;">Reset password</a></p>
        <p>This secure link expires in <strong>15 minutes</strong>.</p>
        <p>If you did not request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>
        <p style="margin:28px 0 0;color:#6b7280;font-size:12px;word-break:break-all;">If the button does not work, copy and paste this link into your browser:<br><a href="${resetUrl}" style="color:#173d36;">${resetUrl}</a></p>
      </div>
    </div>
  </body>
</html>`;

  try {
    await sendEmail({
      to: user.email,
      subject: "Reset your TBA password",
      text: emailText,
      html: emailHtml,
    });
  } catch (error) {
    console.error("EMAIL ERROR:", error);

    user.resetPasswordToken = null;
    user.resetPasswordExpire = null;
    await user.save({ validateBeforeSave: false });

    throw new ApiError(
      503,
      "Unable to send reset email. Please try again later.",
    );
  }

  res
    .status(200)
    .json(
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

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        formatUserResponse(user),
        "Password reset successfully",
      ),
    );
});

const googleLogin = asyncHandler(async (req, res) => {
  const { accessToken } = req.body;
  if (!accessToken) {
    throw new ApiError(400, "Google access token is required");
  }

  if (!process.env.GOOGLE_CLIENT_ID) {
    throw new ApiError(503, "Google login is not configured yet");
  }

  const profile = await verifyGoogleAccessToken(accessToken);

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

  res
    .status(200)
    .json(
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
    throw new ApiError(
      401,
      "Unable to verify Facebook account. Email permission required.",
    );
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

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        formatUserResponse(user),
        "Facebook login successful",
      ),
    );
});

module.exports = {
  register,
  login,
  startOtp,
  resendOtp,
  otpLogin,
  logout,
  refreshToken,
  getMe,
  forgotPassword,
  resetPassword,
  googleLogin,
  facebookLogin,
};
