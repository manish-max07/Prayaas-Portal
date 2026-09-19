/**
 * CSRF Protection and Cross-Origin State-Changing Request Verifier
 */

const staticAllowedOrigins = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "https://prayaas-portal.vercel.app",
  "https://prayaaskaro.in",
  "https://www.prayaaskaro.in",
  "http://prayaaskaro.in",
  "http://www.prayaaskaro.in"
];

function isOriginAllowed(origin) {
  if (!origin) return false;
  const cleanOrigin = origin.replace(/\/$/, "").toLowerCase();

  const envOrigins = (process.env.FRONTEND_URL || "")
    .split(",")
    .map((o) => o.trim().toLowerCase())
    .filter(Boolean);

  const allOrigins = [...staticAllowedOrigins.map((o) => o.toLowerCase()), ...envOrigins];

  return (
    allOrigins.includes(cleanOrigin) ||
    /^https?:\/\/(?:[a-zA-Z0-9-]+\.)*prayaaskaro\.in$/.test(cleanOrigin) ||
    /^https?:\/\/prayaas-portal.*\.vercel\.app$/.test(cleanOrigin)
  );
}

/**
 * Middleware to enforce CSRF defenses on state-changing requests
 */
function csrfProtection(req, res, next) {
  const method = req.method.toUpperCase();

  // Safe HTTP methods do not change server state
  if (["GET", "HEAD", "OPTIONS"].includes(method)) {
    return next();
  }

  const origin = req.headers.origin;
  const referer = req.headers.referer;

  // 1. If Origin header is present (standard on cross-origin and modern fetch/XHR)
  if (origin) {
    if (!isOriginAllowed(origin)) {
      return res.status(403).json({
        success: false,
        message: "Cross-site request blocked by security policy (unauthorized origin)."
      });
    }
    return next();
  }

  // 2. If Referer header is present (when Origin is omitted by older browser forms)
  if (referer) {
    try {
      const refererUrl = new URL(referer);
      const refererOrigin = `${refererUrl.protocol}//${refererUrl.host}`;
      if (!isOriginAllowed(refererOrigin)) {
        return res.status(403).json({
          success: false,
          message: "Cross-site request blocked by security policy (unauthorized referer)."
        });
      }
      return next();
    } catch {
      return res.status(403).json({
        success: false,
        message: "Malformed referer header."
      });
    }
  }

  // 3. If neither Origin nor Referer is provided (e.g. native tools, mobile apps, direct curl):
  // Check if cookies are attached without custom anti-CSRF headers.
  // Standard browser form submissions cannot set custom headers, so requiring Authorization or X-Requested-With
  // guarantees protection against ambient cookie attacks.
  const hasCookieToken = req.cookies && (req.cookies.token || req.cookies.prayaas_token);
  const hasCustomHeader =
    req.headers.authorization ||
    req.headers["x-requested-with"] ||
    req.headers["x-csrf-protection"];

  if (hasCookieToken && !hasCustomHeader) {
    return res.status(403).json({
      success: false,
      message: "CSRF verification failed: custom header required for state-changing operations."
    });
  }

  next();
}

module.exports = {
  csrfProtection,
  isOriginAllowed
};
