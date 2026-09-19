const mongoose = require("mongoose");

const SecurityBlocklistSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["domain", "email", "ip"],
      required: [true, "Please specify blocklist type (domain, email, or ip)"],
      index: true
    },
    value: {
      type: String,
      required: [true, "Please provide the blocked value"],
      lowercase: true,
      trim: true,
      index: true
    },
    reason: {
      type: String,
      default: "",
      trim: true
    },
    status: {
      type: String,
      enum: ["blocked", "unblocked"],
      default: "blocked",
      index: true
    },
    addedBy: {
      type: String,
      default: "system"
    },
    unblockedBy: {
      type: String,
      default: null
    },
    unblockedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Compound index to guarantee uniqueness of type + value
SecurityBlocklistSchema.index({ type: 1, value: 1 }, { unique: true });

module.exports = mongoose.model("SecurityBlocklist", SecurityBlocklistSchema);
