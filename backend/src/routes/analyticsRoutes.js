const express = require("express");
const router = express.Router();
const {
  recordVisit,
  getAdminAnalytics,
} = require("../controllers/analyticsController");
const { protect } = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/adminOnlyMiddleware");

// Public endpoint to record page views
router.post("/visit", recordVisit);

// Protected admin endpoint to fetch analytics summary
router.get("/admin/summary", protect, adminOnly, getAdminAnalytics);

module.exports = router;
