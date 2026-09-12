const express = require("express");
const router = express.Router();
const {
  adminLogin,
  adminChangePassword,
  getAdminMe
} = require("../controllers/adminAuthController");
const { protect } = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/adminOnlyMiddleware");

router.post("/login", adminLogin);
router.post("/change-password", protect, adminOnly, adminChangePassword);
router.get("/me", protect, adminOnly, getAdminMe);

module.exports = router;
