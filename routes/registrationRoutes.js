const express = require("express");
const router = express.Router();
const {
  registerForEvent,
  getAllRegistrations,
  exportRegistrations,
} = require("../controllers/registrationController");
const { protect, admin } = require("../middleware/auth");

// Public registration
router.post("/register", registerForEvent);

// Admin routes
router.get("/all", protect, admin, getAllRegistrations);
router.get("/export", protect, admin, exportRegistrations);

// Health check endpoint
router.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "registration",
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
