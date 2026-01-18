import { createFUIWindow } from "../core/template.js";
import { setupKeyboardHandler, setupClickHandler } from "../core/utils.js";

const CLASSIFIED_FILES = {
  "/": {
    name: "ROOT",
    type: "dir",
    size: "---",
    modified: "---",
    classification: "RESTRICTED",
    tags: ["system"],
    children: {
      "diplomatic-cables": {
        name: "diplomatic-cables",
        type: "dir",
        size: "2.4GB",
        modified: "2024-11-15",
        classification: "SECRET",
        tags: ["cables", "diplomatic"],
        children: {
          "us-embassy-berlin.enc": {
            name: "us-embassy-berlin.enc",
            type: "file",
            size: "156MB",
            modified: "2024-11-12",
            classification: "SECRET//NOFORN",
            tags: ["encrypted", "diplomatic", "europe"],
          },
          "nato-summit-2024.pdf": {
            name: "nato-summit-2024.pdf",
            type: "file",
            size: "89MB",
            modified: "2024-10-28",
            classification: "CONFIDENTIAL",
            tags: ["nato", "summit", "classified"],
          },
        },
      },
      surveillance: {
        name: "surveillance",
        type: "dir",
        size: "1.8GB",
        modified: "2024-12-01",
        classification: "TOP SECRET",
        tags: ["sigint", "surveillance"],
        children: {
          "prism-documents": {
            name: "prism-documents",
            type: "dir",
            size: "890MB",
            modified: "2024-11-20",
            classification: "TOP SECRET//SI",
            tags: ["nsa", "prism", "fisa"],
            children: {
              "targets-list.db": {
                name: "targets-list.db",
                type: "file",
                size: "245MB",
                modified: "2024-11-18",
                classification: "TOP SECRET//SI//NOFORN",
                tags: ["database", "targets", "active"],
              },
            },
          },
          "backdoor-implants.zip": {
            name: "backdoor-implants.zip",
            type: "file",
            size: "523MB",
            modified: "2024-11-25",
            classification: "TOP SECRET//SI",
            tags: ["malware", "exploits", "zero-day"],
          },
        },
      },
      "military-ops": {
        name: "military-ops",
        type: "dir",
        size: "3.1GB",
        modified: "2024-10-15",
        classification: "SECRET",
        tags: ["military", "operations"],
        children: {
          "drone-strike-logs.csv": {
            name: "drone-strike-logs.csv",
            type: "file",
            size: "78MB",
            modified: "2024-10-12",
            classification: "SECRET//REL",
            tags: ["drone", "strike", "combat"],
          },
          "collateral-damage.xlsx": {
            name: "collateral-damage.xlsx",
            type: "file",
            size: "12MB",
            modified: "2024-09-30",
            classification: "SECRET",
            tags: ["casualties", "civilian", "redacted"],
          },
        },
      },
      financial: {
        name: "financial",
        type: "dir",
        size: "567MB",
        modified: "2024-12-10",
        classification: "CONFIDENTIAL",
        tags: ["finance", "banking"],
        children: {
          "offshore-accounts.db": {
            name: "offshore-accounts.db",
            type: "file",
            size: "234MB",
            modified: "2024-12-08",
            classification: "CONFIDENTIAL",
            tags: ["banking", "offshore", "panama"],
          },
          "shell-companies.json": {
            name: "shell-companies.json",
            type: "file",
            size: "45MB",
            modified: "2024-12-05",
            classification: "CONFIDENTIAL",
            tags: ["corporate", "shell", "tax-haven"],
          },
        },
      },
      "blacksite-ops": {
        name: "blacksite-ops",
        type: "dir",
        size: "1.2GB",
        modified: "2024-11-30",
        classification: "TOP SECRET//SPECIAL ACCESS",
        tags: ["cia", "detention", "interrogation"],
        children: {
          "rendition-manifest.pdf": {
            name: "rendition-manifest.pdf",
            type: "file",
            size: "67MB",
            modified: "2024-11-28",
            classification: "TOP SECRET//NOFORN",
            tags: ["rendition", "transport", "detainee"],
          },
        },
      },
    },
  },
};

const state = {
  openFolders: new Set([]),
  selectedIndex: 0,
  flatList: [],
  currentPath: "/",
};

function buildFlatList(tree = CLASSIFIED_FILES, depth = 0, parentPath = "") {
  const list = [];

  Object.entries(tree).forEach(([key, data]) => {
    const fullPath = parentPath ? `${parentPath}/${key}` : key;
    list.push({ key, data, depth, path: fullPath });

    if (
      data.type === "dir" &&
      state.openFolders.has(fullPath) &&
      data.children
    ) {
      list.push(...buildFlatList(data.children, depth + 1, fullPath));
    }
  });

  return list;
}

function getClassificationColor(classification) {
  if (classification.includes("TOP SECRET")) return "#c10000";
  if (classification.includes("SECRET")) return "#9cff9c";
  if (classification.includes("CONFIDENTIAL")) return "#6aff6a";
  return "#9cff9c";
}

function render() {
  state.flatList = buildFlatList();

  const rows = state.flatList
    .map((item, index) => {
      const { key, data, depth, path } = item;
      const isSelected = index === state.selectedIndex;
      const isOpen = state.openFolders.has(path);
      const indent = depth * 16;

      let icon = "";
      if (data.type === "dir") {
        icon = isOpen ? "📂" : "📁";
      } else {
        if (data.name.includes(".enc")) icon = "🔒";
        else if (data.name.includes(".pdf")) icon = "📄";
        else if (data.name.includes(".db")) icon = "💾";
        else if (data.name.includes(".zip")) icon = "📦";
        else if (data.name.includes(".csv") || data.name.includes(".xlsx"))
          icon = "📊";
        else if (data.name.includes(".json")) icon = "📋";
        else icon = "📄";
      }

      const classColor = getClassificationColor(data.classification);
      const tags = data.tags
        .map((tag) => `<span class="secfs-tag">${tag}</span>`)
        .join(" ");

      return `
        <div class="secfs-row ${isSelected ? "row-selected" : ""}" data-index="${index}" data-path="${path}">
          <span class="secfs-name" style="padding-left: ${indent}px">${icon} ${data.name}</span>
          <span class="secfs-size">${data.size}</span>
          <span class="secfs-modified">${data.modified}</span>
          <span class="secfs-classification" style="color: ${classColor}">${data.classification}</span>
          <span class="secfs-tags">${tags}</span>
        </div>
      `;
    })
    .join("");

  const totalFiles = state.flatList.filter(
    (item) => item.data.type === "file",
  ).length;
  const totalDirs = state.flatList.filter(
    (item) => item.data.type === "dir",
  ).length;

  return `
    <div class="secfs-container">
      <div class="secfs-header">
        <span>NAME</span>
        <span>SIZE</span>
        <span>MODIFIED</span>
        <span>CLASSIFICATION</span>
        <span>TAGS</span>
      </div>
      
      <div class="secfs-body">
        ${rows || '<div class="secfs-empty">No files available</div>'}
      </div>
      
      <div class="secfs-footer">
        <span>Files: ${totalFiles} | Dirs: ${totalDirs}</span>
        <span>Path: ${state.currentPath}</span>
        <span>[↑↓] Navigate | [ENTER] Open | [BACKSPACE] Up</span>
      </div>
    </div>
  `;
}

function scrollToSelected() {
  const container = document.querySelector("#dist-files .secfs-body");
  const selectedRow = document.querySelector("#dist-files .row-selected");

  if (container && selectedRow) {
    const containerRect = container.getBoundingClientRect();
    const rowRect = selectedRow.getBoundingClientRect();

    if (rowRect.top < containerRect.top) {
      selectedRow.scrollIntoView({ block: "start", behavior: "smooth" });
    } else if (rowRect.bottom > containerRect.bottom) {
      selectedRow.scrollIntoView({ block: "end", behavior: "smooth" });
    }
  }
}

function handleToggle() {
  const selected = state.flatList[state.selectedIndex];
  if (!selected || selected.data.type !== "dir") return;

  const path = selected.path;
  if (state.openFolders.has(path)) {
    state.openFolders.delete(path);
  } else {
    state.openFolders.add(path);
  }

  filesWindow.forceRender();
}

function handleNavigateUp() {
  state.selectedIndex = Math.max(0, state.selectedIndex - 1);
  filesWindow.forceRender();
  scrollToSelected();
}

function handleNavigateDown() {
  state.selectedIndex = Math.min(
    state.flatList.length - 1,
    state.selectedIndex + 1,
  );
  filesWindow.forceRender();
  scrollToSelected();
}

let cleanupKeyboard = null;
let cleanupClick = null;

function setupInteractions() {
  if (cleanupKeyboard) cleanupKeyboard();
  if (cleanupClick) cleanupClick();

  cleanupKeyboard = setupKeyboardHandler("dist-files", {
    ArrowUp: handleNavigateUp,
    ArrowDown: handleNavigateDown,
    Enter: handleToggle,
  });

  cleanupClick = setupClickHandler("dist-files", ".secfs-row", (e, target) => {
    const index = parseInt(target.dataset.index);
    state.selectedIndex = index;

    const selected = state.flatList[index];
    if (selected && selected.data.type === "dir") {
      handleToggle();
    } else {
      filesWindow.forceRender();
    }
  });
}

const filesWindow = createFUIWindow({
  id: "dist-files",
  render,
  update: null,
  interval: null,
  defaultMode: "default",
});

export function startDISTFiles() {
  filesWindow.start();
  setTimeout(setupInteractions, 100);
}

export function stopDISTFiles() {
  filesWindow.stop();
  if (cleanupKeyboard) cleanupKeyboard();
  if (cleanupClick) cleanupClick();
}
