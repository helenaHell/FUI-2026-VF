import { startSearch1, stopSearch1 } from "./search1.js";
import { startSearch2, stopSearch2 } from "./search2.js";
import { startSearch3, stopSearch3 } from "./search3.js";

function startSEARCH() {
  startSearch1();
  startSearch2();
  startSearch3();
}

function stopSEARCH() {
  stopSearch1();
  stopSearch2();
  stopSearch3();
}

document.addEventListener("tabChanged", (e) => {
  const tab = e.detail;

  if (tab === "5search") {
    startSEARCH();
  } else {
    stopSEARCH();
  }
});

const currentTab = document.querySelector("[data-tab].active");
if (currentTab && currentTab.dataset.tab === "5search") {
  setTimeout(startSEARCH, 100);
}
