const DEFAULT_SPEED = 1.0;
const MIN_SPEED = 0.1;
const MAX_SPEED = 4.0;

const listeners = new Set();
let currentSpeed = DEFAULT_SPEED;

function clamp01(value) {
  return Math.max(0, Math.min(1, value));
}

function clampSpeed(value) {
  if (!Number.isFinite(value)) return DEFAULT_SPEED;
  return Math.max(MIN_SPEED, Math.min(MAX_SPEED, value));
}

function notifySpeedChange() {
  for (const listener of listeners) listener(currentSpeed);
}

function setCurrentSpeed(nextSpeed) {
  const clamped = clampSpeed(Number(nextSpeed));
  if (Math.abs(clamped - currentSpeed) < 1e-9) return;
  currentSpeed = clamped;
  notifySpeedChange();
}

export function getSimulationSpeed() {
  return currentSpeed;
}

export function setSimulationSpeed(nextSpeed) {
  setCurrentSpeed(nextSpeed);
}

export function effectiveDt(baseDt, options = {}) {
  const base = Number(baseDt);
  if (!Number.isFinite(base)) return baseDt;
  if (currentSpeed >= DEFAULT_SPEED) return base;

  const minOption = Number(options.min);
  const minDt = Number.isFinite(minOption) ? Math.max(0, Math.min(base, minOption)) : base * MIN_SPEED;
  const t = clamp01((currentSpeed - MIN_SPEED) / (DEFAULT_SPEED - MIN_SPEED));
  return minDt + (base - minDt) * t;
}

export function effectiveStepsPerFrame(baseSteps, options = {}) {
  const minOption = Number(options.min);
  const maxOption = Number(options.max);
  const minSteps = Number.isFinite(minOption) ? Math.max(0, Math.floor(minOption)) : 0;
  const base = Math.max(minSteps, Math.round(Number(baseSteps) || 0));

  if (currentSpeed <= DEFAULT_SPEED) return base;

  const maxSteps = Number.isFinite(maxOption)
    ? Math.max(base, Math.floor(maxOption))
    : Math.max(base, Math.ceil(base * MAX_SPEED));
  const t = clamp01((currentSpeed - DEFAULT_SPEED) / (MAX_SPEED - DEFAULT_SPEED));
  return Math.max(base, Math.min(maxSteps, Math.ceil(base + (maxSteps - base) * t)));
}

export function onSimulationSpeedChange(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function initSimulationSpeedControl(options = {}) {
  const { onChange = null } = options;
  const unsubscribeChange = onChange ? onSimulationSpeedChange(onChange) : () => {};

  return {
    destroy() {
      unsubscribeChange();
    },
  };
}

window.addEventListener("message", (event) => {
  if (event.origin !== window.location.origin) return;
  if (event.data?.type !== "qontic:set-speed") return;
  setCurrentSpeed(event.data.speed);
});
