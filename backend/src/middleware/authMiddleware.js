const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Admin = require("../models/Admin");

const protect = async (req, res, next) => {
  let token;

  // 1. Check Authorization header (Bearer <token>)
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies && (req.cookies.token || req.cookies.prayaas_token)) {
    // 2. Fallback: check cookie.
    // For state-changing operations, reject ambient cookie auth unless accompanied by a custom header
    const method = req.method.toUpperCase();
    const isStateChanging = ["POST", "PUT", "PATCH", "DELETE"].includes(method);
    const hasCustomHeader =
      req.headers["x-requested-with"] ||
      req.headers["x-csrf-protection"] ||
      req.headers.authorization;

    if (isStateChanging && !hasCustomHeader) {
      return res.status(403).json({
        success: false,
        message: "CSRF verification: custom header required for state-changing operations with cookie credentials."
      });
    }

    token = req.cookies.token || req.cookies.prayaas_token;
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Not authorized to access this route. No token provided."
    });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    if (decoded.role === "admin") {
      const admin = await Admin.findById(decoded.id).select("-password");
      if (!admin) {
        return res.status(401).json({
          success: false,
          message: "Admin account not found with this token."
        });
      }
      req.user = admin;
    } else {
      const user = await User.findById(decoded.id).select("-password");
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "User account not found with this token."
        });
      }
      req.user = user;
    }

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Not authorized. Token verification failed or expired."
    });
  }
};

module.exports = { protect };
