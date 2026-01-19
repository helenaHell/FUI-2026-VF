import { createFUIWindow } from "../core/template.js";
import {
  setupKeyboardHandler,
  setupClickHandler,
  isWindowActive,
} from "../core/utils.js";

/* =========================================================
  SEARCH-3 — INSPECTOR (ALT / Film style)
  - Click: toujours autorisé
  - Keyboard: uniquement si fenêtre active
  - Reçoit items via events:
      "search:select"  -> affiche preview/meta/links
      "search:open"    -> idem + flash (optionnel)
  - Actions:
      [C] copy entity
      [A] add casefile
      [D] dns lookup (fake)
      [L] pivot -> dispatch "search:pivot" {query: ...}
========================================================= */

const TABS = ["PREVIEW", "META", "LINKS"];

const state = {
  item: null,
  tab: "PREVIEW",
  selectedEntity: null,
  casefile: [],
  dns: null,
  flash: 0,
  blink: true,
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
function escapeHtml(s) {
  return (s || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}
function clamp(n, a, b) {
  return Math.max(a, Math.min(b, n));
}

function fakeSha256() {
  const hex = "0123456789abcdef";
  let out = "";
  for (let i = 0; i < 64; i++)
    out += hex[Math.floor(Math.random() * hex.length)];
  return out.toUpperCase();
}

function extractEntities(item) {
  const e = item && item.entities ? item.entities : {};
  const domains = e.domains || [];
  const emails = e.emails || [];
  const ips = e.ips || [];
  const hashes = e.hashes || [];
  const urls = e.urls || [];

  const all = [
    ...emails.map((v) => ({ kind: "email", value: v })),
    ...domains.map((v) => ({ kind: "domain", value: v })),
    ...ips.map((v) => ({ kind: "ip", value: v })),
    ...hashes.map((v) => ({ kind: "hash", value: v })),
    ...urls.map((v) => ({ kind: "url", value: v })),
  ];

  return { domains, emails, ips, hashes, urls, all };
}

function setItem(item, flash = false) {
  state.item = item || null;
  state.selectedEntity = null;
  state.dns = null;
  if (flash) state.flash = 6;

  // auto tab if no item
  if (!state.item) state.tab = "PREVIEW";

  // select first entity if exists
  if (state.item) {
    const ent = extractEntities(state.item);
    if (ent.all.length > 0) state.selectedEntity = ent.all[0];
  }
}

async function copyToClipboard(text) {
  try {
    if (navigator && navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch (e) {}
  return false;
}

function addCasefile(item) {
  if (!item) return;
  const key = item.id;
  if (state.casefile.some((x) => x.id === key)) return;
  state.casefile.unshift({
    id: item.id,
    time: nowClock(),
    type: item.type,
    title: item.title,
    score: item.score,
  });
  if (state.casefile.length > 6) state.casefile.pop();
}

function doDnsLookup() {
  const ent = state.selectedEntity;
  if (!ent) return;

  // choose a target: domain or ip
  let target = null;
  if (ent.kind === "domain") target = ent.value;
  else if (ent.kind === "ip") target = ent.value;
  else {
    const ex = extractEntities(state.item);
    if (ex.domains[0]) target = ex.domains[0];
    else if (ex.ips[0]) target = ex.ips[0];
  }
  if (!target) return;

  // fake but believable
  const r = Math.random();
  const status = r < 0.12 ? "NXDOMAIN" : r < 0.22 ? "SERVFAIL" : "NOERROR";
  const ttl = Math.floor(120 + Math.random() * 2200);
  const a = `${Math.floor(80 + Math.random() * 90)}.${Math.floor(Math.random() * 255)}.${Math.floor(
    Math.random() * 255,
  )}.${Math.floor(2 + Math.random() * 240)}`;

  state.dns = {
    at: nowClock(),
    target,
    status,
    ttl,
    a,
    ns: ["ns1.cache.net", "ns2.cache.net"][Math.random() < 0.5 ? 0 : 1],
  };
}

function pivotQuery() {
  const ent = state.selectedEntity;
  if (!ent) return;

  let q = null;
  if (ent.kind === "email") q = `from:${ent.value} OR to:${ent.value}`;
  if (ent.kind === "domain") q = `domain:${ent.value}`;
  if (ent.kind === "ip") q = `ip:${ent.value}`;
  if (ent.kind === "hash") q = `sha256:${ent.value.replace("…", "")}`;
  if (ent.kind === "url") q = `url:${ent.value}`;

  if (!q) return;

  document.dispatchEvent(
    new CustomEvent("search:pivot", { detail: { query: q } }),
  );
}

function renderTabs() {
  return `
    <div class="search3-tabs">
      ${TABS.map((t) => {
        const a = state.tab === t ? "active" : "";
        return `<div class="search3-tab ${a}" data-tab="${t}">[${t}]</div>`;
      }).join("")}
    </div>
  `;
}

function renderHeader() {
  const title = state.item ? state.item.title : "No selection";
  const type = state.item ? state.item.type : "--";
  const src = state.item ? state.item.source : "--";
  const time = state.item ? state.item.time : "--:--:--";
  const score = state.item ? `${state.item.score}%` : "--";

  const flash = state.flash > 0 ? "flash" : "";

  return `
    <div class="search3-head ${flash}">
      <div class="search3-title">INSPECTOR</div>
      <div class="search3-meta">
        <span class="k">TYPE</span><span class="v">[${escapeHtml(type)}]</span>
        <span class="k">SRC</span><span class="v">${escapeHtml(src)}</span>
        <span class="k">T</span><span class="v">${escapeHtml(time)}</span>
        <span class="k">SCORE</span><span class="v">${escapeHtml(score)}</span>
      </div>
      <div class="search3-sub">${escapeHtml(title).slice(0, 76)}${title.length > 76 ? "…" : ""}</div>
      ${renderTabs()}
    </div>
  `;
}

function renderPreview() {
  if (!state.item) {
    return `<div class="search3-empty">No item selected</div>`;
  }

  const flags = (state.item.flags || []).join(" ");
  const ent = extractEntities(state.item);

  return `
    <div class="search3-panel">
      <div class="search3-block">
        <div class="search3-block-title">SNIPPET</div>
        <div class="search3-snippet">${escapeHtml(state.item.snippet)}</div>
      </div>

      <div class="search3-block">
        <div class="search3-block-title">FLAGS</div>
        <div class="search3-flags">${escapeHtml(flags || ".")}</div>
      </div>

      <div class="search3-block">
        <div class="search3-block-title">ENTITIES</div>
        <div class="search3-entities">
          ${ent.all.length === 0 ? `<div class="search3-emptyline">No entities</div>` : ""}
          ${ent.all
            .slice(0, 10)
            .map((x) => {
              const sel =
                state.selectedEntity &&
                state.selectedEntity.kind === x.kind &&
                state.selectedEntity.value === x.value
                  ? "selected"
                  : "";
              return `
                <div class="search3-entity ${sel}" data-kind="${x.kind}" data-value="${escapeHtml(x.value)}">
                  <span class="k">${x.kind.toUpperCase()}</span>
                  <span class="v">${escapeHtml(x.value)}</span>
                </div>
              `;
            })
            .join("")}
        </div>
      </div>
    </div>
  `;
}

function renderMeta() {
  if (!state.item) return `<div class="search3-empty">No item selected</div>`;

  const sha = fakeSha256();
  const size = `${Math.floor(20 + Math.random() * 700)}KB`;
  const path =
    state.item.type === "MAIL"
      ? `/mailbox/${state.item.source}/${state.item.time}/thread.msg`
      : state.item.type === "DOC"
        ? `/vault/docs/${sha.slice(0, 8)}.pdf`
        : state.item.type === "FILE"
          ? `/files/staging/${sha.slice(0, 8)}.dat`
          : state.item.type === "URL"
            ? `/web/cache/${sha.slice(0, 8)}.html`
            : `/logs/${state.item.source}/${isoShort()}.log`;

  const owner = ["root", "vaultd", "indexd", "proxy", "audit"][
    Math.floor(Math.random() * 5)
  ];
  const created = isoShort();
  const modified = isoShort();

  return `
    <div class="search3-panel">
      <div class="search3-block">
        <div class="search3-block-title">METADATA</div>
        <div class="search3-kv">
          <div><span class="k">sha256</span><span class="v">${sha}</span></div>
          <div><span class="k">size</span><span class="v">${size}</span></div>
          <div><span class="k">path</span><span class="v">${escapeHtml(path)}</span></div>
          <div><span class="k">owner</span><span class="v">${owner}</span></div>
          <div><span class="k">created</span><span class="v">${created}</span></div>
          <div><span class="k">modified</span><span class="v">${modified}</span></div>
        </div>
      </div>

      <div class="search3-block">
        <div class="search3-block-title">DNS LOOKUP</div>
        ${
          state.dns
            ? `
              <div class="search3-kv">
                <div><span class="k">at</span><span class="v">${state.dns.at}</span></div>
                <div><span class="k">target</span><span class="v">${escapeHtml(state.dns.target)}</span></div>
                <div><span class="k">status</span><span class="v">${state.dns.status}</span></div>
                <div><span class="k">a</span><span class="v">${state.dns.a}</span></div>
                <div><span class="k">ttl</span><span class="v">${state.dns.ttl}</span></div>
                <div><span class="k">ns</span><span class="v">${state.dns.ns}</span></div>
              </div>
            `
            : `<div class="search3-emptyline">Select a DOMAIN/IP then press [D]</div>`
        }
      </div>

      <div class="search3-block">
        <div class="search3-block-title">CASEFILE</div>
        <div class="search3-case">
          ${
            state.casefile.length === 0
              ? `<div class="search3-emptyline">Empty</div>`
              : state.casefile
                  .map(
                    (x) => `
                    <div class="search3-caseitem">
                      <span class="t">${x.time}</span>
                      <span class="tp">[${x.type}]</span>
                      <span class="sc">${x.score}%</span>
                      <span class="tt">${escapeHtml(x.title).slice(0, 36)}${x.title.length > 36 ? "…" : ""}</span>
                    </div>
                  `,
                  )
                  .join("")
          }
        </div>
      </div>
    </div>
  `;
}

function isoShort() {
  const d = new Date();
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function renderLinks() {
  if (!state.item) return `<div class="search3-empty">No item selected</div>`;

  const ent = extractEntities(state.item);

  // Build "links" list from entities
  const links = [];
  ent.urls.forEach((u) => links.push({ kind: "url", value: u, hint: "open" }));
  ent.domains.forEach((d) =>
    links.push({ kind: "domain", value: d, hint: "pivot" }),
  );
  ent.emails.forEach((m) =>
    links.push({ kind: "email", value: m, hint: "pivot" }),
  );
  ent.ips.forEach((i) => links.push({ kind: "ip", value: i, hint: "pivot" }));
  ent.hashes.forEach((h) =>
    links.push({ kind: "hash", value: h, hint: "pivot" }),
  );

  return `
    <div class="search3-panel">
      <div class="search3-block">
        <div class="search3-block-title">LINK GRAPH</div>
        <div class="search3-linkhint">Click an entity to pivot. [L] pivot selected</div>
        <div class="search3-links">
          ${
            links.length === 0
              ? `<div class="search3-emptyline">No links</div>`
              : links
                  .slice(0, 14)
                  .map((x) => {
                    const sel =
                      state.selectedEntity &&
                      state.selectedEntity.kind === x.kind &&
                      state.selectedEntity.value === x.value
                        ? "selected"
                        : "";
                    return `
                      <div class="search3-link ${sel}" data-kind="${x.kind}" data-value="${escapeHtml(x.value)}">
                        <span class="k">${x.kind.toUpperCase()}</span>
                        <span class="v">${escapeHtml(x.value)}</span>
                        <span class="h">${x.hint}</span>
                      </div>
                    `;
                  })
                  .join("")
          }
        </div>
      </div>
    </div>
  `;
}

function renderActions() {
  const ent = state.selectedEntity;
  const entLabel = ent ? `${ent.kind}:${ent.value}` : "--";
  return `
    <div class="search3-foot">
      <span class="st">SEL ${escapeHtml(entLabel).slice(0, 44)}${entLabel.length > 44 ? "…" : ""}</span>
      <span>[←/→] tab</span>
      <span>[C] copy</span>
      <span>[A] case</span>
      <span>[D] dns</span>
      <span>[L] pivot</span>
      <span>[CLICK] select</span>
    </div>
  `;
}

function render() {
  return `
    <div class="fui-search-3">
      ${renderHeader()}
      <div class="search3-body">
        ${
          state.tab === "META"
            ? renderMeta()
            : state.tab === "LINKS"
              ? renderLinks()
              : renderPreview()
        }
      </div>
      ${renderActions()}
    </div>
  `;
}

function update() {
  state.blink = !state.blink;
  if (state.flash > 0) state.flash -= 1;
}

function selectEntity(kind, value) {
  if (!kind || !value) return;
  state.selectedEntity = { kind, value };
}

function nextTab(dir) {
  const idx = TABS.indexOf(state.tab);
  const next = TABS[(idx + dir + TABS.length) % TABS.length];
  state.tab = next;
}

function setupInteractions() {
  if (cleanupKeyboard) cleanupKeyboard();
  if (cleanupClick) cleanupClick();
  if (cleanupEvents) cleanupEvents();

  // Keyboard (gated)
  cleanupKeyboard = setupKeyboardHandler("search-3", {
    ArrowLeft: () => {
      if (!isWindowActive("search-3")) return;
      nextTab(-1);
      search3Window.forceRender();
    },
    ArrowRight: () => {
      if (!isWindowActive("search-3")) return;
      nextTab(1);
      search3Window.forceRender();
    },
    KeyC: async () => {
      if (!isWindowActive("search-3")) return;
      if (!state.selectedEntity) return;
      const ok = await copyToClipboard(state.selectedEntity.value);
      if (ok) {
        state.flash = 6;
        search3Window.forceRender();
      }
    },
    KeyA: () => {
      if (!isWindowActive("search-3")) return;
      if (!state.item) return;
      addCasefile(state.item);
      search3Window.forceRender();
    },
    KeyD: () => {
      if (!isWindowActive("search-3")) return;
      doDnsLookup();
      state.tab = "META";
      search3Window.forceRender();
    },
    KeyL: () => {
      if (!isWindowActive("search-3")) return;
      pivotQuery();
      state.flash = 6;
      search3Window.forceRender();
    },
    Escape: () => {
      if (!isWindowActive("search-3")) return;
      state.selectedEntity = null;
      state.dns = null;
      search3Window.forceRender();
    },
  });

  // Clicks (always allowed)
  cleanupClick = setupClickHandler("search-3", "*", (e, target) => {
    const tab = target.closest("[data-tab]");
    if (tab) {
      state.tab = tab.dataset.tab;
      search3Window.forceRender();
      return;
    }

    const ent = target.closest("[data-kind][data-value]");
    if (ent) {
      selectEntity(ent.dataset.kind, ent.dataset.value);
      search3Window.forceRender();

      // double click -> pivot
      if (e.detail === 2) {
        pivotQuery();
        state.flash = 6;
        search3Window.forceRender();
      }
      return;
    }
  });

  // Events from SEARCH-2
  const onSelect = (ev) => {
    if (!ev || !ev.detail) return;
    setItem(ev.detail, false);
    search3Window.forceRender();
  };
  const onOpen = (ev) => {
    if (!ev || !ev.detail) return;
    setItem(ev.detail, true);
    search3Window.forceRender();
  };

  document.addEventListener("search:select", onSelect);
  document.addEventListener("search:open", onOpen);

  cleanupEvents = () => {
    document.removeEventListener("search:select", onSelect);
    document.removeEventListener("search:open", onOpen);
  };
}

const search3Window = createFUIWindow({
  id: "search-3",
  render,
  update,
  interval: { min: 600, max: 980 },
  defaultMode: "default",
});

export function startSearch3() {
  search3Window.start();
  setTimeout(setupInteractions, 60);
}

export function stopSearch3() {
  search3Window.stop();
  if (cleanupKeyboard) cleanupKeyboard();
  if (cleanupClick) cleanupClick();
  if (cleanupEvents) cleanupEvents();
  cleanupKeyboard = null;
  cleanupClick = null;
  cleanupEvents = null;
}
