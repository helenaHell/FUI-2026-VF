import { createFUIWindow } from "../core/template.js";

// =====================
// LOG DATA
// =====================

const LOG_MESSAGES = [
  "error: invalid block offset - ext2_valid_block_bitmap: Invalid block",
  "warning: failed entry in directory - inode mismatch rec_len=0",
  "ext2_check_page: bad entry in directory - invalid block offset",
  "EXT2-fs error: ext2_readdir: bad entry in directory #53491",
  "attempt to access beyond end of device - sda1: rw=0, want=137504640",
  "I/O error, dev sda1, sector 49161728 op 0x0:(READ) flags 0x80700",
  "Buffer I/O error on dev sda1, logical block 49161728, async page read",
  "EXT2-fs (sda1): error: ext2_lookup: deleted inode referenced: 53492",
  "ata1: COMRESET failed (errno=-16) - check disk error log",
  "ata1.00: exception Emask 0x0 SAct 0x0 SErr 0x0 action 0x6 frozen",
  "ata1.00: failed command: READ DMA EXT",
  "ata1.00: cmd 25/00:08:00:00:00/00:00:00:00:00/e0 tag 0 dma 4096 in",
  "ata1.00: status: { DRDY ERR }",
  "ata1.00: error: { UNC }",
  "end_request: I/O error, dev sda, sector 137504640",
  "Check point: ext2_check_page failed - invalid checksum",
  "Warning: mounting fs with errors - run fsck for recovery",
  "EXT2-fs warning: mounting unchecked fs, running e2fsck is recommended",
  "ata1: soft resetting link - trying device recovery sequence",
  "ata1: SATA link up 3.0 Gbps (SStatus 123 SControl 300)",
];

const logLines = [];
const MAX_LINES = 40;

// =====================
// RENDER
// =====================

function render() {
  return `
    <div class="dev-logs">
      <div class="logs-header">ERROR LOG - /var/log/system.log</div>
      <div class="logs-separator">========================================</div>
      <div class="logs-content">
        ${logLines.join("\n")}
      </div>
    </div>
  `;
}

// =====================
// UPDATE
// =====================

function update() {
  // Add random error message
  const randomLog =
    LOG_MESSAGES[Math.floor(Math.random() * LOG_MESSAGES.length)];
  const timestamp = new Date().toISOString().replace("T", " ").substring(0, 19);
  logLines.push(`[${timestamp}] ${randomLog}`);

  // Limit lines
  if (logLines.length > MAX_LINES) {
    logLines.shift();
  }

  // Auto-scroll
  setTimeout(() => {
    const content = document.querySelector("#dev-logs .logs-content");
    if (content) {
      content.scrollTop = content.scrollHeight;
    }
  }, 10);
}

// =====================
// INIT
// =====================

function initialize() {
  // Start with 50 error lines
  for (let i = 0; i < 0; i++) {
    const randomLog =
      LOG_MESSAGES[Math.floor(Math.random() * LOG_MESSAGES.length)];
    const timestamp = new Date(Date.now() - Math.random() * 3600000)
      .toISOString()
      .replace("T", " ")
      .substring(0, 19);
    logLines.push(`[${timestamp}] ${randomLog}`);
  }
}

// =====================
// FUI WINDOW INSTANCE
// =====================

export const devLogsWindow = createFUIWindow({
  id: "dev-logs",
  render,
  update,
  interval: 800, // New error every 800ms
  defaultMode: "default",
});

// =====================
// PUBLIC API
// =====================

export function startDevLogs() {
  if (logLines.length === 0) initialize();
  devLogsWindow.start();
}

export function stopDevLogs() {
  devLogsWindow.stop();
}
