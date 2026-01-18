import { createFUIWindow } from "../core/template.js";

// ============================================
// MISC-1: HASH/UUID GENERATOR + HEX CONVERTER
// ============================================

const state = {
  // Hash/UUID Generator
  hashInput: "WikiLeaks.org",
  algorithms: ["MD5", "SHA-1", "SHA-256", "UUID"],
  selectedAlgo: 0,
  generatedHashes: [],

  // Hex Converter
  hexInput: "FF",
  decValue: 255,
  binValue: "11111111",
  convertMode: "hex", // hex, dec, bin
  conversionHistory: [],

  // UI State
  activePanel: "hash", // hash, converter
  lastUpdate: Date.now(),
};

// ============================================
// HASH GENERATORS (FAKE BUT REALISTIC)
// ============================================

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

// ============================================
// HEX CONVERTER LOGIC
// ============================================

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
        hex = value.toUpperCase();
        dec = hexToDec(hex);
        bin = hexToBin(hex);
        break;
      case "dec":
        dec = parseInt(value, 10);
        hex = decToHex(dec);
        bin = decToBin(dec);
        break;
      case "bin":
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

// ============================================
// RENDER FUNCTION
// ============================================

function render(mode) {
  const ts = new Date().toISOString().substring(11, 19);

  return `
    <div class="fui-misc-1">
      <!-- HEADER -->
      <div class="fui-header">
        <span class="fui-header-title">MISC TOOLS</span>
        <span class="fui-header-time">${ts}</span>
      </div>

      <!-- MAIN GRID -->
      <div class="fui-misc-grid">

        <!-- LEFT PANEL: HASH/UUID GENERATOR -->
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
            <!-- Input Section -->
            <div class="fui-input-section">
              <div class="fui-label">INPUT STRING:</div>
              <div class="fui-input-display">${
                state.hashInput || "[empty]"
              }</div>
            </div>

            <!-- Algorithm Selection -->
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

            <!-- Generated Hash -->
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

            <!-- History -->
            <div class="fui-history-section">
              <div class="fui-label">HISTORY (${
                state.generatedHashes.length
              }/10):</div>
              <div class="fui-history-list">
                ${
                  state.generatedHashes
                    .slice(-5)
                    .reverse()
                    .map(
                      (entry, i) => `
                  <div class="fui-history-item" data-history-index="${
                    state.generatedHashes.length - 1 - i
                  }">
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

            <!-- Actions -->
            <div class="fui-actions">
              <div class="fui-action-hint">[ENTER] Generate  [TAB] Switch Panel  [1-4] Select Algo</div>
            </div>
          </div>
        </div>

        <!-- RIGHT PANEL: HEX CONVERTER -->
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
            <!-- Conversion Display -->
            <div class="fui-conversion-display">
              <div class="fui-conv-row ${
                state.convertMode === "hex" ? "active" : ""
              }" data-mode="hex">
                <span class="fui-conv-label">HEX:</span>
                <span class="fui-conv-value">0x${state.hexInput || "00"}</span>
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

            <!-- Quick Conversions -->
            <div class="fui-quick-section">
              <div class="fui-label">COMMON VALUES:</div>
              <div class="fui-quick-list">
                <div class="fui-quick-item" data-quick="255">0xFF (255)</div>
                <div class="fui-quick-item" data-quick="65535">0xFFFF (65535)</div>
                <div class="fui-quick-item" data-quick="4095">0xFFF (4095)</div>
                <div class="fui-quick-item" data-quick="16777215">0xFFFFFF (16777215)</div>
              </div>
            </div>

            <!-- Conversion History -->
            <div class="fui-conv-history">
              <div class="fui-label">RECENT CONVERSIONS:</div>
              <div class="fui-conv-history-list">
                ${
                  state.conversionHistory
                    .slice(-4)
                    .reverse()
                    .map(
                      (entry, i) => `
                  <div class="fui-conv-history-item">
                    <span class="fui-conv-time">${entry.time}</span>
                    <span class="fui-conv-detail">
                      ${entry.from} → HEX:${entry.hex} DEC:${entry.dec}
                    </span>
                  </div>
                `,
                    )
                    .join("") ||
                  '<div class="fui-empty">No conversions yet</div>'
                }
              </div>
            </div>

            <!-- Actions -->
            <div class="fui-actions">
              <div class="fui-action-hint">[TAB] Switch Panel  [H/D/B] Select Mode  [CLICK] Quick Convert</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  `;
}

// ============================================
// UPDATE FUNCTION
// ============================================

function update() {
  state.lastUpdate = Date.now();
}

// ============================================
// INTERACTIONS
// ============================================

import { setupKeyboardHandler, setupClickHandler } from "../core/utils.js";

let cleanupKeyboard = null;
let cleanupClick = null;

function setupInteractions() {
  if (cleanupKeyboard) cleanupKeyboard();
  if (cleanupClick) cleanupClick();

  cleanupKeyboard = setupKeyboardHandler("search-1", {
    Tab: (e) => {
      state.activePanel = state.activePanel === "hash" ? "converter" : "hash";
      miscWindow.forceRender();
    },
    Enter: (e) => {
      if (state.activePanel === "hash") {
        const algo = state.algorithms[state.selectedAlgo];
        const hash = generateHash(state.hashInput, algo);
        const time = new Date().toLocaleTimeString("en-US", { hour12: false });
        state.generatedHashes.push({ hash, algo, time });
        if (state.generatedHashes.length > 10) {
          state.generatedHashes.shift();
        }
        miscWindow.forceRender();
      }
    },
    Digit1: () => {
      if (state.activePanel === "hash") {
        state.selectedAlgo = 0;
        miscWindow.forceRender();
      }
    },
    Digit2: () => {
      if (state.activePanel === "hash") {
        state.selectedAlgo = 1;
        miscWindow.forceRender();
      }
    },
    Digit3: () => {
      if (state.activePanel === "hash") {
        state.selectedAlgo = 2;
        miscWindow.forceRender();
      }
    },
    Digit4: () => {
      if (state.activePanel === "hash") {
        state.selectedAlgo = 3;
        miscWindow.forceRender();
      }
    },
    KeyH: () => {
      if (state.activePanel === "converter") {
        state.convertMode = "hex";
        miscWindow.forceRender();
      }
    },
    KeyD: () => {
      if (state.activePanel === "converter") {
        state.convertMode = "dec";
        miscWindow.forceRender();
      }
    },
    KeyB: () => {
      if (state.activePanel === "converter") {
        state.convertMode = "bin";
        miscWindow.forceRender();
      }
    },
  });

  cleanupClick = setupClickHandler("search-1", "*", (e, target) => {
    const algoItem = target.closest(".fui-algo-item");
    if (algoItem) {
      const index = parseInt(algoItem.dataset.algoIndex);
      state.selectedAlgo = index;
      miscWindow.forceRender();
      return;
    }

    const panel = target.closest(".fui-misc-panel");
    if (panel) {
      state.activePanel = panel.dataset.panel;
      miscWindow.forceRender();
      return;
    }

    const quickItem = target.closest(".fui-quick-item");
    if (quickItem) {
      const value = parseInt(quickItem.dataset.quick);
      const result = convertValue(value.toString(), "dec");

      if (result) {
        state.hexInput = result.hex;
        state.decValue = result.dec;
        state.binValue = result.bin;

        const time = new Date().toLocaleTimeString("en-US", { hour12: false });
        state.conversionHistory.push({
          time,
          from: `DEC:${value}`,
          hex: result.hex,
          dec: result.dec,
        });

        if (state.conversionHistory.length > 10) {
          state.conversionHistory.shift();
        }

        miscWindow.forceRender();
      }
      return;
    }

    const modeRow = target.closest(".fui-conv-row");
    if (modeRow) {
      state.convertMode = modeRow.dataset.mode;
      miscWindow.forceRender();
      return;
    }
  });
}

// ============================================
// INITIALIZATION
// ============================================

const miscWindow = createFUIWindow({
  id: "search-1",
  render,
  update,
  interval: null,
  defaultMode: "large",
  autoRender: true,
});

export function startSearch1() {
  miscWindow.start();
  setTimeout(setupInteractions, 100);
}

export function stopSearch1() {
  miscWindow.stop();
  if (cleanupKeyboard) cleanupKeyboard();
  if (cleanupClick) cleanupClick();
}
