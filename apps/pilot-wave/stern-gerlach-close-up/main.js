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
const PARTICLE_WORKGROUP_SIZE = 128;

const SHADER_FILES = {
  common: "./shaders/common.wgsl?v=sg2d2",
  palette: "./shaders/palette.wgsl?v=sg2d2",
  waveInit: "./shaders/wave-init.wgsl?v=sg2d2",
  waveStep: "./shaders/wave-step.wgsl?v=sg2d2",
  particleUpdate: "./shaders/particle-update.wgsl?v=sg2d2",
  cloud: "./shaders/cloud.wgsl?v=sg2d2",
  particleRender: "./shaders/particle-render.wgsl?v=sg2d2",
  density: "./shaders/density.wgsl?v=sg2d2",
  boxShell: "./shaders/box-shell.wgsl?v=sg2d2",
  line: "./shaders/line.wgsl?v=sg2d2",
  fieldLine: "./shaders/field-line.wgsl?v=sg2d2",
  detectorPlate: "./shaders/detector-plate.wgsl?v=sg2d2",
  weightReduce: "./shaders/weight-reduce.wgsl?v=sg2d2",
};

function applyShaderConstants(source) {
  return source
    .replaceAll("${WAVE_WORKGROUP_SIZE}", String(WAVE_WORKGROUP_SIZE))
    .replaceAll("${PARTICLE_WORKGROUP_SIZE}", String(PARTICLE_WORKGROUP_SIZE));
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
    density: parts.common + parts.density,
    boxShell: parts.common + parts.boxShell,
    line: parts.common + parts.line,
    fieldLine: parts.common + parts.fieldLine,
    detectorPlate: parts.common + parts.detectorPlate,
    weightReduce: parts.common + parts.weightReduce,
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
  p0: 5.5,
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
  spinPhi: 0,
  magnetAngle: 0,
  sgGradient: DEFAULT_SG_GRADIENT,
  sgFieldOn: 1,
  showFieldArrows: 1,
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

// Initial spin direction: θ from +z, φ about z from the beam axis (+x) toward +y.
// The spinor is (cos θ/2, e^{iφ} sin θ/2).
const DEG = Math.PI / 180;
function spinVector() {
  const t = params.spinTheta * DEG, p = params.spinPhi * DEG;
  return [Math.sin(t) * Math.cos(p), Math.sin(t) * Math.sin(p), Math.cos(t)];
}
function spinLabel() {
  const v = spinVector();
  const named = [
    ["+z", [0, 0, 1]], ["−z", [0, 0, -1]], ["+y", [0, 1, 0]], ["−y", [0, -1, 0]],
    ["+x (equal +z and −z)", [1, 0, 0]], ["−x", [-1, 0, 0]],
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

// ── Lab units ────────────────────────────────────────────────────────────────
// Each axis has its own scale, matched to the 1922 experiment at the default settings
// (64-cell grid, momentum 5.5, packet width 10 cells): the flight from the start to the
// plate is the 3.5 cm magnet, the packet moves at 660 m/s, and the FWHM of |psi|^2 across
// the beam is the 35 µm slit. The scales are fixed, so the sliders change lab quantities.
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
  const period = 63;
  const flight = 2 * period - 0.25 * period;               // cells, start to plate
  const sx = LAB.magnetLength / flight;                    // m per cell along x
  const st = sx * 5.5 / LAB.speed;                         // s per time unit (default speed 5.5 cells/unit)
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
// Each preset lists magnets along the flight, as fractions f of the way from the packet's
// start to the plate: the field rises and falls with smooth ramps of width RAMP inside
// [a, b] and is exactly zero outside, so a gap between two magnets is field-free and the
// hand-over from one to the next is sudden. theta turns a magnet about the beam axis,
// from +z toward +y (0: gradient along z, 90°: along y); the Magnet angle slider adds to it. b0 is the uniform part in units of g (2 keeps the
// field from vanishing in the box; 0.3 lets it nearly vanish, so spins can flip). g and gMax
// are the default and largest gradient that keep the branches off the walls.
const MAGNET_PRESETS = [
  { name: "Long magnet", magnets: [{ a: -1, b: 2, theta: 0 }], b0: 2, g: 3, gMax: 3.5 },
  { name: "Short magnet, then drift", magnets: [{ a: -1, b: 0.35, theta: 0 }], b0: 2, g: 5, gMax: 6 },
  { name: "Two magnets at 90°", magnets: [{ a: -1, b: 0.22, theta: 0 }, { a: 0.28, b: 0.95, theta: Math.PI / 2 }], b0: 2, g: 7, gMax: 7.5 },
  { name: "Weak uniform field", magnets: [{ a: -1, b: 2, theta: 0 }], b0: 0.3, g: 3, gMax: 3.5 },
];
const RAMP = 0.05;
const magnetPreset = () => MAGNET_PRESETS[params.magnetPreset | 0] || MAGNET_PRESETS[0];
// The preset's magnets, all turned by the Magnet angle about the beam axis.
function magnets() {
  const turn = params.magnetAngle * DEG;
  return magnetPreset().magnets.map(mg => ({ ...mg, theta: mg.theta + turn }));
}
const smooth01 = t => { const u = Math.min(1, Math.max(0, t)); return u * u * (3 - 2 * u); };
const magnetProfile = (mg, f) => smooth01((f - mg.a) / RAMP) * smooth01((mg.b - f) / RAMP);
function flightFraction(x) {
  const x0 = params.packetX * (simW - 1);
  return (x - x0) / Math.max(1, detectorPlateXGrid() - x0);
}
function magnetsAtX(x) {
  const f = flightFraction(x);
  return magnets().map(mg => ({ p: magnetProfile(mg, f), theta: mg.theta }));
}
// The packet feels the field at its centre x_c(t).
function magnetState(t) {
  const segs = magnetsAtX(params.packetX * (simW - 1) + params.p0 / params.mass * t);
  return { m1: segs[0], m2: segs[1] || { p: 0, theta: 0 } };
}
// Unit vectors (y, z) along each magnet's gradient axis: the axes measured at the plate.
function measurementAxes() {
  return magnets().map(mg => [Math.sin(mg.theta), Math.cos(mg.theta)]);
}
// Name of the direction at angle theta about the beam, from +z toward +y.
function axisName(theta) {
  const d = ((Math.round(theta / DEG) % 360) + 360) % 360;
  return { 0: "+z", 90: "+y", 180: "−z", 270: "−y" }[d] || `${d}°`;
}

const restartForSpin = () => { resetAll(); updateStats(); };
addSlider("spinTheta", "Spin θ (from +z)", 0, 180, 1, restartForSpin, v => `${Math.round(v)}°`);
addSlider("spinPhi", "Spin φ (from +x)", 0, 360, 1, restartForSpin, v => `${Math.round(v)}°`);
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
addSlider("magnetAngle", "Magnet angle", 0, 360, 1, () => { rebuildMagneticFieldLines(); resetAll(); updateStats(); }, v => `${Math.round(v)}°`);
function syncSlider(key) {
  const input = document.getElementById(key);
  if (input) input.value = String(params[key]);
  refreshUnitLabels();
}
// Above ~3.5 the deflected branches reach the hard walls before the plate.
addSlider("sgGradient", "Field gradient", 0.0, 3.5, 0.002, () => requestTrailClear(), g => `${labGradient(g).toFixed(1)} T/cm`);

addSectionHeader("Wave and guidance");
addSlider("p0", "Atom speed", 0.0, 6.0, 0.1, () => resetAll(), p => `${Math.round(labSpeed(p))} m/s`);
addSlider("packetSigma", "Beam width (FWHM)", 4.0, 14.0, 0.5, () => { rebuildBoxGeometry(); rebuildMagneticFieldLines(); resetAll(); }, s => `${Math.round(labFWHM(s) * 1e6)} µm`);

controls = displayControls;
addToggleInt("sgFieldOn", "Magnetic field", () => requestTrailClear());
addToggleInt("showFieldArrows", "Field arrows");
const cameraProjectionControl = addCycleButton("cameraProjection", "Camera view", ["Perspective", "Orthographic"], () => {
  activeOrthoView = null;
  syncCameraUi();
  requestTrailClear();
});
addToggleInt("showCloud", "Density cloud");
addSlider("cloudGain", "Cloud brightness", 0.05, 2.0, 0.05);
addToggleInt("showPhase", "Show phase");
addToggleInt("showParticles", "Show particles");
addSlider("nParticles", "Particle count", 1, 5000, 1, () => rebuildParticles());
addSlider("dotSize", "Particle size", 2.0, 26.0, 1);
addSlider("dotGain", "Particle brightness", 0.1, 5.0, 0.1);
addToggleInt("showTrail", "Draw trails");
addSlider("trailHalfLife", "Trail half-life", 0.1, 10.0, 0.1, null, t => `${(t * LAB_SCALE.st * 1e6).toFixed(1)} µs`);

controls = advancedControls;
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
const UNIFORM_FLOATS = 96;
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
const DENSITY_WGSL = SHADERS.density;
const BOX_SHELL_WGSL = SHADERS.boxShell;
const LINE_WGSL = SHADERS.line;
const FIELD_LINE_WGSL = SHADERS.fieldLine;
const DETECTOR_PLATE_WGSL = SHADERS.detectorPlate;
const WEIGHT_REDUCE_WGSL = SHADERS.weightReduce;
let pipelineWeightReduce = null;
let pipelineWaveInit, pipelineWaveStep, pipelineParticleUpdate;
let pipelineCloud, pipelineBoxShell, pipelineLine, pipelineFieldLine, pipelineDetectorPlate;
let pipelineParticleRender, pipelineParticleStamp;
let pipelineDensityFade, pipelineDensityRenderGlow;
let nearestSampler = device.createSampler({ magFilter: "nearest", minFilter: "nearest" });

let simW = 0, simH = 0, simD = 0;
let voxelCount = 0;   // cloud point instances (x window × y × z, with stride)
let waveCount = 0;    // cells of the 2D wave grid across the beam
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
  const densityModule = shaderModule("density", DENSITY_WGSL);
  const boxShellModule = shaderModule("box shell", BOX_SHELL_WGSL);
  const lineModule = shaderModule("line", LINE_WGSL);
  const fieldLineModule = shaderModule("SG field lines", FIELD_LINE_WGSL);
  const detectorPlateModule = shaderModule("detector plate", DETECTOR_PLATE_WGSL);
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

  const pipelineParticleStampReady = device.createRenderPipelineAsync({
    label: "particle trail stamp pipeline",
    layout: "auto",
    vertex: { module: particleModule, entryPoint: "vsStamp" },
    fragment: {
      module: particleModule,
      entryPoint: "fsStamp",
      targets: [{ format: DENSITY_FORMAT, blend: blendState("src-alpha", "one"), writeMask: COLOR_WRITE_RED }],
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
  ]);

  boxShellBindGroup = bindGroup(pipelineBoxShell, [{ binding: 0, resource: { buffer: uniformBuffer } }]);
  lineBindGroup = bindGroup(pipelineLine, [{ binding: 0, resource: { buffer: uniformBuffer } }]);
  fieldLineBindGroup = bindGroup(pipelineFieldLine, [{ binding: 0, resource: { buffer: uniformBuffer } }]);
  detectorPlateBindGroup = bindGroup(pipelineDetectorPlate, [{ binding: 0, resource: { buffer: uniformBuffer } }]);
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
  const groups = dispatchCount(waveCount, WAVE_WORKGROUP_SIZE);
  if (weightPartials?.size !== groups * 16) {
    if (!readbackBusy) {
      destroyGpuResource(weightPartials);
      destroyGpuResource(weightReadback);
    }
    weightPartials = makeStorageBuffer("probability weight partial sums", groups * 16, GPUBufferUsage.COPY_SRC);
    weightReadback = device.createBuffer({
      label: "probability weight readback",
      size: groups * 16,
      usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST,
    });
  }
  weightBindGroups = [waveBufferA, waveBufferB].map(buffer => bindGroup(pipelineWeightReduce, [
    { binding: 0, resource: { buffer: uniformBuffer } },
    { binding: 1, resource: { buffer } },
    { binding: 2, resource: { buffer: weightPartials } },
  ]));
  weightCounts = { values: [0.5, 0.5], valid: false };
}

function rebuildParticleBindGroups() {
  if (!waveBufferA || !waveBufferB || !particleSrc || !particleDst) return;
  const waves = [waveBufferA, waveBufferB];
  const particles = [particleSrc, particleDst];
  particleUpdateBindGroups = waves.map((waveBuffer) => particles.map((src, srcIndex) => bindGroup(pipelineParticleUpdate, [
    { binding: 0, resource: { buffer: uniformBuffer } },
    { binding: 1, resource: { buffer: waveBuffer } },
    { binding: 2, resource: { buffer: src } },
    { binding: 3, resource: { buffer: particles[1 - srcIndex] } },
  ])));
  particleRenderBindGroups = particles.map((buffer) => bindGroup(pipelineParticleRender, [
    { binding: 0, resource: { buffer: uniformBuffer } },
    { binding: 1, resource: { buffer } },
    { binding: 2, resource: { buffer: particleStartSide } },
  ]));
  particleStampBindGroups = particles.map((buffer) => bindGroup(pipelineParticleStamp, [
    { binding: 0, resource: { buffer: trailUniformBuffer } },
    { binding: 1, resource: { buffer } },
    { binding: 2, resource: { buffer: particleStartSide } },
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
  uniformData.set([detectorPlateXGrid(), 1.0, 0.0, 0.0], 36);
  uniformData.set([0.0, 0.0, 0.0, params.trailVisGain], 40);
  uniformData.set([params.trailVisGamma, 2, densityFade, densitySizeScale], 44);
  const sgTint = params.sgFieldOn && params.sgGradient > 0 ? 1 : 0;
  uniformData.set(sgTint ? [0.82, 0.34, 0.28, 0.30] : [0.38, 0.72, 0.68, 0.22], 48);
  const boxCenter = boxCenterWorld();
  uniformData.set([boxCenter[0], boxCenter[1], boxCenter[2], 0.0], 52);
  const sgStrength = params.sgFieldOn ? params.sgGradient : 0.0;
  uniformData.set([sgStrength, params.sgFieldOn ? 1.0 : 0.0, params.spinTheta * DEG, params.spinPhi * DEG], 56);
  const xc = visualPacketCenterX();
  uniformData.set([xc, CLOUD_STRIDE, Math.floor(xc) - Math.floor(simW / 2), 0.0], 60);
  const mag = magnetState(simTime);
  uniformData.set([mag.m1.p, Math.cos(mag.m1.theta), Math.sin(mag.m1.theta), magnetPreset().b0], 64);
  uniformData.set([mag.m2.p, Math.cos(mag.m2.theta), Math.sin(mag.m2.theta), 0.0], 68);
  const tau = params.hbar * simTime / (params.mass * params.packetSigma * params.packetSigma);
  uniformData.set([xc, tau, simTime, waveCount], 72);
  const ax = measurementAxes();
  uniformData.set([ax[0][0], ax[0][1], ax[ax.length - 1][0], ax[ax.length - 1][1]], 76);
  uniformData.set(camera.viewProj, 80);
  device.queue.writeBuffer(buffer, 0, uniformData);
}

// Motion along x is the exact free Gaussian (no grid), so the momentum is used as set.
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

function detectorPlateXGrid() {
  return 2.0 * Math.max(1, simW - 1);
}

function worldFromGrid(p) {
  return [
    p[0] * params.boxScale,
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

function cameraDistanceBounds() {
  const n = Math.max(simW, simH, simD) * params.boxScale;
  return {
    n,
    min: 0.325 * n,
    max: 5.0 * n,
  };
}

function clampCameraDistance(distance) {
  const bounds = cameraDistanceBounds();
  if (!Number.isFinite(distance) || distance <= 1) return 2.5 * bounds.n;
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
  const n = Math.max(simW, simH, simD) * params.boxScale;
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
    { label: "X", color: "#ff5b5b", dir: [1, 0, 0] },
    { label: "Y", color: "#58d26f", dir: [0, 1, 0] },
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
  for (const [label, d, col] of [["x", [1, 0, 0], "#ff8a8a"], ["y", [0, 1, 0], "#7fdc8f"], ["z", [0, 0, 1], "#7fb6ff"]]) {
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
  const note = magnetPreset().b0 < 1 ? "<br>Not for the weak field: there spins can flip." : "";
  spinSphereText.innerHTML = `<b>Spin</b> ${spinLabel()} (orange)<br><b>Magnet axis</b> ${p} (red, dashed)<br>Angle between them γ = ${Math.round(gamma)}°<br>Expected: ${(100 * pPlus).toFixed(0)}% toward ${p}, ${(100 * (1 - pPlus)).toFixed(0)}% toward ${q} (cos² γ/2)${note}<br><span class=\"spin-sphere-note\">x is the beam. Angles about the beam run from +z toward +y.</span>`;
}

function resetWave() {
  if (!waveBufferA || !waveBufferB) return;
  simTime = 0;
  writeUniforms(uniformBuffer, cameraFrame(), canvas.width, canvas.height);
  const encoder = device.createCommandEncoder({ label: "reset wave encoder" });
  const pass = encoder.beginComputePass({ label: "reset wave pass" });
  pass.setPipeline(pipelineWaveInit);
  pass.setBindGroup(0, waveInitBindGroup);
  pass.dispatchWorkgroups(dispatchCount(waveCount, WAVE_WORKGROUP_SIZE));
  pass.end();
  device.queue.submit([encoder.finish()]);
  flip = 0;
}

function waveStep(pass) {
  pass.setPipeline(pipelineWaveStep);
  pass.setBindGroup(0, waveStepBindGroups[flip]);
  pass.dispatchWorkgroups(dispatchCount(waveCount, WAVE_WORKGROUP_SIZE));
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
    let y = y0 + randn() * sigma1D;
    let z = z0 + randn() * sigma1D;
    for (let tries = 0; !inside(y, z) && tries < 1000; tries++) {
      y = y0 + randn() * sigma1D;
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
function updateHitDisplay() {
  if (!hitDisplay) return;
  const labels = outcomeLabels();
  if (reading === "cpn") {
    hitDisplay.hidden = false;
    const vals = weightCounts.values;
    const rows = labels.map((l, k) => `${l}: ${weightCounts.valid && vals[k] !== undefined ? vals[k].toFixed(2) : "–"}`).join("<br>");
    hitDisplay.innerHTML = `<b>Probability now</b><br>${rows}<br><span class="plate-hits-note">Weight of |Ψ|² in each region.<br>At the plate: the chance of a hit there.</span>`;
    return;
  }
  hitDisplay.hidden = !dotsShown() || hitCounts.total <= 0;
  const rows = labels.map((l, k) => `${l}: ${hitCounts.counts[k] ?? 0}`).join("<br>");
  hitDisplay.innerHTML = `<b>Dots at the plate</b><br>${rows}<br>${hitCounts.arrived} of ${hitCounts.total} arrived`;
}

// Orthodox reading: sum |Psi|^2 above and below the middle on the GPU, then read the sums back.
function readWeights(now) {
  if (readbackBusy || !weightReadback || !weightBindGroups.length || now - lastHitReadback < HIT_READBACK_MS) return;
  lastHitReadback = now;
  const groups = dispatchCount(waveCount, WAVE_WORKGROUP_SIZE);
  const readback = weightReadback;
  const encoder = device.createCommandEncoder({ label: "probability weight" });
  const pass = encoder.beginComputePass({ label: "probability weight pass" });
  pass.setPipeline(pipelineWeightReduce);
  pass.setBindGroup(0, weightBindGroups[flip]);
  pass.dispatchWorkgroups(groups);
  pass.end();
  encoder.copyBufferToBuffer(weightPartials, 0, readback, 0, groups * 16);
  device.queue.submit([encoder.finish()]);
  readbackBusy = true;
  const twoAxes = measurementAxes().length > 1;
  readback.mapAsync(GPUMapMode.READ, 0, groups * 16).then(() => {
    const sums = new Float32Array(readback.getMappedRange(0, groups * 16));
    let A = 0, B = 0, AB = 0, total = 0;
    for (let i = 0; i < groups; i++) { A += sums[4 * i]; B += sums[4 * i + 1]; AB += sums[4 * i + 2]; total += sums[4 * i + 3]; }
    readback.unmap();
    if (readback === weightReadback && total > 0) {
      const values = twoAxes
        ? [AB / total, (A - AB) / total, (B - AB) / total, (total - A - B + AB) / total]
        : [A / total, 1 - A / total];
      weightCounts = { values, valid: true };
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
  pass.setPipeline(pipelineParticleUpdate);
  pass.setBindGroup(0, particleUpdateBindGroups[flip][particleFlip]);
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

  if (params.showCloud) {
    pass.setPipeline(pipelineCloud);
    pass.setBindGroup(0, cloudBindGroups[flip]);
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
function updateStats() {
  if (legendField) legendField.hidden = !(params.sgFieldOn && params.sgGradient > 0);
  if (legendCloud) legendCloud.hidden = !params.showCloud;
  if (legendDots) legendDots.hidden = !dotsShown();
  if (legendCloudText) legendCloudText.textContent = reading === "pw"
    ? "Cloud: |Ψ|², where the particle can be found."
    : "Cloud: |Ψ|². In the orthodox reading it gives the probability of finding the particle at each place when its position is measured; the theory gives the particle no path.";
  if (legendPlateText) legendPlateText.textContent = reading === "pw"
    ? "Detector plate: a dot stops when it reaches it."
    : "Detector plate: where the position is measured. The chance of a hit in each region is the weight of |Ψ|² that reaches it.";
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
      const near = 0.5 * s.cells > L - 12 ? " (near the walls)" : "";
      const label = magnets().length > 1 ? `${s.axis} ` : "";
      return `${label}≈ ${(s.cells * LAB_SCALE.sz * 1e3).toFixed(2)} mm${near}`;
    });
    sText = parts.join(", ");
  }
  statsEl.innerHTML = `<b>Magnets</b>: ${magnetPreset().name}${params.magnetAngle ? `, turned ${Math.round(params.magnetAngle)}°` : ""} &nbsp; <b>Initial spin</b>: ${spinText} &nbsp; <b>Gradient</b>: ${gText} &nbsp; <b>Splitting at the plate</b>: ${sText} &nbsp; <b>Flight to the plate</b>: ${(lab.flightTime * 1e6).toFixed(0)} µs over ${(lab.flight * 100).toFixed(1)} cm &nbsp; <b>Dots</b>: ${Math.floor(params.nParticles)}<br><span class="stat-units">Each axis has its own scale, matched to the 1922 experiment: x in cm, y and z in µm, time in µs. The wave here spreads about ${roughPower(lab.ratio)} times faster than a real silver atom's, so that it can be seen on the grid.</span>`;
}

// Legend text for the field lines, per magnet preset and angle.
function updateLegendField() {
  if (!legendField) return;
  const preset = magnetPreset();
  const ms = magnets();
  const p = ms.map(m => axisName(m.theta)), q = ms.map(m => axisName(m.theta + Math.PI));
  const head = "Magnetic field lines; arrowheads show the direction of B.";
  let text;
  if (ms.length > 1) {
    text = `${head} First magnet: field along ${p[0]}, stronger toward ${p[0]}. Second magnet: field along ${p[1]}, stronger toward ${p[1]}. Between them there is no field.`;
  } else if (preset.b0 < 1) {
    text = `${head} The field points along ${p[0]} and is stronger toward ${p[0]}, but its uniform part is small: on the ${q[0]} side it almost vanishes, and there spins can flip.`;
  } else {
    const where = ms[0].b < 1 ? " The magnet ends partway; after it the parts drift apart without a field." : "";
    const turned = p[0] === "+z" ? "" : ` The magnet is turned ${Math.round(params.magnetAngle)}° about the beam, from +z toward +y.`;
    text = `${head} The field points along ${p[0]} and is stronger toward ${p[0]}; this pushes the ${p[0]} spin part toward ${p[0]} and the ${q[0]} part the other way.${turned}${where}`;
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
      lineVerts.push(p[0] * params.boxScale, p[1] * params.boxScale, p[2] * params.boxScale, fade);
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
      corner[0] * params.boxScale,
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
    const bu = -u, bv = b0 + w;
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
  const ax = a[0] * params.boxScale;
  const ay = a[1] * params.boxScale;
  const az = a[2] * params.boxScale;
  const bx = b[0] * params.boxScale;
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
  let sinceArrow = 0.5 * FIELD_ARROW.spacing;
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
    if (arrows && sinceArrow >= FIELD_ARROW.spacing) {
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
  const x0 = tunnelStartX() + 8, x1 = detectorPlateXGrid() - 4;
  const columns = 6;
  for (let k = 0; k < columns; k++) {
    const x = x0 + (x1 - x0) * k / (columns - 1);
    const segs = magnetsAtX(x);
    const strength = Math.min(1, segs.reduce((s, g) => s + g.p, 0));
    if (strength < 0.05) continue;
    const fade = 0.65 * strength;
    const seeds = [[0.25, 0.30], [0.75, 0.30], [0.25, 0.70], [0.75, 0.70]];
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
  cameraOrbit.distance = 2.5 * Math.max(simW, simH, simD) * params.boxScale;
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

// Classical splitting along each magnet's axis at the plate (cells): each spin part feels
// ±(ħ/2m)(g/L) p(f), so the separation is 2·a·T²·∫(1 − f) p(f) df with a = (ħ/2m)(g/L)/m
// and T the flight time. For the long magnet this is a·T².
function expectedSplittings() {
  const v = packetGroupVelocity();
  const L = Math.max(1, 0.5 * (simD - 1));
  const a = (params.hbar / (2 * params.mass)) * (params.sgGradient / L) / params.mass;
  const T = (detectorPlateXGrid() - params.packetX * (simW - 1)) / Math.max(v, 1e-6);
  return magnets().map(mg => {
    if (v < 0.5) return { axis: axisName(mg.theta), cells: Infinity };
    let integral = 0;
    const n = 400;
    for (let k = 0; k < n; k++) {
      const f = (k + 0.5) / n;
      integral += (1 - f) * magnetProfile(mg, f) / n;
    }
    return { axis: axisName(mg.theta), cells: 2 * a * T * T * integral };
  });
}
function expectedSplitting() {
  return expectedSplittings()[0].cells;
}

function applyMagnetPreset() {
  const preset = magnetPreset();
  const slider = document.getElementById("sgGradient");
  params.sgGradient = preset.g;
  if (slider) { slider.max = String(preset.gMax); slider.value = String(preset.g); }
  refreshUnitLabels();
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
  const flight = detectorPlateXGrid() - params.packetX * (simW - 1);           // cells
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
  const x = p[0] * params.boxScale, y = p[1] * params.boxScale, z = p[2] * params.boxScale;
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
  drawAxis(g, camera, w, h, dpr, { from: [x0, 0, 0], to: [xp, 0, 0], unitScale: LAB_SCALE.sx * 100, offset: 0, unit: "cm", name: "x" });
  drawAxis(g, camera, w, h, dpr, { from: [xp, 0, 0], to: [xp, 0, zMax], unitScale: LAB_SCALE.sz * 1e6, offset: 0.5 * zMax, unit: "µm", name: "z", skipStartLabel: true });
  drawAxis(g, camera, w, h, dpr, { from: [xp, 0, 0], to: [xp, yMax, 0], unitScale: LAB_SCALE.sz * 1e6, offset: 0.5 * yMax, unit: "µm", name: "y", skipStartLabel: true });
}

// Time for the packet, including its tail, to pass the detector plate.
function rerunTime() {
  const v = effectivePeriodicP0() / Math.max(1e-6, params.mass);
  if (v < 0.5) return Infinity;
  const x0 = params.packetX * (simW - 1);
  return (detectorPlateXGrid() - x0 + 2.5 * params.packetSigma) / v;
}

function resetAll() {
  rerunHoldStart = null;
  rerunPending = false;
  resetWave();
  rebuildParticles();
  clearDensity();
  requestRedraw();
}

window.addEventListener("resize", () => {
  requestRedraw();
});

async function main() {
  configureCanvas();
  statusTitle.textContent = "Preparing the graphics…";
  await buildPipelines();
  if (!simulationAvailable) return;
  statusTitle.textContent = "Preparing the wave packet…";
  rebuildSimulation();
  // Present the initial packet before the first batch of simulation steps.
  const initialFrame = device.createCommandEncoder({ label: "initial frame encoder" });
  render(initialFrame, cameraFrame());
  device.queue.submit([initialFrame.finish()]);
  await device.queue.onSubmittedWorkDone();
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
      const steps = Math.floor(params.stepsPerFrame);
      const compute = encoder.beginComputePass({ label: "simulation compute pass" });
      for (let i = 0; i < steps; i++) {
        waveStep(compute);
        particleUpdate(compute);
        simTime += params.dt;
      }
      compute.end();
      if (trailsShown()) densityStepAndStamp(encoder, camera);
      if (autoRun && simTime >= rerunTime()) {
        if (rerunHoldStart === null) rerunHoldStart = now;
        else if (now - rerunHoldStart >= RERUN_HOLD_MS) rerunPending = true;
      }
    }

    writeUniforms(uniformBuffer, camera, canvas.width, canvas.height);
    render(encoder, camera);
    drawLabScale(camera);
    updateClock();
    device.queue.submit([encoder.finish()]);
    if (redrawPending) { updateStats(); updateHitDisplay(); }
    redrawPending = false;
    if (!paused) {
      if (reading === "cpn") readWeights(now);
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

