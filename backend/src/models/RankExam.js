const mongoose = require("mongoose");

const RankExamSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide an exam name"],
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    examCategory: {
      type: String,
      enum: ["SSC", "Banking", "Railway", "GATE", "State PSC", "UPSC", "Defence", "Engineering", "Other"],
      default: "Other",
    },
    marksForCorrect: {
      type: Number,
      default: 1.0,
      required: true,
    },
    negativeMarks: {
      type: Number,
      default: 0.25,
      required: true,
    },
    totalExpectedQuestions: {
      type: Number,
      default: 100,
    },
    description: {
      type: String,
      default: "",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("RankExam", RankExamSchema);
