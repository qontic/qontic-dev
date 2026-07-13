import {
  DENSITY_FRAG,
  FULLSCREEN_VERT,
  PARTICLE_FRAG,
  PARTICLE_STAMP_FRAG,
  PARTICLE_VERT,
  TRAIL_FADE_FRAG,
  TRAIL_RENDER_FRAG,
} from "./shaders/sources.js";
import { effectiveDt, effectiveStepsPerFrame, initSimulationSpeedControl, setSimulationFrameDuration } from "../../simulation-speed.js";

const canvas = document.getElementById("c");
const gl = canvas.getContext("webgl2", {
  alpha: false,
  antialias: false,
  depth: false,
  stencil: false,
  premultipliedAlpha: false,
});
if (!gl) throw new Error("WebGL2 is required for DiracPacketSplitting2D.");

const controls = document.getElementById("controls");
const statsEl = document.getElementById("stats");
const resetBtn = document.getElementById("reset");
const pauseBtn = document.getElementById("pause");
const minUiBtn = document.getElementById("minui");
const uiBody = document.getElementById("uibody");
const theoryPanel = document.getElementById("theory");
const theoryBody = document.getElementById("theorybody");
const theoryToggle = document.getElementById("mintheory");
const analysisPanel = document.getElementById("analysis");
const analysisBody = document.getElementById("analysisbody");
const analysisToggle = document.getElementById("minanalysis");
const analysisStatusEl = document.getElementById("analysisstatus");
const trajectoryTab = document.getElementById("trajectorytab");
const distributionTab = document.getElementById("distributiontab");
const trajectoryPage = document.getElementById("trajectorypage");
const distributionPage = document.getElementById("distributionpage");

const chartCanvases = {
  trajectoryVelocity: document.getElementById("trajectoryvelocity"),
  trajectoryMomentum: document.getElementById("trajectorymomentum"),
  trajectoryEnergy: document.getElementById("trajectoryenergy"),
  histVelocity: document.getElementById("histvelocity"),
  histMomentum: document.getElementById("histmomentum"),
  histEnergy: document.getElementById("histenergy"),
};

const PI = Math.PI;
const TAU = 2 * Math.PI;
const BASE_NX = 256;
const BASE_NY = 128;
const PAPER_NY = 32;
const BASE_BOX_LX = 12.0;
const BASE_BOX_LY = 6.75;
const GRID_SCALES = [1, 2, 4];
const HBAR = 1.0;
const HISTOGRAM_BINS = 48;
const MIN_SCALAR_RATIO = 0.06;
const MAX_HISTORY_SAMPLES = 1200;
const MAX_HISTORY_SAMPLE_DT = 0.012;
const TRACK_COLORS = ["#57d8ff", "#ff78ca", "#ffb34d"];
let NX = BASE_NX;
let NY = PAPER_NY;
let SIZE = NX * NY;
let BOX_LX = BASE_BOX_LX;
let BOX_LY = BASE_BOX_LY;
let DX = BOX_LX / NX;
let DY = BOX_LY / NY;
let PACKET_X0 = 0.5 * BOX_LX;
let PACKET_Y0 = 0.5 * BOX_LY;
const urlParams = new URLSearchParams(window.location.search);
const isEmbedded = urlParams.get("embed") === "1";
const debugEnabled = urlParams.has("debug");
if (isEmbedded) theoryPanel?.remove();

const params = {
  simScale: 2,
  paperMode: 1,
  stepsPerFrame: 3,
  dt: 0.004,
  diracC: 1.0,
  mass: 3.0,
  packetK: 10.0,
  packetAngle: 0.0,
  packetSigma: 1.0,
  theta0Deg: 90.0,
  omega0Deg: 0.0,
  nParticles: 900,
  densityGain: 2.2,
  densityGamma: 0.55,
  amplitudeView: 0,
  showParticles: 1,
  showTrail: 1,
  dotSize: 6,
  trailLength: 12,
  trailVisGain: 1.35,
  trailVisGamma: 0.6,
  trailStampGain: 0.55,
};

let paused = false;
let simTime = 0;
let particleCount = 0;

let ar = new Float64Array(0);
let ai = new Float64Array(0);
let br = new Float64Array(0);
let bi = new Float64Array(0);
let density = new Float64Array(0);
let cdf = new Float64Array(0);
let kxValues = new Float64Array(0);
let kyValues = new Float64Array(0);
let tempR = new Float64Array(0);
let tempI = new Float64Array(0);

let particleX = new Float64Array(0);
let particleY = new Float64Array(0);
let particleAlive = new Uint8Array(0);
let particleInitialX = new Float64Array(0);
let particleInitialY = new Float64Array(0);
let particleUnwrappedX = new Float64Array(0);
let particleUnwrappedY = new Float64Array(0);
let particleTrackSlot = new Uint8Array(0);

let displayDensityUpload = new Float32Array(0);

let fullscreenVao = null;
let densityProgram = null;
let fadeProgram = null;
let trailProgram = null;
let particleProgram = null;
let particleStampProgram = null;
let densityTexture = null;
let particleBuffer = null;
let particleVao = null;
let particleUpload = new Float32Array(0);
let trailTextures = [null, null];
let trailFbos = [null, null];
let trailReadIndex = 0;
let trailWidth = 0;
let trailHeight = 0;
let trailFormat = null;

let analysisView = "distributions";
let lastAnalysisDraw = -Infinity;
let lastHistoryTime = -Infinity;
let trackedParticleIds = [];
let trajectoryHistory = [];
let canonicalMomentumHistogram = new Float64Array(HISTOGRAM_BINS);
let ensembleHistograms = {
  velocity: new Float64Array(HISTOGRAM_BINS),
  momentum: new Float64Array(HISTOGRAM_BINS),
  energy: new Float64Array(HISTOGRAM_BINS),
};
let ensembleAnalysis = {
  valid: 0,
  total: 0,
  momentumMean: NaN,
  momentumVariance: NaN,
  velocityMean: NaN,
  velocityVariance: NaN,
  energyMean: NaN,
  energyVariance: NaN,
  momentumInRange: 0,
  energyInRange: 0,
};
let canonicalAnalysis = { mean: NaN, variance: NaN };

let diagnostics = {
  total: 1,
  maxRho: 1,
  aliveParticles: 0,
  particleForward: 0,
  particleBackward: 0,
  particleTransverse: 0,
  centralPlus: 0.5,
  centralMinus: 0.5,
  spectralPlus: 0.5,
  spectralMinus: 0.5,
  meanKPlus: 0,
  meanKMinus: 0,
  meanEPlus: 0,
  meanEMinus: 0,
};

function index(ix, iy) {
  return iy * NX + ix;
}

function wrapIndex(i, n) {
  i %= n;
  return i < 0 ? i + n : i;
}

function wrapValue(x, length) {
  x %= length;
  return x < 0 ? x + length : x;
}

function configureSimulationGrid() {
  const requestedScale = Number(params.simScale);
  const scale = GRID_SCALES.includes(requestedScale) ? requestedScale : 2;
  params.simScale = scale;

  NX = BASE_NX * scale;
  NY = params.paperMode ? PAPER_NY : BASE_NY * scale;
  SIZE = NX * NY;
  BOX_LX = BASE_BOX_LX * scale;
  BOX_LY = BASE_BOX_LY * scale;
  DX = BOX_LX / NX;
  DY = BOX_LY / NY;
  PACKET_X0 = 0.5 * BOX_LX;
  PACKET_Y0 = 0.5 * BOX_LY;

  const maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
  if (NX > maxTextureSize || NY > maxTextureSize) {
    throw new Error(`Simulation grid ${NX}x${NY} exceeds WebGL texture limit ${maxTextureSize}.`);
  }

  ar = new Float64Array(SIZE);
  ai = new Float64Array(SIZE);
  br = new Float64Array(SIZE);
  bi = new Float64Array(SIZE);
  density = new Float64Array(SIZE);
  cdf = new Float64Array(SIZE);
  kxValues = new Float64Array(NX);
  kyValues = new Float64Array(NY);
  tempR = new Float64Array(Math.max(NX, NY));
  tempI = new Float64Array(Math.max(NX, NY));
  displayDensityUpload = new Float32Array(SIZE);

  for (let ix = 0; ix < NX; ix++) {
    const mode = ix < NX / 2 ? ix : ix - NX;
    kxValues[ix] = TAU * mode / BOX_LX;
  }
  for (let iy = 0; iy < NY; iy++) {
    const mode = iy < NY / 2 ? iy : iy - NY;
    kyValues[iy] = TAU * mode / BOX_LY;
  }

  if (densityTexture) {
    gl.bindTexture(gl.TEXTURE_2D, densityTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.R32F, NX, NY, 0, gl.RED, gl.FLOAT, null);
  }
}

function rebuildSimulationGrid() {
  configureSimulationGrid();
  resetAll();
  syncModeControls();
}

function fmt(v) {
  if (!Number.isFinite(v)) return "undefined";
  const av = Math.abs(v);
  if (av >= 1000 || (av > 0 && av < 0.01)) return v.toExponential(2);
  return v.toFixed(3).replace(/\.?0+$/, "");
}

configureSimulationGrid();

const controlRefs = new Map();

function syncControlValues() {
  for (const sync of controlRefs.values()) sync();
  syncModeControls();
}

function syncModeControls() {
  const angleControl = document.querySelector('[data-control="packetAngle"]');
  if (!angleControl) return;
  const input = angleControl.querySelector("input");
  const disabled = Boolean(params.paperMode);
  if (input) input.disabled = disabled;
  angleControl.classList.toggle("is-disabled", disabled);
  angleControl.title = disabled ? "Paper mode fixes the mean wave vector along x." : "Mean momentum direction in the 2D extension.";
}

function simulationDt() {
  return effectiveDt(params.dt);
}

function simulationStepsPerFrame() {
  return effectiveStepsPerFrame(params.stepsPerFrame);
}

function addSectionHeader(label) {
  const header = document.createElement("div");
  header.style.marginTop = "12px";
  header.style.marginBottom = "8px";
  header.style.fontSize = "11px";
  header.style.fontWeight = "700";
  header.style.color = "#9fbce0";
  header.style.textTransform = "uppercase";
  header.style.letterSpacing = "1px";
  header.textContent = label;
  controls.appendChild(header);
}

function addSlider(key, label, min, max, step, onChange = null, live = false) {
  const row = document.createElement("div");
  row.className = "row";
  row.dataset.control = key;

  const lab = document.createElement("label");
  lab.textContent = label;

  const input = document.createElement("input");
  input.type = "range";
  input.min = min;
  input.max = max;
  input.step = step;
  input.value = params[key];

  const val = document.createElement("div");
  val.className = "val";
  val.textContent = fmt(params[key]);

  input.addEventListener("input", () => {
    const v = parseFloat(input.value);
    params[key] = v;
    val.textContent = fmt(v);
    if (live && onChange) onChange();
    updateStats();
  });

  input.addEventListener("change", () => {
    if (!live && onChange) onChange();
    updateStats();
  });

  row.appendChild(lab);
  row.appendChild(input);
  row.appendChild(val);
  controls.appendChild(row);

  controlRefs.set(key, () => {
    input.value = params[key];
    val.textContent = fmt(Number(params[key]));
  });
}

function addToggleInt(key, label, onChange = null) {
  const row = document.createElement("div");
  row.className = "row no-value";
  row.dataset.control = key;

  const lab = document.createElement("label");
  lab.textContent = label;

  const btn = document.createElement("button");
  btn.style.flex = "1";
  const sync = () => { btn.textContent = params[key] ? "ON" : "OFF"; };
  sync();
  btn.addEventListener("click", () => {
    params[key] = params[key] ? 0 : 1;
    sync();
    if (onChange) onChange(params[key]);
    updateStats();
  });

  const val = document.createElement("div");
  val.className = "val";

  row.appendChild(lab);
  row.appendChild(btn);
  row.appendChild(val);
  controls.appendChild(row);

  controlRefs.set(key, sync);
}

function addToggleChoice(key, label, offText, onText, onChange = null) {
  const row = document.createElement("div");
  row.className = "row no-value";
  row.dataset.control = key;

  const lab = document.createElement("label");
  lab.textContent = label;

  const btn = document.createElement("button");
  btn.style.flex = "1";
  const sync = () => { btn.textContent = params[key] ? onText : offText; };
  sync();
  btn.addEventListener("click", () => {
    params[key] = params[key] ? 0 : 1;
    sync();
    if (onChange) onChange(params[key]);
    updateStats();
  });

  const val = document.createElement("div");
  val.className = "val";

  row.appendChild(lab);
  row.appendChild(btn);
  row.appendChild(val);
  controls.appendChild(row);

  controlRefs.set(key, sync);
}

function addSelect(key, label, options, onChange = null) {
  const row = document.createElement("div");
  row.className = "row no-value";
  row.dataset.control = key;

  const lab = document.createElement("label");
  lab.textContent = label;
  const select = document.createElement("select");
  for (const option of options) {
    const element = document.createElement("option");
    element.value = String(option.value);
    element.textContent = option.label;
    select.appendChild(element);
  }
  const sync = () => { select.value = String(params[key]); };
  sync();
  select.addEventListener("change", () => {
    const option = options.find((candidate) => String(candidate.value) === select.value);
    params[key] = option ? option.value : options[0].value;
    if (onChange) onChange(params[key]);
    updateStats();
  });

  const val = document.createElement("div");
  val.className = "val";
  row.appendChild(lab);
  row.appendChild(select);
  row.appendChild(val);
  controls.appendChild(row);
  controlRefs.set(key, sync);
}

function addAction(label, buttonText, action) {
  const row = document.createElement("div");
  row.className = "row no-value";
  const lab = document.createElement("label");
  lab.textContent = label;
  const button = document.createElement("button");
  button.textContent = buttonText;
  button.addEventListener("click", action);
  const val = document.createElement("div");
  val.className = "val";
  row.appendChild(lab);
  row.appendChild(button);
  row.appendChild(val);
  controls.appendChild(row);
}

function applyPaperPreset() {
  Object.assign(params, {
    simScale: 2,
    paperMode: 1,
    stepsPerFrame: 3,
    dt: 0.004,
    diracC: 1,
    mass: 3,
    packetK: 10,
    packetAngle: 0,
    packetSigma: 1,
    theta0Deg: 90,
    omega0Deg: 0,
    nParticles: 900,
  });
  syncControlValues();
  rebuildSimulationGrid();
}

function handlePaperModeChange(enabled) {
  if (!enabled) {
    if (params.simScale > 1) params.simScale = 1;
    params.stepsPerFrame = 1;
  }
  syncControlValues();
  rebuildSimulationGrid();
}

addSectionHeader("Simulation");
addSelect("simScale", "simulation scale", [
  { value: 1, label: "1x - compact" },
  { value: 2, label: "2x - detailed" },
  { value: 4, label: "4x - CPU stress" },
], rebuildSimulationGrid);
addSlider("stepsPerFrame", "Steps/frame", 1, 6, 1);
addSlider("dt", "dt", 0.0005, 0.008, 0.0005);

addSectionHeader("Paper Experiment");
addToggleInt("paperMode", "1D paper mode", handlePaperModeChange);
addAction("recommended setup", "Apply paper preset", applyPaperPreset);
addSlider("diracC", "Dirac c", 0.5, 6.0, 0.1, resetAll);
addSlider("mass", "mass", 0.1, 6.0, 0.05, resetAll);
addSlider("packetK", "mean k0", 1.0, 16.0, 0.1, resetAll);
addSlider("packetAngle", "2D k angle deg", -180.0, 180.0, 1.0, resetAll);
addSlider("packetSigma", "packet sigma", 0.40, 2.0, 0.02, resetAll);
addSlider("theta0Deg", "initial theta0", 0.0, 180.0, 1.0, resetAll);
addSlider("omega0Deg", "initial omega0", -180.0, 180.0, 1.0, resetAll);

addSectionHeader("Visual Parameters");
addSlider("densityGain", "density gain", 0.4, 8.0, 0.1);
addSlider("densityGamma", "density gamma", 0.25, 1.2, 0.05);
addToggleChoice("amplitudeView", "amp view", "Total", "Lower");
addToggleInt("showParticles", "show particles");
addToggleInt("showTrail", "draw trails", (value) => { if (!value) clearTrail(); });
addSlider("nParticles", "particle count", 50, 3000, 50, rebuildParticles);
addSlider("dotSize", "particle size", 2.0, 10.0, 1);
addSlider("trailLength", "trail length", 2.0, 40.0, 1);
syncModeControls();

function packetWaveVector() {
  const angle = (params.paperMode ? 0 : params.packetAngle) * PI / 180;
  return {
    kx: params.packetK * Math.cos(angle),
    ky: params.packetK * Math.sin(angle),
    ux: Math.cos(angle),
    uy: Math.sin(angle),
  };
}

function centralEnergy() {
  const c = Math.max(params.diracC, 1e-9);
  const m = Math.max(params.mass, 1e-9);
  const M = m * c * c;
  const p = HBAR * Math.max(params.packetK, 1e-12);
  return Math.sqrt((c * p) ** 2 + M * M);
}

function asymptoticSpeed() {
  const E = centralEnergy();
  return HBAR * params.diracC * params.diracC * params.packetK / Math.max(E, 1e-12);
}

function analysisRanges() {
  const c = Math.max(params.diracC, 1e-9);
  const m = Math.max(params.mass, 1e-9);
  const p0 = HBAR * params.packetK;
  const sigmaP = params.paperMode
    ? HBAR / (2 * Math.max(params.packetSigma, 1e-9))
    : HBAR / (Math.sqrt(2) * Math.max(params.packetSigma, 1e-9));
  const momentumRadius = Math.max(5 * sigmaP, 1.5 * Math.abs(p0), 2 * m * c);
  const E0 = centralEnergy();
  return {
    velocity: [-1.05 * c, 1.05 * c],
    momentum: [p0 - momentumRadius, p0 + momentumRadius],
    energy: [-1.35 * E0, 1.35 * E0],
  };
}

function spatialProbabilitySigma() {
  return params.paperMode ? params.packetSigma : params.packetSigma / Math.sqrt(2);
}

function separationTime() {
  return Math.sqrt(2) * spatialProbabilitySigma() / Math.max(asymptoticSpeed(), 1e-12);
}

function cleanWindowTime() {
  const margin = 3 * spatialProbabilitySigma();
  const longitudinalDistance = 0.5 * BOX_LX - margin;
  const transverseDistance = params.paperMode ? Infinity : 0.5 * BOX_LY - margin;
  const distance = Math.min(longitudinalDistance, transverseDistance);
  return Math.max(0, distance) / Math.max(params.diracC, 1e-12);
}

function historySampleDt() {
  const zitterbewegungPeriod = PI * HBAR / Math.max(centralEnergy(), 1e-12);
  return Math.min(MAX_HISTORY_SAMPLE_DT, zitterbewegungPeriod / 16);
}

function histogramIndex(value, range) {
  const f = (value - range[0]) / Math.max(range[1] - range[0], 1e-12);
  const bin = Math.floor(f * HISTOGRAM_BINS);
  return bin >= 0 && bin < HISTOGRAM_BINS ? bin : -1;
}

function centralBranchWeights() {
  const spinor = fixedInitialSpinor();
  const { ux, uy } = packetWaveVector();
  const c = Math.max(params.diracC, 1e-9);
  const M = Math.max(params.mass, 1e-9) * c * c;
  const cp = HBAR * c * Math.max(params.packetK, 1e-12);
  const E = Math.sqrt(cp * cp + M * M);
  const projection = (
    cp * ux * spinor.bloch.x
    + cp * uy * spinor.bloch.y
    + M * spinor.bloch.z
  ) / Math.max(E, 1e-12);
  const plus = 0.5 * (1 + Math.max(-1, Math.min(1, projection)));
  return {
    plus,
    minus: 1 - plus,
  };
}

function fixedInitialSpinor() {
  // Paper-angle convention in this representation:
  // n_parallel = cos(theta), n_perp = sin(theta) sin(omega),
  // beta expectation = sin(theta) cos(omega). In 1D paper mode the
  // perpendicular Bloch component is internal and particle motion is locked to x.
  const { ux, uy } = packetWaveVector();
  const theta = params.theta0Deg * PI / 180;
  const omega = params.omega0Deg * PI / 180;
  const nParallel = Math.cos(theta);
  const nPerpendicular = Math.sin(theta) * Math.sin(omega);
  let nx = nParallel * ux - nPerpendicular * uy;
  let ny = nParallel * uy + nPerpendicular * ux;
  let nz = Math.sin(theta) * Math.cos(omega);
  const nn = Math.hypot(nx, ny, nz) || 1;
  nx /= nn; ny /= nn; nz /= nn;

  const upper = Math.sqrt(Math.max(0, 0.5 * (1 + nz)));
  if (upper > 1e-10) {
    return {
      upperR: upper,
      upperI: 0,
      lowerR: nx / (2 * upper),
      lowerI: ny / (2 * upper),
      bloch: { x: nx, y: ny, z: nz },
    };
  }
  return {
    upperR: 0,
    upperI: 0,
    lowerR: 1,
    lowerI: 0,
    bloch: { x: 0, y: 0, z: -1 },
  };
}

function resetWave() {
  const { kx, ky } = packetWaveVector();
  const sigma = Math.max(params.packetSigma, 1e-4);
  const spinor = fixedInitialSpinor();
  const exponentScale = params.paperMode ? -0.25 : -0.5;

  for (let iy = 0; iy < NY; iy++) {
    const y = (iy + 0.5) * DY;
    for (let ix = 0; ix < NX; ix++) {
      const x = (ix + 0.5) * DX;
      const dx = (x - PACKET_X0) / sigma;
      const dy = params.paperMode ? 0 : (y - PACKET_Y0) / sigma;
      const env = Math.exp(exponentScale * (dx * dx + dy * dy));
      const phase = kx * (x - PACKET_X0) + ky * (y - PACKET_Y0);
      const cr = Math.cos(phase);
      const ci = Math.sin(phase);
      const k = index(ix, iy);

      ar[k] = env * (spinor.upperR * cr - spinor.upperI * ci);
      ai[k] = env * (spinor.upperR * ci + spinor.upperI * cr);
      br[k] = env * (spinor.lowerR * cr - spinor.lowerI * ci);
      bi[k] = env * (spinor.lowerR * ci + spinor.lowerI * cr);
    }
  }

  let norm = 0;
  for (let k = 0; k < SIZE; k++) {
    norm += (ar[k] * ar[k] + ai[k] * ai[k] + br[k] * br[k] + bi[k] * bi[k]) * DX * DY;
  }
  const scale = 1 / Math.sqrt(Math.max(norm, 1e-30));
  for (let k = 0; k < SIZE; k++) {
    ar[k] *= scale;
    ai[k] *= scale;
    br[k] *= scale;
    bi[k] *= scale;
  }
}

function fft1d(re, im, n, inverse) {
  for (let i = 1, j = 0; i < n; i++) {
    let bit = n >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j) {
      let tr = re[i]; re[i] = re[j]; re[j] = tr;
      let ti = im[i]; im[i] = im[j]; im[j] = ti;
    }
  }

  for (let len = 2; len <= n; len <<= 1) {
    const ang = (inverse ? 2 : -2) * PI / len;
    const wlenR = Math.cos(ang);
    const wlenI = Math.sin(ang);
    for (let i = 0; i < n; i += len) {
      let wr = 1;
      let wi = 0;
      const half = len >> 1;
      for (let j = 0; j < half; j++) {
        const uR = re[i + j];
        const uI = im[i + j];
        const vR = re[i + j + half] * wr - im[i + j + half] * wi;
        const vI = re[i + j + half] * wi + im[i + j + half] * wr;
        re[i + j] = uR + vR;
        im[i + j] = uI + vI;
        re[i + j + half] = uR - vR;
        im[i + j + half] = uI - vI;
        const nextWr = wr * wlenR - wi * wlenI;
        wi = wr * wlenI + wi * wlenR;
        wr = nextWr;
      }
    }
  }

  if (inverse) {
    const inv = 1 / n;
    for (let i = 0; i < n; i++) {
      re[i] *= inv;
      im[i] *= inv;
    }
  }
}

function fft2d(re, im, inverse) {
  for (let iy = 0; iy < NY; iy++) {
    const row = iy * NX;
    for (let ix = 0; ix < NX; ix++) {
      tempR[ix] = re[row + ix];
      tempI[ix] = im[row + ix];
    }
    fft1d(tempR, tempI, NX, inverse);
    for (let ix = 0; ix < NX; ix++) {
      re[row + ix] = tempR[ix];
      im[row + ix] = tempI[ix];
    }
  }

  for (let ix = 0; ix < NX; ix++) {
    for (let iy = 0; iy < NY; iy++) {
      const k = index(ix, iy);
      tempR[iy] = re[k];
      tempI[iy] = im[k];
    }
    fft1d(tempR, tempI, NY, inverse);
    for (let iy = 0; iy < NY; iy++) {
      const k = index(ix, iy);
      re[k] = tempR[iy];
      im[k] = tempI[iy];
    }
  }
}

function applyFreeDirac(dt) {
  const c = Math.max(params.diracC, 1e-9);
  const m = Math.max(params.mass, 1e-9);
  const M = m * c * c;

  fft2d(ar, ai, false);
  fft2d(br, bi, false);

  for (let iy = 0; iy < NY; iy++) {
    const ky = kyValues[iy];
    for (let ix = 0; ix < NX; ix++) {
      const k = index(ix, iy);
      const kx = kxValues[ix];
      const bx = HBAR * c * kx;
      const by = -HBAR * c * ky;
      const E = Math.sqrt(M * M + bx * bx + by * by);
      const theta = E * dt / HBAR;
      const co = Math.cos(theta);
      const s = Math.sin(theta) / Math.max(E, 1e-12);

      const aR = ar[k];
      const aI = ai[k];
      const bR = br[k];
      const bI = bi[k];

      const hAR = M * aR + bx * bR - by * bI;
      const hAI = M * aI + bx * bI + by * bR;
      const hBR = bx * aR + by * aI - M * bR;
      const hBI = bx * aI - by * aR - M * bI;

      ar[k] = co * aR + s * hAI;
      ai[k] = co * aI - s * hAR;
      br[k] = co * bR + s * hBI;
      bi[k] = co * bI - s * hBR;
    }
  }

  fft2d(ar, ai, true);
  fft2d(br, bi, true);
}

function stepWave(dt) {
  applyFreeDirac(dt);
}

function computeSpectralDiagnostics() {
  const srA = new Float64Array(ar);
  const siA = new Float64Array(ai);
  const srB = new Float64Array(br);
  const siB = new Float64Array(bi);
  fft2d(srA, siA, false);
  fft2d(srB, siB, false);

  const c = Math.max(params.diracC, 1e-9);
  const M = Math.max(params.mass, 1e-9) * c * c;
  const { ux, uy } = packetWaveVector();
  let pPlus = 0;
  let pMinus = 0;
  let kPlus = 0;
  let kMinus = 0;
  let ePlus = 0;
  let eMinus = 0;
  let canonicalWeight = 0;
  let canonicalP = 0;
  let canonicalP2 = 0;
  const momentumRange = analysisRanges().momentum;
  canonicalMomentumHistogram.fill(0);

  for (let iy = 0; iy < NY; iy++) {
    const ky = kyValues[iy];
    for (let ix = 0; ix < NX; ix++) {
      const k = index(ix, iy);
      const kx = kxValues[ix];
      const aR = srA[k];
      const aI = siA[k];
      const bR = srB[k];
      const bI = siB[k];
      const aa = aR * aR + aI * aI;
      const bb = bR * bR + bI * bI;
      const rho = aa + bb;
      if (rho < 1e-30) continue;

      const reAdB = aR * bR + aI * bI;
      const imAdB = aR * bI - aI * bR;
      const hx = HBAR * c * kx;
      const hy = HBAR * c * ky;
      const E = Math.sqrt(M * M + hx * hx + hy * hy);
      const hExp = M * (aa - bb) + 2 * hx * reAdB + 2 * hy * imAdB;
      const wp = Math.max(0, 0.5 * (rho + hExp / Math.max(E, 1e-12)));
      const wm = Math.max(0, 0.5 * (rho - hExp / Math.max(E, 1e-12)));
      const kPar = kx * ux + ky * uy;
      const pPar = HBAR * kPar;

      pPlus += wp;
      pMinus += wm;
      kPlus += wp * kPar;
      kMinus += wm * kPar;
      ePlus += wp * E;
      eMinus += wm * (-E);
      canonicalWeight += rho;
      canonicalP += rho * pPar;
      canonicalP2 += rho * pPar * pPar;
      const bin = histogramIndex(pPar, momentumRange);
      if (bin >= 0) canonicalMomentumHistogram[bin] += rho;
    }
  }

  const total = Math.max(pPlus + pMinus, 1e-30);
  diagnostics.spectralPlus = pPlus / total;
  diagnostics.spectralMinus = pMinus / total;
  diagnostics.meanKPlus = kPlus / Math.max(pPlus, 1e-30);
  diagnostics.meanKMinus = kMinus / Math.max(pMinus, 1e-30);
  diagnostics.meanEPlus = ePlus / Math.max(pPlus, 1e-30);
  diagnostics.meanEMinus = eMinus / Math.max(pMinus, 1e-30);
  const canonicalNorm = Math.max(canonicalWeight, 1e-30);
  for (let i = 0; i < HISTOGRAM_BINS; i++) canonicalMomentumHistogram[i] /= canonicalNorm;
  canonicalAnalysis.mean = canonicalP / canonicalNorm;
  canonicalAnalysis.variance = Math.max(0, canonicalP2 / canonicalNorm - canonicalAnalysis.mean ** 2);
}

function updateDensity() {
  let total = 0;
  let maxRho = 0;

  for (let iy = 0; iy < NY; iy++) {
    for (let ix = 0; ix < NX; ix++) {
      const k = index(ix, iy);
      const rho = ar[k] * ar[k] + ai[k] * ai[k] + br[k] * br[k] + bi[k] * bi[k];
      const p = rho * DX * DY;

      density[k] = rho;
      total += p;
      maxRho = Math.max(maxRho, rho);
    }
  }

  const central = centralBranchWeights();
  diagnostics.total = total;
  diagnostics.maxRho = Math.max(maxRho, 1e-12);
  diagnostics.centralPlus = central.plus;
  diagnostics.centralMinus = central.minus;
}

function rebuildParticleBuffers() {
  particleCount = Math.max(0, Math.floor(params.nParticles));
  particleX = new Float64Array(particleCount);
  particleY = new Float64Array(particleCount);
  particleAlive = new Uint8Array(particleCount);
  particleInitialX = new Float64Array(particleCount);
  particleInitialY = new Float64Array(particleCount);
  particleUnwrappedX = new Float64Array(particleCount);
  particleUnwrappedY = new Float64Array(particleCount);
  particleTrackSlot = new Uint8Array(particleCount);
}

function rebuildParticles() {
  updateDensity();
  rebuildParticleBuffers();

  let sum = 0;
  for (let k = 0; k < SIZE; k++) {
    sum += density[k];
    cdf[k] = sum;
  }

  for (let p = 0; p < particleCount; p++) {
    const r = Math.random() * Math.max(sum, 1e-30);
    let lo = 0;
    let hi = SIZE - 1;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (cdf[mid] < r) lo = mid + 1;
      else hi = mid;
    }
    const ix = lo % NX;
    const iy = Math.floor(lo / NX);
    particleX[p] = (ix + Math.random()) * DX;
    particleY[p] = (iy + Math.random()) * DY;
    particleInitialX[p] = particleX[p];
    particleInitialY[p] = particleY[p];
    particleUnwrappedX[p] = particleX[p];
    particleUnwrappedY[p] = particleY[p];
    particleAlive[p] = 1;
  }

  resetTrajectoryTracking();
  clearTrail();
  updateDensity();
}

function sampleVelocity(x, y) {
  const { rho, blochX, blochY } = sampleBilinears(x, y);
  const c = Math.max(params.diracC, 1e-9);
  return {
    x: c * blochX / Math.max(rho, 1e-30),
    y: params.paperMode ? 0 : c * blochY / Math.max(rho, 1e-30),
  };
}

function sampleBilinears(x, y) {
  x = wrapValue(x, BOX_LX);
  y = wrapValue(y, BOX_LY);
  const gx = x / DX - 0.5;
  const gy = y / DY - 0.5;
  const i0x = Math.floor(gx);
  const i0y = Math.floor(gy);
  const fx = gx - i0x;
  const fy = gy - i0y;
  const ix0 = wrapIndex(i0x, NX);
  const ix1 = wrapIndex(i0x + 1, NX);
  const iy0 = wrapIndex(i0y, NY);
  const iy1 = wrapIndex(i0y + 1, NY);
  const k00 = index(ix0, iy0);
  const k10 = index(ix1, iy0);
  const k01 = index(ix0, iy1);
  const k11 = index(ix1, iy1);
  const w00 = (1 - fx) * (1 - fy);
  const w10 = fx * (1 - fy);
  const w01 = (1 - fx) * fy;
  const w11 = fx * fy;

  const aa00 = ar[k00] * ar[k00] + ai[k00] * ai[k00];
  const aa10 = ar[k10] * ar[k10] + ai[k10] * ai[k10];
  const aa01 = ar[k01] * ar[k01] + ai[k01] * ai[k01];
  const aa11 = ar[k11] * ar[k11] + ai[k11] * ai[k11];
  const bb00 = br[k00] * br[k00] + bi[k00] * bi[k00];
  const bb10 = br[k10] * br[k10] + bi[k10] * bi[k10];
  const bb01 = br[k01] * br[k01] + bi[k01] * bi[k01];
  const bb11 = br[k11] * br[k11] + bi[k11] * bi[k11];
  const rho = (aa00 + bb00) * w00 + (aa10 + bb10) * w10 + (aa01 + bb01) * w01 + (aa11 + bb11) * w11;
  const scalar = (aa00 - bb00) * w00 + (aa10 - bb10) * w10 + (aa01 - bb01) * w01 + (aa11 - bb11) * w11;
  const blochX = 2 * (
    (ar[k00] * br[k00] + ai[k00] * bi[k00]) * w00
    + (ar[k10] * br[k10] + ai[k10] * bi[k10]) * w10
    + (ar[k01] * br[k01] + ai[k01] * bi[k01]) * w01
    + (ar[k11] * br[k11] + ai[k11] * bi[k11]) * w11
  );
  const blochY = 2 * (
    (ar[k00] * bi[k00] - ai[k00] * br[k00]) * w00
    + (ar[k10] * bi[k10] - ai[k10] * br[k10]) * w10
    + (ar[k01] * bi[k01] - ai[k01] * br[k01]) * w01
    + (ar[k11] * bi[k11] - ai[k11] * br[k11]) * w11
  );
  return { rho, blochX, blochY, scalar };
}

function sampleBohmianObservables(x, y) {
  const { rho, blochX, blochY, scalar } = sampleBilinears(x, y);
  const { ux, uy } = packetWaveVector();
  const longitudinal = blochX * ux + blochY * uy;
  const c = Math.max(params.diracC, 1e-9);
  const m = Math.max(params.mass, 1e-9);
  const scalarRatio = scalar / Math.max(rho, 1e-30);
  const velocity = c * longitudinal / Math.max(rho, 1e-30);
  const densityValid = rho > diagnostics.maxRho * 1e-8;
  const scalarValid = Math.abs(scalarRatio) >= MIN_SCALAR_RATIO;
  const valid = densityValid && scalarValid;
  const energy = valid ? m * c * c * rho / scalar : NaN;
  const momentum = valid ? m * c * longitudinal / scalar : NaN;
  return {
    rho,
    scalarRatio,
    velocity,
    momentum,
    energy,
    valid: valid && Number.isFinite(momentum) && Number.isFinite(energy),
  };
}

function initialLongitudinalCoordinate(particleId) {
  const { ux, uy } = packetWaveVector();
  return (
    (particleInitialX[particleId] - PACKET_X0) * ux
    + (particleInitialY[particleId] - PACKET_Y0) * uy
  );
}

function resetTrajectoryTracking() {
  particleTrackSlot.fill(0);
  const ranked = Array.from({ length: particleCount }, (_, id) => id)
    .filter((id) => particleAlive[id])
    .sort((a, b) => initialLongitudinalCoordinate(a) - initialLongitudinalCoordinate(b));
  const quantiles = [0.2, 0.5, 0.8];
  trackedParticleIds = [];
  for (const q of quantiles) {
    if (!ranked.length) break;
    const id = ranked[Math.min(ranked.length - 1, Math.round(q * (ranked.length - 1)))];
    if (!trackedParticleIds.includes(id)) trackedParticleIds.push(id);
  }
  trajectoryHistory = trackedParticleIds.map((particleId, slot) => {
    particleTrackSlot[particleId] = slot + 1;
    return {
      particleId,
      initialS: initialLongitudinalCoordinate(particleId),
      time: [],
      velocity: [],
      momentum: [],
      energy: [],
    };
  });
  lastHistoryTime = -Infinity;
  recordTrajectorySamples(true);
}

function recordTrajectorySamples(force = false) {
  if (!force && simTime - lastHistoryTime < historySampleDt()) return;
  lastHistoryTime = simTime;
  for (const history of trajectoryHistory) {
    const id = history.particleId;
    if (!particleAlive[id]) continue;
    const sample = sampleBohmianObservables(particleX[id], particleY[id]);
    history.time.push(simTime);
    history.velocity.push(sample.velocity);
    history.momentum.push(sample.valid ? sample.momentum : NaN);
    history.energy.push(sample.valid ? sample.energy : NaN);
    if (history.time.length > MAX_HISTORY_SAMPLES) {
      history.time.shift();
      history.velocity.shift();
      history.momentum.shift();
      history.energy.shift();
    }
  }
}

function updateParticles(dt) {
  if (!particleCount) return;
  for (let p = 0; p < particleCount; p++) {
    if (!particleAlive[p]) continue;
    const x = particleX[p];
    const y = particleY[p];
    const v1 = sampleVelocity(x, y);
    const mx = wrapValue(x + 0.5 * dt * v1.x, BOX_LX);
    const my = wrapValue(y + 0.5 * dt * v1.y, BOX_LY);
    const v2 = sampleVelocity(mx, my);
    const deltaX = v2.x * dt;
    const deltaY = v2.y * dt;
    particleX[p] = wrapValue(x + deltaX, BOX_LX);
    particleY[p] = wrapValue(y + deltaY, BOX_LY);
    particleUnwrappedX[p] += deltaX;
    particleUnwrappedY[p] += deltaY;
  }
}

function updateSimulation() {
  const steps = simulationStepsPerFrame();
  const dt = simulationDt();
  for (let s = 0; s < steps; s++) {
    stepWave(dt);
    updateDensity();
    updateParticles(dt);
    simTime += dt;
    recordTrajectorySamples();
  }
}

function finishMoments(count, sum, sum2) {
  if (!count) return { mean: NaN, variance: NaN };
  const mean = sum / count;
  return { mean, variance: Math.max(0, sum2 / count - mean * mean) };
}

function computeEnsembleAnalysis() {
  const velocityHistogram = ensembleHistograms.velocity;
  const momentumHistogram = ensembleHistograms.momentum;
  const energyHistogram = ensembleHistograms.energy;
  velocityHistogram.fill(0);
  momentumHistogram.fill(0);
  energyHistogram.fill(0);
  const ranges = analysisRanges();

  let total = 0;
  let valid = 0;
  let velocityCount = 0;
  let velocitySum = 0;
  let velocitySum2 = 0;
  let momentumSum = 0;
  let momentumSum2 = 0;
  let energySum = 0;
  let energySum2 = 0;
  let momentumInRange = 0;
  let energyInRange = 0;
  let particleForward = 0;
  let particleBackward = 0;
  let particleTransverse = 0;
  const directionThreshold = 0.02 * Math.max(params.diracC, 1e-9);

  for (let p = 0; p < particleCount; p++) {
    if (!particleAlive[p]) continue;
    total++;
    const sample = sampleBohmianObservables(particleX[p], particleY[p]);
    if (sample.rho > diagnostics.maxRho * 1e-8 && Number.isFinite(sample.velocity)) {
      velocityCount++;
      velocitySum += sample.velocity;
      velocitySum2 += sample.velocity * sample.velocity;
      if (sample.velocity > directionThreshold) particleForward++;
      else if (sample.velocity < -directionThreshold) particleBackward++;
      else particleTransverse++;
      const velocityBin = histogramIndex(sample.velocity, ranges.velocity);
      if (velocityBin >= 0) velocityHistogram[velocityBin]++;
    }
    if (!sample.valid) continue;
    valid++;
    momentumSum += sample.momentum;
    momentumSum2 += sample.momentum * sample.momentum;
    energySum += sample.energy;
    energySum2 += sample.energy * sample.energy;
    const momentumBin = histogramIndex(sample.momentum, ranges.momentum);
    const energyBin = histogramIndex(sample.energy, ranges.energy);
    if (momentumBin >= 0) {
      momentumHistogram[momentumBin]++;
      momentumInRange++;
    }
    if (energyBin >= 0) {
      energyHistogram[energyBin]++;
      energyInRange++;
    }
  }

  const velocityNorm = Math.max(velocityCount, 1);
  const validNorm = Math.max(valid, 1);
  for (let i = 0; i < HISTOGRAM_BINS; i++) {
    velocityHistogram[i] /= velocityNorm;
    momentumHistogram[i] /= validNorm;
    energyHistogram[i] /= validNorm;
  }

  const velocityMoments = finishMoments(velocityCount, velocitySum, velocitySum2);
  const momentumMoments = finishMoments(valid, momentumSum, momentumSum2);
  const energyMoments = finishMoments(valid, energySum, energySum2);
  ensembleAnalysis = {
    valid,
    total,
    momentumMean: momentumMoments.mean,
    momentumVariance: momentumMoments.variance,
    velocityMean: velocityMoments.mean,
    velocityVariance: velocityMoments.variance,
    energyMean: energyMoments.mean,
    energyVariance: energyMoments.variance,
    momentumInRange,
    energyInRange,
  };
  diagnostics.aliveParticles = total;
  diagnostics.particleForward = particleForward;
  diagnostics.particleBackward = particleBackward;
  diagnostics.particleTransverse = particleTransverse;
}

function prepareChart(canvas) {
  if (!canvas || canvas.clientWidth < 2 || canvas.clientHeight < 2) return null;
  const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
  const width = Math.max(1, Math.round(canvas.clientWidth));
  const height = Math.max(1, Math.round(canvas.clientHeight));
  const pixelWidth = Math.round(width * dpr);
  const pixelHeight = Math.round(height * dpr);
  if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
    canvas.width = pixelWidth;
    canvas.height = pixelHeight;
  }
  const ctx = canvas.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);
  return { ctx, width, height };
}

function drawChartFrame(ctx, width, height, xMin, xMax, yMin, yMax) {
  const plot = { left: 38, right: width - 7, top: 7, bottom: height - 18 };
  ctx.fillStyle = "rgba(1, 7, 18, 0.46)";
  ctx.fillRect(plot.left, plot.top, plot.right - plot.left, plot.bottom - plot.top);
  ctx.strokeStyle = "rgba(132, 192, 255, 0.12)";
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const x = plot.left + (plot.right - plot.left) * i / 4;
    const y = plot.top + (plot.bottom - plot.top) * i / 4;
    ctx.beginPath();
    ctx.moveTo(x, plot.top);
    ctx.lineTo(x, plot.bottom);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(plot.left, y);
    ctx.lineTo(plot.right, y);
    ctx.stroke();
  }
  ctx.fillStyle = "#7f9dbc";
  ctx.font = "10px ui-monospace, SFMono-Regular, Consolas, monospace";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillText(fmt(yMax), 1, plot.top - 1);
  ctx.textBaseline = "bottom";
  ctx.fillText(fmt(yMin), 1, plot.bottom + 1);
  ctx.fillText(fmt(xMin), plot.left, height - 1);
  ctx.textAlign = "right";
  ctx.fillText(fmt(xMax), plot.right, height - 1);
  const mapX = (x) => plot.left + (x - xMin) * (plot.right - plot.left) / Math.max(xMax - xMin, 1e-12);
  const mapY = (y) => plot.bottom - (y - yMin) * (plot.bottom - plot.top) / Math.max(yMax - yMin, 1e-12);
  return { ...plot, mapX, mapY };
}

function drawVerticalReferences(ctx, frame, references, range) {
  ctx.save();
  ctx.setLineDash([4, 3]);
  ctx.strokeStyle = "rgba(224, 239, 255, 0.55)";
  ctx.lineWidth = 1;
  for (const value of references) {
    if (value < range[0] || value > range[1]) continue;
    const x = frame.mapX(value);
    ctx.beginPath();
    ctx.moveTo(x, frame.top);
    ctx.lineTo(x, frame.bottom);
    ctx.stroke();
  }
  ctx.restore();
}

function drawHorizontalReferences(ctx, frame, references, range) {
  ctx.save();
  ctx.setLineDash([4, 3]);
  ctx.strokeStyle = "rgba(224, 239, 255, 0.55)";
  ctx.lineWidth = 1;
  for (const value of references) {
    if (value < range[0] || value > range[1]) continue;
    const y = frame.mapY(value);
    ctx.beginPath();
    ctx.moveTo(frame.left, y);
    ctx.lineTo(frame.right, y);
    ctx.stroke();
  }
  ctx.restore();
}

function drawHistogram(canvas, histogram, range, references, overlay = null) {
  const prepared = prepareChart(canvas);
  if (!prepared) return;
  const { ctx, width, height } = prepared;
  let primaryMax = 0;
  let maxValue = 0;
  for (const value of histogram) primaryMax = Math.max(primaryMax, value);
  maxValue = primaryMax;
  if (overlay) for (const value of overlay) maxValue = Math.max(maxValue, value);
  maxValue = maxValue > 0 ? maxValue * 1.12 : 1;
  const frame = drawChartFrame(ctx, width, height, range[0], range[1], 0, maxValue);

  if (overlay) {
    ctx.beginPath();
    ctx.moveTo(frame.mapX(range[0]), frame.mapY(0));
    for (let i = 0; i < HISTOGRAM_BINS; i++) {
      const x = range[0] + (i + 0.5) * (range[1] - range[0]) / HISTOGRAM_BINS;
      ctx.lineTo(frame.mapX(x), frame.mapY(overlay[i]));
    }
    ctx.lineTo(frame.mapX(range[1]), frame.mapY(0));
    ctx.closePath();
    ctx.fillStyle = "rgba(64, 202, 245, 0.17)";
    ctx.fill();
    ctx.strokeStyle = "#50cdf5";
    ctx.lineWidth = 1.4;
    ctx.stroke();
  }

  const plotWidth = frame.right - frame.left;
  const barWidth = plotWidth / HISTOGRAM_BINS;
  ctx.fillStyle = "rgba(255, 224, 112, 0.68)";
  for (let i = 0; i < HISTOGRAM_BINS; i++) {
    const x = frame.left + i * barWidth + 0.5;
    const y = frame.mapY(histogram[i]);
    ctx.fillRect(x, y, Math.max(1, barWidth - 1), frame.bottom - y);
  }
  drawVerticalReferences(ctx, frame, references, range);
  if (primaryMax <= 0) {
    ctx.fillStyle = "rgba(217, 234, 255, 0.8)";
    ctx.font = "10px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(overlay ? "No Bohmian samples in range" : "No samples in range", 0.5 * (frame.left + frame.right), 0.5 * (frame.top + frame.bottom));
  }
}

function drawTrajectoryChart(canvas, field, range, references) {
  const prepared = prepareChart(canvas);
  if (!prepared) return;
  const { ctx, width, height } = prepared;
  const firstTimes = trajectoryHistory.map((history) => history.time[0]).filter(Number.isFinite);
  const tMin = firstTimes.length ? Math.max(0, Math.min(...firstTimes)) : 0;
  const tMax = tMin > 0
    ? Math.max(simTime * 1.01, tMin + 0.1)
    : Math.max(2 * separationTime(), simTime * 1.05, 0.1);
  const frame = drawChartFrame(ctx, width, height, tMin, tMax, range[0], range[1]);
  drawHorizontalReferences(ctx, frame, references, range);

  for (let slot = 0; slot < trajectoryHistory.length; slot++) {
    const history = trajectoryHistory[slot];
    const values = history[field];
    ctx.beginPath();
    let drawing = false;
    for (let i = 0; i < history.time.length; i++) {
      const value = values[i];
      if (!Number.isFinite(value) || value < range[0] || value > range[1]) {
        drawing = false;
        continue;
      }
      const x = frame.mapX(history.time[i]);
      const y = frame.mapY(value);
      if (!drawing) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
      drawing = true;
    }
    ctx.strokeStyle = TRACK_COLORS[slot % TRACK_COLORS.length];
    ctx.lineWidth = 1.6;
    ctx.stroke();
  }
}

function updateAnalysisStatus() {
  if (!analysisStatusEl) return;
  const tau = separationTime();
  const overlap = Math.exp(-((simTime / Math.max(tau, 1e-12)) ** 2));
  const stage = simTime < 0.75 * tau ? "1 - overlapping" : simTime < 1.75 * tau ? "2 - separating" : "3 - separated";
  const cleanTime = cleanWindowTime();
  const contaminated = simTime > cleanTime;
  const zitterbewegungPeriod = PI * HBAR / Math.max(centralEnergy(), 1e-12);
  const timingWarning = simulationDt() > zitterbewegungPeriod / 12;
  const validPercent = ensembleAnalysis.total ? 100 * ensembleAnalysis.valid / ensembleAnalysis.total : 0;
  const momentumCharted = ensembleAnalysis.valid ? 100 * ensembleAnalysis.momentumInRange / ensembleAnalysis.valid : 0;
  const energyCharted = ensembleAnalysis.valid ? 100 * ensembleAnalysis.energyInRange / ensembleAnalysis.valid : 0;
  const trackLegend = trajectoryHistory.map((history, slot) => (
    `<span class="track-dot" style="background:${TRACK_COLORS[slot]}"></span>s0=${fmt(history.initialS)}`
  )).join(" ");
  analysisStatusEl.classList.toggle("is-warning", contaminated || timingWarning);
  analysisStatusEl.innerHTML = contaminated
    ? `Periodic re-entry: asymptotic comparison ended at t=${fmt(cleanTime)}. &nbsp; ${trackLegend}`
    : `Stage ${stage} · overlap≈${fmt(overlap)} · conservative clean time≈${fmt(cleanTime)} · mask kept ${fmt(validPercent)}% · charted p/E ${fmt(momentumCharted)}%/${fmt(energyCharted)}%${timingWarning ? " · lower dt to resolve fast oscillations" : ""} &nbsp; ${trackLegend}`;
}

function drawAnalysis() {
  const ranges = analysisRanges();
  const v0 = asymptoticSpeed();
  const E0 = centralEnergy();
  const p0 = HBAR * params.packetK;
  drawHistogram(chartCanvases.histVelocity, ensembleHistograms.velocity, ranges.velocity, [-v0, v0]);
  drawHistogram(chartCanvases.histMomentum, ensembleHistograms.momentum, ranges.momentum, [p0], canonicalMomentumHistogram);
  drawHistogram(chartCanvases.histEnergy, ensembleHistograms.energy, ranges.energy, [-E0, E0]);
  drawTrajectoryChart(chartCanvases.trajectoryVelocity, "velocity", ranges.velocity, [-v0, v0]);
  drawTrajectoryChart(chartCanvases.trajectoryMomentum, "momentum", ranges.momentum, [p0]);
  drawTrajectoryChart(chartCanvases.trajectoryEnergy, "energy", ranges.energy, [-E0, E0]);
  updateAnalysisStatus();
}

function refreshAnalysis() {
  computeEnsembleAnalysis();
  updateStats();
  drawAnalysis();
}

function compileShader(type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(shader) || "unknown shader error";
    gl.deleteShader(shader);
    throw new Error(log);
  }
  return shader;
}

function createProgram(vertexSource, fragmentSource) {
  const program = gl.createProgram();
  const vertex = compileShader(gl.VERTEX_SHADER, vertexSource);
  const fragment = compileShader(gl.FRAGMENT_SHADER, fragmentSource);
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  gl.deleteShader(vertex);
  gl.deleteShader(fragment);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const log = gl.getProgramInfoLog(program) || "unknown program link error";
    gl.deleteProgram(program);
    throw new Error(log);
  }
  return program;
}

function createTexture(width, height, internalFormat, format, type, filter, data = null) {
  const tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
  gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, width, height, 0, format, type, data);
  return tex;
}

function createFramebuffer(tex) {
  const fbo = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
  const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
  if (status !== gl.FRAMEBUFFER_COMPLETE) {
    throw new Error(`Incomplete WebGL framebuffer: 0x${status.toString(16)}`);
  }
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  return fbo;
}

function initWebGLRenderer() {
  const hasFloatTargets = Boolean(gl.getExtension("EXT_color_buffer_float"));
  const hasFloatLinear = Boolean(gl.getExtension("OES_texture_float_linear"));
  const dataFilter = hasFloatLinear ? gl.LINEAR : gl.NEAREST;
  trailFormat = {
    internal: hasFloatTargets ? gl.RGBA16F : gl.RGBA8,
    type: hasFloatTargets ? gl.HALF_FLOAT : gl.UNSIGNED_BYTE,
    filter: hasFloatLinear ? gl.LINEAR : gl.NEAREST,
  };

  fullscreenVao = gl.createVertexArray();
  densityProgram = createProgram(FULLSCREEN_VERT, DENSITY_FRAG);
  fadeProgram = createProgram(FULLSCREEN_VERT, TRAIL_FADE_FRAG);
  trailProgram = createProgram(FULLSCREEN_VERT, TRAIL_RENDER_FRAG);
  particleProgram = createProgram(PARTICLE_VERT, PARTICLE_FRAG);
  particleStampProgram = createProgram(PARTICLE_VERT, PARTICLE_STAMP_FRAG);

  densityTexture = createTexture(NX, NY, gl.R32F, gl.RED, gl.FLOAT, dataFilter);

  particleBuffer = gl.createBuffer();
  particleVao = gl.createVertexArray();
  gl.bindVertexArray(particleVao);
  gl.bindBuffer(gl.ARRAY_BUFFER, particleBuffer);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 4, gl.FLOAT, false, 0, 0);
  gl.bindVertexArray(null);

  gl.disable(gl.DEPTH_TEST);
  gl.disable(gl.CULL_FACE);
  gl.clearColor(0, 0, 0, 1);
}

function resizeCanvas() {
  const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
  const w = Math.max(1, Math.floor(canvas.clientWidth * dpr));
  const h = Math.max(1, Math.floor(canvas.clientHeight * dpr));
  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w;
    canvas.height = h;
    rebuildTrailTargets(w, h);
    return true;
  }
  return false;
}

function rebuildTrailTargets(width, height) {
  if (!trailFormat) return;

  for (let i = 0; i < 2; i++) {
    if (trailFbos[i]) gl.deleteFramebuffer(trailFbos[i]);
    if (trailTextures[i]) gl.deleteTexture(trailTextures[i]);
    trailTextures[i] = createTexture(
      width,
      height,
      trailFormat.internal,
      gl.RGBA,
      trailFormat.type,
      trailFormat.filter
    );
    trailFbos[i] = createFramebuffer(trailTextures[i]);
  }

  trailWidth = width;
  trailHeight = height;
  trailReadIndex = 0;
  clearTrail();
}

function clearTrail() {
  if (!trailFbos[0] || !trailFbos[1]) return;
  gl.disable(gl.BLEND);
  gl.viewport(0, 0, trailWidth, trailHeight);
  for (let i = 0; i < 2; i++) {
    gl.bindFramebuffer(gl.FRAMEBUFFER, trailFbos[i]);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
  }
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  gl.clearColor(0, 0, 0, 1);
}

function uploadDisplayDensity() {
  for (let k = 0; k < SIZE; k++) {
    displayDensityUpload[k] = params.amplitudeView ? br[k] * br[k] + bi[k] * bi[k] : density[k];
  }

  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, densityTexture);
  gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
  gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, NX, NY, gl.RED, gl.FLOAT, displayDensityUpload);
}

function uploadParticleBuffer() {
  const needed = particleCount * 4;
  if (particleUpload.length !== needed) particleUpload = new Float32Array(needed);
  for (let p = 0; p < particleCount; p++) {
    const o = p * 4;
    particleUpload[o + 0] = particleX[p];
    particleUpload[o + 1] = particleY[p];
    particleUpload[o + 2] = particleAlive[p] ? 1 : 0;
    particleUpload[o + 3] = particleTrackSlot[p];
  }

  gl.bindBuffer(gl.ARRAY_BUFFER, particleBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, particleUpload, gl.DYNAMIC_DRAW);
}

function drawFullscreen(program) {
  gl.useProgram(program);
  gl.bindVertexArray(fullscreenVao);
  gl.drawArrays(gl.TRIANGLES, 0, 3);
  gl.bindVertexArray(null);
}

function particlePixelScale() {
  return canvas.width / Math.max(1, canvas.clientWidth);
}

function drawParticlePoints(program, trail = false) {
  if (!particleCount) return;

  const scale = particlePixelScale();
  const pointSize = Math.max(2, params.dotSize * 2.35 * scale);
  const trailSize = Math.max(1, pointSize * 0.7);

  gl.useProgram(program);
  gl.bindVertexArray(particleVao);
  gl.uniform2f(gl.getUniformLocation(program, "uBoxSize"), BOX_LX, BOX_LY);
  gl.uniform1f(gl.getUniformLocation(program, "uPointSize"), pointSize);
  gl.uniform1i(gl.getUniformLocation(program, "uNumParticles"), particleCount);
  gl.uniform1f(gl.getUniformLocation(program, "uTrailWidth"), trail ? trailSize : 0);
  gl.uniform1f(gl.getUniformLocation(program, "uDotSigma"), trail ? 0.28 : 0.18);
  gl.uniform1f(gl.getUniformLocation(program, "uDotGain"), trail ? 1.0 : 0.72);

  const stampGain = gl.getUniformLocation(program, "uStampGain");
  if (stampGain !== null) gl.uniform1f(stampGain, params.trailStampGain);

  gl.drawArrays(gl.POINTS, 0, particleCount);
  gl.bindVertexArray(null);
}

function updateTrailTexture() {
  if (!trailFbos[0] || !trailFbos[1]) return;

  const src = trailReadIndex;
  const dst = 1 - src;

  gl.bindFramebuffer(gl.FRAMEBUFFER, trailFbos[dst]);
  gl.viewport(0, 0, trailWidth, trailHeight);
  gl.disable(gl.BLEND);

  gl.useProgram(fadeProgram);
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, trailTextures[src]);
  gl.uniform1i(gl.getUniformLocation(fadeProgram, "uTrail"), 0);
  const fade = Math.exp(-1 / Math.max(1, params.trailLength));
  gl.uniform1f(gl.getUniformLocation(fadeProgram, "uFade"), fade);
  drawFullscreen(fadeProgram);

  if (params.showParticles && particleCount) {
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
    drawParticlePoints(particleStampProgram, true);
    gl.disable(gl.BLEND);
  }

  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  trailReadIndex = dst;
}

function render(advanceTrails = !paused) {
  resizeCanvas();

  uploadDisplayDensity();
  if (params.showParticles) uploadParticleBuffer();
  if (params.showTrail && advanceTrails) updateTrailTexture();

  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.disable(gl.BLEND);
  gl.clearColor(0, 0, 0, 1);
  gl.clear(gl.COLOR_BUFFER_BIT);

  gl.useProgram(densityProgram);
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, densityTexture);
  gl.uniform1i(gl.getUniformLocation(densityProgram, "uDensity"), 0);
  const paperDensityScale = params.paperMode
    ? BOX_LY / (Math.sqrt(PI) * Math.max(params.packetSigma, 1e-9))
    : 1;
  gl.uniform1f(gl.getUniformLocation(densityProgram, "uDensityGain"), params.densityGain * paperDensityScale);
  gl.uniform1f(gl.getUniformLocation(densityProgram, "uDensityGamma"), params.densityGamma);
  drawFullscreen(densityProgram);

  if (params.showTrail && trailTextures[trailReadIndex]) {
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_COLOR);
    gl.useProgram(trailProgram);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, trailTextures[trailReadIndex]);
    gl.uniform1i(gl.getUniformLocation(trailProgram, "uTrail"), 0);
    gl.uniform1f(gl.getUniformLocation(trailProgram, "uGain"), params.trailVisGain);
    gl.uniform1f(gl.getUniformLocation(trailProgram, "uGamma"), params.trailVisGamma);
    drawFullscreen(trailProgram);
  }

  if (params.showParticles) {
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    drawParticlePoints(particleProgram, false);
  }

  gl.disable(gl.BLEND);
}

function updateStats() {
  if (!statsEl) return;
  const E0 = centralEnergy();
  const v0 = asymptoticSpeed();
  const tau = separationTime();
  const stage = simTime < 0.75 * tau ? 1 : simTime < 1.75 * tau ? 2 : 3;
  const metric = (label, value) => `<div class="analysis-metric" title="${label}: ${value}"><span>${label}</span><b>${value}</b></div>`;
  statsEl.innerHTML = [
    metric("time / stage", `${fmt(simTime)} / ${stage}`),
    metric("grid / box", `${NX}x${NY} / ${fmt(BOX_LX)}x${fmt(BOX_LY)}`),
    metric("p0", fmt(HBAR * params.packetK)),
    metric("v0 / E0", `${fmt(v0)} / ${fmt(E0)}`),
    metric("spectral + / -", `${fmt(diagnostics.spectralPlus)} / ${fmt(diagnostics.spectralMinus)}`),
    metric("mask / charted p,E", `${ensembleAnalysis.valid}/${ensembleAnalysis.total} / ${ensembleAnalysis.momentumInRange},${ensembleAnalysis.energyInRange}`),
    metric("pB mean / var", `${fmt(ensembleAnalysis.momentumMean)} / ${fmt(ensembleAnalysis.momentumVariance)}`),
    metric("canonical mean / var", `${fmt(canonicalAnalysis.mean)} / ${fmt(canonicalAnalysis.variance)}`),
    metric("v mean / var", `${fmt(ensembleAnalysis.velocityMean)} / ${fmt(ensembleAnalysis.velocityVariance)}`),
    metric("EB mean / var", `${fmt(ensembleAnalysis.energyMean)} / ${fmt(ensembleAnalysis.energyVariance)}`),
  ].join("");
}

function resetAll() {
  simTime = 0;
  resetWave();
  updateDensity();
  computeSpectralDiagnostics();
  rebuildParticles();
  refreshAnalysis();
}

function installDebugHooks() {
  window.DiracPacketSplitting2DTest = {
    state() {
      return {
        paused,
        simTime,
        particleCount,
        grid: { nx: NX, ny: NY, lx: BOX_LX, ly: BOX_LY, dx: DX, dy: DY },
        params: { ...params },
        diagnostics: { ...diagnostics },
        ensembleAnalysis: { ...ensembleAnalysis },
        canonicalAnalysis: { ...canonicalAnalysis },
      };
    },
    setPaused(value) {
      setPausedState(value);
      return this.state();
    },
    setParams(next, reset = false) {
      const rebuildGrid = Object.hasOwn(next, "simScale") || Object.hasOwn(next, "paperMode");
      Object.assign(params, next);
      syncControlValues();
      if (rebuildGrid) rebuildSimulationGrid();
      else if (reset) resetAll();
      else updateStats();
      return this.state();
    },
    reset() {
      resetAll();
      render();
      return this.state();
    },
    advance(frames = 1) {
      const n = Math.max(0, Math.floor(frames));
      for (let i = 0; i < n; i++) updateSimulation();
      render(n > 0);
      refreshAnalysis();
      return this.state();
    },
  };
}

resetBtn.addEventListener("click", resetAll);
function setPausedState(nextPaused) {
  paused = Boolean(nextPaused);
  pauseBtn.textContent = paused ? "Resume" : "Pause";
}

pauseBtn.addEventListener("click", () => setPausedState(!paused));

if (isEmbedded) {
  window.addEventListener("message", (event) => {
    if (event.origin !== window.location.origin) return;
    if (event.data?.type !== "qontic:set-paused" || !event.data.paused) return;
    setPausedState(true);
  });
}

window.addEventListener("keydown", (event) => {
  if (event.key === "r" || event.key === "R") resetAll();
  if (event.code === "Space") {
    event.preventDefault();
    pauseBtn.click();
  }
});

window.addEventListener("resize", () => {
  resizeCanvas();
  clearTrail();
  drawAnalysis();
});

const narrowLayoutQuery = window.matchMedia("(max-width: 959px), (max-height: 560px)");

function setUiExpanded(open) {
  uiBody.hidden = !open;
  minUiBtn.textContent = open ? "-" : "+";
}

function setAnalysisExpanded(open) {
  analysisBody.hidden = !open;
  analysisPanel.classList.toggle("is-minimized", !open);
  analysisToggle.textContent = open ? "-" : "+";
  analysisToggle.setAttribute("aria-expanded", String(open));
  if (open) {
    if (narrowLayoutQuery.matches) setUiExpanded(false);
    requestAnimationFrame(refreshAnalysis);
  }
}

minUiBtn.addEventListener("click", () => {
  const open = uiBody.hidden;
  if (open && narrowLayoutQuery.matches) setAnalysisExpanded(false);
  setUiExpanded(open);
});

function setAnalysisView(nextView) {
  analysisView = nextView === "trajectories" ? "trajectories" : "distributions";
  const showTrajectories = analysisView === "trajectories";
  trajectoryPage.hidden = !showTrajectories;
  distributionPage.hidden = showTrajectories;
  trajectoryTab.classList.toggle("is-active", showTrajectories);
  distributionTab.classList.toggle("is-active", !showTrajectories);
  trajectoryTab.setAttribute("aria-selected", String(showTrajectories));
  distributionTab.setAttribute("aria-selected", String(!showTrajectories));
  trajectoryTab.tabIndex = showTrajectories ? 0 : -1;
  distributionTab.tabIndex = showTrajectories ? -1 : 0;
  requestAnimationFrame(drawAnalysis);
}

trajectoryTab?.addEventListener("click", () => setAnalysisView("trajectories"));
distributionTab?.addEventListener("click", () => setAnalysisView("distributions"));
for (const tab of [trajectoryTab, distributionTab]) {
  tab?.addEventListener("keydown", (event) => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const nextView = event.key === "ArrowLeft" || event.key === "Home" ? "trajectories" : "distributions";
    setAnalysisView(nextView);
    (nextView === "trajectories" ? trajectoryTab : distributionTab).focus();
  });
}

analysisToggle?.addEventListener("click", () => setAnalysisExpanded(analysisBody.hidden));

if (narrowLayoutQuery.matches) setAnalysisExpanded(false);
narrowLayoutQuery.addEventListener?.("change", (event) => {
  if (event.matches) setAnalysisExpanded(false);
});

if (theoryToggle && theoryBody && theoryPanel) {
  theoryToggle.addEventListener("click", () => {
    const open = theoryBody.hidden;
    theoryBody.hidden = !open;
    theoryPanel.classList.toggle("is-minimized", !open);
    theoryToggle.textContent = open ? "-" : "+";
    theoryToggle.setAttribute("aria-expanded", String(open));
  });
}

initWebGLRenderer();
resizeCanvas();
initSimulationSpeedControl({ visible: !isEmbedded });
resetAll();
setAnalysisView("distributions");
if (debugEnabled) installDebugHooks();

let lastFrameTime = performance.now();
requestAnimationFrame(function loop(now = performance.now()) {
  const frameSeconds = Math.min(0.05, Math.max(0, (now - lastFrameTime) / 1000));
  lastFrameTime = now;
  setSimulationFrameDuration(frameSeconds);
  if (!paused) {
    updateSimulation();
  }
  render();
  if (!analysisBody.hidden && now - lastAnalysisDraw >= 100) {
    refreshAnalysis();
    lastAnalysisDraw = now;
  }
  requestAnimationFrame(loop);
});
