const express = require("express");
const User = require("../models/User");
const Feedback = require("../models/Feedback");
const { requireAuth, requireAdmin } = require("../middleware/auth");

const router = express.Router();

function generateTicketNo() {
  const now = new Date();
  const y = now.getFullYear().toString().slice(-2);
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `WX-${y}${(now.getMonth() + 1).toString().padStart(2, "0")}-${rand}`;
}

// ---------- SUBMIT FEEDBACK (employee) ----------
router.post("/", requireAuth, async (req, res) => {
  try {
    const { category, channel, rating, subject, message, anonymous } = req.body;

    if (!category || !rating || !subject || !message) {
      return res.status(400).json({ message: "Please complete all required fields." });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "Employee record not found." });

    let ticketNo = generateTicketNo();
    // ensure uniqueness (very unlikely collision, but be safe)
    while (await Feedback.findOne({ ticketNo })) {
      ticketNo = generateTicketNo();
    }

    const feedback = await Feedback.create({
      ticketNo,
      submittedBy: user._id,
      employeeSnapshot: {
        fullName: user.fullName,
        employeeId: user.employeeId,
        email: user.email,
        department: user.department,
        designation: user.designation,
      },
      category,
      channel: channel || "Web",
      rating,
      subject,
      message,
      anonymous: !!anonymous,
    });

    return res.status(201).json({ feedback });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Could not submit feedback. Please try again." });
  }
});

// ---------- MY FEEDBACK (employee) ----------
router.get("/my", requireAuth, async (req, res) => {
  const items = await Feedback.find({ submittedBy: req.user.id }).sort({ createdAt: -1 });
  res.json({ feedback: items });
});

// ---------- ALL FEEDBACK (admin) ----------
router.get("/", requireAuth, requireAdmin, async (req, res) => {
  const { status, category, department, q } = req.query;
  const filter = {};
  if (status) filter.status = status;
  if (category) filter.category = category;
  if (department) filter["employeeSnapshot.department"] = department;
  if (q) {
    filter.$or = [
      { subject: new RegExp(q, "i") },
      { message: new RegExp(q, "i") },
      { ticketNo: new RegExp(q, "i") },
    ];
  }
  const items = await Feedback.find(filter).sort({ createdAt: -1 });
  res.json({ feedback: items });
});

// ---------- UPDATE STATUS (admin) ----------
router.patch("/:id", requireAuth, requireAdmin, async (req, res) => {
  const { status, adminNote } = req.body;
  const updated = await Feedback.findByIdAndUpdate(
    req.params.id,
    { ...(status && { status }), ...(adminNote !== undefined && { adminNote }) },
    { new: true }
  );
  if (!updated) return res.status(404).json({ message: "Feedback not found." });
  res.json({ feedback: updated });
});

// ---------- ANALYTICS SUMMARY (admin) ----------
router.get("/stats/summary", requireAuth, requireAdmin, async (req, res) => {
  const [total, byStatus, byCategory, avgRatingAgg, byDept] = await Promise.all([
    Feedback.countDocuments(),
    Feedback.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
    Feedback.aggregate([{ $group: { _id: "$category", count: { $sum: 1 } } }]),
    Feedback.aggregate([{ $group: { _id: null, avg: { $avg: "$rating" } } }]),
    Feedback.aggregate([
      { $group: { _id: "$employeeSnapshot.department", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
  ]);

  res.json({
    total,
    avgRating: avgRatingAgg[0]?.avg || 0,
    byStatus,
    byCategory,
    byDept,
  });
});

module.exports = router;
