/**
 * Automated test script for Security Headers, Security Logger, and Error Handler
 */

const assert = require("assert");
const { securityHeaders } = require("../src/middleware/securityHeaders");
const { logSecurityEvent, maskEmail, sanitizeLogDetails } = require("../src/utils/securityLogger");
const { errorHandler } = require("../src/middleware/errorMiddleware");

console.log("=== RUNNING HEADERS, LOGGING & ERROR DEFENSE TESTS ===");

// --- Test 1: Security Headers Middleware ---
console.log("\n[Test 1] Testing securityHeaders middleware...");

const headersSet = {};
let removedHeader = null;
const mockRes = {
  setHeader(name, value) {
    headersSet[name] = value;
  },
  removeHeader(name) {
    removedHeader = name;
  }
};

let nextCalled = false;
securityHeaders({}, mockRes, () => { nextCalled = true; });

assert.strictEqual(nextCalled, true);
assert.strictEqual(headersSet["X-Content-Type-Options"], "nosniff");
assert.strictEqual(headersSet["X-Frame-Options"], "SAMEORIGIN");
assert.strictEqual(headersSet["Referrer-Policy"], "strict-origin-when-cross-origin");
assert(headersSet["Strict-Transport-Security"].includes("max-age=31536000"));
assert(headersSet["Permissions-Policy"].includes("camera=()"));
assert.strictEqual(removedHeader, "X-Powered-By");

console.log("  ✓ All required HTTP security headers set correctly");

// --- Test 2: Security Logger Sanitization ---
console.log("\n[Test 2] Testing securityLogger sanitization...");

assert.strictEqual(maskEmail("rahul.sharma@example.com"), "ra***a@example.com");
assert.strictEqual(maskEmail("a@b.com"), "*@b.com");

const dirtyDetails = {
  userId: "12345",
  password: "SuperSecretPassword123!",
  nested: {
    token: "jwt.secret.token.value",
    action: "signup"
  }
};

const cleanDetails = sanitizeLogDetails(dirtyDetails);
assert.strictEqual(cleanDetails.password, "[REDACTED]");
assert.strictEqual(cleanDetails.nested.token, "[REDACTED]");
assert.strictEqual(cleanDetails.nested.action, "signup");
assert.strictEqual(cleanDetails.userId, "12345");

const logged = logSecurityEvent("TEST_EVENT", {
  ip: "127.0.0.1",
  identifier: "testuser@example.com",
  severity: "INFO",
  details: dirtyDetails
});

assert.strictEqual(logged.details.password, "[REDACTED]");
console.log("  ✓ Sensitive credentials strictly redacted from logs");

// --- Test 3: Production Error Handling ---
console.log("\n[Test 3] Testing errorMiddleware in production...");

const originalEnv = process.env.NODE_ENV;
process.env.NODE_ENV = "production";

function createErrorMockRes() {
  return {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.body = data;
      return this;
    }
  };
}

// 3.1 Duplicate Key Error (MongoDB 11000)
const dupErr = new Error("E11000 duplicate key error");
dupErr.code = 11000;
dupErr.keyValue = { email: "taken@example.com" };

const dupRes = createErrorMockRes();
errorHandler(dupErr, { method: "POST", originalUrl: "/api/auth/register" }, dupRes, () => {});

assert.strictEqual(dupRes.statusCode, 400);
assert.strictEqual(dupRes.body.message, "A record with the provided information already exists.");
assert.strictEqual(dupRes.body.stack, undefined, "Stack trace must be undefined in production");
console.log("  ✓ Duplicate key error returns generic non-enumerating message without stack trace");

// 3.2 CastError
const castErr = new Error("Cast to ObjectId failed");
castErr.name = "CastError";
castErr.value = "malicious-id-payload";

const castRes = createErrorMockRes();
errorHandler(castErr, { method: "GET", originalUrl: "/api/exams/123" }, castRes, () => {});

assert.strictEqual(castRes.statusCode, 400);
assert.strictEqual(castRes.body.message, "Resource not found.");
assert.strictEqual(castRes.body.stack, undefined);
console.log("  ✓ CastError safely sanitized without reflecting raw input");

process.env.NODE_ENV = originalEnv;

console.log("\n✅ ALL SECURITY HEADERS, LOGGING & ERROR TESTS PASSED!\n");
