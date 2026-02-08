const Registration = require("../models/Registration");
const { generateTicket } = require("../utils/pdfGenerator");
const { sendRegistrationSMS } = require("../utils/smsService");
const nodemailer = require("nodemailer");

// Configure nodemailer
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// @desc    Register for event
// @route   POST /api/registration/register
// @access  Public
const registerForEvent = async (req, res) => {
  try {
    // Check if 1500 seats are filled
    const registeredCount = await Registration.countDocuments();
    if (registeredCount >= 1500) {
      return res.status(400).json({
        message: "Registration closed! All 1500 seats have been filled.",
      });
    }

    // Check if roll number already registered
    const existingRegistration = await Registration.findOne({
      rollNo: req.body.rollNo.toUpperCase(),
    });

    if (existingRegistration) {
      return res.status(400).json({
        message: "This roll number is already registered!",
      });
    }

    // Check if email already registered
    const existingEmail = await Registration.findOne({
      email: req.body.email.toLowerCase(),
    });

    if (existingEmail) {
      return res.status(400).json({
        message: "This email is already registered!",
      });
    }

    // Create registration
    const registration = await Registration.create(req.body);

    // Generate PDF ticket
    const pdfBuffer = await generateTicket(registration);

    // Send email with PDF attachment
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: registration.email,
      subject: "Dhishan 26 - Registration Confirmation",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #0c4a6e;">🎉 Registration Successful!</h2>
          <p>Dear ${registration.studentName},</p>
          <p>Your registration for <strong>Dhishan 26</strong> has been confirmed!</p>
          
          <div style="background: #f0f9ff; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #075985;">Registration Details:</h3>
            <p><strong>Ticket Number:</strong> ${registration.ticketNumber}</p>
            <p><strong>Roll No:</strong> ${registration.rollNo}</p>
            <p><strong>Branch:</strong> ${registration.branch}</p>
            <p><strong>Year:</strong> ${registration.year}</p>
          </div>
          
          <div style="background: #fffbeb; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #92400e;">Event Details:</h3>
            <p><strong>Date:</strong> 15th February, 2026</p>
            <p><strong>Time:</strong> 10:00 AM to 08:00 PM</p>
            <p><strong>Venue:</strong> Open Theatre, GCEK</p>
          </div>
          
          <div style="background: #fef2f2; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #7f1d1d;">Important Instructions:</h3>
            <ul>
              <li>This event is strictly for GCEK students only</li>
              <li>Carry your college ID card for verification</li>
              <li>Free refreshments will be provided</li>
              <li>Only 1500 seats available - first come, first served</li>
              <li>For any queries, contact: +91 836 998 5931</li>
            </ul>
          </div>
          
          <p style="color: #666; font-size: 12px;">
            Note: Your ticket PDF is attached. Please carry a printed copy or show it on your mobile at entry.
          </p>
        </div>
      `,
      attachments: [
        {
          filename: `Dhishan26_Ticket_${registration.ticketNumber}.pdf`,
          content: pdfBuffer,
          contentType: "application/pdf",
        },
      ],
    };

    // Send SMS
    const smsSent = await sendRegistrationSMS(
      registration.mobile,
      registration.studentName,
      registration.ticketNumber,
    );

    // Update registration record
    registration.smsSent = smsSent;

    // Try to send email
    try {
      await transporter.sendMail(mailOptions);
      registration.emailSent = true;
      await registration.save();
    } catch (emailError) {
      console.error("Email error:", emailError);
      registration.emailSent = false;
      await registration.save();
    }

    res.status(201).json({
      success: true,
      data: registration,
      message: "Registration successful! Check your email for ticket.",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// @desc    Get all registrations (admin)
// @route   GET /api/registration/all
// @access  Private/Admin
const getAllRegistrations = async (req, res) => {
  try {
    const registrations = await Registration.find().sort({
      registrationTime: -1,
    });
    const total = await Registration.countDocuments();

    res.status(200).json({
      success: true,
      count: total,
      data: registrations,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// @desc    Export registrations as CSV
// @route   GET /api/registration/export
// @access  Private/Admin
const exportRegistrations = async (req, res) => {
  try {
    const registrations = await Registration.find().sort({
      registrationTime: -1,
    });

    let csv =
      "Ticket No,Student Name,Roll No,Branch,Year,Mobile,Email,Registration Time,Status\n";

    registrations.forEach((reg) => {
      csv += `"${reg.ticketNumber}","${reg.studentName}","${reg.rollNo}","${reg.branch}","${reg.year}","${reg.mobile}","${reg.email}","${new Date(reg.registrationTime).toLocaleString()}","${reg.status}"\n`;
    });

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=dhishan_registrations.csv",
    );
    res.send(csv);
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

module.exports = {
  registerForEvent,
  getAllRegistrations,
  exportRegistrations,
};
