require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

// ─────────────────────────────────────────────────────────────────────────────
// getBestVolunteer
//
// Inputs:
//   task       — { skill, location, urgency }
//   volunteers — [{ name, skills, location }, ...]
//
// Returns:
//   Best volunteer name (string), or fallback message on error
// ─────────────────────────────────────────────────────────────────────────────
async function getBestVolunteer(task, volunteers) {
  // ── Fallback: no API key configured ────────────────────────────────────────
  if (!process.env.GEMINI_API_KEY) {
    console.warn("GEMINI_API_KEY not set — using rule-based fallback");
    return ruleBased(task, volunteers);
  }

  try {
    // ── Build volunteer list for the prompt ──────────────────────────────────
    const volList = volunteers
      .map((v, i) => `${i + 1}. ${v.name} | Skills: ${v.skills.join(", ")} | Location: ${v.location}`)
      .join("\n");

    // ── Prompt ───────────────────────────────────────────────────────────────
    const prompt = `
Select the best volunteer based on skill, location, and urgency.

Task:
- Required Skill: ${task.skill}
- Location: ${task.location || "Any"}
- Urgency: ${task.urgency || "medium"}

Volunteers:
${volList}

Rules:
1. Volunteer must have the required skill
2. Prefer same location as the task
3. For high urgency, pick the closest skill match

Reply with ONLY the volunteer's full name. No explanation. No punctuation.
`;

    // ── Call Gemini ──────────────────────────────────────────────────────────
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const result = await model.generateContent(prompt);
    const name = result.response.text().trim();

    // Validate the returned name actually exists in our list
    const matched = volunteers.find(
      (v) => v.name.toLowerCase() === name.toLowerCase()
    );

    return matched ? matched.name : name; // return as-is if Gemini made up a name

  } catch (err) {
    // ── Graceful fallback on any Gemini error ────────────────────────────────
    console.error("Gemini API error:", err.message);
    return ruleBased(task, volunteers);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Rule-based fallback (no AI needed)
// Priority: skill + location → skill only → partial skill
// ─────────────────────────────────────────────────────────────────────────────
function ruleBased(task, volunteers) {
  const { skill, location } = task;

  // 1. Skill + location
  let match = volunteers.find(
    (v) =>
      v.skills.includes(skill) &&
      v.location.toLowerCase() === (location || "").toLowerCase()
  );

  // 2. Skill only
  if (!match) match = volunteers.find((v) => v.skills.includes(skill));

  // 3. Partial skill
  if (!match) match = volunteers.find((v) => v.skills.some((s) => s.includes(skill)));

  return match ? match.name : "No suitable volunteer found";
}

module.exports = { getBestVolunteer };
