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
  if (t.includes("upsc") || t.includes("civil services") || t.includes("ias") || t.includes("ips") || t.includes("ifs") || t.includes("ese"))
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
 * Scrapes full article details, rich tables, direct CDN PDF link, real overview table, and FAQs from source article URL
 */
async function scrapeArticleDetails(url, fallbackTitle = "") {
  const result = {
    directPdfLink: "",
    officialWebsite: "",
    overview: [],
    faqs: [],
    featuredImage: "",
    content: "",
    totalVacancies: "",
  };

  if (!url || !url.startsWith("http")) return result;

  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    });

    if (!res.ok) return result;
    const html = await res.text();
    const $ = cheerio.load(html);

    // 1. Direct PDF Link extraction
    $("a").each((_, a) => {
      let href = $(a).attr("href") || "";
      const linkText = $(a).text().trim().toLowerCase();

      // If it's a testbook pdf-viewer URL, decode it
      if (href.includes("pdf-viewer?u=")) {
        const encoded = href.split("pdf-viewer?u=")[1];
        if (encoded) {
          try {
            href = decodeURIComponent(encoded);
          } catch (e) {}
        }
      }

      // Check if link points directly to CDN PDF
      if (href.includes("cdn.testbook.com") && href.includes(".pdf")) {
        if (
          !result.directPdfLink ||
          linkText.includes("notification") ||
          linkText.includes("admit card") ||
          linkText.includes("click to download") ||
          linkText.includes("pdf")
        ) {
          result.directPdfLink = href;
        }
      } else if (href.endsWith(".pdf") && !result.directPdfLink) {
        result.directPdfLink = href;
      }

      // Detect official website
      if (
        (href.includes(".gov.in") ||
          href.includes(".nic.in") ||
          href.includes(".ac.in") ||
          href.includes("iocl.com") ||
          href.includes("ibps.in") ||
          href.includes("sbi.co.in")) &&
        !href.includes("google.com")
      ) {
        if (!result.officialWebsite) {
          result.officialWebsite = href;
        }
      }
    });

    // 2. FAQs from Schema
    $('script[type="application/ld+json"]').each((_, el) => {
      try {
        const json = JSON.parse($(el).html());
        if (json["@type"] === "FAQPage" && Array.isArray(json.mainEntity)) {
          result.faqs = json.mainEntity
            .map((item) => ({
              question: item.name ? item.name.trim() : "",
              answer: item.acceptedAnswer?.text ? item.acceptedAnswer.text.trim() : "",
            }))
            .filter((f) => f.question && f.answer);
        }
      } catch (e) {}
    });

    // 3. Featured Image
    result.featuredImage =
      $('meta[property="og:image"]').attr("content") ||
      $(".post-thumbnail img, .entry-image img").attr("src") ||
      "";

    // 4. Real Overview Table Extraction
    const entryContent = $(".entry-content, article, .post-content, main");
    entryContent.find("table").each((_, table) => {
      const headerText = $(table).find("th, tr:first-child").text();
      if (
        (headerText.includes("Particulars") && headerText.includes("Details")) ||
        headerText.includes("Conducting Body") ||
        headerText.includes("Exam Name")
      ) {
        $(table).find("tr").each((__, tr) => {
          const cells = $(tr).find("td");
          if (cells.length >= 2) {
            const label = $(cells[0]).text().trim();
            const value = $(cells[1]).text().trim();
            if (label && value && label !== "Particulars") {
              result.overview.push({ label, value });
              if (label.toLowerCase().includes("vacanc") && !result.totalVacancies) {
                result.totalVacancies = value;
              }
              if (label.toLowerCase().includes("official website") && !result.officialWebsite) {
                const websiteLink = $(cells[1]).find("a").attr("href") || value;
                result.officialWebsite = websiteLink.startsWith("http") ? websiteLink : `https://${websiteLink}`;
              }
            }
          }
        });
      }
    });

    // 5. Full Content and Tables Sanitization
    const contentClone = $(".entry-content").first().clone();
    if (contentClone.length > 0) {
      // Remove junk, tracking, and promotional clutter
      contentClone.find("script, style, noscript, iframe, link").remove();
      contentClone.find("#shareBtnWrap, .heading-share, .share-btn").remove();
      contentClone.find("#downloadAppBtn, #getStartedBtn").remove();
      contentClone.find(".code-block").remove();
      contentClone.find("div").each((_, div) => {
        const text = $(div).text() || "";
        if (
          text.includes("Add Testbook as Preferred Source") ||
          text.includes("Download App") ||
          text.includes("Get Started for Free")
        ) {
          $(div).remove();
        }
      });
      contentClone.find("a[href*='link.testbook.com']").remove();
      contentClone.find("a[href*='testbook.com/login']").remove();

      // Style all tables so they look great and are horizontally scrollable on mobile
      contentClone.find("table").each((_, table) => {
        $(table).removeAttr("style");
        $(table).removeAttr("border");
        $(table).removeAttr("width");
        $(table).removeAttr("height");
        $(table).addClass("min-w-full border-collapse border border-slate-200 text-xs sm:text-sm my-3");
        $(table).wrap('<div class="overflow-x-auto my-4 rounded-xl border border-slate-200 shadow-2xs"></div>');
        $(table).find("th").addClass("bg-slate-50 font-bold p-3 border border-slate-200 text-slate-800 text-left");
        $(table).find("td").addClass("p-3 border border-slate-200 text-slate-700");
      });

      // Style headings
      contentClone.find("h2").each((_, h2) => {
        $(h2).addClass("text-lg sm:text-xl font-bold text-slate-900 border-l-4 border-blue-600 pl-3 mt-8 mb-3");
      });
      contentClone.find("h3").each((_, h3) => {
        $(h3).addClass("text-base sm:text-lg font-bold text-slate-800 mt-6 mb-2");
      });
      contentClone.find("p").each((_, p) => {
        $(p).addClass("text-xs sm:text-sm text-slate-700 leading-relaxed my-2.5");
      });
      contentClone.find("ul").addClass("list-disc list-inside text-xs sm:text-sm text-slate-700 space-y-1 my-2.5 pl-2");
      contentClone.find("ol").addClass("list-decimal list-inside text-xs sm:text-sm text-slate-700 space-y-1 my-2.5 pl-2");

      // Style download/action buttons
      contentClone.find("a.tb-auto-button, a[class*='button']").each((_, btn) => {
        $(btn).removeClass();
        $(btn).addClass("inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm transition my-3 shadow-xs");
        $(btn).attr("style", "color: #ffffff !important; text-decoration: none !important; font-weight: 700;");
        $(btn).attr("target", "_blank");
        $(btn).attr("rel", "noopener noreferrer");
      });

      result.content = contentClone.html()?.trim() || "";
    }
  } catch (err) {
    console.warn(`[ScraperService] Warning scraping detail page ${url}:`, err.message);
  }

  return result;
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
 * Main ingestion routine with intelligent deduplication, full detail scraping & rich tables
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

    // Filter out obvious noise and limit to top 40 candidates
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
          // If already existing but lacks content or CDN PDF link, re-enrich it
          if (!urlMatch.content || !urlMatch.directAdmitCardLink || urlMatch.directAdmitCardLink.includes("testbook.com/news")) {
            const details = await scrapeArticleDetails(item.sourceUrl, item.title);
            if (details.content) urlMatch.content = details.content;
            if (details.directPdfLink) urlMatch.directAdmitCardLink = details.directPdfLink;
            if (details.overview.length > 0) urlMatch.overview = details.overview;
            if (details.faqs.length > 0) urlMatch.faqs = details.faqs;
            if (details.officialWebsite) urlMatch.officialWebsite = details.officialWebsite;
            if (details.featuredImage) urlMatch.featuredImage = details.featuredImage;
            urlMatch.lastUpdated = new Date();
            await urlMatch.save();
            stats.updated++;
          }
          stats.duplicatesSkipped++;
          continue;
        }

        // 2. Cross-Source Deduplication Check:
        const fortyFiveDaysAgo = new Date(Date.now() - 45 * 24 * 60 * 60 * 1000);
        const topicMatch = await Article.findOne({
          topicKey,
          publishDate: { $gte: fortyFiveDaysAgo },
        });

        if (topicMatch) {
          let wasUpdated = false;
          // If existing topic lacks rich content, re-enrich it from this source
          if (!topicMatch.content || topicMatch.directAdmitCardLink?.includes("testbook.com/news")) {
            const details = await scrapeArticleDetails(item.sourceUrl, item.title);
            if (details.content) topicMatch.content = details.content;
            if (details.directPdfLink) topicMatch.directAdmitCardLink = details.directPdfLink;
            if (details.overview.length > 0) topicMatch.overview = details.overview;
            if (details.faqs.length > 0) topicMatch.faqs = details.faqs;
            if (details.officialWebsite) topicMatch.officialWebsite = details.officialWebsite;
            if (details.featuredImage) topicMatch.featuredImage = details.featuredImage;
            wasUpdated = true;
          }
          topicMatch.lastUpdated = new Date();
          await topicMatch.save();

          stats.duplicatesSkipped++;
          if (wasUpdated) stats.updated++;
          continue;
        }

        // 3. Scrape Full Article Details from Source URL!
        console.log(`[AutoArticleService]: Scraping full details for "${item.title}"...`);
        const details = await scrapeArticleDetails(item.sourceUrl, item.title);

        // 4. Extract & Auto-Categorize
        const category = detectCategory(item.title);
        const sector = detectSector(item.title);
        const state = detectState(item.title);

        const slugBase = item.title
          .toLowerCase()
          .replace(/[^\w\s-]/g, "")
          .replace(/\s+/g, "-")
          .slice(0, 80);

        const slug = `${slugBase}-${new Date().getFullYear()}`;
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

        // Use real extracted overview or fallback
        const overview =
          details.overview.length > 0
            ? details.overview
            : [
                { label: "Notification Title", value: item.title },
                { label: "Category", value: category },
                { label: "Sector / Exam Body", value: sector },
                { label: "Region / State", value: state },
                { label: "Status", value: "Active / Official Link Active" },
              ];

        // Use real extracted FAQs or fallback
        const faqs =
          details.faqs.length > 0
            ? details.faqs
            : [
                {
                  question: `Is the ${item.title} officially released?`,
                  answer: `Yes, official notification for ${item.title} is active. Candidates can verify and download the official notification PDF directly on Prayaas Portal.`,
                },
                {
                  question: `Where can I access ${item.title}?`,
                  answer: `You can access and check official updates directly using the verified links provided in this article.`,
                },
              ];

        const metaDescription = `${item.title} has been released. Check vacancies, eligibility, official notification PDF download link, and exam dates. Verified by Prayaas Portal Exam Desk.`;

        const directLink = details.directPdfLink || details.officialWebsite || item.sourceUrl;

        // Create the rich article in MongoDB
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
          readingTime: "5 min read",
          author: {
            name: "Prayaas Karo Exam Desk",
            role: "Senior Exam Analyst",
            avatar: "/PrayaasKaroLogoWithoutText.png",
          },
          publishDate: new Date(),
          lastUpdated: new Date(),
          directAdmitCardLink: directLink,
          officialWebsite: details.officialWebsite || directLink,
          organization: sector,
          totalVacancies: details.totalVacancies,
          featuredImage: details.featuredImage,
          overview,
          faqs,
          content: details.content,
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
        });

        stats.created++;
      } catch (itemErr) {
        stats.errors.push(itemErr.message);
      }
    }

    console.log(
      `[AutoArticleService]: Completed! Scanned: ${stats.scanned}, Created: ${stats.created}, Updated: ${stats.updated}, Duplicates Skipped: ${stats.duplicatesSkipped}`
    );
  } catch (err) {
    console.error("[AutoArticleService] Ingestion failed:", err);
    stats.errors.push(err.message);
  }

  return stats;
}

module.exports = {
  runAutoArticleIngestion,
  scrapeArticleDetails,
  SECTORS,
  STATES,
  detectSector,
  detectState,
  generateTopicKey,
};
