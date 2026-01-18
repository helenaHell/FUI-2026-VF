import { startCode1, stopCode1 } from "./code1.js";
import { startCode2, stopCode2 } from "./code2.js";

// =====================
// START/STOP
// =====================

function startCODE() {
  startCode1();
  startCode2();
}

function stopCODE() {
  stopCode1();
  stopCode2();
}

// =====================
// TAB CHANGE HANDLER
// =====================

document.addEventListener("tabChanged", (e) => {
  const tab = e.detail;

  if (tab === "2code") {
    startCODE();
  } else {
    stopCODE();
  }
});

// =====================
// INITIAL LOAD
// =====================

const currentTab = document.querySelector("[data-tab].active");
if (currentTab && currentTab.dataset.tab === "2code") {
  setTimeout(startCODE, 100);
}
