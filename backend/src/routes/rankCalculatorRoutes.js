const express = require("express");
const router = express.Router();
const {
  getExams,
  calculateScoreAndRank,
  getSubmission,
  getLeaderboard,
  getAdminExamsSummary,
  deleteSubmission,
  proxyImage,
} = require("../controllers/rankCalculatorController");
const { protect } = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/adminOnlyMiddleware");

// Public candidate endpoints
router.get("/exams", getExams);
router.post("/calculate", calculateScoreAndRank);
router.get("/submission/:id", getSubmission);
router.get("/proxy-image", proxyImage);

// Admin-only endpoints for Rank Predictor Module
router.get("/admin/exams-summary", protect, adminOnly, getAdminExamsSummary);
router.get("/leaderboard/:examId", protect, adminOnly, getLeaderboard);
router.delete("/submission/:id", protect, adminOnly, deleteSubmission);

module.exports = router;

