import { startMisc1, stopMisc1 } from "./misc1.js";
import { startMisc2, stopMisc2 } from "./misc2.js";

// =====================
// START/STOP
// =====================

function startMISC() {
  startMisc1();
  startMisc2();
}

function stopMISC() {
  stopMisc1();
  stopMisc2();
}

// =====================
// TAB CHANGE HANDLER
// =====================

document.addEventListener("tabChanged", (e) => {
  const tab = e.detail;

  if (tab === "7misc") {
    startMISC();
  } else {
    stopMISC();
  }
});

// =====================
// INITIAL LOAD
// =====================

const currentTab = document.querySelector("[data-tab].active");
if (currentTab && currentTab.dataset.tab === "7misc") {
  setTimeout(startMISC, 100);
}
