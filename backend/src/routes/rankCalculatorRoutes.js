const express = require("express");
const router = express.Router();
const {
  getExams,
  calculateScoreAndRank,
  getSubmission,
  getLeaderboard,
} = require("../controllers/rankCalculatorController");

// Public endpoints
router.get("/exams", getExams);
router.post("/calculate", calculateScoreAndRank);
router.get("/submission/:id", getSubmission);
router.get("/leaderboard/:examId", getLeaderboard);

module.exports = router;
