import { createFUIWindow } from "../core/template.js";
import { isWindowActive } from "../core/utils.js";

/* =====================
   TAGS
===================== */

const messages = [
  "ddd>  hey you there ??",
  "jjj>  yeah.. you saw what happened ?",
  "ddd>  i think something big is going on",
  "jjj>  yeah.. press is acting weird",
  "ddd>  we should check on him",
  "jjj>  agreed, and let's start Leak#342 on stream now",
  "jjj>  People NEED to see this",
  "ddd>  okay, streaming.. are you ready ?",
  "jjj>  yeah, screen is live",
  "ddd>  omg, look at the traffic spike",
  "jjj>  insane.. already 12k watching",
  "ddd>  i can't believe this is happening",
  "jjj>  stay calm.. comments are blowing up",
  "ddd>  do you think they'll trace us ?",
  "jjj>  maybe.. we need to stay low",
  "ddd>  ok, keep the chat calm, no hype",
  "jjj>  too late.. people are panicking",
  "ddd>  did you see the msg from press ?",
  "jjj>  yeah.. ominous.. they know something",
  "ddd>  let's focus on the files, they're the proof",
  "jjj>  right.. Leak#342 details are crucial",
  "ddd>  we should mirror them in case they pull it",
  "jjj>  already done, synced to 3 nodes",
  "ddd>  good.. do we have the checksum ?",
  "jjj>  yup.. verified against the original",
  "ddd>  ok.. people are asking for a summary",
  "jjj>  let's drop a few key points, keep it factual",
  "ddd>  yeah.. no speculation, just evidence",
  "jjj>  i hate doing this live",
  "ddd>  me too.. but it’s necessary",
  "jjj>  okay, next part of the leak.. showing the logs",
  "ddd>  make sure sensitive info is blurred",
  "jjj>  already.. anonymized everything",
  "ddd>  look at the chat.. people are sharing theories",
  "jjj>  ignore it.. stay on track",
  "ddd>  do you think we’ll get a follow-up ?",
  "jjj>  maybe.. depends how this spreads",
  "ddd>  can we add the metadata too ?",
  "jjj>  yes.. full transparency, timestamps included",
  "ddd>  ok.. uploading final segment",
  "jjj>  done.. it's live everywhere now",
  "ddd>  people are reacting.. wow",
  "jjj>  yeah.. this is bigger than expected",
  "ddd>  we need to stay alert.. press might retaliate",
  "jjj>  agreed.. but at least the info is out",
  "ddd>  let's monitor all channels.. nothing should slip",
  "jjj>  already on it.. dashboards running",
  "ddd>  i feel like this is just the beginning",
  "jjj>  yeah.. we need a plan if things escalate",
  "ddd>  ok.. let's wrap this session for now",
  "jjj>  agree.. stay online but quiet",
  "ddd>  thanks.. couldn’t have done this without you",
  "jjj>  same.. be safe out there",
];

const state = {
  lines: [],
  input: "",
};

let currentMessageIndex = 0;

function generateFreenodeData() {
  const lag = (Math.random() * 0.998 + 0.001).toFixed(3); // 0.001 → 0.999
  const active = Math.floor(Math.random() * 30 + 1); // 1 → 30
  return { lag, active };
}

function updateMessages() {
  if (chatDirty) {
    chatDirty = false;
    ircChatWindow.forceRender();
    return;
  }

  state.lines.push(messages[currentMessageIndex]);
  currentMessageIndex = (currentMessageIndex + 1) % messages.length;
  if (state.lines.length > 8) state.lines.shift();
}

let chatDirty = false;

document.addEventListener("keydown", (e) => {
  if (!isWindowActive("irc-chat")) return;

  e.preventDefault();

  if (e.key === "Backspace") {
    state.input = state.input.slice(0, -1);
    chatDirty = true;
  } else if (e.key === "Enter") {
    if (state.input.trim() !== "") {
      state.lines.push(`mArc> ${state.input}`);
      if (state.lines.length > 8) state.lines.shift();
      state.input = "";
      chatDirty = true;
    }
  } else if (e.key.length === 1) {
    state.input += e.key;
    chatDirty = true;
  }
});

/* =====================
   RENDER
===================== */
function render() {
  const { lag, active } = generateFreenodeData();

  return `
    <div class="chat-window">
      <div class="chat-header">#wikichat ircs://chat.wikileaks.org/</div>
    
    <div class="chat-msg">
  ${state.lines
    .map((msg) => `<div class="chat-msg-line">${msg}</div>`)
    .join("")}
</div>
      </div>

      <div class="chat-freenode" >
        <span class="chat-freenode-l1" > [42] [irc/freenode] 13:#Wikichat.(+cnt)</span>
        <br>
        <span class="chat-freenode-l2" > [Lag: ${lag}] [Active: ${active}] [mig5(+Xi)]</span>
      </div>



      <div class="chat-input"><span class="input-prefix">&lt;mArc(i)&gt;</span> ${
        state.input
      }<span class="cursor">█</span></div>

    
  `;
}

/* =====================
   WINDOW
===================== */
export const ircChatWindow = createFUIWindow({
  id: "irc-chat",
  render,
  update: updateMessages,
  interval: { min: 1000, max: 4000 },
});

export function startIRCChat() {
  ircChatWindow.start();
}

export function stopIRCChat() {
  ircChatWindow.stop();
}
