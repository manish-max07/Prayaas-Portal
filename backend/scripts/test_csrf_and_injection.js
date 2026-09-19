/**
 * Automated test script for CSRF protection, NoSQL injection, and input sanitization
 */

const assert = require("assert");
const { csrfProtection, isOriginAllowed } = require("../src/middleware/csrfProtection");
const { sanitizeObject, sanitizeString } = require("../src/middleware/sanitizeInput");

console.log("=== RUNNING CSRF & INJECTION DEFENSE TESTS ===");

// --- Test 1: Origin Validation ---
console.log("\n[Test 1] Testing isOriginAllowed...");

assert.strictEqual(isOriginAllowed("http://localhost:3000"), true);
assert.strictEqual(isOriginAllowed("https://prayaaskaro.in"), true);
assert.strictEqual(isOriginAllowed("https://www.prayaaskaro.in"), true);
assert.strictEqual(isOriginAllowed("https://prayaas-portal.vercel.app"), true);
assert.strictEqual(isOriginAllowed("https://prayaas-portal-preview.vercel.app"), true);
assert.strictEqual(isOriginAllowed("https://evil-phishing-site.com"), false);
assert.strictEqual(isOriginAllowed("https://notprayaaskaro.in.attacker.com"), false);
assert.strictEqual(isOriginAllowed(null), false);

console.log("  ✓ Origin matching whitelist and subdomains correctly enforced");

// --- Test 2: CSRF Middleware ---
console.log("\n[Test 2] Testing csrfProtection middleware...");

function mockRes() {
  const res = {
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
  return res;
}

// 2.1 GET requests bypass CSRF
let nextCalled = false;
csrfProtection({ method: "GET", headers: {} }, mockRes(), () => { nextCalled = true; });
assert.strictEqual(nextCalled, true, "GET requests should pass through");

// 2.2 POST with untrusted Origin rejected
nextCalled = false;
const resBlocked = mockRes();
csrfProtection(
  { method: "POST", headers: { origin: "https://evil-attacker.com" } },
  resBlocked,
  () => { nextCalled = true; }
);
assert.strictEqual(nextCalled, false, "Untrusted origin must not call next()");
assert.strictEqual(resBlocked.statusCode, 403, "Untrusted origin should return 403");

// 2.3 POST with trusted Origin allowed
nextCalled = false;
const resAllowed = mockRes();
csrfProtection(
  { method: "POST", headers: { origin: "http://localhost:3000" } },
  resAllowed,
  () => { nextCalled = true; }
);
assert.strictEqual(nextCalled, true, "Trusted origin must pass");

// 2.4 POST with cookie but no custom headers blocked (ambient credential defense)
nextCalled = false;
const resCookieBlocked = mockRes();
csrfProtection(
  {
    method: "POST",
    headers: {},
    cookies: { token: "some_session_token" }
  },
  resCookieBlocked,
  () => { nextCalled = true; }
);
assert.strictEqual(nextCalled, false);
assert.strictEqual(resCookieBlocked.statusCode, 403);
console.log("  ✓ CSRF middleware verified across safe methods, origins, and ambient cookies");

// --- Test 3: NoSQL Injection Defense ---
console.log("\n[Test 3] Testing sanitizeObject (NoSQL operator stripping)...");

const maliciousPayload = {
  email: {
    $gt: "",
    $ne: null
  },
  "user.role": "admin",
  password: "normalPassword123",
  nested: {
    $regex: ".*",
    legitKey: "validValue"
  }
};

const cleanPayload = sanitizeObject(maliciousPayload);

assert.strictEqual(cleanPayload.email.$gt, undefined, "$gt operator must be stripped");
assert.strictEqual(cleanPayload.email.$ne, undefined, "$ne operator must be stripped");
assert.strictEqual(cleanPayload["user.role"], undefined, "Keys containing '.' must be stripped");
assert.strictEqual(cleanPayload.password, "normalPassword123", "Legitimate fields must remain intact");
assert.strictEqual(cleanPayload.nested.$regex, undefined, "Nested $ operators must be stripped");
assert.strictEqual(cleanPayload.nested.legitKey, "validValue", "Nested legitimate keys must remain");

console.log("  ✓ NoSQL operator injection keys ($ and .) cleanly neutralized");

// --- Test 4: XSS Input Sanitization ---
console.log("\n[Test 4] Testing sanitizeString (XSS neutralization)...");

const xssPayload = "<script>alert('xss')</script>Rahul <iframe src='evil.com'></iframe>Sharma";
const cleanedXss = sanitizeString(xssPayload);
assert.strictEqual(cleanedXss.includes("<script>"), false);
assert.strictEqual(cleanedXss.includes("<iframe"), false);
assert.strictEqual(cleanedXss.includes("Rahul"), true);
assert.strictEqual(cleanedXss.includes("Sharma"), true);

// Test preserving legitimate names with quotes and hyphens
const legitName = "O'Connor-Smith (Hindi: राहुल शर्मा)";
assert.strictEqual(sanitizeString(legitName), legitName, "Legitimate symbols and unicode must be preserved");

console.log("  ✓ Script and iframe injection neutralized while preserving legitimate text and international characters");

console.log("\n✅ ALL CSRF & INJECTION DEFENSE TESTS PASSED!\n");
