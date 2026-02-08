const express = require("express");
const router = express.Router();
const {
  register,
  login,
  getDashboardData,
} = require("../controllers/authController");
const { protect, admin } = require("../middleware/auth");

router.post("/register", register);
router.post("/login", login);
router.get("/dashboard", protect, admin, getDashboardData);

module.exports = router;
