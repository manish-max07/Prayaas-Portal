const ExcelJS = require("exceljs");
const ExamPaper = require("../models/ExamPaper");
const Section = require("../models/Section");
const Question = require("../models/Question");
const {
  fetchResponseSheetUrl,
  parseDigialmQuestionPaper,
  extractResponseSheetMetadata
} = require("../services/digialmParser");

// Helper to convert cell value to string cleanly
const getCellString = (cell) => {
  if (!cell || cell.value === null || cell.value === undefined) return "";
  if (typeof cell.value === "object") {
    // ExcelJS rich text format: { richText: [{ text: "..." }] }
    if (cell.value.richText && Array.isArray(cell.value.richText)) {
      return cell.value.richText.map((t) => t.text).join("").trim();
    }
    // Hyperlink or formula result
    if (cell.value.text) return String(cell.value.text).trim();
    if (cell.value.result !== undefined) return String(cell.value.result).trim();
  }
  return String(cell.value).trim();
};

// Helper to slugify exam identity
const slugifyExam = (authority, position) => {
  const base = `${authority || ""} ${position || ""}`.trim();
  if (!base) return "";
  return base
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");
};

// @desc    Create a new Exam Paper (status: draft)
// @route   POST /api/admin/exams
// @access  Private (Admin)
const createExamPaper = async (req, res, next) => {
  try {
    const {
      title,
      authority,
      position,
      subject,
      examYear,
      examDate,
      shift,
      medium,
      description,
      examCategory,
      totalDurationMinutes,
      negativeMarkingEnabled
    } = req.body;

    const composedTitle = [authority, position, subject, examYear, shift]
      .map((s) => (s || "").trim())
      .filter(Boolean)
      .join(" ");

    const finalTitle = (title && title.trim()) ? title.trim() : composedTitle;

    if (!finalTitle) {
      return res.status(400).json({
        success: false,
        message: "Please provide an exam title or fill in the authority, position, subject, year, and shift fields."
      });
    }

    const calculatedSlug = slugifyExam(authority, position);

    const examPaper = await ExamPaper.create({
      title: finalTitle,
      authority: (authority || "").trim(),
      position: (position || "").trim(),
      subject: (subject || "").trim(),
      examYear: (examYear || new Date().getFullYear()).toString().trim(),
      examDate: (examDate || "").trim(),
      shift: (shift || "").trim(),
      medium: (medium || "Bilingual (English / Hindi)").trim(),
      examSlug: calculatedSlug,
      description: (description || "").trim(),
      examCategory: examCategory || "Other",
      totalDurationMinutes: Number(totalDurationMinutes) || 60,
      negativeMarkingEnabled: negativeMarkingEnabled !== false,
      status: "draft",
      createdBy: req.user._id,
      sections: []
    });

    res.status(201).json({
      success: true,
      message: "Exam paper created successfully in draft mode.",
      examPaper
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update Exam Paper details (including totalDurationMinutes)
// @route   PUT /api/admin/exams/:id
// @access  Private (Admin)
const updateExamPaper = async (req, res, next) => {
  try {
    const {
      title,
      authority,
      position,
      subject,
      examYear,
      examDate,
      shift,
      medium,
      description,
      examCategory,
      totalDurationMinutes,
      negativeMarkingEnabled
    } = req.body;

    const examPaper = await ExamPaper.findById(req.params.id);
    if (!examPaper) {
      return res.status(404).json({
        success: false,
        message: "Exam paper not found."
      });
    }

    if (authority !== undefined) examPaper.authority = authority.trim();
    if (position !== undefined) examPaper.position = position.trim();
    if (subject !== undefined) examPaper.subject = subject.trim();
    if (examYear !== undefined) examPaper.examYear = examYear.toString().trim();
    if (examDate !== undefined) examPaper.examDate = examDate.trim();
    if (shift !== undefined) examPaper.shift = shift.trim();
    if (medium !== undefined) examPaper.medium = medium.trim();

    if (authority !== undefined || position !== undefined) {
      examPaper.examSlug = slugifyExam(examPaper.authority, examPaper.position);
    }

    if (title !== undefined) {
      examPaper.title = title.trim();
    } else if (authority || position || subject || examYear || shift) {
      const composedTitle = [examPaper.authority, examPaper.position, examPaper.subject, examPaper.examYear, examPaper.shift]
        .filter(Boolean)
        .join(" ");
      if (composedTitle) examPaper.title = composedTitle;
    }

    if (description !== undefined) examPaper.description = description.trim();
    if (examCategory !== undefined) examPaper.examCategory = examCategory;
    if (totalDurationMinutes !== undefined) {
      examPaper.totalDurationMinutes = Number(totalDurationMinutes);
    }
    if (negativeMarkingEnabled !== undefined) {
      examPaper.negativeMarkingEnabled = Boolean(negativeMarkingEnabled);
    }

    await examPaper.save();

    res.status(200).json({
      success: true,
      message: "Exam paper updated successfully.",
      examPaper
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle or set Exam Paper status ("draft" <-> "live")
// @route   PUT /api/admin/exams/:id/status
// @access  Private (Admin)
const toggleExamStatus = async (req, res, next) => {
  try {
    const examPaper = await ExamPaper.findById(req.params.id);
    if (!examPaper) {
      return res.status(404).json({
        success: false,
        message: "Exam paper not found."
      });
    }

    let newStatus;
    if (req.body.status && ["draft", "live"].includes(req.body.status)) {
      newStatus = req.body.status;
    } else {
      // Toggle if not explicitly specified
      newStatus = examPaper.status === "live" ? "draft" : "live";
    }

    examPaper.status = newStatus;
    await examPaper.save();

    res.status(200).json({
      success: true,
      message: `Exam paper status changed to '${newStatus}'.`,
      status: examPaper.status
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all Exam Papers for Admin dashboard (both draft & live)
// @route   GET /api/admin/exams
// @access  Private (Admin)
const getAllAdminExams = async (req, res, next) => {
  try {
    const examPapers = await ExamPaper.find()
      .populate({
        path: "sections",
        select: "name order questions",
        populate: {
          path: "questions",
          select: "_id"
        }
      })
      .sort({ createdAt: -1 });

    const formatted = examPapers.map((exam) => {
      let totalQuestions = 0;
      exam.sections.forEach((sec) => {
        totalQuestions += sec.questions ? sec.questions.length : 0;
      });

      return {
        _id: exam._id,
        title: exam.title,
        description: exam.description,
        examCategory: exam.examCategory,
        totalDurationMinutes: exam.totalDurationMinutes,
        status: exam.status,
        negativeMarkingEnabled: exam.negativeMarkingEnabled,
        sectionsCount: exam.sections.length,
        totalQuestions,
        createdAt: exam.createdAt,
        updatedAt: exam.updatedAt
      };
    });

    res.status(200).json({
      success: true,
      count: formatted.length,
      examPapers: formatted
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single Exam Paper with all sections & questions (with correct answers for Admin)
// @route   GET /api/admin/exams/:id
// @access  Private (Admin)
const getAdminExamById = async (req, res, next) => {
  try {
    const examPaper = await ExamPaper.findById(req.params.id).populate({
      path: "sections",
      options: { sort: { order: 1 } },
      populate: {
        path: "questions",
        options: { sort: { order: 1 } }
      }
    });

    if (!examPaper) {
      return res.status(404).json({
        success: false,
        message: "Exam paper not found."
      });
    }

    res.status(200).json({
      success: true,
      examPaper
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add a Section to an Exam Paper
// @route   POST /api/admin/exams/:id/sections
// @access  Private (Admin)
const addSection = async (req, res, next) => {
  try {
    const { name, order } = req.body;
    const examPaper = await ExamPaper.findById(req.params.id);

    if (!examPaper) {
      return res.status(404).json({
        success: false,
        message: "Exam paper not found."
      });
    }

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Please provide a section name."
      });
    }

    const sectionOrder = order !== undefined ? Number(order) : examPaper.sections.length + 1;

    const section = await Section.create({
      examPaper: examPaper._id,
      name: name.trim(),
      order: sectionOrder,
      questions: []
    });

    examPaper.sections.push(section._id);
    await examPaper.save();

    res.status(201).json({
      success: true,
      message: "Section created and added to exam paper.",
      section
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a Section (rename/reorder)
// @route   PUT /api/admin/sections/:id
// @access  Private (Admin)
const updateSection = async (req, res, next) => {
  try {
    const { name, order } = req.body;

    const section = await Section.findById(req.params.id);
    if (!section) {
      return res.status(404).json({
        success: false,
        message: "Section not found."
      });
    }

    if (name !== undefined) section.name = name.trim();
    if (order !== undefined) section.order = Number(order);

    await section.save();

    res.status(200).json({
      success: true,
      message: "Section updated successfully.",
      section
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add ONE Question to a Section
// @route   POST /api/admin/sections/:id/questions
// @access  Private (Admin)
const addQuestion = async (req, res, next) => {
  try {
    const {
      questionText,
      imageUrl,
      options,
      correctOptionIndex,
      marksForCorrect,
      negativeMarks,
      order
    } = req.body;

    const section = await Section.findById(req.params.id);
    if (!section) {
      return res.status(404).json({
        success: false,
        message: "Section not found."
      });
    }

    if (!questionText) {
      return res.status(400).json({
        success: false,
        message: "Please provide questionText."
      });
    }

    if (!options || !Array.isArray(options) || options.length !== 4) {
      return res.status(400).json({
        success: false,
        message: "Exactly 4 options are required in an array."
      });
    }

    if (
      correctOptionIndex === undefined ||
      correctOptionIndex === null ||
      Number(correctOptionIndex) < 0 ||
      Number(correctOptionIndex) > 3
    ) {
      return res.status(400).json({
        success: false,
        message: "correctOptionIndex must be an integer between 0 and 3."
      });
    }

    const questionOrder =
      order !== undefined ? Number(order) : section.questions.length + 1;

    const question = await Question.create({
      examPaper: section.examPaper,
      section: section._id,
      questionText,
      imageUrl: imageUrl || null,
      options: options.map((opt) => String(opt)),
      correctOptionIndex: Number(correctOptionIndex),
      marksForCorrect: marksForCorrect !== undefined ? Number(marksForCorrect) : 1.0,
      negativeMarks: negativeMarks !== undefined ? Number(negativeMarks) : 0.25,
      order: questionOrder
    });

    section.questions.push(question._id);
    await section.save();

    res.status(201).json({
      success: true,
      message: "Question created and added to section.",
      question
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a Question
// @route   PUT /api/admin/questions/:id
// @access  Private (Admin)
const updateQuestion = async (req, res, next) => {
  try {
    const {
      questionText,
      imageUrl,
      options,
      correctOptionIndex,
      marksForCorrect,
      negativeMarks,
      order
    } = req.body;

    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Question not found."
      });
    }

    if (questionText !== undefined) question.questionText = questionText;
    if (imageUrl !== undefined) question.imageUrl = imageUrl || null;
    if (options !== undefined) {
      if (!Array.isArray(options) || options.length !== 4) {
        return res.status(400).json({
          success: false,
          message: "Options must be an array of exactly 4 strings."
        });
      }
      question.options = options.map((o) => String(o));
    }
    if (correctOptionIndex !== undefined) {
      const idx = Number(correctOptionIndex);
      if (idx < 0 || idx > 3) {
        return res.status(400).json({
          success: false,
          message: "correctOptionIndex must be between 0 and 3."
        });
      }
      question.correctOptionIndex = idx;
    }
    if (marksForCorrect !== undefined) question.marksForCorrect = Number(marksForCorrect);
    if (negativeMarks !== undefined) question.negativeMarks = Number(negativeMarks);
    if (order !== undefined) question.order = Number(order);

    await question.save();

    res.status(200).json({
      success: true,
      message: "Question updated successfully.",
      question
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a Question
// @route   DELETE /api/admin/questions/:id
// @access  Private (Admin)
const deleteQuestion = async (req, res, next) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Question not found."
      });
    }

    // Pull question reference from Section
    await Section.findByIdAndUpdate(question.section, {
      $pull: { questions: question._id }
    });

    await Question.findByIdAndDelete(question._id);

    res.status(200).json({
      success: true,
      message: "Question deleted successfully."
    });
  } catch (error) {
    next(error);
  }
};

// Dynamic Header Mapper to find column indices
const extractHeaderMap = (headerRow) => {
  const map = {
    sectionCol: null,
    qnoCol: null,
    questionCol: null,
    opt1Col: null,
    opt2Col: null,
    opt3Col: null,
    opt4Col: null,
    correctCol: null,
    imageCol: null,
    marksCol: null,
    negativeMarksCol: null
  };

  headerRow.eachCell((cell, colNumber) => {
    const raw = getCellString(cell).toLowerCase().replace(/[\r\n\t_]/g, " ").trim();

    if (raw.includes("negative") && raw.includes("mark")) {
      map.negativeMarksCol = colNumber;
    } else if (raw.startsWith("mark") || raw.includes("marks")) {
      map.marksCol = colNumber;
    } else if (raw.includes("image") || raw.includes("img") || raw.includes("diagram") || raw.includes("url")) {
      map.imageCol = colNumber;
    } else if (raw.includes("correct") || raw.includes("answer") || raw.includes("right option")) {
      map.correctCol = colNumber;
    } else if (raw.includes("option 1") || raw.includes("option a") || raw === "opt 1" || raw === "opt a") {
      map.opt1Col = colNumber;
    } else if (raw.includes("option 2") || raw.includes("option b") || raw === "opt 2" || raw === "opt b") {
      map.opt2Col = colNumber;
    } else if (raw.includes("option 3") || raw.includes("option c") || raw === "opt 3" || raw === "opt c") {
      map.opt3Col = colNumber;
    } else if (raw.includes("option 4") || raw.includes("option d") || raw === "opt 4" || raw === "opt d") {
      map.opt4Col = colNumber;
    } else if (raw.startsWith("q.no") || raw.startsWith("q no") || raw === "qno" || raw === "sl no" || raw === "sr no") {
      map.qnoCol = colNumber;
    } else if (raw.includes("question") || raw === "q" || raw === "problem") {
      map.questionCol = colNumber;
    } else if (raw.includes("section") || raw.includes("part") || raw.includes("subject")) {
      map.sectionCol = colNumber;
    }
  });

  // Fallback defaults if headers weren't named in standard format
  if (!map.questionCol) map.questionCol = 3;
  if (!map.opt1Col) map.opt1Col = 4;
  if (!map.opt2Col) map.opt2Col = 5;
  if (!map.opt3Col) map.opt3Col = 6;
  if (!map.opt4Col) map.opt4Col = 7;
  if (!map.correctCol) map.correctCol = 8;
  if (!map.imageCol) map.imageCol = 9;
  if (!map.marksCol) map.marksCol = 10;
  if (!map.negativeMarksCol) map.negativeMarksCol = 11;
  if (!map.sectionCol) map.sectionCol = 1;

  return map;
};

// Normalize text for comparison
const normalizeString = (str) => {
  return String(str || "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
};

// Determine Correct Option Index (supports Option 1/2/3/4, A/B/C/D, 1/2/3/4, or verbatim Answer Text)
const resolveCorrectOptionIndex = (rawCorrect, opt1, opt2, opt3, opt4) => {
  const normCorrect = normalizeString(rawCorrect);

  // 1. Direct letter or number indicators
  if (normCorrect === "1" || normCorrect === "a" || normCorrect === "option 1" || normCorrect === "option a" || normCorrect === "opt 1" || normCorrect === "opt a") {
    return 0;
  }
  if (normCorrect === "2" || normCorrect === "b" || normCorrect === "option 2" || normCorrect === "option b" || normCorrect === "opt 2" || normCorrect === "opt b") {
    return 1;
  }
  if (normCorrect === "3" || normCorrect === "c" || normCorrect === "option 3" || normCorrect === "option c" || normCorrect === "opt 3" || normCorrect === "opt c") {
    return 2;
  }
  if (normCorrect === "4" || normCorrect === "d" || normCorrect === "option 4" || normCorrect === "option d" || normCorrect === "opt 4" || normCorrect === "opt d") {
    return 3;
  }

  // 2. Exact or normalized matching against the 4 options' text
  const nOpt1 = normalizeString(opt1);
  const nOpt2 = normalizeString(opt2);
  const nOpt3 = normalizeString(opt3);
  const nOpt4 = normalizeString(opt4);

  if (normCorrect === nOpt1) return 0;
  if (normCorrect === nOpt2) return 1;
  if (normCorrect === nOpt3) return 2;
  if (normCorrect === nOpt4) return 3;

  // 3. Fallback: fuzzy/partial match if user has minor punctuation variations
  if (nOpt1 && (normCorrect.includes(nOpt1) || nOpt1.includes(normCorrect))) return 0;
  if (nOpt2 && (normCorrect.includes(nOpt2) || nOpt2.includes(normCorrect))) return 1;
  if (nOpt3 && (normCorrect.includes(nOpt3) || nOpt3.includes(normCorrect))) return 2;
  if (nOpt4 && (normCorrect.includes(nOpt4) || nOpt4.includes(normCorrect))) return 3;

  return -1;
};

// @desc    Bulk Upload Questions to a Section via Excel (.xlsx)
// @route   POST /api/admin/sections/:id/upload-questions
// @access  Private (Admin)
const uploadQuestionsExcel = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload an Excel (.xlsx) file."
      });
    }

    const section = await Section.findById(req.params.id);
    if (!section) {
      return res.status(404).json({
        success: false,
        message: "Section not found."
      });
    }

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(req.file.buffer);

    const worksheet = workbook.worksheets[0];
    if (!worksheet) {
      return res.status(400).json({
        success: false,
        message: "Uploaded workbook contains no sheets."
      });
    }

    const headerRow = worksheet.getRow(1);
    const colMap = extractHeaderMap(headerRow);

    const skippedRows = [];
    const validQuestions = [];
    let currentOrder = section.questions.length + 1;

    worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
      if (rowNumber === 1) return; // Skip header

      const questionText = getCellString(row.getCell(colMap.questionCol));
      const imageUrl = getCellString(row.getCell(colMap.imageCol));
      const opt1 = getCellString(row.getCell(colMap.opt1Col));
      const opt2 = getCellString(row.getCell(colMap.opt2Col));
      const opt3 = getCellString(row.getCell(colMap.opt3Col));
      const opt4 = getCellString(row.getCell(colMap.opt4Col));
      const rawCorrect = getCellString(row.getCell(colMap.correctCol));
      const rawMarks = row.getCell(colMap.marksCol).value;
      const rawNegativeMarks = row.getCell(colMap.negativeMarksCol).value;

      if (!questionText) {
        skippedRows.push({ rowNumber, reason: "Missing Question Text" });
        return;
      }

      if (!opt1 || !opt2 || !opt3 || !opt4) {
        skippedRows.push({ rowNumber, reason: "Missing one or more of the 4 options" });
        return;
      }

      const correctOptionIndex = resolveCorrectOptionIndex(rawCorrect, opt1, opt2, opt3, opt4);

      if (correctOptionIndex === -1) {
        skippedRows.push({
          rowNumber,
          reason: `Could not match correct answer '${rawCorrect}' to any of the 4 options.`
        });
        return;
      }

      const marksForCorrect =
        rawMarks !== null && !isNaN(Number(rawMarks)) ? Number(rawMarks) : 1.0;
      const negativeMarks =
        rawNegativeMarks !== null && !isNaN(Number(rawNegativeMarks))
          ? Number(rawNegativeMarks)
          : 0.25;

      validQuestions.push({
        examPaper: section.examPaper,
        section: section._id,
        questionText,
        imageUrl: imageUrl && imageUrl.startsWith("http") ? imageUrl : null,
        options: [opt1, opt2, opt3, opt4],
        correctOptionIndex,
        marksForCorrect,
        negativeMarks,
        order: currentOrder++
      });
    });

    if (validQuestions.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid question rows found in the Excel file.",
        insertedCount: 0,
        skippedCount: skippedRows.length,
        skippedRows
      });
    }

    const createdQuestions = await Question.insertMany(validQuestions);
    const createdIds = createdQuestions.map((q) => q._id);

    section.questions.push(...createdIds);
    await section.save();

    res.status(201).json({
      success: true,
      message: `Successfully uploaded and parsed ${createdQuestions.length} questions into section '${section.name}'.`,
      insertedCount: createdQuestions.length,
      skippedCount: skippedRows.length,
      skippedRows
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Bulk Upload Full Exam Questions via Excel (Auto-detects/creates Sections from "Section" column)
// @route   POST /api/admin/exams/:id/upload-questions
// @access  Private (Admin)
const uploadExamQuestionsExcel = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload an Excel (.xlsx) file."
      });
    }

    const examPaper = await ExamPaper.findById(req.params.id).populate("sections");
    if (!examPaper) {
      return res.status(404).json({
        success: false,
        message: "Exam paper not found."
      });
    }

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(req.file.buffer);

    const worksheet = workbook.worksheets[0];
    if (!worksheet) {
      return res.status(400).json({
        success: false,
        message: "Uploaded workbook contains no sheets."
      });
    }

    const headerRow = worksheet.getRow(1);
    const colMap = extractHeaderMap(headerRow);

    // Section Cache: Map sectionName -> Section Doc
    const sectionMap = new Map();
    examPaper.sections.forEach((sec) => {
      sectionMap.set(sec.name.toLowerCase().trim(), sec);
    });

    const skippedRows = [];
    const questionsBySection = new Map(); // sectionId -> array of questions

    let defaultSectionName = "Section 1";

    worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
      if (rowNumber === 1) return; // Skip header

      const sectionName = getCellString(row.getCell(colMap.sectionCol)) || defaultSectionName;
      const questionText = getCellString(row.getCell(colMap.questionCol));
      const imageUrl = getCellString(row.getCell(colMap.imageCol));
      const opt1 = getCellString(row.getCell(colMap.opt1Col));
      const opt2 = getCellString(row.getCell(colMap.opt2Col));
      const opt3 = getCellString(row.getCell(colMap.opt3Col));
      const opt4 = getCellString(row.getCell(colMap.opt4Col));
      const rawCorrect = getCellString(row.getCell(colMap.correctCol));
      const rawMarks = row.getCell(colMap.marksCol).value;
      const rawNegativeMarks = row.getCell(colMap.negativeMarksCol).value;

      if (!questionText) {
        skippedRows.push({ rowNumber, reason: "Missing Question Text" });
        return;
      }

      if (!opt1 || !opt2 || !opt3 || !opt4) {
        skippedRows.push({ rowNumber, reason: "Missing one or more of the 4 options" });
        return;
      }

      const correctOptionIndex = resolveCorrectOptionIndex(rawCorrect, opt1, opt2, opt3, opt4);

      if (correctOptionIndex === -1) {
        skippedRows.push({
          rowNumber,
          reason: `Could not match correct answer '${rawCorrect}' to any of the 4 options.`
        });
        return;
      }

      const marksForCorrect =
        rawMarks !== null && !isNaN(Number(rawMarks)) ? Number(rawMarks) : 1.0;
      const negativeMarks =
        rawNegativeMarks !== null && !isNaN(Number(rawNegativeMarks))
          ? Number(rawNegativeMarks)
          : 0.25;

      const normSec = sectionName.toLowerCase().trim();
      if (!questionsBySection.has(normSec)) {
        questionsBySection.set(normSec, {
          displayName: sectionName.trim(),
          questions: []
        });
      }

      questionsBySection.get(normSec).questions.push({
        questionText,
        imageUrl: imageUrl && imageUrl.startsWith("http") ? imageUrl : null,
        options: [opt1, opt2, opt3, opt4],
        correctOptionIndex,
        marksForCorrect,
        negativeMarks
      });
    });

    if (questionsBySection.size === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid question rows found in the Excel file.",
        insertedCount: 0,
        skippedCount: skippedRows.length,
        skippedRows
      });
    }

    let totalInserted = 0;
    const sectionsSummary = [];

    // Process each section group
    for (const [normSec, data] of questionsBySection.entries()) {
      let sectionDoc = sectionMap.get(normSec);

      // If section doesn't exist, create it
      if (!sectionDoc) {
        sectionDoc = await Section.create({
          examPaper: examPaper._id,
          name: data.displayName,
          order: examPaper.sections.length + 1,
          questions: []
        });
        examPaper.sections.push(sectionDoc._id);
        sectionMap.set(normSec, sectionDoc);
      }

      let currentOrder = sectionDoc.questions.length + 1;
      const questionsToInsert = data.questions.map((q) => ({
        ...q,
        examPaper: examPaper._id,
        section: sectionDoc._id,
        order: currentOrder++
      }));

      const createdQuestions = await Question.insertMany(questionsToInsert);
      const createdIds = createdQuestions.map((q) => q._id);

      sectionDoc.questions.push(...createdIds);
      await sectionDoc.save();

      totalInserted += createdQuestions.length;
      sectionsSummary.push({
        section: sectionDoc.name,
        questionsCount: createdQuestions.length
      });
    }

    await examPaper.save();

    res.status(201).json({
      success: true,
      message: `Successfully uploaded ${totalInserted} questions across ${sectionsSummary.length} sections.`,
      insertedCount: totalInserted,
      sectionsSummary,
      skippedCount: skippedRows.length,
      skippedRows
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Section by ID with populated questions and exam paper
// @route   GET /api/admin/sections/:id
// @access  Private (Admin)
const getSectionById = async (req, res, next) => {
  try {
    const section = await Section.findById(req.params.id)
      .populate("examPaper", "title examCategory totalDurationMinutes")
      .populate({
        path: "questions",
        options: { sort: { order: 1 } }
      });

    if (!section) {
      return res.status(404).json({
        success: false,
        message: "Section not found."
      });
    }

    res.status(200).json({
      success: true,
      section
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Import Questions from Digialm Response Sheet / Question Paper URL or raw HTML
// @route   POST /api/admin/exams/:id/import-digialm
// @access  Private (Admin)
const importExamQuestionsDigialm = async (req, res, next) => {
  try {
    const { digialmUrl, rawHtml, marksForCorrect, negativeMarks } = req.body;

    if (!digialmUrl && !rawHtml) {
      return res.status(400).json({
        success: false,
        message: "Please provide either a Digialm URL or raw HTML content."
      });
    }

    const examPaper = await ExamPaper.findById(req.params.id).populate("sections");
    if (!examPaper) {
      return res.status(404).json({
        success: false,
        message: "Exam paper not found."
      });
    }

    let html = rawHtml;
    let baseUrl = "https://cdn.digialm.com";

    if (digialmUrl) {
      try {
        const parsedUrl = new URL(digialmUrl.trim());
        baseUrl = parsedUrl.origin;
      } catch (e) {
        return res.status(400).json({
          success: false,
          message: "Invalid Digialm URL format. Please provide a valid HTTP/HTTPS URL."
        });
      }

      try {
        html = await fetchResponseSheetUrl(digialmUrl.trim());
      } catch (fetchErr) {
        return res.status(400).json({
          success: false,
          message: `Failed to fetch response sheet from link: ${fetchErr.message}. If the link is restricted or expired, you can paste the raw page HTML directly.`
        });
      }
    }

    const defaultPositive =
      marksForCorrect !== undefined && !isNaN(Number(marksForCorrect))
        ? Number(marksForCorrect)
        : 1.0;
    const defaultNeg =
      negativeMarks !== undefined && !isNaN(Number(negativeMarks))
        ? Number(negativeMarks)
        : 0.25;

    let parsed;
    try {
      parsed = parseDigialmQuestionPaper(html, baseUrl, defaultPositive, defaultNeg);
    } catch (parseErr) {
      return res.status(400).json({
        success: false,
        message: `Failed to parse Digialm question paper: ${parseErr.message}`
      });
    }

    // Section Cache: Map sectionName -> Section Doc
    const sectionMap = new Map();
    examPaper.sections.forEach((sec) => {
      sectionMap.set(sec.name.toLowerCase().trim(), sec);
    });

    let totalInserted = 0;
    const sectionsSummary = [];

    // Process each section group
    for (const secData of parsed.sections) {
      const normSec = secData.name.toLowerCase().trim();
      let sectionDoc = sectionMap.get(normSec);

      // If section doesn't exist, create it
      if (!sectionDoc) {
        sectionDoc = await Section.create({
          examPaper: examPaper._id,
          name: secData.name.trim(),
          order: examPaper.sections.length + 1,
          questions: []
        });
        examPaper.sections.push(sectionDoc._id);
        sectionMap.set(normSec, sectionDoc);
      }

      let currentOrder = sectionDoc.questions.length + 1;
      const questionsToInsert = secData.questions.map((q) => ({
        ...q,
        examPaper: examPaper._id,
        section: sectionDoc._id,
        order: currentOrder++
      }));

      const createdQuestions = await Question.insertMany(questionsToInsert);
      const createdIds = createdQuestions.map((q) => q._id);

      sectionDoc.questions.push(...createdIds);
      await sectionDoc.save();

      totalInserted += createdQuestions.length;
      sectionsSummary.push({
        sectionName: sectionDoc.name,
        questionCount: createdQuestions.length
      });
    }

    await examPaper.save();

    res.status(201).json({
      success: true,
      message: `Successfully imported ${totalInserted} questions across ${sectionsSummary.length} section(s) from Digialm link!`,
      totalQuestions: totalInserted,
      totalImages: parsed.totalImages,
      sectionsSummary
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Inspect and extract metadata from Digialm / TCS iON Response Sheet URL or HTML
// @route   POST /api/admin/exams/inspect-response-sheet
// @access  Private (Admin)
const inspectResponseSheet = async (req, res, next) => {
  try {
    const { url, rawHtml } = req.body;

    if (!url && !rawHtml) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid Digialm / TCS iON Response Sheet URL or raw HTML.",
      });
    }

    let html = rawHtml;
    const targetUrl = url ? url.trim() : "";

    if (targetUrl) {
      try {
        new URL(targetUrl);
      } catch (err) {
        return res.status(400).json({
          success: false,
          message: "Invalid URL format. Please provide a valid HTTP/HTTPS URL.",
        });
      }
      html = await fetchResponseSheetUrl(targetUrl);
    }

    const metadata = extractResponseSheetMetadata(html, targetUrl);

    res.status(200).json({
      success: true,
      message: "Response Sheet metadata extracted successfully!",
      metadata,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createExamPaper,
  updateExamPaper,
  toggleExamStatus,
  getAllAdminExams,
  getAdminExamById,
  addSection,
  updateSection,
  getSectionById,
  addQuestion,
  updateQuestion,
  deleteQuestion,
  uploadQuestionsExcel,
  uploadExamQuestionsExcel,
  importExamQuestionsDigialm,
  inspectResponseSheet,
};


