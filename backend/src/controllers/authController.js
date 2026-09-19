const bcrypt = require("bcryptjs");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const {
  validateRegistrationInput,
  validateLoginInput
} = require("../utils/authValidators");
const {
  isIpBlocked,
  isEmailBlocked,
  isDomainBlocked
} = require("../services/securityBlocklistService");
const { getClientIp } = require("../middleware/rateLimiter");

// Pre-computed bcrypt dummy hash for constant-time comparison against nonexistent users
const DUMMY_HASH = "$2a$10$wE9q.OqB6Jq2Z9NfM7bFbeJzU3lVzP4L0D0qVb8J5t1R.k8v7b6k2";

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res, next) => {
  try {
    const clientIp = getClientIp(req);

    // 1. IP Blocklist Check
    if (clientIp && (await isIpBlocked(clientIp))) {
      return res.status(403).json({
        success: false,
        message: "Registration is not permitted from this network address."
      });
    }

    const { name, email, password, confirmPassword } = req.body;

    // 2. Comprehensive Server-Side Input Validation
    const validation = validateRegistrationInput({ name, email, password, confirmPassword });
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: validation.error
      });
    }

    const { name: cleanName, email: cleanEmail, password: cleanPassword } = validation.sanitized;

    // 3. Email-specific Blocklist Check
    if (await isEmailBlocked(cleanEmail)) {
      return res.status(403).json({
        success: false,
        message: "This email address is not eligible for registration."
      });
    }

    // 4. Disposable Domain Blocklist Check
    const blockDisposable = process.env.BLOCK_DISPOSABLE_EMAIL !== "false";
    if (blockDisposable && (await isDomainBlocked(cleanEmail))) {
      return res.status(400).json({
        success: false,
        message:
          "Disposable or temporary email services are not permitted. Please use an official or permanent email address."
      });
    }

    // 5. Check if user already exists (Account Enumeration Defense)
    const userExists = await User.findOne({ email: cleanEmail });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message:
          "Unable to complete registration with the provided information. If you already have an account, please try signing in or resetting your password."
      });
    }

    // 6. Create User (confirmPassword is never stored)
    const user = await User.create({
      name: cleanName,
      email: cleanEmail,
      password: cleanPassword,
      role: "user",
      emailVerified: false
    });

    const token = generateToken(user._id, user.role);

    res.status(201).json({
      success: true,
      message: "Registration successful.",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res, next) => {
  try {
    const clientIp = getClientIp(req);

    // 1. IP Blocklist Check
    if (clientIp && (await isIpBlocked(clientIp))) {
      return res.status(403).json({
        success: false,
        message: "Access is restricted from this network address."
      });
    }

    // 2. Validate Input
    const validation = validateLoginInput(req.body);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: validation.error
      });
    }

    const { email: cleanEmail, password: cleanPassword } = validation.sanitized;

    // 3. Email Blocklist Check
    if (await isEmailBlocked(cleanEmail)) {
      return res.status(403).json({
        success: false,
        message: "Access for this account is restricted."
      });
    }

    // 4. Find user by email
    const user = await User.findOne({ email: cleanEmail }).select("+password");

    // Timing-attack mitigation: if user does not exist, run dummy compare
    if (!user) {
      await bcrypt.compare(cleanPassword, DUMMY_HASH);
      return res.status(401).json({
        success: false,
        message: "Invalid email or password."
      });
    }

    // 5. Check if account is temporarily locked
    if (user.isLocked()) {
      const remainingMinutes = Math.ceil((user.lockUntil.getTime() - Date.now()) / (60 * 1000));
      return res.status(423).json({
        success: false,
        message: `Account is temporarily locked due to multiple failed login attempts. Please try again in ${Math.max(1, remainingMinutes)} minute(s).`
      });
    }

    // 6. Verify password
    const isMatch = await user.matchPassword(cleanPassword);
    if (!isMatch) {
      // Increment failed attempts and trigger temporary lockout if >= 5
      await user.incrementLoginAttempts();
      const suspiciousActivity = (user.failedLoginAttempts || 0) >= 3;

      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
        requiresChallenge: suspiciousActivity
      });
    }

    // 7. Successful Authentication: Reset failed login count
    if (user.failedLoginAttempts > 0 || user.lockUntil) {
      await user.resetLoginAttempts();
    }

    const token = generateToken(user._id, user.role);

    res.status(200).json({
      success: true,
      message: "Login successful.",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private (User)
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found."
      });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe
};
