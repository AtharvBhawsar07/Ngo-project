// ══════════════════════════════════════════════════════════════════════
// VolunteerAI — Frontend JavaScript
// Clean, beginner-friendly, fully functional
// ══════════════════════════════════════════════════════════════════════

// ── Config ────────────────────────────────────────────────────────────
const API = "http://localhost:5000"; // Change to your deployed URL

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

    // Add staggered animation delay
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
    el.innerHTML = `<div class="empty-state">❌ Could not load volunteers. Is the backend running?</div>`;
  }
}

// ── Handle Post Task ──────────────────────────────────────────────────
async function handlePostTask(event) {
  event.preventDefault();
  clearError("form-error");

  // Get form values
  const title = $("task-title").value.trim();
  const skill = $("task-skill").value.trim();
  const location = $("task-location").value.trim();
  const urgency = $("task-urgency").value;
  const description = $("task-desc").value.trim();

  // Validate required fields
  if (!skill) {
    showError("form-error", "Please select a required skill.");
    return;
  }

  // Disable submit button
  const btn = $("submit-btn");
  const originalText = btn.textContent;
  btn.disabled = true;
  btn.textContent = "🤖 Matching...";

  try {
    const res = await fetch(`${API}/task`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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
      throw new Error(err.error || `Server error ${res.status}`);
    }

    const data = await res.json();
    showResult(data);
    loadAssignments();

    // Clear form
    $("task-form").reset();
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
  card.classList.add("success-animation");

  // Check if we have a match
  if (!data.ai_match || data.ai_match === "No suitable volunteer found") {
    content.innerHTML = `
      <div style="padding:2rem;text-align:center;color:var(--text-muted)">
        <div style="font-size:3rem;margin-bottom:1rem">😔</div>
        <div style="font-size:1.1rem;font-weight:600;margin-bottom:0.5rem">No Match Found</div>
        <div style="font-size:0.9rem">No matching volunteer found for skill "${data.task.skill}".</div>
      </div>
    `;
    return;
  }

  // Find the volunteer details from the name
  const volunteerName = data.ai_match;

  content.innerHTML = `
    <div class="result-volunteer">
      <div class="result-avatar">${initials(volunteerName)}</div>
      <div style="flex:1">
        <div class="result-name">${volunteerName}</div>
        <div class="result-meta">
          ✅ Best match for: ${data.task.title || data.task.skill}
        </div>
      </div>
    </div>
    <div class="result-reason">
      🤖 AI selected <strong>${volunteerName}</strong> as the best match for this task based on skill, location, and availability.
    </div>
    <div class="result-method">
      <strong>Task:</strong> ${data.task.skill} | <strong>Location:</strong> ${
    data.task.location || "Any"
  } | <strong>Urgency:</strong> ${data.task.urgency}
    </div>
  `;

  // Scroll to result with smooth animation
  setTimeout(() => {
    card.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, 100);
}

// ── Load Assignments ──────────────────────────────────────────────────
async function loadAssignments() {
  const el = $("assignments-list");
  if (!el) return;

  try {
    const res = await fetch(`${API}/assignments`);
    if (!res.ok) throw new Error();

    const list = await res.json();

    if (!list || list.length === 0) {
      el.innerHTML = `<div class="empty-state">No assignments yet. Post a task above to get started!</div>`;
      return;
    }

    // Show newest first with staggered animation
    el.innerHTML = [...list]
      .reverse()
      .map(
        (a, index) => `
      <div class="history-item" style="animation-delay: ${index * 0.05}s">
        <div class="history-task">📋 ${a.task.title || a.task.skill}</div>
        <div class="history-vol">👤 ${a.ai_match}</div>
        <div class="history-time">${new Date(
          a.timestamp
        ).toLocaleTimeString()}</div>
      </div>
    `
      )
      .join("");
  } catch (err) {
    console.error("Error loading assignments:", err);
    el.innerHTML = `<div class="empty-state">Could not load assignments.</div>`;
  }
}

// ── Smooth Scroll for Navigation Links ───────────────────────────────
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute("href"));
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });
});

// ── Navbar Scroll Effect ─────────────────────────────────────────────
window.addEventListener("scroll", () => {
  const navbar = $("navbar");
  if (navbar) {
    if (window.scrollY > 50) {
      navbar.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)";
    } else {
      navbar.style.boxShadow = "0 1px 3px rgba(0,0,0,0.05)";
    }
  }
});

// ── Initialize on Page Load ───────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  console.log("VolunteerAI initialized");
  loadVolunteers();
  loadAssignments();
});
