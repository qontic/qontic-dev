// Run with: node apps/relativity/michelson-morley/tests/optics.test.mjs
import assert from 'node:assert/strict';
import { makeRun, pulseAt, classicalTime, delay, gammaOf, roundTrip, markerInApparatusFrame } from '../js/optics.js';

const close = (a, b, tol, msg) => assert.ok(Math.abs(a - b) <= tol, `${msg}: ${a} vs ${b}`);
let passed = 0;
const test = (name, fn) => { fn(); passed++; console.log('ok', name); };
const DEG = Math.PI / 180;
const betas = [0.05, 0.3, 0.6, 0.8];
const angles = [0, 10, 30, 45, 60, 77, 90].map((d) => d * DEG);

test('1887 expectation matches the closed form for both arms', () => {
  for (const b of betas) for (const th of angles) {
    const r = makeRun({ beta: b, theta: th, account: 'classical' });
    close(r.arms[0].T, classicalTime(b, th), 1e-12, `arm 1, β=${b}, θ=${th}`);
    close(r.arms[1].T, classicalTime(b, th + 90 * DEG), 1e-12, `arm 2, β=${b}, θ=${th}`);
  }
});

test('1887 expectation: along-motion arm later by about β² at θ = 0', () => {
  const b = 0.01;
  close(delay(b, 0, 'classical') / (b * b), 1, 1e-3, 'Δt ≈ Lv²/c³');
  assert.ok(delay(0.6, 0, 'classical') > 0, 'arm 1 later at 0°');
});

test('1887 expectation: delay vanishes at 45° and reverses at 90°', () => {
  for (const b of betas) {
    close(delay(b, 45 * DEG, 'classical'), 0, 1e-12, `45°, β=${b}`);
    close(delay(b, 90 * DEG, 'classical'), -delay(b, 0, 'classical'), 1e-12, `90°, β=${b}`);
  }
});

test('Lorentz: both arms take 2γ at every angle and speed', () => {
  for (const b of betas) for (const th of angles) {
    const r = makeRun({ beta: b, theta: th, account: 'lorentz' });
    close(r.arms[0].T, 2 * gammaOf(b), 1e-12, `arm 1, β=${b}, θ=${th}`);
    close(r.arms[1].T, 2 * gammaOf(b), 1e-12, `arm 2, β=${b}, θ=${th}`);
  }
});

test('Lorentz: the apparatus clock reads 2 at the return, as in Einstein', () => {
  for (const b of betas) {
    const r = makeRun({ beta: b, theta: 0.3, account: 'lorentz' });
    close(r.arms[0].T * r.clockRate, 2, 1e-12, `β=${b}`);
  }
});

test('Lorentz with contraction but no slow clocks still gives a null result', () => {
  for (const b of betas) close(delay(b, 0.4, 'lorentz'), 0, 1e-12, `β=${b}`);
});

test('Einstein: both arms take 2 in the apparatus frame', () => {
  for (const b of betas) for (const th of angles) {
    const r = makeRun({ beta: b, theta: th, account: 'einstein' });
    close(r.arms[0].T, 2, 1e-12, 'arm 1'); close(r.arms[1].T, 2, 1e-12, 'arm 2');
  }
});

test('pulse ends back at the moving splitter, and travels at speed 1', () => {
  for (const account of ['classical', 'lorentz', 'einstein']) {
    const r = makeRun({ beta: 0.6, theta: 25 * DEG, account });
    for (const i of [0, 1]) {
      const a = r.arms[i];
      const end = pulseAt(r, i, a.T - 1e-12);
      close(end.x, r.v * a.T, 1e-9, `${account} arm ${i + 1} x`);
      close(end.y, 0, 1e-9, `${account} arm ${i + 1} y`);
      const p = pulseAt(r, i, 0.5 * a.t1), q = pulseAt(r, i, 0.5 * a.t1 + 1e-4);
      close(Math.hypot(q.x - p.x, q.y - p.y) / 1e-4, 1, 1e-6, `${account} arm ${i + 1} speed out`);
      const u = pulseAt(r, i, a.t1 + 0.5 * a.t2), w = pulseAt(r, i, a.t1 + 0.5 * a.t2 + 1e-4);
      close(Math.hypot(w.x - u.x, w.y - u.y) / 1e-4, 1, 1e-6, `${account} arm ${i + 1} speed back`);
    }
  }
});

test('mirror reached at the moving mirror position', () => {
  const r = makeRun({ beta: 0.7, theta: 0, account: 'classical' });
  const { t1 } = roundTrip([1, 0], 0.7);
  close(r.arms[0].t1, t1, 1e-12, 't1');
  close(r.arms[0].t1, 1 / (1 - 0.7), 1e-12, 'L/(c − v)');
});

test('ether markers in the apparatus frame: Lorentz transformation of x = X', () => {
  const b = 0.6, g = gammaOf(b);
  for (const X of [-2, 0.5, 3]) for (const t of [0, 0.7, 2.4]) {
    // event on the marker's worldline at ether time te: (X, te); apparatus time t' = γ(te − bX)
    const te = t / g + b * X;
    close(markerInApparatusFrame(X, b, t), g * (X - b * te), 1e-12, `X=${X}, t'=${t}`);
  }
});

test('aliases: ether = lorentz, apparatus = einstein', () => {
  const a = makeRun({ beta: 0.5, theta: 0.2, account: 'ether' }), b = makeRun({ beta: 0.5, theta: 0.2, account: 'lorentz' });
  close(a.arms[1].T, b.arms[1].T, 0, 'ether'); close(a.clockRate, b.clockRate, 0, 'clock');
  const c = makeRun({ beta: 0.5, theta: 0.2, account: 'apparatus' });
  close(c.v, 0, 0, 'apparatus at rest'); close(c.arms[0].T, 2, 1e-12, 'T');
});

console.log(`${passed} tests passed`);
