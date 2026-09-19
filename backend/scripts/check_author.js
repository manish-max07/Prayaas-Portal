const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const Article = require("../src/models/Article");

async function check() {
  await mongoose.connect(process.env.MONGO_URI);
  const all = await Article.find({}, "title content");
  let found = 0;
  for (const a of all) {
    if (/content writer|email protected|Somya/i.test(a.content || "")) {
      found++;
      console.log("Found in:", a.title);
    }
  }
  console.log(`Total found: ${found} out of ${all.length}`);
  process.exit(0);
}

check().catch((err) => {
  console.error(err);
  process.exit(1);
});
