import '../../../../shared/qontic-controls.js?v=3.2';
import { mountQonticShell } from '../../../../shared/qontic-shell.js?v=3.7';
import { mountQonticMedia } from '../../../../shared/qontic-media.js?v=3.0';
import { mountCoordinateTools, mountDistanceScale } from '../../../../shared/qontic-overlays.js?v=6';
import { mountQonticShortcuts } from '../../../../shared/qontic-shortcuts.js?v=1';
import { mountQonticLevels } from '../../../../shared/qontic-levels.js?v=1';
import { APP_RELEASE } from './release.js?v=0.9.7';
import * as M from './weak-model.js?v=0.9.7';
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
const GEO_DEFAULT = Object.freeze({ slits: 2, wavelength: 50, slitWidth: 30, separation: 300, wall: 225, distance: 1000, screen: 800, sourceWidth: 200 });
const geo = { ...GEO_DEFAULT };
const SLIT_EXTENT = 1.5;     // drawn opening ±1.5σ, as in the double-slit app
let p, T0, Y_HALF;
function applyGeometry() {
  p = M.modelParams(geo);
  T0 = M.wallTerms(p);
  Y_HALF = geo.screen / 200;
  N_BINS = M.measurementLayout(geo.screen, state.sw).nBins;
  state.arrowEvery = Math.ceil(N_BINS / 40) * (6 - +document.getElementById('arrowDensity').value);
  waveTheme = null;
}
const RUNS = [1e4, 2e4, 5e4, 1e5, 2e5, 5e5, 1e6, 2e6, 5e6, 1e7, 2e7, 5e7];   // runs per pair of planes (slider)
const fmtRuns = (n) => (n >= 1e6 ? `${n / 1e6}M` : `${n / 1e3}k`);
let N_BINS = 40;             // geometry-adapted strips, at most 20 nm wide
const N_PLANES = 12;
// Longitudinal packet: density standard deviation, state.packet in nm (50 nm
// by default, as in the double-slit app). Used by the Instants mode and the
// fixed-time curve.
const packetSigma = () => state.packet / 100;
const instant = () => state.timing === 'instant';
const SCATTER_N = 4000;
const PLANE_POINTS = 6000; // runs kept as points beside the planes
const MANY_SECONDS = 6;
const MAP_PAIR_SECONDS = 1.2;   // stage 3: collection time per plane pair at speed 1     // stage 2 collection time at speed 1
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
  show: { wave: true, arrows: true, lines: true, current: true, expected: true, fixedTime: false, bohm: false, scatter: true, planeRuns: true },
  selected: null, shiftView: false,
  labels: (() => { try { return localStorage.getItem('qontic-weak-velocity-labels') !== 'false'; } catch (e) { return true; } })(),   // explanatory labels in the drawing (Legend button)
  movingWave: false,
  equalScales: false,   // same nm-per-pixel both ways in the drawing   // crests travel all the time (the density of a steady beam does not move)
  panelKey: (() => { try { return JSON.parse(localStorage.getItem('qontic-weak-velocity-panel-keys')) || { scatter: true, vel: true }; } catch (e) { return { scatter: true, vel: true }; } })(),   // legends of the two plots
  win: { len: 100, wid: 10, x: 550, y: 50, pinned: false, trace: false },   // stage 4: window centre (nm behind the slits); full length along the beam and width across (nm)
  timing: 'plane', packet: 150, recx: false, cell: null,
  pauseEach: true,   // stage 1: stop after each run so it can be looked at   // measure at planes or at instants; packet length in nm
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
  const nYf = M.measurementLayout(geo.screen, state.sw).nYf;
  // Instants: a mixture over the particle's longitudinal offset within its
  // packet (each offset is a shifted plane pair). Planes: one table.
  let mix = null, table;
  if (instant()) {
    mix = M.mixtureTable({ terms0: T0, k: p.k, wallX: p.wall, x1c: x1, dtau, sw: state.sw / 100, yfMin: -Y_HALF, yfMax: Y_HALF, nYf, sigmaX: packetSigma(), xMax: p.screen });
    table = mix.parts[mix.central].table;
  } else table = M.jointTable({ terms1, dtau, sw: state.sw / 100, yfMin: -Y_HALF, yfMax: Y_HALF, nYf });
  // With the position along the beam recorded, runs are sorted by packet cell:
  // each cell is its own pair of planes (weak at x1c+Δ, strong at x2c+Δ).
  if (mix && (state.cell === null || state.cell >= mix.parts.length)) state.cell = mix.central;
  const only = mix && state.recx ? state.cell : null;
  const bins = M.makeBins(-Y_HALF, Y_HALF, N_BINS);
  const expected = mix ? M.expectedMixtureBinVelocities(mix, bins, only) : M.expectedBinVelocities(table, bins);
  const pred = mix ? M.mixtureCurves(mix, only) : { marginal: table.marginal, meanY: table.meanY };
  // Fine curves (slopes v_y / v_x) for the velocity plot.
  const rhoMax = Math.max(...Array.from(pred.marginal));
  const expCurve = [], curCurve = [], rho = [];
  for (let i = 0; i < table.nYf; i++) {
    const y = table.yf[i], r = M.density(terms2, y);
    rho.push([y, r]);
    curCurve.push([y, M.currentVelocity(terms2, y) / p.k]);
    if (pred.marginal[i] > 0.02 * rhoMax) expCurve.push([y, (y - pred.meanY[i]) / dtau / p.k]);
    else expCurve.push([y, null]);
  }
  // Fixed-time measurement recording only the transverse position (Wiseman's
  // timing, weak limit): j/|psi|^2 averaged over the planes the longitudinal
  // packet spans around the strong plane (see weak-model.js).
  const ftV = M.packetAveragedVelocity(T0, p.k, p.wall, x1 + state.gap / 100, Array.from(table.yf), packetSigma(), 41, { gapX: state.gap / 100, xMax: p.screen });
  const ftCurve = ftV.map((v, i) => [table.yf[i], v === null || !(pred.marginal[i] > 0.02 * rhoMax) ? null : v / p.k]);
  // Strip averages of the fixed-time curve (Results), weighted like the data.
  const binFt = [];
  for (let b = 0; b < N_BINS; b++) {
    let sw = 0, sv = 0;
    for (let i = 0; i < table.nYf; i++) { const y = table.yf[i]; if (y < -Y_HALF + b * bins.w || y >= -Y_HALF + (b + 1) * bins.w || ftV[i] === null) continue; sw += pred.marginal[i]; sv += pred.marginal[i] * ftV[i] / p.k; }
    binFt.push(sw > 0 ? sv / sw : null);
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
    x1, x2: x1 + state.gap / 100, dtau, terms1, terms2, table, mix, bins, expected, expCurve, curCurve, ftCurve, rho, rMax,
    vmax: vmax * 1.25, binCur, binFt, runs: 0, used: 0, detectedCounts: new Float64Array(table.nYf),
    scatter: new Float32Array(SCATTER_N * 2), scatterN: 0, scatterHead: 0,
    ptsY: new Float32Array(PLANE_POINTS), ptsYf: new Float32Array(PLANE_POINTS), ptsU: new Float32Array(PLANE_POINTS),
    ptsX: new Float32Array(PLANE_POINTS), ptsK: new Uint8Array(PLANE_POINTS), ptsS: new Uint8Array(PLANE_POINTS), ptsN: 0,
    cellBins: mix && state.recx ? mix.parts.map(() => M.makeBins(-Y_HALF, Y_HALF, N_BINS)) : null,
    cellCache: {},
  };
}
// Choose the packet cell (position along the beam) whose runs feed the strip
// averages, plots and Results; recompute its exact prediction curves.
function selectCell(j) {
  state.cell = j;
  if (!exp?.mix || !state.recx || !exp.cellBins) return;
  exp.bins = exp.cellBins[j];
  const c = exp.cellCache[j] || (exp.cellCache[j] = (() => {
    const expected = M.expectedMixtureBinVelocities(exp.mix, exp.bins, j), pred = M.mixtureCurves(exp.mix, j);
    const mx = Math.max(...Array.from(pred.marginal));
    const expCurve = Array.from(pred.yf, (y, i) => [y, pred.marginal[i] > 0.02 * mx ? (y - pred.meanY[i]) / exp.dtau / p.k : null]);
    // j/|psi|^2 at this cell's strong position, strip-averaged (ideal weak pointer)
    const t2 = M.propagate(T0, (exp.x2 + exp.mix.parts[j].dx - p.wall) / p.k), binCur = [];
    for (let b = 0; b < N_BINS; b++) { let s0 = 0, sv = 0; for (let q = 0; q < 20; q++) { const y = -Y_HALF + (b + (q + 0.5) / 20) * exp.bins.w, r = M.density(t2, y); s0 += r; sv += r * M.currentVelocity(t2, y) / p.k; } binCur.push(s0 > 0 ? sv / s0 : null); }
    const curCurve = Array.from(pred.yf, (y) => [y, M.currentVelocity(t2, y) / p.k]);
    return { expected, expCurve, binCur, curCurve };
  })());
  exp.expected = c.expected; exp.expCurve = c.expCurve; exp.binCur = c.binCur; exp.curCurve = c.curCurve;
  updateText();
}
const cellDx = () => (exp?.mix && state.recx ? (exp.mix.parts[state.cell ?? exp.mix.central]?.dx ?? 0) : 0);
// One run: at planes from the single table; at instants from the mixture
// (the run then also carries its longitudinal offset dx and cell index).
function sampleOne(e) { return e.mix ? M.sampleMixtureRun(e.mix) : M.sampleRun(e.table); }
// With "post-select on longitudinal position", only runs in the central cell
// (within about ±σ/4 of the packet centre) enter the strip averages.
const keptRun = (e, run) => !(e.mix && state.recx && run.slice !== state.cell);

// Stage 1 keeps every run as a point; later stages keep one run in `stride`.
const pointStride = () => (state.stage === 'one' ? 1 : Math.max(1, Math.floor(state.perPlane / PLANE_POINTS)));
function addRun(e, run) {
  hadRun = true;
  const kept = keptRun(e, run);
  if (e.cellBins) M.addToBins(e.cellBins[run.slice], run);   // every run, in its cell
  if (kept) {
    if (!e.cellBins) M.addToBins(e.bins, run);
    const cell = Math.min(e.table.nYf - 1, Math.max(0, Math.floor((run.yf + Y_HALF) / e.table.dYf)));
    e.detectedCounts[cell]++;
    e.used++;
  }
  // Points beside the planes: one run in every `stride`, so they fill in over the
  // whole collection and finish with it (6 000 points at the end).
  const stride = pointStride();
  if (e.runs % stride === 0 && e.ptsN < PLANE_POINTS) { e.ptsY[e.ptsN] = run.Y; e.ptsYf[e.ptsN] = run.yf; e.ptsU[e.ptsN] = Math.random(); e.ptsX[e.ptsN] = run.dx ?? 0; e.ptsK[e.ptsN] = kept ? 1 : 0; e.ptsS[e.ptsN] = run.slice ?? 0; e.ptsN++; }
  e.runs++;
  if (!kept) return;
  e.scatter[e.scatterHead * 2] = run.yf; e.scatter[e.scatterHead * 2 + 1] = run.Y;
  e.scatterHead = (e.scatterHead + 1) % SCATTER_N; e.scatterN = Math.min(SCATTER_N, e.scatterN + 1);
}

function planeX1(i) { const d = geo.distance; return 0.02 * d + i * (d - state.gap - 0.02 * d) / (N_PLANES - 1); }

function rebuild() {
  pending = false;
  anim = null; lastRun = null; shrink = null;
  if (state.stage === 'window') {
    map = null; exp = null; wf = makeWindowField();
    updateText(); showNext();
    return;
  }
  wf = null;
  if (state.stage === 'map') {
    map = { index: 0, planes: [], done: false, lines: null, bohm: null };
    exp = makeExperiment(planeX1(0));
  } else {
    map = null;
    exp = makeExperiment(state.x1);
  }
  if (exp?.cellBins) selectCell(state.stage === 'map' ? exp.mix.central : state.cell);
  // Default strip 40–60 nm: an inward slope well above the noise (about −0.34 ± 0.035 at 1M runs), next to the centre.
  if (state.selected === null) state.selected = binOf(0.5);
  updateText();
  showNext();   // buttons from a finished run must not outlive it
}
const binOf = (y) => Math.max(0, Math.min(N_BINS - 1, Math.floor((y + Y_HALF) / (2 * Y_HALF / N_BINS))));

// ---------------------------------------------------------------- stage 3: finish a plane, build lines
function finishPlane() {
  const est = M.binVelocities(exp.bins, exp.dtau, 200).map((b) => (b ? { y: b.y, s: b.v / p.k, err: b.err / p.k, n: b.n } : null));
  if (map.index === 0) map.startCounts = exp.detectedCounts;
  map.planes.push({ x2: exp.x2, est });
  map.index++;
  if (map.index < N_PLANES) { exp = makeExperiment(planeX1(map.index)); if (exp.cellBins) selectCell(exp.mix.central); return; }
  map.done = true;
  buildLines();
  stop();
  showNext();
}

function buildLines() {
  const result = M.reconstructFieldMap({
    planes: map.planes, counts: map.startCounts, yMin: -Y_HALF, yMax: Y_HALF, nLines: state.nLines,
    reference: (y0, x0, xEnd) => M.bohmTrajectory(T0, p.k, p.wall, y0, xEnd, 600, x0),
  });
  map.lines = result.lines; map.bohm = result.referenceLines;
  map.referenceEnds = result.referenceEnds;
  map.completedLines = result.completed; map.intendedLines = result.intended;
  map.endOffset = result.rms === null ? null : nm(result.rms);
}

// ---------------------------------------------------------------- times (electron)
// The model has ħ = m = 1 and no mass; times need one. They are given for an
// electron with the chosen wavelength: v = h/(m λ), t = distance / v.
const ELECTRON_V = () => 6.62607015e-34 / (9.1093837e-31 * geo.wavelength * 1e-9);   // m/s
const psAt = (nmDist) => nmDist * 1e-9 / ELECTRON_V() * 1e12;
const fmtPs = (t) => (t >= 100 ? t.toFixed(0) : t >= 10 ? t.toFixed(1) : t.toFixed(2)) + ' ps';

// ---------------------------------------------------------------- stage 4: windows over the field
// Runs at all times, so their strong results cover the whole drawing. Because
// the packet only translates, a run whose weak coupling finds the particle at
// x1 is a run at the planes (x1, x1 + gap): the field is a set of thin plane
// pairs 10 nm apart, all equally likely. A window is an ellipse of strong results.
const WIN_DX = 0.1, WIN_SAMPLE = 400000, WIN_DRAW = 60000;   // runs kept as a sample; the first WIN_DRAW are drawn over the field
let wf = null;
function makeWindowField() {
  const gapX = state.gap / 100, x1s = M.windowPlanes(p.wall, p.screen, gapX, WIN_DX), nYf = Math.round(2 * Y_HALF / 0.02);
  const field = M.windowField({ terms0: T0, k: p.k, wallX: p.wall, gapX, sw: state.sw / 100, yfMin: -Y_HALF, yfMax: Y_HALF, nYf, x1s, dx: WIN_DX });
  return { field, acc: M.makeWindowAcc(x1s.length, nYf), runs: 0, n: 0,
    px2: new Float32Array(WIN_SAMPLE), pyf: new Float32Array(WIN_SAMPLE), pX: new Float32Array(WIN_SAMPLE), pY: new Float32Array(WIN_SAMPLE) };
}
function addWindowRun(run) {
  hadRun = true;
  M.addWindowRun(wf.acc, wf.field, run);
  const stride = Math.max(1, Math.floor(state.perPlane / WIN_SAMPLE));
  if (wf.runs % stride === 0 && wf.n < WIN_SAMPLE) { wf.px2[wf.n] = run.x2; wf.pyf[wf.n] = run.yf; wf.pX[wf.n] = run.X; wf.pY[wf.n] = run.Y; wf.n++; }
  wf.runs++;
}
// Window centre in model units, kept inside the measured field.
function winCentre() {
  const xmin = state.gap + 10, xmax = geo.distance;
  state.win.x = Math.max(xmin, Math.min(xmax, state.win.x)); state.win.y = Math.max(-geo.screen / 2, Math.min(geo.screen / 2, state.win.y));
  return { x: p.wall + state.win.x / 100, y: state.win.y / 100 };
}
// Half-axes of the window in model units: along the beam (rx) and across (ry).
const winRx = () => state.win.len / 200, winRy = () => state.win.wid / 200;
const winSize = () => (state.win.len === state.win.wid ? `${state.win.len} nm circle` : `${state.win.len} × ${state.win.wid} nm`);
const winQuery = (c) => M.windowQuery(wf.field, wf.acc, c.x, c.y, winRx(), winRy());
// Anssi Kuha's construction: the mean weak position of a window becomes the
// next window, one gap at a time, towards the slits.
function traceBack(c0) {
  const pts = [{ c: c0, q: winQuery(c0) }];
  for (let k = 0; k < 60; k++) {
    const { q } = pts[pts.length - 1];
    if (!(q.n >= 300)) break;
    const c = { x: q.Xm, y: q.Ym };
    if (c.x < p.wall + wf.field.gapX + 0.02) { pts.push({ c, q: null }); break; }
    pts.push({ c, q: winQuery(c) });
  }
  return pts;
}

// At the end of the run: arrows from windows on a grid, and lines traced back
// from windows next to the screen, started at equal shares of the runs
// detected there; the j/|ψ|² flow lines from the same windows for comparison.
function windowSummary() {
  if (!wf || wf.runs < state.perPlane) return null;
  const key = [state.win.len, state.win.wid, state.nLines, wf.runs].join('|');
  if (wf.summary?.key === key) return wf.summary;
  const rx = winRx(), ry = winRy(), F = wf.field, nYf = F.nYf;
  // Arrows: windows every 100 nm along the beam and every 50 nm across.
  const arrows = [];
  for (let x = p.wall + F.gapX + Math.max(rx, 0.5); x <= p.screen - rx + 1e-9; x += 1)
    for (let y = -Y_HALF + 0.25; y < Y_HALF; y += 0.5) { const q = M.windowQuery(F, wf.acc, x, y, rx, ry); if (q.n >= 300) arrows.push({ q }); }
  // Starts: equal shares of the runs whose strong result lies within one window of the screen.
  const xs = p.screen - rx, counts = new Float64Array(nYf);
  F.x1s.forEach((x1, j) => { if (Math.abs(x1 + F.gapX - xs) <= rx) for (let i = 0; i < nYf; i++) counts[i] += wf.acc.n[j * nYf + i]; });
  const total = counts.reduce((a, b) => a + b, 0), starts = [];
  let acc = 0, k = 0;
  for (let i = 0; i < nYf && k < state.nLines; i++) { acc += counts[i]; while (k < state.nLines && acc >= (k + 0.5) / state.nLines * total) { starts.push(F.yfMin + (i + 0.5) * F.dYf); k++; } }
  const lines = [], flows = [];
  let sum = 0, m = 0;
  for (const y0 of starts) {
    const pts = traceBack({ x: xs, y: y0 }), last = pts[pts.length - 1].c, q0 = pts[0].q;
    if (!q0 || !(q0.n >= 300)) continue;
    lines.push(pts.map(({ c }) => [c.x, c.y]));
    const ref = M.bohmTrajectory(T0, p.k, p.wall, q0.yfm, Math.max(p.wall + 0.01, last.x), 200, q0.x2m);
    flows.push(ref);
    sum += (ref[ref.length - 1][1] - last.y) ** 2; m++;
  }
  wf.summary = { key, arrows, lines, flows, rms: m ? nm(Math.sqrt(sum / m)) : null, n: m };
  return wf.summary;
}

// ---------------------------------------------------------------- text
const fmtNm = (u, d = 0) => `${nm(u).toFixed(d)} nm`;
const fmtS = (s, d = 3) => (s === null || !Number.isFinite(s) ? '—' : (s >= 0 ? '+' : '−') + Math.abs(s).toFixed(d));

function updateText() {
  $('#swOut').value = `${state.sw} nm`;
  // At instants the two controls are times (electron with this wavelength); the
  // distances, which the model uses, are shown in brackets.
  $('#x1Out').value = instant() ? fmtPs(psAt(state.x1)) : `${state.x1} nm`;
  $('#gapOut').value = instant() ? fmtPs(psAt(state.gap)) : `${state.gap} nm`;
  $('#x1Out').title = instant() ? `packet centre ${state.x1} nm behind the slits at t₁ (electron, λ = ${geo.wavelength} nm)` : '';
  $('#gapOut').title = instant() ? `the packet moves ${state.gap} nm between t₁ and t₂` : '';
  const angle = geo.wavelength / (4 * Math.PI * state.sw);
  $('#swHint').textContent = 'A wider pointer gives noisier readings and disturbs the wave less. Below about 50 nm the two predictions separate.'
    + (angle > 0.2 ? ' This sharp-pointer setting is a qualitative illustration beyond the reliable paraxial range.' : '');
  $('#perPlane').setAttribute('aria-valuetext', `${state.perPlane.toLocaleString('en-US')} ${state.stage === 'window' ? 'runs over the whole field' : 'runs per pair of planes'}`);
  $('#arrowDensityOut').value = Math.ceil(N_BINS / state.arrowEvery);
  $('#arrowDensity').setAttribute('aria-valuetext', `${Math.ceil(N_BINS / state.arrowEvery)} arrows per plane`);
  // Numbers in the Physics tab that follow the geometry.
  document.querySelectorAll('[data-strip-width]').forEach((el) => { el.textContent = `${Number((geo.screen / N_BINS).toPrecision(3))} nm`; });
  document.querySelectorAll('[data-screen-half]').forEach((el) => { el.textContent = `${geo.screen / 2}`; });
  const W = state.stage === 'window';
  $('#x1Row').style.display = state.stage === 'map' || W ? 'none' : '';
  $('#winLOut').value = `${state.win.len} nm`; $('#winL').value = state.win.len;
  $('#winWOut').value = `${state.win.wid} nm`; $('#winW').value = state.win.wid;
  $('#winX').max = geo.distance; $('#winX').min = state.gap + 10; $('#winX').value = state.win.x; $('#winXOut').value = `${state.win.x} nm`;
  $('#winY').min = -geo.screen / 2; $('#winY').max = geo.screen / 2; $('#winY').value = state.win.y; $('#winYOut').value = `${state.win.y} nm`;
  for (const [id, v] of [['winL', state.win.len], ['winW', state.win.wid], ['winX', state.win.x], ['winY', state.win.y]]) $(`#${id}`).setAttribute('aria-valuetext', `${v} nanometres`);
  $('#winTrace').textContent = state.win.trace ? 'Clear the trace' : 'Trace back from this window';
  document.querySelectorAll('[data-timing]').forEach((b) => { const on = b.dataset.timing === state.timing; b.classList.toggle('active', on); b.setAttribute('aria-pressed', String(on)); });
  $('#recxRow').hidden = !instant() || W;
  $('#pauseRow').hidden = state.stage !== 'one';
  $('#cellRow').hidden = !(instant() && state.recx) || W;
  $('#packetRow').hidden = !(instant() || state.show.fixedTime) || W;
  // Words that change with the timing: planes vs instants.
  $('#x1Label').textContent = instant() ? 'Weak at t₁' : 'Weak plane';
  $('#gapLabel').textContent = instant() ? 'Strong, τ later' : 'Gap to strong plane';
  $('#expLabel').textContent = instant() ? (state.recx ? 'Prediction, pointer + recorded position' : 'Prediction, pointer + packet') : 'Prediction for this pointer';
  $('#perPlaneLabel').textContent = W ? 'Runs, whole field' : instant() ? 'Runs (packets)' : 'Runs per pair of planes';
  $('#curLabel').textContent = instant() && state.recx && exp?.mix ? `Ideal weak pointer at Δ = ${Math.round(nm(cellDx())) === 0 ? '0' : (cellDx() > 0 ? '+' : '−') + Math.abs(nm(cellDx())).toFixed(0)} nm` : instant() ? 'Ideal weak pointer, j/|ψ|² at the packet centre' : 'Ideal weak pointer, j/|ψ|²';
  $('#runsLabel').textContent = W ? 'Runs (whole field)' : instant() ? 'Runs (one packet each)' : 'Runs at these planes';
  $('#pairLabel').textContent = instant() ? 'Packet centre at t₁ → t₂' : 'Plane pair';
  for (const [id, unit] of [['sw', state.sw], ['x1', state.x1], ['gap', state.gap]]) $(`#${id}`).setAttribute('aria-valuetext', instant() && id !== 'sw' ? `${fmtPs(psAt(unit))}, ${unit} nanometres` : `${unit} nanometres`);
  $('#recx').setAttribute('aria-pressed', String(state.recx));
  $('#packet').value = state.packet; $('#packetOut').value = `${state.packet} nm`;
  $('#packet').setAttribute('aria-valuetext', `${state.packet} nanometres`);
  $('#runsRow').style.display = state.stage === 'one' ? 'none' : '';
  document.querySelectorAll('[data-stage]').forEach((b) => {
    const on = b.dataset.stage === state.stage;
    b.classList.toggle('active', on); b.setAttribute('aria-pressed', String(on));
  });
}

const plural = (n, one, many) => `${n.toLocaleString('en-US')} ${n === 1 ? one : many}`;
const SELECT_HINT_TEXT = () => document.body.dataset.qonticLevel === 'basic' ? 'Choose a detected-position strip by pointing at the strong plane or at either plot.' : `Choose a detected-position strip with the Selected strip control, the strong ${instant() ? 'band' : 'plane'}, or either plot.`;
const RATIONALE_LINK = '<button type="button" class="link-button" data-goto="rationale">Same lines, three readings: see Rationale</button>';
// Arrows switched off (Display, or the switch on the drawing): say so, so a run without arrows is not a mystery.
const arrowsOffNote = () => (!state.show.arrows && state.stage !== 'one' ? ' <b>Measured arrows are switched off</b> (switch on the drawing, or Display).' : '');
function liveText() {
  if (state.stage === 'window') return wf ? (urlNote && !hadRun ? `<span class="url-note">${urlNote}</span> ` : '') + windowLive() + arrowsOffNote() : '';
  if (!exp) return '';
  // A note about an adjusted link stays until the first run.
  const note = urlNote && !hadRun ? `<span class="url-note">${urlNote}</span> ` : '';
  return note + liveBody() + arrowsOffNote();
}
let hadRun = false;
function liveBody() {
  const N = exp.runs.toLocaleString('en-US');
  if (state.stage === 'one') {
    const timing = instant() ? ` Measured at instants: each run is one packet. The pointer is coupled at t₁, when the packet centre is at the weak position, and the transverse position is measured at t₂, when it has moved on by the gap; between the two the motion is drawn slowed down (at the real speed the gap takes a few percent of the crossing time). Both act wherever the particle is in the packet (frames: ±3σₓ = ±${3 * state.packet} nm, the range runs are drawn from); the pointer marker and the detection are drawn at the same position along the packet, 50 nm apart. ${state.recx ? 'The position along the beam is recorded too, as in Wiseman\'s protocol.' : 'The position along the beam is not recorded; both are drawn at a position sampled from the packet, for display only.'}` : '';
    if (exp.runs === 0) return state.running ? `The first run is under way: watch the pointer move, then the detector click ${instant() ? 'at t₂' : 'at the strong line'}.${timing}` : 'Press <b>Start</b>. Watch the pointer move, then the detector click at the strong line. One run gives two numbers.';
    const paused = anim?.done ? `<b>Run ${exp.runs} done.</b> The pointer reads Y = ${nm(anim.run.Y).toFixed(0)} nm; the detector clicked at y<sub>f</sub> = ${nm(anim.run.yf).toFixed(0)} nm. Press <b>Start</b> for the next run; this one then shrinks into a stored point. ` : '';
    return `${paused}${plural(exp.runs, 'run', 'runs')}.${timing} The amber marker is the recorded pointer coordinate Y. The pointer's initial preparation spread is σₚ = ${state.sw} nm. A wider pointer gives less information in one run and disturbs the wave less. One run does not establish a particle's path.`;
  }
  if (state.stage === 'many') {
    const b = M.binVelocities(exp.bins, exp.dtau)[state.selected];
    const bw = 2 * Y_HALF / N_BINS, strip = `${nm(-Y_HALF + state.selected * bw).toFixed(0)} to ${nm(-Y_HALF + (state.selected + 1) * bw).toFixed(0)} nm`;
    const kept = instant() && state.recx ? ` The position along the beam is recorded too (Wiseman's protocol), so each run is sorted by where the particle was along its packet: thirteen positions Δ, each its own pair of weak and strong positions, a gap apart. Arrows are drawn at every position (faint) and the selected one (bright bands, Δ = ${cellDx() >= 0 ? '+' : '−'}${Math.abs(nm(cellDx())).toFixed(0)} nm). Point inside the strong frame, or use Position along the beam, to choose it; at Δ = 0 the result is that of the planes. Each position gets only a thirteenth to a fifth of the runs, so 10 million runs are used.` : '';
    const at = instant() ? (state.recx ? '' : ` Measured at instants, transverse position only: with a ${state.packet} nm packet the arrows average the field over the planes the packet spans, so the prediction (blue)${state.show.fixedTime ? ' and the dotted fixed-time curve' : ''} differ${state.show.fixedTime ? '' : 's'} from j/|ψ|² (dashed). Detections are drawn at positions along the beam sampled from the packet, for display only; they are not recorded.`) + ' While running, the moving packets show the timing, slowed down: one packet is drawn for many runs.' : '';
    // One plain sentence first; the details follow.
    const lead = !instant() ? '' : state.recx
      ? '<b>Runs are sorted by where the particle was in its packet: each position Δ (ticks) is its own weak–strong pair, a gap apart.</b> '
      : '<b>Each particle is somewhere in its packet (the frames), so this arrow mixes the arrows of every position in the frame.</b> ';
    const head = `${lead}${N} of ${state.perPlane.toLocaleString('en-US')} runs.${kept}${at}`;
    if (!b) return `${head} ${exp.runs ? 'Too few runs in the selected strip yet.' : 'Press <b>Start</b>.'} ${SELECT_HINT_TEXT()}`;
    // Neutral wording: two averages over the same post-selected runs, not a path.
    const shift = nm(b.v * exp.dtau), err = nm(b.err * exp.dtau), mY = nm(b.y - b.v * exp.dtau);
    const done = (exp.runs >= state.perPlane ? ' Error bars are one standard deviation: about one strip in three should miss the prediction by more than its bar.' : '')
      + (document.body.dataset.qonticLevel === 'basic' ? ' (The slope v<sub>y</sub>/v<sub>x</sub> is the arrow\u2019s direction: sideways speed over forward speed. j/|ψ|² is what quantum mechanics predicts for a perfectly weak pointer: the probability current over the density.)' : '');
    return `${head} Beside the planes: a sample of the pointer readings (amber) and detections (cyan), drawn just beside each line for visibility; only transverse positions are recorded${instant() && state.recx ? ', plus the position along the beam at t₂' : ''}. ${SELECT_HINT_TEXT()} For the runs detected in the strip ${strip} (mean ${nm(b.y).toFixed(1)} nm), the mean pointer reading is <b>${mY.toFixed(1)} nm</b>. Detection minus pointer mean, ${shift >= 0 ? '+' : '−'}${Math.abs(shift).toFixed(1)} ± ${err.toFixed(1)} nm, divided by ${instant() ? `v<sub>x</sub>Δt = ${state.gap} nm (the packet's travel from t₁ to t₂)` : `the ${state.gap} nm gap`} gives the slope v<sub>y</sub>/v<sub>x</sub>. It is a difference of two averages over the same selected runs, not the path of any particle.${done}`;
  }
  if (map && !map.done && !state.running && map.index === 0 && exp.runs === 0) return 'Press <b>Start</b> to map the field: twelve pairs of planes, each a separate experiment. (Changing a setting clears the map.)';
  if (map && !map.done) return `Plane pair ${map.index + 1} of ${N_PLANES}: ${N} of ${state.perPlane.toLocaleString('en-US')} runs. Each pair of planes is a separate experiment with fresh particles.`;
  if (map && map.done) {
    const lastX = nm(exp.x2 - p.wall).toFixed(0);
    const atInstants = instant() ? (state.recx ? ' Measured at instants, post-selected near the packet centre: the arrows return to those of the planes.' : ` Measured at instants with a ${state.packet} nm packet: each arrow averages the field over the planes the packet spans, so the lines need not follow the flow of j/|ψ|²; post-selecting on the longitudinal position recovers it.`) : '';
    const plots = ` The plots and Results show the last pair (strong plane ${lastX} nm behind the slits); click a plot to choose a strip.`;
    const off = map.endOffset === null ? '' : ` Their endpoint difference is ${map.endOffset.toFixed(1)} nm (rms). Sampling noise, pointer disturbance, strip averaging and interpolation can all contribute; more runs reduce only the sampling noise.`;
    return `All ${N_PLANES} plane pairs mapped with fresh particles. The amber lines join the measured arrows. ${map.completedLines} of ${map.intendedLines} requested lines reached the screen; unfinished lines end with an open circle. Grey ticks show where the flow of j/|ψ|² from each actual starting point reaches the screen.${off}${atInstants} Agreement checks the reconstruction, not an interpretation.${plots} ${RATIONALE_LINK}`;
  }
  return '';
}

function windowLive() {
  const tau = fmtPs(psAt(state.gap));
  const how = instant()
    ? `Each run is one packet measured at two instants, chosen at random from run to run, so the strong results cover the whole field. The weak pointer reads both coordinates at t₁; the strong measurement records the position at t₂ = t₁ + τ (τ = ${tau} for an electron).`
    : 'Each run is at a pair of planes chosen at random, a gap apart, so the strong results cover the whole field. The weak pointer reads both coordinates; the strong plane gives the position.';
  if (wf.runs === 0) return `<b>Windows over the field.</b> ${how} Press <b>Start</b>, then point anywhere: the window (an ellipse, 100 nm along the beam by 10 nm across) picks the runs whose strong result fell inside it.`;
  const c = winCentre(), q = winQuery(c), head = `${wf.runs.toLocaleString('en-US')} of ${state.perPlane.toLocaleString('en-US')} runs.`;
  if (!(q.n >= 30)) return `${head} ${how} Too few runs in this window yet; point where the wave is bright, or wait.`;
  const where = `(${nm(c.x - p.wall).toFixed(0)}, ${nm(c.y).toFixed(0)}) nm`;
  const tr = state.win.trace ? (() => {
    const pts = traceBack(c), last = pts[pts.length - 1].c;
    return ` <b>Trace (amber dots): a chain of windows, not a path: each dot uses different runs and no particle is followed.</b> Each mean weak position became the next window, ${pts.length - 1} steps of about one gap (${state.gap} nm) each, reaching ${nm(last.x - p.wall).toFixed(0)} nm at y = ${nm(last.y).toFixed(0)} nm. The dashed line follows the flow of j/|ψ|² backward from the window, for comparison; the difference at the end comes mostly from the window averaging the velocity over its area (a smaller window follows the field more closely, with fewer runs), plus sampling noise added up over the steps.`;
  })() : ' Click (or use Trace back) to repeat the step: the mean weak position becomes the next window, towards the slits.';
  const S = windowSummary();
  const sum = S ? ` <b>Field from windows:</b> ${S.n} lines traced back from windows next to the screen, started at equal shares of the runs detected there (amber lines); arrows from windows on a grid.${state.show.bohm ? ` The dashed lines follow the flow of j/|ψ|² backward from the same windows; the traces end ${S.rms.toFixed(1)} nm from them (rms), from the window's averaging and the sampling noise added up over the steps.` : ' Switch on the j/|ψ|² flow lines below the drawing to compare.'} No particle is followed: every step uses different runs.` : '';
  return `<b>${q.n.toLocaleString('en-US')} runs ended in the window at ${where}.</b> Their weak readings (amber dots, a sample) scatter by σₚ = ${state.sw} nm; only their mean is sharp: (${nm(q.Xm - p.wall).toFixed(0)}, ${nm(q.Ym).toFixed(1)}) nm${instant() ? ' at t₁' : ''}. The arrow from it to the mean strong position${instant() ? ' at t₂' : ''} is the measured velocity for these runs (a difference of two averages): slope ${fmtS(q.slope)} ± ${q.err.toFixed(3)}${q.expected ? ` (prediction ${fmtS(q.expected.slope)})` : ''}. ${head} ${how}${tr} It is a difference of two averages over the same selected runs, not the path of any particle.${sum}`;
}

function showNext() {
  const box = $('#nextSteps');
  box.innerHTML = '';
  const add = (label, fn) => { const b = document.createElement('button'); b.type = 'button'; b.className = label.startsWith('Next') ? 'qontic-app-toggle wv-next' : 'qontic-app-toggle'; b.textContent = label; b.addEventListener('click', fn); box.append(b); };
  if (state.stage === 'one') add('Next: many runs', () => setStage('many', true));
  if (state.stage === 'many' && exp && exp.runs >= state.perPlane) add('Repeat these runs (new sample)', () => { pending = true; start(); });
  if (state.stage === 'many') add('Next: map the field', () => setStage('map', true));
  if (state.stage === 'map' && map?.done) {
    // Windows is a Standard stage: at Basic the button says so and changes the level.
    if (document.body.dataset.qonticLevel === 'basic') add('Next: windows over the field (opens Standard)', () => { levelsApi?.set('standard'); setStage('window', true); });
    else add('Next: windows over the field', () => setStage('window', true));
  }
  if (state.stage === 'map' && map?.done) {
    if (state.sw >= 40) add('Repeat with a 10 nm pointer', () => { setSw(10); setStage('map', true); });
    else add('Repeat with a 200 nm pointer', () => { setSw(200); setStage('map', true); });
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
  // A window collects a few hundredth of the runs: 20 million by default.
  if (stage === 'window' && state.perPlane < 2e7) { state.perPlane = 2e7; $('#perPlane').value = RUNS.indexOf(2e7); $('#perPlaneOut').value = fmtRuns(2e7); }
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
document.querySelectorAll('[data-timing]').forEach((b) => b.addEventListener('click', () => {
  state.timing = b.dataset.timing;
  // At instants the fixed-time curve (transverse position only) is the relevant comparison.
  if (instant() && !state.show.fixedTime) toggle('fixedTime');
  stop(); pending = true; updateText();
}));
// Moving wave: show travelling crests and keep them moving, also between runs.
let modeBeforeMoving = null;
$('#movingWave').addEventListener('click', () => {
  state.movingWave = !state.movingWave;
  $('#movingWave').setAttribute('aria-pressed', String(state.movingWave));
  const setMode = (m) => { state.waveMode = m; document.querySelectorAll('[data-wavemode]').forEach((o) => { const on = o.dataset.wavemode === m; o.classList.toggle('active', on); o.setAttribute('aria-pressed', String(on)); }); };
  if (state.movingWave && state.waveMode === 'density') { modeBeforeMoving = 'density'; setMode('crests'); }
  else if (!state.movingWave && modeBeforeMoving) { setMode(modeBeforeMoving); modeBeforeMoving = null; }
});
$('#equalScales').addEventListener('click', () => { state.equalScales = !state.equalScales; $('#equalScales').setAttribute('aria-pressed', String(state.equalScales)); if (waveGrid) waveGrid.dirty = true; });
$('#pauseEach').addEventListener('click', () => { state.pauseEach = !state.pauseEach; $('#pauseEach').setAttribute('aria-pressed', String(state.pauseEach)); });
$('#recx').addEventListener('click', () => {
  state.recx = !state.recx; state.cell = null;
  // Each position along the beam gets a thirteenth to a fifth of the runs.
  if (state.recx && state.perPlane < 1e7) { state.perPlane = 1e7; $('#perPlane').value = RUNS.indexOf(1e7); $('#perPlaneOut').value = fmtRuns(1e7); }
  stop(); pending = true; updateText();
});
$('#cellSel').addEventListener('input', (e) => { selectCell(+e.target.value); });
$('#packet').addEventListener('input', (e) => { state.packet = +e.target.value; stop(); pending = true; updateText(); });
document.querySelectorAll('[data-wavemode]').forEach((b) => b.addEventListener('click', () => {
  state.waveMode = b.dataset.wavemode;
  document.querySelectorAll('[data-wavemode]').forEach((o) => { const on = o === b; o.classList.toggle('active', on); o.setAttribute('aria-pressed', String(on)); });
}));
document.querySelectorAll('[data-toggle]').forEach((b) => b.addEventListener('click', () => { toggle(b.dataset.toggle); if (state.stage === 'map') showNext(); updateText(); }));
$('#sw').addEventListener('input', (e) => { state.sw = +e.target.value; pending = true; updateText(); });
$('#x1').addEventListener('input', (e) => { state.x1 = +e.target.value; if (state.stage !== 'map') pending = true; updateText(); });
$('#gap').addEventListener('input', (e) => { state.gap = +e.target.value; clampGeometry(); pending = true; updateText(); });
// A setting that clears the results (a new experiment) starts the new runs when the
// slider is released, if there were results to replace; stage 1 stays manual.
let hadResults = null;
const resultsShown = () => (state.stage === 'window' ? !!wf?.runs : state.stage === 'map' ? !!(map && (map.planes.length || exp?.runs)) : state.stage === 'many' && !!exp?.runs);
for (const id of ['sw', 'x1', 'gap', 'packet']) {
  const el = $(`#${id}`);
  el.addEventListener('pointerdown', () => { hadResults = resultsShown(); });
  el.addEventListener('keydown', () => { if (hadResults === null) hadResults = resultsShown(); });
  el.addEventListener('input', () => { if (hadResults === null) hadResults = resultsShown(); }, { capture: true });
  el.addEventListener('change', () => {
    const go = hadResults && state.stage !== 'one' && !(id === 'x1' && state.stage === 'map');
    hadResults = null;
    if (go) start();
  });
}
$('#perPlane').addEventListener('input', (e) => {
  state.perPlane = RUNS[+e.target.value]; $('#perPlaneOut').value = fmtRuns(state.perPlane); updateText();
});
$('#perPlane').addEventListener('change', () => { if (state.stage === 'map' || (exp && exp.runs > state.perPlane)) pending = true; });
// Slider left = fewest arrows (every 5th strip), right = all 40, like the Lines slider.
$('#arrowDensity').addEventListener('input', (e) => { state.arrowEvery = Math.ceil(N_BINS / 40) * (6 - +e.target.value); updateText(); });
$('#lineCount').addEventListener('input', (e) => { state.nLines = +e.target.value; $('#lineCountOut').value = state.nLines; if (map?.done) buildLines(); });
document.querySelectorAll('[data-maptoggle]').forEach((b) => b.addEventListener('click', () => toggle(b.dataset.maptoggle)));
$('#selectedStrip').addEventListener('input', (e) => { state.selected = +e.target.value; });
$('#showSetup').addEventListener('click', () => { stop(); showStep('setup'); });
$('#winL').addEventListener('input', (e) => { state.win.len = +e.target.value; updateText(); });
$('#winW').addEventListener('input', (e) => { state.win.wid = +e.target.value; updateText(); });
$('#winX').addEventListener('input', (e) => { state.win.pinned = true; moveWindow({ x: +e.target.value, y: state.win.y }); });
$('#winY').addEventListener('input', (e) => { state.win.pinned = true; moveWindow({ x: state.win.x, y: +e.target.value }); });
$('#winTrace').addEventListener('click', () => { state.win.trace = !state.win.trace; state.win.pinned = state.win.trace || state.win.pinned; updateText(); });
$('#setupGo').addEventListener('click', () => setStage('one', true));

// Phones: a small bar fixed at the bottom of the window, so Start is always in reach.
const mobileRun = $('#mobileRun');
function syncMobileRun() { mobileRun.textContent = state.running ? '❚❚ Stop' : '▶ Start'; mobileRun.setAttribute('aria-pressed', String(state.running)); }
// Screen readers: the caption and Results change every frame during a run, so
// they are silent while running and announced once when the run stops.
function setLive(on) { $('#story').setAttribute('aria-live', on ? 'polite' : 'off'); document.querySelectorAll('[data-result]').forEach((o) => o.setAttribute('aria-live', on ? 'polite' : 'off')); }
function stop() { state.running = false; controlsEl.setAttribute('running', 'false'); syncMobileRun(); setLive(true); }
function start() {
  if (state.stage === 'one' && anim?.done) { shrinkRun(anim); anim = null; }
  if (map?.done) pending = true;
  if (state.stage === 'many' && exp && exp.runs >= state.perPlane) pending = true;
  if (state.stage === 'window' && wf && wf.runs >= state.perPlane) pending = true;
  state.running = true; controlsEl.setAttribute('running', 'true'); showStep('live'); syncMobileRun(); setLive(false);
}
mobileRun.addEventListener('click', () => (state.running ? stop() : start()));
if ('IntersectionObserver' in window) new IntersectionObserver((entries) => {
  for (const en of entries) $('.mobile-run').classList.toggle('panel-visible', en.isIntersecting);
}, { threshold: 0.05 }).observe(document.querySelector('.always-controls'));
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
  const reference = event.target.closest('a[href^="#ref-"]');
  if (reference) {
    event.preventDefault();
    document.querySelector('.tabs [data-view="physics"]').click();
    document.querySelector(reference.getAttribute('href'))?.scrollIntoView({block: 'start'});
  }
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
    e.currentTarget.setAttribute('aria-label', body.hidden ? 'Expand results' : 'Collapse results');
    e.currentTarget.setAttribute('aria-expanded', String(!body.hidden));
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
  // Short screens (a projector at 1024 × 576): the plots start closed so the drawing takes the width;
  // they reopen from the button on the drawing or the Display tab.
  const short = !saved && window.innerHeight < 650 && !stacked();
  for (const k of Object.keys(panels)) { panels[k].open = saved?.[k]?.open ?? (short ? false : panels[k].open); panels[k].min = saved?.[k]?.min ?? false; applyPanelState(k); }
}
function applyPanelState(k) {
  const pn = panels[k];
  pn.el.hidden = !pn.open;
  pn.el.classList.toggle('minimized', pn.min);
  const mb = pn.el.querySelector('[data-fp-act="min"]');
  mb.textContent = pn.min ? '+' : '–'; mb.title = pn.min ? 'Restore' : 'Minimize';
  mb.setAttribute('aria-label', `${pn.min ? 'Restore' : 'Minimize'} the ${k === 'scatter' ? 'data' : 'velocity'} plot`);
  mb.setAttribute('aria-expanded', String(!pn.min));
  mb.setAttribute('aria-controls', pn.cv.id);
  document.querySelector(`[data-fp-open="${k}"]`).hidden = pn.open;
  document.querySelector(`[data-panel-toggle="${k}"]`).setAttribute('aria-pressed', String(pn.open));
  const any = Object.values(panels).some((p2) => p2.open);
  sideCol.hidden = !any; split.hidden = !any;
}
function setPanelOpen(k, open) { panels[k].open = open; applyPanelState(k); savePanels(); }
for (const [k, pn] of Object.entries(panels)) {
  pn.el.querySelector('[data-fp-act="close"]').addEventListener('click', () => { setPanelOpen(k, false); document.querySelector(`[data-fp-open="${k}"]`).focus(); });
  pn.el.querySelector('[data-fp-act="min"]').addEventListener('click', () => { pn.min = !pn.min; applyPanelState(k); savePanels(); });
  // Key: this plot's legend on or off (remembered).
  const keyBtn = pn.el.querySelector('[data-fp-act="legend"]');
  if (keyBtn) {
    const k = pn.el.dataset.fp;
    keyBtn.setAttribute('aria-pressed', String(state.panelKey[k] !== false));
    keyBtn.addEventListener('click', () => { state.panelKey[k] = state.panelKey[k] === false; keyBtn.setAttribute('aria-pressed', String(state.panelKey[k])); try { localStorage.setItem('qontic-weak-velocity-panel-keys', JSON.stringify(state.panelKey)); } catch (e) { /* ignore */ } });
  }
  pn.el.querySelector('[data-fp-act="shift"]')?.addEventListener('click', (e) => { state.shiftView = !state.shiftView; e.currentTarget.setAttribute('aria-pressed', String(state.shiftView)); updateTitles(); });
  // Click a strip in the plot to post-select on it.
  pn.cv.addEventListener('click', (e) => {
    const r = pn.cv.getBoundingClientRect(), box = plotBox(r.width, r.height), x = e.clientX - r.left;
    if (x < box.x || x > box.x + box.w) return;
    // Selects the strip (used from stage 2 on); never changes the stage.
    state.selected = binOf(-Y_HALF + (x - box.x) / box.w * 2 * Y_HALF);
  });
  document.querySelector(`[data-fp-open="${k}"]`).addEventListener('click', () => { setPanelOpen(k, true); pn.el.querySelector('[data-fp-act="close"]').focus(); });
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
const plotBox = (W, H) => ({ x: 58, y: 8, w: Math.max(40, W - 72), h: Math.max(40, H - 54) });

// ---------------------------------------------------------------- geometry controls (Advanced)
const GEO_INPUTS = {
  slits: { min: 1, max: 8, step: 1 },
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
  // N slits, equally spaced: the outermost pair must stay on the screen and hold the probability.
  const n = Math.max(2, geo.slits), signs = Array.from({ length: n }, (_, i) => 2 * i - (n - 1));
  lim.separation.max = Math.max(0, Math.floor(100 * maximumCoreSafeSeparation(base, SLIT_EXTENT, room / 100 / (n - 1), signs) + 1e-9));
  return lim;
}
function clampGeometry() {
  const lim = geometryLimits();
  for (const [k, l] of Object.entries(lim)) geo[k] = Math.min(l.max, Math.max(l.min, Math.round(geo[k] / l.step) * l.step));
  geometryLimits();
  // Measurement planes must fit behind the slits.
  const planes = M.measurementPlanes(geo.distance, state.x1, state.gap);
  state.x1 = planes.weak; state.gap = planes.gap;
  $('#x1').max = planes.weakMax; $('#gap').max = Math.min(100, Math.floor(geo.distance / 20) * 5);
  $('#x1').value = state.x1; $('#gap').value = state.gap;
  return lim;
}
function syncGeometryInputs() {
  const lim = clampGeometry();
  for (const k of Object.keys(GEO_INPUTS)) {
    const r = document.getElementById(`geo-${k}`), n = document.getElementById(`geo-${k}-n`);
    if (!r) continue;
    r.min = n.min = lim[k].min; r.max = n.max = lim[k].max; r.step = n.step = lim[k].step;
    r.value = n.value = geo[k]; r.setAttribute('aria-valuetext', `${geo[k]} nanometres`);
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
  if (['one', 'many', 'map', 'window'].includes(q.get('stage'))) state.stage = q.get('stage');
  if (state.stage === 'window' && !q.has('runs')) state.perPlane = 2e7;
  for (const [key, f] of [['winx', 'x'], ['winy', 'y']]) { const v = parseFloat(q.get(key)); if (Number.isFinite(v)) state.win[f] = Math.round(v); }
  // Window size: winl (length along the beam) and winw (width across), nm; winr (a radius) gives a circle.
  { const r = parseFloat(q.get('winr')); if (Number.isFinite(r)) state.win.len = state.win.wid = 2 * Math.round(r / 5) * 5; }
  for (const [key, f, lo, hi] of [['winl', 'len', 20, 200], ['winw', 'wid', 4, 100]]) { const v = parseFloat(q.get(key)); if (Number.isFinite(v)) state.win[f] = Math.max(lo, Math.min(hi, Math.round(v / 2) * 2)); }
  for (const k of Object.keys(GEO_DEFAULT)) { const v = parseFloat(q.get(k)); if (Number.isFinite(v)) { geo[k] = v; urlAsked[k] = v; } }
  for (const k of ['sw', 'x1', 'gap']) { const v = parseFloat(q.get(k)); if (Number.isFinite(v)) urlAsked[k] = v; }
  const rq = parseFloat(q.get('runs')); if (Number.isFinite(rq)) urlAsked.runs = rq;
  if (q.get('stage') && !['one', 'many', 'map', 'window'].includes(q.get('stage'))) urlBadStage = q.get('stage');
  const runs = parseFloat(q.get('runs')); if (Number.isFinite(runs)) state.perPlane = RUNS.reduce((a, b) => (Math.abs(Math.log(b / runs)) < Math.abs(Math.log(a / runs)) ? b : a));
  if (['density', 'crests', 'phase'].includes(q.get('show'))) state.waveMode = q.get('show');
  for (const key of ['expected', 'current']) if (q.get(key) === '0') state.show[key] = false;
  if (q.get('ft') === '1') state.show.fixedTime = true;
  if (q.get('timing') === 'instant') state.timing = 'instant';
  if (q.get('recx') === '1') { state.recx = true; if (!q.has('runs')) state.perPlane = 1e7; }
  { const v = parseFloat(q.get('packet')); if (Number.isFinite(v)) { state.packet = Math.min(300, Math.max(50, Math.round(v / 10) * 10)); urlAsked.packet = v; } }
  if (q.get('bohm') === '1') state.show.bohm = true;
  for (const key of ['expected', 'current', 'fixedTime']) document.querySelector(`[data-toggle="${key}"]`).setAttribute('aria-pressed', String(state.show[key]));
  $('#sw').value = state.sw; $('#x1').value = state.x1; $('#gap').value = state.gap;
  document.querySelectorAll('[data-toggle="bohm"], [data-maptoggle="bohm"]').forEach((b) => b.setAttribute('aria-pressed', String(state.show.bohm)));
}
function shareUrl() {
  const u = new URL(location.href);
  const g = {}; for (const k of Object.keys(GEO_DEFAULT)) if (geo[k] !== GEO_DEFAULT[k]) g[k] = geo[k];
  u.search = new URLSearchParams({ level: document.body.dataset.qonticLevel || 'basic', stage: state.stage, sw: state.sw, x1: state.x1, gap: state.gap, runs: state.perPlane, ...(state.waveMode !== 'density' ? { show: state.waveMode } : {}), ...g, ...(state.show.bohm ? { bohm: 1 } : {}), ...(!state.show.expected ? {expected: 0} : {}), ...(!state.show.current ? {current: 0} : {}), ...(state.show.fixedTime ? {ft: 1} : {}), ...(instant() ? {timing: 'instant'} : {}), ...(state.recx ? {recx: 1} : {}), ...(state.packet !== 150 ? {packet: state.packet} : {}), ...(state.stage === 'window' ? {winx: state.win.x, winy: state.win.y, winl: state.win.len, winw: state.win.wid} : {}) }).toString();
  return u.toString();
}

// ---------------------------------------------------------------- drawing
function palette() {
  const light = document.body.classList.contains('qontic-light');
  return light ? {
    light, bg: '#fbfdfe', panel: '#f1f6f8', grid: '#d6e2e8', text: '#183747', muted: '#5f7684',
    wave: [12, 90, 140], wall: '#36505f', weak: '#a36400', strong: '#087788', arrow: '#b35c00', line: '#b35c00',
    bohm: '#33424d', bohmCase: 'rgba(255,255,255,0.85)', ft: '#c2334f', exp: '#1f5fbf', cur: '#183747', dots: 'rgba(24,55,71,0.22)', strip: 'rgba(8,119,136,0.13)',
  } : {
    light, bg: '#07131d', panel: '#0b1c29', grid: '#1d3546', text: '#d9edf7', muted: '#8299aa',
    wave: [95, 210, 235], wall: '#9fb3c1', weak: '#f0b341', strong: '#5fe0f0', arrow: '#f6b54a', line: '#f6b54a',
    bohm: '#eef3f6', bohmCase: 'rgba(7,19,29,0.85)', ft: '#ff7f9c', exp: '#62a8ff', cur: '#d9edf7', dots: 'rgba(200,225,240,0.20)', strip: 'rgba(95,224,240,0.13)',
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
    if (Math.abs(i - (p.centers.length - 1) / 2) > 1e-9) out.push({ kind: 'separation', x: xw, y: Yp(c), i });   // no handle on a middle slit
  });
  out.push({ kind: 'screen', x: xs, y: Yp(Y_HALF), edge: 1 }, { kind: 'screen', x: xs, y: Yp(-Y_HALF), edge: -1 });
  out.push({ kind: 'distance', x: xs, y: Yp(0), line: true });
  if (state.stage !== 'map' && state.stage !== 'window' && (exp || (drag && (drag.kind === 'x1' || drag.kind === 'gap')))) {
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
const GEO_LABEL = { slits: 'Number of slits', wavelength: 'Wavelength', sourceWidth: 'Source width', wall: 'Source to slits' };
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
  const m = appMap, s = instant() ? 3 * packetSigma() : 0;
  const xw = m.X(exp.x1 - s), xs = m.X(exp.x2 + s), top = m.Yp(Y_HALF), bot = m.Yp(-Y_HALF);
  if (px < xw - 30 || px > xs + 40 || py < top || py > bot) return null;
  // With the position along the beam recorded, the pointer's position along x
  // inside the strong frame chooses the packet cell too.
  if (exp.cellBins && state.stage === 'many') {
    const x = m.x0 + (px - m.box.x) / m.box.w * (m.x1 - m.x0), d = x - exp.x2;
    let best = state.cell, bd = Infinity;
    exp.mix.parts.forEach((q, j) => { const dd = Math.abs(q.dx - d); if (dd < bd) { bd = dd; best = j; } });
    if (bd <= exp.mix.width && best !== state.cell) selectCell(best);
  }
  return binOf(m.Yh - (py - m.box.y - 26) / (m.box.h - 44) * 2 * m.Yh);
}
// Stage 4: the pointer position in lengths (nm behind the slits, nm across), or null outside the field.
function windowAt(px, py) {
  if (!appMap || editing || state.stage !== 'window') return null;
  const m = appMap, x = m.x0 + (px - m.box.x) / m.box.w * (m.x1 - m.x0), y = m.Yh - (py - m.box.y - 26) / (m.box.h - 44) * 2 * m.Yh;
  if (x < p.wall + state.gap / 100 || x > p.screen + 0.05 || Math.abs(y) > Y_HALF) return null;
  return { x: Math.round(nm(x - p.wall)), y: Math.round(nm(y)) };
}
// Moving the window changes the caption and Results at every step: silent while
// it moves, announced once when it stops (screen readers).
let winQuiet = null;
function moveWindow(w) {
  state.win.x = w.x; state.win.y = w.y; winCentre(); updateText();
  if (!state.running) { setLive(false); clearTimeout(winQuiet); winQuiet = setTimeout(() => { if (!state.running) setLive(true); }, 700); }
}
canvas.addEventListener('pointermove', (e) => {
  const [px, py] = pointerPos(e);
  if (drag) { dragMove(px, py); return; }
  if (state.stage === 'window') {
    hover = hitHandle(px, py);
    const w = hover ? null : windowAt(px, py);
    if (w && !state.win.pinned) moveWindow(w);
    canvas.style.cursor = hover ? CURSOR[hover.kind] : w ? 'crosshair' : '';
    return;
  }
  hover = hitHandle(px, py);
  hoverStrip = hover ? null : stripAt(px, py);
  if (hoverStrip !== null) state.selected = hoverStrip;
  canvas.style.cursor = hover ? CURSOR[hover.kind] : hoverStrip !== null ? 'crosshair' : '';
});
canvas.addEventListener('pointerleave', (e) => { if (!drag) { hover = null; canvas.style.cursor = ''; } if (e.pointerType === 'mouse') hoverStrip = null; });
canvas.addEventListener('pointerdown', (e) => {
  const [px, py] = pointerPos(e), h = hitHandle(px, py);
  if (!h && state.stage === 'window') {
    // Click: pin the window here and trace back; click again to let it follow the pointer.
    const w = windowAt(px, py);
    if (!w) return;
    if (state.win.pinned && e.pointerType === 'mouse') { state.win.pinned = false; state.win.trace = false; moveWindow(w); }
    else { moveWindow(w); state.win.pinned = true; state.win.trace = true; updateText(); }
    return;
  }
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
  drag = { kind: h.kind, i: h.i, invX, invY, px, py, label: '', m0: { x0: m.x0, x1: m.x1, Yh: m.Yh } };
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
  else if (k === 'separation') geo.separation = nm(Math.abs(ym)) / Math.abs((drag.i ?? 1) - (p.centers.length - 1) / 2);   // slit i sits at (i − (N−1)/2)·separation
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
const RUN_SECONDS_INSTANT = 4.0;
// At instants the packet travels through the drawing. Its centre stops at the
// weak position (t1), creeps the gap to the strong position (slowed: at the
// real speed the 50 nm take a few percent of the crossing), stops there (t2),
// then leaves. Fractions of the run:
const PK = { tW: 0.26, go: 0.38, tS: 0.66, leave: 0.78 };
function packetCentre(a) {
  const x1c = exp.x1, x2c = exp.x2, xa = p.wall - 0.6, xb = p.screen, t = a.t;
  const sm = (u) => u * u * (3 - 2 * u);
  if (t < PK.tW) return xa + (x1c - xa) * (1 - (1 - t / PK.tW) ** 2);       // decelerate onto x1
  if (t < PK.go) return x1c;
  if (t < PK.tS) return x1c + (x2c - x1c) * sm((t - PK.go) / (PK.tS - PK.go));
  if (t < PK.leave) return x2c;
  return x2c + (xb - x2c) * ((t - PK.leave) / (1 - PK.leave)) ** 2;
}
function makeRunAnim(run) {
  lastRun = run; if (waveGrid) waveGrid.overKey = null;
  if (!instant()) return { t: 0, run, tW: RUN_TW, tS: RUN_TS };
  return { t: 0, run, tW: PK.tW, tS: PK.tS, packet: true };
}
// Stage 1 at instants: dim the wave outside the packet, |F(x - xc)|^2.
function hexRgb(h) { const n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
// Dim the wave outside the packets whose centres are in `centres`:
// opacity of the dimming layer = dim·(1 − max_k |F(x − x_k)|²/|F(0)|²).
function drawPacketMask(P, X, Yp, centres, xLeft) {
  const s = packetSigma(), [r, g, b] = hexRgb(P.panel), dim = 0.82, top = Yp(Y_HALF), h = Yp(-Y_HALF) - top;
  const left = X(xLeft), right = X(p.screen), n = 160, grad = ctx.createLinearGradient(left, 0, right, 0);
  for (let i = 0; i <= n; i++) {
    const x = xLeft + (p.screen - xLeft) * i / n;
    let f = 0; for (const c of centres) f = Math.max(f, Math.exp(-((x - c) ** 2) / (2 * s * s)));
    grad.addColorStop(i / n, `rgba(${r},${g},${b},${dim * (1 - f)})`);
  }
  ctx.fillStyle = grad; ctx.fillRect(left, top, right - left, h);
}
// Stages 2–3 at instants: a slowed, representative train of packets moving
// through; each flashes amber as its centre passes the weak position (t1) and
// cyan at the strong position (t2). It shows the timing only; the runs are
// counted separately (one packet drawn per many runs).
const train = { pos: 0 };
const TRAIN_SPACING = () => Math.max(6 * packetSigma(), (p.screen - p.wall) / 2.6);
function trainCentres(xLeft) {
  const S = TRAIN_SPACING(), L = p.screen + 4 * packetSigma() - (xLeft - 4 * packetSigma()), out = [];
  const m = Math.ceil(L / S);
  for (let k = 0; k < m; k++) out.push(xLeft - 4 * packetSigma() + ((train.pos + k * S) % (m * S)));
  return out;
}
function advanceTrain(dt) {
  if (!exp) return;
  const cs = trainCentres(p.wall - 0.6);
  const near = cs.some((c) => c > exp.x1 - 3 * packetSigma() && c < exp.x2 + 3 * packetSigma());
  const gap = cs.some((c) => c > exp.x1 - 0.15 && c < exp.x2 + 0.15);
  // about 2.5 s across the drawing at speed 1, four times slower around the
  // measurements, and slow enough between t1 and t2 that the two flashes separate
  const v = (p.screen - p.wall) / 2.5, vGap = (exp.x2 - exp.x1 + 0.3) / 2.0;
  train.pos += dt * state.speed * (gap ? Math.min(0.25 * v, vGap) : near ? 0.25 * v : v);
}
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

let drawStretch = 1;
// Shown when the two scales differ by more than 10%: the arrows' drawn angles are then not their slopes.
const stretchNote = () => (Math.abs(drawStretch - 1) > 0.1 ? ` · drawing stretched ×${Math.max(drawStretch, 1 / drawStretch).toFixed(1)} ${drawStretch > 1 ? 'across' : 'along'} the beam (slopes in the numbers are true)` : '');   // vertical / horizontal scale of the drawing (1 = true angles)
function drawApparatus(P, fullBox) {
  const D = p.screen - p.wall;
  let box = fullBox;
  // While the screen is dragged, keep the drawing's scale from the start of the
  // drag so the screen follows the pointer; it rescales on release.
  const frozen = drag && (drag.kind === 'distance' || drag.kind === 'screen') ? drag.m0 : null;
  const x0 = frozen ? frozen.x0 : p.wall - 0.05 * D - 0.1, x1 = frozen ? frozen.x1 : p.screen + 0.1 * D + 0.2;
  const YH = frozen ? frozen.Yh : Y_HALF;
  // Equal scales (Display): shrink the drawing area so 1 nm is the same length
  // both ways; arrows then show their true angles. The pointer and drag code
  // invert X and Yp through appMap.box, so the shrunken box keeps them right.
  {
    const sx = box.w / (x1 - x0), sy = (box.h - 44) / (2 * YH);
    if (state.equalScales && !frozen) {
      const sc = Math.min(sx, sy), w = (x1 - x0) * sc, h = 2 * YH * sc;
      box = { x: box.x + (box.w - w) / 2, y: box.y + (box.h - 44 - h) / 2, w, h: h + 44 };
      drawStretch = 1;
    } else drawStretch = sy / sx;
  }
  const X = (x) => box.x + (x - x0) / (x1 - x0) * box.w;
  const Yp = (y) => box.y + 26 + (YH - y) / (2 * YH) * (box.h - 44);
  ctx.fillStyle = P.panel; ctx.fillRect(fullBox.x, fullBox.y, fullBox.w, fullBox.h);
  ctx.save(); ctx.beginPath(); ctx.rect(fullBox.x, fullBox.y, fullBox.w, fullBox.h); ctx.clip();
  // wave
  if (state.show.wave) {
    const w = drawWave(P, X, Yp, x0, p.screen);
    if (w.mixedFrom !== null && w.want !== 'density') {
      // Below the pattern, between the weak plane and the screen; wrapped if needed.
      const lines = ['beyond the weak plane: density averaged over pointer readings', '(a single run keeps its fringes: see stage 1)'];
      lines.forEach((ln, i) => backedText(P, ln, X(exp ? exp.x2 : w.mixedFrom) + 10, Yp(-Y_HALF) - 50 + 12 * i, { color: P.muted, size: 10 }));
    }
    if (state.waveMode !== 'density' && !w.canCrest) text('wavelength too short to draw crests here: density shown', X(p.wall) + 8, box.y + box.h - 18, { color: P.muted, size: 10 });
    if (instant() && state.stage === 'one' && exp && anim?.packet) drawPacketMask(P, X, Yp, [packetCentre(anim)], x0);
    if (instant() && state.stage !== 'one' && exp && !(map?.done) && state.running) drawPacketMask(P, X, Yp, trainCentres(p.wall - 0.6), x0);
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
  if (state.stage === 'window') {
    drawWindowStage(P, X, Yp);
    ctx.restore();
    appMap = { X, Yp, box, x0, x1, Yh: YH };
    drawGrips(P);
    backedText(P, `Windows · σₚ ${state.sw} nm · gap ${state.gap} nm${instant() ? ` · instants, τ = ${fmtPs(psAt(state.gap))} (electron)` : ''} · window ${winSize()}${stretchNote()}${wf && wf.runs < state.perPlane && wf.runs > 0 ? ` · ${Math.floor(100 * wf.runs / state.perPlane)}% of runs` : ''}`, X(p.wall) + 10, Yp(-Y_HALF) - 8, { color: P.muted, size: 10 });
    return { X, Yp };
  }
  // scale bar 100 nm

  // measured arrows
  const arrowsFrom = [];
  if (map) map.planes.forEach((pl) => arrowsFrom.push({ x: pl.x2, est: pl.est }));
  // Stages 2 and 3 show the current pair's arrows building up while its runs
  // come in (noisy ones faint); finished pairs of the map are in map.planes.
  if (exp && (state.stage === 'many' || (map && !map.done))) {
    const toEst = (bins) => M.binVelocities(bins, exp.dtau, 200).map((b) => (b ? { y: b.y, s: b.v / p.k, err: b.err / p.k } : null));
    // With the position along the beam recorded, every packet cell is its own
    // plane pair: arrows at each cell's strong position, the selected one bright.
    if (exp.cellBins) exp.cellBins.forEach((cb, j) => arrowsFrom.push({ x: exp.x2 + exp.mix.parts[j].dx, est: toEst(cb), live: true, faint: j !== state.cell }));
    else arrowsFrom.push({ x: exp.x2, est: toEst(exp.bins), live: true });
  }
  // Finished pairs are drawn here; the pair being measured is drawn after its
  // stored points (pointer readings and detections lie between its planes and
  // would otherwise cover its arrows).
  const drawArrows = (list) => { if (state.show.arrows) for (const a of list) for (const [ei, e] of a.est.entries()) {
    if (!e || (map?.done && ei % state.arrowEvery !== Math.floor(state.arrowEvery / 2))) continue;
    // Opacity shows the precision: noisy arrows are drawn faint, never hidden.
    const rel = Math.max(0.15, Math.min(1, 0.04 / Math.max(1e-6, e.err)));
    // The measured vector: from the mean weak (pointer) reading at the weak
    // position to the mean detected position at the strong one, a gap earlier.
    // If that is very short on screen, the tail is extended back along the same
    // direction, so the head stays on the strong position.
    const g = state.gap / 100, ex = X(a.x), ey = Yp(e.y);
    let sx = X(a.x - g), sy = Yp(e.y - e.s * g);
    const ang = Math.atan2(sy - ey, sx - ex), len = Math.hypot(ex - sx, ey - sy), Lmin = a.faint ? 8 : 12;
    if (len < Lmin) { sx = ex + Lmin * Math.cos(ang); sy = ey + Lmin * Math.sin(ang); }
    const hd = Math.min(6, Math.max(3.5, len / 3)), dir = Math.atan2(ey - sy, ex - sx);
    ctx.globalAlpha = (0.35 + 0.65 * rel) * (a.faint ? 0.4 : 1);
    ctx.strokeStyle = P.arrow; ctx.fillStyle = P.arrow; ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(ex, ey); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(ex, ey);
    ctx.lineTo(ex - hd * Math.cos(dir - 0.45), ey - hd * Math.sin(dir - 0.45));
    ctx.lineTo(ex - hd * Math.cos(dir + 0.45), ey - hd * Math.sin(dir + 0.45)); ctx.closePath(); ctx.fill();
  }
  ctx.globalAlpha = 1; };
  drawArrows(arrowsFrom.filter((a) => !a.live));

  let keyTop = Yp(-Y_HALF);   // the status line sits above the key, if any
  // lines from the measured field, and pilot-wave trajectories
  const path = (pts) => { ctx.beginPath(); pts.forEach(([x, y], i) => (i ? ctx.lineTo(X(x), Yp(y)) : ctx.moveTo(X(x), Yp(y)))); ctx.stroke(); };
  if (map?.done) {
    // Lines stay inside the region between the slits and the screen.
    ctx.save(); ctx.beginPath(); ctx.rect(X(p.wall), Yp(Y_HALF), X(p.screen) - X(p.wall), Yp(-Y_HALF) - Yp(Y_HALF)); ctx.clip();
    ctx.strokeStyle = P.line; ctx.lineWidth = 1.8; if (state.show.lines) map.lines.forEach(ln => {
      path(ln); const [x, y] = ln.at(-1);
      if (Math.abs(x - p.screen) > 1e-8) {ctx.beginPath(); ctx.arc(X(x), Yp(y), 3.5, 0, 2 * Math.PI); ctx.stroke();}
    });
    if (state.show.bohm) {
      // Flow lines of j/|psi|^2 computed from psi (trajectories in pilot-wave), same starts, drawn on top.
      ctx.strokeStyle = P.bohmCase; ctx.lineWidth = 3.6; map.bohm.forEach(path);
      ctx.strokeStyle = P.bohm; ctx.lineWidth = 1.7; ctx.setLineDash([6, 4]); map.bohm.forEach(path); ctx.setLineDash([]);
    }
    ctx.restore();
    // key
    const keys = [];
    if (state.show.lines) keys.push([P.line, [], 1.8, 'lines through the measured arrows']);
    if (state.show.bohm) keys.push([P.bohm, [6, 4], 1.7, 'flow lines of j/|ψ|² from ψ, same starts'], [null, [], 0, 'pilot-wave: the particles\u2019 trajectories · orthodox, many-worlds: lines of probability flow']);
    if (keys.length) {
      const kx = X(p.wall) + 14, ky = Yp(-Y_HALF) - 10;
      ctx.font = '400 11px Inter, Arial, sans-serif';
      // Short labels when the drawing is narrow (projector, phone).
      if (40 + Math.max(...keys.map((k) => ctx.measureText(k[3]).width)) > box.w - 40) keys.forEach((k) => { k[3] = k[0] === P.line ? 'measured lines' : k[0] === null ? 'PW: trajectories · OQM, MW: probability flow' : 'j/|ψ|² flow lines'; });
      const kw = 40 + Math.max(...keys.map((k) => ctx.measureText(k[3]).width));
      ctx.fillStyle = P.light ? 'rgba(241,246,248,0.88)' : 'rgba(11,28,41,0.88)'; ctx.fillRect(kx - 6, ky - 15 * keys.length, kw, 6 + 15 * keys.length);
      keyTop = ky - 15 * keys.length;
      keys.forEach(([col, dash, lw, label], i) => {
        const yy = ky - 15 * (keys.length - 1 - i);
        if (col) { ctx.lineWidth = lw; ctx.strokeStyle = col; ctx.setLineDash(dash); ctx.beginPath(); ctx.moveTo(kx, yy - 4); ctx.lineTo(kx + 22, yy - 4); ctx.stroke(); ctx.setLineDash([]); }
        text(label, kx + 30, yy, { color: col ? P.text : P.muted, size: col ? 11 : 10 });
      });
    }
    // screen check: measured end points vs equal-probability positions
    const sx = X(p.screen);
    ctx.lineWidth = 2;
    if (state.show.lines) map.lines.forEach((ln) => { const [xe, ye] = ln.at(-1); if (Math.abs(xe - p.screen) < 0.05) { ctx.strokeStyle = P.line; ctx.beginPath(); ctx.moveTo(sx + 3, Yp(ye)); ctx.lineTo(sx + 14, Yp(ye)); ctx.stroke(); } });
    ctx.strokeStyle = P.light ? '#5f7684' : '#b8cbd6';
    map.referenceEnds.forEach((y) => { if (Math.abs(y) <= Y_HALF) { ctx.beginPath(); ctx.moveTo(sx + 16, Yp(y)); ctx.lineTo(sx + 30, Yp(y)); ctx.stroke(); } });
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

  // At instants: shaded bands (±3σ of the packet) around the packet centre at
  // t1 (weak) and t2 (strong); the particle can be anywhere in them.
  if (exp && !(map?.done) && instant()) {
    // Outlined frames (filled overlaps read as a third colour): the packet's
    // extent, ±3σx, at t1 (dashed amber) and at t2 (solid cyan).
    const s = packetSigma(), top = Yp(Y_HALF), h = Yp(-Y_HALF) - top;
    const frame = (xc, col, dash, inset) => { ctx.strokeStyle = col; ctx.lineWidth = 1.4; ctx.setLineDash(dash); ctx.strokeRect(X(xc - 3 * s), top + inset, X(xc + 3 * s) - X(xc - 3 * s), h - 2 * inset); ctx.setLineDash([]); };
    // Flashes when a packet of the moving train is measured.
    if (state.stage !== 'one' && state.running) {
      for (const c of trainCentres(p.wall - 0.6)) {
        for (const [xc, col] of [[exp.x1, P.weak], [exp.x2, P.strong]]) {
          const f = Math.exp(-(((c - xc) / Math.min(0.12, 0.25 * (exp.x2 - exp.x1))) ** 2));
          if (f > 0.02) { ctx.globalAlpha = 0.38 * f; ctx.fillStyle = col; ctx.fillRect(X(xc - 3 * s), top, X(xc + 3 * s) - X(xc - 3 * s), h); }
        }
      }
      ctx.globalAlpha = 1;
    }
    // Stage 1: each frame flashes at its own instant; the clock is labelled.
    if (state.stage === 'one' && anim?.packet) {
      const fl = (t0) => Math.max(0, 1 - Math.abs(anim.t - t0 - 0.03) / 0.07);
      for (const [xc, col, t0] of [[exp.x1, P.weak, anim.tW], [exp.x2, P.strong, anim.tS]]) {
        const f = fl(t0); if (f > 0) { ctx.globalAlpha = 0.25 * f; ctx.fillStyle = col; ctx.fillRect(X(xc - 3 * s), top, X(xc + 3 * s) - X(xc - 3 * s), h); ctx.globalAlpha = 1; }
      }
      const t = anim.t;
      const T1 = fmtPs(psAt(nm(exp.x1 - p.wall))), T2 = fmtPs(psAt(nm(exp.x2 - p.wall)));
      const msg = t < anim.tW ? 'packet arriving' : t < PK.go ? `t₁ = ${T1}: weak coupling` : t < anim.tS ? `between t₁ and t₂, ${fmtPs(psAt(state.gap))} (slowed down)` : t < PK.leave ? `t₂ = ${T2}: strong measurement` : 'after t₂';
      backedText(P, msg, X(exp.x1), Yp(-Y_HALF) - 34, { color: t >= anim.tS ? P.strong : P.weak, size: 12, weight: 600, align: 'center' });
    } else if (state.stage !== 'one' && state.running) {
      // Stages 2-3: the same clock, read from the train packet nearest the gap.
      const c = trainCentres(p.wall - 0.6).find((q) => q > exp.x1 - 0.3 && q < exp.x2 + 0.3);
      if (c !== undefined) {
        const msg = c < exp.x1 - 0.12 ? 'a packet reaches t₁' : c < exp.x1 + 0.1 ? 't₁: weak coupling' : c < exp.x2 - 0.1 ? 'between t₁ and t₂ (slowed down)' : c < exp.x2 + 0.12 ? 't₂: strong measurement' : 'after t₂';
        backedText(P, msg, X(exp.x1), Yp(-Y_HALF) - 34, { color: c >= exp.x2 - 0.1 ? P.strong : P.weak, size: 12, weight: 600, align: 'center' });
      }
    }
    frame(exp.x1, P.weak, [6, 4], 0);
    frame(exp.x2, P.strong, [], 3);
    if (state.recx && exp.mix) {
      // Ticks: the thirteen positions Δ, each a weak–strong pair a gap apart.
      exp.mix.parts.forEach((q, j) => {
        const on = j === state.cell;
        ctx.strokeStyle = P.strong; ctx.lineWidth = on ? 2.5 : 1.2; ctx.beginPath(); ctx.moveTo(X(exp.x2 + q.dx), top + 3); ctx.lineTo(X(exp.x2 + q.dx), top + (on ? 16 : 10)); ctx.stroke();
        ctx.strokeStyle = P.weak; ctx.beginPath(); ctx.moveTo(X(exp.x1 + q.dx), top + h - 3); ctx.lineTo(X(exp.x1 + q.dx), top + h - (on ? 16 : 10)); ctx.stroke();
      });
    }
    // What the frames are: the packet's extent at each instant (the particle is somewhere inside).
    const narrowF = X(exp.x2 + 3 * s) - X(exp.x1 - 3 * s) < 380;
    if (state.labels) backedText(P, narrowF ? 'dashed: the packet at t₁ (pointer coupled)' : 'dashed box: the packet at t₁ — the particle is somewhere inside when the pointer is coupled', X(exp.x1 - 3 * s) + 5, Yp(Y_HALF) + 28, { color: P.weak, size: 10 });
    if (state.labels) backedText(P, narrowF ? 'solid: the packet at t₂ (position measured)' : `solid box: the packet at t₂, ${state.gap} nm further on — where it is when its position is measured`, X(exp.x2 + 3 * s) - 6, Yp(Y_HALF) + 42, { color: P.strong, size: 10, align: 'right' });
    if (state.recx && exp.mix) { const w = exp.mix.width / 2, d = cellDx(); ctx.globalAlpha = 0.25; ctx.fillStyle = P.strong; ctx.fillRect(X(exp.x2 + d - w), top, X(exp.x2 + d + w) - X(exp.x2 + d - w), h); ctx.fillStyle = P.weak; ctx.fillRect(X(exp.x1 + d - w), top, X(exp.x1 + d + w) - X(exp.x1 + d - w), h); ctx.globalAlpha = 1; }
  }
  // the current pair of planes (at instants: the packet centre at t1 and t2)
  if (exp && !(map?.done)) {
    if (instant()) {
      // At instants nothing happens on a line: the packet centre at t1 and t2 is
      // marked by ticks at the edges only (the arrows are drawn there by convention).
      ctx.lineWidth = 2;
      for (const [x, col] of [[exp.x1, P.weak], [exp.x2, P.strong]]) {
        ctx.strokeStyle = col; ctx.beginPath();
        ctx.moveTo(X(x), Yp(Y_HALF)); ctx.lineTo(X(x), Yp(Y_HALF) + 12); ctx.moveTo(X(x), Yp(-Y_HALF)); ctx.lineTo(X(x), Yp(-Y_HALF) - 12); ctx.stroke();
      }
    } else {
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = P.weak; ctx.setLineDash([5, 4]); ctx.beginPath(); ctx.moveTo(X(exp.x1), Yp(Y_HALF)); ctx.lineTo(X(exp.x1), Yp(-Y_HALF)); ctx.stroke(); ctx.setLineDash([]);
      ctx.strokeStyle = P.strong; ctx.beginPath(); ctx.moveTo(X(exp.x2), Yp(Y_HALF)); ctx.lineTo(X(exp.x2), Yp(-Y_HALF)); ctx.stroke();
    }
    // At instants the two times are labelled (electron with this wavelength; see Results).
    const tw = map ? '' : ` = ${fmtPs(psAt(nm(exp.x1 - p.wall)))}`, ts = map ? '' : ` = ${fmtPs(psAt(nm(exp.x2 - p.wall)))}`;
    // In stage 3 the display switches sit at the top of the drawing: the labels go below them.
    const ly = map ? Yp(Y_HALF) + 62 : Yp(Y_HALF) - 4, lab = map ? backedText.bind(null, P) : text;
    lab(instant() ? `packet centre at t₁${tw}` : (map || canvas.clientWidth < 760 ? 'weak' : 'weak plane: pointer coupled at any y'), X(exp.x1) - 3, ly, { color: P.weak, size: 11, align: 'right' });
    lab(instant() ? `at t₂${ts}` : (map || canvas.clientWidth < 760 ? 'strong' : 'strong plane: y measured, any value'), X(exp.x2) + 3, ly, { color: P.strong, size: 11, align: 'left' });
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
    const a1 = ctx.globalAlpha;
    let above = 0, below = 0;
    for (let i = 0; i < n; i++) {
      const yy = Yp(exp.ptsY[i]); if (yy < top) { above++; continue; } if (yy > bot) { below++; continue; }
      // At instants each pointer sample sits at its run's position along the beam at t1.
      if (instant()) { ctx.globalAlpha = state.recx && exp.ptsS[i] !== state.cell ? a1 * 0.3 : a1; ctx.fillRect(X(exp.x1 + exp.ptsX[i]) - sz / 2, yy - sz / 2, sz, sz); }
      else ctx.fillRect(xw - 2 - exp.ptsU[i] * 6 - sz / 2, yy - sz / 2, sz, sz);
    }
    ctx.globalAlpha = a1;
    offScale(P, instant() ? X(exp.x1) : xw - 5, top + (map ? 72 : 0), bot, above, below, n);   // below the map switches in stage 3
    ctx.fillStyle = P.strong; ctx.globalAlpha = a1;
    // Narrow bands just beside each line: only the transverse position is
    // recorded; the sideways spread is for visibility, not a position along x.
    if (instant()) {
      // At instants each detection is drawn where the particle was along its
      // packet at t2; with longitudinal post-selection, runs outside the kept
      // cell are drawn faint.
      const a0 = ctx.globalAlpha;
      for (let i = 0; i < n; i++) { ctx.globalAlpha = state.recx && exp.ptsS[i] !== state.cell ? a0 * 0.3 : a0; ctx.fillRect(X(exp.x2 + exp.ptsX[i]) - sz / 2, Yp(exp.ptsYf[i]) - sz / 2, sz, sz); }
    } else for (let i = 0; i < n; i++) ctx.fillRect(xs - 2 - exp.ptsU[i] * Math.min(6, gapW - 2) - sz / 2, Yp(exp.ptsYf[i]) - sz / 2, sz, sz);
    ctx.globalAlpha = 1;
    const stride = pointStride();
    if (stride > 1) text(`points: one run in ${stride.toLocaleString('en-US')}`, xw - 6, bot + 13, { color: P.muted, size: 10, align: 'right' });
  }
  drawArrows(arrowsFrom.filter((a) => a.live));
  // Selected strip: mean pointer reading on the weak plane, joined to the mean
  // detected position on the strong plane. The slope of this step is the arrow.
  if (exp && state.stage !== 'one' && !(map?.done) && hoverStrip !== null) {
    const i = hoverStrip, n = exp.bins.count[i];
    // Weak and strong positions of the selected runs: the planes; at instants
    // with the position along the beam recorded, the selected cell's pair;
    // otherwise the whole packet frames (the position along the beam is unknown).
    const sP = packetSigma(), unknownX = instant() && !state.recx, d = cellDx();
    const bw = 2 * Y_HALF / N_BINS, a = -Y_HALF + i * bw;
    ctx.fillStyle = P.strip;
    if (unknownX) ctx.fillRect(X(exp.x1 - 3 * sP), Yp(a + bw), X(exp.x2 + 3 * sP) - X(exp.x1 - 3 * sP), Yp(a) - Yp(a + bw));
    else ctx.fillRect(X(exp.x1 + d) - 4, Yp(a + bw), X(exp.x2 + d) - X(exp.x1 + d) + 30, Yp(a) - Yp(a + bw));
    if (n >= 200) {
      const mY = exp.bins.sumY[i] / n, mYf = exp.bins.sumYf[i] / n;
      const err = Math.sqrt(Math.max(0, exp.bins.sumY2[i] / n - mY * mY) / n);
      const xw = X(exp.x1 + d), xs = X(exp.x2 + d);
      if (unknownX) {
        // Bars across the frames: the weak reading belongs somewhere in the dashed frame.
        ctx.lineWidth = 3; ctx.strokeStyle = P.weak; ctx.beginPath(); ctx.moveTo(X(exp.x1 - 3 * sP), Yp(mY)); ctx.lineTo(X(exp.x1 + 3 * sP), Yp(mY)); ctx.stroke();
        ctx.strokeStyle = P.strong; ctx.beginPath(); ctx.moveTo(X(exp.x2 - 3 * sP), Yp(mYf)); ctx.lineTo(X(exp.x2 + 3 * sP), Yp(mYf)); ctx.stroke();
        const lx = X(exp.x1 - 3 * sP) + 8, up2 = mY >= mYf;   // inside the dashed frame: always room
        backedText(P, `mean pointer reading ${nm(mY).toFixed(1)} nm`, lx, Yp(mY) + (up2 ? -10 : 18), { color: P.weak, size: 11, weight: 600 });
        backedText(P, '(weak position not recorded:', lx, Yp(mY) + (up2 ? 5 : 33), { color: P.weak, size: 10 });
        backedText(P, 'anywhere in the dashed frame)', lx, Yp(mY) + (up2 ? 18 : 46), { color: P.weak, size: 10 });
        backedText(P, `mean detected ${nm(mYf).toFixed(1)} nm`, lx, Yp(mYf) + (up2 ? 34 : -10), { color: P.strong, size: 11, weight: 600 });
      } else {
      ctx.strokeStyle = P.weak; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(xw, Yp(mY + err)); ctx.lineTo(xw, Yp(mY - err)); ctx.stroke();
      ctx.fillStyle = P.weak; ctx.beginPath(); ctx.arc(xw, Yp(mY), 4.5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = P.strong; ctx.beginPath(); ctx.arc(xs, Yp(mYf), 4.5, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = P.text; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(xw, Yp(mY)); ctx.lineTo(xs, Yp(mYf)); ctx.stroke();
      const up = mY >= mYf;   // keep the two labels apart
      const where = instant() ? ` (runs at Δ = ${d >= 0 ? '+' : '−'}${Math.abs(nm(d)).toFixed(0)} nm)` : '';
      backedText(P, `mean pointer reading ${nm(mY).toFixed(1)} nm${where}`, xw - 12, Yp(mY) + (up ? -10 : 18), { color: P.weak, size: 11, align: 'right', weight: 600 });
      backedText(P, `mean detected ${nm(mYf).toFixed(1)} nm`, xw - 12, Yp(mYf) + (up ? 18 : -10), { color: P.strong, size: 11, align: 'right', weight: 600 });
      }
    } else text('too few runs in this strip yet', X(exp.x2) + 34, Yp(a + bw / 2) + 4, { color: P.muted, size: 11 });
  }
  // stage 1: pointer gauge and detection flash
  if (state.stage === 'one' && exp) { drawShrink(P, X, Yp); drawPointerGauge(P, box, X, Yp); }
  // While a plane is dragged, show where the pair will be.
  if (drag && (drag.kind === 'x1' || drag.kind === 'gap')) {
    const a1 = p.wall + state.x1 / 100, a2 = a1 + state.gap / 100;
    ctx.lineWidth = 1.5; ctx.strokeStyle = P.weak; ctx.setLineDash([5, 4]); ctx.beginPath(); ctx.moveTo(X(a1), Yp(Y_HALF)); ctx.lineTo(X(a1), Yp(-Y_HALF)); ctx.stroke(); ctx.setLineDash([]);
    ctx.strokeStyle = P.strong; ctx.beginPath(); ctx.moveTo(X(a2), Yp(Y_HALF)); ctx.lineTo(X(a2), Yp(-Y_HALF)); ctx.stroke();
  }
  ctx.restore();
  appMap = { X, Yp, box, x0, x1, Yh: YH };
  drawGrips(P);
  backedText(P, `${state.stage === 'one' ? 'One run' : state.stage === 'many' ? 'Many runs' : 'Field map'} · σₚ ${state.sw} nm · gap ${state.gap} nm${instant() ? ` · instants, σₓ ${state.packet} nm` : ''}${map ? ` · pair ${Math.min(map.index + 1, N_PLANES)}/${N_PLANES}` : ''}${stretchNote()}`, X(p.wall) + 10, keyTop - 8, {color: P.muted, size: 10});
  return { X, Yp };
}

// The last run's two markers shrink into the small stored points (about 0.45 s).
let shrink = null;
function shrinkRun(a) { shrink = { run: a.run, dx: a.packet ? a.run.dx : 0, t0: performance.now() }; }
function drawShrink(P, X, Yp) {
  if (!shrink || !exp) return;
  const f = Math.min(1, (performance.now() - shrink.t0) / (450 / Math.max(0.25, state.speed)));
  if (f >= 1) { shrink = null; return; }
  const r = 8 * (1 - f) + 1.2 * f;
  ctx.globalAlpha = 1 - 0.5 * f;
  ctx.fillStyle = P.weak; ctx.beginPath(); ctx.arc(X(exp.x1 + shrink.dx), Yp(shrink.run.Y), r, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = P.strong; ctx.beginPath(); ctx.arc(X(exp.x2 + shrink.dx), Yp(shrink.run.yf), r, 0, Math.PI * 2); ctx.fill();
  ctx.globalAlpha = 1;
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
  if (!anim.packet && t > tW - 0.04 && t < tW + 0.16) { ctx.strokeStyle = P.weak; ctx.globalAlpha = 0.35; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(xw, top); ctx.lineTo(xw, bot); ctx.stroke(); ctx.globalAlpha = 1; }
  // At instants the particle met the coupling at its own position along the
  // packet (x1 + Δ), 50 nm before its detection at x2 + Δ: the marker is drawn there.
  const xm = anim.packet ? X(exp.x1 + anim.run.dx) : xw;
  // Marker slides from the pointer's zero to the reading.
  const Yr = anim.run.Y * ease((t - tW) / 0.12), yc = Yp(Yr), cl = (v) => Math.max(top, Math.min(bot, v));
  const settled = t > tW + 0.12;
  if (settled) { ctx.globalAlpha = 0.25; ctx.fillStyle = P.weak; ctx.fillRect(xm - 4, cl(Yp(Yr + sw)), 8, cl(Yp(Yr - sw)) - cl(Yp(Yr + sw))); ctx.globalAlpha = 1; }
  ctx.strokeStyle = P.weak; ctx.fillStyle = P.weak; ctx.lineWidth = 2;
  if (yc >= top && yc <= bot) {
    // The latest run is drawn large; it shrinks into a stored point when the next run starts.
    ctx.beginPath(); ctx.moveTo(xm - 15, yc); ctx.lineTo(xm - 4, yc); ctx.stroke();
    ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(xm, yc, 7.5, 0, Math.PI * 2); ctx.stroke();
    if (settled) {
      ctx.beginPath(); ctx.arc(xm, yc, 3.5, 0, Math.PI * 2); ctx.fill();
      // Label to the left of the marker, unless that would leave the plot.
      const lbl = `Y = ${nm(anim.run.Y).toFixed(0)} nm; initial σₚ = ${state.sw} nm`, room = xm - 18 - lbl.length * 6.6 > X(p.wall) + 4;
      backedText(P, lbl, room ? xm - 18 : xm + 12, room ? yc + 4 : yc - 12, { color: P.weak, size: 11, align: room ? 'right' : 'left', weight: 600 });
    }
  } else {
    const up = yc < top, ya = up ? top + 2 : bot - 2, d = up ? 1 : -1;
    ctx.beginPath(); ctx.moveTo(xm, ya); ctx.lineTo(xm - 5, ya + 8 * d); ctx.lineTo(xm + 5, ya + 8 * d); ctx.closePath(); ctx.fill();
    if (settled) {
      const lbl = `Y = ${nm(anim.run.Y).toFixed(0)} nm (off scale); initial σₚ = ${state.sw} nm`, room = xm - 10 - lbl.length * 6.6 > X(p.wall) + 4;
      backedText(P, lbl, room ? xm - 10 : xm + 10, up ? ya + 16 : ya - 30, { color: P.weak, size: 11, align: room ? 'right' : 'left', weight: 600 });
    }
  }
  if (t > tS) {
    const r = t < tS + 0.1 ? 4 + 40 * (t - tS) : 8;
    const xd = X(exp.x2 + (anim.packet ? anim.run.dx : 0));
    ctx.fillStyle = P.strong; ctx.beginPath(); ctx.arc(xd, Yp(anim.run.yf), r, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = P.light ? '#ffffff' : '#07131d'; ctx.lineWidth = 1.5; ctx.stroke();
    backedText(P, `detected at ${nm(anim.run.yf).toFixed(0)} nm`, xd + 12, Yp(anim.run.yf) + 4, { color: P.strong, size: 11, weight: 600 });
  }
}

// Pointer readings beyond the drawing: a wide pointer reads far outside the
// pattern. They are counted and marked at the edge rather than dropped silently.
function offScale(P, x, top, bot, above, below, n) {
  if (!n || !state.labels) return;
  ctx.globalAlpha = 1; ctx.fillStyle = P.weak;
  for (const [cnt, y, d] of [[above, top + 2, 1], [below, bot - 2, -1]]) {
    if (!cnt) continue;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 5, y + 8 * d); ctx.lineTo(x + 5, y + 8 * d); ctx.closePath(); ctx.fill();
    backedText(P, `${Math.round(100 * cnt / n)}% of readings ${d > 0 ? 'above' : 'below'} the drawing (pointer spread ${state.sw} nm)`, x + 8, y + (d > 0 ? 9 : -30), { color: P.weak, size: 10 });
  }
}

// ---------------------------------------------------------------- stage 4 drawing
function arrowLine(x0, y0, x1, y1, head = 8) {
  const a = Math.atan2(y1 - y0, x1 - x0);
  ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x1 - head * Math.cos(a - 0.4), y1 - head * Math.sin(a - 0.4)); ctx.lineTo(x1 - head * Math.cos(a + 0.4), y1 - head * Math.sin(a + 0.4)); ctx.closePath(); ctx.fill();
}
function drawWindowStage(P, X, Yp) {
  if (!wf) return;
  const c = winCentre(), ax = winRx(), ay = winRy();
  const rx = Math.max(2, Math.abs(X(c.x + ax) - X(c.x))), ry = Math.max(2, Math.abs(Yp(c.y + ay) - Yp(c.y)));
  const inWin = (x, y) => ((x - c.x) / ax) ** 2 + ((y - c.y) / ay) ** 2 <= 1;
  // A sample of the strong results over the whole field.
  ctx.fillStyle = P.strong; ctx.globalAlpha = 0.2;
  for (let i = 0, m = Math.min(wf.n, WIN_DRAW); i < m; i++) ctx.fillRect(X(wf.px2[i]) - 0.75, Yp(wf.pyf[i]) - 0.75, 1.5, 1.5);
  ctx.globalAlpha = 1;
  const S = windowSummary();
  if (S) {
    const path = (pts) => { ctx.beginPath(); pts.forEach(([x, y], i) => (i ? ctx.lineTo(X(x), Yp(y)) : ctx.moveTo(X(x), Yp(y)))); ctx.stroke(); };
    if (state.show.arrows) {
      ctx.strokeStyle = P.arrow; ctx.fillStyle = P.arrow; ctx.lineWidth = 1.4;
      // Each arrow from the window's mean weak reading to its mean strong position
      // (at least 12 px, extended back along its direction); opacity shows precision.
      for (const { q } of S.arrows) {
        const ex = X(q.x2m), ey = Yp(q.yfm);
        let sx = X(q.Xm), sy = Yp(q.Ym);
        const len = Math.hypot(ex - sx, ey - sy);
        if (len < 12) { const a = Math.atan2(sy - ey, sx - ex); sx = ex + 12 * Math.cos(a); sy = ey + 12 * Math.sin(a); }
        ctx.globalAlpha = 0.35 + 0.65 * Math.max(0.15, Math.min(1, 0.04 / Math.max(1e-6, q.err)));
        arrowLine(sx, sy, ex, ey, 5);
      }
      ctx.globalAlpha = 1;
    }
    ctx.save(); ctx.beginPath(); ctx.rect(X(p.wall), Yp(Y_HALF), X(p.screen) - X(p.wall), Yp(-Y_HALF) - Yp(Y_HALF)); ctx.clip();
    if (state.show.lines) { ctx.strokeStyle = P.line; ctx.lineWidth = 1.8; S.lines.forEach(path); }
    if (state.show.bohm) { ctx.strokeStyle = P.bohmCase; ctx.lineWidth = 3.4; S.flows.forEach(path); ctx.strokeStyle = P.bohm; ctx.lineWidth = 1.5; ctx.setLineDash([6, 4]); S.flows.forEach(path); ctx.setLineDash([]); }
    ctx.restore();
  }
  // The weak readings of the sampled runs that ended in the window.
  ctx.fillStyle = P.weak;
  let wAbove = 0, wBelow = 0, wN = 0;
  for (let i = 0; i < wf.n; i++) if (inWin(wf.px2[i], wf.pyf[i])) { wN++; if (wf.pY[i] > Y_HALF) wAbove++; else if (wf.pY[i] < -Y_HALF) wBelow++; }
  offScale(P, X(c.x) - 30, Yp(Y_HALF) + (windowSummary() ? 52 : 0), Yp(-Y_HALF), wAbove, wBelow, wN);
  ctx.fillStyle = P.weak;
  for (let i = 0; i < wf.n; i++) if (inWin(wf.px2[i], wf.pyf[i])) { ctx.globalAlpha = 0.55; ctx.fillRect(X(wf.pX[i]) - 1.5, Yp(wf.pY[i]) - 1.5, 3, 3); ctx.globalAlpha = 1; ctx.fillStyle = P.strong; ctx.fillRect(X(wf.px2[i]) - 1.5, Yp(wf.pyf[i]) - 1.5, 3, 3); ctx.fillStyle = P.weak; }
  // The window (a disc in lengths; an ellipse if the drawing's scales differ).
  // A dark casing keeps the cyan outline visible on the cyan wave.
  ctx.strokeStyle = P.light ? '#ffffff' : '#07131d'; ctx.lineWidth = 4.5; ctx.beginPath(); ctx.ellipse(X(c.x), Yp(c.y), rx, ry, 0, 0, Math.PI * 2); ctx.stroke();
  ctx.strokeStyle = P.strong; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(X(c.x), Yp(c.y), rx, ry, 0, 0, Math.PI * 2); ctx.stroke();
  const q = winQuery(c);
  if (q.n >= 30) {
    // Prediction (blue) and measurement (amber): mean weak → mean strong.
    if (state.show.expected && q.expected) { ctx.strokeStyle = P.exp; ctx.fillStyle = P.exp; ctx.lineWidth = 1.5; arrowLine(X(q.expected.Xm), Yp(q.expected.Ym), X(q.expected.x2m), Yp(q.expected.yfm), 7); }
    ctx.strokeStyle = P.arrow; ctx.fillStyle = P.arrow; ctx.lineWidth = canvas.clientWidth < 560 ? 3.5 : 2.5; arrowLine(X(q.Xm), Yp(q.Ym), X(q.x2m), Yp(q.yfm), 9);
    ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(X(q.Xm), Yp(q.Ym), 6, 0, Math.PI * 2); ctx.stroke();
    const narrow = canvas.clientWidth < 560, lx = X(q.Xm) - 10;
    // Weak label below the arrow, window label above it, so they never meet.
    if (!narrow) backedText(P, `mean weak reading${instant() ? ' at t₁' : ''}`, lx, Yp(q.Ym) + 20, { color: P.weak, size: 11, align: 'right', weight: 600 });
    backedText(P, narrow ? `window: ${q.n.toLocaleString('en-US')} runs` : `window of strong results${instant() ? ' at t₂' : ''}: ${q.n.toLocaleString('en-US')} runs`, X(c.x), Yp(c.y) - ry - 8, { color: P.strong, size: 11, weight: 600, align: narrow && X(c.x) > canvas.clientWidth * 0.6 ? 'right' : 'center' });
  } else backedText(P, wf.runs ? 'too few runs in this window yet' : 'press Start, then point anywhere', X(c.x) + rx + 8, Yp(c.y) + 4, { color: P.muted, size: 11 });
  // Trace back: each mean weak position is the next window.
  if (state.win.trace && q.n >= 300) {
    const pts = traceBack(c);
    const last = pts[pts.length - 1].c;
    // Flow of j/|ψ|² backward from the window's mean strong position, the direction the trace goes
    // (forward from the slits small differences fan out, so that comparison is ill-conditioned).
    const ref = M.bohmTrajectory(T0, p.k, p.wall, q.yfm, Math.max(p.wall + 0.01, last.x), 300, q.x2m);
    ctx.strokeStyle = P.arrow; ctx.fillStyle = P.arrow; ctx.lineWidth = 2.5;
    ctx.beginPath(); pts.forEach(({ c: a }, i) => (i ? ctx.lineTo(X(a.x), Yp(a.y)) : ctx.moveTo(X(a.x), Yp(a.y)))); ctx.stroke();
    pts.forEach(({ c: a }) => { ctx.beginPath(); ctx.arc(X(a.x), Yp(a.y), 3.5, 0, Math.PI * 2); ctx.fill(); });
    ctx.strokeStyle = P.light ? '#36505f' : '#e8f0f4'; ctx.lineWidth = 1.2; ctx.setLineDash([4, 3]); ctx.beginPath(); ref.forEach(([x, y], i) => (i ? ctx.lineTo(X(x), Yp(y)) : ctx.moveTo(X(x), Yp(y)))); ctx.stroke(); ctx.setLineDash([]);
    const dEnd = nm(ref[ref.length - 1][1] - last.y);
    if (!state.labels) { /* explanatory label hidden */ } else if (canvas.clientWidth < 560) backedText(P, `chain of windows (no particle followed) · dashed: j/|ψ|² flow, ${dEnd >= 0 ? '+' : '−'}${Math.abs(dEnd).toFixed(1)} nm`, X(last.x) + 6, Yp(last.y) + (last.y > 0 ? 18 : -10), { color: P.text, size: 10 });
    else backedText(P, `chain of windows (amber): each dot uses different runs, no particle is followed · j/|ψ|² flow line from the window (dashed), ${nm(ref[ref.length - 1][1] - last.y) >= 0 ? '+' : '−'}${Math.abs(nm(ref[ref.length - 1][1] - last.y)).toFixed(1)} nm from the trace here`, X(last.x) + 6, Yp(last.y) + (last.y > 0 ? 18 : -10), { color: P.text, size: 10 });
  }
}
// Plot: the weak readings (Y against X) of the sampled runs in the window,
// with their mean, beside the mean strong position.
function drawWindowCloud(P, box) {
  const c = winCentre(), ax = winRx(), ay = winRy(), span = Math.max(3 * state.sw / 100, 3 * ax);
  const Xp = (x) => box.x + (x - (c.x - span)) / (2 * span) * box.w, Vp = (y) => box.y + box.h - (y - (c.y - span)) / (2 * span) * box.h;
  ctx.fillStyle = P.panel; ctx.fillRect(box.x, box.y, box.w, box.h);
  ctx.strokeStyle = P.grid; ctx.lineWidth = 1; ctx.strokeRect(box.x + 0.5, box.y + 0.5, box.w, box.h);
  for (const f of [-1, 0, 1]) {
    text(nm(c.x - p.wall + f * span * 0.8).toFixed(0), Xp(c.x + f * span * 0.8), box.y + box.h + 15, { color: P.muted, size: 11, align: 'center' });
    text(nm(c.y + f * span * 0.8).toFixed(0), box.x - 5, Vp(c.y + f * span * 0.8) + 4, { color: P.muted, size: 11, align: 'right' });
  }
  text('along the beam x (nm)', box.x + box.w / 2, box.y + box.h + 32, { color: P.muted, size: 12, align: 'center' });
  ctx.save(); ctx.translate(box.x - 42, box.y + box.h / 2); ctx.rotate(-Math.PI / 2); text('across y (nm)', 0, 0, { color: P.muted, size: 12, align: 'center' }); ctx.restore();
  if (!wf) return;
  ctx.save(); ctx.beginPath(); ctx.rect(box.x, box.y, box.w, box.h); ctx.clip();
  let shown = 0;
  for (let i = 0; i < wf.n; i++) {
    if (((wf.px2[i] - c.x) / ax) ** 2 + ((wf.pyf[i] - c.y) / ay) ** 2 > 1) continue;
    shown++; ctx.fillStyle = P.weak; ctx.globalAlpha = 0.6; ctx.fillRect(Xp(wf.pX[i]) - 1.5, Vp(wf.pY[i]) - 1.5, 3, 3); ctx.globalAlpha = 1;
  }
  ctx.strokeStyle = P.strong; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(Xp(c.x), Vp(c.y), Math.max(1.5, Xp(c.x + ax) - Xp(c.x)), Math.max(1.5, Vp(c.y) - Vp(c.y + ay)), 0, 0, Math.PI * 2); ctx.stroke();
  const q = winQuery(c);
  if (q.n >= 30) {
    ctx.strokeStyle = P.arrow; ctx.fillStyle = P.arrow; ctx.lineWidth = 2; arrowLine(Xp(q.Xm), Vp(q.Ym), Xp(q.x2m), Vp(q.yfm), 7);
    ctx.beginPath(); ctx.arc(Xp(q.Xm), Vp(q.Ym), 5, 0, Math.PI * 2); ctx.stroke();
  }
  ctx.restore();
  legend(P, box, `amber dots: weak readings of runs ending in the window (${shown} sampled of ${q.n.toLocaleString('en-US')}) · ring: their mean · cyan outline: the window · same scale both ways`);
}
// Plot: slope across the field at the window's x, from windows of this size.
function drawWindowProfile(P, box) {
  const vm = 0.6, c = winCentre(), ax = winRx(), ay = winRy(), step = Math.max(2 * ay, 0.1);
  const { X, V } = axes(P, box, '', 'slope v_y / v_x', -vm, vm, (v) => v.toFixed(2));
  if (!wf) return;
  ctx.save(); ctx.beginPath(); ctx.rect(box.x, box.y, box.w, box.h); ctx.clip();
  ctx.strokeStyle = P.grid; ctx.beginPath(); ctx.moveTo(box.x, V(0)); ctx.lineTo(box.x + box.w, V(0)); ctx.stroke();
  const terms = M.propagate(T0, (c.x - p.wall) / p.k), n = 160;
  const curve = (f, color, dash, width) => {
    ctx.strokeStyle = color; ctx.lineWidth = width; ctx.setLineDash(dash); ctx.beginPath(); let on = false;
    for (let i = 0; i <= n; i++) { const y = -Y_HALF + 2 * Y_HALF * i / n, v = f(y); if (v === null || Math.abs(v) > 3 * vm) { on = false; continue; } on ? ctx.lineTo(X(y), V(v)) : ctx.moveTo(X(y), V(v)); on = true; }
    ctx.stroke(); ctx.setLineDash([]);
  };
  if (state.show.expected) curve((y) => { if (!(M.density(terms, y) > 1e-4)) return null; const q = M.windowQuery(wf.field, wf.acc, c.x, y, ax, ay); return q.expected ? q.expected.slope : null; }, P.exp, [], 2);
  if (state.show.current) curve((y) => (M.density(terms, y) > 1e-4 ? M.currentVelocity(terms, y) / p.k : null), P.cur, [5, 4], 1.2);
  ctx.strokeStyle = P.arrow; ctx.fillStyle = P.arrow; ctx.lineWidth = 1.3;
  for (let y = -Y_HALF + step / 2; y <= Y_HALF - step / 2 + 1e-9; y += step) {
    const q = M.windowQuery(wf.field, wf.acc, c.x, y, ax, ay);
    if (q.n >= 200) drawEstimate(X, V, y, q.slope, q.err, vm);
  }
  ctx.strokeStyle = P.strong; ctx.lineWidth = 1; ctx.setLineDash([2, 3]); ctx.beginPath(); ctx.moveTo(X(c.y), box.y); ctx.lineTo(X(c.y), box.y + box.h); ctx.stroke(); ctx.setLineDash([]);
  ctx.restore();
  legend(P, box, `amber points: windows of ${winSize()}, ${nm(step).toFixed(0)} nm apart · blue line: prediction · dashed: j/|ψ|² · dotted: this window`);
}

function axes(P, box, title, yLabel, ymin, ymax, fmtY) {
  ctx.fillStyle = P.panel; ctx.fillRect(box.x, box.y, box.w, box.h);
  ctx.strokeStyle = P.grid; ctx.lineWidth = 1; ctx.strokeRect(box.x + 0.5, box.y + 0.5, box.w, box.h);
  const X = (y) => box.x + (y + Y_HALF) / (2 * Y_HALF) * box.w;
  const V = (v) => box.y + box.h - (v - ymin) / (ymax - ymin) * box.h;
  { const st = niceStep(Y_HALF / 2); for (let i = -Math.floor(Y_HALF / st); i * st <= Y_HALF + 1e-9; i++) text(`${nm(i * st).toFixed(0)}`, X(i * st), box.y + box.h + 15, { color: P.muted, size: 11, align: 'center' }); }
  text('detected position y_f (nm)', box.x + box.w / 2, box.y + box.h + 32, { color: P.muted, size: 12, align: 'center' });
  for (const v of [ymin, (ymin + ymax) / 2, ymax]) text(fmtY(v), box.x - 5, V(v) + 4, { color: P.muted, size: 11, align: 'right' });
  ctx.save(); ctx.translate(box.x - 42, box.y + box.h / 2); ctx.rotate(-Math.PI / 2); text(yLabel, 0, 0, { color: P.muted, size: 12, align: 'center' }); ctx.restore();
  // selected strip
  if (state.selected !== null && state.stage !== 'one' && state.stage !== 'window') {
    const a = -Y_HALF + state.selected * 2 * Y_HALF / N_BINS;
    ctx.fillStyle = P.strip; ctx.fillRect(X(a), box.y, X(a + 2 * Y_HALF / N_BINS) - X(a), box.h);
  }
  return { X, V };
}

// Legend at the top right; items separated by ' · ' wrap onto more lines when narrow.
let legendPanel = null;   // the plot being drawn, for its Key switch
function legend(P, box, s) {
  if (legendPanel && state.panelKey[legendPanel] === false) return;
  ctx.font = '400 11px Inter, Arial, sans-serif';
  const lines = [];
  for (const item of s.split(' · ')) {
    let line = '';
    for (const word of item.split(' ')) {
      const next = line ? `${line} ${word}` : word;
      if (line && ctx.measureText(next).width > box.w - 26) { lines.push(line); line = word; }
      else line = next;
    }
    if (line) lines.push(line);
  }
  const w = Math.min(box.w - 8, Math.max(...lines.map((l) => ctx.measureText(l).width)) + 10);
  ctx.fillStyle = P.light ? 'rgba(241,246,248,0.92)' : 'rgba(11,28,41,0.92)';
  ctx.fillRect(box.x + box.w - w - 4, box.y + 3, w, 6 + 14 * lines.length);
  lines.forEach((l, i) => text(l, box.x + box.w - 9, box.y + 16 + 14 * i, { color: P.text, size: 11, align: 'right' }));
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
function drawEstimate(X, V, y, value, error, range) {
  const clamp = v => Math.max(-range, Math.min(range, v));
  ctx.beginPath(); ctx.moveTo(X(y), V(clamp(value - error))); ctx.lineTo(X(y), V(clamp(value + error))); ctx.stroke();
  if (Math.abs(value) <= range) {ctx.beginPath(); ctx.arc(X(y), V(value), 3, 0, Math.PI * 2); ctx.fill();}
  for (const sign of [-1, 1]) if (sign * value + error > range) {
    const x = X(y), edge = V(sign * range), inward = sign * 5;
    ctx.beginPath(); ctx.moveTo(x, edge); ctx.lineTo(x - 3, edge + inward); ctx.lineTo(x + 3, edge + inward); ctx.closePath(); ctx.fill();
  }
}

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
  if (state.show.fixedTime) curve(exp.ftCurve, P.ft, [2, 3], 1.8);
  if (state.stage !== 'one') {
    ctx.strokeStyle = P.arrow; ctx.fillStyle = P.arrow; ctx.lineWidth = 1.3;
    M.binVelocities(exp.bins, exp.dtau, 50).forEach((b) => {
      if (!b) return;
      const d = nm(b.v * exp.dtau), e = nm(b.err * exp.dtau);
      drawEstimate(X, V, b.y, d, e, range);
    });
  }
  ctx.restore();
  legend(P, box, box.h < 190 ? `points: measured · blue: prediction · dashed: ideal${state.show.fixedTime ? ' · dotted: fixed time' : ''}` : `amber points: measured · blue line: prediction, this pointer${instant() ? ' and timing' : ''} · dashed: ideal weak pointer${state.show.fixedTime ? ' · dotted: fixed time, y only' : ''} · scale ±${range.toFixed(1)} nm`);
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
  if (state.show.fixedTime) curve(exp.ftCurve, P.ft, [2, 3], 1.8);
  if (state.stage !== 'one') {
    const est = M.binVelocities(exp.bins, exp.dtau, 50);
    ctx.strokeStyle = P.arrow; ctx.fillStyle = P.arrow; ctx.lineWidth = 1.3;
    est.forEach((b) => {
      if (!b) return;
      const s = b.v / p.k, e = b.err / p.k;
      drawEstimate(X, V, b.y, s, e, vm);
    });
  }
  ctx.restore();
  legend(P, box, box.h < 190 ? `points: measured · blue: prediction · dashed: j/|ψ|²${state.show.fixedTime ? ' · dotted: fixed time' : ''}` : `amber points: measured · blue line: prediction, this pointer${instant() ? ' and timing' : ''} · dashed: j/|ψ|² (ideal weak pointer)${state.show.fixedTime ? ' · dotted: fixed time, y only' : ''}`);
}

function updateResults() {
  const set = (k, v) => { const o = document.querySelector(`[data-result="${k}"]`); if (o) o.value = v; };
  // Times: at instants (and in windows) the two measurements are at two times.
  const timed = instant() && state.stage !== 'map';
  document.querySelectorAll('[data-times-row]').forEach((el) => { el.hidden = !timed; });
  if (timed) {
    const tau = psAt(state.gap);
    if (state.stage === 'window') set('times', `τ = t₂ − t₁ = ${fmtPs(tau)}; window at t₂ = ${fmtPs(psAt(state.win.x))}`);
    else set('times', `t₁ = ${fmtPs(psAt(state.x1))}, t₂ = ${fmtPs(psAt(state.x1 + state.gap))} (τ = ${fmtPs(tau)})`);
  }
  if (state.stage === 'window') {
    document.querySelectorAll('[data-stage-rows]').forEach((el) => { el.hidden = !el.dataset.stageRows.split(' ').includes('window') || (el.dataset.prediction && !state.show[el.dataset.prediction]); });
    document.querySelectorAll('[data-recx-row]').forEach((el) => { el.hidden = true; });
    if (!wf) return;
    set('runs', wf.runs.toLocaleString('en-US'));
    const c = winCentre(), q = winQuery(c);
    set('winC', `(${nm(c.x - p.wall).toFixed(0)}, ${nm(c.y).toFixed(0)}) nm, ${winSize()}`);
    set('winN', q.n.toLocaleString('en-US'));
    const ok = q.n >= 30;
    set('winWeak', ok ? `(${nm(q.Xm - p.wall).toFixed(1)}, ${nm(q.Ym).toFixed(1)}) nm` : '—');
    set('winStrong', ok ? `(${nm(q.x2m - p.wall).toFixed(1)}, ${nm(q.yfm).toFixed(1)}) nm` : '—');
    set('winMeas', ok ? `${fmtS(q.slope)} ± ${q.err.toFixed(3)}` : '—');
    set('winExp', q.expected ? fmtS(q.expected.slope) : '—');
    set('winCur', fmtS(M.currentVelocity(M.propagate(T0, (c.x - p.wall) / p.k), c.y) / p.k));
    return;
  }
  if (!exp) return;
  const cellRuns = exp.cellBins ? exp.bins.count.reduce((x, y) => x + y, 0) : exp.used;
  set('runs', exp.runs.toLocaleString('en-US'));
  set('cellRuns', cellRuns.toLocaleString('en-US'));
  document.querySelectorAll('[data-recx-row]').forEach((el) => { el.hidden = !(instant() && state.recx && exp.cellBins); });
  $('#cellRunsLabel').textContent = `Runs at Δ = ${cellDx() >= 0 ? '+' : '−'}${Math.abs(nm(cellDx())).toFixed(0)} nm`;
  if (exp.cellBins) { const cs = $('#cellSel'); cs.max = exp.mix.parts.length - 1; cs.value = state.cell; $('#cellOut').value = `${cellDx() >= 0 ? '+' : '−'}${Math.abs(nm(cellDx())).toFixed(0)} nm`; cs.setAttribute('aria-valuetext', `${nm(cellDx()).toFixed(0)} nanometres from the packet centre`); }
  set('planes', !map ? '—' : map.done ? `${N_PLANES} of ${N_PLANES}` : `${map.planes.length} of ${N_PLANES}${state.running ? ` (pair ${map.index + 1} running)` : ''}`);
  set('pair', `${nm(exp.x1 - p.wall).toFixed(0)} → ${nm(exp.x2 - p.wall).toFixed(0)} nm`);
  // Stage 1 has no post-selection: show only the rows that mean something.
  document.querySelectorAll('[data-stage-rows]').forEach((el) => {
    el.hidden = !el.dataset.stageRows.split(' ').includes(state.stage) || (el.dataset.prediction && !state.show[el.dataset.prediction]);
  });
  const i = state.selected;
  const a = -Y_HALF + i * 2 * Y_HALF / N_BINS;
  const stripText = `${nm(a).toFixed(1)} to ${nm(a + 2 * Y_HALF / N_BINS).toFixed(1)} nm`;
  set('strip', stripText);
  const selector = $('#selectedStrip'); selector.max = N_BINS - 1; selector.value = i;
  selector.setAttribute('aria-valuetext', stripText); $('#selectedStripOut').value = stripText;
  const n = exp.bins.count[i];
  set('inStrip', n.toLocaleString('en-US'));
  const b = M.binVelocities(exp.bins, exp.dtau, 30)[i];
  set('meanY', b ? `${nm(exp.bins.sumY[i] / n).toFixed(1)} nm` : '—');
  set('vMeas', b ? `${fmtS(b.v / p.k)} ± ${(b.err / p.k).toFixed(3)}` : '—');
  set('vExp', exp.expected[i] ? fmtS(exp.expected[i].v / p.k) : '—');
  set('vCur', fmtS(exp.binCur[i]));
  set('vFt', fmtS(exp.binFt[i]));
}

// Plot titles name the pair of planes in stage 3.
function updateTitles() {
  const shiftBtn = panels.scatter.el.querySelector('[data-fp-act="shift"]');
  if (shiftBtn) shiftBtn.hidden = state.stage === 'window';
  if (state.stage === 'window') {
    const a = panels.scatter.el.querySelector('.fp-title'), b = panels.vel.el.querySelector('.fp-title');
    const t1 = 'Weak readings of the runs in the window', t2 = `Slope across the field at x = ${state.win.x} nm (windows)`;
    if (a.textContent !== t1) a.textContent = t1; if (b.textContent !== t2) b.textContent = t2;
    return;
  }
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
  // The display switches show for the whole of stage 3 (the arrows switch matters while it runs too)
  // and for a finished Windows run.
  const mt = $('.map-toggles'), mapped = state.stage === 'map' || (state.stage === 'window' && !!wf && wf.runs >= state.perPlane);
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
    legendPanel = k;
    if (state.stage === 'window') { if (wf) (k === 'scatter' ? drawWindowCloud : drawWindowProfile)(P, plotBox(s.W, s.H)); }
    else (k === 'scatter' ? drawScatter : drawVelocity)(P, plotBox(s.W, s.H));
  }
  legendPanel = null;
  ctx = mainCtx;
  syncOverlays();
}

// ---------------------------------------------------------------- main loop
let lastT = performance.now(), lastRender = 0;
function frame(now) {
  const dt = Math.min(0.1, (now - lastT) / 1000); lastT = now;
  if (pending && !drag) rebuild();
  if (state.waveMode !== 'density' && (state.movingWave || state.running || (state.stage === 'one' && !exp?.runs))) phaseClock = (phaseClock + dt * state.speed * 2 * Math.PI / 0.8) % (2 * Math.PI);
  if (state.running && exp && instant() && state.stage !== 'one') advanceTrain(dt);
  if (state.running && state.stage === 'window' && wf) {
    // About 20 ms of sampling per frame; 20 million runs take ten to twenty seconds.
    const t0 = performance.now(), budget = 40 * Math.min(1, state.speed);
    while (wf.runs < state.perPlane && performance.now() - t0 < budget) for (let i = 0; i < 2000 && wf.runs < state.perPlane; i++) addWindowRun(M.sampleWindowRun(wf.field));
    if (wf.runs >= state.perPlane) { stop(); showNext(); }
  }
  if (state.running && exp) {
    if (state.stage === 'one') {
      if (!anim) anim = makeRunAnim(sampleOne(exp));
      if (!anim.done) {
        anim.t += dt * state.speed / (instant() ? RUN_SECONDS_INSTANT : RUN_SECONDS);
        if (anim.t >= 1) {
          addRun(exp, anim.run);
          // Pause after each run: the finished run stays on screen, large,
          // until Start; otherwise it shrinks into a stored point right away.
          if (state.pauseEach) { anim.t = 1; anim.done = true; stop(); }
          else { shrinkRun(anim); anim = null; }
        }
      }
    } else if (state.stage === 'many') {
      // One schedule for the drawing and the plots: the collection takes about
      // MANY_SECONDS at speed 1, starting slowly (cubic) so the first points
      // appear one by one; both end together when the last run is in.
      exp.clock = Math.min(1, (exp.clock || 0) + dt * state.speed / MANY_SECONDS);
      const want = Math.ceil(state.perPlane * exp.clock ** 3);
      const n = Math.min(150000, Math.max(0, want - exp.runs));
      for (let i = 0; i < n && exp.runs < state.perPlane; i++) addRun(exp, sampleOne(exp));
      if (exp.runs >= state.perPlane) { stop(); showNext(); }
    } else if (map && !map.done) {
      // About MAP_PAIR_SECONDS per pair at speed 1, starting slowly (quadratic),
      // so each pair's arrows can be seen building up as its runs come in.
      exp.clock = Math.min(1, (exp.clock || 0) + dt * state.speed / MAP_PAIR_SECONDS);
      const n = Math.min(state.perPlane - exp.runs, 150000, Math.max(0, Math.ceil(state.perPlane * exp.clock ** 2) - exp.runs));
      for (let i = 0; i < n; i++) addRun(exp, sampleOne(exp));
      if (exp.runs >= state.perPlane) finishPlane();
    }
  }
  // During a Windows run, redraw about 6 times a second so most of the time goes to sampling.
  const heavy = state.running && state.stage === 'window';
  if (!heavy || now - lastRender > 160) { lastRender = now; try { render(); } catch (err) { console.error(err); } }
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
  // Legend button: explanatory labels in the drawing (what the boxes are,
  // off-scale counts, the trace description). Data labels stay.
  legendControl: {
    getVisible: () => state.labels,
    setVisible: (v) => { state.labels = v; try { localStorage.setItem('qontic-weak-velocity-labels', String(v)); } catch (e) { /* ignore */ } },
  },
  getCanvases: () => [canvas, ...(coordinateTools.canvas.hidden ? [] : [coordinateTools.canvas]), ...scaleCanvas(), ...Object.values(panels).filter((pn) => pn.open && !pn.min).map((pn) => pn.cv)],
  filename: 'weak-velocity',
  getShareUrl: shareUrl,
  beginRecording: () => { const was = state.running; if (!was) start(); return was; },
  endRecording: (was) => { if (!was) stop(); },
});
// ---------------------------------------------------------------- levels
// Basic: stages 1–3, pointer spread, the main predictions. Standard: windows,
// instants, planes, runs, geometry, display modes. Expert: everything. A setting a
// level hides takes its default; the user's value comes back with the level.
const setRuns = (v) => { state.perPlane = v; $('#perPlane').value = RUNS.indexOf(v); $('#perPlaneOut').value = fmtRuns(v); pending = true; };
const setShow = (key, v) => { if (state.show[key] !== v) toggle(key); pending = true; };
const levelSettings = [
  { id: 'timing', min: 'standard', value: 'plane', get: () => state.timing, set: (v) => { state.timing = v; stop(); pending = true; } },
  { id: 'packet', min: 'standard', value: 150, get: () => state.packet, set: (v) => { state.packet = v; pending = true; } },
  { id: 'x1', min: 'standard', value: 500, get: () => state.x1, set: (v) => { state.x1 = v; $('#x1').value = v; pending = true; } },
  { id: 'gap', min: 'standard', value: 50, get: () => state.gap, set: (v) => { state.gap = v; $('#gap').value = v; clampGeometry(); pending = true; } },
  { id: 'runs', min: 'standard', value: 1e6, get: () => state.perPlane, set: setRuns },
  { id: 'waveMode', min: 'standard', value: 'density', get: () => state.waveMode, set: (v) => { state.waveMode = v; document.querySelectorAll('[data-wavemode]').forEach((o) => { const on = o.dataset.wavemode === v; o.classList.toggle('active', on); o.setAttribute('aria-pressed', String(on)); }); } },
  { id: 'planeRuns', min: 'standard', value: true, get: () => state.show.planeRuns, set: (v) => setShow('planeRuns', v) },
  { id: 'scatterRuns', min: 'standard', value: true, get: () => state.show.scatter, set: (v) => setShow('scatter', v) },
  ...Object.keys(GEO_DEFAULT).map((k) => ({ id: `geo-${k}`, min: 'standard', value: GEO_DEFAULT[k], get: () => geo[k], set: (v) => setGeometry(k, v) })),
  { id: 'recx', min: 'expert', value: false, get: () => state.recx, set: (v) => { state.recx = v; state.cell = null; $('#recx').setAttribute('aria-pressed', String(v)); pending = true; } },
  { id: 'fixedTime', min: 'expert', value: false, get: () => state.show.fixedTime, set: (v) => setShow('fixedTime', v) },
  { id: 'winLen', min: 'expert', value: 100, get: () => state.win.len, set: (v) => { state.win.len = v; } },
  { id: 'winWid', min: 'expert', value: 10, get: () => state.win.wid, set: (v) => { state.win.wid = v; } },
  { id: 'arrowEvery', min: 'expert', value: 1, get: () => state.arrowEvery, set: (v) => { state.arrowEvery = v; $('#arrowDensity').value = 6 - v / Math.ceil(N_BINS / 40); } },
  { id: 'nLines', min: 'expert', value: 20, get: () => state.nLines, set: (v) => { state.nLines = v; $('#lineCount').value = v; $('#lineCountOut').value = v; if (map?.done) buildLines(); } },
  { id: 'equalScales', min: 'standard', value: false, get: () => state.equalScales, set: (v) => { state.equalScales = v; $('#equalScales').setAttribute('aria-pressed', String(v)); } },
  { id: 'shiftView', min: 'expert', value: false, get: () => state.shiftView, set: (v) => { state.shiftView = v; panels.scatter.el.querySelector('[data-fp-act="shift"]')?.setAttribute('aria-pressed', String(v)); } },
];
// A shared link that uses higher-level settings opens at the level that shows them.
function linkLevel() {
  const q = new URLSearchParams(location.search);
  if (['recx', 'winl', 'winw', 'winr', 'ft', 'cell'].some((k) => q.has(k))) return 'expert';
  if (q.get('stage') === 'window' || ['timing', 'x1', 'gap', 'runs', 'packet', 'show', ...Object.keys(GEO_DEFAULT)].some((k) => q.has(k))) return 'standard';
  return 'basic';
}
const levelsApi = mountQonticLevels({
  controls: controlsEl, storageKey: 'qontic-weak-velocity', settings: levelSettings, minimumLevel: linkLevel,
  onChange: (level) => {
    if (level === 'basic' && state.stage === 'window') setStage('map');
    showNext();
    updateText();
  },
});

// Edit geometry: a toolbar button, as in the analytical double-slit app. The
// handles appear only while it is pressed; right-click on the drawing also
// toggles it, and Escape leaves it.
const editButton = (() => {
  const toolbar = document.querySelector('.qontic-media-toolbar');
  if (!toolbar) return null;
  const b = document.createElement('button'); b.type = 'button'; b.className = toolbar.querySelector('button').className;
  b.setAttribute('aria-label', 'Edit geometry'); b.setAttribute('aria-pressed', 'false');
  b.dataset.levelMin = 'standard';   // geometry is a Standard setting
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
canvas.addEventListener('contextmenu', (e) => { e.preventDefault(); if (document.body.dataset.qonticLevel !== 'basic' || editing) setEditing(!editing); });
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
    const name = (k) => (DRAG_LABEL[k] || GEO_LABEL[k] || { sw: 'Pointer spread', runs: 'Runs per pair of planes', packet: 'Packet length' }[k] || k).toLowerCase();
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
