const axios = require("axios");
const ApiError = require("./ApiError");

const API_BASE = "https://api.msg91.com/api/v5/widget";
const requestIdFrom = (data) => data?.reqId || data?.req_id || data?.requestId || data?.data?.reqId || data?.data?.requestId;
const accessTokenFrom = (data) => data?.["access-token"] || data?.accessToken || data?.token || data?.data?.["access-token"] || data?.data?.accessToken;

const config = () => {
  if (!process.env.MSG91_AUTH_KEY || !process.env.MSG91_WIDGET_ID)
    throw new ApiError(503, "MSG91 OTP service is not configured");
  return { widgetId: process.env.MSG91_WIDGET_ID, authkey: process.env.MSG91_AUTH_KEY };
};

const call = async (path, body) => {
  const { authkey } = config();
  try {
    return (await axios.post(`${API_BASE}/${path}`, body, {
      headers: { authkey, "Content-Type": "application/json", Accept: "application/json" },
      timeout: 10000,
    })).data;
  } catch (error) {
    const message = error.response?.data?.message || error.response?.data?.error || "MSG91 OTP request failed";
    throw new ApiError(error.response?.status === 429 ? 429 : 502, message);
  }
};

const sendMsg91Otp = async (mobile) => {
  const { widgetId } = config();
  const data = await call("sendOtp", { widgetId, identifier: mobile });
  // Temporary diagnostic: remove after the MSG91 callback shape is confirmed.
  console.log("[MSG91] sendOtp raw response:", JSON.stringify(data, null, 2));
  const requestId = requestIdFrom(data);
  if (!requestId) throw new ApiError(502, "MSG91 did not return an OTP request ID");
  return requestId;
};

const retryMsg91Otp = async (requestId) => {
  const { widgetId } = config();
  const data = await call("retryOtp", { widgetId, reqId: requestId, retryChannel: "SMS" });
  return requestIdFrom(data) || requestId;
};

const verifyMsg91Otp = async (otp, requestId) => {
  const { widgetId } = config();
  const data = await call("verifyOtp", { widgetId, otp, reqId: requestId });
  const accessToken = accessTokenFrom(data);
  if (!accessToken) throw new ApiError(401, "Invalid or expired OTP");
  return accessToken;
};

module.exports = { sendMsg91Otp, retryMsg91Otp, verifyMsg91Otp };
