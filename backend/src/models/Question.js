const mongoose = require("mongoose");

const QuestionSchema = new mongoose.Schema(
  {
    examPaper: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ExamPaper",
      required: true,
      index: true
    },
    section: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Section",
      required: true,
      index: true
    },
    questionText: {
      type: String,
      required: [true, "Please provide the question text"]
    },
    imageUrl: {
      type: String,
      default: null,
      trim: true
    },
    options: {
      type: [String],
      required: [true, "Please provide 4 options"],
      validate: {
        validator: function (val) {
          return Array.isArray(val) && val.length === 4;
        },
        message: "A question must have exactly 4 options"
      }
    },
    correctOptionIndex: {
      type: Number,
      required: [true, "Please specify the correct option index (0 to 3)"],
      min: [0, "Option index cannot be less than 0 (Option A)"],
      max: [3, "Option index cannot be greater than 3 (Option D)"]
    },
    marksForCorrect: {
      type: Number,
      required: true,
      default: 1.0,
      min: [0, "Marks for correct answer cannot be negative"]
    },
    negativeMarks: {
      type: Number,
      required: true,
      default: 0.25,
      min: [0, "Negative marks cannot be negative"]
    },
    order: {
      type: Number,
      required: true,
      default: 1
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Question", QuestionSchema);
