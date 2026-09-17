const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');

async function inspectParticipants() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const RankSubmission = require('../src/models/RankSubmission');

    const subsAvnlRecruitment = await RankSubmission.find({ rankExam: new mongoose.Types.ObjectId('6aa6fe4938c118ec22d63aaa') });
    console.log('--- AVNL Recruitment 2026 Submissions (to be shifted) ---');
    for (const s of subsAvnlRecruitment) {
      console.log(`ID: ${s._id} | Roll: ${s.participantId} | Name: ${s.participantName} | Score: ${s.totalScore} | Created: ${s.createdAt}`);
    }

    const subsAvnl = await RankSubmission.find({ rankExam: new mongoose.Types.ObjectId('6aa78b98ea99e365f78a79df') });
    console.log('--- AVNL Submissions (target) ---');
    for (const s of subsAvnl) {
      console.log(`ID: ${s._id} | Roll: ${s.participantId} | Name: ${s.participantName} | Score: ${s.totalScore} | Created: ${s.createdAt}`);
    }

    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

inspectParticipants();
