const mongoose = require("mongoose");

const RegistrationSchema = new mongoose.Schema({
  ticketNumber: {
    type: String,
    unique: true,
  },
  studentName: {
    type: String,
    required: [true, "Please add student name"],
    trim: true,
  },
  rollNo: {
    type: String,
    required: [true, "Please add roll number"],
    unique: true,
    uppercase: true,
    trim: true,
  },
  branch: {
    type: String,
    enum: ["IT", "MECH", "Ele", "ENTC", "Civil"],
    required: [true, "Please select branch"],
  },
  year: {
    type: String,
    enum: ["FY", "SY", "TY", "Final"],
    required: [true, "Please select year"],
  },
  mobile: {
    type: String,
    required: [true, "Please add mobile number"],
    validate: {
      validator: function (v) {
        return /^[0-9]{10}$/.test(v);
      },
      message: "Please enter a valid 10-digit mobile number",
    },
    trim: true,
  },
  email: {
    type: String,
    required: [true, "Please add email"],
    lowercase: true,
    trim: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      "Please add a valid email",
    ],
  },
  registrationTime: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ["registered", "checked-in"],
    default: "registered",
  },
  emailSent: {
    type: Boolean,
    default: true,
  },
  smsSent: {
    type: Boolean,
    default: true,
  },
});

// FAST ticket generation - NO database query
RegistrationSchema.pre("save", async function (next) {
  if (!this.ticketNumber) {
    // Generate from timestamp (fast, no DB query)
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0");
    this.ticketNumber = `DIS26${timestamp}${random}`;
  }
  next(); // DON'T FORGET THIS!
});

// Create indexes for faster queries
RegistrationSchema.index({ rollNo: 1 });
RegistrationSchema.index({ email: 1 });
RegistrationSchema.index({ registrationTime: -1 });

module.exports = mongoose.model("Registration", RegistrationSchema);
