const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);
require('dotenv').config({ path: 'd:/[05] Projects/Prayaas-Portal/backend/.env' });
const mongoose = require('mongoose');

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB successfully!');
    const RankExam = require('../src/models/RankExam');
    const RankSubmission = require('../src/models/RankSubmission');

    const exams = await RankExam.find();
    console.log('Exams found:', exams.map(e => ({ id: e._id, name: e.name, slug: e.slug })));

    for (const e of exams) {
      const count = await RankSubmission.countDocuments({ rankExam: e._id });
      console.log(`Exam "${e.name}" (${e._id}) has ${count} submissions`);
    }

    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

run();
