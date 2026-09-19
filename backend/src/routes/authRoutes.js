const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  getMe
} = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");
const { signupRateLimiter, loginRateLimiter } = require("../middleware/rateLimiter");

router.post("/register", signupRateLimiter, registerUser);
router.post("/login", loginRateLimiter, loginUser);
router.get("/me", protect, getMe);

module.exports = router;
