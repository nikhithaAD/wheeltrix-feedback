const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

// ---------- REGISTER ----------
router.post("/register", async (req, res) => {
  try {
    const { fullName, employeeId, email, department, designation, phone, password } = req.body;

    if (!fullName || !employeeId || !email || !department || !password) {
      return res.status(400).json({ message: "Please fill in all required fields." });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters." });
    }

    const existing = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { employeeId }],
    });
    if (existing) {
      return res.status(409).json({ message: "An account with this email or employee ID already exists." });
    }

    const hashed = await bcrypt.hash(password, 10);

    // First-ever account becomes admin automatically, for easy demo/testing
    const userCount = await User.countDocuments();
    const role = userCount === 0 ? "admin" : "employee";

    const user = await User.create({
      fullName,
      employeeId,
      email: email.toLowerCase(),
      department,
      designation,
      phone,
      password: hashed,
      role,
    });

    const token = signToken(user);
    return res.status(201).json({ token, user: publicUser(user) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Registration failed. Please try again." });
  }
});

// ---------- LOGIN ----------
router.post("/login", async (req, res) => {
  try {
    const { identifier, password } = req.body; // identifier = email OR employeeId
    if (!identifier || !password) {
      return res.status(400).json({ message: "Please enter your ID/email and password." });
    }

    const user = await User.findOne({
      $or: [{ email: identifier.toLowerCase() }, { employeeId: identifier }],
    });
    if (!user) {
      return res.status(401).json({ message: "No account found with that email or employee ID." });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: "Incorrect password." });
    }

    const token = signToken(user);
    return res.json({ token, user: publicUser(user) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Login failed. Please try again." });
  }
});

// ---------- CURRENT USER ----------
router.get("/me", requireAuth, async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) return res.status(404).json({ message: "User not found." });
  return res.json({ user: publicUser(user) });
});

function signToken(user) {
  return jwt.sign(
    { id: user._id, employeeId: user.employeeId, role: user.role },
    process.env.JWT_SECRET || "dev_secret",
    { expiresIn: "7d" }
  );
}

function publicUser(user) {
  return {
    id: user._id,
    fullName: user.fullName,
    employeeId: user.employeeId,
    email: user.email,
    department: user.department,
    designation: user.designation,
    phone: user.phone,
    role: user.role,
  };
}

module.exports = router;
