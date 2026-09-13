// Native fetch is built into Node.js v18+

/**
 * Parses official TCS iON / Digialm Response Sheet HTML
 * @param {string} html Raw HTML content of the response sheet
 * @param {object} markingScheme { marksForCorrect: 1.0, negativeMarks: 0.25 }
 * @returns {object} Parsed candidate info, scoring summary, and sectional breakdown
 */
function parseResponseSheetHtml(html, markingScheme = { marksForCorrect: 1.0, negativeMarks: 0.25 }) {
  if (!html || typeof html !== "string") {
    throw new Error("Invalid HTML content provided.");
  }

  const marksForCorrect = markingScheme.marksForCorrect ?? 1.0;
  const negativeMarks = markingScheme.negativeMarks ?? 0.25;

  // 1. Extract Candidate & Test Information
  const candidateInfo = {
    participantId: "",
    participantName: "Candidate",
    testCenterName: "",
    testDate: "",
    testTime: "",
    subject: "General",
    examLanguage: "English",
    headerImageUrl: "",
  };

  // Extract Department / PSU header banner image from response sheet HTML
  // Usually the very first <img> tag or an image containing "banner" or inside the header table
  const imgMatches = html.matchAll(/<img[^>]+src=["']([^"']+)["'][^>]*>/gi);
  for (const im of imgMatches) {
    const src = im[1].trim();
    if (!src.includes("tick.png") && !src.includes("cross.png") && !src.includes("adcimages")) {
      candidateInfo.headerImageUrl = src;
      break;
    }
  }

  const tableMatch = html.match(/<table border="1" cellpadding="1" cellspacing="1"[^>]*>([\s\S]*?)<\/table>/i);
  if (tableMatch) {
    const rowMatches = tableMatch[1].matchAll(/<tr>\s*<td>(.*?)<\/td>\s*<td>(.*?)<\/td>\s*<\/tr>/gi);
    for (const m of rowMatches) {
      const key = m[1].replace(/<[^>]+>/g, "").trim();
      const val = m[2].replace(/<[^>]+>/g, "").trim();
      if (/Participant ID/i.test(key)) candidateInfo.participantId = val;
      else if (/Participant Name/i.test(key)) candidateInfo.participantName = val;
      else if (/Test Center Name/i.test(key)) candidateInfo.testCenterName = val;
      else if (/Test Date/i.test(key)) candidateInfo.testDate = val;
      else if (/Test Time/i.test(key)) candidateInfo.testTime = val;
      else if (/Subject/i.test(key)) candidateInfo.subject = val;
      else if (/Exam Language|Language/i.test(key)) candidateInfo.examLanguage = val;
      else if (/Trade|Post/i.test(key) && candidateInfo.subject === "General") candidateInfo.subject = val;
    }
  }

  // Fallback: search for Participant ID directly if table structure differs slightly
  if (!candidateInfo.participantId) {
    const idMatch = html.match(/Participant ID\s*<\/td>\s*<td[^>]*>([^<]+)<\/td>/i);
    if (idMatch) candidateInfo.participantId = idMatch[1].trim();
  }
  if (!candidateInfo.participantName || candidateInfo.participantName === "Candidate") {
    const nameMatch = html.match(/Participant Name\s*<\/td>\s*<td[^>]*>([^<]+)<\/td>/i);
    if (nameMatch) candidateInfo.participantName = nameMatch[1].trim();
  }
  if (!candidateInfo.subject || candidateInfo.subject === "General") {
    const subMatch = html.match(/Subject\s*<\/td>\s*<td[^>]*>([^<]+)<\/td>/i);
    if (subMatch) candidateInfo.subject = subMatch[1].trim();
  }

  if (!candidateInfo.participantId) {
    // Generate a fallback ID if participant ID is not in standard table
    candidateInfo.participantId = "CAND-" + Math.random().toString(36).substring(2, 9).toUpperCase();
  }

  // 2. Extract Sections & Questions
  let totalQuestions = 0;
  let totalCorrect = 0;
  let totalIncorrect = 0;
  let totalUnanswered = 0;

  const sectionSummaries = [];

  // Split by section labels if present, or treat whole document as 1 section
  const sectionChunks = html.split(/<div class="section-lbl">/i);

  if (sectionChunks.length > 1) {
    for (let s = 1; s < sectionChunks.length; s++) {
      const chunk = sectionChunks[s];
      const secNameMatch = chunk.match(/<span class="bold">([^<]+)<\/span>/i);
      const sectionName = secNameMatch ? secNameMatch[1].trim() : `Section ${s}`;

      const secResult = parseQuestionsFromChunk(chunk, marksForCorrect, negativeMarks);

      totalQuestions += secResult.questions;
      totalCorrect += secResult.correct;
      totalIncorrect += secResult.incorrect;
      totalUnanswered += secResult.unanswered;

      sectionSummaries.push({
        sectionName,
        questions: secResult.questions,
        correct: secResult.correct,
        incorrect: secResult.incorrect,
        unanswered: secResult.unanswered,
        positiveMarks: secResult.positiveMarks,
        negativeMarks: secResult.negativeMarks,
        score: secResult.score,
      });
    }
  } else {
    // Single general section
    const secResult = parseQuestionsFromChunk(html, marksForCorrect, negativeMarks);
    totalQuestions = secResult.questions;
    totalCorrect = secResult.correct;
    totalIncorrect = secResult.incorrect;
    totalUnanswered = secResult.unanswered;

    sectionSummaries.push({
      sectionName: candidateInfo.subject || "General Section",
      questions: secResult.questions,
      correct: secResult.correct,
      incorrect: secResult.incorrect,
      unanswered: secResult.unanswered,
      positiveMarks: secResult.positiveMarks,
      negativeMarks: secResult.negativeMarks,
      score: secResult.score,
    });
  }

  if (totalQuestions === 0) {
    throw new Error("Could not detect any questions in the provided response sheet. Please ensure this is an authentic TCS iON / Digialm response sheet.");
  }

  const attempted = totalCorrect + totalIncorrect;
  const positiveMarks = Number((totalCorrect * marksForCorrect).toFixed(2));
  const totalNegativeDeduction = Number((totalIncorrect * negativeMarks).toFixed(2));
  const totalScore = Number((positiveMarks - totalNegativeDeduction).toFixed(2));
  const accuracy = attempted > 0 ? Number(((totalCorrect / attempted) * 100).toFixed(2)) : 0;

  return {
    candidateInfo,
    metrics: {
      totalQuestions,
      attempted,
      unattempted: totalUnanswered,
      correct: totalCorrect,
      incorrect: totalIncorrect,
      positiveMarks,
      negativeMarks: totalNegativeDeduction,
      totalScore,
      accuracy,
    },
    sectionBreakdown: sectionSummaries,
  };
}

/**
 * Helper to parse question panels within a chunk
 */
function parseQuestionsFromChunk(chunkHtml, marksForCorrect, negativeMarks) {
  const qPanels = chunkHtml.match(/<div class="question-pnl"[\s\S]*?(?=<div class="question-pnl"|<\/body|$)/gi) || [];

  let correct = 0;
  let incorrect = 0;
  let unanswered = 0;

  for (const panel of qPanels) {
    // 1. Right Option Detection
    const rightAnsMatch = panel.match(/<td class="rightAns"[^>]*>[\s\S]*?(?:<img[^>]*>)?\s*(\d+)\.\s*([\s\S]*?)<\/td>/i);
    let rightOptionNum = rightAnsMatch ? rightAnsMatch[1] : null;

    // Alternative: check which option has tick.png if class rightAns wasn't applied
    if (!rightOptionNum) {
      const tickMatch = panel.match(/(\d+)\.\s*[^<]*<img[^>]*tick\.png/i);
      if (tickMatch) rightOptionNum = tickMatch[1];
    }

    // 2. Chosen Option Detection
    const chosenOptMatch = panel.match(/Chosen Option\s*:\s*<\/td>\s*<td class="bold">([^<]+)<\/td>/i);
    const chosenOptIdMatch = panel.match(/Chosen Option ID\s*:\s*<\/td>\s*<td class="bold">([^<]+)<\/td>/i);
    const statusMatch = panel.match(/Status\s*:\s*<\/td>\s*<td class="bold">([^<]+)<\/td>/i);

    let chosenOptionNum = null;
    if (chosenOptMatch && chosenOptMatch[1].trim() !== "--") {
      chosenOptionNum = chosenOptMatch[1].trim();
    } else if (chosenOptIdMatch && chosenOptIdMatch[1].trim() !== "--") {
      const chosenId = chosenOptIdMatch[1].trim();
      for (let opt = 1; opt <= 4; opt++) {
        const optIdRegex = new RegExp("Option " + opt + " ID\\s*:\\s*<\\/td>\\s*<td class=\"bold\">([0-9]+)<\\/td>", "i");
        const optIdMatch = panel.match(optIdRegex);
        if (optIdMatch && optIdMatch[1].trim() === chosenId) {
          chosenOptionNum = String(opt);
          break;
        }
      }
    }

    const isMarkedNotAnswered = statusMatch && /Not Answered/i.test(statusMatch[1]);
    const isAnswered = !isMarkedNotAnswered && chosenOptionNum !== null && chosenOptionNum !== "--";

    if (isAnswered) {
      if (rightOptionNum && chosenOptionNum === rightOptionNum) {
        correct++;
      } else {
        incorrect++;
      }
    } else {
      unanswered++;
    }
  }

  const positiveMarks = Number((correct * marksForCorrect).toFixed(2));
  const totalNegative = Number((incorrect * negativeMarks).toFixed(2));
  const score = Number((positiveMarks - totalNegative).toFixed(2));

  return {
    questions: qPanels.length,
    correct,
    incorrect,
    unanswered,
    positiveMarks,
    negativeMarks: totalNegative,
    score,
  };
}

/**
 * Fetches HTML from a digialm URL with resilient headers & timeout
 */
async function fetchResponseSheetUrl(url) {
  if (!url || typeof url !== "string" || !url.startsWith("http")) {
    throw new Error("Invalid URL format. Please provide a valid HTTP/HTTPS link.");
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });

    if (!response.ok) {
      throw new Error(`Server returned HTTP ${response.status} ${response.statusText}`);
    }

    const html = await response.text();
    return html;
  } finally {
    clearTimeout(timeoutId);
  }
}

module.exports = {
  parseResponseSheetHtml,
  fetchResponseSheetUrl,
};
