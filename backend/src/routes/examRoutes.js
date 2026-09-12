const express = require("express");
const router = express.Router();
const {
  getLiveExams,
  getLiveExamById,
  getExamLeaderboard
} = require("../controllers/examController");
const { protect } = require("../middleware/authMiddleware");

// Public route: browse all live exams on homepage
router.get("/", getLiveExams);

// Protected routes: taking exams and viewing full leaderboards require login
router.get("/:id", protect, getLiveExamById);
router.get("/:examId/leaderboard", protect, getExamLeaderboard);

module.exports = router;
