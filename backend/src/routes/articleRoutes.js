const express = require("express");
const router = express.Router();
const {
  getArticles,
  getArticleBySlug,
} = require("../controllers/articleController");

// Public routes for news articles
router.get("/", getArticles);
router.get("/:slug", getArticleBySlug);

module.exports = router;
