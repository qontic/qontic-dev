import test from 'node:test';
import assert from 'node:assert/strict';
import { parameters } from '../src/physics.js';
import { obstacleParameters, initialParticles, classicalObstaclePosition, besselJ } from '../src/obstacle-physics.js';

test('the complete obstacle slider resolves its carrier and matches both launch velocity components', () => {
  for (let i = 0; i <= 100; i++) for (const angle of [-180, -135, -90, -45, 0, 37, 90, 180]) {
    const p = obstacleParameters(i / 100, angle);
    const velocity = k => p.alpha / p.dx * (8 * Math.sin(k * p.dx) / 5 - 2 * Math.sin(2 * k * p.dx) / 5 + 8 * Math.sin(3 * k * p.dx) / 105 - Math.sin(4 * k * p.dx) / 140);
    assert.ok(Math.abs(velocity(p.kx) - p.vx) < 1e-12);
    assert.ok(Math.abs(velocity(p.ky) - p.vy) < 1e-12);
    assert.ok(Math.max(Math.abs(p.kx), Math.abs(p.ky)) * p.dx <= 1);
    assert.equal(p.sigma, parameters(i / 100, angle).sigma);
    assert.equal(p.nx * 5 / 8, p.ny);
  }
});

test('the adaptive propagator approximates the unitary exponential throughout its spectrum and timestep range', () => {
  for (const z of [0.01, 0.2, 0.5, 1, 2, 4, 8]) for (let i = 0; i <= 200; i++) {
    const x = -1 + i / 100;
    let previous = 1, current = x, re = besselJ(0, z), im = 0;
    let degree = 8;
    while (degree < 24 && Math.abs(2 * besselJ(degree + 1, z)) > 1e-10) degree++;
    for (let n = 1; n <= degree; n++) {
      const value = n === 1 ? current : 2 * x * current - previous;
      if (n > 1) { previous = current; current = value; }
      const c = 2 * besselJ(n, z) * value;
      if (n % 4 === 0) re += c; else if (n % 4 === 1) im -= c; else if (n % 4 === 2) re -= c; else im += c;
    }
    assert.ok(Math.hypot(re - Math.cos(z * x), im + Math.sin(z * x)) < 1e-9);
    assert.ok(Math.abs(re * re + im * im - 1) < 2e-9);
  }
});

test('seeds preserve the first particle when the ensemble changes', () => {
  const p = obstacleParameters(.3);
  assert.deepEqual([...initialParticles(p, 2, 1)], [...initialParticles(p, 2, 256).subarray(0, 2)]);
  assert.notDeepEqual([...initialParticles(p, 2, 1)], [...initialParticles(p, 3, 1)]);
});

test('the classical comparison reflects from the edge below its tip and passes above it', () => {
  const reflected = classicalObstaclePosition([.44, .4], [.18, 0], 3);
  assert.ok(Math.abs(reflected[0] - .62) < 1e-12); assert.equal(reflected[1], .4);
  const passed = classicalObstaclePosition([.44, .6], [.18, 0], 3);
  assert.ok(Math.abs(passed[0] - .98) < 1e-12); assert.equal(passed[1], .6);
  const outer = classicalObstaclePosition([.44, .6], [.18, 0], 8);
  assert.ok(Math.abs(outer[0] - 1.32) < 1e-12);
  const upward = classicalObstaclePosition([.44, .4], [.18, .1], 3);
  assert.ok(Math.abs(upward[0] - .98) < 1e-12); assert.ok(Math.abs(upward[1] - .7) < 1e-12);
});
