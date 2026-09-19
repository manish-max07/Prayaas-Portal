const SecurityBlocklist = require("../models/SecurityBlocklist");

// Curated high-confidence disposable email domains
const DEFAULT_DISPOSABLE_DOMAINS = [
  "10minutemail.com",
  "10minutemail.net",
  "tempmail.com",
  "temp-mail.org",
  "guerrillamail.com",
  "guerrillamail.net",
  "guerrillamail.org",
  "mailinator.com",
  "throwawaymail.com",
  "yopmail.com",
  "yopmail.fr",
  "sharklasers.com",
  "dispostable.com",
  "trashmail.com",
  "trashmail.net",
  "getnada.com",
  "crazymailing.com",
  "maildrop.cc",
  "mohmal.com",
  "generator.email",
  "inboxkitten.com",
  "fakemailgenerator.com",
  "burnermail.io",
  "mytemp.email"
];

// In-memory cache for ultra-fast security checks
let blocklistCache = {
  ips: new Set(),
  emails: new Set(),
  domains: new Set(),
  lastUpdated: 0
};

const CACHE_TTL_MS = 60 * 1000; // 1 minute TTL

/**
 * Reloads the in-memory cache of actively blocked items from MongoDB
 */
async function reloadCache() {
  try {
    const activeBlocks = await SecurityBlocklist.find({ status: "blocked" }).lean();
    const newIps = new Set();
    const newEmails = new Set();
    const newDomains = new Set();

    for (const item of activeBlocks) {
      if (item.type === "ip") newIps.add(item.value.toLowerCase());
      if (item.type === "email") newEmails.add(item.value.toLowerCase());
      if (item.type === "domain") newDomains.add(item.value.toLowerCase());
    }

    blocklistCache = {
      ips: newIps,
      emails: newEmails,
      domains: newDomains,
      lastUpdated: Date.now()
    };
  } catch (err) {
    console.error("[SecurityBlocklistService] Cache reload error:", err.message);
  }
}

/**
 * Ensures cache freshness
 */
async function ensureCache() {
  if (Date.now() - blocklistCache.lastUpdated > CACHE_TTL_MS) {
    await reloadCache();
  }
}

/**
 * Normalizes an IP address (stripping IPv6 mapping e.g. ::ffff:)
 */
function cleanIp(ip) {
  if (!ip) return "";
  let cleaned = String(ip).trim();
  if (cleaned.startsWith("::ffff:")) {
    cleaned = cleaned.replace("::ffff:", "");
  }
  return cleaned.toLowerCase();
}

/**
 * Checks if an IP is actively blocked
 */
async function isIpBlocked(ip) {
  const targetIp = cleanIp(ip);
  if (!targetIp) return false;

  await ensureCache();
  if (blocklistCache.ips.has(targetIp)) {
    return true;
  }

  // Fallback direct DB check if cache might have missed a very recent entry
  const exists = await SecurityBlocklist.findOne({
    type: "ip",
    value: targetIp,
    status: "blocked"
  }).lean();

  if (exists) {
    blocklistCache.ips.add(targetIp);
    return true;
  }
  return false;
}

/**
 * Checks if a specific email address is actively blocked
 */
async function isEmailBlocked(email) {
  if (!email) return false;
  const targetEmail = String(email).trim().toLowerCase();

  await ensureCache();
  if (blocklistCache.emails.has(targetEmail)) {
    return true;
  }

  const exists = await SecurityBlocklist.findOne({
    type: "email",
    value: targetEmail,
    status: "blocked"
  }).lean();

  if (exists) {
    blocklistCache.emails.add(targetEmail);
    return true;
  }
  return false;
}

/**
 * Checks if the domain of an email address is an actively blocked domain
 */
async function isDomainBlocked(emailOrDomain) {
  if (!emailOrDomain) return false;
  let domain = String(emailOrDomain).trim().toLowerCase();
  if (domain.includes("@")) {
    domain = domain.split("@").pop().trim();
  }

  await ensureCache();
  if (blocklistCache.domains.has(domain)) {
    return true;
  }

  const exists = await SecurityBlocklist.findOne({
    type: "domain",
    value: domain,
    status: "blocked"
  }).lean();

  if (exists) {
    blocklistCache.domains.add(domain);
    return true;
  }
  return false;
}

/**
 * Seeds default high-confidence disposable email domains into the database
 */
async function seedDefaultDisposableDomains(adminUsername = "system") {
  const results = { added: 0, existing: 0 };

  for (const domain of DEFAULT_DISPOSABLE_DOMAINS) {
    const existing = await SecurityBlocklist.findOne({ type: "domain", value: domain });
    if (!existing) {
      await SecurityBlocklist.create({
        type: "domain",
        value: domain,
        reason: "Known disposable/temporary email provider",
        status: "blocked",
        addedBy: adminUsername
      });
      results.added++;
    } else {
      results.existing++;
    }
  }

  await reloadCache();
  return results;
}

module.exports = {
  isIpBlocked,
  isEmailBlocked,
  isDomainBlocked,
  seedDefaultDisposableDomains,
  reloadCache,
  cleanIp,
  DEFAULT_DISPOSABLE_DOMAINS
};
