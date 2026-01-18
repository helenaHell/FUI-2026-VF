import { startMainIntel, stopMainIntel } from "./mainIntel.js";
import { startMainOps, stopMainOps } from "./mainOps.js";
import { startMainComms, stopMainComms } from "./mainComms.js";
import { startMainNetwork, stopMainNetwork } from "./mainNetwork.js";

// =====================
// START/STOP
// =====================

function startMAIN() {
  startMainIntel();
  startMainOps();
  startMainComms();
  startMainNetwork();
}

function stopMAIN() {
  stopMainIntel();
  stopMainOps();
  stopMainComms();
  stopMainNetwork();
}

// =====================
// TAB CHANGE HANDLER
// =====================

document.addEventListener("tabChanged", (e) => {
  const tab = e.detail;

  if (tab === "1main") {
    startMAIN();
  } else {
    stopMAIN();
  }
});

// =====================
// INITIAL LOAD
// =====================

const currentTab = document.querySelector("[data-tab].active");
if (currentTab && currentTab.dataset.tab === "1main") {
  setTimeout(startMAIN, 100);
}
