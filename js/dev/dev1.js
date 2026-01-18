import { createFUIWindow } from "../core/template.js";

/* ============================================
   IRC STATS (CLEAN + INTERACTIVE)
   - Scroll respecting user
   - Header sticky respected
   - Random permanent highlights
   - Click & keyboard navigation
============================================ */

/* ===============================
   STATE
=============================== */

const system = {
  cpu: [0.65, 0.36],
  mem: 0.42,
  swap: 0.09,
  tasks: [151, 242],
  load: [0.9, 0.29, 0.21],
  buffers: 22,
  cached: 93,
  uptime: 34211,
  processes: [],
};

let currentMode = "large";
let statsTimer = null;

/* ===============================
   INTERACTIONS STATE
=============================== */

let isUserScrolling = false;
let savedScrollTop = 0;
const highlightedRows = new Set();

/* ===============================
   PROCESS FACTORY
=============================== */

function createProcess(id) {
  return {
    pid: id,
    user: ["root", "isrg", "user", "daemon", "sys"][
      Math.floor(Math.random() * 5)
    ],
    pri: [10, 20, 30][Math.floor(Math.random() * 3)],
    ni: Math.floor(Math.random() * 3),
    virt: Math.floor(4000 + Math.random() * 500000),
    res: Math.floor(1000 + Math.random() * 50000),
    shr: Math.floor(500 + Math.random() * 10000),
    cpu: Math.random() * 5,
    mem: Math.random() * 2,
    state: ["R", "S", "D", "I"][Math.floor(Math.random() * 4)],
    time: `${Math.floor(Math.random() * 99)}:${Math.floor(Math.random() * 59)
      .toString()
      .padStart(2, "0")}`,
    tty: `pts/${Math.floor(Math.random() * 9)}`,
    command: [
      "systemd",
      "kworker",
      "bash",
      "python",
      "node",
      "firefox",
      "chrome",
      "apache2",
      "mysql",
      "nginx",
    ][Math.floor(Math.random() * 10)],
  };
}

/* ===============================
   INIT PROCESS LIST (ONCE)
=============================== */

if (system.processes.length === 0) {
  for (let i = 0; i < 60; i++) {
    system.processes.push(createProcess(2000 + i * 37));
  }

  // select some rows to be highlighted permanently (3 random)
  while (highlightedRows.size < 3) {
    highlightedRows.add(Math.floor(Math.random() * system.processes.length));
  }
}

/* ===============================
   HELPERS
=============================== */

function drift(v, a = 0.01, min = 0, max = 1) {
  return Math.max(min, Math.min(max, v + (Math.random() - 0.5) * a));
}

function bar(value, max = 0.6, width = 32) {
  const filled = Math.round((value / max) * width);
  return "|".repeat(filled).padEnd(width, " ");
}

/* ===============================
   SYSTEM UPDATE
=============================== */

function updateSystem() {
  system.cpu = system.cpu.map((v) => drift(v, 0.08));
  system.mem = drift(system.mem, 0.02);
  system.swap = drift(system.swap, 0.01);
  system.load = system.load.map((v) => drift(v, 0.04, 0, 5));
  system.uptime += 1;

  system.processes.forEach((p) => {
    p.cpu = drift(p.cpu, 0.3, 0, 5);
    p.mem = drift(p.mem, 0.1, 0, 2);
  });

  system.processes.sort((a, b) => b.cpu - a.cpu);

  // Twitter-like new row
  const newPid = 2000 + Math.floor(Math.random() * 10000);
  system.processes.unshift(createProcess(newPid));
  if (system.processes.length > 60) system.processes.pop();
}

/* ===============================
   RENDER (LARGE)
=============================== */

function renderStatsLarge() {
  const totalTasks = system.tasks[0] + system.tasks[1];

  return `
<div class="irc-system">
  <div class="top-stats">
    <div class="bars">
      <div>1</div><div>${bar(system.cpu[0])}</div>
      <div>2</div><div>${bar(system.cpu[1])}</div>
      <div>Mem</div><div>${bar(system.mem)}</div>
      <div>Swp</div><div>${bar(system.swap)}</div>
    </div>

    <div class="info">
      <div>${(system.cpu[0] * 100).toFixed(1)}%]</div>
      <div>Hostname:</div><div>mArc</div>
      <div>${(system.cpu[1] * 100).toFixed(1)}%]</div>
      
      <div>Tasks:</div>
      <div>${system.tasks[0]},${totalTasks} thr;${system.tasks[1]} running</div>

      <div>${(system.mem * 100).toFixed(1)}%]</div>
      <div>Load avg:</div>
      <div>${system.load.map((v) => v.toFixed(2)).join(" ")}</div>

      <div>${(system.swap * 100).toFixed(1)}%]</div>
      <div>Buffers:</div>
      <div>${system.buffers}M Cache: ${system.cached}M</div>
    </div>
  </div>

  <div class="processes">
    <div class="header-stats">
      <span>PID</span><span>USER</span><span>PRI</span><span>NI</span>
      <span>VIRT</span><span>RES</span><span>SHR</span><span>S</span>
      <span>CPU%</span><span>MEM%</span><span>TIME+</span>
      <span>TTY</span><span>COMMAND</span>
    </div>

    <div class="process-list">
      ${system.processes
        .map(
          (p, i) => `
      <div class="row ${highlightedRows.has(i) ? "hl" : ""} ${
        i === 0 ? "hot" : ""
      }" data-i="${i}">
        <span>${p.pid}</span>
        <span>${p.user}</span>
        <span>${p.pri}</span>
        <span>${p.ni}</span>
        <span>${p.virt}</span>
        <span>${p.res}</span>
        <span>${p.shr}</span>
        <span>${p.state}</span>
        <span>${p.cpu.toFixed(1)}</span>
        <span>${p.mem.toFixed(1)}</span>
        <span>${p.time}</span>
        <span>${p.tty}</span>
        <span>${p.command}</span>
      </div>`,
        )
        .join("")}
    </div>
  </div>
</div>`;
}

/* ===============================
   RENDER (SMALL)
=============================== */

function renderStatsSmall() {
  return `
<div class="irc-system">
  <div class="top-stats">
    <div class="bars">
      <div>1</div><div>${bar(system.cpu[0])}</div>
      <div>2</div><div>${bar(system.cpu[1])}</div>
      <div>Mem</div><div>${bar(system.mem)}</div>
      <div>Swp</div><div>${bar(system.swap)}</div>
    </div>
  </div>
</div>`;
}

/* ===============================
   INTERACTIONS
=============================== */

function setupInteractions() {
  const root = document.getElementById("dev-1");
  if (!root) return;

  const list = root.querySelector(".process-list");
  if (!list) return;

  list.style.overflowY = "auto";
  list.tabIndex = 0;
  list.scrollTop = savedScrollTop;

  // Scroll detection
  list.addEventListener("scroll", () => {
    isUserScrolling = true;
    savedScrollTop = list.scrollTop;
  });

  // Keyboard navigation
  list.addEventListener("keydown", (e) => {
    if (e.code === "ArrowDown") {
      list.scrollTop += 24;
      savedScrollTop = list.scrollTop;
      e.preventDefault();
    }
    if (e.code === "ArrowUp") {
      list.scrollTop -= 24;
      savedScrollTop = list.scrollTop;
      e.preventDefault();
    }
  });

  // Row highlight click
  list.querySelectorAll(".row").forEach((row) => {
    const i = Number(row.dataset.i);
    row.addEventListener("click", () => {
      if (highlightedRows.has(i)) highlightedRows.delete(i);
      else highlightedRows.add(i);
      render();
      // keep scroll position
      list.scrollTop = savedScrollTop;
    });
  });
}

/* ===============================
   MAIN RENDER
=============================== */

export function render() {
  updateSystem();

  const el = document.getElementById("dev-1");
  if (!el) return;

  const prevScrollTop =
    el.querySelector(".process-list")?.scrollTop || savedScrollTop;

  el.innerHTML =
    currentMode === "small" ? renderStatsSmall() : renderStatsLarge();

  if (currentMode === "large") setupInteractions();

  // restore scroll position if user scrolled
  const list = el.querySelector(".process-list");
  if (list) list.scrollTop = isUserScrolling ? savedScrollTop : 0;
}

/* ===============================
   PUBLIC CONTROL API
=============================== */

export function startIRCStats() {
  if (statsTimer) return;

  statsTimer = setInterval(renderIRCStats, 2000);
}

export function stopIRCStats() {
  if (!statsTimer) return;
  clearInterval(statsTimer);
  statsTimer = null;
}

const dev1Window = createFUIWindow({
  id: "dev-1",
  render,
  update,
  interval: { min: 1000, max: 3000 },
  defaultMode: "default",
});

export function startDev1() {
  dev1Window.start();
}

export function stopDev1() {
  dev1Window.stop();
}

function update() {
  pushInterfaceLine();
}
