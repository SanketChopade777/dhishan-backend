const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Admin = require("../models/Admin");

dotenv.config();

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    const exists = await Admin.findOne({ username: "admin@dhishan.com" });
    if (exists) {
      console.log("Admin already exists");
      process.exit();
    }

    const admin = new Admin({
      username: "uremail",
      password: "urpass", // plain text here
    });

    await admin.save();

    console.log("✅ Admin created successfully");
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

createAdmin();
