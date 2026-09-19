const bcrypt = require("bcryptjs");
const Admin = require("../models/Admin");
const generateToken = require("../utils/generateToken");
const { logSecurityEvent } = require("../utils/securityLogger");
const { getClientIp } = require("../middleware/rateLimiter");

const DUMMY_HASH = "$2a$10$wE9q.OqB6Jq2Z9NfM7bFbeJzU3lVzP4L0D0qVb8J5t1R.k8v7b6k2";

// @desc    Admin login & get token
// @route   POST /api/admin/login
// @access  Public
const adminLogin = async (req, res, next) => {
  try {
    const clientIp = getClientIp(req);
    const { username, password } = req.body;

    if (!username || !password || typeof username !== "string" || typeof password !== "string") {
      return res.status(400).json({
        success: false,
        message: "Please provide admin username and password."
      });
    }

    if (password.length > 128) {
      logSecurityEvent("ADMIN_LOGIN_FAILURE_OVERLONG_PASSWORD", {
        ip: clientIp,
        identifier: username,
        severity: "SECURITY_ALERT"
      });
      return res.status(401).json({
        success: false,
        message: "Invalid admin credentials."
      });
    }

    // Find admin by username (with password)
    const admin = await Admin.findOne({ username: username.trim() }).select("+password");
    if (!admin) {
      await bcrypt.compare(password, DUMMY_HASH);
      logSecurityEvent("ADMIN_LOGIN_FAILURE_UNKNOWN", {
        ip: clientIp,
        identifier: username,
        severity: "SECURITY_ALERT"
      });
      return res.status(401).json({
        success: false,
        message: "Invalid admin credentials."
      });
    }

    const isMatch = await admin.matchPassword(password);
    if (!isMatch) {
      logSecurityEvent("ADMIN_LOGIN_FAILURE_BAD_PASSWORD", {
        ip: clientIp,
        identifier: username,
        severity: "SECURITY_ALERT"
      });
      return res.status(401).json({
        success: false,
        message: "Invalid admin credentials."
      });
    }

    const token = generateToken(admin._id, admin.role);

    logSecurityEvent("ADMIN_LOGIN_SUCCESS", {
      ip: clientIp,
      identifier: admin.username,
      severity: "INFO",
      details: { adminId: admin._id }
    });

    res.status(200).json({
      success: true,
      message: "Admin authentication successful.",
      token,
      admin: {
        id: admin._id,
        username: admin.username,
        role: admin.role,
        createdAt: admin.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Change admin password
// @route   POST /api/admin/change-password
// @access  Private (Admin Only)
const adminChangePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Please provide both current and new passwords."
      });
    }

    if (newPassword.length < 5) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 5 characters long."
      });
    }

    const admin = await Admin.findById(req.user._id).select("+password");
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found."
      });
    }

    const isMatch = await admin.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Current password does not match."
      });
    }

    // Update password (triggers pre-save bcrypt hash hook)
    admin.password = newPassword;
    await admin.save();

    res.status(200).json({
      success: true,
      message: "Admin password changed successfully."
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in admin
// @route   GET /api/admin/me
// @access  Private (Admin Only)
const getAdminMe = async (req, res, next) => {
  try {
    const admin = await Admin.findById(req.user._id).select("-password");
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found."
      });
    }

    res.status(200).json({
      success: true,
      admin: {
        id: admin._id,
        username: admin.username,
        role: admin.role,
        createdAt: admin.createdAt,
        updatedAt: admin.updatedAt
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  adminLogin,
  adminChangePassword,
  getAdminMe
};
