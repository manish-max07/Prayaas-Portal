const mongoose = require("mongoose");

const RankSubmissionSchema = new mongoose.Schema(
  {
    rankExam: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RankExam",
      required: true,
      index: true,
    },
    examName: {
      type: String,
      required: true,
    },
    responseUrl: {
      type: String,
      default: "",
    },
    // Auto-parsed candidate details from TCS iON response sheet
    participantId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    participantName: {
      type: String,
      default: "Candidate",
      trim: true,
    },
    testCenterName: {
      type: String,
      default: "",
    },
    testDate: {
      type: String,
      default: "",
      index: true,
    },
    testTime: {
      type: String,
      default: "",
      index: true,
    },
    subject: {
      type: String,
      default: "General",
      trim: true,
      index: true,
    },

    // User-submitted demographics
    category: {
      type: String,
      enum: ["UR", "OBC", "EWS", "SC", "ST"],
      default: "UR",
      index: true,
    },
    state: {
      type: String,
      default: "Other",
      index: true,
    },
    horizontalCategory: {
      type: String,
      enum: ["None", "PwD", "Ex-Servicemen", "Female", "Other"],
      default: "None",
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
      default: "Male",
    },
    securityPin: {
      type: String,
      default: "1234",
    },

    // Computed marks & stats
    totalQuestions: {
      type: Number,
      default: 0,
    },
    attempted: {
      type: Number,
      default: 0,
    },
    unattempted: {
      type: Number,
      default: 0,
    },
    correct: {
      type: Number,
      default: 0,
    },
    incorrect: {
      type: Number,
      default: 0,
    },
    positiveMarks: {
      type: Number,
      default: 0,
    },
    negativeMarks: {
      type: Number,
      default: 0,
    },
    totalScore: {
      type: Number,
      default: 0,
      index: -1,
    },
    accuracy: {
      type: Number,
      default: 0,
    },
    sectionBreakdown: [
      {
        sectionName: { type: String, required: true },
        questions: { type: Number, default: 0 },
        correct: { type: Number, default: 0 },
        incorrect: { type: Number, default: 0 },
        unanswered: { type: Number, default: 0 },
        positiveMarks: { type: Number, default: 0 },
        negativeMarks: { type: Number, default: 0 },
        score: { type: Number, default: 0 },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Unique compound index so a student updating their sheet updates their record instead of creating duplicates
RankSubmissionSchema.index({ rankExam: 1, participantId: 1 }, { unique: true });

module.exports = mongoose.model("RankSubmission", RankSubmissionSchema);
