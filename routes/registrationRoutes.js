const express = require("express");
const router = express.Router();
const {
  registerForEvent,
  getAllRegistrations,
  exportRegistrations,
} = require("../controllers/registrationController");
const { protect, admin } = require("../middleware/auth");

router.post("/register", registerForEvent);
router.get("/all", protect, admin, getAllRegistrations);
router.get("/export", protect, admin, exportRegistrations);

module.exports = router;
