/**
 * Security & Auth System Unit Test Script
 */

const assert = require("assert");
const {
  validateRegistrationInput,
  validateLoginInput,
  EMAIL_REGEX
} = require("../src/utils/authValidators");
const {
  cleanIp,
  DEFAULT_DISPOSABLE_DOMAINS
} = require("../src/services/securityBlocklistService");
const { createMultiDimensionalLimiter } = require("../src/middleware/rateLimiter");

console.log("=== RUNNING AUTH & SECURITY SYSTEM TESTS ===");

// --- Test 1: validateRegistrationInput ---
console.log("\n[Test 1] Testing validateRegistrationInput...");

// 1.1 Valid Registration
const validRes = validateRegistrationInput({
  name: "  Rohan Verma  ",
  email: "  Rohan.Verma@Example.Com ",
  password: "SecurePassword123!",
  confirmPassword: "SecurePassword123!"
});
assert.strictEqual(validRes.isValid, true, "Valid registration should succeed");
assert.strictEqual(validRes.sanitized.name, "Rohan Verma", "Name should be trimmed");
assert.strictEqual(validRes.sanitized.email, "rohan.verma@example.com", "Email should be lowercased and trimmed");
console.log("  ✓ Valid registration passed with sanitization");

// 1.2 Password Mismatch
const mismatchRes = validateRegistrationInput({
  name: "Rohan Verma",
  email: "rohan@example.com",
  password: "Password123",
  confirmPassword: "Password456"
});
assert.strictEqual(mismatchRes.isValid, false);
assert.strictEqual(mismatchRes.error, "Passwords do not match.");
console.log("  ✓ Password mismatch correctly detected");

// 1.3 Short Password (< 6 chars)
const shortPassRes = validateRegistrationInput({
  name: "Rohan Verma",
  email: "rohan@example.com",
  password: "123",
  confirmPassword: "123"
});
assert.strictEqual(shortPassRes.isValid, false);
assert.strictEqual(shortPassRes.error, "Password must be at least 6 characters long.");
console.log("  ✓ Short password (< 6 chars) rejected");

// 1.4 Overly Long Password (> 128 chars DoS protection)
const longPass = "a".repeat(129);
const longPassRes = validateRegistrationInput({
  name: "Rohan Verma",
  email: "rohan@example.com",
  password: longPass,
  confirmPassword: longPass
});
assert.strictEqual(longPassRes.isValid, false);
assert.strictEqual(longPassRes.error, "Password cannot exceed 128 characters.");
console.log("  ✓ Overly long password (> 128 chars) rejected for DoS protection");

// 1.5 Missing Confirm Password
const noConfirmRes = validateRegistrationInput({
  name: "Rohan Verma",
  email: "rohan@example.com",
  password: "Password123"
});
assert.strictEqual(noConfirmRes.isValid, false);
assert.strictEqual(noConfirmRes.error, "Please confirm your password.");
console.log("  ✓ Missing confirm password rejected");

// 1.6 Malformed Name
const malformedNameRes = validateRegistrationInput({
  name: "A\u0000B",
  email: "rohan@example.com",
  password: "Password123",
  confirmPassword: "Password123"
});
assert.strictEqual(malformedNameRes.isValid, false);
assert.strictEqual(malformedNameRes.error, "Name contains invalid characters.");
console.log("  ✓ Malformed control character in name rejected");

// --- Test 2: validateLoginInput ---
console.log("\n[Test 2] Testing validateLoginInput...");

const validLogin = validateLoginInput({
  email: " USER@EXAMPLE.COM ",
  password: "SomePassword123"
});
assert.strictEqual(validLogin.isValid, true);
assert.strictEqual(validLogin.sanitized.email, "user@example.com");
console.log("  ✓ Valid login input normalized");

const invalidLogin = validateLoginInput({
  email: "not-an-email",
  password: "SomePassword123"
});
assert.strictEqual(invalidLogin.isValid, false);
assert.strictEqual(invalidLogin.error, "Invalid email or password.");
console.log("  ✓ Generic error message returned for invalid login format");

// --- Test 3: IP Normalization ---
console.log("\n[Test 3] Testing cleanIp...");
assert.strictEqual(cleanIp("::ffff:192.168.1.50"), "192.168.1.50");
assert.strictEqual(cleanIp("  10.0.0.1  "), "10.0.0.1");
console.log("  ✓ IP normalization succeeded");

// --- Test 4: Disposable Email Domains ---
console.log("\n[Test 4] Testing Default Disposable Email Domains...");
assert(DEFAULT_DISPOSABLE_DOMAINS.includes("mailinator.com"));
assert(DEFAULT_DISPOSABLE_DOMAINS.includes("tempmail.com"));
assert(DEFAULT_DISPOSABLE_DOMAINS.includes("10minutemail.com"));
assert(!DEFAULT_DISPOSABLE_DOMAINS.includes("gmail.com"));
assert(!DEFAULT_DISPOSABLE_DOMAINS.includes("yahoo.com"));
console.log("  ✓ Known disposable domains configured without false positives for major providers");

console.log("\n✅ ALL 4 TEST SUITES PASSED SUCCESSFULLY!\n");
