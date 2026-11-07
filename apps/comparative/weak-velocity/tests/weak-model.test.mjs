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

test('other geometries: wave still equals the double-slit app wave', () => {
  for (const g of [{wavelength: 20, slitWidth: 60, separation: 500, wall: 400, distance: 2500, sourceWidth: 120},
                   {wavelength: 50, slitWidth: 40, separation: 150, wall: 100, distance: 300, sourceWidth: 350}]) {
    const q = M.modelParams(g), t = M.wallTerms(q);
    for (const x of [q.wall + 0.5, q.screen]) {
      const tt = M.propagate(t, (x - q.wall) / q.k);
      for (let y = -6; y <= 6; y += 0.53) {
        const a = M.evaluate(tt, y), b = sourceTransverse(y, x, q);
        assert.ok(Math.hypot(a.re - b.re, a.im - b.im) <= 1e-9 * Math.sqrt(b.rho) + 1e-14);
      }
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

test('velocity errors include covariance between the paired readings', () => {
  const bins = M.makeBins(-10, 10, 1);
  // Both coordinates vary, but their difference is always 0.5: there is no
  // sampling uncertainty in the measured displacement.
  for (const yf of [-3, -1, 2, 4]) M.addToBins(bins, {yf, Y: yf - 0.5});
  const [b] = M.binVelocities(bins, 0.25, 2);
  assert.equal(b.v, 2);
  assert.equal(b.err, 0);
});

test('velocity errors use the sample variance of the differences', () => {
  const bins = M.makeBins(-10, 10, 1);
  // Differences 1, 2, 3, 4 have sample variance 5/3 and mean 2.5.
  [1, 2, 3, 4].forEach((d, i) => M.addToBins(bins, {yf: i, Y: i - d}));
  const [b] = M.binVelocities(bins, 0.5, 2);
  assert.equal(b.v, 5);
  assert.ok(Math.abs(b.err - Math.sqrt(5 / 12) / 0.5) < 1e-12);
  const singleton = M.makeBins(-1, 1, 1);
  M.addToBins(singleton, {yf: 0, Y: 0.2});
  assert.equal(M.binVelocities(singleton, 0.5, 1)[0], null);
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

test('sharp pointer: sampled strips match the exact strip means (no strip-edge bias)', () => {
  // A 10 nm pointer gives tiny error bars, so any mismatch between how runs are
  // sampled and how the exact strip means are computed shows up here.
  const t1 = M.propagate(t0, 5 / p.k), dtau = 0.5 / p.k;
  const tab = M.jointTable({terms1: t1, dtau, sw: 0.1, yfMin: -4, yfMax: 4, nYf: 360});
  let seed = 99; const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
  const bins = M.makeBins(-4, 4, 40);
  // 4M runs: a node-centred grid (cells straddling strip edges) gives chi2/n ~ 1.8 here.
  for (let i = 0; i < 4000000; i++) M.addToBins(bins, M.sampleRun(tab, rnd));
  const got = M.binVelocities(bins, dtau, 200), ex = M.expectedBinVelocities(tab, bins);
  let chi = 0, n = 0;
  got.forEach((g, i) => {if (!g || !ex[i]) return; chi += ((g.v - ex[i].v) / g.err) ** 2; n++;});
  assert.ok(n >= 30 && chi / n < 1.4, `chi2/n ${chi / n} over ${n}`);
});

test('field integration reproduces a pilot-wave trajectory from the exact field', () => {
  const xs = Array.from({length: 21}, (_, i) => p.wall + i * (p.screen - p.wall) / 20);
  const planes = xs.map(x => {const t = M.propagate(t0, (x - p.wall) / p.k); return {x, vAt: y => M.currentVelocity(t, y)};});
  const a = M.integrateField(planes, p.k, -1.4, p.wall, p.screen, 400).at(-1)[1];
  const b = M.bohmTrajectory(t0, p.k, p.wall, -1.4, p.screen, 400).at(-1)[1];
  assert.ok(Math.abs(a - b) < 0.05, `${a} vs ${b}`);
});

test('density averaged over pointer readings: unchanged at the weak plane, equals the table marginal downstream', () => {
  const t1 = M.propagate(t0, 5 / p.k);
  const ys = Array.from({length: 161}, (_, i) => -4 + i * 0.05);
  const at0 = M.ensembleDensity(t1, 0.3, 0, ys, 61);
  ys.forEach((y, i) => assert.ok(Math.abs(at0[i] - M.density(t1, y)) < 1e-9 * Math.max(1, M.density(t1, y))));
  for (const sw of [1, 0.2]) {
    const dtau = 2 / p.k;
    const tab = M.jointTable({terms1: t1, dtau, sw, yfMin: -4, yfMax: 4, nYf: 161});
    const ens = M.ensembleDensity(t1, sw, dtau, Array.from(tab.yf), 81);
    const norm = ens.reduce((a, b) => a + b, 0) * tab.dYf;
    let err = 0; for (let i = 0; i < tab.nYf; i++) err = Math.max(err, Math.abs(ens[i] / norm - tab.marginal[i]));
    const mx = Math.max(...tab.marginal);
    assert.ok(err < 0.01 * mx, `sw ${sw}: ${err / mx}`);
  }
});

console.log(`${passed} tests passed`);
