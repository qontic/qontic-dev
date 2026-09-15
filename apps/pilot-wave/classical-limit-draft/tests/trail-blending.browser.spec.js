import { test, expect } from '@playwright/test';
import { writeFile } from 'node:fs/promises';

test('overlapping trails accumulate warm colours without subdivision beads', async ({ page }) => {
  await page.goto('/?paused=1&test=1');
  await page.waitForFunction(() => window.__classicalLimit?.ready);
  const result = await page.evaluate(async () => {
    const { Renderer } = await import('/src/renderer.js');
    const canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:fixed;left:-1000px;width:600px;height:375px'; document.body.append(canvas);
    const renderer = new Renderer(canvas), gl = renderer.gl; renderer.resize();
    const h = [.2, .5, .62, 1.4, .5, .62], v = [.8, .2, .62, .8, .8, .62];
    const measure = values => {
      gl.bindFramebuffer(gl.FRAMEBUFFER, null); gl.clearColor(0, 0, 0, 1); gl.clear(gl.COLOR_BUFFER_BIT);
      gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      renderer.drawTrails(new Float32Array(values), 30);
      const rgba = new Uint8Array(4), density = new Float32Array(4);
      const x = Math.floor(canvas.width / 2), y = Math.floor(canvas.height / 2);
      gl.readPixels(x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, rgba);
      gl.bindFramebuffer(gl.FRAMEBUFFER, renderer.trailFramebuffer); gl.readPixels(x, y, 1, 1, gl.RGBA, gl.FLOAT, density);
      return { rgb: [...rgba].slice(0, 3), density: density[0], error: gl.getError() };
    };
    const segments = [];
    for (let i = 0; i < 64; i++) segments.push(.2 + 1.2 * i / 64, .5, .62, .2 + 1.2 * (i + 1) / 64, .5, .62);
    const result = { single: measure(h), crossing: measure([...h, ...v]), crowded: measure([...h, ...v, ...h, ...v]), subdivided: measure(segments), reversed: measure([...v, ...h]) };
    renderer.dispose(); canvas.remove(); return result;
  });
  for (const value of Object.values(result)) expect(value.error).toBe(0);
  expect(result.crossing.density).toBeGreaterThan(result.single.density * 1.9);
  expect(result.crowded.density).toBeGreaterThan(3.5);
  expect(result.crossing.rgb[0]).toBeGreaterThan(result.single.rgb[0]);
  expect(result.crowded.rgb[2]).toBeGreaterThan(result.single.rgb[2] + 30);
  expect(result.crowded.rgb[1] / result.crowded.rgb[0]).toBeLessThan(.8);
  expect(Math.abs(result.subdivided.density - result.single.density)).toBeLessThan(.01);
  for (let i = 0; i < 3; i++) {
    expect(Math.abs(result.subdivided.rgb[i] - result.single.rgb[i])).toBeLessThanOrEqual(2);
    expect(Math.abs(result.reversed.rgb[i] - result.crossing.rgb[i])).toBeLessThanOrEqual(2);
  }
  await writeFile('validation/trail-blending-report.json', JSON.stringify(result, null, 2));
});
