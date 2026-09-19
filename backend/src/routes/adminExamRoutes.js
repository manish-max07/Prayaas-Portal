const express = require("express");
const router = express.Router();
const {
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
  inspectResponseSheet
} = require("../controllers/adminExamController");
const { protect } = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/adminOnlyMiddleware");
const { uploadExcel } = require("../middleware/uploadMiddleware");

// All admin exam routes require both JWT protection and Admin role
router.use(protect, adminOnly);

// Response Sheet Link Inspection & Metadata Extraction (Must be before /:id)
router.post("/inspect-response-sheet", inspectResponseSheet);

// Exam Paper CRUD & Status
router.route("/")
  .post(createExamPaper)
  .get(getAllAdminExams);

router.route("/:id")

  .get(getAdminExamById)
  .put(updateExamPaper);

router.put("/:id/status", toggleExamStatus);

// Exam-Level Bulk Question Upload via Excel (auto-creates sections from "Section" column)
router.post("/:id/upload-questions", uploadExcel.single("file"), uploadExamQuestionsExcel);

// Exam-Level Bulk Question Import via Digialm / TCS iON Link or Raw HTML
router.post("/:id/import-digialm", importExamQuestionsDigialm);

// Section Management
router.post("/:id/sections", addSection);
router.route("/sections/:id")
  .get(getSectionById)
  .put(updateSection);

// Question Management
router.post("/sections/:id/questions", addQuestion);
router.post("/sections/:id/upload-questions", uploadExcel.single("file"), uploadQuestionsExcel);
router.route("/questions/:id")
  .put(updateQuestion)
  .delete(deleteQuestion);

module.exports = router;
