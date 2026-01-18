import { startIRCStats, stopIRCStats } from "./ircStats.js";
import {
  startIrcInterfaceStatus,
  stopIrcInterfaceStatus,
} from "./ircInterfaceStatus.js";
import { startIRCChat, stopIRCChat } from "./ircChat.js";
import { startIRCTwitter, stopIRCTwitter } from "./ircTwitter.js";

function startIRC() {
  startIRCStats();
  startIRCChat();
  startIrcInterfaceStatus();
  startIRCTwitter();
}

function stopIRC() {
  stopIRCStats();
  stopIRCChat();
  stopIrcInterfaceStatus();
  stopIRCTwitter();
}

document.addEventListener("tabChanged", (e) => {
  const tab = e.detail;

  if (tab === "4irc") {
    startIRC();
  } else {
    stopIRC();
  }
});

const currentTab = document.querySelector("[data-tab].active");
if (currentTab && currentTab.dataset.tab === "4irc") {
  setTimeout(startIRC, 100);
}
