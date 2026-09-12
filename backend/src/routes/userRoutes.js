const express = require("express");
const router = express.Router();
const { getUserAttemptHistory } = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");

// All user routes require authentication
router.use(protect);

router.get("/me/attempts", getUserAttemptHistory);

module.exports = router;
