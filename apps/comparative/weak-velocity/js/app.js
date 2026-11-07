import '../../../../shared/qontic-controls.js?v=3.2';
import { mountQonticShell } from '../../../../shared/qontic-shell.js?v=3.7';
import { mountQonticMedia } from '../../../../shared/qontic-media.js?v=3.0';
import { mountQonticShortcuts } from '../../../../shared/qontic-shortcuts.js?v=1';
import { APP_RELEASE } from './release.js?v=0.3.1';
import * as M from './weak-model.js?v=0.3.1';
import { maximumCoreSafeSeparation } from '../../double-slit-analytical/js/source-packet-model.js?cache=20261101';

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
const N_BINS = 40;           // strips across the screen (20 nm for an 800 nm screen)
const N_PLANES = 12;
const SCATTER_N = 4000;
const PLANE_POINTS = 6000; // runs kept as points beside the planes
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
  show: { wave: true, arrows: true, current: true, expected: true, bohm: false, scatter: true, planeRuns: true },
  selected: null,
};
let exp = null;              // current pair of planes
let map = null;              // stage 3 state
let anim = null;             // stage 1 run animation
let pending = true;          // rebuild needed
let waveImage = null, waveTheme = null;
let lastLive = 0;

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
  for (let i = 0; i < rho.length; i++) if (rho[i][1] > 0.05 * rMax) vmax = Math.max(vmax, Math.abs(curCurve[i][1]));
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

function addRun(e, run) {
  M.addToBins(e.bins, run);
  if (e.ptsN < PLANE_POINTS) { e.ptsY[e.ptsN] = run.Y; e.ptsYf[e.ptsN] = run.yf; e.ptsU[e.ptsN] = Math.random(); e.ptsN++; }
  e.runs++;
  e.scatter[e.scatterHead * 2] = run.yf; e.scatter[e.scatterHead * 2 + 1] = run.Y;
  e.scatterHead = (e.scatterHead + 1) % SCATTER_N; e.scatterN = Math.min(SCATTER_N, e.scatterN + 1);
}

function planeX1(i) { const d = geo.distance; return 0.02 * d + i * (d - state.gap - 0.02 * d) / (N_PLANES - 1); }

function rebuild() {
  pending = false;
  anim = null;
  if (state.stage === 'map') {
    map = { index: 0, planes: [], done: false, lines: null, bohm: null };
    exp = makeExperiment(planeX1(0));
  } else {
    map = null;
    exp = makeExperiment(state.x1);
  }
  if (state.selected === null) state.selected = binOf(Math.min(1.0, Y_HALF / 4));
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
  const starts = [];
  const nLines = 20; // even, so no start falls on the median between the two slit packets
  for (let q = 0; q < nLines; q++) {
    let target = (q + 0.5) / nLines * total, acc = 0;
    for (let i = 0; i < N_BINS; i++) {
      if (acc + counts[i] >= target) { starts.push(-Y_HALF + (i + (target - acc) / Math.max(1, counts[i])) * w); break; }
      acc += counts[i];
    }
  }
  const x0 = planes[0].x, xEnd = planes.at(-1).x;
  // Keep only starts where the first plane has a measured velocity.
  for (let i = starts.length - 1; i >= 0; i--) if (planes[0].vAt(starts[i]) === null) starts.splice(i, 1);
  map.lines = starts.map((y0) => M.integrateField(planes, 1, y0, x0, xEnd, 300));
  map.bohm = starts.map((y0) => M.bohmTrajectory(T0, p.k, p.wall, y0, xEnd, 300, x0));
  // Equal-probability positions of |psi|^2 on the screen, for the check.
  const tS = M.propagate(T0, (p.screen - p.wall) / p.k), ys = [], cum = [];
  let s = 0;
  for (let i = 0; i <= 800; i++) { const y = -Y_HALF - 1 + i * (2 * Y_HALF + 2) / 800; s += M.density(tS, y); ys.push(y); cum.push(s); }
  map.screenQuantiles = Array.from({ length: nLines }, (_, q) => { const t = (q + 0.5) / nLines * s; const i = cum.findIndex((c) => c >= t); return ys[Math.max(0, i)]; });
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
  $('#x1Row').style.display = state.stage === 'map' ? 'none' : '';
  $('#runsRow').style.display = state.stage === 'one' ? 'none' : '';
  document.querySelectorAll('[data-stage]').forEach((b) => {
    const on = b.dataset.stage === state.stage;
    b.classList.toggle('active', on); b.setAttribute('aria-pressed', String(on));
  });
}

function liveText() {
  if (!exp) return '';
  const N = exp.runs.toLocaleString('en-US');
  if (state.stage === 'one') {
    return exp.runs === 0
      ? 'Press <b>Run</b>. Watch the pointer move, then the screen click. One run gives two numbers.'
      : `${N} runs. The amber marker on the weak plane's scale is the pointer reading, with its spread of ±${state.sw} nm. It is a reading of the pointer, not a sighting of the particle: the spread is wider than the whole pattern, so one run says almost nothing about where the particle was.`;
  }
  if (state.stage === 'many') {
    const b = M.binVelocities(exp.bins, exp.dtau)[state.selected];
    const bw = 2 * Y_HALF / N_BINS, strip = `${nm(-Y_HALF + state.selected * bw).toFixed(0)} to ${nm(-Y_HALF + (state.selected + 1) * bw).toFixed(0)} nm`;
    const tail = b ? ` Beside the planes: pointer readings (amber, left of the weak plane) and detections (cyan, between the planes), one point per run. The amber dot is the mean pointer reading for the selected strip, the cyan dot the mean detected position. In the strip ${strip}, the pointer averages <b>${(nm(b.y - b.v * exp.dtau)).toFixed(1)} nm</b> while the particle is detected at ${nm(b.y).toFixed(1)} nm: it moved by ${(nm(b.v * exp.dtau)).toFixed(1)} ± ${(nm(b.err * exp.dtau)).toFixed(1)} nm across the ${state.gap} nm gap.` : ' Click a strip in either plot to post-select on it.';
    return `${N} of ${state.perPlane.toLocaleString('en-US')} runs.${tail}`;
  }
  if (map && !map.done) return `Plane ${map.index + 1} of ${N_PLANES}: ${N} of ${state.perPlane.toLocaleString('en-US')} runs. Each pair of planes is a separate experiment with fresh particles.`;
  if (map && map.done) return state.sw < 40
    ? `All ${N_PLANES} planes mapped with a strong pointer (${state.sw} nm). The coupling disturbs the wave, so the arrows follow the green curve, not j/|ψ|². The lines are not those of the undisturbed experiment: compare with the weak pointer.`
    : `All ${N_PLANES} planes mapped. The amber lines follow the measured arrows. Their ends on the screen (ticks on the right) should sit at equal-probability positions of |ψ|² (grey ticks).`;
  return '';
}

function showNext() {
  const box = $('#nextSteps');
  box.innerHTML = '';
  const add = (label, fn) => { const b = document.createElement('button'); b.type = 'button'; b.className = 'qontic-app-toggle'; b.textContent = label; b.addEventListener('click', fn); box.append(b); };
  if (state.stage === 'one') add('Next: many runs', () => setStage('many', true));
  if (state.stage === 'many') add('Next: map the field', () => setStage('map', true));
  if (state.stage === 'map' && map?.done) {
    if (state.sw >= 40) add('Repeat with a strong pointer (10 nm)', () => { setSw(10); setStage('map', true); });
    else add('Repeat with a weak pointer (200 nm)', () => { setSw(200); setStage('map', true); });
    add(state.show.arrows ? 'Hide the arrows' : 'Show the arrows', () => { toggle('arrows'); showNext(); });
    add(state.show.bohm ? 'Hide pilot-wave trajectories' : 'Compare with pilot-wave trajectories', () => { toggle('bohm'); showNext(); });
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
  document.querySelector(`[data-toggle="${key}"]`)?.setAttribute('aria-pressed', String(state.show[key]));
}

document.querySelectorAll('[data-stage]').forEach((b) => b.addEventListener('click', () => setStage(b.dataset.stage)));
document.querySelectorAll('[data-toggle]').forEach((b) => b.addEventListener('click', () => { toggle(b.dataset.toggle); if (state.stage === 'map') showNext(); }));
$('#sw').addEventListener('input', (e) => { state.sw = +e.target.value; pending = true; updateText(); });
$('#x1').addEventListener('input', (e) => { state.x1 = +e.target.value; if (state.stage !== 'map') pending = true; updateText(); });
$('#gap').addEventListener('input', (e) => { state.gap = +e.target.value; pending = true; updateText(); });
$('#perPlane').addEventListener('change', (e) => { state.perPlane = +e.target.value; if (state.stage === 'map' || (exp && exp.runs > state.perPlane)) pending = true; });
$('#showSetup').addEventListener('click', () => { stop(); showStep('setup'); });
$('#setupGo').addEventListener('click', () => setStage('one', true));

function stop() { state.running = false; controlsEl.setAttribute('running', 'false'); }
function start() {
  if (map?.done) pending = true;
  if (state.stage === 'many' && exp && exp.runs >= state.perPlane) pending = true;
  state.running = true; controlsEl.setAttribute('running', 'true'); showStep('live');
}
controlsEl.addEventListener('qontic:start', () => start());
controlsEl.addEventListener('qontic:stop', () => stop());
controlsEl.addEventListener('qontic:reset', () => { stop(); pending = true; });
controlsEl.addEventListener('qontic:speed', (e) => { state.speed = e.detail.speed; });
controlsEl.addEventListener('qontic:theme', () => { waveTheme = null; });
controlsEl.addEventListener('qontic:tab', (e) => {
  controlsEl.setAttribute('active-tab', e.detail.tab);
  document.querySelectorAll('[data-control-pane]').forEach((pn) => pn.classList.toggle('hidden', pn.dataset.controlPane !== e.detail.tab));
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
  // Click a strip in the plot to post-select on it.
  pn.cv.addEventListener('click', (e) => {
    const r = pn.cv.getBoundingClientRect(), box = plotBox(r.width, r.height), x = e.clientX - r.left;
    if (x < box.x || x > box.x + box.w) return;
    state.selected = binOf(-Y_HALF + (x - box.x) / box.w * 2 * Y_HALF);
    if (state.stage === 'one') setStage('many');
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
  for (const k of Object.keys(GEO_DEFAULT)) { const v = parseFloat(q.get(k)); if (Number.isFinite(v)) geo[k] = v; }
  if (q.get('bohm') === '1') state.show.bohm = true;
  $('#sw').value = state.sw; $('#x1').value = state.x1; $('#gap').value = state.gap;
  document.querySelector('[data-toggle="bohm"]').setAttribute('aria-pressed', String(state.show.bohm));
}
function shareUrl() {
  const u = new URL(location.href);
  const g = {}; for (const k of Object.keys(GEO_DEFAULT)) if (geo[k] !== GEO_DEFAULT[k]) g[k] = geo[k];
  u.search = new URLSearchParams({ stage: state.stage, sw: state.sw, x1: state.x1, gap: state.gap, ...g, ...(state.show.bohm ? { bohm: 1 } : {}) }).toString();
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

// |psi|^2 behind the wall, each column scaled to its own maximum.
function buildWaveImage(P) {
  const nx = 300, ny = 200, img = new ImageData(nx, ny);
  for (let i = 0; i < nx; i++) {
    const x = p.wall + (i + 0.5) / nx * (p.screen - p.wall), t = M.propagate(T0, (x - p.wall) / p.k), col = [];
    let mx = 0;
    for (let j = 0; j < ny; j++) { const y = Y_HALF - (j + 0.5) / ny * 2 * Y_HALF, r = M.density(t, y); col.push(r); mx = Math.max(mx, r); }
    for (let j = 0; j < ny; j++) {
      const a = Math.pow(col[j] / mx, 0.6), k = (j * nx + i) * 4;
      img.data[k] = P.wave[0]; img.data[k + 1] = P.wave[1]; img.data[k + 2] = P.wave[2]; img.data[k + 3] = Math.round(255 * a * (P.light ? 0.55 : 0.6));
    }
  }
  const off = document.createElement('canvas'); off.width = nx; off.height = ny;
  off.getContext('2d').putImageData(img, 0, 0);
  waveImage = off; waveTheme = P.light;
}

function text(s, x, y, { color, size = 12, align = 'left', base = 'alphabetic', weight = 400 } = {}) {
  ctx.fillStyle = color; ctx.font = `${weight} ${size}px Inter, Arial, sans-serif`; ctx.textAlign = align; ctx.textBaseline = base; ctx.fillText(s, x, y);
}

// ---------------------------------------------------------------- drag the geometry on the drawing
// Handles, as in the analytical double-slit app: drag the screen sideways
// (slits-to-screen distance) or its ends (screen length); drag a slit up or
// down (separation) or its edge (slit width); drag the weak or strong plane.
let appMap = null, drag = null, hover = null;
const GRIP = 9;
function handles() {
  if (!appMap) return [];
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
canvas.addEventListener('pointermove', (e) => {
  const [px, py] = pointerPos(e);
  if (drag) { dragMove(px, py); return; }
  hover = hitHandle(px, py);
  canvas.style.cursor = hover ? CURSOR[hover.kind] : '';
});
canvas.addEventListener('pointerleave', () => { if (!drag) { hover = null; canvas.style.cursor = ''; } });
canvas.addEventListener('pointerdown', (e) => {
  const [px, py] = pointerPos(e), h = hitHandle(px, py);
  if (!h) return;
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
  if (state.show.wave && waveImage) {
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(waveImage, X(p.wall), Yp(Y_HALF), X(p.screen) - X(p.wall), Yp(-Y_HALF) - Yp(Y_HALF));
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
  const sbu = niceStep(D / 10), sb = X(p.wall + sbu) - X(p.wall), sbx = X(p.wall) + sb / 2 + 10;
  ctx.strokeStyle = P.muted; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(sbx - sb / 2, box.y + 12); ctx.lineTo(sbx + sb / 2, box.y + 12); ctx.stroke();
  text(`${nm(sbu).toFixed(0)} nm`, sbx, box.y + 24, { color: P.muted, size: 10, align: 'center' });

  // measured arrows
  const arrowsFrom = [];
  if (map) map.planes.forEach((pl) => arrowsFrom.push({ x: pl.x2, est: pl.est }));
  if (exp && (state.stage === 'many' || (map && !map.done))) {
    const est = M.binVelocities(exp.bins, exp.dtau, state.stage === 'many' ? 2000 : 200).map((b) => (b ? { y: b.y, s: b.v / p.k, err: b.err / p.k } : null));
    arrowsFrom.push({ x: exp.x2, est, live: true });
  }
  const L = Math.max(14, Math.min(26, box.w / 32));
  if (state.show.arrows) for (const a of arrowsFrom) for (const e of a.est) {
    if (!e) continue;
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
    ctx.strokeStyle = P.line; ctx.lineWidth = 1.8; map.lines.forEach(path);
    if (state.show.bohm) {
      // Pilot-wave trajectories from the same starting points, drawn on top.
      ctx.strokeStyle = P.bohm; ctx.lineWidth = 1.7; ctx.setLineDash([6, 4]); map.bohm.forEach(path); ctx.setLineDash([]);
    }
    // key
    const kx = X(p.wall) + 14, ky = Yp(-Y_HALF) - 10;
    ctx.fillStyle = P.light ? 'rgba(241,246,248,0.88)' : 'rgba(11,28,41,0.88)'; ctx.fillRect(kx - 6, ky - (state.show.bohm ? 30 : 15), 300, state.show.bohm ? 36 : 21);
    ctx.lineWidth = 1.8; ctx.strokeStyle = P.line; ctx.beginPath(); ctx.moveTo(kx, ky - 4); ctx.lineTo(kx + 22, ky - 4); ctx.stroke();
    text('lines through the measured arrows', kx + 30, ky, { color: P.text, size: 11 });
    if (state.show.bohm) {
      ctx.lineWidth = 1.7; ctx.strokeStyle = P.bohm; ctx.setLineDash([6, 4]); ctx.beginPath(); ctx.moveTo(kx, ky - 19); ctx.lineTo(kx + 22, ky - 19); ctx.stroke(); ctx.setLineDash([]);
      text('pilot-wave trajectories, same starts', kx + 30, ky - 15, { color: P.text, size: 11 });
    }
    // screen check: measured end points vs equal-probability positions
    const sx = X(p.screen);
    ctx.lineWidth = 2;
    map.lines.forEach((ln) => { const [xe, ye] = ln.at(-1); if (Math.abs(xe - p.screen) < 0.05) { ctx.strokeStyle = P.line; ctx.beginPath(); ctx.moveTo(sx + 3, Yp(ye)); ctx.lineTo(sx + 14, Yp(ye)); ctx.stroke(); } });
    ctx.strokeStyle = P.muted;
    map.screenQuantiles.forEach((y) => { ctx.beginPath(); ctx.moveTo(sx + 16, Yp(y)); ctx.lineTo(sx + 26, Yp(y)); ctx.stroke(); });
  }
  // screen |psi|^2 profile
  {
    const tS = M.propagate(T0, (p.screen - p.wall) / p.k); let mx = 0; const pr = [];
    for (let i = 0; i <= 200; i++) { const y = -Y_HALF + i * 2 * Y_HALF / 200, r = M.density(tS, y); pr.push([y, r]); mx = Math.max(mx, r); }
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
    if (exp.runs > n) text(`points: first ${n.toLocaleString('en-US')} of ${exp.runs.toLocaleString('en-US')} runs`, xw - 6, bot + 13, { color: P.muted, size: 10, align: 'right' });
  }
  // Selected strip: mean pointer reading on the weak plane, joined to the mean
  // detected position on the strong plane. The slope of this step is the arrow.
  if (exp && state.stage !== 'one' && !(map?.done) && state.selected !== null) {
    const i = state.selected, n = exp.bins.count[i];
    if (n >= 200) {
      const mY = exp.bins.sumY[i] / n, mYf = exp.bins.sumYf[i] / n;
      const err = Math.sqrt(Math.max(0, exp.bins.sumY2[i] / n - mY * mY) / n);
      const xw = X(exp.x1), xs = X(exp.x2);
      ctx.strokeStyle = P.weak; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(xw, Yp(mY + err)); ctx.lineTo(xw, Yp(mY - err)); ctx.stroke();
      ctx.fillStyle = P.weak; ctx.beginPath(); ctx.arc(xw, Yp(mY), 4.5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = P.strong; ctx.beginPath(); ctx.arc(xs, Yp(mYf), 4.5, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = P.text; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(xw, Yp(mY)); ctx.lineTo(xs, Yp(mYf)); ctx.stroke();
      text(`mean pointer reading ${nm(mY).toFixed(1)} nm`, xw - 9, Yp(mY) - 8, { color: P.weak, size: 11, align: 'right' });
      text(`mean detected ${nm(mYf).toFixed(1)} nm`, xw - 9, Yp(mYf) + 16, { color: P.strong, size: 11, align: "right" });
    }
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
  const t = anim.t;
  const ease = (u) => u <= 0 ? 0 : u >= 1 ? 1 : u * u * (3 - 2 * u);
  if (t > 0.1 && t < 0.5) { ctx.strokeStyle = P.weak; ctx.globalAlpha = 0.35; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(xw, top); ctx.lineTo(xw, bot); ctx.stroke(); ctx.globalAlpha = 1; }
  // Marker slides from the pointer's zero to the reading.
  const Yr = anim.run.Y * ease((t - 0.15) / 0.3), yc = Yp(Yr), cl = (v) => Math.max(top, Math.min(bot, v));
  const settled = t > 0.45;
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
  if (t > 0.55) {
    const r = t < 0.75 ? 4 + 20 * (t - 0.55) : 6;
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

function legend(P, box, s) {
  ctx.font = '400 10px Inter, Arial, sans-serif';
  const w = Math.min(box.w - 8, ctx.measureText(s).width + 10);
  ctx.fillStyle = P.light ? 'rgba(241,246,248,0.85)' : 'rgba(11,28,41,0.85)';
  ctx.fillRect(box.x + box.w - w - 4, box.y + 3, w, 15);
  text(s, box.x + box.w - 9, box.y + 14, { color: P.muted, size: 10, align: 'right' });
}

function drawScatter(P, box) {
  const range = Y_HALF + 3 * state.sw / 100;
  const { X, V } = axes(P, box, 'Each run: pointer reading vs detected position', 'pointer reading Y (nm)', -range, range, (v) => nm(v).toFixed(0));
  ctx.save(); ctx.beginPath(); ctx.rect(box.x, box.y, box.w, box.h); ctx.clip();
  ctx.strokeStyle = P.muted; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(X(-Y_HALF), V(-Y_HALF)); ctx.lineTo(X(Y_HALF), V(Y_HALF)); ctx.stroke(); ctx.setLineDash([]);
  if (exp && state.show.scatter) {
    ctx.fillStyle = P.dots;
    const big = state.stage === 'one';
    for (let i = 0; i < exp.scatterN; i++) { const a = exp.scatter[2 * i], b = exp.scatter[2 * i + 1]; ctx.fillRect(X(a) - (big ? 2 : 1), V(b) - (big ? 2 : 1), big ? 4 : 2, big ? 4 : 2); }
    if (anim && anim.t > 0.75) { ctx.fillStyle = P.weak; ctx.beginPath(); ctx.arc(X(anim.run.yf), V(anim.run.Y), 5, 0, Math.PI * 2); ctx.fill(); }
  }
  // strip means (pointer averages)
  if (exp && state.stage !== 'one') {
    const est = M.binVelocities(exp.bins, exp.dtau, 50);
    ctx.fillStyle = P.arrow;
    est.forEach((b) => { if (b) { ctx.beginPath(); ctx.arc(X(b.y), V(b.y - b.v * exp.dtau), 2.5, 0, Math.PI * 2); ctx.fill(); } });
  }
  ctx.restore();
  legend(P, box, 'dashed: Y = y_f · amber: mean Y in each strip');
  if (exp && exp.runs) {
    const s = exp.runs <= SCATTER_N ? `all ${exp.runs.toLocaleString('en-US')} runs shown` : `last ${SCATTER_N.toLocaleString('en-US')} of ${exp.runs.toLocaleString('en-US')} runs shown; strip means use all`;
    ctx.font = '400 10px Inter, Arial, sans-serif';
    const w = ctx.measureText(s).width + 10;
    ctx.fillStyle = P.light ? 'rgba(241,246,248,0.85)' : 'rgba(11,28,41,0.85)'; ctx.fillRect(box.x + 4, box.y + box.h - 18, w, 15);
    text(s, box.x + 9, box.y + box.h - 7, { color: P.muted, size: 10 });
  }
}

function drawVelocity(P, box) {
  const vm = exp ? exp.vmax : 0.3;
  const { X, V } = axes(P, box, 'Velocity from post-selected averages', 'direction v_y / v_x', -vm, vm, (v) => v.toFixed(2));
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
  legend(P, box, 'amber: measured · green: exact, this pointer · dashed: j/|ψ|²');
}

function updateResults() {
  const set = (k, v) => { const o = document.querySelector(`[data-result="${k}"]`); if (o) o.value = v; };
  if (!exp) return;
  set('runs', exp.runs.toLocaleString('en-US'));
  set('planes', map ? `${map.planes.length} of ${N_PLANES}` : '—');
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

function sizeCanvas(cv, c) {
  const ratio = devicePixelRatio || 1, W = cv.clientWidth, H = cv.clientHeight;
  if (W < 40 || H < 40) return null;
  if (cv.width !== Math.round(W * ratio) || cv.height !== Math.round(H * ratio)) { cv.width = Math.round(W * ratio); cv.height = Math.round(H * ratio); }
  c.setTransform(ratio, 0, 0, ratio, 0, 0);
  return { W, H };
}
function render() {
  const P = palette();
  const m = sizeCanvas(canvas, mainCtx);
  if (!m) return;
  ctx = mainCtx;
  ctx.fillStyle = P.bg; ctx.fillRect(0, 0, m.W, m.H);
  if (waveTheme !== P.light) buildWaveImage(P);
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
  updateResults();
}

// ---------------------------------------------------------------- main loop
let lastT = performance.now();
function frame(now) {
  const dt = Math.min(0.1, (now - lastT) / 1000); lastT = now;
  if (pending && !drag) rebuild();
  if (state.running && exp) {
    if (state.stage === 'one') {
      if (!anim) anim = { t: 0, run: M.sampleRun(exp.table) };
      anim.t += dt * state.speed / 1.6;
      if (anim.t >= 1) { addRun(exp, anim.run); anim = null; }
    } else if (state.stage === 'many') {
      // While the points beside the planes fill in, runs start slowly and
      // accelerate (about 2 s at speed 1), so the hits appear in sequence.
      let n = Math.round(15000 * state.speed);
      if (exp.ptsN < PLANE_POINTS) { exp.ramp = (exp.ramp || 1) * (1 + 0.04 * state.speed); n = Math.max(1, Math.min(n, Math.floor(exp.ramp * state.speed))); }
      for (let i = 0; i < n && exp.runs < state.perPlane; i++) addRun(exp, M.sampleRun(exp.table));
      if (exp.runs >= state.perPlane) { stop(); showNext(); }
    } else if (map && !map.done) {
      const n = Math.min(state.perPlane - exp.runs, Math.round(60000 * state.speed));
      for (let i = 0; i < n; i++) addRun(exp, M.sampleRun(exp.table));
      if (exp.runs >= state.perPlane) finishPlane();
    }
  }
  try { render(); } catch (err) { console.error(err); }
  if (now - lastLive > 250) { lastLive = now; $('#liveLine').innerHTML = liveText(); }
  requestAnimationFrame(frame);
}

mountQonticMedia({
  stage: $('.visualization'),
  controls: controlsEl,
  getCanvases: () => [canvas, ...Object.values(panels).filter((pn) => pn.open && !pn.min).map((pn) => pn.cv)],
  filename: 'weak-velocity',
  getShareUrl: shareUrl,
  beginRecording: () => { const was = state.running; if (!was) start(); return was; },
  endRecording: (was) => { if (!was) stop(); },
});
mountQonticShortcuts({
  togglePlayback: () => (state.running ? stop() : start()),
  reset: () => { stop(); pending = true; },
  screenshot: () => document.querySelector('.qontic-media-toolbar button[aria-label="Screenshot"]')?.click(),
});

loadPanels();
syncGeometryInputs();
applyGeometry();
updateText();
showStep(new URLSearchParams(location.search).has('stage') ? 'live' : 'setup');
requestAnimationFrame(frame);
