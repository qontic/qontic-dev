const SPEED_STORAGE_KEY = "qontic:simulationSpeed";
const CONTROL_HIDDEN_STORAGE_KEY = "qontic:simulationSpeedControlHidden";
const DEFAULT_SPEED = 1.0;
const MIN_SPEED = 0.1;
const MAX_SPEED = 4.0;
const SPEED_STEP = 0.05;

const listeners = new Set();
let controlCount = 0;

function clampSpeed(value) {
  if (!Number.isFinite(value)) return DEFAULT_SPEED;
  return Math.max(MIN_SPEED, Math.min(MAX_SPEED, value));
}

function readStorage(key) {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorage(key, value) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Simulations should still work when storage is unavailable.
  }
}

function parseStoredSpeed(value) {
  if (value === null || value === "") return DEFAULT_SPEED;
  return clampSpeed(Number(value));
}

let currentSpeed = parseStoredSpeed(readStorage(SPEED_STORAGE_KEY));

function notifySpeedChange() {
  for (const listener of listeners) listener(currentSpeed);
}

function setCurrentSpeed(nextSpeed, persist = true) {
  const clamped = clampSpeed(nextSpeed);
  if (Math.abs(clamped - currentSpeed) < 1e-9) return;
  currentSpeed = clamped;
  if (persist) writeStorage(SPEED_STORAGE_KEY, String(clamped));
  notifySpeedChange();
}

function readHiddenState() {
  return readStorage(CONTROL_HIDDEN_STORAGE_KEY) === "1";
}

function writeHiddenState(hidden) {
  writeStorage(CONTROL_HIDDEN_STORAGE_KEY, hidden ? "1" : "0");
}

function formatSpeed(value) {
  return `${value.toFixed(2).replace(/\.?0+$/, "")}x`;
}

function injectStyles() {
  if (document.getElementById("qontic-simulation-speed-styles")) return;

  const style = document.createElement("style");
  style.id = "qontic-simulation-speed-styles";
  style.textContent = `
    .qontic-speed-control {
      position: fixed;
      z-index: 10000;
      top: var(--qontic-speed-top, 12px);
      left: 50%;
      width: min(330px, calc(100vw - 24px));
      transform: translateX(-50%);
      color: #eaf4ff;
      font: 12px/1.25 system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      pointer-events: none;
    }
    .qontic-speed-control[data-host="page"] {
      left: auto;
      right: 16px;
      width: min(320px, calc(100vw - 32px));
      transform: none;
    }
    .qontic-speed-control__panel,
    .qontic-speed-control__tab {
      pointer-events: auto;
      border: 1px solid rgba(128, 186, 255, 0.34);
      border-radius: 8px;
      background: rgba(7, 18, 38, 0.86);
      box-shadow: 0 10px 32px rgba(0, 0, 0, 0.28);
      backdrop-filter: blur(10px);
    }
    .qontic-speed-control__panel {
      display: grid;
      grid-template-columns: auto minmax(90px, 1fr) auto auto;
      align-items: center;
      gap: 8px;
      padding: 8px 9px;
    }
    .qontic-speed-control__label {
      color: #b9cce5;
      font-weight: 700;
      letter-spacing: 0.02em;
      white-space: nowrap;
    }
    .qontic-speed-control__slider {
      width: 100%;
      min-width: 0;
      accent-color: #58a6ff;
      cursor: pointer;
    }
    .qontic-speed-control__value {
      min-width: 42px;
      color: #fff;
      font-variant-numeric: tabular-nums;
      text-align: right;
      white-space: nowrap;
    }
    .qontic-speed-control__button,
    .qontic-speed-control__tab {
      color: #fff;
      cursor: pointer;
      font: inherit;
    }
    .qontic-speed-control__button {
      width: 28px;
      height: 26px;
      padding: 0;
      border: 1px solid rgba(128, 186, 255, 0.28);
      border-radius: 6px;
      background: rgba(88, 166, 255, 0.13);
      line-height: 1;
    }
    .qontic-speed-control__button:hover,
    .qontic-speed-control__tab:hover {
      background: rgba(88, 166, 255, 0.22);
    }
    .qontic-speed-control__tab {
      display: none;
      align-items: center;
      gap: 6px;
      margin-left: auto;
      padding: 7px 10px;
      border-radius: 8px;
    }
    .qontic-speed-control__tab-value {
      color: #fff;
      font-variant-numeric: tabular-nums;
    }
    .qontic-speed-control.is-collapsed .qontic-speed-control__panel {
      display: none;
    }
    .qontic-speed-control.is-collapsed .qontic-speed-control__tab {
      display: inline-flex;
    }
    @media (max-width: 560px) {
      .qontic-speed-control,
      .qontic-speed-control[data-host="page"] {
        left: 10px;
        right: 10px;
        width: auto;
        transform: none;
      }
      .qontic-speed-control__panel {
        grid-template-columns: auto minmax(70px, 1fr) auto auto;
      }
    }
  `;
  document.head.appendChild(style);
}

function positionForNotebookPage(root) {
  const banner = document.querySelector(".site-banner");
  if (!banner) return () => {};

  root.dataset.host = "page";
  let resizeObserver = null;

  const updateTopOffset = () => {
    const height = Math.ceil(banner.getBoundingClientRect().height);
    root.style.setProperty("--qontic-speed-top", `${height + 10}px`);
  };

  updateTopOffset();
  window.addEventListener("resize", updateTopOffset);
  if ("ResizeObserver" in window) {
    resizeObserver = new ResizeObserver(updateTopOffset);
    resizeObserver.observe(banner);
  }

  return () => {
    window.removeEventListener("resize", updateTopOffset);
    resizeObserver?.disconnect();
  };
}

export function getSimulationSpeed() {
  return currentSpeed;
}

export function setSimulationSpeed(nextSpeed) {
  setCurrentSpeed(nextSpeed);
}

export function effectiveDt(baseDt) {
  return baseDt * currentSpeed;
}

export function onSimulationSpeedChange(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function initSimulationSpeedControl(options = {}) {
  const {
    visible = true,
    parent = document.body,
    onChange = null,
  } = options;

  const unsubscribeChange = onChange ? onSimulationSpeedChange(onChange) : () => {};
  if (!visible || !parent) return { destroy: unsubscribeChange };

  injectStyles();

  const root = document.createElement("div");
  root.className = "qontic-speed-control";
  root.id = `qontic-speed-control-${++controlCount}`;
  root.setAttribute("aria-label", "Simulation speed control");

  const panel = document.createElement("div");
  panel.className = "qontic-speed-control__panel";

  const label = document.createElement("div");
  label.className = "qontic-speed-control__label";
  label.textContent = "Speed";

  const slider = document.createElement("input");
  slider.className = "qontic-speed-control__slider";
  slider.type = "range";
  slider.min = String(MIN_SPEED);
  slider.max = String(MAX_SPEED);
  slider.step = String(SPEED_STEP);
  slider.value = String(currentSpeed);
  slider.setAttribute("aria-label", "Simulation speed");

  const value = document.createElement("div");
  value.className = "qontic-speed-control__value";

  const hideButton = document.createElement("button");
  hideButton.className = "qontic-speed-control__button";
  hideButton.type = "button";
  hideButton.textContent = "x";
  hideButton.title = "Hide speed control";
  hideButton.setAttribute("aria-label", "Hide speed control");

  const tab = document.createElement("button");
  tab.className = "qontic-speed-control__tab";
  tab.type = "button";
  tab.title = "Show speed control";
  tab.setAttribute("aria-label", "Show speed control");

  const tabLabel = document.createElement("span");
  tabLabel.textContent = "Speed";

  const tabValue = document.createElement("span");
  tabValue.className = "qontic-speed-control__tab-value";

  tab.appendChild(tabLabel);
  tab.appendChild(tabValue);
  panel.appendChild(label);
  panel.appendChild(slider);
  panel.appendChild(value);
  panel.appendChild(hideButton);
  root.appendChild(panel);
  root.appendChild(tab);
  parent.appendChild(root);

  const sync = () => {
    const formatted = formatSpeed(currentSpeed);
    slider.value = String(currentSpeed);
    value.textContent = formatted;
    tabValue.textContent = formatted;
  };

  const setCollapsed = (collapsed) => {
    root.classList.toggle("is-collapsed", collapsed);
    writeHiddenState(collapsed);
  };

  slider.addEventListener("input", () => {
    setCurrentSpeed(Number(slider.value));
  });
  hideButton.addEventListener("click", () => setCollapsed(true));
  tab.addEventListener("click", () => setCollapsed(false));

  sync();
  setCollapsed(readHiddenState());

  const unsubscribeSync = onSimulationSpeedChange(sync);
  const cleanupPositioning = positionForNotebookPage(root);

  return {
    destroy() {
      unsubscribeChange();
      unsubscribeSync();
      cleanupPositioning();
      root.remove();
    },
  };
}

window.addEventListener("storage", (event) => {
  if (event.key !== SPEED_STORAGE_KEY) return;
  setCurrentSpeed(parseStoredSpeed(event.newValue), false);
});
