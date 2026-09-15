import { test, expect } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';

test('GPU trail width follows 60 percent of the particle diameter at different sizes and zooms', async ({ page }) => {
  await page.goto('/?obstacle=0&paused=1');
  const result = await page.evaluate(async () => {
    const { Renderer } = await import('/src/renderer.js');
    const canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:fixed;left:-1000px;width:600px;height:240px';
    document.body.append(canvas);
    const renderer = new Renderer(canvas), gl = renderer.gl, measures = [];
    renderer.resize();
    const columnWidth = (floating = false) => {
      const pixels = floating ? new Float32Array(canvas.height * 4) : new Uint8Array(canvas.height * 4);
      gl.readPixels(Math.floor(canvas.width / 2), 0, 1, canvas.height, gl.RGBA, floating ? gl.FLOAT : gl.UNSIGNED_BYTE, pixels);
      let width = 0;
      for (let y = 0; y < canvas.height; y++) if (pixels[4 * y] > (floating ? .001 : 0)) width++;
      return width;
    };
    for (const size of [12, 30, 48]) for (const zoom of [1, 4]) {
      renderer.zoom = zoom;
      gl.bindFramebuffer(gl.FRAMEBUFFER, null); gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
      gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      renderer.drawTrails(new Float32Array([.64, .5, .62, .96, .5, .62]), size);
      gl.bindFramebuffer(gl.FRAMEBUFFER, renderer.trailFramebuffer);
      const trailPixels = columnWidth(true);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null); gl.clear(gl.COLOR_BUFFER_BIT);
      renderer.drawPoints([.8, .5], [1, .9, .3], size);
      const particlePixels = columnWidth();
      measures.push({ size, zoom, trailPixels, particlePixels, expectedDiameter: size * renderer.dpr * Math.sqrt(zoom), glError: gl.getError() });
    }
    renderer.dispose(); canvas.remove(); return measures;
  });
  for (const measurement of result) {
    expect(measurement.glError).toBe(0);
    expect(Math.abs(measurement.particlePixels - measurement.expectedDiameter)).toBeLessThanOrEqual(2);
    // Soft edges quantize at the final 8-bit pixel; allow two edge pixels.
    expect(Math.abs(measurement.trailPixels - measurement.expectedDiameter * .6)).toBeLessThanOrEqual(2);
  }
  await mkdir('validation', { recursive: true });
  await writeFile('validation/trail-width-report.json', JSON.stringify(result, null, 2));
});

test('the original obstacle-free experiment renders and survives slider sweeps, playback, resize and recording', async ({ page }) => {
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', e => { if (e.type() === 'error') errors.push(e.text()); });
  await page.goto('/?obstacle=0&test=1&paused=1');
  await expect.poll(() => page.evaluate(() => Boolean(window.__classicalLimit?.ready))).toBe(true);
  const initial = await page.evaluate(() => window.__classicalLimit.snapshot());
  expect(initial.glError).toBe(0); expect(initial.failed).toBe(false);
  await mkdir('validation', { recursive: true });
  const states = [];
  for (const s of [0, .2, .4, .6, .8, 1]) {
    const result = await page.evaluate(s => {
      window.__classicalLimit.configure({ classicality: s, seed: 2 });
      window.__classicalLimit.run(20, 1 / 40);
      return window.__classicalLimit.snapshot();
    }, s);
    states.push(result);
    expect(result.finite).toBe(true); expect(result.normError).toBeLessThan(1e-10);
    expect(result.glError).toBe(0); expect(result.historyLength).toBeGreaterThan(800);
    await page.screenshot({ path: `validation/regime-${Math.round(s * 100)}.png`, fullPage: true });
  }
  // Actual DOM input sequence includes rapid reversals and endpoint changes.
  await page.evaluate(() => {
    const slider = document.getElementById('classicality');
    for (let i = 0; i < 301; i++) { slider.value = String((i * 37 % 101) / 100); slider.dispatchEvent(new Event('input', { bubbles: true })); }
    slider.value = '.537'; slider.dispatchEvent(new Event('input', { bubbles: true }));
  });
  await expect.poll(() => page.evaluate(() => window.__classicalLimit.snapshot().params.classicality)).toBe(.537);
  expect(await page.locator('#classicality-value').textContent()).toBe('54%');
  await page.locator('#classicality').focus(); await page.keyboard.press('ArrowRight');
  await expect.poll(() => page.evaluate(() => window.__classicalLimit.snapshot().params.classicality)).toBe(.538);

  // Verify actual elapsed-time speed, independently at both ends.
  const clocks = [];
  for (const s of [0, 1]) {
    await page.evaluate(s => { window.__classicalLimit.configure({ classicality: s }); window.__classicalLimit.pause(false); }, s);
    const start = await page.evaluate(() => ({ wall: performance.now(), sim: window.__classicalLimit.snapshot().time }));
    await expect.poll(() => page.evaluate(() => window.__classicalLimit.snapshot().time), { timeout: 10000 }).toBeGreaterThan(2.5);
    const end = await page.evaluate(() => { const r = { wall: performance.now(), ...window.__classicalLimit.snapshot() }; window.__classicalLimit.pause(true); return r; });
    const ratio = (end.time - start.sim) / ((end.wall - start.wall) / 1000);
    expect(ratio).toBeGreaterThan(.91); expect(ratio).toBeLessThan(1.06);
    clocks.push({ classicality: s, clockRatio: ratio, fps: end.fps });
  }

  const beforeResize = await page.evaluate(() => window.__classicalLimit.snapshot());
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.locator('#classicality')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  const mobile = await page.evaluate(() => window.__classicalLimit.snapshot());
  expect(mobile.positions).toEqual(beforeResize.positions); expect(mobile.time).toBe(beforeResize.time);
  await page.screenshot({ path: 'validation/mobile.png', fullPage: true });
  await page.setViewportSize({ width: 1440, height: 1000 });

  await expect(page.locator('#appearance')).toHaveAttribute('open', '');
  await page.locator('#count').focus(); await page.keyboard.press('End');
  await expect.poll(() => page.evaluate(() => window.__classicalLimit.snapshot().count)).toBe(256);
  const many = await page.evaluate(() => { window.__classicalLimit.run(3); return window.__classicalLimit.snapshot(); });
  expect(many.finite).toBe(true); expect(many.glError).toBe(0);
  await page.locator('#show-wave').uncheck(); await page.locator('#show-particles').uncheck();
  const hidden = await page.evaluate(() => { window.__classicalLimit.run(1); return window.__classicalLimit.snapshot(); });
  expect(hidden.time).toBeCloseTo(4); expect(hidden.positions).not.toEqual(many.positions);
  await page.locator('#show-wave').check(); await page.locator('#show-particles').check();
  await page.locator('#count').focus(); await page.keyboard.press('Home');
  await expect.poll(() => page.evaluate(() => window.__classicalLimit.snapshot().count)).toBe(1);
  await page.locator('#show-reference').check();
  await page.evaluate(() => window.__classicalLimit.run(12));
  await page.screenshot({ path: 'validation/classical-comparison.png', fullPage: true });

  await page.locator('#export-size').selectOption('1920');
  await page.locator('#export-duration').fill('1');
  const downloadPromise = page.waitForEvent('download');
  await page.locator('#record').click();
  const download = await downloadPromise;
  await download.saveAs(`validation/recording.${download.suggestedFilename().endsWith('mp4') ? 'mp4' : 'webm'}`);
  await expect(page.locator('#record-label')).toHaveText('Render video · 30 fps');
  await page.evaluate(() => window.__classicalLimit.pause(true));

  expect(errors).toEqual([]);
  await writeFile('validation/browser-report.json', JSON.stringify({ initial, states, clocks, manyParticles: many, errors }, null, 2));
});

test('URL validation, graphics context recovery and paused keyboard controls', async ({ page }) => {
  await page.goto('/?obstacle=0&test=1&paused=1&classicality=Infinity&angle=oops&count=-90&seed=NaN');
  await expect.poll(() => page.evaluate(() => Boolean(window.__classicalLimit?.ready))).toBe(true);
  const initial = await page.evaluate(() => window.__classicalLimit.snapshot());
  expect(initial.count).toBe(1); expect(initial.params.classicality).toBe(0); expect(initial.params.angle).toBe(45);
  await page.locator('body').click({ position: { x: 900, y: 30 } });
  await page.keyboard.press('Space'); await expect(page.locator('#pause')).toHaveText('Pause');
  await page.keyboard.press('Space'); await expect(page.locator('#pause')).toHaveText('Play');
  await page.evaluate(() => window.__classicalLimit.recoverContext());
  await expect(page.locator('#error')).toBeHidden({ timeout: 15000 });
  await expect.poll(() => page.evaluate(() => window.__classicalLimit.snapshot().failed)).toBe(false);
  const recovered = await page.evaluate(() => window.__classicalLimit.snapshot());
  expect(recovered.glError).toBe(0); expect(recovered.paused).toBe(true);
});
