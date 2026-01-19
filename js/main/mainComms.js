import { createFUIWindow } from "../core/template.js";
import { setupKeyboardHandler, setupClickHandler } from "../core/utils.js";

const FILE_SYSTEM = {
  "": {
    size: "Up-Dir",
    modify: "",
    children: {},
  },
  archive: {
    size: 24576,
    modify: "16:43",
    children: {
      2019: {
        size: 12288,
        modify: "14:22",
        children: {
          jan: { size: 2048, modify: "09:12", children: {} },
          feb: { size: 3072, modify: "10:44", children: {} },
        },
      },
      2020: {
        size: 18432,
        modify: "15:11",
        children: {
          mar: { size: 4096, modify: "11:03", children: {} },
          apr: { size: 5120, modify: "12:50", children: {} },
        },
      },
    },
  },
  assets: {
    size: 4096,
    modify: "14:23",
    children: {
      images: {
        size: 2048,
        modify: "11:22",
        children: {
          ui: { size: 512, modify: "09:21", children: {} },
          icons: { size: 384, modify: "08:55", children: {} },
        },
      },
      videos: {
        size: 8192,
        modify: "16:44",
        children: {
          promo: { size: 4096, modify: "13:11", children: {} },
          raw: { size: 12288, modify: "18:01", children: {} },
        },
      },
    },
  },
  boot: {
    size: 28488,
    modify: "13:52",
    children: {
      grub: {
        size: 512,
        modify: "10:11",
        children: {
          cfg: { size: 128, modify: "10:10", children: {} },
        },
      },
      initrd: {
        size: 24576,
        modify: "13:52",
        children: {},
      },
    },
  },
  "cgi-ssh": {
    size: 1582,
    modify: "02:21",
    children: {
      bin: {
        size: 256,
        modify: "02:20",
        children: {
          connect: { size: 64, modify: "02:18", children: {} },
        },
      },
      config: {
        size: 1024,
        modify: "02:21",
        children: {},
      },
    },
  },
  database: {
    size: 3423,
    modify: "12:48",
    children: {
      users: {
        size: 890,
        modify: "15:32",
        children: {
          index: { size: 256, modify: "15:30", children: {} },
        },
      },
      logs: {
        size: 2048,
        modify: "18:22",
        children: {
          error: { size: 512, modify: "18:20", children: {} },
          access: { size: 768, modify: "18:21", children: {} },
        },
      },
    },
  },
  "disk-util": {
    size: 4098,
    modify: "19:21",
    children: {
      fsck: {
        size: 2048,
        modify: "19:21",
        children: {},
      },
      mount: {
        size: 1024,
        modify: "19:20",
        children: {},
      },
    },
  },
  info: {
    size: 1823,
    modify: "11:03",
    children: {
      readme: { size: 512, modify: "11:03", children: {} },
      license: { size: 1024, modify: "11:02", children: {} },
    },
  },
  ntpppd: {
    size: 2356,
    modify: "21:13",
    children: {
      conf: { size: 256, modify: "21:13", children: {} },
      drift: { size: 128, modify: "21:10", children: {} },
    },
  },
  security: {
    size: 7,
    modify: "10:08",
    children: {
      keys: {
        size: 512,
        modify: "10:08",
        children: {
          rsa: { size: 128, modify: "10:07", children: {} },
        },
      },
      certs: {
        size: 1024,
        modify: "10:07",
        children: {},
      },
    },
  },
  software_updt: {
    size: 32750,
    modify: "00:02",
    children: {
      patches: {
        size: 16384,
        modify: "00:02",
        children: {
          core: { size: 4096, modify: "00:01", children: {} },
        },
      },
      updates: {
        size: 8192,
        modify: "23:55",
        children: {},
      },
    },
  },
  startup: {
    size: 50,
    modify: "07:34",
    children: {
      "init.d": {
        size: 256,
        modify: "07:34",
        children: {
          net: { size: 64, modify: "07:30", children: {} },
        },
      },
    },
  },
  track_ip: {
    size: 1982,
    modify: "04:23",
    children: {
      logs: {
        size: 4096,
        modify: "04:23",
        children: {
          today: { size: 512, modify: "04:21", children: {} },
          yesterday: { size: 768, modify: "03:58", children: {} },
        },
      },
    },
  },
};

const state = {
  openFolders: new Set(),
  selectedIndex: 0,
  flatList: [],
};

function buildFlatList(tree, depth = 0, list = []) {
  Object.entries(tree).forEach(([name, data]) => {
    list.push({ name, data, depth });
    if (state.openFolders.has(name)) {
      buildFlatList(data.children, depth + 1, list);
    }
  });
  return list;
}

function renderRow(name, data, depth, index) {
  const hasChildren = Object.keys(data.children).length > 0;
  const isOpen = state.openFolders.has(name);
  const icon = hasChildren ? (isOpen ? "/ ▼" : "/.") : "/..";
  const indent = depth * 16;
  const isSelected = index === state.selectedIndex;

  return `
    <div class="fb-row ${isSelected ? "selected" : ""}" data-folder="${name}" data-index="${index}">
      <span class="fb-n"></span>
      <span class="fb-name" style="padding-left:${6 + indent}px">${icon} ${name}</span>
      <span class="fb-size">${data.size}</span>
      <span class="fb-modify">${data.modify}</span>
    </div>
  `;
}

function render() {
  state.flatList = buildFlatList(FILE_SYSTEM);

  const rows = state.flatList
    .map((item, index) => renderRow(item.name, item.data, item.depth, index))
    .join("");

  return `
    <div class="files-container">
      <div class="fb-header">
        <span class="fb-h-n">^n</span>
        <span class="fb-h-name">Name</span>
        <span class="fb-h-size">Size</span>
        <span class="fb-h-modify">Modify</span>
      </div>
      <div class="fb-body">
        <div class="fb-body-separators">
          <span></span>
          <span></span>
          <span class="fb-sep-line"></span>
          <span class="fb-sep-line"></span>
        </div>
        ${rows}
      </div>
      <div class="fb-footer">
        <div class="fb-line"></div>
        <div class="fb-footer-row">
          <span>Up -- Dir</span>
        </div>
        <div class="fb-line-data">
          <span class="fb-line short"></span>
          <span>12.5/60GB (20I)</span>
        </div>
      </div>
    </div>
  `;
}

function scrollToSelected() {
  const body = document.querySelector("#main-comms .fb-body");
  const selectedRow = document.querySelector("#main-comms .fb-row.selected");

  if (body && selectedRow) {
    const bodyRect = body.getBoundingClientRect();
    const rowRect = selectedRow.getBoundingClientRect();

    if (rowRect.top < bodyRect.top) {
      selectedRow.scrollIntoView({ block: "start", behavior: "smooth" });
    } else if (rowRect.bottom > bodyRect.bottom) {
      selectedRow.scrollIntoView({ block: "end", behavior: "smooth" });
    }
  }
}

function handleToggle() {
  const selected = state.flatList[state.selectedIndex];
  if (!selected) return;

  const name = selected.name;
  const hasChildren = Object.keys(selected.data.children).length > 0;

  if (hasChildren) {
    if (state.openFolders.has(name)) {
      state.openFolders.delete(name);
    } else {
      state.openFolders.add(name);
    }
    filesWindow.forceRender();
  }
}

function handleNavigateUp() {
  state.selectedIndex = Math.max(state.selectedIndex - 1, 0);
  filesWindow.forceRender();
  scrollToSelected();
}

function handleNavigateDown() {
  const maxIndex = state.flatList.length - 1;
  state.selectedIndex = Math.min(state.selectedIndex + 1, maxIndex);
  filesWindow.forceRender();
  scrollToSelected();
}

let cleanupKeyboard = null;
let cleanupClick = null;

function setupInteractions() {
  if (cleanupKeyboard) cleanupKeyboard();
  if (cleanupClick) cleanupClick();

  cleanupKeyboard = setupKeyboardHandler("main-comms", {
    ArrowDown: handleNavigateDown,
    ArrowUp: handleNavigateUp,
    Enter: handleToggle,
  });

  cleanupClick = setupClickHandler("main-comms", ".fb-row", (e, target) => {
    const index = parseInt(target.dataset.index);
    const name = target.dataset.folder;

    state.selectedIndex = index;

    if (name) {
      const selected = state.flatList[index];
      const hasChildren = Object.keys(selected.data.children).length > 0;

      if (hasChildren) {
        if (state.openFolders.has(name)) {
          state.openFolders.delete(name);
        } else {
          state.openFolders.add(name);
        }
      }
    }

    filesWindow.forceRender();
  });
}

const filesWindow = createFUIWindow({
  id: "main-comms",
  render,
  update: null,
  interval: null,
  defaultMode: "default",
});

export function startMainComms() {
  filesWindow.start();
  setTimeout(setupInteractions, 100);
}

export function stopMainComms() {
  filesWindow.stop();
  if (cleanupKeyboard) cleanupKeyboard();
  if (cleanupClick) cleanupClick();
}
