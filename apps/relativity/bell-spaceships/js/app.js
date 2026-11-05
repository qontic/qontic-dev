import '../../../../shared/qontic-controls.js?v=3.2';
import { mountQonticShell } from '../../../../shared/qontic-shell.js?v=3.7';
import { mountQonticMedia } from '../../../../shared/qontic-media.js?v=3.0';
import { mountQonticShortcuts } from '../../../../shared/qontic-shortcuts.js?v=1';
import { APP_RELEASE } from './release.js?v=0.1.0';
import { makeModel, shipState, rearFrameView, findBreak, criticalBeta, runEnd, gammaOf } from './kinematics.js?v=0.1.0';

mountQonticShell({
  title: "Bell's Spaceships",
  eyebrow: 'Q-Ontic · Relativity',
  navigation: 'breadcrumbs',
  purpose: 'Two ships joined by a thread accelerate identically. Does the thread break? The same events in the launch frame, the ships’ frame and spacetime.',
  badge: 'Relativity',
  version: `Bell's spaceships · Version ${APP_RELEASE.version} · ${APP_RELEASE.date}`,
  homeHref: '../../../index.html',
});

// ---------------------------------------------------------------- state
const T0 = -0.75; // launch-frame time at which the animation starts (A's signal leaves at -L/2)
const SNAP = 0.35; // launch-frame time for the broken halves to recoil (schematic)
const SHIP_LEN = 0.26; // proper length of a ship, in units of L

const $ = (sel) => document.querySelector(sel);
const canvas = $('#stage');
const ctx = canvas.getContext('2d');
const controlsEl = $('qontic-controls');

const state = {
  mode: 'bell', beta: 0.9, breakStrain: 0.2, accel: 0.6, layout: 'all',
  show: { clocks: true, atoms: false, ghost: true, marks: true, signal: true, simul: true, predict: true },
  t: T0, running: false, autoRun: false, speed: 1,
  prediction: null, predictionAsked: false, finished: false,
};
let model, tEnd, tBreak, breakEvent, dMax;

readUrl();

function rebuild() {
  model = makeModel({ beta: state.beta, accel: state.accel, mode: state.mode });
  tEnd = runEnd(model);
  tBreak = findBreak(model, state.breakStrain, tEnd);
  breakEvent = null;
  if (tBreak !== null) {
    const v = rearFrameView(model, tBreak);
    breakEvent = { tB: tBreak, x: 0.5 * (v.xB + v.xC), t: 0.5 * (v.tB + v.tC), vB: v.vB, tauB: v.tauB, vC: shipState(model, 1, v.tC).v };
  }
  dMax = state.mode === 'bell' ? model.gammaF : 1;
  updateHints();
}

function resetRun() {
  state.t = T0;
  state.running = false;
  state.finished = false;
  state.prediction = null;
  state.predictionAsked = false;
  controlsEl.setAttribute('running', 'false');
  $('#verdict').classList.add('hidden');
  updatePredictionPanel();
}

// ---------------------------------------------------------------- controls
const fmt = (x, d = 2) => (Math.abs(x) < 0.5 * 10 ** -d ? 0 : x).toFixed(d);

function updateHints() {
  const g = model.gammaF;
  $('#betaOut').value = `${fmt(state.beta)} c`;
  $('#gammaHint').textContent = `γ = ${fmt(g)} at the final speed`;
  $('#breakOut').value = `${Math.round(state.breakStrain * 100)}%`;
  const bc = criticalBeta(state.breakStrain);
  $('#critHint').textContent = state.mode === 'bell'
    ? `With identical programs the thread snaps if the final speed is above ${fmt(bc)} c.`
    : 'With the rigid program the thread is never stretched.';
  $('#accelOut').value = fmt(state.accel);
  $('#frontAccelHint').textContent = state.mode === 'rigid'
    ? `Front ship: a/(1 + aL/c²) = ${fmt(model.ships[1].a, 3)} c²/L.`
    : 'Front ship: same proper acceleration as the rear ship.';
  $('#predictionText').textContent = state.mode === 'bell'
    ? `Both ships fire identical engines at the same moment and stop at ${fmt(state.beta)} c. The thread can stretch by ${Math.round(state.breakStrain * 100)}% before it snaps. Does it snap?`
    : `The front ship’s engine is set gentler than the rear’s. Both stop at ${fmt(state.beta)} c. The thread can stretch by ${Math.round(state.breakStrain * 100)}% before it snaps. Does it snap?`;
}

function setPressed(group, attr, value) {
  document.querySelectorAll(`${group} [${attr}]`).forEach((b) => {
    const on = b.getAttribute(attr) === value;
    b.classList.toggle('active', on);
    b.setAttribute('aria-pressed', String(on));
  });
}

function syncControls() {
  $('#beta').value = state.beta;
  $('#breakStrain').value = Math.round(state.breakStrain * 100);
  $('#accel').value = state.accel;
  setPressed('.mode-group', 'data-mode', state.mode);
  setPressed('.view-group', 'data-layout', state.layout);
  document.querySelectorAll('[data-toggle]').forEach((b) => b.setAttribute('aria-pressed', String(state.show[b.dataset.toggle])));
}

$('#beta').addEventListener('input', (e) => { state.beta = +e.target.value; rebuild(); resetRun(); });
$('#breakStrain').addEventListener('input', (e) => { state.breakStrain = +e.target.value / 100; rebuild(); resetRun(); });
$('#accel').addEventListener('input', (e) => { state.accel = +e.target.value; rebuild(); resetRun(); });
document.querySelectorAll('[data-mode]').forEach((b) => b.addEventListener('click', () => {
  state.mode = b.dataset.mode; setPressed('.mode-group', 'data-mode', state.mode); rebuild(); resetRun();
}));
document.querySelectorAll('[data-layout]').forEach((b) => b.addEventListener('click', () => {
  state.layout = b.dataset.layout; setPressed('.view-group', 'data-layout', state.layout);
}));
document.querySelectorAll('[data-toggle]').forEach((b) => b.addEventListener('click', () => {
  const key = b.dataset.toggle;
  state.show[key] = !state.show[key];
  b.setAttribute('aria-pressed', String(state.show[key]));
  if (key === 'predict') updatePredictionPanel();
}));

controlsEl.addEventListener('qontic:start', () => start());
controlsEl.addEventListener('qontic:stop', () => { state.running = false; controlsEl.setAttribute('running', 'false'); });
controlsEl.addEventListener('qontic:reset', () => resetRun());
controlsEl.addEventListener('qontic:autorun', (e) => { state.autoRun = e.detail.autoRun; controlsEl.setAttribute('auto-run', String(state.autoRun)); });
controlsEl.addEventListener('qontic:speed', (e) => { state.speed = e.detail.speed; });
controlsEl.addEventListener('qontic:tab', (e) => {
  controlsEl.setAttribute('active-tab', e.detail.tab);
  document.querySelectorAll('[data-control-pane]').forEach((p) => p.classList.toggle('hidden', p.dataset.controlPane !== e.detail.tab));
});

function start() {
  if (state.finished || state.t >= tEnd) { state.t = T0; state.finished = false; $('#verdict').classList.add('hidden'); }
  state.predictionAsked = true;
  $('#prediction').classList.add('hidden');
  state.running = true;
  controlsEl.setAttribute('running', 'true');
}

function updatePredictionPanel() {
  const show = state.show.predict && !state.predictionAsked && !state.running && state.t <= T0;
  $('#prediction').classList.toggle('hidden', !show);
}
document.querySelectorAll('[data-predict]').forEach((b) => b.addEventListener('click', () => {
  const p = b.dataset.predict;
  state.prediction = p === 'skip' ? null : p;
  state.predictionAsked = true;
  $('#prediction').classList.add('hidden');
  if (p !== 'skip') start();
}));

// Section tabs (Simulation / Physics / Rationale)
document.querySelector('.tabs').addEventListener('click', (event) => {
  const button = event.target.closest('[data-view]');
  if (!button) return;
  document.querySelectorAll('.tabs [data-view]').forEach((b) => b.classList.toggle('active', b === button));
  document.querySelectorAll('[data-panel]').forEach((p) => p.classList.toggle('hidden', p.dataset.panel !== button.dataset.view));
});

// Collapsible results panel
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
  const num = (k, lo, hi) => { const v = parseFloat(q.get(k)); return Number.isFinite(v) ? Math.min(hi, Math.max(lo, v)) : null; };
  const b = num('beta', 0.05, 0.99); if (b !== null) state.beta = b;
  const e = num('snap', 1, 150); if (e !== null) state.breakStrain = Math.round(e) / 100;
  const a = num('a', 0.1, 2); if (a !== null) state.accel = a;
  if (q.get('mode') === 'rigid') state.mode = 'rigid';
  if (['all', 'frames', 'spacetime'].includes(q.get('view'))) state.layout = q.get('view');
}
function shareUrl() {
  const u = new URL(location.href);
  u.search = new URLSearchParams({ mode: state.mode, beta: fmt(state.beta), snap: String(Math.round(state.breakStrain * 100)), a: fmt(state.accel), view: state.layout }).toString();
  return u.href;
}

// ---------------------------------------------------------------- drawing helpers
function palette() {
  const light = document.body.classList.contains('qontic-light');
  return light ? {
    bg: '#fbfdfe', panel: '#f1f6f8', frame: '#c9d9e0', text: '#183747', muted: '#5f7684', grid: '#e1eaee',
    B: '#0b8fa0', C: '#c4661b', A: '#6c7c88', light: '#c99a00', hull: '#e8eef2', simA: '#7a8b97', ok: '#2d4a5a', bad: '#c62828',
  } : {
    bg: '#071521', panel: '#0a1c2a', frame: '#23465a', text: '#d6e9f2', muted: '#7f98a7', grid: '#122a3a',
    B: '#62dce8', C: '#f0a35e', A: '#9aa9b5', light: '#f6e27a', hull: '#1a3242', simA: '#8aa0ae', ok: '#d9edf7', bad: '#ff5d5d',
  };
}

// Thread color from elongation relative to the breaking elongation.
function strainColor(strain, P) {
  const u = Math.max(0, Math.min(1, strain / state.breakStrain));
  const a = hexToRgb(P.ok), b = [240, 190, 70], c = hexToRgb(P.bad);
  const mix = (p, q, s) => p.map((x, i) => Math.round(x + (q[i] - x) * s));
  const rgb = u < 0.6 ? mix(a, b, u / 0.6) : mix(b, c, (u - 0.6) / 0.4);
  return `rgb(${rgb.join(',')})`;
}
function hexToRgb(h) { const n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }

function label(text, x, y, { color, size = 12, align = 'left', base = 'alphabetic', weight = 400 } = {}) {
  ctx.font = `${weight} ${size}px Inter, Arial, sans-serif`;
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.textBaseline = base;
  ctx.fillText(text, x, y);
}

// A ship facing +x. attach = screen x of the thread attachment point.
// rear ship: body to the left of attach; front ship: body to the right.
function drawShip(attach, y, lenPx, hPx, color, isRear, firing, P) {
  const x0 = isRear ? attach - lenPx : attach;
  const x1 = x0 + lenPx;
  const nose = Math.min(lenPx * 0.32, hPx * 1.2);
  ctx.save();
  if (firing) {
    const fl = Math.min(lenPx * 0.7, hPx * 1.8) * (0.85 + 0.15 * Math.sin(performance.now() / 45));
    const g = ctx.createLinearGradient(x0, y, x0 - fl, y);
    g.addColorStop(0, '#fff3b0'); g.addColorStop(0.4, '#ff9f3d'); g.addColorStop(1, 'rgba(255,90,40,0)');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.moveTo(x0, y - hPx * 0.28); ctx.lineTo(x0 - fl, y); ctx.lineTo(x0, y + hPx * 0.28); ctx.closePath(); ctx.fill();
  }
  ctx.fillStyle = P.hull; ctx.strokeStyle = color; ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(x0, y - hPx * 0.5);
  ctx.lineTo(x1 - nose, y - hPx * 0.5);
  ctx.quadraticCurveTo(x1, y - hPx * 0.35, x1, y);
  ctx.quadraticCurveTo(x1, y + hPx * 0.35, x1 - nose, y + hPx * 0.5);
  ctx.lineTo(x0, y + hPx * 0.5);
  ctx.closePath(); ctx.fill(); ctx.stroke();
  // fins
  const fin = Math.min(lenPx * 0.28, hPx);
  ctx.beginPath();
  ctx.moveTo(x0, y - hPx * 0.5); ctx.lineTo(x0 - fin * 0.25, y - hPx * 0.85); ctx.lineTo(x0 + fin, y - hPx * 0.5);
  ctx.moveTo(x0, y + hPx * 0.5); ctx.lineTo(x0 - fin * 0.25, y + hPx * 0.85); ctx.lineTo(x0 + fin, y + hPx * 0.5);
  ctx.stroke();
  // window
  ctx.fillStyle = color;
  ctx.beginPath(); ctx.ellipse(x0 + lenPx * 0.62, y, Math.max(1.5, Math.min(hPx * 0.16, lenPx * 0.07)), hPx * 0.16, 0, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
  return { x0, x1 };
}

function drawThreadSegment(xa, xb, y, color, sag = 0) {
  ctx.strokeStyle = color; ctx.lineWidth = 2.4; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(xa, y);
  if (sag) ctx.quadraticCurveTo(0.5 * (xa + xb), y + sag, xb, y + sag * 0.6); else ctx.lineTo(xb, y);
  ctx.stroke();
}

// Atoms of the thread with their electric fields flattened by 1/gamma.
function drawAtoms(xa, xb, y, gamma, P, s, n = 9) {
  const r = Math.max(3, Math.min(9, 0.035 * s));
  for (let i = 0; i <= n; i++) {
    const x = xa + ((xb - xa) * i) / n;
    ctx.strokeStyle = P.muted; ctx.lineWidth = 1; ctx.globalAlpha = 0.75;
    ctx.beginPath(); ctx.ellipse(x, y, r / gamma, r, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.globalAlpha = 1; ctx.fillStyle = P.text;
    ctx.beginPath(); ctx.arc(x, y, 1.8, 0, Math.PI * 2); ctx.fill();
  }
}

function bracket(xa, xb, y, text, P) {
  ctx.strokeStyle = P.muted; ctx.lineWidth = 1; ctx.setLineDash([3, 3]);
  ctx.beginPath(); ctx.moveTo(xa, y + 5); ctx.lineTo(xa, y); ctx.lineTo(xb, y); ctx.lineTo(xb, y + 5); ctx.stroke();
  ctx.setLineDash([]);
  ctx.font = '400 11px Inter, Arial, sans-serif';
  if (ctx.measureText(text).width < Math.abs(xb - xa) - 4) label(text, 0.5 * (xa + xb), y - 4, { color: P.muted, size: 11, align: 'center' });
}

function panelFrame(r, title, P, right = '', short = title) {
  if (r.w < 520) title = short;
  ctx.fillStyle = P.panel; ctx.strokeStyle = P.frame; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.roundRect(r.x, r.y, r.w, r.h, 8); ctx.fill(); ctx.stroke();
  label(title, r.x + 12, r.y + 20, { color: P.text, size: 13, weight: 600 });
  if (right) label(right, r.x + r.w - 12, r.y + 20, { color: P.muted, size: 12, align: 'right' });
}

// ---------------------------------------------------------------- layout
function layoutRects(W, H) {
  const g = 10;
  if (state.layout === 'spacetime') return { st: { x: g, y: g, w: W - 2 * g, h: H - 2 * g } };
  if (state.layout === 'frames') {
    const h = (H - 3 * g) / 2;
    return { lab: { x: g, y: g, w: W - 2 * g, h }, ship: { x: g, y: 2 * g + h, w: W - 2 * g, h } };
  }
  if (W >= 880) {
    const wl = (W - 3 * g) * 0.58, h = (H - 3 * g) / 2;
    return {
      lab: { x: g, y: g, w: wl, h }, ship: { x: g, y: 2 * g + h, w: wl, h },
      st: { x: 2 * g + wl, y: g, w: W - 3 * g - wl, h: H - 2 * g },
    };
  }
  const h1 = (H - 4 * g) * 0.27;
  return {
    lab: { x: g, y: g, w: W - 2 * g, h: h1 }, ship: { x: g, y: 2 * g + h1, w: W - 2 * g, h: h1 },
    st: { x: g, y: 3 * g + 2 * h1, w: W - 2 * g, h: H - 4 * g - 2 * h1 },
  };
}

// Pixels per L shared by both frame panels, so lengths can be compared directly.
function frameScale(rects) {
  const w = (rects.lab || rects.ship).w;
  return Math.min(w * 0.46, (w * 0.9) / (dMax + 2 * SHIP_LEN + 0.15));
}

// ---------------------------------------------------------------- panels
function drawLaunchPanel(r, s, P) {
  const t = state.t;
  const B = shipState(model, 0, t), C = shipState(model, 1, t);
  panelFrame(r, 'Launch frame (A at rest)', P, `t = ${fmt(t)} L/c`, 'Launch frame');
  const y = r.y + r.h * 0.5;
  const xc = 0.5 * (B.x + C.x);
  const X = (x) => r.x + r.w / 2 + (x - xc) * s;
  ctx.save(); ctx.beginPath(); ctx.rect(r.x, r.y + 26, r.w, r.h - 26); ctx.clip();

  if (state.show.marks) {
    const ry = r.y + r.h - 22;
    ctx.strokeStyle = P.grid; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(r.x, ry); ctx.lineTo(r.x + r.w, ry); ctx.stroke();
    const lo = Math.floor((xc - r.w / (2 * s)) * 4), hi = Math.ceil((xc + r.w / (2 * s)) * 4);
    for (let k = lo; k <= hi; k++) {
      const x = X(k / 4), major = k % 4 === 0;
      ctx.strokeStyle = major ? P.muted : P.grid;
      ctx.beginPath(); ctx.moveTo(x, ry - (major ? 7 : 4)); ctx.lineTo(x, ry); ctx.stroke();
      if (major) label(`${k / 4} L`, x, ry + 13, { color: P.muted, size: 10, align: 'center' });
    }
  }
  drawStationA(X(0.5), y + Math.min(r.h * 0.26, 46), Math.min(16, s * 0.06), 1, P);
  if (state.show.signal && t < 0.02) drawSignal(X, y, t, P);
  drawThreadLaunch(X, y, s, t, B, C, P);
  const hPx = Math.min(r.h * 0.12, SHIP_LEN * s * 0.42);
  const lenB = (SHIP_LEN * s) / gammaOf(B.v), lenC = (SHIP_LEN * s) / gammaOf(C.v);
  drawShip(X(B.x), y, lenB, hPx, P.B, true, t > 0 && t < model.ships[0].t1, P);
  drawShip(X(C.x), y, lenC, hPx, P.C, false, t > 0 && t < model.ships[1].t1, P);
  shipLabels(X(B.x) - lenB / 2, X(C.x) + lenC / 2, y, hPx, B, C, B.tau, C.tau, P, true);
  ctx.restore();
  return { sep: C.x - B.x, v: B.v };
}

function drawThreadLaunch(X, y, s, t, B, C, P) {
  const xa = X(B.x), xb = X(C.x);
  const g = gammaOf(0.5 * (B.v + C.v));
  const tb = breakEvent ? breakEvent.t : Infinity;
  if (t < tb) {
    const strain = rearFrameView(model, Math.max(t, 0)).D - 1;
    if (state.show.ghost) bracket(xa, xa + s / g, y - Math.max(22, s * 0.11), `relaxed length ${fmt(1 / g)} L`, P);
    drawThreadSegment(xa, xb, y, strainColor(t > 0 ? strain : 0, P));
    if (state.show.atoms) drawAtoms(xa, xb, y, g, P, s);
    return;
  }
  // broken: each half recoils toward its relaxed (contracted) length
  const u = Math.min(1, (t - tb) / SNAP), ease = 1 - (1 - u) ** 3;
  const gB = gammaOf(B.v), gC = gammaOf(C.v);
  const half = 0.5 * (xb - xa);
  const lB = half + (0.5 * s / gB - half) * ease, lC = half + (0.5 * s / gC - half) * ease;
  drawThreadSegment(xa, xa + lB, y, P.ok, 6 * ease);
  drawThreadSegment(xb, xb - lC, y, P.ok, 6 * ease);
  if (state.show.atoms) { drawAtoms(xa, xa + lB, y, gB, P, s, 4); drawAtoms(xb - lC, xb, y, gC, P, s, 4); }
  if (u < 1) flash(0.5 * (xa + xb), y, u, P);
}

function drawShipPanel(r, s, P) {
  const tB = Math.max(state.t, 0);
  const pre = state.t < 0;
  const v = pre ? { D: 1, tauB: state.t, tauC: state.t, vB: 0, vRel: 0, xB: 0, tC: state.t } : rearFrameView(model, tB);
  panelFrame(r, 'Rear ship B at rest (its momentary frame)', P, `τB = ${fmt(v.tauB)} L/c`, 'Rear ship\u2019s frame');
  const y = r.y + r.h * 0.5;
  const left = r.x + r.w / 2 - (dMax * s) / 2;
  const X = (xp) => left + xp * s; // xp: position in B's frame, B's attachment at 0
  const gB = gammaOf(v.vB);
  ctx.save(); ctx.beginPath(); ctx.rect(r.x, r.y + 26, r.w, r.h - 26); ctx.clip();

  if (state.show.marks) {
    // marks at rest in the launch frame: in B's frame they are contracted and move backwards
    const ry = r.y + r.h - 22;
    const xB = pre ? 0 : v.xB;
    ctx.strokeStyle = P.grid; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(r.x, ry); ctx.lineTo(r.x + r.w, ry); ctx.stroke();
    const span = (r.w / s) * gB;
    const lo = Math.floor((xB - span) * 4), hi = Math.ceil((xB + span) * 4);
    for (let k = lo; k <= hi; k++) {
      const x = X((k / 4 - xB) / gB), major = k % 4 === 0;
      if (x < r.x - 20 || x > r.x + r.w + 20) continue;
      ctx.strokeStyle = major ? P.muted : P.grid;
      ctx.beginPath(); ctx.moveTo(x, ry - (major ? 7 : 4)); ctx.lineTo(x, ry); ctx.stroke();
      if (major && (gB < 2.5 || k % 8 === 0)) label(`${k / 4} L`, x, ry + 13, { color: P.muted, size: 10, align: 'center' });
    }
    drawStationA(X((0.5 - xB) / gB), y + Math.min(r.h * 0.26, 46), Math.min(16, s * 0.06), 1 / gB, P);
  }
  if (state.show.signal && pre) drawSignal(X, y, state.t, P);

  const xa = X(0), xb = X(v.D);
  const broken = breakEvent && tB >= breakEvent.tB && !pre;
  if (!broken) {
    if (state.show.ghost) bracket(xa, xa + s, y - Math.max(22, s * 0.11), 'rest length L', P);
    drawThreadSegment(xa, xb, y, strainColor(v.D - 1, P));
    if (state.show.atoms) drawAtoms(xa, xb, y, gammaOf(0.5 * v.vRel), P, s);
  } else {
    const u = Math.min(1, (tB - breakEvent.tB) / SNAP), ease = 1 - (1 - u) ** 3;
    const half = 0.5 * (xb - xa);
    const l = half + (0.5 * s - half) * ease;
    drawThreadSegment(xa, xa + l, y, P.ok, 6 * ease);
    drawThreadSegment(xb, xb - l, y, P.ok, 6 * ease);
    if (state.show.atoms) { drawAtoms(xa, xa + l, y, 1, P, s, 4); drawAtoms(xb - l, xb, y, 1, P, s, 4); }
    if (u < 1) flash(0.5 * (xa + xb), y, u, P);
  }
  const hPx = Math.min(r.h * 0.12, SHIP_LEN * s * 0.42);
  const lenC = (SHIP_LEN * s) / gammaOf(v.vRel);
  const cAcc = !pre && v.tC > 0 && v.tC < model.ships[1].t1;
  drawShip(xa, y, SHIP_LEN * s, hPx, P.B, true, !pre && tB < model.ships[0].t1, P);
  drawShip(xb, y, lenC, hPx, P.C, false, cAcc, P);
  shipLabels(xa - SHIP_LEN * s / 2, xb + lenC / 2, y, hPx, { v: 0 }, { v: v.vRel }, v.tauB, v.tauC, P, false);
  if (state.show.clocks && !pre && v.tauC - v.tauB > 0.005) {
    label(`C's clock reads ${fmt(v.tauC - v.tauB)} L/c ahead of B's`, r.x + 12, r.y + 40, { color: P.muted, size: 11 });
  }
  ctx.restore();
  return v;
}

function shipLabels(xB, xC, y, hPx, B, C, tauB, tauC, P, launch) {
  const top = y - hPx * 0.95 - 6, bottom = y + hPx * 0.95 + 15;
  label('B', xB, top - (state.show.clocks ? 14 : 0), { color: P.B, size: 12, align: 'center', weight: 600 });
  label('C', xC, top - (state.show.clocks ? 14 : 0), { color: P.C, size: 12, align: 'center', weight: 600 });
  if (state.show.clocks) {
    label(`τ ${fmt(tauB)}`, xB, top, { color: P.B, size: 11, align: 'center' });
    label(`τ ${fmt(tauC)}`, xC, top, { color: P.C, size: 11, align: 'center' });
  }
  const vb = launch ? `${fmt(B.v)}c` : 'at rest';
  const vc = `${fmt(C.v)}c`;
  label(vb, xB, bottom, { color: P.muted, size: 10.5, align: 'center' });
  label(vc, xC, bottom, { color: P.muted, size: 10.5, align: 'center' });
}

function drawStationA(x, y, size, squeeze, P) {
  ctx.strokeStyle = P.A; ctx.fillStyle = P.A; ctx.lineWidth = 1.4;
  ctx.beginPath(); ctx.ellipse(x, y, size * squeeze, size * 0.45, 0, Math.PI, 0); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + size * 0.8); ctx.stroke();
  label('A', x + size * squeeze + 5, y + 4, { color: P.A, size: 11, weight: 600 });
}

// Light signal from A (at x = L/2) that starts both ships at t = 0.
function drawSignal(X, y, t, P) {
  const d = t + 0.5;
  if (d < 0) return;
  ctx.fillStyle = P.light; ctx.strokeStyle = P.light;
  for (const x of [0.5 - d, 0.5 + d]) {
    ctx.globalAlpha = 0.9; ctx.beginPath(); ctx.arc(X(x), y, 4, 0, Math.PI * 2); ctx.fill();
  }
  ctx.globalAlpha = 0.35; ctx.setLineDash([2, 4]);
  ctx.beginPath(); ctx.moveTo(X(0.5 - d), y); ctx.lineTo(X(0.5 + d), y); ctx.stroke();
  ctx.setLineDash([]); ctx.globalAlpha = 1;
}

function flash(x, y, u, P) {
  ctx.save(); ctx.globalAlpha = 1 - u; ctx.strokeStyle = P.bad; ctx.lineWidth = 2;
  for (let k = 0; k < 8; k++) {
    const a = (k * Math.PI) / 4, r1 = 4 + 10 * u, r2 = 10 + 22 * u;
    ctx.beginPath(); ctx.moveTo(x + r1 * Math.cos(a), y + r1 * Math.sin(a)); ctx.lineTo(x + r2 * Math.cos(a), y + r2 * Math.sin(a)); ctx.stroke();
  }
  label('snap!', x, y - 26 - 8 * u, { color: P.bad, size: 13, align: 'center', weight: 700 });
  ctx.restore();
}

function drawSpacetime(r, P) {
  panelFrame(r, 'Spacetime (launch-frame coordinates)', P, '', 'Spacetime');
  const m = { l: 42, r: 14, t: 34, b: 34 };
  const xEndB = shipState(model, 0, tEnd).x, xEndC = shipState(model, 1, tEnd).x;
  const xmin = -0.35, xmax = Math.max(xEndB, xEndC, 1) + 0.35, tmin = T0, tmax = tEnd;
  const k = Math.min((r.w - m.l - m.r) / (xmax - xmin), (r.h - m.t - m.b) / (tmax - tmin));
  const ox = r.x + m.l + ((r.w - m.l - m.r) - k * (xmax - xmin)) / 2;
  const oy = r.y + r.h - m.b - ((r.h - m.t - m.b) - k * (tmax - tmin)) / 2;
  const SX = (x) => ox + (x - xmin) * k, SY = (t) => oy - (t - tmin) * k;
  const t = state.t;

  // grid
  ctx.lineWidth = 1; ctx.strokeStyle = P.grid;
  const step = (xmax - xmin) > 12 ? 2 : 1;
  for (let x = Math.ceil(xmin / step) * step; x <= xmax; x += step) { ctx.beginPath(); ctx.moveTo(SX(x), SY(tmin)); ctx.lineTo(SX(x), SY(tmax)); ctx.stroke(); label(String(x), SX(x), SY(tmin) + 14, { color: P.muted, size: 10, align: 'center' }); }
  for (let tt = Math.ceil(tmin / step) * step; tt <= tmax; tt += step) { ctx.beginPath(); ctx.moveTo(SX(xmin), SY(tt)); ctx.lineTo(SX(xmax), SY(tt)); ctx.stroke(); label(String(tt), SX(xmin) - 6, SY(tt) + 3, { color: P.muted, size: 10, align: 'right' }); }
  label('x / L', SX(xmax), SY(tmin) + 26, { color: P.muted, size: 10.5, align: 'right' });
  ctx.save(); ctx.translate(r.x + 13, SY(tmax) + 30); ctx.rotate(-Math.PI / 2); label('ct / L', 0, 0, { color: P.muted, size: 10.5, align: 'right' }); ctx.restore();

  // thread history between the worldlines, sliced along B's lines of simultaneity
  const tStop = Math.min(t, breakEvent ? breakEvent.tB : Infinity, tEnd);
  if (tStop > tmin) {
    const n = 140;
    let prev = null;
    for (let i = 0; i <= n; i++) {
      const tb = tmin + ((tStop - tmin) * i) / n;
      const sl = tb <= 0 ? { xB: 0, tB: tb, xC: 1, tC: tb, D: 1 } : rearFrameView(model, tb);
      const cur = [SX(sl.xB), SY(sl.tB), SX(sl.xC), SY(sl.tC)];
      if (prev) {
        ctx.fillStyle = strainColor(sl.D - 1, P); ctx.globalAlpha = 0.28;
        ctx.beginPath(); ctx.moveTo(prev[0], prev[1]); ctx.lineTo(prev[2], prev[3]); ctx.lineTo(cur[2], cur[3]); ctx.lineTo(cur[0], cur[1]); ctx.closePath(); ctx.fill();
      }
      prev = cur;
    }
    ctx.globalAlpha = 1;
  }

  // A and the start signal
  ctx.strokeStyle = P.A; ctx.lineWidth = 1.2; ctx.globalAlpha = 0.7;
  ctx.beginPath(); ctx.moveTo(SX(0.5), SY(tmin)); ctx.lineTo(SX(0.5), SY(tmax)); ctx.stroke(); ctx.globalAlpha = 1;
  label('A', SX(0.5) + 4, SY(tmax) + 12, { color: P.A, size: 11, weight: 600 });
  if (state.show.signal) {
    ctx.strokeStyle = P.light; ctx.setLineDash([4, 3]); ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(SX(0.5), SY(-0.5)); ctx.lineTo(SX(0), SY(0)); ctx.moveTo(SX(0.5), SY(-0.5)); ctx.lineTo(SX(1), SY(0)); ctx.stroke(); ctx.setLineDash([]);
  }

  // worldlines: faint for the whole run, bright up to now
  for (const [i, color] of [[0, P.B], [1, P.C]]) {
    for (const [end, alpha, width] of [[tmax, 0.3, 1.5], [Math.min(t, tmax), 1, 2.4]]) {
      if (end <= tmin) continue;
      ctx.strokeStyle = color; ctx.globalAlpha = alpha; ctx.lineWidth = width;
      ctx.beginPath();
      for (let j = 0; j <= 200; j++) { const tt = tmin + ((end - tmin) * j) / 200; const x = shipState(model, i, tt).x; j ? ctx.lineTo(SX(x), SY(tt)) : ctx.moveTo(SX(x), SY(tt)); }
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    const xe = shipState(model, i, tmax).x;
    label(i ? 'C' : 'B', SX(xe) + (i ? 6 : -6), SY(tmax) + 12, { color, size: 12, align: i ? 'left' : 'right', weight: 600 });
  }

  // lines of simultaneity through B's current event
  const B = shipState(model, 0, t), C = shipState(model, 1, t);
  if (state.show.simul && t > tmin) {
    ctx.lineWidth = 1.2; ctx.setLineDash([5, 4]);
    ctx.strokeStyle = P.simA;
    ctx.beginPath(); ctx.moveTo(SX(xmin), SY(t)); ctx.lineTo(SX(xmax), SY(t)); ctx.stroke();
    label('same time for A', SX(xmin) + 4, SY(t) - 5, { color: P.simA, size: 10.5 });
    if (t > 0 && B.v > 0.002) {
      const tAt = (x) => t + B.v * (x - B.x);
      ctx.strokeStyle = P.B;
      ctx.beginPath(); ctx.moveTo(SX(xmin), SY(tAt(xmin))); ctx.lineTo(SX(xmax), SY(tAt(xmax))); ctx.stroke();
      const lx = Math.min(xmax - 0.2, shipState(model, 1, rearFrameView(model, t).tC).x + 0.4);
      ctx.font = '400 10.5px Inter, Arial, sans-serif';
      const lw = ctx.measureText('same time for B').width;
      const lxs = Math.min(SX(lx), r.x + r.w - lw - 8);
      label('same time for B', lxs, SY(tAt(xmin + (lxs - ox) / k)) - 6, { color: P.B, size: 10.5, align: 'left' });
    }
    ctx.setLineDash([]);
  }
  if (t > tmin) {
    dot(SX(B.x), SY(t), P.B, true); dot(SX(C.x), SY(t), P.C, true);
    if (t > 0) { const v = rearFrameView(model, t); dot(SX(v.xC), SY(v.tC), P.C, false); }
  }
  if (breakEvent && t >= breakEvent.t) star(SX(breakEvent.x), SY(breakEvent.t), P.bad);
}

function dot(x, y, color, filled) {
  ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI * 2);
  if (filled) { ctx.fillStyle = color; ctx.fill(); } else { ctx.strokeStyle = color; ctx.lineWidth = 1.8; ctx.stroke(); }
}
function star(x, y, color) {
  ctx.fillStyle = color; ctx.beginPath();
  for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + (i * Math.PI) / 5, rr = i % 2 ? 3 : 8; ctx.lineTo(x + rr * Math.cos(a), y + rr * Math.sin(a)); }
  ctx.closePath(); ctx.fill();
}

function drawGauge(r, strain, P, broken = false) {
  const w = Math.min(170, r.w * 0.4), h = 7, x = r.x + 12, y = r.y + 42;
  const max = Math.max(state.breakStrain * 1.25, 0.05);
  ctx.fillStyle = P.grid; ctx.fillRect(x, y, w, h);
  ctx.fillStyle = strainColor(strain, P); ctx.fillRect(x, y, w * Math.min(1, Math.max(0, strain) / max), h);
  const xb = x + (w * state.breakStrain) / max;
  ctx.strokeStyle = P.bad; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(xb, y - 3); ctx.lineTo(xb, y + h + 3); ctx.stroke();
  label(broken ? 'thread snapped' : `stretch ${Math.round(Math.max(0, strain) * 100)}%`, x, y + h + 13, { color: broken ? P.bad : P.muted, size: 10.5 });
  label('snaps', xb, y - 5, { color: P.bad, size: 10, align: 'center' });
}

// ---------------------------------------------------------------- main loop
function render() {
  const P = palette();
  const ratio = devicePixelRatio || 1, W = canvas.clientWidth, H = canvas.clientHeight;
  if (canvas.width !== Math.round(W * ratio) || canvas.height !== Math.round(H * ratio)) { canvas.width = Math.round(W * ratio); canvas.height = Math.round(H * ratio); }
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  ctx.fillStyle = P.bg; ctx.fillRect(0, 0, W, H);
  const rects = layoutRects(W, H);
  const broken = breakEvent && Math.max(state.t, 0) >= breakEvent.tB;
  const view = state.t > 0 ? rearFrameView(model, state.t) : { D: 1, tauB: state.t, vB: 0 };
  const strain = broken ? 0 : view.D - 1;
  if (rects.lab) {
    const s = frameScale(rects);
    drawLaunchPanel(rects.lab, s, P);
    drawGauge(rects.lab, state.t > 0 ? strain : 0, P, broken);
    drawShipPanel(rects.ship, s, P);
  }
  if (rects.st) { drawSpacetime(rects.st, P); if (!rects.lab) drawGauge(rects.st, state.t > 0 ? strain : 0, P, broken); }

  const B = shipState(model, 0, state.t), C = shipState(model, 1, state.t);
  setResult('t', `${fmt(state.t)} L/c`);
  setResult('tau', `${fmt(B.tau)} L/c`);
  setResult('v', `${fmt(B.v)} c`);
  setResult('sepLab', `${fmt(C.x - B.x)} L`);
  setResult('sepShip', `${fmt(view.D)} L`);
  setResult('strain', broken ? '—' : `${Math.round(Math.max(0, strain) * 100)}%`);
  setResult('status', broken ? `snapped at τB = ${fmt(breakEvent.tauB)}` : 'intact');
}
function setResult(name, value) { const o = document.querySelector(`[data-result="${name}"]`); if (o && o.value !== value) o.value = value; }

function finish() {
  state.finished = true;
  const snapped = breakEvent !== null;
  const stillAccelerating = snapped && breakEvent.tB < model.ships[0].t1;
  const outcome = snapped
    ? `The thread snapped ${stillAccelerating ? 'while the ships were still accelerating' : 'while the ships were coasting'}, with the rear ship at ${fmt(breakEvent.vB)} c (its clock read ${fmt(breakEvent.tauB)} L/c).`
    : 'The thread held.';
  const why = state.mode === 'bell'
    ? 'In the launch frame the ships stay L apart while the moving thread contracts. In the ships’ frame they end up γL apart.'
    : 'The front ship accelerated more gently, so in the ships’ frame the distance stayed L. In the launch frame ships and thread contract together.';
  let lead = '';
  if (state.prediction) {
    const right = (state.prediction === 'breaks') === snapped;
    lead = `<strong>${right ? 'As you predicted.' : 'Not what you predicted.'}</strong> `;
  }
  const el = $('#verdict');
  el.innerHTML = `${lead}${outcome} ${why}`;
  el.classList.remove('hidden');
}

let last = performance.now();
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  if (state.running) {
    const rate = (tEnd - T0) / 14; // a full run takes about 14 s at speed 1
    state.t += dt * rate * state.speed;
    if (state.t >= tEnd) {
      state.t = tEnd;
      if (state.autoRun) { finish(); state.t = T0; state.finished = false; }
      else { state.running = false; controlsEl.setAttribute('running', 'false'); finish(); }
    }
  }
  render();
  requestAnimationFrame(frame);
}

// ---------------------------------------------------------------- media and shortcuts
mountQonticMedia({
  stage: $('.visualization'),
  controls: controlsEl,
  getCanvases: () => [canvas],
  filename: 'bell-spaceships',
  getShareUrl: shareUrl,
  beginRecording: () => { const was = state.running; if (!was) start(); return was; },
  endRecording: (was) => { if (!was) { state.running = false; controlsEl.setAttribute('running', 'false'); } },
});
mountQonticShortcuts({
  togglePlayback: () => (state.running ? controlsEl.dispatchEvent(new CustomEvent('qontic:stop')) : start()),
  reset: () => resetRun(),
  screenshot: () => document.querySelector('.qontic-media-toolbar button[aria-label="Screenshot"]')?.click(),
});

rebuild();
syncControls();
resetRun();
requestAnimationFrame(frame);
