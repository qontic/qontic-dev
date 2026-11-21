const canvas = document.getElementById("c");
const status = document.getElementById("gpu-status");
const statusTitle = document.getElementById("gpu-status-title");
const gpuHelp = document.getElementById("gpu-help");
const simulationButtons = [...document.querySelectorAll("#viewtools button")];

function showSimulationError(title, error) {
  statusTitle.textContent = title;
  gpuHelp.hidden = false;
  status.hidden = false;
  canvas.hidden = true;
  canvas.closest(".stage").classList.add("unavailable");
  document.getElementById("controls").inert = true;
  simulationButtons.forEach(button => { button.disabled = true; });
  document.getElementById("stats").textContent = "";
  canvas.dispatchEvent(new Event("stern-gerlach:unavailable"));
  console.error(title, error);
}

const TIMING = { start: performance.now() };
const mark = (name) => { TIMING[name] = Math.round(performance.now() - TIMING.start); };

async function getGpuDevice() {
  if (!navigator.gpu) throw new Error("WebGPU API unavailable");
  const options = [
    { powerPreference: "high-performance" },
    { powerPreference: "low-power" },
    {},
    { forceFallbackAdapter: true },
  ];
  let adapter = null;
  for (const hint of options) {
    adapter = await navigator.gpu.requestAdapter(hint);
    if (adapter) break;
  }
  if (!adapter) throw new Error("No WebGPU adapter available");

  const requiredLimits = {};
  for (const name of ["maxStorageBufferBindingSize", "maxBufferSize"]) {
    const value = adapter.limits[name];
    if (Number.isFinite(value) && value > 0) requiredLimits[name] = value;
  }
  const device = await adapter.requestDevice({ requiredLimits });
  return { device, adapterInfo: adapter.info };
}

const WAVE_WORKGROUP_SIZE = 256;
// Beam scale: the beam moves BEAM_SCALE times faster in grid units than in the first version
// (5.5·BEAM_SCALE cells per time unit) and every length along the beam is BEAM_SCALE times
// longer, so the flight time, the splitting and the lab units are unchanged. The atom's magnetic
// energy (ħ/2m)|B| ≈ 35 at the default gradient is then about 4% of its kinetic energy along the
// beam (it was 2.3 times the kinetic energy at BEAM_SCALE = 1; for silver it is ~10⁻⁴), and the
// packet's spread of speeds is 1.4% (it was 11%). Lengths along the beam are drawn shorter by
// the factor X_VIS, so the long flight fits the view.
const BEAM_SCALE = 8;
const BEAM_SPEED = 5.5 * BEAM_SCALE;
// Drawing compression along the beam (milder than BEAM_SCALE, so the short packet stays visible).
const X_VIS = 0.4;
const PARTICLE_WORKGROUP_SIZE = 128;

const SHADER_FILES = {
  common: "./shaders/common.wgsl?v=sg3d4",
  palette: "./shaders/palette.wgsl?v=sg3d4",
  waveInit: "./shaders/wave-init.wgsl?v=sg3d4",
  waveStep: "./shaders/wave-step.wgsl?v=sg3d4",
  particleUpdate: "./shaders/particle-update.wgsl?v=sg3d4",
  cloud: "./shaders/cloud.wgsl?v=sg3d4",
  particleRender: "./shaders/particle-render.wgsl?v=sg3d4",
  spinArrow: "./shaders/spin-arrow.wgsl?v=sg3d4",
  density: "./shaders/density.wgsl?v=sg3d4",
  boxShell: "./shaders/box-shell.wgsl?v=sg3d4",
  line: "./shaders/line.wgsl?v=sg3d4",
  fieldLine: "./shaders/field-line.wgsl?v=sg3d4",
  detectorPlate: "./shaders/detector-plate.wgsl?v=sg3d4",
  magnetPole: "./shaders/magnet-pole.wgsl?v=sg3d4",
  weightReduce: "./shaders/weight-reduce.wgsl?v=sg3d4",
  wave3dInit: "./shaders/wave3d-init.wgsl?v=sg3d4",
  wave3dStep: "./shaders/wave3d-step.wgsl?v=sg3d4",
  particleUpdate3d: "./shaders/particle-update-3d.wgsl?v=sg3d4",
};

function applyShaderConstants(source) {
  return source
    .replaceAll("${WAVE_WORKGROUP_SIZE}", String(WAVE_WORKGROUP_SIZE))
    .replaceAll("${PARTICLE_WORKGROUP_SIZE}", String(PARTICLE_WORKGROUP_SIZE))
    .replaceAll("${X_VIS}", X_VIS.toFixed(6));
}

async function fetchShader(path) {
  const response = await fetch(path);
  if (!response.ok) throw new Error(`Could not load shader ${path}: ${response.status} ${response.statusText}`);
  return applyShaderConstants(await response.text());
}

async function loadShaders() {
  const entries = await Promise.all(
    Object.entries(SHADER_FILES).map(async ([name, path]) => [name, await fetchShader(path)])
  );
  const parts = Object.fromEntries(entries);
  return {
    waveInit: parts.common + parts.waveInit,
    waveStep: parts.common + parts.waveStep,
    particleUpdate: parts.common + parts.particleUpdate,
    cloud: parts.common + parts.palette + parts.cloud,
    particleRender: parts.common + parts.particleRender,
    spinArrow: parts.common + parts.spinArrow,
    density: parts.common + parts.density,
    boxShell: parts.common + parts.boxShell,
    magnetPole: parts.common + parts.magnetPole,
    line: parts.common + parts.line,
    fieldLine: parts.common + parts.fieldLine,
    detectorPlate: parts.common + parts.detectorPlate,
    weightReduce: parts.common + parts.weightReduce,
    wave3dInit: parts.common + parts.wave3dInit,
    wave3dStep: parts.common + parts.wave3dStep,
    particleUpdate3d: parts.common + parts.particleUpdate3d,
  };
}

// Start shader downloads while the browser obtains its GPU device.
const shaderLoad = loadShaders().then(
  shaders => ({ shaders }),
  error => ({ error }),
);

let device, gpuContext, adapterInfo;
try {
  ({ device, adapterInfo } = await getGpuDevice());
  mark("device");
  gpuContext = canvas.getContext("webgpu");
  if (!gpuContext) throw new Error("WebGPU canvas context unavailable");
} catch (error) {
  showSimulationError("WebGPU is unavailable in this browser session", error);
  throw error;
}

let simulationAvailable = true;
device.lost.then(info => {
  simulationAvailable = false;
  showSimulationError("The WebGPU device stopped responding", info.message || info.reason);
});

const presentationFormat = navigator.gpu.getPreferredCanvasFormat();
const WAVE_CELL_BYTES = 32;
const DEFAULT_SG_GRADIENT = 3.0;
// Uniform field B0 = SG_FIELD_BIAS * gradient (also set in shaders/common.wgsl).
const SG_FIELD_BIAS = 2.0;  // default uniform part; presets set their own (magnetPreset().b0)
const TUNNEL_Z_SCALE = 2.0;
const maxWaveBytes = Math.min(device.limits.maxStorageBufferBindingSize, device.limits.maxBufferSize);
const maxWaveCellsByStorage = Math.max(32 ** 3, Math.floor(maxWaveBytes / WAVE_CELL_BYTES));

function zResolutionForBase(baseRes) {
  return Math.max(1, Math.round(baseRes * TUNNEL_Z_SCALE));
}

function voxelCountForBaseResolution(baseRes) {
  return baseRes * baseRes * zResolutionForBase(baseRes);
}

function maxBaseResolutionForCells(maxCells) {
  let baseRes = Math.floor(Math.cbrt(maxCells / TUNNEL_Z_SCALE));
  while (baseRes > 1 && voxelCountForBaseResolution(baseRes) > maxCells) baseRes--;
  return baseRes;
}

const maxResByStorage = maxBaseResolutionForCells(maxWaveCellsByStorage);
const maxResByDispatch = maxBaseResolutionForCells(device.limits.maxComputeWorkgroupsPerDimension * WAVE_WORKGROUP_SIZE);
const rawMaxSimRes = Math.min(256, maxResByStorage, maxResByDispatch);
const MAX_SIM_RES = Math.max(32, Math.floor(rawMaxSimRes / 4) * 4);

// Memory limits bound the grid, but they do not measure rendering speed.
const constrainedDevice = adapterInfo?.isFallbackAdapter || (navigator.deviceMemory ?? Infinity) <= 4;
const defaultGrid = Math.min(constrainedDevice ? 48 : 64, MAX_SIM_RES);

const params = {
  simRes: defaultGrid,
  stepsPerFrame: 8,
  boxScale: 2.5,
  cameraProjection: 0,

  hbar: 6.0,
  mass: 1.0,
  p0: BEAM_SPEED,
  dt: 0.01,

  packetX: 0.25,
  packetY: 0.5,
  packetZ: 0.5,
  packetSigma: 10.0,

  nParticles: 500,
  rhoMin: 1e-6,
  velClamp: 80.0,
  spinTerm: 1,
  magnetPreset: 0,
  spinTheta: 90,
  spinPhi: 0,          // lab +x: the equal superposition of +z and −z
  magnetAngle: 0,
  sgGradient: DEFAULT_SG_GRADIENT,
  sgFieldOn: 1,
  showFieldArrows: 1,
  fieldLineDensity: 2,   // n × n field lines per slice across the beam
  fieldArrowSpacing: 22, // cells along a field line between arrowheads
  showMagnet: 1,
  fieldShape: 0,   // 0 textbook (linear gradient), 1 knife edge (line pole)
  beamShape: 0,    // 0 round, 1 ribbon (wide across the beam, as the 1922 slit)
  showSpin: 1,
  showDotSpin: 0,
  screenDistance: 40 * BEAM_SCALE,
  approachCells: 30 * BEAM_SCALE,   // = APPROACH_CELLS
  magnetScale: 1,
  showAxes: 1,

  cloudGain: .05,
  cloudGamma: 0.7,
  cloudLowBoost: 0.9,
  cloudCutoff: 0.003,
  cloudPointSize: 80.,
  showPhase: 0,
  showCloud: 1,

  showParticles: 1,
  dotSize: 10.0,
  dotSigma: 0.28,
  dotGain: 2.0,

  showTrail: 1,
  trailHalfLife: 0.5,
  trailVisGain: 0.5,
  trailVisGamma: 1,
  trailStampGain: 0.45,
  trailWidth: 15.0,
  densityScale: 0.5,

  paletteId: 4,
};

const PALETTE_NAMES = [
  "Nebula",
  "Synthwave",
  "Viridis-ish",
  "Inferno-ish",
  "Ice",
  "Plasma Drift",
  "Arctic Aurora",
  "Solar Flare",
  "Cosmic Dust",
  "Neon Noir",
  "Pastel Mirage"
];

const GUIDING_MODE_NAMES = [
  "Pauli spinor"
];

// Lab axes (as in Griffiths): the beam travels along +y, z is up, x = y × z points across the
// beam. The grid keeps its own order (grid x = beam, grid y, grid z), so lab x = −grid y,
// lab y = grid x, lab z = grid z: a rotation by 90° about z, so all formulas keep their form.
const DEG = Math.PI / 180;
const labFromGrid = v => [-v[1], v[0], v[2]];
const gridFromLab = v => [v[1], -v[0], v[2]];
// Initial spin direction in lab axes: θ from +z, φ about z from +x toward +y (the beam).
// The spinor is (cos θ/2, e^{iφ} sin θ/2) in the lab ±z basis; on the grid φ is φ − 90°.
function spinVectorLab() {
  const t = params.spinTheta * DEG, p = params.spinPhi * DEG;
  return [Math.sin(t) * Math.cos(p), Math.sin(t) * Math.sin(p), Math.cos(t)];
}
// The same direction in grid axes (used for drawing, the dots and the prediction).
const spinVector = () => gridFromLab(spinVectorLab());
function spinLabel() {
  const v = spinVectorLab();
  const named = [
    ["+z", [0, 0, 1]], ["−z", [0, 0, -1]], ["+x (equal +z and −z)", [1, 0, 0]], ["−x", [-1, 0, 0]],
    ["+y (along the beam)", [0, 1, 0]], ["−y", [0, -1, 0]],
  ];
  for (const [name, d] of named) if (v[0] * d[0] + v[1] * d[1] + v[2] * d[2] > 1 - 1e-6) return name;
  return `θ = ${Math.round(params.spinTheta)}°, φ = ${Math.round(params.spinPhi)}°`;
}

let paused = false;
let autoRun = true;
// "pw": pilot wave (cloud and particles). "cpn": orthodox reading (cloud only, no particles).
let reading = "pw";
const dotsShown = () => reading === "pw" && params.showParticles;
const trailsShown = () => reading === "pw" && params.showTrail;
let rerunHoldStart = null;
// Set inside a frame; the reset runs after that frame is submitted, so the frame
// never refers to particle buffers that the reset destroys.
let rerunPending = false;
const RERUN_HOLD_MS = 1200;
let redrawPending = true;
const PAUSED_IDLE_MS = 180;

function requestRedraw() {
  redrawPending = true;
}

const coreControls = document.querySelector('[data-control-pane="core"]');
const displayControls = document.querySelector('[data-control-pane="display"]');
const advancedControls = document.querySelector('[data-control-pane="advanced"]');
let controls = coreControls;
const statsEl = document.getElementById("stats");
const viewGizmo = document.getElementById("viewGizmo");
const viewButtons = {
  XY: document.getElementById("viewXY"),
  XZ: document.getElementById("viewXZ"),
  YZ: document.getElementById("viewYZ"),
};

function fmt(v) {
  const av = Math.abs(v);
  if (av >= 1000 || (av > 0 && av < 0.01)) return v.toExponential(2);
  return v.toFixed(3).replace(/\.?0+$/, "");
}

// Slider value labels that show lab units; refreshed by updateStats once the grid exists.
const unitLabels = [];
function formatValue(key, v, format) {
  if (!format) return fmt(v);
  try { return format(v); } catch { return fmt(v); }
}
function refreshUnitLabels() {
  for (const { key, val, format } of unitLabels) val.textContent = formatValue(key, params[key], format);
}
function addSlider(key, label, min, max, step, onChange = null, format = null) {
  const row = document.createElement("div");
  row.className = "row";

  const lab = document.createElement("label");
  lab.textContent = label;

  const input = document.createElement("input");
  input.id = key;
  lab.htmlFor = input.id;
  input.type = "range";
  input.min = min;
  input.max = max;
  input.step = step;
  input.value = params[key];

  const val = document.createElement("div");
  val.className = "val";
  val.textContent = formatValue(key, params[key], format);
  if (format) unitLabels.push({ key, val, format });

  input.addEventListener("input", () => {
    const v = parseFloat(input.value);
    params[key] = v;
    val.textContent = formatValue(key, v, format);
    requestRedraw();
  });
  input.addEventListener("change", () => {
    if (onChange) onChange();
    requestRedraw();
  });

  row.appendChild(lab);
  row.appendChild(input);
  row.appendChild(val);
  controls.appendChild(row);
}

// A row of small buttons under a slider that set round values.
function addChips(key, values, onSet, format = v => `${v}°`) {
  const row = document.createElement("div");
  row.className = "row chip-row";
  const spacer = document.createElement("span");
  row.appendChild(spacer);
  const box = document.createElement("div");
  box.className = "chips";
  for (const v of values) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "qontic-app-toggle chip";
    b.textContent = format(v);
    b.title = `Set to ${format(v)}`;
    b.addEventListener("click", () => {
      params[key] = v;
      syncSlider(key);
      onSet(v);
      requestRedraw();
    });
    box.appendChild(b);
  }
  row.appendChild(box);
  controls.appendChild(row);
}

function addToggleInt(key, label, onChange = null) {
  const row = document.createElement("div");
  row.className = "row";
  const lab = document.createElement("span");
  lab.textContent = label;

  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "qontic-app-toggle";
  lab.id = key + "-label";
  btn.setAttribute("aria-labelledby", lab.id + " " + key);
  btn.id = key;
  const sync = () => {
    btn.textContent = params[key] ? "On" : "Off";
    btn.setAttribute("aria-pressed", String(Boolean(params[key])));
  };
  sync();
  btn.addEventListener("click", () => {
    params[key] = params[key] ? 0 : 1;
    sync();
    if (onChange) onChange(params[key]);
    requestRedraw();
  });

  const val = document.createElement("div");
  val.className = "val";
  val.textContent = "";

  row.appendChild(lab);
  row.appendChild(btn);
  row.appendChild(val);
  controls.appendChild(row);
}

function addCycleButton(key, label, values, onChange = null) {
  const row = document.createElement("div");
  row.className = "row";

  const lab = document.createElement("span");
  lab.textContent = label;

  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "qontic-app-toggle";
  lab.id = key + "-label";
  btn.setAttribute("aria-labelledby", lab.id + " " + key);
  btn.id = key;

  const sync = () => {
    btn.textContent = values[params[key] | 0] ?? values[0];
  };

  sync();
  btn.addEventListener("click", () => {
    params[key] = (params[key] + 1) % values.length;
    sync();
    if (onChange) onChange(params[key] | 0);
    requestRedraw();
  });

  const val = document.createElement("div");
  val.className = "val";
  val.textContent = "";

  row.appendChild(lab);
  row.appendChild(btn);
  row.appendChild(val);
  controls.appendChild(row);
  return { button: btn, sync };
}

function addSectionHeader(label) {
  const header = document.createElement("div");
  header.style.marginTop = "12px";
  header.style.marginBottom = "8px";
  header.style.fontSize = "11px";
  header.style.fontWeight = "700";
  header.style.color = "#aaa";
  header.style.textTransform = "uppercase";
  header.style.letterSpacing = "1px";
  header.textContent = label;
  controls.appendChild(header);
}

// Layout along the beam, in cells (see Magnets below).
const APPROACH_CELLS = 30 * BEAM_SCALE;
const MAGNET_CELLS = 50 * BEAM_SCALE;   // the 3.5 cm magnet
const RAMP_CELLS = 4 * BEAM_SCALE;
const RIBBON_FACTOR = 2.5;
const KNIFE_HP = 1.5;   // knife-edge line pole at 1.5 L above the centre (field there g·1.5 L, gradient g)

// ── Lab units ────────────────────────────────────────────────────────────────
// Each axis has its own scale, matched to the 1922 experiment at the default settings
// (momentum BEAM_SPEED, packet width 10 cells): the magnet (MAGNET_CELLS) is 3.5 cm long, the packet
// moves at 660 m/s, and the FWHM of |psi|^2 across the beam is the 35 µm slit. The scales are
// fixed, so the sliders change lab quantities.
// What cannot match is hbar/m in these units: the model's wave spreads far faster.
const LAB = {
  magnetLength: 0.035,             // m (Friedrich & Herschbach 2003)
  speed: 660,                      // m/s (Stern's 1920 measurement at 1000 °C)
  beamFWHM: 35e-6,                 // m (slit 0.03–0.04 mm, Gerlach & Stern 1922)
  mass: 107.8682 * 1.66053907e-27, // kg, silver atom
  muB: 9.2740100783e-24,           // J/T
  hbar: 1.054571817e-34,           // J s
};
function gridGroupVelocity(k, hbar = 6, mass = 1) {
  return (hbar / (2 * mass)) * (32 * Math.sin(k) - 4 * Math.sin(2 * k)) / 12;
}
const LAB_SCALE = (() => {
  const sx = LAB.magnetLength / MAGNET_CELLS;              // m per cell along x
  const st = sx * BEAM_SPEED / LAB.speed;                  // s per time unit (default speed BEAM_SPEED cells/unit)
  const sz = LAB.beamFWHM / (2.3548 * 10 / Math.SQRT2);    // m per cell across the beam
  return { sx, st, sz };
})();
const labSpeed = p0 => p0 / params.mass * LAB_SCALE.sx / LAB_SCALE.st;
const labGradient = g => {
  const L = Math.max(1, 0.5 * (simD - 1));
  const a = (params.hbar / (2 * params.mass)) * (g / L) / params.mass * LAB_SCALE.sz / LAB_SCALE.st ** 2;
  return a * LAB.mass / LAB.muB / 100;  // T/cm
};
const labFWHM = sigma => 2.3548 * sigma / Math.SQRT2 * LAB_SCALE.sz;  // m

// ── Magnets ──────────────────────────────────────────────────────────────────
// Layout along the beam (grid cells): the packet starts field-free, reaches the first magnet
// params.approachCells after its starting centre, and the screen stands params.screenDistance
// after the end of the last magnet. Each preset lists magnets by start and length (in units of
// the 3.5 cm magnet, from the first magnet's entrance), all scaled by params.magnetScale (Edit
// geometry). The field rises and falls with smooth ramps of width RAMP_CELLS inside
// [start, start + length] and is exactly zero outside, so a gap between two magnets is
// field-free and the hand-over is sudden. theta is the grid angle of a magnet's axis (from +z
// toward grid +y, which is lab −x); the Magnet angle (lab, from +z toward +x) is subtracted.
// b0 is the uniform part in units of g (2 keeps the field from vanishing in the box; 0.3 lets
// it nearly vanish).
const MAGNET_PRESETS = [
  { name: "One magnet", magnets: [{ start: 0, length: 1, theta: 0 }], b0: 2 },
  { name: "Two magnets at 90°", magnets: [{ start: 0, length: 0.4, theta: 0 }, { start: 0.56, length: 0.7, theta: -Math.PI / 2 }], b0: 2 },
  { name: "Weak field", magnets: [{ start: 0, length: 1, theta: 0 }], b0: 0.3 },
];
const magnetPreset = () => MAGNET_PRESETS[params.magnetPreset | 0] || MAGNET_PRESETS[0];
// The knife-edge field is for the strong-field settings; the weak field keeps the textbook field.
const fieldShape = () => (params.fieldShape && magnetPreset().b0 >= 1 ? 1 : 0);
const ribbonFactor = () => (params.beamShape ? RIBBON_FACTOR : 1);
// Field of one magnet in its own frame (u across, w along the axis, in units of L), per unit g.
function magnetFieldUW(u, w, b0) {
  if (!fieldShape()) return [-u, b0 + w];
  const hp = KNIFE_HP, d2 = u * u + (hp - w) ** 2;
  return [-hp * hp * u / d2, hp * hp * (hp - w) / d2];
}
// Magnetic scalar potential (per unit g, B = −∇Φ) in the magnet frame; pole faces follow its
// level curves.
function magnetPotentialUW(u, w, b0) {
  if (!fieldShape()) return 0.5 * u * u - b0 * w - 0.5 * w * w;
  return 0.5 * KNIFE_HP * KNIFE_HP * Math.log(u * u + (w - KNIFE_HP) ** 2);
}
const packetStartX = () => params.packetX * (simW - 1);
const magnetEntryX = () => packetStartX() + params.approachCells;
// The preset's magnets in grid x (a = entrance, b = exit), all turned by the Magnet angle.
function magnets() {
  const turn = params.magnetAngle * DEG;
  const x0 = magnetEntryX();
  const u = MAGNET_CELLS * params.magnetScale;
  return magnetPreset().magnets.map(mg => ({ a: x0 + mg.start * u, b: x0 + (mg.start + mg.length) * u, theta: mg.theta - turn }));
}
const lastMagnetEndX = () => Math.max(...magnets().map(mg => mg.b));
const smooth01 = t => { const u = Math.min(1, Math.max(0, t)); return u * u * (3 - 2 * u); };
const magnetProfile = (mg, x) => smooth01((x - mg.a) / RAMP_CELLS) * smooth01((mg.b - x) / RAMP_CELLS);
function magnetsAtX(x) {
  return magnets().map(mg => ({ p: magnetProfile(mg, x), theta: mg.theta }));
}
// The packet feels the field at its centre x_c(t).
function magnetState(t) {
  const segs = magnetsAtX(packetStartX() + params.p0 / params.mass * t);
  return { m1: segs[0], m2: segs[1] || { p: 0, theta: 0 } };
}
// Unit vectors (y, z) along each magnet's gradient axis: the axes measured at the plate.
function measurementAxes() {
  return magnets().map(mg => [Math.sin(mg.theta), Math.cos(mg.theta)]);
}
// Name of the direction of grid angle theta, in lab terms: the lab angle (from +z toward +x)
// is −theta.
function axisName(theta) {
  const d = ((Math.round(-theta / DEG) % 360) + 360) % 360;
  return { 0: "+z", 90: "+x", 180: "−z", 270: "−x" }[d] || `${d}°`;
}

const restartForSpin = () => { resetAll(); updateStats(); };
addSlider("spinTheta", "Spin θ (from +z)", 0, 180, 1, restartForSpin, v => `${Math.round(v)}°`);
addChips("spinTheta", [0, 45, 90, 135, 180], restartForSpin);
addSlider("spinPhi", "Spin φ (from +x)", 0, 360, 1, restartForSpin, v => `${Math.round(v)}°`);
addChips("spinPhi", [0, 90, 180, 270], restartForSpin);
const spinSphereRow = document.createElement("div");
spinSphereRow.className = "spin-sphere-row";
const spinSphere = document.createElement("canvas");
spinSphere.className = "spin-sphere";
spinSphere.setAttribute("role", "img");
const spinSphereText = document.createElement("div");
spinSphereText.className = "spin-sphere-text";
spinSphereRow.append(spinSphere, spinSphereText);
controls.appendChild(spinSphereRow);
const magnetPresetControl = addCycleButton("magnetPreset", "Magnets", MAGNET_PRESETS.map(p => p.name), () => applyMagnetPreset());
const magnetPresetControlSync = () => magnetPresetControl.sync();
const fieldShapeControl = addCycleButton("fieldShape", "Field", ["Textbook", "Knife edge (1922-like)"], () => { updateGradientLimit(true); rebuildMagneticFieldLines(); resetAll(); updateStats(); });
const applyMagnetAngle = () => { rebuildMagneticFieldLines(); resetAll(); updateStats(); };
addSlider("magnetAngle", "Magnet angle", 0, 360, 1, applyMagnetAngle, v => `${Math.round(v)}°`);
addChips("magnetAngle", [0, 45, 90, 180, 270], applyMagnetAngle);
// While the slider moves, turn the drawn magnet and its field lines at once; the packet restarts on release.
document.getElementById("magnetAngle").addEventListener("input", () => {
  if (!simulationAvailable) return;
  rebuildMagneticFieldLines();
  updateStats();
});
function syncSlider(key) {
  const input = document.getElementById(key);
  if (input) input.value = String(params[key]);
  refreshUnitLabels();
}
// Above ~3.5 the deflected branches reach the hard walls before the plate.
addSlider("sgGradient", "Field gradient", 0.0, 6.0, 0.05, () => requestTrailClear(), g => `${labGradient(g).toFixed(1)} T/cm`);
addSlider("screenDistance", "Screen distance", 10 * BEAM_SCALE, 60 * BEAM_SCALE, BEAM_SCALE, () => applyScreenDistance(), d => `${(d * LAB_SCALE.sx * 100).toFixed(1)} cm`);

addSectionHeader("Wave and guidance");
addSlider("p0", "Atom speed", 0.0, 1.09 * BEAM_SPEED, 0.02 * BEAM_SPEED, () => resetAll(), p => `${Math.round(labSpeed(p))} m/s`);
addCycleButton("beamShape", "Beam", ["Round", "Ribbon (1922 slit)"], () => resetAll());
addSlider("packetSigma", "Beam width (FWHM)", 4.0, 14.0, 0.5, () => { rebuildBoxGeometry(); rebuildMagneticFieldLines(); resetAll(); }, s => `${Math.round(labFWHM(s) * 1e6)} µm`);

controls = displayControls;
addToggleInt("sgFieldOn", "Magnetic field", () => requestTrailClear());
addToggleInt("showFieldArrows", "Field arrows");
addSlider("fieldLineDensity", "Field lines", 1, 5, 1, () => rebuildMagneticFieldLines(), n => `${n * n} per slice`);
addSlider("fieldArrowSpacing", "Arrow spacing", 8, 60, 2, () => rebuildMagneticFieldLines(), d => `${Math.round(d * LAB_SCALE.sz * 1e6)} µm`);
addToggleInt("showMagnet", "Magnet poles");
addToggleInt("showSpin", "Spin arrow", () => updateStats());
addToggleInt("showDotSpin", "Spin on dots", () => updateStats());
const cameraProjectionControl = addCycleButton("cameraProjection", "Camera view", ["Perspective", "Orthographic"], () => {
  activeOrthoView = null;
  syncCameraUi();
  requestTrailClear();
});
addToggleInt("showCloud", "Density cloud");
addSlider("cloudGain", "Cloud brightness", 0.05, 2.0, 0.05);
addToggleInt("showPhase", "Show phase");
addToggleInt("showParticles", "Show particles");
addSlider("dotSize", "Particle size", 2.0, 26.0, 1);
addSlider("dotGain", "Particle brightness", 0.1, 5.0, 0.1);
addToggleInt("showTrail", "Draw trails");
addSlider("trailHalfLife", "Trail half-life", 0.1, 10.0, 0.1, null, t => `${(t * LAB_SCALE.st * 1e6).toFixed(1)} µs`);

controls = advancedControls;
addSlider("nParticles", "Particle count", 1, 5000, 1, () => rebuildParticles());
addToggleInt("spinTerm", "Spin term (Pauli)", () => requestRedraw());
// 2D leapfrog: stable below ~0.022 at the largest gradient (z-then-y magnets, g = 7.5).
addSlider("dt", "Time step", 0.002, 0.016, 0.002, null, d => `${Math.round(d * LAB_SCALE.st * 1e9)} ns`);

window.addEventListener("keydown", event => {
  if (!simulationAvailable || event.defaultPrevented || event.target.closest?.("button, a, summary")) return;
  handleCameraKey(event);
});

window.addEventListener("keyup", (e) => {
  handleCameraKeyUp(e);
});

const COLOR_WRITE_RED = 0x1;
const COLOR_WRITE_ALL = 0xf;
const UNIFORM_FLOATS = 108;   // viewProj at 80, then win, mag3a, mag3b
const UNIFORM_BYTES = UNIFORM_FLOATS * 4;
const DENSITY_FORMAT = "rgba16float";
const uniformData = new Float32Array(UNIFORM_FLOATS);
const uniformBuffer = device.createBuffer({
  label: "main uniforms",
  size: UNIFORM_BYTES,
  usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
});
const trailUniformBuffer = device.createBuffer({
  label: "trail uniforms",
  size: UNIFORM_BYTES,
  usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
});

const shaderResult = await shaderLoad;
mark("shaders");
if (shaderResult.error) {
  simulationAvailable = false;
  showSimulationError("The simulation could not load its shaders", shaderResult.error);
  throw shaderResult.error;
}
const SHADERS = shaderResult.shaders;
const WAVE_INIT_WGSL = SHADERS.waveInit;
const WAVE_STEP_WGSL = SHADERS.waveStep;
const PARTICLE_UPDATE_WGSL = SHADERS.particleUpdate;
const CLOUD_WGSL = SHADERS.cloud;
const PARTICLE_RENDER_WGSL = SHADERS.particleRender;
const SPIN_ARROW_WGSL = SHADERS.spinArrow;
const DENSITY_WGSL = SHADERS.density;
const BOX_SHELL_WGSL = SHADERS.boxShell;
const LINE_WGSL = SHADERS.line;
const FIELD_LINE_WGSL = SHADERS.fieldLine;
const DETECTOR_PLATE_WGSL = SHADERS.detectorPlate;
const MAGNET_POLE_WGSL = SHADERS.magnetPole;
const WEIGHT_REDUCE_WGSL = SHADERS.weightReduce;
const WAVE3D_INIT_WGSL = SHADERS.wave3dInit;
const WAVE3D_STEP_WGSL = SHADERS.wave3dStep;
const PARTICLE_UPDATE3D_WGSL = SHADERS.particleUpdate3d;
let pipelineWeightReduce = null;
let pipelineWaveInit, pipelineWaveStep, pipelineParticleUpdate;
let pipelineCloud, pipelineBoxShell, pipelineLine, pipelineFieldLine, pipelineDetectorPlate, pipelineMagnetPole, pipelineSpinArrow;
let particleSpin = null, spinArrowBindGroups = [];
let meanSpinBuffer = null, meanSpinVertexCount = 0;
const MEAN_SPIN_MAX_VERTS = 240;
let pipelineParticleRender, pipelineParticleStamp;
let pipelineDensityFade, pipelineDensityRenderGlow;
let nearestSampler = device.createSampler({ magFilter: "nearest", minFilter: "nearest" });

let simW = 0, simH = 0, simD = 0;
let voxelCount = 0;   // cloud point instances (x window × y × z, with stride)
let waveCount = 0;    // cells of the 2D wave grid across the beam
// ── Full 3D engine: a window of WIN_NX cells along the beam that moves with the packet ──
const WIN_NX = 128;
let engine = "fast";
let waveCount3 = 0;
let wave3A = null, wave3B = null;
let pipelineWave3Init = null, pipelineWave3Step = null, pipelineParticleUpdate3 = null;
let wave3InitBindGroup = null, wave3StepBindGroups = [], cloud3BindGroups = [], particle3BindGroups = [], weight3BindGroups = [];
const is3D = () => engine === "3d";
const activeWaveCount = () => (is3D() ? waveCount3 : waveCount);
// Along x only a window for drawing the cloud; across the beam the 2D wave grid.
const GRID_X = 64, GRID_YZ = 128, CLOUD_STRIDE = 2;
let waveBufferA = null, waveBufferB = null, flip = 0;
let simTime = 0;

let particleSrc = null, particleDst = null, particleFlip = 0;
// 1 for particles that start above the packet centre, 0 below (colours the dots).
let particleStartSide = null;
// Plate hit counts, read back from the particle buffer a few times per second.
let hitReadback = null, readbackBusy = false, lastHitReadback = 0;
let hitCounts = { counts: [0, 0], arrived: 0, total: 0 };
const HIT_READBACK_MS = 250;
let readbackToggle = false;
// Orthodox reading: |Psi|^2 weight above and below the packet-centre height.
let weightPartials = null, weightReadback = null, weightBindGroups = [];
let weightCounts = { values: [0.5, 0.5], valid: false };
let boxBuffer = null, boxVertexCount = 0;
let boxShellBuffer = null, boxShellVertexCount = 0;
let fieldLineBuffer = null, fieldLineVertexCount = 0;
let fieldArrowBuffer = null, fieldArrowVertexCount = 0;

let densW = 0, densH = 0;
let densTexA = null, densTexB = null, densViewA = null, densViewB = null, densFlip = 0;
let trailClearPending = false;

let waveInitBindGroup = null;
let waveStepBindGroups = [];
let cloudBindGroups = [];
let particleUpdateBindGroups = [];
let particleRenderBindGroups = [];
let particleStampBindGroups = [];
let densityFadeBindGroups = [];
let densityRenderBindGroups = [];
let boxShellBindGroup = null;
let lineBindGroup = null;
let fieldLineBindGroup = null;
let detectorPlateBindGroup = null;
let magnetPoleBindGroup = null;
let magnetPoleBuffer = null, magnetPoleVertexCount = 0;

function shaderModule(label, code) {
  return device.createShaderModule({ label, code });
}

function bindGroup(pipeline, entries) {
  return device.createBindGroup({
    layout: pipeline.getBindGroupLayout(0),
    entries,
  });
}

function configureCanvas() {
  gpuContext.configure({
    device,
    format: presentationFormat,
    alphaMode: "opaque",
  });
}

function resizeCanvas() {
  const dpr = Math.max(1, Math.min(1.5, window.devicePixelRatio || 1));
  const w = Math.max(1, Math.floor(canvas.clientWidth * dpr));
  const h = Math.max(1, Math.floor(canvas.clientHeight * dpr));
  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w;
    canvas.height = h;
    configureCanvas();
    return true;
  }
  return false;
}

function destroyGpuResource(resource) {
  if (resource && typeof resource.destroy === "function") resource.destroy();
}

function deleteWaveTargets() {
  destroyGpuResource(waveBufferA);
  destroyGpuResource(waveBufferB);
  waveBufferA = waveBufferB = null;
  waveInitBindGroup = null;
  waveStepBindGroups = [];
  cloudBindGroups = [];
  particleUpdateBindGroups = [];
}

function deleteDensityTargets() {
  destroyGpuResource(densTexA);
  destroyGpuResource(densTexB);
  densTexA = densTexB = densViewA = densViewB = null;
  densityFadeBindGroups = [];
  densityRenderBindGroups = [];
}

function blendState(srcFactor, dstFactor) {
  return {
    color: { srcFactor, dstFactor, operation: "add" },
    alpha: { srcFactor, dstFactor, operation: "add" },
  };
}

async function buildPipelines() {
  const waveInitModule = shaderModule("wave init", WAVE_INIT_WGSL);
  const waveStepModule = shaderModule("wave step", WAVE_STEP_WGSL);
  const particleUpdateModule = shaderModule("particle update", PARTICLE_UPDATE_WGSL);
  const cloudModule = shaderModule("cloud render", CLOUD_WGSL);
  const particleModule = shaderModule("particle render", PARTICLE_RENDER_WGSL);
  const spinArrowModule = shaderModule("spin arrows", SPIN_ARROW_WGSL);
  const densityModule = shaderModule("density", DENSITY_WGSL);
  const boxShellModule = shaderModule("box shell", BOX_SHELL_WGSL);
  const lineModule = shaderModule("line", LINE_WGSL);
  const fieldLineModule = shaderModule("SG field lines", FIELD_LINE_WGSL);
  const detectorPlateModule = shaderModule("detector plate", DETECTOR_PLATE_WGSL);
  const magnetPoleModule = shaderModule("magnet poles", MAGNET_POLE_WGSL);
  const weightReduceModule = shaderModule("probability weight", WEIGHT_REDUCE_WGSL);

  const pipelineWaveInitReady = device.createComputePipelineAsync({
    label: "wave init pipeline",
    layout: "auto",
    compute: { module: waveInitModule, entryPoint: "main" },
  });
  const pipelineWaveStepReady = device.createComputePipelineAsync({
    label: "wave step pipeline",
    layout: "auto",
    compute: { module: waveStepModule, entryPoint: "main" },
  });
  const pipelineWeightReduceReady = device.createComputePipelineAsync({
    label: "probability weight pipeline",
    layout: "auto",
    compute: { module: weightReduceModule, entryPoint: "main" },
  });
  const pipelineParticleUpdateReady = device.createComputePipelineAsync({
    label: "particle update pipeline",
    layout: "auto",
    compute: { module: particleUpdateModule, entryPoint: "main" },
  });

  const pipelineCloudReady = device.createRenderPipelineAsync({
    label: "cloud render pipeline",
    layout: "auto",
    vertex: { module: cloudModule, entryPoint: "vs" },
    fragment: {
      module: cloudModule,
      entryPoint: "fs",
      targets: [{ format: presentationFormat, blend: blendState("one", "one"), writeMask: COLOR_WRITE_ALL }],
    },
    primitive: { topology: "triangle-list" },
  });

  const pipelineParticleRenderReady = device.createRenderPipelineAsync({
    label: "particle render pipeline",
    layout: "auto",
    vertex: { module: particleModule, entryPoint: "vsRender" },
    fragment: {
      module: particleModule,
      entryPoint: "fsRender",
      // Normal alpha blending keeps the start-side colours readable over the bright cloud.
      targets: [{ format: presentationFormat, blend: blendState("src-alpha", "one-minus-src-alpha"), writeMask: COLOR_WRITE_ALL }],
    },
    primitive: { topology: "triangle-list" },
  });

  const pipelineSpinArrowReady = device.createRenderPipelineAsync({
    label: "spin arrow pipeline",
    layout: "auto",
    vertex: { module: spinArrowModule, entryPoint: "vs" },
    fragment: {
      module: spinArrowModule,
      entryPoint: "fs",
      targets: [{ format: presentationFormat, blend: blendState("src-alpha", "one-minus-src-alpha"), writeMask: COLOR_WRITE_ALL }],
    },
    primitive: { topology: "triangle-list" },
  });

  const pipelineParticleStampReady = device.createRenderPipelineAsync({
    label: "particle trail stamp pipeline",
    layout: "auto",
    vertex: { module: particleModule, entryPoint: "vsStamp" },
    fragment: {
      module: particleModule,
      entryPoint: "fsStamp",
      targets: [{ format: DENSITY_FORMAT, blend: blendState("one", "one"), writeMask: COLOR_WRITE_ALL }],
    },
    primitive: { topology: "triangle-list" },
  });

  const pipelineDensityFadeReady = device.createRenderPipelineAsync({
    label: "density fade pipeline",
    layout: "auto",
    vertex: { module: densityModule, entryPoint: "vsFull" },
    fragment: { module: densityModule, entryPoint: "fsFade", targets: [{ format: DENSITY_FORMAT }] },
    primitive: { topology: "triangle-list" },
  });

  const pipelineDensityRenderGlowReady = device.createRenderPipelineAsync({
    label: "density render glow pipeline",
    layout: "auto",
    vertex: { module: densityModule, entryPoint: "vsFull" },
    fragment: {
      module: densityModule,
      entryPoint: "fsRender",
      targets: [{ format: presentationFormat, blend: blendState("one", "one"), writeMask: COLOR_WRITE_ALL }],
    },
    primitive: { topology: "triangle-list" },
  });

  const pipelineBoxShellReady = device.createRenderPipelineAsync({
    label: "box shell pipeline",
    layout: "auto",
    vertex: {
      module: boxShellModule,
      entryPoint: "vs",
      buffers: [{
        arrayStride: 36,
        attributes: [
          { shaderLocation: 0, offset: 0, format: "float32x3" },
          { shaderLocation: 1, offset: 12, format: "float32x3" },
          { shaderLocation: 2, offset: 24, format: "float32x2" },
          { shaderLocation: 3, offset: 32, format: "float32" },
        ],
      }],
    },
    fragment: {
      module: boxShellModule,
      entryPoint: "fs",
      targets: [{ format: presentationFormat, blend: blendState("src-alpha", "one-minus-src-alpha"), writeMask: COLOR_WRITE_ALL }],
    },
    primitive: { topology: "triangle-list" },
  });

  const pipelineLineReady = device.createRenderPipelineAsync({
    label: "box line pipeline",
    layout: "auto",
    vertex: {
      module: lineModule,
      entryPoint: "vs",
      buffers: [{
        arrayStride: 16,
        attributes: [
          { shaderLocation: 0, offset: 0, format: "float32x3" },
          { shaderLocation: 1, offset: 12, format: "float32" },
        ],
      }],
    },
    fragment: {
      module: lineModule,
      entryPoint: "fs",
      targets: [{ format: presentationFormat, blend: blendState("src-alpha", "one-minus-src-alpha"), writeMask: COLOR_WRITE_ALL }],
    },
    primitive: { topology: "line-list" },
  });

  const pipelineFieldLineReady = device.createRenderPipelineAsync({
    label: "SG field line pipeline",
    layout: "auto",
    vertex: {
      module: fieldLineModule,
      entryPoint: "vs",
      buffers: [{
        arrayStride: 36,
        attributes: [
          { shaderLocation: 0, offset: 0, format: "float32x3" },
          { shaderLocation: 1, offset: 12, format: "float32x3" },
          { shaderLocation: 2, offset: 24, format: "float32" },
          { shaderLocation: 3, offset: 28, format: "float32" },
          { shaderLocation: 4, offset: 32, format: "float32" },
        ],
      }],
    },
    fragment: {
      module: fieldLineModule,
      entryPoint: "fs",
      targets: [{ format: presentationFormat, blend: blendState("src-alpha", "one-minus-src-alpha"), writeMask: COLOR_WRITE_ALL }],
    },
    primitive: { topology: "triangle-list" },
  });

  const pipelineMagnetPoleReady = device.createRenderPipelineAsync({
    label: "magnet pole pipeline",
    layout: "auto",
    vertex: {
      module: magnetPoleModule,
      entryPoint: "vs",
      buffers: [{
        arrayStride: 40,
        attributes: [
          { shaderLocation: 0, offset: 0, format: "float32x3" },
          { shaderLocation: 1, offset: 12, format: "float32x3" },
          { shaderLocation: 2, offset: 24, format: "float32x4" },
        ],
      }],
    },
    fragment: {
      module: magnetPoleModule,
      entryPoint: "fs",
      targets: [{ format: presentationFormat, blend: blendState("src-alpha", "one-minus-src-alpha"), writeMask: COLOR_WRITE_ALL }],
    },
    primitive: { topology: "triangle-list", cullMode: "back", frontFace: "ccw" },
  });

  const pipelineDetectorPlateReady = device.createRenderPipelineAsync({
    label: "detector plate pipeline",
    layout: "auto",
    vertex: { module: detectorPlateModule, entryPoint: "vs" },
    fragment: {
      module: detectorPlateModule,
      entryPoint: "fs",
      targets: [{ format: presentationFormat, blend: blendState("src-alpha", "one-minus-src-alpha"), writeMask: COLOR_WRITE_ALL }],
    },
    primitive: { topology: "triangle-list" },
  });

  [
    pipelineWaveInit,
    pipelineWaveStep,
    pipelineParticleUpdate,
    pipelineCloud,
    pipelineParticleRender,
    pipelineParticleStamp,
    pipelineDensityFade,
    pipelineDensityRenderGlow,
    pipelineBoxShell,
    pipelineLine,
    pipelineFieldLine,
    pipelineDetectorPlate,
    pipelineWeightReduce,
    pipelineMagnetPole,
    pipelineSpinArrow,
  ] = await Promise.all([
    pipelineWaveInitReady,
    pipelineWaveStepReady,
    pipelineParticleUpdateReady,
    pipelineCloudReady,
    pipelineParticleRenderReady,
    pipelineParticleStampReady,
    pipelineDensityFadeReady,
    pipelineDensityRenderGlowReady,
    pipelineBoxShellReady,
    pipelineLineReady,
    pipelineFieldLineReady,
    pipelineDetectorPlateReady,
    pipelineWeightReduceReady,
    pipelineMagnetPoleReady,
    pipelineSpinArrowReady,
  ]);
  mark("pipelines");

  boxShellBindGroup = bindGroup(pipelineBoxShell, [{ binding: 0, resource: { buffer: uniformBuffer } }]);
  lineBindGroup = bindGroup(pipelineLine, [{ binding: 0, resource: { buffer: uniformBuffer } }]);
  fieldLineBindGroup = bindGroup(pipelineFieldLine, [{ binding: 0, resource: { buffer: uniformBuffer } }]);
  detectorPlateBindGroup = bindGroup(pipelineDetectorPlate, [{ binding: 0, resource: { buffer: uniformBuffer } }]);
  magnetPoleBindGroup = bindGroup(pipelineMagnetPole, [{ binding: 0, resource: { buffer: uniformBuffer } }]);
}

function makeBuffer(label, data, usage) {
  const buffer = device.createBuffer({
    label,
    size: Math.max(4, (data.byteLength + 3) & ~3),
    usage: usage | GPUBufferUsage.COPY_DST,
  });
  device.queue.writeBuffer(buffer, 0, data);
  return buffer;
}

function makeStorageBuffer(label, byteSize, extraUsage = 0) {
  return device.createBuffer({
    label,
    size: Math.max(4, (byteSize + 3) & ~3),
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST | extraUsage,
  });
}

function makeDensityTexture(label, w, h) {
  return device.createTexture({
    label,
    size: [w, h],
    format: DENSITY_FORMAT,
    usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING,
  });
}

function rebuildWaveBindGroups() {
  if (!waveBufferA || !waveBufferB) return;
  waveInitBindGroup = bindGroup(pipelineWaveInit, [
    { binding: 0, resource: { buffer: uniformBuffer } },
    { binding: 1, resource: { buffer: waveBufferA } },
  ]);
  waveStepBindGroups = [
    bindGroup(pipelineWaveStep, [
      { binding: 0, resource: { buffer: uniformBuffer } },
      { binding: 1, resource: { buffer: waveBufferA } },
      { binding: 2, resource: { buffer: waveBufferB } },
    ]),
    bindGroup(pipelineWaveStep, [
      { binding: 0, resource: { buffer: uniformBuffer } },
      { binding: 1, resource: { buffer: waveBufferB } },
      { binding: 2, resource: { buffer: waveBufferA } },
    ]),
  ];
  cloudBindGroups = [
    bindGroup(pipelineCloud, [
      { binding: 0, resource: { buffer: uniformBuffer } },
      { binding: 1, resource: { buffer: waveBufferA } },
    ]),
    bindGroup(pipelineCloud, [
      { binding: 0, resource: { buffer: uniformBuffer } },
      { binding: 1, resource: { buffer: waveBufferB } },
    ]),
  ];
  rebuildWeightResources();
  rebuildParticleBindGroups();
}

function rebuildWeightResources() {
  const groups = dispatchCount(activeWaveCount(), WAVE_WORKGROUP_SIZE);
  if (weightPartials?.size !== groups * 48) {
    if (!readbackBusy) {
      destroyGpuResource(weightPartials);
      destroyGpuResource(weightReadback);
    }
    weightPartials = makeStorageBuffer("probability weight partial sums", groups * 48, GPUBufferUsage.COPY_SRC);
    weightReadback = device.createBuffer({
      label: "probability weight readback",
      size: groups * 48,
      usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST,
    });
  }
  weight3BindGroups = wave3A ? [wave3A, wave3B].map(buffer => bindGroup(pipelineWeightReduce, [
    { binding: 0, resource: { buffer: uniformBuffer } },
    { binding: 1, resource: { buffer } },
    { binding: 2, resource: { buffer: weightPartials } },
  ])) : [];
  weightBindGroups = [waveBufferA, waveBufferB].map(buffer => bindGroup(pipelineWeightReduce, [
    { binding: 0, resource: { buffer: uniformBuffer } },
    { binding: 1, resource: { buffer } },
    { binding: 2, resource: { buffer: weightPartials } },
  ]));
  weightCounts = { values: [0.5, 0.5], valid: false };
}

function rebuildParticleBindGroups() {
  if (!waveBufferA || !waveBufferB || !particleSrc || !particleDst || !particleSpin) return;
  const waves = [waveBufferA, waveBufferB];
  const particles = [particleSrc, particleDst];
  particle3BindGroups = wave3A && pipelineParticleUpdate3 ? [wave3A, wave3B].map(waveBuffer => particles.map((src, srcIndex) => bindGroup(pipelineParticleUpdate3, [
    { binding: 0, resource: { buffer: uniformBuffer } },
    { binding: 1, resource: { buffer: waveBuffer } },
    { binding: 2, resource: { buffer: src } },
    { binding: 3, resource: { buffer: particles[1 - srcIndex] } },
    { binding: 4, resource: { buffer: particleSpin } },
  ]))) : [];
  particleUpdateBindGroups = waves.map((waveBuffer) => particles.map((src, srcIndex) => bindGroup(pipelineParticleUpdate, [
    { binding: 0, resource: { buffer: uniformBuffer } },
    { binding: 1, resource: { buffer: waveBuffer } },
    { binding: 2, resource: { buffer: src } },
    { binding: 3, resource: { buffer: particles[1 - srcIndex] } },
    { binding: 4, resource: { buffer: particleSpin } },
  ])));
  spinArrowBindGroups = particles.map((buffer) => bindGroup(pipelineSpinArrow, [
    { binding: 0, resource: { buffer: uniformBuffer } },
    { binding: 1, resource: { buffer } },
    { binding: 2, resource: { buffer: particleSpin } },
  ]));
  particleRenderBindGroups = particles.map((buffer) => bindGroup(pipelineParticleRender, [
    { binding: 0, resource: { buffer: uniformBuffer } },
    { binding: 1, resource: { buffer } },
    { binding: 2, resource: { buffer: particleStartSide } },
    { binding: 3, resource: { buffer: particleSpin } },
  ]));
  particleStampBindGroups = particles.map((buffer) => bindGroup(pipelineParticleStamp, [
    { binding: 0, resource: { buffer: trailUniformBuffer } },
    { binding: 1, resource: { buffer } },
    { binding: 2, resource: { buffer: particleStartSide } },
    { binding: 3, resource: { buffer: particleSpin } },
  ]));
}

function rebuildDensityBindGroups() {
  if (!densViewA || !densViewB) return;
  const views = [densViewA, densViewB];
  densityFadeBindGroups = views.map((view) => bindGroup(pipelineDensityFade, [
    { binding: 0, resource: { buffer: trailUniformBuffer } },
    { binding: 1, resource: view },
    { binding: 2, resource: nearestSampler },
  ]));
  densityRenderBindGroups = views.map((view) => bindGroup(pipelineDensityRenderGlow, [
    { binding: 0, resource: { buffer: uniformBuffer } },
    { binding: 1, resource: view },
    { binding: 2, resource: nearestSampler },
  ]));
}

function dispatchCount(count, groupSize) {
  return Math.ceil(count / groupSize);
}

function writeUniforms(buffer, camera, viewportW, viewportH, densityFade = 1.0, densitySizeScale = 1.0) {
  uniformData.fill(0);
  uniformData.set([simW, simH, simD, voxelCount], 0);
  uniformData.set([params.hbar, params.mass, params.p0, params.dt], 4);
  uniformData.set([params.packetX, params.packetY, params.packetZ, params.packetSigma], 8);
  uniformData.set([params.cloudGain, params.cloudGamma, params.cloudLowBoost, params.cloudCutoff], 12);
  uniformData.set([params.cloudPointSize, params.showPhase, params.paletteId | 0, params.boxScale], 16);
  uniformData.set([params.dotSize, params.dotSigma, params.dotGain, params.spinTerm ? 0.5 : 0.0], 20);
  uniformData.set([params.rhoMin, params.velClamp, Math.floor(params.nParticles), params.trailWidth], 24);
  uniformData.set([camera.eye[0], camera.eye[1], camera.eye[2], camera.distance], 28);
  uniformData.set([viewportW, viewportH, params.cameraProjection | 0, params.trailStampGain], 32);
  const branch = branchColour();
  uniformData.set([detectorPlateXGrid(), 1.0, branch.axis[0], branch.axis[1]], 36);
  uniformData.set([branch.strength, 0.0, 0.0, params.trailVisGain], 40);
  uniformData.set([params.trailVisGamma, 2, densityFade, densitySizeScale], 44);
  const sgTint = params.sgFieldOn && params.sgGradient > 0 ? 1 : 0;
  uniformData.set(sgTint ? [0.82, 0.34, 0.28, 0.30] : [0.38, 0.72, 0.68, 0.22], 48);
  const boxCenter = boxCenterWorld();
  uniformData.set([boxCenter[0], boxCenter[1], boxCenter[2], 0.0], 52);
  const sgStrength = params.sgFieldOn ? params.sgGradient : 0.0;
  uniformData.set([sgStrength, params.sgFieldOn ? 1.0 : 0.0, params.spinTheta * DEG, (params.spinPhi - 90) * DEG], 56);
  const xc = visualPacketCenterX();
  uniformData.set([xc, CLOUD_STRIDE, Math.floor(xc) - Math.floor(simW / 2), spinArrowStride()], 60);
  const mag = magnetState(simTime);
  uniformData.set([mag.m1.p, Math.cos(mag.m1.theta), Math.sin(mag.m1.theta), magnetPreset().b0], 64);
  uniformData.set([mag.m2.p, Math.cos(mag.m2.theta), Math.sin(mag.m2.theta), fieldShape()], 68);
  const tau = params.hbar * simTime / (params.mass * params.packetSigma * params.packetSigma);
  uniformData.set([xc, tau, simTime, activeWaveCount()], 72);
  const ax = measurementAxes();
  uniformData.set([ax[0][0], ax[0][1], ax[ax.length - 1][0], ax[ax.length - 1][1]], 76);
  uniformData.set(camera.viewProj, 80);
  const ms3 = magnets();
  uniformData.set([xc, WIN_NX, is3D() ? 1 : 0, ribbonFactor()], 96);
  uniformData.set([ms3[0].a, ms3[0].b, ms3[1] ? ms3[1].a : 0, ms3[1] ? ms3[1].b : 0], 100);
  uniformData.set([ms3[0].theta, ms3[1] ? ms3[1].theta : 0, RAMP_CELLS, ms3.length], 104);
  device.queue.writeBuffer(buffer, 0, uniformData);
}

// Branch colours: the axis of the last magnet the packet centre has reached, and a strength that
// rises from 0 to 1 as the packet enters the first magnet (neutral colours before any field).
function branchColour() {
  const ms = magnets();
  const xc = visualPacketCenterX();
  let k = 0;
  for (let i = 0; i < ms.length; i++) if (xc >= ms[i].a) k = i;
  const strength = params.sgFieldOn ? smooth01((xc - ms[0].a) / RAMP_CELLS) : 0;
  return { axis: [Math.sin(ms[k].theta), Math.cos(ms[k].theta)], strength };
}
// Motion along x is the exact free Gaussian (no grid), so the momentum is used as set.
// Arrows on at most about 120 dots.
function spinArrowStride() {
  return Math.max(1, Math.ceil(Math.floor(params.nParticles) / 120));
}
function effectivePeriodicP0() {
  return params.p0;
}

function visualPacketCenterX() {
  if (simW <= 1) return 0;
  const x0 = params.packetX * (simW - 1);
  return x0 + (effectivePeriodicP0() / Math.max(1e-6, params.mass)) * simTime;
}

// Start of the drawn tunnel and x = 0 on the axes: just behind the tail of the starting
// packet (2.5 standard deviations of |psi|^2), so the whole packet starts inside.
function tunnelStartX() {
  return params.packetX * (simW - 1) - 2.5 * params.packetSigma / Math.SQRT2;
}

// The screen: params.screenDistance cells after the end of the last magnet.
function detectorPlateXGrid() {
  return lastMagnetEndX() + params.screenDistance;
}

function worldFromGrid(p) {
  return [
    p[0] * X_VIS * params.boxScale,
    p[1] * params.boxScale,
    p[2] * params.boxScale,
  ];
}

function vec3Sub(a, b) {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}

function vec3Dot(a, b) {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

function vec3Cross(a, b) {
  return [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
  ];
}

function vec3Normalize(v) {
  const len = Math.hypot(v[0], v[1], v[2]) || 1;
  return [v[0] / len, v[1] / len, v[2] / len];
}

function mat4Perspective(fovyRad, aspect, near, far) {
  const f = 1 / Math.tan(fovyRad * 0.5);
  const nf = 1 / (near - far);
  const out = new Float32Array(16);
  out[0] = f / aspect;
  out[5] = f;
  out[10] = far * nf;
  out[11] = -1;
  out[14] = far * near * nf;
  return out;
}

function mat4Orthographic(left, right, bottom, top, near, far) {
  const out = new Float32Array(16);
  out[0] = 2 / (right - left);
  out[5] = 2 / (top - bottom);
  out[10] = -1 / (far - near);
  out[12] = -(right + left) / (right - left);
  out[13] = -(top + bottom) / (top - bottom);
  out[14] = -near / (far - near);
  out[15] = 1;
  return out;
}

function mat4LookAt(eye, center, up) {
  const z = vec3Normalize(vec3Sub(eye, center));
  const x = vec3Normalize(vec3Cross(up, z));
  const y = vec3Cross(z, x);
  const out = new Float32Array(16);

  out[0] = x[0]; out[1] = y[0]; out[2] = z[0]; out[3] = 0;
  out[4] = x[1]; out[5] = y[1]; out[6] = z[1]; out[7] = 0;
  out[8] = x[2]; out[9] = y[2]; out[10] = z[2]; out[11] = 0;
  out[12] = -vec3Dot(x, eye);
  out[13] = -vec3Dot(y, eye);
  out[14] = -vec3Dot(z, eye);
  out[15] = 1;
  return out;
}

function mat4Mul(a, b) {
  const out = new Float32Array(16);
  for (let col = 0; col < 4; col++) {
    for (let row = 0; row < 4; row++) {
      out[col * 4 + row] =
        a[0 * 4 + row] * b[col * 4 + 0] +
        a[1 * 4 + row] * b[col * 4 + 1] +
        a[2 * 4 + row] * b[col * 4 + 2] +
        a[3 * 4 + row] * b[col * 4 + 3];
    }
  }
  return out;
}

function boxCenterWorld() {
  return worldFromGrid([
    0.5 * (simW - 1),
    0.5 * (simH - 1),
    0.5 * (simD - 1),
  ]);
}

function cameraLookAtWorld() {
  return worldFromGrid([
    0.5 * (tunnelStartX() + detectorPlateXGrid()),
    0.5 * (simH - 1),
    0.5 * (simD - 1),
  ]);
}

// Default 3D view: from the front-left and a little above, so the box is seen
// nearly side-on and the vertical splitting is visible, with depth.
const DEFAULT_VIEW = { yaw: -1.85, pitch: 0.26 };
const cameraOrbit = {
  yaw: DEFAULT_VIEW.yaw,
  pitch: DEFAULT_VIEW.pitch,
  distance: 1,
};
const KEYBOARD_YAW_CENTER = -Math.PI * 0.5;
const KEYBOARD_YAW_LIMIT = Math.PI * 0.5;
const KEYBOARD_ORBIT_SPEED = .6;
const KEYBOARD_ZOOM_SPEED = .5;
const cameraTarget = {
  yaw: cameraOrbit.yaw,
  pitch: cameraOrbit.pitch,
  distance: cameraOrbit.distance,
};
const CAMERA_EASE = 0.1;
const ORTHO_VIEWS = {
  XY: { yaw: -Math.PI * 0.5, pitch: Math.PI * 0.5 },
  XZ: { yaw: -Math.PI * 0.5, pitch: 0 },
  YZ: { yaw: 0, pitch: 0 },
};

let activeOrthoView = null;

let orbitPointer = null;
let orbitLastX = 0;
let orbitLastY = 0;
const pressedCameraKeys = new Set();

function requestTrailClear() {
  trailClearPending = true;
  requestRedraw();
}

function clampCameraPitch(pitch) {
  const halfPi = Math.PI * 0.5;
  return Math.max(-halfPi, Math.min(halfPi, pitch));
}

// Far enough back to show the magnet poles around the tunnel.
const DEFAULT_CAMERA_DISTANCE = 1.4;
// Size of the scene: the tunnel length or its cross-section, whichever is larger.
function sceneExtent() {
  return Math.max((detectorPlateXGrid() - tunnelStartX()) * X_VIS, simH, simD) * params.boxScale;
}
function cameraDistanceBounds() {
  const n = sceneExtent();
  return {
    n,
    min: 0.325 * n,
    max: 5.0 * n,
  };
}

function clampCameraDistance(distance) {
  const bounds = cameraDistanceBounds();
  if (!Number.isFinite(distance) || distance <= 1) return DEFAULT_CAMERA_DISTANCE * bounds.n;
  return Math.max(bounds.min, Math.min(bounds.max, distance));
}

function syncCameraUi() {
  cameraProjectionControl.sync();
  for (const [key, btn] of Object.entries(viewButtons)) {
    if (!btn) continue;
    const selected = params.cameraProjection === 1 && activeOrthoView === key;
    btn.classList.toggle("selected", selected);
    btn.setAttribute("aria-pressed", String(selected));
  }
  const view3D = document.getElementById("view3D");
  if (view3D) {
    const selected3D = params.cameraProjection !== 1;
    view3D.classList.toggle("selected", selected3D);
    view3D.setAttribute("aria-pressed", String(selected3D));
  }
}

function setCameraProjection(mode) {
  const nextMode = mode ? 1 : 0;
  if (params.cameraProjection !== nextMode) {
    params.cameraProjection = nextMode;
    requestTrailClear();
  }
  if (nextMode === 0) activeOrthoView = null;
  syncCameraUi();
}

function selectOrthoView(key) {
  const view = ORTHO_VIEWS[key];
  if (!view) return;
  activeOrthoView = key;
  setCameraProjection(1);
  cameraTarget.yaw = view.yaw;
  cameraTarget.pitch = view.pitch;
  requestTrailClear();
  syncCameraUi();
}

function disableOrthoModeFromOrbit() {
  if (activeOrthoView === null) return;
  activeOrthoView = null;
  setCameraProjection(0);
}

function syncCameraTargetToCurrent() {
  cameraTarget.yaw = cameraOrbit.yaw;
  cameraTarget.pitch = cameraOrbit.pitch;
  cameraTarget.distance = cameraOrbit.distance;
}

function shortestAngleDelta(from, to) {
  return Math.atan2(Math.sin(to - from), Math.cos(to - from));
}

function updateCameraEasing() {
  const prevYaw = cameraOrbit.yaw;
  const prevPitch = cameraOrbit.pitch;
  const prevDistance = cameraOrbit.distance;
  const targetDistance = clampCameraDistance(cameraTarget.distance);
  cameraTarget.distance = targetDistance;

  cameraOrbit.yaw += shortestAngleDelta(cameraOrbit.yaw, cameraTarget.yaw) * CAMERA_EASE;
  cameraOrbit.pitch += (cameraTarget.pitch - cameraOrbit.pitch) * CAMERA_EASE;
  cameraOrbit.distance += (targetDistance - cameraOrbit.distance) * CAMERA_EASE;

  if (Math.abs(shortestAngleDelta(cameraOrbit.yaw, cameraTarget.yaw)) < 1e-5) cameraOrbit.yaw = cameraTarget.yaw;
  if (Math.abs(cameraOrbit.pitch - cameraTarget.pitch) < 1e-5) cameraOrbit.pitch = cameraTarget.pitch;
  if (Math.abs(cameraOrbit.distance - targetDistance) < 1e-3) cameraOrbit.distance = targetDistance;

  return Math.abs(shortestAngleDelta(prevYaw, cameraOrbit.yaw)) > 1e-7 ||
    Math.abs(prevPitch - cameraOrbit.pitch) > 1e-7 ||
    Math.abs(prevDistance - cameraOrbit.distance) > 1e-5;
}

function clampKeyboardYaw(yaw) {
  const delta = shortestAngleDelta(KEYBOARD_YAW_CENTER, yaw);
  return KEYBOARD_YAW_CENTER + Math.max(-KEYBOARD_YAW_LIMIT, Math.min(KEYBOARD_YAW_LIMIT, delta));
}

function applyCameraOrbitRadians(yawDelta, pitchDelta, limitYaw = false) {
  if (yawDelta === 0 && pitchDelta === 0) return;
  disableOrthoModeFromOrbit();
  const prevYaw = cameraTarget.yaw;
  const prevPitch = cameraTarget.pitch;
  cameraTarget.yaw += yawDelta;
  if (limitYaw) cameraTarget.yaw = clampKeyboardYaw(cameraTarget.yaw);
  cameraTarget.pitch = clampCameraPitch(cameraTarget.pitch + pitchDelta);
  if (cameraTarget.yaw !== prevYaw || cameraTarget.pitch !== prevPitch) requestTrailClear();
}

function applyCameraOrbitDelta(dx, dy) {
  applyCameraOrbitRadians(-dx * 0.006, dy * 0.006);
}

function applyCameraZoomDelta(deltaY) {
  const zoom = Math.exp(deltaY * 0.001);
  const prevDistance = cameraTarget.distance;
  cameraTarget.distance = clampCameraDistance(cameraTarget.distance * zoom);
  if (cameraTarget.distance !== prevDistance) requestTrailClear();
}

function isTextEntryTarget(target) {
  return target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target instanceof HTMLSelectElement ||
    target?.isContentEditable;
}

function handleCameraKey(e) {
  if (isTextEntryTarget(e.target) || e.altKey || e.ctrlKey || e.metaKey) return;

  switch (e.code) {
    case "KeyW":
    case "KeyS":
    case "KeyA":
    case "KeyD":
    case "KeyQ":
    case "KeyE":
      break;
    default:
      return;
  }

  e.preventDefault();
  if (!pressedCameraKeys.size) syncCameraTargetToCurrent();
  pressedCameraKeys.add(e.code);
  requestRedraw();
}

function handleCameraKeyUp(e) {
  if (!pressedCameraKeys.delete(e.code)) return;
  e.preventDefault();
  requestRedraw();
}

function hasActiveCameraKeys() {
  return pressedCameraKeys.size > 0;
}

function updateCameraKeyMotion(dtSeconds) {
  if (!hasActiveCameraKeys() || dtSeconds <= 0) return false;

  const horizontal = -(pressedCameraKeys.has("KeyA") ? 1 : 0) +(pressedCameraKeys.has("KeyD") ? 1 : 0);
  const vertical = -(pressedCameraKeys.has("KeyS") ? 1 : 0) + (pressedCameraKeys.has("KeyW") ? 1 : 0);
  const zoom = -(pressedCameraKeys.has("KeyE") ? 1 : 0) + (pressedCameraKeys.has("KeyQ") ? 1 : 0);

  applyCameraOrbitRadians(
    horizontal * KEYBOARD_ORBIT_SPEED * dtSeconds,
    vertical * KEYBOARD_ORBIT_SPEED * dtSeconds,
    horizontal !== 0
  );
  if (zoom !== 0) applyCameraZoomDelta(zoom * KEYBOARD_ZOOM_SPEED * 1000 * dtSeconds);
  requestRedraw();
  return horizontal !== 0 || vertical !== 0 || zoom !== 0;
}

for (const [key, btn] of Object.entries(viewButtons)) {
  if (btn) btn.addEventListener("click", () => selectOrthoView(key));
}
// "3D" returns to the default perspective view.
const view3DButton = document.getElementById("view3D");
view3DButton?.addEventListener("click", () => {
  setCameraProjection(0);
  cameraTarget.yaw = DEFAULT_VIEW.yaw;
  cameraTarget.pitch = DEFAULT_VIEW.pitch;
  cameraTarget.distance = 1;
  requestTrailClear();
  syncCameraUi();
});
syncCameraUi();
document.getElementById("zoomIn").onclick = () => applyCameraZoomDelta(-130);
document.getElementById("zoomOut").onclick = () => applyCameraZoomDelta(130);

canvas.addEventListener("pointerdown", (e) => {
  if (e.button !== 0) return;
  orbitPointer = e.pointerId;
  orbitLastX = e.clientX;
  orbitLastY = e.clientY;
  syncCameraTargetToCurrent();
  canvas.setPointerCapture(e.pointerId);
});

canvas.addEventListener("pointermove", (e) => {
  if (orbitPointer !== e.pointerId) return;
  const dx = e.clientX - orbitLastX;
  const dy = e.clientY - orbitLastY;
  orbitLastX = e.clientX;
  orbitLastY = e.clientY;
  applyCameraOrbitDelta(dx, dy);
});

canvas.addEventListener("pointerup", (e) => {
  if (orbitPointer !== e.pointerId) return;
  canvas.releasePointerCapture(e.pointerId);
  orbitPointer = null;
});

canvas.addEventListener("pointercancel", (e) => {
  if (orbitPointer !== e.pointerId) return;
  canvas.releasePointerCapture(e.pointerId);
  orbitPointer = null;
});

canvas.addEventListener("wheel", (e) => {
  e.preventDefault();
  applyCameraZoomDelta(e.deltaY);
}, { passive: false });

function cameraFrame() {
  const target = cameraLookAtWorld();
  const n = sceneExtent();
  cameraOrbit.distance = clampCameraDistance(cameraOrbit.distance);
  cameraTarget.distance = clampCameraDistance(cameraTarget.distance);

  const cp = Math.cos(cameraOrbit.pitch);
  const eye = [
    target[0] + cameraOrbit.distance * cp * Math.cos(cameraOrbit.yaw),
    target[1] + cameraOrbit.distance * cp * Math.sin(cameraOrbit.yaw),
    target[2] + cameraOrbit.distance * Math.sin(cameraOrbit.pitch),
  ];
  const sp = Math.sin(cameraOrbit.pitch);
  const up = [
    -sp * Math.cos(cameraOrbit.yaw),
    -sp * Math.sin(cameraOrbit.yaw),
    cp,
  ];
  const aspect = Math.max(1e-3, canvas.width / Math.max(1, canvas.height));
  const view = mat4LookAt(eye, target, up);
  const halfFovTangent = Math.tan(Math.PI / 9) / Math.min(1, aspect);
  const fovy = 2 * Math.atan(halfFovTangent);
  let proj;
  if ((params.cameraProjection | 0) === 1) {
    const halfH = halfFovTangent * cameraOrbit.distance;
    const halfW = halfH * aspect;
    proj = mat4Orthographic(-halfW, halfW, -halfH, halfH, 0.04 * n, 8.0 * n);
  } else {
    proj = mat4Perspective(fovy, aspect, 0.04 * n, 8.0 * n);
  }
  const viewProj = mat4Mul(proj, view);
  return {
    viewProj,
    eye,
    distance: cameraOrbit.distance,
  };
}

function cameraBasis() {
  const cp = Math.cos(cameraOrbit.pitch);
  const sp = Math.sin(cameraOrbit.pitch);
  const back = vec3Normalize([
    cp * Math.cos(cameraOrbit.yaw),
    cp * Math.sin(cameraOrbit.yaw),
    sp,
  ]);
  const upHint = [
    -sp * Math.cos(cameraOrbit.yaw),
    -sp * Math.sin(cameraOrbit.yaw),
    cp,
  ];
  const right = vec3Normalize(vec3Cross(upHint, back));
  const up = vec3Cross(back, right);
  return { right, up, back };
}

function drawViewGizmo() {
  if (!viewGizmo) return;

  const rect = viewGizmo.getBoundingClientRect();
  const dpr = Math.max(1, Math.min(1.5, window.devicePixelRatio || 1));
  const w = Math.max(1, Math.floor(rect.width * dpr));
  const h = Math.max(1, Math.floor(rect.height * dpr));
  if (viewGizmo.width !== w || viewGizmo.height !== h) {
    viewGizmo.width = w;
    viewGizmo.height = h;
  }

  const ctx = viewGizmo.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, rect.width, rect.height);

  const basis = cameraBasis();
  const origin = [rect.width * 0.46, rect.height * 0.58];
  const len = Math.min(rect.width, rect.height) * 0.33;
  const axes = [
    { label: "X", color: "#ff5b5b", dir: [0, -1, 0] },
    { label: "Y", color: "#58d26f", dir: [1, 0, 0] },
    { label: "Z", color: "#58a6ff", dir: [0, 0, 1] },
  ].map((axis) => {
    const sx = vec3Dot(axis.dir, basis.right);
    const sy = vec3Dot(axis.dir, basis.up);
    const depth = vec3Dot(axis.dir, basis.back);
    return { ...axis, x: sx * len, y: -sy * len, depth };
  }).sort((a, b) => a.depth - b.depth);

  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.fillStyle = "rgba(255,255,255,0.82)";
  ctx.beginPath();
  ctx.arc(origin[0], origin[1], 2.4, 0, Math.PI * 2);
  ctx.fill();

  for (const axis of axes) {
    const x0 = origin[0];
    const y0 = origin[1];
    const x1 = x0 + axis.x;
    const y1 = y0 + axis.y;
    const angle = Math.atan2(axis.y, axis.x);
    const alpha = 0.62 + 0.38 * ((axis.depth + 1) * 0.5);

    ctx.globalAlpha = alpha;
    ctx.strokeStyle = axis.color;
    ctx.fillStyle = axis.color;
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x1 - Math.cos(angle - 0.55) * 7, y1 - Math.sin(angle - 0.55) * 7);
    ctx.lineTo(x1 - Math.cos(angle + 0.55) * 7, y1 - Math.sin(angle + 0.55) * 7);
    ctx.closePath();
    ctx.fill();

    ctx.globalAlpha = 1;
    ctx.font = "700 11px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(axis.label, x1 + Math.cos(angle) * 9, y1 + Math.sin(angle) * 9);
  }
}

// Spin sphere: the initial spin (arrow) and the magnet axes (dashed), seen from the camera.
let spinSphereKey = "";
function drawSpinSphere() {
  if (!spinSphere || spinSphere.closest("[hidden]")) return;
  const rect = spinSphere.getBoundingClientRect();
  if (rect.width < 2) return;
  const basis = cameraBasis();
  const key = [!!spinSphere.closest(".qontic-light"), rect.width, rect.height, params.spinTheta, params.spinPhi, params.magnetAngle, params.magnetPreset,
    basis.right.map(v => v.toFixed(3)), basis.up.map(v => v.toFixed(3))].join();
  if (key === spinSphereKey) return;
  spinSphereKey = key;
  const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
  const w = Math.floor(rect.width * dpr), h = Math.floor(rect.height * dpr);
  if (spinSphere.width !== w || spinSphere.height !== h) { spinSphere.width = w; spinSphere.height = h; }
  const ctx = spinSphere.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, rect.width, rect.height);
  const cx = rect.width / 2, cy = rect.height / 2, R = Math.min(rect.width, rect.height) * 0.34;
  const proj = v => [cx + R * vec3Dot(v, basis.right), cy - R * vec3Dot(v, basis.up), vec3Dot(v, basis.back)];
  const light = !!spinSphere.closest(".qontic-light");
  const ink = light ? "rgba(20,30,45," : "rgba(215,228,238,";
  ctx.lineCap = "round";
  ctx.strokeStyle = ink + "0.35)";
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.arc(cx, cy, R, 0, 2 * Math.PI); ctx.stroke();
  // Equator (the x–y plane).
  ctx.beginPath();
  for (let k = 0; k <= 64; k++) {
    const a = 2 * Math.PI * k / 64;
    const [x, y] = proj([Math.cos(a), Math.sin(a), 0]);
    if (k) ctx.lineTo(x, y); else ctx.moveTo(x, y);
  }
  ctx.strokeStyle = ink + "0.2)"; ctx.stroke();
  // Lab axes.
  ctx.font = "600 10px system-ui, sans-serif";
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  for (const [label, d, col] of [["x", [0, -1, 0], "#ff8a8a"], ["y", [1, 0, 0], "#7fdc8f"], ["z", [0, 0, 1], "#7fb6ff"]]) {
    const [x, y] = proj(d), [x0, y0] = proj(d.map(c => -c));
    ctx.strokeStyle = ink + "0.28)"; ctx.setLineDash([]);
    ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x, y); ctx.stroke();
    const [lx, ly] = proj(d.map(c => 1.22 * c));
    ctx.fillStyle = col; ctx.fillText(label, lx, ly);
  }
  // Magnet axes: dashed through the centre, "+" at the end the + spin part is pushed to.
  magnets().forEach((m, k) => {
    const n = [0, Math.sin(m.theta), Math.cos(m.theta)];
    const [x1, y1] = proj(n), [x0, y0] = proj(n.map(c => -c));
    ctx.strokeStyle = k ? "#ff9ad5" : "#ff5b5b"; ctx.lineWidth = 2; ctx.setLineDash([4, 3]);
    ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = ctx.strokeStyle;
    ctx.font = "700 11px system-ui, sans-serif";
    const [px, py] = proj(n.map(c => 1.08 * c));
    ctx.fillText(k ? "+₂" : "+", px + 6, py - 6);
  });
  // Spin arrow.
  const s = spinVector();
  const [sx, sy, sd] = proj(s);
  ctx.strokeStyle = ctx.fillStyle = "#ffc24a";
  ctx.globalAlpha = sd < 0 ? 0.6 : 1;
  ctx.lineWidth = 2.6;
  ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(sx, sy); ctx.stroke();
  const ang = Math.atan2(sy - cy, sx - cx);
  if (Math.hypot(sx - cx, sy - cy) > 4) {
    ctx.beginPath(); ctx.moveTo(sx, sy);
    ctx.lineTo(sx - 8 * Math.cos(ang - 0.5), sy - 8 * Math.sin(ang - 0.5));
    ctx.lineTo(sx - 8 * Math.cos(ang + 0.5), sy - 8 * Math.sin(ang + 0.5));
    ctx.closePath(); ctx.fill();
  } else {
    ctx.beginPath(); ctx.arc(sx, sy, 3.5, 0, 2 * Math.PI); ctx.fill();
  }
  ctx.globalAlpha = 1;
  spinSphere.setAttribute("aria-label", `Spin direction ${spinLabel()}; magnet axis ${axisName(magnets()[0].theta)}`);
}
// Caption under the sphere: the angle between the spin and the first magnet axis, and the
// orthodox prediction cos²(γ/2) for the + side.
function updateSpinSphereText() {
  if (!spinSphereText) return;
  const s = spinVector();
  const m = magnets()[0];
  const c = Math.max(-1, Math.min(1, s[1] * Math.sin(m.theta) + s[2] * Math.cos(m.theta)));
  const gamma = Math.acos(c) / DEG;
  const pPlus = 0.5 * (1 + c);
  const p = axisName(m.theta), q = axisName(m.theta + Math.PI);
  const note = magnetPreset().b0 < 1 ? `<br><span class="spin-sphere-note">Weak field: spins can flip.</span>` : "";
  spinSphereText.innerHTML = `Angle between <span class="c-spin">spin</span> and <span class="c-mag">magnet</span>: <b>${Math.round(gamma)}°</b><br>${(100 * pPlus).toFixed(0)}% toward ${p}<br>${(100 * (1 - pPlus)).toFixed(0)}% toward ${q}${note}`;
  spinSphereText.title = "γ: angle between the spin (orange arrow) and the magnet axis (red dashed line). Expected fractions: cos²(γ/2) and sin²(γ/2).";
}

function resetWave() {
  if (!waveBufferA || !waveBufferB) return;
  simTime = 0;
  writeUniforms(uniformBuffer, cameraFrame(), canvas.width, canvas.height);
  const encoder = device.createCommandEncoder({ label: "reset wave encoder" });
  const pass = encoder.beginComputePass({ label: "reset wave pass" });
  if (is3D()) {
    pass.setPipeline(pipelineWave3Init);
    pass.setBindGroup(0, wave3InitBindGroup);
    pass.dispatchWorkgroups(dispatchCount(waveCount3, WAVE_WORKGROUP_SIZE));
  } else {
    pass.setPipeline(pipelineWaveInit);
    pass.setBindGroup(0, waveInitBindGroup);
    pass.dispatchWorkgroups(dispatchCount(waveCount, WAVE_WORKGROUP_SIZE));
  }
  pass.end();
  device.queue.submit([encoder.finish()]);
  flip = 0;
}

function waveStep(pass) {
  if (is3D()) {
    pass.setPipeline(pipelineWave3Step);
    pass.setBindGroup(0, wave3StepBindGroups[flip]);
    pass.dispatchWorkgroups(dispatchCount(waveCount3, WAVE_WORKGROUP_SIZE));
  } else {
    pass.setPipeline(pipelineWaveStep);
    pass.setBindGroup(0, waveStepBindGroups[flip]);
    pass.dispatchWorkgroups(dispatchCount(waveCount, WAVE_WORKGROUP_SIZE));
  }
  flip = 1 - flip;
}

function randn() {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

function rebuildParticles() {
  const n = Math.floor(params.nParticles);

  destroyGpuResource(particleSrc);
  destroyGpuResource(particleDst);
  destroyGpuResource(particleStartSide);
  if (!readbackBusy) destroyGpuResource(hitReadback);
  hitReadback = null;

  const data = new Float32Array(n * 4);
  const startSide = new Float32Array(Math.max(1, n));

  const sigma1D = params.packetSigma / Math.sqrt(2);
  const x0 = params.packetX * (simW - 1);
  const y0 = params.packetY * (simH - 1);
  const z0 = params.packetZ * (simD - 1);

  // Draw from |psi|^2 and reject points on or outside the hard walls (psi = 0 there)
  // instead of clamping them onto the walls.
  const inside = (y, z) => y >= 1 && y <= simH - 2 && z >= 1 && z <= simD - 2;
  for (let i = 0; i < n; i++) {
    let x = x0 + randn() * sigma1D;
    let y = y0 + randn() * sigma1D * ribbonFactor();
    let z = z0 + randn() * sigma1D;
    for (let tries = 0; !inside(y, z) && tries < 1000; tries++) {
      y = y0 + randn() * sigma1D * ribbonFactor();
      z = z0 + randn() * sigma1D;
    }
    const xVisual = x;  // no wrap: x is the free coordinate along the beam
    y = Math.max(1, Math.min(simH - 2, y));
    z = Math.max(1, Math.min(simD - 2, z));
    // Colour by the side of the packet along the first magnet's axis (z for a z magnet).
    const n1 = measurementAxes()[0];
    startSide[i] = (y - y0) * n1[0] + (z - z0) * n1[1] > 0 ? 1 : 0;
    data[i * 4 + 0] = x;
    data[i * 4 + 1] = y;
    data[i * 4 + 2] = z;
    data[i * 4 + 3] = xVisual;
  }

  particleSrc = makeBuffer("particle src", data, GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC);
  particleDst = makeStorageBuffer("particle dst", data.byteLength, GPUBufferUsage.COPY_SRC);
  particleStartSide = makeBuffer("particle start side", startSide, GPUBufferUsage.STORAGE);
  // At the start the wave's spin direction is the prepared spin everywhere.
  const spin0 = new Float32Array(Math.max(1, n) * 4);
  const sv = spinVector();
  for (let i = 0; i < n; i++) spin0.set([sv[0], sv[1], sv[2], 1], 4 * i);
  destroyGpuResource(particleSpin);
  particleSpin = makeBuffer("particle spin", spin0, GPUBufferUsage.STORAGE);
  if (n > 0) {
    hitReadback = device.createBuffer({
      label: "plate hit readback",
      size: Math.max(16, data.byteLength),
      usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST,
    });
  }
  hitCounts = { counts: measurementAxes().length > 1 ? [0, 0, 0, 0] : [0, 0], arrived: 0, total: n };
  lastHitReadback = 0;
  updateHitDisplay();
  particleFlip = 0;
  rebuildParticleBindGroups();
}

const hitDisplay = document.getElementById("plate-hits");
// Labels of the outcome regions on the plate: two halves along one axis, or four quadrants.
function outcomeLabels() {
  const ms = magnets();
  const p = ms.map(m => axisName(m.theta)), q = ms.map(m => axisName(m.theta + Math.PI));
  if (ms.length > 1) return [`${p[0]}, ${p[1]}`, `${p[0]}, ${q[1]}`, `${q[0]}, ${p[1]}`, `${q[0]}, ${q[1]}`];
  if (p[0] === "+z") return ["Upper half (+z)", "Lower half (−z)"];
  return [`Toward ${p[0]}`, `Toward ${q[0]}`];
}
// Colour the outcome labels like the branches: green for + along the (last) magnet axis, red for −.
function colourLabel(label, k, n) {
  const plus = n > 2 ? k % 2 === 0 : k === 0;
  return `<span style="color:${plus ? "#45ee66" : "#ff5533"}">${label}</span>`;
}
function updateHitDisplay() {
  if (!hitDisplay) return;
  const labels = outcomeLabels();
  if (reading === "cpn") {
    hitDisplay.hidden = false;
    const vals = weightCounts.values;
    const rows = labels.map((l, k) => `${colourLabel(l, k, labels.length)}: ${weightCounts.valid && vals[k] !== undefined ? vals[k].toFixed(2) : "–"}`).join("<br>");
    const sp = weightCounts.valid && weightCounts.spin ? Math.hypot(...weightCounts.spin).toFixed(2) : "–";
    hitDisplay.innerHTML = `<b>Probability now</b><br>${rows}<br>Length of ⟨σ⟩: ${sp}<br><span class="plate-hits-note">Weight of |Ψ|² in each region.<br>At the screen: the chance of a hit there.</span>`;
    return;
  }
  hitDisplay.hidden = !dotsShown() || hitCounts.total <= 0;
  const rows = labels.map((l, k) => `${colourLabel(l, k, labels.length)}: ${hitCounts.counts[k] ?? 0}`).join("<br>");
  hitDisplay.innerHTML = `<b>Dots at the screen</b><br>${rows}<br>${hitCounts.arrived} of ${hitCounts.total} arrived`;
}

// Orthodox reading: sum |Psi|^2 above and below the middle on the GPU, then read the sums back.
function readWeights(now) {
  const wbg = is3D() ? weight3BindGroups : weightBindGroups;
  if (readbackBusy || !weightReadback || !wbg.length || now - lastHitReadback < HIT_READBACK_MS) return;
  lastHitReadback = now;
  const groups = dispatchCount(activeWaveCount(), WAVE_WORKGROUP_SIZE);
  const readback = weightReadback;
  const encoder = device.createCommandEncoder({ label: "probability weight" });
  const pass = encoder.beginComputePass({ label: "probability weight pass" });
  pass.setPipeline(pipelineWeightReduce);
  pass.setBindGroup(0, wbg[flip]);
  pass.dispatchWorkgroups(groups);
  pass.end();
  encoder.copyBufferToBuffer(weightPartials, 0, readback, 0, groups * 48);
  device.queue.submit([encoder.finish()]);
  readbackBusy = true;
  const twoAxes = measurementAxes().length > 1;
  const tRead = simTime;
  readback.mapAsync(GPUMapMode.READ, 0, groups * 48).then(() => {
    const sums = new Float32Array(readback.getMappedRange(0, groups * 48));
    let A = 0, B = 0, AB = 0, total = 0, mx = 0, my = 0, mz = 0, ry = 0, rz = 0, rx = 0;
    for (let i = 0; i < groups; i++) {
      const k = 12 * i;
      A += sums[k]; B += sums[k + 1]; AB += sums[k + 2]; total += sums[k + 3];
      mx += sums[k + 4]; my += sums[k + 5]; mz += sums[k + 6];
      ry += sums[k + 8]; rz += sums[k + 9]; rx += sums[k + 10];
    }
    readback.unmap();
    if (readback === weightReadback && total > 0) {
      const values = twoAxes
        ? [AB / total, (A - AB) / total, (B - AB) / total, (total - A - B + AB) / total]
        : [A / total, 1 - A / total];
      // <sigma> of the whole state and the centre of |chi|^2 (from the box centre).
      weightCounts = { values, valid: true, spin: [mx / total, my / total, mz / total], centre: [ry / total, rz / total], beam: rx / total, time: tRead };
      updateHitDisplay();
    } else if (readback !== weightReadback) {
      readback.destroy();
    }
  }).catch(() => {}).finally(() => { readbackBusy = false; });
}

// Count the dots stopped at the plate, by the half of the plate they hit.
function readHitCounts(now) {
  if (readbackBusy || !hitReadback || now - lastHitReadback < HIT_READBACK_MS) return;
  const n = Math.floor(params.nParticles);
  if (n <= 0) return;
  lastHitReadback = now;
  const buffer = hitReadback;
  const source = particleFlip === 0 ? particleSrc : particleDst;
  const encoder = device.createCommandEncoder({ label: "plate hit copy" });
  encoder.copyBufferToBuffer(source, 0, buffer, 0, n * 16);
  device.queue.submit([encoder.finish()]);
  readbackBusy = true;
  const plateX = detectorPlateXGrid();
  const cy = 0.5 * (simH - 1), cz = 0.5 * (simD - 1);
  const axes = measurementAxes();
  buffer.mapAsync(GPUMapMode.READ, 0, n * 16).then(() => {
    const state = new Float32Array(buffer.getMappedRange(0, n * 16));
    const counts = axes.length > 1 ? [0, 0, 0, 0] : [0, 0];
    let arrived = 0;
    for (let i = 0; i < n; i++) {
      if (state[i * 4 + 3] < plateX - 1e-4) continue;
      const dy = state[i * 4 + 1] - cy, dz = state[i * 4 + 2] - cz;
      const a = dy * axes[0][0] + dz * axes[0][1] > 0;
      if (axes.length > 1) {
        const b = dy * axes[1][0] + dz * axes[1][1] > 0;
        counts[a ? (b ? 0 : 1) : (b ? 2 : 3)]++;
      } else {
        counts[a ? 0 : 1]++;
      }
      arrived++;
    }
    buffer.unmap();
    if (buffer === hitReadback) {
      hitCounts = { counts, arrived, total: n };
      updateHitDisplay();
    } else {
      buffer.destroy();
    }
  }).catch(() => {}).finally(() => { readbackBusy = false; });
}

function particleUpdate(pass) {
  const n = Math.floor(params.nParticles);
  if (n <= 0) return;
  pass.setPipeline(is3D() ? pipelineParticleUpdate3 : pipelineParticleUpdate);
  pass.setBindGroup(0, (is3D() ? particle3BindGroups : particleUpdateBindGroups)[flip][particleFlip]);
  pass.dispatchWorkgroups(dispatchCount(n, PARTICLE_WORKGROUP_SIZE));
  particleFlip = 1 - particleFlip;
}

const LN2 = Math.log(2);
function fadeFromHalfLife(halfLife, dtTotal) {
  if (halfLife <= 0) return 0.0;
  return Math.exp(-LN2 * (dtTotal / halfLife));
}

function rebuildDensity() {
  deleteDensityTargets();

  densW = Math.max(64, Math.floor(canvas.width * params.densityScale));
  densH = Math.max(64, Math.floor(canvas.height * params.densityScale));

  densTexA = makeDensityTexture("trail density A", densW, densH);
  densTexB = makeDensityTexture("trail density B", densW, densH);
  densViewA = densTexA.createView();
  densViewB = densTexB.createView();
  densFlip = 0;
  rebuildDensityBindGroups();

  clearDensity();
}

function clearDensity() {
  if (!densViewA || !densViewB) {
    trailClearPending = false;
    return;
  }

  const encoder = device.createCommandEncoder({ label: "clear trail density encoder" });
  for (const view of [densViewA, densViewB]) {
    const pass = encoder.beginRenderPass({
      label: "clear trail density pass",
      colorAttachments: [{
        view,
        clearValue: { r: 0, g: 0, b: 0, a: 0 },
        loadOp: "clear",
        storeOp: "store",
      }],
    });
    pass.end();
  }
  device.queue.submit([encoder.finish()]);
  densFlip = 0;
  trailClearPending = false;
}

function densityStepAndStamp(encoder, camera) {
  if (!densViewA || !densViewB) return;
  const dtTotal = params.dt * Math.floor(params.stepsPerFrame);
  const sizeScale = densW / Math.max(1, canvas.width);
  const fade = fadeFromHalfLife(params.trailHalfLife, dtTotal);
  writeUniforms(trailUniformBuffer, camera, densW, densH, fade, sizeScale);
  const dstView = densFlip ? densViewA : densViewB;
  const pass = encoder.beginRenderPass({
    label: "trail fade and stamp pass",
    colorAttachments: [{
      view: dstView,
      clearValue: { r: 0, g: 0, b: 0, a: 0 },
      loadOp: "clear",
      storeOp: "store",
    }],
  });
  pass.setPipeline(pipelineDensityFade);
  pass.setBindGroup(0, densityFadeBindGroups[densFlip]);
  pass.draw(3);
  pass.setPipeline(pipelineParticleStamp);
  pass.setBindGroup(0, particleStampBindGroups[particleFlip]);
  pass.draw(6, Math.floor(params.nParticles));
  pass.end();
  densFlip = 1 - densFlip;
}

function render(encoder, camera) {
  const currentTexture = gpuContext.getCurrentTexture();
  const pass = encoder.beginRenderPass({
    label: "main render pass",
    colorAttachments: [{
      view: currentTexture.createView(),
      clearValue: { r: 0.005, g: 0.008, b: 0.012, a: 1 },
      loadOp: "clear",
      storeOp: "store",
    }],
  });

  if (params.showMagnet && magnetPoleBuffer && magnetPoleVertexCount > 0) {
    pass.setPipeline(pipelineMagnetPole);
    pass.setBindGroup(0, magnetPoleBindGroup);
    pass.setVertexBuffer(0, magnetPoleBuffer);
    pass.draw(magnetPoleVertexCount);
  }

  if (params.showCloud) {
    pass.setPipeline(pipelineCloud);
    pass.setBindGroup(0, (is3D() ? cloud3BindGroups : cloudBindGroups)[flip]);
    pass.draw(6, voxelCount);
  }

  if (trailsShown() && densityRenderBindGroups.length) {
    pass.setPipeline(pipelineDensityRenderGlow);
    pass.setBindGroup(0, densityRenderBindGroups[densFlip]);
    pass.draw(3);
  }

  if (boxShellBuffer && boxShellVertexCount > 0) {
    pass.setPipeline(pipelineBoxShell);
    pass.setBindGroup(0, boxShellBindGroup);
    pass.setVertexBuffer(0, boxShellBuffer);
    pass.draw(boxShellVertexCount);
  }

  if (boxBuffer && boxVertexCount > 0) {
    pass.setPipeline(pipelineLine);
    pass.setBindGroup(0, lineBindGroup);
    pass.setVertexBuffer(0, boxBuffer);
    pass.draw(boxVertexCount);
  }

  pass.setPipeline(pipelineDetectorPlate);
  pass.setBindGroup(0, detectorPlateBindGroup);
  pass.draw(6);

  if (params.sgFieldOn && params.sgGradient > 0 && fieldLineBuffer && fieldLineVertexCount > 0) {
    pass.setPipeline(pipelineFieldLine);
    pass.setBindGroup(0, fieldLineBindGroup);
    pass.setVertexBuffer(0, fieldLineBuffer);
    pass.draw(fieldLineVertexCount);
    if (params.showFieldArrows && fieldArrowBuffer && fieldArrowVertexCount > 0) {
      pass.setVertexBuffer(0, fieldArrowBuffer);
      pass.draw(fieldArrowVertexCount);
    }
  }

  if (dotsShown()) {
    pass.setPipeline(pipelineParticleRender);
    pass.setBindGroup(0, particleRenderBindGroups[particleFlip]);
    pass.draw(6, Math.floor(params.nParticles));
    if (params.showDotSpin && spinArrowBindGroups.length) {
      pass.setPipeline(pipelineSpinArrow);
      pass.setBindGroup(0, spinArrowBindGroups[particleFlip]);
      pass.draw(9, Math.ceil(Math.floor(params.nParticles) / spinArrowStride()));
    }
  }

  if (params.showSpin && updateMeanSpinArrow()) {
    pass.setPipeline(pipelineMagnetPole);
    pass.setBindGroup(0, magnetPoleBindGroup);
    pass.setVertexBuffer(0, meanSpinBuffer);
    pass.draw(meanSpinVertexCount);
  }

  pass.end();
}

function guidingModeLabel() {
  return `${GUIDING_MODE_NAMES[0]} ${spinLabel()}`;
}

const legendField = document.getElementById("legend-field");
const legendCloud = document.getElementById("legend-cloud");
const legendDots = document.getElementById("legend-dots");
const legendCloudText = document.querySelector("#legend-cloud .legend-text");
const legendPlateText = document.querySelector("#legend-plate .legend-text");
const legendSpin = document.getElementById("legend-spin");
const legendSpinText = document.querySelector("#legend-spin .legend-text");
function updateStats() {
  if (legendField) legendField.hidden = !(params.sgFieldOn && params.sgGradient > 0);
  if (legendCloud) legendCloud.hidden = !params.showCloud;
  if (legendDots) legendDots.hidden = !dotsShown();
  if (legendCloudText) legendCloudText.textContent = reading === "pw"
    ? "Cloud: |Ψ|²."
    : "Cloud: |Ψ|². In the orthodox reading it gives the probability of finding the particle at each place when its position is measured; the theory gives the particle no path.";
  if (legendSpin) {
    legendSpin.hidden = !(params.showSpin || (params.showDotSpin && dotsShown()));
    const packet = "Arrow at the packet: the spin ⟨σ⟩ of the whole state. Full length: a definite direction; shorter: spin and position are entangled.";
    const dots = " Small arrows on the dots: spin direction of the wave at each dot.";
    legendSpinText.textContent = (params.showSpin ? packet : "") + (params.showDotSpin && dotsShown() ? dots : "");
  }
  if (legendPlateText) legendPlateText.textContent = reading === "pw"
    ? "Screen: a dot stops where it reaches it."
    : "Screen: where the position is measured. The chance of a hit in each region is the weight of |Ψ|² that reaches it.";
  const spinText = spinLabel();
  updateSpinSphereText();
  refreshUnitLabels();
  updateLegendField();
  const lab = labValues();
  const fieldOn = params.sgFieldOn && params.sgGradient > 0;
  const gText = fieldOn ? `${labGradient(params.sgGradient).toFixed(1)} T/cm` : "field off";
  const L = Math.max(1, 0.5 * (simD - 1));
  let sText = "none (field off)";
  if (fieldOn) {
    const parts = expectedSplittings().map(s => {
      if (!Number.isFinite(s.cells)) return "–";
      const near = s.cells < 4 * packetStdAtScreen() ? " (spots overlap)" : "";
      const label = magnets().length > 1 ? `${s.axis} ` : "";
      return `${label}≈ ${(s.cells * LAB_SCALE.sz * 1e3).toFixed(2)} mm${near}`;
    });
    sText = parts.join(", ");
  }
  statsEl.innerHTML = `<b>Magnet</b> ${magnetLengthCm().toFixed(1)} cm &nbsp; <b>Splitting</b> ${sText} &nbsp; <b>Flight</b> ${(lab.flightTime * 1e6).toFixed(0)} µs over ${(lab.flight * 100).toFixed(1)} cm`;
  statsEl.title = `Gradient ${gText}. Spin ${spinText}. The wave spreads about ${roughPower(lab.ratio)} times faster than a real silver atom's (see Physics: Units).`;
}

// Legend text for the field lines, per magnet preset and angle.
function updateLegendField() {
  if (!legendField) return;
  const preset = magnetPreset();
  const ms = magnets();
  const p = ms.map(m => axisName(m.theta)), q = ms.map(m => axisName(m.theta + Math.PI));
  const head = "Field lines of B.";
  let text;
  if (ms.length > 1) {
    text = `${head} First magnet along ${p[0]}, second along ${p[1]}; no field between them.`;
  } else if (preset.b0 < 1) {
    text = `${head} Along ${p[0]}, but weak: on the ${q[0]} side it almost vanishes, and spins can flip.`;
  } else {
    text = `${head} The field points along ${p[0]} and is stronger toward ${p[0]}: the ${p[0]} spin part goes that way, the ${q[0]} part the other.${fieldShape() ? " Knife-edge field: the gradient is largest near the edge and falls off to the sides." : ""}`;
  }
  legendField.innerHTML = `<i class="swatch field"></i>${text}`;
}

function rebuildBoxGeometry() {
  destroyGpuResource(boxBuffer);
  destroyGpuResource(boxShellBuffer);

  // One tunnel from the packet start (x = 0 on the axes) to the plate; nothing is drawn
  // before the start. The periodic grid still wraps underneath.
  const x0 = tunnelStartX(), y0 = 0, z0 = 0;
  const x1 = detectorPlateXGrid(), y1 = simH - 1, z1 = simD - 1;
  const edges = [
    0, 1, 3, 2,
    4, 5, 7, 6,
    0, 4, 3, 7, 0, 3, 4, 7,  // start face
    1, 5, 2, 6, 1, 2, 5, 6,  // plate face
  ];
  const copyOffsets = [0];
  const corridorFade = (copy) => {
    const d = Math.abs(copy);
    if (d <= 2) return 1.0;
    return 0.18;
  };
  const periodX = Math.max(1, simW - 1);
  const lineVerts = [];
  const shellVerts = [];
  const copyCorners = (copy) => {
    const dx = 0;
    return [
      [x0 + dx, y0, z0], [x1 + dx, y0, z0], [x1 + dx, y1, z0], [x0 + dx, y1, z0],
      [x0 + dx, y0, z1], [x1 + dx, y0, z1], [x1 + dx, y1, z1], [x0 + dx, y1, z1],
    ];
  };
  for (const copy of copyOffsets) {
    const fade = corridorFade(copy);
    const corners = copyCorners(copy);
    for (let i = 0; i < edges.length; i++) {
      const p = corners[edges[i]];
      lineVerts.push(p[0] * X_VIS * params.boxScale, p[1] * params.boxScale, p[2] * params.boxScale, fade);
    }
  }

  boxVertexCount = lineVerts.length / 4;
  boxBuffer = makeBuffer("box wireframe vertices", new Float32Array(lineVerts), GPUBufferUsage.VERTEX);

  const faceUv = (corner, normal, copy) => {
    const localX = corner[0] / periodX;
    const cross = Math.abs(normal[1]) > Math.abs(normal[2])
      ? corner[2] / Math.max(1, z1 - z0)
      : corner[1] / Math.max(1, y1 - y0);
    return [localX, cross];
  };
  const pushShellVertex = (corner, normal, fade, copy) => {
    const uv = faceUv(corner, normal, copy);
    shellVerts.push(
      corner[0] * X_VIS * params.boxScale,
      corner[1] * params.boxScale,
      corner[2] * params.boxScale,
      normal[0],
      normal[1],
      normal[2],
      uv[0],
      uv[1],
      fade
    );
  };
  const pushFace = (corners, copy, a, b, c, d, normal, fade) => {
    pushShellVertex(corners[a], normal, fade, copy);
    pushShellVertex(corners[b], normal, fade, copy);
    pushShellVertex(corners[c], normal, fade, copy);
    pushShellVertex(corners[a], normal, fade, copy);
    pushShellVertex(corners[c], normal, fade, copy);
    pushShellVertex(corners[d], normal, fade, copy);
  };

  for (const copy of copyOffsets) {
    const fade = corridorFade(copy);
    const corners = copyCorners(copy);
    pushFace(corners, copy, 0, 1, 2, 3, [0, 0, -1], fade);
    pushFace(corners, copy, 4, 7, 6, 5, [0, 0, 1], fade);
    pushFace(corners, copy, 0, 4, 5, 1, [0, -1, 0], fade);
    pushFace(corners, copy, 3, 2, 6, 7, [0, 1, 0], fade);
  }

  boxShellVertexCount = shellVerts.length / 9;
  boxShellBuffer = makeBuffer("box shell vertices", new Float32Array(shellVerts), GPUBufferUsage.VERTEX);
}

// Orthodox reading: one arrow for <sigma> of the whole state, at the centre of the packet.
// Its length is |<sigma>|: 1 when the spin has a definite direction, less when spin and
// position are entangled (after the parts separate), 0 for an equal split.
const MEAN_SPIN_COLOR = [1.0, 0.76, 0.29, 0.95];
function updateMeanSpinArrow() {
  if (!weightCounts.valid || !weightCounts.spin || !device) return false;
  const [sx, sy, sz] = weightCounts.spin;
  const len = Math.hypot(sx, sy, sz);
  if (len < 0.03) return false;
  const d = [sx / len, sy / len, sz / len];
  const cy = 0.5 * (simH - 1) + weightCounts.centre[0], cz = 0.5 * (simD - 1) + weightCounts.centre[1];
  const base = [Math.min(visualPacketCenterX(), detectorPlateXGrid()), cy, cz];
  const L = 34 * len, head = Math.min(10, 0.45 * L), r0 = 1.9, r1 = 4.8;
  // Orthonormal frame around d.
  const a = Math.abs(d[0]) < 0.9 ? [1, 0, 0] : [0, 1, 0];
  const cross = (u, v) => [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]];
  const norm = u => { const l = Math.hypot(...u) || 1; return u.map(c => c / l); };
  const e1 = norm(cross(d, a)), e2 = cross(d, e1);
  // Built in world units: the base is drawn compressed along the beam, the arrow keeps its true direction.
  const baseW = [base[0] * X_VIS, base[1], base[2]];
  const at = (t, r, ang) => [0, 1, 2].map(i => baseW[i] + d[i] * t + r * (Math.cos(ang) * e1[i] + Math.sin(ang) * e2[i]));
  const radial = ang => [0, 1, 2].map(i => Math.cos(ang) * e1[i] + Math.sin(ang) * e2[i]);
  const verts = [];
  const sc = params.boxScale;
  const tri = (p, q, w, n) => {
    const u = [q[0] - p[0], q[1] - p[1], q[2] - p[2]], v = [w[0] - p[0], w[1] - p[1], w[2] - p[2]];
    const c = cross(u, v);
    if (c[0] * n[0] + c[1] * n[1] + c[2] * n[2] < 0) [q, w] = [w, q];
    for (const P of [p, q, w]) verts.push(P[0] * sc, P[1] * sc, P[2] * sc, n[0], n[1], n[2], ...MEAN_SPIN_COLOR);
  };
  const K = 8, neck = L - head;
  for (let k = 0; k < K; k++) {
    const a0 = 2 * Math.PI * k / K, a1 = 2 * Math.PI * (k + 1) / K, am = 0.5 * (a0 + a1);
    const nr = radial(am);
    tri(at(0, r0, a0), at(neck, r0, a0), at(neck, r0, a1), nr);
    tri(at(0, r0, a0), at(neck, r0, a1), at(0, r0, a1), nr);
    tri(at(0, 0, 0), at(0, r0, a0), at(0, r0, a1), d.map(c => -c));
    const coneN = norm([0, 1, 2].map(i => nr[i] * head + d[i] * r1));
    tri(at(neck, r1, a0), at(L, 0, 0), at(neck, r1, a1), coneN);
    tri(at(neck, 0, 0), at(neck, r1, a0), at(neck, r1, a1), d.map(c => -c));
  }
  if (!meanSpinBuffer) {
    meanSpinBuffer = device.createBuffer({ label: "mean spin arrow", size: MEAN_SPIN_MAX_VERTS * 40, usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST });
  }
  meanSpinVertexCount = Math.min(MEAN_SPIN_MAX_VERTS, verts.length / 10);
  device.queue.writeBuffer(meanSpinBuffer, 0, new Float32Array(verts.slice(0, meanSpinVertexCount * 10)));
  return true;
}

// Magnet poles, drawn outside the tunnel for each magnet over the part of the flight where it
// is on. The field B = g(0, −y′, b0 + z′) (turned with the magnet) points along the magnet
// axis +n and is stronger toward +n, so the pole on the +n side is the S pole, shaped as a
// knife edge (blue), and the pole on the −n side is the N pole (red), flat with a shallow
// groove, as in the 1922 apparatus. The poles sit just outside the square tunnel, so they
// move out a little when the magnet is turned.
const POLE_S_COLOR = [0.16, 0.32, 0.95, 0.42];
const POLE_N_COLOR = [0.88, 0.14, 0.16, 0.42];
function rebuildMagnetPoles() {
  destroyGpuResource(magnetPoleBuffer);
  magnetPoleBuffer = null;
  magnetPoleVertexCount = 0;
  if (!device) return;
  const cy = 0.5 * (simH - 1), cz = 0.5 * (simD - 1);
  const L = Math.max(1, cz);
  const verts = [];
  const sc = params.boxScale;
  const push = (p, n, col) => verts.push(p[0] * X_VIS * sc, p[1] * sc, p[2] * sc, n[0], n[1], n[2], col[0], col[1], col[2], col[3]);
  const tri = (a, b, c, n, col) => {
    const u = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], v = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
    const cr = [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]];
    if (cr[0] * n[0] + cr[1] * n[1] + cr[2] * n[2] < 0) [b, c] = [c, b];
    push(a, n, col); push(b, n, col); push(c, n, col);
  };
  // Prism of a 2D profile (t, n coordinates, counter-clockwise, star-shaped about `centre`).
  const prism = (poly, centre, xa, xb, T, N, col) => {
    const at = (q, x) => [x, cy + q[0] * T[1] + q[1] * N[1], cz + q[0] * T[2] + q[1] * N[2]];
    for (let i = 0; i < poly.length; i++) {
      const p = poly[i], q = poly[(i + 1) % poly.length];
      const e = [q[0] - p[0], q[1] - p[1]];
      const len = Math.hypot(e[0], e[1]) || 1;
      const o = [e[1] / len, -e[0] / len];
      const nrm = [0, o[0] * T[1] + o[1] * N[1], o[0] * T[2] + o[1] * N[2]];
      tri(at(p, xa), at(q, xa), at(q, xb), nrm, col);
      tri(at(p, xa), at(q, xb), at(p, xb), nrm, col);
      tri(at(centre, xb), at(p, xb), at(q, xb), [1, 0, 0], col);
      tri(at(centre, xa), at(q, xa), at(p, xa), [-1, 0, 0], col);
    }
  };
  for (const mg of magnets()) {
    const xa = mg.a + 0.5 * RAMP_CELLS;
    const xb = mg.b - 0.5 * RAMP_CELLS;
    if (xb - xa < 1) continue;
    const N = [0, Math.sin(mg.theta), Math.cos(mg.theta)];
    const T = [0, Math.cos(mg.theta), -Math.sin(mg.theta)];
    const h = L * (Math.abs(N[1]) + Math.abs(N[2])) + 3;   // just outside the tunnel
    // Pole faces follow level curves of the magnetic potential of the chosen field (iron pole
    // faces are equipotentials): the S pole face just outside the tunnel at its middle, the N
    // pole face just outside it at its edges. Textbook field: gently curved (hyperbolic) faces;
    // knife-edge field: circles about the line pole, a rounded edge (S) and a groove (N).
    const W = 0.75 * L;
    const b0 = magnetPreset().b0;
    const hL = h / L, WL = W / L;
    const phi = (u, w) => magnetPotentialUW(u, w, b0);
    const solveW = (u, target, lo, hi) => {        // Φ decreases with w along the axis direction
      // Textbook field: Φ = u²/2 − b0 w − w²/2, solved exactly (the root on the near side of
      // w = −b0, where the field along the axis vanishes).
      if (!fieldShape()) return -b0 + Math.sqrt(Math.max(0, b0 * b0 - 2 * target + u * u));
      let fLo = phi(u, lo) - target;
      for (let k = 0; k < 50; k++) {
        const mid = 0.5 * (lo + hi), f = phi(u, mid) - target;
        if ((f > 0) === (fLo > 0)) { lo = mid; fLo = f; } else hi = mid;
      }
      return 0.5 * (lo + hi);
    };
    const nSeg = 16;
    const capS = 0.45, capN = 0.3;
    const wTop = fieldShape() ? KNIFE_HP - 0.02 : hL + 3;   // below the line pole
    // Knife edge: the S face must stay below the line pole; for a tilted magnet it may then cut
    // the corners of the square tunnel drawing.
    const hS = fieldShape() ? Math.min(hL, KNIFE_HP - 0.12) : hL;
    const targetS = phi(0, hS), targetN = phi(WL, -hL);
    const faceS = [], faceN = [];
    for (let k = 0; k <= nSeg; k++) {
      const u = -WL + 2 * WL * k / nSeg;
      faceS.push([u * L, solveW(u, targetS, 0.5 * hS, wTop) * L]);
      faceN.push([u * L, solveW(u, targetN, -hL - 3, -0.5 * hL) * L]);
    }
    const sTop = Math.max(...faceS.map(p => p[1])) + capS * L;
    const nBot = Math.min(...faceN.map(p => p[1])) - capN * L;
    const wedge = [...faceS, [W, sTop], [-W, sTop]];
    const flat = [...faceN, [W, nBot], [-W, nBot]];
    const ccw = poly => {
      let a = 0;
      for (let i = 0; i < poly.length; i++) { const p = poly[i], q = poly[(i + 1) % poly.length]; a += p[0] * q[1] - q[0] * p[1]; }
      return a < 0 ? poly.slice().reverse() : poly;
    };
    prism(ccw(wedge), [0, 0.5 * (faceS[nSeg >> 1][1] + sTop)], xa, xb, T, N, POLE_S_COLOR);
    prism(ccw(flat), [0, 0.5 * (faceN[nSeg >> 1][1] + nBot)], xa, xb, T, N, POLE_N_COLOR);
  }
  if (!verts.length) return;
  magnetPoleVertexCount = verts.length / 10;
  magnetPoleBuffer = makeBuffer("magnet pole vertices", new Float32Array(verts), GPUBufferUsage.VERTEX);
}

// Direction of B at grid point p from the magnets active at that x (same formula as the shader).
function sgFieldDirectionGrid(p, segs = magnetsAtX(p[0])) {
  const cy = 0.5 * (simH - 1);
  const cz = 0.5 * (simD - 1);
  const L = Math.max(1, cz);
  const b0 = magnetPreset().b0;
  let by = 0, bz = 0;
  for (const s of segs) {
    if (s.p <= 0) continue;
    const c = Math.cos(s.theta), sn = Math.sin(s.theta);
    const dy = p[1] - cy, dz = p[2] - cz;
    const u = (dy * c - dz * sn) / L;
    const w = (dy * sn + dz * c) / L;
    const [bu, bv] = magnetFieldUW(u, w, b0);
    by += s.p * (bu * c + bv * sn);
    bz += s.p * (-bu * sn + bv * c);
  }
  const len = Math.hypot(by, bz);
  if (len < 1e-5) return null;
  return [0, by / len, bz / len];
}

function isInsideFieldLineBox(p, margin) {
  return p[1] >= margin && p[1] <= simH - 1 - margin &&
    p[2] >= margin && p[2] <= simD - 1 - margin;
}

function pushFieldLineSegment(verts, a, b, fade) {
  const ax = a[0] * X_VIS * params.boxScale;
  const ay = a[1] * params.boxScale;
  const az = a[2] * params.boxScale;
  const bx = b[0] * X_VIS * params.boxScale;
  const by = b[1] * params.boxScale;
  const bz = b[2] * params.boxScale;
  const pushVertex = (side, along) => {
    verts.push(ax, ay, az, bx, by, bz, fade, side, along);
  };
  pushVertex(-1, 0);
  pushVertex(1, 0);
  pushVertex(-1, 1);
  pushVertex(-1, 1);
  pushVertex(1, 0);
  pushVertex(1, 1);
}

// Arrowhead pointing along B at p: four short strokes from the tip, two in the
// plane of x and B and two in the y–z plane, so it reads from any view.
const FIELD_ARROW = { spacing: 22, length: 3.4, width: 1.8 };
function pushFieldArrow(arrows, p, dir, fade) {
  const L = FIELD_ARROW.length, W = FIELD_ARROW.width;
  const tip = [p[0], p[1] + 0.5 * L * dir[1], p[2] + 0.5 * L * dir[2]];
  const back = [p[0], p[1] - 0.5 * L * dir[1], p[2] - 0.5 * L * dir[2]];
  const perps = [[1, 0, 0], [0, -dir[2], dir[1]]];
  for (const n of perps) {
    for (const s of [-1, 1]) {
      pushFieldLineSegment(arrows, tip, [back[0] + s * W * n[0], back[1] + s * W * n[1], back[2] + s * W * n[2]], fade);
    }
  }
}

function traceSgFieldLine(verts, start, sign, fade, step, maxSteps, margin, arrows = null, segs = null) {
  let p = start.slice();
  let sinceArrow = 0.5 * params.fieldArrowSpacing;
  for (let i = 0; i < maxSteps; i++) {
    const dir = sgFieldDirectionGrid(p, segs || magnetsAtX(p[0]));
    if (!dir) break;
    const q = [
      p[0],
      p[1] + sign * dir[1] * step,
      p[2] + sign * dir[2] * step,
    ];
    if (!isInsideFieldLineBox(q, margin)) break;
    pushFieldLineSegment(verts, p, q, fade);
    sinceArrow += step;
    if (arrows && sinceArrow >= params.fieldArrowSpacing) {
      pushFieldArrow(arrows, q, dir, Math.min(1, fade * 1.25));
      sinceArrow = 0;
    }
    p = q;
  }
}

// Few, faint field lines so they read as a guide rather than a curtain in 3D.
// copyFade is for the box copies at x offsets -1, 0, +1 (the packet starts in copy 0).
const FIELD_LINE_STYLE = { xFracs: [0.2, 0.5, 0.8], copyFade: [0.2, 0.65, 0.65] };
function rebuildMagneticFieldLines() {
  rebuildMagnetPoles();
  destroyGpuResource(fieldLineBuffer);
  fieldLineBuffer = null;
  destroyGpuResource(fieldArrowBuffer);
  fieldArrowBuffer = null;
  fieldArrowVertexCount = 0;
  fieldLineVertexCount = 0;
  if (simW < 4 || simH < 4 || simD < 4) return;

  const verts = [];
  const arrows = [];
  const yMax = simH - 1;
  const zMax = simD - 1;
  const margin = 1.35;
  const step = Math.max(0.75, Math.max(simH, simD) / 112);
  const maxSteps = Math.ceil(3.2 * Math.max(simH, simD) / step);
  // Columns of field lines along the tunnel, drawn only where a magnet is on, fading with it.
  const ms = magnets();
  const x0 = Math.min(...ms.map(mg => mg.a)) + 5, x1 = lastMagnetEndX() - 5;
  const n = Math.max(1, Math.round(params.fieldLineDensity));
  const columns = Math.max(2, Math.round((x1 - x0) * n / (22 * BEAM_SCALE)) + 1);
  for (let k = 0; k < columns; k++) {
    const x = x0 + (x1 - x0) * k / (columns - 1);
    const segs = magnetsAtX(x);
    const strength = Math.min(1, segs.reduce((s, g) => s + g.p, 0));
    if (strength < 0.05) continue;
    const fade = 0.65 * strength;
    const seeds = [];
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) seeds.push([0.1 + 0.8 * (i + 0.5) / n, 0.1 + 0.8 * (j + 0.5) / n]);
    for (const [yf, zf] of seeds) {
      const start = [x, yf * yMax, zf * zMax];
      traceSgFieldLine(verts, start, 1, fade, step, maxSteps, margin, arrows, segs);
      traceSgFieldLine(verts, start, -1, fade, step, maxSteps, margin, arrows, segs);
    }
  }

  fieldLineVertexCount = verts.length / 9;
  if (fieldLineVertexCount > 0) {
    fieldLineBuffer = makeBuffer("SG magnetic field line vertices", new Float32Array(verts), GPUBufferUsage.VERTEX);
  }
  fieldArrowVertexCount = arrows.length / 9;
  if (fieldArrowVertexCount > 0) {
    fieldArrowBuffer = makeBuffer("SG magnetic field arrow vertices", new Float32Array(arrows), GPUBufferUsage.VERTEX);
  }
}

function rebuildSimulation() {
  resizeCanvas();

  simW = GRID_X;
  simH = GRID_YZ;
  simD = GRID_YZ;
  waveCount = simH * simD;
  voxelCount = simW * Math.floor(simH / CLOUD_STRIDE) * Math.floor(simD / CLOUD_STRIDE);
  cameraOrbit.distance = DEFAULT_CAMERA_DISTANCE * sceneExtent();
  cameraTarget.distance = cameraOrbit.distance;

  deleteWaveTargets();
  const waveBytes = waveCount * WAVE_CELL_BYTES;
  waveBufferA = makeStorageBuffer("wave state A", waveBytes);
  waveBufferB = makeStorageBuffer("wave state B", waveBytes);
  flip = 0;
  rebuildWaveBindGroups();

  resetWave();
  rebuildParticles();
  rebuildBoxGeometry();
  rebuildMagneticFieldLines();
  rebuildDensity();
}

// Group velocity of the packet on the grid (4th-order Laplacian), in cells per time unit.
function packetGroupVelocity() {
  return params.p0 / Math.max(1e-6, params.mass);
}

// Classical splitting along each magnet's axis at the screen (cells): each spin part feels
// ±a p(x(t)) with a = (ħ/2m)(g/L)/m, so the separation is 2a ∫₀ᵀ (T − t) p(x(t)) dt,
// T being the flight time from the start to the screen.
function flightTime() {
  return (detectorPlateXGrid() - packetStartX()) / Math.max(packetGroupVelocity(), 1e-6);
}
function splittingPerGradient() {
  const v = packetGroupVelocity();
  const L = Math.max(1, 0.5 * (simD - 1));
  const a1 = (params.hbar / (2 * params.mass)) / L / params.mass;
  const T = flightTime();
  return magnets().map(mg => {
    if (v < 0.5) return { axis: axisName(mg.theta), cells: Infinity };
    let integral = 0;
    const n = 600;
    for (let k = 0; k < n; k++) {
      const t = (k + 0.5) / n * T;
      integral += (T - t) * magnetProfile(mg, packetStartX() + v * t) * T / n;
    }
    return { axis: axisName(mg.theta), cells: 2 * a1 * integral };
  });
}
function expectedSplittings() {
  return splittingPerGradient().map(s => ({ axis: s.axis, cells: s.cells * params.sgGradient }));
}
// Standard deviation of |psi|^2 across the beam at the screen (free Gaussian spreading).
function packetStdAtScreen() {
  const s = params.packetSigma;
  const tau = params.hbar * flightTime() / (params.mass * s * s);
  return s / Math.SQRT2 * Math.sqrt(1 + tau * tau);
}
// Largest gradient that keeps each branch, out to 2.5 standard deviations, 4 cells off the walls.
function gradientMax() {
  const L = 0.5 * (simD - 1);
  const room = L - 4 - 2.5 * packetStdAtScreen();
  // The knife-edge gradient grows toward the edge, so the part deflected that way goes farther:
  // 1.15 keeps it as far from the walls as the textbook default (numpy: 0.9% within 6 cells).
  const per = Math.max(...splittingPerGradient().map(s => s.cells)) * (fieldShape() ? 1.15 : 1);
  if (!(per > 0) || !Number.isFinite(per)) return 10;
  return Math.max(0.5, Math.min(20, Math.floor(10 * room / (0.5 * per)) / 10));
}
function expectedSplitting() {
  return expectedSplittings()[0].cells;
}

// The gradient slider stops where the branches would reach the walls; a preset change sets
// the gradient to 90% of that limit, a screen move only lowers it if it is above the limit.
function updateGradientLimit(setDefault) {
  const slider = document.getElementById("sgGradient");
  const gMax = gradientMax();
  if (setDefault) params.sgGradient = Math.round(9 * gMax) / 10;
  params.sgGradient = Math.min(params.sgGradient, gMax);
  if (slider) { slider.max = String(gMax); slider.value = String(params.sgGradient); }
  refreshUnitLabels();
}
function applyMagnetPreset() {
  updateGradientLimit(true);
  rebuildBoxGeometry();
  rebuildMagneticFieldLines();
  resetAll();
  updateStats();
}
function applyScreenDistance() {
  updateGradientLimit(false);
  rebuildBoxGeometry();
  rebuildMagneticFieldLines();
  resetAll();
  updateStats();
}

// Elapsed time since the packet started, in lab units (µs).
const clockEl = document.getElementById("sim-clock");
let clockText = "";
function updateClock() {
  if (!clockEl) return;
  const text = `t = ${(simTime * LAB_SCALE.st * 1e6).toFixed(1)} µs`;
  if (text !== clockText) { clockEl.textContent = text; clockText = text; }
}

function labValues() {
  const flight = detectorPlateXGrid() - packetStartX();                        // cells
  const v = packetGroupVelocity();
  const flightTime = flight / v * LAB_SCALE.st;                                // s
  const split = expectedSplitting() * LAB_SCALE.sz;                            // m, first magnet
  const hbarOverM = (params.hbar / params.mass) * LAB_SCALE.sz ** 2 / LAB_SCALE.st;
  return { flight: flight * LAB_SCALE.sx, flightTime, split, ratio: hbarOverM / (LAB.hbar / LAB.mass) };
}
function roughPower(x) {
  if (!Number.isFinite(x) || x <= 0) return "–";
  const e = Math.floor(Math.log10(x));
  const mant = Math.round(x / 10 ** e);
  if (e <= 2) return String(Math.round(x));
  return mant === 1 ? `10<sup>${e}</sup>` : `${mant} × 10<sup>${e}</sup>`;
}

// Axes with lab units, drawn over the canvas (Axes button in the toolbar):
// x along the bottom front edge, from the tunnel start (just behind the packet) to the plate, in cm;
// z up the front edge at the plate and y along the bottom edge at the plate, in µm,
// measured from the middle of the box.
const labCanvas = document.getElementById("labScaleOverlay");
let labCanvasCleared = true;
function projectGridToScreen(camera, p, w, h) {
  const m = camera.viewProj;
  const x = p[0] * X_VIS * params.boxScale, y = p[1] * params.boxScale, z = p[2] * params.boxScale;
  const cx = m[0] * x + m[4] * y + m[8] * z + m[12];
  const cy = m[1] * x + m[5] * y + m[9] * z + m[13];
  const cw = m[3] * x + m[7] * y + m[11] * z + m[15];
  if (cw <= 1e-6) return null;
  return [(cx / cw * 0.5 + 0.5) * w, (1 - (cy / cw * 0.5 + 0.5)) * h];
}
function niceStep(range, target = 5) {
  const raw = range / target;
  const p = 10 ** Math.floor(Math.log10(raw));
  for (const f of [1, 2, 5, 10]) if (f * p >= raw) return f * p;
  return 10 * p;
}
function drawAxis(g, camera, w, h, dpr, { from, to, unitScale, offset, unit, name, skipStartLabel = false }) {
  const A = projectGridToScreen(camera, from, w, h);
  const B = projectGridToScreen(camera, to, w, h);
  if (!A || !B) return;
  const dx = B[0] - A[0], dy = B[1] - A[1];
  const len = Math.hypot(dx, dy);
  if (len < 40 * dpr) return;  // seen end-on in this view
  const nx = -dy / len, ny = dx / len;
  g.beginPath(); g.moveTo(A[0], A[1]); g.lineTo(B[0], B[1]); g.stroke();
  const lenCells = Math.hypot(to[0] - from[0], to[1] - from[1], to[2] - from[2]);
  const v0 = (0 - offset) * unitScale, v1 = (lenCells - offset) * unitScale;
  const step = niceStep(Math.abs(v1 - v0), 6);
  const decimals = Math.max(0, -Math.floor(Math.log10(step) + 1e-9));
  for (let v = Math.ceil(Math.min(v0, v1) / step) * step; v <= Math.max(v0, v1) + 1e-9; v += step) {
    const t = (v / unitScale + offset) / lenCells;
    const px = A[0] + t * dx, py = A[1] + t * dy;
    g.beginPath(); g.moveTo(px, py); g.lineTo(px + 6 * dpr * nx, py + 6 * dpr * ny); g.stroke();
    if (skipStartLabel && Math.hypot(px - A[0], py - A[1]) < 18 * dpr) continue;  // corner shared with another axis
    g.fillText(v.toFixed(decimals), px + 9 * dpr * nx - 8 * dpr, py + 9 * dpr * ny + 4 * dpr);
  }
  g.fillText(`${name} (${unit})`, B[0] + 22 * dpr * nx, B[1] + 22 * dpr * ny);
}
function drawLabScale(camera) {
  if (!labCanvas) return;
  const dpr = window.devicePixelRatio || 1;
  const w = Math.max(1, Math.round(labCanvas.clientWidth * dpr));
  const h = Math.max(1, Math.round(labCanvas.clientHeight * dpr));
  if (labCanvas.width !== w || labCanvas.height !== h) { labCanvas.width = w; labCanvas.height = h; }
  const g = labCanvas.getContext("2d");
  if (!params.showAxes) {
    if (!labCanvasCleared) { g.clearRect(0, 0, w, h); labCanvasCleared = true; }
    return;
  }
  labCanvasCleared = false;
  g.clearRect(0, 0, w, h);
  g.lineWidth = 1.5 * dpr;
  g.strokeStyle = "rgba(230, 240, 248, 0.85)";
  g.fillStyle = "rgba(230, 240, 248, 0.95)";
  g.font = `${11 * dpr}px Inter, system-ui, sans-serif`;
  const x0 = tunnelStartX();
  const xp = detectorPlateXGrid();
  const yMax = simH - 1, zMax = simD - 1;
  drawAxis(g, camera, w, h, dpr, { from: [x0, 0, 0], to: [xp, 0, 0], unitScale: LAB_SCALE.sx * 100, offset: 0, unit: "cm", name: "y" });
  drawAxis(g, camera, w, h, dpr, { from: [xp, 0, 0], to: [xp, 0, zMax], unitScale: LAB_SCALE.sz * 1e6, offset: 0.5 * zMax, unit: "µm", name: "z", skipStartLabel: true });
  // Lab x = −grid y: drawn from grid y = yMax toward 0, so the labels increase toward lab +x.
  drawAxis(g, camera, w, h, dpr, { from: [xp, yMax, 0], to: [xp, 0, 0], unitScale: LAB_SCALE.sz * 1e6, offset: 0.5 * yMax, unit: "µm", name: "x", skipStartLabel: true });
}

// Time for the packet, including its tail, to pass the detector plate.
function rerunTime() {
  const v = effectivePeriodicP0() / Math.max(1e-6, params.mass);
  if (v < 0.5) return Infinity;
  const x0 = params.packetX * (simW - 1);
  return (detectorPlateXGrid() - x0 + 2.5 * params.packetSigma) / v;
}

// Full 3D engine: allocate the moving window (two buffers of WIN_NX × H × D cells) on first use.
function engine3Bytes() { return WIN_NX * simH * simD * WAVE_CELL_BYTES; }
// The 3D shaders compile only when Full 3D is first chosen (several seconds on some GPUs),
// so the app opens on the fast engine without waiting for them.
let pipelines3Promise = null;
function build3DPipelines() {
  if (!pipelines3Promise) {
    const t0 = performance.now();
    const module = (label, code) => shaderModule(label, code);
    pipelines3Promise = Promise.all([
      device.createComputePipelineAsync({ label: "3D wave init pipeline", layout: "auto", compute: { module: module("3D wave init", WAVE3D_INIT_WGSL), entryPoint: "main" } }),
      device.createComputePipelineAsync({ label: "3D wave step pipeline", layout: "auto", compute: { module: module("3D wave step", WAVE3D_STEP_WGSL), entryPoint: "main" } }),
      device.createComputePipelineAsync({ label: "3D particle update pipeline", layout: "auto", compute: { module: module("3D particle update", PARTICLE_UPDATE3D_WGSL), entryPoint: "main" } }),
    ]).then(([a, b, c]) => { pipelineWave3Init = a; pipelineWave3Step = b; pipelineParticleUpdate3 = c; TIMING.pipelines3d = Math.round(performance.now() - t0); })
      .catch(error => { console.warn("3D engine pipelines unavailable", error); });
  }
  return pipelines3Promise;
}

function engine3Available() {
  const bytes = engine3Bytes();
  if (!pipelineWave3Init || !pipelineWave3Step || !pipelineParticleUpdate3) return { ok: false, reason: "the 3D shaders did not compile on this device" };
  if (device.limits.maxStorageBufferBindingSize < bytes || device.limits.maxBufferSize < bytes) {
    return { ok: false, reason: `the device allows ${Math.floor(device.limits.maxStorageBufferBindingSize / 2 ** 20)} MB per buffer; the 3D window needs ${Math.ceil(bytes / 2 ** 20)} MB` };
  }
  return { ok: true, reason: "" };
}
function ensure3DResources() {
  if (wave3A) return;
  waveCount3 = WIN_NX * simH * simD;
  wave3A = makeStorageBuffer("3D wave A", waveCount3 * WAVE_CELL_BYTES);
  wave3B = makeStorageBuffer("3D wave B", waveCount3 * WAVE_CELL_BYTES);
  wave3InitBindGroup = bindGroup(pipelineWave3Init, [
    { binding: 0, resource: { buffer: uniformBuffer } },
    { binding: 1, resource: { buffer: wave3A } },
  ]);
  wave3StepBindGroups = [[wave3A, wave3B], [wave3B, wave3A]].map(([a, b]) => bindGroup(pipelineWave3Step, [
    { binding: 0, resource: { buffer: uniformBuffer } },
    { binding: 1, resource: { buffer: a } },
    { binding: 2, resource: { buffer: b } },
  ]));
  cloud3BindGroups = [wave3A, wave3B].map(buffer => bindGroup(pipelineCloud, [
    { binding: 0, resource: { buffer: uniformBuffer } },
    { binding: 1, resource: { buffer } },
  ]));
}
async function setEngine(id) {
  const next = id === "3d" ? "3d" : "fast";
  if (next === "3d") {
    if (!pipelineWave3Step) {
      status.hidden = false;
      statusTitle.textContent = "Preparing the 3D engine…";
      await build3DPipelines();
      status.hidden = true;
    }
    const avail = engine3Available();
    if (!avail.ok) return avail;
    ensure3DResources();
  }
  engine = next;
  rebuildWeightResources();
  rebuildParticleBindGroups();
  resetAll();
  updateStats();
  const badge = document.getElementById("engine-badge");
  if (badge) badge.textContent = `Engine: ${is3D() ? "Full 3D" : "Fast (2D)"}`;
  return { ok: true, reason: "" };
}

function resetAll() {
  rerunHoldStart = null;
  rerunPending = false;
  resetWave();
  rebuildParticles();
  clearDensity();
  requestRedraw();
}

// ── Edit geometry on the canvas ──────────────────────────────────────────────
// Toolbar button (or right-click on the canvas); Escape exits. Handles on the near bottom edge
// of the tunnel move the magnet's start, its end (its length) and the screen along the beam; a
// handle on the S pole turns the magnet about the beam. A drag changes the geometry at once;
// releasing restarts the packet and updates the gradient limit.
const magnetLengthCm = () => magnetPreset().magnets.reduce((m, mg) => Math.max(m, mg.start + mg.length), 0)
  * MAGNET_CELLS * params.magnetScale * LAB_SCALE.sx * 100;
let editing = false;
const editLayer = document.createElement("div");
editLayer.className = "sg-edit-layer";
editLayer.hidden = true;
canvas.parentElement.append(editLayer);
const editReadout = document.createElement("div");
editReadout.className = "sg-edit-readout";
editLayer.append(editReadout);
const editHandles = {};
function makeEditHandle(key, label, title, cursor) {
  const b = document.createElement("button");
  b.type = "button";
  b.className = "sg-edit-handle";
  b.dataset.handle = key;
  b.textContent = label;
  b.title = title;
  b.style.cursor = cursor;
  b.addEventListener("pointerdown", e => startEditDrag(e, key));
  editLayer.append(b);
  editHandles[key] = b;
}
makeEditHandle("approach", "◂ magnet start ▸", "Drag along the beam: where the magnet starts (the field-free approach).", "ew-resize");
makeEditHandle("magnetEnd", "◂ magnet end ▸", "Drag along the beam: the magnet's length.", "ew-resize");
makeEditHandle("screen", "◂ screen ▸", "Drag along the beam: the screen's distance after the magnet.", "ew-resize");
makeEditHandle("angle", "↻ turn", "Drag around the beam: the magnet angle (from +z toward +x).", "grab");
const editReset = document.createElement("button");
editReset.type = "button";
editReset.className = "sg-edit-reset";
editReset.textContent = "Reset geometry";
editReset.addEventListener("click", () => {
  params.approachCells = APPROACH_CELLS;
  params.magnetScale = 1;
  params.screenDistance = 40 * BEAM_SCALE;
  params.magnetAngle = 0;
  syncSlider("screenDistance");
  syncSlider("magnetAngle");
  finishGeometryChange();
});
editLayer.append(editReset);

function editReadoutText(key) {
  const cm = cells => (cells * LAB_SCALE.sx * 100).toFixed(1);
  if (key === "approach") return `Magnet starts ${cm(params.approachCells)} cm after the source`;
  if (key === "magnetEnd") return `Magnet ${magnetLengthCm().toFixed(1)} cm long`;
  if (key === "screen") return `Screen ${cm(params.screenDistance)} cm after the magnet`;
  if (key === "angle") return `Magnet angle ${Math.round(params.magnetAngle)}° (axis ${axisName(magnets()[0].theta)})`;
  return "Drag a handle. The XZ view (along the beam) is best for turning the magnet. Escape ends editing.";
}
function editAnchors() {
  const ms = magnets();
  const L = 0.5 * (simD - 1), cy = 0.5 * (simH - 1), cz = 0.5 * (simD - 1);
  const m0 = ms[0];
  const N = [Math.sin(m0.theta), Math.cos(m0.theta)];
  const r = L * (Math.abs(N[0]) + Math.abs(N[1])) + 3 + 0.4 * L;
  return {
    approach: [Math.min(...ms.map(m => m.a)), 0, 0],
    magnetEnd: [lastMagnetEndX(), 0, 0],
    screen: [detectorPlateXGrid(), 0, 0],
    angle: [0.5 * (m0.a + m0.b), cy + N[0] * r, cz + N[1] * r],
  };
}
function cssProject(camera, p) {
  return projectGridToScreen(camera, p, canvas.clientWidth, canvas.clientHeight);
}
function positionEditHandles(camera) {
  const anchors = editAnchors();
  for (const [key, b] of Object.entries(editHandles)) {
    const q = cssProject(camera, anchors[key]);
    b.hidden = !q;
    if (!q) continue;
    b.style.left = `${q[0]}px`;
    b.style.top = `${q[1] + (key === "angle" ? 0 : 18)}px`;
  }
}
let editDrag = null;
function startEditDrag(e, key) {
  e.preventDefault();
  editHandles[key].setPointerCapture(e.pointerId);
  // Keep the grab point: the pointer's offset from the handle's anchor stays fixed while dragging.
  const rect = canvas.getBoundingClientRect();
  const q = cssProject(cameraFrame(), editAnchors()[key]);
  const off = q ? [e.clientX - rect.left - q[0], e.clientY - rect.top - q[1]] : [0, 0];
  editDrag = { key, id: e.pointerId, off };
  editReadout.textContent = editReadoutText(key);
  editHandles[key].addEventListener("pointermove", onEditMove);
  editHandles[key].addEventListener("pointerup", endEditDrag, { once: true });
  editHandles[key].addEventListener("pointercancel", endEditDrag, { once: true });
}
// Beam coordinate (grid x) of the point on the near bottom edge of the tunnel that is drawn
// nearest the pointer (searched, since the perspective makes the drawn edge non-uniform).
function beamXAtPointer(camera, mx, my) {
  const xa = tunnelStartX() - 100, xb = detectorPlateXGrid() + 600;
  const dist = x => { const q = cssProject(camera, [x, 0, 0]); return q ? Math.hypot(q[0] - mx, q[1] - my) : Infinity; };
  let best = xa, bestD = Infinity;
  for (let k = 0; k <= 400; k++) { const x = xa + (xb - xa) * k / 400; const d = dist(x); if (d < bestD) { bestD = d; best = x; } }
  let lo = best - (xb - xa) / 400, hi = best + (xb - xa) / 400;
  for (let k = 0; k < 30; k++) { const m1 = lo + (hi - lo) / 3, m2 = hi - (hi - lo) / 3; if (dist(m1) < dist(m2)) hi = m2; else lo = m1; }
  return Number.isFinite(bestD) ? 0.5 * (lo + hi) : null;
}
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
function onEditMove(e) {
  if (!editDrag) return;
  const rect = canvas.getBoundingClientRect();
  const mx = e.clientX - rect.left - editDrag.off[0], my = e.clientY - rect.top - editDrag.off[1];
  const camera = cameraFrame();
  const key = editDrag.key;
  if (key === "angle") {
    const m0 = magnetPreset().magnets[0];
    const xm = 0.5 * (magnets()[0].a + magnets()[0].b);
    const L = 0.5 * (simD - 1), cy = 0.5 * (simH - 1), cz = 0.5 * (simD - 1);
    let best = params.magnetAngle, bestD = Infinity;
    for (let beta = 0; beta < 360; beta += 1) {
      const th = m0.theta - beta * DEG;
      const r = L * (Math.abs(Math.sin(th)) + Math.abs(Math.cos(th))) + 3 + 0.4 * L;
      const q = cssProject(camera, [xm, cy + Math.sin(th) * r, cz + Math.cos(th) * r]);
      if (!q) continue;
      const d = Math.hypot(q[0] - mx, q[1] - my);
      if (d < bestD) { bestD = d; best = beta; }
    }
    for (const snap of [0, 90, 180, 270, 360]) if (Math.abs(best - snap) <= 5) best = snap % 360;
    params.magnetAngle = best;
    syncSlider("magnetAngle");
  } else {
    const x = beamXAtPointer(camera, mx, my);
    if (x == null) return;
    const step = BEAM_SCALE;
    if (key === "approach") {
      params.approachCells = Math.round(clamp(x - packetStartX(), 8 * BEAM_SCALE, 60 * BEAM_SCALE) / step) * step;
    } else if (key === "magnetEnd") {
      const span = magnetPreset().magnets.reduce((m, mg) => Math.max(m, mg.start + mg.length), 0) * MAGNET_CELLS;
      params.magnetScale = Math.round(100 * clamp((x - magnetEntryX()) / span, 0.25, 2.5)) / 100;
    } else if (key === "screen") {
      params.screenDistance = Math.round(clamp(x - lastMagnetEndX(), 10 * BEAM_SCALE, 60 * BEAM_SCALE) / step) * step;
      syncSlider("screenDistance");
    }
  }
  editReadout.textContent = editReadoutText(key);
  rebuildBoxGeometry();
  rebuildMagneticFieldLines();
  updateStats();
  requestRedraw();
}
function endEditDrag() {
  if (!editDrag) return;
  const b = editHandles[editDrag.key];
  b.removeEventListener("pointermove", onEditMove);
  editDrag = null;
  finishGeometryChange();
}
function finishGeometryChange() {
  updateGradientLimit(false);
  rebuildBoxGeometry();
  rebuildMagneticFieldLines();
  resetAll();
  updateStats();
}
function setEditing(on) {
  editing = !!on;
  editLayer.hidden = !editing;
  editReadout.textContent = editReadoutText(null);
  canvas.dispatchEvent(new CustomEvent("stern-gerlach:editing", { detail: { editing } }));
  requestRedraw();
}
window.addEventListener("keydown", e => { if (e.key === "Escape" && editing) setEditing(false); });
canvas.addEventListener("contextmenu", e => { e.preventDefault(); setEditing(!editing); });

// Drag on the spin sphere to point the spin (front hemisphere; turn the view for the back).
spinSphere.style.cursor = "grab";
spinSphere.title = "Drag to point the spin. The sphere turns with the 3D view.";
let sphereDrag = false;
function spinFromSphere(e) {
  const rect = spinSphere.getBoundingClientRect();
  const R = Math.min(rect.width, rect.height) * 0.34;
  let u = (e.clientX - rect.left - rect.width / 2) / R, v = (rect.top + rect.height / 2 - e.clientY) / R;
  const rr = Math.hypot(u, v);
  if (rr > 1) { u /= rr; v /= rr; }
  const w = Math.sqrt(Math.max(0, 1 - u * u - v * v));
  const b = cameraBasis();
  const g = [0, 1, 2].map(i => u * b.right[i] + v * b.up[i] + w * b.back[i]);
  const l = labFromGrid(g);
  const n = Math.hypot(...l) || 1;
  let theta = Math.acos(clamp(l[2] / n, -1, 1)) / DEG;
  let phi = ((Math.atan2(l[1], l[0]) / DEG) + 360) % 360;
  for (const t of [0, 90, 180]) if (Math.abs(theta - t) <= 6) theta = t;
  for (const p of [0, 90, 180, 270, 360]) if (Math.abs(phi - p) <= 6) phi = p % 360;
  if (theta === 0 || theta === 180) phi = 0;
  params.spinTheta = Math.round(theta);
  params.spinPhi = Math.round(phi);
  syncSlider("spinTheta");
  syncSlider("spinPhi");
  updateStats();
  drawSpinSphere();
}
spinSphere.addEventListener("pointerdown", e => { sphereDrag = true; spinSphere.setPointerCapture(e.pointerId); spinFromSphere(e); });
spinSphere.addEventListener("pointermove", e => { if (sphereDrag) spinFromSphere(e); });
const endSphereDrag = () => { if (!sphereDrag) return; sphereDrag = false; resetAll(); updateStats(); };
spinSphere.addEventListener("pointerup", endSphereDrag);
spinSphere.addEventListener("pointercancel", endSphereDrag);

window.addEventListener("resize", () => {
  requestRedraw();
});

async function main() {
  configureCanvas();
  statusTitle.textContent = "Preparing the graphics…";
  await buildPipelines();
  if (!simulationAvailable) return;
  statusTitle.textContent = "Preparing the wave packet…";
  mark("buildStart");
  rebuildSimulation();
  mark("rebuilt");
  updateGradientLimit(true);
  rebuildMagneticFieldLines();
  resetAll();
  mark("reset");
  // Present the initial packet before the first batch of simulation steps.
  const initialFrame = device.createCommandEncoder({ label: "initial frame encoder" });
  render(initialFrame, cameraFrame());
  device.queue.submit([initialFrame.finish()]);
  await device.queue.onSubmittedWorkDone();
  mark("firstFrame");
  if (!simulationAvailable) return;
  drawViewGizmo();
  updateStats();
  drawSpinSphere();
  status.hidden = true;
  simulationButtons.forEach(button => { button.disabled = false; });

  let lastFrameTime = performance.now();
  requestAnimationFrame(async function loop(now = performance.now()) {
    if (!simulationAvailable) return;
    if (canvas.closest("[hidden]")) {
      setTimeout(loop, PAUSED_IDLE_MS);
      return;
    }
    const wallDtSeconds = Math.min(0.05, Math.max(0, (now - lastFrameTime) / 1000));
    const dtSeconds = wallDtSeconds;
    lastFrameTime = now;
    const resized = resizeCanvas();
    if (resized) rebuildDensity();

    const cameraKeyMoved = updateCameraKeyMotion(dtSeconds);
    const cameraMoved = updateCameraEasing() || cameraKeyMoved;
    if (cameraMoved) requestTrailClear();

    const cameraInputActive = hasActiveCameraKeys();
    const shouldDraw = !paused || redrawPending || resized || cameraMoved || cameraInputActive || trailClearPending;
    if (!shouldDraw) {
      setTimeout(loop, PAUSED_IDLE_MS);
      return;
    }

    drawViewGizmo();
    drawSpinSphere();
    const camera = cameraFrame();

    if (trailClearPending) clearDensity();

    const encoder = device.createCommandEncoder({ label: "frame encoder" });

    if (!paused) {
      // One submission per step, each with its own uniforms, so the field the packet feels
      // (and the 3D window position) follow the time step by step, not frame by frame.
      const steps = Math.floor(params.stepsPerFrame);
      for (let i = 0; i < steps; i++) {
        writeUniforms(uniformBuffer, camera, canvas.width, canvas.height);
        const stepEncoder = device.createCommandEncoder({ label: "step encoder" });
        const compute = stepEncoder.beginComputePass({ label: "simulation compute pass" });
        waveStep(compute);
        particleUpdate(compute);
        compute.end();
        device.queue.submit([stepEncoder.finish()]);
        simTime += params.dt;
      }
      if (trailsShown()) densityStepAndStamp(encoder, camera);
      if (autoRun && simTime >= rerunTime()) {
        if (rerunHoldStart === null) rerunHoldStart = now;
        else if (now - rerunHoldStart >= RERUN_HOLD_MS) rerunPending = true;
      }
    }

    writeUniforms(uniformBuffer, camera, canvas.width, canvas.height);
    render(encoder, camera);
    drawLabScale(camera);
    if (editing) positionEditHandles(camera);
    updateClock();
    device.queue.submit([encoder.finish()]);
    if (redrawPending) { updateStats(); updateHitDisplay(); }
    redrawPending = false;
    if (!paused) {
      if (reading === "cpn") readWeights(now);
      else if (params.showSpin && (readbackToggle = !readbackToggle)) readWeights(now);
      else readHitCounts(now);
    }

    // Wait for the current frame so a slow GPU cannot build a render backlog.
    try {
      await device.queue.onSubmittedWorkDone();
    } catch (error) {
      if (simulationAvailable) {
        simulationAvailable = false;
        showSimulationError("The WebGPU device stopped responding", error);
      }
      return;
    }

    if (rerunPending) {
      rerunPending = false;
      resetAll();
    }

    if (paused && !cameraMoved && !cameraInputActive && !trailClearPending && !redrawPending) {
      setTimeout(loop, PAUSED_IDLE_MS);
    } else {
      requestAnimationFrame(loop);
    }
  });
}

try {
  await main();
} catch (error) {
  simulationAvailable = false;
  showSimulationError("The simulation could not start", error);
}

export const simulation = {
  isAvailable: () => simulationAvailable,
  isRunning: () => simulationAvailable && !paused,
  setRunning(value) {
    if (!simulationAvailable) return;
    paused = !value;
    requestRedraw();
  },
  setSpeed(multiplier) {
    params.stepsPerFrame = Math.max(1, Math.min(30, Math.round(8 * multiplier)));
  },
  reset() { if (simulationAvailable) resetAll(); },
  setAutoRun(value) { autoRun = Boolean(value); rerunHoldStart = null; },
  getReading: () => reading,
  getAxesVisible: () => Boolean(params.showAxes),
  setAxesVisible(value) { params.showAxes = value ? 1 : 0; requestRedraw(); },
  setReading(value) {
    reading = value === "cpn" ? "cpn" : "pw";
    lastHitReadback = 0;
    requestTrailClear();
    updateStats();
    updateHitDisplay();
  },
  // Used by the quiz: set the initial spin and restart the packet.
  setMagnetPreset(index) {
    params.magnetPreset = index | 0;
    magnetPresetControlSync();
    if (simulationAvailable) applyMagnetPreset();
  },
  // index 0: +z; 1: +x, the equal superposition of +z and −z.
  setEditing,
  getEditing: () => editing,
  setEngine,
  getEngine: () => engine,
  moments: () => (weightCounts.valid ? { spin: weightCounts.spin, centre: weightCounts.centre, beam: weightCounts.beam, time: weightCounts.time, values: weightCounts.values } : null),
  setGeometry(g) { Object.assign(params, g); syncSlider('screenDistance'); finishGeometryChange(); },
  timing: () => ({ ...TIMING }),
  async benchmark(steps = 200) {
    await device.queue.onSubmittedWorkDone();
    const t0 = performance.now();
    for (let i = 0; i < steps; i++) {
      writeUniforms(uniformBuffer, cameraFrame(), canvas.width, canvas.height);
      const enc = device.createCommandEncoder({ label: "benchmark step" });
      const pass = enc.beginComputePass();
      waveStep(pass);
      particleUpdate(pass);
      pass.end();
      device.queue.submit([enc.finish()]);
      simTime += params.dt;
    }
    await device.queue.onSubmittedWorkDone();
    const stepMs = (performance.now() - t0) / steps;
    const t1 = performance.now();
    for (let i = 0; i < 20; i++) {
      const enc = device.createCommandEncoder({ label: "benchmark frame" });
      render(enc, cameraFrame());
      device.queue.submit([enc.finish()]);
    }
    await device.queue.onSubmittedWorkDone();
    return { engine, stepMs: +stepMs.toFixed(3), renderMs: +((performance.now() - t1) / 20).toFixed(3), stepsPerFrame: params.stepsPerFrame };
  },
  engine3Info: () => ({ ...engine3Available(), megabytes: Math.ceil(engine3Bytes() * 2 / 2 ** 20) }),
  setInitialSpin(index) {
    simulation.setSpinDirection(index ? 90 : 0, 0);
  },
  setSpinDirection(thetaDeg, phiDeg) {
    params.spinTheta = thetaDeg;
    params.spinPhi = phiDeg;
    syncSlider("spinTheta");
    syncSlider("spinPhi");
    if (simulationAvailable) { resetAll(); updateStats(); }
  },
  setMagnetAngle(deg) {
    params.magnetAngle = deg;
    syncSlider("magnetAngle");
    if (simulationAvailable) { rebuildMagneticFieldLines(); resetAll(); updateStats(); }
  },
  redraw: requestRedraw,
};

