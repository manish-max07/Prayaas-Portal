const express = require("express");
const router = express.Router();
const {
  getBlocklist,
  addBlocklistEntry,
  toggleBlocklistEntry,
  seedDefaultDomains
} = require("../controllers/adminSecurityController");
const { protect } = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/adminOnlyMiddleware");

// All admin security routes require authenticated admin
router.use(protect, adminOnly);

router.get("/blocklist", getBlocklist);
router.post("/blocklist", addBlocklistEntry);
router.patch("/blocklist/:id/toggle", toggleBlocklistEntry);
router.post("/seed-defaults", seedDefaultDomains);

module.exports = router;
