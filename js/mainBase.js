document.querySelectorAll("#top-bar button").forEach((btn) => {
  btn.addEventListener("click", () => {
    loadTab(btn.dataset.tab);
  });
});

document.addEventListener("keydown", (e) => {
  if (layoutEditMode) return;
  if (e.code.startsWith("Digit") && e.getModifierState("Shift")) {
    e.preventDefault();
    const btn = document.querySelector(`#top-bar button[data-key="${e.code}"]`);
    if (btn) loadTab(btn.dataset.tab);
  }
});

function loadTab(name) {
  if (typeof loadLayout === "function") {
    loadLayout(name);
  }

  document.querySelectorAll("#tabs button").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.tab === name);
  });
}

let li = 35, si = 74, cpu = 12, ram = 768, vol = 11, bat = 74;

function updateAllStats() {
  li += Math.random() * 8 - 4;
  si += Math.random() * 9 - 3;
  cpu += Math.random() * 4 - 2;
  ram += Math.random() * 12 - 6;
  bat -= 0.02;

  li = Math.max(0, Math.min(100, li));
  si = Math.max(0, Math.min(100, si));
  cpu = Math.max(1, Math.min(95, cpu));
  ram = Math.max(256, Math.min(4096, ram));
  vol = Math.max(0, Math.min(100, vol));
  bat = Math.max(0, bat);

  document.getElementById("stat-wifi").textContent = `WIFI Li: ${li.toFixed(0)} Si: ${si.toFixed(0)}`;
  document.getElementById("stat-cpu").textContent = `CPU ${cpu.toFixed(0)}%`;
  document.getElementById("stat-ram").textContent = `RAM ${ram.toFixed(0)}mb`;
  document.getElementById("stat-vol").textContent = `VOL ${vol}`;
  document.getElementById("stat-bat").textContent = `BAT ${bat.toFixed(0)}%`;
}

setInterval(updateAllStats, 1000);