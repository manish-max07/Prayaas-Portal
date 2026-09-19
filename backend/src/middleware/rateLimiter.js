const { isIpBlocked, isEmailBlocked, cleanIp } = require("../services/securityBlocklistService");

/**
 * In-memory sliding window rate limiter store with automatic TTL garbage collection
 */
class SlidingWindowStore {
  constructor(cleanupIntervalMs = 60 * 1000) {
    this.hits = new Map(); // key -> [timestamps]
    setInterval(() => this.cleanup(), cleanupIntervalMs).unref();
  }

  recordHit(key, windowMs) {
    const now = Date.now();
    const timestamps = this.hits.get(key) || [];
    const validTimestamps = timestamps.filter((ts) => now - ts < windowMs);
    validTimestamps.push(now);
    this.hits.set(key, validTimestamps);
    return validTimestamps.length;
  }

  cleanup() {
    const now = Date.now();
    const maxWindowMs = 60 * 60 * 1000; // 1 hour max retention
    for (const [key, timestamps] of this.hits.entries()) {
      const valid = timestamps.filter((ts) => now - ts < maxWindowMs);
      if (valid.length === 0) {
        this.hits.delete(key);
      } else {
        this.hits.set(key, valid);
      }
    }
  }
}

const rateLimitStore = new SlidingWindowStore();

/**
 * Extracts client IP safely from request headers (supporting reverse proxies)
 */
function getClientIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (forwarded) {
    const ips = forwarded.split(",");
    return cleanIp(ips[0].trim());
  }
  return cleanIp(req.socket?.remoteAddress || req.ip || "");
}

const { logSecurityEvent } = require("../utils/securityLogger");

/**
 * Creates multi-dimensional rate limiter middleware
 * @param {Object} options - { windowMs, maxPerIp, maxPerEmail, maxTotalEndpoint, dailyQuotaPerIp, message }
 */
function createMultiDimensionalLimiter(options) {
  const {
    windowMs = 15 * 60 * 1000, // 15 minutes default
    maxPerIp = 20,
    maxPerEmail = 5,
    maxTotalEndpoint = 200,
    dailyQuotaPerIp = null,    // Optional 24-hour quota per IP
    message = "Too many requests. Please wait a few minutes before trying again."
  } = options;

  return async (req, res, next) => {
    try {
      const clientIp = getClientIp(req);
      const email = req.body?.email ? String(req.body.email).trim().toLowerCase() : null;

      // 1. Immediate IP blocklist check
      if (clientIp && (await isIpBlocked(clientIp))) {
        logSecurityEvent("REQUEST_BLOCKED_IP", {
          ip: clientIp,
          severity: "WARN",
          details: { path: req.path }
        });
        return res.status(403).json({
          success: false,
          message: "Access from this network address is restricted."
        });
      }

      // 2. Immediate Email blocklist check
      if (email && (await isEmailBlocked(email))) {
        logSecurityEvent("REQUEST_BLOCKED_EMAIL", {
          ip: clientIp,
          identifier: email,
          severity: "WARN",
          details: { path: req.path }
        });
        return res.status(403).json({
          success: false,
          message: "Access for this account is restricted."
        });
      }

      // 3. Endpoint global throughput limit
      const endpointKey = `ep:${req.baseUrl || ""}${req.path}`;
      const endpointHits = rateLimitStore.recordHit(endpointKey, windowMs);
      if (endpointHits > maxTotalEndpoint) {
        logSecurityEvent("RATE_LIMIT_GLOBAL_ENDPOINT", {
          ip: clientIp,
          severity: "WARN",
          details: { path: req.path, hits: endpointHits }
        });
        return res.status(429).json({
          success: false,
          message
        });
      }

      // 4. IP-based short window rate limit
      if (clientIp) {
        const ipKey = `ip:${clientIp}:${req.path}`;
        const ipHits = rateLimitStore.recordHit(ipKey, windowMs);
        if (ipHits > maxPerIp) {
          logSecurityEvent("RATE_LIMIT_TRIGGERED_IP", {
            ip: clientIp,
            identifier: email,
            severity: "WARN",
            details: { path: req.path, hits: ipHits }
          });
          return res.status(429).json({
            success: false,
            message
          });
        }

        // 5. Daily quota per IP (if configured)
        if (dailyQuotaPerIp) {
          const dailyKey = `quota:${clientIp}:${req.path}`;
          const dailyHits = rateLimitStore.recordHit(dailyKey, 24 * 60 * 60 * 1000);
          if (dailyHits > dailyQuotaPerIp) {
            logSecurityEvent("DAILY_QUOTA_EXCEEDED", {
              ip: clientIp,
              severity: "SECURITY_ALERT",
              details: { path: req.path, dailyHits }
            });
            return res.status(429).json({
              success: false,
              message: "Daily request quota exceeded for this network address. Please try again tomorrow."
            });
          }
        }
      }

      // 6. Email-based rate limit
      if (email) {
        const emailKey = `email:${email}:${req.path}`;
        const emailHits = rateLimitStore.recordHit(emailKey, windowMs);
        if (emailHits > maxPerEmail) {
          logSecurityEvent("RATE_LIMIT_TRIGGERED_EMAIL", {
            ip: clientIp,
            identifier: email,
            severity: "WARN",
            details: { path: req.path, hits: emailHits }
          });
          return res.status(429).json({
            success: false,
            message
          });
        }
      }

      next();
    } catch (err) {
      console.error("[RateLimiter Error]:", err.message);
      next(); // Don't block user if rate limiter encounters internal error
    }
  };
}

// Pre-configured rate limiters
const signupRateLimiter = createMultiDimensionalLimiter({
  windowMs: 15 * 60 * 1000, // 15 mins
  maxPerIp: 10,              // Max 10 account signups per IP per 15 mins
  dailyQuotaPerIp: 30,       // Max 30 account creations per IP per 24 hours (anti-abuse quota)
  maxPerEmail: 5,            // Max 5 signup attempts per email per 15 mins
  maxTotalEndpoint: 150,     // Total signup traffic ceiling
  message: "Too many registration attempts from this source. Please try again in a few minutes."
});

const loginRateLimiter = createMultiDimensionalLimiter({
  windowMs: 15 * 60 * 1000, // 15 mins
  maxPerIp: 20,              // Max 20 login attempts per IP per 15 mins
  maxPerEmail: 6,            // Max 6 login attempts per targeted email per 15 mins
  maxTotalEndpoint: 300,
  message: "Too many login attempts. Please wait a few minutes before trying again."
});

const rankCalculationRateLimiter = createMultiDimensionalLimiter({
  windowMs: 5 * 60 * 1000, // 5 mins
  maxPerIp: 15,            // Max 15 calculations per IP per 5 mins
  maxTotalEndpoint: 200,
  message: "Too many rank calculation requests. Please wait a few minutes before trying again."
});

const proxyImageRateLimiter = createMultiDimensionalLimiter({
  windowMs: 1 * 60 * 1000, // 1 min
  maxPerIp: 80,            // Max 80 proxy calls per IP per min
  maxTotalEndpoint: 500,
  message: "Image request rate limit reached. Please wait a moment."
});

module.exports = {
  createMultiDimensionalLimiter,
  signupRateLimiter,
  loginRateLimiter,
  rankCalculationRateLimiter,
  proxyImageRateLimiter,
  getClientIp
};

