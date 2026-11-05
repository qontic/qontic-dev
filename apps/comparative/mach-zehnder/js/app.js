import { mountQonticMedia } from '../../../../shared/qontic-media.js?v=3.0';
import { mountQonticShortcuts } from '../../../../shared/qontic-shortcuts.js?v=1';
import { mountQonticShell } from '../../../../shared/qontic-shell.js?v=resources-20260916';
import { mountQonticControls } from './qontic-controls.js?v=0.1';
import { APP_RELEASE } from './release.js?v=0.1';
import { G, OPTIONS, correctOption, probabilities, outcome, branches, componentPoint, pilotWavePath, pathPoint } from './physics.js?v=0.1';
import { COMMON, EXPLAIN, VIEW_LABEL } from './content.js?v=0.1';

mountQonticShell({
  compactHeader: true, navigation: 'breadcrumbs',
  title: 'Atom Mach–Zehnder Interferometer', eyebrow: 'Q-Ontic comparative simulation',
  purpose: 'Predict what the detectors show when the second beam splitter is removed, a which-way marker is added, or a bomb sits in one arm, then compare four accounts of what happens.',
  badge: 'Prediction mode', version: `App ${APP_RELEASE.version} · ${APP_RELEASE.date}`,
  homeHref: '../../../index.html', labHref: 'https://qonticlab.rice.edu/',
});

// ---------- view tabs ----------
const tabs = document.querySelector('.tabs');
tabs.addEventListener('click', event => {
  const button = event.target.closest('[data-view]');
  if (!button) return;
  tabs.querySelectorAll('button').forEach(item => item.classList.toggle('active', item === button));
  document.querySelectorAll('[data-panel]').forEach(panel => panel.classList.toggle('hidden', panel.dataset.panel !== button.dataset.view));
  if (button.dataset.view === 'log') renderLog();
});

// ---------- storage (falls back to memory when blocked) ----------
const LOG_KEY = 'qontic-mz-log-v1';
let memoryLog = [];
const readLog = () => { try { return JSON.parse(localStorage.getItem(LOG_KEY) || '[]'); } catch { return memoryLog; } };
const writeLog = entries => { memoryLog = entries; try { localStorage.setItem(LOG_KEY, JSON.stringify(entries)); } catch { /* memory only */ } };

// ---------- state ----------
const state = {
  setup: { bs2: true, object: 'none', markerSize: 'micro' },
  view: 'orthodox', running: false, autoRerun: false, speed: 1,
  display: { wave: true, config: true, labels: true, predict: true, fixedStart: false },
  fixedU: .3,
  atom: null, // { u, start, path, pathLen, result, clicked }
  tallies: {}, predictions: {},
};
const key = () => `${state.setup.bs2 ? 'in' : 'out'}-${state.setup.object}`;
const tally = () => (state.tallies[key()] ||= { d1: 0, d2: 0, bomb: 0, total: 0 });

// ---------- controls ----------
const ui = mountQonticControls({
  onStart: () => { if (!canRun()) { ui.setRunning(false); flashHint(); return; } state.running = true; if (!state.atom || state.atom.counted) launch(); },
  onStop: () => { state.running = false; },
  onReset: () => { state.running = false; ui.setRunning(false); state.atom = null; state.tallies[key()] = { d1: 0, d2: 0, bomb: 0, total: 0 }; delete state.predictions[key()]; syncPanel(); },
  onAutorun: ({ autoRerun }) => { state.autoRerun = autoRerun; },
  onInterpretation: ({ interpretation }) => { state.view = interpretation; syncPanel(); },
  onControlchange: ({ name, value }) => { if (name === 'speed') state.speed = value; },
});

document.querySelectorAll('[data-setup]').forEach(group => group.addEventListener('click', event => {
  const button = event.target.closest('button[data-value]');
  if (!button) return;
  group.querySelectorAll('button').forEach(b => { const on = b === button; b.classList.toggle('active', on); b.setAttribute('aria-pressed', String(on)); });
  const name = group.dataset.setup, value = button.dataset.value;
  state.setup[name] = name === 'bs2' ? value === 'in' : value;
  if (name !== 'markerSize') { state.atom = null; state.running = false; ui.setRunning(false); }
  syncPanel();
}));

document.querySelectorAll('[data-mz-toggle]').forEach(button => button.addEventListener('click', () => {
  const on = button.getAttribute('aria-pressed') !== 'true';
  button.setAttribute('aria-pressed', String(on));
  state.display[button.dataset.mzToggle] = on;
  document.getElementById('mz-start-row').hidden = !state.display.fixedStart;
  syncPanel();
}));
const startInput = document.getElementById('mz-start');
startInput.addEventListener('input', () => { state.fixedU = +startInput.value; startInput.nextElementSibling.value = (+startInput.value).toFixed(2); });

// ---------- prediction form ----------
const optionsBox = document.getElementById('mz-options');
OPTIONS.forEach(([id, label]) => {
  const row = document.createElement('label');
  row.className = 'mz-option';
  row.innerHTML = `<input type="radio" name="mz-option" id="mz-opt-${id}" value="${id}"><span>${label}</span>`;
  optionsBox.append(row);
});
const confBox = document.getElementById('mz-confidence');
const confNames = ['Guessing', 'Unsure', 'Somewhat sure', 'Sure', 'Certain'];
for (let i = 1; i <= 5; i++) {
  const b = document.createElement('button');
  b.type = 'button'; b.className = 'mz-conf'; b.textContent = String(i); b.dataset.value = String(i);
  b.setAttribute('role', 'radio'); b.setAttribute('aria-checked', 'false'); b.title = confNames[i - 1]; b.id = `mz-conf-${i}`;
  confBox.append(b);
}
let draft = { option: null, confidence: null };
optionsBox.addEventListener('change', event => { draft.option = event.target.value; syncPanel(); });
confBox.addEventListener('click', event => {
  const b = event.target.closest('.mz-conf'); if (!b || b.disabled) return;
  draft.confidence = +b.dataset.value; syncPanel();
});
const reasonInput = document.getElementById('mz-reason-input');
document.getElementById('mz-predict').addEventListener('submit', event => {
  event.preventDefault();
  if (!draft.option || !draft.confidence) return;
  state.predictions[key()] = { option: draft.option, confidence: draft.confidence, reason: reasonInput.value.trim(), view: state.view, at: new Date().toISOString(), logged: false };
  syncPanel();
});

const canRun = () => !state.display.predict || Boolean(state.predictions[key()]);
const hint = document.getElementById('mz-hint');
const flashHint = () => { hint.classList.remove('mz-flash'); void hint.offsetWidth; hint.classList.add('mz-flash'); };

document.getElementById('mz-one').addEventListener('click', () => { if (!canRun()) return flashHint(); launch(); });
document.getElementById('mz-many').addEventListener('click', () => {
  if (!canRun()) return flashHint();
  const t = tally();
  for (let i = 0; i < 200; i++) { const r = outcome(state.setup, Math.random()).result; t[r]++; t.total++; }
  launch();
  syncPanel();
});

let lastKey = null;
function syncPanel() {
  const p = state.predictions[key()];
  if (key() !== lastKey) { lastKey = key(); if (!p) { draft = { option: null, confidence: null }; reasonInput.value = ''; } }
  const locked = Boolean(p) || !state.display.predict;
  document.getElementById('mz-predict').hidden = !state.display.predict;
  if (p) draft = { option: p.option, confidence: p.confidence };
  optionsBox.querySelectorAll('input').forEach(input => { input.checked = input.value === draft.option; input.disabled = Boolean(p); input.closest('.mz-option').classList.toggle('is-selected', input.checked); });
  confBox.querySelectorAll('.mz-conf').forEach(b => { const on = +b.dataset.value === draft.confidence; b.classList.toggle('active', on); b.setAttribute('aria-checked', String(on)); b.disabled = Boolean(p); });
  reasonInput.disabled = Boolean(p);
  if (p) reasonInput.value = p.reason;
  const lock = document.getElementById('mz-lock');
  lock.disabled = Boolean(p) || !draft.option || !draft.confidence;
  lock.textContent = p ? 'Prediction locked' : 'Lock prediction';
  document.getElementById('mz-one').disabled = !locked;
  document.getElementById('mz-many').disabled = !locked;
  const t = tally();
  hint.textContent = !locked ? 'Choose an answer and a confidence, then lock your prediction to run this setup.'
    : t.total < 100 ? `Send at least 100 atoms to compare with your prediction (${t.total} so far).` : 'Change the setup or the interpretation to explore further.';
  ['d1', 'd2', 'bomb', 'total'].forEach(name => ui.setResult(name, String(t[name])));
  evaluate();
  const fb = document.getElementById('mz-feedback');
  fb.hidden = t.total === 0;
  document.getElementById('mz-common').textContent = COMMON[key()];
  document.getElementById('mz-explain-label').textContent = `${VIEW_LABEL[state.view]}:`;
  let text = EXPLAIN[state.view][key()];
  if (state.view === 'spontaneous-collapse' && state.setup.object === 'marker' && state.setup.markerSize === 'macro' && state.setup.bs2)
    text = 'A macroscopic marker moves many particles, so the state collapses at the marker: the atom is then in one arm only, a single part reaches the second beam splitter, and D1 and D2 are equally likely.';
  document.getElementById('mz-explain').textContent = text;
}

function evaluate() {
  const p = state.predictions[key()], t = tally(), verdict = document.getElementById('mz-verdict');
  if (!p || t.total < 100) { verdict.textContent = ''; verdict.className = 'mz-verdict'; return; }
  const correct = correctOption(state.setup);
  const ok = p.option === correct;
  const label = id => OPTIONS.find(([o]) => o === id)[1].toLowerCase();
  verdict.className = `mz-verdict ${ok ? 'is-right' : 'is-wrong'}`;
  verdict.textContent = ok ? `Your prediction matches: ${label(correct)}.` : `Not this time. You predicted “${label(p.option)}”; the detectors show ${label(correct)}.`;
  if (!p.logged) {
    p.logged = true;
    const entries = readLog();
    entries.push({ time: new Date().toISOString(), app: 'mach-zehnder', release: APP_RELEASE.version, setup: { secondBeamSplitter: state.setup.bs2, upperArm: state.setup.object }, interpretationShown: p.view, prediction: p.option, confidence: p.confidence, reason: p.reason, correctAnswer: correct, correct: ok, counts: { ...t } });
    writeLog(entries);
  }
}

// ---------- log tab ----------
function renderLog() {
  const body = document.querySelector('#mz-log-table tbody');
  const entries = readLog();
  body.innerHTML = '';
  if (!entries.length) { body.innerHTML = '<tr><td colspan="5">No predictions yet. Lock a prediction and send at least 100 atoms.</td></tr>'; return; }
  entries.slice().reverse().forEach(e => {
    const tr = document.createElement('tr');
    const setup = `${e.setup.secondBeamSplitter ? 'BS2 in' : 'BS2 out'}, ${e.setup.upperArm}`;
    const pred = OPTIONS.find(([o]) => o === e.prediction)?.[1] || e.prediction;
    [new Date(e.time).toLocaleString(), setup, pred, String(e.confidence), e.correct ? 'Right' : 'Wrong'].forEach(v => { const td = document.createElement('td'); td.textContent = v; tr.append(td); });
    body.append(tr);
  });
}
const logStatus = document.getElementById('mz-log-status');
document.getElementById('mz-log-copy').addEventListener('click', async () => {
  const text = JSON.stringify(readLog(), null, 2);
  try { await navigator.clipboard.writeText(text); logStatus.textContent = 'Copied.'; } catch { logStatus.textContent = 'Copying is blocked here; use Download.'; }
});
document.getElementById('mz-log-download').addEventListener('click', () => {
  const blob = new Blob([JSON.stringify(readLog(), null, 2)], { type: 'application/json' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'qontic-mach-zehnder-log.json'; a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
});
const clearButton = document.getElementById('mz-log-clear');
clearButton.addEventListener('click', () => {
  if (clearButton.dataset.confirm !== 'yes') { clearButton.dataset.confirm = 'yes'; clearButton.textContent = 'Click again to clear'; return; }
  writeLog([]); clearButton.dataset.confirm = ''; clearButton.textContent = 'Clear log'; logStatus.textContent = 'Log cleared.'; renderLog();
});

// ---------- atoms ----------
const DURATION = 3400;
function launch() {
  const u = state.display.fixedStart ? state.fixedU : Math.random();
  const o = outcome(state.setup, u);
  const pw = pilotWavePath(state.setup, u);
  let pathLen = 0;
  for (let i = 1; i < pw.pts.length; i++) pathLen += Math.hypot(pw.pts[i].x - pw.pts[i - 1].x, pw.pts[i].y - pw.pts[i - 1].y);
  state.atom = { u, o, path: pw.pts, pathLen, start: performance.now(), elapsed: 0, last: performance.now(), counted: false };
}
function finishAtom() {
  const a = state.atom;
  if (a.counted) return;
  a.counted = true;
  const t = tally(); t[a.o.result]++; t.total++;
  syncPanel();
}

// ---------- drawing ----------
const canvas = document.querySelector('.mz-canvas'), ctx = canvas.getContext('2d');
const caption = document.getElementById('mz-caption');
const colors = () => {
  const light = document.documentElement.classList.contains('qontic-light') || document.body.classList.contains('qontic-light');
  return light ? { beam: '#9db6c4', optic: '#2b6476', text: '#284c5d', muted: '#5c7686', wave: '#1594a8', a: '#b7791f', b: '#7b5cc4', particle: '#0e2a38', flash: '#d97706', panel: '#ffffffcc', bomb: '#b4432f' }
    : { beam: '#23465b', optic: '#7cc9d6', text: '#d9edf7', muted: '#7f98a8', wave: '#58d5e8', a: '#e0ad27', b: '#b49cff', particle: '#ffffff', flash: '#ffd166', panel: '#08151fcc', bomb: '#ff7a5c' };
};
let view = { k: 1, ox: 0, oy: 0 };
const T = p => ({ x: view.ox + p.x * view.k, y: view.oy + p.y * view.k });

function blob(p, r, color, alpha) {
  const q = T(p), rr = r * view.k;
  const g = ctx.createRadialGradient(q.x, q.y, 0, q.x, q.y, rr);
  g.addColorStop(0, color + Math.round(alpha * 255).toString(16).padStart(2, '0'));
  g.addColorStop(1, color + '00');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(q.x, q.y, rr, 0, Math.PI * 2); ctx.fill();
}
function line(a, b, color, width = 1, dash = []) {
  const p = T(a), q = T(b);
  ctx.strokeStyle = color; ctx.lineWidth = width * view.k; ctx.setLineDash(dash.map(d => d * view.k));
  ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke(); ctx.setLineDash([]);
}
function label(text, p, color, align = 'center', size = 14) {
  const q = T(p);
  ctx.fillStyle = color; ctx.font = `${Math.max(8, size * view.k)}px Inter, Arial, sans-serif`; ctx.textAlign = align; ctx.textBaseline = 'middle';
  ctx.fillText(text, q.x, q.y);
}
function plate(center, angle, color, dashed = false) {
  const half = 32, c = Math.cos(angle), s = Math.sin(angle);
  line({ x: center.x - c * half, y: center.y - s * half }, { x: center.x + c * half, y: center.y + s * half }, color, dashed ? 2 : 5, dashed ? [5, 5] : []);
}

function drawApparatus(c, s, result) {
  [[G.S, G.BS1], [G.BS1, G.MU], [G.BS1, G.ML], [G.MU, G.BS2], [G.ML, G.BS2], [G.BS2, G.D1], [G.BS2, G.D2]].forEach(([a, b]) => line(a, b, c.beam, 2));
  // source
  const src = T({ x: G.S.x - 26, y: G.S.y - 18 });
  ctx.strokeStyle = c.optic; ctx.lineWidth = 2 * view.k; ctx.strokeRect(src.x, src.y, 34 * view.k, 36 * view.k);
  plate(G.BS1, Math.PI / 2, c.optic);
  plate(G.BS2, Math.PI / 2, c.optic, !state.setup.bs2);
  plate(G.MU, 0, c.muted); plate(G.ML, 0, c.muted);
  const arrived = state.atom && s >= G.total - 1;
  [['D1', G.D1, G.dUp], ['D2', G.D2, G.dDown]].forEach(([name, d]) => {
    const p = T(d), size = 30 * view.k;
    const probs = probabilities(state.setup);
    const hit = arrived && (state.view === 'many-worlds' && result !== 'bomb' ? probs[name.toLowerCase()] > 0 : result === name.toLowerCase());
    ctx.fillStyle = hit ? c.flash : 'transparent'; ctx.strokeStyle = hit ? c.flash : c.optic; ctx.lineWidth = 2 * view.k;
    ctx.beginPath(); ctx.arc(p.x, p.y, size / 2, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    if (state.display.labels) label(name, { x: d.x + 34, y: d.y }, c.text, 'left', 16);
  });
  if (state.setup.object === 'marker') {
    const p = T(G.OBJ);
    ctx.strokeStyle = c.a; ctx.lineWidth = 2 * view.k;
    ctx.strokeRect(p.x - 14 * view.k, p.y - 14 * view.k, 28 * view.k, 28 * view.k);
    if (state.display.labels) label('Marker', { x: G.OBJ.x - 22, y: G.OBJ.y - 4 }, c.a, 'right');
  }
  if (state.setup.object === 'bomb') {
    const exploded = state.atom && result === 'bomb' && s >= G.sObj;
    const p = T(G.OBJ);
    ctx.fillStyle = exploded ? c.flash : c.bomb; ctx.beginPath(); ctx.arc(p.x, p.y, (exploded ? 22 : 13) * view.k, 0, Math.PI * 2); ctx.fill();
    if (state.display.labels) label(exploded ? 'Bomb exploded' : 'Bomb', { x: G.OBJ.x - 24, y: G.OBJ.y - 4 }, c.bomb, 'right');
  }
  if (state.display.labels) {
    label('Source', { x: G.S.x - 9, y: G.S.y + 36 }, c.muted, 'center', 12);
    label('BS1', { x: G.BS1.x, y: G.BS1.y + 46 }, c.muted, 'center', 12);
    label(state.setup.bs2 ? 'BS2' : 'BS2 removed', { x: G.BS2.x, y: G.BS2.y + 46 }, c.muted, 'center', 12);
  }
}

// Which branches are drawn in each account at arc length s.
function visibleBranches(s, result) {
  let list = branches(state.setup, s);
  const collapsesAtObject = state.view === 'orthodox' ? state.setup.object === 'bomb'
    : state.view === 'spontaneous-collapse' ? state.setup.object === 'bomb' || (state.setup.object === 'marker' && state.setup.markerSize === 'macro') : false;
  if (collapsesAtObject && s >= G.sObj) {
    if (result === 'bomb') return [];
    const arm = state.atom.o.arm;
    list = list.filter(b => !b.exploded && b.arms.includes(arm)).map(b => ({ ...b, weight: 1 }));
  }
  return list;
}

function drawWave(c, s, result) {
  if (!state.display.wave || !state.atom) return;
  const list = visibleBranches(s, result);
  const atDetectors = s >= G.total - 1;
  const collapseAtDetector = state.view === 'orthodox' || state.view === 'spontaneous-collapse';
  list.forEach((b, i) => {
    if (b.exploded) return;
    let color = c.wave;
    if (state.view === 'many-worlds' && list.length > 1) color = b.key === 'a' ? c.a : c.b;
    if ((state.view === 'orthodox' || state.view === 'spontaneous-collapse') && list.length > 1) color = b.key === 'a' ? c.a : c.wave;
    if (state.view === 'pilot-wave' && list.length > 1) color = b.key === 'a' ? c.a : c.b;
    const strength = state.view === 'pilot-wave' ? .38 : .75;
    b.comps.forEach(([comp, w]) => {
      if (atDetectors && collapseAtDetector) {
        const target = result === 'd1' ? 'p1' : 'p2';
        if (comp !== target) return;
        blob(componentPoint(comp, s), 24, color, .95);
        return;
      }
      if (w * b.weight < 1e-6) return;
      blob(componentPoint(comp, s), 26, color, strength * Math.sqrt(w * b.weight));
    });
  });
}

function drawParticle(c, s) {
  if (state.view !== 'pilot-wave' || !state.atom) return;
  const a = state.atom;
  const f = Math.min(1, s / a.pathLen);
  const { point, index } = pathPoint(a.path, f);
  ctx.strokeStyle = c.particle + '99'; ctx.lineWidth = 1.6 * view.k;
  ctx.beginPath();
  const first = T(a.path[0]); ctx.moveTo(first.x, first.y);
  for (let i = 1; i < index; i++) { const q = T(a.path[i]); ctx.lineTo(q.x, q.y); }
  const pt = T(point); ctx.lineTo(pt.x, pt.y); ctx.stroke();
  ctx.fillStyle = c.particle; ctx.beginPath(); ctx.arc(pt.x, pt.y, 5 * view.k, 0, Math.PI * 2); ctx.fill();
}

function drawConfigPanel(c, s, result) {
  if (!state.display.config) return;
  const x0 = 30, y0 = 404, w = 270, h = 180;
  const p = T({ x: x0, y: y0 });
  ctx.fillStyle = c.panel; ctx.strokeStyle = c.beam; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.roundRect(p.x, p.y, w * view.k, h * view.k, 8 * view.k); ctx.fill(); ctx.stroke();
  const obj = state.setup.object;
  const rows = obj === 'marker' ? ['Marker ready', 'Marker flipped'] : obj === 'bomb' ? ['Bomb intact', 'Bomb exploded'] : ['No record'];
  label('Configuration space', { x: x0 + 12, y: y0 + 16 }, c.text, 'left', 12);
  const colX = { U: x0 + 110, L: x0 + 170, meet: x0 + 232, in: x0 + 140 };
  const rowY = rows.map((_, i) => y0 + 70 + i * 62);
  rows.forEach((r, i) => { label(r, { x: x0 + 12, y: rowY[i] }, c.muted, 'left', 11); line({ x: x0 + 92, y: rowY[i] }, { x: x0 + w - 10, y: rowY[i] }, c.beam, 1, [3, 4]); });
  if (view.k > .55) {
    label('upper', { x: colX.U, y: y0 + 36 }, c.muted, 'center', 10);
    label('lower', { x: colX.L, y: y0 + 36 }, c.muted, 'center', 10);
    label('at BS2', { x: colX.meet, y: y0 + 36 }, c.muted, 'center', 10);
  }
  if (!state.atom) return;
  const list = visibleBranches(s, result);
  const atBS2 = s >= G.sBS2 - 60;
  const spots = [];
  list.forEach(b => {
    if (b.exploded) { if (rows.length > 1) spots.push({ x: colX.U, y: rowY[1], color: c.bomb, alpha: .9, absorbed: true }); return; }
    const row = obj === 'marker' && b.label === 'Marker flipped' ? 1 : 0;
    let color = c.wave;
    if (list.length > 1 && state.view !== 'orthodox' && state.view !== 'spontaneous-collapse') color = b.key === 'a' ? c.a : c.b;
    else if (list.length > 1) color = b.key === 'a' ? c.a : c.wave;
    if (s < G.sBS1) spots.push({ x: colX.in, y: rowY[0], color, alpha: .8 });
    else b.arms.forEach(arm => spots.push({ x: atBS2 ? colX.meet : colX[arm], y: rowY[row], color, alpha: .75 / Math.sqrt(b.arms.length) }));
  });
  if (!list.length && result === 'bomb' && s >= G.sObj && rows.length > 1) spots.push({ x: colX.U, y: rowY[1], color: c.bomb, alpha: .9, absorbed: true });
  spots.forEach(sp => {
    if (sp.absorbed) { blob(sp, 14, sp.color, .9); if (view.k > .55) label('absorbed', { x: sp.x + 40, y: sp.y }, sp.color, 'left', 10); return; }
    blob(sp, 20, sp.color, sp.alpha);
  });
  if (atBS2 && s < G.total) {
    const meetRows = spots.filter(sp => !sp.absorbed && sp.x === colX.meet).map(sp => sp.y);
    const overlap = meetRows.length > 1 && meetRows.every(y => y === meetRows[0]);
    label(overlap ? 'parts overlap: they interfere' : meetRows.length > 1 ? 'parts cannot overlap' : 'one part only', { x: x0 + w / 2, y: y0 + h - 12 }, overlap ? c.wave : c.a, 'center', 11);
  }
  if (state.view === 'pilot-wave') {
    const a = state.atom.o;
    const row = obj === 'marker' && a.arm === 'U' && s >= G.sObj ? 1 : obj === 'bomb' && a.result === 'bomb' && s >= G.sObj ? 1 : 0;
    const x = s < G.sBS1 ? colX.in : atBS2 ? colX.meet : colX[a.arm];
    const q = T({ x, y: rowY[Math.min(row, rows.length - 1)] });
    ctx.fillStyle = c.particle; ctx.beginPath(); ctx.arc(q.x, q.y, 4.5 * view.k, 0, Math.PI * 2); ctx.fill();
  }
}

function captionText(s, result) {
  if (!state.atom) return 'Choose a setup, make a prediction, then send atoms.';
  if (result === 'bomb' && s >= G.sObj) return 'The bomb absorbed the atom and exploded.';
  if (s >= G.total - 1 && state.view === 'many-worlds') {
    const pr = probabilities(state.setup);
    if (pr.d1 > 0 && pr.d2 > 0) return 'Both detectors click, each in its own branch. You find yourself in the branch where ' + (result === 'd1' ? 'D1' : 'D2') + ' clicked.';
  }
  if (s >= G.total - 1) return result === 'd1' ? 'D1 clicked.' : 'D2 clicked.' + (state.setup.object === 'bomb' && state.setup.bs2 ? ' The bomb is live, and it absorbed nothing.' : '');
  if (s < G.sBS1) return 'An atom leaves the source.';
  if (s < G.sBS2) return state.view === 'pilot-wave' ? 'The atom takes one arm; its wave takes both.' : 'The wave travels both arms.';
  return state.setup.bs2 ? 'The two arms meet at the second beam splitter.' : 'The beams cross where the second beam splitter used to be.';
}

let lastFrame = performance.now();
function frame(now) {
  const ratio = devicePixelRatio || 1, width = canvas.clientWidth, height = canvas.clientHeight;
  if (canvas.width !== Math.round(width * ratio) || canvas.height !== Math.round(height * ratio)) { canvas.width = Math.round(width * ratio); canvas.height = Math.round(height * ratio); }
 ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  ctx.clearRect(0, 0, width, height);
  if (width < 40 || height < 80) { lastFrame = now; requestAnimationFrame(frame); return; }
  const k = Math.min(width / 1000, (height - 34) / 600);
  view = { k, ox: (width - 1000 * k) / 2, oy: Math.max(8, (height - 34 - 600 * k) / 2) };
  const c = colors();
  const dt = Math.min(64, now - lastFrame); lastFrame = now;
  let s = 0, result = null;
  if (state.atom) {
    const a = state.atom;
    a.elapsed += dt * state.speed;
    const stopAt = a.o.result === 'bomb' ? G.sObj : G.total;
    s = Math.min(stopAt, (a.elapsed / DURATION) * G.total);
    result = a.o.result;
    if (s >= stopAt) {
      finishAtom();
      if (a.elapsed > DURATION * (stopAt / G.total) + 700 && state.running) {
        if (state.autoRerun) launch();
        else { state.running = false; ui.setRunning(false); }
      }
    }
  }
  drawApparatus(c, s, result);
  drawWave(c, s, result);
  drawParticle(c, s);
  drawConfigPanel(c, s, result);
  caption.textContent = captionText(s, result);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

mountQonticMedia({
  stage: document.querySelector('.visualization'), controls: document.querySelector('qontic-controls'),
  getCanvases: () => [canvas], filename: 'qontic-mach-zehnder',
  beginRecording: () => { const previous = state.running; if (canRun()) { state.running = true; ui.setRunning(true); if (!state.atom) launch(); } return previous; },
  endRecording: previous => { state.running = previous; ui.setRunning(previous); },
});
mountQonticShortcuts({
  togglePlayback: () => { if (!canRun()) return flashHint(); state.running = !state.running; ui.setRunning(state.running); if (state.running && !state.atom) launch(); },
  reset: () => document.querySelector('qontic-controls').dispatchEvent(new CustomEvent('qontic:reset', { detail: {}, bubbles: true })),
  screenshot: () => document.querySelector('.qontic-media-toolbar button[aria-label="Screenshot"]')?.click(),
});

syncPanel();
