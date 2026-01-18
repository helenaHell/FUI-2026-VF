import { createFUIWindow } from "../core/template.js";
import {
  setupKeyboardHandler,
  setupClickHandler,
  formatTime,
} from "../core/utils.js";

// =====================
// DATA
// =====================

const TARGETS = [
  {
    id: "T-0451",
    code: "CAIRO-NODE",
    loc: "Cairo, EG",
    status: "ACTIVE",
    pri: "HIGH",
    intel: 87,
    last: "12m ago",
  },
  {
    id: "T-0892",
    code: "BERLIN-HUB",
    loc: "Berlin, DE",
    status: "IDLE",
    pri: "MED",
    intel: 64,
    last: "2h ago",
  },
  {
    id: "T-1203",
    code: "MOSCOW-RLY",
    loc: "Moscow, RU",
    status: "ACTIVE",
    pri: "HIGH",
    intel: 92,
    last: "5m ago",
  },
  {
    id: "T-0334",
    code: "DUBAI-LINK",
    loc: "Dubai, AE",
    status: "COMP",
    pri: "CRIT",
    intel: 41,
    last: "45m ago",
  },
  {
    id: "T-0776",
    code: "TOKYO-BRG",
    loc: "Tokyo, JP",
    status: "ACTIVE",
    pri: "LOW",
    intel: 78,
    last: "8m ago",
  },
  {
    id: "T-1098",
    code: "LONDON-PRX",
    loc: "London, GB",
    status: "IDLE",
    pri: "MED",
    intel: 55,
    last: "3h ago",
  },
  {
    id: "T-0512",
    code: "SYDNEY-NOD",
    loc: "Sydney, AU",
    status: "ACTIVE",
    pri: "LOW",
    intel: 69,
    last: "15m ago",
  },
  {
    id: "T-0923",
    code: "ISTANBUL-H",
    loc: "Istanbul, TR",
    status: "ACTIVE",
    pri: "HIGH",
    intel: 83,
    last: "7m ago",
  },
  {
    id: "T-0445",
    code: "NYC-CNTRL",
    loc: "New York, US",
    status: "WATCH",
    pri: "MED",
    intel: 72,
    last: "22m ago",
  },
  {
    id: "T-1156",
    code: "PARIS-RLY",
    loc: "Paris, FR",
    status: "IDLE",
    pri: "LOW",
    intel: 58,
    last: "1h ago",
  },
  {
    id: "T-0667",
    code: "SEOUL-HUB",
    loc: "Seoul, KR",
    status: "ACTIVE",
    pri: "MED",
    intel: 81,
    last: "11m ago",
  },
  {
    id: "T-0889",
    code: "SAO-PAULO",
    loc: "Sao Paulo, BR",
    status: "IDLE",
    pri: "LOW",
    intel: 49,
    last: "4h ago",
  },
];

const INTEL_NOTES = [
  "Signal intercept detected - encrypted traffic pattern match",
  "Asset relocation confirmed via satellite imagery",
  "Communication frequency shift observed - possible countermeasure",
  "New node identified in network topology",
  "Behavioral pattern deviation - increased activity",
  "Cross-reference match found in archived data",
  "Dormant asset reactivation detected",
  "Protocol change implemented - monitoring adaptation required",
];

// =====================
// STATE
// =====================

const state = {
  selectedTarget: 0,
  filterStatus: "ALL",
  filterPriority: "ALL",
  viewMode: "TARGETS",
  intelNotes: [],
};

// =====================
// HELPERS
// =====================

function getFilteredTargets() {
  return TARGETS.filter((t) => {
    const statusMatch =
      state.filterStatus === "ALL" || t.status === state.filterStatus;
    const priMatch =
      state.filterPriority === "ALL" || t.pri === state.filterPriority;
    return statusMatch && priMatch;
  });
}

function getStatusColor(status) {
  switch (status) {
    case "ACTIVE":
      return "var(--color-text-main)";
    case "COMP":
      return "#ff4444";
    case "WATCH":
      return "#ffaa00";
    default:
      return "var(--text-glow)";
  }
}

function getPrioritySymbol(pri) {
  switch (pri) {
    case "CRIT":
      return "!!!";
    case "HIGH":
      return "!!";
    case "MED":
      return "!";
    default:
      return "-";
  }
}

// =====================
// RENDER
// =====================

function render() {
  const filtered = getFilteredTargets();
  const selected = filtered[state.selectedTarget] || filtered[0];

  return `
    <div class="intel-container">
      <div class="intel-header">
        <span class="intel-title">INTELLIGENCE</span>
        <span class="intel-filters">
          <span class="filter-item ${state.filterStatus === "ALL" ? "active" : ""}" data-filter-type="status" data-value="ALL">ALL</span>
          <span class="filter-item ${state.filterStatus === "ACTIVE" ? "active" : ""}" data-filter-type="status" data-value="ACTIVE">ACTV</span>
          <span class="filter-item ${state.filterStatus === "COMP" ? "active" : ""}" data-filter-type="status" data-value="COMP">COMP</span>
          <span class="filter-sep">|</span>
          <span class="filter-item ${state.filterPriority === "ALL" ? "active" : ""}" data-filter-type="priority" data-value="ALL">ALL</span>
          <span class="filter-item ${state.filterPriority === "CRIT" ? "active" : ""}" data-filter-type="priority" data-value="CRIT">CRIT</span>
          <span class="filter-item ${state.filterPriority === "HIGH" ? "active" : ""}" data-filter-type="priority" data-value="HIGH">HIGH</span>
        </span>
        <span class="intel-time">${formatTime()}</span>
      </div>

      <div class="intel-body">
        <div class="intel-left">
          <div class="intel-list-header">
            <span>ID</span>
            <span>TARGET</span>
            <span>LOC</span>
            <span>ST</span>
            <span>P</span>
            <span>INT</span>
          </div>
          <div class="intel-list">
            ${filtered
              .map(
                (t, i) => `
              <div class="intel-row ${i === state.selectedTarget ? "selected" : ""}" data-index="${i}">
                <span class="intel-id">${t.id}</span>
                <span class="intel-code">${t.code}</span>
                <span class="intel-loc">${t.loc}</span>
                <span class="intel-status" style="color: ${getStatusColor(t.status)}">${t.status}</span>
                <span class="intel-pri">${getPrioritySymbol(t.pri)}</span>
                <span class="intel-level">
                  <span class="intel-bar" style="width: ${t.intel}%"></span>
                  <span class="intel-val">${t.intel}</span>
                </span>
              </div>
            `,
              )
              .join("")}
          </div>
        </div>

        <div class="intel-right">
          ${
            selected
              ? `
            <div class="intel-detail">
              <div class="detail-section">
                <div class="detail-row">
                  <span class="detail-label">TARGET_ID:</span>
                  <span class="detail-value">${selected.id}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">CODENAME:</span>
                  <span class="detail-value">${selected.code}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">LOCATION:</span>
                  <span class="detail-value">${selected.loc}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">STATUS:</span>
                  <span class="detail-value" style="color: ${getStatusColor(selected.status)}">${selected.status}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">PRIORITY:</span>
                  <span class="detail-value">${selected.pri}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">INTEL_LVL:</span>
                  <span class="detail-value">${selected.intel}%</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">LAST_UPD:</span>
                  <span class="detail-value">${selected.last}</span>
                </div>
              </div>

              <div class="detail-section">
                <div class="detail-section-title">INTEL NOTES:</div>
                <div class="intel-notes">
                  ${
                    state.intelNotes
                      .slice(-4)
                      .map(
                        (note) => `
                    <div class="intel-note">
                      <span class="note-time">${note.time}</span>
                      <span class="note-text">${note.text}</span>
                    </div>
                  `,
                      )
                      .join("") ||
                    '<div class="intel-empty">No recent intelligence</div>'
                  }
                </div>
              </div>

              <div class="detail-actions">
                <span class="action-hint">[ENTER] Add Note  [F] Filter  [↑↓] Navigate  [R] Refresh</span>
              </div>
            </div>
          `
              : '<div class="intel-empty">No target selected</div>'
          }
        </div>
      </div>

      <div class="intel-footer">
        <span>TARGETS: ${filtered.length}/${TARGETS.length}</span>
        <span>ACTIVE: ${TARGETS.filter((t) => t.status === "ACTIVE").length}</span>
        <span>AVG_INTEL: ${Math.round(TARGETS.reduce((sum, t) => sum + t.intel, 0) / TARGETS.length)}%</span>
      </div>
    </div>
  `;
}

// =====================
// UPDATE
// =====================

function update() {
  if (Math.random() > 0.7) {
    const target = TARGETS[Math.floor(Math.random() * TARGETS.length)];
    const note = INTEL_NOTES[Math.floor(Math.random() * INTEL_NOTES.length)];

    state.intelNotes.push({
      time: formatTime(),
      target: target.id,
      text: note,
    });

    if (state.intelNotes.length > 20) state.intelNotes.shift();
  }
}

// =====================
// INTERACTIONS
// =====================

let cleanupKeyboard = null;
let cleanupClick = null;

function setupInteractions() {
  if (cleanupKeyboard) cleanupKeyboard();
  if (cleanupClick) cleanupClick();

  cleanupKeyboard = setupKeyboardHandler("main-intel", {
    ArrowUp: () => {
      const filtered = getFilteredTargets();
      state.selectedTarget = Math.max(0, state.selectedTarget - 1);
      mainIntelWindow.forceRender();
    },
    ArrowDown: () => {
      const filtered = getFilteredTargets();
      state.selectedTarget = Math.min(
        filtered.length - 1,
        state.selectedTarget + 1,
      );
      mainIntelWindow.forceRender();
    },
    Enter: () => {
      const filtered = getFilteredTargets();
      const selected = filtered[state.selectedTarget];
      if (selected) {
        const note =
          INTEL_NOTES[Math.floor(Math.random() * INTEL_NOTES.length)];
        state.intelNotes.push({
          time: formatTime(),
          target: selected.id,
          text: note,
        });
        mainIntelWindow.forceRender();
      }
    },
    KeyF: () => {
      const statuses = ["ALL", "ACTIVE", "COMP", "IDLE"];
      const current = statuses.indexOf(state.filterStatus);
      state.filterStatus = statuses[(current + 1) % statuses.length];
      state.selectedTarget = 0;
      mainIntelWindow.forceRender();
    },
    KeyR: () => {
      TARGETS.forEach((t) => {
        if (Math.random() > 0.7) {
          t.intel = Math.min(100, t.intel + Math.floor(Math.random() * 5));
        }
      });
      mainIntelWindow.forceRender();
    },
  });

  cleanupClick = setupClickHandler("main-intel", ".intel-row", (e, target) => {
    state.selectedTarget = parseInt(target.dataset.index);
    mainIntelWindow.forceRender();
  });

  const filterClick = setupClickHandler(
    "main-intel",
    ".filter-item",
    (e, target) => {
      const type = target.dataset.filterType;
      const value = target.dataset.value;

      if (type === "status") state.filterStatus = value;
      if (type === "priority") state.filterPriority = value;

      state.selectedTarget = 0;
      mainIntelWindow.forceRender();
    },
  );

  const oldCleanupClick = cleanupClick;
  cleanupClick = () => {
    oldCleanupClick();
    filterClick();
  };
}

// =====================
// WINDOW
// =====================

const mainIntelWindow = createFUIWindow({
  id: "main-intel",
  render,
  update,
  interval: { min: 3000, max: 8000 },
  defaultMode: "default",
});

export function startMainIntel() {
  mainIntelWindow.start();
  setTimeout(setupInteractions, 100);
}

export function stopMainIntel() {
  mainIntelWindow.stop();
  if (cleanupKeyboard) cleanupKeyboard();
  if (cleanupClick) cleanupClick();
}
