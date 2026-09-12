const Attempt = require("../models/Attempt");

// @desc    Get current user's submitted attempt history
// @route   GET /api/users/me/attempts
// @access  Private (Candidate)
const getUserAttemptHistory = async (req, res, next) => {
  try {
    const attempts = await Attempt.find({
      user: req.user._id,
      status: { $in: ["submitted", "auto-submitted"] }
    })
      .populate({
        path: "examPaper",
        select: "title description examCategory totalDurationMinutes"
      })
      .sort({ submitTime: -1 });

    const history = attempts.map((att) => ({
      attemptId: att._id,
      exam: {
        _id: att.examPaper ? att.examPaper._id : null,
        title: att.examPaper ? att.examPaper.title : "Exam Paper (Archived)",
        category: att.examPaper ? att.examPaper.examCategory : "General",
        durationMinutes: att.examPaper ? att.examPaper.totalDurationMinutes : 0
      },
      status: att.status,
      score: att.score,
      totalMarks: att.totalMarks,
      correctCount: att.correctCount,
      wrongCount: att.wrongCount,
      unansweredCount: att.unansweredCount,
      timeTakenSeconds: att.timeTakenSeconds,
      startTime: att.startTime,
      submitTime: att.submitTime
    }));

    res.status(200).json({
      success: true,
      count: history.length,
      attempts: history
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUserAttemptHistory
};
