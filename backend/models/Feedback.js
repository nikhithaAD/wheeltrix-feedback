const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema(
  {
    ticketNo: { type: String, required: true, unique: true },
    submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    // snapshot of employee details at time of submission
    employeeSnapshot: {
      fullName: String,
      employeeId: String,
      email: String,
      department: String,
      designation: String,
    },

    category: {
      type: String,
      enum: ["Workplace", "Management", "Facilities", "IT & Tools", "Policy", "Other"],
      required: true,
    },
    channel: {
      type: String,
      enum: ["Web", "Mobile", "Kiosk", "Email"],
      default: "Web",
    },
    rating: { type: Number, min: 1, max: 5, required: true },
    subject: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    anonymous: { type: Boolean, default: false },

    status: {
      type: String,
      enum: ["Open", "In Review", "Resolved", "Closed"],
      default: "Open",
    },
    adminNote: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Feedback", feedbackSchema);
