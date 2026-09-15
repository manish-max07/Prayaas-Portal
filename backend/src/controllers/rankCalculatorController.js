const RankExam = require("../models/RankExam");
const RankSubmission = require("../models/RankSubmission");
const { parseResponseSheetHtml, fetchResponseSheetUrl } = require("../services/digialmParser");

// Default exams as requested: AVNL and CIL with default marks +1 and 0
const DEFAULT_EXAMS = [
  {
    name: "AVNL Recruitment 2026",
    slug: "avnl-recruitment-2026",
    examCategory: "Defence",
    marksForCorrect: 1.0,
    negativeMarks: 0.0,
    totalExpectedQuestions: 100,
    description: "Armoured Vehicles Nigam Limited (AVNL) Executive & Junior Manager Recruitment Examination 2026",
    isActive: true,
  },
  {
    name: "CIL Management Trainee 2026 Recruitment",
    slug: "cil-management-trainee-2026",
    examCategory: "Engineering",
    marksForCorrect: 1.0,
    negativeMarks: 0.0,
    totalExpectedQuestions: 100,
    description: "Coal India Limited (CIL) Management Trainee Computer Based Test 2026",
    isActive: true,
  },
];

/**
 * Seed/ensure default exams are active without deactivating user-added exams
 */
async function ensureDefaultExams() {
  for (const def of DEFAULT_EXAMS) {
    await RankExam.findOneAndUpdate(
      { slug: def.slug },
      { $set: { ...def, isActive: true } },
      { upsert: true, new: true }
    );
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
      customExamName,
      category = "UR",
      state = "Delhi",
      horizontalCategory = "None",
      gender = "Male",
      securityPin = "1234",
      marksForCorrect: userMarksForCorrect,
      negativeMarks: userNegativeMarks,
    } = req.body;

    if (!responseUrl && !rawHtml) {
      return res.status(400).json({
        success: false,
        message: "Please provide either a valid Digialm Response Sheet URL or raw HTML content.",
      });
    }

    // 1. Resolve or Create Exam Configuration
    await ensureDefaultExams();
    let exam = null;

    if (customExamName && customExamName.trim()) {
      const trimmedName = customExamName.trim();
      const baseSlug =
        trimmedName
          .toLowerCase()
          .replace(/[^\w\s-]/g, "")
          .replace(/[\s_-]+/g, "-")
          .replace(/^-+|-+$/g, "") || "exam-" + Date.now();

      // Check if an exam with the same name or slug already exists (case-insensitive)
      let existingExam = await RankExam.findOne({
        $or: [
          { slug: baseSlug },
          { name: { $regex: new RegExp(`^${trimmedName}$`, "i") } },
        ],
      });

      if (existingExam) {
        exam = existingExam;
        if (!exam.isActive) {
          exam.isActive = true;
          await exam.save();
        }
      } else {
        // Create new active exam in MongoDB so other candidates see it in dropdown
        let finalSlug = baseSlug;
        const slugExists = await RankExam.findOne({ slug: finalSlug });
        if (slugExists) {
          finalSlug = `${baseSlug}-${Date.now().toString().slice(-4)}`;
        }

        exam = await RankExam.create({
          name: trimmedName,
          slug: finalSlug,
          examCategory: "Other",
          marksForCorrect:
            userMarksForCorrect !== undefined && userMarksForCorrect !== null && userMarksForCorrect !== ""
              ? Math.max(0, Number(userMarksForCorrect))
              : 1.0,
          negativeMarks:
            userNegativeMarks !== undefined && userNegativeMarks !== null && userNegativeMarks !== ""
              ? Math.max(0, Number(userNegativeMarks))
              : 0.0,
          totalExpectedQuestions: 100,
          description: `Candidate-added exam: ${trimmedName}`,
          isActive: true,
        });
      }
    } else if (examId && examId !== "other") {
      exam = await RankExam.findById(examId);
    }

    if (!exam) {
      // Pick first active exam as default
      exam = await RankExam.findOne({ isActive: true });
    }

    // User can customize positive marks (default +1.0) and negative marks (default 0.0)
    const marksForCorrect =
      userMarksForCorrect !== undefined && userMarksForCorrect !== null && userMarksForCorrect !== ""
        ? Math.max(0, Number(userMarksForCorrect))
        : exam?.marksForCorrect ?? 1.0;

    const negativeMarks =
      userNegativeMarks !== undefined && userNegativeMarks !== null && userNegativeMarks !== ""
        ? Math.max(0, Number(userNegativeMarks))
        : exam?.negativeMarks ?? 0.0;

    const markingScheme = {
      marksForCorrect,
      negativeMarks,
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

    // Auto-detect exam if not explicitly specified by user and not a custom exam
    if (!examId && !customExamName && htmlContent) {
      if (/coal\s*india|\bcil\b|form97495/i.test(htmlContent)) {
        const cilExam = await RankExam.findOne({ slug: "cil-management-trainee-2026" });
        if (cilExam) exam = cilExam;
      } else if (/avnl|armoured/i.test(htmlContent)) {
        const avnlExam = await RankExam.findOne({ slug: "avnl-recruitment-2026" });
        if (avnlExam) exam = avnlExam;
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
      headerImageUrl: candidateInfo.headerImageUrl || "",
      examLanguage: candidateInfo.examLanguage || "English",
      marksForCorrectScheme: marksForCorrect,
      negativeMarksScheme: negativeMarks,
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

    await ensureDefaultExams();

    // Resolve exam by ObjectId, slug, or name
    let exam = null;
    const mongoose = require("mongoose");
    if (mongoose.Types.ObjectId.isValid(examId)) {
      exam = await RankExam.findById(examId);
    }
    if (!exam) {
      exam = await RankExam.findOne({ slug: examId });
    }
    if (!exam && examId) {
      exam = await RankExam.findOne({ name: { $regex: new RegExp(`^${examId}$`, "i") } });
    }

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: "Rank examination not found.",
      });
    }

    const query = { rankExam: exam._id };

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
      RankSubmission.distinct("subject", { rankExam: exam._id }),
      RankSubmission.distinct("category", { rankExam: exam._id }),
      RankSubmission.distinct("testTime", { rankExam: exam._id }),
      RankSubmission.distinct("state", { rankExam: exam._id }),
    ]);

    // Shift difficulty stats aggregation (based on full exam cohort)
    const shiftStats = await RankSubmission.aggregate([
      { $match: { rankExam: exam._id } },
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
      exam: {
        _id: exam._id,
        name: exam.name,
        slug: exam.slug,
        examCategory: exam.examCategory,
        marksForCorrect: exam.marksForCorrect,
        negativeMarks: exam.negativeMarks,
        totalExpectedQuestions: exam.totalExpectedQuestions,
        description: exam.description,
      },
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

/**
 * @desc Get admin summary of all rank exams with submission stats
 * @route GET /api/rank-calculator/admin/exams-summary
 */
exports.getAdminExamsSummary = async (req, res, next) => {
  try {
    await ensureDefaultExams();
    const exams = await RankExam.find().sort({ createdAt: -1 });

    const examSummaries = await Promise.all(
      exams.map(async (exam) => {
        const [submissionCount, stats] = await Promise.all([
          RankSubmission.countDocuments({ rankExam: exam._id }),
          RankSubmission.aggregate([
            { $match: { rankExam: exam._id } },
            {
              $group: {
                _id: null,
                avgScore: { $avg: "$totalScore" },
                maxScore: { $max: "$totalScore" },
                minScore: { $min: "$totalScore" },
              },
            },
          ]),
        ]);

        return {
          _id: exam._id,
          name: exam.name,
          slug: exam.slug,
          examCategory: exam.examCategory,
          marksForCorrect: exam.marksForCorrect,
          negativeMarks: exam.negativeMarks,
          totalExpectedQuestions: exam.totalExpectedQuestions,
          description: exam.description,
          isActive: exam.isActive,
          createdAt: exam.createdAt,
          submissionCount,
          avgScore: stats[0] ? Number(stats[0].avgScore.toFixed(2)) : 0,
          maxScore: stats[0] ? Number(stats[0].maxScore.toFixed(2)) : 0,
          minScore: stats[0] ? Number(stats[0].minScore.toFixed(2)) : 0,
        };
      })
    );

    res.status(200).json({
      success: true,
      exams: examSummaries,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Admin delete a candidate submission
 * @route DELETE /api/rank-calculator/submission/:id
 */
exports.deleteSubmission = async (req, res, next) => {
  try {
    const submission = await RankSubmission.findByIdAndDelete(req.params.id);
    if (!submission) {
      return res.status(404).json({ success: false, message: "Submission not found." });
    }

    res.status(200).json({
      success: true,
      message: "Submission deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Proxy image to prevent CORS issues during HTML-to-Canvas PNG download
 * @route GET /api/rank-calculator/proxy-image
 */
exports.proxyImage = async (req, res) => {
  try {
    const { url } = req.query;
    if (!url) return res.status(400).send("No url provided");
    const response = await fetch(url);
    const buffer = await response.arrayBuffer();
    const contentType = response.headers.get("content-type") || "image/jpeg";
    res.set("Content-Type", contentType);
    res.set("Cache-Control", "public, max-age=86400");
    res.send(Buffer.from(buffer));
  } catch (e) {
    res.status(500).send("Failed to proxy image");
  }
};


