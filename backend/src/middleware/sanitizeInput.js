/**
 * Input sanitization middleware to prevent NoSQL Injection and Cross-Site Scripting (XSS)
 */

/**
 * Sanitizes an individual string value by neutralizing executable script tags and handlers,
 * while strictly preserving legitimate characters, names, symbols, and languages.
 */
function sanitizeString(str) {
  if (typeof str !== "string") return str;

  return str
    // Strip script tags
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    // Strip iframe tags
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
    // Neutralize dangerous inline javascript: pseudo-protocols
    .replace(/javascript:[^\s"'>]*/gi, "")
    // Neutralize dangerous inline event attributes like onerror=, onload=, onclick=
    .replace(/\bon[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "");
}

/**
 * Recursively sanitizes objects and arrays:
 * 1. Strips keys starting with '$' or containing '.' (NoSQL operator injection defense)
 * 2. Neutralizes executable XSS scripts in strings
 */
function sanitizeObject(data) {
  if (!data || typeof data !== "object") {
    if (typeof data === "string") {
      return sanitizeString(data);
    }
    return data;
  }

  if (Array.isArray(data)) {
    return data.map((item) => sanitizeObject(item));
  }

  const clean = {};
  for (const key of Object.keys(data)) {
    // Prevent NoSQL Injection: reject/strip keys with '$' or '.'
    if (key.startsWith("$") || key.includes(".")) {
      continue;
    }

    const value = data[key];
    clean[key] = sanitizeObject(value);
  }

  return clean;
}

/**
 * Global Express middleware for sanitizing req.body, req.query, and req.params
 */
function sanitizeInput(req, res, next) {
  try {
    if (req.body && typeof req.body === "object") {
      req.body = sanitizeObject(req.body);
    }
    if (req.query && typeof req.query === "object") {
      req.query = sanitizeObject(req.query);
    }
    if (req.params && typeof req.params === "object") {
      req.params = sanitizeObject(req.params);
    }
    next();
  } catch (err) {
    console.error("[SanitizeInput Error]:", err.message);
    next();
  }
}

module.exports = {
  sanitizeInput,
  sanitizeString,
  sanitizeObject
};
