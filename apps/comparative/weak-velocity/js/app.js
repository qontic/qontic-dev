import '../../../../shared/qontic-controls.js?v=3.2';
import { mountQonticShell } from '../../../../shared/qontic-shell.js?v=3.7';
import { mountQonticMedia } from '../../../../shared/qontic-media.js?v=3.0';
import { mountCoordinateTools, mountDistanceScale } from '../../../../shared/qontic-overlays.js?v=6';
import { mountQonticShortcuts } from '../../../../shared/qontic-shortcuts.js?v=1';
import { APP_RELEASE } from './release.js?v=0.5.3';
import * as M from './weak-model.js?v=0.5.3';
import { maximumCoreSafeSeparation, sourceTransverse } from '../../double-slit-analytical/js/source-packet-model.js?cache=20261101';

mountQonticShell({
  title: 'Weak Velocity in the Double Slit',
  eyebrow: 'Q-Ontic · Double Slit',
  navigation: 'breadcrumbs',
  purpose: 'A weak position measurement followed by a strong one, repeated many times behind a double slit. Averaging the weak readings over runs with the same strong result gives a velocity at each point; connecting the velocities gives lines.',
  badge: 'Weak values',
  version: `Weak Velocity · Version ${APP_RELEASE.version} · ${APP_RELEASE.date}`,
  homeHref: '../../../index.html',
});

// ---------------------------------------------------------------- model (units of 100 nm)
// Geometry in nm, with the analytical double-slit app's ranges and limits.
// screen = length of the screen (and of the transverse range shown and binned).
const GEO_DEFAULT = Object.freeze({ wavelength: 50, slitWidth: 30, separation: 300, wall: 225, distance: 1000, screen: 800, sourceWidth: 200 });
const geo = { ...GEO_DEFAULT };
const SLIT_EXTENT = 1.5;     // drawn opening ±1.5σ, as in the double-slit app
let p, T0, Y_HALF;
function applyGeometry() {
  p = M.modelParams(geo);
  T0 = M.wallTerms(p);
  Y_HALF = geo.screen / 200;
  waveTheme = null;
}
const RUNS = [1e4, 2e4, 5e4, 1e5, 2e5, 5e5, 1e6, 2e6, 5e6, 1e7];   // runs per pair of planes (slider)
const fmtRuns = (n) => (n >= 1e6 ? `${n / 1e6}M` : `${n / 1e3}k`);
const N_BINS = 40;           // strips across the screen (20 nm for an 800 nm screen)
const N_PLANES = 12;
const SCATTER_N = 4000;
const PLANE_POINTS = 6000; // runs kept as points beside the planes
const MANY_SECONDS = 6;     // stage 2 collection time at speed 1
const nm = (u) => u * 100;
// 1, 2 or 5 times a power of ten, close to x.
function niceStep(x) { const e = 10 ** Math.floor(Math.log10(x)), f = x / e; return (f < 1.5 ? 1 : f < 3.5 ? 2 : f < 7.5 ? 5 : 10) * e; }

const $ = (s) => document.querySelector(s);
const canvas = $('#stage');
const mainCtx = canvas.getContext('2d');
let ctx = mainCtx;
const controlsEl = $('qontic-controls');

const state = {
  stage: 'one', sw: 200, x1: 500, gap: 50, perPlane: 1e6,
  running: false, speed: 1,
  waveMode: 'density', arrowEvery: 1, nLines: 20,
  show: { wave: true, arrows: true, lines: true, current: true, expected: true, bohm: false, scatter: true, planeRuns: true },
  selected: null, shiftView: false,
};
let exp = null;              // current pair of planes
let map = null;              // stage 3 state
let anim = null;             // stage 1 run animation
let pending = true;          // rebuild needed
let waveTheme = null;
let lastLive = 0, lastLiveHtml = '';
// Values the link asked for, to report any that had to be adjusted.
const urlAsked = {};
let urlNote = '', urlBadStage = null;

readUrl();
applyGeometry();

// ---------------------------------------------------------------- experiment at one pair of planes
function makeExperiment(x1nm) {
  const x1 = p.wall + x1nm / 100, dtau = state.gap / 100 / p.k;
  const terms1 = M.propagate(T0, (x1 - p.wall) / p.k);
  const terms2 = M.propagate(terms1, dtau);
  const table = M.jointTable({ terms1, dtau, sw: state.sw / 100, yfMin: -Y_HALF, yfMax: Y_HALF, nYf: 360 });
  const bins = M.makeBins(-Y_HALF, Y_HALF, N_BINS);
  const expected = M.expectedBinVelocities(table, bins);
  // Fine curves (slopes v_y / v_x) for the velocity plot.
  const rhoMax = Math.max(...Array.from(table.marginal));
  const expCurve = [], curCurve = [], rho = [];
  for (let i = 0; i < table.nYf; i++) {
    const y = table.yf[i], r = M.density(terms2, y);
    rho.push([y, r]);
    curCurve.push([y, M.currentVelocity(terms2, y) / p.k]);
    if (table.marginal[i] > 0.02 * rhoMax) expCurve.push([y, (y - table.meanY[i]) / dtau / p.k]);
    else expCurve.push([y, null]);
  }
  const rMax = Math.max(...rho.map((a) => a[1]));
  // Plot range from the current velocity where the wave is not negligible.
  let vmax = 0.05;
  // Plot range from both curves (the exact curve for a strong pointer can exceed j/|psi|^2).
  for (let i = 0; i < rho.length; i++) if (rho[i][1] > 0.05 * rMax) vmax = Math.max(vmax, Math.abs(curCurve[i][1]), Math.abs(expCurve[i][1] ?? 0));
  const binCur = []; // density-weighted current slope per strip
  for (let b = 0; b < N_BINS; b++) {
    let s = 0, sv = 0;
    for (let j = 0; j < 20; j++) {
      const y = -Y_HALF + (b + (j + 0.5) / 20) * bins.w, r = M.density(terms2, y);
      s += r; sv += r * M.currentVelocity(terms2, y) / p.k;
    }
    binCur.push(s > 0 ? sv / s : null);
  }
  return {
    x1, x2: x1 + state.gap / 100, dtau, terms1, terms2, table, bins, expected, expCurve, curCurve, rho, rMax,
    vmax: vmax * 1.25, binCur, runs: 0,
    scatter: new Float32Array(SCATTER_N * 2), scatterN: 0, scatterHead: 0,
    ptsY: new Float32Array(PLANE_POINTS), ptsYf: new Float32Array(PLANE_POINTS), ptsU: new Float32Array(PLANE_POINTS), ptsN: 0,
  };
}

// Stage 1 keeps every run as a point; later stages keep one run in `stride`.
const pointStride = () => (state.stage === 'one' ? 1 : Math.max(1, Math.floor(state.perPlane / PLANE_POINTS)));
function addRun(e, run) {
  hadRun = true;
  M.addToBins(e.bins, run);
  // Points beside the planes: one run in every `stride`, so they fill in over the
  // whole collection and finish with it (6 000 points at the end).
  const stride = pointStride();
  if (e.runs % stride === 0 && e.ptsN < PLANE_POINTS) { e.ptsY[e.ptsN] = run.Y; e.ptsYf[e.ptsN] = run.yf; e.ptsU[e.ptsN] = Math.random(); e.ptsN++; }
  e.runs++;
  e.scatter[e.scatterHead * 2] = run.yf; e.scatter[e.scatterHead * 2 + 1] = run.Y;
  e.scatterHead = (e.scatterHead + 1) % SCATTER_N; e.scatterN = Math.min(SCATTER_N, e.scatterN + 1);
}

function planeX1(i) { const d = geo.distance; return 0.02 * d + i * (d - state.gap - 0.02 * d) / (N_PLANES - 1); }

function rebuild() {
  pending = false;
  anim = null; lastRun = null;
  if (state.stage === 'map') {
    map = { index: 0, planes: [], done: false, lines: null, bohm: null };
    exp = makeExperiment(planeX1(0));
  } else {
    map = null;
    exp = makeExperiment(state.x1);
  }
  // Default strip: one where the signal is well above the noise (300–320 nm by default).
  if (state.selected === null) state.selected = binOf(Math.min(3.05, Y_HALF * 0.76));
  updateText();
}
const binOf = (y) => Math.max(0, Math.min(N_BINS - 1, Math.floor((y + Y_HALF) / (2 * Y_HALF / N_BINS))));

// ---------------------------------------------------------------- stage 3: finish a plane, build lines
function finishPlane() {
  const est = M.binVelocities(exp.bins, exp.dtau, 200).map((b) => (b ? { y: b.y, s: b.v / p.k, err: b.err / p.k, n: b.n } : null));
  map.planes.push({ x2: exp.x2, est, counts: Array.from(exp.bins.count) });
  map.index++;
  if (map.index < N_PLANES) { exp = makeExperiment(planeX1(map.index)); return; }
  map.done = true;
  buildLines();
  stop();
  showNext();
}

function fieldFor(plane) {
  const pts = plane.est.map((e, i) => (e ? { i, y: e.y, s: e.s } : null));
  return (y) => {
    let a = null, b = null;
    for (const q of pts) { if (!q) continue; if (q.y <= y) a = q; else { b = q; break; } }
    if (!a || !b || b.i !== a.i + 1) {
      // allow a gap of one missing strip
      if (!a || !b || b.i - a.i > 2) return null;
    }
    return a.s + (b.s - a.s) * (y - a.y) / (b.y - a.y);
  };
}

function buildLines() {
  const planes = map.planes.map((pl) => ({ x: pl.x2, vAt: fieldFor(pl) }));
  // Starting points at equal-probability positions in the first strong plane.
  const counts = map.planes[0].counts, total = counts.reduce((a, b) => a + b, 0), w = 2 * Y_HALF / N_BINS;
  const starts = [], keptQ = [];
  const nLines = state.nLines; // even, so no start falls on the median between the two slit packets
  for (let q = 0; q < nLines; q++) {
    let target = (q + 0.5) / nLines * total, acc = 0;
    for (let i = 0; i < N_BINS; i++) {
      if (acc + counts[i] >= target) { starts.push(-Y_HALF + (i + (target - acc) / Math.max(1, counts[i])) * w); keptQ.push(q); break; }
      acc += counts[i];
    }
  }
  const x0 = planes[0].x, xEnd = planes.at(-1).x;
  // Keep only starts where the first plane has a measured velocity.
  for (let i = starts.length - 1; i >= 0; i--) if (planes[0].vAt(starts[i]) === null) { starts.splice(i, 1); keptQ.splice(i, 1); }
  map.lines = starts.map((y0) => M.integrateField(planes, 1, y0, x0, xEnd, 300));
  map.bohm = starts.map((y0) => M.bohmTrajectory(T0, p.k, p.wall, y0, xEnd, 300, x0));
  // Equal-probability positions of |psi|^2 on the screen, for the check. The
  // starts are quantiles of (nearly) all the probability at the first strong
  // plane, so the screen quantiles are taken over the whole wave, not only the
  // part on the screen (integrated far enough that the tails do not matter).
  const tS = M.propagate(T0, (p.screen - p.wall) / p.k), ys = [], cum = [];
  const R = Math.max(4 * Y_HALF, Y_HALF + 10), NQ = 4000;
  let s = 0;
  for (let i = 0; i <= NQ; i++) { const y = -R + i * 2 * R / NQ; s += M.density(tS, y); ys.push(y); cum.push(s); }
  const all = Array.from({ length: nLines }, (_, q) => { const t = (q + 0.5) / nLines * s; const i = cum.findIndex((c) => c >= t); return ys[Math.max(0, i)]; });
  // Keep the quantiles that belong to the lines that were kept.
  map.screenQuantiles = all.filter((_, q) => keptQ.includes(q));
  // Mean offset (rms, nm) of the line ends from the equal-probability positions.
  let se = 0, ne = 0;
  map.lines.forEach((ln, i) => { const [xe, ye] = ln.at(-1); if (Math.abs(xe - xEnd) < 0.05 && map.screenQuantiles[i] != null && Math.abs(xEnd - p.screen) < 0.6) { se += nm(ye - map.screenQuantiles[i]) ** 2; ne++; } });
  map.endOffset = ne ? Math.sqrt(se / ne) : null;
}

// ---------------------------------------------------------------- text
const fmtNm = (u, d = 0) => `${nm(u).toFixed(d)} nm`;
const fmtS = (s, d = 3) => (s === null || !Number.isFinite(s) ? '—' : (s >= 0 ? '+' : '−') + Math.abs(s).toFixed(d));

function updateText() {
  $('#swOut').value = `${state.sw} nm`;
  $('#x1Out').value = `${state.x1} nm`;
  $('#gapOut').value = `${state.gap} nm`;
  $('#swHint').textContent = state.sw >= 100
    ? 'Weak: one reading tells almost nothing about where the particle is, and the wave is barely disturbed.'
    : state.sw >= 40
      ? 'Intermediate: readings are sharper and the wave is slightly disturbed.'
      : 'Strong: each reading is precise, but the coupling disturbs the wave. Compare the green and dashed curves.';
  // Numbers in the Physics tab that follow the geometry.
  document.querySelectorAll('[data-strip-width]').forEach((el) => { el.textContent = `${Number((geo.screen / N_BINS).toPrecision(3))} nm`; });
  document.querySelectorAll('[data-screen-half]').forEach((el) => { el.textContent = `${geo.screen / 2}`; });
  $('#x1Row').style.display = state.stage === 'map' ? 'none' : '';
  $('#runsRow').style.display = state.stage === 'one' ? 'none' : '';
  document.querySelectorAll('[data-stage]').forEach((b) => {
    const on = b.dataset.stage === state.stage;
    b.classList.toggle('active', on); b.setAttribute('aria-pressed', String(on));
  });
}

const plural = (n, one, many) => `${n.toLocaleString('en-US')} ${n === 1 ? one : many}`;
const SELECT_HINT = 'To post-select a strip, point at (or tap) the strong plane on the drawing, or click either plot.';
const RATIONALE_LINK = '<button type="button" class="link-button" data-goto="rationale">Same lines, three readings: see Rationale</button>';
function liveText() {
  if (!exp) return '';
  // A note about an adjusted link stays until the first run.
  const note = urlNote && !hadRun ? `<span class="url-note">${urlNote}</span> ` : '';
  return note + liveBody();
}
let hadRun = false;
function liveBody() {
  const N = exp.runs.toLocaleString('en-US');
  if (state.stage === 'one') {
    if (exp.runs === 0) return 'Press <b>Start</b>. Watch the pointer move, then the screen click. One run gives two numbers.';
    const spread = state.sw >= 300
      ? 'The spread is wider than the whole pattern, so one reading says almost nothing on its own, and the wave is barely disturbed.'
      : state.sw >= 100
        ? 'The spread is comparable to the whole pattern, so one reading says little on its own, and the wave is barely disturbed.'
      : state.sw >= 40
        ? 'The spread is a fair part of the pattern: the reading is sharper, and the wave is slightly disturbed.'
        : 'The spread is small, so the coupling is nearly a position measurement; in exchange it disturbs the wave (see beyond the weak plane).';
    return `${plural(exp.runs, 'run', 'runs')}. The amber marker on the weak plane's scale is the pointer reading, with its spread of ±${state.sw} nm. It is a reading of the pointer, not a sighting of the particle. ${spread}`;
  }
  if (state.stage === 'many') {
    const b = M.binVelocities(exp.bins, exp.dtau)[state.selected];
    const bw = 2 * Y_HALF / N_BINS, strip = `${nm(-Y_HALF + state.selected * bw).toFixed(0)} to ${nm(-Y_HALF + (state.selected + 1) * bw).toFixed(0)} nm`;
    const head = `${N} of ${state.perPlane.toLocaleString('en-US')} runs.`;
    if (!b) return `${head} ${exp.runs ? 'Too few runs in the selected strip yet.' : 'Press <b>Start</b>.'} ${SELECT_HINT}`;
    // Neutral wording: two averages over the same post-selected runs, not a path.
    const shift = nm(b.v * exp.dtau), err = nm(b.err * exp.dtau), mY = nm(b.y - b.v * exp.dtau);
    const done = exp.runs >= state.perPlane ? ' Error bars are one standard deviation: about one strip in three should miss the prediction by more than its bar.' : '';
    return `${head} Beside the planes: pointer readings (amber) and detections (cyan), one point per run. ${SELECT_HINT} For the runs detected in the strip ${strip} (mean ${nm(b.y).toFixed(1)} nm), the mean pointer reading is <b>${mY.toFixed(1)} nm</b>. Detection minus pointer mean, ${shift >= 0 ? '+' : '−'}${Math.abs(shift).toFixed(1)} ± ${err.toFixed(1)} nm, divided by the ${state.gap} nm gap is the velocity estimate. It is a difference of two averages over the same selected runs, not the path of any particle.${done}`;
  }
  if (map && !map.done) return `Plane pair ${map.index + 1} of ${N_PLANES}: ${N} of ${state.perPlane.toLocaleString('en-US')} runs. Each pair of planes is a separate experiment with fresh particles.`;
  if (map && map.done) {
    const lastX = nm(exp.x2 - p.wall).toFixed(0);
    const plots = ` The plots and Results show the last pair (strong plane ${lastX} nm behind the slits); click a plot to choose a strip.`;
    if (state.sw < 40) return `All ${N_PLANES} plane pairs mapped with a strong pointer (${state.sw} nm), each with fresh particles. The coupling disturbs the wave, so the arrows follow the green curve, not j/|ψ|². These lines do not describe the undisturbed experiment in any of the three views: compare with the weak pointer.${map.endOffset != null ? ` Their ends miss the equal-probability positions of |ψ|² by ${map.endOffset.toFixed(0)} nm (rms).` : ''}${plots} ${RATIONALE_LINK}`;
    const off = map.endOffset != null ? ` The line ends differ from those positions by ${map.endOffset.toFixed(0)} nm (rms). With infinitely many runs this would be about 4 nm, from the 12 planes and the strip width; the rest is statistical and shrinks with more runs per plane pair.` : '';
    return `All ${N_PLANES} plane pairs mapped, each with fresh particles. The amber lines join the measured arrows. If the arrows are right, their ends on the screen (amber ticks, right) sit at equal-probability positions of |ψ|² (grey ticks), as for any flow of |ψ|².${off} Agreement checks the measurement, not an interpretation.${plots} ${RATIONALE_LINK}`;
  }
  return '';
}

function showNext() {
  const box = $('#nextSteps');
  box.innerHTML = '';
  const add = (label, fn) => { const b = document.createElement('button'); b.type = 'button'; b.className = label.startsWith('Next') ? 'qontic-app-toggle wv-next' : 'qontic-app-toggle'; b.textContent = label; b.addEventListener('click', fn); box.append(b); };
  if (state.stage === 'one') add('Next: many runs', () => setStage('many', true));
  if (state.stage === 'many' && exp && exp.runs >= state.perPlane) add('Repeat these runs (new sample)', () => { pending = true; start(); });
  if (state.stage === 'many') add('Next: map the field', () => setStage('map', true));
  if (state.stage === 'map' && map?.done) {
    if (state.sw >= 40) add('Repeat with a strong pointer (10 nm)', () => { setSw(10); setStage('map', true); });
    else add('Repeat with a weak pointer (200 nm)', () => { setSw(200); setStage('map', true); });
  }
}

function showStep(step) {
  $('#setupStep').classList.toggle('hidden', step !== 'setup');
  $('#liveStep').classList.toggle('hidden', step === 'setup');
  if (step !== 'setup') showNext();
}

// ---------------------------------------------------------------- controls
function setStage(stage, go = false) {
  state.stage = stage; pending = true; stop(); showStep('live');
  if (go) start();
  updateText();
}
function setSw(v) { state.sw = v; $('#sw').value = v; }
function toggle(key) {
  state.show[key] = !state.show[key];
  document.querySelector(`[data-maptoggle="${key}"]`)?.setAttribute('aria-pressed', String(state.show[key]));
  document.querySelector(`[data-toggle="${key}"]`)?.setAttribute('aria-pressed', String(state.show[key]));
}

document.querySelectorAll('[data-stage]').forEach((b) => b.addEventListener('click', () => setStage(b.dataset.stage)));
document.querySelectorAll('[data-wavemode]').forEach((b) => b.addEventListener('click', () => {
  state.waveMode = b.dataset.wavemode;
  document.querySelectorAll('[data-wavemode]').forEach((o) => { const on = o === b; o.classList.toggle('active', on); o.setAttribute('aria-pressed', String(on)); });
}));
document.querySelectorAll('[data-toggle]').forEach((b) => b.addEventListener('click', () => { toggle(b.dataset.toggle); if (state.stage === 'map') showNext(); }));
$('#sw').addEventListener('input', (e) => { state.sw = +e.target.value; pending = true; updateText(); });
$('#x1').addEventListener('input', (e) => { state.x1 = +e.target.value; if (state.stage !== 'map') pending = true; updateText(); });
$('#gap').addEventListener('input', (e) => { state.gap = +e.target.value; pending = true; updateText(); });
$('#perPlane').addEventListener('input', (e) => {
  state.perPlane = RUNS[+e.target.value]; $('#perPlaneOut').value = fmtRuns(state.perPlane);
});
$('#perPlane').addEventListener('change', () => { if (state.stage === 'map' || (exp && exp.runs > state.perPlane)) pending = true; });
// Slider left = fewest arrows (every 5th strip), right = all 40, like the Lines slider.
$('#arrowDensity').addEventListener('input', (e) => { state.arrowEvery = 6 - +e.target.value; $('#arrowDensityOut').value = Math.ceil(N_BINS / state.arrowEvery); });
$('#lineCount').addEventListener('input', (e) => { state.nLines = +e.target.value; $('#lineCountOut').value = state.nLines; if (map?.done) buildLines(); });
document.querySelectorAll('[data-maptoggle]').forEach((b) => b.addEventListener('click', () => toggle(b.dataset.maptoggle)));
$('#showSetup').addEventListener('click', () => { stop(); showStep('setup'); });
$('#setupGo').addEventListener('click', () => setStage('one', true));

// Phones: a small bar fixed at the bottom of the window, so Start is always in reach.
const mobileRun = $('#mobileRun');
function syncMobileRun() { mobileRun.textContent = state.running ? '❚❚ Stop' : '▶ Start'; mobileRun.setAttribute('aria-pressed', String(state.running)); }
function stop() { state.running = false; controlsEl.setAttribute('running', 'false'); syncMobileRun(); }
function start() {
  if (map?.done) pending = true;
  if (state.stage === 'many' && exp && exp.runs >= state.perPlane) pending = true;
  state.running = true; controlsEl.setAttribute('running', 'true'); showStep('live'); syncMobileRun();
}
mobileRun.addEventListener('click', () => (state.running ? stop() : start()));
$('#mobileReset').addEventListener('click', () => { stop(); pending = true; });
$('#mobileControls').addEventListener('click', () => $('.qontic-sidebar').scrollIntoView({ behavior: 'smooth', block: 'start' }));
controlsEl.addEventListener('qontic:start', () => start());
controlsEl.addEventListener('qontic:stop', () => stop());
controlsEl.addEventListener('qontic:reset', () => { stop(); pending = true; });
controlsEl.addEventListener('qontic:speed', (e) => { state.speed = e.detail.speed; });
controlsEl.addEventListener('qontic:theme', () => { waveTheme = null; if (waveGrid) waveGrid.dirty = true; });
controlsEl.addEventListener('qontic:tab', (e) => {
  controlsEl.setAttribute('active-tab', e.detail.tab);
  document.querySelectorAll('[data-control-pane]').forEach((pn) => pn.classList.toggle('hidden', pn.dataset.controlPane !== e.detail.tab));
});
// Links in the caption that open another tab ("see Rationale").
document.addEventListener('click', (event) => {
  const g = event.target.closest('[data-goto]');
  if (g) { document.querySelector(`.tabs [data-view="${g.dataset.goto}"]`)?.click(); window.scrollTo({ top: 0, behavior: 'smooth' }); }
});
document.querySelector('.tabs').addEventListener('click', (event) => {
  const button = event.target.closest('[data-view]');
  if (!button) return;
  document.querySelectorAll('.tabs [data-view]').forEach((b) => b.classList.toggle('active', b === button));
  document.querySelectorAll('[data-panel]').forEach((pn) => pn.classList.toggle('hidden', pn.dataset.panel !== button.dataset.view));
  if (button.dataset.view !== 'sim') stop();
});
(() => {
  const panel = $('[data-results-panel]');
  panel.querySelector('[data-results-collapse]').addEventListener('click', (e) => {
    const body = panel.querySelector('.results-body');
    body.hidden = !body.hidden;
    e.currentTarget.textContent = body.hidden ? '+' : '−';
  });
})();

// ---------------------------------------------------------------- plot column
// The two plots sit in a column to the right of the drawing. Each can be
// minimized or closed; with both closed the drawing takes the full width.
const host = $('.canvas-host'), sideCol = $('.side-col'), split = $('.col-split');
const PANEL_KEY = 'qontic-weak-velocity-plots-2';
const panels = {};
document.querySelectorAll('.float-panel').forEach((el) => { panels[el.dataset.fp] = { el, cv: el.querySelector('.fp-canvas'), open: true, min: false }; });
let colWidth = null;
const stacked = () => getComputedStyle(host).flexDirection === 'column';
// Default split: drawing 2/3, plots 1/3 of the space beside the sidebar.
function defaultColWidth() { return Math.round((host.clientWidth - 8) / 3); }
function setColWidth(w) {
  const max = Math.max(260, host.clientWidth * 0.6);
  colWidth = Math.round(Math.max(260, Math.min(max, w)));
  host.style.setProperty('--wv-col', `${colWidth}px`);
}
function savePanels() {
  try {
    const out = { width: colWidth };
    for (const [k, pn] of Object.entries(panels)) out[k] = { open: pn.open, min: pn.min };
    localStorage.setItem(PANEL_KEY, JSON.stringify(out));
  } catch (e) { /* storage unavailable */ }
}
function loadPanels(useSaved = true) {
  let saved = null;
  if (useSaved) { try { saved = JSON.parse(localStorage.getItem(PANEL_KEY) || 'null'); } catch (e) { saved = null; } }
  setColWidth(saved?.width ?? defaultColWidth());
  for (const k of Object.keys(panels)) { panels[k].open = saved?.[k]?.open ?? panels[k].open; panels[k].min = saved?.[k]?.min ?? false; applyPanelState(k); }
}
function applyPanelState(k) {
  const pn = panels[k];
  pn.el.hidden = !pn.open;
  pn.el.classList.toggle('minimized', pn.min);
  const mb = pn.el.querySelector('[data-fp-act="min"]');
  mb.textContent = pn.min ? '+' : '–'; mb.title = pn.min ? 'Restore' : 'Minimize';
  document.querySelector(`[data-fp-open="${k}"]`).hidden = pn.open;
  document.querySelector(`[data-panel-toggle="${k}"]`).setAttribute('aria-pressed', String(pn.open));
  const any = Object.values(panels).some((p2) => p2.open);
  sideCol.hidden = !any; split.hidden = !any;
}
function setPanelOpen(k, open) { panels[k].open = open; applyPanelState(k); savePanels(); }
for (const [k, pn] of Object.entries(panels)) {
  pn.el.querySelector('[data-fp-act="close"]').addEventListener('click', () => setPanelOpen(k, false));
  pn.el.querySelector('[data-fp-act="min"]').addEventListener('click', () => { pn.min = !pn.min; applyPanelState(k); savePanels(); });
  pn.el.querySelector('[data-fp-act="shift"]')?.addEventListener('click', (e) => { state.shiftView = !state.shiftView; e.currentTarget.setAttribute('aria-pressed', String(state.shiftView)); updateTitles(); });
  // Click a strip in the plot to post-select on it.
  pn.cv.addEventListener('click', (e) => {
    const r = pn.cv.getBoundingClientRect(), box = plotBox(r.width, r.height), x = e.clientX - r.left;
    if (x < box.x || x > box.x + box.w) return;
    // Selects the strip (used from stage 2 on); never changes the stage.
    state.selected = binOf(-Y_HALF + (x - box.x) / box.w * 2 * Y_HALF);
  });
  document.querySelector(`[data-fp-open="${k}"]`).addEventListener('click', () => setPanelOpen(k, true));
  document.querySelector(`[data-panel-toggle="${k}"]`).addEventListener('click', () => setPanelOpen(k, !pn.open));
}
split.addEventListener('pointerdown', (e) => {
  if (stacked()) return;
  e.preventDefault();
  const sx = e.clientX, w0 = colWidth;
  split.setPointerCapture(e.pointerId); split.classList.add('dragging');
  const move = (ev) => setColWidth(w0 - (ev.clientX - sx));
  const up = () => { split.removeEventListener('pointermove', move); split.removeEventListener('pointerup', up); split.classList.remove('dragging'); savePanels(); };
  split.addEventListener('pointermove', move); split.addEventListener('pointerup', up);
});
split.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft') setColWidth(colWidth + 20); else if (e.key === 'ArrowRight') setColWidth(colWidth - 20); else if (e.key === 'Home') setColWidth(defaultColWidth()); else return;
  e.preventDefault(); savePanels();
});
$('#resetPanels').addEventListener('click', () => { setColWidth(defaultColWidth()); savePanels(); });
new ResizeObserver(() => { if (colWidth !== null) setColWidth(colWidth); }).observe(host);
const plotBox = (W, H) => ({ x: 54, y: 8, w: Math.max(40, W - 66), h: Math.max(40, H - 46) });

// ---------------------------------------------------------------- geometry controls (Advanced)
const GEO_INPUTS = {
  wavelength: { min: 1, max: 50, step: 1 },
  slitWidth: { min: 30, max: 200, step: 5 },
  separation: { min: 0, max: 2000, step: 5 },
  wall: { min: 50, max: 1000, step: 5 },
  distance: { min: 200, max: 3000, step: 10 },
  screen: { min: 120, max: 5000, step: 10 },
  sourceWidth: { min: 50, max: 400, step: 5 },
};
// Same limits as the double-slit app: each drawn opening (±1.5σ) no larger than
// a quarter of the screen, and the separation small enough that both openings
// stay on the screen and hold the transmitted probability.
function geometryLimits() {
  const lim = Object.fromEntries(Object.entries(GEO_INPUTS).map(([k, v]) => [k, { ...v }]));
  // The slit limits depend on the screen length, so clamp it first.
  geo.screen = Math.min(lim.screen.max, Math.max(lim.screen.min, geo.screen));
  lim.slitWidth.max = Math.max(30, Math.floor(geo.screen / (4 * SLIT_EXTENT) / 5) * 5);
  geo.slitWidth = Math.min(geo.slitWidth, lim.slitWidth.max);
  const base = { sy: geo.slitWidth / 100, k: 2 * Math.PI * 100 / geo.wavelength, wall: geo.wall / 100, sourceSigma: geo.sourceWidth / 100 };
  const room = Math.min(2000, Math.max(0, Math.floor(geo.screen - 2 * SLIT_EXTENT * geo.slitWidth)));
  lim.separation.max = Math.max(0, Math.floor(100 * maximumCoreSafeSeparation(base, SLIT_EXTENT, room / 100) + 1e-9));
  return lim;
}
function clampGeometry() {
  const lim = geometryLimits();
  for (const [k, l] of Object.entries(lim)) geo[k] = Math.min(l.max, Math.max(l.min, Math.round(geo[k] / l.step) * l.step));
  geometryLimits();
  // Measurement planes must fit behind the slits.
  state.gap = Math.min(state.gap, Math.floor(geo.distance / 4 / 5) * 5);
  const x1Max = geo.distance - state.gap;
  $('#x1').max = x1Max; $('#gap').max = Math.min(100, Math.floor(geo.distance / 4 / 5) * 5);
  if (state.x1 > x1Max) state.x1 = Math.floor(x1Max / 10) * 10;
  $('#x1').value = state.x1; $('#gap').value = state.gap;
  return lim;
}
function syncGeometryInputs() {
  const lim = clampGeometry();
  for (const k of Object.keys(GEO_INPUTS)) {
    const r = document.getElementById(`geo-${k}`), n = document.getElementById(`geo-${k}-n`);
    if (!r) continue;
    r.min = n.min = lim[k].min; r.max = n.max = lim[k].max; r.step = n.step = lim[k].step;
    r.value = n.value = geo[k];
  }
  $('#geoNote').textContent = `Slit width up to ${lim.slitWidth.max} nm and separation up to ${lim.separation.max} nm for this screen, as in the double-slit app. Changing the geometry starts the experiment again.`;
}
function setGeometry(k, v) {
  geo[k] = v;
  syncGeometryInputs();
  applyGeometry();
  state.selected = null;
  pending = true;
  updateText();
}
for (const k of Object.keys(GEO_INPUTS)) {
  const r = document.getElementById(`geo-${k}`), n = document.getElementById(`geo-${k}-n`);
  if (!r) continue;
  r.addEventListener('input', () => setGeometry(k, +r.value));
  n.addEventListener('change', () => { if (Number.isFinite(+n.value)) setGeometry(k, +n.value); });
}
$('#geoReset').addEventListener('click', () => { Object.assign(geo, GEO_DEFAULT); syncGeometryInputs(); applyGeometry(); state.selected = null; pending = true; updateText(); });

// ---------------------------------------------------------------- URL state
function readUrl() {
  const q = new URLSearchParams(location.search);
  const num = (k, lo, hi, step) => { const v = parseFloat(q.get(k)); return Number.isFinite(v) ? Math.min(hi, Math.max(lo, Math.round(v / step) * step)) : null; };
  const sw = num('sw', 5, 400, 5); if (sw !== null) state.sw = sw;
  const x1 = num('x1', 0, 3000, 10); if (x1 !== null) state.x1 = x1;
  const gap = num('gap', 10, 100, 5); if (gap !== null) state.gap = gap;
  if (['one', 'many', 'map'].includes(q.get('stage'))) state.stage = q.get('stage');
  for (const k of Object.keys(GEO_DEFAULT)) { const v = parseFloat(q.get(k)); if (Number.isFinite(v)) { geo[k] = v; urlAsked[k] = v; } }
  for (const k of ['sw', 'x1', 'gap']) { const v = parseFloat(q.get(k)); if (Number.isFinite(v)) urlAsked[k] = v; }
  const rq = parseFloat(q.get('runs')); if (Number.isFinite(rq)) urlAsked.runs = rq;
  if (q.get('stage') && !['one', 'many', 'map'].includes(q.get('stage'))) urlBadStage = q.get('stage');
  const runs = parseFloat(q.get('runs')); if (Number.isFinite(runs)) state.perPlane = RUNS.reduce((a, b) => (Math.abs(Math.log(b / runs)) < Math.abs(Math.log(a / runs)) ? b : a));
  if (['density', 'crests', 'phase'].includes(q.get('show'))) state.waveMode = q.get('show');
  if (q.get('bohm') === '1') state.show.bohm = true;
  $('#sw').value = state.sw; $('#x1').value = state.x1; $('#gap').value = state.gap;
  document.querySelectorAll('[data-toggle="bohm"], [data-maptoggle="bohm"]').forEach((b) => b.setAttribute('aria-pressed', String(state.show.bohm)));
}
function shareUrl() {
  const u = new URL(location.href);
  const g = {}; for (const k of Object.keys(GEO_DEFAULT)) if (geo[k] !== GEO_DEFAULT[k]) g[k] = geo[k];
  u.search = new URLSearchParams({ stage: state.stage, sw: state.sw, x1: state.x1, gap: state.gap, runs: state.perPlane, ...(state.waveMode !== 'density' ? { show: state.waveMode } : {}), ...g, ...(state.show.bohm ? { bohm: 1 } : {}) }).toString();
  return u.toString();
}

// ---------------------------------------------------------------- drawing
function palette() {
  const light = document.body.classList.contains('qontic-light');
  return light ? {
    light, bg: '#fbfdfe', panel: '#f1f6f8', grid: '#d6e2e8', text: '#183747', muted: '#5f7684',
    wave: [12, 90, 140], wall: '#36505f', weak: '#a36400', strong: '#087788', arrow: '#b35c00', line: '#b35c00',
    bohm: '#8a2bbd', exp: '#16803c', cur: '#183747', dots: 'rgba(24,55,71,0.22)', strip: 'rgba(8,119,136,0.13)',
  } : {
    light, bg: '#07131d', panel: '#0b1c29', grid: '#1d3546', text: '#d9edf7', muted: '#8299aa',
    wave: [95, 210, 235], wall: '#9fb3c1', weak: '#f0b341', strong: '#5fe0f0', arrow: '#f6b54a', line: '#f6b54a',
    bohm: '#e07bff', exp: '#6ee58f', cur: '#d9edf7', dots: 'rgba(200,225,240,0.20)', strip: 'rgba(95,224,240,0.13)',
  };
}


function text(s, x, y, { color, size = 12, align = 'left', base = 'alphabetic', weight = 400 } = {}) {
  ctx.fillStyle = color; ctx.font = `${weight} ${size}px Inter, Arial, sans-serif`; ctx.textAlign = align; ctx.textBaseline = base; ctx.fillText(s, x, y);
}
// Text on a translucent backing, so it stays readable over the wave.
function backedText(P, s, x, y, opts = {}) {
  const size = opts.size || 12;
  ctx.font = `${opts.weight || 400} ${size}px Inter, Arial, sans-serif`;
  const w = ctx.measureText(s).width, x0 = opts.align === 'right' ? x - w : opts.align === 'center' ? x - w / 2 : x;
  ctx.fillStyle = P.light ? 'rgba(251,253,254,0.85)' : 'rgba(7,19,29,0.78)';
  ctx.fillRect(x0 - 3, y - size, w + 6, size + 5);
  text(s, x, y, opts);
}

// ---------------------------------------------------------------- drag the geometry on the drawing
// Handles, as in the analytical double-slit app: drag the screen sideways
// (slits-to-screen distance) or its ends (screen length); drag a slit up or
// down (separation) or its edge (slit width); drag the weak or strong plane.
let appMap = null, drag = null, hover = null, editing = false;
const GRIP = 9;
function handles() {
  if (!appMap || !editing) return [];
  const { X, Yp } = appMap, out = [], xw = X(p.wall), xs = X(p.screen);
  p.centers.forEach((c, i) => {
    out.push({ kind: 'slitWidth', x: xw, y: Yp(c + SLIT_EXTENT * p.sy) * 1, i, edge: 1 });
    out.push({ kind: 'slitWidth', x: xw, y: Yp(c - SLIT_EXTENT * p.sy), i, edge: -1 });
    out.push({ kind: 'separation', x: xw, y: Yp(c), i });
  });
  out.push({ kind: 'screen', x: xs, y: Yp(Y_HALF), edge: 1 }, { kind: 'screen', x: xs, y: Yp(-Y_HALF), edge: -1 });
  out.push({ kind: 'distance', x: xs, y: Yp(0), line: true });
  if (state.stage !== 'map' && (exp || (drag && (drag.kind === 'x1' || drag.kind === 'gap')))) {
    const a1 = p.wall + state.x1 / 100, a2 = a1 + state.gap / 100;
    out.push({ kind: 'gap', x: X(a2), y: Yp(0), line: true });
    out.push({ kind: 'x1', x: X(a1), y: Yp(0), line: true });
  }
  return out;
}
function hitHandle(px, py) {
  if (!appMap) return null;
  const top = appMap.Yp(Y_HALF), bot = appMap.Yp(-Y_HALF);
  for (const h of handles()) {
    if (!h.line && Math.hypot(px - h.x, py - h.y) <= GRIP) return h;
  }
  for (const h of handles()) if (h.line && Math.abs(px - h.x) <= 6 && py >= top && py <= bot) return h;
  return null;
}
const CURSOR = { slitWidth: 'ns-resize', separation: 'ns-resize', screen: 'ns-resize', distance: 'ew-resize', gap: 'ew-resize', x1: 'ew-resize' };
const GEO_LABEL = { wavelength: 'Wavelength', sourceWidth: 'Source width', wall: 'Source to slits' };
const DRAG_LABEL = { slitWidth: 'Slit width σ', separation: 'Slit separation', screen: 'Screen length', distance: 'Slits to screen', gap: 'Gap to strong plane', x1: 'Weak plane' };
function drawGrips(P) {
  const hs = handles();
  for (const h of hs) {
    const on = (drag && drag.kind === h.kind) || (hover && hover.kind === h.kind);
    ctx.globalAlpha = on ? 1 : 0.6;
    ctx.fillStyle = P.light ? '#ffffff' : '#0b1c29'; ctx.strokeStyle = h.kind === 'gap' ? P.strong : h.kind === 'x1' ? P.weak : (P.light ? '#36505f' : '#c9e7f2'); ctx.lineWidth = on ? 2 : 1.3;
    if (h.line) { ctx.beginPath(); ctx.roundRect(h.x - 5, h.y - 12, 10, 24, 4); ctx.fill(); ctx.stroke(); }
    else if (h.kind === 'separation') { ctx.beginPath(); ctx.arc(h.x, h.y, 5, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); }
    else { ctx.beginPath(); ctx.rect(h.x - 4, h.y - 4, 8, 8); ctx.fill(); ctx.stroke(); }
  }
  ctx.globalAlpha = 1;
  if (drag && drag.label) {
    const t = drag.label; ctx.font = '600 12px Inter, Arial, sans-serif';
    const w = ctx.measureText(t).width + 14, bx = Math.min(appMap.box.x + appMap.box.w - w - 4, drag.px + 12), by = Math.max(appMap.box.y + 4, drag.py - 30);
    ctx.fillStyle = P.light ? 'rgba(255,255,255,0.95)' : 'rgba(7,19,29,0.95)'; ctx.fillRect(bx, by, w, 22);
    text(t, bx + 7, by + 15, { color: P.text, size: 12, weight: 600 });
  }
}
function pointerPos(e) { const r = canvas.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; }
// Post-select by pointing: over the strong plane (stages 2 and 3, while a pair
// of planes is being measured) the strip under the pointer is selected, and the
// drawing shows its mean pointer reading on the weak plane.
let hoverStrip = null;
function stripAt(px, py) {
  if (!appMap || !exp || editing || state.stage === 'one' || map?.done) return null;
  const m = appMap, xw = m.X(exp.x1), xs = m.X(exp.x2), top = m.Yp(Y_HALF), bot = m.Yp(-Y_HALF);
  if (px < xw - 30 || px > xs + 40 || py < top || py > bot) return null;
  return binOf(m.Yh - (py - m.box.y - 26) / (m.box.h - 44) * 2 * m.Yh);
}
canvas.addEventListener('pointermove', (e) => {
  const [px, py] = pointerPos(e);
  if (drag) { dragMove(px, py); return; }
  hover = hitHandle(px, py);
  hoverStrip = hover ? null : stripAt(px, py);
  if (hoverStrip !== null) state.selected = hoverStrip;
  canvas.style.cursor = hover ? CURSOR[hover.kind] : hoverStrip !== null ? 'crosshair' : '';
});
canvas.addEventListener('pointerleave', (e) => { if (!drag) { hover = null; canvas.style.cursor = ''; } if (e.pointerType === 'mouse') hoverStrip = null; });
canvas.addEventListener('pointerdown', (e) => {
  const [px, py] = pointerPos(e), h = hitHandle(px, py);
  if (!h) {
    // Touch and pen have no hover: a tap on the strong plane selects the strip.
    if (e.pointerType !== 'mouse') { const s = stripAt(px, py); if (s !== null) { hoverStrip = s; state.selected = s; } }
    return;
  }
  e.preventDefault();
  canvas.setPointerCapture(e.pointerId);
  stop();
  // The mapping at the start of the drag converts pointer positions to lengths.
  const m = appMap, invX = (qx) => m.x0 + (qx - m.box.x) / m.box.w * (m.x1 - m.x0);
  const invY = (qy) => m.Yh - (qy - m.box.y - 26) / (m.box.h - 44) * 2 * m.Yh;
  drag = { kind: h.kind, invX, invY, px, py, label: '', m0: { x0: m.x0, x1: m.x1, Yh: m.Yh } };
  exp = null; map = null; anim = null; pending = true;
  dragMove(px, py);
});
function endDrag() { if (!drag) return; drag = null; hover = null; canvas.style.cursor = ''; pending = true; state.selected = null; updateText(); }
canvas.addEventListener('pointerup', endDrag);
canvas.addEventListener('pointercancel', endDrag);
function dragMove(px, py) {
  drag.px = px; drag.py = py;
  const k = drag.kind, xm = drag.invX(px), ym = drag.invY(py);
  if (k === 'distance') geo.distance = nm(xm - p.wall);
  else if (k === 'screen') geo.screen = 2 * nm(Math.abs(ym));
  else if (k === 'separation') geo.separation = 2 * nm(Math.abs(ym));
  else if (k === 'slitWidth') { const c = p.centers.reduce((a, b) => (Math.abs(b - ym) < Math.abs(a - ym) ? b : a)); geo.slitWidth = nm(Math.abs(ym - c)) / SLIT_EXTENT; }
  else if (k === 'gap') { state.gap = Math.round(Math.max(10, Math.min(+$('#gap').max, nm(xm - p.wall) - state.x1)) / 5) * 5; $('#gap').value = state.gap; }
  else if (k === 'x1') { state.x1 = Math.round(Math.max(0, Math.min(+$('#x1').max, nm(xm - p.wall))) / 10) * 10; $('#x1').value = state.x1; }
  if (k in GEO_INPUTS) { syncGeometryInputs(); applyGeometry(); }
  updateText();
  const v = k in GEO_INPUTS ? geo[k] : state[k];
  drag.label = `${DRAG_LABEL[k]}: ${v} nm`;
}

// ---------------------------------------------------------------- the wave
// Show: density |ψ|², crests (brightness |ψ| times (1 + cos(kx − ωt + arg φ))/2,
// travelling) or phase (colour from the same angle, travelling), as in the
// analytical double-slit app. Each column is scaled to its own maximum.
// Before the weak plane the wave is ψ. Beyond it the wave depends on the
// pointer, which is entangled with the particle:
//  · stage 1: the wave of the current run, ψ times φ(Y − y) for its reading Y;
//  · stage 2: the density averaged over all readings (no single wave, so no
//    crests or phase are drawn there);
//  · stage 3: ψ (each plane pair is a separate experiment).
// The beam is continuous; runs are events at random times. The velocity field
// does not depend on time, so no run has to be timed.
const RUN_SECONDS = 1.8;
const RUN_TW = 0.15, RUN_TS = 0.55;   // pointer moves, then detection, within a run
let waveGrid = null, waveLayer = null, phaseClock = 0, lastRun = null;
const HUE = (() => { const t = new Uint8Array(256 * 3); for (let i = 0; i < 256; i++) { const h = i / 256 * 6, c = 1, x = 1 - Math.abs(h % 2 - 1); const [r, g, b] = h < 1 ? [c, x, 0] : h < 2 ? [x, c, 0] : h < 3 ? [0, c, x] : h < 4 ? [0, x, c] : h < 5 ? [x, 0, c] : [c, 0, x]; t[3 * i] = 70 + 185 * r; t[3 * i + 1] = 70 + 185 * g; t[3 * i + 2] = 70 + 185 * b; } return t; })();
function makeRunAnim(run) { lastRun = run; if (waveGrid) waveGrid.overKey = null; return { t: 0, run, tW: RUN_TW, tS: RUN_TS }; }
const waveKey = (xa, xb, nx) => [xa, xb, nx, p.k, p.sy, p.centers, p.wall, p.sourceSigma, Y_HALF].join('|');
// Base grid: ψ at every column (density and phase angle kx + arg φ).
function baseGrid(xa, xb, nx) {
  const ny = 200, R = new Float32Array(nx * ny), TH = new Float32Array(nx * ny);
  for (let i = 0; i < nx; i++) {
    const x = xa + (i + 0.5) / nx * (xb - xa), t = x >= p.wall ? M.propagate(T0, (x - p.wall) / p.k) : null;
    for (let j = 0; j < ny; j++) {
      const y = Y_HALF - (j + 0.5) / ny * 2 * Y_HALF, g = t ? M.evaluate(t, y) : sourceTransverse(y, x, p);
      R[j * nx + i] = g.re * g.re + g.im * g.im; TH[j * nx + i] = p.k * x + Math.atan2(g.im, g.re);
    }
  }
  return { key: waveKey(xa, xb, nx), xa, xb, nx, ny, R, TH, overKey: null, dirty: true };
}
// Columns beyond the weak plane, for the current stage.
function overlay(g) {
  if (!exp || map || drag) return null;
  const i1 = Math.max(0, Math.ceil((exp.x1 - g.xa) / (g.xb - g.xa) * g.nx - 0.5));
  if (i1 >= g.nx) return null;
  const xs = (i) => g.xa + (i + 0.5) / g.nx * (g.xb - g.xa), sw = state.sw / 100;
  const n = g.nx - i1, R = new Float32Array(n * g.ny), TH = new Float32Array(n * g.ny);
  const ys = Array.from({ length: g.ny }, (_, j) => Y_HALF - (j + 0.5) / g.ny * 2 * Y_HALF);
  if (state.stage === 'one') {
    if (!lastRun) return null;
    const coupled = M.coupleToPointer(exp.terms1, lastRun.Y, sw);
    for (let i = i1; i < g.nx; i++) {
      const t = M.propagate(coupled, (xs(i) - exp.x1) / p.k);
      for (let j = 0; j < g.ny; j++) { const e = M.evaluate(t, ys[j]); R[j * n + i - i1] = e.re * e.re + e.im * e.im; TH[j * n + i - i1] = p.k * xs(i) + Math.atan2(e.im, e.re); }
    }
    return { i1, n, R, TH, mixed: false };
  }
  // Stage 2: density averaged over pointer readings (exact; see weak-model.js).
  const sq = 1 / (2 * sw), tauMax = (g.xb - exp.x1) / p.k, nodes = Math.max(21, Math.min(161, Math.round(21 + 40 * sq * tauMax / 0.5)));
  const step = Math.max(1, Math.round(n / 120));   // averaged density is smooth along x
  let prev = null, prevI = -1;
  for (let i = i1; i < g.nx; i++) {
    if ((i - i1) % step && i !== g.nx - 1) continue;
    const col = M.ensembleDensity(exp.terms1, sw, (xs(i) - exp.x1) / p.k, ys, nodes);
    for (let j = 0; j < g.ny; j++) R[j * n + i - i1] = col[j];
    if (prev) for (let k = prevI + 1; k < i; k++) { const f = (k - prevI) / (i - prevI); for (let j = 0; j < g.ny; j++) R[j * n + k - i1] = prev[j] + f * (col[j] - prev[j]); }
    prev = col; prevI = i;
  }
  return { i1, n, R, TH, mixed: true };
}
function drawWave(P, X, Yp, xa, xb) {
  const mode = state.waveMode, lam = 2 * Math.PI / p.k;
  // Crests and phase need at least 6 screen pixels per wavelength.
  const pxPerLam = X(xa + lam) - X(xa), canCrest = pxPerLam >= 6;
  const want = mode === 'density' || !canCrest ? 'density' : mode;
  const nx = want === 'density' ? 360 : Math.min(1600, Math.max(360, Math.ceil(6 * (xb - xa) / lam)));
  if (!waveGrid || waveGrid.key !== waveKey(xa, xb, nx)) waveGrid = baseGrid(xa, xb, nx);
  const g = waveGrid;
  const oKey = [state.stage, exp?.x1, state.sw, lastRun?.Y, !!map, !!drag, exp ? 1 : 0].join('|');
  if (g.overKey !== oKey) { g.over = overlay(g); g.overKey = oKey; g.dirty = true; }
  // Column normalisation of the composite (only when it changes).
  if (g.dirty || !g.A) {
    g.A = new Float32Array(g.nx * g.ny); g.T = new Float32Array(g.nx * g.ny); g.mixedFrom = g.over?.mixed ? g.over.i1 : Infinity;
    for (let i = 0; i < g.nx; i++) {
      const o = g.over && i >= g.over.i1 ? g.over : null;
      let mx = 0;
      for (let j = 0; j < g.ny; j++) { const r = o ? o.R[j * o.n + i - o.i1] : g.R[j * g.nx + i]; mx = Math.max(mx, r); }
      for (let j = 0; j < g.ny; j++) {
        const k = j * g.nx + i, r = o ? o.R[j * o.n + i - o.i1] : g.R[k];
        g.A[k] = mx > 0 ? Math.pow(r / mx, 0.6) : 0; g.T[k] = o ? o.TH[j * o.n + i - o.i1] : g.TH[k];
      }
    }
    g.dirty = false; g.rendered = null;
  }
  const renderKey = [want, want === 'density' ? 0 : phaseClock, P.light].join('|');
  if (!waveLayer) waveLayer = document.createElement('canvas');
  if (waveLayer.width !== g.nx || waveLayer.height !== g.ny) { waveLayer.width = g.nx; waveLayer.height = g.ny; g.img = null; g.rendered = null; }
  const c = waveLayer.getContext('2d');
  if (g.rendered !== renderKey) {
    if (!g.img) g.img = c.createImageData(g.nx, g.ny);
    const d = g.img.data, [wr, wg, wb] = P.wave, ph = phaseClock, a0 = P.light ? 200 : 230;
    for (let j = 0; j < g.ny; j++) for (let i = 0; i < g.nx; i++) {
      const k = j * g.nx + i, A = g.A[k], mixed = i >= g.mixedFrom;
      if (want === 'density' || mixed) { d[4 * k] = wr; d[4 * k + 1] = wg; d[4 * k + 2] = wb; d[4 * k + 3] = a0 * A; continue; }
      if (want === 'crests') { d[4 * k] = wr; d[4 * k + 1] = wg; d[4 * k + 2] = wb; d[4 * k + 3] = a0 * A * (0.5 + 0.5 * Math.cos(g.T[k] - ph)); continue; }
      let u = ((g.T[k] - ph) / (2 * Math.PI)) % 1; if (u < 0) u += 1;
      const h = 3 * Math.floor(u * 256); d[4 * k] = HUE[h]; d[4 * k + 1] = HUE[h + 1]; d[4 * k + 2] = HUE[h + 2]; d[4 * k + 3] = a0 * A;
    }
    c.putImageData(g.img, 0, 0); g.rendered = renderKey;
  }
  ctx.imageSmoothingEnabled = true;
  ctx.drawImage(waveLayer, X(xa), Yp(Y_HALF), X(xb) - X(xa), Yp(-Y_HALF) - Yp(Y_HALF));
  return { want, canCrest, mixedFrom: g.mixedFrom < Infinity ? g.xa + g.mixedFrom / g.nx * (g.xb - g.xa) : null };
}

function drawApparatus(P, box) {
  const D = p.screen - p.wall;
  // While the screen is dragged, keep the drawing's scale from the start of the
  // drag so the screen follows the pointer; it rescales on release.
  const frozen = drag && (drag.kind === 'distance' || drag.kind === 'screen') ? drag.m0 : null;
  const x0 = frozen ? frozen.x0 : p.wall - 0.05 * D - 0.1, x1 = frozen ? frozen.x1 : p.screen + 0.1 * D + 0.2;
  const YH = frozen ? frozen.Yh : Y_HALF;
  const X = (x) => box.x + (x - x0) / (x1 - x0) * box.w;
  const Yp = (y) => box.y + 26 + (YH - y) / (2 * YH) * (box.h - 44);
  ctx.fillStyle = P.panel; ctx.fillRect(box.x, box.y, box.w, box.h);
  ctx.save(); ctx.beginPath(); ctx.rect(box.x, box.y, box.w, box.h); ctx.clip();
  // wave
  if (state.show.wave) {
    const w = drawWave(P, X, Yp, x0, p.screen);
    if (w.mixedFrom !== null && w.want !== 'density') {
      // Below the pattern, between the weak plane and the screen; wrapped if needed.
      const lines = ['beyond the weak plane: density averaged over pointer readings', '(a single run keeps its fringes: see stage 1)'];
      lines.forEach((ln, i) => backedText(P, ln, X(exp ? exp.x2 : w.mixedFrom) + 10, Yp(-Y_HALF) - 22 + 12 * i, { color: P.muted, size: 10 }));
    }
    if (state.waveMode !== 'density' && !w.canCrest) text('wavelength too short to draw crests here: density shown', X(p.wall) + 8, box.y + box.h - 18, { color: P.muted, size: 10 });
  }
  // wall with two slits (±1.5 sigma openings)
  ctx.strokeStyle = P.wall; ctx.lineWidth = 4;
  const open = p.centers.map((c) => [c - 1.5 * p.sy, c + 1.5 * p.sy]).sort((a, b) => a[0] - b[0]);
  let cur = -Y_HALF;
  ctx.beginPath();
  for (const [a, b] of open) { ctx.moveTo(X(p.wall), Yp(cur)); ctx.lineTo(X(p.wall), Yp(a)); cur = b; }
  ctx.moveTo(X(p.wall), Yp(cur)); ctx.lineTo(X(p.wall), Yp(Y_HALF)); ctx.stroke();
  // screen
  ctx.strokeStyle = P.wall; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(X(p.screen), Yp(Y_HALF)); ctx.lineTo(X(p.screen), Yp(-Y_HALF)); ctx.stroke();
  text('slits', X(p.wall), box.y + box.h - 4, { color: P.muted, size: 11, align: 'center' });
  text('screen', X(p.screen), box.y + box.h - 4, { color: P.muted, size: 11, align: 'center' });
  // scale bar 100 nm

  // measured arrows
  const arrowsFrom = [];
  if (map) map.planes.forEach((pl) => arrowsFrom.push({ x: pl.x2, est: pl.est }));
  // Stage 2 shows the arrows building up; stage 3 draws a plane pair's arrows
  // only once all its runs are in (finished pairs are in map.planes).
  if (exp && state.stage === 'many') {
    const est = M.binVelocities(exp.bins, exp.dtau, state.stage === 'many' ? 2000 : 200).map((b) => (b ? { y: b.y, s: b.v / p.k, err: b.err / p.k } : null));
    arrowsFrom.push({ x: exp.x2, est, live: true });
  }
  const L = Math.max(14, Math.min(26, box.w / 32));
  if (state.show.arrows) for (const a of arrowsFrom) for (const [ei, e] of a.est.entries()) {
    if (!e || (map?.done && ei % state.arrowEvery !== Math.floor(state.arrowEvery / 2))) continue;
    const rel = Math.min(1, 0.04 / Math.max(1e-6, e.err));
    if (rel < 0.15) continue;
    const ang = Math.atan2(-(Yp(e.y + e.s) - Yp(e.y)), X(a.x + 1) - X(a.x));
    const sx = X(a.x), sy = Yp(e.y), ex = sx + L * Math.cos(ang), ey = sy - L * Math.sin(ang);
    ctx.globalAlpha = 0.35 + 0.65 * rel;
    ctx.strokeStyle = P.arrow; ctx.fillStyle = P.arrow; ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(ex, ey); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(ex, ey);
    ctx.lineTo(ex - 6 * Math.cos(ang - 0.45), ey + 6 * Math.sin(ang - 0.45));
    ctx.lineTo(ex - 6 * Math.cos(ang + 0.45), ey + 6 * Math.sin(ang + 0.45)); ctx.closePath(); ctx.fill();
  }
  ctx.globalAlpha = 1;

  // lines from the measured field, and pilot-wave trajectories
  const path = (pts) => { ctx.beginPath(); pts.forEach(([x, y], i) => (i ? ctx.lineTo(X(x), Yp(y)) : ctx.moveTo(X(x), Yp(y)))); ctx.stroke(); };
  if (map?.done) {
    // Lines stay inside the region between the slits and the screen.
    ctx.save(); ctx.beginPath(); ctx.rect(X(p.wall), Yp(Y_HALF), X(p.screen) - X(p.wall), Yp(-Y_HALF) - Yp(Y_HALF)); ctx.clip();
    ctx.strokeStyle = P.line; ctx.lineWidth = 1.8; if (state.show.lines) map.lines.forEach(path);
    if (state.show.bohm) {
      // Flow lines of j/|psi|^2 computed from psi (trajectories in pilot-wave), same starts, drawn on top.
      ctx.strokeStyle = P.bohm; ctx.lineWidth = 1.7; ctx.setLineDash([6, 4]); map.bohm.forEach(path); ctx.setLineDash([]);
    }
    ctx.restore();
    // key
    const keys = [];
    if (state.show.lines) keys.push([P.line, [], 1.8, 'lines through the measured arrows']);
    if (state.show.bohm) keys.push([P.bohm, [6, 4], 1.7, 'flow lines of j/|ψ|² from ψ (trajectories in pilot-wave), same starts']);
    if (keys.length) {
      const kx = X(p.wall) + 14, ky = Yp(-Y_HALF) - 10;
      ctx.font = '400 11px Inter, Arial, sans-serif';
      // Short labels when the drawing is narrow (projector, phone).
      if (40 + Math.max(...keys.map((k) => ctx.measureText(k[3]).width)) > box.w - 40) keys.forEach((k) => { k[3] = k[0] === P.line ? 'measured lines' : 'j/|ψ|² flow lines (trajectories in pilot-wave)'; });
      const kw = 40 + Math.max(...keys.map((k) => ctx.measureText(k[3]).width));
      ctx.fillStyle = P.light ? 'rgba(241,246,248,0.88)' : 'rgba(11,28,41,0.88)'; ctx.fillRect(kx - 6, ky - 15 * keys.length, kw, 6 + 15 * keys.length);
      keys.forEach(([col, dash, lw, label], i) => {
        const yy = ky - 15 * (keys.length - 1 - i);
        ctx.lineWidth = lw; ctx.strokeStyle = col; ctx.setLineDash(dash); ctx.beginPath(); ctx.moveTo(kx, yy - 4); ctx.lineTo(kx + 22, yy - 4); ctx.stroke(); ctx.setLineDash([]);
        text(label, kx + 30, yy, { color: P.text, size: 11 });
      });
    }
    // screen check: measured end points vs equal-probability positions
    const sx = X(p.screen);
    ctx.lineWidth = 2;
    if (state.show.lines) map.lines.forEach((ln) => { const [xe, ye] = ln.at(-1); if (Math.abs(xe - p.screen) < 0.05) { ctx.strokeStyle = P.line; ctx.beginPath(); ctx.moveTo(sx + 3, Yp(ye)); ctx.lineTo(sx + 14, Yp(ye)); ctx.stroke(); } });
    ctx.strokeStyle = P.light ? '#5f7684' : '#b8cbd6';
    map.screenQuantiles.forEach((y) => { if (Math.abs(y) <= Y_HALF) { ctx.beginPath(); ctx.moveTo(sx + 16, Yp(y)); ctx.lineTo(sx + 30, Yp(y)); ctx.stroke(); } });
  }
  // screen |psi|^2 profile
  {
    // In stage 2 the screen sees the density averaged over pointer readings; otherwise ψ.
    const ys = Array.from({ length: 201 }, (_, i) => -Y_HALF + i * 2 * Y_HALF / 200);
    let rs;
    if (state.stage === 'many' && exp && !drag) {
      if (!exp.screenEns) { const sq = 1 / (2 * state.sw / 100), tau = (p.screen - exp.x1) / p.k; exp.screenEns = M.ensembleDensity(exp.terms1, state.sw / 100, tau, ys, Math.max(21, Math.min(161, Math.round(21 + 80 * sq * tau)))); }
      rs = exp.screenEns;
    } else { const tS = M.propagate(T0, (p.screen - p.wall) / p.k); rs = ys.map((y) => M.density(tS, y)); }
    let mx = 0; const pr = ys.map((y, i) => { mx = Math.max(mx, rs[i]); return [y, rs[i]]; });
    const w = X(x1) - X(p.screen) - 30;
    ctx.strokeStyle = P.muted; ctx.lineWidth = 1.2; ctx.beginPath();
    pr.forEach(([y, r], i) => { const xx = X(p.screen) + 28 + w * r / mx; i ? ctx.lineTo(xx, Yp(y)) : ctx.moveTo(xx, Yp(y)); }); ctx.stroke();
  }

  // the current pair of planes
  if (exp && !(map?.done)) {
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = P.weak; ctx.setLineDash([5, 4]); ctx.beginPath(); ctx.moveTo(X(exp.x1), Yp(Y_HALF)); ctx.lineTo(X(exp.x1), Yp(-Y_HALF)); ctx.stroke(); ctx.setLineDash([]);
    ctx.strokeStyle = P.strong; ctx.beginPath(); ctx.moveTo(X(exp.x2), Yp(Y_HALF)); ctx.lineTo(X(exp.x2), Yp(-Y_HALF)); ctx.stroke();
    text('weak', X(exp.x1) - 3, Yp(Y_HALF) - 4, { color: P.weak, size: 11, align: 'right' });
    text('strong', X(exp.x2) + 3, Yp(Y_HALF) - 4, { color: P.strong, size: 11, align: 'left' });
  }
  // Accumulated runs as points: pointer readings beside the weak plane,
  // detections between the planes. The first PLANE_POINTS runs are kept as
  // points (enough to show both distributions without saturating).
  if (state.show.planeRuns && exp && !(map?.done) && exp.ptsN) {
    const xw = X(exp.x1), xs = X(exp.x2), top = Yp(Y_HALF), bot = Yp(-Y_HALF);
    const gapW = Math.max(6, xs - xw - 6);
    const n = exp.ptsN, sz = n > 2000 ? 1.5 : 2.2;
    ctx.globalAlpha = n > 2000 ? 0.45 : 0.75;
    ctx.fillStyle = P.weak;
    for (let i = 0; i < n; i++) { const yy = Yp(exp.ptsY[i]); if (yy >= top && yy <= bot) ctx.fillRect(xw - 3 - exp.ptsU[i] * 12 - sz / 2, yy - sz / 2, sz, sz); }
    ctx.fillStyle = P.strong;
    for (let i = 0; i < n; i++) ctx.fillRect(xs - 3 - exp.ptsU[i] * (gapW - 2) - sz / 2, Yp(exp.ptsYf[i]) - sz / 2, sz, sz);
    ctx.globalAlpha = 1;
    const stride = pointStride();
    if (stride > 1) text(`points: one run in ${stride.toLocaleString('en-US')}`, xw - 6, bot + 13, { color: P.muted, size: 10, align: 'right' });
  }
  // Selected strip: mean pointer reading on the weak plane, joined to the mean
  // detected position on the strong plane. The slope of this step is the arrow.
  if (exp && state.stage !== 'one' && !(map?.done) && hoverStrip !== null) {
    const i = hoverStrip, n = exp.bins.count[i];
    // the strip on the strong plane
    const bw = 2 * Y_HALF / N_BINS, a = -Y_HALF + i * bw;
    ctx.fillStyle = P.strip; ctx.fillRect(X(exp.x1) - 4, Yp(a + bw), X(exp.x2) - X(exp.x1) + 30, Yp(a) - Yp(a + bw));
    if (n >= 200) {
      const mY = exp.bins.sumY[i] / n, mYf = exp.bins.sumYf[i] / n;
      const err = Math.sqrt(Math.max(0, exp.bins.sumY2[i] / n - mY * mY) / n);
      const xw = X(exp.x1), xs = X(exp.x2);
      ctx.strokeStyle = P.weak; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(xw, Yp(mY + err)); ctx.lineTo(xw, Yp(mY - err)); ctx.stroke();
      ctx.fillStyle = P.weak; ctx.beginPath(); ctx.arc(xw, Yp(mY), 4.5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = P.strong; ctx.beginPath(); ctx.arc(xs, Yp(mYf), 4.5, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = P.text; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(xw, Yp(mY)); ctx.lineTo(xs, Yp(mYf)); ctx.stroke();
      const up = mY >= mYf;   // keep the two labels apart
      backedText(P, `mean pointer reading ${nm(mY).toFixed(1)} nm`, xw - 12, Yp(mY) + (up ? -10 : 18), { color: P.weak, size: 11, align: 'right', weight: 600 });
      backedText(P, `mean detected ${nm(mYf).toFixed(1)} nm`, xw - 12, Yp(mYf) + (up ? 18 : -10), { color: P.strong, size: 11, align: 'right', weight: 600 });
    } else text('too few runs in this strip yet', X(exp.x2) + 34, Yp(a + bw / 2) + 4, { color: P.muted, size: 11 });
  }
  // stage 1: pointer gauge and detection flash
  if (state.stage === 'one' && exp) drawPointerGauge(P, box, X, Yp);
  // While a plane is dragged, show where the pair will be.
  if (drag && (drag.kind === 'x1' || drag.kind === 'gap')) {
    const a1 = p.wall + state.x1 / 100, a2 = a1 + state.gap / 100;
    ctx.lineWidth = 1.5; ctx.strokeStyle = P.weak; ctx.setLineDash([5, 4]); ctx.beginPath(); ctx.moveTo(X(a1), Yp(Y_HALF)); ctx.lineTo(X(a1), Yp(-Y_HALF)); ctx.stroke(); ctx.setLineDash([]);
    ctx.strokeStyle = P.strong; ctx.beginPath(); ctx.moveTo(X(a2), Yp(Y_HALF)); ctx.lineTo(X(a2), Yp(-Y_HALF)); ctx.stroke();
  }
  ctx.restore();
  appMap = { X, Yp, box, x0, x1, Yh: YH };
  drawGrips(P);
  return { X, Yp };
}

function drawPointerGauge(P, box, X, Yp) {
  // The pointer's scale is drawn along the weak plane, in the same units as y.
  // The marker shows the pointer reading Y; it is not a sighting of the particle.
  const xw = X(exp.x1), top = Yp(Y_HALF), bot = Yp(-Y_HALF), sw = state.sw / 100;
  ctx.strokeStyle = P.weak; ctx.lineWidth = 1;
  const tk = niceStep(Y_HALF / 4);
  for (let i = -Math.floor(Y_HALF / tk); i * tk <= Y_HALF + 1e-9; i++) { const yy = Yp(i * tk), l = i % 2 === 0 ? 7 : 4; ctx.beginPath(); ctx.moveTo(xw - l, yy); ctx.lineTo(xw, yy); ctx.stroke(); }
  text('pointer scale', xw - 6, bot + 13, { color: P.weak, size: 10.5, align: 'right' });
  if (!anim) return;
  const t = anim.t, tW = anim.tW, tS = anim.tS;
  const ease = (u) => u <= 0 ? 0 : u >= 1 ? 1 : u * u * (3 - 2 * u);
  if (t > tW - 0.04 && t < tW + 0.16) { ctx.strokeStyle = P.weak; ctx.globalAlpha = 0.35; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(xw, top); ctx.lineTo(xw, bot); ctx.stroke(); ctx.globalAlpha = 1; }
  // Marker slides from the pointer's zero to the reading.
  const Yr = anim.run.Y * ease((t - tW) / 0.12), yc = Yp(Yr), cl = (v) => Math.max(top, Math.min(bot, v));
  const settled = t > tW + 0.12;
  if (settled) { ctx.globalAlpha = 0.25; ctx.fillStyle = P.weak; ctx.fillRect(xw - 4, cl(Yp(Yr + sw)), 8, cl(Yp(Yr - sw)) - cl(Yp(Yr + sw))); ctx.globalAlpha = 1; }
  ctx.strokeStyle = P.weak; ctx.fillStyle = P.weak; ctx.lineWidth = 2;
  if (yc >= top && yc <= bot) {
    ctx.beginPath(); ctx.moveTo(xw - 13, yc); ctx.lineTo(xw - 3, yc); ctx.stroke();
    ctx.beginPath(); ctx.arc(xw, yc, 5.5, 0, Math.PI * 2); ctx.stroke();
    if (settled) text(`pointer reads ${nm(anim.run.Y).toFixed(0)} ± ${state.sw} nm`, xw - 16, yc + 4, { color: P.weak, size: 11, align: 'right' });
  } else {
    const up = yc < top, ya = up ? top + 2 : bot - 2, d = up ? 1 : -1;
    ctx.beginPath(); ctx.moveTo(xw, ya); ctx.lineTo(xw - 5, ya + 8 * d); ctx.lineTo(xw + 5, ya + 8 * d); ctx.closePath(); ctx.fill();
    if (settled) text(`pointer reads ${nm(anim.run.Y).toFixed(0)} ± ${state.sw} nm (off scale)`, xw - 10, ya + 12 * d + 4, { color: P.weak, size: 11, align: 'right' });
  }
  if (t > tS) {
    const r = t < tS + 0.1 ? 4 + 20 * (t - tS) : 6;
    ctx.fillStyle = P.strong; ctx.beginPath(); ctx.arc(X(exp.x2), Yp(anim.run.yf), r, 0, Math.PI * 2); ctx.fill();
    text(`detected at ${nm(anim.run.yf).toFixed(0)} nm`, X(exp.x2) + 10, Yp(anim.run.yf) + 4, { color: P.strong, size: 11 });
  }
}

function axes(P, box, title, yLabel, ymin, ymax, fmtY) {
  ctx.fillStyle = P.panel; ctx.fillRect(box.x, box.y, box.w, box.h);
  ctx.strokeStyle = P.grid; ctx.lineWidth = 1; ctx.strokeRect(box.x + 0.5, box.y + 0.5, box.w, box.h);
  const X = (y) => box.x + (y + Y_HALF) / (2 * Y_HALF) * box.w;
  const V = (v) => box.y + box.h - (v - ymin) / (ymax - ymin) * box.h;
  { const st = niceStep(Y_HALF / 2); for (let i = -Math.floor(Y_HALF / st); i * st <= Y_HALF + 1e-9; i++) text(`${nm(i * st).toFixed(0)}`, X(i * st), box.y + box.h + 13, { color: P.muted, size: 10, align: 'center' }); }
  text('detected position of the particle, y_f (nm)', box.x + box.w / 2, box.y + box.h + 27, { color: P.muted, size: 10.5, align: 'center' });
  for (const v of [ymin, (ymin + ymax) / 2, ymax]) text(fmtY(v), box.x - 5, V(v) + 3, { color: P.muted, size: 10, align: 'right' });
  ctx.save(); ctx.translate(box.x - 42, box.y + box.h / 2); ctx.rotate(-Math.PI / 2); text(yLabel, 0, 0, { color: P.muted, size: 10.5, align: 'center' }); ctx.restore();
  // selected strip
  if (state.selected !== null && state.stage !== 'one') {
    const a = -Y_HALF + state.selected * 2 * Y_HALF / N_BINS;
    ctx.fillStyle = P.strip; ctx.fillRect(X(a), box.y, X(a + 2 * Y_HALF / N_BINS) - X(a), box.h);
  }
  return { X, V };
}

// Legend at the top right; items separated by ' · ' wrap onto more lines when narrow.
function legend(P, box, s) {
  ctx.font = '400 10px Inter, Arial, sans-serif';
  const items = s.split(' · '), lines = [];
  for (const it of items) {
    const cur = lines.length ? `${lines.at(-1)} · ${it}` : it;
    if (lines.length && ctx.measureText(cur).width + 12 <= box.w - 8) lines[lines.length - 1] = cur; else lines.push(it);
  }
  const w = Math.min(box.w - 8, Math.max(...lines.map((l) => ctx.measureText(l).width)) + 10);
  ctx.fillStyle = P.light ? 'rgba(241,246,248,0.85)' : 'rgba(11,28,41,0.85)';
  ctx.fillRect(box.x + box.w - w - 4, box.y + 3, w, 4 + 12 * lines.length);
  lines.forEach((l, i) => text(l, box.x + box.w - 9, box.y + 13 + 12 * i, { color: P.muted, size: 10, align: 'right' }));
}

function drawScatter(P, box) {
  if (state.shiftView) { drawShift(P, box); return; }
  const range = Y_HALF + 3 * state.sw / 100;
  const { X, V } = axes(P, box, 'Each run: pointer reading vs detected position', 'pointer reading Y (nm)', -range, range, (v) => nm(v).toFixed(0));
  ctx.save(); ctx.beginPath(); ctx.rect(box.x, box.y, box.w, box.h); ctx.clip();
  ctx.strokeStyle = P.muted; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(X(-Y_HALF), V(-Y_HALF)); ctx.lineTo(X(Y_HALF), V(Y_HALF)); ctx.stroke(); ctx.setLineDash([]);
  if (exp && state.show.scatter) {
    ctx.fillStyle = P.dots;
    const big = state.stage === 'one';
    for (let i = 0; i < exp.scatterN; i++) { const a = exp.scatter[2 * i], b = exp.scatter[2 * i + 1]; ctx.fillRect(X(a) - (big ? 2 : 1), V(b) - (big ? 2 : 1), big ? 4 : 2, big ? 4 : 2); }
    if (anim && anim.t > anim.tS + 0.1) { ctx.fillStyle = P.weak; ctx.beginPath(); ctx.arc(X(anim.run.yf), V(anim.run.Y), 5, 0, Math.PI * 2); ctx.fill(); }
  }
  // strip means (pointer averages)
  if (exp && state.stage !== 'one') {
    const est = M.binVelocities(exp.bins, exp.dtau, 50);
    ctx.fillStyle = P.arrow;
    est.forEach((b) => { if (b) { ctx.beginPath(); ctx.arc(X(b.y), V(b.y - b.v * exp.dtau), 2.5, 0, Math.PI * 2); ctx.fill(); } });
  }
  ctx.restore();
  legend(P, box, 'dashed: Y = y_f (no shift) · amber: mean Y in each strip');
  if (exp && exp.runs) {
    const s = exp.runs <= SCATTER_N ? `${exp.runs === 1 ? 'the only run' : `all ${exp.runs.toLocaleString('en-US')} runs`} shown` : `last ${(SCATTER_N / 1000).toFixed(0)}k of ${fmtCount(exp.runs)} shown · means use all`;
    ctx.font = '400 10px Inter, Arial, sans-serif';
    const w = ctx.measureText(s).width + 10;
    ctx.fillStyle = P.light ? 'rgba(241,246,248,0.85)' : 'rgba(11,28,41,0.85)'; ctx.fillRect(box.x + 4, box.y + box.h - 18, w, 15);
    text(s, box.x + 9, box.y + box.h - 7, { color: P.muted, size: 10 });
  }
}

const fmtCount = (n) => (n >= 1e6 ? `${(n / 1e6).toFixed(n % 1e6 ? 2 : 0)}M` : n >= 1e4 ? `${(n / 1e3).toFixed(0)}k` : n.toLocaleString('en-US'));
// The same data as the strip means, magnified: detected position minus the
// mean pointer reading, in nm. Divided by the gap it is the velocity estimate,
// so this plot has the same shape and sign as the velocity plot.
function drawShift(P, box) {
  const toNm = (slope) => nm(slope * p.k * (exp ? exp.dtau : 0));
  const range = exp ? Math.max(0.5, Math.abs(toNm(exp.vmax))) : 5;
  const { X, V } = axes(P, box, '', 'y_f − mean Y (nm)', -range, range, (v) => v.toFixed(1));
  if (!exp) return;
  ctx.save(); ctx.beginPath(); ctx.rect(box.x, box.y, box.w, box.h); ctx.clip();
  ctx.strokeStyle = P.grid; ctx.beginPath(); ctx.moveTo(box.x, V(0)); ctx.lineTo(box.x + box.w, V(0)); ctx.stroke();
  const curve = (pts, color, dash, width) => {
    ctx.strokeStyle = color; ctx.lineWidth = width; ctx.setLineDash(dash); ctx.beginPath(); let on = false;
    for (const [y, v] of pts) { if (v === null) { on = false; continue; } const d = toNm(v); if (Math.abs(d) > 3 * range) { on = false; continue; } on ? ctx.lineTo(X(y), V(d)) : ctx.moveTo(X(y), V(d)); on = true; }
    ctx.stroke(); ctx.setLineDash([]);
  };
  if (state.show.expected) curve(exp.expCurve, P.exp, [], 2);
  if (state.show.current) curve(exp.curCurve, P.cur, [5, 4], 1.2);
  if (state.stage !== 'one') {
    ctx.strokeStyle = P.arrow; ctx.fillStyle = P.arrow; ctx.lineWidth = 1.3;
    M.binVelocities(exp.bins, exp.dtau, 50).forEach((b) => {
      if (!b) return;
      const d = nm(b.v * exp.dtau), e = nm(b.err * exp.dtau);
      if (e > 2 * range) return;
      ctx.beginPath(); ctx.moveTo(X(b.y), V(d - e)); ctx.lineTo(X(b.y), V(d + e)); ctx.stroke();
      ctx.beginPath(); ctx.arc(X(b.y), V(d), 3, 0, Math.PI * 2); ctx.fill();
    });
  }
  ctx.restore();
  legend(P, box, `amber: measured · green: prediction, this pointer · dashed: ideal weak pointer · scale ±${range.toFixed(1)} nm`);
}

function drawVelocity(P, box) {
  const vm = exp ? exp.vmax : 0.3;
  const { X, V } = axes(P, box, 'Velocity from post-selected averages', 'slope v_y / v_x', -vm, vm, (v) => v.toFixed(2));
  if (!exp) return;
  ctx.save(); ctx.beginPath(); ctx.rect(box.x, box.y, box.w, box.h); ctx.clip();
  // density at the strong plane, faint
  ctx.fillStyle = P.light ? 'rgba(12,90,140,0.10)' : 'rgba(95,210,235,0.10)';
  ctx.beginPath(); ctx.moveTo(X(-Y_HALF), box.y + box.h);
  exp.rho.forEach(([y, r]) => ctx.lineTo(X(y), box.y + box.h - 0.9 * box.h * r / exp.rMax));
  ctx.lineTo(X(Y_HALF), box.y + box.h); ctx.fill();
  ctx.strokeStyle = P.grid; ctx.beginPath(); ctx.moveTo(box.x, V(0)); ctx.lineTo(box.x + box.w, V(0)); ctx.stroke();
  const curve = (pts, color, dash, width) => {
    ctx.strokeStyle = color; ctx.lineWidth = width; ctx.setLineDash(dash); ctx.beginPath(); let on = false;
    for (const [y, v] of pts) { if (v === null || Math.abs(v) > 3 * vm) { on = false; continue; } on ? ctx.lineTo(X(y), V(v)) : ctx.moveTo(X(y), V(v)); on = true; }
    ctx.stroke(); ctx.setLineDash([]);
  };
  if (state.show.expected) curve(exp.expCurve, P.exp, [], 2);
  if (state.show.current) curve(exp.curCurve, P.cur, [5, 4], 1.2);
  if (state.stage !== 'one') {
    const est = M.binVelocities(exp.bins, exp.dtau, 50);
    ctx.strokeStyle = P.arrow; ctx.fillStyle = P.arrow; ctx.lineWidth = 1.3;
    est.forEach((b) => {
      if (!b) return;
      const s = b.v / p.k, e = b.err / p.k;
      if (e > 2 * vm) return;
      ctx.beginPath(); ctx.moveTo(X(b.y), V(s - e)); ctx.lineTo(X(b.y), V(s + e)); ctx.stroke();
      ctx.beginPath(); ctx.arc(X(b.y), V(s), 3, 0, Math.PI * 2); ctx.fill();
    });
  }
  ctx.restore();
  legend(P, box, 'amber: measured · green: prediction, this pointer · dashed: j/|ψ|² (ideal weak pointer)');
}

function updateResults() {
  const set = (k, v) => { const o = document.querySelector(`[data-result="${k}"]`); if (o) o.value = v; };
  if (!exp) return;
  set('runs', exp.runs.toLocaleString('en-US'));
  set('planes', !map ? '—' : map.done ? `${N_PLANES} of ${N_PLANES}` : `${map.planes.length} of ${N_PLANES} (pair ${map.index + 1} running)`);
  set('pair', `${nm(exp.x1 - p.wall).toFixed(0)} → ${nm(exp.x2 - p.wall).toFixed(0)} nm`);
  // Stage 1 has no post-selection: show only the rows that mean something.
  document.querySelectorAll('[data-stage-rows]').forEach((el) => { el.hidden = !el.dataset.stageRows.split(' ').includes(state.stage); });
  const i = state.selected;
  const a = -Y_HALF + i * 2 * Y_HALF / N_BINS;
  set('strip', `${nm(a).toFixed(0)} to ${nm(a + 2 * Y_HALF / N_BINS).toFixed(0)} nm`);
  const n = exp.bins.count[i];
  set('inStrip', n.toLocaleString('en-US'));
  const b = M.binVelocities(exp.bins, exp.dtau, 30)[i];
  set('meanY', b ? `${nm(exp.bins.sumY[i] / n).toFixed(1)} nm` : '—');
  set('vMeas', b ? `${fmtS(b.v / p.k)} ± ${(b.err / p.k).toFixed(3)}` : '—');
  set('vExp', exp.expected[i] ? fmtS(exp.expected[i].v / p.k) : '—');
  set('vCur', fmtS(exp.binCur[i]));
}

// Plot titles name the pair of planes in stage 3.
function updateTitles() {
  const suffix = map ? ` · pair ${Math.min(map.index + 1, N_PLANES)} of ${N_PLANES}` : '';
  const t1 = (state.shiftView ? 'Shift: y_f − mean Y' : 'Runs: pointer Y vs y_f') + suffix;
  const t2 = 'Velocity: slope v_y/v_x' + suffix;
  const a = panels.scatter.el.querySelector('.fp-title'), b = panels.vel.el.querySelector('.fp-title');
  if (a.textContent !== t1) a.textContent = t1;
  if (b.textContent !== t2) b.textContent = t2;
}
function sizeCanvas(cv, c) {
  const ratio = devicePixelRatio || 1, W = cv.clientWidth, H = cv.clientHeight;
  if (W < 40 || H < 40) return null;
  if (cv.width !== Math.round(W * ratio) || cv.height !== Math.round(H * ratio)) { cv.width = Math.round(W * ratio); cv.height = Math.round(H * ratio); }
  c.setTransform(ratio, 0, 0, ratio, 0, 0);
  return { W, H };
}
function render() {
  const P = palette();
  const mt = $('.map-toggles'), mapped = !!map?.done;
  if (mt.hidden === mapped) mt.hidden = !mapped;
  // Short switch labels when the drawing is narrow, so they stay on one row.
  const narrow = canvas.clientWidth < 640;
  if (mt.dataset.narrow !== String(narrow)) {
    mt.dataset.narrow = String(narrow);
    const L = narrow ? { arrows: 'Arrows', lines: 'Lines', bohm: 'j/|ψ|² flow lines' } : { arrows: 'Measured arrows', lines: 'Lines through the arrows', bohm: 'j/|ψ|² flow lines (trajectories in pilot-wave)' };
    mt.querySelectorAll('[data-maptoggle]').forEach((b) => { b.textContent = L[b.dataset.maptoggle]; });
  }
  const m = sizeCanvas(canvas, mainCtx);
  if (!m) return;
  ctx = mainCtx;
  ctx.fillStyle = P.bg; ctx.fillRect(0, 0, m.W, m.H);
  drawApparatus(P, { x: 10, y: 8, w: m.W - 20, h: m.H - 14 });
  for (const [k, pnl] of Object.entries(panels)) {
    if (!pnl.open || pnl.min) continue;
    ctx = pnl.ctx || (pnl.ctx = pnl.cv.getContext('2d'));
    const s = sizeCanvas(pnl.cv, ctx);
    if (!s) continue;
    ctx.fillStyle = P.panel; ctx.fillRect(0, 0, s.W, s.H);
    (k === 'scatter' ? drawScatter : drawVelocity)(P, plotBox(s.W, s.H));
  }
  ctx = mainCtx;
  syncOverlays();
}

// ---------------------------------------------------------------- main loop
let lastT = performance.now();
function frame(now) {
  const dt = Math.min(0.1, (now - lastT) / 1000); lastT = now;
  if (pending && !drag) rebuild();
  if (state.waveMode !== 'density' && (state.running || (state.stage === 'one' && !exp?.runs))) phaseClock = (phaseClock + dt * state.speed * 2 * Math.PI / 0.8) % (2 * Math.PI);
  if (state.running && exp) {
    if (state.stage === 'one') {
      if (!anim) anim = makeRunAnim(M.sampleRun(exp.table));
      anim.t += dt * state.speed / RUN_SECONDS;
      if (anim.t >= 1) { addRun(exp, anim.run); anim = null; }
    } else if (state.stage === 'many') {
      // One schedule for the drawing and the plots: the collection takes about
      // MANY_SECONDS at speed 1, starting slowly (cubic) so the first points
      // appear one by one; both end together when the last run is in.
      exp.clock = Math.min(1, (exp.clock || 0) + dt * state.speed / MANY_SECONDS);
      const want = Math.ceil(state.perPlane * exp.clock ** 3);
      const n = Math.min(150000, Math.max(0, want - exp.runs));
      for (let i = 0; i < n && exp.runs < state.perPlane; i++) addRun(exp, M.sampleRun(exp.table));
      if (exp.runs >= state.perPlane) { stop(); showNext(); }
    } else if (map && !map.done) {
      const n = Math.min(state.perPlane - exp.runs, Math.round(60000 * state.speed));
      for (let i = 0; i < n; i++) addRun(exp, M.sampleRun(exp.table));
      if (exp.runs >= state.perPlane) finishPlane();
    }
  }
  try { render(); } catch (err) { console.error(err); }
  // Caption, Results and plot titles update together, so their counts agree.
  if (now - lastLive > 0 || pending) { lastLive = now; const lt = liveText(); if (lt !== lastLiveHtml) { lastLiveHtml = lt; $('#liveLine').innerHTML = lt; } updateResults(); updateTitles(); }
  requestAnimationFrame(frame);
}

// Distance scale (hidden by default), coordinate grid and distance measurement,
// from the shared template, as in the analytical double-slit app. Lengths in nm;
// x is measured from the slits, y upward from the axis.
const drawHost = $('.canvas-main');
const fmtLen = (v) => Math.abs(v) >= 1e3 ? `${Number((v / 1e3).toPrecision(4))} µm` : `${Number(v.toPrecision(4))} nm`;
// Lengths per CSS pixel and the world bounds of the whole drawing canvas.
function drawBounds() {
  if (!appMap) return null;
  const m = appMap, W = drawHost.clientWidth, H = drawHost.clientHeight;
  const ux = (m.x1 - m.x0) / m.box.w, uy = 2 * m.Yh / (m.box.h - 44);
  const xAt = (px) => nm(m.x0 + (px - m.box.x) * ux - p.wall), yAt = (py) => nm(m.Yh - (py - m.box.y - 26) * uy);
  return { xMin: xAt(0), xMax: xAt(W), yMin: yAt(H), yMax: yAt(0), ux: nm(ux), uy: nm(uy) };
}
const distanceScale = mountDistanceScale({
  host: drawHost, storageKey: 'qontic-weak-velocity-scale-position', format: fmtLen,
  // Default at the bottom right, clear of the slits, the beam and the stage-3 switches (it can be dragged).
  defaultPosition: ({ hostWidth, hostHeight, width, height }) => ({ x: hostWidth - width - 10, y: hostHeight - height - 30 }),
  getUnitsPerPixel: () => { const b = drawBounds(); return b ? { x: b.ux, y: b.uy } : { x: 0, y: 0 }; },
});
let scaleShown = false;
try { scaleShown = localStorage.getItem('qontic-weak-velocity-scale-visible') === 'true'; } catch (e) { /* ignore */ }
distanceScale.setVisible(scaleShown);
const coordinateTools = mountCoordinateTools({
  host: drawHost, storageKey: 'qontic-weak-velocity-grid-visible', formatValue: fmtLen, yUp: true,
  getBounds: () => drawBounds(),
});
let overlayKey = '';
function syncOverlays() {
  const b = drawBounds();
  if (!b) return;
  const key = [b.xMin, b.xMax, b.yMin, b.yMax].map((v) => v.toFixed(3)).join();
  if (key === overlayKey) return;
  overlayKey = key; distanceScale.update(); coordinateTools.update();
}
const scaleCanvas = () => (distanceScale.getVisible() ? [distanceScale.canvas] : []);
const media = mountQonticMedia({
  stage: $('.visualization'),
  controls: controlsEl,
  scaleControl: {
    getVisible: () => distanceScale.getVisible(),
    setVisible: (v) => { distanceScale.setVisible(v); try { localStorage.setItem('qontic-weak-velocity-scale-visible', String(v)); } catch (e) { /* ignore */ } },
  },
  coordinateControl: coordinateTools,
  getCanvases: () => [canvas, ...(coordinateTools.canvas.hidden ? [] : [coordinateTools.canvas]), ...scaleCanvas(), ...Object.values(panels).filter((pn) => pn.open && !pn.min).map((pn) => pn.cv)],
  filename: 'weak-velocity',
  getShareUrl: shareUrl,
  beginRecording: () => { const was = state.running; if (!was) start(); return was; },
  endRecording: (was) => { if (!was) stop(); },
});
// Edit geometry: a toolbar button, as in the analytical double-slit app. The
// handles appear only while it is pressed; right-click on the drawing also
// toggles it, and Escape leaves it.
const editButton = (() => {
  const toolbar = document.querySelector('.qontic-media-toolbar');
  if (!toolbar) return null;
  const b = document.createElement('button'); b.type = 'button'; b.className = toolbar.querySelector('button').className;
  b.setAttribute('aria-label', 'Edit geometry'); b.setAttribute('aria-pressed', 'false');
  b.title = 'Edit geometry · right-click the drawing. Drag the screen, the slits or the planes; Escape exits.';
  b.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M15 5l4 4M4 20l4-1L20 7a2.8 2.8 0 0 0-4-4L4 15z"/></svg>';
  toolbar.insertBefore(b, toolbar.querySelector('[role=status]'));
  return b;
})();
function setEditing(on) {
  editing = on;
  editButton?.setAttribute('aria-pressed', String(on));
  if (!on) { hover = null; canvas.style.cursor = ''; if (drag) endDrag(); }
}
editButton?.addEventListener('click', () => setEditing(!editing));
canvas.addEventListener('contextmenu', (e) => { e.preventDefault(); setEditing(!editing); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && editing) { e.preventDefault(); setEditing(false); } }, true);

mountQonticShortcuts({
  togglePlayback: () => (state.running ? stop() : start()),
  reset: () => { stop(); pending = true; },
  screenshot: () => document.querySelector('.qontic-media-toolbar button[aria-label="Screenshot"]')?.click(),
});

loadPanels();
syncGeometryInputs();
// A shared link is checked against the same limits as the Advanced controls.
{
  const askedSep = urlAsked.separation ?? (Object.keys(urlAsked).length ? GEO_DEFAULT.separation : 0);
  if (geo.separation === 0 && askedSep > 0) {
    Object.assign(geo, GEO_DEFAULT); syncGeometryInputs();
    urlNote = 'The link asked for a geometry with no room for two slits; the default geometry is used.';
  } else {
    const cur = (k) => (k in geo ? geo[k] : k === 'runs' ? state.perPlane : state[k]);
    const changed = Object.keys(urlAsked).filter((k) => cur(k) !== urlAsked[k]);
    const name = (k) => (DRAG_LABEL[k] || GEO_LABEL[k] || { sw: 'Pointer spread', runs: 'Runs per pair of planes' }[k] || k).toLowerCase();
    if (changed.length) urlNote = `The link's ${changed.map((k) => `${name(k)} (${urlAsked[k]} → ${cur(k)})`).join(', ')} ${changed.length > 1 ? 'were' : 'was'} adjusted to the allowed range.`;
  }
  if (urlBadStage) urlNote = `${urlNote} The link's stage "${urlBadStage}" is unknown; stage 1 is shown.`.trim();
  if (urlNote) $('#geoNote').textContent = `${urlNote} ${$('#geoNote').textContent}`;
}
applyGeometry();
document.querySelectorAll('[data-wavemode]').forEach((o) => { const on = o.dataset.wavemode === state.waveMode; o.classList.toggle('active', on); o.setAttribute('aria-pressed', String(on)); });
$('#perPlane').value = RUNS.indexOf(state.perPlane); $('#perPlaneOut').value = fmtRuns(state.perPlane);
updateText();
showStep(new URLSearchParams(location.search).has('stage') ? 'live' : 'setup');
requestAnimationFrame(frame);
