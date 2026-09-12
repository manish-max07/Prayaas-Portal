const Attempt = require("../models/Attempt");
const ExamPaper = require("../models/ExamPaper");
const Question = require("../models/Question");
const { calculateAttemptScore } = require("../utils/scoring");

// Helper to get sanitized exam content (answers hidden)
const getSanitizedExamContent = async (examPaperId) => {
  const examPaper = await ExamPaper.findById(examPaperId).populate({
    path: "sections",
    options: { sort: { order: 1 } },
    populate: {
      path: "questions",
      options: { sort: { order: 1 } }
    }
  });

  if (!examPaper) return null;

  const sanitizedSections = examPaper.sections.map((section) => {
    const sanitizedQuestions = section.questions.map((q) => ({
      _id: q._id,
      questionText: q.questionText,
      imageUrl: q.imageUrl,
      options: q.options,
      marksForCorrect: q.marksForCorrect,
      negativeMarks: q.negativeMarks,
      order: q.order,
      section: q.section,
      examPaper: q.examPaper
    }));

    return {
      _id: section._id,
      name: section.name,
      order: section.order,
      questions: sanitizedQuestions
    };
  });

  return {
    _id: examPaper._id,
    title: examPaper.title,
    description: examPaper.description,
    examCategory: examPaper.examCategory,
    totalDurationMinutes: examPaper.totalDurationMinutes,
    negativeMarkingEnabled: examPaper.negativeMarkingEnabled,
    sections: sanitizedSections
  };
};

// @desc    Start an exam attempt or resume an active in-progress attempt
// @route   POST /api/attempts/start
// @access  Private (Candidate)
const startAttempt = async (req, res, next) => {
  try {
    const { examPaperId } = req.body;

    if (!examPaperId) {
      return res.status(400).json({
        success: false,
        message: "Please provide an examPaperId."
      });
    }

    const examPaper = await ExamPaper.findById(examPaperId);
    if (!examPaper) {
      return res.status(404).json({
        success: false,
        message: "Exam paper not found."
      });
    }

    if (examPaper.status !== "live") {
      return res.status(403).json({
        success: false,
        message: "This exam is currently not available or is in draft mode."
      });
    }

    // Check for an existing in-progress attempt to resume
    let attempt = await Attempt.findOne({
      user: req.user._id,
      examPaper: examPaperId,
      status: "in-progress"
    });

    let isResumed = false;

    if (attempt) {
      isResumed = true;
    } else {
      // Gather all question IDs in this exam to initialize the palette
      const allQuestions = await Question.find({ examPaper: examPaperId });
      const initialAnswers = allQuestions.map((q) => ({
        question: q._id,
        selectedOption: null,
        status: "not-visited",
        isCorrect: null,
        marksAwarded: 0
      }));

      attempt = await Attempt.create({
        user: req.user._id,
        examPaper: examPaperId,
        startTime: new Date(),
        status: "in-progress",
        answers: initialAnswers
      });
    }

    const sanitizedExam = await getSanitizedExamContent(examPaperId);

    // Calculate elapsed time for resumed attempts
    const elapsedSeconds = Math.max(
      0,
      Math.round((Date.now() - new Date(attempt.startTime).getTime()) / 1000)
    );

    res.status(200).json({
      success: true,
      isResumed,
      attempt: {
        _id: attempt._id,
        startTime: attempt.startTime,
        status: attempt.status,
        answers: attempt.answers,
        elapsedSeconds
      },
      examPaper: sanitizedExam
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Autosave / Update single question answer on navigation
// @route   PUT /api/attempts/:attemptId/answer
// @access  Private (Candidate)
const saveAnswer = async (req, res, next) => {
  try {
    const { attemptId } = req.params;
    const { questionId, selectedOption, status } = req.body;

    const allowedStatuses = [
      "not-visited",
      "not-answered",
      "answered",
      "marked-for-review",
      "answered-and-marked"
    ];

    if (status && !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid answer status. Must be one of: ${allowedStatuses.join(", ")}`
      });
    }

    const attempt = await Attempt.findOne({
      _id: attemptId,
      user: req.user._id
    });

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: "Attempt not found or access unauthorized."
      });
    }

    if (attempt.status !== "in-progress") {
      return res.status(400).json({
        success: false,
        message: "Cannot modify an attempt that is already submitted."
      });
    }

    const existingIndex = attempt.answers.findIndex(
      (a) => a.question.toString() === questionId.toString()
    );

    const optionValue =
      selectedOption !== undefined &&
      selectedOption !== null &&
      Number(selectedOption) >= 0 &&
      Number(selectedOption) <= 3
        ? Number(selectedOption)
        : null;

    if (existingIndex !== -1) {
      attempt.answers[existingIndex].selectedOption = optionValue;
      if (status) attempt.answers[existingIndex].status = status;
    } else {
      attempt.answers.push({
        question: questionId,
        selectedOption: optionValue,
        status: status || (optionValue !== null ? "answered" : "not-answered")
      });
    }

    await attempt.save();

    res.status(200).json({
      success: true,
      message: "Answer updated successfully."
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit exam attempt and calculate final score server-side
// @route   POST /api/attempts/:attemptId/submit
// @access  Private (Candidate)
const submitAttempt = async (req, res, next) => {
  try {
    const { attemptId } = req.params;
    const { autoSubmitted } = req.body;

    const attempt = await Attempt.findOne({
      _id: attemptId,
      user: req.user._id
    });

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: "Attempt not found or access unauthorized."
      });
    }

    // Idempotent check: if already submitted, return the existing result
    if (attempt.status === "submitted" || attempt.status === "auto-submitted") {
      return res.status(200).json({
        success: true,
        message: "Attempt was already submitted.",
        result: {
          attemptId: attempt._id,
          status: attempt.status,
          score: attempt.score,
          totalMarks: attempt.totalMarks,
          correctCount: attempt.correctCount,
          wrongCount: attempt.wrongCount,
          unansweredCount: attempt.unansweredCount,
          timeTakenSeconds: attempt.timeTakenSeconds,
          startTime: attempt.startTime,
          submitTime: attempt.submitTime
        }
      });
    }

    const examPaper = await ExamPaper.findById(attempt.examPaper);
    if (!examPaper) {
      return res.status(404).json({
        success: false,
        message: "Associated exam paper not found."
      });
    }

    // Recalculate duration server-side from actual timestamps
    const submitTime = new Date();
    const timeTakenSeconds = Math.max(
      0,
      Math.round((submitTime.getTime() - new Date(attempt.startTime).getTime()) / 1000)
    );

    // Fetch real question documents for grading
    const allQuestions = await Question.find({ examPaper: examPaper._id });

    // Perform pure server-side grading
    const {
      score,
      totalMarks,
      correctCount,
      wrongCount,
      unansweredCount,
      scoredAnswers
    } = calculateAttemptScore(
      allQuestions,
      attempt.answers,
      examPaper.negativeMarkingEnabled
    );

    // Save final evaluated attempt state
    attempt.status = autoSubmitted ? "auto-submitted" : "submitted";
    attempt.submitTime = submitTime;
    attempt.timeTakenSeconds = timeTakenSeconds;
    attempt.score = score;
    attempt.totalMarks = totalMarks;
    attempt.correctCount = correctCount;
    attempt.wrongCount = wrongCount;
    attempt.unansweredCount = unansweredCount;
    attempt.answers = scoredAnswers;

    await attempt.save();

    res.status(200).json({
      success: true,
      message: "Exam submitted and evaluated successfully.",
      result: {
        attemptId: attempt._id,
        examPaperId: examPaper._id,
        examTitle: examPaper.title,
        status: attempt.status,
        score,
        totalMarks,
        correctCount,
        wrongCount,
        unansweredCount,
        timeTakenSeconds,
        startTime: attempt.startTime,
        submitTime: attempt.submitTime
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get detailed result and solution analysis for a submitted attempt
// @route   GET /api/attempts/:attemptId/result
// @access  Private (Candidate / Admin)
const getAttemptResult = async (req, res, next) => {
  try {
    const { attemptId } = req.params;

    const attempt = await Attempt.findById(attemptId)
      .populate({
        path: "examPaper",
        select: "title description examCategory totalDurationMinutes negativeMarkingEnabled"
      })
      .populate({
        path: "answers.question",
        select: "questionText imageUrl options correctOptionIndex marksForCorrect negativeMarks section order"
      });

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: "Attempt not found."
      });
    }

    // Check ownership unless admin
    if (
      attempt.user.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view this result."
      });
    }

    if (attempt.status === "in-progress") {
      return res.status(400).json({
        success: false,
        message: "Attempt is currently in-progress. Submit the exam first to view results."
      });
    }

    res.status(200).json({
      success: true,
      result: {
        attemptId: attempt._id,
        examPaper: attempt.examPaper,
        status: attempt.status,
        score: attempt.score,
        totalMarks: attempt.totalMarks,
        correctCount: attempt.correctCount,
        wrongCount: attempt.wrongCount,
        unansweredCount: attempt.unansweredCount,
        timeTakenSeconds: attempt.timeTakenSeconds,
        startTime: attempt.startTime,
        submitTime: attempt.submitTime,
        answers: attempt.answers
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  startAttempt,
  saveAnswer,
  submitAttempt,
  getAttemptResult
};
