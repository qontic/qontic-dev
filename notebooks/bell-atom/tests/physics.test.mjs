// Run with: node notebooks/bell-atom/tests/physics.test.mjs
import assert from 'node:assert/strict';
import { BellAtom, steadyOrbit, toPrimed, movingChargeField, gammaOf, makeProgram } from '../js/physics.js';

const close = (a, b, tol, msg) => assert.ok(Math.abs(a - b) <= tol, `${msg}: ${a} vs ${b}`);
let passed = 0;
const test = (name, fn) => { const t0 = Date.now(); fn(); passed++; console.log('ok', name, `(${Date.now() - t0} ms)`); };

test('Field of a moving charge: Coulomb at rest; transverse/longitudinal ratio gamma^3', () => {
  const r = movingChargeField(2, 0, 0, 1); close(r.Ex, 0.25, 1e-12, 'Coulomb');
  const V = 0.8, g = gammaOf(V);
  close(movingChargeField(1, 0, V).Ex / movingChargeField(0, 1, V).Ez, g ** 3, 1e-9, 'ratio');
  // equipotential through (1,0) passes through (0, 1/gamma)
  close(movingChargeField(1, 0, V).phi, movingChargeField(0, 1 / g, V).phi, 1e-12, 'flattened equipotential');
});

test('Speed program: position is the integral of speed', () => {
  const p = makeProgram(0.8, 100); const h = 1e-4;
  for (const t of [10, 50, 99, 150]) close((p.z(t + h) - p.z(t - h)) / (2 * h), p.V(t), 1e-6, `t=${t}`);
});

test('Atom at rest keeps a circular orbit with period T0 (relativistic circular start)', () => {
  const a = new BellAtom({ Vf: 0, rampOrbits: 10 });
  for (let i = 0; i < 6; i++) a.step(300);
  close(a.last.width, 2, 0.003, 'width'); close(a.last.length, 2, 0.003, 'length'); close(a.last.period / a.T0, 1, 0.003, 'period');
});

test("Bell's result: at 0.8 c the orbit contracts by 1/gamma and slows by gamma", () => {
  const a = new BellAtom({ Vf: 0.8, rampOrbits: 100 });
  while (a.t < a.prog.Tacc + 4 * a.T0) a.step(300);
  const g = gammaOf(0.8);
  close(a.last.length / a.last.width, 1 / g, 0.01, 'contraction');
  close(a.last.period / a.T0, g, 0.015, 'period');
});

test('In the moving observer variables the orbit is a circle with period near T0', () => {
  const o = steadyOrbit({ Vf: 0.6, rampOrbits: 80, revolutions: 2 });
  const nuc = toPrimed({ t: 0, x: 0, z: o.c0 }, o.Vf).z; // nucleus z' is constant
  let zmin = Infinity, zmax = -Infinity, xmin = Infinity, xmax = -Infinity;
  for (const e of o.events) { const p = toPrimed(e, o.Vf); zmin = Math.min(zmin, p.z - nuc); zmax = Math.max(zmax, p.z - nuc); xmin = Math.min(xmin, p.x); xmax = Math.max(xmax, p.x); }
  close((zmax - zmin) / (xmax - xmin), 1, 0.01, 'circular in primed variables');
});

test('Pushing only the nucleus excites eccentricity (why the notebook pushes both)', () => {
  const a = new BellAtom({ Vf: 0.3, rampOrbits: 60, pushElectron: false });
  while (a.t < a.prog.Tacc + 3 * a.T0 && !a.lost) a.step(300);
  assert.ok(a.lost || Math.abs(a.last.width - 2) > 0.1, `width ${a.last && a.last.width}`);
});

test('Nucleus-only push at the default settings: the run stops when the electron reaches the nucleus', () => {
  const a = new BellAtom({ Vf: 0.8, rampOrbits: 100, pushElectron: false });
  while (a.t < a.prog.Tacc + 6 * a.T0 && !a.lost) a.step(300);
  assert.ok(a.lost && a.lost.r < BellAtom.R_MIN, 'electron should be flagged as lost near the nucleus');
  const t = a.t; a.step(10); assert.equal(a.t, t, 'no further steps after the electron is lost');
});

test('With both particles pushed the electron is never lost (0.2 to 0.95 c, short and long pushes)', () => {
  for (const Vf of [0.2, 0.8, 0.95]) for (const rampOrbits of [40, 200]) {
    const a = new BellAtom({ Vf, rampOrbits });
    while (a.t < a.prog.Tacc + 2 * a.T0 && !a.lost) a.step(300);
    assert.equal(a.lost, null, `Vf=${Vf}, ramp=${rampOrbits}`);
  }
});

test('The contraction does not depend on the length of the push (0.8 c; 40, 100, 200 orbits)', () => {
  for (const rampOrbits of [40, 100, 200]) {
    const a = new BellAtom({ Vf: 0.8, rampOrbits });
    while (a.t < a.prog.Tacc + 3 * a.T0) a.step(300);
    close(a.last.length / a.last.width, 0.6, 0.003, `ramp ${rampOrbits}`);
  }
});

console.log(`${passed} tests passed`);
