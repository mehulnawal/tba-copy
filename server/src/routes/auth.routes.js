const express = require("express");
const {
  register,
  login,
  logout,
  refreshToken,
  getMe,
  forgotPassword,
  resetPassword,
  googleLogin,
  facebookLogin,
} = require("../controllers/auth.controller");
const { authenticate } = require("../middlewares/auth.middleware");
const { authLimiter } = require("../middlewares/rateLimiter.middleware");

const router = express.Router();

router.post("/register", authLimiter, register);
router.post("/login", authLimiter, login);
router.post("/logout", logout);
router.post("/refresh", refreshToken);
router.get("/me", authenticate, getMe);
router.post("/forgot-password", authLimiter, forgotPassword);
router.post("/reset-password", authLimiter, resetPassword);
router.post("/google", authLimiter, googleLogin);
router.post("/facebook", authLimiter, facebookLogin);

module.exports = router;
