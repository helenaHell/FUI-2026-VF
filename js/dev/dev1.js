import { createFUIWindow } from "../core/template.js";

/* ============================================
   DEV-1 — LINK / BUS INTERFACE MONITOR (ALT)
   - Alternative à ircInterfaceStatus.js
   - Flux de lignes (table) + footer
   - createFUIWindow compatible
============================================ */

const BUS_NAMES = [
  "bus0",
  "bus1",
  "mux0",
  "mux1",
  "pipe0",
  "pipe1",
  "dev0",
  "dev1",
  "tap0",
  "tap1",
  "shim0",
  "shim1",
];

const TARGETS = [
  "authd",
  "assetd",
  "logd",
  "watchd",
  "renderd",
  "vaultd",
  "proxy",
  "bridge",
  "sync",
  "index",
  "trace",
];

const STATES = ["OPEN", "IDLE", "TX", "RX", "DROP", "SEALED"];

const MAX_LINES = 44;

let rows = [];
let initialized = false;

// ----------------------
// Helpers
// ----------------------

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pad2(n) {
  return String(n).padStart(2, "0");
}

function nowStamp() {
  const d = new Date();
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}`;
}

function hex(n, w = 4) {
  return Math.floor(n).toString(16).toUpperCase().padStart(w, "0");
}

function genRoute() {
  const a = pick(TARGETS);
  const b = pick(TARGETS);
  return a === b ? `${a}` : `${a}.${b}`;
}

function genBusName() {
  const base = pick(BUS_NAMES);
  const suffix = Math.random() < 0.35 ? `:${rand(1, 9)}` : "";
  return base + suffix;
}

function genRate() {
  // "film" style: a bit spiky
  const base = rand(0, 900);
  const spike = Math.random() < 0.12 ? rand(700, 3400) : 0;
  return base + spike;
}

function genDrop() {
  return Math.random() < 0.08 ? rand(1, 14) : 0;
}

function genFlags(state) {
  if (state === "SEALED") return "!!";
  if (state === "DROP") return "x";
  if (state === "TX") return ">";
  if (state === "RX") return "<";
  return ".";
}

function makeRow() {
  const state = pick(STATES);
  const rx = genRate();
  const tx = genRate();
  const drop = genDrop();

  return {
    t: nowStamp(),
    bus: genBusName(),
    route: genRoute(),
    rx,
    tx,
    drop,
    seq: hex(rand(0, 0xffff), 4),
    state,
    flags: genFlags(state),
  };
}

function initRows() {
  rows = Array.from({ length: MAX_LINES }, () => makeRow());
}

// ----------------------
// Render parts
// ----------------------

function renderHeaderBlock() {
  const d = new Date();
  const date = `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
  return `
    <div class="dev1-head">
      <div class="dev1-title">DEV LINK / BUS MONITOR</div>
      <div class="dev1-meta">
        <span>NODE: devstack</span>
        <span>DATE: ${date}</span>
        <span>CLK: ${nowStamp()}</span>
      </div>
    </div>
  `;
}

function renderTableHeader() {
  return `
    <div class="dev1-grid dev1-grid-head">
      <span>T</span>
      <span>BUS</span>
      <span>ROUTE</span>
      <span>RX</span>
      <span>TX</span>
      <span>DROP</span>
      <span>SEQ</span>
      <span>ST</span>
      <span>F</span>
    </div>
  `;
}

function renderRows() {
  let html = "";
  let spacerCount = 0;

  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];

    // micro “spacing” comme terminal dumps
    if (spacerCount >= rand(4, 7) && i < rows.length - 2) {
      html += `<div class="dev1-spacer"></div>`;
      spacerCount = 0;
    }

    const hot = i === rows.length - 1 ? "hot" : "";
    const sealed = r.state === "SEALED" ? "sealed" : "";
    const drop = r.drop > 0 ? "drop" : "";

    html += `
      <div class="dev1-grid dev1-row ${hot} ${sealed} ${drop}">
        <span>${r.t}</span>
        <span>${r.bus}</span>
        <span>${r.route}</span>
        <span>${String(r.rx).padStart(4, " ")}</span>
        <span>${String(r.tx).padStart(4, " ")}</span>
        <span>${String(r.drop).padStart(2, " ")}</span>
        <span>${r.seq}</span>
        <span class="st">${r.state}</span>
        <span class="fl">${r.flags}</span>
      </div>
    `;

    spacerCount++;
  }

  return html;
}

function renderFooter() {
  const drops = rows.reduce((acc, r) => acc + (r.drop || 0), 0);
  const sealed = rows.filter((r) => r.state === "SEALED").length;
  const rxSum = rows.slice(-10).reduce((a, r) => a + r.rx, 0);
  const txSum = rows.slice(-10).reduce((a, r) => a + r.tx, 0);

  return `
    <div class="dev1-foot">
      <span>RX(10): ${rxSum}</span>
      <span>TX(10): ${txSum}</span>
      <span>DROPS: ${drops}</span>
      <span>SEALED: ${sealed}</span>
      <span>SEQ: ${hex(rand(0, 0xffffff), 6)}</span>
    </div>
  `;
}

// ----------------------
// Main render/update
// ----------------------

function render() {
  if (!initialized) {
    initRows();
    initialized = true;
  }

  return `
    <div class="dev1-monitor">
      ${renderHeaderBlock()}
      ${renderTableHeader()}
      <div class="dev1-body">
        ${renderRows()}
      </div>
      ${renderFooter()}
    </div>
  `;
}

function update() {
  // push new row each tick
  rows.push(makeRow());
  if (rows.length > MAX_LINES) rows.shift();
}

// ----------------------
// Window instance
// ----------------------

const dev1Window = createFUIWindow({
  id: "dev-1",
  render,
  update,
  interval: { min: 900, max: 2400 },
  defaultMode: "default",
});

export function startDev1() {
  dev1Window.start();
}

export function stopDev1() {
  dev1Window.stop();
}
