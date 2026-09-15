import { test, expect } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';

test('the 2D GPU wave and particles agree with the free Gaussian and matched separable solver', async ({ page }) => {
  await page.goto('/?obstacle=0&paused=1');
  const report = await page.evaluate(async () => {
    const { ObstacleExperiment } = await import('/src/obstacle-gpu.js');
    const { PACKET_CENTER } = await import('/src/obstacle-physics.js');
    const { BoxAxis, BOX } = await import('/src/physics.js');
    const gl = document.createElement('canvas').getContext('webgl2'), cases = [];
    for (const s of [0, .3, .5, .8, 1]) {
      const e = new ObstacleExperiment(gl, { classicality: s, edge: false, count: 8 });
      const before = e.positions.slice(), t = .2;
      const axes = [BOX.width, BOX.height].map((length, axis) => new BoxAxis({ length, center: PACKET_CENTER[axis],
        sigma: e.params.sigma, alpha: e.params.alpha, velocity: axis ? e.params.vy : e.params.vx }));
      axes.forEach(axis => axis.evaluate(0));
      const quantiles = [...before].map((position, i) => axes[i % 2].probabilityAt(position));
      axes.forEach(axis => axis.evaluate(t));
      e.evaluate(t); const wave = e.readWave(), p = e.params;
      let sum = 0, xMean = 0, yMean = 0, maxParticleError = 0, maxSpectralParticleError = 0;
      for (let j = 0; j < e.height; j++) for (let i = 0; i < e.width; i++) {
        const k = 4 * (j * e.width + i), rho = wave[k] ** 2 + wave[k + 1] ** 2;
        sum += rho; xMean += i * p.dx * rho; yMean += j * p.dx * rho;
      }
      xMean /= sum; yMean /= sum;
      const expansion = Math.sqrt(1 + (p.alpha * t / (2 * p.sigma ** 2)) ** 2);
      for (let i = 0; i < e.count; i++) {
        const x = PACKET_CENTER[0] + p.vx * t + (before[2 * i] - PACKET_CENTER[0]) * expansion;
        const y = PACKET_CENTER[1] + p.vy * t + (before[2 * i + 1] - PACKET_CENTER[1]) * expansion;
        maxParticleError = Math.max(maxParticleError, Math.hypot(x - e.positions[2 * i], y - e.positions[2 * i + 1]));
        maxSpectralParticleError = Math.max(maxSpectralParticleError, Math.hypot(
          axes[0].position(quantiles[2 * i]) - e.positions[2 * i], axes[1].position(quantiles[2 * i + 1]) - e.positions[2 * i + 1]));
      }
      cases.push({ classicality: s, waveSpeed: (xMean - PACKET_CENTER[0]) / t, yDrift: yMean - PACKET_CENTER[1],
        maxParticleError, maxSpectralParticleError, normError: e.diagnostics().normError, glError: gl.getError(), grid: [e.width, e.height] });
      e.dispose();
    }
    return cases;
  });
  await mkdir('validation', { recursive: true });
  await writeFile('validation/obstacle-free-gaussian.json', JSON.stringify(report, null, 2));
  for (const r of report) {
    expect(r.glError).toBe(0); expect(r.normError).toBeLessThan(.0001);
    expect(Math.abs(r.waveSpeed - .18)).toBeLessThan(.0018);
    expect(Math.abs(r.yDrift)).toBeLessThan(.0001);
    expect(r.maxParticleError).toBeLessThan(.0003);
    expect(r.maxSpectralParticleError).toBeLessThan(.0003);
  }
});

test('corner diffraction converges with grid and timestep refinement', async ({ page }) => {
  await page.goto('/?obstacle=0&paused=1');
  const report = await page.evaluate(async () => {
    const { ObstacleExperiment } = await import('/src/obstacle-gpu.js');
    const gl = document.createElement('canvas').getContext('webgl2');
    const run = (refinement, stepScale, forceRetry = false) => {
      const e = new ObstacleExperiment(gl, { classicality: .3, count: 8, refinement, stepScale });
      if (forceRetry) {
        const refresh = e.refresh.bind(e); let first = true;
        e.refresh = () => {
          if (first) { first = false; e.guidanceFailure = { injected: true }; throw new Error('Injected interval retry'); }
          return refresh();
        };
      }
      e.evaluate(3); const result = { state: e.diagnostics(), wave: e.readWave(), width: e.width, height: e.height };
      e.dispose(); return result;
    };
    const coarse = run(1, 1), fine = run(2, 1), halfStep = run(1, .5), recovered = run(1, 1, true);
    const difference = (a, b, stride) => {
      let densityL1 = 0;
      for (let j = 0; j < a.height; j++) for (let i = 0; i < a.width; i++) {
        const k = 4 * (j * a.width + i), l = 4 * (stride * j * b.width + stride * i);
        densityL1 += Math.abs(a.wave[k] ** 2 + a.wave[k + 1] ** 2 - b.wave[l] ** 2 - b.wave[l + 1] ** 2) * a.state.params.dx ** 2;
      }
      return { densityL1, shadowDifference: Math.abs(a.state.shadowProbability - b.state.shadowProbability),
        firstParticleDifference: Math.hypot(a.state.positions[0] - b.state.positions[0], a.state.positions[1] - b.state.positions[1]) };
    };
    return { grid: difference(coarse, fine, 2), timestep: difference(coarse, halfStep, 1),
      recovery: { ...difference(recovered, halfStep, 1), retries: recovered.state.guidanceRetries },
      states: [coarse.state, fine.state, halfStep.state], glError: gl.getError() };
  });
  await writeFile('validation/obstacle-convergence.json', JSON.stringify(report, null, 2));
  expect(report.glError).toBe(0);
  expect(report.grid.densityL1).toBeLessThan(.04);
  expect(report.grid.shadowDifference).toBeLessThan(.01);
  expect(report.grid.firstParticleDifference).toBeLessThan(.005);
  expect(report.timestep.densityL1).toBeLessThan(.002);
  expect(report.timestep.firstParticleDifference).toBeLessThan(.001);
  expect(report.recovery.retries).toBe(1); expect(report.recovery.densityL1).toBeLessThan(1e-7);
  expect(report.recovery.firstParticleDifference).toBeLessThan(1e-10);
  for (const state of report.states) {
    expect(state.normError).toBeLessThan(.0002); expect(state.boundaryDensity).toBe(0);
    expect(state.shadowProbability).toBeGreaterThan(.02);
  }
});

test('the obstacle survives the full slider, ensemble guidance and repeated switching', async ({ page }) => {
  const errors = []; page.on('pageerror', e => errors.push(e.message));
  page.on('console', e => { if (e.type() === 'error') errors.push(e.text()); });
  await page.goto('/?test=1&paused=1');
  await expect.poll(() => page.evaluate(() => Boolean(window.__classicalLimit?.ready))).toBe(true);
  await expect(page.locator('#scene-barrier')).toBeChecked();
  const states = [];
  for (const s of [0, .2, .4, .6, .8, 1]) {
    const r = await page.evaluate(s => {
      const api = window.__classicalLimit;
      api.configure({ classicality: s, count: 32, angle: 0, seed: 2, obstacle: true });
      let crossings = 0, previous = api.snapshot().positions;
      for (let i = 0; i < 240; i++) {
        api.run(.025); const state = api.snapshot(), next = state.positions;
        for (let j = 0; j < next.length; j += 2) {
          if ((previous[j] - .8) * (next[j] - .8) < 0) {
            const fraction = (.8 - previous[j]) / (next[j] - previous[j]);
            const y = previous[j + 1] + fraction * (next[j + 1] - previous[j + 1]);
            if (y < .5 - 2 * state.params.dx) crossings++;
          }
        }
        previous = next;
      }
      return { ...api.snapshot(), crossings };
    }, s);
    states.push(r);
    expect(r.finite).toBe(true); expect(r.failed).toBe(false); expect(r.glError).toBe(0);
    expect(r.normError).toBeLessThan(.001); expect(r.boundaryDensity).toBe(0); expect(r.crossings).toBe(0);
    await page.screenshot({ path: `validation/obstacle-regime-${Math.round(100 * s)}.png`, fullPage: true });
  }
  const ensemble = await page.evaluate(() => {
    const api = window.__classicalLimit; api.configure({ classicality: .3, count: 256, angle: 0 });
    api.run(4); return api.snapshot();
  });
  expect(ensemble.finite).toBe(true); expect(ensemble.glError).toBe(0); expect(ensemble.shadowProbability).toBeGreaterThan(.04);
  let shadowParticles = 0;
  for (let i = 0; i < ensemble.count; i++) if (ensemble.positions[2 * i] > .8 && ensemble.positions[2 * i + 1] < .5) shadowParticles++;
  expect(Math.abs(shadowParticles / ensemble.count - ensemble.shadowProbability)).toBeLessThan(.05);
  for (let i = 0; i < 4; i++) {
    await page.locator('#scene-free').check();
    await expect.poll(() => page.evaluate(() => window.__classicalLimit.snapshot().settings.obstacle)).toBe(false);
    await page.locator('#scene-barrier').check();
    await expect.poll(() => page.evaluate(() => window.__classicalLimit.snapshot().settings.obstacle)).toBe(true);
  }
  await page.evaluate(() => {
    const slider = document.getElementById('classicality');
    for (let i = 0; i < 100; i++) { slider.value = String((i * 37 % 101) / 100); slider.dispatchEvent(new Event('input', { bubbles: true })); }
    slider.value = '.3'; slider.dispatchEvent(new Event('input', { bubbles: true }));
  });
  await expect.poll(() => page.evaluate(() => window.__classicalLimit.snapshot().params.classicality)).toBe(.3);
  await page.locator('#show-reference').check();
  await page.evaluate(() => { window.__classicalLimit.configure({ count: 1 }); window.__classicalLimit.run(3); });
  const before = await page.evaluate(() => window.__classicalLimit.snapshot());
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  const after = await page.evaluate(() => window.__classicalLimit.snapshot());
  expect(after.positions).toEqual(before.positions); expect(after.time).toBe(before.time);
  await page.screenshot({ path: 'validation/obstacle-mobile.png', fullPage: true });
  await writeFile('validation/obstacle-browser.json', JSON.stringify({ states, ensemble, errors }, null, 2));
  expect(errors).toEqual([]);
});

test('obstacle playback uses the display clock at both ends and restores its graphics', async ({ page }) => {
  await page.goto('/?test=1&paused=1');
  await expect.poll(() => page.evaluate(() => Boolean(window.__classicalLimit?.ready))).toBe(true);
  const clocks = [];
  for (const s of [0, 1]) {
    await page.evaluate(s => { window.__classicalLimit.configure({ classicality: s }); window.__classicalLimit.pause(false); }, s);
    const start = await page.evaluate(() => ({ wall: performance.now(), time: window.__classicalLimit.snapshot().time }));
    await expect.poll(() => page.evaluate(() => window.__classicalLimit.snapshot().time), { timeout: 15000 }).toBeGreaterThan(2.5);
    const end = await page.evaluate(() => { window.__classicalLimit.pause(true); return { wall: performance.now(), ...window.__classicalLimit.snapshot() }; });
    const ratio = (end.time - start.time) / ((end.wall - start.wall) / 1000);
    clocks.push({ classicality: s, ratio, fps: end.fps, failed: end.failed });
    expect(end.failed).toBe(false); expect(ratio).toBeGreaterThan(.90); expect(ratio).toBeLessThan(1.10);
  }
  await page.evaluate(() => window.__classicalLimit.recoverContext());
  await expect(page.locator('#error')).toBeHidden({ timeout: 15000 });
  const recovered = await page.evaluate(() => window.__classicalLimit.snapshot());
  expect(recovered.failed).toBe(false); expect(recovered.paused).toBe(true); expect(recovered.time).toBe(0); expect(recovered.glError).toBe(0);
  await writeFile('validation/obstacle-clocks.json', JSON.stringify({ clocks, recovered }, null, 2));
});

test('long obstacle runs survive repeated reflections and rare fast motion near nodes', async ({ page }) => {
  await page.goto('/?test=1&paused=1');
  await expect.poll(() => page.evaluate(() => Boolean(window.__classicalLimit?.ready))).toBe(true);
  const results = [];
  for (const s of [0, .3, .65, 1]) {
    const result = await page.evaluate(s => {
      const api = window.__classicalLimit; api.configure({ classicality: s, count: 128, angle: 0, seed: 2 });
      api.run(30, .04); const q = api.snapshot();
      return { classicality: s, time: q.time, normError: q.normError, maxNormError: q.maxNormError,
        boundaryDensity: q.boundaryDensity, finite: q.finite, guidanceFailure: q.guidanceFailure,
        maxParticleSubsteps: q.maxParticleSubsteps, guidanceRetries: q.guidanceRetries, glError: q.glError };
    }, s);
    results.push(result);
    await writeFile('validation/obstacle-long-runs.json', JSON.stringify(results, null, 2));
    expect(result.time).toBeCloseTo(30); expect(result.finite).toBe(true); expect(result.glError).toBe(0);
    expect(result.maxNormError).toBeLessThan(.001); expect(result.boundaryDensity).toBe(0); expect(result.guidanceFailure).toBeUndefined();
  }
});
