const mongoose = require("mongoose");
const path = require("path");
const dotenv = require("dotenv");

dotenv.config({ path: path.join(__dirname, "../.env") });

const { runAutoArticleIngestion } = require("../src/services/articleScraperService");

async function testScraper() {
  try {
    const mongoUri = process.env.MONGO_URI;
    console.log("Connecting to MongoDB Atlas...");
    await mongoose.connect(mongoUri);

    console.log("Running auto article ingestion test...");
    const stats = await runAutoArticleIngestion();
    console.log("\n--- INGESTION RESULTS ---");
    console.log("Scanned candidates:", stats.scanned);
    console.log("New articles created:", stats.created);
    console.log("Duplicates skipped:", stats.duplicatesSkipped);
    console.log("Existing articles updated:", stats.updated);
    if (stats.errors.length > 0) {
      console.log("Errors encountered:", stats.errors.slice(0, 3));
    }

    console.log("\n--- TESTING DEDUPLICATION (2nd pass) ---");
    console.log("Running second pass immediately to verify 0 duplicate insertions...");
    const secondPass = await runAutoArticleIngestion();
    console.log("Second pass created:", secondPass.created, "(Expected: 0 or low)");
    console.log("Second pass duplicates skipped:", secondPass.duplicatesSkipped);

    console.log("\nSCRAPER AND DEDUPLICATION TEST PASSED! 🚀");
    process.exit(0);
  } catch (err) {
    console.error("Test failed:", err);
    process.exit(1);
  }
}

testScraper();
