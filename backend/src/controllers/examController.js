const ExamPaper = require("../models/ExamPaper");
const Attempt = require("../models/Attempt");

// @desc    Get all LIVE exams for candidates/students
// @route   GET /api/exams
// @access  Private (Authenticated User)
const getLiveExams = async (req, res, next) => {
  try {
    const { category, search } = req.query;

    const query = { status: "live" };
    if (category && category !== "All") {
      query.examCategory = category;
    }
    if (search) {
      query.title = { $regex: search, $options: "i" };
    }

    const examPapers = await ExamPaper.find(query)
      .populate({
        path: "sections",
        select: "name order questions",
        populate: {
          path: "questions",
          select: "marksForCorrect"
        }
      })
      .sort({ createdAt: -1 });

    const formatted = examPapers.map((exam) => {
      let totalQuestions = 0;
      let totalMarks = 0;

      exam.sections.forEach((sec) => {
        if (sec.questions && Array.isArray(sec.questions)) {
          totalQuestions += sec.questions.length;
          sec.questions.forEach((q) => {
            totalMarks += q.marksForCorrect || 1.0;
          });
        }
      });

      return {
        _id: exam._id,
        title: exam.title,
        description: exam.description,
        examCategory: exam.examCategory,
        totalDurationMinutes: exam.totalDurationMinutes,
        negativeMarkingEnabled: exam.negativeMarkingEnabled,
        sectionsCount: exam.sections.length,
        totalQuestions,
        totalMarks,
        createdAt: exam.createdAt
      };
    });

    res.status(200).json({
      success: true,
      count: formatted.length,
      exams: formatted
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get full Exam details for taking the test (STRIPS OUT correctOptionIndex)
// @route   GET /api/exams/:id
// @access  Private (Authenticated User)
const getLiveExamById = async (req, res, next) => {
  try {
    const examPaper = await ExamPaper.findOne({
      _id: req.params.id,
      status: "live"
    }).populate({
      path: "sections",
      options: { sort: { order: 1 } },
      populate: {
        path: "questions",
        options: { sort: { order: 1 } }
      }
    });

    if (!examPaper) {
      return res.status(404).json({
        success: false,
        message: "Exam paper not found or is currently not live."
      });
    }

    // Convert to plain object and sanitize by removing correctOptionIndex
    const sanitizedSections = examPaper.sections.map((section) => {
      const sanitizedQuestions = section.questions.map((q) => {
        return {
          _id: q._id,
          questionText: q.questionText,
          imageUrl: q.imageUrl,
          options: q.options,
          marksForCorrect: q.marksForCorrect,
          negativeMarks: q.negativeMarks,
          order: q.order,
          section: q.section,
          examPaper: q.examPaper
          // Notice: correctOptionIndex is intentionally OMITTED for candidate security!
        };
      });

      return {
        _id: section._id,
        name: section.name,
        order: section.order,
        questions: sanitizedQuestions
      };
    });

    res.status(200).json({
      success: true,
      examPaper: {
        _id: examPaper._id,
        title: examPaper.title,
        description: examPaper.description,
        examCategory: examPaper.examCategory,
        totalDurationMinutes: examPaper.totalDurationMinutes,
        negativeMarkingEnabled: examPaper.negativeMarkingEnabled,
        sections: sanitizedSections,
        createdAt: examPaper.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Leaderboard rankings for an Exam Paper (Score DESC, Time ASC)
// @route   GET /api/exams/:examId/leaderboard
// @access  Private (Authenticated User)
const getExamLeaderboard = async (req, res, next) => {
  try {
    const { examId } = req.params;

    const examPaper = await ExamPaper.findById(examId);
    if (!examPaper) {
      return res.status(404).json({
        success: false,
        message: "Exam paper not found."
      });
    }

    // Find all submitted / auto-submitted attempts for this exam
    const attempts = await Attempt.find({
      examPaper: examId,
      status: { $in: ["submitted", "auto-submitted"] }
    })
      .populate("user", "name")
      .sort({ score: -1, timeTakenSeconds: 1, submitTime: 1 });

    const leaderboard = attempts.map((att, index) => ({
      rank: index + 1,
      userName: att.user ? att.user.name : "Anonymous Candidate",
      score: att.score,
      totalMarks: att.totalMarks,
      timeTakenSeconds: att.timeTakenSeconds,
      correctCount: att.correctCount,
      wrongCount: att.wrongCount,
      unansweredCount: att.unansweredCount,
      submitTime: att.submitTime
    }));

    res.status(200).json({
      success: true,
      examTitle: examPaper.title,
      examCategory: examPaper.examCategory,
      totalParticipants: leaderboard.length,
      leaderboard
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getLiveExams,
  getLiveExamById,
  getExamLeaderboard
};
