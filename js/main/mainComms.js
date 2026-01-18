import { createFUIWindow } from "../core/template.js";
import {
  setupKeyboardHandler,
  setupClickHandler,
  formatTime,
} from "../core/utils.js";

// =====================
// DATA
// =====================

const CHANNELS = [
  {
    id: "CH-01",
    name: "ALPHA",
    freq: "148.250",
    status: "ACTIVE",
    signal: 94,
    traffic: "HIGH",
    encrypted: true,
  },
  {
    id: "CH-02",
    name: "BRAVO",
    freq: "162.175",
    status: "IDLE",
    signal: 67,
    traffic: "LOW",
    encrypted: true,
  },
  {
    id: "CH-03",
    name: "CHARLIE",
    freq: "156.800",
    status: "ACTIVE",
    signal: 88,
    traffic: "MED",
    encrypted: false,
  },
  {
    id: "CH-04",
    name: "DELTA",
    freq: "164.425",
    status: "JAMMED",
    signal: 23,
    traffic: "NONE",
    encrypted: true,
  },
  {
    id: "CH-05",
    name: "ECHO",
    freq: "151.625",
    status: "ACTIVE",
    signal: 91,
    traffic: "HIGH",
    encrypted: true,
  },
  {
    id: "CH-06",
    name: "FOXTROT",
    freq: "159.350",
    status: "IDLE",
    signal: 72,
    traffic: "LOW",
    encrypted: false,
  },
  {
    id: "CH-07",
    name: "GOLF",
    freq: "163.275",
    status: "ACTIVE",
    signal: 85,
    traffic: "MED",
    encrypted: true,
  },
  {
    id: "CH-08",
    name: "HOTEL",
    freq: "157.450",
    status: "SCANNING",
    signal: 0,
    traffic: "VAR",
    encrypted: true,
  },
];

const MESSAGE_TEMPLATES = [
  { from: "ALPHA", type: "SECURE", text: "Package en route - ETA 20 minutes" },
  {
    from: "BRAVO",
    type: "ALERT",
    text: "Surveillance detected - recommend diversion",
  },
  {
    from: "CHARLIE",
    type: "ROUTINE",
    text: "Position update - coordinates transmitted",
  },
  {
    from: "DELTA",
    type: "URGENT",
    text: "Communications compromised - switching protocol",
  },
  {
    from: "ECHO",
    type: "SECURE",
    text: "Extraction point confirmed - standby for signal",
  },
  {
    from: "FOXTROT",
    type: "ROUTINE",
    text: "Status nominal - continuing mission parameters",
  },
  {
    from: "GOLF",
    type: "ALERT",
    text: "Anomaly detected in sector 7 - investigating",
  },
  {
    from: "HOTEL",
    type: "URGENT",
    text: "Contact lost with asset - initiating search",
  },
];

// =====================
// STATE
// =====================

const state = {
  selectedChannel: 0,
  messages: [],
  filterType: "ALL",
  interceptMode: false,
};

// =====================
// HELPERS
// =====================

function getStatusColor(status) {
  switch (status) {
    case "ACTIVE":
      return "var(--color-text-main)";
    case "JAMMED":
      return "#ff4444";
    case "SCANNING":
      return "#ffaa00";
    default:
      return "var(--text-glow)";
  }
}

function getTypeColor(type) {
  switch (type) {
    case "URGENT":
      return "#ff4444";
    case "ALERT":
      return "#ffaa00";
    case "SECURE":
      return "var(--color-text-main)";
    default:
      return "var(--text-glow)";
  }
}

function getFilteredMessages() {
  if (state.filterType === "ALL") return state.messages;
  return state.messages.filter((m) => m.type === state.filterType);
}

// =====================
// RENDER
// =====================

function render() {
  const selected = CHANNELS[state.selectedChannel];
  const filtered = getFilteredMessages();

  return `
    <div class="comms-container">
      <div class="comms-header">
        <span class="comms-title">COMMUNICATIONS</span>
        <span class="comms-filters">
          <span class="filter-item ${state.filterType === "ALL" ? "active" : ""}" data-type="ALL">ALL</span>
          <span class="filter-item ${state.filterType === "URGENT" ? "active" : ""}" data-type="URGENT">URG</span>
          <span class="filter-item ${state.filterType === "ALERT" ? "active" : ""}" data-type="ALERT">ALT</span>
          <span class="filter-item ${state.filterType === "SECURE" ? "active" : ""}" data-type="SECURE">SEC</span>
        </span>
        <span class="comms-mode ${state.interceptMode ? "active" : ""}" data-toggle="intercept">
          [${state.interceptMode ? "INTERCEPT:ON" : "INTERCEPT:OFF"}]
        </span>
        <span class="comms-time">${formatTime()}</span>
      </div>

      <div class="comms-body">
        <div class="comms-left">
          <div class="channel-list-header">
            <span>CH</span>
            <span>NAME</span>
            <span>FREQ</span>
            <span>STATUS</span>
            <span>SIG</span>
            <span>TRF</span>
          </div>
          <div class="channel-list">
            ${CHANNELS.map(
              (ch, i) => `
              <div class="channel-row ${i === state.selectedChannel ? "selected" : ""}" data-index="${i}">
                <span class="ch-id">${ch.id}</span>
                <span class="ch-name">${ch.name}</span>
                <span class="ch-freq">${ch.freq}</span>
                <span class="ch-status" style="color: ${getStatusColor(ch.status)}">${ch.status}</span>
                <span class="ch-signal">
                  <span class="ch-bar" style="width: ${ch.signal}%"></span>
                  <span class="ch-val">${ch.signal}</span>
                </span>
                <span class="ch-traffic">${ch.traffic}</span>
                <span class="ch-lock">${ch.encrypted ? "🔒" : ""}</span>
              </div>
            `,
            ).join("")}
          </div>
        </div>

        <div class="comms-right">
          <div class="comms-detail">
            <div class="detail-section">
              <div class="detail-row">
                <span class="detail-label">CHANNEL:</span>
                <span class="detail-value">${selected.id} - ${selected.name}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">FREQUENCY:</span>
                <span class="detail-value">${selected.freq} MHz</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">STATUS:</span>
                <span class="detail-value" style="color: ${getStatusColor(selected.status)}">${selected.status}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">SIGNAL:</span>
                <span class="detail-value">${selected.signal}%</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">TRAFFIC:</span>
                <span class="detail-value">${selected.traffic}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">ENCRYPTION:</span>
                <span class="detail-value">${selected.encrypted ? "ENABLED" : "NONE"}</span>
              </div>
            </div>

            <div class="detail-section">
              <div class="detail-section-title">MESSAGES (${filtered.length}):</div>
              <div class="comms-messages">
                ${
                  filtered
                    .slice(-8)
                    .reverse()
                    .map(
                      (msg) => `
                  <div class="message-item">
                    <div class="message-header">
                      <span class="msg-time">${msg.time}</span>
                      <span class="msg-from">${msg.from}</span>
                      <span class="msg-type" style="color: ${getTypeColor(msg.type)}">[${msg.type}]</span>
                    </div>
                    <div class="message-text">${msg.text}</div>
                  </div>
                `,
                    )
                    .join("") || '<div class="comms-empty">No messages</div>'
                }
              </div>
            </div>

            <div class="detail-actions">
              <span class="action-hint">[ENTER] Send  [I] Intercept  [F] Filter  [↑↓] Navigate  [C] Clear</span>
            </div>
          </div>
        </div>
      </div>

      <div class="comms-footer">
        <span>CHANNELS: ${CHANNELS.length}</span>
        <span>ACTIVE: ${CHANNELS.filter((c) => c.status === "ACTIVE").length}</span>
        <span>MESSAGES: ${state.messages.length}</span>
        <span>AVG_SIGNAL: ${Math.round(CHANNELS.reduce((sum, c) => sum + c.signal, 0) / CHANNELS.length)}%</span>
      </div>
    </div>
  `;
}

// =====================
// UPDATE
// =====================

function update() {
  if (Math.random() > 0.6 || state.interceptMode) {
    const template =
      MESSAGE_TEMPLATES[Math.floor(Math.random() * MESSAGE_TEMPLATES.length)];

    state.messages.push({
      time: formatTime(),
      from: template.from,
      type: template.type,
      text: template.text,
    });

    if (state.messages.length > 50) state.messages.shift();
  }

  CHANNELS.forEach((ch) => {
    if (ch.status === "ACTIVE" && Math.random() > 0.8) {
      ch.signal = Math.max(
        60,
        Math.min(100, ch.signal + (Math.random() - 0.5) * 10),
      );
    }
  });
}

// =====================
// INTERACTIONS
// =====================

let cleanupKeyboard = null;
let cleanupClick = null;

function setupInteractions() {
  if (cleanupKeyboard) cleanupKeyboard();
  if (cleanupClick) cleanupClick();

  cleanupKeyboard = setupKeyboardHandler("main-comms", {
    ArrowUp: () => {
      state.selectedChannel = Math.max(0, state.selectedChannel - 1);
      mainCommsWindow.forceRender();
    },
    ArrowDown: () => {
      state.selectedChannel = Math.min(
        CHANNELS.length - 1,
        state.selectedChannel + 1,
      );
      mainCommsWindow.forceRender();
    },
    Enter: () => {
      const template =
        MESSAGE_TEMPLATES[Math.floor(Math.random() * MESSAGE_TEMPLATES.length)];
      const selected = CHANNELS[state.selectedChannel];

      state.messages.push({
        time: formatTime(),
        from: selected.name,
        type: "SECURE",
        text: template.text,
      });

      mainCommsWindow.forceRender();
    },
    KeyI: () => {
      state.interceptMode = !state.interceptMode;
      mainCommsWindow.forceRender();
    },
    KeyF: () => {
      const types = ["ALL", "URGENT", "ALERT", "SECURE", "ROUTINE"];
      const current = types.indexOf(state.filterType);
      state.filterType = types[(current + 1) % types.length];
      mainCommsWindow.forceRender();
    },
    KeyC: () => {
      state.messages = [];
      mainCommsWindow.forceRender();
    },
  });

  cleanupClick = setupClickHandler(
    "main-comms",
    ".channel-row",
    (e, target) => {
      state.selectedChannel = parseInt(target.dataset.index);
      mainCommsWindow.forceRender();
    },
  );

  const filterClick = setupClickHandler(
    "main-comms",
    ".filter-item",
    (e, target) => {
      state.filterType = target.dataset.type;
      mainCommsWindow.forceRender();
    },
  );

  const modeClick = setupClickHandler(
    "main-comms",
    "[data-toggle='intercept']",
    () => {
      state.interceptMode = !state.interceptMode;
      mainCommsWindow.forceRender();
    },
  );

  const oldCleanupClick = cleanupClick;
  cleanupClick = () => {
    oldCleanupClick();
    filterClick();
    modeClick();
  };
}

// =====================
// WINDOW
// =====================

const mainCommsWindow = createFUIWindow({
  id: "main-comms",
  render,
  update,
  interval: { min: 1500, max: 4000 },
  defaultMode: "default",
});

export function startMainComms() {
  mainCommsWindow.start();
  setTimeout(setupInteractions, 100);
}

export function stopMainComms() {
  mainCommsWindow.stop();
  if (cleanupKeyboard) cleanupKeyboard();
  if (cleanupClick) cleanupClick();
}
