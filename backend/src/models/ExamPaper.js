const mongoose = require("mongoose");

const ExamPaperSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please provide an exam title"],
      trim: true
    },
    description: {
      type: String,
      default: "",
      trim: true
    },
    examCategory: {
      type: String,
      required: [true, "Please specify an exam category"],
      enum: ["SSC", "Banking", "Railway", "State PSC", "UPSC", "Defence", "Teaching", "Other"],
      default: "Other",
      index: true
    },
    totalDurationMinutes: {
      type: Number,
      required: [true, "Please specify total duration in minutes"],
      min: [1, "Duration must be at least 1 minute"],
      default: 60
    },
    status: {
      type: String,
      enum: ["draft", "live"],
      default: "draft",
      index: true
    },
    sections: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Section"
      }
    ],
    negativeMarkingEnabled: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin"
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("ExamPaper", ExamPaperSchema);
