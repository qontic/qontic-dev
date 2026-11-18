import '../../../../shared/qontic-controls.js?v=3.2';
import { mountQonticShell } from '../../../../shared/qontic-shell.js?v=3.7';
import { mountQonticMedia } from '../../../../shared/qontic-media.js?v=3.0';
import { mountQonticShortcuts } from '../../../../shared/qontic-shortcuts.js?v=1';
import { APP_RELEASE } from './release.js?v=0.7.0';
import { makeSetup, makeCluster, densityAfterG2, intensityTransmission } from './wave.js';
import { buildEnsemble, runCluster, gauss } from './sim.js';
import { mount3D, webglAvailable } from './view3d.js';
import {
  PAPER, averagedCoefficients, averagingGrid, visibility, fringeProfile, fitSine, poisson,
  deBroglie, talbotLength, atomsIn, diameter, n0, phi0,
} from './talbot.js';

mountQonticShell({
  title: 'Nanoparticle Interference (Vienna 2026)',
  eyebrow: 'Q-Ontic · Experiments',
  navigation: 'breadcrumbs',
  purpose: 'Sodium clusters of 170,000 atomic mass units sent through three gratings made of light, with the parameters of the 2026 Vienna experiment. Scan the third grating, count the clusters, and see whether the counts follow the quantum prediction or a classical moiré shadow.',
  badge: 'Experiments',
  version: `Nanoparticle Interference · Version ${APP_RELEASE.version} · ${APP_RELEASE.date}`,
  homeHref: '../../../index.html',
});

// ---------------------------------------------------------------- state
const $ = (sel) => document.querySelector(sel);
const canvas = $('#stage');
let ctx = canvas.getContext('2d'); // switched to an insert's context while drawing it
const mainCtx = ctx;
let insertMode = false;
const controlsEl = $('qontic-controls');

const D = PAPER.d;
// The paper moves G3 in 15 nm steps. Here: 18 steps of 14.8 nm, exactly two periods,
// so that the sine fit is not biased by the higher harmonics of the fringe profile.
const SCAN_X = Array.from({ length: 18 }, (_, i) => (i * 2 * PAPER.d) / 18);
const PROFILE_X = Array.from({ length: 241 }, (_, i) => (i * 270e-9) / 240);
const ARR_BINS = 38; // arrival histogram over two periods, 7 nm bins
const ARR_X = Array.from({ length: 241 }, (_, i) => (i * 2 * PAPER.d) / 240);
const M_MIN = 20, M_MAX = 2000;

const PRESETS = {
  fig2a: { massKDa: 172, v: 160, P: [0.062, 0.0152, 0.068], sigmaV: 10, dmRel: 0.32, L: PAPER.L },
  heavy: { massKDa: 1000, v: 160, P: [0.1, 0.006, 0.1], sigmaV: 10, dmRel: 0.32, L: PAPER.L },
  slow: { massKDa: 1000, v: 25, P: [0.1, 0.0009, 0.1], sigmaV: 2, dmRel: 0.32, L: PAPER.L },
};

const state = {
  ...structuredClone(PRESETS.fig2a),
  scale: true, truth: 'quantum', chart: 'power',
  show: { predict: true, quantum: true, classical: true, data: true, wave: true, ensemble: true, traj: true, trace: true },
  interp: 'orthodox', view3d: true, x0frac: 0.5, perPacket: 60, packetsPerPoint: 20, inFlight: 5,
  running: false, autoRun: false, speed: 1,
  step: 'setup', prediction: null, finished: false,
  scanIndex: 0, dwell: 0, data: [],
};
let model = null; // predictions for the current settings
let charts = null; // visibility curves for the chart

readUrl();

// ---------------------------------------------------------------- model
const params = () => ({ P: state.P, waist: PAPER.waist, L: state.L, d: D });
const beam = () => ({ massKDa: state.massKDa, v: state.v, sigmaV: state.sigmaV, dmRel: state.dmRel });
const scaleF = () => (state.scale ? PAPER.scale : 1);

function computeModel(fast = false) {
  const p = params(), b = beam(), s = scaleF();
  const [nv, nm] = fast ? [7, 5] : [21, 11];
  const Sq = averagedCoefficients(p, b, false, 6, nv, nm);
  const Sc = averagedCoefficients(p, b, true, 6, nv, nm);
  const vis = (S) => (s * 2 * Math.hypot(...S[1])) / Math.abs(S[0][0]);
  const LT = talbotLength(state.massKDa, state.v);
  const setup = makeSetup({ massKDa: state.massKDa, v: state.v, P: state.P, L: state.L });
  // density of clusters arriving at the G3 plane (before the mask), quantum and classical
  const Rq = averagedCoefficients(p, b, false, 12, Math.min(nv, 9), Math.min(nm, 5), false);
  const Rc = averagedCoefficients(p, b, true, 12, Math.min(nv, 9), Math.min(nm, 5), false);
  if (!fast) ens = buildEnsemble(p, b, s);
  // probability that a cluster which passed G1 is counted: <S0> / <|t1|^2>, same weights
  const pCount = ens ? Sq[0][0] / (ens.total / averagingGrid(b, 21, 11).reduce((a, q) => a + q.w, 0)) : 0;
  model = {
    setup, cluster: makeCluster(setup, state.x0frac * D), pCount,
    arrQ: fringeProfile(Rq, ARR_X, D, s), arrC: fringeProfile(Rc, ARR_X, D, s),
    vq: vis(Sq), vc: vis(Sc),
    profQ: fringeProfile(Sq, PROFILE_X, D, s), profC: fringeProfile(Sc, PROFILE_X, D, s),
    scanQ: fringeProfile(Sq, SCAN_X, D, s), scanC: fringeProfile(Sc, SCAN_X, D, s),
    LT, ratio: state.L / LT, ldb: deBroglie(state.massKDa, state.v),
    n0G1: n0(state.P[0], state.massKDa, state.v, PAPER.waist[0]),
    phiG2: phi0(state.P[1], state.massKDa, state.v, PAPER.waist[1]),
    n0G: [0, 1, 2].map((i) => n0(state.P[i], state.massKDa, state.v, PAPER.waist[i])),
  };
}

function powerRange() {
  const natural = 60 * (state.v / 160) * (172 / state.massKDa);
  const r = Math.min(60, Math.max(3, natural, 1.5 * state.P[1] * 1e3));
  const step = r > 20 ? 10 : r > 6 ? 2 : 1;
  return Math.ceil(r / step) * step;
}
// Chart curves are computed a few points at a time so the page stays responsive.
let chartTimer = 0, chartToken = 0;
function scheduleCharts() {
  clearTimeout(chartTimer);
  chartTimer = setTimeout(computeCharts, 120);
}
function computeCharts() {
  const token = ++chartToken;
  const s = scaleF(), b = beam(), p = params(), P1 = state.P[0], P3 = state.P[2];
  const nv = 9, nm = 5;
  const power = state.chart === 'power';
  // n0 and phi0 scale as m P / v, so the useful G2 power range scales as v / m.
  const pMax = powerRange();
  const xs = power
    ? Array.from({ length: 121 }, (_, i) => (i * pMax) / 120)
    : Array.from({ length: 61 }, (_, i) => M_MIN * (M_MAX / M_MIN) ** (i / 60));
  const at = (x, cl) => (power
    ? visibility({ ...p, P: [P1, x * 1e-3, P3] }, b, cl, s, nv, nm)
    : visibility(p, { ...b, massKDa: x }, cl, s, nv, nm));
  charts = { kind: state.chart, pMax, xs, q: xs.map(() => NaN), c: xs.map(() => NaN) };
  let i = 0;
  const work = () => {
    if (token !== chartToken) return;
    const t0 = performance.now();
    while (i < xs.length && performance.now() - t0 < 12) { charts.q[i] = at(xs[i], false); charts.c[i] = at(xs[i], true); i++; }
    if (i < xs.length) setTimeout(work, 0);
  };
  work();
}

let modelTimer = 0;
function rebuild(fast = false) {
  computeModel(fast);
  clearTimeout(modelTimer);
  if (fast) modelTimer = setTimeout(() => { computeModel(false); updateText(); }, 150);
  resetPacket();
  scheduleCharts();
  scheduleCarpet();
  updateText();
}

// ---------------------------------------------------------------- formatting
const fmt = (x, d = 2) => (Math.abs(x) < 0.5 * 10 ** -d ? 0 : x).toFixed(d);
const fmtMass = (m) => (m >= 1000 ? `${fmt(m / 1000, m >= 10000 ? 0 : 2)} MDa` : `${Math.round(m)} kDa`);
const fmtInt = (n) => Math.round(n).toLocaleString('en-US');
const massToSlider = (m) => Math.log(m / M_MIN) / Math.log(M_MAX / M_MIN);
const sliderToMass = (t) => {
  const m = M_MIN * (M_MAX / M_MIN) ** t;
  const mag = 10 ** Math.floor(Math.log10(m) - 1);
  return Math.round(m / mag) * mag;
};

function updateText() {
  $('#massOut').value = fmtMass(state.massKDa);
  $('#speedOut').value = `${state.v} m/s`;
  $('#p2Out').value = `${fmt(state.P[1] * 1e3, 1)} mW`;
  $('#p1Out').value = `${Math.round(state.P[0] * 1e3)} mW`;
  $('#p3Out').value = `${Math.round(state.P[2] * 1e3)} mW`;
  $('#sigvOut').value = `${fmt(state.sigmaV, 1)} m/s`;
  $('#dmOut').value = fmt(state.dmRel, 2);
  $('#glOut').value = `${fmt(state.L, 3)} m`;
  $('#pppOut').value = String(state.perPacket);
  $('#pposOut').value = String(state.packetsPerPoint);
  $('#ppos').parentElement.title = `Packets sent with G3 at each of the 18 positions; about ${fmtInt(expectedPerPoint())} clusters counted per position. More packets give smaller error bars and a longer scan.`;

  const r = model.ratio;
  const near = r < 0.25 ? ' The two predictions nearly coincide here: the wave hardly spreads before G2.' : '';
  $('#coreHint').textContent = `λdB = ${fmt(model.ldb * 1e15, 1)} fm · L/L_T = ${fmt(r, 2)}.${near}`;

  const N = atomsIn(state.massKDa);
  $('#setupList').innerHTML = `Sodium clusters of <b>${fmtMass(state.massKDa)}</b> (about ${fmtInt(N)} atoms, de Broglie wavelength <b>${fmt(model.ldb * 1e15, 1)} fm</b>) fly through three gratings made of light. Behind G3 the survivors are counted while G3 is moved sideways. Details in the Physics tab.`;
  $('#setupNext').textContent = state.show.predict ? 'Next: the question' : 'Start the scan';
  $('#predictionText').textContent = `Clusters of ${fmtMass(state.massKDa)} at ${state.v} m/s, with G2 at ${fmt(state.P[1] * 1e3, 1)} mW. G3 will be scanned over ${SCAN_X.length} positions. Which prediction will the counts follow?`;
}

// ---------------------------------------------------------------- controls
function setPressed(group, attr, value) {
  document.querySelectorAll(`${group} [${attr}]`).forEach((b) => {
    const on = b.getAttribute(attr) === value;
    b.classList.toggle('active', on); b.setAttribute('aria-pressed', String(on));
  });
}
function syncControls() {
  $('#mass').value = massToSlider(state.massKDa);
  $('#speed').value = state.v;
  $('#p2').value = state.P[1] * 1e3;
  $('#p1').value = state.P[0] * 1e3;
  $('#p3').value = state.P[2] * 1e3;
  $('#sigv').value = state.sigmaV;
  $('#dm').value = state.dmRel;
  $('#gl').value = state.L;
  $('#ppos').value = state.packetsPerPoint;
  $('#inflight').value = state.inFlight; $('#inflightOut').value = String(state.inFlight);
  $('#ppp').value = state.perPacket; $('#pppOut').value = String(state.perPacket);
  $('#x0').value = state.x0frac; $('#x0Out').value = `${Math.round(state.x0frac * D * 1e9)} nm`;
  setPressed('.truth-group', 'data-truth', state.truth);
  setPressed('.chart-group', 'data-chart', state.chart);
  document.querySelectorAll('[data-toggle]').forEach((b) => {
    const k = b.dataset.toggle;
    b.setAttribute('aria-pressed', String(k === 'scale' ? state.scale : state.show[k]));
  });
  const active = Object.entries(PRESETS).find(([, p]) => p.massKDa === state.massKDa && p.v === state.v
    && p.P.every((x, i) => Math.abs(x - state.P[i]) < 1e-6) && p.sigmaV === state.sigmaV && p.dmRel === state.dmRel && p.L === state.L);
  setPressed('.preset-group', 'data-preset', active ? active[0] : '');
}

function changed(fast = false) { rebuild(fast); resetRun(); syncControls(); }

$('#mass').addEventListener('input', (e) => { state.massKDa = sliderToMass(+e.target.value); changed(true); });
$('#speed').addEventListener('input', (e) => { state.v = +e.target.value; changed(true); });
$('#p2').addEventListener('input', (e) => { state.P[1] = +e.target.value * 1e-3; changed(true); });
$('#p1').addEventListener('input', (e) => { state.P[0] = +e.target.value * 1e-3; changed(true); });
$('#p3').addEventListener('input', (e) => { state.P[2] = +e.target.value * 1e-3; changed(true); });
$('#sigv').addEventListener('input', (e) => { state.sigmaV = +e.target.value; changed(true); });
$('#dm').addEventListener('input', (e) => { state.dmRel = +e.target.value; changed(true); });
$('#gl').addEventListener('input', (e) => { state.L = +e.target.value; changed(true); });
$('#ppp').addEventListener('input', (e) => { state.perPacket = +e.target.value; updateText(); resetRun(); });
$('#x0').addEventListener('input', (e) => { state.x0frac = +e.target.value; model.cluster = makeCluster(model.setup, state.x0frac * D); resetPacket(); $('#x0Out').value = `${Math.round(state.x0frac * D * 1e9)} nm`; scheduleCarpet(); });
$('#inflight').addEventListener('input', (e) => { state.inFlight = +e.target.value; $('#inflightOut').value = String(state.inFlight); });
$('#ppos').addEventListener('input', (e) => { state.packetsPerPoint = +e.target.value; updateText(); resetRun(); });
document.querySelectorAll('[data-preset]').forEach((b) => b.addEventListener('click', () => applyPreset(b.dataset.preset)));
document.querySelectorAll('[data-truth]').forEach((b) => b.addEventListener('click', () => { state.truth = b.dataset.truth; syncControls(); resetRun(); }));
document.querySelectorAll('[data-chart]').forEach((b) => b.addEventListener('click', () => { state.chart = b.dataset.chart; syncControls(); charts = null; computeCharts(); }));
document.querySelectorAll('[data-toggle]').forEach((b) => b.addEventListener('click', () => {
  const k = b.dataset.toggle;
  if (k === 'scale') { state.scale = !state.scale; changed(); return; }
  state.show[k] = !state.show[k];
  b.setAttribute('aria-pressed', String(state.show[k]));
  if (k === 'predict') updateText();
  if (k === 'ensemble') { resetPacket(); computeCarpet(); }
  if (k === 'trace' && carpet) carpet.dirty = true;
}));

function applyPreset(name) {
  Object.assign(state, structuredClone(PRESETS[name]));
  changed();
}

function showStep(step) {
  ['setup', 'question', 'run', 'verdict'].forEach((k) => $(`#${k}Step`).classList.toggle('hidden', k !== step));
  state.step = step;
}
$('#setupNext').addEventListener('click', () => (state.show.predict ? showStep('question') : start()));
$('#setupBack').addEventListener('click', () => showStep('setup'));
$('#showSetup').addEventListener('click', () => { stop(); showStep('setup'); });
$('#questionStep').addEventListener('click', (e) => {
  const b = e.target.closest('[data-predict]');
  if (!b) return;
  state.prediction = b.dataset.predict === 'skip' ? null : b.dataset.predict;
  start();
});

function resetRun() {
  state.running = false; state.finished = false; state.prediction = null;
  state.scanIndex = 0;
  controlsEl.setAttribute('running', 'false');
  resetRunState();
  showStep('setup');
}
function start() {
  if (!ens) return;
  if (state.finished) { resetRunState(); state.finished = false; }
  if (state.step !== 'run') showStep('run');
  state.running = true;
  controlsEl.setAttribute('running', 'true');
}
function stop() { state.running = false; controlsEl.setAttribute('running', 'false'); }

controlsEl.addEventListener('qontic:start', () => start());
controlsEl.addEventListener('qontic:stop', () => stop());
controlsEl.addEventListener('qontic:reset', () => resetRun());
controlsEl.addEventListener('qontic:autorun', (e) => { state.autoRun = e.detail.autoRun; controlsEl.setAttribute('auto-run', String(state.autoRun)); });
controlsEl.addEventListener('qontic:speed', (e) => { state.speed = e.detail.speed; });
controlsEl.addEventListener('qontic:interpretation', (e) => setInterpretation(e.detail.interpretation));
// Interpretation is a display choice: the wave, the probabilities and the record are unchanged.
const FROM_CONTROL = { cpn: 'orthodox', pw: 'pilot-wave', mw: 'many-worlds' };
const TO_CONTROL = { orthodox: 'cpn', 'pilot-wave': 'pw', 'many-worlds': 'mw' };
function setInterpretation(id) {
  const name = FROM_CONTROL[id] || id;
  if (!CAPTION[name]) return;
  state.interp = name;
  if (controlsEl.getAttribute('interpretation') !== TO_CONTROL[name]) controlsEl.setAttribute('interpretation', TO_CONTROL[name]);
  document.querySelectorAll('.pw-only').forEach((el) => el.classList.toggle('hidden', name !== 'pilot-wave'));
  if (state.finished) finish();
}
controlsEl.addEventListener('qontic:tab', (e) => {
  controlsEl.setAttribute('active-tab', e.detail.tab);
  document.querySelectorAll('[data-control-pane]').forEach((p) => p.classList.toggle('hidden', p.dataset.controlPane !== e.detail.tab));
});

document.querySelector('.tabs').addEventListener('click', (event) => {
  const button = event.target.closest('[data-view]');
  if (!button) return;
  document.querySelectorAll('.tabs [data-view]').forEach((b) => b.classList.toggle('active', b === button));
  document.querySelectorAll('[data-panel]').forEach((p) => p.classList.toggle('hidden', p.dataset.panel !== button.dataset.view));
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

// ---------------------------------------------------------------- URL state
function readUrl() {
  const q = new URLSearchParams(location.search);
  const num = (k, lo, hi) => { const x = parseFloat(q.get(k)); return Number.isFinite(x) ? Math.min(hi, Math.max(lo, x)) : null; };
  const m = num('m', M_MIN, M_MAX); if (m !== null) state.massKDa = m;
  const v = num('v', 20, 250); if (v !== null) state.v = Math.round(v);
  ['p1', 'p2', 'p3'].forEach((k, i) => { const x = num(k, 0, i === 1 ? 60 : 150); if (x !== null) state.P[i] = x * 1e-3; });
  const sv = num('sv', 0, 30); if (sv !== null) state.sigmaV = sv;
  const dm = num('dm', 0, 0.5); if (dm !== null) state.dmRel = dm;
  const L = num('L', 0.4, 1.6); if (L !== null) state.L = L;
  const view = { orthodox: 'orthodox', 'pilot-wave': 'pilot-wave', 'many-worlds': 'many-worlds' }[q.get('view')]; if (view) state.interp = view;
}
function shareUrl() {
  const u = new URL(location.href);
  u.search = new URLSearchParams({
    m: String(state.massKDa), v: String(state.v),
    p1: fmt(state.P[0] * 1e3, 1), p2: fmt(state.P[1] * 1e3, 1), p3: fmt(state.P[2] * 1e3, 1),
    sv: String(state.sigmaV), dm: String(state.dmRel), L: String(state.L), view: state.interp,
  }).toString();
  return u.href;
}

// ---------------------------------------------------------------- scan analysis
function analyse() {
  if (state.data.length < 4) return null;
  const xs = state.data.map((p) => p.x), ys = state.data.map((p) => p.n);
  const fit = fitSine(xs, ys, D);
  if (!fit) return null;
  return fit;
}

// ---------------------------------------------------------------- verdict
function finish() {
  state.finished = true;
  const a = analyse();
  if (!a) return;
  // As in the paper, the comparison is made on the visibility from a sine fit.
  const sep = Math.abs(model.vq - model.vc) / Math.max(a.dV, 1e-6);
  const favoured = sep < 3 ? 'same' : Math.abs(a.V - model.vq) < Math.abs(a.V - model.vc) ? 'quantum' : 'classical';
  const miss = (v) => Math.abs(a.V - v) / Math.max(a.dV, 1e-6);
  const right = state.prediction ? state.prediction === favoured : null;
  const name = { quantum: 'the quantum prediction', classical: 'the classical prediction', same: 'either prediction' };
  const nums = `Fitted visibility ${fmt(a.V)} ± ${fmt(a.dV)}; quantum ${fmt(model.vq, 3)}, classical ${fmt(model.vc, 3)}.`;
  let text;
  if (favoured === 'same') {
    text = `The two predicted visibilities differ by less than three times the error of the fit, so the counts fit ${name.same}. ${nums} `
      + (model.ratio < 0.3
        ? `With L/L<sub>T</sub> = ${fmt(model.ratio, 2)} the wave barely spreads before G2, so waves behave like rays and the quantum and classical fringes coincide. A scan like this shows fringes, but not that they come from interference. Slower or lighter clusters raise L/L<sub>T</sub>.`
        : 'The two predictions differ here, but not by more than the counting noise. More packets per position (Advanced) would separate them.');
  } else {
    const other = favoured === 'quantum' ? 'classical' : 'quantum';
    text = `The counts follow ${name[favoured]}; ${name[other]} misses the fitted visibility by ${fmt(miss(favoured === 'quantum' ? model.vc : model.vq), 0)} standard errors. ${nums}`;
    if (state.truth === 'classical') text += ' These counts were drawn from the hypothetical classical world (Advanced). The real experiment found the quantum prediction.';
    else if (isFig2a()) text += ' The paper measured V = 0.10 ± 0.01 and 0.08 ± 0.01 at these settings.';
  }
  text += ' ' + {
    orthodox: 'Orthodox: each count is a detection sampled from |ψ|²; the account says nothing about where a cluster went between the gratings.',
    'pilot-wave': 'Pilot-Wave: each counted cluster followed one trajectory (top panel). The trajectories are distributed as |ψ|², so they give these same probabilities.',
    'many-worlds': 'Many-Worlds: this is one branch. Every other record also occurs, with weight given by |ψ|²; most branches look like this one.',
  }[state.interp];
  const lead = right === null ? '' : `<strong>${right ? 'Right.' : 'Not quite.'}</strong> You chose ${state.prediction === 'same' ? '“this scan cannot tell”' : name[state.prediction]}. `;
  $('#verdict').innerHTML = lead + text;
  const next = [];
  if (!isFig2a()) next.push(['fig2a', 'Vienna 2026 settings']);
  if (state.massKDa < 900 || state.v !== 160) next.push(['heavy', 'Heavier: 1 MDa at 160 m/s']);
  if (!(state.massKDa === 1000 && state.v === 25)) next.push(['slow', '1 MDa, slowed to 25 m/s']);
  if (state.interp === 'many-worlds') next.push(['branch', 'Sample another branch']);
  next.push(['again', 'Scan again']);
  $('#nextSteps').innerHTML = next.map(([k, l]) => `<button type="button" class="qontic-app-toggle" data-next="${k}">${l}</button>`).join('');
  showStep('verdict');
}
// Many-Worlds: draw another complete detector record with the same weights.
// Many-Worlds: another complete detector record, from the same number of clusters.
function sampleBranch() {
  const mode = state.truth === 'classical' ? 'classical' : 'sampled', n = state.perPacket * state.packetsPerPoint;
  run.arrivals = new Float64Array(ARR_BINS); run.nArr = 0;
  run.points = SCAN_X.map((x) => {
    let k = 0;
    for (let i = 0; i < n; i++) { const c = runCluster(ens, mode, x, Math.random); if (c.fate !== 'G2') addArrival(c.xj); if (c.fate === 'counted') k++; }
    return { x, n: k, arrived: state.packetsPerPoint };
  });
  state.data = run.points.map(({ x, n: k }) => ({ x, n: k }));
  run.marks = [];
  finish();
}
const isFig2a = () => {
  const p = PRESETS.fig2a;
  return state.massKDa === p.massKDa && state.v === p.v && p.P.every((x, i) => Math.abs(x - state.P[i]) < 1e-6) && state.L === p.L;
};
$('#nextSteps').addEventListener('click', (e) => {
  const k = e.target.closest('[data-next]')?.dataset.next;
  if (!k) return;
  if (k === 'again') { state.finished = true; start(); return; }
  if (k === 'branch') { sampleBranch(); return; }
  applyPreset(k);
  if (state.show.predict) showStep('question');
});

// ---------------------------------------------------------------- drawing helpers
function palette() {
  const light = document.body.classList.contains('qontic-light');
  return light ? {
    bg: '#fbfdfe', panel: '#f1f6f8', frame: '#c9d9e0', text: '#183747', muted: '#4f6573', grid: '#dbe6eb', axis: '#7f949f',
    q: '#0b8fa0', c: '#c4661b', data: '#9a6200', laser: '#7a4fb0', laserSoft: 'rgba(122,79,176,0.28)', beam: '#35505f', lost: '#c62828',
    waveLo: [251, 253, 254], waveHi: [8, 92, 112],
  } : {
    bg: '#071521', panel: '#0a1c2a', frame: '#23465a', text: '#d6e9f2', muted: '#9fb4c2', grid: '#163246', axis: '#5d7e90',
    q: '#62dce8', c: '#f0a35e', data: '#f0ca61', laser: '#c9a7ff', laserSoft: 'rgba(201,167,255,0.25)', beam: '#b6cad6', lost: '#ff6b6b',
    waveLo: [4, 14, 24], waveHi: [150, 236, 245],
  };
}
function label(text, x, y, { color, size = 12, align = 'left', base = 'alphabetic', weight = 400 } = {}) {
  ctx.font = `${weight} ${size}px Inter, Arial, sans-serif`;
  ctx.fillStyle = color; ctx.textAlign = align; ctx.textBaseline = base;
  ctx.fillText(text, x, y);
}
function panelFrame(r, title, P) {
  if (insertMode) { ctx.fillStyle = P.panel; ctx.fillRect(r.x, r.y, r.w, r.h); return; } // the window bar carries the title
  ctx.fillStyle = P.panel; ctx.strokeStyle = P.frame; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.roundRect(r.x, r.y, r.w, r.h, 8); ctx.fill(); ctx.stroke();
  if (title) label(title, r.x + 12, r.y + 20, { color: P.text, size: 13, weight: 600 });
}

// ---------------------------------------------------------------- the wave inside the interferometer
// Carpet of |psi|^2 for one cluster (or the incoherent sum over G1 source points), computed
// from the exact paraxial wave in wave.js. z runs from G1 (0) to G3 (2L); x is in nm.
const WIN = 2 * D; // half-width of the transverse window
const NZ = 260, NX = 170;
let carpet = null, carpetToken = 0;
const carpetCanvas = document.createElement('canvas');
carpetCanvas.width = NZ; carpetCanvas.height = NX;
const carpetCtx = carpetCanvas.getContext('2d');

const sourceX0 = () => state.x0frac * D;
const windowCentre = () => D / 2; // centre of a G1 opening (antinodes at x = 0)

function scheduleCarpet() { clearTimeout(carpetTimer); carpetTimer = setTimeout(computeCarpet, 80); }
let carpetTimer = 0;
function computeCarpet() {
  const token = ++carpetToken;
  const st = model.setup, xc = windowCentre();
  const xs = Array.from({ length: NX }, (_, i) => xc + WIN - ((i + 0.5) * 2 * WIN) / NX); // top row = +x
  const z2 = 2 * st.L;
  const zs = Array.from({ length: NZ }, (_, j) => ((j + 0.5) * z2) / NZ);
  const ensemble = state.show.ensemble;
  const sources = ensemble
    ? Array.from({ length: 24 }, (_, j) => { const x0 = ((j + 0.5) * D) / 24; return { cl: makeCluster(st, x0), w: intensityTransmission(x0, st.g[0].n0) }; })
    : [{ cl: model.cluster, w: 1 }];
  const data = new Float32Array(NX * NZ);
  carpet = { data, done: 0, ensemble, xs, zs };
  let j = 0;
  const work = () => {
    if (token !== carpetToken) return;
    const t0 = performance.now();
    while (j < NZ && performance.now() - t0 < 14) {
      const z = zs[j];
      let mx = 0;
      if (z < st.L) {
        // before G2: point-source waves, uniform in x (the paraxial density is 1/z for every x)
        // drawn at a fixed low level so the structure behind G2 stays readable
        for (let i = 0; i < NX; i++) data[i * NZ + j] = 0.3;
        mx = 1;
      } else {
        const s = z - st.L;
        for (let i = 0; i < NX; i++) {
          let v = 0;
          for (const src of sources) v += src.w * densityAfterG2(st, src.cl, xs[i], s);
          data[i * NZ + j] = v; if (v > mx) mx = v;
        }
      }
      for (let i = 0; i < NX; i++) data[i * NZ + j] /= mx || 1; // brightness normalised in each slice
      j++;
    }
    carpet.done = j; carpet.dirty = true;
    if (j < NZ) setTimeout(work, 0);
  };
  work();
}

function paintCarpet(P) {
  if (!carpet || !carpet.dirty) return;
  const img = carpetCtx.createImageData(NZ, NX);
  const [r0, g0, b0] = P.waveLo, [r1, g1, b1] = P.waveHi;
  // While a packet is in flight the pattern is lit by the moving envelope |F|^2, dimmed behind
  // G2 by the fraction G2 removes; a faint trace shows the rest of the stationary pattern.
  const trace = state.show.trace ? 0.16 : 0;
  const s2 = survivalG2(), L = model.setup.L;
  const colW = carpet.zs.map((z) => {
    const env = envelopeAt(z);
    if (env === null) return 1;
    return trace + (1 - trace) * env * (z >= L ? s2 : 1);
  });
  for (let i = 0; i < NX; i++) for (let j = 0; j < NZ; j++) {
    const k = (i * NZ + j) * 4;
    const v = j < carpet.done ? Math.pow(carpet.data[i * NZ + j], 0.6) * colW[j] : 0;
    img.data[k] = r0 + (r1 - r0) * v; img.data[k + 1] = g0 + (g1 - g0) * v; img.data[k + 2] = b0 + (b1 - b0) * v; img.data[k + 3] = 255;
  }
  carpetCtx.putImageData(img, 0, 0);
  carpet.dirty = false;
}

const CAPTION = {
  orthodox: 'Orthodox · |ψ|² gives the probabilities; no paths. Marks: outcomes as a packet arrives (× ionised, • counted).',
  'pilot-wave': 'Pilot Wave · dots are the clusters, moved by dx/dz = (1/k) Im(∂ψ/ψ) of their own wave. × ionised by a grating.',
  'many-worlds': 'Many Worlds · no collapse: every mark is a branch (× ionised, • counted); the bright one is the branch followed.',
};

function drawWave(r, P, dt) {
  panelFrame(r, '', P);
  label(state.show.ensemble ? '|ψ|² of the beam inside the interferometer' : '|ψ|² of one cluster inside the interferometer', r.x + 12, r.y + 20, { color: P.text, size: 13, weight: 600 });
  ctx.font = '400 11.5px Inter, Arial, sans-serif';
  const capX = r.x + 12, capW = r.w - 24;
  let y = r.y + 37;
  const words = CAPTION[state.interp].split(' ');
  let line = '';
  for (const w of words) {
    const t = line ? `${line} ${w}` : w;
    if (ctx.measureText(t).width > capW && line) { label(line, capX, y, { color: P.muted, size: 11.5 }); y += 15; line = w; } else line = t;
  }
  if (line) { label(line, capX, y, { color: P.muted, size: 11.5 }); y += 15; }

  const pr = { x: r.x + 58, y: y + 4, w: r.w - 58 - 16, h: r.y + r.h - y - 4 - 34 };
  if (pr.h < 60) return;
  const st = model.setup, z2 = 2 * st.L, xc = windowCentre();
  const tz = (z) => pr.x + (z / z2) * pr.w;
  const tx = (x) => pr.y + ((xc + WIN - x) / (2 * WIN)) * pr.h;

  if (state.show.wave) {
    paintCarpet(P);
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(carpetCanvas, pr.x, pr.y, pr.w, pr.h);
  } else { ctx.fillStyle = P.bg; ctx.fillRect(pr.x, pr.y, pr.w, pr.h); }

  // gratings: the standing light wave drawn as violet where the light is bright
  const offset = state.step === 'setup' ? 0 : run.g3;
  const grating = (z, n0v, shift, name) => {
    const X = tz(z), w = 7;
    for (let py = 0; py < pr.h; py += 1) {
      const x = xc + WIN - (py / pr.h) * 2 * WIN;
      const light = Math.cos((Math.PI * (x - shift)) / D) ** 2; // 1 at an antinode
      ctx.globalAlpha = 0.15 + 0.85 * light * Math.min(1, n0v / 2);
      ctx.fillStyle = P.laser; ctx.fillRect(X - w / 2, pr.y + py, w, 1.2);
    }
    ctx.globalAlpha = 1;
    const align = z === 0 ? 'left' : z >= 2 * st.L - 1e-9 ? 'right' : 'center';
    label(name, X, pr.y + pr.h + 14, { color: P.text, size: 11.5, align, weight: 600 });
  };
  const roles = r.w >= 700;
  grating(0, st.g[0].n0, 0, roles ? 'G1 · removes clusters at bright fringes' : 'G1');
  grating(st.L, st.g[1].n0, 0, roles ? 'G2 · shifts the phase' : 'G2');
  grating(z2, st.g[2].n0, offset, roles ? `G3 · mask, offset ${Math.round(offset * 1e9)} nm → counter` : 'G3');

  // source point of the displayed cluster
  if (!state.show.ensemble) {
    ctx.fillStyle = P.data; ctx.beginPath(); ctx.arc(tz(0) + 4, tx(sourceX0()), 3.5, 0, Math.PI * 2); ctx.fill();
  }

  // pilot-wave trajectories
  if (state.interp === 'pilot-wave') { if (state.show.traj) drawParticles(P, tz, tx, pr); drawOutcomes(P, tz, tx, pr, true); }
  else drawOutcomes(P, tz, tx, pr);
  const newest = run.packets[run.packets.length - 1];
  if (newest && newest.z >= -2 * pkSigma() && newest.z <= 2 * st.L) {
    const zc = Math.max(0, newest.z);
    label('packet', Math.max(pr.x + 26, Math.min(pr.x + pr.w - 26, tz(zc))), pr.y + 12, { color: P.text, size: 10.5, align: 'center' });
  }

  // axes
  ctx.strokeStyle = P.axis; ctx.lineWidth = 1; ctx.strokeRect(pr.x, pr.y, pr.w, pr.h);
  for (let k = -2; k <= 2; k++) {
    const x = xc + k * D;
    label(`${k * 133}`, pr.x - 6, tx(x) + 4, { color: P.muted, size: 10.5, align: 'right' });
  }
  ctx.save(); ctx.translate(r.x + 14, pr.y + pr.h / 2); ctx.rotate(-Math.PI / 2);
  label('x from opening centre (nm)', 0, 0, { color: P.muted, size: 10.5, align: 'center' }); ctx.restore();
  const wide = r.w >= 640;
  label(wide ? `z: 0 to ${fmt(z2, 2)} m along the beam; x: nanometres across it. Brightness normalised in each slice.   λdB = ${fmt(model.ldb * 1e15, 1)} fm · L/L_T = ${fmt(model.ratio, 2)}`
    : `z: 0–${fmt(z2, 2)} m along; x: nm across`,
    pr.x + pr.w / 2, r.y + r.h - 8, { color: P.muted, size: 10.5, align: 'center' });
}

// ---------------------------------------------------------------- the run: packets of clusters
// Every count comes from a cluster simulated here (js/sim.js). Packets are launched at
// intervals set by the number of packets in flight; each carries state.perPacket clusters. After
// state.packetsPerPoint packets the G3 mask moves to the next of the 18 scan positions.
// As in the analytical double-slit app, the wave factorises as Psi = F(z - vt) psi(x, z): the
// envelope F carries each packet along the beam over the stationary pattern psi. The real
// envelope is about 0.2 pm long and crosses in about 12 ms; both are exaggerated here.
const PACKET_TIME = 2.2; // seconds from G1 to G3 at speed 1
// Packets in flight (state.inFlight): one is launched every PACKET_TIME / inFlight seconds.
const launchDt = () => PACKET_TIME / state.inFlight;
const TRAILS_PER_PACKET = 8;
const run = { packets: [], marks: [], points: [], launchPoint: 0, launchedAtPoint: 0, timer: 0, g3: 0 };
let ens = null;
const pkSigma = () => 0.07 * 2 * model.setup.L;
const survivalG2 = () => { let s = 0; const n0v = model.setup.g[1].n0; for (let i = 0; i < 64; i++) s += intensityTransmission(((i + 0.5) * D) / 64, n0v); return s / 64; };
const simMode = () => (state.truth === 'classical' ? 'classical' : state.interp === 'pilot-wave' ? 'pilot-wave' : 'sampled');
const expectedPerPoint = () => state.perPacket * state.packetsPerPoint * model.pCount;

function resetRunState() {
  run.packets = []; run.marks = []; run.launchPoint = 0; run.launchedAtPoint = 0; run.timer = 0; run.g3 = 0;
  run.points = SCAN_X.map((x) => ({ x, n: 0, arrived: 0 }));
  run.arrivals = new Float64Array(ARR_BINS); run.nArr = 0;
  state.data = [];
  if (carpet) carpet.dirty = true;
}
const resetPacket = resetRunState;

function launchPacket() {
  const i = run.launchPoint, x3off = SCAN_X[i], mode = simMode(), sig = pkSigma();
  const clusters = [];
  for (let k = 0; k < state.perPacket; k++) {
    const c = runCluster(ens, mode, x3off, Math.random, { xc: windowCentre(), band: 2 * D, steps: 90 });
    c.dz = sig * gauss(Math.random);
    c.trail = k < TRAILS_PER_PACKET;
    c.y3 = (Math.random() * 2 - 1) * 2.9; // height in the 3D view only; nothing depends on it
    clusters.push(c);
  }
  // Many-Worlds: one outcome per packet is the branch followed
  clusters[Math.floor(Math.random() * clusters.length)].followed = true;
  run.packets.push({ z: -3 * sig, clusters, point: i, passedG2: false, passedG3: false });
  if (++run.launchedAtPoint >= state.packetsPerPoint) { run.launchPoint++; run.launchedAtPoint = 0; }
}

function advanceRun(dt) {
  const st = model.setup, sig = pkSigma(), span = 2 * st.L + 6 * sig, step = dt * state.speed;
  run.timer -= step;
  while (run.timer <= 0 && run.launchPoint < SCAN_X.length) { launchPacket(); run.timer += launchDt(); }
  for (const p of run.packets) {
    p.z += (span / PACKET_TIME) * step;
    if (!p.passedG2 && p.z >= st.L) {
      p.passedG2 = true;
      for (const c of p.clusters) if (c.fate === 'G2') run.marks.push({ z: st.L, x: c.x2, y3: c.y3, fate: 'G2', age: 0, followed: c.followed });
    }
    if (!p.passedG3 && p.z >= 2 * st.L) {
      p.passedG3 = true;
      const pt = run.points[p.point];
      for (const c of p.clusters) {
        if (c.fate === 'G2') continue;
        addArrival(c.xj);
        if (c.fate === 'counted') pt.n++;
        run.marks.push({ z: 2 * st.L, x: c.x3, y3: c.y3, fate: c.fate, age: 0, followed: c.followed });
      }
      pt.arrived++;
      run.g3 = SCAN_X[p.point];
      state.scanIndex = p.point;
      state.data = run.points.filter((q) => q.arrived >= state.packetsPerPoint).map(({ x, n }) => ({ x, n }));
    }
  }
  run.packets = run.packets.filter((p) => p.z - 3 * sig <= 2 * st.L);
  for (const m of run.marks) m.age += step;
  run.marks = run.marks.filter((m) => m.age < 1.6);
  if (carpet) carpet.dirty = true;
  if (run.launchPoint >= SCAN_X.length && run.packets.length === 0) {
    if (state.autoRun) { finish(); resetRunState(); showStep('run'); }
    else { stop(); finish(); }
  }
}

function addArrival(x) {
  const u = (((x % (2 * D)) + 2 * D) % (2 * D)) / (2 * D);
  run.arrivals[Math.min(ARR_BINS - 1, Math.floor(u * ARR_BINS))]++; run.nArr++;
}

function envelopeAt(z) {
  if (!run.packets.length) return state.running ? 0 : null; // stopped with nothing in flight: the full pattern
  const sig = pkSigma(); let e = 0;
  for (const p of run.packets) e += Math.exp(-((z - p.z) ** 2) / (2 * sig * sig));
  return Math.min(1, e);
}

function drawParticles(P, tz, tx, pr) {
  ctx.save(); ctx.beginPath(); ctx.rect(pr.x, pr.y, pr.w, pr.h); ctx.clip();
  for (const p of run.packets) for (const c of p.clusters) {
    if (!c.pts) continue;
    const zEnd = c.pts[c.pts.length - 1][0];
    const zp = p.z + c.dz;
    if (zp < 0) continue;
    const zNow = Math.min(zEnd, zp);
    let last = null;
    if (c.trail) { ctx.strokeStyle = c.fate === 'counted' ? P.data : P.beam; ctx.globalAlpha = 0.6; ctx.lineWidth = 1; ctx.beginPath(); }
    for (const [z, x] of c.pts) {
      if (z > zNow + 1e-9) {
        if (last) { const [z0, x0] = last; const f = (zNow - z0) / (z - z0); last = [zNow, x0 + f * (x - x0)]; if (c.trail) ctx.lineTo(tz(last[0]), tx(last[1])); }
        break;
      }
      if (c.trail) { if (last) ctx.lineTo(tz(z), tx(x)); else ctx.moveTo(tz(z), tx(x)); }
      last = [z, x];
    }
    if (c.trail) ctx.stroke();
    if (!last) continue;
    ctx.globalAlpha = 0.95;
    if (zp >= zEnd && c.fate !== 'counted') continue; // its removal is drawn as a mark
    ctx.fillStyle = P.text; ctx.beginPath(); ctx.arc(tz(last[0]), tx(last[1]), 1.8, 0, Math.PI * 2); ctx.fill();
  }
  ctx.globalAlpha = 1; ctx.restore();
}

function drawOutcomes(P, tz, tx, pr, onlyIonised = false) {
  ctx.save(); ctx.beginPath(); ctx.rect(pr.x - 8, pr.y, pr.w + 16, pr.h); ctx.clip();
  const mw = state.interp === 'many-worlds';
  for (const m of run.marks) {
    if (onlyIonised && m.fate === 'counted') continue;
    let a = Math.max(0, 1 - m.age / 1.6);
    if (mw && !m.followed) a *= 0.35;
    ctx.globalAlpha = a;
    if (m.fate === 'counted') { ctx.fillStyle = P.data; ctx.beginPath(); ctx.arc(tz(m.z), tx(m.x), mw && m.followed ? 4 : 2.6, 0, Math.PI * 2); ctx.fill(); }
    else cross(tz(m.z), tx(m.x), P.lost, mw && m.followed ? 4.5 : 3);
  }
  ctx.globalAlpha = 1; ctx.restore();
}
function cross(X, Y, color, r = 3.5) {
  ctx.strokeStyle = color; ctx.lineWidth = 1.4; ctx.beginPath();
  ctx.moveTo(X - r, Y - r); ctx.lineTo(X + r, Y + r); ctx.moveTo(X + r, Y - r); ctx.lineTo(X - r, Y + r); ctx.stroke();
}

// ---------------------------------------------------------------- plots
function axes(r, P, { x0, x1, y0, y1, xlabel, ylabel, xticks, yticks, xfmt, yfmt, xlog = false, top = 34 }) {
  const pad = { l: 52, r: 14, t: top, b: 38 };
  const pr = { x: r.x + pad.l, y: r.y + pad.t, w: r.w - pad.l - pad.r, h: r.h - pad.t - pad.b };
  const tx = xlog ? (x) => pr.x + (Math.log(x / x0) / Math.log(x1 / x0)) * pr.w : (x) => pr.x + ((x - x0) / (x1 - x0)) * pr.w;
  const ty = (y) => pr.y + pr.h - ((y - y0) / (y1 - y0)) * pr.h;
  ctx.strokeStyle = P.grid; ctx.lineWidth = 1;
  for (const t of yticks) { ctx.beginPath(); ctx.moveTo(pr.x, ty(t)); ctx.lineTo(pr.x + pr.w, ty(t)); ctx.stroke(); label(yfmt(t), pr.x - 6, ty(t) + 4, { color: P.muted, size: 10.5, align: 'right' }); }
  for (const t of xticks) { ctx.beginPath(); ctx.moveTo(tx(t), pr.y); ctx.lineTo(tx(t), pr.y + pr.h); ctx.stroke(); label(xfmt(t), tx(t), pr.y + pr.h + 14, { color: P.muted, size: 10.5, align: 'center' }); }
  ctx.strokeStyle = P.axis; ctx.strokeRect(pr.x, pr.y, pr.w, pr.h);
  label(xlabel, pr.x + pr.w / 2, r.y + r.h - 8, { color: P.muted, size: 11, align: 'center' });
  ctx.save(); ctx.translate(r.x + 13, pr.y + pr.h / 2); ctx.rotate(-Math.PI / 2);
  label(ylabel, 0, 0, { color: P.muted, size: 11, align: 'center' }); ctx.restore();
  return { tx, ty, pr };
}
function niceTicks(lo, hi, n = 5) {
  const step0 = (hi - lo) / n, mag = 10 ** Math.floor(Math.log10(step0));
  const step = [1, 2, 2.5, 5, 10].map((k) => k * mag).find((s) => s >= step0) || step0;
  const out = [];
  for (let t = Math.ceil(lo / step) * step; t <= hi + 1e-12; t += step) out.push(+t.toPrecision(12));
  return out;
}
function polyline(xs, ys, tx, ty, color, width = 2, dash = []) {
  ctx.strokeStyle = color; ctx.lineWidth = width; ctx.setLineDash(dash);
  ctx.beginPath();
  let pen = false;
  xs.forEach((x, i) => {
    if (!Number.isFinite(ys[i])) { pen = false; return; }
    if (pen) ctx.lineTo(tx(x), ty(ys[i])); else { ctx.moveTo(tx(x), ty(ys[i])); pen = true; }
  });
  ctx.stroke();
  ctx.setLineDash([]);
}

function drawFringes(r, P) {
  panelFrame(r, 'Counts behind G3', P);
  const N = Math.max(1, expectedPerPoint());
  const fit = analyse();
  const ys = [];
  if (state.show.quantum) ys.push(...model.profQ.map((y) => y * N));
  if (state.show.classical) ys.push(...model.profC.map((y) => y * N));
  if (state.show.data) state.data.forEach((p) => ys.push(p.n + Math.sqrt(p.n), p.n - Math.sqrt(p.n)));
  let lo = Math.min(N * 0.94, ...ys), hi = Math.max(N * 1.06, ...ys);
  const padY = (hi - lo) * 0.08; lo = Math.max(0, lo - padY); hi += padY;
  const { tx, ty } = axes(r, P, {
    x0: 0, x1: 270e-9, y0: lo, y1: hi, xlabel: 'G3 offset (nm)', ylabel: 'clusters counted',
    xticks: [0, 50e-9, 100e-9, 150e-9, 200e-9, 250e-9], yticks: niceTicks(lo, hi, 4),
    xfmt: (x) => String(Math.round(x * 1e9)), yfmt: (y) => fmtInt(y), top: 58,
  });
  if (state.show.classical) polyline(PROFILE_X, model.profC.map((y) => y * N), tx, ty, P.c, 2);
  if (state.show.quantum) polyline(PROFILE_X, model.profQ.map((y) => y * N), tx, ty, P.q, 2);
  if (state.show.data) {
    if (fit && state.data.length >= 9) {
      const k = (2 * Math.PI) / D;
      const fy = PROFILE_X.map((x) => fit.mean * (1 + fit.V * Math.cos(k * x + fit.phase)));
      polyline(PROFILE_X, fy, tx, ty, P.data, 1.4, [5, 4]);
    }
    ctx.strokeStyle = P.data; ctx.fillStyle = P.data; ctx.lineWidth = 1.2;
    for (const p of state.data) {
      const e = Math.sqrt(Math.max(1, p.n));
      ctx.beginPath(); ctx.moveTo(tx(p.x), ty(p.n - e)); ctx.lineTo(tx(p.x), ty(p.n + e)); ctx.stroke();
      ctx.beginPath(); ctx.arc(tx(p.x), ty(p.n), 3, 0, Math.PI * 2); ctx.fill();
    }
    // points still being counted: hollow
    for (const q of run.points) {
      if (q.arrived === 0 || q.arrived >= state.packetsPerPoint) continue;
      ctx.beginPath(); ctx.arc(tx(q.x), ty(Math.max(lo, q.n)), 3, 0, Math.PI * 2); ctx.stroke();
    }
    // the position G3 is at now
    if (state.running && run.packets.length) {
      const x = tx(run.g3);
      ctx.strokeStyle = P.data; ctx.globalAlpha = 0.35 + 0.35 * Math.sin(performance.now() / 120);
      ctx.beginPath(); ctx.moveTo(x, ty(hi)); ctx.lineTo(x, ty(lo)); ctx.stroke(); ctx.globalAlpha = 1;
    }
  }
  // legend
  const items = [];
  if (state.show.quantum) items.push([P.q, `quantum  V = ${fmt(model.vq, 3)}`]);
  if (state.show.classical) items.push([P.c, `classical  V = ${fmt(model.vc, 3)}`]);
  if (state.show.data && fit && state.data.length >= 9) items.push([P.data, `fit to counts  V = ${fmt(fit.V, 2)} ± ${fmt(fit.dV, 2)}`]);
  let lx = r.x + 66, ly = r.y + 39;
  ctx.font = '400 11px Inter, Arial, sans-serif';
  for (const [col, text] of items) {
    const w = 14 + ctx.measureText(text).width;
    if (lx + w > r.x + r.w - 10 && lx > r.x + 66) { lx = r.x + 66; ly += 14; }
    ctx.fillStyle = col; ctx.fillRect(lx, ly - 5, 10, 3);
    label(text, lx + 14, ly, { color: P.text, size: 11 });
    lx += w + 16;
  }
}

// Arrival positions at the G3 plane, before the mask: random hits, as on a double-slit screen.
function drawArrivals(r, P) {
  panelFrame(r, 'Arrivals at G3', P);
  const n = run.nArr || 0, bw = (2 * D) / ARR_BINS;
  const meanQ = model.arrQ.reduce((a, y) => a + y, 0) / model.arrQ.length;
  const meanC = model.arrC.reduce((a, y) => a + y, 0) / model.arrC.length;
  const per = Math.max(1, n / ARR_BINS); // expected hits per bin for a flat density
  const ys = [per * 1.15];
  if (state.show.quantum) ys.push(...model.arrQ.map((y) => (y / meanQ) * per));
  if (state.show.classical) ys.push(...model.arrC.map((y) => (y / meanC) * per));
  if (state.show.data) for (const h of run.arrivals) ys.push(h + Math.sqrt(h));
  const hi = Math.max(10, Math.max(...ys) * 1.08);
  const { tx, ty, pr } = axes(r, P, {
    x0: 0, x1: 2 * D, y0: 0, y1: hi, xlabel: 'position at G3 (nm), two periods', ylabel: 'clusters',
    xticks: [0, D / 2, D, 1.5 * D, 2 * D], yticks: niceTicks(0, hi, 4),
    xfmt: (x) => String(Math.round(x * 1e9)), yfmt: (y) => fmtInt(y), top: 58,
  });
  if (state.show.data && n) {
    ctx.fillStyle = P.data; ctx.globalAlpha = 0.55;
    for (let b = 0; b < ARR_BINS; b++) {
      const h = run.arrivals[b]; if (!h) continue;
      ctx.fillRect(tx(b * bw) + 0.5, ty(h), Math.max(1, tx((b + 1) * bw) - tx(b * bw) - 1), pr.y + pr.h - ty(h));
    }
    ctx.globalAlpha = 1;
  }
  if (state.show.classical) polyline(ARR_X, model.arrC.map((y) => (y / meanC) * per), tx, ty, P.c, 1.8);
  if (state.show.quantum) polyline(ARR_X, model.arrQ.map((y) => (y / meanQ) * per), tx, ty, P.q, 1.8);
  // where the mask is open now (its dark fringes), as ticks along the bottom
  if (run.packets.length || state.finished) {
    ctx.fillStyle = P.laser; ctx.globalAlpha = 0.5;
    for (let k = -1; k <= 2; k++) {
      const x0 = run.g3 + (k + 0.5) * D;
      if (x0 < 0 || x0 > 2 * D) continue;
      ctx.fillRect(tx(x0) - 2, pr.y + pr.h - 6, 4, 6);
    }
    ctx.globalAlpha = 1;
  }
  const items = [];
  if (state.show.quantum) items.push([P.q, 'quantum density']);
  if (state.show.classical) items.push([P.c, 'classical']);
  if (state.show.data) items.push([P.data, `${fmtInt(n)} hits`]);
  let lx = r.x + 66; const ly = r.y + 39;
  ctx.font = '400 11px Inter, Arial, sans-serif';
  for (const [col, text] of items) { ctx.fillStyle = col; ctx.fillRect(lx, ly - 5, 10, 3); label(text, lx + 14, ly, { color: P.text, size: 11 }); lx += 14 + ctx.measureText(text).width + 16; }
}

function drawChart(r, P) {
  const power = state.chart === 'power';
  panelFrame(r, power ? 'Visibility vs G2 power' : 'Visibility vs cluster mass', P);
  if (!charts || charts.kind !== state.chart) { label('computing…', r.x + r.w / 2, r.y + r.h / 2, { color: P.muted, align: 'center' }); return; }
  const all = [...(state.show.quantum ? charts.q : []), ...(state.show.classical ? charts.c : []), model.vq, model.vc].filter(Number.isFinite);
  const y1 = Math.max(0.12, Math.min(1.2, Math.max(...all) * 1.15));
  const { tx, ty, pr } = axes(r, P, power ? {
    x0: 0, x1: charts.pMax, y0: 0, y1, xlabel: 'G2 power (mW)', ylabel: 'visibility', xticks: niceTicks(0, charts.pMax, 6), yticks: niceTicks(0, y1, 4),
    xfmt: (x) => String(+x.toFixed(2)), yfmt: (y) => fmt(y, 2),
  } : {
    x0: M_MIN, x1: M_MAX, y0: 0, y1, xlog: true, xlabel: 'cluster mass (kDa)', ylabel: 'visibility', xticks: [20, 50, 100, 200, 500, 1000, 2000], yticks: niceTicks(0, y1, 4),
    xfmt: (x) => String(x), yfmt: (y) => fmt(y, 2),
  });
  ctx.save(); ctx.beginPath(); ctx.rect(pr.x, pr.y, pr.w, pr.h); ctx.clip();
  if (state.show.classical) polyline(charts.xs, charts.c, tx, ty, P.c, 2);
  if (state.show.quantum) polyline(charts.xs, charts.q, tx, ty, P.q, 2);
  ctx.restore();
  // current setting
  const xNow = power ? state.P[1] * 1e3 : state.massKDa;
  ctx.strokeStyle = P.axis; ctx.setLineDash([3, 3]);
  ctx.beginPath(); ctx.moveTo(tx(xNow), pr.y); ctx.lineTo(tx(xNow), pr.y + pr.h); ctx.stroke(); ctx.setLineDash([]);
  label('now', tx(xNow) + 4, pr.y + 12, { color: P.muted, size: 10.5 });
  // the paper's two measured points at the Fig. 2a settings
  if (power && isFig2a() && state.scale) {
    [[0.10, -0.6], [0.08, 0.6]].forEach(([v, dx]) => {
      const x = tx(15.2 + dx);
      ctx.strokeStyle = P.text; ctx.fillStyle = P.text; ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.moveTo(x, ty(v - 0.01)); ctx.lineTo(x, ty(v + 0.01)); ctx.stroke();
      ctx.beginPath(); ctx.rect(x - 3, ty(v) - 3, 6, 6); ctx.fill();
    });
    label('■ measured (paper)', pr.x + pr.w - 6, pr.y + 14, { color: P.text, size: 10.5, align: 'right' });
  }
  if (state.show.data && state.finished) {
    const a = analyse();
    if (a) {
      const x = tx(xNow);
      ctx.strokeStyle = P.data; ctx.fillStyle = P.data; ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.moveTo(x, ty(Math.max(0, a.V - a.dV))); ctx.lineTo(x, ty(Math.min(y1, a.V + a.dV))); ctx.stroke();
      ctx.beginPath(); ctx.arc(x, ty(Math.min(y1, a.V)), 3.5, 0, Math.PI * 2); ctx.fill();
    }
  }
  const note = power ? `${fmtMass(state.massKDa)} at ${state.v} m/s; G1 ${Math.round(state.P[0] * 1e3)} mW, G3 ${Math.round(state.P[2] * 1e3)} mW`
    : `${state.v} m/s; G2 at ${fmt(state.P[1] * 1e3, 1)} mW`;
  const t = `${power ? 'Visibility vs G2 power' : 'Visibility vs cluster mass'} · ${note}`;
  const el = document.getElementById('chartTitle'); if (el.textContent !== t) el.textContent = t;
}

// ---------------------------------------------------------------- plot column
// Three plots in a column to the right of the canvas, each minimizable to its title bar.
const INSERT_KEY = 'qontic-nanoparticle-plots-2';
const inserts = {};
document.querySelectorAll('.np-insert').forEach((el) => {
  const cv = el.querySelector('canvas');
  inserts[el.dataset.insert] = { el, cv, cx: cv.getContext('2d'), min: false };
});
function setMinimized(name, min) {
  const it = inserts[name];
  it.min = min;
  it.el.classList.toggle('minimized', min);
  const b = it.el.querySelector('[data-insert-min]');
  b.textContent = min ? '+' : '–'; b.setAttribute('aria-expanded', String(!min));
  b.title = min ? 'Restore' : 'Minimize';
}
function saveInserts() {
  try { localStorage.setItem(INSERT_KEY, JSON.stringify(Object.fromEntries(Object.entries(inserts).map(([k, it]) => [k, it.min])))); } catch (e) { /* storage unavailable */ }
}
function loadInserts() {
  let saved = null;
  try { saved = JSON.parse(localStorage.getItem(INSERT_KEY) || 'null'); } catch (e) { saved = null; }
  for (const k of Object.keys(inserts)) setMinimized(k, Boolean(saved?.[k]));
}
for (const [name, it] of Object.entries(inserts)) {
  it.el.querySelector('[data-insert-min]').addEventListener('click', () => { setMinimized(name, !it.min); saveInserts(); });
}

function drawInsert(name, draw, P) {
  const it = inserts[name];
  if (it.min || it.el.hidden) return;
  const ratio = devicePixelRatio || 1, W = it.cv.clientWidth, H = it.cv.clientHeight;
  if (W < 40 || H < 40) return;
  if (it.cv.width !== Math.round(W * ratio) || it.cv.height !== Math.round(H * ratio)) { it.cv.width = Math.round(W * ratio); it.cv.height = Math.round(H * ratio); }
  ctx = it.cx; insertMode = true;
  try {
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    // the drawing functions reserve ~22 px for a title, which the window bar replaces
    draw({ x: 0, y: -22, w: W, h: H + 22 }, P);
  } finally { ctx = mainCtx; insertMode = false; }
}

// ---------------------------------------------------------------- main loop
function layout(W, H) {
  const g = 10;
  const top = { x: g, y: g, w: W - 2 * g, h: Math.max(260, Math.min(420, H * 0.5)) };
  const y = top.y + top.h + g, h = H - y - g;
  if (W >= 760) {
    const w = (W - 3 * g) / 2;
    return { top, left: { x: g, y, w, h }, right: { x: 2 * g + w, y, w, h } };
  }
  const hh = (h - g) / 2;
  return { top, left: { x: g, y, w: W - 2 * g, h: hh }, right: { x: g, y: y + hh + g, w: W - 2 * g, h: hh } };
}

// ---------------------------------------------------------------- 3D view
const wrapEl = document.querySelector('.np-canvas-wrap');
const cap3d = document.getElementById('cap3d');
let view3d = null;
if (webglAvailable()) { try { view3d = mount3D(wrapEl); } catch (e) { console.error(e); view3d = null; } }
if (!view3d) state.view3d = false;
function setView3d(on) {
  state.view3d = on && !!view3d;
  view3d?.setVisible(state.view3d);
  canvas.style.display = state.view3d ? 'none' : 'block';
  cap3d.hidden = !state.view3d;
  document.querySelectorAll('[data-view3d]').forEach((b) => { const a = (b.dataset.view3d === '3d') === state.view3d; b.classList.toggle('active', a); b.setAttribute('aria-pressed', String(a)); });
  if (carpet) carpet.dirty = true;
}
document.querySelectorAll('[data-view3d]').forEach((b) => b.addEventListener('click', () => setView3d(b.dataset.view3d === '3d')));
document.getElementById('resetCamera')?.addEventListener('click', () => view3d?.resetCamera());

function render3d(P) {
  const st = model.setup, z2 = 2 * st.L;
  const changed = !!(carpet && carpet.dirty);
  if (state.show.wave) paintCarpet(P);
  const dots = [], trails = [], marks = [];
  if (state.interp === 'pilot-wave' && state.show.traj) {
    for (const p of run.packets) for (const c of p.clusters) {
      if (!c.pts) continue;
      const zEnd = c.pts[c.pts.length - 1][0], zp = p.z + c.dz;
      if (zp < 0 || (zp >= zEnd && c.fate !== 'counted')) continue;
      const zNow = Math.min(zEnd, zp);
      const upTo = [];
      let xNow = null;
      for (let i = 0; i < c.pts.length; i++) {
        const [z, x] = c.pts[i];
        if (z > zNow) { const [z0, x0] = c.pts[i - 1]; xNow = x0 + ((zNow - z0) / (z - z0)) * (x - x0); upTo.push([zNow, xNow]); break; }
        upTo.push([z, x]); xNow = x;
      }
      dots.push({ z: zNow, x: xNow, y: c.y3, c: zp >= zEnd ? P.data : P.text });
      if (c.trail) trails.push({ pts: upTo, y: c.y3, c: c.fate === 'counted' ? P.data : P.beam });
    }
  }
  const mw = state.interp === 'many-worlds';
  for (const m of run.marks) {
    if (state.interp === 'pilot-wave' && m.fate === 'counted') continue;
    let a = Math.max(0, 1 - m.age / 1.6); if (mw && !m.followed) a *= 0.35;
    marks.push({ z: m.z, x: m.x, y: m.y3 ?? 0, c: m.fate === 'counted' ? P.data : P.lost, a });
  }
  const sig = pkSigma();
  view3d.render({
    z2, xc: windowCentre(), win: WIN, d: D,
    gratings: [
      { z: 0, light: Math.min(1, st.g[0].n0 / 2), shift: 0, label: 'G1' },
      { z: st.L, light: Math.min(1, st.g[1].n0 / 2), shift: 0, label: 'G2' },
      { z: z2, light: Math.min(1, st.g[2].n0 / 2), shift: state.step === 'setup' ? 0 : run.g3, label: `G3 · offset ${Math.round((state.step === 'setup' ? 0 : run.g3) * 1e9)} nm` },
    ],
    carpetCanvas: carpetCanvas, carpetChanged: changed && state.show.wave,
    packets: run.packets.map((p) => ({ z: p.z, sigma: sig })),
    dots, trails, marks,
    palette: { laser: P.laser, light: document.body.classList.contains('qontic-light') },
  });
  const cap = `${state.show.ensemble ? '|ψ|² of the beam' : '|ψ|² of one cluster'} on the mid-plane · violet sheets: bright fringes of the light gratings G1, G2, G3; clusters there are ionised, the gaps let them through (G2 mostly shifts the phase) · ${CAPTION[state.interp]}`;
  if (cap3d.textContent !== cap) cap3d.textContent = cap;
}

function render(dt) {
  const P = palette();
  if (state.view3d && view3d) {
    render3d(P);
    drawInsert('arrivals', drawArrivals, P);
    drawInsert('counts', drawFringes, P);
    drawInsert('chart', drawChart, P);
    updateResults();
    return;
  }
  const ratio = devicePixelRatio || 1, W = canvas.clientWidth, H = canvas.clientHeight;
  if (W < 40 || H < 40) return;
  if (canvas.width !== Math.round(W * ratio) || canvas.height !== Math.round(H * ratio)) { canvas.width = Math.round(W * ratio); canvas.height = Math.round(H * ratio); }
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  ctx.fillStyle = P.bg; ctx.fillRect(0, 0, W, H);
  drawWave({ x: 6, y: 6, w: W - 12, h: H - 12 }, P, dt);
  drawInsert('arrivals', drawArrivals, P);
  drawInsert('counts', drawFringes, P);
  drawInsert('chart', drawChart, P);
  updateResults();
}

function setResult(name, value) { const o = document.querySelector(`[data-result="${name}"]`); if (o && o.value !== value) o.value = value; }
function updateResults() {
  setResult('atoms', fmtInt(atomsIn(state.massKDa)));
  setResult('diam', `${fmt(diameter(state.massKDa) * 1e9, 1)} nm`);
  setResult('ldb', `${fmt(model.ldb * 1e15, 1)} fm`);
  setResult('lt', `${fmt(model.LT, 3)} m`);
  const spread = (model.ldb * state.L) / D;
  setResult('spread', `${fmt(spread * 1e9, 0)} nm (${fmt(spread / diameter(state.massKDa), 0)}× its size)`);
  setResult('n0', fmt(model.n0G1, 2));
  setResult('phi0', `${fmt(model.phiG2, 2)} rad`);
  setResult('vq', fmt(model.vq, 3));
  setResult('vc', fmt(model.vc, 3));
  const a = state.data.length >= 9 ? analyse() : null;
  setResult('vfit', a ? `${fmt(a.V, 3)} ± ${fmt(a.dV, 3)}` : '—');
  if (state.step === 'run') {
    const q = run.points[state.scanIndex] || run.points[0];
    const launched = state.perPacket * q.arrived;
    const text = run.packets.length || run.launchPoint < SCAN_X.length
      ? `G3 at ${Math.round(run.g3 * 1e9)} nm · position ${state.scanIndex + 1} of ${SCAN_X.length} · ${fmtInt(q.n)} counted of ${fmtInt(launched)} clusters sent at this position so far (${state.packetsPerPoint} packets of ${state.perPacket})`
      : 'Scan complete.';
    const el = $('#liveLine'); if (el.textContent !== text) el.textContent = text;
  }
}

let last = performance.now();
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  if (state.running) advanceRun(dt);
  try { render(dt); } catch (err) { console.error(err); }
  requestAnimationFrame(frame);
}

mountQonticMedia({
  stage: $('.visualization'),
  controls: controlsEl,
  getCanvases: () => [state.view3d && view3d ? view3d.canvas : canvas, ...Object.values(inserts).filter((it) => !it.min).map((it) => it.cv)],
  filename: 'nanoparticle-interference',
  getShareUrl: shareUrl,
  beginRecording: () => { const was = state.running; if (!was) start(); return was; },
  endRecording: (was) => { if (!was) stop(); },
});
mountQonticShortcuts({
  togglePlayback: () => (state.running ? stop() : start()),
  reset: () => resetRun(),
  screenshot: () => document.querySelector('.qontic-media-toolbar button[aria-label="Screenshot"]')?.click(),
});

loadInserts();
rebuild();
computeCharts();
computeCarpet();
syncControls();
setView3d(state.view3d);
setInterpretation(state.interp);
resetRun();
requestAnimationFrame(frame);
