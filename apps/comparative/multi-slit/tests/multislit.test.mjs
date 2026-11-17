// Physics checks for the many-slit engine. Run: node apps/comparative/multi-slit/tests/multislit.test.mjs
import { readFileSync } from 'node:fs';
import {
  makeSetup, psiAt, densityAt, velocityAt, buildTables, quantile, cdfAt, slitCells, slitOf,
  yFromTop, rk4Trajectory, singleSlitFraction, erf, fringes, slitCentres,
} from '../js/multislit.js';

let fails = 0;
const check = (name, ok, info = '') => { console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${info ? '  ' + info : ''}`); if (!ok) fails++; };
const ref = JSON.parse(readFileSync(new URL('./reference.json', import.meta.url)));

function setupFor(c) {
  const s = makeSetup({ N: c.N, sigma: c.sigma });
  s.amp = c.amps.slice(); s.open = c.amps.map((a) => a > 0);
  return s;
}

// 1. Closed-form wave against FFT propagation (Python, independent route).
for (const c of ref) {
  const s = setupFor(c);
  let worst = 0;
  for (const [y, r] of Object.entries(c.rho)) {
    const d = densityAt(s, +y, c.zeta);
    worst = Math.max(worst, Math.abs(d - r) / Math.max(r, 1e-6));
  }
  check(`closed form = FFT propagation, N=${c.N} ζ=${c.zeta}`, worst < 1e-9, `max rel diff ${worst.toExponential(2)}`);
}

// 2. Slit-cell boundaries on the screen against the FFT reference.
for (const c of ref) {
  const s = setupFor(c);
  const T = buildTables(s, c.zeta, { nz: 2, ny: 20001 });
  const cells = slitCells(s, T);
  const screen = T.cols[1];
  const ys = cells.P.slice(1, -1).map((p) => yFromTop(screen, p));
  const worst = Math.max(0, ...ys.map((y, i) => Math.abs(y - c.screenBoundaries[i])));
  check(`screen boundaries = FFT reference, N=${c.N} ζ=${c.zeta}`, worst < 2e-3, `max |Δy| ${worst.toExponential(2)} d`);
}

// 3. Guidance velocity equals Im(∂ψ/ψ)/π from a numerical phase gradient.
{
  const s = makeSetup({ N: 5, sigma: 0.15 });
  let worst = 0;
  for (const [y, z] of [[0.3, 0.5], [1.7, 2], [-2.2, 4], [5.1, 6]]) {
    const h = 1e-5;
    const ph = (yy) => { const [re, im] = psiAt(s, yy, z); return Math.atan2(im, re); };
    let dphi = ph(y + h) - ph(y - h); dphi -= 2 * Math.PI * Math.round(dphi / (2 * Math.PI));
    worst = Math.max(worst, Math.abs(dphi / (2 * h) / Math.PI - velocityAt(s, y, z)));
  }
  check('velocity = phase gradient / π', worst < 1e-6, `max diff ${worst.toExponential(2)}`);
}

// 4. The wave satisfies ∂ψ/∂ζ = (i/2π) ∂²ψ/∂y² (finite differences).
{
  const s = makeSetup({ N: 3, sigma: 0.2 });
  let worst = 0;
  for (const [y, z] of [[0.2, 0.3], [1.4, 1.1], [-0.7, 2.5]]) {
    const h = 1e-3, e = 1e-4;
    const P = (yy, zz) => psiAt(s, yy, zz);
    const [r1, i1] = P(y, z + e), [r0, i0] = P(y, z - e);
    const dz = [(r1 - r0) / (2 * e), (i1 - i0) / (2 * e)];
    const [a, b] = P(y + h, z), [c, d] = P(y, z), [f, g] = P(y - h, z);
    const lap = [(a - 2 * c + f) / h / h, (b - 2 * d + g) / h / h];
    const rhs = [-lap[1] / (2 * Math.PI), lap[0] / (2 * Math.PI)];
    const scale = Math.hypot(...dz) + 1e-9;
    worst = Math.max(worst, Math.hypot(dz[0] - rhs[0], dz[1] - rhs[1]) / scale);
  }
  check('closed form solves the paraxial equation', worst < 1e-4, `rel residual ${worst.toExponential(2)}`);
}

// 5. Quantile-map trajectories = RK4 integration of the guidance equation.
for (const [N, sigma, Z] of [[5, 0.15, 6], [2, 0.15, 6], [15, 0.1, 1]]) {
  const s = makeSetup({ N, sigma });
  const T = buildTables(s, Z, { nz: 121, ny: 8001 });
  let worst = 0;
  for (const qTop of [0.05, 0.13, 0.31, 0.5, 0.62, 0.9]) {
    const y0 = yFromTop(T.cols[0], qTop);
    const path = rk4Trajectory(s, y0, Z, 12000);
    for (let j = 1; j < T.nz; j += 10) {
      const yq = yFromTop(T.cols[j], qTop);
      const yr = path[Math.round((j / (T.nz - 1)) * 12000)];
      worst = Math.max(worst, Math.abs(yq - yr));
    }
  }
  check(`quantile map = RK4 trajectories, N=${N} ζ=${Z}`, worst < 5e-3, `max |Δy| ${worst.toExponential(2)} d`);
}

// 6. Normalization is conserved (unitary evolution of the closed form).
{
  const s = makeSetup({ N: 5, sigma: 0.15 });
  const T = buildTables(s, 6, { nz: 7, ny: 20001 });
  const t = T.cols.map((c) => c.total);
  const drift = Math.max(...t.map((x) => Math.abs(x / t[0] - 1)));
  check('norm conserved along ζ', drift < 1e-6, `max drift ${drift.toExponential(2)}`);
}

// 7. Monte Carlo: sampled screen hits by slit fall only in that slit's band, and the band holds p_k.
{
  const s = makeSetup({ N: 5, sigma: 0.15 });
  const T = buildTables(s, 6, { nz: 2, ny: 8001 });
  const cells = slitCells(s, T);
  const col = T.cols[1];
  const bands = cells.slit.map((k, i) => [yFromTop(col, cells.P[i + 1]), yFromTop(col, cells.P[i])]);
  let outside = 0; const n = 20000; const counts = new Array(5).fill(0);
  let seed = 7; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < n; i++) {
    const q = rnd(); const k = slitOf(cells, q); const y = yFromTop(col, q);
    counts[k]++; const [lo, hi] = bands[cells.slit.indexOf(k)];
    if (y < lo - 1e-9 || y > hi + 1e-9) outside++;
  }
  const p = cells.P.slice(1).map((x, i) => x - cells.P[i]);
  const chi = counts.reduce((a, c, i) => a + (c - n * p[i]) ** 2 / (n * p[i]), 0);
  check('each slit lands only in its band', outside === 0, `${outside} outside`);
  check('slit counts follow p_k', chi < 20.5, `χ²=${chi.toFixed(1)} (4 dof)`);
  // equivariance in a different guise: screen histogram follows |ψ|² on the screen
  const edges = Array.from({ length: 21 }, (_, i) => -20 + 2 * i);
  const h = new Array(20).fill(0);
  seed = 11;
  for (let i = 0; i < n; i++) { const y = yFromTop(col, rnd()); const b = Math.floor((y + 20) / 2); if (b >= 0 && b < 20) h[b]++; }
  let chi2 = 0, dof = 0;
  for (let b = 0; b < 20; b++) {
    const e = n * (cdfAt(col, edges[b + 1]) - cdfAt(col, edges[b]));
    if (e > 5) { chi2 += (h[b] - e) ** 2 / e; dof++; }
  }
  check('screen histogram follows |ψ|²', chi2 < dof + 4 * Math.sqrt(2 * dof), `χ²=${chi2.toFixed(1)} (${dof} bins)`);
}

// 8. Limits and symmetry.
{
  const s = makeSetup({ N: 2, sigma: 0.15 });
  const T = buildTables(s, 6, { nz: 2, ny: 8001 });
  const cells = slitCells(s, T);
  check('double slit: boundary on the axis', Math.abs(yFromTop(T.cols[1], cells.P[1])) < 1e-3);
  const s1 = makeSetup({ N: 1, sigma: 0.15 });
  const T1 = buildTables(s1, 3, { nz: 2, ny: 8001 });
  const q = 0.8413447460685429; // one σ
  const w = Math.hypot(0.0225, 3 / (2 * Math.PI)) / 0.15;
  check('single slit: Gaussian spread |s|/σ', Math.abs(quantile(T1.cols[1], q) - w) < 2e-3 * w);
  check('erf', Math.abs(erf(0.5) - 0.5204998778130465) < 1e-14 && Math.abs(erf(3) - 0.9999779095030014) < 1e-13);
  check('single-slit fraction of whole line = 1', Math.abs(singleSlitFraction(s, 0, 6, -1e3, 1e3) - 1) < 1e-12);
  check('slit 0 is the top one', slitCentres(3)[0] === 1);
}

// 9. Talbot revival: at ζ = 1 a long grating reproduces itself in the middle.
{
  const s = makeSetup({ N: 41, sigma: 0.08 });
  let worst = 0, peak = densityAt(s, 0, 0);
  for (let y = -2; y <= 2; y += 0.05) worst = Math.max(worst, Math.abs(densityAt(s, y, 1) - densityAt(s, y, 0)));
  check('Talbot revival at ζ = 1 (N = 41, centre)', worst / peak < 0.05, `max diff ${(worst / peak).toFixed(3)} of peak`);
}

// 10. Remote slit: closing the bottom slit moves the top slit's screen band.
{
  const a = makeSetup({ N: 5, sigma: 0.15 });
  const b = makeSetup({ N: 5, sigma: 0.15, open: [true, true, true, true, false] });
  const lowEdge = (s) => { const T = buildTables(s, 6, { nz: 2, ny: 8001 }); const c = slitCells(s, T); return yFromTop(T.cols[1], c.P[1]); };
  const ea = lowEdge(a), eb = lowEdge(b);
  check('closing the bottom slit moves the top slit band', Math.abs(ea - eb) > 0.3, `${ea.toFixed(3)} → ${eb.toFixed(3)}`);
}

const f = fringes(buildTables(makeSetup({ N: 5, sigma: 0.15 }), 6, { nz: 2, ny: 8001 }).cols[1]);
console.log('orders at screen (N=5, ζ=6):', f.map((x) => `[${x.lo.toFixed(2)}, ${x.hi.toFixed(2)}] ${(100 * x.mass).toFixed(1)}%`).join('  '));
console.log(fails ? `${fails} FAILED` : 'all passed');
process.exit(fails ? 1 : 0);
