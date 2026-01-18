import { createFUIWindow } from "../core/template.js";

const emailDatabase = [
  {
    from: "admin@juliusbaer.com",
    to: "info@wikileaks.org",
    subject: "Legal Action against Wikileaks",
    body: `Dear Sir or Madam:

Please immediately send the undersigned your full contact details for transmission of legal notices with regard to content posted on Wikileaks that constitute violation of tradesecrets, conversion and stolen documents by former employee in violation of a written Confidentiality agreement and copyright infringement, among other wrongful and tortious conduct.`,
    size: "67.6",
    headers: "none",
    cc: "none",
    bcc: "none",
  },
  {
    from: "security@interpol.int",
    to: "admin@wikileaks.org",
    subject: "Urgent: Document Verification Request",
    body: `To Whom It May Concern:

This is an official request from INTERPOL regarding recent publications on your platform. We require immediate verification of document authenticity and source information for ongoing investigation #IC-2024-8472.

Please respond within 48 hours to avoid escalation.`,
    size: "52.3",
    headers: "classified",
    cc: "legal@interpol.int",
    bcc: "none",
  },
  {
    from: "press@nytimes.com",
    to: "contact@wikileaks.org",
    subject: "Interview Request - Upcoming Publication",
    body: `Hello,

We are preparing a feature story on digital transparency and whistleblowing in the modern age. We would like to include perspectives from your organization.

Would you be available for a brief interview next week? We can accommodate your schedule and preferred communication method.`,
    size: "43.1",
    headers: "standard",
    cc: "none",
    bcc: "none",
  },
];

const mailState = {
  emails: [],
  selectedIndex: 0,
  mode: "list",
  replyText: "",
  originalHeight: 1,
};

let initialized = false;

function generateNextEmailTime(previousTime) {
  if (!previousTime) return new Date(Date.now() - 1000 * 60 * 60 * 24 * 7);
  const offset = Math.floor(Math.random() * 1000 * 60 * 120) + 1000 * 60 * 5;
  return new Date(previousTime.getTime() + offset);
}

function formatTime(date) {
  return date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function timeAgo(date) {
  const diff = Date.now() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  if (days > 0) return `${days}d`;
  if (hours > 0) return `${hours}h`;
  if (minutes > 0) return `${minutes}min`;
  return "now";
}

function createEmail(previousDate = null) {
  const date = generateNextEmailTime(previousDate);
  const template =
    emailDatabase[Math.floor(Math.random() * emailDatabase.length)];
  const statuses = ["-", "X", ".", "-", "-"];
  const status = statuses[Math.floor(Math.random() * statuses.length)];
  const priorities = ["", "", "", "1", "2", "3", "4", "5"];
  const priority = priorities[Math.floor(Math.random() * priorities.length)];
  return {
    ...template,
    date,
    time: formatTime(date),
    sent: timeAgo(date),
    status,
    priority,
    id: crypto.randomUUID(),
  };
}

function handleMailKeydown(e) {
  const distMailWindow = document.getElementById("dist-mail");
  if (
    !distMailWindow ||
    !distMailWindow.classList.contains("locked") ||
    document.body.classList.contains("layout-edit")
  )
    return;

  const { mode, selectedIndex, emails } = mailState;

  if (mode === "list") {
    if (e.code === "ArrowUp") {
      e.preventDefault();
      mailState.selectedIndex = Math.max(0, selectedIndex - 1);
      mailWindow.start();
    } else if (e.code === "ArrowDown") {
      e.preventDefault();
      mailState.selectedIndex = Math.min(emails.length - 1, selectedIndex + 1);
      mailWindow.start();
    } else if (e.code === "Enter") {
      e.preventDefault();
      enterReadingMode();
    }
  } else if (mode === "reading") {
    if (e.code === "Escape") {
      e.preventDefault();
      enterListMode();
    } else if (e.code === "KeyR") {
      e.preventDefault();
      enterReplyMode();
    } else if (e.code === "ArrowUp") {
      e.preventDefault();
      mailState.selectedIndex = Math.max(0, selectedIndex - 1);
      mailWindow.start();
    } else if (e.code === "ArrowDown") {
      e.preventDefault();
      mailState.selectedIndex = Math.min(emails.length - 1, selectedIndex + 1);
      mailWindow.start();
    }
  } else if (mode === "reply") {
    if (e.code === "Escape") {
      e.preventDefault();
      enterReadingMode();
    } else if (e.code === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      sendReply();
    }
  }
}

function enterReadingMode() {
  mailState.mode = "reading";
  window.resizeWindow("dist-mail", 1, 2);
  mailWindow.start();
  mailWindow.setMode("reading");
}

function enterReplyMode() {
  mailWindow.stop();
  mailState.mode = "reply";
  mailState.replyText = "";
  window.resizeWindow("dist-mail", 1, 3);
  mailWindow.setMode("reply");
  setTimeout(() => {
    const textarea = document.querySelector(".reply-textarea");
    if (textarea) textarea.focus();
  }, 10);
}

function enterListMode() {
  mailState.mode = "list";
  window.resizeWindow("dist-mail", 1, 1);
  mailWindow.start();
  mailWindow.setMode("list");
}

function sendReply() {
  const textarea = document.querySelector(".reply-textarea");
  if (!textarea) return;
  const replyText = textarea.value.trim();
  if (replyText.length > 0) {
    const footer = document.querySelector(".reply-footer");
    if (footer) {
      const originalHTML = footer.innerHTML;
      footer.innerHTML =
        '<span class="footer-item" style="color: var(--color-white);">--SENT ✓</span>';
      setTimeout(() => {
        footer.innerHTML = originalHTML;
        enterReadingMode();
      }, 800);
    }
  } else enterReadingMode();
}

function renderEmailRow(email, index) {
  const selectedClass =
    index === mailState.selectedIndex ? "email-row-selected" : "";
  return `<div class="email-row ${selectedClass}" data-index="${index}">
    <span class="email-time">${email.time}</span>
    <span class="email-subject">${email.subject}</span>
    <span class="email-from">${email.from}</span>
    <span class="email-sent">${email.sent}</span>
    <span class="email-status">${email.status}</span>
    <span class="email-priority">${email.priority}</span>
  </div>`;
}

function renderList() {
  return `<div class="mail-header">
    <span class="mail-header-label">Mail:Incoming</span>
    <span class="mail-header-spacer"></span>
  </div>
  <div class="mail-topbar">
    <span class="topbar-item">Time</span>
    <span class="topbar-item">Subject</span>
    <span class="topbar-item">From</span>
    <span class="topbar-item">Sent</span>
    <span class="topbar-item">St</span>
    <span class="topbar-item">Pr</span>
  </div>
  <div class="mail-list">
    ${mailState.emails.map(renderEmailRow).join("")}
  </div>`;
}

function renderReading() {
  const email = mailState.emails[mailState.selectedIndex];
  if (!email) return renderList();
  return `<div class="mail-split">
    <div class="mail-list-section">${renderList()}</div>
    <div class="mail-reading-section">
      <div class="reading-header">
        <div class="reading-header-row"><span class="reading-label">From:</span><span class="reading-value">${
          email.from
        }</span></div>
        <div class="reading-header-row"><span class="reading-label">To:</span><span class="reading-value">${
          email.to
        }</span></div>
      </div>
      <div class="reading-body">
        <p class="reading-salutation">Dear Sir or Madam:</p>
        <p class="reading-text">${email.body}</p>
      </div>
      <div class="reading-footer">
        <span class="footer-item">--file    ${email.size}</span>
        <span class="footer-item">cc: ${email.cc}</span>
        <span class="footer-item">bcc: ${email.bcc}</span>
      </div>
      <div class="reading-actions"><span class="action-hint">[ESC] Back  [R] Reply</span></div>
    </div>
  </div>`;
}

function renderReply() {
  const email = mailState.emails[mailState.selectedIndex];
  if (!email) return renderList();
  return `<div class="mail-split">
    <div class="mail-list-section">${renderList()}</div>
    <div class="mail-reply-section">
      <div class="reply-header">
        <div class="reply-header-row"><span class="reply-label">From:</span><span class="reply-value">admin@wikileaks.org</span></div>
        <div class="reply-header-row"><span class="reply-label">To:</span><span class="reply-value">${
          email.from
        }</span></div>
        <div class="reply-header-row"><span class="reply-label">Re:</span><span class="reply-value">${
          email.subject
        }</span></div>
      </div>
      <div class="reply-body">
        <textarea class="reply-textarea" placeholder="Type your reply..." spellcheck="false">${
          mailState.replyText
        }</textarea>
      </div>
      <div class="reply-footer">
        <span class="footer-item">--draft</span>
        <span class="footer-item">cc: none</span>
        <span class="footer-item">bcc: none</span>
      </div>
      <div class="reply-actions"><span class="action-hint">[ESC] Cancel  [CTRL+Enter] Send</span></div>
    </div>
  </div>`;
}

function render(mode) {
  if (mode === "reading") return renderReading();
  if (mode === "reply") return renderReply();
  return renderList();
}

function update() {
  mailState.emails.forEach((email) => {
    email.sent = timeAgo(email.date);
  });
  if (mailState.mode === "reply") {
    const textarea = document.querySelector(".reply-textarea");
    if (textarea) mailState.replyText = textarea.value;
  }
  setTimeout(attachClickHandlers, 10);
}

function attachClickHandlers() {
  const rows = document.querySelectorAll(".email-row");
  rows.forEach((row) => {
    row.addEventListener("click", () => {
      const index = parseInt(row.dataset.index, 10);
      mailState.selectedIndex = index;
      if (mailState.mode === "list") enterReadingMode();
      else mailWindow.start();
    });
  });
}

function initialize() {
  if (initialized) return;
  mailState.emails = [];
  let previousDate = null;
  for (let i = 0; i < 15; i++) {
    const email = createEmail(previousDate);
    mailState.emails.push(email);
    previousDate = email.date;
  }
  initialized = true;
}

export const mailWindow = createFUIWindow({
  id: "dist-mail",
  render,
  update,
  defaultMode: "list",
});

document.addEventListener("keydown", handleMailKeydown);

export function startDISTMail() {
  initialize();
  mailWindow.start();
}

export function stopDISTMail() {
  mailWindow.stop();
}
