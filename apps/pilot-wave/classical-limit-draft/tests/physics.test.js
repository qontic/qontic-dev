import test from 'node:test';
import assert from 'node:assert/strict';
import { fftPlan } from '../src/fft.js';
import { BOX, Experiment, BoxAxis, parameters, LAUNCH_SPEED, classicalPosition } from '../src/physics.js';

const near = (actual, expected, tolerance, message) => assert.ok(Math.abs(actual - expected) <= tolerance, `${message}: ${actual} vs ${expected}, tolerance ${tolerance}`);

test('FFT resolves a known Fourier mode and round trips complex data', () => {
  const n = 128, re = new Float64Array(n), im = new Float64Array(n);
  for (let i = 0; i < n; i++) { re[i] = Math.cos(2 * Math.PI * 13 * i / n); im[i] = Math.sin(2 * Math.PI * 13 * i / n); }
  const plan = fftPlan(n); plan.transform(re, im);
  near(re[13], n, 1e-11, 'Mode amplitude');
  for (let i = 0; i < n; i++) if (i !== 13) near(Math.hypot(re[i], im[i]), 0, 1e-11, 'No other modes');
  plan.transform(re, im, true);
  for (let i = 0; i < n; i++) {
    near(re[i], Math.cos(2 * Math.PI * 13 * i / n), 1e-13, 'Real round trip');
    near(im[i], Math.sin(2 * Math.PI * 13 * i / n), 1e-13, 'Imaginary round trip');
  }
});

test('continuous slider lowers quantum scale while p/m stays fixed', () => {
  let previous = parameters(0);
  for (let i = 0; i <= 1000; i++) {
    const p = parameters(i / 1000, 137);
    near(p.momentum / p.mass, LAUNCH_SPEED, 1e-15, 'Matched physical launch speed');
    near(Math.hypot(p.vx, p.vy), LAUNCH_SPEED, 1e-15, 'Angle preserves speed');
    assert.ok(p.alpha <= previous.alpha && p.sigma <= previous.sigma && p.mass >= previous.mass);
    if (i > 0) assert.ok(p.mass / previous.mass < 1.010, 'No discontinuity between regimes');
    previous = p;
  }
});

test('extended classical endpoint halves the actual free-packet spread and preserves launch speed', () => {
  const p = parameters(1);
  near(p.sigma, .014, 1e-15, 'Half the previous endpoint width');
  near(p.alpha, .00003, 1e-15, 'Quarter the quantum scale');
  near(p.spreadingTime, 2 * .028 ** 2 / .00012, 1e-12, 'Unchanged relative spreading time');
  near(p.momentum / p.mass, LAUNCH_SPEED, 1e-15, 'Matched launch speed');
  assert.equal(p.intervals, 32768);
  const oldPacket = new BoxAxis({ length: 2, center: .5, sigma: .028, velocity: LAUNCH_SPEED, alpha: .00012, intervals: 4096 });
  const newPacket = new BoxAxis({ length: 2, center: .5, sigma: p.sigma, velocity: LAUNCH_SPEED, alpha: p.alpha, intervals: p.intervals });
  const width = axis => {
    let mean = 0, variance = 0;
    for (let j = 0; j <= axis.n; j++) mean += j * axis.dx * axis.rho[j] * axis.dx;
    for (let j = 0; j <= axis.n; j++) variance += (j * axis.dx - mean) ** 2 * axis.rho[j] * axis.dx;
    return Math.sqrt(variance);
  };
  for (const t of [0, 1, 3, 5]) {
    oldPacket.evaluate(t); newPacket.evaluate(t);
    near(width(newPacket) / width(oldPacket), .5, 1e-9, 'Measured density width ratio');
  }
});

test('measured Bohmian launch velocity matches requested speed throughout slider and angles', () => {
  for (let i = 0; i <= 10; i++) for (const angle of [-180, -90, -31, 0, 45, 90, 180]) {
    const e = new Experiment({ classicality: i / 10, angle, count: 8, seed: 2 });
    const before = e.positions.slice(), dt = 0.0001;
    e.evaluate(dt);
    for (let j = 0; j < e.count; j++) {
      near((e.positions[2 * j] - before[2 * j]) / dt, e.params.vx, 0.00015, `vx at ${i / 10}, ${angle}`);
      near((e.positions[2 * j + 1] - before[2 * j + 1]) / dt, e.params.vy, 0.00015, `vy at ${i / 10}, ${angle}`);
    }
  }
});

test('free-packet quantile follows its analytic Gaussian trajectory before reflection', () => {
  const alpha = 0.002, sigma = 0.045, center = 0.5, velocity = 0.13;
  const axis = new BoxAxis({ length: 2, alpha, sigma, center, velocity });
  const initial = [.1, .3, .5, .7, .9].map(q => axis.position(q));
  for (const time of [0.1, 0.3, 0.5]) {
    axis.evaluate(time);
    for (const [i, q] of [.1, .3, .5, .7, .9].entries()) {
      const expected = center + velocity * time + (initial[i] - center) * Math.sqrt(1 + (alpha * time / (2 * sigma ** 2)) ** 2);
      near(axis.position(q), expected, 2e-6, 'Analytic spreading');
    }
  }
});

test('probability trajectories agree with independently evaluated phase-gradient guidance, including reflections', () => {
  for (const s of [0, .5, 1]) {
    const e = new Experiment({ classicality: s });
    for (const axis of [e.xAxis, e.yAxis]) for (const t of [0.1, 1, 3, 4.6, 6, 8.1, 12, 30]) for (const q of [.1, .3, .5, .7, .9]) {
      const dt = 0.00002;
      axis.evaluate(t - dt); const a = axis.position(q);
      axis.evaluate(t + dt); const b = axis.position(q);
      axis.evaluate(t);
      const velocity = axis.currentVelocity(axis.position(q), t);
      near((b - a) / (2 * dt), velocity, 0.0008, `Guidance s=${s}, t=${t}, q=${q}`);
    }
  }
});

test('all domains, directions and long times preserve probability, walls and quantiles', () => {
  let maxError = 0;
  for (let i = 0; i <= 20; i++) for (const angle of [-177, -90, 0, 37, 90, 180]) {
    const e = new Experiment({ classicality: i / 20, angle, count: 128, seed: 813 });
    for (const t of [0, .1, 1, 4.7, 8.1, 15, 30, 60, 300, 3600, 86400, 1000000]) {
      e.evaluate(t);
      const d = e.diagnostics(); maxError = Math.max(maxError, d.normError);
      assert.ok(d.finite && d.spectralTail < 1e-20);
      near(e.xAxis.re[0], 0, 0, 'Left hard wall'); near(e.xAxis.re[e.xAxis.n], 0, 0, 'Right hard wall');
      for (let j = 0; j < e.count; j++) {
        const x = e.positions[2 * j], y = e.positions[2 * j + 1];
        assert.ok(x > 0 && x < BOX.width && y > 0 && y < BOX.height);
        near(e.xAxis.probabilityAt(x), e.quantiles[2 * j], 1e-11, 'Conserved x probability');
        near(e.yAxis.probabilityAt(y), e.quantiles[2 * j + 1], 1e-11, 'Conserved y probability');
      }
    }
  }
  assert.ok(maxError < 5e-12, `Maximum raw norm error ${maxError}`);
});

test('trajectory ordering survives near nodes and resolution refinement converges', () => {
  for (const s of [0, .5, 1]) {
    const n = parameters(s).intervals;
    const coarse = new Experiment({ classicality: s, intervals: n / 2, count: 128, seed: 129 });
    const fine = new Experiment({ classicality: s, intervals: n, count: 128, seed: 129 });
    const reference = new Experiment({ classicality: s, intervals: n * 2, count: 128, seed: 129 });
    let coarseError = 0, fineError = 0;
    for (const t of [1, 4.65, 4.9, 8, 8.3, 20, 30]) {
      coarse.evaluate(t); fine.evaluate(t); reference.evaluate(t);
      for (let i = 0; i < fine.positions.length; i++) {
        coarseError += (coarse.positions[i] - reference.positions[i]) ** 2;
        fineError += (fine.positions[i] - reference.positions[i]) ** 2;
        near(fine.positions[i], reference.positions[i], 0.0007, 'Resolved positions at reflections');
      }
      for (const axis of [fine.xAxis, fine.yAxis]) {
        let previous = 0;
        for (let i = 1; i < 1000; i++) { const x = axis.position(i / 1000); assert.ok(x > previous); previous = x; }
      }
    }
    assert.ok(fineError < coarseError * .25, `Refinement reduces error for s=${s}: ${fineError}/${coarseError}`);
  }
});

test('absolute-time evolution is reversible and independent of the rendering cadence', () => {
  for (const s of [0, .5, 1]) {
    const e = new Experiment({ classicality: s, count: 8, seed: 2 });
    e.evaluate(12.5); const expected = e.positions.slice(), wave = e.xAxis.re.slice();
    for (let t = 0; t < 12.5; t += .037) e.evaluate(t);
    e.evaluate(12.5); assert.deepEqual(e.positions, expected); assert.deepEqual(e.xAxis.re, wave);
    e.evaluate(86400); e.evaluate(0); assert.deepEqual(e.positions, e.initialPositions);
  }
});

test('classical endpoint approaches specular flights while quantum endpoint visibly departs', () => {
  const errors = [];
  for (const s of [0, .5, 1]) {
    const e = new Experiment({ classicality: s, seed: 2 });
    let squareError = 0;
    for (let i = 1; i <= 1200; i++) {
      const t = i / 60; e.evaluate(t);
      squareError += (e.positions[0] - classicalPosition(e.initialPositions[0], e.params.vx, t, BOX.width)) ** 2;
      squareError += (e.positions[1] - classicalPosition(e.initialPositions[1], e.params.vy, t, BOX.height)) ** 2;
    }
    errors.push(Math.sqrt(squareError / 1200));
  }
  assert.ok(errors[0] > .3 && errors[1] < errors[0] && errors[2] < .045, `Classical comparison RMS: ${errors}`);
});
