const path = require("path");

try {
  require("../src/services/articleScraperService");
  require("../src/controllers/autoArticleController");
  require("../src/utils/cronScheduler");
  console.log("All new backend auto-article modules verified successfully with 0 errors!");
} catch (err) {
  console.error("Verification failed:", err);
  process.exit(1);
}
