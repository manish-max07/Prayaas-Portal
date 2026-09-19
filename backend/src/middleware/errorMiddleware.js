// 404 Not Found Middleware
const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

// Global Error Handler Middleware
const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message || "Internal Server Error";
  const isProduction = process.env.NODE_ENV === "production";

  // Server-side error logging with technical details
  console.error(
    `[ERROR][${new Date().toISOString()}] ${req.method} ${req.originalUrl} - ${err.message}`,
    isProduction ? "" : err.stack
  );

  // 1. Mongoose duplicate key error (e.g. unique email or compound index)
  if (err.code === 11000) {
    statusCode = 400;
    // Generic message to prevent schema or account enumeration leakage
    message = "A record with the provided information already exists.";
  }

  // 2. Mongoose validation error
  else if (err.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((val) => val.message)
      .join(", ");
  }

  // 3. Mongoose CastError (bad ObjectId or invalid type conversion)
  else if (err.name === "CastError") {
    statusCode = 400;
    // Never reflect raw invalid values or internal database field names
    message = "Resource not found.";
  }

  // 4. JWT invalid or expired error
  else if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Authentication session expired or invalid. Please sign in again.";
  }

  // 5. Generic 500 error in production: hide internal stack traces, DB errors, and file paths
  else if (statusCode === 500 && isProduction) {
    message = "An unexpected server error occurred. Please try again later.";
  }

  const responsePayload = {
    success: false,
    message
  };

  // Only include stack trace in local development
  if (!isProduction && err.stack) {
    responsePayload.stack = err.stack;
  }

  res.status(statusCode).json(responsePayload);
};

module.exports = { notFound, errorHandler };
