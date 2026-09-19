/**
 * Sanitized Security Event Logger
 * Logs key security and authentication events without ever printing passwords,
 * hashes, JWTs, or sensitive secret tokens.
 */

// Forbidden keys that must NEVER be printed or logged
const FORBIDDEN_LOG_KEYS = new Set([
  "password",
  "confirmpassword",
  "currentpassword",
  "newpassword",
  "passwordhash",
  "token",
  "jwt",
  "secret",
  "authorization"
]);

/**
 * Partially masks an email address for privacy compliance
 * Example: "rahul.sharma@example.com" -> "ra***ma@example.com"
 */
function maskEmail(email) {
  if (!email || typeof email !== "string" || !email.includes("@")) {
    return email || "anonymous";
  }
  const [local, domain] = email.split("@");
  if (local.length <= 2) {
    return `*@${domain}`;
  }
  const maskedLocal = `${local.slice(0, 2)}***${local.slice(-1)}`;
  return `${maskedLocal}@${domain}`;
}

/**
 * Recursively removes sensitive fields from an object before logging
 */
function sanitizeLogDetails(details) {
  if (!details || typeof details !== "object") {
    return details;
  }

  if (Array.isArray(details)) {
    return details.map(sanitizeLogDetails);
  }

  const clean = {};
  for (const [key, value] of Object.entries(details)) {
    const lowerKey = key.toLowerCase();
    if (FORBIDDEN_LOG_KEYS.has(lowerKey)) {
      clean[key] = "[REDACTED]";
    } else if (lowerKey.includes("password") || lowerKey.includes("token")) {
      clean[key] = "[REDACTED]";
    } else {
      clean[key] = typeof value === "object" ? sanitizeLogDetails(value) : value;
    }
  }
  return clean;
}

/**
 * Logs a structured security audit event
 * @param {string} event - Event name (e.g. SIGNUP_SUCCESS, LOGIN_FAILURE)
 * @param {Object} data - { ip, identifier, severity, details }
 */
function logSecurityEvent(event, { ip = "unknown", identifier = null, severity = "INFO", details = null } = {}) {
  const timestamp = new Date().toISOString();
  const maskedId = identifier ? maskEmail(String(identifier)) : null;

  const logEntry = {
    timestamp,
    event,
    severity,
    ip: ip || "unknown",
    ...(maskedId && { identifier: maskedId }),
    ...(details && { details: sanitizeLogDetails(details) })
  };

  const formattedMsg = `[SECURITY][${severity}][${event}] IP: ${logEntry.ip}${
    maskedId ? ` | User: ${maskedId}` : ""
  }${details ? ` | Details: ${JSON.stringify(logEntry.details)}` : ""}`;

  if (severity === "SECURITY_ALERT" || severity === "WARN") {
    console.warn(formattedMsg);
  } else {
    console.log(formattedMsg);
  }

  return logEntry;
}

module.exports = {
  logSecurityEvent,
  maskEmail,
  sanitizeLogDetails
};
