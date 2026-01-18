import { createFUIWindow } from "../core/template.js";
import {
  setupKeyboardHandler,
  setupClickHandler,
  formatTime,
} from "../core/utils.js";

// =====================
// DATA
// =====================

const NODES = [
  {
    id: "N-001",
    name: "ALPHA-HUB",
    type: "RELAY",
    status: "ONLINE",
    connections: 12,
    load: 67,
    uptime: "124d",
  },
  {
    id: "N-002",
    name: "BRAVO-NODE",
    type: "ENDPOINT",
    status: "ONLINE",
    connections: 3,
    load: 34,
    uptime: "89d",
  },
  {
    id: "N-003",
    name: "CHARLIE-GATE",
    type: "GATEWAY",
    status: "DEGRADED",
    connections: 8,
    load: 92,
    uptime: "45d",
  },
  {
    id: "N-004",
    name: "DELTA-BRIDGE",
    type: "BRIDGE",
    status: "ONLINE",
    connections: 15,
    load: 78,
    uptime: "156d",
  },
  {
    id: "N-005",
    name: "ECHO-RELAY",
    type: "RELAY",
    status: "OFFLINE",
    connections: 0,
    load: 0,
    uptime: "0d",
  },
  {
    id: "N-006",
    name: "FOXTROT-HUB",
    type: "RELAY",
    status: "ONLINE",
    connections: 10,
    load: 56,
    uptime: "98d",
  },
  {
    id: "N-007",
    name: "GOLF-NODE",
    type: "ENDPOINT",
    status: "ONLINE",
    connections: 2,
    load: 23,
    uptime: "67d",
  },
  {
    id: "N-008",
    name: "HOTEL-GATE",
    type: "GATEWAY",
    status: "ONLINE",
    connections: 11,
    load: 71,
    uptime: "134d",
  },
  {
    id: "N-009",
    name: "INDIA-BRIDGE",
    type: "BRIDGE",
    status: "DEGRADED",
    connections: 6,
    load: 88,
    uptime: "12d",
  },
  {
    id: "N-010",
    name: "JULIET-RELAY",
    type: "RELAY",
    status: "ONLINE",
    connections: 9,
    load: 62,
    uptime: "178d",
  },
];

const TRAFFIC = [
  { from: "N-001", to: "N-004", packets: 1247, latency: 12, protocol: "TCP" },
  { from: "N-004", to: "N-008", packets: 892, latency: 8, protocol: "UDP" },
  { from: "N-003", to: "N-001", packets: 2134, latency: 45, protocol: "TCP" },
  { from: "N-006", to: "N-010", packets: 567, latency: 6, protocol: "UDP" },
  { from: "N-008", to: "N-002", packets: 334, latency: 23, protocol: "TCP" },
  { from: "N-010", to: "N-006", packets: 1023, latency: 15, protocol: "UDP" },
  { from: "N-001", to: "N-003", packets: 1789, latency: 34, protocol: "TCP" },
  { from: "N-007", to: "N-004", packets: 445, latency: 19, protocol: "UDP" },
];

const EVENTS = [
  "Connection established",
  "Route optimized",
  "Packet loss detected",
  "Latency spike",
  "Node recovery",
  "Traffic surge",
  "Protocol switch",
  "Bandwidth adjusted",
];

// =====================
// STATE
// =====================

const state = {
  selectedNode: 0,
  viewMode: "NODES",
  filterStatus: "ALL",
  activityLog: [],
};

// =====================
// HELPERS
// =====================

function getStatusColor(status) {
  switch (status) {
    case "ONLINE":
      return "var(--color-text-main)";
    case "OFFLINE":
      return "#ff4444";
    case "DEGRADED":
      return "#ffaa00";
    default:
      return "var(--text-glow)";
  }
}

function getLoadColor(load) {
  if (load >= 80) return "#ff4444";
  if (load >= 60) return "#ffaa00";
  return "var(--text-glow)";
}

function getFilteredNodes() {
  if (state.filterStatus === "ALL") return NODES;
  return NODES.filter((n) => n.status === state.filterStatus);
}

// =====================
// RENDER
// =====================

function render() {
  const filtered = getFilteredNodes();
  const selected = filtered[state.selectedNode] || NODES[0];
  const nodeTraffic = TRAFFIC.filter(
    (t) => t.from === selected.id || t.to === selected.id,
  );

  return `
    <div class="network-container">
      <div class="network-header">
        <span class="network-title">NETWORK</span>
        <span class="network-filters">
          <span class="filter-item ${state.filterStatus === "ALL" ? "active" : ""}" data-status="ALL">ALL</span>
          <span class="filter-item ${state.filterStatus === "ONLINE" ? "active" : ""}" data-status="ONLINE">ONLN</span>
          <span class="filter-item ${state.filterStatus === "DEGRADED" ? "active" : ""}" data-status="DEGRADED">DEGR</span>
        </span>
        <span class="network-view">
          <span class="view-item ${state.viewMode === "NODES" ? "active" : ""}" data-view="NODES">NODES</span>
          <span class="view-item ${state.viewMode === "TRAFFIC" ? "active" : ""}" data-view="TRAFFIC">TRFFC</span>
        </span>
        <span class="network-time">${formatTime()}</span>
      </div>

      <div class="network-body">
        ${
          state.viewMode === "NODES"
            ? `
          <div class="network-left">
            <div class="node-list-header">
              <span>ID</span>
              <span>NODE</span>
              <span>TYPE</span>
              <span>STATUS</span>
              <span>CONN</span>
              <span>LOAD</span>
            </div>
            <div class="node-list">
              ${filtered
                .map(
                  (n, i) => `
                <div class="node-row ${i === state.selectedNode ? "selected" : ""}" data-index="${i}">
                  <span class="node-id">${n.id}</span>
                  <span class="node-name">${n.name}</span>
                  <span class="node-type">${n.type}</span>
                  <span class="node-status" style="color: ${getStatusColor(n.status)}">${n.status}</span>
                  <span class="node-conn">${n.connections}</span>
                  <span class="node-load">
                    <span class="node-bar" style="width: ${n.load}%; background: ${getLoadColor(n.load)}"></span>
                    <span class="node-val">${n.load}</span>
                  </span>
                </div>
              `,
                )
                .join("")}
            </div>
          </div>

          <div class="network-right">
            <div class="network-detail">
              <div class="detail-section">
                <div class="detail-row">
                  <span class="detail-label">NODE_ID:</span>
                  <span class="detail-value">${selected.id}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">NAME:</span>
                  <span class="detail-value">${selected.name}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">TYPE:</span>
                  <span class="detail-value">${selected.type}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">STATUS:</span>
                  <span class="detail-value" style="color: ${getStatusColor(selected.status)}">${selected.status}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">CONNECTIONS:</span>
                  <span class="detail-value">${selected.connections}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">LOAD:</span>
                  <span class="detail-value" style="color: ${getLoadColor(selected.load)}">${selected.load}%</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">UPTIME:</span>
                  <span class="detail-value">${selected.uptime}</span>
                </div>
              </div>

              <div class="detail-section">
                <div class="detail-section-title">CONNECTIONS (${nodeTraffic.length}):</div>
                <div class="node-connections">
                  ${
                    nodeTraffic
                      .slice(0, 6)
                      .map(
                        (t) => `
                    <div class="connection-item">
                      <span class="conn-route">${t.from} → ${t.to}</span>
                      <span class="conn-packets">${t.packets}pkt</span>
                      <span class="conn-latency">${t.latency}ms</span>
                      <span class="conn-protocol">${t.protocol}</span>
                    </div>
                  `,
                      )
                      .join("") ||
                    '<div class="network-empty">No active connections</div>'
                  }
                </div>
              </div>

              <div class="detail-actions">
                <span class="action-hint">[ENTER] Ping  [V] View  [F] Filter  [↑↓] Navigate  [R] Reset</span>
              </div>
            </div>
          </div>
        `
            : `
          <div class="traffic-view">
            <div class="traffic-header">
              <span>FROM</span>
              <span>TO</span>
              <span>PACKETS</span>
              <span>LATENCY</span>
              <span>PROTOCOL</span>
            </div>
            <div class="traffic-list">
              ${TRAFFIC.map(
                (t) => `
                <div class="traffic-row">
                  <span class="traffic-from">${t.from}</span>
                  <span class="traffic-to">${t.to}</span>
                  <span class="traffic-packets">${t.packets}</span>
                  <span class="traffic-latency">${t.latency}ms</span>
                  <span class="traffic-protocol">${t.protocol}</span>
                </div>
              `,
              ).join("")}
            </div>

            <div class="activity-section">
              <div class="activity-title">ACTIVITY LOG:</div>
              <div class="activity-log">
                ${
                  state.activityLog
                    .slice(-8)
                    .reverse()
                    .map(
                      (event) => `
                  <div class="activity-item">
                    <span class="activity-time">${event.time}</span>
                    <span class="activity-node">${event.node}</span>
                    <span class="activity-text">${event.text}</span>
                  </div>
                `,
                    )
                    .join("") ||
                  '<div class="network-empty">No activity logged</div>'
                }
              </div>
            </div>
          </div>
        `
        }
      </div>

      <div class="network-footer">
        <span>NODES: ${filtered.length}/${NODES.length}</span>
        <span>ONLINE: ${NODES.filter((n) => n.status === "ONLINE").length}</span>
        <span>TRAFFIC: ${TRAFFIC.length} routes</span>
        <span>AVG_LOAD: ${Math.round(NODES.reduce((sum, n) => sum + n.load, 0) / NODES.length)}%</span>
      </div>
    </div>
  `;
}

// =====================
// UPDATE
// =====================

function update() {
  NODES.forEach((n) => {
    if (n.status === "ONLINE" && Math.random() > 0.7) {
      n.load = Math.max(20, Math.min(100, n.load + (Math.random() - 0.5) * 15));

      if (n.load > 85 && Math.random() > 0.8) {
        n.status = "DEGRADED";
      } else if (n.load < 60 && n.status === "DEGRADED") {
        n.status = "ONLINE";
      }
    }
  });

  if (Math.random() > 0.6) {
    const node = NODES[Math.floor(Math.random() * NODES.length)];
    const event = EVENTS[Math.floor(Math.random() * EVENTS.length)];

    state.activityLog.push({
      time: formatTime(),
      node: node.id,
      text: event,
    });

    if (state.activityLog.length > 30) state.activityLog.shift();
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

  cleanupKeyboard = setupKeyboardHandler("main-network", {
    ArrowUp: () => {
      if (state.viewMode === "NODES") {
        const filtered = getFilteredNodes();
        state.selectedNode = Math.max(0, state.selectedNode - 1);
        mainNetworkWindow.forceRender();
      }
    },
    ArrowDown: () => {
      if (state.viewMode === "NODES") {
        const filtered = getFilteredNodes();
        state.selectedNode = Math.min(
          filtered.length - 1,
          state.selectedNode + 1,
        );
        mainNetworkWindow.forceRender();
      }
    },
    Enter: () => {
      const filtered = getFilteredNodes();
      const selected = filtered[state.selectedNode];

      state.activityLog.push({
        time: formatTime(),
        node: selected.id,
        text: "Ping successful - RTT 24ms",
      });

      mainNetworkWindow.forceRender();
    },
    KeyV: () => {
      state.viewMode = state.viewMode === "NODES" ? "TRAFFIC" : "NODES";
      mainNetworkWindow.forceRender();
    },
    KeyF: () => {
      const statuses = ["ALL", "ONLINE", "DEGRADED", "OFFLINE"];
      const current = statuses.indexOf(state.filterStatus);
      state.filterStatus = statuses[(current + 1) % statuses.length];
      state.selectedNode = 0;
      mainNetworkWindow.forceRender();
    },
    KeyR: () => {
      NODES.forEach((n) => {
        if (n.status === "DEGRADED" && Math.random() > 0.5) {
          n.status = "ONLINE";
          n.load = Math.max(20, n.load - 20);
        }
      });
      mainNetworkWindow.forceRender();
    },
  });

  cleanupClick = setupClickHandler("main-network", ".node-row", (e, target) => {
    state.selectedNode = parseInt(target.dataset.index);
    mainNetworkWindow.forceRender();
  });

  const filterClick = setupClickHandler(
    "main-network",
    "[data-status]",
    (e, target) => {
      state.filterStatus = target.dataset.status;
      state.selectedNode = 0;
      mainNetworkWindow.forceRender();
    },
  );

  const viewClick = setupClickHandler(
    "main-network",
    "[data-view]",
    (e, target) => {
      state.viewMode = target.dataset.view;
      mainNetworkWindow.forceRender();
    },
  );

  const oldCleanupClick = cleanupClick;
  cleanupClick = () => {
    oldCleanupClick();
    filterClick();
    viewClick();
  };
}

// =====================
// WINDOW
// =====================

const mainNetworkWindow = createFUIWindow({
  id: "main-network",
  render,
  update,
  interval: { min: 2500, max: 5500 },
  defaultMode: "default",
});

export function startMainNetwork() {
  mainNetworkWindow.start();
  setTimeout(setupInteractions, 100);
}

export function stopMainNetwork() {
  mainNetworkWindow.stop();
  if (cleanupKeyboard) cleanupKeyboard();
  if (cleanupClick) cleanupClick();
}
