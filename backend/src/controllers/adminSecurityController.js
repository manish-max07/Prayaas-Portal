const SecurityBlocklist = require("../models/SecurityBlocklist");
const {
  seedDefaultDisposableDomains,
  reloadCache,
  cleanIp
} = require("../services/securityBlocklistService");
const { EMAIL_REGEX } = require("../utils/authValidators");

// Helper to validate IP format (IPv4 or IPv6)
function isValidIp(ip) {
  const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
  return ipv4Regex.test(ip) || ipv6Regex.test(ip);
}

// Helper to validate domain name
function isValidDomain(domain) {
  const domainRegex = /^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  return domainRegex.test(domain);
}

// @desc    Get all blocklist items with statistics and filtering
// @route   GET /api/admin/security/blocklist
// @access  Private (Admin Only)
const getBlocklist = async (req, res, next) => {
  try {
    const { type, status = "all", search = "", page = 1, limit = 50 } = req.query;

    const query = {};

    // Filter by type
    if (type && ["domain", "email", "ip"].includes(type)) {
      query.type = type;
    }

    // Filter by status
    if (status && ["blocked", "unblocked"].includes(status)) {
      query.status = status;
    }

    // Search query on value or reason
    if (search.trim()) {
      const searchRegex = new RegExp(search.trim(), "i");
      query.$or = [{ value: searchRegex }, { reason: searchRegex }];
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(200, Math.max(1, parseInt(limit, 10) || 50));
    const skip = (pageNum - 1) * limitNum;

    const [items, totalCount, activeStats] = await Promise.all([
      SecurityBlocklist.find(query)
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      SecurityBlocklist.countDocuments(query),
      SecurityBlocklist.aggregate([
        {
          $group: {
            _id: { type: "$type", status: "$status" },
            count: { $sum: 1 }
          }
        }
      ])
    ]);

    // Process stats
    const stats = {
      totalActiveBlocked: 0,
      activeDomains: 0,
      activeEmails: 0,
      activeIps: 0,
      totalUnblocked: 0
    };

    activeStats.forEach((group) => {
      if (group._id.status === "blocked") {
        stats.totalActiveBlocked += group.count;
        if (group._id.type === "domain") stats.activeDomains = group.count;
        if (group._id.type === "email") stats.activeEmails = group.count;
        if (group._id.type === "ip") stats.activeIps = group.count;
      } else if (group._id.status === "unblocked") {
        stats.totalUnblocked += group.count;
      }
    });

    res.status(200).json({
      success: true,
      stats,
      data: items,
      pagination: {
        total: totalCount,
        page: pageNum,
        pages: Math.ceil(totalCount / limitNum),
        limit: limitNum
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add or re-block a blocklist entry
// @route   POST /api/admin/security/blocklist
// @access  Private (Admin Only)
const addBlocklistEntry = async (req, res, next) => {
  try {
    const { type, value, reason = "" } = req.body;
    const adminUsername = req.user?.username || "admin";

    if (!type || !["domain", "email", "ip"].includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Please specify a valid type: 'domain', 'email', or 'ip'."
      });
    }

    if (!value || typeof value !== "string") {
      return res.status(400).json({
        success: false,
        message: "Please provide a value to block."
      });
    }

    let cleanValue = value.trim().toLowerCase();

    // Format validation per type
    if (type === "ip") {
      cleanValue = cleanIp(cleanValue);
      if (!isValidIp(cleanValue)) {
        return res.status(400).json({
          success: false,
          message: "Please enter a valid IPv4 or IPv6 address."
        });
      }
    } else if (type === "email") {
      if (!EMAIL_REGEX.test(cleanValue)) {
        return res.status(400).json({
          success: false,
          message: "Please enter a valid email address."
        });
      }
    } else if (type === "domain") {
      // If user pasted email instead of domain, extract domain
      if (cleanValue.includes("@")) {
        cleanValue = cleanValue.split("@").pop().trim();
      }
      if (!isValidDomain(cleanValue)) {
        return res.status(400).json({
          success: false,
          message: "Please enter a valid domain name (e.g. tempmail.com)."
        });
      }
    }

    // Check if entry already exists in database
    const existing = await SecurityBlocklist.findOne({ type, value: cleanValue });

    if (existing) {
      if (existing.status === "blocked") {
        return res.status(400).json({
          success: false,
          message: `This ${type} is already actively blocked.`
        });
      }

      // Re-block previously unblocked item
      existing.status = "blocked";
      existing.reason = reason.trim() || existing.reason;
      existing.addedBy = adminUsername;
      existing.unblockedBy = null;
      existing.unblockedAt = null;
      await existing.save();

      await reloadCache();

      return res.status(200).json({
        success: true,
        message: `${type.toUpperCase()} '${cleanValue}' has been re-blocked.`,
        entry: existing
      });
    }

    // Create new entry
    const newEntry = await SecurityBlocklist.create({
      type,
      value: cleanValue,
      reason: reason.trim(),
      status: "blocked",
      addedBy: adminUsername
    });

    await reloadCache();

    res.status(201).json({
      success: true,
      message: `${type.toUpperCase()} '${cleanValue}' added to blocklist.`,
      entry: newEntry
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle block/unblock status (Remove from blocklist or Re-block)
// @route   PATCH /api/admin/security/blocklist/:id/toggle
// @access  Private (Admin Only)
const toggleBlocklistEntry = async (req, res, next) => {
  try {
    const { id } = req.params;
    const adminUsername = req.user?.username || "admin";

    const entry = await SecurityBlocklist.findById(id);
    if (!entry) {
      return res.status(404).json({
        success: false,
        message: "Blocklist entry not found."
      });
    }

    if (entry.status === "blocked") {
      // Remove from active blocklist -> Set status to unblocked
      entry.status = "unblocked";
      entry.unblockedAt = new Date();
      entry.unblockedBy = adminUsername;
    } else {
      // Re-block entry
      entry.status = "blocked";
      entry.unblockedAt = null;
      entry.unblockedBy = null;
      entry.addedBy = adminUsername;
    }

    await entry.save();
    await reloadCache();

    res.status(200).json({
      success: true,
      message:
        entry.status === "blocked"
          ? `${entry.type.toUpperCase()} '${entry.value}' is now re-blocked.`
          : `${entry.type.toUpperCase()} '${entry.value}' removed from active blocklist.`,
      entry
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Seed standard disposable domains into DB
// @route   POST /api/admin/security/seed-defaults
// @access  Private (Admin Only)
const seedDefaultDomains = async (req, res, next) => {
  try {
    const adminUsername = req.user?.username || "admin";
    const results = await seedDefaultDisposableDomains(adminUsername);

    res.status(200).json({
      success: true,
      message: `Seeded default disposable domains: ${results.added} new added, ${results.existing} already configured.`,
      results
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getBlocklist,
  addBlocklistEntry,
  toggleBlocklistEntry,
  seedDefaultDomains
};
