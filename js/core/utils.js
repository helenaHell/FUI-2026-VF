/* =============================================
   UTILS.JS - Centralized keyboard & interaction handling
   ============================================= */

// IMPORTANT: Vérifie "locked" (pas "active") car "active" n'existe qu'en edit mode
export function isWindowActive(windowId) {
  const el = document.getElementById(windowId);
  // Vérifie locked ET que le body n'est pas en layout-edit mode
  return (
    el &&
    el.classList.contains("locked") &&
    !document.body.classList.contains("layout-edit")
  );
}

export function isWindowLocked(windowId) {
  const el = document.getElementById(windowId);
  return el && el.classList.contains("locked");
}

export function setupKeyboardHandler(windowId, handlers) {
  const keydownHandler = (e) => {
    if (!isWindowActive(windowId)) return;

    const handler = handlers[e.code] || handlers[e.key];
    if (handler) {
      e.preventDefault();
      e.stopPropagation();
      handler(e);
    }
  };

  document.addEventListener("keydown", keydownHandler);

  return () => document.removeEventListener("keydown", keydownHandler);
}

export function setupClickHandler(windowId, selector, callback) {
  const clickHandler = (e) => {
    const target = e.target.closest(selector);
    if (!target) return;

    const windowEl = document.getElementById(windowId);
    if (!windowEl || !windowEl.contains(target)) return;

    e.stopPropagation();
    callback(e, target);
  };

  document.addEventListener("click", clickHandler);

  return () => document.removeEventListener("click", clickHandler);
}

export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export function throttle(func, limit) {
  let inThrottle;
  return function (...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

export function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function randomFloat(min, max) {
  return Math.random() * (max - min) + min;
}

export function randomChoice(array) {
  return array[Math.floor(Math.random() * array.length)];
}

export function formatTime(date = new Date()) {
  return date.toLocaleTimeString("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export function formatDate(date = new Date()) {
  return date.toISOString().substring(0, 10);
}

export function formatBytes(bytes) {
  if (bytes === 0) return "0B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)}${sizes[i]}`;
}

export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export function lerp(start, end, t) {
  return start + (end - start) * t;
}

export function scrollToElement(element, options = {}) {
  const defaultOptions = {
    block: "nearest",
    inline: "nearest",
    behavior: "smooth",
  };
  element.scrollIntoView({ ...defaultOptions, ...options });
}

export function getScrollParent(element) {
  let parent = element.parentElement;
  while (parent) {
    const overflow = window.getComputedStyle(parent).overflow;
    if (overflow.includes("auto") || overflow.includes("scroll")) {
      return parent;
    }
    parent = parent.parentElement;
  }
  return document.documentElement;
}
