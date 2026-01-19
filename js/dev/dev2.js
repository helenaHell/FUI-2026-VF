import { createFUIWindow } from "../core/template.js";

/* ============================================
   DEV-2 — PROFILER / THREAD WATCH (ALT)
   - Alternative à ircStats.js
   - createFUIWindow + scrollConfig
   - Click: pin/unpin lignes
   - Keyboard: scroll (quand focus dans la liste)
============================================ */

const state = {
  cpu: [0.42, 0.31],
  mem: 0.38,
  io: 0.18,
  load: [0.82, 0.55, 0.29],
  uptime: 41822,
  threads: [],
};

const pinned = new Set(); // persistent toggles
let initialized = false;

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function drift(v, a = 0.02, min = 0, max = 1) {
  const nv = v + (Math.random() - 0.5) * a;
  return Math.max(min, Math.min(max, nv));
}

function bar(value, max = 0.8, width = 26) {
  const filled = Math.round((value / max) * width);
  return "|".repeat(filled).padEnd(width, " ");
}

function mkThread(id) {
  return {
    tid: id,
    mod: ["net", "ui", "crypto", "fs", "ipc", "sched", "vm", "gfx"][rand(0, 7)],
    q: rand(0, 9),
    lat: rand(1, 240), // ms
    cpu: Math.random() * 7,
    mem: Math.random() * 2.5,
    st: ["R", "S", "D", "I"][rand(0, 3)],
    tag: ["scan", "flush", "pull", "push", "mix", "lock", "trace", "sync"][
      rand(0, 7)
    ],
  };
}

function initThreads() {
  state.threads = [];
  for (let i = 0; i < 64; i++) {
    state.threads.push(mkThread(3000 + i * 13));
  }

  // seed pinned (2 rows)
  while (pinned.size < 2) pinned.add(rand(0, state.threads.length - 1));
}

function updateSystem() {
  state.cpu = state.cpu.map((v) => drift(v, 0.09, 0, 1));
  state.mem = drift(state.mem, 0.03, 0, 1);
  state.io = drift(state.io, 0.04, 0, 1);
  state.load = state.load.map((v) => drift(v, 0.06, 0, 5));
  state.uptime += 1;

  state.threads.forEach((t) => {
    t.cpu = drift(t.cpu, 0.5, 0, 9);
    t.mem = drift(t.mem, 0.15, 0, 3);
    t.lat = Math.max(1, Math.min(999, Math.round(drift(t.lat, 18, 1, 999))));
  });

  // sort by CPU and inject "fresh" row
  state.threads.sort((a, b) => b.cpu - a.cpu);
  state.threads.unshift(mkThread(3000 + rand(0, 9999)));

  if (state.threads.length > 64) state.threads.pop();
}

function fmtUptime(sec) {
  const d = Math.floor(sec / 86400);
  const h = Math.floor((sec % 86400) / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  return `${d}d ${String(h).padStart(2, "0")}:${String(m).padStart(
    2,
    "0",
  )}:${String(s).padStart(2, "0")}`;
}

function renderHeader() {
  return `
    <div class="dev2-head">
      <div class="dev2-title">PROFILER / THREAD WATCH</div>
      <div class="dev2-meta">
        <span>UPTIME: ${fmtUptime(state.uptime)}</span>
        <span>LOAD: ${state.load.map((v) => v.toFixed(2)).join(" ")}</span>
      </div>
    </div>
  `;
}

function renderBars() {
  return `
    <div class="dev2-bars">
      <div class="dev2-bar-row"><span>CPU0</span><span class="b">${bar(
        state.cpu[0],
      )}</span><span>${(state.cpu[0] * 100).toFixed(1)}%</span></div>
      <div class="dev2-bar-row"><span>CPU1</span><span class="b">${bar(
        state.cpu[1],
      )}</span><span>${(state.cpu[1] * 100).toFixed(1)}%</span></div>
      <div class="dev2-bar-row"><span>MEM</span><span class="b">${bar(
        state.mem,
      )}</span><span>${(state.mem * 100).toFixed(1)}%</span></div>
      <div class="dev2-bar-row"><span> I/O</span><span class="b">${bar(
        state.io,
      )}</span><span>${(state.io * 100).toFixed(1)}%</span></div>
    </div>
  `;
}

function renderList() {
  return `
    <div class="dev2-table">
      <div class="dev2-headrow">
        <span>TID</span><span>MOD</span><span>Q</span><span>LAT</span>
        <span>CPU</span><span>MEM</span><span>ST</span><span>TAG</span>
      </div>

      <div class="dev2-list" tabindex="0">
        ${state.threads
          .map((t, i) => {
            const hot = i === 0 ? "hot" : "";
            const pin = pinned.has(i) ? "pin" : "";
            const slow = t.lat > 180 ? "slow" : "";
            return `
              <div class="dev2-row ${hot} ${pin} ${slow}" data-i="${i}">
                <span>${t.tid}</span>
                <span>${t.mod}</span>
                <span>${t.q}</span>
                <span>${String(t.lat).padStart(3, " ")}ms</span>
                <span>${t.cpu.toFixed(1)}</span>
                <span>${t.mem.toFixed(1)}</span>
                <span>${t.st}</span>
                <span>${t.tag}</span>
              </div>
            `;
          })
          .join("")}
      </div>

      <div class="dev2-foot">
        <span>[CLICK] pin row</span>
        <span>[↑/↓] scroll</span>
        <span>[HOME] top</span>
      </div>
    </div>
  `;
}

function render() {
  if (!initialized) {
    initThreads();
    initialized = true;
  }

  return `
    <div class="dev2-profiler">
      ${renderHeader()}
      ${renderBars()}
      ${renderList()}
    </div>
  `;
}

function update() {
  updateSystem();
}

const dev2Window = createFUIWindow({
  id: "dev-2",
  render,
  update,
  interval: { min: 1200, max: 2200 },
  defaultMode: "default",
  scrollConfig: { containerSelector: ".dev2-list" },
});

// ----------------------
// Interactions (delegation on #dev-2)
// ----------------------

let cleanupInteractions = null;

function setupInteractions() {
  const root = document.getElementById("dev-2");
  if (!root) return;

  const onClick = (e) => {
    const row = e.target.closest(".dev2-row");
    if (!row) return;
    const i = Number(row.dataset.i);
    if (Number.isNaN(i)) return;

    if (pinned.has(i)) pinned.delete(i);
    else pinned.add(i);

    dev2Window.forceRender();
  };

  const onMouseDown = (e) => {
    // focus the list for keyboard scrolling
    const list = root.querySelector(".dev2-list");
    if (list) list.focus();
  };

  const onKeyDown = (e) => {
    const list = root.querySelector(".dev2-list");
    if (!list) return;

    // only when list has focus
    if (document.activeElement !== list) return;

    if (e.code === "ArrowDown") {
      list.scrollTop += 24;
      e.preventDefault();
    } else if (e.code === "ArrowUp") {
      list.scrollTop -= 24;
      e.preventDefault();
    } else if (e.code === "PageDown") {
      list.scrollTop += 220;
      e.preventDefault();
    } else if (e.code === "PageUp") {
      list.scrollTop -= 220;
      e.preventDefault();
    } else if (e.code === "Home") {
      list.scrollTop = 0;
      e.preventDefault();
    }
  };

  root.addEventListener("click", onClick);
  root.addEventListener("mousedown", onMouseDown);
  root.addEventListener("keydown", onKeyDown, true);

  cleanupInteractions = () => {
    root.removeEventListener("click", onClick);
    root.removeEventListener("mousedown", onMouseDown);
    root.removeEventListener("keydown", onKeyDown, true);
  };
}

export function startDev2() {
  dev2Window.start();
  setTimeout(setupInteractions, 50);
}

export function stopDev2() {
  dev2Window.stop();
  if (cleanupInteractions) cleanupInteractions();
  cleanupInteractions = null;
}
