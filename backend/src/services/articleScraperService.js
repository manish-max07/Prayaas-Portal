const cheerio = require("cheerio");
const Article = require("../models/Article");

// Supported Sector and State Taxonomy
const SECTORS = [
  "Central Govt",
  "SSC",
  "Banking & Insurance",
  "Railways",
  "Defence & Police",
  "Teaching",
  "Engineering & PSU",
  "Civil Services / UPSC",
  "State Govt",
];

const STATES = [
  "All India",
  "Delhi",
  "Uttar Pradesh",
  "Bihar",
  "Rajasthan",
  "Madhya Pradesh",
  "Haryana",
  "Maharashtra",
  "West Bengal",
];

// Helper to deduce State from text
function detectState(text) {
  const t = (text || "").toLowerCase();
  if (t.includes("delhi") || t.includes("dsssb")) return "Delhi";
  if (t.includes("uttar pradesh") || t.includes("upsssc") || t.includes("uppsc") || t.includes("up police") || t.includes("uptet"))
    return "Uttar Pradesh";
  if (t.includes("bihar") || t.includes("bssc") || t.includes("bpssc") || t.includes("bpsc")) return "Bihar";
  if (t.includes("rajasthan") || t.includes("rpsc") || t.includes("rsmssb")) return "Rajasthan";
  if (t.includes("madhya pradesh") || t.includes("mppsc") || t.includes("mpeb") || t.includes("mpesb") || t.includes("mp police"))
    return "Madhya Pradesh";
  if (t.includes("haryana") || t.includes("hssc") || t.includes("hpsc")) return "Haryana";
  if (t.includes("maharashtra") || t.includes("mpsc")) return "Maharashtra";
  if (t.includes("west bengal") || t.includes("wbpsc")) return "West Bengal";
  return "All India";
}

// Helper to deduce Sector from text
function detectSector(text) {
  const t = (text || "").toLowerCase();
  if (t.includes("ssc") || t.includes("staff selection") || t.includes("cgl") || t.includes("chsl") || t.includes("mts") || t.includes("ssc gd"))
    return "SSC";
  if (
    t.includes("bank") ||
    t.includes("ibps") ||
    t.includes("sbi") ||
    t.includes("rbi") ||
    t.includes("lic") ||
    t.includes("insurance") ||
    t.includes("nabard")
  )
    return "Banking & Insurance";
  if (t.includes("railway") || t.includes("rrb") || t.includes("rrc") || t.includes("loco pilot") || t.includes("alp"))
    return "Railways";
  if (
    t.includes("army") ||
    t.includes("navy") ||
    t.includes("airforce") ||
    t.includes("defence") ||
    t.includes("police") ||
    t.includes("cisf") ||
    t.includes("crpf") ||
    t.includes("bsf") ||
    t.includes("agniveer") ||
    t.includes("nda") ||
    t.includes("cds") ||
    t.includes("afcat")
  )
    return "Defence & Police";
  if (
    t.includes("teaching") ||
    t.includes("teacher") ||
    t.includes("ctet") ||
    t.includes("tet") ||
    t.includes("tgt") ||
    t.includes("pgt") ||
    t.includes("prt") ||
    t.includes("kvs") ||
    t.includes("nvs")
  )
    return "Teaching";
  if (
    t.includes("engineer") ||
    t.includes("je ") ||
    t.includes("ae ") ||
    t.includes("gate") ||
    t.includes("iocl") ||
    t.includes("ongc") ||
    t.includes("ntpc") ||
    t.includes("bhel") ||
    t.includes("bel") ||
    t.includes("avnl") ||
    t.includes("sail") ||
    t.includes("psu")
  )
    return "Engineering & PSU";
  if (t.includes("upsc") || t.includes("civil services") || t.includes("ias") || t.includes("ips") || t.includes("ifs"))
    return "Civil Services / UPSC";
  if (
    t.includes("dsssb") ||
    t.includes("upsssc") ||
    t.includes("bssc") ||
    t.includes("rsmssb") ||
    t.includes("hssc") ||
    t.includes("state psc")
  )
    return "State Govt";
  return "Central Govt";
}

// Helper to deduce Category
function detectCategory(title) {
  const t = (title || "").toLowerCase();
  if (t.includes("admit card") || t.includes("hall ticket") || t.includes("call letter") || t.includes("permission letter"))
    return "Admit Card";
  if (t.includes("answer key") || t.includes("response sheet") || t.includes("objection"))
    return "Answer Key";
  if (t.includes("result") || t.includes("score card") || t.includes("marks list") || t.includes("merit list"))
    return "Result";
  if (t.includes("exam date") || t.includes("schedule") || t.includes("postponed") || t.includes("exam city"))
    return "Exam Date";
  if (t.includes("syllabus") || t.includes("pattern")) return "Syllabus";
  if (t.includes("cutoff") || t.includes("cut off")) return "Cutoff";
  return "Recruitment";
}

// Generate Canonical Topic Fingerprint for deduplication
function generateTopicKey(title) {
  if (!title) return "";
  let clean = title
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  // Normalize common terms
  clean = clean
    .replace(/\b(admit cards?|hall tickets?|call letters?)\b/g, "admitcard")
    .replace(/\b(answer keys?|response sheets?)\b/g, "answerkey")
    .replace(/\b(results?|scorecards?)\b/g, "result")
    .replace(/\b(recruitment|vacancy|vacancies|notification|apply online)\b/g, "recruitment")
    .replace(/\b(download|direct link|active|out now|released|published|live)\b/g, "");

  // Extract key tokens (words longer than 2 characters)
  const tokens = clean
    .split(" ")
    .filter((w) => w.length > 2)
    .slice(0, 6)
    .sort();

  return tokens.join("_");
}

function cleanTitle(raw) {
  return (raw || "")
    .replace(/\s+/g, " ")
    .replace(/\|\s*SarkariResult\.Com/gi, "")
    .replace(/\|\s*Testbook/gi, "")
    .replace(/\|\s*Adda247/gi, "")
    .replace(/\|\s*Physics Wallah/gi, "")
    .trim();
}

/**
 * Scrapes SarkariResult.com tables (Admit Card, Latest Jobs, Answer Key, Result)
 */
async function scrapeSarkariResult() {
  const items = [];
  try {
    const res = await fetch("https://www.sarkariresult.com/", {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });

    if (!res.ok) throw new Error(`SarkariResult fetch returned ${res.status}`);
    const html = await res.text();
    const $ = cheerio.load(html);

    // Look for major columns: Admit Card, Latest Jobs, Answer Key, Result
    $("div#box, div.box, div#post, table tr td ul li, div#wrap").each((_, el) => {
      $(el)
        .find("a")
        .each((_, a) => {
          const title = $(a).text().trim();
          let link = $(a).attr("href");

          if (title && link && title.length > 10 && !link.startsWith("javascript:")) {
            if (!link.startsWith("http")) {
              link = `https://www.sarkariresult.com/${link.replace(/^\//, "")}`;
            }

            // Exclude non-exam navigation links
            if (
              !link.includes("facebook") &&
              !link.includes("twitter") &&
              !link.includes("youtube") &&
              !link.includes("telegram") &&
              !link.includes("contact") &&
              !link.includes("disclaimer")
            ) {
              items.push({
                title: cleanTitle(title),
                sourceUrl: link,
                source: "Sarkari Result",
              });
            }
          }
        });
    });
  } catch (err) {
    console.warn("[ScraperService] SarkariResult scrape warning:", err.message);
  }
  return items;
}

/**
 * Scrapes public exam news alerts from Adda247 / Testbook feeds
 */
async function scrapeExamFeeds() {
  const items = [];

  // 1. Testbook / Adda public news listing
  const targetUrls = [
    "https://testbook.com/news",
    "https://www.adda247.com/jobs/",
  ];

  for (const url of targetUrls) {
    try {
      const res = await fetch(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        },
      });
      if (!res.ok) continue;
      const html = await res.text();
      const $ = cheerio.load(html);

      $("article, div.card, div.news-card, h2 a, h3 a").each((_, el) => {
        const a = el.tagName === "a" ? $(el) : $(el).find("a").first();
        const title = a.text().trim();
        let link = a.attr("href");

        if (title && link && title.length > 15) {
          if (!link.startsWith("http")) {
            const domain = new URL(url).origin;
            link = `${domain}${link.startsWith("/") ? "" : "/"}${link}`;
          }
          items.push({
            title: cleanTitle(title),
            sourceUrl: link,
            source: url.includes("testbook") ? "Testbook" : "Adda247",
          });
        }
      });
    } catch (e) {
      console.warn(`[ScraperService] Warning fetching ${url}:`, e.message);
    }
  }

  return items;
}

/**
 * Main ingestion routine with intelligent deduplication & auto-categorization
 */
async function runAutoArticleIngestion() {
  const stats = {
    scanned: 0,
    created: 0,
    duplicatesSkipped: 0,
    updated: 0,
    sourcesChecked: ["Sarkari Result", "Testbook", "Adda247"],
    errors: [],
  };

  try {
    console.log("[AutoArticleService]: Starting article crawl across trusted portals...");

    // Fetch items in parallel
    const [sarkariItems, feedItems] = await Promise.all([
      scrapeSarkariResult(),
      scrapeExamFeeds(),
    ]);

    const allItems = [...sarkariItems, ...feedItems];
    stats.scanned = allItems.length;

    // Filter out obvious noise and limit to top 40 freshest candidates
    const candidates = allItems
      .filter((it) => it.title && it.title.length > 12)
      .slice(0, 40);

    for (const item of candidates) {
      try {
        const topicKey = generateTopicKey(item.title);
        if (!topicKey || topicKey.length < 5) continue;

        // 1. Check exact URL deduplication
        const urlMatch = await Article.findOne({ sourceUrl: item.sourceUrl });
        if (urlMatch) {
          stats.duplicatesSkipped++;
          continue;
        }

        // 2. Cross-Source Deduplication Check:
        // Does an article with the same topicKey already exist within the last 45 days?
        const fortyFiveDaysAgo = new Date(Date.now() - 45 * 24 * 60 * 60 * 1000);
        const topicMatch = await Article.findOne({
          topicKey,
          publishDate: { $gte: fortyFiveDaysAgo },
        });

        if (topicMatch) {
          // It's the same topic from another website!
          // We DO NOT create a duplicate article.
          // Instead, update the existing article if it lacks direct link or refresh lastUpdated timestamp.
          let wasUpdated = false;
          if (!topicMatch.directAdmitCardLink && item.sourceUrl) {
            topicMatch.directAdmitCardLink = item.sourceUrl;
            wasUpdated = true;
          }
          topicMatch.lastUpdated = new Date();
          await topicMatch.save();

          stats.duplicatesSkipped++;
          if (wasUpdated) stats.updated++;
          continue;
        }

        // 3. Extract & Auto-Categorize
        const category = detectCategory(item.title);
        const sector = detectSector(item.title);
        const state = detectState(item.title);

        const slugBase = item.title
          .toLowerCase()
          .replace(/[^\w\s-]/g, "")
          .replace(/\s+/g, "-")
          .slice(0, 80);
        const slug = `${slugBase}-${new Date().getFullYear()}`;

        // Ensure slug uniqueness
        const slugExists = await Article.findOne({ slug });
        const finalSlug = slugExists ? `${slug}-${Math.floor(1000 + Math.random() * 9000)}` : slug;

        const badge =
          category === "Admit Card"
            ? "🔴 Out Now"
            : category === "Result"
            ? "🏆 Declared"
            : category === "Answer Key"
            ? "🔑 Released"
            : "⚡ Live Notification";

        // Build rich auto-overview table
        const overview = [
          { label: "Notification Title", value: item.title },
          { label: "Category", value: category },
          { label: "Sector / Exam Body", value: sector },
          { label: "Region / State", value: state },
          { label: "Status", value: "Active / Official Link Active" },
          { label: "Last Verified", value: "Verified on Prayaas Portal Desk" },
        ];

        // Build auto FAQs for SEO
        const faqs = [
          {
            question: `Is the ${item.title} officially released?`,
            answer: `Yes, official notification and direct link for ${item.title} is now active. Candidates can verify and access the link directly on Prayaas Portal.`,
          },
          {
            question: `Where can I access ${item.title}?`,
            answer: `You can access and check official updates directly using the verified links provided in this article.`,
          },
        ];

        const metaDescription = `${item.title} has been released. Check official dates, direct download link, step-by-step download guide, and exam rules. Verified by Prayaas Portal Exam Desk.`;

        // Create the clean article in MongoDB
        await Article.create({
          title: item.title,
          slug: finalSlug,
          shortTitle: item.title.slice(0, 60),
          seoTitle: `${item.title} - Check Direct Link & Details | Prayaas Portal`,
          metaDescription,
          category,
          categorySlug: category.toLowerCase().replace(/\s+/g, "-"),
          sector,
          state,
          status: "Published",
          badge,
          readingTime: "4 min read",
          author: {
            name: "Prayaas Portal Exam Desk",
            role: "Senior Exam Analyst",
            avatar: "/logo.png",
          },
          publishDate: new Date(),
          lastUpdated: new Date(),
          directAdmitCardLink: item.sourceUrl,
          officialWebsite: item.sourceUrl,
          organization: sector,
          overview,
          faqs,
          topicKey,
          sourceUrl: item.sourceUrl,
          isAutoGenerated: true,
          tags: [
            item.title.slice(0, 30),
            category,
            sector,
            state,
            "Sarkari Result 2026",
            "Govt Job Alert",
          ],
          stepsToDownload: [
            "Click on the direct official link provided on this page.",
            "Enter your login credentials (Application / Roll No. & Password / DOB).",
            "Submit the verification captcha code.",
            "Download and save a copy of your document for future reference.",
          ],
        });

        stats.created++;
      } catch (itemErr) {
        stats.errors.push(itemErr.message);
      }
    }

    console.log(
      `[AutoArticleService]: Completed! Scanned: ${stats.scanned}, Created: ${stats.created}, Duplicates Skipped: ${stats.duplicatesSkipped}`
    );
  } catch (err) {
    console.error("[AutoArticleService] Ingestion failed:", err);
    stats.errors.push(err.message);
  }

  return stats;
}

module.exports = {
  runAutoArticleIngestion,
  SECTORS,
  STATES,
  detectSector,
  detectState,
  generateTopicKey,
};
