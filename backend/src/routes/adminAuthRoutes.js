const express = require("express");
const router = express.Router();
const {
  adminLogin,
  adminChangePassword,
  getAdminMe
} = require("../controllers/adminAuthController");
const { protect } = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/adminOnlyMiddleware");
const { loginRateLimiter } = require("../middleware/rateLimiter");

router.post("/login", loginRateLimiter, adminLogin);
router.post("/change-password", protect, adminOnly, adminChangePassword);
router.get("/me", protect, adminOnly, getAdminMe);

module.exports = router;
