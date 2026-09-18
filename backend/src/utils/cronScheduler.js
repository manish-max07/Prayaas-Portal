const { runAutoArticleIngestion } = require("../services/articleScraperService");

let intervalId = null;

/**
 * Initializes automatic background article monitor.
 * Runs every 2 hours by default.
 */
function initArticleCron(intervalMinutes = 120) {
  if (intervalId) return;

  console.log(
    `[ArticleScheduler]: Started background crawler (Running every ${intervalMinutes} mins)`
  );

  // Initial delay of 15 seconds after server boot so server starts cleanly
  setTimeout(() => {
    runAutoArticleIngestion().catch((err) =>
      console.warn("[ArticleScheduler] Initial run failed:", err.message)
    );
  }, 15000);

  // Periodic timer
  intervalId = setInterval(() => {
    runAutoArticleIngestion().catch((err) =>
      console.warn("[ArticleScheduler] Periodic run failed:", err.message)
    );
  }, intervalMinutes * 60 * 1000);
}

module.exports = { initArticleCron };
