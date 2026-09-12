/**
 * Pure scoring function for Exam Attempts
 * 
 * @param {Array|Map} questions - Array of Question documents or Map<id, Question>
 * @param {Array} userAnswers - Array of user answer objects [{ question, selectedOption, status }]
 * @param {Boolean} negativeMarkingEnabled - Whether negative marking is active for the exam
 * @returns {Object} { score, totalMarks, correctCount, wrongCount, unansweredCount, scoredAnswers }
 */
const calculateAttemptScore = (questions, userAnswers = [], negativeMarkingEnabled = true) => {
  // Build lookup map for fast question lookup
  const questionMap = new Map();
  let totalMarks = 0;

  if (Array.isArray(questions)) {
    questions.forEach((q) => {
      const idStr = q._id.toString();
      questionMap.set(idStr, q);
      totalMarks += Number(q.marksForCorrect) || 1.0;
    });
  } else if (questions instanceof Map) {
    questions.forEach((q, id) => {
      questionMap.set(id.toString(), q);
      totalMarks += Number(q.marksForCorrect) || 1.0;
    });
  }

  // Answer lookup map from user
  const userAnswersMap = new Map();
  userAnswers.forEach((ans) => {
    if (ans.question) {
      const qId = ans.question._id ? ans.question._id.toString() : ans.question.toString();
      userAnswersMap.set(qId, ans);
    }
  });

  let score = 0;
  let correctCount = 0;
  let wrongCount = 0;
  let unansweredCount = 0;
  const scoredAnswers = [];

  // Iterate across all real exam questions
  for (const [qId, question] of questionMap.entries()) {
    const userAns = userAnswersMap.get(qId);
    const selectedOption = userAns && userAns.selectedOption !== undefined ? userAns.selectedOption : null;
    const currentStatus = userAns ? userAns.status : "not-visited";

    const marksForCorrect = Number(question.marksForCorrect) || 1.0;
    const rawNegativeMarks = Number(question.negativeMarks) || 0.25;
    const negativeMarks = negativeMarkingEnabled ? rawNegativeMarks : 0;

    let isCorrect = null;
    let marksAwarded = 0;

    const isAnswered =
      selectedOption !== null &&
      selectedOption !== undefined &&
      Number(selectedOption) >= 0 &&
      Number(selectedOption) <= 3 &&
      (currentStatus === "answered" || currentStatus === "answered-and-marked");

    if (isAnswered) {
      if (Number(selectedOption) === Number(question.correctOptionIndex)) {
        isCorrect = true;
        marksAwarded = marksForCorrect;
        correctCount++;
        score += marksAwarded;
      } else {
        isCorrect = false;
        marksAwarded = -negativeMarks;
        wrongCount++;
        score += marksAwarded;
      }
    } else {
      // Unanswered, not-visited, or marked-for-review without answer
      isCorrect = null;
      marksAwarded = 0;
      unansweredCount++;
    }

    scoredAnswers.push({
      question: question._id,
      selectedOption: selectedOption !== null ? Number(selectedOption) : null,
      status: currentStatus,
      isCorrect,
      marksAwarded: Number(marksAwarded.toFixed(2))
    });
  }

  // Clean rounding
  score = Number(score.toFixed(2));
  totalMarks = Number(totalMarks.toFixed(2));

  return {
    score,
    totalMarks,
    correctCount,
    wrongCount,
    unansweredCount,
    scoredAnswers
  };
};

module.exports = { calculateAttemptScore };
