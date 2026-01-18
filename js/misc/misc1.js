import { createFUIWindow } from "../core/template.js";
import {
  setupKeyboardHandler,
  setupClickHandler,
  isWindowActive,
} from "../core/utils.js";

// =====================
// STATE
// =====================

const state = {
  // Hash
  hashInput: "WikiLeaks.org",
  algorithms: ["MD5", "SHA-1", "SHA-256", "UUID"],
  selectedAlgo: 0,
  generatedHashes: [],

  // Converter (raw inputs)
  hexInput: "FF",
  decInput: "255",
  binInput: "11111111",

  // Converter (computed)
  decValue: 255,
  binValue: "11111111",

  convertMode: "hex", // hex | dec | bin
  conversionHistory: [],

  activePanel: "hash", // hash | converter
};

// =====================
// HASH GENERATORS
// =====================

function generateMD5(text) {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = (hash << 5) - hash + text.charCodeAt(i);
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16).padStart(32, "0").substring(0, 32);
}

function generateSHA1(text) {
  let hash = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash +=
      (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  return Math.abs(hash).toString(16).padStart(40, "0").substring(0, 40);
}

function generateSHA256(text) {
  let hash = 0x6a09e667;
  for (let i = 0; i < text.length; i++) {
    hash = (hash << 5) - hash + text.charCodeAt(i);
    hash = hash & hash;
  }
  const hash2 = Math.abs(hash * 31 + text.length);
  return (
    hash.toString(16).padStart(32, "0") + hash2.toString(16).padStart(32, "0")
  ).substring(0, 64);
}

function generateUUID() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function generateHash(text, algo) {
  switch (algo) {
    case "MD5":
      return generateMD5(text);
    case "SHA-1":
      return generateSHA1(text);
    case "SHA-256":
      return generateSHA256(text);
    case "UUID":
      return generateUUID();
    default:
      return "";
  }
}

// =====================
// HEX CONVERTER
// =====================

function hexToDec(hex) {
  return parseInt(hex, 16);
}

function hexToBin(hex) {
  return parseInt(hex, 16)
    .toString(2)
    .padStart(hex.length * 4, "0");
}

function decToHex(dec) {
  return parseInt(dec, 10).toString(16).toUpperCase();
}

function decToBin(dec) {
  return parseInt(dec, 10).toString(2);
}

function binToHex(bin) {
  return parseInt(bin, 2).toString(16).toUpperCase();
}

function binToDec(bin) {
  return parseInt(bin, 2);
}

function convertValue(value, fromMode) {
  try {
    let hex, dec, bin;

    switch (fromMode) {
      case "hex":
        hex = (value || "").toUpperCase().replace(/^0X/, "");
        if (hex === "") hex = "0";
        dec = hexToDec(hex);
        bin = hexToBin(hex);
        break;

      case "dec":
        if (value === "") value = "0";
        dec = parseInt(value, 10);
        hex = decToHex(dec);
        bin = decToBin(dec);
        break;

      case "bin":
        if (value === "") value = "0";
        bin = value;
        dec = binToDec(bin);
        hex = binToHex(bin);
        break;
    }

    if (isNaN(dec)) return null;
    return { hex, dec, bin };
  } catch (e) {
    return null;
  }
}

function syncConverterFrom(mode) {
  const raw =
    mode === "hex"
      ? state.hexInput
      : mode === "dec"
        ? state.decInput
        : state.binInput;

  const result = convertValue(raw || "0", mode);
  if (!result) return false;

  state.hexInput = result.hex;
  state.decValue = result.dec;
  state.decInput = String(result.dec);
  state.binValue = result.bin;
  state.binInput = result.bin;

  return true;
}

// =====================
// RENDER
// =====================

function render() {
  const ts = new Date().toISOString().substring(11, 19);

  return `
    <div class="fui-misc-1">
      <div class="fui-header">
        <span class="fui-header-title">MISC TOOLS</span>
        <span class="fui-header-time">${ts}</span>
      </div>

      <div class="fui-misc-grid">
        <div class="fui-misc-panel ${
          state.activePanel === "hash" ? "active" : ""
        }" data-panel="hash">
          <div class="fui-panel-header">
            <span class="fui-indicator ${
              state.activePanel === "hash" ? "active" : ""
            }">●</span>
            HASH / UUID GENERATOR
          </div>
          
          <div class="fui-panel-content">
            <div class="fui-input-section">
              <div class="fui-label">INPUT STRING:</div>
              <div class="fui-input-display">${
                state.hashInput || "[empty]"
              }</div>
            </div>
            
            <div class="fui-algo-section">
              <div class="fui-label">ALGORITHM:</div>
              <div class="fui-algo-list">
                ${state.algorithms
                  .map(
                    (algo, i) => `
                  <div class="fui-algo-item ${
                    i === state.selectedAlgo ? "selected" : ""
                  }" data-algo-index="${i}">
                    <span class="fui-algo-bracket">[</span>${algo}<span class="fui-algo-bracket">]</span>
                  </div>
                `,
                  )
                  .join("")}
              </div>
            </div>
            
            <div class="fui-output-section">
              <div class="fui-label">OUTPUT:</div>
              <div class="fui-hash-output">
                ${
                  state.generatedHashes.length > 0
                    ? state.generatedHashes[state.generatedHashes.length - 1]
                        .hash
                    : "[generate hash]"
                }
              </div>
            </div>
            
            <div class="fui-history-section">
              <div class="fui-label">HISTORY (${state.generatedHashes.length}/10):</div>
              <div class="fui-history-list">
                ${
                  state.generatedHashes
                    .slice(-5)
                    .reverse()
                    .map(
                      (entry) => `
                  <div class="fui-history-item">
                    <span class="fui-history-time">${entry.time}</span>
                    <span class="fui-history-algo">[${entry.algo}]</span>
                    <span class="fui-history-hash">${entry.hash.substring(
                      0,
                      24,
                    )}...</span>
                  </div>
                `,
                    )
                    .join("") || '<div class="fui-empty">No history</div>'
                }
              </div>
            </div>
            
            <div class="fui-actions">
              <div class="fui-action-hint">[TYPE] Edit  [ENTER] Generate  [TAB] Switch Panel  [1-4] Algo  [ESC] Clear</div>
            </div>
          </div>
        </div>
        
        <div class="fui-misc-panel ${
          state.activePanel === "converter" ? "active" : ""
        }" data-panel="converter">
          <div class="fui-panel-header">
            <span class="fui-indicator ${
              state.activePanel === "converter" ? "active" : ""
            }">●</span>
            BASE CONVERTER
          </div>
          
          <div class="fui-panel-content">
            <div class="fui-conversion-display">
              <div class="fui-conv-row ${
                state.convertMode === "hex" ? "active" : ""
              }" data-mode="hex">
                <span class="fui-conv-label">HEX:</span>
                <span class="fui-conv-value">0x${state.hexInput || "0"}</span>
              </div>
              <div class="fui-conv-row ${
                state.convertMode === "dec" ? "active" : ""
              }" data-mode="dec">
                <span class="fui-conv-label">DEC:</span>
                <span class="fui-conv-value">${state.decValue}</span>
              </div>
              <div class="fui-conv-row ${
                state.convertMode === "bin" ? "active" : ""
              }" data-mode="bin">
                <span class="fui-conv-label">BIN:</span>
                <span class="fui-conv-value">0b${state.binValue}</span>
              </div>
            </div>
            
            <div class="fui-quick-section">
              <div class="fui-label">COMMON VALUES:</div>
              <div class="fui-quick-list">
                <div class="fui-quick-item" data-quick="255">0xFF (255)</div>
                <div class="fui-quick-item" data-quick="65535">0xFFFF (65535)</div>
                <div class="fui-quick-item" data-quick="4095">0xFFF (4095)</div>
                <div class="fui-quick-item" data-quick="16777215">0xFFFFFF (16777215)</div>
              </div>
            </div>
            
            <div class="fui-conv-history">
              <div class="fui-label">RECENT CONVERSIONS:</div>
              <div class="fui-conv-history-list">
                ${
                  state.conversionHistory
                    .slice(-4)
                    .reverse()
                    .map(
                      (entry) => `
                  <div class="fui-conv-history-item">
                    <span class="fui-conv-time">${entry.time}</span>
                    <span class="fui-conv-detail">${entry.from} → HEX:${entry.hex} DEC:${entry.dec}</span>
                  </div>
                `,
                    )
                    .join("") ||
                  '<div class="fui-empty">No conversions yet</div>'
                }
              </div>
            </div>
            
            <div class="fui-actions">
              <div class="fui-action-hint">[TYPE] Edit  [ENTER] Commit  [H/D/B] Mode  [TAB] Switch  [CLICK] Quick  [ESC] Clear</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

// =====================
// INTERACTIONS
// =====================

let cleanupKeyboard = null;
let cleanupClick = null;
let cleanupType = null;

function commitConversion() {
  if (!syncConverterFrom(state.convertMode)) return;

  const time = new Date().toLocaleTimeString("en-US", { hour12: false });
  const fromRaw =
    state.convertMode === "hex"
      ? `HEX:${state.hexInput || ""}`
      : state.convertMode === "dec"
        ? `DEC:${state.decInput || ""}`
        : `BIN:${state.binInput || ""}`;

  state.conversionHistory.push({
    time,
    from: fromRaw,
    hex: state.hexInput,
    dec: state.decValue,
  });

  if (state.conversionHistory.length > 10) state.conversionHistory.shift();
}

function pushHashHistory(hash, algo) {
  const time = new Date().toLocaleTimeString("en-US", { hour12: false });
  state.generatedHashes.push({ hash, algo, time });
  if (state.generatedHashes.length > 10) state.generatedHashes.shift();
}

function handleTyping(e) {
  if (!isWindowActive("misc-1")) return;
  if (e.ctrlKey || e.metaKey || e.altKey) return;

  // IMPORTANT: ne pas "manger" les touches réservées qui sont gérées par setupKeyboardHandler
  const reserved = new Set([
    "Tab",
    "Enter",
    "Digit1",
    "Digit2",
    "Digit3",
    "Digit4",
    "KeyH",
    "KeyD",
    "KeyB",
  ]);
  if (reserved.has(e.code)) return;

  // Clear (esc)
  if (e.code === "Escape") {
    e.preventDefault();
    if (state.activePanel === "hash") {
      state.hashInput = "";
    } else {
      if (state.convertMode === "hex") state.hexInput = "";
      if (state.convertMode === "dec") state.decInput = "";
      if (state.convertMode === "bin") state.binInput = "";
      syncConverterFrom(state.convertMode);
    }
    misc1Window.forceRender();
    return;
  }

  // Backspace
  if (e.code === "Backspace") {
    e.preventDefault();

    if (state.activePanel === "hash") {
      state.hashInput = state.hashInput.slice(0, -1);
    } else {
      if (state.convertMode === "hex")
        state.hexInput = state.hexInput.slice(0, -1);
      if (state.convertMode === "dec")
        state.decInput = state.decInput.slice(0, -1);
      if (state.convertMode === "bin")
        state.binInput = state.binInput.slice(0, -1);

      syncConverterFrom(state.convertMode);
    }

    misc1Window.forceRender();
    return;
  }

  // Normal characters
  if (typeof e.key === "string" && e.key.length === 1) {
    // HASH: accepte tout (sauf que ça reste court)
    if (state.activePanel === "hash") {
      e.preventDefault();
      if (state.hashInput.length < 64) {
        state.hashInput += e.key;
        misc1Window.forceRender();
      }
      return;
    }

    // CONVERTER: filtre selon mode
    const ch = e.key;
    let ok = false;

    if (state.convertMode === "hex") {
      ok = /^[0-9a-fA-F]$/.test(ch);
      if (ok) state.hexInput = (state.hexInput + ch).toUpperCase();
    }

    if (state.convertMode === "dec") {
      ok = /^[0-9]$/.test(ch);
      if (ok) state.decInput = (state.decInput + ch).replace(/^0+(?=\d)/, "");
    }

    if (state.convertMode === "bin") {
      ok = /^[01]$/.test(ch);
      if (ok) state.binInput = state.binInput + ch;
    }

    if (ok) {
      e.preventDefault();
      syncConverterFrom(state.convertMode);
      misc1Window.forceRender();
    }
  }
}

function setupInteractions() {
  if (cleanupKeyboard) cleanupKeyboard();
  if (cleanupClick) cleanupClick();
  if (cleanupType) cleanupType();

  cleanupKeyboard = setupKeyboardHandler("misc-1", {
    Tab: () => {
      state.activePanel = state.activePanel === "hash" ? "converter" : "hash";
      misc1Window.forceRender();
    },

    Enter: () => {
      if (state.activePanel === "hash") {
        const algo = state.algorithms[state.selectedAlgo];
        const hash = generateHash(state.hashInput, algo);
        pushHashHistory(hash, algo);
        misc1Window.forceRender();
        return;
      }

      // converter
      commitConversion();
      misc1Window.forceRender();
    },

    Digit1: () => {
      if (state.activePanel === "hash" && state.algorithms.length > 0) {
        state.selectedAlgo = 0;
        misc1Window.forceRender();
      }
    },
    Digit2: () => {
      if (state.activePanel === "hash" && state.algorithms.length > 1) {
        state.selectedAlgo = 1;
        misc1Window.forceRender();
      }
    },
    Digit3: () => {
      if (state.activePanel === "hash" && state.algorithms.length > 2) {
        state.selectedAlgo = 2;
        misc1Window.forceRender();
      }
    },
    Digit4: () => {
      if (state.activePanel === "hash" && state.algorithms.length > 3) {
        state.selectedAlgo = 3;
        misc1Window.forceRender();
      }
    },

    KeyH: () => {
      if (state.activePanel === "converter") {
        state.convertMode = "hex";
        syncConverterFrom("hex");
        misc1Window.forceRender();
      }
    },
    KeyD: () => {
      if (state.activePanel === "converter") {
        state.convertMode = "dec";
        syncConverterFrom("dec");
        misc1Window.forceRender();
      }
    },
    KeyB: () => {
      if (state.activePanel === "converter") {
        state.convertMode = "bin";
        syncConverterFrom("bin");
        misc1Window.forceRender();
      }
    },
  });

  cleanupClick = setupClickHandler("misc-1", "*", (e, target) => {
    if (!isWindowActive("misc-1")) return;

    const panel = target.closest(".fui-misc-panel");
    if (panel) {
      state.activePanel = panel.dataset.panel;
      misc1Window.forceRender();
      return;
    }

    const algoItem = target.closest(".fui-algo-item");
    if (algoItem) {
      state.selectedAlgo = parseInt(algoItem.dataset.algoIndex, 10);
      state.activePanel = "hash";
      misc1Window.forceRender();
      return;
    }

    const modeRow = target.closest(".fui-conv-row");
    if (modeRow) {
      state.activePanel = "converter";
      state.convertMode = modeRow.dataset.mode;
      syncConverterFrom(state.convertMode);
      misc1Window.forceRender();
      return;
    }

    const quickItem = target.closest(".fui-quick-item");
    if (quickItem) {
      state.activePanel = "converter";
      state.convertMode = "dec";

      const value = String(parseInt(quickItem.dataset.quick, 10));
      state.decInput = value;
      syncConverterFrom("dec");
      commitConversion();

      misc1Window.forceRender();
      return;
    }

    // Click output: regen rapide (petit "film feel")
    const out = target.closest(".fui-hash-output");
    if (out) {
      state.activePanel = "hash";
      const algo = state.algorithms[state.selectedAlgo];
      const hash = generateHash(state.hashInput, algo);
      pushHashHistory(hash, algo);
      misc1Window.forceRender();
      return;
    }
  });
}

// =====================
// WINDOW INSTANCE
// =====================

const misc1Window = createFUIWindow({
  id: "misc-1",
  render,
  update: null,
  interval: null,
  defaultMode: "default",
});

// =====================
// PUBLIC API
// =====================

export function startMisc1() {
  // init convert computed once
  syncConverterFrom(state.convertMode);

  misc1Window.start();
  setTimeout(setupInteractions, 100);
}

export function stopMisc1() {
  misc1Window.stop();
  if (cleanupKeyboard) cleanupKeyboard();
  if (cleanupClick) cleanupClick();
  if (cleanupType) cleanupType();

  cleanupKeyboard = null;
  cleanupClick = null;
  cleanupType = null;
}
