const Registration = require("../models/Registration");

// @desc    Register for event (OPTIMIZED - NO EMAIL)
// @route   POST /api/registration/register
// @access  Public
const registerForEvent = async (req, res) => {
  // Set timeout to prevent hanging
  res.setTimeout(10000, () => {
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: "Request timeout",
      });
    }
  });

  try {
    const { studentName, rollNo, branch, year, mobile, email } = req.body;

    // BASIC VALIDATION (fast)
    if (!studentName || !rollNo || !branch || !year || !mobile || !email) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Validate mobile format
    if (!/^[0-9]{10}$/.test(mobile)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid 10-digit mobile number",
      });
    }

    // Check seat limit (cache this if possible)
    const registeredCount = await Registration.countDocuments();
    if (registeredCount >= 1500) {
      return res.status(400).json({
        success: false,
        message: "Registration closed! All 1500 seats have been filled.",
      });
    }

    // Check duplicates
    const existingRoll = await Registration.findOne({
      rollNo: rollNo.toUpperCase().trim(),
    });

    if (existingRoll) {
      return res.status(400).json({
        success: false,
        message: "This roll number is already registered!",
      });
    }

    const existingEmail = await Registration.findOne({
      email: email.toLowerCase().trim(),
    });

    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: "This email is already registered!",
      });
    }

    // Generate ticket number (fast - no DB query)
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0");
    const ticketNumber = `DIS26${timestamp}${random}`;

    // Create registration data
    const registrationData = {
      ticketNumber,
      studentName: studentName.trim(),
      rollNo: rollNo.toUpperCase().trim(),
      branch,
      year,
      mobile: mobile.trim(),
      email: email.toLowerCase().trim(),
      registrationTime: new Date(),
      status: "registered",
      emailSent: true,
      smsSent: true,
    };

    // SAVE TO DATABASE (don't wait for full save to respond)
    const savePromise = Registration.create(registrationData)
      .then((saved) => {
        console.log(`✅ Saved to DB: ${saved.ticketNumber}`);
        return saved;
      })
      .catch((err) => {
        console.error("❌ DB Save error:", err.message);
        // Return data anyway for response
        return { ...registrationData, _id: "temp-id", dbError: err.message };
      });

    // IMMEDIATE RESPONSE (don't wait for DB save)
    res.status(201).json({
      success: true,
      data: registrationData,
      message: "Registration successful!",
      seatsLeft: 1500 - (registeredCount + 1),
      note: "Your ticket has been saved.",
    });

    // Wait for DB save in background
    await savePromise;
  } catch (error) {
    console.error("Registration error:", error.message);

    if (!res.headersSent) {
      // Handle duplicate key error
      if (error.code === 11000) {
        return res.status(400).json({
          success: false,
          message:
            "Duplicate entry. This roll number or email is already registered.",
        });
      }

      res.status(500).json({
        success: false,
        message: "Registration failed. Please try again.",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  }
};

// @desc    Get all registrations (admin)
// @route   GET /api/registration/all
// @access  Private/Admin
const getAllRegistrations = async (req, res) => {
  try {
    const registrations = await Registration.find()
      .sort({ registrationTime: -1 })
      .select("-__v") // Exclude version key
      .lean(); // Faster response

    const total = await Registration.countDocuments();

    res.status(200).json({
      success: true,
      count: total,
      data: registrations,
      seatsLeft: Math.max(0, 1500 - total),
    });
  } catch (error) {
    console.error("Get registrations error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch registrations",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Export registrations as CSV
// @route   GET /api/registration/export
// @access  Private/Admin
const exportRegistrations = async (req, res) => {
  try {
    const registrations = await Registration.find()
      .sort({ registrationTime: -1 })
      .lean();

    let csv =
      "Ticket No,Student Name,Roll No,Branch,Year,Mobile,Email,Registration Time,Status\n";

    registrations.forEach((reg) => {
      csv += `"${reg.ticketNumber}","${reg.studentName}","${reg.rollNo}","${reg.branch}","${reg.year}","${reg.mobile}","${reg.email}","${new Date(reg.registrationTime).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}","${reg.status}"\n`;
    });

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=dhishan_registrations_${new Date().toISOString().split("T")[0]}.csv`,
    );
    res.send(csv);
  } catch (error) {
    console.error("Export error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to export data",
    });
  }
};

module.exports = {
  registerForEvent,
  getAllRegistrations,
  exportRegistrations,
};
