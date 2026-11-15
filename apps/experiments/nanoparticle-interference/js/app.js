import '../../../../shared/qontic-controls.js?v=3.2';
import { mountQonticShell } from '../../../../shared/qontic-shell.js?v=3.7';
import { mountQonticMedia } from '../../../../shared/qontic-media.js?v=3.0';
import { mountQonticShortcuts } from '../../../../shared/qontic-shortcuts.js?v=1';
import { APP_RELEASE } from './release.js?v=0.1.0';
import {
  PAPER, averagedCoefficients, visibility, fringeProfile, fitSine, poisson,
  deBroglie, talbotLength, atomsIn, diameter, n0, phi0,
} from './talbot.js?v=0.1.0';

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
const ctx = canvas.getContext('2d');
const controlsEl = $('qontic-controls');

const D = PAPER.d;
// The paper moves G3 in 15 nm steps. Here: 18 steps of 14.8 nm, exactly two periods,
// so that the sine fit is not biased by the higher harmonics of the fringe profile.
const SCAN_X = Array.from({ length: 18 }, (_, i) => (i * 2 * PAPER.d) / 18);
const PROFILE_X = Array.from({ length: 241 }, (_, i) => (i * 270e-9) / 240);
const DWELL = 0.55; // seconds per scan point at speed 1
const M_MIN = 20, M_MAX = 2000;

const PRESETS = {
  fig2a: { massKDa: 172, v: 160, P: [0.062, 0.0152, 0.068], sigmaV: 10, dmRel: 0.32, L: PAPER.L },
  heavy: { massKDa: 1000, v: 160, P: [0.1, 0.006, 0.1], sigmaV: 10, dmRel: 0.32, L: PAPER.L },
  slow: { massKDa: 1000, v: 25, P: [0.1, 0.0009, 0.1], sigmaV: 2, dmRel: 0.32, L: PAPER.L },
};

const state = {
  ...structuredClone(PRESETS.fig2a),
  countsLog: 3.2, scale: true, truth: 'quantum', chart: 'power',
  show: { predict: true, quantum: true, classical: true, data: true, beam: true },
  running: false, autoRun: false, speed: 1,
  step: 'setup', prediction: null, finished: false,
  scanIndex: 0, dwell: 0, data: [],
};
let model = null; // predictions for the current settings
let charts = null; // visibility curves for the chart
let clusters = []; // beamline animation only

readUrl();

// ---------------------------------------------------------------- model
const params = () => ({ P: state.P, waist: PAPER.waist, L: state.L, d: D });
const beam = () => ({ massKDa: state.massKDa, v: state.v, sigmaV: state.sigmaV, dmRel: state.dmRel });
const scaleF = () => (state.scale ? PAPER.scale : 1);
const meanCounts = () => Math.round(10 ** state.countsLog);

function computeModel(fast = false) {
  const p = params(), b = beam(), s = scaleF();
  const [nv, nm] = fast ? [7, 5] : [21, 11];
  const Sq = averagedCoefficients(p, b, false, 6, nv, nm);
  const Sc = averagedCoefficients(p, b, true, 6, nv, nm);
  const vis = (S) => (s * 2 * Math.hypot(...S[1])) / Math.abs(S[0][0]);
  const LT = talbotLength(state.massKDa, state.v);
  model = {
    vq: vis(Sq), vc: vis(Sc),
    profQ: fringeProfile(Sq, PROFILE_X, D, s), profC: fringeProfile(Sc, PROFILE_X, D, s),
    scanQ: fringeProfile(Sq, SCAN_X, D, s), scanC: fringeProfile(Sc, SCAN_X, D, s),
    LT, ratio: state.L / LT, ldb: deBroglie(state.massKDa, state.v),
    n0G1: n0(state.P[0], state.massKDa, state.v, PAPER.waist[0]),
    phiG2: phi0(state.P[1], state.massKDa, state.v, PAPER.waist[1]),
    n0G: [0, 1, 2].map((i) => n0(state.P[i], state.massKDa, state.v, PAPER.waist[i])),
  };
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
  const xs = power
    ? Array.from({ length: 121 }, (_, i) => i * 0.5)
    : Array.from({ length: 61 }, (_, i) => M_MIN * (M_MAX / M_MIN) ** (i / 60));
  const at = (x, cl) => (power
    ? visibility({ ...p, P: [P1, x * 1e-3, P3] }, b, cl, s, nv, nm)
    : visibility(p, { ...b, massKDa: x }, cl, s, nv, nm));
  charts = { kind: state.chart, xs, q: xs.map(() => NaN), c: xs.map(() => NaN) };
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
  scheduleCharts();
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
  $('#countsOut').value = fmtInt(meanCounts());

  const r = model.ratio;
  const near = r < 0.25 ? ' The two predictions nearly coincide here: the wave hardly spreads before G2.' : '';
  $('#coreHint').textContent = `λdB = ${fmt(model.ldb * 1e15, 1)} fm · L/L_T = ${fmt(r, 2)}.${near}`;

  const N = atomsIn(state.massKDa);
  $('#setupList').innerHTML = [
    `Sodium clusters of <b>${fmtMass(state.massKDa)}</b>, about ${fmtInt(N)} atoms and ${fmt(diameter(state.massKDa) * 1e9, 1)} nm across, leave a cold source at <b>${state.v} m/s</b>. Their de Broglie wavelength is <b>${fmt(model.ldb * 1e15, 1)} fm</b>.`,
    'Three standing waves of ultraviolet light, <b>0.983 m apart</b>, act as gratings of period <b>133 nm</b>. G1 and G3 remove clusters that cross a bright fringe. G2 mainly shifts the phase of each cluster’s wave.',
    `G3 is moved sideways in <b>steps of about 15 nm</b>, and the clusters that get through are counted. A count rate that rises and falls with G3 is the fringe pattern; its <b>visibility V</b> says how strong it is.`,
    `<b>Cyan</b>: the quantum prediction. <b>Orange</b>: a classical prediction, with clusters on straight lines bent only by the light. They differ when the spacing L is comparable to the Talbot length L<sub>T</sub> = d²/λ<sub>dB</sub>. Here L/L<sub>T</sub> = <b>${fmt(r, 2)}</b>.`,
  ].map((x) => `<li>${x}</li>`).join('');
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
  $('#counts').value = state.countsLog;
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
$('#counts').addEventListener('input', (e) => { state.countsLog = +e.target.value; updateText(); resetRun(); });
document.querySelectorAll('[data-preset]').forEach((b) => b.addEventListener('click', () => applyPreset(b.dataset.preset)));
document.querySelectorAll('[data-truth]').forEach((b) => b.addEventListener('click', () => { state.truth = b.dataset.truth; syncControls(); resetRun(); }));
document.querySelectorAll('[data-chart]').forEach((b) => b.addEventListener('click', () => { state.chart = b.dataset.chart; syncControls(); charts = null; computeCharts(); }));
document.querySelectorAll('[data-toggle]').forEach((b) => b.addEventListener('click', () => {
  const k = b.dataset.toggle;
  if (k === 'scale') { state.scale = !state.scale; changed(); return; }
  state.show[k] = !state.show[k];
  b.setAttribute('aria-pressed', String(state.show[k]));
  if (k === 'predict') updateText();
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
  state.scanIndex = 0; state.dwell = 0; state.data = [];
  controlsEl.setAttribute('running', 'false');
  showStep('setup');
}
function start() {
  if (state.finished || state.scanIndex >= SCAN_X.length) { state.scanIndex = 0; state.dwell = 0; state.data = []; state.finished = false; }
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
}
function shareUrl() {
  const u = new URL(location.href);
  u.search = new URLSearchParams({
    m: String(state.massKDa), v: String(state.v),
    p1: fmt(state.P[0] * 1e3, 1), p2: fmt(state.P[1] * 1e3, 1), p3: fmt(state.P[2] * 1e3, 1),
    sv: String(state.sigmaV), dm: String(state.dmRel), L: String(state.L),
  }).toString();
  return u.href;
}

// ---------------------------------------------------------------- scan
function stepScan(dt) {
  state.dwell += (dt * state.speed) / DWELL;
  while (state.dwell >= 1 && state.scanIndex < SCAN_X.length) {
    state.dwell -= 1;
    const prof = state.truth === 'quantum' ? model.scanQ : model.scanC;
    state.data.push({ x: SCAN_X[state.scanIndex], n: poisson(meanCounts() * Math.max(0, prof[state.scanIndex])) });
    state.scanIndex++;
  }
  if (state.scanIndex >= SCAN_X.length) {
    if (state.autoRun) { finish(); state.scanIndex = 0; state.dwell = 0; state.data = []; state.finished = false; showStep('run'); }
    else { stop(); finish(); }
  }
}

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
        : 'The two predictions differ here, but not by more than the counting noise. More counts per point (Advanced) would separate them.');
  } else {
    const other = favoured === 'quantum' ? 'classical' : 'quantum';
    text = `The counts follow ${name[favoured]}; ${name[other]} misses the fitted visibility by ${fmt(miss(favoured === 'quantum' ? model.vc : model.vq), 0)} standard errors. ${nums}`;
    if (state.truth === 'classical') text += ' These counts were drawn from the hypothetical classical world (Advanced). The real experiment found the quantum prediction.';
    else if (isFig2a()) text += ' The paper measured V = 0.10 ± 0.01 and 0.08 ± 0.01 at these settings.';
  }
  const lead = right === null ? '' : `<strong>${right ? 'Right.' : 'Not quite.'}</strong> You chose ${state.prediction === 'same' ? '“this scan cannot tell”' : name[state.prediction]}. `;
  $('#verdict').innerHTML = lead + text;
  const next = [];
  if (!isFig2a()) next.push(['fig2a', 'Vienna 2026 settings']);
  if (state.massKDa < 900 || state.v !== 160) next.push(['heavy', 'Heavier: 1 MDa at 160 m/s']);
  if (!(state.massKDa === 1000 && state.v === 25)) next.push(['slow', '1 MDa, slowed to 25 m/s']);
  next.push(['again', 'Scan again']);
  $('#nextSteps').innerHTML = next.map(([k, l]) => `<button type="button" class="qontic-app-toggle" data-next="${k}">${l}</button>`).join('');
  showStep('verdict');
}
const isFig2a = () => {
  const p = PRESETS.fig2a;
  return state.massKDa === p.massKDa && state.v === p.v && p.P.every((x, i) => Math.abs(x - state.P[i]) < 1e-6) && state.L === p.L;
};
$('#nextSteps').addEventListener('click', (e) => {
  const k = e.target.closest('[data-next]')?.dataset.next;
  if (!k) return;
  if (k === 'again') { state.finished = true; start(); return; }
  applyPreset(k);
  if (state.show.predict) showStep('question');
});

// ---------------------------------------------------------------- drawing helpers
function palette() {
  const light = document.body.classList.contains('qontic-light');
  return light ? {
    bg: '#fbfdfe', panel: '#f1f6f8', frame: '#c9d9e0', text: '#183747', muted: '#4f6573', grid: '#dbe6eb', axis: '#7f949f',
    q: '#0b8fa0', c: '#c4661b', data: '#9a6200', laser: '#7a4fb0', laserSoft: 'rgba(122,79,176,0.28)', beam: '#35505f', lost: '#c62828',
  } : {
    bg: '#071521', panel: '#0a1c2a', frame: '#23465a', text: '#d6e9f2', muted: '#9fb4c2', grid: '#163246', axis: '#5d7e90',
    q: '#62dce8', c: '#f0a35e', data: '#f0ca61', laser: '#c9a7ff', laserSoft: 'rgba(201,167,255,0.25)', beam: '#b6cad6', lost: '#ff6b6b',
  };
}
function label(text, x, y, { color, size = 12, align = 'left', base = 'alphabetic', weight = 400 } = {}) {
  ctx.font = `${weight} ${size}px Inter, Arial, sans-serif`;
  ctx.fillStyle = color; ctx.textAlign = align; ctx.textBaseline = base;
  ctx.fillText(text, x, y);
}
function panelFrame(r, title, P) {
  ctx.fillStyle = P.panel; ctx.strokeStyle = P.frame; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.roundRect(r.x, r.y, r.w, r.h, 8); ctx.fill(); ctx.stroke();
  if (title) label(title, r.x + 12, r.y + 20, { color: P.text, size: 13, weight: 600 });
}

// ---------------------------------------------------------------- beamline
function beamlineX(r) {
  return { src: r.x + r.w * 0.07, g1: r.x + r.w * 0.24, g2: r.x + r.w * 0.5, g3: r.x + r.w * 0.76, ion: r.x + r.w * 0.86, det: r.x + r.w * 0.93 };
}
function drawBeamline(r, P, dt) {
  panelFrame(r, 'The interferometer', P);
  const wide = r.w >= 640;
  if (wide) label('Not to scale: grating period 133 nm, beam about 0.5 mm wide, total length about 2 m.', r.x + r.w - 12, r.y + 20, { color: P.muted, size: 11, align: 'right' });
  else label('Not to scale', r.x + r.w - 12, r.y + 20, { color: P.muted, size: 11, align: 'right' });
  const X = beamlineX(r);
  const yc = r.y + r.h * 0.56, half = Math.min(42, r.h * 0.24);

  // beam axis
  ctx.strokeStyle = P.axis; ctx.setLineDash([4, 4]); ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(X.src + 18, yc); ctx.lineTo(X.det, yc); ctx.stroke(); ctx.setLineDash([]);

  // source
  ctx.fillStyle = P.bg; ctx.strokeStyle = P.beam; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.roundRect(X.src - 22, yc - 20, 40, 40, 6); ctx.fill(); ctx.stroke();
  label('Na', X.src - 2, yc + 4, { color: P.text, size: 12, align: 'center', weight: 600 });
  if (wide) label('cluster source, 77 K', X.src - 2, yc + half + 22, { color: P.muted, size: 11, align: 'center' });

  // gratings: standing waves drawn as stripes
  const offset = state.step === 'setup' ? 0 : (SCAN_X[Math.min(state.scanIndex, SCAN_X.length - 1)] || 0);
  const grating = (x, strong, name, sub, shift = 0) => {
    const w = 12, n = 14, h = 2 * half + 14;
    for (let i = 0; i < n; i++) {
      const y = yc - h / 2 + ((i + (shift / D) % 1 + 1) % n) * (h / n);
      ctx.fillStyle = strong ? P.laser : P.laserSoft;
      ctx.globalAlpha = strong ? 0.85 : 1;
      ctx.fillRect(x - w / 2, y, w, (h / n) * 0.5);
    }
    ctx.globalAlpha = 1;
    label(name, x, yc - half - 16, { color: P.text, size: 12.5, align: 'center', weight: 600 });
    if (wide) label(sub, x, yc + half + 22, { color: P.muted, size: 11, align: 'center' });
  };
  grating(X.g1, true, 'G1', 'removes clusters at bright fringes');
  grating(X.g2, false, 'G2', 'mainly shifts the phase');
  grating(X.g3, true, 'G3', state.step === 'setup' ? 'mask, scanned sideways' : `mask, offset ${Math.round(offset * 1e9)} nm`, offset);

  // spacing arrows
  const arrow = (x0, x1, y, text) => {
    ctx.strokeStyle = P.axis; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(x0 + 10, y); ctx.lineTo(x1 - 10, y); ctx.stroke();
    for (const [x, s] of [[x0 + 10, 1], [x1 - 10, -1]]) { ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 6 * s, y - 3); ctx.lineTo(x + 6 * s, y + 3); ctx.closePath(); ctx.fillStyle = P.axis; ctx.fill(); }
    label(text, (x0 + x1) / 2, y - 5, { color: P.muted, size: 11, align: 'center' });
  };
  const ya = yc - half - 34;
  arrow(X.g1, X.g2, ya, `L = ${fmt(state.L, 3)} m`);
  arrow(X.g2, X.g3, ya, `L = ${fmt(state.L, 3)} m`);

  // ionisation laser and counter
  ctx.strokeStyle = P.q; ctx.lineWidth = 3; ctx.globalAlpha = 0.6;
  ctx.beginPath(); ctx.moveTo(X.ion, yc - half); ctx.lineTo(X.ion, yc + half); ctx.stroke(); ctx.globalAlpha = 1;
  label('425 nm', X.ion, yc - half - 6, { color: P.muted, size: 11, align: 'center' });
  ctx.fillStyle = P.bg; ctx.strokeStyle = P.beam; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.roundRect(X.det - 8, yc - 22, 34, 44, 6); ctx.fill(); ctx.stroke();
  label('Σ', X.det + 9, yc + 5, { color: P.data, size: 15, align: 'center', weight: 700 });
  if (wide) label('mass filter + counter', X.det + 4, yc + half + 22, { color: P.muted, size: 11, align: 'center' });

  // clusters (illustrative): survival at each grating drawn from exp(-n0 cos^2) at a random fringe phase
  if (state.show.beam) animateClusters(X, yc, half, P, dt);

  // key numbers
  label(`λdB = ${fmt(model.ldb * 1e15, 1)} fm   ·   L_T = d²/λdB = ${fmt(model.LT, 2)} m   ·   L/L_T = ${fmt(model.ratio, 2)}`,
    r.x + 12, r.y + r.h - 10, { color: P.text, size: 11.5 });
}

function animateClusters(X, yc, half, P, dt) {
  const active = state.running;
  if (active && Math.random() < dt * 40 * state.speed) {
    clusters.push({ x: X.src + 18, y: yc + (Math.random() * 2 - 1) * half * 0.8, alive: true, fade: 1 });
  }
  const pxs = (X.det - X.src) / 1.6; // cross in about 1.6 s at speed 1
  const gx = [X.g1, X.g2, X.g3];
  for (const c of clusters) {
    if (c.alive) {
      const nx = c.x + pxs * dt * state.speed;
      for (let i = 0; i < 3; i++) {
        if (c.x < gx[i] && nx >= gx[i]) {
          const u = Math.random();
          if (Math.random() > Math.exp(-model.n0G[i] * Math.cos(Math.PI * u) ** 2)) { c.alive = false; c.lostAt = i; }
        }
      }
      c.x = c.alive ? nx : gx[c.lostAt];
    } else c.fade -= dt * 2.5;
  }
  clusters = clusters.filter((c) => c.fade > 0 && c.x < X.det);
  for (const c of clusters) {
    ctx.globalAlpha = Math.max(0, c.fade);
    ctx.fillStyle = c.alive ? P.data : P.lost;
    ctx.beginPath(); ctx.arc(c.x, c.y, c.alive ? 2.6 : 3.4, 0, Math.PI * 2); ctx.fill();
  }
  ctx.globalAlpha = 1;
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
  const N = meanCounts();
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
    // the point being counted now
    if (state.running && state.scanIndex < SCAN_X.length) {
      const x = tx(SCAN_X[state.scanIndex]);
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

function drawChart(r, P) {
  const power = state.chart === 'power';
  panelFrame(r, power ? 'Visibility vs G2 power' : 'Visibility vs cluster mass', P);
  if (!charts || charts.kind !== state.chart) { label('computing…', r.x + r.w / 2, r.y + r.h / 2, { color: P.muted, align: 'center' }); return; }
  const all = [...(state.show.quantum ? charts.q : []), ...(state.show.classical ? charts.c : []), model.vq, model.vc].filter(Number.isFinite);
  const y1 = Math.max(0.12, Math.min(1.2, Math.max(...all) * 1.15));
  const { tx, ty, pr } = axes(r, P, power ? {
    x0: 0, x1: 60, y0: 0, y1, xlabel: 'G2 power (mW)', ylabel: 'visibility', xticks: [0, 10, 20, 30, 40, 50, 60], yticks: niceTicks(0, y1, 4),
    xfmt: (x) => String(x), yfmt: (y) => fmt(y, 2),
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
  if (r.w >= 560) label(note, r.x + r.w - 14, r.y + 20, { color: P.muted, size: 10.5, align: 'right' });
}

// ---------------------------------------------------------------- main loop
function layout(W, H) {
  const g = 10;
  const top = { x: g, y: g, w: W - 2 * g, h: Math.max(190, Math.min(250, H * 0.36)) };
  const y = top.y + top.h + g, h = H - y - g;
  if (W >= 760) {
    const w = (W - 3 * g) / 2;
    return { top, left: { x: g, y, w, h }, right: { x: 2 * g + w, y, w, h } };
  }
  const hh = (h - g) / 2;
  return { top, left: { x: g, y, w: W - 2 * g, h: hh }, right: { x: g, y: y + hh + g, w: W - 2 * g, h: hh } };
}

function render(dt) {
  const P = palette();
  const ratio = devicePixelRatio || 1, W = canvas.clientWidth, H = canvas.clientHeight;
  if (W < 40 || H < 40) return;
  if (canvas.width !== Math.round(W * ratio) || canvas.height !== Math.round(H * ratio)) { canvas.width = Math.round(W * ratio); canvas.height = Math.round(H * ratio); }
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  ctx.fillStyle = P.bg; ctx.fillRect(0, 0, W, H);
  const L = layout(W, H);
  drawBeamline(L.top, P, dt);
  drawFringes(L.left, P);
  drawChart(L.right, P);
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
    const i = Math.min(state.scanIndex, SCAN_X.length - 1);
    const text = state.scanIndex < SCAN_X.length
      ? `Counting at G3 offset ${Math.round(SCAN_X[i] * 1e9)} nm · point ${state.scanIndex + 1} of ${SCAN_X.length} · about ${fmtInt(meanCounts())} clusters per point`
      : 'Scan complete.';
    const el = $('#liveLine'); if (el.textContent !== text) el.textContent = text;
  }
}

let last = performance.now();
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  if (state.running) stepScan(dt);
  try { render(dt); } catch (err) { console.error(err); }
  requestAnimationFrame(frame);
}

mountQonticMedia({
  stage: $('.visualization'),
  controls: controlsEl,
  getCanvases: () => [canvas],
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

rebuild();
computeCharts();
syncControls();
resetRun();
requestAnimationFrame(frame);
