const mongoose = require("mongoose");

const SectionSchema = new mongoose.Schema(
  {
    examPaper: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ExamPaper",
      required: true,
      index: true
    },
    name: {
      type: String,
      required: [true, "Please provide a section name"],
      trim: true
    },
    order: {
      type: Number,
      required: true,
      default: 1
    },
    questions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Question"
      }
    ]
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Section", SectionSchema);
