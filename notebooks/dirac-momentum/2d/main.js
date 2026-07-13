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

const PI = Math.PI;
const TAU = 2 * Math.PI;
const NX = 256;
const NY = 128;
const SIZE = NX * NY;
const BOX_LX = 12.0;
const BOX_LY = 6.75;
const DX = BOX_LX / NX;
const DY = BOX_LY / NY;
const HBAR = 1.0;
const PACKET_X0 = 0.5 * BOX_LX;
const PACKET_Y0 = 0.5 * BOX_LY;
const urlParams = new URLSearchParams(window.location.search);
const isEmbedded = urlParams.get("embed") === "1";
const debugEnabled = urlParams.has("debug");
if (isEmbedded) theoryPanel?.remove();

const params = {
  stepsPerFrame: 1,
  dt: 0.002,
  diracC: 6.0,
  mass: 0.5,
  packetK: 6.0,
  packetAngle: 0.0,
  packetSigma: 0.62,
  mixAngleDeg: 90.0,
  nParticles: 500,
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

const ar = new Float64Array(SIZE);
const ai = new Float64Array(SIZE);
const br = new Float64Array(SIZE);
const bi = new Float64Array(SIZE);
const density = new Float64Array(SIZE);
const velocityX = new Float64Array(SIZE);
const velocityY = new Float64Array(SIZE);
const cdf = new Float64Array(SIZE);
const kxValues = new Float64Array(NX);
const kyValues = new Float64Array(NY);

const tempR = new Float64Array(Math.max(NX, NY));
const tempI = new Float64Array(Math.max(NX, NY));

let particleX = new Float32Array(0);
let particleY = new Float32Array(0);
let particleAlive = new Uint8Array(0);

const displayDensityUpload = new Float32Array(SIZE);

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

for (let ix = 0; ix < NX; ix++) {
  const mode = ix < NX / 2 ? ix : ix - NX;
  kxValues[ix] = TAU * mode / BOX_LX;
}

for (let iy = 0; iy < NY; iy++) {
  const mode = iy < NY / 2 ? iy : iy - NY;
  kyValues[iy] = TAU * mode / BOX_LY;
}

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

function fmt(v) {
  const av = Math.abs(v);
  if (av >= 1000 || (av > 0 && av < 0.01)) return v.toExponential(2);
  return v.toFixed(3).replace(/\.?0+$/, "");
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
}

function addToggleInt(key, label, onChange = null) {
  const row = document.createElement("div");
  row.className = "row no-value";

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
}

function addToggleChoice(key, label, offText, onText, onChange = null) {
  const row = document.createElement("div");
  row.className = "row no-value";

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
}

addSectionHeader("Simulation");
addSlider("stepsPerFrame", "Steps/frame", 1, 5, 1);
addSlider("dt", "dt", 0.0005, 0.008, 0.0005);

addSectionHeader("Free Dirac Packet");
addSlider("diracC", "Dirac c", 2.0, 12.0, 0.1, resetAll);
addSlider("mass", "mass", 0.1, 2.0, 0.05, resetAll);
addSlider("packetK", "mean k", 1.0, 12.0, 0.1, resetAll);
addSlider("packetAngle", "k angle deg", -180.0, 180.0, 1.0, resetAll);
addSlider("packetSigma", "packet width", 0.30, 1.40, 0.01, resetAll);
addSlider("mixAngleDeg", "±E mix angle", 0.0, 180.0, 1.0, resetAll);

addSectionHeader("Visual Parameters");
addSlider("densityGain", "density gain", 0.4, 8.0, 0.1);
addSlider("densityGamma", "density gamma", 0.25, 1.2, 0.05);
addToggleChoice("amplitudeView", "amp view", "Total", "Lower");
addToggleInt("showParticles", "show particles");
addToggleInt("showTrail", "draw trails", (value) => { if (!value) clearTrail(); });
addSlider("nParticles", "particle count", 1, 2000, 10, rebuildParticles);
addSlider("dotSize", "particle size", 2.0, 10.0, 1);
addSlider("trailLength", "trail length", 2.0, 40.0, 1);

function packetWaveVector() {
  const angle = params.packetAngle * PI / 180;
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

function centralBranchWeights() {
  const chi = params.mixAngleDeg * PI / 180;
  return {
    plus: 0.5 * (1 + Math.cos(chi)),
    minus: 0.5 * (1 - Math.cos(chi)),
  };
}

function fixedInitialSpinor() {
  // Central Dirac Hamiltonian direction h-hat.
  const { ux, uy } = packetWaveVector();
  const c = Math.max(params.diracC, 1e-9);
  const M = Math.max(params.mass, 1e-9) * c * c;
  const cp = HBAR * c * Math.max(params.packetK, 1e-12);
  const E = Math.sqrt(cp * cp + M * M);
  const q = cp / Math.max(E, 1e-12);
  const r = M / Math.max(E, 1e-12);

  const h = { x: q * ux, y: q * uy, z: r };
  // Unit vector in the (k,z) plane orthogonal to h.
  const p = { x: r * ux, y: r * uy, z: -q };
  const chi = params.mixAngleDeg * PI / 180;
  const cc = Math.cos(chi);
  const ss = Math.sin(chi);

  let nx = cc * h.x + ss * p.x;
  let ny = cc * h.y + ss * p.y;
  let nz = cc * h.z + ss * p.z;
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

  for (let iy = 0; iy < NY; iy++) {
    const y = (iy + 0.5) * DY;
    for (let ix = 0; ix < NX; ix++) {
      const x = (ix + 0.5) * DX;
      const dx = (x - PACKET_X0) / sigma;
      const dy = (y - PACKET_Y0) / sigma;
      const env = Math.exp(-0.5 * (dx * dx + dy * dy));
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

      pPlus += wp;
      pMinus += wm;
      kPlus += wp * kPar;
      kMinus += wm * kPar;
      ePlus += wp * E;
      eMinus += wm * (-E);
    }
  }

  const total = Math.max(pPlus + pMinus, 1e-30);
  diagnostics.spectralPlus = pPlus / total;
  diagnostics.spectralMinus = pMinus / total;
  diagnostics.meanKPlus = kPlus / Math.max(pPlus, 1e-30);
  diagnostics.meanKMinus = kMinus / Math.max(pMinus, 1e-30);
  diagnostics.meanEPlus = ePlus / Math.max(pPlus, 1e-30);
  diagnostics.meanEMinus = eMinus / Math.max(pMinus, 1e-30);
}

function updateDensityVelocity() {
  const c = Math.max(params.diracC, 1e-9);
  let total = 0;
  let maxRho = 0;

  for (let iy = 0; iy < NY; iy++) {
    for (let ix = 0; ix < NX; ix++) {
      const k = index(ix, iy);
      const rho = ar[k] * ar[k] + ai[k] * ai[k] + br[k] * br[k] + bi[k] * bi[k];
      const jx = 2 * c * (ar[k] * br[k] + ai[k] * bi[k]);
      const jy = 2 * c * (ar[k] * bi[k] - ai[k] * br[k]);
      const p = rho * DX * DY;

      density[k] = rho;
      velocityX[k] = jx / Math.max(rho, 1e-14);
      velocityY[k] = jy / Math.max(rho, 1e-14);
      total += p;
      maxRho = Math.max(maxRho, rho);
    }
  }

  const { ux, uy } = packetWaveVector();
  let alive = 0;
  let particleForward = 0;
  let particleBackward = 0;
  let particleTransverse = 0;
  const threshold = 0.02 * Math.max(params.diracC, 1e-9);

  for (let p = 0; p < particleCount; p++) {
    if (!particleAlive[p]) continue;
    alive++;
    const v = sampleVelocity(particleX[p], particleY[p]);
    const vp = v.x * ux + v.y * uy;
    if (vp > threshold) particleForward++;
    else if (vp < -threshold) particleBackward++;
    else particleTransverse++;
  }

  const central = centralBranchWeights();
  diagnostics.total = total;
  diagnostics.maxRho = Math.max(maxRho, 1e-12);
  diagnostics.aliveParticles = alive;
  diagnostics.particleForward = particleForward;
  diagnostics.particleBackward = particleBackward;
  diagnostics.particleTransverse = particleTransverse;
  diagnostics.centralPlus = central.plus;
  diagnostics.centralMinus = central.minus;
}

function rebuildParticleBuffers() {
  particleCount = Math.max(0, Math.floor(params.nParticles));
  particleX = new Float32Array(particleCount);
  particleY = new Float32Array(particleCount);
  particleAlive = new Uint8Array(particleCount);
}

function rebuildParticles() {
  updateDensityVelocity();
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
    particleAlive[p] = 1;
  }

  clearTrail();
  updateDensityVelocity();
}

function sampleVelocity(x, y) {
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

  return {
    x: velocityX[k00] * w00 + velocityX[k10] * w10 + velocityX[k01] * w01 + velocityX[k11] * w11,
    y: velocityY[k00] * w00 + velocityY[k10] * w10 + velocityY[k01] * w01 + velocityY[k11] * w11,
  };
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
    particleX[p] = wrapValue(x + v2.x * dt, BOX_LX);
    particleY[p] = wrapValue(y + v2.y * dt, BOX_LY);
  }
}

function updateSimulation() {
  const steps = simulationStepsPerFrame();
  const dt = simulationDt();
  for (let s = 0; s < steps; s++) {
    stepWave(dt);
    updateDensityVelocity();
    updateParticles(dt);
    simTime += dt;
  }
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
    particleUpload[o + 3] = 0;
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
  gl.uniform1f(gl.getUniformLocation(densityProgram, "uDensityGain"), params.densityGain);
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
  statsEl.innerHTML =
    `<b>E0</b>: ${fmt(E0)} &nbsp; <b>v0</b>: ${fmt(v0)} &nbsp; <b>t</b>: ${fmt(simTime)}<br>` +
    `<b>central w+</b>: ${fmt(diagnostics.centralPlus)} &nbsp; <b>w-</b>: ${fmt(diagnostics.centralMinus)}<br>` +
    `<b>spectral P+</b>: ${fmt(diagnostics.spectralPlus)} &nbsp; <b>P-</b>: ${fmt(diagnostics.spectralMinus)}<br>` +
    `<b>&lt;k∥&gt;+</b>: ${fmt(diagnostics.meanKPlus)} &nbsp; <b>&lt;k∥&gt;-</b>: ${fmt(diagnostics.meanKMinus)}<br>` +
    `<b>particles v∥ + / -</b>: ${diagnostics.particleForward} / ${diagnostics.particleBackward} &nbsp; ` +
    `<b>near 0</b>: ${diagnostics.particleTransverse}<br>` +
    `<b>P</b>: ${fmt(diagnostics.total)} &nbsp; <b>BC</b>: periodic torus &nbsp; ` +
    `<b>view</b>: ${params.amplitudeView ? "Lower" : "Total"}`;
}

function resetAll() {
  simTime = 0;
  resetWave();
  updateDensityVelocity();
  computeSpectralDiagnostics();
  rebuildParticles();
  updateStats();
}

function installDebugHooks() {
  window.DiracPacketSplitting2DTest = {
    state() {
      return {
        paused,
        simTime,
        particleCount,
        params: { ...params },
        diagnostics: { ...diagnostics },
      };
    },
    setPaused(value) {
      setPausedState(value);
      return this.state();
    },
    setParams(next, reset = false) {
      Object.assign(params, next);
      if (reset) resetAll();
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
      updateStats();
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
});

minUiBtn.addEventListener("click", () => {
  const hidden = uiBody.hidden;
  uiBody.hidden = !hidden;
  minUiBtn.textContent = hidden ? "-" : "+";
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
if (debugEnabled) installDebugHooks();

let lastFrameTime = performance.now();
requestAnimationFrame(function loop(now = performance.now()) {
  const frameSeconds = Math.min(0.05, Math.max(0, (now - lastFrameTime) / 1000));
  lastFrameTime = now;
  setSimulationFrameDuration(frameSeconds);
  if (!paused) updateSimulation();
  render();
  updateStats();
  requestAnimationFrame(loop);
});
