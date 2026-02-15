const mongoose = require("mongoose");
const {
  TrustProductsEntityAssignmentsInstance,
} = require("twilio/lib/rest/trusthub/v1/trustProducts/trustProductsEntityAssignments");

const RegistrationSchema = new mongoose.Schema({
  ticketNumber: {
    type: String,
    unique: true,
    // required: true,
  },
  studentName: {
    type: String,
    required: [true, "Please add student name"],
  },
  rollNo: {
    type: String,
    required: [true, "Please add roll number"],
    unique: true,
    uppercase: true,
  },
  branch: {
    type: String,
    enum: ["IT", "MECH", "ELE", "ENTC", "CIVIL", "M.TECH", "MCA"],
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
  },
  email: {
    type: String,
    required: [true, "Please add email"],
    lowercase: true,
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

// Generate ticket number safely before saving
RegistrationSchema.pre("save", function (next) {
  if (!this.ticketNumber) {
    const uniquePart = this._id.toString().slice(-6).toUpperCase();
    this.ticketNumber = `DIS26${uniquePart}`;
  }
  next();
});

module.exports = mongoose.model("Registration", RegistrationSchema);
