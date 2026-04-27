require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { getBestVolunteer } = require("./gemini");

const app = express();
app.use(cors());
app.use(express.json());

// ── In-Memory Data ────────────────────────────────────────────────────────────
const volunteers = [
  { id: "1", name: "Priya Sharma",   skills: ["medical", "first-aid"], location: "Delhi",     available: true },
  { id: "2", name: "Rahul Verma",    skills: ["logistics", "driving"], location: "Mumbai",    available: true },
  { id: "3", name: "Anjali Singh",   skills: ["medical", "nursing"],   location: "Delhi",     available: true },
  { id: "4", name: "Aman Gupta",     skills: ["teaching", "IT"],       location: "Bangalore", available: true },
  { id: "5", name: "Kavita Nair",    skills: ["rescue", "first-aid"],  location: "Indore",    available: true },
];

const assignments = [];

// ── Routes ────────────────────────────────────────────────────────────────────

// Health check
app.get("/", (_req, res) => res.json({ status: "VolunteerAI API is running ✅" }));

// GET /volunteers — list all volunteers
app.get("/volunteers", (_req, res) => res.json(volunteers));

// POST /task — AI-powered volunteer assignment
app.post("/task", async (req, res) => {
  try {
    const { title, skill, location, urgency, description } = req.body;

    // Validate required field
    if (!skill) {
      return res.status(400).json({ error: "skill is required" });
    }

    // Build task object
    const task = {
      title:       title       || "Unnamed Task",
      skill,
      location:    location    || "",
      urgency:     urgency     || "medium",
      description: description || "",
    };

    // Call Gemini AI (falls back to rule-based automatically if key missing)
    const ai_match = await getBestVolunteer(task, volunteers);

    // Save to history
    assignments.push({ task, ai_match, timestamp: new Date().toISOString() });

    // Return clean response
    res.json({ task, ai_match });

  } catch (err) {
    console.error("POST /task error:", err.message);
    res.status(500).json({ error: "Something went wrong. Please try again." });
  }
});

// GET /assignments — view all past assignments
app.get("/assignments", (_req, res) => res.json(assignments));

// ── Start ─────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 Server running → http://localhost:${PORT}`);
  console.log(`🤖 Gemini AI: ${process.env.GEMINI_API_KEY ? "enabled" : "disabled (rule-based fallback active)"}\n`);
});
