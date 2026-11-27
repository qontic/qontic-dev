// Two small figures that N-Slits does not draw: the amplitude arrows at a point P
// (Part 3) and a partial which-slit record (Part 4). Both use the far-field sketch of
// the same experiment: two Gaussian slits (σ = 30 nm) a distance d apart, a screen at
// distance Z = 1000 nm, wavelength λ. Each slit sends ψ_j(y) = E(θ_j) e^{i k r_j} / √r_j,
// with the single-slit envelope E(θ) = exp(−k²σ² sin²θ) of a Gaussian aperture.
const SIGMA = 30, Z = 1000;
const CYAN = '#56b4e9', ORANGE = '#e69f00', GOLD = '#f0c75e', GRID = 'rgba(160,190,220,.25)', INK = '#dfe8f2', MUTED = '#9fb3c8';

function amp(y, ys, lam) {
  const k = 2 * Math.PI / lam, dy = y - ys, r = Math.hypot(Z, dy), s = dy / r;
  const e = Math.exp(-((k * SIGMA * s) ** 2)) / Math.sqrt(r / Z);
  return { re: e * Math.cos(k * r), im: e * Math.sin(k * r), r };
}
function profile(lam, d, gamma, ymax, n = 600) {
  const out = [];
  for (let i = 0; i <= n; i++) {
    const y = -ymax + 2 * ymax * i / n, u = amp(y, -d / 2, lam), l = amp(y, d / 2, lam);
    const pu = u.re ** 2 + u.im ** 2, pl = l.re ** 2 + l.im ** 2, cross = 2 * (u.re * l.re + u.im * l.im);
    out.push({ y, p: pu + pl + gamma * cross, pu, pl });
  }
  return out;
}
function setupCanvas(c) {
  const dpr = window.devicePixelRatio || 1, w = c.clientWidth || 640, h = c.clientHeight || 300;
  if (c.width !== Math.round(w * dpr) || c.height !== Math.round(h * dpr)) { c.width = Math.round(w * dpr); c.height = Math.round(h * dpr); }
  const g = c.getContext('2d'); g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, w, h); return { g, w, h };
}
function arrow(g, x0, y0, x1, y1, col, lw = 2.5) {
  g.strokeStyle = col; g.fillStyle = col; g.lineWidth = lw; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke();
  const a = Math.atan2(y1 - y0, x1 - x0), L = Math.min(10, Math.hypot(x1 - x0, y1 - y0) * .4);
  if (L < 2) return;
  g.beginPath(); g.moveTo(x1, y1); g.lineTo(x1 - L * Math.cos(a - .4), y1 - L * Math.sin(a - .4)); g.lineTo(x1 - L * Math.cos(a + .4), y1 - L * Math.sin(a + .4)); g.closePath(); g.fill();
}

// ---------- Part 3: add, then square ----------
function mountArrows(root) {
  const c = root.querySelector('canvas'), out = root.querySelector('.readout');
  const lamR = root.querySelector('[data-f="lam"]'), dR = root.querySelector('[data-f="d"]'), pR = root.querySelector('[data-f="p"]');
  const label = (r, t) => { const o = r.parentElement.querySelector('output'); if (o) o.textContent = t; };
  let drag = false;
  function draw() {
    const lam = +lamR.value, d = +dR.value, P = +pR.value;
    label(lamR, lam + ' nm'); label(dR, d + ' nm'); label(pR, P + ' nm');
    const { g, w, h } = setupCanvas(c), ymax = 700;
    // left: geometry (top view), x from wall to screen
    const gx0 = 30, gx1 = w * .48, Y = y => h / 2 + y / ymax * (h / 2 - 14);
    g.strokeStyle = '#8aa0b6'; g.lineWidth = 4; g.beginPath(); g.moveTo(gx0, 6); g.lineTo(gx0, h - 6); g.stroke();
    g.strokeStyle = '#0b1420'; g.lineWidth = 6; for (const ys of [-d / 2, d / 2]) { g.beginPath(); g.moveTo(gx0, Y(ys) - 6); g.lineTo(gx0, Y(ys) + 6); g.stroke(); }
    g.strokeStyle = '#d4e6ef'; g.lineWidth = 2; g.beginPath(); g.moveTo(gx1, 6); g.lineTo(gx1, h - 6); g.stroke();
    // curve on the screen
    const prof = profile(lam, d, 1, ymax), pm = Math.max(...prof.map(q => q.p));
    g.strokeStyle = GOLD; g.lineWidth = 1.6; g.beginPath(); prof.forEach((q, i) => { const x = gx1 + 4 + q.p / pm * (w * .12); i ? g.lineTo(x, Y(q.y)) : g.moveTo(x, Y(q.y)); }); g.stroke();
    // distances to P
    const u = amp(P, -d / 2, lam), l = amp(P, d / 2, lam);
    g.setLineDash([5, 4]); g.lineWidth = 1.4;
    g.strokeStyle = CYAN; g.beginPath(); g.moveTo(gx0, Y(-d / 2)); g.lineTo(gx1, Y(P)); g.stroke();
    g.strokeStyle = ORANGE; g.beginPath(); g.moveTo(gx0, Y(d / 2)); g.lineTo(gx1, Y(P)); g.stroke(); g.setLineDash([]);
    g.fillStyle = GOLD; g.beginPath(); g.arc(gx1, Y(P), 6, 0, 2 * Math.PI); g.fill();
    g.fillStyle = INK; g.font = '12px system-ui, sans-serif'; g.fillText('P', gx1 - 18, Y(P) - 8);
    g.fillStyle = MUTED; g.fillText('wall', gx0 + 6, 16); g.fillText('screen', gx1 - 46, 16);
    // right: arrows tip to tail
    const cx = w * .74, cy = h / 2, R = Math.min(w * .11, h * .3), s = R / Math.max(1e-9, Math.hypot(u.re, u.im) + Math.hypot(l.re, l.im)) * 1.0;
    g.strokeStyle = GRID; g.lineWidth = 1; g.beginPath(); g.arc(cx, cy, R, 0, 2 * Math.PI); g.stroke();
    g.beginPath(); g.moveTo(cx - R * 1.15, cy); g.lineTo(cx + R * 1.15, cy); g.moveTo(cx, cy - R * 1.15); g.lineTo(cx, cy + R * 1.15); g.stroke();
    const ux = cx + u.re * s, uy = cy - u.im * s, sx = ux + l.re * s, sy = uy - l.im * s;
    arrow(g, cx, cy, ux, uy, CYAN); arrow(g, ux, uy, sx, sy, ORANGE); arrow(g, cx, cy, sx, sy, GOLD, 3.2);
    g.fillStyle = MUTED; g.fillText('ψU (cyan) + ψL (orange) = ψ (gold)', cx - R * 1.15, h - 10);
    // readout
    const tot = (u.re + l.re) ** 2 + (u.im + l.im) ** 2, sum = u.re ** 2 + u.im ** 2 + l.re ** 2 + l.im ** 2, dr = (l.r - u.r) / lam;
    out.innerHTML = `<div>r<sub>L</sub> − r<sub>U</sub> = <b>${dr.toFixed(2)} λ</b></div><div>|ψ<sub>U</sub> + ψ<sub>L</sub>|² = <b>${(tot / pm).toFixed(2)}</b> <span class="sub">(of the central peak)</span></div><div>|ψ<sub>U</sub>|² + |ψ<sub>L</sub>|² = <b>${(sum / pm).toFixed(2)}</b> <span class="sub">(the two humps added)</span></div>`;
    root._geom = { gx1, Y, ymax, h };
  }
  for (const r of [lamR, dR, pR]) r.addEventListener('input', draw);
  const toP = ev => { const gm = root._geom; if (!gm) return; const rect = c.getBoundingClientRect(), y = ev.clientY - rect.top; const val = Math.round(((y - gm.h / 2) / (gm.h / 2 - 14)) * gm.ymax / 5) * 5; pR.value = Math.max(+pR.min, Math.min(+pR.max, val)); draw(); };
  c.addEventListener('pointerdown', ev => { drag = true; c.setPointerCapture(ev.pointerId); toP(ev); });
  c.addEventListener('pointermove', ev => { if (drag) toP(ev); });
  c.addEventListener('pointerup', () => { drag = false; });
  new ResizeObserver(draw).observe(c); draw();
}

// ---------- Part 4: a partial record ----------
function mountGamma(root) {
  const c = root.querySelector('canvas'), out = root.querySelector('.readout'), gR = root.querySelector('[data-f="gamma"]');
  function draw() {
    const gamma = +gR.value, lam = 50, d = 300, ymax = 700; const o = gR.parentElement.querySelector('output'); if (o) o.textContent = gamma.toFixed(2);
    const { g, w, h } = setupCanvas(c), prof = profile(lam, d, gamma, ymax), p1 = profile(lam, d, 1, ymax), p0 = profile(lam, d, 0, ymax);
    const pm = Math.max(...p1.map(q => q.p)), X = y => 20 + (y + ymax) / (2 * ymax) * (w - 40), Yv = p => h - 22 - p / pm * (h - 40);
    g.strokeStyle = GRID; g.lineWidth = 1; g.beginPath(); g.moveTo(20, h - 22); g.lineTo(w - 20, h - 22); g.stroke();
    const line = (pr, col, dash, lw) => { g.setLineDash(dash); g.strokeStyle = col; g.lineWidth = lw; g.beginPath(); pr.forEach((q, i) => i ? g.lineTo(X(q.y), Yv(q.p)) : g.moveTo(X(q.y), Yv(q.p))); g.stroke(); g.setLineDash([]); };
    // Gold curve first; the two references on top (long dashes / dots), so they stay visible where they coincide with it.
    line(prof, GOLD, [], 3); line(p1, 'rgba(86,180,233,.95)', [9, 5], 1.6); line(p0, 'rgba(230,159,0,.95)', [2, 4], 2);
    g.fillStyle = MUTED; g.font = '12px system-ui, sans-serif'; g.fillText('screen position y', w / 2 - 50, h - 6);
    out.innerHTML = `<div>γ = <b>${gamma.toFixed(2)}</b>: the interference term is <b>${Math.round(gamma * 100)}%</b> of its value with no detector.</div>`;
  }
  gR.addEventListener('input', draw); new ResizeObserver(draw).observe(c); draw();
}

document.querySelectorAll('[data-figure="arrows"]').forEach(mountArrows);
document.querySelectorAll('[data-figure="gamma"]').forEach(mountGamma);
