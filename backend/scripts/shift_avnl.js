const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');

async function shiftExamSubmissions() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB.');

    const RankExam = require('../src/models/RankExam');
    const RankSubmission = require('../src/models/RankSubmission');

    const sourceExam = await RankExam.findOne({ slug: 'avnl-recruitment-2026' });
    const targetExam = await RankExam.findOne({ slug: 'avnl' });

    if (!sourceExam) {
      console.log('Source exam "AVNL Recruitment 2026" not found. Might already be shifted.');
      process.exit(0);
    }

    if (!targetExam) {
      console.error('Target exam "AVNL" not found!');
      process.exit(1);
    }

    console.log(`Shifting from "${sourceExam.name}" (${sourceExam._id}) to "${targetExam.name}" (${targetExam._id})`);

    const sourceSubmissions = await RankSubmission.find({ rankExam: sourceExam._id });
    console.log(`Found ${sourceSubmissions.length} submissions in "${sourceExam.name}".`);

    let movedCount = 0;
    let mergedCount = 0;

    for (const sub of sourceSubmissions) {
      // Check if target exam already has a submission for this participantId
      const existingInTarget = await RankSubmission.findOne({
        rankExam: targetExam._id,
        participantId: sub.participantId,
      });

      if (existingInTarget) {
        console.log(`Candidate ${sub.participantName} (Roll: ${sub.participantId}) already exists in target.`);
        // If source submission has a higher score or newer date, update the target record
        if (sub.totalScore > existingInTarget.totalScore || (sub.totalScore === existingInTarget.totalScore && sub.createdAt > existingInTarget.createdAt)) {
          console.log(`Updating target record with higher/newer score (${sub.totalScore}) from source.`);
          await RankSubmission.findByIdAndUpdate(existingInTarget._id, {
            ...sub.toObject(),
            _id: existingInTarget._id,
            rankExam: targetExam._id,
            examName: targetExam.name,
          });
        }
        // Remove source submission
        await RankSubmission.findByIdAndDelete(sub._id);
        mergedCount++;
      } else {
        // Move submission to target exam
        sub.rankExam = targetExam._id;
        sub.examName = targetExam.name;
        await sub.save();
        movedCount++;
        console.log(`Moved ${sub.participantName} (Roll: ${sub.participantId}) to target.`);
      }
    }

    console.log(`\nMigration completed: ${movedCount} moved, ${mergedCount} merged/deduplicated.`);

    // Delete the old "AVNL Recruitment 2026" exam model from RankExam collection
    await RankExam.findByIdAndDelete(sourceExam._id);
    console.log(`Deleted source exam "${sourceExam.name}" from database.`);

    // Verify final count in target exam
    const finalTargetCount = await RankSubmission.countDocuments({ rankExam: targetExam._id });
    console.log(`Total submissions in "${targetExam.name}" is now: ${finalTargetCount}`);

    // Verify remaining exams
    const remainingExams = await RankExam.find();
    console.log('Remaining active exams:', remainingExams.map(e => ({ name: e.name, slug: e.slug })));

    process.exit(0);
  } catch (err) {
    console.error('Migration error:', err);
    process.exit(1);
  }
}

shiftExamSubmissions();
