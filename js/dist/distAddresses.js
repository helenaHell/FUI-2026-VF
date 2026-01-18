import { createFUIWindow } from "../core/template.js";

// =====================
// DATA CONSTANTS
// =====================

const STREET_NAMES = [
  "Ferret House :: 3999-FR9X-ALPHA",
  "Billlies Street :: BL-77A-91F",
  "Kilrous Street :: KR-042-ZX",
  "Henri Way :: HN-88D-CTRL",
  "Evercup Eau Street :: EC-19Q-DELTA",
  "Bailey Street :: BY-551-XR",
  "Oxford Road :: OX-991-B7",
  "Park Lane :: PL-442-RT",
  "Victoria Street :: VC-007-GH",
  "Cambridge Avenue :: CB-223-9K",
  "Wellington Road :: WL-880-KN",
  "Churchill Way :: CH-310-AF",
  "Elizabeth Court :: EL-672-MX",
  "Richmond Terrace :: RM-554-UX",
  "Kensington Gardens :: KG-991-PROTO",
];

const CITY_NAMES = [
  "Manchester",
  "Middleham",
  "Branley",
  "Zarton",
  "Mortimer",
  "Everton",
  "Bristol",
  "Leeds",
];

const COUNTRY_CODES = ["GBR", "UK", "ENG"];
const POSTAL_CODES = ["EC1A-1BB", "SW1A-1AA", "W1A-0AX", "M1-1AE"];
const AREA_NAMES = ["Westminster", "Camden", "Islington", "Hackney"];
const NODE_NAMES = [
  "TOR-04",
  "NX-77A",
  "RELAY-9F",
  "GATE-12",
  "ION-3C",
  "VX-CORE",
];

// =====================
// STATE
// =====================

const addressState = {
  initialized: false,
  counter: 1,
  maxAddresses: 22,
  rows: [],
};

let selectedIndex = 0;

// =====================
// HELPERS
// =====================

function randomHex(size = 8) {
  return [...crypto.getRandomValues(new Uint8Array(size))]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .slice(0, size);
}

// =====================
// FACTORY
// =====================

function createAddress() {
  // 18% chance d'être flagged (highlight permanent)
  const flagged = Math.random() < 0.18;

  return {
    id: String(addressState.counter++).padStart(3, "0"),
    number: Math.floor(Math.random() * 9000) + 100,
    flagged: flagged,
    priority: flagged ? (Math.random() < 0.5 ? "HIGH" : "MEDIUM") : "LOW",
    street: STREET_NAMES[Math.floor(Math.random() * STREET_NAMES.length)],
    city: CITY_NAMES[Math.floor(Math.random() * CITY_NAMES.length)],
    country: COUNTRY_CODES[Math.floor(Math.random() * COUNTRY_CODES.length)],
    area: AREA_NAMES[Math.floor(Math.random() * AREA_NAMES.length)],
    postal: POSTAL_CODES[Math.floor(Math.random() * POSTAL_CODES.length)],
    node: NODE_NAMES[Math.floor(Math.random() * NODE_NAMES.length)],
    sig: randomHex(10),
    expanded: false,
    lat: (Math.random() * 180 - 90).toFixed(4),
    lng: (Math.random() * 360 - 180).toFixed(4),
    rtt: Math.floor(Math.random() * 120),
    loss: Math.floor(Math.random() * 5),
    hops: Math.floor(Math.random() * 12) + 3,
  };
}

// =====================
// INITIALIZE (ONCE)
// =====================

function initialize() {
  if (addressState.initialized) return;

  for (let i = 0; i < addressState.maxAddresses; i++) {
    addressState.rows.push(createAddress());
  }

  addressState.initialized = true;
}

// =====================
// RENDER
// =====================

function render() {
  initialize();

  return `
    <div class="addresses-container crt">
      <div class="addr-header">
        <span>ID</span>
        <span>#</span>
        <span>Street</span>
        <span>City</span>
        <span>Area</span>
        <span>Code</span>
        <span>Node</span>
        <span>Sig</span>
      </div>
      <div class="addr-line"></div>

      <div class="addr-body">
        ${addressState.rows
          .map(
            (addr, i) => `
          <div class="addr-row
            ${
              addr.flagged
                ? "row-flagged row-priority-" + addr.priority.toLowerCase()
                : ""
            }
            ${i === selectedIndex ? "row-selected" : ""}"
            data-index="${i}">
            <span class="addr-id">${addr.id}</span>
            <span class="addr-number">${addr.number}</span>
            <span class="addr-street">${addr.street}</span>
            <span class="addr-city">${addr.city} ${addr.country}</span>
            <span class="addr-area">${addr.area}</span>
            <span class="addr-postal">${addr.postal}</span>
            <span class="addr-node">${addr.node}</span>
            <span class="addr-sig">${addr.sig}</span>
          </div>
          ${
            addr.expanded
              ? `<div class="addr-expand">
                   <div class="expand-section">
                     <span class="expand-label">PRIORITY:</span>
                     <span class="expand-value priority-${addr.priority.toLowerCase()}">${
                       addr.priority
                     }</span>
                   </div>
                   <div class="expand-section">
                     <span class="expand-label">TRACE:</span>
                     <span class="expand-value">${randomHex(6)}</span>
                   </div>
                   <div class="expand-section">
                     <span class="expand-label">GEO:</span>
                     <span class="expand-value">${addr.lat}, ${addr.lng}</span>
                   </div>
                   <div class="expand-section">
                     <span class="expand-label">RTT:</span>
                     <span class="expand-value">${addr.rtt}ms</span>
                   </div>
                   <div class="expand-section">
                     <span class="expand-label">LOSS:</span>
                     <span class="expand-value">${addr.loss}%</span>
                   </div>
                   <div class="expand-section">
                     <span class="expand-label">HOPS:</span>
                     <span class="expand-value">${addr.hops}</span>
                   </div>
                   <div class="expand-actions">
                     <span class="action-hint">[ENTER] Toggle | [DEL] Remove | [SPACE] Mark</span>
                   </div>
                 </div>`
              : ""
          }
        `,
          )
          .join("")}
      </div>
    </div>
  `;
}

// =====================
// UPDATE (STREAM FLOW)
// =====================

function update() {
  const addr = createAddress();
  addressState.rows.unshift(addr);

  if (addressState.rows.length > addressState.maxAddresses) {
    addressState.rows.pop();
  }

  // Si selected index était sur la dernière ligne supprimée
  if (selectedIndex >= addressState.rows.length) {
    selectedIndex = Math.max(0, addressState.rows.length - 1);
  }

  // Rerender uniquement le body
  const body = document.querySelector("#dist-addresses .addr-body");
  if (!body) return;

  body.innerHTML = addressState.rows
    .map(
      (addr, i) => `
      <div class="addr-row
        ${
          addr.flagged
            ? "row-flagged row-priority-" + addr.priority.toLowerCase()
            : ""
        }
        ${i === selectedIndex ? "row-selected" : ""}"
        data-index="${i}">
        <span class="addr-id">${addr.id}</span>
        <span class="addr-number">${addr.number}</span>
        <span class="addr-street">${addr.street}</span>
        <span class="addr-city">${addr.city} ${addr.country}</span>
        <span class="addr-area">${addr.area}</span>
        <span class="addr-postal">${addr.postal}</span>
        <span class="addr-node">${addr.node}</span>
        <span class="addr-sig">${addr.sig}</span>
      </div>
      ${
        addr.expanded
          ? `<div class="addr-expand">
               <div class="expand-section">
                 <span class="expand-label">PRIORITY:</span>
                 <span class="expand-value priority-${addr.priority.toLowerCase()}">${
                   addr.priority
                 }</span>
               </div>
               <div class="expand-section">
                 <span class="expand-label">TRACE:</span>
                 <span class="expand-value">${randomHex(6)}</span>
               </div>
               <div class="expand-section">
                 <span class="expand-label">GEO:</span>
                 <span class="expand-value">${addr.lat}, ${addr.lng}</span>
               </div>
               <div class="expand-section">
                 <span class="expand-label">RTT:</span>
                 <span class="expand-value">${addr.rtt}ms</span>
               </div>
               <div class="expand-section">
                 <span class="expand-label">LOSS:</span>
                 <span class="expand-value">${addr.loss}%</span>
               </div>
               <div class="expand-section">
                 <span class="expand-label">HOPS:</span>
                 <span class="expand-value">${addr.hops}</span>
               </div>
               <div class="expand-actions">
                 <span class="action-hint">[ENTER] Toggle | [DEL] Remove | [SPACE] Mark</span>
               </div>
             </div>`
          : ""
      }
    `,
    )
    .join("");

  attachClickHandlers();
}

// =====================
// INTERACTIONS
// =====================

function handleKeyboard(e) {
  const el = document.getElementById("dist-addresses");
  if (!el || !el.classList.contains("locked")) return;

  if (e.code === "ArrowDown") {
    e.preventDefault();
    selectedIndex = Math.min(selectedIndex + 1, addressState.rows.length - 1);
    update();
  } else if (e.code === "ArrowUp") {
    e.preventDefault();
    selectedIndex = Math.max(selectedIndex - 1, 0);
    update();
  } else if (e.code === "Enter") {
    e.preventDefault();
    if (addressState.rows[selectedIndex]) {
      addressState.rows[selectedIndex].expanded =
        !addressState.rows[selectedIndex].expanded;
      update();
    }
  } else if (e.code === "Delete") {
    e.preventDefault();
    if (addressState.rows[selectedIndex]) {
      addressState.rows.splice(selectedIndex, 1);
      selectedIndex = Math.max(
        0,
        Math.min(selectedIndex, addressState.rows.length - 1),
      );
      update();
    }
  } else if (e.code === "Space") {
    e.preventDefault();
    if (addressState.rows[selectedIndex]) {
      // Toggle flagged status
      addressState.rows[selectedIndex].flagged =
        !addressState.rows[selectedIndex].flagged;
      if (addressState.rows[selectedIndex].flagged) {
        addressState.rows[selectedIndex].priority =
          Math.random() < 0.5 ? "HIGH" : "MEDIUM";
      } else {
        addressState.rows[selectedIndex].priority = "LOW";
      }
      update();
    }
  }
}

function attachClickHandlers() {
  const rows = document.querySelectorAll("#dist-addresses .addr-row");

  rows.forEach((row) => {
    row.addEventListener("click", (e) => {
      const el = document.getElementById("dist-addresses");
      if (!el || !el.classList.contains("locked")) return;

      const index = Number(row.dataset.index);

      if (e.altKey) {
        // Alt + Click = Delete
        addressState.rows.splice(index, 1);
        selectedIndex = Math.max(
          0,
          Math.min(selectedIndex, addressState.rows.length - 1),
        );
        update();
      } else if (e.shiftKey) {
        // Shift + Click = Toggle flag
        addressState.rows[index].flagged = !addressState.rows[index].flagged;
        if (addressState.rows[index].flagged) {
          addressState.rows[index].priority =
            Math.random() < 0.5 ? "HIGH" : "MEDIUM";
        } else {
          addressState.rows[index].priority = "LOW";
        }
        update();
      } else {
        // Click = Select + Expand
        selectedIndex = index;
        addressState.rows[index].expanded = !addressState.rows[index].expanded;
        update();
      }
    });
  });
}

// =====================
// SETUP
// =====================

function setupAddresses() {
  document.removeEventListener("keydown", handleKeyboard);
  document.addEventListener("keydown", handleKeyboard);
  attachClickHandlers();
}

// =====================
// CLEANUP
// =====================

function cleanup() {
  document.removeEventListener("keydown", handleKeyboard);
}

// =====================
// WINDOW INSTANCE
// =====================

export const addressesWindow = createFUIWindow({
  id: "dist-addresses",
  render: render,
  update: update,
  interval: { min: 1000, max: 5000 },
  defaultMode: "default",
  autoRender: false,
  scrollConfig: {
    containerSelector: ".addr-body",
  },
});

// =====================
// PUBLIC API
// =====================

export function startDISTAddresses() {
  if (!addressState.initialized) initialize();
  addressesWindow.start();
  setupAddresses();
}

export function stopDISTAddresses() {
  cleanup();
  addressesWindow.stop();
}
