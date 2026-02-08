const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },
  },
  { timestamps: true },
);

/// 🔐 HASH PASSWORD
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return; // ✅ RETURN is critical
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  //   console.log(this.password);
  next();
});

/// 🔑 MATCH PASSWORD
UserSchema.methods.matchPassword = async function (enteredPassword) {
  // console.log(this.password);
  return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", UserSchema);
