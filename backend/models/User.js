const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    employeeId: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    department: { type: String, required: true, trim: true },
    designation: { type: String, trim: true, default: "" },
    phone: { type: String, trim: true, default: "" },
    password: { type: String, required: true },
    role: { type: String, enum: ["employee", "admin"], default: "employee" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
