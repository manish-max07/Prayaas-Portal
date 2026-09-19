const mongoose = require("mongoose");

const ExamPaperSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please provide an exam title"],
      trim: true
    },
    authority: {
      type: String,
      trim: true,
      default: ""
    },
    position: {
      type: String,
      trim: true,
      default: ""
    },
    subject: {
      type: String,
      trim: true,
      default: ""
    },
    examYear: {
      type: String,
      trim: true,
      index: true,
      default: () => new Date().getFullYear().toString()
    },
    examDate: {
      type: String,
      trim: true,
      default: ""
    },
    shift: {
      type: String,
      trim: true,
      default: ""
    },
    medium: {
      type: String,
      trim: true,
      default: "Bilingual (English / Hindi)"
    },
    examSlug: {
      type: String,
      trim: true,
      index: true,
      default: ""
    },
    description: {
      type: String,
      default: "",
      trim: true
    },
    examCategory: {
      type: String,
      required: [true, "Please specify an exam category"],
      enum: ["SSC", "Banking", "Railway", "State PSC", "UPSC", "Defence", "Teaching", "Engineering", "Other"],
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
