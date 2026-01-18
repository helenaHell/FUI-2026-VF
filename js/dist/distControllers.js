import { startDISTMail, stopDISTMail } from "./distMail.js";
import { startDISTFiles, stopDISTFiles } from "./distFiles.js";
import { startDISTDocs, stopDISTDocs } from "./distDocs.js";
import { startDISTAddresses, stopDISTAddresses } from "./distAddresses.js";

// =====================
// SIMPLE START/STOP
// =====================

function startDIST() {
  startDISTMail();
  startDISTFiles();
  startDISTDocs();
  startDISTAddresses();
}

function stopDIST() {
  stopDISTMail();
  stopDISTFiles();
  stopDISTDocs();
  stopDISTAddresses();
}

// =====================
// TAB CHANGE HANDLER
// =====================

document.addEventListener("tabChanged", (e) => {
  const tab = e.detail;

  if (tab === "3dist") {
    startDIST();
  } else {
    stopDIST();
  }
});

// =====================
// INITIAL LOAD
// =====================

const currentTab = document.querySelector("[data-tab].active");
if (currentTab && currentTab.dataset.tab === "3dist") {
  // Petit délai pour s'assurer que le DOM est prêt
  setTimeout(startDIST, 100);
}
