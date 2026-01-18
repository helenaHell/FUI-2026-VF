let layoutEditMode = false;
let layoutState = {};
let activeWindowId = null;
let pushMode = true;
let mergeGroups = {};

const GRID_COLS = 3;
const GRID_ROWS = 2;

const windowOrder = [
  "main-ops",
  "main-network",
  "main-comms",
  "main-intel",

  "code-1",
  "code-2",
  "code-3",
  "code-4",
  "code-5",

  "dist-mail",
  "dist-docs",
  "dist-files",
  "dist-addresses",

  "irc-chat",
  "irc-stats",
  "irc-files",
  "irc-twitter",
  "irc-InterfaceStatus",

  "search-1",
  "search-2",

  "dev-terminal",
  "dev-logs",
  "dev-editor",
  "dev-1",

  "misc-1",
  "misc-2",
  "misc-3",
  "misc-4",
];

const layouts = {
  "1main": {
    "main-comms": { col: 1, row: 1, w: 1, h: 1 },
    "main-network": { col: 2, row: 1, w: 1, h: 1 },
    "main-intel": { col: 3, row: 1, w: 1, h: 1 },
    "main-ops": { col: 1, row: 2, w: 2, h: 1 },
  },
  "2code": {
    "code-1": { col: 1, row: 1, w: 2, h: 2 },
    "code-2": { col: 3, row: 1, w: 1, h: 2 },
  },
  "3dist": {
    "dist-addresses": { col: 1, row: 1, w: 2, h: 1 },
    "dist-mail": { col: 3, row: 1, w: 1, h: 1 },
    "dist-docs": { col: 1, row: 2, w: 1, h: 1 },
    "dist-files": { col: 2, row: 2, w: 2, h: 1 },
  },
  "4irc": {
    "irc-chat": { col: 3, row: 1, w: 1, h: 1 },
    "irc-twitter": { col: 2, row: 1, w: 1, h: 1 },
    "irc-stats": { col: 2, row: 2, w: 2, h: 1 },
    "irc-InterfaceStatus": { col: 1, row: 1, w: 1, h: 2 },
  },
  "5search": {
    "search-1": { col: 1, row: 2, w: 1, h: 1 },
    "search-2": { col: 2, row: 2, w: 1, h: 1 },
  },

  "6dev": {
    "dev-editor": { col: 1, row: 1, w: 2, h: 1 },
    "dev-terminal": { col: 3, row: 1, w: 1, h: 2 },
    "dev-logs": { col: 2, row: 2, w: 1, h: 1 },
    "dev-1": { col: 1, row: 2, w: 1, h: 1 },
  },

  "7misc": {
    "misc-1": { col: 1, row: 1, w: 1, h: 2 },
    "misc-2": { col: 2, row: 1, w: 2, h: 1 },
  },
};

document.addEventListener(
  "mousedown",
  (e) => {
    if (layoutEditMode) return;

    const winEl = e.target.closest(".fui-window");
    if (!winEl) return;

    const id = winEl.id;
    if (!id || !layoutState[id]) return;

    if (activeWindowId !== id) {
      activeWindowId = id;
      renderLayout();
    }
  },
  true,
);

function buildOccupancyGrid(ignoreId = null) {
  const grid = Array.from({ length: GRID_ROWS }, () =>
    Array(GRID_COLS).fill(null),
  );

  for (const [id, win] of Object.entries(layoutState)) {
    if (id === ignoreId) continue;
    for (let r = 0; r < win.h; r++) {
      for (let c = 0; c < win.w; c++) {
        const gridRow = win.row - 1 + r;
        const gridCol = win.col - 1 + c;
        if (
          gridRow >= 0 &&
          gridRow < GRID_ROWS &&
          gridCol >= 0 &&
          gridCol < GRID_COLS
        ) {
          grid[gridRow][gridCol] = id;
        }
      }
    }
  }
  return grid;
}

function findFirstFreeCell(grid) {
  for (let r = 0; r < GRID_ROWS; r++) {
    for (let c = 0; c < GRID_COLS; c++) {
      if (grid[r][c] === null) return { col: c + 1, row: r + 1 };
    }
  }
  return null;
}

function getConflictingWindows(movedWin, movedId) {
  const conflicts = new Set();
  for (const [id, win] of Object.entries(layoutState)) {
    if (id === movedId) continue;
    const noOverlap =
      movedWin.col + movedWin.w - 1 < win.col ||
      win.col + win.w - 1 < movedWin.col ||
      movedWin.row + movedWin.h - 1 < win.row ||
      win.row + win.h - 1 < movedWin.row;
    if (!noOverlap) conflicts.add(id);
  }
  return Array.from(conflicts);
}

function applyPush(movedId) {
  if (!pushMode) return;
  const movedWin = layoutState[movedId];
  if (!movedWin) return;

  const conflicts = getConflictingWindows(movedWin, movedId);
  if (conflicts.length === 0) return;

  conflicts.forEach((victimId) => {
    const victim = layoutState[victimId];
    if (!victim) return;

    if (victim.w > 1 || victim.h > 1) {
      victim.w = 1;
      victim.h = 1;
    }

    const grid = buildOccupancyGrid(victimId);
    const freeSpot = findFirstFreeCell(grid);
    if (freeSpot) {
      victim.col = freeSpot.col;
      victim.row = freeSpot.row;
    }
  });

  if (movedWin.col + movedWin.w - 1 > GRID_COLS) {
    movedWin.w = GRID_COLS - movedWin.col + 1;
  }
  if (movedWin.row + movedWin.h - 1 > GRID_ROWS) {
    movedWin.h = GRID_ROWS - movedWin.row + 1;
  }
}

function renderLayout() {
  Object.entries(layoutState).forEach(([id, pos]) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.style.gridColumn = `${pos.col} / span ${pos.w}`;
    el.style.gridRow = `${pos.row} / span ${pos.h}`;

    // TOUJOURS appliquer locked quand c'est la fenêtre active
    const isActive = id === activeWindowId;
    el.classList.toggle("locked", isActive);
    // "active" seulement en edit mode pour le styling
    el.classList.toggle("active", layoutEditMode && isActive);
  });
}

function saveLayout(tabName) {
  const data = {
    layoutState: JSON.parse(JSON.stringify(layoutState)),
    mergeGroups: JSON.parse(JSON.stringify(mergeGroups)),
    timestamp: Date.now(),
  };
  localStorage.setItem(`fui-layout-${tabName}`, JSON.stringify(data));
}

function loadSavedLayout(tabName) {
  const saved = localStorage.getItem(`fui-layout-${tabName}`);
  if (!saved) return null;
  try {
    return JSON.parse(saved);
  } catch (e) {
    return null;
  }
}

function resetLayout(tabName) {
  localStorage.removeItem(`fui-layout-${tabName}`);
}

function loadLayout(name) {
  const preset = layouts[name];
  if (!preset) return;

  const saved = loadSavedLayout(name);
  if (saved && saved.layoutState) {
    layoutState = saved.layoutState;
    mergeGroups = saved.mergeGroups || {};
  } else {
    layoutState = JSON.parse(JSON.stringify(preset));
    mergeGroups = {};
  }

  activeWindowId = Object.keys(layoutState)[0] || null;

  windowOrder.forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.style.display = layoutState[id] ? "block" : "none";
  });

  renderLayout();
  document.dispatchEvent(new CustomEvent("tabChanged", { detail: name }));
}

window.loadLayout = loadLayout;

window.resizeWindow = function (id, w, h) {
  const win = layoutState[id];
  if (!win) return false;

  const oldW = win.w;
  const oldH = win.h;

  win.w = Math.max(1, Math.min(GRID_COLS - win.col + 1, w));
  win.h = Math.max(1, Math.min(GRID_ROWS - win.row + 1, h));

  if (pushMode && (oldW !== win.w || oldH !== win.h)) {
    applyPush(id);
  }

  renderLayout();
  return true;
};

// =====================================================
// EVENT LISTENERS - ÉPURÉS ET OPTIMISÉS
// =====================================================

// COMMANDE GLOBALE #1: SHIFT + DIGIT pour changer de tab (passe PARTOUT)
document.addEventListener(
  "keydown",
  (e) => {
    if (!e.shiftKey || !e.code.match(/^Digit[1-7]$/)) return;

    e.preventDefault();
    const digit = e.code.replace("Digit", "");

    // Map digit → tab name
    const tabMap = {
      1: "1main",
      2: "2code",
      3: "3dist",
      4: "4irc",
      5: "5search",
      6: "6dev",
      7: "7misc",
    };

    const tabName = tabMap[digit];
    if (tabName) {
      const tabButton = document.querySelector(
        `#tabs button[data-tab="${tabName}"]`,
      );
      if (tabButton) tabButton.click();
    }
  },
  true,
); // Capture phase = priorité absolue

// COMMANDE GLOBALE #2: CMD pour toggle edit mode (passe PARTOUT)
document.addEventListener(
  "keydown",
  (e) => {
    if (e.code !== "MetaLeft" && e.code !== "MetaRight") return;

    e.preventDefault();
    layoutEditMode = !layoutEditMode;
    document.body.classList.toggle("layout-edit", layoutEditMode);
    renderLayout();
  },
  true,
); // Capture phase = priorité absolue

// COMMANDE GLOBALE #3: ALT + FLÈCHES pour lock sur autre fenêtre (passe PARTOUT)
document.addEventListener(
  "keydown",
  (e) => {
    // IMPORTANT: Ne vérifier QUE Alt+Arrow, ne PAS bloquer si fenêtre est locked
    if (!e.altKey || !e.code.startsWith("Arrow")) return;

    e.preventDefault();
    e.stopPropagation();

    const visibleWindows = windowOrder.filter((id) => layoutState[id]);
    if (visibleWindows.length === 0) return;

    let currentIndex = visibleWindows.indexOf(activeWindowId);
    if (currentIndex === -1) currentIndex = 0;

    if (e.code === "ArrowRight" || e.code === "ArrowDown") {
      currentIndex = (currentIndex + 1) % visibleWindows.length;
    } else if (e.code === "ArrowLeft" || e.code === "ArrowUp") {
      currentIndex =
        (currentIndex - 1 + visibleWindows.length) % visibleWindows.length;
    }

    activeWindowId = visibleWindows[currentIndex];
    renderLayout();
  },
  true,
); // Capture phase = priorité absolue

// LAYOUT EDIT MODE - Move & Resize windows (seulement en edit mode)
document.addEventListener("keydown", (e) => {
  if (!layoutEditMode || !activeWindowId) return;

  const win = layoutState[activeWindowId];
  if (!win) return;

  const oldCol = win.col,
    oldRow = win.row,
    oldW = win.w,
    oldH = win.h;
  let changed = false;

  // SHIFT + Flèches = Resize
  if (e.shiftKey && e.code.startsWith("Arrow")) {
    e.preventDefault();
    if (e.code === "ArrowRight") {
      win.w = Math.min(win.w + 1, GRID_COLS - win.col + 1);
      changed = true;
    } else if (e.code === "ArrowDown") {
      win.h = Math.min(win.h + 1, GRID_ROWS - win.row + 1);
      changed = true;
    } else if (e.code === "ArrowLeft") {
      win.w = Math.max(win.w - 1, 1);
      changed = true;
    } else if (e.code === "ArrowUp") {
      win.h = Math.max(win.h - 1, 1);
      changed = true;
    }
  }
  // Flèches seules = Move (seulement si pas Alt - car Alt = switch window)
  else if (!e.altKey && e.code.startsWith("Arrow")) {
    e.preventDefault();
    if (e.code === "ArrowRight") {
      win.col = Math.min(win.col + 1, GRID_COLS - win.w + 1);
      changed = true;
    } else if (e.code === "ArrowLeft") {
      win.col = Math.max(win.col - 1, 1);
      changed = true;
    } else if (e.code === "ArrowDown") {
      win.row = Math.min(win.row + 1, GRID_ROWS - win.h + 1);
      changed = true;
    } else if (e.code === "ArrowUp") {
      win.row = Math.max(win.row - 1, 1);
      changed = true;
    }
  }

  if (changed) {
    if (
      pushMode &&
      (oldCol !== win.col ||
        oldRow !== win.row ||
        oldW !== win.w ||
        oldH !== win.h)
    ) {
      applyPush(activeWindowId);
    }
    renderLayout();
    const activeTab = document.querySelector("#tabs button.active");
    if (activeTab) saveLayout(activeTab.dataset.tab);
  }
});

// LAYOUT EDIT MODE - Extras (P pour push, R pour reset)
document.addEventListener("keydown", (e) => {
  if (!layoutEditMode) return;

  if (e.code === "KeyP") {
    e.preventDefault();
    pushMode = !pushMode;
    document.body.classList.toggle("push-on", pushMode);
  }

  if (e.code === "KeyR") {
    e.preventDefault();
    const activeTab = document.querySelector("#tabs button.active");
    if (!activeTab) return;
    const tabName = activeTab.dataset.tab;
    if (confirm(`Reset layout "${tabName}" to default?`)) {
      resetLayout(tabName);
      loadLayout(tabName);
    }
  }
});

loadLayout("1main");
