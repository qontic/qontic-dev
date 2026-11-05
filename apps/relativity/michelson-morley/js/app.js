import '../../../../shared/qontic-controls.js?v=3.2';
import { mountQonticShell } from '../../../../shared/qontic-shell.js?v=3.7';
import { mountQonticMedia } from '../../../../shared/qontic-media.js?v=3.0';
import { mountQonticShortcuts } from '../../../../shared/qontic-shortcuts.js?v=1';
import { APP_RELEASE } from './release.js?v=0.1.0';
import { makeRun, pulseAt, delay, gammaOf } from './optics.js?v=0.1.0';

mountQonticShell({
  title: 'Michelson–Morley: Two Accounts',
  eyebrow: 'Q-Ontic · Relativity',
  navigation: 'breadcrumbs',
  purpose: 'The same interferometer told twice: Lorentz’s apparatus that shrinks as it moves through a resting ether, and Einstein’s apparatus at rest with no ether.',
  badge: 'Relativity',
  version: `Michelson–Morley · Version ${APP_RELEASE.version} · ${APP_RELEASE.date}`,
  homeHref: '../../../index.html',
});

// ---------------------------------------------------------------- state
const S0 = -0.35; // animation starts a little before the pulse is split
const HOLD = 0.4; // pause after the last half returns
const DEG = Math.PI / 180;
const ACCOUNTS = ['classical', 'lorentz', 'einstein', 'both'];
const NAMES = { classical: '1887 expectation', lorentz: 'Lorentz', einstein: 'Einstein', both: 'Lorentz and Einstein' };

const $ = (sel) => document.querySelector(sel);
const canvas = $('#stage');
const ctx = canvas.getContext('2d');
const controlsEl = $('qontic-controls');

const state = {
  account: 'classical', beta: 0.6, thetaDeg: 0,
  show: { trails: true, ghost: true, ether: true, curve: true, predict: true },
  s: S0, running: false, autoRun: false, speed: 1,
  prediction: null, finished: false, step: 'setup',
};
// runs: one per panel. In 'both' the animation variable is the apparatus clock.
let runs, sEnd;

readUrl();

function rebuild() {
  const theta = state.thetaDeg * DEG;
  const make = (account) => makeRun({ beta: state.beta, theta, account });
  runs = state.account === 'both' ? [make('lorentz'), make('einstein')] : [make(state.account)];
  sEnd = state.account === 'both' ? 2 : runs[0].tEnd;
  updateHints();
}
// Drawing-frame time of panel run r at animation time s.
const frameTime = (r, s) => (state.account === 'both' ? s / r.clockRate : s);

function resetRun() {
  state.s = S0; state.running = false; state.finished = false; state.prediction = null;
  controlsEl.setAttribute('running', 'false');
  showStep('setup');
}

// ---------------------------------------------------------------- controls
const fmt = (x, d = 2) => (Math.abs(x) < 0.5 * 10 ** -d ? 0 : x).toFixed(d);

function accountSentence() {
  return {
    classical: '<b>1887 expectation.</b> Light moves at c through a resting <b>ether</b>. The apparatus moves through it and keeps its shape.',
    lorentz: '<b>Lorentz.</b> The same resting ether, but a body moving through it is <b>shorter along its motion</b> by 1/γ, because the forces holding it together change. Its clocks also run slow.',
    einstein: '<b>Einstein.</b> There is <b>no ether</b>. In the apparatus’s own frame it is at rest, and light moves at c in every direction.',
    both: '<b>Both.</b> Lorentz’s account (top, ether frame) and Einstein’s (bottom, apparatus frame), run side by side on the clock carried by the apparatus.',
  }[state.account];
}

function updateHints() {
  const g = gammaOf(state.beta);
  $('#betaOut').value = `${fmt(state.beta)} c`;
  $('#betaHint').textContent = `γ = ${fmt(g, 3)}. Earth’s orbital speed is about 0.0001 c; it is exaggerated here so the effects can be seen.`;
  $('#thetaOut').value = `${state.thetaDeg}°`;
  $('#setupList').innerHTML = [
    'A <b>beam splitter</b> divides a light pulse in two. One half runs along <b>arm 1</b> (cyan), the other along <b>arm 2</b> (orange). At rest, both arms have length <b>L</b> and are at right angles.',
    'Each half bounces off a mirror and comes back to the splitter. If the halves <b>arrive together</b>, the interference fringes stay put. If one is late, the fringes shift.',
    `The apparatus moves at <b>${fmt(state.beta)} c</b>${state.thetaDeg ? `, turned ${state.thetaDeg}° from its direction of motion` : ', with arm 1 along its direction of motion'}.`,
    accountSentence(),
  ].map((x) => `<li>${x}</li>`).join('');
  $('#setupNext').textContent = state.show.predict ? 'Next: the question' : 'Start';
  const clockLabel = state.account === 'classical' ? 'Time (ether frame)' : 'Clock on the apparatus';
  $('#clockName').textContent = clockLabel;
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
  $('#theta').value = state.thetaDeg;
  setPressed('.account-group', 'data-account', state.account);
  document.querySelectorAll('[data-toggle]').forEach((b) => b.setAttribute('aria-pressed', String(state.show[b.dataset.toggle])));
  $('.canvas-host').classList.toggle('tall', state.account === 'both');
}
function setAccount(account) {
  state.account = account;
  syncControls(); rebuild(); resetRun();
}

function showStep(step) {
  ['setup', 'question', 'run', 'verdict'].forEach((k) => $(`#${k}Step`).classList.toggle('hidden', k !== step));
  state.step = step;
}
$('#setupNext').addEventListener('click', () => (state.show.predict ? showStep('question') : start()));
$('#setupBack').addEventListener('click', () => showStep('setup'));
$('#showSetup').addEventListener('click', () => { stop(); showStep('setup'); });
document.querySelectorAll('[data-predict]').forEach((b) => b.addEventListener('click', () => {
  state.prediction = b.dataset.predict === 'skip' ? null : b.dataset.predict;
  start();
}));

$('#beta').addEventListener('input', (e) => { state.beta = +e.target.value; rebuild(); resetRun(); });
$('#theta').addEventListener('input', (e) => { state.thetaDeg = +e.target.value; rebuild(); resetRun(); });
document.querySelectorAll('[data-account]').forEach((b) => b.addEventListener('click', () => setAccount(b.dataset.account)));
document.querySelectorAll('[data-toggle]').forEach((b) => b.addEventListener('click', () => {
  const key = b.dataset.toggle;
  state.show[key] = !state.show[key];
  b.setAttribute('aria-pressed', String(state.show[key]));
  if (key === 'predict') updateHints();
}));

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

function start() {
  if (state.finished || state.s >= sEnd + HOLD) { state.s = S0; state.finished = false; }
  showStep('run');
  state.running = true;
  controlsEl.setAttribute('running', 'true');
}

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
  const b = parseFloat(q.get('beta')); if (Number.isFinite(b)) state.beta = Math.min(0.8, Math.max(0.05, Math.round(b * 20) / 20));
  const th = parseFloat(q.get('theta')); if (Number.isFinite(th)) state.thetaDeg = Math.min(90, Math.max(0, Math.round(th / 5) * 5));
  if (ACCOUNTS.includes(q.get('account'))) state.account = q.get('account');
}
function shareUrl() {
  const u = new URL(location.href);
  u.search = new URLSearchParams({ account: state.account, beta: fmt(state.beta), theta: String(state.thetaDeg) }).toString();
  return u.href;
}

// ---------------------------------------------------------------- drawing helpers
function palette() {
  const light = document.body.classList.contains('qontic-light');
  return light ? {
    bg: '#fbfdfe', panel: '#f1f6f8', frame: '#c9d9e0', text: '#183747', muted: '#5f7684', grid: '#c3d3da',
    a1: '#0b8fa0', a2: '#c4661b', arm: '#35505f', ghost: '#8aa0ae', light: '#c99a00', warn: '#c62828',
  } : {
    bg: '#071521', panel: '#0a1c2a', frame: '#23465a', text: '#d6e9f2', muted: '#7f98a7', grid: '#24465a',
    a1: '#62dce8', a2: '#f0a35e', arm: '#b6cad6', ghost: '#5d7787', light: '#f6e27a', warn: '#ff6b6b',
  };
}
function label(text, x, y, { color, size = 12, align = 'left', base = 'alphabetic', weight = 400 } = {}) {
  ctx.font = `${weight} ${size}px Inter, Arial, sans-serif`;
  ctx.fillStyle = color; ctx.textAlign = align; ctx.textBaseline = base;
  ctx.fillText(text, x, y);
}
function panelFrame(r, title, P, right = '') {
  ctx.fillStyle = P.panel; ctx.strokeStyle = P.frame; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.roundRect(r.x, r.y, r.w, r.h, 8); ctx.fill(); ctx.stroke();
  label(title, r.x + 12, r.y + 20, { color: P.text, size: 13, weight: 600 });
  if (right) label(right, r.x + r.w - 12, r.y + 20, { color: P.muted, size: 12, align: 'right' });
}
function glow(x, y, color) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, 11);
  g.addColorStop(0, '#ffffff'); g.addColorStop(0.3, color); g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, 11, 0, Math.PI * 2); ctx.fill();
}

// World extent of a panel (units of L), so all panels share one scale.
function extent(r) {
  const vEnd = r.v * (state.account === 'both' ? frameTime(r, sEnd) : r.tEnd);
  const vStart = r.v * frameTime(r, S0);
  return { x0: Math.min(-1.1, vStart - 1.1), x1: vEnd + 1.1 };
}

function layoutRects(W, H) {
  const g = 10;
  if (state.account !== 'both') return [{ x: g, y: g, w: W - 2 * g, h: H - 2 * g }];
  const h = (H - 3 * g) / 2;
  return [{ x: g, y: g, w: W - 2 * g, h }, { x: g, y: 2 * g + h, w: W - 2 * g, h }];
}

function drawPanel(rect, run, scale, P, idx) {
  const s = Math.min(state.s, sEnd); // hold the final picture after the last return
  const t = frameTime(run, s);
  const ext = extent(runs[0]);
  // Einstein panel in 'both': centre the resting apparatus.
  const centre = run.v === 0;
  const ox = centre ? rect.x + rect.w / 2 : rect.x + 20 + (-ext.x0) * scale;
  const oy = Math.min(rect.y + rect.h - 40, rect.y + 28 + (rect.h - 28) / 2 + 0.55 * scale);
  const X = (x) => ox + x * scale, Y = (y) => oy - y * scale;

  const titles = {
    classical: ['1887 expectation · ether frame', 'apparatus moves through the ether, keeps its shape'],
    lorentz: ['Lorentz · ether frame', 'apparatus moves through the ether and is shorter along its motion'],
    einstein: ['Einstein · apparatus frame', 'no ether; apparatus at rest'],
  };
  const [title, sub] = titles[run.account];
  panelFrame(rect, title, P, rect.w > 640 ? sub : '');

  ctx.save();
  ctx.beginPath(); ctx.rect(rect.x + 1, rect.y + 28, rect.w - 2, rect.h - 29); ctx.clip();

  // Ether markers: at rest in the ether frame.
  if (state.show.ether && run.account !== 'einstein') {
    ctx.fillStyle = P.grid;
    for (let gx = Math.floor(ext.x0 * 2) / 2 - 1; gx <= ext.x1 + 1; gx += 0.5) {
      for (let gy = -0.25; gy <= 1.6; gy += 0.5) { ctx.beginPath(); ctx.arc(X(gx), Y(gy), 1.6, 0, Math.PI * 2); ctx.fill(); }
    }
    label('dots: at rest in the ether', rect.x + 12, rect.y + rect.h - 10, { color: P.muted, size: 11 });
  } else if (run.account === 'einstein') {
    label('light moves at c in every direction in this frame', rect.x + 12, rect.y + rect.h - 10, { color: P.muted, size: 11 });
  }

  const sx = run.v * t; // splitter position
  // light paths
  if (state.show.trails && t > 0) {
    run.arms.forEach((a, i) => {
      ctx.strokeStyle = i ? P.a2 : P.a1; ctx.globalAlpha = 0.55; ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.moveTo(X(0), Y(0));
      if (t < a.t1) { const p = pulseAt(run, i, t); ctx.lineTo(X(p.x), Y(p.y)); }
      else { ctx.lineTo(X(a.Mhit[0]), Y(a.Mhit[1])); const p = pulseAt(run, i, Math.min(t, a.T)); ctx.lineTo(X(p.x), Y(p.y)); }
      ctx.stroke(); ctx.globalAlpha = 1;
    });
  }
  // rest-length outline (Lorentz)
  if (run.account === 'lorentz' && state.show.ghost) {
    const restRun = makeRun({ beta: run.beta, theta: run.theta, account: 'classical' });
    ctx.setLineDash([4, 4]); ctx.strokeStyle = P.ghost; ctx.lineWidth = 1.4;
    restRun.arms.forEach((a) => { ctx.beginPath(); ctx.moveTo(X(sx), Y(0)); ctx.lineTo(X(sx + a.R[0]), Y(a.R[1])); ctx.stroke(); });
    ctx.setLineDash([]);
  }
  // arms and mirrors
  run.arms.forEach((a, i) => {
    const ex = sx + a.R[0], ey = a.R[1];
    ctx.strokeStyle = P.arm; ctx.lineWidth = 3; ctx.globalAlpha = 0.35;
    ctx.beginPath(); ctx.moveTo(X(sx), Y(0)); ctx.lineTo(X(ex), Y(ey)); ctx.stroke(); ctx.globalAlpha = 1;
    const m = 0.13;
    ctx.strokeStyle = i ? P.a2 : P.a1; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(X(ex - m * a.M[0]), Y(ey - m * a.M[1])); ctx.lineTo(X(ex + m * a.M[0]), Y(ey + m * a.M[1])); ctx.stroke();
    label(`arm ${i + 1}`, X(ex) + 8, Y(ey) - 6, { color: i ? P.a2 : P.a1, size: 11 });
  });
  // splitter
  ctx.save(); ctx.translate(X(sx), Y(0)); ctx.rotate(-(run.theta + Math.PI / 4)); ctx.fillStyle = P.light; ctx.globalAlpha = 0.8;
  ctx.fillRect(-9, -2, 18, 4); ctx.restore(); ctx.globalAlpha = 1;
  // motion arrow
  if (run.v > 0) {
    const ax = X(sx) - 26, ay = Y(0) + 18;
    ctx.strokeStyle = P.muted; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(ax - 30, ay); ctx.lineTo(ax, ay); ctx.lineTo(ax - 6, ay - 4); ctx.moveTo(ax, ay); ctx.lineTo(ax - 6, ay + 4); ctx.stroke();
    label(`${fmt(run.v)} c`, ax - 34, ay + 4, { color: P.muted, size: 11, align: 'right' });
  }
  // pulses
  if (t > 0) run.arms.forEach((a, i) => { if (t < a.T) { const p = pulseAt(run, i, t); glow(X(p.x), Y(p.y), i ? P.a2 : P.a1); } });
  // arrivals
  run.arms.forEach((a, i) => {
    if (t >= a.T) {
      const age = t - a.T;
      ctx.strokeStyle = i ? P.a2 : P.a1; ctx.lineWidth = 2; ctx.globalAlpha = Math.max(0.25, 1 - age);
      ctx.beginPath(); ctx.arc(X(run.v * a.T), Y(0), 7 + 5 * i, 0, Math.PI * 2); ctx.stroke(); ctx.globalAlpha = 1;
    }
  });
  ctx.restore();

  // clocks
  const tShow = Math.max(0, t);
  let clockText;
  if (run.account === 'classical') clockText = `time ${fmt(tShow)} L/c`;
  else if (run.account === 'lorentz') clockText = `ether time ${fmt(tShow)} · apparatus clock ${fmt(tShow * run.clockRate)} L/c`;
  else clockText = `apparatus clock ${fmt(tShow)} L/c`;
  label(clockText, rect.x + 12, rect.y + 40, { color: P.text, size: 12 });

  if (state.show.curve && state.account !== 'both' && rect.w >= 560) drawCurve(rect, run, P);
}

// Delay (arm 1 − arm 2) against rotation, for the 1887 expectation and the current account.
function drawCurve(rect, run, P) {
  const w = 200, h = 122, x = rect.x + rect.w - w - 12, y = rect.y + 34;
  ctx.fillStyle = P.bg; ctx.globalAlpha = 0.85; ctx.fillRect(x, y, w, h); ctx.globalAlpha = 1;
  ctx.strokeStyle = P.frame; ctx.lineWidth = 1; ctx.strokeRect(x, y, w, h);
  const px = (deg) => x + 10 + ((w - 20) * deg) / 90;
  const dMax = Math.max(1e-6, delay(state.beta, 0, 'classical'));
  const mid = y + 34 + (h - 50) / 2;
  const py = (d) => mid - ((h - 50) / 2) * d / dMax;
  ctx.strokeStyle = P.muted; ctx.beginPath(); ctx.moveTo(px(0), py(0)); ctx.lineTo(px(90), py(0)); ctx.stroke();
  ctx.strokeStyle = P.warn; ctx.lineWidth = 1.8; ctx.setLineDash(run.account === 'classical' ? [] : [4, 3]);
  ctx.beginPath();
  for (let d = 0; d <= 90; d += 2) { const v = delay(state.beta, d * DEG, 'classical'); d ? ctx.lineTo(px(d), py(v)) : ctx.moveTo(px(d), py(v)); }
  ctx.stroke(); ctx.setLineDash([]);
  if (run.account !== 'classical') { ctx.strokeStyle = P.a1; ctx.lineWidth = 2.2; ctx.beginPath(); ctx.moveTo(px(0), py(0)); ctx.lineTo(px(90), py(0)); ctx.stroke(); }
  const cur = run.account === 'classical' ? delay(state.beta, run.theta, 'classical') : 0;
  ctx.fillStyle = P.text; ctx.beginPath(); ctx.arc(px(state.thetaDeg), py(cur), 3.5, 0, Math.PI * 2); ctx.fill();
  label('delay, arm 1 − arm 2', x + 8, y + 13, { color: P.text, size: 10.5 });
  label('0°', px(0), y + h - 4, { color: P.muted, size: 10, align: 'center' });
  label('45°', px(45), y + h - 4, { color: P.muted, size: 10, align: 'center' });
  label('90°', px(90), y + h - 4, { color: P.muted, size: 10, align: 'center' });
  label(run.account === 'classical' ? 'as expected in 1887' : 'red: 1887 · cyan: this account', x + 8, y + 27, { color: P.muted, size: 10 });
}

// ---------------------------------------------------------------- main loop
function render() {
  const P = palette();
  const ratio = devicePixelRatio || 1, W = canvas.clientWidth, H = canvas.clientHeight;
  if (W < 40 || H < 40) return;
  if (canvas.width !== Math.round(W * ratio) || canvas.height !== Math.round(H * ratio)) { canvas.width = Math.round(W * ratio); canvas.height = Math.round(H * ratio); }
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  ctx.fillStyle = P.bg; ctx.fillRect(0, 0, W, H);
  const rects = layoutRects(W, H);
  const ext = extent(runs[0]);
  const scale = Math.min(...rects.map((r) => Math.min((r.w - 40) / (ext.x1 - ext.x0), (r.h - 90) / 1.25)));
  rects.forEach((r, i) => drawPanel(r, runs[i], scale, P, i));
  updateResults();
}

function arrivalReadings() {
  // Times shown to the student: ether time for 1887, apparatus clock otherwise.
  const r = runs[0];
  const k = r.account === 'classical' ? 1 : r.clockRate;
  return { T1: r.arms[0].T * k, T2: r.arms[1].T * k, now: Math.max(0, frameTime(r, Math.min(state.s, sEnd))) * k };
}
function setResult(name, value) { const o = document.querySelector(`[data-result="${name}"]`); if (o && o.value !== value) o.value = value; }
function updateResults() {
  const { T1, T2, now } = arrivalReadings();
  setResult('time', `${fmt(now)} L/c`);
  setResult('t1', now >= T1 - 1e-9 ? `${fmt(T1)} L/c` : '—');
  setResult('t2', now >= T2 - 1e-9 ? `${fmt(T2)} L/c` : '—');
  setResult('diff', now >= Math.max(T1, T2) - 1e-9 ? `${fmt(T1 - T2, 3)} L/c` : '—');
  const r = runs[0];
  const shrink = { classical: 'none', lorentz: `× ${fmt(1 / r.gamma)}`, einstein: 'none (at rest)', both: `× ${fmt(1 / r.gamma)} / none` }[state.account];
  setResult('len', shrink);
  if (state.step === 'run') {
    let text;
    if (now <= 0) text = 'The pulse is about to reach the splitter.';
    else if (now < Math.min(T1, T2)) text = `Both halves on their way · ${$('#clockName').textContent.toLowerCase()} ${fmt(now)} L/c`;
    else if (now < Math.max(T1, T2)) text = `Arm ${T1 < T2 ? 1 : 2} back at ${fmt(Math.min(T1, T2))} L/c; arm ${T1 < T2 ? 2 : 1} still travelling.`;
    else text = Math.abs(T1 - T2) < 1e-6 ? `Both halves back together at ${fmt(T1)} L/c.` : `Arm ${T1 > T2 ? 1 : 2} back ${fmt(Math.abs(T1 - T2), 3)} L/c later.`;
    const el = $('#liveLine'); if (el.textContent !== text) el.textContent = text;
  }
}

// ---------------------------------------------------------------- verdict
function outcomeKey() {
  const d = runs[0].arms[0].T - runs[0].arms[1].T;
  if (Math.abs(d) < 1e-6) return 'together';
  return d > 0 ? 'arm1' : 'arm2';
}
function finish() {
  state.finished = true;
  const r = runs[0], g = r.gamma, key = outcomeKey();
  const { T1, T2 } = arrivalReadings();
  let text;
  if (state.account === 'classical') {
    text = key === 'together'
      ? `At ${state.thetaDeg}° the two halves happen to arrive together. Turn the apparatus and they would not: the chart shows the expected delay at each angle.`
      : `Arm ${key === 'arm1' ? 1 : 2} is ${fmt(Math.abs(T1 - T2), 3)} L/c late. Turning the apparatus should change this delay (see the chart), and the fringes should move as it turns. Michelson and Morley looked for that and found no such shift, at any angle.`;
  } else if (state.account === 'lorentz') {
    const shape = state.thetaDeg === 0
      ? `The arm along the motion is ${fmt(1 / g)} L, not 1, which exactly makes up for its slower round trip.`
      : `Every length along the motion is shortened by ${fmt(1 / g)}, so the arms are no longer at right angles in this frame; the round trips still match exactly.`;
    text = `Together, at ${fmt(r.arms[0].T)} L/c of ether time. ${shape} The apparatus clock runs slow and reads ${fmt(T1)} L/c, the same as in Einstein’s account. Try any angle or speed: always together.`;
  } else if (state.account === 'einstein') {
    text = `Together, at ${fmt(T1)} L/c. In the apparatus’s own frame both arms are L and light goes at c out and back. There is nothing to explain. Try any angle or speed: always together.`;
  } else {
    text = `Same outcome, same clock readings: both halves back at ${fmt(T1)} L/c on the apparatus clock, in both panels. The accounts differ on what is happening, not on what is seen.`
      + '<div class="trade"><div><h3>Lorentz</h3><p><b>Keeps:</b> an ether and a single true rest frame.</p><p><b>Adds:</b> moving bodies shorten and their clocks slow, because their internal forces change.</p><p><b>Owes:</b> a reason why the ether’s rest frame can never be detected.</p></div>'
      + '<div><h3>Einstein</h3><p><b>Keeps:</b> the principle that uniform motion cannot be detected, now extended to light.</p><p><b>Adds:</b> light moves at c for every observer; lengths and times depend on the frame.</p><p><b>Owes:</b> a physical account of why rods and clocks obey the principles.</p></div></div>';
  }
  let lead = '';
  if (state.prediction) {
    const right = state.prediction === key;
    lead = `<strong>${right ? 'Your prediction was right.' : 'Not what you predicted.'}</strong> `;
  }
  $('#verdict').innerHTML = lead + text;
  const next = {
    classical: [['lorentz', 'Lorentz’s answer'], ['einstein', 'Einstein’s answer'], ['again', 'Run again']],
    lorentz: [['both', 'Compare with Einstein'], ['classical', 'Back to 1887'], ['again', 'Run again']],
    einstein: [['both', 'Compare with Lorentz'], ['classical', 'Back to 1887'], ['again', 'Run again']],
    both: [['classical', 'Back to 1887'], ['again', 'Run again']],
  }[state.account];
  $('#nextSteps').innerHTML = next.map(([k, l]) => `<button type="button" class="qontic-app-toggle" data-next="${k}">${l}</button>`).join('');
  showStep('verdict');
}
$('#nextSteps').addEventListener('click', (e) => {
  const k = e.target.closest('[data-next]')?.dataset.next;
  if (!k) return;
  if (k === 'again') { state.s = S0; state.finished = false; start(); return; }
  setAccount(k);
});

let last = performance.now();
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  if (state.running) {
    if (state.step !== 'run') showStep('run');
    const rate = (sEnd + HOLD - S0) / 9; // a run takes about 9 s at speed 1
    state.s += dt * rate * state.speed;
    if (state.s >= sEnd + HOLD) {
      state.s = sEnd + HOLD;
      if (state.autoRun) { finish(); state.s = S0; state.finished = false; }
      else { stop(); finish(); }
    }
  }
  try { render(); } catch (err) { console.error(err); }
  requestAnimationFrame(frame);
}

mountQonticMedia({
  stage: $('.visualization'),
  controls: controlsEl,
  getCanvases: () => [canvas],
  filename: 'michelson-morley',
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
syncControls();
resetRun();
requestAnimationFrame(frame);
