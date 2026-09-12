const mongoose = require("mongoose");

const AnswerItemSchema = new mongoose.Schema(
  {
    question: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Question",
      required: true
    },
    selectedOption: {
      type: Number, // 0, 1, 2, 3 or null if unanswered
      default: null
    },
    status: {
      type: String,
      enum: [
        "not-visited",
        "not-answered",
        "answered",
        "marked-for-review",
        "answered-and-marked"
      ],
      default: "not-visited"
    },
    isCorrect: {
      type: Boolean,
      default: null
    },
    marksAwarded: {
      type: Number,
      default: 0
    }
  },
  { _id: false }
);

const AttemptSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    examPaper: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ExamPaper",
      required: true,
      index: true
    },
    startTime: {
      type: Date,
      required: true,
      default: Date.now
    },
    submitTime: {
      type: Date,
      default: null
    },
    timeTakenSeconds: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      enum: ["in-progress", "submitted", "auto-submitted"],
      default: "in-progress",
      index: true
    },
    answers: [AnswerItemSchema],
    score: {
      type: Number,
      default: 0,
      index: true
    },
    totalMarks: {
      type: Number,
      default: 0
    },
    correctCount: {
      type: Number,
      default: 0
    },
    wrongCount: {
      type: Number,
      default: 0
    },
    unansweredCount: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

// Compound index for lightning-fast leaderboard queries
AttemptSchema.index({ examPaper: 1, status: 1, score: -1, timeTakenSeconds: 1 });

module.exports = mongoose.model("Attempt", AttemptSchema);
