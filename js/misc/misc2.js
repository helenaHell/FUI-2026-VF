import { createFUIWindow } from "../core/template.js";
import { setupKeyboardHandler, setupClickHandler } from "../core/utils.js";

// =====================
// CONSTANTS
// =====================

const LOG_LEVELS = ["INFO", "WARN", "ERROR", "DEBUG"];
const LOG_COLORS = {
  INFO: "#00ff00",
  WARN: "#ffaa00",
  ERROR: "#ff0000",
  DEBUG: "#00aaff",
};

const LOG_MESSAGES = {
  INFO: [
    "System initialized successfully",
    "Connection established to remote server",
    "Data synchronization completed",
    "User authentication successful",
    "Cache cleared",
    "Configuration loaded",
    "Service started on port 8080",
    "Database connection pool ready",
    "Backup completed successfully",
    "Session restored",
  ],
  WARN: [
    "High memory usage detected (85%)",
    "Slow query detected: 2.5s",
    "Certificate expires in 7 days",
    "Deprecated API call detected",
    "Rate limit approaching threshold",
    "Disk space low (15% remaining)",
    "Connection timeout retry attempt 2/3",
    "Missing optional configuration parameter",
    "Legacy protocol in use",
    "Unverified SSL certificate",
  ],
  ERROR: [
    "Failed to connect to database",
    "Authentication failed: invalid token",
    "File not found: /var/log/system.log",
    "Permission denied: cannot write to /tmp",
    "Network timeout after 30s",
    "Invalid JSON in configuration file",
    "Memory allocation failed",
    "Segmentation fault in module core.so",
    "Unhandled exception in worker thread",
    "Critical: service crash detected",
  ],
  DEBUG: [
    "Entering function processRequest()",
    "Variable state: {active: true, count: 42}",
    "Query execution time: 125ms",
    "Cache hit for key: user:12345",
    "Websocket message received: 256 bytes",
    "Thread pool size: 16 (4 active)",
    "GC cycle completed: 45ms",
    "Request headers: [Accept, User-Agent, Cookie]",
    "Middleware chain: [auth, logging, cors]",
    "Response sent: 200 OK (1.2kb)",
  ],
};

const ERROR_TYPES = [
  "NullPointerException",
  "IndexOutOfBoundsException",
  "NetworkTimeoutException",
  "AuthenticationException",
  "DatabaseConnectionException",
  "FileNotFoundException",
];

const STACK_TRACES = [
  [
    "at com.wikileaks.core.DataProcessor.process(DataProcessor.java:156)",
    "at com.wikileaks.api.RequestHandler.handle(RequestHandler.java:89)",
    "at com.wikileaks.server.Server.handleRequest(Server.java:234)",
    "at com.wikileaks.network.NetworkManager.dispatch(NetworkManager.java:445)",
  ],
  [
    "at java.util.ArrayList.get(ArrayList.java:459)",
    "at com.wikileaks.db.QueryExecutor.executeQuery(QueryExecutor.java:178)",
    "at com.wikileaks.service.DataService.fetchData(DataService.java:92)",
    "at com.wikileaks.api.Controller.getData(Controller.java:67)",
  ],
  [
    "at okhttp3.internal.connection.RealCall.execute(RealCall.java:148)",
    "at com.wikileaks.network.HttpClient.sendRequest(HttpClient.java:234)",
    "at com.wikileaks.sync.SyncManager.sync(SyncManager.java:156)",
    "at com.wikileaks.scheduler.JobRunner.run(JobRunner.java:89)",
  ],
];

// =====================
// STATE
// =====================

const state = {
  logs: [],
  maxLogs: 50,
  filterLevel: "ALL",
  autoScroll: true,
  selectedLogIndex: null,

  errors: [],
  maxErrors: 10,
  selectedErrorIndex: null,

  activePanel: "logs",
};

// =====================
// GENERATORS
// =====================

function generateRandomLog() {
  const level = LOG_LEVELS[Math.floor(Math.random() * LOG_LEVELS.length)];
  const messages = LOG_MESSAGES[level];
  const message = messages[Math.floor(Math.random() * messages.length)];
  const timestamp = new Date().toISOString();
  const source = ["core", "api", "db", "auth", "cache", "network"][
    Math.floor(Math.random() * 6)
  ];

  return { timestamp, level, source, message, id: Date.now() + Math.random() };
}

function generateRandomError() {
  const type = ERROR_TYPES[Math.floor(Math.random() * ERROR_TYPES.length)];
  const stack = STACK_TRACES[Math.floor(Math.random() * STACK_TRACES.length)];
  const timestamp = new Date().toISOString();
  const errorMessages = [
    "Cannot read property 'data' of null",
    "Connection refused: no further information",
    "Index 42 is out of bounds for array length 10",
    "Invalid credentials provided",
    "File '/var/data/config.json' does not exist",
    "Timeout after 30000ms",
  ];
  const message =
    errorMessages[Math.floor(Math.random() * errorMessages.length)];

  return { timestamp, type, message, stack, id: Date.now() + Math.random() };
}

// =====================
// FILTERING
// =====================

function filterLogs() {
  let filtered = state.logs;
  if (state.filterLevel !== "ALL") {
    filtered = filtered.filter((log) => log.level === state.filterLevel);
  }
  return filtered;
}

// =====================
// RENDER
// =====================

function render() {
  const ts = new Date().toISOString().substring(11, 19);
  const filteredLogs = filterLogs();

  return `
    <div class="fui-misc-2">
      <div class="fui-header">
        <span class="fui-header-title">LOG MONITOR</span>
        <span class="fui-header-stats">LOGS: ${state.logs.length}/${state.maxLogs} | ERRORS: ${state.errors.length}/${state.maxErrors}</span>
        <span class="fui-header-time">${ts}</span>
      </div>

      <div class="fui-misc-split">
        <div class="fui-log-viewer ${state.activePanel === "logs" ? "active" : ""}" data-panel="logs">
          <div class="fui-panel-header">
            <span class="fui-indicator ${state.activePanel === "logs" ? "active" : ""}">●</span>
            SYSTEM LOGS
            <span class="fui-filter-status">[${state.filterLevel}]</span>
          </div>
          
          <div class="fui-filter-bar">
            <div class="fui-filter-levels">
              ${["ALL", ...LOG_LEVELS]
                .map(
                  (level) => `
                <span class="fui-filter-btn ${state.filterLevel === level ? "active" : ""}" data-level="${level}">${level}</span>
              `,
                )
                .join("")}
            </div>
            <div class="fui-filter-options">
              <span class="fui-option ${state.autoScroll ? "active" : ""}" data-option="autoscroll">
                AUTO-SCROLL: ${state.autoScroll ? "ON" : "OFF"}
              </span>
            </div>
          </div>
          
          <div class="fui-log-list" id="misc-2-log-list">
            ${
              filteredLogs
                .slice(-20)
                .map((log, i) => {
                  const globalIndex = state.logs.indexOf(log);
                  return `
                <div class="fui-log-entry ${globalIndex === state.selectedLogIndex ? "selected" : ""}" 
                     data-log-index="${globalIndex}"
                     style="border-left-color: ${LOG_COLORS[log.level]}">
                  <span class="fui-log-time">${log.timestamp.substring(11, 23)}</span>
                  <span class="fui-log-level" style="color: ${LOG_COLORS[log.level]}">[${log.level}]</span>
                  <span class="fui-log-source">{${log.source}}</span>
                  <span class="fui-log-message">${log.message}</span>
                </div>
              `;
                })
                .join("") || '<div class="fui-empty">No logs available</div>'
            }
          </div>
          
          <div class="fui-log-actions">
            <span class="fui-action-hint">[TAB] Switch  [1-5] Filter  [A] Toggle Auto-scroll  [C] Clear</span>
          </div>
        </div>
        
        <div class="fui-error-viewer ${state.activePanel === "errors" ? "active" : ""}" data-panel="errors">
          <div class="fui-panel-header">
            <span class="fui-indicator ${state.activePanel === "errors" ? "active" : ""}">●</span>
            ERROR TRACES
          </div>
          
          <div class="fui-error-list">
            ${
              state.errors
                .slice(-10)
                .reverse()
                .map((error, i) => {
                  const globalIndex = state.errors.length - 1 - i;
                  const isExpanded = globalIndex === state.selectedErrorIndex;

                  return `
                <div class="fui-error-entry ${isExpanded ? "expanded" : ""}" data-error-index="${globalIndex}">
                  <div class="fui-error-header">
                    <span class="fui-error-time">${error.timestamp.substring(11, 23)}</span>
                    <span class="fui-error-type">${error.type}</span>
                    <span class="fui-error-expand">${isExpanded ? "[-]" : "[+]"}</span>
                  </div>
                  <div class="fui-error-message">${error.message}</div>
                  ${
                    isExpanded
                      ? `
                    <div class="fui-error-stack">
                      <div class="fui-stack-label">STACK TRACE:</div>
                      ${error.stack.map((line) => `<div class="fui-stack-line">${line}</div>`).join("")}
                    </div>
                  `
                      : ""
                  }
                </div>
              `;
                })
                .join("") || '<div class="fui-empty">No errors recorded</div>'
            }
          </div>
          
          <div class="fui-error-actions">
            <span class="fui-action-hint">[TAB] Switch  [CLICK] Expand/Collapse  [C] Clear Errors</span>
          </div>
        </div>
      </div>
    </div>
  `;
}

// =====================
// UPDATE
// =====================

function update() {
  if (Math.random() > 0.3) {
    const log = generateRandomLog();
    state.logs.push(log);

    if (state.logs.length > state.maxLogs) state.logs.shift();

    if (log.level === "ERROR" && Math.random() > 0.5) {
      const error = generateRandomError();
      state.errors.push(error);

      if (state.errors.length > state.maxErrors) state.errors.shift();
    }
  }

  if (state.autoScroll && state.activePanel === "logs") {
    setTimeout(() => {
      const logList = document.getElementById("misc-2-log-list");
      if (logList) logList.scrollTop = logList.scrollHeight;
    }, 50);
  }
}

// =====================
// INTERACTIONS
// =====================

let cleanupKeyboard = null;
let cleanupClick = null;

function setupInteractions() {
  if (cleanupKeyboard) cleanupKeyboard();
  if (cleanupClick) cleanupClick();

  cleanupKeyboard = setupKeyboardHandler("misc-2", {
    Tab: () => {
      state.activePanel = state.activePanel === "logs" ? "errors" : "logs";
      misc2Window.forceRender();
    },
    Digit1: () => {
      if (state.activePanel === "logs") {
        state.filterLevel = "ALL";
        misc2Window.forceRender();
      }
    },
    Digit2: () => {
      if (state.activePanel === "logs") {
        state.filterLevel = "INFO";
        misc2Window.forceRender();
      }
    },
    Digit3: () => {
      if (state.activePanel === "logs") {
        state.filterLevel = "WARN";
        misc2Window.forceRender();
      }
    },
    Digit4: () => {
      if (state.activePanel === "logs") {
        state.filterLevel = "ERROR";
        misc2Window.forceRender();
      }
    },
    Digit5: () => {
      if (state.activePanel === "logs") {
        state.filterLevel = "DEBUG";
        misc2Window.forceRender();
      }
    },
    KeyA: () => {
      if (state.activePanel === "logs") {
        state.autoScroll = !state.autoScroll;
        misc2Window.forceRender();
      }
    },
    KeyC: () => {
      if (state.activePanel === "logs") {
        state.logs = [];
        state.selectedLogIndex = null;
        misc2Window.forceRender();
      } else if (state.activePanel === "errors") {
        state.errors = [];
        state.selectedErrorIndex = null;
        misc2Window.forceRender();
      }
    },
  });

  cleanupClick = setupClickHandler("misc-2", "*", (e, target) => {
    const panel = target.closest(".fui-log-viewer, .fui-error-viewer");
    if (panel) {
      state.activePanel = panel.dataset.panel;
      misc2Window.forceRender();
      return;
    }

    const filterBtn = target.closest(".fui-filter-btn");
    if (filterBtn) {
      state.filterLevel = filterBtn.dataset.level;
      misc2Window.forceRender();
      return;
    }

    const option = target.closest(".fui-option");
    if (option && option.dataset.option === "autoscroll") {
      state.autoScroll = !state.autoScroll;
      misc2Window.forceRender();
      return;
    }

    const logEntry = target.closest(".fui-log-entry");
    if (logEntry) {
      const index = parseInt(logEntry.dataset.logIndex);
      state.selectedLogIndex = state.selectedLogIndex === index ? null : index;
      misc2Window.forceRender();
      return;
    }

    const errorEntry = target.closest(".fui-error-entry");
    if (errorEntry) {
      const index = parseInt(errorEntry.dataset.errorIndex);
      state.selectedErrorIndex =
        state.selectedErrorIndex === index ? null : index;
      misc2Window.forceRender();
      return;
    }
  });
}

// =====================
// INITIALIZATION
// =====================

for (let i = 0; i < 15; i++) {
  state.logs.push(generateRandomLog());
}

for (let i = 0; i < 3; i++) {
  state.errors.push(generateRandomError());
}

// =====================
// WINDOW INSTANCE
// =====================

const misc2Window = createFUIWindow({
  id: "misc-2",
  render,
  update,
  interval: { min: 1500, max: 3500 },
  defaultMode: "default",
});

// =====================
// PUBLIC API
// =====================

export function startMisc2() {
  misc2Window.start();
  setTimeout(setupInteractions, 100);
}

export function stopMisc2() {
  misc2Window.stop();
  if (cleanupKeyboard) cleanupKeyboard();
  if (cleanupClick) cleanupClick();
}
