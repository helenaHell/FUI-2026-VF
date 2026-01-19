import { createFUIWindow } from "../core/template.js";
import {
  setupKeyboardHandler,
  setupClickHandler,
  isWindowActive,
} from "../core/utils.js";

/* =========================================================
  SEARCH-1 — QUERY CONSOLE (Brut / Film style)
  - Clavier : actif SEULEMENT si window active
  - Souris : toujours autorisée (même si non active)
  - Simple : pas de vraie DB, juste "index simulation" crédible
========================================================= */

const MAX_HISTORY = 18;

const SOURCES = [
  { key: "MAIL", label: "MAILBOX" },
  { key: "DOC", label: "VAULT" },
  { key: "FILES", label: "FILES" },
  { key: "WEB", label: "WEB" },
];

const DATE_RANGES = [
  { key: "24H", label: "24H" },
  { key: "7D", label: "7D" },
  { key: "30D", label: "30D" },
  { key: "ALL", label: "ALL" },
];

const TYPE_FILTERS = [
  { key: "mail", label: "MAIL" },
  { key: "doc", label: "DOC" },
  { key: "file", label: "FILE" },
  { key: "log", label: "LOG" },
  { key: "url", label: "URL" },
];

const ADV_FILTERS = [
  { key: "flagged", label: "FLAGGED" },
  { key: "encrypted", label: "ENCRYPTED" },
  { key: "has_ip", label: "HAS:IP" },
  { key: "has_domain", label: "HAS:DOMAIN" },
];

const state = {
  // query editing
  query: "domain:wikileaks.org AND (type:mail OR type:doc) after:2010-01-01",
  cursor: 0,
  queryFocus: true,

  // panels focus (purely visual)
  focus: "query", // query | filters | sources | history

  // toggles
  sources: { MAIL: true, DOC: true, FILES: true, WEB: false },
  dateRange: "7D",
  types: { mail: true, doc: true, file: true, log: false, url: false },
  adv: { flagged: false, encrypted: false, has_ip: false, has_domain: true },

  // runtime stats
  shards: 6,
  docs: 2140000,
  cache: "WARM",
  latencyMs: 84,
  hitCount: 0,
  lastRunAt: "",

  // history
  history: [],

  // ui blink
  blink: true,
};

function pad2(n) {
  return String(n).padStart(2, "0");
}
function nowClock() {
  const d = new Date();
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}`;
}
function isoDate() {
  const d = new Date();
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}
function clamp(n, a, b) {
  return Math.max(a, Math.min(b, n));
}
function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function sourcesLabel() {
  return SOURCES.filter((s) => state.sources[s.key])
    .map((s) => s.key)
    .join(",");
}
function typesLabel() {
  return TYPE_FILTERS.filter((t) => state.types[t.key])
    .map((t) => t.label)
    .join(",");
}
function advLabel() {
  return ADV_FILTERS.filter((f) => state.adv[f.key])
    .map((f) => f.label)
    .join(" ");
}

function computeHitCount() {
  // fake but believable: depends on toggles + query length
  const q = (state.query || "").trim();
  const srcOn = Object.values(state.sources).filter(Boolean).length;
  const typeOn = Object.values(state.types).filter(Boolean).length;
  const advOn = Object.values(state.adv).filter(Boolean).length;

  const base = 400 + q.length * 12 + srcOn * 220 + typeOn * 140;
  const dateMul =
    state.dateRange === "24H"
      ? 0.15
      : state.dateRange === "7D"
        ? 0.35
        : state.dateRange === "30D"
          ? 0.6
          : 1.0;
  const advMul = 1 - Math.min(0.55, advOn * 0.08);

  let hits = Math.floor(base * dateMul * advMul);

  // make it “film spiky”
  if (/hash:|sha256:|ip:|c2|onion|tor/i.test(q)) hits = Math.floor(hits * 0.35);
  if (/leak|vault|mirror|dump/i.test(q)) hits = Math.floor(hits * 1.35);

  hits = clamp(hits, 0, 99999);
  return hits;
}

function computeLatency() {
  const srcOn = Object.values(state.sources).filter(Boolean).length;
  const typeOn = Object.values(state.types).filter(Boolean).length;
  const advOn = Object.values(state.adv).filter(Boolean).length;

  let ms = 30 + srcOn * 14 + typeOn * 10 + advOn * 7 + rand(0, 60);

  // cache effect
  if (state.cache === "HOT") ms -= 18;
  if (state.cache === "COLD") ms += 40;

  ms = clamp(ms, 18, 420);
  return ms;
}

function rotateCache() {
  // small rotation so it feels alive
  const r = Math.random();
  if (r < 0.12) state.cache = "HOT";
  else if (r < 0.82) state.cache = "WARM";
  else state.cache = "COLD";
}

function runSearch(origin = "manual") {
  const q = (state.query || "").trim();

  rotateCache();
  state.latencyMs = computeLatency();
  state.hitCount = computeHitCount();
  state.lastRunAt = nowClock();

  const entry = {
    t: state.lastRunAt,
    date: isoDate(),
    q,
    sources: { ...state.sources },
    dateRange: state.dateRange,
    types: { ...state.types },
    adv: { ...state.adv },
    hits: state.hitCount,
    ms: state.latencyMs,
    origin,
  };

  state.history.unshift(entry);
  if (state.history.length > MAX_HISTORY) state.history.pop();
}

function setFocus(next) {
  state.focus = next;
  state.queryFocus = next === "query";
  if (state.queryFocus)
    state.cursor = clamp(state.cursor, 0, state.query.length);
}

function renderChips(list, isActiveFn, dataAttr) {
  return list
    .map((it) => {
      const active = isActiveFn(it) ? "active" : "";
      return `<div class="search-chip ${active}" data-${dataAttr}="${it.key}">[${it.label}]</div>`;
    })
    .join("");
}

function renderQueryLine() {
  const q = state.query || "";
  const cur = clamp(state.cursor, 0, q.length);
  const left = q.slice(0, cur);
  const right = q.slice(cur);

  const cursor =
    state.queryFocus && state.blink
      ? `<span class="search-cursor">█</span>`
      : `<span class="search-cursor ghost">█</span>`;

  return `
    <div class="search-query-line ${state.focus === "query" ? "focus" : ""}" data-action="focus-query">
      <span class="search-prompt">Q&gt;</span>
      <span class="search-query-text">${escapeHtml(left)}${cursor}${escapeHtml(right)}</span>
    </div>
  `;
}

function escapeHtml(s) {
  return (s || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function renderStatus() {
  const src = sourcesLabel() || "NONE";
  const types = typesLabel() || "NONE";
  const adv = advLabel() || "NONE";

  return `
    <div class="search-status">
      <div class="search-status-row">
        <span class="k">INDEX</span>
        <span class="v">${state.shards} shards</span>
        <span class="k">DOCS</span>
        <span class="v">${(state.docs / 1000000).toFixed(1)}M</span>
        <span class="k">CACHE</span>
        <span class="v">${state.cache}</span>
      </div>
      <div class="search-status-row">
        <span class="k">SRC</span>
        <span class="v">${src}</span>
        <span class="k">TYPE</span>
        <span class="v">${types}</span>
        <span class="k">ADV</span>
        <span class="v">${adv}</span>
      </div>
    </div>
  `;
}

function renderHistory() {
  const items =
    state.history.length === 0
      ? `<div class="search-empty">No history</div>`
      : state.history
          .slice(0, 8)
          .map((h, i) => {
            return `
              <div class="search-hitem" data-hindex="${i}">
                <span class="t">${h.t}</span>
                <span class="ms">${String(h.ms).padStart(3, " ")}ms</span>
                <span class="hits">${String(h.hits).padStart(5, " ")} hits</span>
                <span class="q">${escapeHtml(h.q).slice(0, 64)}${h.q.length > 64 ? "…" : ""}</span>
              </div>
            `;
          })
          .join("");

  return `
    <div class="search-history ${state.focus === "history" ? "focus" : ""}">
      <div class="search-block-title">HISTORY</div>
      <div class="search-hlist">
        ${items}
      </div>
      <div class="search-hint">[↑/↓] history  [ENTER] run  [CLICK] load</div>
    </div>
  `;
}

function render() {
  const ts = nowClock();

  return `
    <div class="fui-search-1">
      <div class="search-head">
        <div class="search-title">SEARCH CONSOLE</div>
        <div class="search-clock">${ts}</div>
      </div>

      ${renderQueryLine()}

      <div class="search-actions">
        <div class="search-btn" data-action="run">[RUN]</div>
        <div class="search-btn" data-action="clear">[CLEAR]</div>
        <div class="search-btn" data-action="help">[SYNTAX]</div>
        <div class="search-runline">
          <span class="k">LAST</span><span class="v">${state.lastRunAt || "--:--:--"}</span>
          <span class="k">HITS</span><span class="v">${state.hitCount}</span>
          <span class="k">LAT</span><span class="v">${state.latencyMs}ms</span>
        </div>
      </div>

      <div class="search-grid">
        <div class="search-block ${state.focus === "filters" ? "focus" : ""}">
          <div class="search-block-title">FILTERS</div>

          <div class="search-subtitle">DATE RANGE</div>
          <div class="search-chiprow">
            ${renderChips(
              DATE_RANGES,
              (it) => state.dateRange === it.key,
              "date",
            )}
          </div>

          <div class="search-subtitle">TYPE</div>
          <div class="search-chiprow">
            ${renderChips(TYPE_FILTERS, (it) => !!state.types[it.key], "type")}
          </div>

          <div class="search-subtitle">ADV</div>
          <div class="search-chiprow">
            ${renderChips(ADV_FILTERS, (it) => !!state.adv[it.key], "adv")}
          </div>

          <div class="search-hint">[TAB] focus  [CLICK] toggle  [CTRL+L] query</div>
        </div>

        <div class="search-block ${state.focus === "sources" ? "focus" : ""}">
          <div class="search-block-title">SOURCES</div>

          <div class="search-chiprow">
            ${renderChips(SOURCES, (it) => !!state.sources[it.key], "src")}
          </div>

          <div class="search-subtitle">INDEX STATUS</div>
          ${renderStatus()}

          <div class="search-hint">[CTRL+1..4] sources  [ENTER] run</div>
        </div>

        ${renderHistory()}
      </div>

      <div class="search-footer">
        <div class="search-footline">
          [/] query  [ENTER] run  [TAB] cycle focus  [ESC] clear query
        </div>
      </div>
    </div>
  `;
}

// =====================
// KEYBOARD (active only)
// =====================

let cleanupKeyboard = null;
let cleanupClick = null;
let cleanupTyping = null;

function moveCursor(delta) {
  state.cursor = clamp(state.cursor + delta, 0, state.query.length);
}

function insertText(txt) {
  const q = state.query || "";
  const cur = clamp(state.cursor, 0, q.length);
  state.query = q.slice(0, cur) + txt + q.slice(cur);
  state.cursor = cur + txt.length;
}

function backspace() {
  const q = state.query || "";
  if (state.cursor <= 0) return;
  const cur = state.cursor;
  state.query = q.slice(0, cur - 1) + q.slice(cur);
  state.cursor = cur - 1;
}

function del() {
  const q = state.query || "";
  if (state.cursor >= q.length) return;
  const cur = state.cursor;
  state.query = q.slice(0, cur) + q.slice(cur + 1);
}

function clearQuery() {
  state.query = "";
  state.cursor = 0;
}

function cycleFocus() {
  const order = ["query", "filters", "sources", "history"];
  const idx = order.indexOf(state.focus);
  const next = order[(idx + 1) % order.length];
  setFocus(next);
}

function historySelect(dir) {
  if (state.history.length === 0) return;
  // simple: when up/down, load first items sequentially into query
  // we keep a pointer in state (hidden)
  if (state.__hptr == null) state.__hptr = 0;
  state.__hptr = clamp(
    state.__hptr + dir,
    0,
    Math.min(7, state.history.length - 1),
  );
  const h = state.history[state.__hptr];
  if (h) {
    state.query = h.q;
    state.cursor = clamp(state.cursor, 0, state.query.length);
  }
}

function setupTypingListener() {
  const onKeyDown = (e) => {
    if (!isWindowActive("search-1")) return; // keyboard gated
    if (!state.queryFocus) return;

    // allow meta combos handled elsewhere
    if (e.ctrlKey || e.metaKey || e.altKey) return;

    const reserved = new Set([
      "Tab",
      "Enter",
      "Escape",
      "Backspace",
      "Delete",
      "ArrowLeft",
      "ArrowRight",
      "ArrowUp",
      "ArrowDown",
      "Home",
      "End",
      "Slash",
      "KeyF",
      "Digit1",
      "Digit2",
      "Digit3",
      "Digit4",
    ]);
    if (reserved.has(e.code)) return;

    if (typeof e.key === "string" && e.key.length === 1) {
      e.preventDefault();
      // keep it raw but safe: allow most ASCII + spaces
      const ch = e.key;
      if (state.query.length >= 180) return;
      insertText(ch);
      search1Window.forceRender();
    }
  };

  document.addEventListener("keydown", onKeyDown, false);
  cleanupTyping = () =>
    document.removeEventListener("keydown", onKeyDown, false);
}

function setupInteractions() {
  if (cleanupKeyboard) cleanupKeyboard();
  if (cleanupClick) cleanupClick();
  if (cleanupTyping) cleanupTyping();

  cleanupKeyboard = setupKeyboardHandler("search-1", {
    // Focus / run
    Enter: () => {
      if (!isWindowActive("search-1")) return;
      runSearch("kbd");
      search1Window.forceRender();
    },
    Tab: () => {
      if (!isWindowActive("search-1")) return;
      cycleFocus();
      search1Window.forceRender();
    },
    Escape: () => {
      if (!isWindowActive("search-1")) return;
      setFocus("query");
      clearQuery();
      search1Window.forceRender();
    },

    // Focus shortcuts
    Slash: () => {
      if (!isWindowActive("search-1")) return;
      setFocus("query");
      search1Window.forceRender();
    },

    // Editing
    Backspace: () => {
      if (!isWindowActive("search-1")) return;
      if (!state.queryFocus) return;
      backspace();
      search1Window.forceRender();
    },
    Delete: () => {
      if (!isWindowActive("search-1")) return;
      if (!state.queryFocus) return;
      del();
      search1Window.forceRender();
    },
    ArrowLeft: () => {
      if (!isWindowActive("search-1")) return;
      if (!state.queryFocus) return;
      moveCursor(-1);
      search1Window.forceRender();
    },
    ArrowRight: () => {
      if (!isWindowActive("search-1")) return;
      if (!state.queryFocus) return;
      moveCursor(1);
      search1Window.forceRender();
    },
    Home: () => {
      if (!isWindowActive("search-1")) return;
      if (!state.queryFocus) return;
      state.cursor = 0;
      search1Window.forceRender();
    },
    End: () => {
      if (!isWindowActive("search-1")) return;
      if (!state.queryFocus) return;
      state.cursor = state.query.length;
      search1Window.forceRender();
    },

    // History
    ArrowUp: () => {
      if (!isWindowActive("search-1")) return;
      historySelect(-1);
      search1Window.forceRender();
    },
    ArrowDown: () => {
      if (!isWindowActive("search-1")) return;
      historySelect(1);
      search1Window.forceRender();
    },

    // Ctrl shortcuts (captured via keydown listener in utils usually)
    Digit1: () => {
      if (!isWindowActive("search-1")) return;
      if (!state.__ctrl) return;
      state.sources.MAIL = !state.sources.MAIL;
      search1Window.forceRender();
    },
    Digit2: () => {
      if (!isWindowActive("search-1")) return;
      if (!state.__ctrl) return;
      state.sources.DOC = !state.sources.DOC;
      search1Window.forceRender();
    },
    Digit3: () => {
      if (!isWindowActive("search-1")) return;
      if (!state.__ctrl) return;
      state.sources.FILES = !state.sources.FILES;
      search1Window.forceRender();
    },
    Digit4: () => {
      if (!isWindowActive("search-1")) return;
      if (!state.__ctrl) return;
      state.sources.WEB = !state.sources.WEB;
      search1Window.forceRender();
    },
  });

  // Ctrl detection for Digit shortcuts (simple + reliable)
  const onCtrl = (e) => {
    if (!isWindowActive("search-1")) return;
    state.__ctrl = !!(e.ctrlKey || e.metaKey);
  };
  document.addEventListener("keydown", onCtrl, false);
  const cleanupCtrl = () =>
    document.removeEventListener("keydown", onCtrl, false);

  // Clicks always allowed (no isWindowActive gating)
  cleanupClick = setupClickHandler("search-1", "*", (e, target) => {
    const actionEl = target.closest("[data-action]");
    if (actionEl) {
      const a = actionEl.dataset.action;

      if (a === "run") {
        runSearch("click");
        search1Window.forceRender();
        return;
      }
      if (a === "clear") {
        clearQuery();
        setFocus("query");
        search1Window.forceRender();
        return;
      }
      if (a === "help") {
        // inject quick syntax example to feel alive
        state.query =
          "from:*@* type:mail (leak OR mirror OR dump) has:domain after:2011-01-01";
        state.cursor = state.query.length;
        setFocus("query");
        search1Window.forceRender();
        return;
      }
      if (a === "focus-query") {
        setFocus("query");
        search1Window.forceRender();
        return;
      }
    }

    const chip = target.closest(".search-chip");
    if (chip) {
      if (chip.dataset.date) {
        state.dateRange = chip.dataset.date;
        setFocus("filters");
        search1Window.forceRender();
        return;
      }
      if (chip.dataset.type) {
        const k = chip.dataset.type;
        state.types[k] = !state.types[k];
        setFocus("filters");
        search1Window.forceRender();
        return;
      }
      if (chip.dataset.adv) {
        const k = chip.dataset.adv;
        state.adv[k] = !state.adv[k];
        setFocus("filters");
        search1Window.forceRender();
        return;
      }
      if (chip.dataset.src) {
        const k = chip.dataset.src;
        state.sources[k] = !state.sources[k];
        setFocus("sources");
        search1Window.forceRender();
        return;
      }
    }

    const hitem = target.closest(".search-hitem");
    if (hitem) {
      const idx = Number(hitem.dataset.hindex);
      const h = state.history[idx];
      if (h) {
        state.query = h.q;
        state.cursor = state.query.length;
        setFocus("query");
        search1Window.forceRender();
      }
    }
  });

  // typing listener for regular characters (keyboard gated)
  setupTypingListener();

  // cleanup ctrl detector too
  const prevCleanup = cleanupKeyboard;
  cleanupKeyboard = () => {
    if (prevCleanup) prevCleanup();
    cleanupCtrl();
  };
}

// =====================
// WINDOW
// =====================

function update() {
  state.blink = !state.blink;
}

const search1Window = createFUIWindow({
  id: "search-1",
  render,
  update,
  interval: { min: 420, max: 760 },
  defaultMode: "default",
});

// =====================
// PUBLIC
// =====================

export function startSearch1() {
  // warm run for visuals
  if (state.history.length === 0) runSearch("boot");
  search1Window.start();
  setTimeout(setupInteractions, 60);
}

export function stopSearch1() {
  search1Window.stop();
  if (cleanupKeyboard) cleanupKeyboard();
  if (cleanupClick) cleanupClick();
  if (cleanupTyping) cleanupTyping();

  cleanupKeyboard = null;
  cleanupClick = null;
  cleanupTyping = null;
}
