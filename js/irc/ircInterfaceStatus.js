import { createFUIWindow } from "../core/template.js";

/* ======================
   CONFIG
   ====================== */

const INTERFACE_NAMES = [
  "en0",
  "en1",
  "en2",
  "lo0",
  "awdl0",
  "utun0",
  "bridge0",
  "gif0",
];

const NETWORK_NAMES = [
  "localhost",
  "127.0.0.1",
  "192.168.1",
  "<Tunnel>",
  "<Link#1>",
  "<Link#2>",
  "<Link#3>",
  "<Link#4>",
  "<Link#5>",
];

const INTERFACE_STATES = ["ACTIVE", "IDLE", "UP", "DOWN", "SECURE"];

const MAX_INTERFACE_LINES = 35;

let interfaceData = [];
let isInitialized = false;

/* ======================
   HELPERS
   ====================== */

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function formatUptime(seconds) {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  return `${days}d ${hours}:${mins.toString().padStart(2, "0")}`;
}

function genMac() {
  return Array.from({ length: 6 }, () =>
    rand(0, 255).toString(16).padStart(2, "0"),
  ).join(":");
}

function genIPv4() {
  return `10.${rand(0, 255)}.${rand(0, 255)}.${rand(1, 254)}`;
}

function genConfig() {
  const letters = Array.from({ length: 3 }, () =>
    String.fromCharCode(rand(97, 122)),
  ).join("");

  return `${letters}-os.config`;
}

function genfe80() {
  const num1 = rand(0, 9);
  const num2 = rand(10, 99);
  const num3 = rand(100, 999);

  return Math.random() < 0.5
    ? `fe80:${num1}::${num3},${num2}ff`
    : `fe80:${num1}::${num1}`;
}

/* ======================
   DATA GENERATORS
   ====================== */
function genInterfaceName() {
  const base = pick(INTERFACE_NAMES);
  const suffix = Math.random() < 0.4 ? `:${rand(1, 9)}` : "";
  return base + suffix;
}

function genMTU(name) {
  if (name === "lo0") return 16384;
  if (name.startsWith("utun")) return 1380;
  if (name.startsWith("en")) return 1200;
  if (name.startsWith("bridge")) return 4070;
  return 1500;
}

// function genNetwork(name) {
//   if (name === "lo0") return "localhost";
//   if (name === "utun") return "127.0.0.1";
//   if (name.startsWith("utun")) return "&lt;Tunnel&gt;";
//   return `&lt;Link#${rand(1, 5)}&gt;`;
// }

function genNetwork() {
  return pick(NETWORK_NAMES);
}

function genAddress(name) {
  if (name === "awdl0") return "localhost";
  if (name.startsWith("utun")) return genConfig();
  if (name.startsWith("bridge")) return genIPv4();
  if (name === "en1") return genfe80();

  return genMac();
}

function createInterfaceRow() {
  const name = genInterfaceName();

  return {
    name,
    mtu: genMTU(name),
    network: genNetwork(),
    address: genAddress(name),
    state: pick(INTERFACE_STATES),
  };
}

function generateInterfaces(count = 3) {
  return Array.from({ length: count }, () => createInterfaceRow());
}

/* ======================
   DISK + SYSTEM (FAKE BUT STABLE)
   ====================== */

function generateDiskStatus() {
  const size = 60;
  const used = rand(12, 28) + rand(0, 9) / 10;
  const avail = (size - used).toFixed(1);
  const capacity = Math.round((used / size) * 100);

  return {
    filesystem: "/dev/disk0s2",
    size,
    used: used.toFixed(1),
    avail,
    capacity,
  };
}

function generateUptime() {
  return formatUptime(rand(20000, 90000));
}

/* ======================
   RENDER PARTS
   ====================== */

function renderDiskStatus() {
  const d = generateDiskStatus();

  return `
  <div class="is-section-title">
  Disk Status:


    <div class="is-header disk">
      <span>Filesystem</span>
      <span>Size</span>
      <span>Used</span>
      <span>Avail</span>
      <span>Capacity</span>
    </div>

    <div class="is-row disk">
      <span>${d.filesystem}</span>
      <span>${d.size}GB</span>
      <span>${d.used}GB</span>
      <span>${d.avail}GB</span>
      <span>${d.capacity}%</span>
    </div>
    </div>
  `;
}

function renderInterfaceHeader() {
  return `
    <div class="is-section-title2">Network Interface Status:</div>

    <div class="is-header net">
      <span>Interface</span>
      <span>MTU</span>
      <span>Network</span>
      <span>Address</span>
      <span>State</span>
    </div>
  `;
}

function renderInterfaces() {
  let html = "";
  let linesSinceSpace = 0;

  interfaceData.forEach((i, index) => {
    if (linesSinceSpace >= rand(3, 6) && index < interfaceData.length - 1) {
      const spaces = rand(1, 2);
      html += '<div class="is-spacer"></div>'.repeat(spaces);
      linesSinceSpace = 0;
    }

    html += `
      <div class="is-row net">
        <span>${i.name}</span>
        <span>${i.mtu}</span>
        <span>${i.network}</span>
        <span>${i.address}</span>
        <span class="state">${i.state}</span>
      </div>
    `;

    linesSinceSpace++;
  });

  return html;
}

function renderFooter() {
  return `
    <div class="is-footer">
      <span>Uptime: ${generateUptime()}</span>
      <span>${rand(10, 30)}/60GB (${rand(20, 60)}%)</span>
    </div>
  `;
}

function pushInterfaceLine() {
  interfaceData.push(createInterfaceRow());

  if (interfaceData.length > MAX_INTERFACE_LINES) {
    interfaceData.shift(); // supprime la plus ancienne
  }
}

/* ======================
   MAIN RENDER
   ====================== */

function render() {
  if (!isInitialized) {
    interfaceData = generateInterfaces(MAX_INTERFACE_LINES);
    isInitialized = true;
  } else {
    pushInterfaceLine(); // 👈 ligne ajoutée à chaque update
  }

  return `
    <div class="interface-status">
      ${renderDiskStatus()}
      ${renderInterfaceHeader()}
      <div class="is-body">
        ${renderInterfaces()}
      </div>
      ${renderFooter()}
    </div>
  `;
}

export const InterfaceStatus = createFUIWindow({
  id: "irc-InterfaceStatus",
  render,
  interval: { min: 10, max: 1000 },
  defaultMode: "default",
});

export function startIrcInterfaceStatus() {
  InterfaceStatus.start();
}

export function stopIrcInterfaceStatus() {
  InterfaceStatus.stop();
}
