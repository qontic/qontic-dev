// Run with: node apps/experiments/nanoparticle-interference/tests/wave.test.mjs
// Checks the explicit wave model against the Talbot–Lau formula of the paper, and the
// pilot-wave trajectories against |psi|^2 (equivariance).
import assert from 'node:assert/strict';
import { PAPER, fringeCoefficients, fringeProfile } from '../js/talbot.js';
import {
  makeSetup, makeCluster, psiAfterG2, densityAfterG2, slopeAfterG2, transmission,
  intensityTransmission, ensembleDensityAtG3, trajectory,
} from '../js/wave.js';

const close = (a, b, tol, msg) => assert.ok(Math.abs(a - b) <= tol, `${msg}: ${a} vs ${b}`);
let passed = 0;
const test = (name, fn) => { fn(); passed++; console.log('ok', name); };
const D = PAPER.d;
const fig2a = { massKDa: 172, v: 160, P: PAPER.fig2a.P };

test('just behind G2 the virtual-source sum equals t2(x) times the point-source wave', () => {
  const st = makeSetup(fig2a), cl = makeCluster(st, 0.37 * D);
  for (const x of [-300e-9, -41e-9, 0, 12e-9, 95e-9, 410e-9]) {
    const p = psiAfterG2(st, cl, x, 0);
    const t = transmission(x, st.g[1].n0, st.g[1].phi0);
    // the common chirp exp[i k (x-x0)^2/(2L)] is omitted on both sides
    close(p.re, t[0], 1e-9, `Re at x=${x}`);
    close(p.im, t[1], 1e-9, `Im at x=${x}`);
  }
});

test('the slope is the numerical phase gradient of psi', () => {
  const st = makeSetup(fig2a), cl = makeCluster(st, 0.5 * D);
  const s = 0.6, h = 1e-12;
  for (const x of [-120e-9, 7e-9, 80e-9]) {
    const ph = (xx) => { const p = psiAfterG2(st, cl, xx, s); return Math.atan2(p.im, p.re) + (st.k * (xx - cl.x0) ** 2) / (2 * (st.L + s)); };
    let dph = ph(x + h) - ph(x - h);
    dph -= 2 * Math.PI * Math.round(dph / (2 * Math.PI));
    close(slopeAfterG2(st, cl, x, s), dph / (2 * h) / st.k, 1e-9, `x=${x}`);
  }
});

for (const [name, setupArgs] of [
  ['Fig. 2a, 172 kDa at 160 m/s', fig2a],
  ['1 MDa at 25 m/s', { massKDa: 1000, v: 25, P: [0.1, 0.0009, 0.1] }],
  ['50 kDa at 160 m/s, strong G2', { massKDa: 50, v: 160, P: [0.06, 0.04, 0.06] }],
]) {
  test(`explicit wave reproduces the Talbot–Lau count rate: ${name}`, () => {
    const st = makeSetup(setupArgs);
    // density at G3 over two periods, then the G3 mask scanned across it
    const nx = 512, xs = Array.from({ length: nx }, (_, i) => (i * 2 * D) / nx);
    const rho = ensembleDensityAtG3(st, xs, 64);
    const x3s = Array.from({ length: 12 }, (_, i) => (i * D) / 12);
    const counts = x3s.map((x3) => xs.reduce((a, x, i) => a + rho[i] * intensityTransmission(x - x3, st.g[2].n0), 0));
    const mean = counts.reduce((a, b) => a + b, 0) / counts.length;
    const S = fringeCoefficients({ P: setupArgs.P, waist: PAPER.waist, L: PAPER.L, d: D }, setupArgs.massKDa, setupArgs.v, false, 8);
    const ref = fringeProfile(S, x3s, D);
    x3s.forEach((x3, i) => close(counts[i] / mean, ref[i], 2e-3, `x3 = ${(x3 * 1e9).toFixed(1)} nm`));
  });
}

test('pilot-wave positions at G3 follow |psi|^2 (equivariance)', () => {
  // Positions at G2 are uniform (the point-source wave has uniform density there): stratified
  // starting points, each weighted by its G2 survival probability |t2|^2.
  const st = makeSetup(fig2a), cl = makeCluster(st, 0.5 * D);
  const nb = 16, lo = -D, hi = D, bw = (hi - lo) / nb, hist = new Float64Array(nb);
  let n = 0;
  const N = 8000, half = 400e-9;
  for (let i = 0; i < N; i++) {
    const x2 = -half + (2 * half * (i + 0.5)) / N;
    const xe = trajectory(st, cl, x2, { steps: 160, rand: () => 0 }).pts.at(-1)[1];
    const w = intensityTransmission(x2, st.g[1].n0);
    if (xe >= lo && xe < hi) { hist[Math.floor((xe - lo) / bw)] += w; n += w; }
  }
  const rho = Array.from({ length: nb }, (_, b) => {
    let s = 0;
    for (let j = 0; j < 20; j++) s += densityAfterG2(st, cl, lo + b * bw + ((j + 0.5) * bw) / 20, st.L);
    return s;
  });
  const rs = rho.reduce((a, b) => a + b, 0);
  for (let b = 0; b < nb; b++) close(hist[b] / n, rho[b] / rs, 0.003, `bin ${b}`);
});

console.log(`${passed} tests passed`);
