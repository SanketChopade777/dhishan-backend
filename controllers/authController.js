const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Create user
    const user = await User.create({
      email,
      password,
      role: "user",
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for user email
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      //   console.log(email);
      //   console.log(password);
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get admin dashboard data
// @route   GET /api/auth/dashboard
// @access  Private/Admin
const getDashboardData = async (req, res) => {
  try {
    const Registration = require("../models/Registration");

    const totalRegistrations = await Registration.countDocuments();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayRegistrations = await Registration.countDocuments({
      registrationTime: { $gte: today },
    });

    const branchStats = await Registration.aggregate([
      { $group: { _id: "$branch", count: { $sum: 1 } } },
    ]);

    const yearStats = await Registration.aggregate([
      { $group: { _id: "$year", count: { $sum: 1 } } },
    ]);

    res.json({
      totalRegistrations,
      todayRegistrations,
      branchStats,
      yearStats,
      availableSeats: Math.max(0, 1000 - totalRegistrations),
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  register,
  login,
  getDashboardData,
};
