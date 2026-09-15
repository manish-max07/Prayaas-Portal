// Native fetch is built into Node.js v18+

/**
 * Helper to normalize "1", "2", "3", "4", "A", "B", "C", "D" into 1, 2, 3, 4
 */
function normalizeOptionToIndex(val) {
  if (!val) return null;
  const str = String(val).trim().toUpperCase();
  if (str === "A" || str === "1") return 1;
  if (str === "B" || str === "2") return 2;
  if (str === "C" || str === "3") return 3;
  if (str === "D" || str === "4") return 4;
  return null;
}

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
    if (
      !src.includes("tick.png") &&
      !src.includes("cross.png") &&
      !src.includes("adcimages") &&
      !src.includes("jplayer") &&
      (src.startsWith("http") || src.startsWith("//") || src.startsWith("/"))
    ) {
      candidateInfo.headerImageUrl = src.startsWith("//") ? "https:" + src : src;
      break;
    }
  }

  // Resilient 2-cell table row extraction (handles any styling, nested spans, classes)
  const rowMatches = html.matchAll(/<tr[^>]*>\s*<td[^>]*>([\s\S]*?)<\/td>\s*<td[^>]*>([\s\S]*?)<\/td>\s*<\/tr>/gi);
  for (const m of rowMatches) {
    const rawKey = m[1].replace(/<[^>]+>/g, "").replace(/&nbsp;/gi, " ").trim();
    const rawVal = m[2].replace(/<[^>]+>/g, "").replace(/&nbsp;/gi, " ").trim();

    if (!rawKey || !rawVal) continue;

    if (/Participant\s*ID|Roll\s*No|Roll\s*Number|Application\s*No|Candidate\s*ID|Registration\s*No/i.test(rawKey)) {
      if (!candidateInfo.participantId) candidateInfo.participantId = rawVal;
    } else if (/Participant\s*Name|Candidate\s*Name|Applicant\s*Name/i.test(rawKey)) {
      if (!candidateInfo.participantName || candidateInfo.participantName === "Candidate") {
        candidateInfo.participantName = rawVal;
      }
    } else if (/Test\s*Center\s*Name|Centre\s*Name|Venue/i.test(rawKey)) {
      if (!candidateInfo.testCenterName) candidateInfo.testCenterName = rawVal;
    } else if (/Test\s*Date|Exam\s*Date|Date\s*of\s*Exam/i.test(rawKey)) {
      if (!candidateInfo.testDate) candidateInfo.testDate = rawVal;
    } else if (/Test\s*Time|Exam\s*Time|Shift/i.test(rawKey)) {
      if (!candidateInfo.testTime) candidateInfo.testTime = rawVal;
    } else if (/Subject|Discipline|Trade|Post\s*Applied/i.test(rawKey)) {
      if (!candidateInfo.subject || candidateInfo.subject === "General") {
        candidateInfo.subject = rawVal;
      }
    } else if (/Language|Medium/i.test(rawKey)) {
      if (!candidateInfo.examLanguage || candidateInfo.examLanguage === "English") {
        candidateInfo.examLanguage = rawVal;
      }
    }
  }

  // Fallback direct regex checks in case candidate info is rendered outside standard <tr>
  if (!candidateInfo.participantId) {
    const idMatch = html.match(/Participant\s*ID[\s\S]*?<\/td>\s*<td[^>]*>([\s\S]*?)<\/td>/i);
    if (idMatch) candidateInfo.participantId = idMatch[1].replace(/<[^>]+>/g, "").trim();
  }
  if (!candidateInfo.participantName || candidateInfo.participantName === "Candidate") {
    const nameMatch = html.match(/Participant\s*Name[\s\S]*?<\/td>\s*<td[^>]*>([\s\S]*?)<\/td>/i);
    if (nameMatch) candidateInfo.participantName = nameMatch[1].replace(/<[^>]+>/g, "").trim();
  }
  if (!candidateInfo.testCenterName) {
    const centerMatch = html.match(/Test\s*Center\s*Name[\s\S]*?<\/td>\s*<td[^>]*>([\s\S]*?)<\/td>/i);
    if (centerMatch) candidateInfo.testCenterName = centerMatch[1].replace(/<[^>]+>/g, "").trim();
  }
  if (!candidateInfo.testDate) {
    const dateMatch = html.match(/Test\s*Date[\s\S]*?<\/td>\s*<td[^>]*>([\s\S]*?)<\/td>/i);
    if (dateMatch) candidateInfo.testDate = dateMatch[1].replace(/<[^>]+>/g, "").trim();
  }
  if (!candidateInfo.testTime) {
    const timeMatch = html.match(/Test\s*Time[\s\S]*?<\/td>\s*<td[^>]*>([\s\S]*?)<\/td>/i);
    if (timeMatch) candidateInfo.testTime = timeMatch[1].replace(/<[^>]+>/g, "").trim();
  }
  if (!candidateInfo.subject || candidateInfo.subject === "General") {
    const subMatch = html.match(/Subject[\s\S]*?<\/td>\s*<td[^>]*>([\s\S]*?)<\/td>/i);
    if (subMatch) candidateInfo.subject = subMatch[1].replace(/<[^>]+>/g, "").trim();
  }

  if (!candidateInfo.participantId) {
    // Generate a deterministic or random fallback ID if participant ID is not in standard table
    candidateInfo.participantId = "CAND-" + Math.random().toString(36).substring(2, 9).toUpperCase();
  }

  // 2. Extract Sections & Questions
  let totalQuestions = 0;
  let totalCorrect = 0;
  let totalIncorrect = 0;
  let totalUnanswered = 0;

  const sectionSummaries = [];

  // Split by section labels if present, or treat whole document as 1 section
  const sectionChunks = html.split(/<div[^>]*class=["'][^"']*section-lbl[^"']*["'][^>]*>/i);

  if (sectionChunks.length > 1) {
    for (let s = 1; s < sectionChunks.length; s++) {
      const chunk = sectionChunks[s];
      let sectionName = `Section ${s}`;
      const secNameMatch = chunk.match(/<span[^>]*class=["'][^"']*bold[^"']*["'][^>]*>([^<]+)<\/span>/i);
      if (secNameMatch && secNameMatch[1].trim()) {
        sectionName = secNameMatch[1].trim();
      } else {
        const topText = chunk.substring(0, 300).replace(/<[^>]+>/g, " ").replace(/Section\s*:?/i, "").trim();
        const firstLine = topText.split(/\n/)[0].trim();
        if (firstLine && firstLine.length < 100) {
          sectionName = firstLine;
        }
      }

      const secResult = parseQuestionsFromChunk(chunk, marksForCorrect, negativeMarks);

      if (secResult.questions > 0) {
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
    }
  }

  if (totalQuestions === 0) {
    // Single general section fallback
    const secResult = parseQuestionsFromChunk(html, marksForCorrect, negativeMarks);
    if (secResult.questions > 0) {
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
  let qPanels = chunkHtml.match(/<div[^>]*class=["'][^"']*question-pnl[^"']*["'][\s\S]*?(?=<div[^>]*class=["'][^"']*question-pnl[^"']*["']|<\/body|$)/gi) || [];

  if (qPanels.length === 0) {
    qPanels = chunkHtml.match(/<table[^>]*class=["'][^"']*questionPnlTbl[^"']*["'][\s\S]*?(?=<table[^>]*class=["'][^"']*questionPnlTbl[^"']*["']|<\/body|$)/gi) || [];
  }

  let correct = 0;
  let incorrect = 0;
  let unanswered = 0;

  for (const panel of qPanels) {
    // Check for Dropped question
    const isDropped =
      /Status\s*:\s*<\/td>\s*<td[^>]*>\s*Dropped\s*<\/td>/i.test(panel) ||
      /benefit of marks to all|marked as dropped|invalid question/i.test(panel);

    // 1. Right / Correct Option Detection
    let rightIndex = null; // 1, 2, 3, or 4

    // Method A: Check rightAns cell and inspect text prefix (e.g., "A. ", "1. ", "D. ", "2. ")
    const rightAnsCellMatch = panel.match(/<td[^>]*class=["'][^"']*rightAns[^"']*["'][^>]*>([\s\S]*?)<\/td>/i);
    if (rightAnsCellMatch) {
      const cleanRightText = rightAnsCellMatch[1].replace(/<[^>]+>/g, "").trim();
      const prefixMatch = cleanRightText.match(/^([A-Da-d1-4])[\.\)\s]/);
      if (prefixMatch) {
        rightIndex = normalizeOptionToIndex(prefixMatch[1]);
      }
    }

    // Method B: Find sequential position of rightAns among option cells
    if (rightIndex === null) {
      const optionCells = [...panel.matchAll(/<td[^>]*class=["']([^"']*(?:rightAns|wrngAns)[^"']*)["'][^>]*>/gi)];
      if (optionCells.length > 0) {
        for (let idx = 0; idx < optionCells.length; idx++) {
          if (optionCells[idx][1].includes("rightAns")) {
            rightIndex = idx + 1; // 1-indexed
            break;
          }
        }
      }
    }

    // Method C: Check for tick image (tick.png) prefix or row index
    if (rightIndex === null) {
      const tickPrefixMatch =
        panel.match(/([A-Da-d1-4])\.\s*[^<]*<img[^>]*tick\.png/i) ||
        panel.match(/<img[^>]*tick\.png[^>]*>\s*([A-Da-d1-4])[\.\)\s]/i);
      if (tickPrefixMatch) {
        rightIndex = normalizeOptionToIndex(tickPrefixMatch[1]);
      } else {
        const optionRows = [...panel.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)];
        let optRowIdx = 0;
        for (const r of optionRows) {
          if (r[1].includes("wrngAns") || r[1].includes("rightAns") || r[1].includes("tick.png") || r[1].includes("cross.png")) {
            optRowIdx++;
            if (r[1].includes("tick.png") || r[1].includes("rightAns")) {
              rightIndex = optRowIdx;
              break;
            }
          }
        }
      }
    }

    // 2. Candidate Chosen Option Detection
    const statusMatch = panel.match(/Status\s*:\s*<\/td>\s*<td[^>]*>([\s\S]*?)<\/td>/i);
    const statusText = statusMatch ? statusMatch[1].replace(/<[^>]+>/g, "").trim() : "";

    const chosenOptMatch = panel.match(/Chosen Option\s*:\s*<\/td>\s*<td[^>]*>([\s\S]*?)<\/td>/i);
    const chosenOptIdMatch = panel.match(/Chosen Option ID\s*:\s*<\/td>\s*<td[^>]*>([\s\S]*?)<\/td>/i);

    let rawChosen = null;
    if (chosenOptMatch) {
      const txt = chosenOptMatch[1].replace(/<[^>]+>/g, "").trim();
      if (txt && txt !== "--" && !/not\s*answered/i.test(txt)) {
        rawChosen = txt;
      }
    }

    if (!rawChosen && chosenOptIdMatch) {
      const chosenId = chosenOptIdMatch[1].replace(/<[^>]+>/g, "").trim();
      if (chosenId && chosenId !== "--") {
        for (let opt = 1; opt <= 4; opt++) {
          const optIdRegex = new RegExp(`Option\\s*${opt}\\s*ID\\s*:\\s*<\\/td>\\s*<td[^>]*>\\s*${chosenId}\\s*<\\/td>`, "i");
          if (optIdRegex.test(panel)) {
            rawChosen = String(opt);
            break;
          }
        }
      }
    }

    const chosenIndex = normalizeOptionToIndex(rawChosen);
    const isNotAnswered = /Not Answered|Not Attempted/i.test(statusText) || chosenIndex === null;
    const isAnswered = !isNotAnswered && chosenIndex !== null;

    if (isDropped) {
      // In competitive exams, dropped questions award marks to all candidates
      correct++;
    } else if (isAnswered) {
      if (rightIndex !== null && chosenIndex === rightIndex) {
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
  const timeoutId = setTimeout(() => controller.abort(), 20000);

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

/**
 * Utility to clean HTML tags and decode entities into clean text
 */
function cleanHtmlText(raw) {
  if (!raw) return "";
  return raw
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&deg;/gi, "°")
    .replace(/&minus;/gi, "−")
    .replace(/&sup2;/gi, "²")
    .replace(/&sup3;/gi, "³")
    .replace(/&times;/gi, "×")
    .replace(/&plusmn;/gi, "±")
    .replace(/&quot;/gi, '"')
    .replace(/&amp;/gi, "&")
    .replace(/&#39;/gi, "'")
    .replace(/&rsquo;/gi, "'")
    .replace(/&lsquo;/gi, "'")
    .replace(/&rdquo;/gi, '"')
    .replace(/&ldquo;/gi, '"')
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Resolves relative image URLs against a base URL
 */
function resolveImageUrl(src, baseUrl) {
  if (!src) return null;
  src = src.trim();
  if (src.startsWith("data:")) return src;
  try {
    if (baseUrl) {
      return new URL(src, baseUrl).href;
    }
    if (src.startsWith("//")) return "https:" + src;
    if (src.startsWith("/")) return "https://cdn.digialm.com" + src;
    return src;
  } catch {
    if (src.startsWith("//")) return "https:" + src;
    if (src.startsWith("/")) return "https://cdn.digialm.com" + src;
    return src;
  }
}

/**
 * Parses full examination question paper HTML from Digialm / TCS iON
 * Extracts sections, questions, diagrams/images, 4 options, and correct option indices.
 * @param {string} html Raw HTML of the question paper / response sheet
 * @param {string} baseUrl Base URL to resolve relative image links
 * @param {number} defaultMarks Default positive marks per question
 * @param {number} defaultNegativeMarks Default negative marks per question
 * @returns {object} { sections: [ { name, questions: [ ... ] } ], totalQuestions: number, totalImages: number }
 */
function parseDigialmQuestionPaper(html, baseUrl = "https://cdn.digialm.com", defaultMarks = 1.0, defaultNegativeMarks = 0.25) {
  if (!html || typeof html !== "string") {
    throw new Error("Invalid HTML content provided for question paper parsing.");
  }

  const sections = [];
  let totalQuestions = 0;
  let totalImages = 0;

  // Split by section labels if present
  const sectionChunks = html.split(/<div[^>]*class=["'][^"']*section-lbl[^"']*["'][^>]*>/i);

  const processChunk = (chunk, defaultName) => {
    let sectionName = defaultName;
    const secNameMatch = chunk.match(/<span[^>]*class=["'][^"']*bold[^"']*["'][^>]*>([^<]+)<\/span>/i);
    if (secNameMatch && secNameMatch[1].trim()) {
      sectionName = secNameMatch[1].trim();
    } else {
      const topText = chunk.substring(0, 300).replace(/<[^>]+>/g, " ").replace(/Section\s*:?/i, "").trim();
      const firstLine = topText.split(/\n/)[0].trim();
      if (firstLine && firstLine.length < 100) {
        sectionName = firstLine;
      }
    }

    let qPanels = chunk.match(/<div[^>]*class=["'][^"']*question-pnl[^"']*["'][\s\S]*?(?=<div[^>]*class=["'][^"']*question-pnl[^"']*["']|<\/body|$)/gi) || [];
    if (qPanels.length === 0) {
      qPanels = chunk.match(/<table[^>]*class=["'][^"']*questionPnlTbl[^"']*["'][\s\S]*?(?=<table[^>]*class=["'][^"']*questionPnlTbl[^"']*["']|<\/body|$)/gi) || [];
    }

    const sectionQuestions = [];

    for (let pIdx = 0; pIdx < qPanels.length; pIdx++) {
      const panel = qPanels[pIdx];

      // 1. Extract Question HTML and Question Image
      let questionHtml = "";
      const qCellMatch = panel.match(/<td[^>]*align=["']center["'][^>]*class=["']bold["'][^>]*>\s*Q\.\s*\d+[\s\S]*?<\/td>\s*<td([^>]*)>([\s\S]*?)<\/td>/i);
      if (qCellMatch) {
        questionHtml = qCellMatch[2];
      } else {
        const fallbackMatch = panel.match(/<td[^>]*class=["'][^"']*bold[^"']*["'][^>]*style=["'][^"']*overflow-x[^"']*["'][^>]*>([\s\S]*?)<\/td>/i);
        if (fallbackMatch) {
          questionHtml = fallbackMatch[1];
        } else {
          // Fallback to table row before Ans
          const beforeAnsMatch = panel.match(/<tr>\s*<td[^>]*>(?:Q\.\s*\d+|&nbsp;|\s*)<\/td>\s*<td[^>]*>([\s\S]*?)<\/td>\s*<\/tr>\s*<tr>\s*<td[^>]*>Ans<\/td>/i);
          if (beforeAnsMatch) questionHtml = beforeAnsMatch[1];
        }
      }

      // Extract image from question HTML if any
      let questionImageUrl = null;
      if (questionHtml) {
        const imgMatches = [...questionHtml.matchAll(/<img[^>]+src=["']([^"']+)["'][^>]*>/gi)];
        for (const im of imgMatches) {
          const src = im[1].trim();
          if (!src.includes("tick.png") && !src.includes("cross.png") && !src.includes("jplayer") && !src.includes("banner")) {
            questionImageUrl = resolveImageUrl(src, baseUrl);
            totalImages++;
            break;
          }
        }
      }

      let questionText = cleanHtmlText(questionHtml);
      if (!questionText) {
        questionText = questionImageUrl ? "Question (Refer to the attached image / diagram)" : `Question ${pIdx + 1}`;
      }

      // 2. Extract Options (4 options)
      const optCellMatches = [...panel.matchAll(/<td[^>]*class=["']([^"']*(?:rightAns|wrngAns)[^"']*)["'][^>]*>([\s\S]*?)<\/td>/gi)];
      const options = [];
      let correctOptionIndex = -1;

      if (optCellMatches.length > 0) {
        optCellMatches.forEach((m, idx) => {
          const isRight = m[1].includes("rightAns");
          let optInner = m[2];

          // Check if option contains an image
          let optImg = null;
          const optImgs = [...optInner.matchAll(/<img[^>]+src=["']([^"']+)["'][^>]*>/gi)]
            .filter(im => !im[1].includes("tick.png") && !im[1].includes("cross.png"));
          if (optImgs.length > 0) {
            optImg = resolveImageUrl(optImgs[0][1], baseUrl);
          }

          // Clean option text (remove tick/cross icons, strip leading 1., A., etc.)
          let optClean = cleanHtmlText(optInner.replace(/<img[^>]+(?:tick|cross)\.png[^>]*>/gi, ""));
          optClean = optClean.replace(/^[1-4A-Da-d][\.\)]\s*/, "").trim();

          if (!optClean && optImg) {
            optClean = optImg;
          }

          options.push(optClean || `Option ${idx + 1}`);

          if (isRight && correctOptionIndex === -1) {
            correctOptionIndex = idx;
          }
        });
      }

      // Fallback for options if not matched by rightAns / wrngAns
      if (options.length < 4) {
        // Try matching tick / cross images in rows
        const optRows = [...panel.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)];
        for (const r of optRows) {
          if (r[1].includes("tick.png") || r[1].includes("cross.png")) {
            const cleanText = cleanHtmlText(r[1].replace(/<img[^>]+(?:tick|cross)\.png[^>]*>/gi, "")).replace(/^[1-4A-Da-d][\.\)]\s*/, "").trim();
            if (cleanText) {
              if (r[1].includes("tick.png") && correctOptionIndex === -1) {
                correctOptionIndex = options.length;
              }
              options.push(cleanText);
            }
          }
        }
      }

      // Ensure exactly 4 options
      while (options.length < 4) {
        options.push(`Option ${options.length + 1}`);
      }
      if (options.length > 4) {
        options.length = 4;
      }

      // Fallback for correct option index
      if (correctOptionIndex < 0 || correctOptionIndex > 3) {
        correctOptionIndex = 0;
      }

      sectionQuestions.push({
        questionText,
        imageUrl: questionImageUrl,
        options,
        correctOptionIndex,
        marksForCorrect: defaultMarks,
        negativeMarks: defaultNegativeMarks,
      });
    }

    if (sectionQuestions.length > 0) {
      totalQuestions += sectionQuestions.length;
      sections.push({
        name: sectionName,
        questions: sectionQuestions,
      });
    }
  };

  if (sectionChunks.length > 1) {
    for (let s = 1; s < sectionChunks.length; s++) {
      processChunk(sectionChunks[s], `Section ${s}`);
    }
  } else {
    processChunk(html, "General Section");
  }

  if (totalQuestions === 0) {
    throw new Error("Could not extract any questions from the provided response sheet / link.");
  }

  return {
    sections,
    totalQuestions,
    totalImages,
  };
}

module.exports = {
  parseResponseSheetHtml,
  fetchResponseSheetUrl,
  parseDigialmQuestionPaper,
};
