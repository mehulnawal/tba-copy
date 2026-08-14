const axios = require("axios");
const ApiError = require("./ApiError");

const VERIFY_URL = "https://control.msg91.com/api/v5/widget/verifyAccessToken";

const verifyMsg91AccessToken = async (accessToken) => {
  if (!accessToken || typeof accessToken !== "string") {
    throw new ApiError(400, "MSG91 verification token is required");
  }
  if (!process.env.MSG91_AUTH_KEY) {
    throw new ApiError(503, "MSG91 OTP verification is not configured");
  }

  try {
    const { data } = await axios.post(
      VERIFY_URL,
      { authkey: process.env.MSG91_AUTH_KEY, "access-token": accessToken },
      { headers: { "Content-Type": "application/json", Accept: "application/json" }, timeout: 10000 },
    );
    const successful = data?.success === true || data?.type === "success" || data?.status === "success" || data?.data?.success === true;
    if (!successful) throw new ApiError(401, "OTP verification failed");
    return data;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(502, "Unable to verify OTP at this time");
  }
};

module.exports = { verifyMsg91AccessToken };