// node apps/comparative/weak-velocity/tests/weak-model.test.mjs
import assert from 'node:assert/strict';
import * as M from '../js/weak-model.js';
import {sourceTransverse} from '../../double-slit-analytical/js/source-packet-model.js?cache=20261101';

const p = M.modelParams();
const t0 = M.wallTerms(p);
let passed = 0;
const test = (name, fn) => {fn(); passed++; console.log('ok', name);};

// Density-weighted average of the current velocity over a bin at the strong plane.
function binAverageCurrent(terms, a, b, n = 200) {
  let s = 0, sv = 0;
  for (let i = 0; i < n; i++) {const y = a + (i + 0.5) * (b - a) / n, r = M.density(terms, y); s += r; sv += r * M.currentVelocity(terms, y);}
  return sv / s;
}

test('wave behind the wall equals the double-slit app wave', () => {
  for (const x of [p.wall + 0.01, p.wall + 3, p.screen]) {
    const t = M.propagate(t0, (x - p.wall) / p.k);
    for (let y = -4; y <= 4; y += 0.37) {
      const a = M.evaluate(t, y), b = sourceTransverse(y, x, p);
      assert.ok(Math.hypot(a.re - b.re, a.im - b.im) <= 1e-10 * Math.sqrt(b.rho) + 1e-14);
      assert.ok(Math.abs(M.currentVelocity(t, y) - b.v) < 1e-9);
    }
  }
});

test('propagation composes: tau1 then tau2 equals tau1 + tau2', () => {
  const a = M.propagate(M.propagate(t0, 0.2), 0.3), b = M.propagate(t0, 0.5);
  for (let y = -3; y <= 3; y += 0.41) {
    const u = M.evaluate(a, y), v = M.evaluate(b, y);
    assert.ok(Math.hypot(u.re - v.re, u.im - v.im) < 1e-12);
  }
});

test('weak-limit velocity equals the current velocity at the strong plane, for any separation', () => {
  // Free evolution: y(0) = y(tau) - p tau, so (yf - Re<y(0)>_w)/tau = Re<p>_w = Im(psi'/psi).
  const t1 = M.propagate(t0, 5 / p.k);
  for (const dx of [1, 0.3, 0.01]) {
    const dtau = dx / p.k, t2 = M.propagate(t1, dtau);
    for (let y = -3; y <= 3; y += 0.29) {
      const w = M.weakValueLimit(t1, dtau, y);
      assert.ok(Math.abs((y - w.re) / dtau - M.currentVelocity(t2, y)) < 1e-8);
    }
  }
});

test('pointer coupling conserves probability (sum over Y)', () => {
  const t1 = M.propagate(t0, 4 / p.k);
  const tab = M.jointTable({terms1: t1, dtau: 0.5 / p.k, sw: 1, yfMin: -8, yfMax: 8, nYf: 400});
  let n = 0; for (let y = -8; y <= 8; y += 0.005) n += M.density(M.propagate(t1, 0.5 / p.k), y) * 0.005;
  assert.ok(Math.abs(tab.total - n) / n < 2e-3, `${tab.total} vs ${n}`);
});

test('a weak pointer gives the current velocity; a strong one does not', () => {
  const t1 = M.propagate(t0, 5 / p.k), dtau = 0.5 / p.k, t2 = M.propagate(t1, dtau);
  const bins = M.makeBins(-3, 3, 30);
  const errFor = sw => {
    const ex = M.expectedBinVelocities(M.jointTable({terms1: t1, dtau, sw, yfMin: -3, yfMax: 3, nYf: 600}), bins);
    let e = 0, n = 0;
    ex.forEach((b, i) => {if (!b) return; const a = bins.yMin + i * bins.w; e += Math.abs(b.v - binAverageCurrent(t2, a, a + bins.w)); n++;});
    return e / n;
  };
  const weak = errFor(2), strong = errFor(0.05);
  assert.ok(weak < 0.02, `weak ${weak}`);
  assert.ok(strong > 1, `strong ${strong}`);
});

test('sampled runs reproduce the exact conditional mean within errors', () => {
  const t1 = M.propagate(t0, 5 / p.k), dtau = 0.5 / p.k;
  const tab = M.jointTable({terms1: t1, dtau, sw: 1, yfMin: -3, yfMax: 3});
  let seed = 12345; const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
  const bins = M.makeBins(-3, 3, 12);
  for (let i = 0; i < 400000; i++) M.addToBins(bins, M.sampleRun(tab, rnd));
  const got = M.binVelocities(bins, dtau), ex = M.expectedBinVelocities(tab, bins);
  let chi = 0, n = 0;
  got.forEach((g, i) => {if (!g || !ex[i]) return; chi += ((g.v - ex[i].v) / g.err) ** 2; n++;});
  assert.ok(n >= 8 && chi / n < 3, `chi2/n ${chi / n} over ${n}`);
});

test('field integration reproduces a pilot-wave trajectory from the exact field', () => {
  const xs = Array.from({length: 21}, (_, i) => p.wall + i * (p.screen - p.wall) / 20);
  const planes = xs.map(x => {const t = M.propagate(t0, (x - p.wall) / p.k); return {x, vAt: y => M.currentVelocity(t, y)};});
  const a = M.integrateField(planes, p.k, -1.4, p.wall, p.screen, 400).at(-1)[1];
  const b = M.bohmTrajectory(t0, p.k, p.wall, -1.4, p.screen, 400).at(-1)[1];
  assert.ok(Math.abs(a - b) < 0.05, `${a} vs ${b}`);
});

console.log(`${passed} tests passed`);
