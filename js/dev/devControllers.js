import { startDevTerminal, stopDevTerminal } from "./devTerminal.js";
import { startDevLogs, stopDevLogs } from "./devLogs.js";
import { startDevEditor, stopDevEditor } from "./devEditor.js";
import { startDev1, stopDev1 } from "./dev1.js";

// =====================
// START/STOP
// =====================

function startDEV() {
  if (startDEV.__running) return;
  startDEV.__running = true;
  startDevTerminal();
  startDevLogs();
  startDevEditor();
  startDev1();
}

function stopDEV() {
  if (!startDEV.__running) return;
  startDEV.__running = false;
  stopDevTerminal();
  stopDevLogs();
  stopDevEditor();
  stopDev1();
}

// =====================
// TAB CHANGE HANDLER
// =====================

document.addEventListener("tabChanged", (e) => {
  const tab = e.detail;

  if (tab === "6dev") {
    startDEV();
  } else {
    stopDEV();
  }
});

// =====================
// INITIAL LOAD
// =====================

const currentTab = document.querySelector("[data-tab].active");
if (currentTab && currentTab.dataset.tab === "6dev") {
  setTimeout(startDEV, 100);
}
