const isProduction = process.env.NODE_ENV === "production";

const cookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "none" : "lax",
};

const accessTokenCookieOptions = {
  ...cookieOptions,
  maxAge: 15 * 60 * 1000,
};

const refreshTokenCookieOptions = {
  ...cookieOptions,
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

const clearCookieOptions = {
  ...cookieOptions,
  maxAge: 0,
};

module.exports = {
  accessTokenCookieOptions,
  refreshTokenCookieOptions,
  clearCookieOptions,
};
