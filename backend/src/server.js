const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");

// Load environment variables
dotenv.config();

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const adminAuthRoutes = require("./routes/adminAuthRoutes");
const adminExamRoutes = require("./routes/adminExamRoutes");
const examRoutes = require("./routes/examRoutes");
const attemptRoutes = require("./routes/attemptRoutes");
const userRoutes = require("./routes/userRoutes");
const rankCalculatorRoutes = require("./routes/rankCalculatorRoutes");
const articleRoutes = require("./routes/articleRoutes");
const adminArticleRoutes = require("./routes/adminArticleRoutes");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

// Connect to MongoDB
connectDB();

const app = express();

// Body Parser & Cookie Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// CORS Configuration
// Add FRONTEND_URL in Render dashboard once Vercel URL is known
const allowedOrigins = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  process.env.FRONTEND_URL,   // e.g. https://prayaas-portal.vercel.app
].filter(Boolean); // removes undefined if FRONTEND_URL is not set

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (mobile apps, curl, Postman)
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS policy"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"]
  })
);

// Health Check Route
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Prayaas-Portal API is live and healthy",
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminAuthRoutes);
app.use("/api/admin/exams", adminExamRoutes);
app.use("/api/admin/articles", adminArticleRoutes);
app.use("/api/articles", articleRoutes);
app.use("/api/exams", examRoutes);
app.use("/api/attempts", attemptRoutes);
app.use("/api/users", userRoutes);
app.use("/api/rank-calculator", rankCalculatorRoutes);

// Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

const { initArticleCron } = require("./utils/cronScheduler");

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`[Prayaas Server]: Running in ${process.env.NODE_ENV || "development"} mode on http://localhost:${PORT}`);
  // Start background auto-article monitor
  initArticleCron(120);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error(`[Unhandled Rejection Error]: ${err.message}`);
  // Close server & exit process on critical failure
  server.close(() => process.exit(1));
});
