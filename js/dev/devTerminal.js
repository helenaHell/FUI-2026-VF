import { createFUIWindow } from "../core/template.js";

/* =====================
   STATE
===================== */

const commandHistory = [
  ">",
  ">",
  "> Welcome",
  ">",
  "> This is the Terminal",
  ">",
  "> Type commands here...",
  ">",
];

const hexLines = [];
const MAX_HEX_LINES = 50;

let generatedHexCount = 0;
let hexGenerationComplete = false;
let hexStreamPaused = false;

let currentCommand = "";
let cursorVisible = true;
let selectedHexIndex = -1;
let footerExpanded = false;

let cursorInterval = null;
let footerInterval = null;

/* =====================
   FOOTER DATA
===================== */

const footerData = {
  top: [
    { label: "Mount:", value: "/platform loaded" },
    { label: "dbsync:", value: "records queued: 1249" },
    { label: "worker:", value: "job[1234] started" },
  ],
  bottom: [
    { label: "sys:", value: "uptime 142h 34m" },
    { label: "mem:", value: "8.2/16GB (51%)" },
    { label: "net:", value: "rx 2.4GB tx 1.8GB" },
    { label: "cpu:", value: "load 0.45 0.52 0.48" },
  ],
};

/* =====================
   HEX GENERATION
===================== */

function generateHexCode() {
  const chars = "0123456789abcdef";
  let out = "0x";
  for (let i = 0; i < 6; i++) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out + "UI,";
}

function generateHexLine() {
  return `${generateHexCode()}  ${generateHexCode()}  ${generateHexCode()}  ${generateHexCode()}`;
}

function renderHexLineElement(line, index) {
  const div = document.createElement("div");
  div.dataset.index = index;

  if (line.isParagraph) {
    div.className = "hex-line hex-break";
    div.textContent = "";
    return div;
  }

  div.className = `hex-line ${line.cleared ? "cleared" : ""}`;

  div.textContent = line.cleared
    ? line.content.replace(/0x[0-9a-f]{6}/gi, "0x______")
    : line.content;

  return div;
}

function addHexLineDOM() {
  if (hexStreamPaused || hexGenerationComplete) return;

  const wrapper = document.querySelector("#dev-terminal .hex-scroll-wrapper");
  if (!wrapper) return;

  const line = {
    content: generateHexLine(),
    cleared: false,
    isParagraph: false,
  };

  hexLines.push(line);
  generatedHexCount++;

  wrapper.appendChild(renderHexLineElement(line, hexLines.length - 1));

  if (generatedHexCount % 10 === 0 && generatedHexCount < MAX_HEX_LINES) {
    const p = {
      content: "",
      cleared: true,
      isParagraph: true,
    };
    hexLines.push(p);

    const el = renderHexLineElement(p, hexLines.length - 1);
    el.textContent = "";
    el.style.pointerEvents = "none";

    wrapper.appendChild(el);
  }

  if (generatedHexCount >= MAX_HEX_LINES) {
    hexGenerationComplete = true;
    wrapper.style.overflowY = "auto";
  }

  updateHexStatus();
}
function renderFooter() {
  const top = footerData.top
    .map((i) => `<span><b>${i.label}</b> ${i.value}</span>`)
    .join(" | ");

  const bottom = footerData.bottom
    .map((i) => `<span><b>${i.label}</b> ${i.value}</span>`)
    .join(" | ");

  return `
    <div class="term-footer-top">${top}</div>
    <div class="term-footer-bottom">${bottom}</div>
  `;
}
/* =====================
   COMMANDS
===================== */

function executeCommand(cmd) {
  const t = cmd.trim().toLowerCase();

  if (t === "help") {
    return [
      "> Available commands:",
      "> clear / pause / resume / scan / status / help",
    ];
  }

  if (t === "clear") {
    hexLines.length = 0;
    generatedHexCount = 0;
    hexGenerationComplete = false;

    const w = document.querySelector("#dev-terminal .hex-scroll-wrapper");
    if (w) {
      w.innerHTML = "";
      w.style.overflowY = "hidden";
    }
    return ["> Hex stream cleared"];
  }

  if (t === "pause") {
    hexStreamPaused = true;
    updateHexStatus();
    return ["> Hex stream paused"];
  }

  if (t === "resume") {
    hexStreamPaused = false;
    updateHexStatus();
    return ["> Hex stream resumed"];
  }

  if (t === "scan") {
    return [
      "> initializing deep scan...",
      "> entropy spike detected",
      "> scan complete: NO THREAT FOUND",
    ];
  }

  if (t === "status") {
    return [
      `> hex-stream: ${
        hexStreamPaused
          ? "PAUSED"
          : hexGenerationComplete
            ? "COMPLETE"
            : "ACTIVE"
      }`,
      `> generated: ${generatedHexCount}/${MAX_HEX_LINES}`,
    ];
  }

  if (t === "" && hexGenerationComplete) {
    clearNextHex();
    return [];
  }

  return [`> Unknown command: ${cmd}`];
}

function clearNextHex() {
  const index = hexLines.findIndex((l) => !l.cleared && !l.isParagraph);
  if (index === -1) return;

  hexLines[index].cleared = true;

  const el = document.querySelectorAll("#dev-terminal .hex-line")[index];

  if (el) {
    el.textContent = hexLines[index].content.replace(
      /0x[0-9a-f]{6}/gi,
      "0x______",
    );
    el.classList.add("clearing", "cleared");
    setTimeout(() => el.classList.remove("clearing"), 300);
  }
}

/* =====================
   UI UPDATES
===================== */

function updateCommandInput() {
  const el = document.querySelector("#dev-terminal .term-input");
  if (el) el.textContent = currentCommand;
}

function updateTerminalSection() {
  const wrapper = document.querySelector("#dev-terminal .term-scroll-wrapper");
  if (!wrapper) return;

  wrapper.innerHTML = `
    ${commandHistory.map((l) => `<div class="term-line">${l}</div>`).join("")}
    <div class="term-line term-current">
      <span class="term-prompt">&gt;</span>
      <span class="term-input">${currentCommand}</span>
      <span class="cursor-blink ${cursorVisible ? "visible" : ""}">█</span>
    </div>
  `;
}

function updateHexStatus() {
  const el = document.querySelector("#dev-terminal .hex-status");
  if (!el) return;

  el.innerHTML = `
    <span>${
      hexStreamPaused
        ? "⏸ PAUSED"
        : hexGenerationComplete
          ? "✓ COMPLETE"
          : "▶ ACTIVE"
    }</span>
    <span class="hex-count">${generatedHexCount}/${MAX_HEX_LINES}</span>
  `;
}

/* =====================
   KEYBOARD (COMPATIBLE)
===================== */

function handleKeyboard(e) {
  const terminal = document.getElementById("dev-terminal");
  if (!terminal || !terminal.classList.contains("locked")) return;

  if (e.key === "Enter") {
    e.preventDefault();
    const results = executeCommand(currentCommand);
    if (currentCommand.trim()) {
      commandHistory.push(`> ${currentCommand}`);
    }
    results.forEach((l) => commandHistory.push(l));
    while (commandHistory.length > 30) commandHistory.shift();
    currentCommand = "";
    updateTerminalSection();
  } else if (e.key === "Backspace") {
    e.preventDefault();
    currentCommand = currentCommand.slice(0, -1);
    updateCommandInput();
  } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
    e.preventDefault();
    currentCommand += e.key;
    updateCommandInput();
  } else if (e.key === "ArrowUp" && hexGenerationComplete) {
    e.preventDefault();
    selectedHexIndex = Math.max(0, selectedHexIndex - 1);
    highlightHexLine();
  } else if (e.key === "ArrowDown" && hexGenerationComplete) {
    e.preventDefault();
    selectedHexIndex = Math.min(hexLines.length - 1, selectedHexIndex + 1);
    highlightHexLine();
  }
}

function highlightHexLine() {
  const lines = document.querySelectorAll("#dev-terminal .hex-line");

  lines.forEach((el, i) => {
    const line = hexLines[i];
    if (line?.isParagraph) {
      el.classList.remove("highlighted");
      return;
    }
    el.classList.toggle("highlighted", i === selectedHexIndex);
  });
}

/* =====================
   CURSOR & FOOTER
===================== */

function startCursorBlink() {
  if (cursorInterval) clearInterval(cursorInterval);
  cursorInterval = setInterval(() => {
    cursorVisible = !cursorVisible;
    const el = document.querySelector("#dev-terminal .cursor-blink");
    if (el) el.classList.toggle("visible", cursorVisible);
  }, 530);
}

function startFooterDynamics() {
  if (footerInterval) clearInterval(footerInterval);
  footerInterval = setInterval(() => {
    footerData.bottom[0].value = `uptime ${Math.floor(Math.random() * 300)}h`;
    updateFooter();
  }, 1500);
}

function updateFooter() {
  const el = document.querySelector("#dev-terminal .term-footer");
  if (!el) return;
  el.innerHTML = renderFooter();
}
/* =====================
   RENDER
===================== */

function render() {
  return `
    <div class="dev-terminal-container">
      <div class="term-input-section">
        <div class="term-scroll-wrapper"></div>
      </div>
      <div class="term-hex-section">
        <div class="hex-status"></div>
        <div class="hex-scroll-wrapper" style="overflow-y:hidden;"></div>
      </div>
      <div class="term-footer">
        ${renderFooter()}
      </div>
    </div>
  `;
}

/* =====================
   FUI WINDOW
===================== */

export const devTerminalWindow = createFUIWindow({
  id: "dev-terminal",
  render,
  update: addHexLineDOM,
  interval: 100,
  autoRender: false,
});

/* =====================
   PUBLIC API
===================== */

export function startDevTerminal() {
  document.addEventListener("keydown", handleKeyboard);
  startCursorBlink();
  startFooterDynamics();
  devTerminalWindow.start();
}

export function stopDevTerminal() {
  document.removeEventListener("keydown", handleKeyboard);
  if (cursorInterval) clearInterval(cursorInterval);
  if (footerInterval) clearInterval(footerInterval);
  devTerminalWindow.stop();
}
