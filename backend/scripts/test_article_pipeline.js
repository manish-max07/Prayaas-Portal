const mongoose = require("mongoose");
const path = require("path");
const dotenv = require("dotenv");

dotenv.config({ path: path.join(__dirname, "../.env") });

const Article = require("../src/models/Article");

async function testPipeline() {
  try {
    const mongoUri = process.env.MONGO_URI;
    console.log("Connecting to MongoDB Atlas...");
    await mongoose.connect(mongoUri);

    // 1. Check existing seeded articles
    const seeded = await Article.findOne({ slug: "iocl-engineer-officer-admit-card-2026" });
    console.log("Found seeded article:", seeded ? `"${seeded.title}"` : "Not found");
    if (!seeded) throw new Error("Seeded article not found!");

    // 2. Create test article
    const testSlug = `test-ssc-cgl-${Date.now()}`;
    const newArticle = await Article.create({
      title: "SSC CGL 2026 Tier 1 Admit Card Released",
      slug: testSlug,
      category: "Admit Card",
      status: "Published",
      badge: "⚡ New",
      organization: "Staff Selection Commission (SSC)",
      postName: "Group B & C Posts",
      totalVacancies: "14,500 Posts",
      examDate: "12th to 26th October 2026",
      metaDescription: "SSC CGL 2026 Tier 1 hall ticket download link active.",
      overview: [
        { label: "Conducting Body", value: "Staff Selection Commission (SSC)" },
        { label: "Exam Level", value: "National Level" },
      ],
      faqs: [
        {
          question: "When is SSC CGL 2026 Tier 1 exam?",
          answer: "The exam will be held from 12th to 26th October 2026.",
        },
      ],
    });
    console.log("Created test article:", newArticle._id.toString(), newArticle.slug);

    // 3. Query the test article
    const fetched = await Article.findOne({ slug: testSlug });
    console.log("Successfully fetched article by slug:", `"${fetched.title}"`, "with", fetched.overview.length, "overview rows");

    // 4. Update the test article
    fetched.badge = "🔴 Active Now";
    await fetched.save();
    console.log("Updated badge successfully to:", fetched.badge);

    // 5. Clean up the test article
    await Article.findByIdAndDelete(fetched._id);
    console.log("Test article cleaned up cleanly!");

    console.log("\nALL DATABASE TESTS PASSED END-TO-END! 🚀");
    process.exit(0);
  } catch (err) {
    console.error("Test pipeline failed:", err);
    process.exit(1);
  }
}

testPipeline();
