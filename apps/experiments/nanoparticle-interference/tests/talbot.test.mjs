// Run with: node apps/experiments/nanoparticle-interference/tests/talbot.test.mjs
// Reference numbers come from an independent Python implementation of Eqs. 1–9
// of Pedalino et al. (arXiv:2507.21211v1), whose Talbot coefficients were checked
// against the closed form (Eq. 5) with scipy's Bessel functions.
import assert from 'node:assert/strict';
import { PAPER, visibility, talbotB, fringeCoefficients, fringeProfile, fitSine, deBroglie, talbotLength, diameter, n0, phi0, poisson } from '../js/talbot.js';

const close = (a, b, tol, msg) => assert.ok(Math.abs(a - b) <= tol, `${msg}: ${a} vs ${b}`);
let passed = 0;
const test = (name, fn) => { fn(); passed++; console.log('ok', name); };
const params = (P) => ({ P, waist: PAPER.waist, L: PAPER.L, d: PAPER.d });

test('beam numbers for 172 kDa at 160 m/s', () => {
  close(deBroglie(172, 160) * 1e15, 14.5, 0.05, 'λdB in fm');
  close(talbotLength(172, 160), 1.220, 0.001, 'L_T in m');
  close(diameter(172) * 1e9, 8.1, 0.1, 'diameter in nm (paper: ~8 nm)');
  close(n0(0.062, 172, 160, 620e-6), 2.43, 0.01, 'n0 at G1, Fig. 2a');
  close(phi0(0.0152, 172, 160, 575e-6), -3.53, 0.01, 'φ0 at G2, Fig. 2a');
});

test('B_0 at ξ = 0 is the mean transmission e^{-n0/2} I0(n0/2)', () => {
  // I0(1) = 1.2660658777520082
  const [[re, im]] = talbotB([0], 2, -3, 0, false);
  close(re, Math.exp(-1) * 1.2660658777520082, 1e-12, 'Re B0');
  close(im, 0, 1e-12, 'Im B0');
});

test('quantum and classical coefficients agree as ξ → 0', () => {
  const q = talbotB([2], 3, -4, 1e-6, false)[0], c = talbotB([2], 3, -4, 1e-6, true)[0];
  close(q[0], c[0], 1e-9, 'Re'); close(q[1], c[1], 1e-9, 'Im');
});

const ref = [
  ['Fig. 2a (172 kDa, 62/15.2/68 mW, Δm/m = 0.32)', [0.062, 0.0152, 0.068], { massKDa: 172, v: 160, sigmaV: 10, dmRel: 0.32 }, 0.13645394965666244, 0.03595265488490437],
  ['100 kDa, 100/24/100 mW', [0.1, 0.024, 0.1], { massKDa: 100, v: 160, sigmaV: 10, dmRel: 0 }, 0.24257622229854814, 0.024629068680247588],
  ['400 kDa, 100/6/100 mW', [0.1, 0.006, 0.1], { massKDa: 400, v: 160, sigmaV: 10, dmRel: 0 }, 0.7989990030913202, 0.7867851727006567],
  ['1 MDa at 25 m/s', [0.1, 0.0009, 0.1], { massKDa: 1000, v: 25, sigmaV: 2, dmRel: 0 }, 0.4082410124598236, 0.007019653156556562],
];
for (const [name, P, beam, vq, vc] of ref) {
  test(`visibility matches Python reference: ${name}`, () => {
    close(visibility(params(P), beam, false), vq, 1e-9, 'quantum');
    close(visibility(params(P), beam, true), vc, 1e-9, 'classical');
  });
}

test('Fig. 2a with the 0.78 factor reproduces the measured V ≈ 0.10 (quantum), not the classical model', () => {
  const p = params(PAPER.fig2a.P), b = PAPER.fig2a;
  const vq = visibility(p, b, false, PAPER.scale), vc = visibility(p, b, true, PAPER.scale);
  assert.ok(vq > 0.09 && vq < 0.12, `quantum ${vq}`);
  assert.ok(vc < 0.05, `classical ${vc}`);
});

test('fringe profile has mean 1 and the fitted visibility of a noiseless profile equals 2|S1|/S0', () => {
  const S = fringeCoefficients(params([0.1, 0.006, 0.1]), 400, 160, false, 1);
  const xs = Array.from({ length: 40 }, (_, i) => (i * 2 * PAPER.d) / 40);
  const ys = fringeProfile(S, xs, PAPER.d).map((y) => 1e6 * y);
  const fit = fitSine(xs, ys, PAPER.d);
  close(fit.V, (2 * Math.hypot(...S[1])) / S[0][0], 1e-9, 'V');
  close(ys.reduce((a, b) => a + b, 0) / ys.length / 1e6, 1, 1e-9, 'mean');
});

test('poisson sampler has the right mean', () => {
  let s = 0; const n = 20000;
  for (let i = 0; i < n; i++) s += poisson(7.5);
  close(s / n, 7.5, 0.1, 'mean 7.5');
});

console.log(`${passed} tests passed`);
