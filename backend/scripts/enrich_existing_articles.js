const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const Article = require("../src/models/Article");
const { scrapeArticleDetails } = require("../src/services/articleScraperService");

async function enrichArticles() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB!");

    // Find all articles that have a sourceUrl
    const articles = await Article.find({ sourceUrl: { $exists: true, $ne: "" } });
    console.log(`Found ${articles.length} articles with sourceUrl to review...`);

    let enrichedCount = 0;

    for (const art of articles) {
      console.log(`\nReviewing: "${art.title}" (${art.slug})`);
      console.log(`Source URL: ${art.sourceUrl}`);
      console.log(`Current content length: ${art.content ? art.content.length : 0}`);
      console.log(`Current direct link: ${art.directAdmitCardLink}`);

      // If sourceUrl is from testbook.com or adda247 or sarkari
      if (art.sourceUrl && art.sourceUrl.startsWith("http")) {
        console.log(`Scraping full rich details from ${art.sourceUrl}...`);
        const details = await scrapeArticleDetails(art.sourceUrl, art.title);

        let modified = false;

        if (details.content && details.content.length > 50) {
          art.content = details.content;
          modified = true;
          console.log(` -> Updated content! Length: ${details.content.length}`);
        }

        if (details.directPdfLink) {
          art.directAdmitCardLink = details.directPdfLink;
          modified = true;
          console.log(` -> Updated direct PDF link: ${details.directPdfLink}`);
        }

        if (details.overview && details.overview.length > 0) {
          art.overview = details.overview;
          modified = true;
          console.log(` -> Updated overview with ${details.overview.length} particulars`);
        }

        if (details.faqs && details.faqs.length > 0) {
          art.faqs = details.faqs;
          modified = true;
          console.log(` -> Updated FAQs with ${details.faqs.length} questions`);
        }

        if (details.officialWebsite) {
          art.officialWebsite = details.officialWebsite;
          modified = true;
        }

        if (details.featuredImage) {
          art.featuredImage = details.featuredImage;
          modified = true;
        }

        if (details.totalVacancies) {
          art.totalVacancies = details.totalVacancies;
          modified = true;
        }

        // Clean out dummy stepsToDownload if they were hardcoded boilerplate
        if (
          art.stepsToDownload &&
          art.stepsToDownload.length === 4 &&
          art.stepsToDownload[0].includes("Click on the direct official link")
        ) {
          art.stepsToDownload = [];
          modified = true;
        }

        if (modified) {
          art.lastUpdated = new Date();
          await art.save();
          enrichedCount++;
          console.log(`Successfully saved updated article in MongoDB!`);
        }
      }
    }

    console.log(`\n==========================================`);
    console.log(`Enrichment complete! Updated ${enrichedCount} article(s)`);
    console.log(`==========================================`);
    process.exit(0);
  } catch (err) {
    console.error("Enrichment failed:", err);
    process.exit(1);
  }
}

enrichArticles();
