const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');

async function clean() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const RankExam = require('../src/models/RankExam');
    const RankSubmission = require('../src/models/RankSubmission');

    // First check if any submission is linked to AVNL Recruitment 2026
    const avnlTarget = await RankExam.findOne({ slug: 'avnl' });
    const oldExams = await RankExam.find({
      $or: [
        { slug: 'avnl-recruitment-2026' },
        { name: { $regex: /^avnl recruitment 2026$/i } },
      ],
    });

    for (const old of oldExams) {
      console.log(`Found old exam: ${old.name} (${old._id})`);
      if (avnlTarget) {
        // Shift any remaining submissions
        const subs = await RankSubmission.find({ rankExam: old._id });
        for (const sub of subs) {
          const exists = await RankSubmission.findOne({ rankExam: avnlTarget._id, participantId: sub.participantId });
          if (!exists) {
            sub.rankExam = avnlTarget._id;
            sub.examName = avnlTarget.name;
            await sub.save();
            console.log(`Shifted sub ${sub.participantId} to AVNL`);
          } else {
            await RankSubmission.findByIdAndDelete(sub._id);
            console.log(`Removed duplicate sub ${sub.participantId}`);
          }
        }
      }
      await RankExam.findByIdAndDelete(old._id);
      console.log(`Deleted exam ${old._id}`);
    }

    const remaining = await RankExam.find();
    console.log('REMAINING EXAMS:', remaining.map(e => ({ name: e.name, slug: e.slug })));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

clean();
