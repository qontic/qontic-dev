import { test, expect } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';

test.beforeAll(() => mkdir('validation', { recursive: true }));

test('GPU quiver samples agree with independent velocities across both classicality ranges', async ({ page }) => {
  await page.goto('/?test=1&paused=1&seed=2');
  await page.waitForFunction(() => window.__classicalLimit?.ready);
  const report = await page.evaluate(async () => {
    const { Renderer, TrailHistory } = await import('/src/renderer.js');
    const { Experiment, BOX } = await import('/src/physics.js');
    const { ObstacleExperiment } = await import('/src/obstacle-gpu.js');
    const { PACKET_CENTER } = await import('/src/obstacle-physics.js');
    const renderer = new Renderer(document.createElement('canvas'));
    renderer.recordingSize = [960, 600]; renderer.recordingScale = 1;
    const gl = renderer.gl, cases = [], appearance = { showWave: true, showPhase: true, showVelocity: true, brightness: 1 };
    for (const full of [false, true]) for (const classicality of [0, .3, 1]) {
      const experiment = full ? new ObstacleExperiment(gl, { classicality, edge: false, seed: 2 }) : new Experiment({ classicality, seed: 2 });
      for (const time of [0, .2]) {
        experiment.evaluate(time);
        const before = [...experiment.positions];
        renderer.render(experiment, new TrailHistory(1), appearance);
        const field = renderer.velocityField, values = new Float32Array(field.columns * field.rows * 4);
        gl.bindFramebuffer(gl.FRAMEBUFFER, field.framebuffer); gl.readPixels(0, 0, field.columns, field.rows, gl.RGBA, gl.FLOAT, values);
        const { alpha, kx, ky, sigma } = experiment.params;
        const exactX = full ? null : Array.from({ length: field.columns }, (_, i) => experiment.xAxis.currentVelocity((i + .5) / field.columns * BOX.width));
        const exactY = full ? null : Array.from({ length: field.rows }, (_, j) => experiment.yAxis.currentVelocity((j + .5) / field.rows * BOX.height));
        let maximumError = 0, samples = 0;
        for (let j = 0; j < field.rows; j++) for (let i = 0; i < field.columns; i++) {
          const index = 4 * (j * field.columns + i);
          if (values[index + 2] < .0002 || !values[index + 3]) continue;
          const x = (i + .5) / field.columns * BOX.width, y = (j + .5) / field.rows * BOX.height;
          const expansion = alpha * alpha * time / (4 * sigma ** 4 + alpha * alpha * time * time);
          const vx = full ? alpha * kx + expansion * (x - PACKET_CENTER[0] - alpha * kx * time) : exactX[i];
          const vy = full ? alpha * ky + expansion * (y - PACKET_CENTER[1] - alpha * ky * time) : exactY[j];
          maximumError = Math.max(maximumError, Math.hypot(values[index] - vx, values[index + 1] - vy)); samples++;
        }
        cases.push({ scene: full ? '2D Gaussian' : 'free spectral', classicality, time, maximumError, samples,
          finite: [...values].every(Number.isFinite), unchanged: JSON.stringify(before) === JSON.stringify([...experiment.positions]), glError: gl.getError() });
      }
      experiment.dispose?.();
    }
    renderer.dispose(); return cases;
  });
  await writeFile('validation/velocity-accuracy.json', JSON.stringify(report, null, 2));
  for (const result of report) {
    expect(result.finite).toBe(true); expect(result.unchanged).toBe(true); expect(result.glError).toBe(0);
    expect(result.samples).toBeGreaterThan(0);
    expect(result.maximumError).toBeLessThan(result.scene === 'free spectral' ? .0001 : .002);
  }
});

test('arrow length, thickness and opacity all increase with speed', async ({ page }) => {
  await page.goto('/?test=1&paused=1&seed=2');
  await page.waitForFunction(() => window.__classicalLimit?.ready);
  const report = await page.evaluate(async () => {
    const { Renderer, TrailHistory } = await import('/src/renderer.js'), { Experiment } = await import('/src/physics.js');
    const renderer = new Renderer(document.createElement('canvas')), gl = renderer.gl, experiment = new Experiment();
    renderer.recordingSize = [1200, 750]; renderer.recordingScale = 2;
    renderer.render(experiment, new TrailHistory(1), { showVelocity: true, brightness: 1 });
    const field = renderer.velocityField, values = new Float32Array(field.columns * field.rows * 4), results = [];
    gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    for (const speed of [.03, .18, .8]) {
      for (let i = 0; i < values.length; i += 4) values.set([speed, 0, 1, 1], i);
      gl.activeTexture(gl.TEXTURE4); gl.bindTexture(gl.TEXTURE_2D, field.texture);
      gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, field.columns, field.rows, gl.RGBA, gl.FLOAT, values);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null); gl.clearColor(0, 0, 0, 1); gl.clear(gl.COLOR_BUFFER_BIT);
      gl.useProgram(field.arrows.p); gl.bindVertexArray(field.vao);
      gl.drawArraysInstanced(gl.TRIANGLES, 0, 6, field.columns * field.rows);
      const width = Math.floor(1200 / field.columns), height = Math.floor(750 / field.rows), pixels = new Uint8Array(width * height * 4);
      gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
      let xMin = width, xMax = 0, peak = 0;
      for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
        const green = pixels[4 * (y * width + x) + 1]; peak = Math.max(peak, green);
        if (green > 10) { xMin = Math.min(xMin, x); xMax = Math.max(xMax, x); }
      }
      // Measure the shaft away from the arrowhead, relative to its own peak.
      const shaftX = Math.round(xMin + (xMax - xMin) * .28);
      let shaftPeak = 0; for (let y = 0; y < height; y++) shaftPeak = Math.max(shaftPeak, pixels[4 * (y * width + shaftX) + 1]);
      let thickness = 0; for (let y = 0; y < height; y++) if (pixels[4 * (y * width + shaftX) + 1] >= shaftPeak * .5) thickness++;
      results.push({ speed, length: xMax - xMin + 1, thickness, peak, glError: gl.getError() });
    }
    renderer.dispose(); return results;
  });
  await writeFile('validation/velocity-glyphs.json', JSON.stringify(report, null, 2));
  for (let i = 1; i < report.length; i++) for (const property of ['length', 'thickness', 'peak']) expect(report[i][property]).toBeGreaterThan(report[i - 1][property]);
  for (const result of report) expect(result.glError).toBe(0);
});

test('velocity toggle is independent, survives resize and appears in a 30 fps recording', async ({ page }) => {
  const errors = []; page.on('pageerror', error => errors.push(error.message));
  await page.goto('/?scene=barrier&test=1&paused=1&seed=2');
  await page.waitForFunction(() => window.__classicalLimit?.ready);
  await expect(page.locator('#show-velocity')).toBeChecked();
  await page.evaluate(() => window.__classicalLimit.run(3));
  await page.locator('#show-wave').uncheck(); await page.locator('#show-particles').uncheck(); await page.locator('#show-reference').uncheck();
  const pixels = () => page.evaluate(() => {
    window.__classicalLimit.run(0);
    const canvas = document.querySelector('#canvas'), gl = canvas.getContext('webgl2'), data = new Uint8Array(canvas.width * canvas.height * 4);
    gl.readPixels(0, 0, canvas.width, canvas.height, gl.RGBA, gl.UNSIGNED_BYTE, data);
    let bright = 0; for (let i = 0; i < data.length; i += 4) if (data[i + 1] > 45) bright++;
    return bright;
  });
  const before = await page.evaluate(() => window.__classicalLimit.snapshot());
  const withField = await pixels();
  await page.locator('#show-velocity').uncheck(); const withoutField = await pixels();
  expect(withField).toBeGreaterThan(withoutField + 1500);
  await page.locator('#show-velocity').check();
  await page.setViewportSize({ width: 390, height: 844 });
  await expect.poll(pixels).toBeGreaterThan(500);
  const after = await page.evaluate(() => window.__classicalLimit.snapshot());
  expect(after.positions).toEqual(before.positions); expect(after.time).toBe(before.time);
  await page.screenshot({ path: 'validation/velocity-mobile.png' });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.locator('#export-size').selectOption('1920'); await page.locator('#export-duration').fill('1');
  await page.locator('#export-start').selectOption('current');
  const downloaded = page.waitForEvent('download'); await page.locator('#record').click();
  const video = await downloaded; await video.saveAs('validation/velocity-field.mp4');
  const media = JSON.parse(execFileSync('ffprobe', ['-v', 'error', '-count_frames', '-show_streams', '-of', 'json', 'validation/velocity-field.mp4'], { encoding: 'utf8' }));
  expect(media.streams[0].avg_frame_rate).toBe('30/1'); expect(Number(media.streams[0].nb_read_frames)).toBe(30);
  execFileSync('ffmpeg', ['-hide_banner', '-v', 'error', '-xerror', '-ss', '0.5', '-i', 'validation/velocity-field.mp4', '-frames:v', '1', '-y', 'validation/velocity-video.png']);
  expect(errors).toEqual([]);
});
