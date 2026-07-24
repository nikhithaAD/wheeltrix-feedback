require("dotenv").config();
const path = require("path");
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const authRoutes = require("./routes/auth");
const feedbackRoutes = require("./routes/feedback");

const app = express();

app.use(cors());
app.use(express.json());

// ---- API routes ----
app.use("/api/auth", authRoutes);
app.use("/api/feedback", feedbackRoutes);

// ---- Serve the frontend (static site) ----
const FRONTEND_DIR = path.join(__dirname, "..", "frontend");
app.use(express.static(FRONTEND_DIR));

// Fallback: any unknown non-API route goes to the welcome page
app.get(/^(?!\/api).*/, (req, res) => {
  res.sendFile(path.join(FRONTEND_DIR, "index.html"));
});

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Wheeltrix Feedback server running → http://localhost:${PORT}`);
  });
});
