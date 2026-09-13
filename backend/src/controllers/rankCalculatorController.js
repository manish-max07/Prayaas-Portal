const RankExam = require("../models/RankExam");
const RankSubmission = require("../models/RankSubmission");
const { parseResponseSheetHtml, fetchResponseSheetUrl } = require("../services/digialmParser");

// Default initial seed exams
const DEFAULT_EXAMS = [
  {
    name: "DFCCIL Junior Manager / Executive Recruitment 2026",
    slug: "dfccil-2026",
    examCategory: "Railway",
    marksForCorrect: 1.0,
    negativeMarks: 0.25,
    totalExpectedQuestions: 100,
    description: "Dedicated Freight Corridor Corporation of India Limited (TCS iON Shift Examination)",
  },
  {
    name: "SSC CGL 2026 (Tier 1)",
    slug: "ssc-cgl-2026",
    examCategory: "SSC",
    marksForCorrect: 2.0,
    negativeMarks: 0.5,
    totalExpectedQuestions: 100,
    description: "Staff Selection Commission Combined Graduate Level Examination",
  },
  {
    name: "RRB NTPC / Group D CBT 2026",
    slug: "rrb-ntpc-2026",
    examCategory: "Railway",
    marksForCorrect: 1.0,
    negativeMarks: 0.33,
    totalExpectedQuestions: 100,
    description: "Railway Recruitment Board Non-Technical Popular Categories",
  },
  {
    name: "GATE 2026 (Graduate Aptitude Test in Engineering)",
    slug: "gate-2026",
    examCategory: "GATE",
    marksForCorrect: 1.0,
    negativeMarks: 0.33,
    totalExpectedQuestions: 65,
    description: "GATE Engineering Response Sheet Analysis (MCQ + NAT + MSQ)",
  },
  {
    name: "General TCS iON Competitive Exam (+1, -0.25)",
    slug: "general-tcs-ion",
    examCategory: "Other",
    marksForCorrect: 1.0,
    negativeMarks: 0.25,
    totalExpectedQuestions: 100,
    description: "Standard TCS iON Computer Based Test with 1/4th negative marking",
  },
];

/**
 * Seed default exams if none exist
 */
async function ensureDefaultExams() {
  const count = await RankExam.countDocuments();
  if (count === 0) {
    await RankExam.insertMany(DEFAULT_EXAMS);
  }
}

/**
 * @desc Get all active exams for the rank calculator dropdown
 * @route GET /api/rank-calculator/exams
 */
exports.getExams = async (req, res, next) => {
  try {
    await ensureDefaultExams();
    const exams = await RankExam.find({ isActive: true }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: exams.length, exams });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Calculate marks from response sheet and compute real-time ranks
 * @route POST /api/rank-calculator/calculate
 */
exports.calculateScoreAndRank = async (req, res, next) => {
  try {
    const {
      responseUrl,
      rawHtml,
      examId,
      category = "UR",
      state = "Delhi",
      horizontalCategory = "None",
      gender = "Male",
      securityPin = "1234",
    } = req.body;

    if (!responseUrl && !rawHtml) {
      return res.status(400).json({
        success: false,
        message: "Please provide either a valid Digialm Response Sheet URL or raw HTML content.",
      });
    }

    // 1. Resolve Exam Configuration
    await ensureDefaultExams();
    let exam = null;
    if (examId) {
      exam = await RankExam.findById(examId);
    }
    if (!exam) {
      // Pick first active exam as default
      exam = await RankExam.findOne({ isActive: true });
    }

    const markingScheme = {
      marksForCorrect: exam?.marksForCorrect ?? 1.0,
      negativeMarks: exam?.negativeMarks ?? 0.25,
    };

    // 2. Fetch HTML if URL provided
    let htmlContent = rawHtml;
    if (responseUrl && !htmlContent) {
      try {
        htmlContent = await fetchResponseSheetUrl(responseUrl);
      } catch (fetchErr) {
        console.error("Fetch URL error:", fetchErr.message);
        return res.status(400).json({
          success: false,
          message: `Unable to download response sheet from the provided link (${fetchErr.message}). You can also save the page as HTML and paste its source here.`,
        });
      }
    }

    // 3. Parse Response Sheet
    let parsedResult;
    try {
      parsedResult = parseResponseSheetHtml(htmlContent, markingScheme);
    } catch (parseErr) {
      return res.status(422).json({
        success: false,
        message: parseErr.message || "Failed to parse the response sheet structure.",
      });
    }

    const { candidateInfo, metrics, sectionBreakdown } = parsedResult;

    // 4. Save or Update in MongoDB (Upsert by exam + participantId)
    const submissionData = {
      rankExam: exam._id,
      examName: exam.name,
      responseUrl: responseUrl || "",
      participantId: candidateInfo.participantId,
      participantName: candidateInfo.participantName,
      testCenterName: candidateInfo.testCenterName,
      testDate: candidateInfo.testDate,
      testTime: candidateInfo.testTime,
      subject: candidateInfo.subject,
      category,
      state,
      horizontalCategory,
      gender,
      securityPin,
      totalQuestions: metrics.totalQuestions,
      attempted: metrics.attempted,
      unattempted: metrics.unattempted,
      correct: metrics.correct,
      incorrect: metrics.incorrect,
      positiveMarks: metrics.positiveMarks,
      negativeMarks: metrics.negativeMarks,
      totalScore: metrics.totalScore,
      accuracy: metrics.accuracy,
      sectionBreakdown,
    };

    const submission = await RankSubmission.findOneAndUpdate(
      { rankExam: exam._id, participantId: candidateInfo.participantId },
      submissionData,
      { new: true, upsert: true, runValidators: true }
    );

    // 5. Calculate Dynamic Ranks & Comparative Stats
    const ranks = await computeDynamicRanks(submission);

    res.status(200).json({
      success: true,
      submission,
      ranks,
    });
  } catch (error) {
    console.error("calculateScoreAndRank error:", error);
    next(error);
  }
};

/**
 * @desc Get submission by ID with up-to-date ranks
 * @route GET /api/rank-calculator/submission/:id
 */
exports.getSubmission = async (req, res, next) => {
  try {
    const submission = await RankSubmission.findById(req.params.id).populate("rankExam");
    if (!submission) {
      return res.status(404).json({ success: false, message: "Submission not found." });
    }

    const ranks = await computeDynamicRanks(submission);

    res.status(200).json({
      success: true,
      submission,
      ranks,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Get filterable live leaderboard and shift difficulty comparison
 * @route GET /api/rank-calculator/leaderboard/:examId
 */
exports.getLeaderboard = async (req, res, next) => {
  try {
    const { examId } = req.params;
    const { trade, category, shift, state, page = 1, limit = 50 } = req.query;

    const query = { rankExam: examId };

    if (trade && trade !== "all") query.subject = trade;
    if (category && category !== "all") query.category = category;
    if (shift && shift !== "all") query.testTime = shift;
    if (state && state !== "all") query.state = state;

    const skip = (Number(page) - 1) * Number(limit);

    const [submissions, totalCount] = await Promise.all([
      RankSubmission.find(query)
        .sort({ totalScore: -1, correct: -1 })
        .skip(skip)
        .limit(Number(limit))
        .select("-securityPin"),
      RankSubmission.countDocuments(query),
    ]);

    // Distinct filter options for UI
    const [trades, categories, shifts, states] = await Promise.all([
      RankSubmission.distinct("subject", { rankExam: examId }),
      RankSubmission.distinct("category", { rankExam: examId }),
      RankSubmission.distinct("testTime", { rankExam: examId }),
      RankSubmission.distinct("state", { rankExam: examId }),
    ]);

    // Shift difficulty stats aggregation
    const shiftStats = await RankSubmission.aggregate([
      { $match: { rankExam: submissions[0]?.rankExam || null } },
      {
        $group: {
          _id: { date: "$testDate", time: "$testTime" },
          candidatesCount: { $sum: 1 },
          avgScore: { $avg: "$totalScore" },
          maxScore: { $max: "$totalScore" },
          minScore: { $min: "$totalScore" },
        },
      },
      { $sort: { avgScore: 1 } }, // Lowest average score = Toughest shift
    ]);

    res.status(200).json({
      success: true,
      totalCount,
      page: Number(page),
      totalPages: Math.ceil(totalCount / Number(limit)),
      submissions,
      filters: { trades, categories, shifts, states },
      shiftStats,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Helper to compute ranks across all dimensions for a given candidate
 */
async function computeDynamicRanks(submission) {
  const { rankExam, totalScore, category, subject, testDate, testTime, state } = submission;

  const [
    higherAir,
    totalAir,
    higherCat,
    totalCat,
    higherTrade,
    totalTrade,
    higherShift,
    totalShift,
    higherState,
    totalState,
    statsAgg,
  ] = await Promise.all([
    RankSubmission.countDocuments({ rankExam, totalScore: { $gt: totalScore } }),
    RankSubmission.countDocuments({ rankExam }),

    RankSubmission.countDocuments({ rankExam, category, totalScore: { $gt: totalScore } }),
    RankSubmission.countDocuments({ rankExam, category }),

    RankSubmission.countDocuments({ rankExam, subject, totalScore: { $gt: totalScore } }),
    RankSubmission.countDocuments({ rankExam, subject }),

    RankSubmission.countDocuments({
      rankExam,
      testDate,
      testTime,
      totalScore: { $gt: totalScore },
    }),
    RankSubmission.countDocuments({ rankExam, testDate, testTime }),

    RankSubmission.countDocuments({ rankExam, state, totalScore: { $gt: totalScore } }),
    RankSubmission.countDocuments({ rankExam, state }),

    RankSubmission.aggregate([
      { $match: { rankExam } },
      {
        $group: {
          _id: null,
          avgScore: { $avg: "$totalScore" },
          topperScore: { $max: "$totalScore" },
        },
      },
    ]),
  ]);

  const airRank = higherAir + 1;
  const categoryRank = higherCat + 1;
  const tradeRank = higherTrade + 1;
  const shiftRank = higherShift + 1;
  const stateRank = higherState + 1;

  const percentile =
    totalAir > 1
      ? Number((((totalAir - airRank) / (totalAir - 1)) * 100).toFixed(2))
      : 100.0;

  const benchmarks = {
    examAverage: statsAgg[0] ? Number(statsAgg[0].avgScore.toFixed(2)) : totalScore,
    topperScore: statsAgg[0] ? Number(statsAgg[0].topperScore.toFixed(2)) : totalScore,
  };

  return {
    air: { rank: airRank, total: totalAir },
    category: { rank: categoryRank, total: totalCat, name: category },
    trade: { rank: tradeRank, total: totalTrade, name: subject },
    shift: { rank: shiftRank, total: totalShift, date: testDate, time: testTime },
    state: { rank: stateRank, total: totalState, name: state },
    percentile,
    benchmarks,
  };
}
