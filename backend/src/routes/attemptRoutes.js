const express = require("express");
const router = express.Router();
const {
  startAttempt,
  saveAnswer,
  submitAttempt,
  getAttemptResult
} = require("../controllers/attemptController");
const { protect } = require("../middleware/authMiddleware");

// All attempt lifecycle routes require candidate authentication
router.use(protect);

router.post("/start", startAttempt);
router.put("/:attemptId/answer", saveAnswer);
router.post("/:attemptId/submit", submitAttempt);
router.get("/:attemptId/result", getAttemptResult);

module.exports = router;
