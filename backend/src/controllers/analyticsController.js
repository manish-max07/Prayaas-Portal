const SiteAnalytics = require("../models/SiteAnalytics");
const Article = require("../models/Article");

function getIndianDateString(offsetDays = 0) {
  const d = new Date();
  if (offsetDays !== 0) {
    d.setDate(d.getDate() + offsetDays);
  }
  return d.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" }); // Returns "YYYY-MM-DD"
}

/**
 * @desc   Record a page view (site-wide or article)
 * @route  POST /api/analytics/visit
 * @access Public
 */
const recordVisit = async (req, res) => {
  try {
    const { path = "/", slug, visitorId } = req.body || {};
    const today = getIndianDateString();

    // 1. If it's an article visit, increment article views
    if (slug) {
      Article.findOneAndUpdate(
        { slug: slug.toLowerCase().trim() },
        { $inc: { views: 1 } }
      ).exec().catch(() => {});
    }

    // 2. Normalize route path for high-level aggregation
    let normalizedPath = path.split("?")[0] || "/";
    if (normalizedPath.startsWith("/news/") && normalizedPath.length > 6) {
      normalizedPath = "/news/[slug]";
    } else if (normalizedPath.startsWith("/exam/") && normalizedPath.length > 6) {
      normalizedPath = "/exam/[examId]";
    }

    // 3. Atomically update or insert global analytics
    let doc = await SiteAnalytics.findOne({ key: "global" });
    if (!doc) {
      doc = new SiteAnalytics({
        key: "global",
        totalVisits: 0,
        dailyVisits: [],
        routeHits: [],
      });
    }

    doc.totalVisits = (doc.totalVisits || 0) + 1;
    doc.lastUpdated = new Date();

    // Update daily visits
    const dayEntry = doc.dailyVisits.find((d) => d.date === today);
    if (dayEntry) {
      dayEntry.visits += 1;
      if (visitorId && Array.isArray(dayEntry.uniqueIps) && dayEntry.uniqueIps.length < 5000) {
        if (!dayEntry.uniqueIps.includes(visitorId)) {
          dayEntry.uniqueIps.push(visitorId);
        }
      }
    } else {
      doc.dailyVisits.push({
        date: today,
        visits: 1,
        uniqueIps: visitorId ? [visitorId] : [],
      });
    }

    // Keep last 45 days of daily stats
    if (doc.dailyVisits.length > 45) {
      doc.dailyVisits = doc.dailyVisits.slice(-45);
    }

    // Update route hits
    const routeEntry = doc.routeHits.find((r) => r.path === normalizedPath);
    if (routeEntry) {
      routeEntry.count += 1;
    } else {
      doc.routeHits.push({ path: normalizedPath, count: 1 });
    }

    await doc.save();

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("[Analytics] Error recording visit:", err.message);
    return res.status(200).json({ success: false }); // Always 200 so clients never fail
  }
};

/**
 * @desc   Get aggregated analytics for Admin Dashboard
 * @route  GET /api/analytics/admin/summary
 * @access Private (Admin only)
 */
const getAdminAnalytics = async (req, res) => {
  try {
    const today = getIndianDateString();
    const yesterday = getIndianDateString(-1);

    const [siteDoc, articleAgg, topArticles] = await Promise.all([
      SiteAnalytics.findOne({ key: "global" }).lean(),
      Article.aggregate([
        { $match: { status: "Published" } },
        { $group: { _id: null, totalViews: { $sum: "$views" } } },
      ]),
      Article.find({ status: "Published" })
        .sort({ views: -1, publishDate: -1 })
        .limit(8)
        .select("title slug category sector state views publishDate")
        .lean(),
    ]);

    const totalSiteVisits = siteDoc?.totalVisits || 0;
    const dailyList = siteDoc?.dailyVisits || [];
    const todayData = dailyList.find((d) => d.date === today);
    const yesterdayData = dailyList.find((d) => d.date === yesterday);

    const todayVisits = todayData?.visits || 0;
    const todayUnique = todayData?.uniqueIps?.length || todayVisits;
    const yesterdayVisits = yesterdayData?.visits || 0;
    const totalArticleViews = articleAgg[0]?.totalViews || 0;

    // Last 14 days chart data
    const last14Days = dailyList.slice(-14).map((item) => ({
      date: item.date,
      visits: item.visits,
      unique: item.uniqueIps ? item.uniqueIps.length : item.visits,
    }));

    // Top visited routes
    const popularRoutes = (siteDoc?.routeHits || [])
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    return res.status(200).json({
      success: true,
      metrics: {
        totalSiteVisits,
        todayVisits,
        todayUnique,
        yesterdayVisits,
        totalArticleViews,
      },
      last14Days,
      popularRoutes,
      topArticles,
    });
  } catch (err) {
    console.error("[Analytics] Error getting admin analytics:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve analytics data",
    });
  }
};

module.exports = {
  recordVisit,
  getAdminAnalytics,
};
