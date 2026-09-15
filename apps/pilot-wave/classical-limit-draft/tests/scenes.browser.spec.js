import { test, expect } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';

const snapshot = page => page.evaluate(() => window.__classicalLimit.snapshot());
const setRange = (page, id, value) => page.locator(`#${id}`).evaluate((input, next) => {
  input.value = String(next); input.dispatchEvent(new Event('input', { bubbles: true }));
}, value);

test('scenes remember independent ranges, restart cleanly and preserve shared appearance', async ({ page }) => {
  const errors = []; page.on('pageerror', error => errors.push(error.message));
  await page.goto('/?scene=barrier&paused=1&test=1');
  await page.waitForFunction(() => window.__classicalLimit?.ready);
  await expect(page.locator('#scene-barrier')).toBeChecked();
  await expect(page.locator('#phase-palette')).toHaveCount(0);
  await setRange(page, 'classicality', .73);
  await setRange(page, 'angle', 37);
  await setRange(page, 'count', 64);
  await setRange(page, 'dot-size', 12);
  await setRange(page, 'trail-seconds', 4);
  await setRange(page, 'playback', 3);
  await page.locator('#show-reference').check();
  await expect.poll(async () => (await snapshot(page)).count).toBe(64);
  await page.evaluate(() => window.__classicalLimit.run(.4));
  const barrier = await snapshot(page);

  await page.locator('#scene-free').check();
  await expect.poll(async () => (await snapshot(page)).params.alpha).toBe(.0144);
  let free = await snapshot(page);
  expect(free.time).toBe(0); expect(free.historyLength).toBe(1);
  expect(free.params.classicality).toBe(0);
  expect(free.positions).not.toEqual(barrier.positions);
  expect(free.appearance).toEqual(barrier.appearance);
  expect(free.settings.angle).toBe(37); expect(free.count).toBe(64); expect(free.paused).toBe(true);
  await setRange(page, 'classicality', 1);
  await expect.poll(async () => (await snapshot(page)).params.intervals).toBe(32768);
  free = await snapshot(page);
  expect(free.params.alpha).toBeCloseTo(.00003, 12);
  expect(free.params.spreadingTime).toBeCloseTo(13.0666666667, 8);

  for (let i = 0; i < 3; i++) {
    await page.locator('#scene-barrier').check();
    await expect.poll(async () => (await snapshot(page)).params.classicality).toBe(.73);
    const restoredBarrier = await snapshot(page);
    expect(restoredBarrier.time).toBe(0); expect(restoredBarrier.historyLength).toBe(1);
    expect(restoredBarrier.params.alpha).toBe(barrier.params.alpha);
    expect(restoredBarrier.appearance).toEqual(barrier.appearance);
    await page.evaluate(() => window.__classicalLimit.run(.1));
    await page.locator('#scene-free').check();
    await expect.poll(async () => (await snapshot(page)).params.intervals).toBe(32768);
    const restoredFree = await snapshot(page);
    expect(restoredFree.params.classicality).toBe(1); expect(restoredFree.time).toBe(0);
    expect(restoredFree.positions).not.toEqual(free.positions);
    expect(restoredFree.failed).toBe(false); expect(restoredFree.glError).toBe(0);
  }
  // Native radio keyboard navigation also changes the physical scene.
  await page.locator('#scene-free').focus(); await page.keyboard.press('ArrowRight');
  await expect(page.locator('#scene-barrier')).toBeChecked();
  await expect.poll(async () => (await snapshot(page)).params.classicality).toBe(.73);

  const legend = await page.locator('#phase-legend-canvas').evaluate(canvas => {
    const ctx = canvas.getContext('2d');
    const at = (x, y) => [...ctx.getImageData(Math.round(x * canvas.width / 168), Math.round(y * canvas.height / 148), 1, 1).data];
    return { positive: at(84, 49), negative: at(84, 99), label: canvas.getAttribute('aria-label') };
  });
  expect(legend.positive[2]).toBeGreaterThan(legend.positive[0] + 150);
  expect(legend.negative[0]).toBeGreaterThan(legend.negative[2] + 150);
  await mkdir('validation', { recursive: true });
  const views = [];
  await setRange(page, 'playback', 1);
  for (const obstacle of [true, false]) {
    await page.evaluate(obstacle => { window.__classicalLimit.configure({ obstacle, classicality: .3, angle: 0 }); window.__classicalLimit.run(3); }, obstacle);
    views.push(await snapshot(page));
    await page.screenshot({ path: `validation/unified-${obstacle ? 'barrier' : 'free'}.png`, fullPage: true });
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.getByLabel('Without barrier', { exact: true })).toBeChecked();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: 'validation/unified-mobile.png', fullPage: true });
  expect(errors).toEqual([]);
  await writeFile('validation/unified-scenes.json', JSON.stringify({ barrier, free, views, legend, errors }, null, 2));
});

test('both scene endpoints record the selected solver, red-blue legend and ensemble', async ({ page }) => {
  test.setTimeout(180000);
  await page.goto('/?scene=free&paused=1&test=1&classicality=1&count=64&angle=0');
  await page.waitForFunction(() => window.__classicalLimit?.ready);
  await page.locator('#show-reference').check();
  await setRange(page, 'dot-size', 12); await setRange(page, 'trail-seconds', 4);
  await page.locator('#export-size').selectOption('1920');
  await page.locator('#export-duration').fill('1');
  await page.locator('#export-start').selectOption('current');
  const reports = [];
  for (const scene of ['free', 'barrier']) {
    await page.locator(`#scene-${scene}`).check();
    await setRange(page, 'classicality', 1);
    await expect.poll(async () => (await snapshot(page)).params.alpha).toBeCloseTo(scene === 'free' ? .00003 : .00015, 12);
    await page.evaluate(() => window.__classicalLimit.run(3));
    const before = await snapshot(page);
    const downloaded = page.waitForEvent('download');
    await page.locator('#record').click();
    await expect(page.locator('#scene-free')).toBeDisabled();
    await expect(page.locator('#scene-barrier')).toBeDisabled();
    const download = await downloaded;
    expect(download.suggestedFilename()).toContain(scene === 'free' ? 'without-barrier' : 'with-barrier');
    const file = `validation/unified-export-${scene}.mp4`; await download.saveAs(file);
    await expect(page.locator('#scene-free')).toBeEnabled();
    const after = await snapshot(page), report = after.lastExport;
    expect(after.positions).toEqual(before.positions); expect(after.time).toBe(before.time);
    expect(after.paused).toBe(true); expect(after.glError).toBe(0);
    expect(report.scene).toBe(scene); expect(report.frames).toBe(30);
    expect(report.finalState.params.alpha).toBe(before.params.alpha);
    expect(report.finalState.count).toBe(64); expect(report.finalState.finite).toBe(true);
    expect(report.finalState.time).toBeCloseTo(before.time + 29 / 30, 8);
    expect(report.finalState.normError).toBeLessThan(scene === 'free' ? 1e-10 : .001);
    const media = JSON.parse(execFileSync(process.env.CLASSICALLIMIT_FFPROBE || 'ffprobe', [
      '-v', 'error', '-count_frames', '-show_streams', '-show_format', '-of', 'json', file,
    ], { encoding: 'utf8' }));
    const stream = media.streams[0];
    expect(stream.width).toBe(1920); expect(stream.height).toBe(1200);
    expect(stream.avg_frame_rate).toBe('30/1'); expect(Number(stream.nb_read_frames)).toBe(30);
    expect(Number(media.format.duration)).toBeCloseTo(1, 5);
    execFileSync('ffmpeg', ['-hide_banner', '-v', 'error', '-xerror', '-ss', '0.5', '-i', file,
      '-frames:v', '1', '-y', `validation/unified-export-${scene}.png`]);
    reports.push({ scene, report, media });
  }
  await writeFile('validation/unified-exports.json', JSON.stringify(reports, null, 2));
});
