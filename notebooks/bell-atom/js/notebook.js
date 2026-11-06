import { mountQonticNotebook } from '../../../shared/qontic-notebook.js?v=1.0';
import { BellAtom, steadyOrbit, toPrimed, movingChargeField, gammaOf } from './physics.js?v=0.2.1';

mountQonticNotebook({
  title: "Bell's atom: why moving things contract",
  eyebrow: 'Q-Ontic · Relativity',
  purpose: "John Bell's “longer road” to special relativity: in one frame, a moving atom contracts and its clock slows because of the forces that hold it together.",
  version: "Bell's atom notebook · Version 0.2.1 · 2026-11-06",
});

const $ = (s) => document.querySelector(s);
const fmt = (x, d = 2) => (Math.abs(x) < 0.5 * 10 ** -d ? 0 : x).toFixed(d);
const COLORS = { ink: '#cfe3f5', muted: '#7f97ad', grid: '#15283c', cyan: '#4fc3ff', gold: '#ffd24d', orange: '#ff9966', green: '#54e0a0', red: '#ff6b6b', white: '#f1f5f9' };

// Size a canvas to its CSS box; returns a 2D context in CSS pixels, or null if hidden.
function prepare(canvas) {
  const w = canvas.clientWidth, h = canvas.clientHeight, r = devicePixelRatio || 1;
  if (w < 20 || h < 20) return null;
  if (canvas.width !== Math.round(w * r) || canvas.height !== Math.round(h * r)) { canvas.width = Math.round(w * r); canvas.height = Math.round(h * r); }
  const ctx = canvas.getContext('2d');
  ctx.setTransform(r, 0, 0, r, 0, 0);
  ctx.clearRect(0, 0, w, h);
  return { ctx, w, h };
}
function text(ctx, s, x, y, { color = COLORS.ink, size = 12, align = 'left', weight = 400 } = {}) {
  ctx.font = `${weight} ${size}px Inter, Arial, sans-serif`; ctx.fillStyle = color; ctx.textAlign = align; ctx.textBaseline = 'alphabetic'; ctx.fillText(s, x, y);
}
function arrow(ctx, x0, y0, x1, y1, color, width = 1.5, head = 6) {
  const a = Math.atan2(y1 - y0, x1 - x0);
  ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = width;
  ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x1 - head * Math.cos(a - 0.4), y1 - head * Math.sin(a - 0.4)); ctx.lineTo(x1 - head * Math.cos(a + 0.4), y1 - head * Math.sin(a + 0.4)); ctx.closePath(); ctx.fill();
}
function motionArrow(ctx, x, y, label = 'direction of motion') {
  arrow(ctx, x, y, x + 60, y, COLORS.muted, 1.4);
  text(ctx, label, x + 68, y + 4, { color: COLORS.muted, size: 11 });
}
// Run a draw function while its canvas is on screen.
function whenVisible(el, onChange) {
  if (!('IntersectionObserver' in window)) { onChange(true); return; }
  new IntersectionObserver((entries) => entries.forEach((e) => onChange(e.isIntersecting)), { threshold: 0.05 }).observe(el);
}

// ------------------------------------------------------------- challenges and progress
// Challenges (and quizzes answered correctly) are ticked off and remembered in
// this browser only; the page works the same if storage is unavailable.
const STORE = 'qontic-bell-atom-progress';
let solved = {};
try { solved = JSON.parse(localStorage.getItem(STORE) || '{}') || {}; } catch (e) { solved = {}; }
const allTasks = () => [...document.querySelectorAll('li[data-challenge]'), ...document.querySelectorAll('[data-quiz][data-challenge]')];
function showProgress() {
  const tasks = allTasks(), n = tasks.filter((t) => solved[t.dataset.challenge]).length;
  const el = $('#progress');
  if (el) el.textContent = `Challenges and questions completed: ${n} of ${tasks.length}` + (n ? '' : ' · they are in sections 3 to 7');
}
function solve(id, values = {}) {
  const li = document.querySelector(`li[data-challenge="${id}"]`);
  if (li) {
    const msg = li.querySelector('.done-msg');
    if (msg) {
      Object.entries(values).forEach(([, v]) => { const span = msg.querySelector('[data-val]'); if (span) span.textContent = v; });
      msg.hidden = false;
    }
    li.classList.add('done');
  }
  if (!solved[id]) { solved[id] = 1; try { localStorage.setItem(STORE, JSON.stringify(solved)); } catch (e) { /* ignore */ } }
  showProgress();
}
document.querySelectorAll('li[data-challenge]').forEach((li) => { if (solved[li.dataset.challenge]) { li.classList.add('done'); const m = li.querySelector('.done-msg'); if (m) m.hidden = false; } });

// ------------------------------------------------------------- quizzes
// The shared notebook template marks answers and shows feedback; a correct
// answer to a question that is also a challenge counts toward progress.
document.addEventListener('qontic:quiz', (e) => {
  const q = e.detail.quiz;
  if (e.detail.correct && q.dataset.challenge) solve(q.dataset.challenge);
});
showProgress();

// ------------------------------------------------------------- 2. field of a moving charge
(() => {
  const canvas = $('#fieldCanvas'), slider = $('#fieldV');
  function draw() {
    const c = prepare(canvas); if (!c) return;
    const { ctx, w, h } = c, V = +slider.value, g = gammaOf(V);
    const cx = w / 2, cy = h / 2, R = Math.min(w, h) * 0.44;
    // equal-potential rings (x vertical on screen, z horizontal = motion)
    for (const k of [0.25, 0.5, 0.75, 1]) {
      ctx.strokeStyle = 'rgba(255,210,77,0.55)'; ctx.lineWidth = 1.3;
      ctx.beginPath(); ctx.ellipse(cx, cy, (k * R) / g, k * R, 0, 0, Math.PI * 2); ctx.stroke();
      if (V === 0) { ctx.setLineDash([3, 4]); }
      ctx.setLineDash([]);
    }
    // rest-frame circle for comparison
    ctx.strokeStyle = 'rgba(207,227,245,0.18)'; ctx.setLineDash([4, 4]);
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
    // field arrows: radial, length set by field strength relative to a charge at rest
    for (const rr of [0.42, 0.7]) {
      for (let i = 0; i < 24; i++) {
        const th = (i / 24) * Math.PI * 2, z = rr * Math.cos(th), x = rr * Math.sin(th);
        const f = movingChargeField(x, z, V, 1), rest = 1 / (rr * rr);
        const ratio = Math.hypot(f.Ex, f.Ez) / rest;
        const len = 0.11 * R * Math.min(Math.pow(ratio, 0.5), 2.6);
        const px = cx + z * R, py = cy - x * R;
        const ux = Math.cos(th), uy = -Math.sin(th);
        ctx.globalAlpha = Math.min(1, 0.35 + 0.4 * ratio);
        arrow(ctx, px, py, px + ux * len, py + uy * len, COLORS.cyan, 1.4, 5);
        ctx.globalAlpha = 1;
      }
    }
    ctx.fillStyle = COLORS.orange; ctx.beginPath(); ctx.arc(cx, cy, 6, 0, Math.PI * 2); ctx.fill();
    text(ctx, '+', cx, cy + 4, { color: '#071020', size: 11, align: 'center', weight: 700 });
    text(ctx, 'rings: equal potential · arrows: electric field · dashed: the ring at rest', 12, 20, { color: COLORS.muted, size: 11.5 });
    motionArrow(ctx, 12, h - 16);
    $('#fieldVOut').value = `${fmt(V)} c`;
    $('#fieldGamma').value = fmt(g);
    $('#fieldRatio').value = fmt(1 / g);
    $('#fieldSide').value = fmt(g ** 3);
  }
  slider.addEventListener('input', draw);
  addEventListener('resize', draw);
  whenVisible(canvas, (v) => v && draw());
})();

// ------------------------------------------------------------- 3. Bell's atom
(() => {
  const canvas = $('#atomCanvas');
  const ui = { V: $('#atomV'), ramp: $('#atomRamp'), speed: $('#atomSpeed'), push: $('#atomPush'), play: $('#atomPlay'),
    flat: $('#ingFlat'), mag: $('#ingMag'), rel: $('#ingRel') };
  const allIn = () => ui.flat.checked && ui.mag.checked && ui.rel.checked;
  let atom, trail, playing = false, visible = false, finished = false;
  function restart() {
    atom = new BellAtom({ Vf: +ui.V.value, rampOrbits: +ui.ramp.value, pushElectron: ui.push.checked,
      flatField: ui.flat.checked, magnetic: ui.mag.checked, relInertia: ui.rel.checked });
    atom.cfg = { Vf: +ui.V.value, push: ui.push.checked, flat: ui.flat.checked, mag: ui.mag.checked, rel: ui.rel.checked };
    trail = [];
    finished = false;
    $('#atomVOut').value = `${fmt(+ui.V.value)} c`;
    $('#atomRampOut').value = `${ui.ramp.value} orbits`;
    draw();
  }
  function setPlaying(p) { playing = p; ui.play.textContent = p ? 'Pause' : (finished ? 'Replay' : 'Play'); }
  ui.play.addEventListener('click', () => { if (finished) restart(); setPlaying(!playing); });
  $('#atomRestart').addEventListener('click', () => { restart(); setPlaying(true); });
  [ui.V, ui.ramp, ui.push, ui.flat, ui.mag, ui.rel].forEach((el) => el.addEventListener('input', () => { restart(); }));
  ui.speed.addEventListener('input', () => { $('#atomSpeedOut').value = `${ui.speed.value}×`; });

  function draw() {
    const c = prepare(canvas); if (!c) return;
    const { ctx, w, h } = c;
    const { x, z, V } = atom.rel, g = gammaOf(V);
    const narrow = w < 560;
    const cx = w / 2, cy = h / 2 - (narrow ? 2 : 8), R = Math.min(w * 0.3, h * 0.33) * (allIn() ? 1 : 0.62);
    // reference: rest orbit and the ellipse expected at the current speed
    ctx.setLineDash([4, 4]); ctx.lineWidth = 1.2;
    ctx.strokeStyle = 'rgba(207,227,245,0.25)'; ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = 'rgba(84,224,160,0.6)'; ctx.beginPath(); ctx.ellipse(cx, cy, R / g, R, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.setLineDash([]);
    // trail, kept clear of the caption and the speed bar
    const top = narrow ? 44 : 28;
    ctx.save(); ctx.beginPath(); ctx.rect(0, top, w, h - top - 56); ctx.clip();
    ctx.lineWidth = 2;
    for (let i = 1; i < trail.length; i++) {
      ctx.strokeStyle = `rgba(79,195,255,${(i / trail.length) * 0.95})`;
      ctx.beginPath(); ctx.moveTo(cx + trail[i - 1][1] * R, cy - trail[i - 1][0] * R); ctx.lineTo(cx + trail[i][1] * R, cy - trail[i][0] * R); ctx.stroke();
    }
    ctx.fillStyle = COLORS.orange; ctx.beginPath(); ctx.arc(cx, cy, 7, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = COLORS.cyan; ctx.beginPath(); ctx.arc(cx + z * R, cy - x * R, 5, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    if (narrow) {
      text(ctx, 'orbit drawn around the nucleus', 12, 20, { color: COLORS.muted, size: 11.5 });
      text(ctx, 'dashed grey: at rest · dashed green: expected', 12, 36, { color: COLORS.muted, size: 11.5 });
    } else {
      text(ctx, 'orbit drawn around the nucleus · dashed grey: orbit at rest · dashed green: expected at this speed', 12, 20, { color: COLORS.muted, size: 11.5 });
    }
    // speed bar, scaled from 0 to c
    const bw = Math.min(260, w * 0.45), bx = w - bw - 14, by = h - 26;
    ctx.fillStyle = COLORS.grid; ctx.fillRect(bx, by, bw, 7);
    ctx.fillStyle = COLORS.gold; ctx.fillRect(bx, by, bw * V, 7);
    text(ctx, '0', bx, by + 18, { color: COLORS.muted, size: 10.5, align: 'left' });
    text(ctx, 'c', bx + bw, by + 18, { color: COLORS.muted, size: 10.5, align: 'right' });
    text(ctx, `nucleus speed ${fmt(V)} c · γ = ${fmt(g)}`, bx + bw, by - 6, { color: COLORS.ink, size: 12, align: 'right' });
    const done = atom.t > atom.prog.Tacc;
    const status = atom.lost ? 'stopped: electron lost' : done ? 'push finished: coasting' : V < 0.005 ? 'push starting…' : 'being pushed…';
    text(ctx, status, bx + bw, by - 24, { color: atom.lost ? COLORS.red : done ? COLORS.green : COLORS.gold, size: 12, align: 'right' });
    motionArrow(ctx, 12, h - (narrow ? 44 : 16), narrow ? 'motion' : 'direction of motion');
    const off = [!atom.cfg.flat && 'flattened field', !atom.cfg.mag && 'magnetic force', !atom.cfg.rel && 'Lorentz momentum'].filter(Boolean);
    if (off.length) text(ctx, `switched off: ${off.join(', ')}`, 12, narrow ? 54 : 38, { color: COLORS.gold, size: 11.5 });
    const msgEl = $('#atomMsg');
    if (atom.lost) {
      const why = !atom.cfg.push ? 'with only the nucleus pushed' : `without the ${off.join(' and the ')}`;
      msgEl.textContent = `Stopped after ${fmt(atom.lost.t / atom.T0, 0)} orbits: ${why}, the orbit became so eccentric that the electron passed through the region of the nucleus, where this model breaks down.` + (!atom.cfg.push ? ' See “How the push is applied” below.' : '');
      msgEl.hidden = false;
    } else msgEl.hidden = true;
    // readouts: measured over the last complete revolution (in units of the
    // rest diameter), compared with Bell's values at the speed the nucleus had
    // during that revolution
    $('#atomVnow').value = `${fmt(V)} c`;
    const L = atom.lost ? null : atom.last, gl = gammaOf(L ? L.V : V);
    $('#atomLen').value = L ? fmt(L.length / 2, 3) : '—';
    $('#atomLenExp').value = fmt(1 / gl, 3);
    $('#atomWid').value = L ? fmt(L.width / 2, 3) : '—';
    $('#atomWidExp').value = '1.000';
    $('#atomPeriod').value = L ? fmt(L.period / atom.T0, 2) : '—';
    $('#atomPeriodExp').value = fmt(gl, 2);
    const good = (a, b) => L && Math.abs(a - b) < 0.02 * b;
    ['atomLen', 'atomWid', 'atomPeriod'].forEach((id, i) => {
      const ok = L && good([L.length / 2, L.width / 2, L.period / atom.T0][i], [1 / gl, 1, gl][i]);
      $('#' + id).classList.toggle('hl', !!ok); $('#' + id).classList.toggle('bad', !!L && !ok);
    });
  }
  // challenges, checked when a run ends
  function checkChallenges() {
    const c = atom.cfg, L = atom.last;
    const all = c.flat && c.mag && c.rel && c.push;
    if (all && Math.abs(c.Vf - 0.6) < 1e-6 && L && !atom.lost) solve('c-predict', { v: `${fmt(L.length / 2, 3)} of the rest length` });
    if (!c.flat && !c.mag && !c.rel && c.push && L && !atom.lost && Math.abs(L.length / 2 - 1) < 0.02) solve('c-galileo', { v: fmt(L.length / 2, 3) });
    if (c.flat && !c.mag && c.rel && c.push && c.Vf >= 0.6) solve('c-magnetic');
    if (c.flat && !c.mag && !c.rel && c.push && Math.abs(c.Vf - 0.8) < 1e-6 && L && !atom.lost) solve('c-fake', { v: fmt(L.width / 2, 2) });
  }

  let last = performance.now();
  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    if (playing && visible) {
      const steps = Math.max(1, Math.round(2400 * dt * +ui.speed.value)); // 2400 steps/s = 8 orbits/s at speed 1
      for (let i = 0; i < steps; i++) {
        atom.step(1);
        trail.push([atom.s[0], atom.s[1] - atom.prog.z(atom.t)]);
      }
      const keep = Math.round(1.15 * 300 * gammaOf(atom.rel.V));
      if (trail.length > keep) trail.splice(0, trail.length - keep);
      if (!finished && (atom.lost || atom.t > atom.prog.Tacc + 6 * atom.T0 * gammaOf(atom.prog.Vf))) { finished = true; setPlaying(false); checkChallenges(); }
    }
    if (visible) draw();
    requestAnimationFrame(frame);
  }
  restart();
  whenVisible(canvas, (v) => { visible = v; if (v && !playing && atom.t === 0) setPlaying(true); });
  requestAnimationFrame(frame);
})();

// ------------------------------------------------------------- 4. atoms to thread
(() => {
  const canvas = $('#threadCanvas'), sV = $('#threadV'), sE = $('#threadEps'), strong = $('#threadStrong');
  function spring(ctx, x0, x1, y, coils, color, width = 1.4, amp = 5) {
    const n = coils * 2, len = x1 - x0;
    ctx.strokeStyle = color; ctx.lineWidth = width; ctx.beginPath(); ctx.moveTo(x0, y);
    for (let i = 1; i < n; i++) ctx.lineTo(x0 + (len * i) / n, y + (i % 2 ? -amp : amp));
    ctx.lineTo(x1, y); ctx.stroke();
  }
  function ship(ctx, xAttach, y, len, h, color, rear) {
    const x0 = rear ? xAttach - len : xAttach, x1 = x0 + len, nose = Math.min(len * 0.35, h);
    ctx.fillStyle = '#1a3242'; ctx.strokeStyle = color; ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.moveTo(x0, y - h / 2); ctx.lineTo(x1 - nose, y - h / 2); ctx.quadraticCurveTo(x1, y - h * 0.35, x1, y);
    ctx.quadraticCurveTo(x1, y + h * 0.35, x1 - nose, y + h / 2); ctx.lineTo(x0, y + h / 2); ctx.closePath(); ctx.fill(); ctx.stroke();
  }
  function draw() {
    const c = prepare(canvas); if (!c) return;
    const { ctx, w, h } = c;
    const V = +sV.value, g = gammaOf(V), eps = +sE.value / 100, isStrong = strong.checked;
    const S = w * 0.6, y = h * 0.52, N = w < 500 ? 5 : 7;
    const gap = isStrong ? 1 / g : 1;
    const natural = 1 / g, stretch = gap / natural - 1, broken = !isStrong && stretch > eps;
    const xc = w / 2, xa = xc - (gap * S) / 2, xb = xc + (gap * S) / 2;
    const shipLen = (0.17 * S) / g, shipH = Math.min(46, h * 0.18);
    ship(ctx, xa, y, shipLen, shipH, COLORS.cyan, true);
    ship(ctx, xb, y, shipLen, shipH, COLORS.orange, false);
    text(ctx, 'B', xa - shipLen / 2, y - shipH / 2 - 8, { color: COLORS.cyan, size: 12, align: 'center', weight: 600 });
    text(ctx, 'C', xb + shipLen / 2, y - shipH / 2 - 8, { color: COLORS.orange, size: 12, align: 'center', weight: 600 });
    // natural-length bracket from B
    const by = y - shipH / 2 - 26;
    ctx.strokeStyle = COLORS.muted; ctx.setLineDash([3, 3]); ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(xa, by + 5); ctx.lineTo(xa, by); ctx.lineTo(xa + natural * S, by); ctx.lineTo(xa + natural * S, by + 5); ctx.stroke(); ctx.setLineDash([]);
    text(ctx, `natural length ${fmt(natural)} L`, xa + (natural * S) / 2, by - 4, { color: COLORS.muted, size: 11, align: 'center' });
    // chain: atoms at natural spacing if relaxed; bonds stretched across the gap
    const r = Math.min((S / 7) * 0.24, h * 0.14);
    const cell = (natural * S) / N;
    let positions;
    // equal springs: N atoms of width 2r/gamma and N + 1 springs fill the gap
    const sp = (gap * S - (N * 2 * r) / g) / (N + 1);
    if (!broken) positions = Array.from({ length: N }, (_, i) => xa + (i + 1) * sp + ((2 * i + 1) * r) / g);
    else {
      const left = Math.ceil(N / 2), right = N - left;
      positions = [...Array.from({ length: left }, (_, i) => xa + (i + 0.5) * cell), ...Array.from({ length: right }, (_, i) => xb - (right - i - 0.5) * cell)];
    }
    const pts = [xa, ...positions, xb];
    const color = broken ? COLORS.muted : stretch > eps * 0.6 ? COLORS.gold : COLORS.ink;
    for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[i] + (i === 0 ? 0 : r / g), b = pts[i + 1] - (i === pts.length - 2 ? 0 : r / g);
      if (broken && i === Math.ceil(N / 2)) continue;
      spring(ctx, a, b, y, 4, color, 1.4, isStrong || broken ? 5 : 5 / (1 + 4 * Math.max(0, stretch)));
    }
    positions.forEach((px) => {
      ctx.strokeStyle = COLORS.cyan; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.ellipse(px, y, r / g, r, 0, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = COLORS.orange; ctx.beginPath(); ctx.arc(px, y, 2.6, 0, Math.PI * 2); ctx.fill();
    });
    if (broken) text(ctx, 'snapped', xc, y + r + 22, { color: COLORS.red, size: 13, align: 'center', weight: 700 });
    text(ctx, isStrong ? 'strong thread: it pulls the light ships together' : 'massive ships: the engines hold the gap at L', 12, 20, { color: COLORS.muted, size: 11.5 });
    text(ctx, 'springs: white relaxed · gold near snapping · grey snapped', 12, 37, { color: COLORS.muted, size: 11 });
    motionArrow(ctx, 12, h - 14);
    $('#threadVOut').value = `${fmt(V)} c`;
    $('#threadEpsOut').value = isStrong ? 'not used' : `${sE.value}%`;
    $('#threadGap').value = `${fmt(gap)} L`;
    $('#threadNat').value = `${fmt(natural)} L`;
    const out = $('#threadStretch');
    out.value = broken ? `${(stretch * 100).toFixed(1)}%: snapped` : `${(Math.max(0, stretch) * 100).toFixed(1)}%`;
    out.style.color = broken ? '#b91c1c' : '';
    sE.disabled = isStrong;
    if (broken && Math.abs(eps - 0.2) < 1e-6 && V <= 0.56 + 1e-9) solve('c-snap20');
    if (broken && Math.abs(eps - 0.5) < 1e-6 && V <= 0.75 + 1e-9) solve('c-snap50');
    sE.closest('.row').style.opacity = isStrong ? 0.45 : '';
  }
  [sV, sE, strong].forEach((el) => el.addEventListener('input', draw));
  addEventListener('resize', draw);
  whenVisible(canvas, (v) => v && draw());
})();

// ------------------------------------------------------------- 5. the moving observer
(() => {
  const canvas = $('#observerCanvas'), sV = $('#obsV'), play = $('#obsPlay');
  let data = null, playing = true, visible = false, clock = 0;
  function compute() {
    const V = +sV.value;
    const o = steadyOrbit({ Vf: V, rampOrbits: 80, revolutions: 3 });
    const g = o.gamma, nucPrime = g * o.c0;
    const lab = o.events.map((e) => ({ t: e.t, x: e.x, z: e.z - (o.c0 + V * e.t) }));
    const prime = o.events.map((e) => { const p = toPrimed(e, V); return { t: p.t, x: p.x, z: p.z - nucPrime }; });
    const extent = (arr) => {
      let zmin = Infinity, zmax = -Infinity, xmin = Infinity, xmax = -Infinity;
      arr.forEach((p) => { zmin = Math.min(zmin, p.z); zmax = Math.max(zmax, p.z); xmin = Math.min(xmin, p.x); xmax = Math.max(xmax, p.x); });
      return (zmax - zmin) / (xmax - xmin);
    };
    const period = (arr) => {
      const cr = [];
      for (let i = 1; i < arr.length; i++) if (arr[i - 1].x < 0 && arr[i].x >= 0) cr.push(arr[i].t);
      return cr.length > 1 ? (cr[cr.length - 1] - cr[0]) / (cr.length - 1) : NaN;
    };
    // One parameter drives both pictures: tau, the time on her clock, which
    // travels with the nucleus (z = c0 + V t, so t' = t/gamma - gamma V c0 there).
    // The left picture shows A's time t at which her clock reads tau; the right
    // shows her time t' = tau. Both then show (nearly) the same electron event.
    const tOf = (tau) => g * (tau + g * V * o.c0);
    const tauOf = (t) => t / g - g * V * o.c0;
    const tau0 = Math.max(prime[0].t, tauOf(lab[0].t)), tau1 = Math.min(prime[prime.length - 1].t, tauOf(lab[lab.length - 1].t));
    data = { V, g, lab, prime, T0: o.T0, tOf, tau0, tau1, ratioLab: extent(lab), ratioPrime: extent(prime), perLab: period(lab) / o.T0, perPrime: period(prime) / o.T0 };
    $('#obsVOut').value = `${fmt(V)} c`;
    $('#obsRatioLab').value = fmt(data.ratioLab, 3);
    $('#obsRatioPrime').value = fmt(data.ratioPrime, 3);
    $('#obsPerLab').value = fmt(data.perLab, 2);
    $('#obsPerPrime').value = fmt(data.perPrime, 2);
    clock = 0;
  }
  // index of the sample whose time is closest to t (arrays sorted by time)
  const at = (arr, t) => { let lo = 0, hi = arr.length - 1; while (hi - lo > 1) { const m = (lo + hi) >> 1; if (arr[m].t < t) lo = m; else hi = m; } return hi; };
  function panel(ctx, x0, w, h, title, arr, t, rulerLen, clockLabels, reserve = 0) {
    const top = 18 * 2 + 30, avail = h - top - reserve - 46; // same scale in both panels
    const R = Math.min(w * 0.36, avail / 2), cx = x0 + w / 2, cy = top + avail / 2;
    ctx.strokeStyle = 'rgba(207,227,245,0.18)'; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
    const i1 = at(arr, t), span = Math.round(arr.length / 3.2);
    ctx.lineWidth = 2;
    for (let i = Math.max(1, i1 - span); i <= i1; i++) {
      ctx.strokeStyle = `rgba(79,195,255,${0.15 + 0.8 * (1 - (i1 - i) / span)})`;
      ctx.beginPath(); ctx.moveTo(cx + arr[i - 1].z * R, cy - arr[i - 1].x * R); ctx.lineTo(cx + arr[i].z * R, cy - arr[i].x * R); ctx.stroke();
    }
    ctx.fillStyle = COLORS.orange; ctx.beginPath(); ctx.arc(cx, cy, 6, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = COLORS.cyan; ctx.beginPath(); ctx.arc(cx + arr[i1].z * R, cy - arr[i1].x * R, 5, 0, Math.PI * 2); ctx.fill();
    // her ruler: proper length 2 (the rest diameter)
    const ry = cy + R + 26;
    ctx.strokeStyle = COLORS.white; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(cx - rulerLen * R, ry); ctx.lineTo(cx + rulerLen * R, ry); ctx.stroke();
    text(ctx, 'her ruler', cx, ry + 16, { color: COLORS.muted, size: 11, align: 'center' });
    text(ctx, title, x0 + 12, 22, { color: COLORS.ink, size: 13, weight: 600 });
    clockLabels.forEach((l, i) => text(ctx, l, x0 + 12, 40 + 17 * i, { color: i ? COLORS.muted : COLORS.gold, size: 12 }));
  }
  function draw() {
    const c = prepare(canvas); if (!c || !data) return;
    const { ctx, w, h } = c;
    const wide = w > 560;
    const { lab, prime, g, T0, tOf, tau0, tau1 } = data;
    const tau = tau0 + (clock % (tau1 - tau0));
    const tl = tOf(tau), tp = tau;
    const herClock = `${fmt((tau - tau0) / T0, 2)} rest periods`;
    const labLabels = [`A's clock: ${fmt((tl - tOf(tau0)) / T0, 2)} rest periods`, `her clock (on the atom): ${herClock}`];
    const herLabels = [`her clock: ${herClock}`];
    if (wide) {
      panel(ctx, 0, w / 2, h, "A's variables (x, z, t)", lab, tl, 1 / g, labLabels, 26);
      panel(ctx, w / 2, w / 2, h, "Her variables (x′, z′, t′)", prime, tp, 1, herLabels, 26);
      ctx.strokeStyle = COLORS.grid; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(w / 2, 10); ctx.lineTo(w / 2, h - 10); ctx.stroke();
    } else {
      ctx.save();
      panel(ctx, 0, w, h / 2, "A's variables (x, z, t)", lab, tl, 1 / g, labLabels);
      ctx.translate(0, h / 2);
      panel(ctx, 0, w, h / 2, "Her variables (x′, z′, t′)", prime, tp, 1, herLabels, 22);
      ctx.restore();
    }
    motionArrow(ctx, 12, h - 12, 'atom moves this way (in A’s frame)');
  }
  let last = performance.now();
  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    if (playing && visible && data) clock += dt * data.T0 * 0.7; // 0.7 rest periods per second
    if (visible) draw();
    requestAnimationFrame(frame);
  }
  play.addEventListener('click', () => { playing = !playing; play.textContent = playing ? 'Pause' : 'Play'; });
  sV.addEventListener('input', compute);
  whenVisible(canvas, (v) => { visible = v; if (v && !data) compute(); });
  requestAnimationFrame(frame);
})();
