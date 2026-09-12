const multer = require("multer");
const path = require("path");

// Memory storage to stream buffer directly into exceljs
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const fileExt = path.extname(file.originalname).toLowerCase();
  if (fileExt === ".xlsx" || fileExt === ".xls") {
    cb(null, true);
  } else {
    cb(new Error("Only Excel spreadsheet files (.xlsx, .xls) are allowed!"), false);
  }
};

const uploadExcel = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

module.exports = { uploadExcel };
