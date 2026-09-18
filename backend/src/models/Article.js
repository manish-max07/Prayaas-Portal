const mongoose = require("mongoose");

const FAQSchema = new mongoose.Schema(
  {
    question: { type: String, required: true, trim: true },
    answer: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const SectionPatternSchema = new mongoose.Schema(
  {
    sectionName: { type: String, default: "" },
    topics: { type: String, default: "" },
    questions: { type: Number, default: 0 },
    marks: { type: Number, default: 0 },
    duration: { type: String, default: "" },
  },
  { _id: false }
);

const ExamPatternSchema = new mongoose.Schema(
  {
    duration: { type: String, default: "" },
    totalQuestions: { type: Number, default: 0 },
    totalMarks: { type: Number, default: 0 },
    negativeMarking: { type: String, default: "" },
    sections: [SectionPatternSchema],
  },
  { _id: false }
);

const ArticleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Article title is required"],
      trim: true,
    },
    slug: {
      type: String,
      required: [true, "Slug is required"],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    shortTitle: {
      type: String,
      trim: true,
      default: "",
    },
    seoTitle: {
      type: String,
      trim: true,
      default: "",
    },
    metaDescription: {
      type: String,
      trim: true,
      default: "",
    },
    category: {
      type: String,
      required: true,
      enum: [
        "All",
        "Admit Card",
        "Exam Date",
        "Answer Key",
        "Result",
        "Recruitment",
        "Syllabus",
        "Cutoff",
        "General",
      ],
      default: "Admit Card",
    },
    categorySlug: {
      type: String,
      default: "admit-card",
    },
    status: {
      type: String,
      enum: ["Draft", "Published", "Archived"],
      default: "Published",
      index: true,
    },
    badge: {
      type: String,
      default: "🔴 Out Now",
    },
    featuredImage: {
      type: String,
      default: "",
    },
    author: {
      name: { type: String, default: "Prayaas Portal Exam Desk" },
      role: { type: String, default: "Senior Exam Analyst" },
      avatar: { type: String, default: "/logo.png" },
    },
    readingTime: {
      type: String,
      default: "4 min read",
    },
    publishDate: {
      type: Date,
      default: Date.now,
      index: true,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },

    // Exam / Recruitment specific fields (optional)
    advtNumber: { type: String, default: "" },
    organization: { type: String, default: "" },
    postName: { type: String, default: "" },
    totalVacancies: { type: String, default: "" },
    examDate: { type: String, default: "" },
    admitCardReleaseDate: { type: String, default: "" },
    admitCardLastDate: { type: String, default: "" },
    officialWebsite: { type: String, default: "" },
    directAdmitCardLink: { type: String, default: "" },

    // Dynamic Overview Key-Value pairs
    overview: [
      {
        label: { type: String, default: "" },
        value: { type: String, default: "" },
      },
    ],

    // Structured guidance blocks
    loginCredentialsRequired: [{ type: String }],
    stepsToDownload: [{ type: String }],
    detailsOnAdmitCard: [{ type: String }],
    documentsToCarry: [{ type: String }],
    prohibitedItems: [{ type: String }],

    // Exam pattern & centers
    examPattern: {
      type: ExamPatternSchema,
      default: () => ({}),
    },
    examCities: [{ type: String }],

    // FAQs
    faqs: [FAQSchema],

    // Tags & Keywords for SEO
    tags: [{ type: String }],

    // Freeform body content (Markdown / HTML) for non-standard articles
    content: {
      type: String,
      default: "",
    },

    // Analytics
    views: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Slugify pre-save hook helper if slug is not formatted
ArticleSchema.pre("validate", function (next) {
  if (this.title && !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .slice(0, 100);
  }
  if (this.category) {
    this.categorySlug = this.category.toLowerCase().replace(/\s+/g, "-");
  }
  next();
});

module.exports = mongoose.model("Article", ArticleSchema);
