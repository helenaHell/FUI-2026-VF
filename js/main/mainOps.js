import { createFUIWindow } from "../core/template.js";
import {
  setupKeyboardHandler,
  setupClickHandler,
  formatTime,
} from "../core/utils.js";

// =====================
// DATA
// =====================

const OPERATIONS = [
  {
    id: "OP-1847",
    code: "GHOST WIRE",
    status: "ACTIVE",
    progress: 78,
    eta: "4h 12m",
    agents: 3,
    risk: "LOW",
  },
  {
    id: "OP-1923",
    code: "DARK TIDE",
    status: "STANDBY",
    progress: 45,
    eta: "12h 05m",
    agents: 5,
    risk: "MED",
  },
  {
    id: "OP-2001",
    code: "IRON VEIL",
    status: "ACTIVE",
    progress: 92,
    eta: "1h 30m",
    agents: 2,
    risk: "HIGH",
  },
  {
    id: "OP-1756",
    code: "SILENT KEY",
    status: "COMPLETE",
    progress: 100,
    eta: "DONE",
    agents: 4,
    risk: "LOW",
  },
  {
    id: "OP-1889",
    code: "DEEP ECHO",
    status: "ACTIVE",
    progress: 34,
    eta: "18h 45m",
    agents: 6,
    risk: "CRIT",
  },
  {
    id: "OP-1998",
    code: "COLD CHAIN",
    status: "STANDBY",
    progress: 12,
    eta: "36h 20m",
    agents: 3,
    risk: "MED",
  },
  {
    id: "OP-2034",
    code: "SWIFT HAWK",
    status: "ACTIVE",
    progress: 67,
    eta: "6h 15m",
    agents: 4,
    risk: "LOW",
  },
  {
    id: "OP-1834",
    code: "BLUE CROWN",
    status: "FAILED",
    progress: 58,
    eta: "ABORT",
    agents: 2,
    risk: "HIGH",
  },
];

const RESOURCES = [
  { type: "AGENTS", available: 28, deployed: 29, total: 57 },
  { type: "ASSETS", available: 142, deployed: 78, total: 220 },
  { type: "CHANNELS", available: 34, deployed: 12, total: 46 },
  { type: "NODES", available: 89, deployed: 45, total: 134 },
];

const TIMELINE_EVENTS = [
  "Asset deployment initiated",
  "Secure channel established",
  "Intelligence package received",
  "Extraction route confirmed",
  "Surveillance perimeter set",
  "Communications intercept active",
  "Counter-surveillance detected",
  "Primary objective achieved",
];

// =====================
// STATE
// =====================

const state = {
  selectedOp: 0,
  timeline: [],
  sortBy: "progress",
};

// =====================
// HELPERS
// =====================

function getStatusColor(status) {
  switch (status) {
    case "ACTIVE":
      return "var(--color-text-main)";
    case "COMPLETE":
      return "var(--text-glow2)";
    case "FAILED":
      return "#ff4444";
    case "STANDBY":
      return "#ffaa00";
    default:
      return "var(--text-glow)";
  }
}

function getRiskColor(risk) {
  switch (risk) {
    case "CRIT":
      return "#ff4444";
    case "HIGH":
      return "#ff8844";
    case "MED":
      return "#ffaa00";
    default:
      return "var(--text-glow)";
  }
}

function getSortedOps() {
  const sorted = [...OPERATIONS];
  if (state.sortBy === "progress") {
    sorted.sort((a, b) => b.progress - a.progress);
  } else if (state.sortBy === "status") {
    const order = { ACTIVE: 0, STANDBY: 1, COMPLETE: 2, FAILED: 3 };
    sorted.sort((a, b) => order[a.status] - order[b.status]);
  }
  return sorted;
}

// =====================
// RENDER
// =====================

function render() {
  const ops = getSortedOps();
  const selected = ops[state.selectedOp];

  return `
    <div class="ops-container">
      <div class="ops-header">
        <span class="ops-title">OPERATIONS</span>
        <span class="ops-sort">
          <span class="sort-label">SORT:</span>
          <span class="sort-item ${state.sortBy === "progress" ? "active" : ""}" data-sort="progress">PROG</span>
          <span class="sort-item ${state.sortBy === "status" ? "active" : ""}" data-sort="status">STAT</span>
        </span>
        <span class="ops-time">${formatTime()}</span>
      </div>

      <div class="ops-body">
        <div class="ops-left">
          <div class="ops-list-header">
            <span>ID</span>
            <span>OPERATION</span>
            <span>STATUS</span>
            <span>PROG</span>
            <span>ETA</span>
          </div>
          <div class="ops-list">
            ${ops
              .map(
                (op, i) => `
              <div class="ops-row ${i === state.selectedOp ? "selected" : ""}" data-index="${i}">
                <span class="ops-id">${op.id}</span>
                <span class="ops-code">${op.code}</span>
                <span class="ops-status" style="color: ${getStatusColor(op.status)}">${op.status}</span>
                <span class="ops-progress">
                  <span class="ops-bar" style="width: ${op.progress}%"></span>
                  <span class="ops-val">${op.progress}%</span>
                </span>
                <span class="ops-eta">${op.eta}</span>
              </div>
            `,
              )
              .join("")}
          </div>

          <div class="ops-resources">
            <div class="resource-title">RESOURCES:</div>
            ${RESOURCES.map(
              (r) => `
              <div class="resource-row">
                <span class="resource-label">${r.type}:</span>
                <span class="resource-avail">${r.available}</span>
                <span class="resource-sep">/</span>
                <span class="resource-deployed">${r.deployed}</span>
                <span class="resource-sep">/</span>
                <span class="resource-total">${r.total}</span>
              </div>
            `,
            ).join("")}
          </div>
        </div>

        <div class="ops-right">
          ${
            selected
              ? `
            <div class="ops-detail">
              <div class="detail-section">
                <div class="detail-row">
                  <span class="detail-label">OP_ID:</span>
                  <span class="detail-value">${selected.id}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">CODENAME:</span>
                  <span class="detail-value">${selected.code}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">STATUS:</span>
                  <span class="detail-value" style="color: ${getStatusColor(selected.status)}">${selected.status}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">PROGRESS:</span>
                  <span class="detail-value">${selected.progress}%</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">ETA:</span>
                  <span class="detail-value">${selected.eta}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">AGENTS:</span>
                  <span class="detail-value">${selected.agents}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">RISK:</span>
                  <span class="detail-value" style="color: ${getRiskColor(selected.risk)}">${selected.risk}</span>
                </div>
              </div>

              <div class="detail-section">
                <div class="detail-section-title">TIMELINE:</div>
                <div class="ops-timeline">
                  ${
                    state.timeline
                      .slice(-6)
                      .reverse()
                      .map(
                        (event) => `
                    <div class="timeline-event">
                      <span class="event-time">${event.time}</span>
                      <span class="event-text">${event.text}</span>
                    </div>
                  `,
                      )
                      .join("") ||
                    '<div class="ops-empty">No events logged</div>'
                  }
                </div>
              </div>

              <div class="detail-actions">
                <span class="action-hint">[ENTER] Log Event  [S] Sort  [↑↓] Navigate  [U] Update</span>
              </div>
            </div>
          `
              : '<div class="ops-empty">No operation selected</div>'
          }
        </div>
      </div>

      <div class="ops-footer">
        <span>TOTAL: ${OPERATIONS.length}</span>
        <span>ACTIVE: ${OPERATIONS.filter((o) => o.status === "ACTIVE").length}</span>
        <span>AVG_PROG: ${Math.round(OPERATIONS.reduce((sum, o) => sum + o.progress, 0) / OPERATIONS.length)}%</span>
      </div>
    </div>
  `;
}

// =====================
// UPDATE
// =====================

function update() {
  OPERATIONS.forEach((op) => {
    if (op.status === "ACTIVE" && op.progress < 100) {
      if (Math.random() > 0.6) {
        op.progress = Math.min(
          100,
          op.progress + Math.floor(Math.random() * 3),
        );
        if (op.progress === 100) {
          op.status = "COMPLETE";
          op.eta = "DONE";
        }
      }
    }
  });

  if (Math.random() > 0.7) {
    const event =
      TIMELINE_EVENTS[Math.floor(Math.random() * TIMELINE_EVENTS.length)];
    state.timeline.push({
      time: formatTime(),
      op: OPERATIONS[Math.floor(Math.random() * OPERATIONS.length)].id,
      text: event,
    });

    if (state.timeline.length > 30) state.timeline.shift();
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

  cleanupKeyboard = setupKeyboardHandler("main-ops", {
    ArrowUp: () => {
      state.selectedOp = Math.max(0, state.selectedOp - 1);
      mainOpsWindow.forceRender();
    },
    ArrowDown: () => {
      state.selectedOp = Math.min(OPERATIONS.length - 1, state.selectedOp + 1);
      mainOpsWindow.forceRender();
    },
    Enter: () => {
      const event =
        TIMELINE_EVENTS[Math.floor(Math.random() * TIMELINE_EVENTS.length)];
      const ops = getSortedOps();
      const selected = ops[state.selectedOp];

      state.timeline.push({
        time: formatTime(),
        op: selected.id,
        text: event,
      });

      mainOpsWindow.forceRender();
    },
    KeyS: () => {
      state.sortBy = state.sortBy === "progress" ? "status" : "progress";
      mainOpsWindow.forceRender();
    },
    KeyU: () => {
      OPERATIONS.forEach((op) => {
        if (op.status === "ACTIVE" && Math.random() > 0.5) {
          op.progress = Math.min(
            100,
            op.progress + Math.floor(Math.random() * 10),
          );
        }
      });
      mainOpsWindow.forceRender();
    },
  });

  cleanupClick = setupClickHandler("main-ops", ".ops-row", (e, target) => {
    state.selectedOp = parseInt(target.dataset.index);
    mainOpsWindow.forceRender();
  });

  const sortClick = setupClickHandler("main-ops", ".sort-item", (e, target) => {
    state.sortBy = target.dataset.sort;
    mainOpsWindow.forceRender();
  });

  const oldCleanupClick = cleanupClick;
  cleanupClick = () => {
    oldCleanupClick();
    sortClick();
  };
}

// =====================
// WINDOW
// =====================

const mainOpsWindow = createFUIWindow({
  id: "main-ops",
  render,
  update,
  interval: { min: 2000, max: 5000 },
  defaultMode: "default",
});

export function startMainOps() {
  mainOpsWindow.start();
  setTimeout(setupInteractions, 100);
}

export function stopMainOps() {
  mainOpsWindow.stop();
  if (cleanupKeyboard) cleanupKeyboard();
  if (cleanupClick) cleanupClick();
}
