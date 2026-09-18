const Article = require("../models/Article");

// Helper to estimate reading time
function calculateReadingTime(text) {
  if (!text) return "3 min read";
  const words = text.trim().split(/\s+/).length;
  const minutes = Math.ceil(words / 180);
  return `${Math.max(1, minutes)} min read`;
}

// ==========================================
// PUBLIC CONTROLLERS
// ==========================================

/**
 * @desc   Get all published articles with filters & pagination
 * @route  GET /api/articles
 * @access Public
 */
const getArticles = async (req, res) => {
  try {
    const { category, q, page = 1, limit = 30 } = req.query;

    const query = { status: "Published" };

    if (category && category !== "All") {
      query.category = category;
    }

    if (q && q.trim() !== "") {
      const regex = new RegExp(q.trim(), "i");
      query.$or = [
        { title: regex },
        { shortTitle: regex },
        { organization: regex },
        { metaDescription: regex },
        { tags: regex },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Article.countDocuments(query);

    const articles = await Article.find(query)
      .sort({ publishDate: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select(
        "title slug shortTitle category categorySlug badge publishDate lastUpdated readingTime organization totalVacancies examDate admitCardReleaseDate metaDescription tags views featuredImage"
      )
      .lean();

    return res.status(200).json({
      success: true,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      articles,
    });
  } catch (error) {
    console.error("Error fetching articles:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch articles",
      error: error.message,
    });
  }
};

/**
 * @desc   Get single article by slug
 * @route  GET /api/articles/:slug
 * @access Public
 */
const getArticleBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const article = await Article.findOne({ slug });

    if (!article) {
      return res.status(404).json({
        success: false,
        message: "Article not found",
      });
    }

    // Only allow Published articles for public
    if (article.status !== "Published") {
      return res.status(404).json({
        success: false,
        message: "Article is not published",
      });
    }

    // Increment views asynchronously without blocking
    Article.findByIdAndUpdate(article._id, { $inc: { views: 1 } }).exec();

    // Get related articles (same category, different slug)
    const relatedArticles = await Article.find({
      status: "Published",
      slug: { $ne: slug },
      $or: [{ category: article.category }, { category: { $exists: true } }],
    })
      .sort({ publishDate: -1 })
      .limit(3)
      .select("title slug shortTitle category badge publishDate readingTime organization")
      .lean();

    return res.status(200).json({
      success: true,
      article,
      relatedArticles,
    });
  } catch (error) {
    console.error("Error fetching article by slug:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch article",
      error: error.message,
    });
  }
};

// ==========================================
// ADMIN CONTROLLERS
// ==========================================

/**
 * @desc   Get all articles for Admin (including Drafts)
 * @route  GET /api/admin/articles
 * @access Private (Admin only)
 */
const adminGetArticles = async (req, res) => {
  try {
    const { status, category, q, page = 1, limit = 50 } = req.query;

    const query = {};
    if (status) query.status = status;
    if (category && category !== "All") query.category = category;
    if (q && q.trim() !== "") {
      const regex = new RegExp(q.trim(), "i");
      query.$or = [{ title: regex }, { slug: regex }, { organization: regex }];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Article.countDocuments(query);

    const articles = await Article.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select("title slug shortTitle category status badge publishDate lastUpdated views organization")
      .lean();

    return res.status(200).json({
      success: true,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      articles,
    });
  } catch (error) {
    console.error("Admin fetch articles error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch admin articles",
      error: error.message,
    });
  }
};

/**
 * @desc   Get full article details by ID for Admin editing
 * @route  GET /api/admin/articles/:id
 * @access Private (Admin only)
 */
const adminGetArticleById = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) {
      return res.status(404).json({
        success: false,
        message: "Article not found",
      });
    }

    return res.status(200).json({
      success: true,
      article,
    });
  } catch (error) {
    console.error("Admin get article by ID error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load article",
      error: error.message,
    });
  }
};

/**
 * @desc   Create new article
 * @route  POST /api/admin/articles
 * @access Private (Admin only)
 */
const adminCreateArticle = async (req, res) => {
  try {
    const data = { ...req.body };

    // Format slug if not manually entered
    if (!data.slug && data.title) {
      data.slug = data.title
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-")
        .slice(0, 100);
    } else if (data.slug) {
      data.slug = data.slug
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-")
        .slice(0, 100);
    }

    // Check slug uniqueness
    const existing = await Article.findOne({ slug: data.slug });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `An article with slug "${data.slug}" already exists. Please choose a different slug or title.`,
      });
    }

    // Compute reading time
    if (!data.readingTime) {
      const combinedText = `${data.title} ${data.metaDescription || ""} ${data.content || ""} ${JSON.stringify(data.faqs || [])}`;
      data.readingTime = calculateReadingTime(combinedText);
    }

    if (!data.seoTitle) {
      data.seoTitle = data.title;
    }

    if (!data.shortTitle) {
      data.shortTitle = data.title;
    }

    const article = await Article.create(data);

    return res.status(201).json({
      success: true,
      message: "Article published successfully",
      article,
    });
  } catch (error) {
    console.error("Admin create article error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create article",
    });
  }
};

/**
 * @desc   Update article by ID
 * @route  PUT /api/admin/articles/:id
 * @access Private (Admin only)
 */
const adminUpdateArticle = async (req, res) => {
  try {
    const { id } = req.params;
    const data = { ...req.body };

    const article = await Article.findById(id);
    if (!article) {
      return res.status(404).json({
        success: false,
        message: "Article not found",
      });
    }

    // If slug is changed, check uniqueness
    if (data.slug && data.slug !== article.slug) {
      data.slug = data.slug
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-")
        .slice(0, 100);

      const existing = await Article.findOne({ slug: data.slug, _id: { $ne: id } });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: `Slug "${data.slug}" is already in use by another article.`,
        });
      }
    }

    data.lastUpdated = new Date();

    const updatedArticle = await Article.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });

    return res.status(200).json({
      success: true,
      message: "Article updated successfully",
      article: updatedArticle,
    });
  } catch (error) {
    console.error("Admin update article error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update article",
    });
  }
};

/**
 * @desc   Delete article by ID
 * @route  DELETE /api/admin/articles/:id
 * @access Private (Admin only)
 */
const adminDeleteArticle = async (req, res) => {
  try {
    const { id } = req.params;

    const article = await Article.findByIdAndDelete(id);
    if (!article) {
      return res.status(404).json({
        success: false,
        message: "Article not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Article deleted successfully",
    });
  } catch (error) {
    console.error("Admin delete article error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete article",
      error: error.message,
    });
  }
};

module.exports = {
  getArticles,
  getArticleBySlug,
  adminGetArticles,
  adminGetArticleById,
  adminCreateArticle,
  adminUpdateArticle,
  adminDeleteArticle,
};
