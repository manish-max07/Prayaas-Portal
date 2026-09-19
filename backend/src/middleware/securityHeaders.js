/**
 * Production HTTP Security Headers Middleware for Express API
 */

function securityHeaders(req, res, next) {
  // Prevent MIME type sniffing
  res.setHeader("X-Content-Type-Options", "nosniff");

  // Prevent clickjacking / embedding in iframes
  res.setHeader("X-Frame-Options", "SAMEORIGIN");

  // Control referrer information sent in requests
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");

  // Enforce HTTPS across domain and subdomains (1 year max-age)
  res.setHeader(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains; preload"
  );

  // Restrict browser features and hardware APIs
  res.setHeader(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), payment=(), usb=()"
  );

  // Cross-Origin Opener Policy
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin");

  // Disable browser DNS prefetching
  res.setHeader("X-DNS-Prefetch-Control", "off");

  // Remove Express powered-by header
  res.removeHeader("X-Powered-By");

  next();
}

module.exports = { securityHeaders };
