import { createFUIWindow } from "../core/template.js";
import { setupKeyboardHandler, setupClickHandler } from "../core/utils.js";

// =====================
// STATIC DATA - Complete list
// =====================

const INTERFACES = [
  {
    name: "T00",
    torId: "0000",
    network: "<------>",
    address: "----.---.---.----",
    trace: "---.-",
    pkts: "---",
    cap: "-/-",
    data1: "----",
    data2: "----.--.-----",
    status: "-/-",
  },
  {
    name: "T0en0",
    torId: "1531",
    network: "<masked>",
    address: "45.3.56.256",
    trace: "002.11",
    pkts: "234",
    cap: "X/X",
    data1: "001.23",
    data2: "Out.47",
    status: "OK",
  },
  {
    name: "T0en1",
    torId: "3512",
    network: "<7Link#4>",
    address: "256.2.34.1",
    trace: "128.45",
    pkts: "567",
    cap: "Y/Z",
    data1: "In.882",
    data2: "877",
    status: "ERR",
  },
  {
    name: "T0en2",
    torId: "7788",
    network: "<Bridge>",
    address: "----.---.---.----",
    trace: "---.-",
    pkts: "---",
    cap: "-/-",
    data1: "----",
    data2: "----.--.-----",
    status: "-/-",
  },
  {
    name: "TGen0",
    torId: "9201",
    network: "<Relay-X>",
    address: "192.168.1.1",
    trace: "255.99",
    pkts: "12",
    cap: "A/B",
    data1: "1024",
    data2: "001.23",
    status: "WARN",
  },

  {
    name: "T00",
    torId: "0000",
    network: "<------>",
    address: "----.---.---.----",
    trace: "---.-",
    pkts: "---",
    cap: "-/-",
    data1: "----",
    data2: "----.--.-----",
    status: "-/-",
  },
  {
    name: "T0en0",
    torId: "1531",
    network: "<masked>",
    address: "10.0.0.254",
    trace: "000.21",
    pkts: "1.98",
    cap: "X-X",
    data1: "Out.47",
    data2: "In.882",
    status: "OK",
  },
  {
    name: "T0en1",
    torId: "3512",
    network: "<7Link#4>",
    address: "172.16.45.88",
    trace: "002.11",
    pkts: "890",
    cap: "X/X",
    data1: "877",
    data2: "1024",
    status: "PEND",
  },
  {
    name: "T0en2",
    torId: "7788",
    network: "<Bridge>",
    address: "----.---.---.----",
    trace: "---.-",
    pkts: "---",
    cap: "-/-",
    data1: "----",
    data2: "----.--.-----",
    status: "-/-",
  },
  {
    name: "TGen0",
    torId: "9201",
    network: "<Relay-X>",
    address: "45.3.56.256",
    trace: "128.45",
    pkts: "234",
    cap: "Y/Z",
    data1: "001.23",
    data2: "Out.47",
    status: "OK",
  },

  {
    name: "T00",
    torId: "0000",
    network: "<------>",
    address: "----.---.---.----",
    trace: "---.-",
    pkts: "---",
    cap: "-/-",
    data1: "----",
    data2: "----.--.-----",
    status: "-/-",
  },
  {
    name: "T0en0",
    torId: "1531",
    network: "<masked>",
    address: "256.2.34.1",
    trace: "255.99",
    pkts: "567",
    cap: "A/B",
    data1: "In.882",
    data2: "877",
    status: "ERR",
  },
  {
    name: "T0en1",
    torId: "3512",
    network: "<7Link#4>",
    address: "----.---.---.----",
    trace: "---.-",
    pkts: "---",
    cap: "-/-",
    data1: "----",
    data2: "----.--.-----",
    status: "-/-",
  },
  {
    name: "T0en2",
    torId: "7788",
    network: "<Bridge>",
    address: "192.168.1.1",
    trace: "002.11",
    pkts: "12",
    cap: "X-X",
    data1: "1024",
    data2: "001.23",
    status: "WARN",
  },
  {
    name: "TGen0",
    torId: "9201",
    network: "<Relay-X>",
    address: "10.0.0.254",
    trace: "000.21",
    pkts: "1.98",
    cap: "X/X",
    data1: "Out.47",
    data2: "In.882",
    status: "OK",
  },

  {
    name: "T00",
    torId: "0000",
    network: "<------>",
    address: "172.16.45.88",
    trace: "128.45",
    pkts: "890",
    cap: "Y/Z",
    data1: "877",
    data2: "1024",
    status: "PEND",
  },
  {
    name: "T0en0",
    torId: "1531",
    network: "<masked>",
    address: "----.---.---.----",
    trace: "---.-",
    pkts: "---",
    cap: "-/-",
    data1: "----",
    data2: "----.--.-----",
    status: "-/-",
  },
  {
    name: "T0en1",
    torId: "3512",
    network: "<7Link#4>",
    address: "45.3.56.256",
    trace: "002.11",
    pkts: "234",
    cap: "A/B",
    data1: "001.23",
    data2: "Out.47",
    status: "OK",
  },
  {
    name: "T0en2",
    torId: "7788",
    network: "<Bridge>",
    address: "256.2.34.1",
    trace: "255.99",
    pkts: "567",
    cap: "X-X",
    data1: "In.882",
    data2: "877",
    status: "ERR",
  },
  {
    name: "TGen0",
    torId: "9201",
    network: "<Relay-X>",
    address: "----.---.---.----",
    trace: "---.-",
    pkts: "---",
    cap: "-/-",
    data1: "----",
    data2: "----.--.-----",
    status: "-/-",
  },

  {
    name: "T00",
    torId: "0000",
    network: "<------>",
    address: "192.168.1.1",
    trace: "002.11",
    pkts: "12",
    cap: "X/X",
    data1: "1024",
    data2: "001.23",
    status: "WARN",
  },
  {
    name: "T0en0",
    torId: "1531",
    network: "<masked>",
    address: "10.0.0.254",
    trace: "000.21",
    pkts: "1.98",
    cap: "Y/Z",
    data1: "Out.47",
    data2: "In.882",
    status: "OK",
  },
  {
    name: "T0en1",
    torId: "3512",
    network: "<7Link#4>",
    address: "172.16.45.88",
    trace: "128.45",
    pkts: "890",
    cap: "A/B",
    data1: "877",
    data2: "1024",
    status: "PEND",
  },
  {
    name: "T0en2",
    torId: "7788",
    network: "<Bridge>",
    address: "----.---.---.----",
    trace: "---.-",
    pkts: "---",
    cap: "-/-",
    data1: "----",
    data2: "----.--.-----",
    status: "-/-",
  },
  {
    name: "TGen0",
    torId: "9201",
    network: "<Relay-X>",
    address: "45.3.56.256",
    trace: "002.11",
    pkts: "234",
    cap: "X-X",
    data1: "001.23",
    data2: "Out.47",
    status: "OK",
  },

  {
    name: "T00",
    torId: "0000",
    network: "<------>",
    address: "256.2.34.1",
    trace: "255.99",
    pkts: "567",
    cap: "X/X",
    data1: "In.882",
    data2: "877",
    status: "ERR",
  },
  {
    name: "T0en0",
    torId: "1531",
    network: "<masked>",
    address: "----.---.---.----",
    trace: "---.-",
    pkts: "---",
    cap: "-/-",
    data1: "----",
    data2: "----.--.-----",
    status: "-/-",
  },
  {
    name: "T0en1",
    torId: "3512",
    network: "<7Link#4>",
    address: "192.168.1.1",
    trace: "002.11",
    pkts: "12",
    cap: "Y/Z",
    data1: "1024",
    data2: "001.23",
    status: "WARN",
  },
  {
    name: "T0en2",
    torId: "7788",
    network: "<Bridge>",
    address: "10.0.0.254",
    trace: "000.21",
    pkts: "1.98",
    cap: "A/B",
    data1: "Out.47",
    data2: "In.882",
    status: "OK",
  },
  {
    name: "TGen0",
    torId: "9201",
    network: "<Relay-X>",
    address: "172.16.45.88",
    trace: "128.45",
    pkts: "890",
    cap: "X-X",
    data1: "877",
    data2: "1024",
    status: "PEND",
  },

  {
    name: "T00",
    torId: "0000",
    network: "<------>",
    address: "----.---.---.----",
    trace: "---.-",
    pkts: "---",
    cap: "-/-",
    data1: "----",
    data2: "----.--.-----",
    status: "-/-",
  },
  {
    name: "T0en0",
    torId: "1531",
    network: "<masked>",
    address: "45.3.56.256",
    trace: "002.11",
    pkts: "234",
    cap: "X/X",
    data1: "001.23",
    data2: "Out.47",
    status: "OK",
  },
  {
    name: "T0en1",
    torId: "3512",
    network: "<7Link#4>",
    address: "256.2.34.1",
    trace: "255.99",
    pkts: "567",
    cap: "Y/Z",
    data1: "In.882",
    data2: "877",
    status: "ERR",
  },
  {
    name: "T0en2",
    torId: "7788",
    network: "<Bridge>",
    address: "----.---.---.----",
    trace: "---.-",
    pkts: "---",
    cap: "-/-",
    data1: "----",
    data2: "----.--.-----",
    status: "-/-",
  },
  {
    name: "TGen0",
    torId: "9201",
    network: "<Relay-X>",
    address: "192.168.1.1",
    trace: "002.11",
    pkts: "12",
    cap: "A/B",
    data1: "1024",
    data2: "001.23",
    status: "WARN",
  },

  {
    name: "T00",
    torId: "0000",
    network: "<------>",
    address: "10.0.0.254",
    trace: "000.21",
    pkts: "1.98",
    cap: "X-X",
    data1: "Out.47",
    data2: "In.882",
    status: "OK",
  },
  {
    name: "T0en0",
    torId: "1531",
    network: "<masked>",
    address: "172.16.45.88",
    trace: "128.45",
    pkts: "890",
    cap: "X/X",
    data1: "877",
    data2: "1024",
    status: "PEND",
  },
  {
    name: "T0en1",
    torId: "3512",
    network: "<7Link#4>",
    address: "----.---.---.----",
    trace: "---.-",
    pkts: "---",
    cap: "-/-",
    data1: "----",
    data2: "----.--.-----",
    status: "-/-",
  },
  {
    name: "T0en2",
    torId: "7788",
    network: "<Bridge>",
    address: "45.3.56.256",
    trace: "002.11",
    pkts: "234",
    cap: "Y/Z",
    data1: "001.23",
    data2: "Out.47",
    status: "OK",
  },
  {
    name: "TGen0",
    torId: "9201",
    network: "<Relay-X>",
    address: "256.2.34.1",
    trace: "255.99",
    pkts: "567",
    cap: "A/B",
    data1: "In.882",
    data2: "877",
    status: "ERR",
  },
];

// =====================
// STATE
// =====================

const state = {
  selectedIndex: 0,
  expandedIndices: new Set(),
  scrollTop: 0,
};

// =====================
// RENDER
// =====================

function render() {
  return `
    <div class="interface-container crt">
      <div class="if-header">
        <span>Name</span>
        <span>TORID</span>
        <span>Network</span>
        <span>Address</span>
        <span>Trace</span>
        <span>Pkts</span>
        <span>Cap</span>
        <span>Data</span>
        <span>Status</span>
      </div>
      <div class="if-line"></div>

      <div class="if-body" id="code1-body">
        ${INTERFACES.map((row, i) => {
          const isSelected = i === state.selectedIndex;
          const isExpanded = state.expandedIndices.has(i);
          const isMasked = row.address.includes("----");

          return `
          <div class="if-row ${isMasked ? "row-masked" : "row-active"} ${isSelected ? "row-selected" : ""}" data-index="${i}">
            <span class="if-name">${row.name}</span>
            <span class="if-torid">${row.torId}</span>
            <span class="if-network">${row.network}</span>
            <span class="if-address">${row.address}</span>
            <span class="if-trace">${row.trace}</span>
            <span class="if-pkts">${row.pkts}</span>
            <span class="if-cap">${row.cap}</span>
            <span class="if-data">${row.data1}  ${row.data2}</span>
            <span class="if-status">${row.status}</span>
          </div>
          ${
            isExpanded
              ? `
            <div class="if-expand">
              <div class="expand-grid">
                <div class="expand-item">
                  <span class="expand-label">ROUTE:</span>
                  <span class="expand-value">${row.network} → ${row.address}</span>
                </div>
                <div class="expand-item">
                  <span class="expand-label">LATENCY:</span>
                  <span class="expand-value">${row.trace}ms</span>
                </div>
                <div class="expand-item">
                  <span class="expand-label">THROUGHPUT:</span>
                  <span class="expand-value">${row.pkts} pkt/s</span>
                </div>
                <div class="expand-item">
                  <span class="expand-label">CAPACITY:</span>
                  <span class="expand-value">${row.cap}</span>
                </div>
                <div class="expand-item">
                  <span class="expand-label">TX/RX:</span>
                  <span class="expand-value">${row.data1} / ${row.data2}</span>
                </div>
                <div class="expand-item">
                  <span class="expand-label">STATE:</span>
                  <span class="expand-value status-${row.status.toLowerCase()}">${row.status}</span>
                </div>
              </div>
              <div class="expand-actions">
                <span class="action-hint">[ENTER] Collapse | [↑↓] Navigate</span>
              </div>
            </div>
          `
              : ""
          }
        `;
        }).join("")}
      </div>

      <div class="if-footer">
        <span>Submission Platform - ${INTERFACES.length} interfaces | status | RHfbJ</span>
      </div>
    </div>
  `;
}

// =====================
// SCROLL MANAGEMENT
// =====================

function scrollToSelected() {
  const container = document.querySelector("#code-1 .if-body");
  const selectedRow = document.querySelector("#code-1 .if-row.row-selected");

  if (container && selectedRow) {
    const containerRect = container.getBoundingClientRect();
    const rowRect = selectedRow.getBoundingClientRect();

    if (rowRect.top < containerRect.top) {
      selectedRow.scrollIntoView({ block: "start", behavior: "smooth" });
    } else if (rowRect.bottom > containerRect.bottom) {
      selectedRow.scrollIntoView({ block: "end", behavior: "smooth" });
    }
  }
}

function saveScrollPosition() {
  const container = document.querySelector("#code-1 .if-body");
  if (container) {
    state.scrollTop = container.scrollTop;
  }
}

function restoreScrollPosition() {
  const container = document.querySelector("#code-1 .if-body");
  if (container) {
    container.scrollTop = state.scrollTop;
  }
}

// =====================
// INTERACTIONS
// =====================

function handleNavigateUp() {
  state.selectedIndex = Math.max(0, state.selectedIndex - 1);
  code1Window.forceRender();
  setTimeout(scrollToSelected, 50);
}

function handleNavigateDown() {
  state.selectedIndex = Math.min(
    INTERFACES.length - 1,
    state.selectedIndex + 1,
  );
  code1Window.forceRender();
  setTimeout(scrollToSelected, 50);
}

function handleToggleExpand() {
  if (state.expandedIndices.has(state.selectedIndex)) {
    state.expandedIndices.delete(state.selectedIndex);
  } else {
    state.expandedIndices.add(state.selectedIndex);
  }
  saveScrollPosition();
  code1Window.forceRender();
  setTimeout(restoreScrollPosition, 50);
}

let cleanupKeyboard = null;
let cleanupClick = null;

function setupInteractions() {
  if (cleanupKeyboard) cleanupKeyboard();
  if (cleanupClick) cleanupClick();

  cleanupKeyboard = setupKeyboardHandler("code-1", {
    ArrowUp: handleNavigateUp,
    ArrowDown: handleNavigateDown,
    Enter: handleToggleExpand,
  });

  cleanupClick = setupClickHandler("code-1", ".if-row", (e, target) => {
    const index = parseInt(target.dataset.index);

    if (state.selectedIndex === index) {
      handleToggleExpand();
    } else {
      state.selectedIndex = index;
      code1Window.forceRender();
    }
  });
}

// =====================
// WINDOW INSTANCE
// =====================

const code1Window = createFUIWindow({
  id: "code-1",
  render,
  update: null,
  interval: null,
  defaultMode: "default",
});

// =====================
// PUBLIC API
// =====================

export function startCode1() {
  code1Window.start();
  setTimeout(setupInteractions, 100);
}

export function stopCode1() {
  code1Window.stop();
  if (cleanupKeyboard) cleanupKeyboard();
  if (cleanupClick) cleanupClick();
}
