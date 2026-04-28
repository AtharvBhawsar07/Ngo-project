// ══════════════════════════════════════════════════════════════════════
// VolunteerAI — Frontend JavaScript (UPDATED)
// ══════════════════════════════════════════════════════════════════════

// ── Config ────────────────────────────────────────────────────────────
const API =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1"
    ? "http://localhost:5000"
    : "https://ngo-project-9to8.onrender.com";

// ── Helper Functions ──────────────────────────────────────────────────
const $ = (id) => document.getElementById(id);

function initials(name) {
  return (name || "?")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function showError(elementId, message) {
  const el = $(elementId);
  if (el) {
    el.textContent = message;
    el.style.color = "#ef4444";
  }
}

function clearError(elementId) {
  const el = $(elementId);
  if (el) el.textContent = "";
}

// ── Load Volunteers ───────────────────────────────────────────────────
async function loadVolunteers() {
  const el = $("volunteers-list");
  if (!el) return;

  el.innerHTML = `<div class="loading-state">Loading volunteers...</div>`;

  try {
    const res = await fetch(`${API}/volunteers`);
    if (!res.ok) throw new Error(`Server error ${res.status}`);

    const volunteers = await res.json();

    if (!volunteers || volunteers.length === 0) {
      el.innerHTML = `<div class="empty-state">No volunteers found.</div>`;
      return;
    }

    el.innerHTML = volunteers
      .map(
        (v, index) => `
      <div class="vol-item" style="animation-delay: ${index * 0.1}s">
        <div class="vol-avatar">${initials(v.name)}</div>
        <div>
          <div class="vol-name">${v.name}</div>
          <div class="vol-detail">📍 ${v.location}</div>
          <div>
            ${(v.skills || [])
              .map((s) => `<span class="skill-tag">${s}</span>`)
              .join("")}
          </div>
        </div>
      </div>
    `
      )
      .join("");
  } catch (err) {
    console.error("Error loading volunteers:", err);
    el.innerHTML = `<div class="empty-state">❌ Backend not running</div>`;
  }
}

// ── Handle Post Task ──────────────────────────────────────────────────
async function handlePostTask(event) {
  event.preventDefault();
  clearError("form-error");

  const title = $("task-title")?.value.trim();
  const skill = $("task-skill")?.value.trim();
  const location = $("task-location")?.value.trim();
  const urgency = $("task-urgency")?.value;
  const description = $("task-desc")?.value.trim();

  if (!skill) {
    showError("form-error", "Please select a required skill.");
    return;
  }

  const btn = $("submit-btn");
  const originalText = btn.textContent;

  btn.disabled = true;
  btn.textContent = "🤖 Matching...";

  try {
    const res = await fetch(`${API}/task`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: title || "Unnamed Task",
        skill,
        location,
        urgency,
        description,
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Server error");
    }

    const data = await res.json();
    showResult(data);
    loadAssignments();

    // ✅ FIXED HERE
    const form = $("taskForm");
    if (form) form.reset();
  } catch (err) {
    console.error("Error posting task:", err);
    showError("form-error", `❌ ${err.message}`);
  } finally {
    btn.disabled = false;
    btn.textContent = originalText;
  }
}

// ── Show Result ───────────────────────────────────────────────────────
function showResult(data) {
  const card = $("result-card");
  const content = $("result-content");

  if (!card || !content) return;

  card.classList.remove("hidden");

  if (!data.ai_match || data.ai_match === "No suitable volunteer found") {
    content.innerHTML = `<div>No Match Found 😔</div>`;
    return;
  }

  const volunteerName = data.ai_match;

  content.innerHTML = `
    <div class="result-volunteer">
      <div class="result-avatar">${initials(volunteerName)}</div>
      <div>
        <div class="result-name">${volunteerName}</div>
        <div>Best match for: ${data.task.title || data.task.skill}</div>
      </div>
    </div>
  `;
}

// ── Load Assignments ──────────────────────────────────────────────────
async function loadAssignments() {
  const el = $("assignments-list");
  if (!el) return;

  try {
    const res = await fetch(`${API}/assignments`);
    if (!res.ok) throw new Error();

    const list = await res.json();

    if (!list.length) {
      el.innerHTML = `<div>No assignments yet</div>`;
      return;
    }

    el.innerHTML = list
      .reverse()
      .map(
        (a) => `
      <div>
        📋 ${a.task.title || a.task.skill} → 👤 ${a.ai_match}
      </div>
    `
      )
      .join("");
  } catch (err) {
    console.error(err);
    el.innerHTML = `<div>Error loading assignments</div>`;
  }
}

// ── Init ──────────────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  console.log("VolunteerAI initialized");
  loadVolunteers();
  loadAssignments();
});