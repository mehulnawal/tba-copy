const ApiError = require("./ApiError");
const { sendMsg91Otp, retryMsg91Otp, verifyMsg91Otp } = require("./msg91Otp");
const { verifyMsg91AccessToken } = require("./msg91");

const OTP_RESEND_DELAY_MS = 20 * 1000;
const OTP_EXPIRY_MS = 15 * 60 * 1000;
const OTP_RESEND_LIMIT = 2;
const attempts = new Map();

const indianMobile = (value) => String(value || "").replace(/\D/g, "").replace(/^91(?=\d{10}$)/, "");
const validMobile = (mobile) => /^\d{10}$/.test(mobile);
const attemptFor = (requestId, mobile) => {
  const attempt = attempts.get(requestId);
  if (!attempt || attempt.mobile !== mobile || attempt.expiresAt <= Date.now()) {
    if (attempt?.expiresAt <= Date.now()) attempts.delete(requestId);
    throw new ApiError(400, "OTP request is invalid or has expired");
  }
  return attempt;
};
const remember = (requestId, mobile, resends = 0) => {
  const attempt = { mobile, resends, expiresAt: Date.now() + OTP_EXPIRY_MS, resendAvailableAt: Date.now() + OTP_RESEND_DELAY_MS };
  attempts.set(requestId, attempt);
  return attempt;
};

const startOtpSession = async (value) => {
  const mobile = indianMobile(value);
  if (!validMobile(mobile)) throw new ApiError(400, "A valid 10-digit Indian mobile number is required");
  const requestId = await sendMsg91Otp(`91${mobile}`);
  const attempt = remember(requestId, mobile);
  return { mobile, requestId, resendAvailableAt: attempt.resendAvailableAt };
};

const resendOtpSession = async (value, requestId) => {
  const mobile = indianMobile(value);
  if (!validMobile(mobile) || !requestId) throw new ApiError(400, "A valid OTP request is required");
  const attempt = attemptFor(requestId, mobile);
  if (attempt.resends >= OTP_RESEND_LIMIT) throw new ApiError(429, "OTP resend limit reached");
  const retryAfter = attempt.resendAvailableAt - Date.now();
  if (retryAfter > 0) throw new ApiError(429, `Please wait ${Math.ceil(retryAfter / 1000)} seconds before resending OTP`);
  const nextRequestId = await retryMsg91Otp(requestId);
  attempts.delete(requestId);
  const nextAttempt = remember(nextRequestId, mobile, attempt.resends + 1);
  return { mobile, requestId: nextRequestId, resendCount: nextAttempt.resends, resendAvailableAt: nextAttempt.resendAvailableAt };
};

const verifyOtpSession = async (value, otp, requestId) => {
  const mobile = indianMobile(value);
  if (!validMobile(mobile)) throw new ApiError(400, "A valid 10-digit Indian mobile number is required");
  if (!/^\d{6}$/.test(String(otp || "")) || !requestId) throw new ApiError(400, "Enter the six-digit OTP");
  attemptFor(requestId, mobile);
  const accessToken = await verifyMsg91Otp(String(otp), requestId);
  await verifyMsg91AccessToken(accessToken);
  attempts.delete(requestId);
  return mobile;
};

module.exports = { startOtpSession, resendOtpSession, verifyOtpSession, indianMobile };
