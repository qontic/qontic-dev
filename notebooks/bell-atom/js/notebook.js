import { mountQonticNotebook } from '../../../shared/qontic-notebook.js?v=1.2';
import { orbitAtSpeed, steadyOrbit, toPrimed, movingChargeField, gammaOf } from './physics.js?v=0.3.0';

mountQonticNotebook({
  title: "Bell's atom: why moving things contract",
  eyebrow: 'Q-Ontic · Relativity',
  purpose: "John Bell's “longer road” to special relativity: in one frame, a moving atom contracts and its clock slows because of the forces that hold it together.",
  version: "Bell's atom notebook · Version 0.3.0 · 2026-11-06",
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
// The reader chooses the speed; the orbit at that speed is computed by
// pushing the atom gently from rest (orbitAtSpeed) and then animated, next to
// the same atom at rest (grey). Results are cached per speed and ingredients.
(() => {
  const canvas = $('#atomCanvas');
  const ui = { V: $('#atomV'), play: $('#atomPlay'), flat: $('#ingFlat'), mag: $('#ingMag'), rel: $('#ingRel') };
  const cache = new Map();
  let data = null, cfg = null, playing = true, visible = false, clock = 0, zoom = 1, pending = 0;

  function config() { return { Vf: +ui.V.value, flat: ui.flat.checked, mag: ui.mag.checked, rel: ui.rel.checked }; }
  function compute() {
    cfg = config();
    const key = `${cfg.Vf}|${+cfg.flat}${+cfg.mag}${+cfg.rel}`;
    if (!cache.has(key)) cache.set(key, orbitAtSpeed({ Vf: cfg.Vf, flatField: cfg.flat, magnetic: cfg.mag, relInertia: cfg.rel }));
    data = cache.get(key);
    clock = 0;
    readouts(); checkChallenges();
  }
  function schedule() {
    const g = gammaOf(+ui.V.value);
    $('#atomVOut').value = `${fmt(+ui.V.value)} c`;
    $('#atomGamma').textContent = `γ = ${fmt(g)}`;
    cancelAnimationFrame(pending);
    pending = requestAnimationFrame(() => setTimeout(compute, 0));
  }
  [ui.V, ui.flat, ui.mag, ui.rel].forEach((el) => el.addEventListener('input', schedule));
  ui.play.addEventListener('click', () => { playing = !playing; ui.play.textContent = playing ? 'Pause' : 'Play'; });

  function offList(c) { return [!c.flat && 'flattened field', !c.mag && 'magnetic force', !c.rel && 'Lorentz momentum'].filter(Boolean); }
  function readouts() {
    const g = gammaOf(cfg.Vf), ok = (a, b) => Math.abs(a - b) < 0.02 * b;
    $('#atomLenExp').value = fmt(1 / g, 3); $('#atomWidExp').value = '1.000'; $('#atomPeriodExp').value = fmt(g, 2);
    const msg = $('#atomMsg');
    if (data.lost) {
      ['atomLen', 'atomWid', 'atomPeriod'].forEach((id) => { $('#' + id).value = '—'; $('#' + id).classList.remove('hl', 'bad'); });
      msg.textContent = `The atom falls apart during the push: without the ${offList(cfg).join(' and the ')}, the orbit grows more and more eccentric until the electron falls into the nucleus, at ${fmt(data.lost.V)} c.`;
      msg.hidden = false; return;
    }
    msg.hidden = true;
    [['atomLen', data.length, 1 / g, 3], ['atomWid', data.width, 1, 3], ['atomPeriod', data.period, g, 2]].forEach(([id, v, e, d]) => {
      const el = $('#' + id); el.value = fmt(v, d); el.classList.toggle('hl', ok(v, e)); el.classList.toggle('bad', !ok(v, e));
    });
  }
  function checkChallenges() {
    const c = cfg, all = c.flat && c.mag && c.rel;
    if (all && Math.abs(c.Vf - 0.6) < 1e-6 && !data.lost) solve('c-predict', { v: `${fmt(data.length, 3)} of the rest length` });
    if (!c.flat && !c.mag && !c.rel && c.Vf > 0 && !data.lost) solve('c-galileo', { v: fmt(data.length, 3) });
    if (c.flat && !c.mag && c.rel && c.Vf >= 0.6) solve('c-magnetic');
    if (c.flat && !c.mag && !c.rel && Math.abs(c.Vf - 0.8) < 1e-6 && !data.lost) solve('c-fake', { v: fmt(data.width, 2) });
  }

  function draw() {
    const c = prepare(canvas); if (!c || !data) return;
    const { ctx, w, h } = c, narrow = w < 560, g = gammaOf(cfg.Vf);
    const path = data.path;
    // scale: rest orbit fills the view unless the orbit is larger
    let extent = 1;
    for (let i = 0; i < path.length; i += 3) extent = Math.max(extent, Math.abs(path[i].x), Math.abs(path[i].z));
    const R0 = Math.min(w * 0.3, h * 0.34), room = Math.min(w / 2 - 16, h / 2 - 48);
    zoom = Math.min(1, room / (R0 * extent));
    const R = R0 * zoom, cx = w / 2, cy = h / 2 + (narrow ? 6 : 4);
    const P = (x, z) => [cx + z * R, cy - x * R];
    // rest orbit and Bell's ellipse
    ctx.setLineDash([4, 4]); ctx.lineWidth = 1.2;
    ctx.strokeStyle = 'rgba(207,227,245,0.3)'; ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.stroke();
    if (cfg.Vf > 0) { ctx.strokeStyle = 'rgba(84,224,160,0.65)'; ctx.beginPath(); ctx.ellipse(cx, cy, R / g, R, 0, 0, Math.PI * 2); ctx.stroke(); }
    ctx.setLineDash([]);
    // the moving atom's orbit (or, if lost, its last turns)
    ctx.lineWidth = 2;
    if (data.lost) {
      for (let i = 1; i < path.length; i++) {
        ctx.strokeStyle = `rgba(255,107,107,${0.1 + 0.85 * i / path.length})`;
        ctx.beginPath(); ctx.moveTo(...P(path[i - 1].x, path[i - 1].z)); ctx.lineTo(...P(path[i].x, path[i].z)); ctx.stroke();
      }
    } else {
      ctx.strokeStyle = 'rgba(79,195,255,0.9)'; ctx.beginPath();
      path.forEach((p, i) => (i ? ctx.lineTo(...P(p.x, p.z)) : ctx.moveTo(...P(p.x, p.z)))); ctx.closePath(); ctx.stroke();
    }
    ctx.fillStyle = COLORS.orange; ctx.beginPath(); ctx.arc(cx, cy, 7, 0, Math.PI * 2); ctx.fill();
    // electrons: the atom at rest (grey) and the moving atom (blue), same clock
    if (!data.lost) {
      const T0 = data.T0, Tm = data.period * T0, tm = clock % Tm;
      let i = Math.min(path.length - 1, Math.max(0, Math.round((tm / Tm) * path.length)));
      while (i < path.length - 1 && path[i].t < tm) i++;
      const e = path[i];
      // rest electron: starts where the moving one starts, turns the same way
      const th0 = Math.atan2(path[0].x, path[0].z * g), dir = Math.sign(path[0].x * path[2].z - path[0].z * path[2].x) || 1;
      const th = th0 - dir * (2 * Math.PI * clock) / T0;
      ctx.fillStyle = '#9fb3c4'; ctx.beginPath(); ctx.arc(...P(Math.sin(th), Math.cos(th)), 5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = COLORS.cyan; ctx.beginPath(); ctx.arc(...P(e.x, e.z), 6, 0, Math.PI * 2); ctx.fill();
    }
    // labels
    if (narrow) {
      text(ctx, 'grey: atom at rest · blue: moving atom', 12, 20, { color: COLORS.muted, size: 11.5 });
      text(ctx, "dashed green: Bell's prediction", 12, 36, { color: COLORS.muted, size: 11.5 });
    } else text(ctx, "grey: the atom at rest · blue: the atom moving at v · dashed green: Bell's prediction", 12, 20, { color: COLORS.muted, size: 11.5 });
    const off = offList(cfg); let y = narrow ? 52 : 38;
    if (off.length) { text(ctx, `switched off: ${off.join(', ')}`, 12, y, { color: COLORS.gold, size: 11.5 }); y += 16; }
    if (zoom < 0.98) text(ctx, `view zoomed out ×${fmt(zoom, 2)} to fit the orbit`, 12, y, { color: COLORS.muted, size: 11.5 });
    text(ctx, `v = ${fmt(cfg.Vf)} c · γ = ${fmt(g)}`, w - 12, h - 12, { color: COLORS.ink, size: 12.5, align: 'right' });
    motionArrow(ctx, 12, h - 14, narrow ? 'motion' : 'direction of motion');
  }

  let last = performance.now();
  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    if (playing && visible && data) clock += dt * data.T0 * 0.5; // one rest period every 2 s
    if (visible) draw();
    requestAnimationFrame(frame);
  }
  whenVisible(canvas, (v) => { visible = v; if (v && !data) compute(); });
  addEventListener('resize', () => visible && draw());
  schedule();
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
