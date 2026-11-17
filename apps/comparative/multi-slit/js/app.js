import '../../../../shared/qontic-controls.js?v=3.2';
import { mountQonticShell } from '../../../../shared/qontic-shell.js?v=3.7';
import { mountQonticMedia } from '../../../../shared/qontic-media.js?v=3.0';
import { mountQonticShortcuts } from '../../../../shared/qontic-shortcuts.js?v=1';
import { APP_RELEASE } from './release.js?v=0.1.0';
import {
  makeSetup, buildTables, slitCells, slitOf, yFromTop, cdfAt, singleSlitWidth, singleSlitFraction,
  zetaConstants, densityAt, fringes,
} from './multislit.js?v=0.1.0';

mountQonticShell({
  title: 'Which Slit? Many-Slit Interference',
  eyebrow: 'Q-Ontic · Double Slit',
  navigation: 'breadcrumbs',
  purpose: 'Interference behind one to fifteen slits, computed exactly. In pilot-wave theory trajectories never cross, so each slit sends its particles to its own band of the screen, and the place of a hit tells which slit the particle went through.',
  badge: 'Multiview',
  version: `Which Slit · Version ${APP_RELEASE.version} · ${APP_RELEASE.date}`,
  homeHref: '../../../index.html',
});

// ---------------------------------------------------------------- state
const $ = (sel) => document.querySelector(sel);
const canvas = $('#stage');
const ctx = canvas.getContext('2d');
const controlsEl = $('qontic-controls');

const Z_MIN = 0.1, Z_MAX = 12;
const TRANSIT = 3.0; // seconds from slits to screen at speed 1

const PRESETS = {
  double: { N: 2, sigma: 0.15, zeta: 6, beam: { on: false, centre: 0, width: 2 }, expand: true },
  five: { N: 5, sigma: 0.15, zeta: 6, beam: { on: false, centre: 0, width: 2 }, expand: true },
  uneven: { N: 4, sigma: 0.15, zeta: 5, beam: { on: true, centre: 1, width: 1 }, expand: true },
  talbot: { N: 15, sigma: 0.12, zeta: 2, beam: { on: false, centre: 0, width: 4 }, expand: false },
};

const state = {
  N: 5, sigma: 0.15, zeta: 6, open: Array(15).fill(true), beam: { on: false, centre: 0, width: 2 }, follow: 0,
  perPacket: 25, inFlight: 6, target: 2000,
  show: { predict: true, expand: true, wave: true, curve: true, fan: true, domains: true, trails: true },
  interp: 'pilot-wave', running: false, autoRun: false, speed: 1,
  step: 'setup', prediction: null, finished: false, prevBand: null,
};
let model = null;
let run = null;

// ---------------------------------------------------------------- model
const openList = () => Array.from({ length: state.N }, (_, k) => k).filter((k) => state.open[k]);
const halfGrating = () => (state.N - 1) / 2 + 0.5;
function dispHalf(zeta) {
  const z = state.show.expand ? zeta : state.zeta;
  return halfGrating() + 3.2 * singleSlitWidth(state.sigma, z);
}

function computeModel(fast = false) {
  const setup = makeSetup({ N: state.N, sigma: state.sigma, open: state.open.slice(0, state.N), beam: state.beam });
  if (!openList().length) { model = { setup, empty: true }; return; }
  const T = buildTables(setup, state.zeta, fast ? { nz: 61, ny: 801 } : { nz: 241, ny: 2401 });
  const cells = slitCells(setup, T);
  const screen = T.cols[T.nz - 1];
  const weight = {}, band = {};
  cells.slit.forEach((k, i) => {
    weight[k] = cells.P[i + 1] - cells.P[i];
    band[k] = { lo: yFromTop(screen, cells.P[i + 1]), hi: yFromTop(screen, cells.P[i]) };
  });
  const fr = fringes(screen, 0);
  const bright = fr.reduce((a, b) => (b.mass > a.mass ? b : a), fr[0]);
  const feeders = cells.slit.map((k) => {
    const lo = Math.max(bright.lo, band[k].lo), hi = Math.min(bright.hi, band[k].hi);
    return { k, share: hi > lo ? (cdfAt(screen, hi) - cdfAt(screen, lo)) / bright.mass : 0 };
  }).filter((f) => f.share >= 0.005);
  // trajectory fan and separatrices, sampled on every table column
  const path = (qTop) => Float64Array.from(T.cols, (c) => yFromTop(c, qTop));
  const nFan = Math.min(140, Math.max(40, 14 * cells.slit.length));
  const fan = Array.from({ length: nFan }, (_, i) => { const q = (i + 0.5) / nFan; return { k: slitOf(cells, q), y: path(q) }; });
  const seps = cells.P.map((p, i) => path(i === 0 ? 0.0015 : i === cells.P.length - 1 ? 0.9985 : p));
  model = { setup, T, cells, screen, weight, band, bright, feeders, fan, seps, fast };
}

let modelTimer = 0;
function rebuild(fast = false) {
  computeModel(fast);
  clearTimeout(modelTimer);
  if (fast) modelTimer = setTimeout(() => { computeModel(false); waveDirty = true; updateText(); }, 160);
  waveDirty = true;
  updateText();
}

// ---------------------------------------------------------------- colours
const CAT_DARK = ['#3987e5', '#d95926', '#199e70', '#c98500', '#d55181', '#0ca30c', '#9085e9', '#e66767'];
const CAT_LIGHT = ['#2a78d6', '#eb6834', '#1baf7a', '#eda100', '#e87ba4', '#008300', '#6250d6', '#e34948'];
// Up to eight slits: the validated categorical order. More: adjacent bands alternate two hues
// and carry their slit numbers, so identity is never colour alone.
function slitColor(k) {
  const light = document.body.classList.contains('qontic-light');
  const pal = light ? CAT_LIGHT : CAT_DARK;
  return state.N <= 8 ? pal[k] : pal[k % 2];
}
function palette() {
  const light = document.body.classList.contains('qontic-light');
  return light ? {
    bg: '#fbfdfe', panel: '#f1f6f8', frame: '#c9d9e0', text: '#183747', muted: '#4f6573', grid: 'rgba(60,90,105,0.18)', axis: '#7f949f',
    wall: '#5d7480', data: '#9a6200', curve: '#0b6f7d', follow: '#9a6200', band: 'rgba(11,111,125,0.10)',
    waveLo: [251, 253, 254], waveHi: [8, 92, 112],
  } : {
    bg: '#071521', panel: '#0a1c2a', frame: '#23465a', text: '#d6e9f2', muted: '#9fb4c2', grid: 'rgba(150,190,210,0.16)', axis: '#5d7e90',
    wall: '#8aa5b5', data: '#f0ca61', curve: '#72e4ed', follow: '#f0ca61', band: 'rgba(114,228,237,0.08)',
    waveLo: [4, 14, 24], waveHi: [150, 236, 245],
  };
}

// ---------------------------------------------------------------- formatting
const fmt = (x, d = 2) => (Math.abs(x) < 0.5 * 10 ** -d ? 0 : x).toFixed(d);
const pct = (x, d = 0) => `${fmt(100 * x, d)}%`;
const fmtInt = (n) => Math.round(n).toLocaleString('en-US');
const zToSlider = (z) => Math.log(z / Z_MIN) / Math.log(Z_MAX / Z_MIN);
const sliderToZ = (t) => { const z = Z_MIN * (Z_MAX / Z_MIN) ** t; return z < 1 ? Math.round(z * 100) / 100 : Math.round(z * 10) / 10; };
const slitName = (k) => `${k + 1}`;
// Outermost bands extend to the edge of the pattern: say "above" / "below" rather than quoting the grid edge.
function bandText(k, unit = '') {
  const ol = openList(), b = model.band[k];
  if (ol.length === 1) return 'whole screen';
  if (k === ol[0]) return `above ${fmt(b.lo)}${unit}`;
  if (k === ol[ol.length - 1]) return `below ${fmt(b.hi)}${unit}`;
  return `${fmt(b.lo)} … ${fmt(b.hi)}${unit}`;
}

function regime() {
  const nOpen = openList().length;
  if (state.zeta <= 1.2) return 'near';
  if (state.zeta >= Math.max(2, 0.5 * nOpen)) return 'far';
  return 'between';
}

function updateText() {
  $('#nslitsOut').value = String(state.N);
  $('#zetaOut').value = `${fmt(state.zeta, state.zeta < 1 ? 2 : 1)} z_T`;
  $('#sigmaOut').value = fmt(state.sigma, 3);
  $('#beamCOut').value = `${fmt(state.beam.centre, 1)} d`;
  $('#beamWOut').value = `${fmt(state.beam.width, 1)} d`;
  $('#pppOut').value = String(state.perPacket);
  $('#inflightOut').value = String(state.inFlight);
  $('#targetOut').value = fmtInt(state.target);
  const nOpen = openList().length;
  const reg = { near: 'Near field: the waves of neighbouring slits overlap and form the Talbot carpet.', far: 'Far field: the diffraction orders have separated.', between: 'Between near and far field: the orders are still separating.' }[regime()];
  $('#coreHint').textContent = model.empty ? 'Open at least one slit.' : `${nOpen} of ${state.N} slits open. ${reg}`;

  const fk = state.follow;
  $('#setupList').innerHTML = [
    `A coherent wave falls on <b>${state.N} slit${state.N > 1 ? 's' : ''}</b> spaced by d, each a Gaussian opening of width σ = ${fmt(state.sigma, 2)} d. Particles go through one at a time; independent particles are sent in packets.`,
    `The screen is <b>${fmt(state.zeta, state.zeta < 1 ? 2 : 1)} Talbot lengths</b> behind the slits (z<sub>T</sub> = 2d²/λ). ${reg}`,
    '<b>Left</b>: the wave |ψ|² behind the slits, computed exactly in the paraxial approximation. <b>Right</b>: the hits on the screen, with the predicted density.',
    `<b>Pilot Wave</b> colours each particle by the slit it went through. <b>Orthodox</b> and <b>Many Worlds</b> show the same hits, with no slit attached. The followed slit, <b>${slitName(fk)}</b>, is marked ▸.`,
  ].map((x) => `<li>${x}</li>`).join('');
  const canAsk = state.show.predict && nOpen >= 2 && state.open[fk];
  $('#setupNext').textContent = canAsk ? 'Next: the question' : 'Start';
  $('#predictionText').textContent = `In the pilot-wave account, where do the particles that pass through slit ${slitName(fk)} (marked ▸) land on the screen?`;
  buildSlitButtons();
  buildFollow();
  buildTable();
}

function buildSlitButtons() {
  const host = $('#slitButtons');
  const html = Array.from({ length: state.N }, (_, k) => `<button type="button" data-slit="${k}" aria-pressed="${state.open[k]}" style="--slit:${slitColor(k)}" title="Slit ${k + 1}: ${state.open[k] ? 'open (click to close)' : 'closed (click to open)'}">${k + 1}</button>`).join('');
  if (host.dataset.html !== html) { host.innerHTML = html; host.dataset.html = html; }
}
function buildFollow() {
  const sel = $('#follow');
  const opts = openList().map((k) => `<option value="${k}">Slit ${k + 1}${k === 0 ? ' (top)' : k === state.N - 1 ? ' (bottom)' : ''}</option>`).join('');
  if (sel.dataset.html !== opts) { sel.innerHTML = opts; sel.dataset.html = opts; }
  sel.value = String(state.follow);
}
function buildTable() {
  const rows = Array.from({ length: state.N }, (_, k) => {
    if (!state.open[k] || model.empty) return `<tr><td><span class="swatch" style="background:transparent;border:1px solid ${slitColor(k)}"></span>${k + 1}</td><td>closed</td><td class="pw-only"></td><td class="pw-only"></td></tr>`;
    const b = model.band[k];
    return `<tr class="${k === state.follow ? 'followed' : ''}"><td><span class="swatch" style="background:${slitColor(k)}"></span>${k + 1}</td><td>${fmt(model.weight[k], 3)}</td><td class="pw-only">${bandText(k)}</td><td class="pw-only" data-hits="${k}">0</td></tr>`;
  }).join('');
  const tb = $('#slitTable');
  if (tb.dataset.html !== rows) { tb.innerHTML = rows; tb.dataset.html = rows; }
  applyInterpVisibility();
}

// ---------------------------------------------------------------- controls
function setPressed(group, attr, value) {
  document.querySelectorAll(`${group} [${attr}]`).forEach((b) => {
    const on = b.getAttribute(attr) === value;
    b.classList.toggle('active', on); b.setAttribute('aria-pressed', String(on));
  });
}
function syncControls() {
  $('#nslits').value = state.N;
  $('#zeta').value = zToSlider(state.zeta);
  $('#sigma').value = state.sigma;
  $('#beamC').value = state.beam.centre;
  $('#beamW').value = state.beam.width;
  $('#ppp').value = state.perPacket;
  $('#inflight').value = state.inFlight;
  $('#target').value = state.target;
  document.querySelectorAll('.beam-row').forEach((r) => r.classList.toggle('hidden', !state.beam.on));
  document.querySelectorAll('[data-toggle]').forEach((b) => {
    const k = b.dataset.toggle;
    b.setAttribute('aria-pressed', String(k === 'beam' ? state.beam.on : state.show[k]));
  });
  const active = Object.entries(PRESETS).find(([, p]) => p.N === state.N && p.sigma === state.sigma && p.zeta === state.zeta
    && p.beam.on === state.beam.on && (!p.beam.on || (p.beam.centre === state.beam.centre && p.beam.width === state.beam.width))
    && state.open.slice(0, state.N).every(Boolean));
  setPressed('.preset-group', 'data-preset', active ? active[0] : '');
}

function ensureFollow() {
  const ol = openList();
  if (!ol.length) return;
  if (!state.open[state.follow] || state.follow >= state.N) state.follow = ol[0];
}
function changed(fast = false, keepPrev = false) {
  if (!keepPrev) state.prevBand = null;
  ensureFollow();
  rebuild(fast); resetRun(); syncControls();
}

$('#nslits').addEventListener('input', (e) => { state.N = +e.target.value; state.open.fill(true); changed(true); });
$('#zeta').addEventListener('input', (e) => { state.zeta = sliderToZ(+e.target.value); changed(true); });
$('#sigma').addEventListener('input', (e) => { state.sigma = +e.target.value; changed(true); });
$('#beamC').addEventListener('input', (e) => { state.beam.centre = +e.target.value; changed(true); });
$('#beamW').addEventListener('input', (e) => { state.beam.width = +e.target.value; changed(true); });
$('#ppp').addEventListener('input', (e) => { state.perPacket = +e.target.value; updateText(); });
$('#inflight').addEventListener('input', (e) => { state.inFlight = +e.target.value; updateText(); });
$('#target').addEventListener('input', (e) => { state.target = +e.target.value; updateText(); });
$('#follow').addEventListener('change', (e) => { state.follow = +e.target.value; state.prevBand = null; updateText(); if (state.finished) finish(); });
$('#slitButtons').addEventListener('click', (e) => { const b = e.target.closest('[data-slit]'); if (b) toggleSlit(+b.dataset.slit); });
document.querySelectorAll('[data-preset]').forEach((b) => b.addEventListener('click', () => applyPreset(b.dataset.preset)));
document.querySelectorAll('[data-toggle]').forEach((b) => b.addEventListener('click', () => {
  const k = b.dataset.toggle;
  if (k === 'beam') { state.beam.on = !state.beam.on; changed(); return; }
  state.show[k] = !state.show[k];
  b.setAttribute('aria-pressed', String(state.show[k]));
  if (k === 'predict') updateText();
  if (k === 'expand') waveDirty = true;
}));

function toggleSlit(k, keepPrev = false) {
  if (state.open[k] && openList().length === 1) return; // keep one slit open
  state.open[k] = !state.open[k];
  changed(false, keepPrev);
}
function applyPreset(name) {
  const p = PRESETS[name];
  Object.assign(state, { N: p.N, sigma: p.sigma, zeta: p.zeta, beam: { ...p.beam }, follow: 0 });
  state.show.expand = p.expand;
  state.open.fill(true);
  changed();
}

function showStep(step) {
  ['setup', 'question', 'run', 'verdict'].forEach((k) => $(`#${k}Step`).classList.toggle('hidden', k !== step));
  state.step = step;
}
const canAsk = () => state.show.predict && openList().length >= 2 && state.open[state.follow];
$('#setupNext').addEventListener('click', () => (canAsk() ? showStep('question') : start()));
$('#setupBack').addEventListener('click', () => showStep('setup'));
$('#showSetup').addEventListener('click', () => { stop(); showStep('setup'); });
$('#questionStep').addEventListener('click', (e) => {
  const b = e.target.closest('[data-predict]');
  if (!b) return;
  state.prediction = b.dataset.predict === 'skip' ? null : b.dataset.predict;
  start();
});

// ---------------------------------------------------------------- run
function newRun() {
  run = { packets: [], clock: 0, launched: 0, hitsY: [], hitsK: [], counts: new Map(), hist: null };
}
function resetRun() {
  state.running = false; state.finished = false; state.prediction = null;
  controlsEl.setAttribute('running', 'false');
  newRun();
  showStep('setup');
}
function start() {
  if (model.empty) return;
  if (state.finished) { newRun(); state.finished = false; }
  if (state.step !== 'run') showStep('run');
  state.running = true;
  controlsEl.setAttribute('running', 'true');
}
function stop() { state.running = false; controlsEl.setAttribute('running', 'false'); }

function launchPacket() {
  const n = state.perPacket, qs = new Float64Array(n), ks = new Int16Array(n);
  for (let i = 0; i < n; i++) { qs[i] = Math.random(); ks[i] = slitOf(model.cells, qs[i]); }
  run.packets.push({ t: 0, qs, ks });
  run.launched += n;
}
function recordHit(q, k) {
  const y = yFromTop(model.screen, q);
  run.hitsY.push(y); run.hitsK.push(k);
  run.counts.set(k, (run.counts.get(k) || 0) + 1);
}
function advanceRun(dt) {
  if (model.empty || model.fast) return;
  const step = dt * state.speed;
  run.clock += step;
  const interval = TRANSIT / state.inFlight;
  const total = () => run.hitsY.length + run.packets.reduce((a, p) => a + p.qs.length, 0);
  while (run.clock >= interval) {
    run.clock -= interval;
    if (total() < state.target) launchPacket();
  }
  if (!run.packets.length && total() < state.target) launchPacket();
  for (const p of run.packets) p.t += step;
  const done = run.packets.filter((p) => p.t >= TRANSIT);
  run.packets = run.packets.filter((p) => p.t < TRANSIT);
  for (const p of done) {
    const room = state.target - run.hitsY.length;
    for (let i = 0; i < Math.min(room, p.qs.length); i++) recordHit(p.qs[i], p.ks[i]);
  }
  if (run.hitsY.length >= state.target && !run.packets.length) {
    stop();
    finish();
    if (state.autoRun) setTimeout(() => { if (state.finished && !state.running) start(); }, 1600);
  }
}

// ---------------------------------------------------------------- interpretation
const FROM_CONTROL = { cpn: 'orthodox', pw: 'pilot-wave', mw: 'many-worlds' };
const TO_CONTROL = { orthodox: 'cpn', 'pilot-wave': 'pw', 'many-worlds': 'mw' };
const CAPTION = {
  orthodox: 'Orthodox: the wave |ψ|² and detections on the screen. No path between slits and screen.',
  'pilot-wave': 'Pilot Wave: dots are particles, coloured by the slit they went through. Thin lines: trajectories equally spaced in probability.',
  'many-worlds': 'Many Worlds: the wave never collapses. The marks are the record of one branch, weighted by |ψ|².',
};
function applyInterpVisibility() {
  document.querySelectorAll('.pw-only').forEach((el) => el.classList.toggle('hidden', state.interp !== 'pilot-wave'));
}
// Interpretation is a display choice: the wave, the probabilities and the record are unchanged.
function setInterpretation(id) {
  const name = FROM_CONTROL[id] || id;
  if (!CAPTION[name]) return;
  state.interp = name;
  if (controlsEl.getAttribute('interpretation') !== TO_CONTROL[name]) controlsEl.setAttribute('interpretation', TO_CONTROL[name]);
  applyInterpVisibility();
  if (state.finished) finish();
}

controlsEl.addEventListener('qontic:start', () => start());
controlsEl.addEventListener('qontic:stop', () => stop());
controlsEl.addEventListener('qontic:reset', () => resetRun());
controlsEl.addEventListener('qontic:autorun', (e) => { state.autoRun = e.detail.autoRun; controlsEl.setAttribute('auto-run', String(state.autoRun)); });
controlsEl.addEventListener('qontic:speed', (e) => { state.speed = e.detail.speed; });
controlsEl.addEventListener('qontic:interpretation', (e) => setInterpretation(e.detail.interpretation));
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
    const body = panel.querySelector('.results-body'), table = panel.querySelector('.slit-table');
    body.hidden = !body.hidden; table.hidden = body.hidden;
    e.currentTarget.textContent = body.hidden ? '+' : '−';
  });
})();

// ---------------------------------------------------------------- URL state
function readUrl() {
  const q = new URLSearchParams(location.search);
  const num = (k, lo, hi) => { const x = parseFloat(q.get(k)); return Number.isFinite(x) ? Math.min(hi, Math.max(lo, x)) : null; };
  const n = num('n', 1, 15); if (n !== null) state.N = Math.round(n);
  const s = num('s', 0.05, 0.25); if (s !== null) state.sigma = s;
  const z = num('z', Z_MIN, Z_MAX); if (z !== null) state.zeta = z;
  const o = q.get('open'); if (o && /^[01]+$/.test(o)) [...o].forEach((c, k) => { if (k < 15) state.open[k] = c === '1'; });
  const bc = num('bc', -7, 7), bw = num('bw', 0.4, 8); if (bc !== null && bw !== null) state.beam = { on: true, centre: bc, width: bw };
  const f = num('f', 0, 14); if (f !== null) state.follow = Math.round(f);
  if (q.get('expand') === '0') state.show.expand = false;
  const view = { orthodox: 'orthodox', 'pilot-wave': 'pilot-wave', 'many-worlds': 'many-worlds' }[q.get('view')]; if (view) state.interp = view;
  if (!state.open.slice(0, state.N).some(Boolean)) state.open.fill(true);
  ensureFollow();
}
function shareUrl() {
  const u = new URL(location.href);
  const p = { n: String(state.N), s: String(state.sigma), z: String(state.zeta), open: state.open.slice(0, state.N).map((x) => (x ? '1' : '0')).join(''), f: String(state.follow), view: state.interp };
  if (state.beam.on) { p.bc = String(state.beam.centre); p.bw = String(state.beam.width); }
  if (!state.show.expand) p.expand = '0';
  u.search = new URLSearchParams(p).toString();
  return u.href;
}

// ---------------------------------------------------------------- verdict
function finish() {
  state.finished = true;
  const k = state.follow, b = model.band[k];
  const n = run.hitsY.length;
  let nk = 0, inBand = 0, ahead = 0, others = 0;
  const yk = model.setup.y[k];
  for (let i = 0; i < n; i++) {
    const y = run.hitsY[i];
    const inside = y >= b.lo - 1e-9 && y <= b.hi + 1e-9;
    if (run.hitsK[i] === k) { nk++; if (inside) inBand++; if (Math.abs(y - yk) <= 1) ahead++; } else if (inside) others++;
  }
  const single = singleSlitFraction(model.setup, k, state.zeta, b.lo, b.hi);
  const p = model.weight[k];
  const nOpen = openList().length;
  let text = '';
  if (nOpen >= 2 && nk > 0) {
    const right = state.prediction ? state.prediction === 'band' : null;
    const lead = right === null ? '' : `<strong>${right ? 'Right.' : 'Not quite.'}</strong> `;
    text += `${lead}In the pilot-wave account, all ${fmtInt(inBand)} of the ${fmtInt(nk)} particles from slit ${slitName(k)} landed in one band of the screen (y ${bandText(k, ' d')}), and ${others === 0 ? 'no particle from another slit landed there' : `${others} from other slits landed there`}. `
      + `The band holds the fraction ${fmt(p, 3)} of the probability, the same as the slit. The wave from slit ${slitName(k)} alone would put only ${pct(single)} of its probability in this band; ${pct(ahead / nk)} of the particles landed within 1 d of straight ahead.`;
    if (model.feeders.length && regime() === 'far') {
      const list = model.feeders.map((f) => `${slitName(f.k)} (${pct(f.share)})`).join(', ');
      text += ` The brightest fringe (${pct(model.bright.mass)} of the probability) is fed by slit${model.feeders.length > 1 ? 's' : ''} ${list}.`;
    }
    if (state.prevBand && state.prevBand.k === k) {
      const pb = state.prevBand;
      text += ` With slit ${slitName(pb.closed)} ${state.open[pb.closed] ? 'open again' : 'closed'}, the band of slit ${slitName(k)} moved from ${pb.text} to y ${bandText(k, ' d')}: a slit those particles never went near changed where they land.`;
    }
  } else {
    text += `${fmtInt(n)} hits from a single open slit: there is no question of which slit, and the pattern is the slit's own diffraction.`;
  }
  text += ' <span class="feedback">' + {
    orthodox: 'Orthodox: the hits are the same, but the standard formalism attaches no slit to a detected particle; the bands are a statement of pilot-wave theory. Switch to Pilot Wave to see them.',
    'pilot-wave': 'Pilot Wave: trajectories never cross, so the slits keep their order on the screen; the band edges are where the trajectories that start between slits arrive.',
    'many-worlds': 'Many Worlds: this record is one branch. The wave of the branch came through every slit, so no slit is singled out. Every other record also occurs, with weight |ψ|².',
  }[state.interp] + '</span>';
  $('#verdict').innerHTML = text;

  const next = [];
  const ol = openList();
  const bottom = ol[ol.length - 1];
  if (state.prevBand && !state.open[state.prevBand.closed]) next.push(['reopen', `Reopen slit ${slitName(state.prevBand.closed)}`]);
  else if (ol.length >= 3 && bottom !== k) next.push(['close', `Close slit ${slitName(bottom)} and run again`]);
  if (state.interp === 'many-worlds') next.push(['branch', 'Sample another branch']);
  for (const [key, label] of [['five', 'Five slits'], ['uneven', 'Uneven beam'], ['talbot', 'Talbot carpet']]) {
    const pr = PRESETS[key];
    if (!(pr.N === state.N && pr.zeta === state.zeta)) next.push([key, label]);
  }
  next.push(['again', 'Run again']);
  $('#nextSteps').innerHTML = next.slice(0, 5).map(([key, l]) => `<button type="button" class="qontic-app-toggle" data-next="${key}">${l}</button>`).join('');
  showStep('verdict');
}
function sampleBranch() {
  const n = run.hitsY.length;
  newRun();
  for (let i = 0; i < n; i++) { const q = Math.random(); recordHit(q, slitOf(model.cells, q)); }
  finish();
}
$('#nextSteps').addEventListener('click', (e) => {
  const key = e.target.closest('[data-next]')?.dataset.next;
  if (!key) return;
  if (key === 'again') { state.finished = true; start(); return; }
  if (key === 'branch') { sampleBranch(); return; }
  if (key === 'close' || key === 'reopen') {
    const k = state.follow, b = model.band[k];
    const ol = openList();
    const target = key === 'close' ? ol[ol.length - 1] : state.prevBand.closed;
    state.prevBand = { k, lo: b.lo, hi: b.hi, text: `y ${bandText(k, ' d')}`, closed: target };
    toggleSlit(target, true);
    start();
    return;
  }
  applyPreset(key);
  if (canAsk()) showStep('question');
});

// ---------------------------------------------------------------- drawing
function label(text, x, y, { color, size = 12, align = 'left', base = 'alphabetic', weight = 400 } = {}) {
  ctx.font = `${weight} ${size}px Inter, Arial, sans-serif`;
  ctx.fillStyle = color; ctx.textAlign = align; ctx.textBaseline = base;
  ctx.fillText(text, x, y);
}
function niceStep(range, target) {
  const raw = range / target, mag = 10 ** Math.floor(Math.log10(raw));
  const f = raw / mag;
  return (f < 1.5 ? 1 : f < 3.5 ? 2 : f < 7.5 ? 5 : 10) * mag;
}

let geo = null; // current mapping, used for clicks
function wrap(text, width) {
  const words = text.split(' '), lines = [];
  let line = '';
  for (const w of words) { const t = line ? `${line} ${w}` : w; if (ctx.measureText(t).width > width && line) { lines.push(line); line = w; } else line = t; }
  if (line) lines.push(line);
  return lines;
}
function layout(W, H) {
  const g = 10;
  const sw = Math.max(110, Math.min(220, W * 0.22));
  const main = { x: g, y: g, w: W - 3 * g - sw, h: H - 2 * g };
  const side = { x: main.x + main.w + g, y: g, w: sw, h: H - 2 * g };
  ctx.font = '500 12.5px Inter, Arial, sans-serif';
  const lines = wrap(CAPTION[state.interp], main.w - 24);
  const head = 14 + 15 * lines.length + 14;
  const plot = { x: main.x + 34, y: main.y + head, w: main.w - 34 - 46, h: main.h - head - 34 };
  return { main, side, plot, lines, narrow: sw < 150 || W < 600 };
}
const X = (zeta) => geo.plot.x + (zeta / state.zeta) * geo.plot.w;
const Y = (y, zeta) => geo.plot.y + geo.plot.h / 2 - (y / dispHalf(zeta)) * (geo.plot.h / 2) * 0.96;
const Ys = (y) => Y(y, state.zeta);

// Wave image, column-normalized, computed in slices.
let waveDirty = true, waveImg = null, waveToken = 0;
const waveCanvas = document.createElement('canvas');
function scheduleWave() {
  if (!geo || model.empty) return;
  waveDirty = false;
  const token = ++waveToken;
  const cols = Math.max(80, Math.min(420, Math.round(geo.plot.w / 2))), rows = Math.max(80, Math.min(260, Math.round(geo.plot.h / 2)));
  waveCanvas.width = cols; waveCanvas.height = rows;
  const wctx = waveCanvas.getContext('2d');
  const img = wctx.createImageData(cols, rows);
  const P = palette();
  const col = new Float64Array(rows);
  let c = 0;
  const work = () => {
    if (token !== waveToken) return;
    const t0 = performance.now();
    while (c < cols && performance.now() - t0 < 12) {
      const zeta = (c / (cols - 1)) * state.zeta;
      const C = zetaConstants(state.sigma, zeta), H = dispHalf(zeta) / 0.96;
      let mx = 0;
      for (let r = 0; r < rows; r++) { const y = (1 - (2 * (r + 0.5)) / rows) * H; col[r] = densityAt(model.setup, y, zeta, C); if (col[r] > mx) mx = col[r]; }
      for (let r = 0; r < rows; r++) {
        const v = mx > 0 ? (col[r] / mx) ** 0.6 : 0, i = 4 * (r * cols + c);
        img.data[i] = P.waveLo[0] + v * (P.waveHi[0] - P.waveLo[0]);
        img.data[i + 1] = P.waveLo[1] + v * (P.waveHi[1] - P.waveLo[1]);
        img.data[i + 2] = P.waveLo[2] + v * (P.waveHi[2] - P.waveLo[2]);
        img.data[i + 3] = 255;
      }
      c++;
    }
    wctx.putImageData(img, 0, 0);
    waveImg = { ready: c >= cols };
    if (c < cols) setTimeout(work, 0);
  };
  work();
}

function yAt(qTop, zeta) {
  const T = model.T, jf = (zeta / state.zeta) * (T.nz - 1);
  const j = Math.max(0, Math.min(T.nz - 2, Math.floor(jf))), f = Math.min(1, jf - j);
  return yFromTop(T.cols[j], qTop) * (1 - f) + yFromTop(T.cols[j + 1], qTop) * f;
}
const colZeta = (j) => (j / (model.T.nz - 1)) * state.zeta;

function drawMain(P) {
  const { main, plot } = geo;
  ctx.fillStyle = P.panel; ctx.strokeStyle = P.frame; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.roundRect(main.x, main.y, main.w, main.h, 8); ctx.fill(); ctx.stroke();
  geo.lines.forEach((l, i) => label(l, main.x + 12, main.y + 19 + 15 * i, { color: P.text, size: 12.5, weight: 500 }));
  if (model.empty) { label('Open at least one slit.', plot.x + plot.w / 2, plot.y + plot.h / 2, { color: P.muted, size: 14, align: 'center' }); return; }
  ctx.save();
  ctx.beginPath(); ctx.rect(plot.x, plot.y, plot.w, plot.h); ctx.clip();
  if (state.show.wave && waveImg) {
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(waveCanvas, plot.x, plot.y, plot.w, plot.h);
  }
  // constant-y guide lines
  const Hs = dispHalf(state.zeta);
  const stepY = niceStep(2 * Hs, 8);
  ctx.strokeStyle = P.grid; ctx.lineWidth = 1;
  for (let yv = -Math.floor(Hs / stepY) * stepY; yv <= Hs; yv += stepY) {
    ctx.beginPath();
    for (let i = 0; i <= 60; i++) { const z = (i / 60) * state.zeta; const yy = Y(yv, z); i ? ctx.lineTo(X(z), yy) : ctx.moveTo(X(z), yy); }
    ctx.stroke();
  }
  const pw = state.interp === 'pilot-wave';
  const T = model.T;
  if (pw && state.show.domains) {
    const seps = model.seps;
    model.cells.slit.forEach((k, i) => {
      ctx.beginPath();
      for (let j = 0; j < T.nz; j++) { const z = colZeta(j); const yy = Y(seps[i][j], z); j ? ctx.lineTo(X(z), yy) : ctx.moveTo(X(z), yy); }
      for (let j = T.nz - 1; j >= 0; j--) { const z = colZeta(j); ctx.lineTo(X(z), Y(seps[i + 1][j], z)); }
      ctx.closePath();
      ctx.globalAlpha = k === state.follow ? 0.22 : 0.12; ctx.fillStyle = slitColor(k); ctx.fill();
      ctx.globalAlpha = 1;
    });
  }
  if (pw && state.show.fan) {
    ctx.lineWidth = 1;
    for (const f of model.fan) {
      ctx.strokeStyle = slitColor(f.k); ctx.globalAlpha = 0.6;
      ctx.beginPath();
      for (let j = 0; j < T.nz; j++) { const z = colZeta(j); const yy = Y(f.y[j], z); j ? ctx.lineTo(X(z), yy) : ctx.moveTo(X(z), yy); }
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    // separatrices: trajectories that start between slits
    ctx.setLineDash([5, 4]); ctx.strokeStyle = P.text; ctx.globalAlpha = 0.7; ctx.lineWidth = 1.2;
    for (let i = 1; i < model.seps.length - 1; i++) {
      ctx.beginPath();
      for (let j = 0; j < T.nz; j++) { const z = colZeta(j); const yy = Y(model.seps[i][j], z); j ? ctx.lineTo(X(z), yy) : ctx.moveTo(X(z), yy); }
      ctx.stroke();
    }
    ctx.setLineDash([]); ctx.globalAlpha = 1;
  }
  // packets
  for (const p of run.packets) {
    const z = (p.t / TRANSIT) * state.zeta, x = X(z);
    if (pw) {
      if (state.show.trails) {
        const jEnd = Math.floor((z / state.zeta) * (T.nz - 1));
        ctx.lineWidth = 1; ctx.globalAlpha = 0.45;
        for (let i = 0; i < p.qs.length; i++) {
          ctx.strokeStyle = slitColor(p.ks[i]);
          ctx.beginPath();
          for (let j = 0; j <= jEnd; j += 2) { const zz = colZeta(j); const yy = Y(yFromTop(T.cols[j], p.qs[i]), zz); j ? ctx.lineTo(X(zz), yy) : ctx.moveTo(X(zz), yy); }
          ctx.lineTo(x, Y(yAt(p.qs[i], z), z));
          ctx.stroke();
        }
        ctx.globalAlpha = 1;
      }
      for (let i = 0; i < p.qs.length; i++) {
        const yy = Y(yAt(p.qs[i], z), z);
        ctx.beginPath(); ctx.arc(x, yy, 3.2, 0, 2 * Math.PI);
        ctx.fillStyle = slitColor(p.ks[i]); ctx.fill();
        ctx.lineWidth = 1.5; ctx.strokeStyle = P.panel; ctx.stroke();
      }
    } else {
      const wpx = Math.max(10, plot.w * 0.035);
      const grad = ctx.createLinearGradient(x - wpx, 0, x + wpx, 0);
      const light = document.body.classList.contains('qontic-light');
      const c = light ? '8,92,112' : '255,255,255';
      grad.addColorStop(0, `rgba(${c},0)`); grad.addColorStop(0.5, `rgba(${c},${light ? 0.22 : 0.28})`); grad.addColorStop(1, `rgba(${c},0)`);
      ctx.fillStyle = grad; ctx.fillRect(x - wpx, plot.y, 2 * wpx, plot.h);
    }
  }
  ctx.restore();

  // screen line and recent hits
  const xs = X(state.zeta);
  ctx.strokeStyle = P.axis; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(xs, plot.y); ctx.lineTo(xs, plot.y + plot.h); ctx.stroke();
  const n = run.hitsY.length, from = Math.max(0, n - 600);
  for (let i = from; i < n; i++) {
    const yy = Ys(run.hitsY[i]);
    if (yy < plot.y || yy > plot.y + plot.h) continue;
    ctx.fillStyle = pw ? slitColor(run.hitsK[i]) : P.data;
    ctx.fillRect(xs + 2, yy - 1, 9, 2);
  }
  drawWall(P);
  // axes
  const stepZ = niceStep(state.zeta, 6);
  for (let z = 0; z <= state.zeta + 1e-9; z += stepZ) {
    label(fmt(z, stepZ < 0.1 ? 2 : stepZ < 1 ? 1 : 0), X(z), plot.y + plot.h + 15, { color: P.muted, size: 11, align: 'center' });
  }
  const axisTitle = state.show.expand && !geo.narrow ? 'distance behind the slits, z / z_T  ·  vertical scale widens with z' : 'distance behind the slits, z / z_T';
  label(axisTitle, plot.x + plot.w / 2, plot.y + plot.h + 28, { color: P.muted, size: 11, align: 'center' });
  for (let yv = -Math.floor(Hs / stepY) * stepY; yv <= Hs; yv += stepY) {
    const yy = Ys(yv);
    if (yy > plot.y + 6 && yy < plot.y + plot.h - 4) label(fmt(yv, stepY < 1 ? 1 : 0), xs + 14, yy + 4, { color: P.muted, size: 10.5 });
  }
  label('y / d', xs + 14, plot.y - 4, { color: P.muted, size: 10.5 });
}

function drawWall(P) {
  const { plot } = geo;
  const x0 = plot.x, s = model.setup;
  ctx.fillStyle = P.wall;
  const gapOf = (k) => {
    const yc = Y(s.y[k], 0), half = Math.max(2, Math.abs(Y(s.y[k] + 1.5 * state.sigma, 0) - yc));
    return [yc - half, yc + half];
  };
  let top = plot.y;
  for (let k = 0; k < s.N; k++) {
    const [a, b] = gapOf(k);
    if (s.open[k]) { ctx.fillRect(x0 - 3, top, 6, a - top); top = b; }
  }
  ctx.fillRect(x0 - 3, top, 6, plot.y + plot.h - top);
  // closed slits: a filled marker in the slit colour outline
  const spacing = Math.abs(Y(0, 0) - Y(1, 0));
  for (let k = 0; k < s.N; k++) {
    const yc = Y(s.y[k], 0);
    if (!s.open[k]) { ctx.strokeStyle = slitColor(k); ctx.lineWidth = 1.5; ctx.strokeRect(x0 - 5, yc - 4, 10, 8); }
    if (spacing >= 11 || k === state.follow || k === 0 || k === s.N - 1) {
      const isF = k === state.follow;
      label(`${isF ? '▸' : ''}${k + 1}`, x0 - 8, yc + 4, { color: isF ? P.follow : (s.open[k] ? P.text : P.muted), size: 11, align: 'right', weight: isF ? 600 : 400 });
    }
  }
}

function drawSide(P) {
  const { side } = geo;
  ctx.fillStyle = P.panel; ctx.strokeStyle = P.frame; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.roundRect(side.x, side.y, side.w, side.h, 8); ctx.fill(); ctx.stroke();
  label(geo.narrow ? 'Hits' : 'Hits on the screen', side.x + 10, side.y + 19, { color: P.text, size: 12.5, weight: 500 });
  if (model.empty) return;
  const pw = state.interp === 'pilot-wave';
  const top = geo.plot.y, bot = geo.plot.y + geo.plot.h;
  const x0 = side.x + 8, wMax = side.w - 16;
  const Hs = dispHalf(state.zeta) / 0.96;
  const nb = Math.max(30, Math.min(110, Math.round((bot - top) / 5)));
  const edge = (i) => Hs - (2 * Hs * i) / nb; // bin i spans edge(i+1)..edge(i), top to bottom
  // histogram, stacked by slit
  const counts = Array.from({ length: nb }, () => new Map());
  const n = run.hitsY.length;
  for (let i = 0; i < n; i++) {
    const b = Math.floor(((Hs - run.hitsY[i]) / (2 * Hs)) * nb);
    if (b < 0 || b >= nb) continue;
    const m = counts[b]; m.set(run.hitsK[i], (m.get(run.hitsK[i]) || 0) + 1);
  }
  const expected = Array.from({ length: nb }, (_, i) => Math.max(1, n) * (cdfAt(model.screen, edge(i)) - cdfAt(model.screen, edge(i + 1))));
  const tot = counts.map((m) => [...m.values()].reduce((a, b) => a + b, 0));
  const scale = Math.max(1, ...tot, ...(state.show.curve ? expected : [0])) * 1.08;
  // PW bands
  if (pw) {
    model.cells.slit.forEach((k) => {
      const b = model.band[k], y1 = Math.max(top, Ys(b.hi)), y2 = Math.min(bot, Ys(b.lo));
      if (y2 <= y1) return;
      ctx.globalAlpha = k === state.follow ? 0.2 : 0.1; ctx.fillStyle = slitColor(k); ctx.fillRect(side.x + 1, y1, side.w - 2, y2 - y1); ctx.globalAlpha = 1;
      if (y2 - y1 >= 13) label(`${k === state.follow ? '▸' : ''}${k + 1}`, side.x + side.w - 8, (y1 + y2) / 2 + 4, { color: k === state.follow ? P.follow : P.muted, size: 10.5, align: 'right', weight: k === state.follow ? 600 : 400 });
    });
  }
  for (let i = 0; i < nb; i++) {
    const y1 = Ys(edge(i)), y2 = Ys(edge(i + 1)), h = Math.max(1, y2 - y1 - 1);
    if (y1 < top - 1 || y2 > bot + 1) continue;
    if (pw) {
      let x = x0;
      [...counts[i].entries()].sort((a, b) => a[0] - b[0]).forEach(([k, c]) => {
        const w = (c / scale) * wMax; ctx.fillStyle = slitColor(k); ctx.fillRect(x, y1 + 0.5, w, h); x += w;
      });
    } else {
      ctx.fillStyle = P.data; ctx.globalAlpha = 0.85; ctx.fillRect(x0, y1 + 0.5, (tot[i] / scale) * wMax, h); ctx.globalAlpha = 1;
    }
  }
  if (pw) {
    ctx.setLineDash([4, 3]); ctx.strokeStyle = P.text; ctx.globalAlpha = 0.6; ctx.lineWidth = 1;
    model.cells.slit.slice(1).forEach((k) => { const yy = Ys(model.band[k].hi); if (yy > top && yy < bot) { ctx.beginPath(); ctx.moveTo(side.x + 1, yy); ctx.lineTo(side.x + side.w - 1, yy); ctx.stroke(); } });
    ctx.setLineDash([]); ctx.globalAlpha = 1;
  }
  if (state.show.curve) {
    ctx.strokeStyle = P.curve; ctx.lineWidth = 2; ctx.beginPath();
    for (let i = 0; i < nb; i++) { const yy = (Ys(edge(i)) + Ys(edge(i + 1))) / 2; const x = x0 + (expected[i] / scale) * wMax; i ? ctx.lineTo(x, yy) : ctx.moveTo(x, yy); }
    ctx.stroke();
  }
  label(n ? `${fmtInt(n)} hits` : 'no hits yet', side.x + 10, side.y + side.h - 10, { color: P.muted, size: 11 });
  if (state.show.curve && !geo.narrow) label('line: |ψ|²', side.x + side.w - 10, side.y + side.h - 10, { color: P.muted, size: 11, align: 'right' });
}

function render() {
  const P = palette();
  const ratio = devicePixelRatio || 1, W = canvas.clientWidth, H = canvas.clientHeight;
  if (W < 40 || H < 40) return;
  if (canvas.width !== Math.round(W * ratio) || canvas.height !== Math.round(H * ratio)) {
    canvas.width = Math.round(W * ratio); canvas.height = Math.round(H * ratio); waveDirty = true;
  }
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  ctx.fillStyle = P.bg; ctx.fillRect(0, 0, W, H);
  const L = layout(W, H);
  const sizeChanged = !geo || geo.plot.w !== L.plot.w || geo.plot.h !== L.plot.h;
  geo = L;
  if ((waveDirty || sizeChanged) && !model.empty) scheduleWave();
  drawMain(P);
  drawSide(P);
  updateResults();
}

function setResult(name, value) { const o = document.querySelector(`[data-result="${name}"]`); if (o && o.value !== value) o.value = value; }
function updateResults() {
  setResult('hits', fmtInt(run.hitsY.length));
  setResult('zeta', `${fmt(state.zeta, state.zeta < 1 ? 2 : 1)} z_T`);
  if (model.empty) return;
  const far = regime() === 'far';
  setResult('central', far ? pct(model.bright.mass, 1) : '—');
  setResult('feeders', far ? (model.feeders.map((f) => `${f.k + 1}`).join(', ') || '—') : '—');
  document.querySelectorAll('[data-hits]').forEach((td) => { const v = fmtInt(run.counts.get(+td.dataset.hits) || 0); if (td.textContent !== v) td.textContent = v; });
  if (state.step === 'run') {
    const inFlight = run.packets.reduce((a, p) => a + p.qs.length, 0);
    const text = `${fmtInt(run.hitsY.length)} of ${fmtInt(state.target)} hits · ${run.packets.length} packets in flight (${inFlight} particles)`;
    const el = $('#liveLine'); if (el.textContent !== text) el.textContent = text;
  }
}

// click a slit on the drawing to open or close it
canvas.addEventListener('click', (e) => {
  if (!geo || !model.setup) return;
  const r = canvas.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
  if (Math.abs(x - geo.plot.x) > 18 || y < geo.plot.y || y > geo.plot.y + geo.plot.h) return;
  let best = -1, dist = Infinity;
  model.setup.y.forEach((yk, k) => { const d = Math.abs(Y(yk, 0) - y); if (d < dist) { dist = d; best = k; } });
  const spacing = Math.abs(Y(0, 0) - Y(1, 0));
  if (best >= 0 && dist <= Math.max(8, spacing / 2)) toggleSlit(best);
});
canvas.addEventListener('mousemove', (e) => {
  if (!geo) return;
  const r = canvas.getBoundingClientRect(), x = e.clientX - r.left;
  canvas.style.cursor = Math.abs(x - geo.plot.x) <= 18 ? 'pointer' : 'default';
});
new MutationObserver(() => { waveDirty = true; buildSlitButtons(); buildTable(); }).observe(document.body, { attributes: true, attributeFilter: ['class'] });

let last = performance.now();
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  if (state.running) advanceRun(dt);
  try { render(); } catch (err) { console.error(err); }
  requestAnimationFrame(frame);
}

mountQonticMedia({
  stage: $('.visualization'),
  controls: controlsEl,
  getCanvases: () => [canvas],
  filename: 'which-slit',
  getShareUrl: shareUrl,
  beginRecording: () => { const was = state.running; if (!was) start(); return was; },
  endRecording: (was) => { if (!was) stop(); },
});
mountQonticShortcuts({
  togglePlayback: () => (state.running ? stop() : start()),
  reset: () => resetRun(),
  screenshot: () => document.querySelector('.qontic-media-toolbar button[aria-label="Screenshot"]')?.click(),
});

readUrl();
newRun();
rebuild();
syncControls();
setInterpretation(state.interp);
resetRun();
requestAnimationFrame(frame);
