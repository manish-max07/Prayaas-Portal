const mongoose = require("mongoose");

const DailyVisitSchema = new mongoose.Schema(
  {
    date: { type: String, required: true, index: true }, // "YYYY-MM-DD" in Asia/Kolkata
    visits: { type: Number, default: 0 },
    uniqueIps: [{ type: String }], // Hashed or masked identifier to count unique daily visitors
  },
  { _id: false }
);

const RouteHitSchema = new mongoose.Schema(
  {
    path: { type: String, required: true },
    count: { type: Number, default: 0 },
  },
  { _id: false }
);

const SiteAnalyticsSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      default: "global",
      unique: true,
      index: true,
    },
    totalVisits: {
      type: Number,
      default: 0,
    },
    dailyVisits: [DailyVisitSchema],
    routeHits: [RouteHitSchema],
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SiteAnalytics", SiteAnalyticsSchema);
