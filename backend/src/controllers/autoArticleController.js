const { runAutoArticleIngestion } = require("../services/articleScraperService");

let lastSyncStats = null;
let isSyncing = false;

/**
 * @desc   Trigger real-time auto article crawl & deduplicated publish
 * @route  POST /api/admin/articles/sync
 * @access Private (Admin only)
 */
const triggerAutoSync = async (req, res) => {
  if (isSyncing) {
    return res.status(429).json({
      success: false,
      message: "Article sync is already currently running. Please wait a moment.",
    });
  }

  try {
    isSyncing = true;
    const stats = await runAutoArticleIngestion();
    lastSyncStats = {
      ...stats,
      timestamp: new Date().toISOString(),
    };

    return res.status(200).json({
      success: true,
      message: `Sync completed! Created ${stats.created} new article(s), skipped ${stats.duplicatesSkipped} duplicate(s).`,
      stats: lastSyncStats,
    });
  } catch (error) {
    console.error("Auto article sync error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to run article sync",
      error: error.message,
    });
  } finally {
    isSyncing = false;
  }
};

/**
 * @desc   Get last sync stats & status
 * @route  GET /api/admin/articles/sync-status
 * @access Private (Admin only)
 */
const getSyncStatus = async (req, res) => {
  return res.status(200).json({
    success: true,
    isSyncing,
    lastSync: lastSyncStats,
  });
};

module.exports = {
  triggerAutoSync,
  getSyncStatus,
};
