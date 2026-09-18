const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/adminOnlyMiddleware");
const {
  adminGetArticles,
  adminGetArticleById,
  adminCreateArticle,
  adminUpdateArticle,
  adminDeleteArticle,
} = require("../controllers/articleController");
const {
  triggerAutoSync,
  getSyncStatus,
} = require("../controllers/autoArticleController");

// Protect all admin article routes
router.use(protect);
router.use(adminOnly);

// Auto-ingest sync endpoints
router.post("/sync", triggerAutoSync);
router.get("/sync-status", getSyncStatus);

router.get("/", adminGetArticles);
router.get("/:id", adminGetArticleById);
router.post("/", adminCreateArticle);
router.put("/:id", adminUpdateArticle);
router.delete("/:id", adminDeleteArticle);

module.exports = router;
