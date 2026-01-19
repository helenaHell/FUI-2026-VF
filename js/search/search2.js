import { createFUIWindow } from "../core/template.js";
import {
  setupKeyboardHandler,
  setupClickHandler,
  isWindowActive,
} from "../core/utils.js";

const state = {
  results: [],
  selected: 0,
  flaggedOnly: false,
  pinned: new Set(),
  sortMode: "score", // score | time
  lastQuery: "boot",
  lastGenAt: "",
  counters: { total: 0, flagged: 0, pinned: 0 },
};

let cleanupKeyboard = null;
let cleanupClick = null;
let cleanupEvents = null;

function pad2(n) {
  return String(n).padStart(2, "0");
}
function nowClock() {
  const d = new Date();
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}`;
}
function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
function clamp(n, a, b) {
  return Math.max(a, Math.min(b, n));
}
function escapeHtml(s) {
  return (s || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

const TYPES = ["MAIL", "DOC", "FILE", "LOG", "URL"];
const SOURCES = [
  "vault",
  "mailbox",
  "cache",
  "mirror",
  "proxy",
  "drop",
  "archive",
];
const FLAGS = ["LEAK", "ENCRYPTED", "TOR", "C2", "KEYS", "FLAGGED"];

const SEEDS = [
  {
    title: "Mailbox thread: press@wikileaks / mirror negotiation",
    snippet:
      "…requesting mirror sync windows, checksum list attached. domain: wikileaks.org …",
    entities: {
      domains: ["wikileaks.org"],
      emails: ["press@wikileaks.org"],
      ips: [],
      hashes: [],
      urls: [],
    },
    type: "MAIL",
  },
  {
    title: "Vault doc: server inventory / key rotation schedule",
    snippet:
      "…rotation policy mentions tor bridges, onion endpoints, and fallback domains…",
    entities: {
      domains: ["example-mirror.net"],
      emails: [],
      ips: ["185.231.29.14"],
      hashes: [],
      urls: ["http://example-mirror.net/"],
    },
    type: "DOC",
  },
  {
    title: "Captured page: /donate - payment processor endpoints",
    snippet:
      "…capture indicates third-party endpoints. cookies flagged. session jar updated…",
    entities: {
      domains: ["pay.example.org"],
      emails: [],
      ips: [],
      hashes: [],
      urls: ["https://pay.example.org/donate"],
    },
    type: "URL",
  },
  {
    title: "Log extract: proxy chain / dns anomalies",
    snippet:
      "…NXDOMAIN spikes for subdomains, resolver fallback, suspicious TTL jitter…",
    entities: {
      domains: ["cdn-wl.net"],
      emails: [],
      ips: ["91.214.124.9"],
      hashes: [],
      urls: [],
    },
    type: "LOG",
  },
  {
    title: "File: leaked_dump_index.txt",
    snippet:
      "…index references sha256 blocks and attachment pointers. contains signatures…",
    entities: {
      domains: [],
      emails: [],
      ips: [],
      hashes: ["9A3F…E1B2", "C44D…9910"],
      urls: [],
    },
    type: "FILE",
  },
];

function scoreBar(score) {
  const w = 16;
  const filled = clamp(Math.round((score / 100) * w), 0, w);
  const bar = "|".repeat(filled).padEnd(w, ".");
  return bar;
}

function makeId() {
  return `${Date.now().toString(16)}-${Math.floor(Math.random() * 1e8).toString(16)}`;
}

function makeResult(query = "boot") {
  const seed = pick(SEEDS);
  const type = seed.type || pick(TYPES);
  const source = pick(SOURCES);
  const t = nowClock();

  let score = rand(42, 98);
  if (/hash:|sha256|ip:|domain:/i.test(query)) score = clamp(score + 8, 0, 100);
  if (/tor|onion|c2/i.test(query)) score = clamp(score + 12, 0, 100);

  const flags = [];
  if (Math.random() < 0.18) flags.push("FLAGGED");
  if (Math.random() < 0.12) flags.push("ENCRYPTED");
  if (Math.random() < 0.1) flags.push("TOR");
  if (Math.random() < 0.08) flags.push("C2");
  if (Math.random() < 0.1) flags.push("LEAK");
  if (Math.random() < 0.07) flags.push("KEYS");

  // Keep flags minimal, like a HUD
  const finalFlags = [...new Set(flags)].slice(0, 3);

  return {
    id: makeId(),
    time: t,
    type,
    source,
    score,
    title: seed.title,
    snippet: seed.snippet,
    flags: finalFlags,
    entities: seed.entities,
    query,
    createdAt: Date.now(),
  };
}

function regenerateResults(query = state.lastQuery) {
  state.lastQuery = query || "query";
  state.results = [];
  const n = rand(14, 24);
  for (let i = 0; i < n; i++) state.results.push(makeResult(state.lastQuery));

  // Sort default
  applySort();

  state.selected = 0;
  state.lastGenAt = nowClock();
  recomputeCounters();

  // Push selection to inspector
  emitSelect();
}

function applySort() {
  if (state.sortMode === "time") {
    state.results.sort((a, b) => b.createdAt - a.createdAt);
  } else {
    state.results.sort((a, b) => b.score - a.score);
  }
}

function viewResults() {
  const base = state.results;
  if (!state.flaggedOnly) return base;
  return base.filter(
    (r) =>
      r.flags.includes("FLAGGED") ||
      r.flags.includes("LEAK") ||
      r.flags.includes("C2"),
  );
}

function recomputeCounters() {
  const total = state.results.length;
  const flagged = state.results.filter((r) => r.flags.length > 0).length;
  const pinned = state.pinned.size;
  state.counters = { total, flagged, pinned };
}

function emitSelect() {
  const list = viewResults();
  if (list.length === 0) return;
  const idx = clamp(state.selected, 0, list.length - 1);
  state.selected = idx;
  const item = list[idx];
  document.dispatchEvent(new CustomEvent("search:select", { detail: item }));
}

function emitOpen() {
  const list = viewResults();
  if (list.length === 0) return;
  const item = list[clamp(state.selected, 0, list.length - 1)];
  document.dispatchEvent(new CustomEvent("search:open", { detail: item }));
  document.dispatchEvent(new CustomEvent("search:select", { detail: item }));
}

function togglePin(item) {
  if (!item) return;
  if (state.pinned.has(item.id)) state.pinned.delete(item.id);
  else state.pinned.add(item.id);
  recomputeCounters();
}

function renderHeader() {
  return `
    <div class="search2-head">
      <div class="search2-title">RESULTS STREAM</div>
      <div class="search2-meta">
        <span class="k">Q</span><span class="v">${escapeHtml(state.lastQuery).slice(0, 42)}${state.lastQuery.length > 42 ? "…" : ""}</span>
        <span class="k">GEN</span><span class="v">${state.lastGenAt || "--:--:--"}</span>
      </div>
    </div>
  `;
}

function renderToolbar() {
  const f = state.flaggedOnly ? "active" : "";
  const sScore = state.sortMode === "score" ? "active" : "";
  const sTime = state.sortMode === "time" ? "active" : "";

  return `
    <div class="search2-toolbar">
      <div class="search2-btn" data-action="refresh">[REFRESH]</div>
      <div class="search2-btn ${f}" data-action="flagged">[FLAGGED]</div>
      <div class="search2-spacer"></div>
      <div class="search2-btn ${sScore}" data-action="sort-score">[SORT:SCORE]</div>
      <div class="search2-btn ${sTime}" data-action="sort-time">[SORT:TIME]</div>
      <div class="search2-counters">
        <span class="k">TOTAL</span><span class="v">${state.counters.total}</span>
        <span class="k">TAG</span><span class="v">${state.counters.flagged}</span>
        <span class="k">PIN</span><span class="v">${state.counters.pinned}</span>
      </div>
    </div>
  `;
}

function renderList() {
  const list = viewResults();
  if (list.length === 0) {
    return `<div class="search2-empty">No results</div>`;
  }

  return `
    <div class="search2-list" tabindex="0">
      ${list
        .map((r, i) => {
          const sel = i === state.selected ? "selected" : "";
          const pin = state.pinned.has(r.id) ? "pin" : "";
          const fl = r.flags && r.flags.length ? "flag" : "";
          const tag = (r.flags || []).join(" ");
          const bar = scoreBar(r.score);
          return `
            <div class="search2-row ${sel} ${pin} ${fl}" data-rid="${r.id}">
              <span class="sc">${String(r.score).padStart(3, " ")}%</span>
              <span class="bar">${bar}</span>
              <span class="tp">[${r.type}]</span>
              <span class="src">${r.source}</span>
              <span class="tm">${r.time}</span>
              <span class="ttl">${escapeHtml(r.title)}</span>
              <span class="tg">${escapeHtml(tag || ".")}</span>
              <span class="sn">${escapeHtml(r.snippet)}</span>
            </div>
          `;
        })
        .join("")}
    </div>
  `;
}

function renderFooter() {
  return `
    <div class="search2-foot">
      <span>[↑/↓] select</span>
      <span>[ENTER] open</span>
      <span>[SPACE] pin</span>
      <span>[F] flagged</span>
      <span>[R] re-rank</span>
      <span>[CLICK] select</span>
    </div>
  `;
}

function render() {
  return `
    <div class="fui-search-2">
      ${renderHeader()}
      ${renderToolbar()}
      <div class="search2-body">
        ${renderList()}
      </div>
      ${renderFooter()}
    </div>
  `;
}

function update() {
  // small background drift: occasionally insert a new item to feel alive
  if (state.results.length === 0) return;

  if (Math.random() < 0.22) {
    state.results.unshift(makeResult(state.lastQuery));
    if (state.results.length > 42) state.results.pop();
    applySort();
    recomputeCounters();
  } else {
    // score jitter
    const r = pick(state.results);
    if (r) r.score = clamp(r.score + rand(-2, 2), 0, 100);
    applySort();
  }
}

function findById(rid) {
  return state.results.find((r) => r.id === rid) || null;
}

function setupInteractions() {
  if (cleanupKeyboard) cleanupKeyboard();
  if (cleanupClick) cleanupClick();
  if (cleanupEvents) cleanupEvents();

  // Keyboard (gated)
  cleanupKeyboard = setupKeyboardHandler("search-2", {
    ArrowUp: () => {
      if (!isWindowActive("search-2")) return;
      const list = viewResults();
      if (list.length === 0) return;
      state.selected = clamp(state.selected - 1, 0, list.length - 1);
      emitSelect();
      search2Window.forceRender();
    },
    ArrowDown: () => {
      if (!isWindowActive("search-2")) return;
      const list = viewResults();
      if (list.length === 0) return;
      state.selected = clamp(state.selected + 1, 0, list.length - 1);
      emitSelect();
      search2Window.forceRender();
    },
    Enter: () => {
      if (!isWindowActive("search-2")) return;
      emitOpen();
      search2Window.forceRender();
    },
    Space: () => {
      if (!isWindowActive("search-2")) return;
      const list = viewResults();
      if (list.length === 0) return;
      const item = list[clamp(state.selected, 0, list.length - 1)];
      togglePin(item);
      search2Window.forceRender();
    },
    KeyF: () => {
      if (!isWindowActive("search-2")) return;
      state.flaggedOnly = !state.flaggedOnly;
      state.selected = 0;
      emitSelect();
      search2Window.forceRender();
    },
    KeyR: () => {
      if (!isWindowActive("search-2")) return;
      state.sortMode = state.sortMode === "score" ? "time" : "score";
      applySort();
      state.selected = 0;
      emitSelect();
      search2Window.forceRender();
    },
    Escape: () => {
      if (!isWindowActive("search-2")) return;
      state.selected = 0;
      emitSelect();
      search2Window.forceRender();
    },
  });

  // Clicks (always allowed)
  cleanupClick = setupClickHandler("search-2", "*", (e, target) => {
    const btn = target.closest("[data-action]");
    if (btn) {
      const a = btn.dataset.action;
      if (a === "refresh") {
        regenerateResults(state.lastQuery);
        search2Window.forceRender();
        return;
      }
      if (a === "flagged") {
        state.flaggedOnly = !state.flaggedOnly;
        state.selected = 0;
        emitSelect();
        search2Window.forceRender();
        return;
      }
      if (a === "sort-score") {
        state.sortMode = "score";
        applySort();
        state.selected = 0;
        emitSelect();
        search2Window.forceRender();
        return;
      }
      if (a === "sort-time") {
        state.sortMode = "time";
        applySort();
        state.selected = 0;
        emitSelect();
        search2Window.forceRender();
        return;
      }
    }

    const row = target.closest(".search2-row");
    if (row) {
      const rid = row.dataset.rid;
      const list = viewResults();
      const idx = list.findIndex((x) => x.id === rid);
      if (idx >= 0) {
        state.selected = idx;
        emitSelect();
        search2Window.forceRender();

        // double click -> open
        if (e.detail === 2) {
          emitOpen();
        }
      }
      return;
    }
  });

  // Events from other windows (optional)
  const onRun = (ev) => {
    const q = ev && ev.detail && ev.detail.query ? ev.detail.query : "run";
    regenerateResults(q);
    search2Window.forceRender();
  };

  const onPivot = (ev) => {
    const q = ev && ev.detail && ev.detail.query ? ev.detail.query : "pivot";
    regenerateResults(q);
    search2Window.forceRender();
  };

  document.addEventListener("search:run", onRun);
  document.addEventListener("search:pivot", onPivot);

  cleanupEvents = () => {
    document.removeEventListener("search:run", onRun);
    document.removeEventListener("search:pivot", onPivot);
  };
}

// Window instance
const search2Window = createFUIWindow({
  id: "search-2",
  render,
  update,
  interval: { min: 850, max: 1500 },
  defaultMode: "default",
  scrollConfig: { containerSelector: ".search2-list" },
});

export function startSearch2() {
  if (state.results.length === 0) regenerateResults("boot");
  search2Window.start();
  setTimeout(setupInteractions, 60);
}

export function stopSearch2() {
  search2Window.stop();
  if (cleanupKeyboard) cleanupKeyboard();
  if (cleanupClick) cleanupClick();
  if (cleanupEvents) cleanupEvents();
  cleanupKeyboard = null;
  cleanupClick = null;
  cleanupEvents = null;
}
