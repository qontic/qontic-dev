import { test, expect } from '@playwright/test';
import { writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';

const probe = file => JSON.parse(execFileSync(process.env.CLASSICALLIMIT_FFPROBE || 'ffprobe', [
  '-v', 'error', '-count_frames', '-show_streams', '-show_format', '-of', 'json', file,
], { encoding: 'utf8' }));

test('offline export saves every frame at 30 fps and preserves the live state through resize and cancellation', async ({ page }) => {
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto('/?paused=1&test=1&seed=1');
  await page.waitForFunction(() => window.__classicalLimit?.ready);
  await page.evaluate(() => window.__classicalLimit.run(3.5));
  await page.locator('#show-reference').check();
  const before = await page.evaluate(() => window.__classicalLimit.snapshot());
  await page.locator('#export-duration').fill('2');
  await page.locator('#export-size').selectOption('1920');
  await page.locator('#export-start').selectOption('current');
  const downloaded = page.waitForEvent('download', { timeout: 120000 });
  await page.locator('#record').click();
  await expect(page.locator('#classicality')).toBeDisabled();
  await page.setViewportSize({ width: 390, height: 844 });
  const file = await downloaded;
  const path = `validation/export-30fps.${file.suggestedFilename().split('.').at(-1)}`;
  await file.saveAs(path);
  await expect(page.locator('#record-label')).toHaveText('Render video · 30 fps');
  const after = await page.evaluate(() => window.__classicalLimit.snapshot());
  expect(after.positions).toEqual(before.positions); expect(after.time).toBe(before.time);
  expect(after.paused).toBe(true); expect(after.glError).toBe(0);
  expect(after.lastExport.frames).toBe(60);
  expect(after.lastExport.finalState.time).toBeCloseTo(before.time + 59 / 30, 8);
  const media = probe(path), stream = media.streams[0];
  expect(stream.width).toBe(1920); expect(stream.height).toBe(1200);
  expect(stream.r_frame_rate).toBe('30/1'); expect(stream.avg_frame_rate).toBe('30/1');
  expect(Number(stream.nb_read_frames)).toBe(60); expect(Number(media.format.duration)).toBeCloseTo(2, 4);
  // The file really decodes and seeks, beyond its header being correct.
  const playback = await page.evaluate(async () => {
    const video = document.createElement('video'); video.src = document.getElementById('export-download').href;
    await new Promise((resolve, reject) => { video.onloadeddata = resolve; video.onerror = () => reject(new Error('Decode failed')); });
    video.currentTime = 1.5; await new Promise(resolve => { video.onseeked = resolve; });
    return { width: video.videoWidth, height: video.videoHeight, duration: video.duration, readyState: video.readyState };
  });
  expect(playback.readyState).toBeGreaterThanOrEqual(2); expect(playback.duration).toBeCloseTo(2);
  await page.locator('#export-duration').fill('120');
  await page.locator('#record').click();
  await expect(page.locator('#record-label')).toHaveText('Cancel render');
  await page.locator('#record').click();
  await expect(page.locator('#export-status')).toHaveText('Render cancelled.');
  await expect(page.locator('#classicality')).toBeEnabled();
  expect(await page.locator('.export-preview').count()).toBe(0);
  const cancelled = await page.evaluate(() => window.__classicalLimit.snapshot());
  expect(cancelled.positions).toEqual(before.positions); expect(cancelled.glError).toBe(0);
  expect(errors).toEqual([]);
  await writeFile('validation/export-report.json', JSON.stringify({ report: after.lastExport, media, playback, errors }, null, 2));
});

test('2K encoding retains every frame even with deliberate slow rendering', async ({ page }) => {
  test.setTimeout(180000);
  await page.goto('/?paused=1&test=1');
  await expect(page.locator('#export-size')).toHaveValue('2560');
  await expect(page.locator('#export-size option[value="3840"]')).toHaveCount(0);
  await page.waitForFunction(() => window.__classicalLimit?.ready);
  const result = await page.evaluate(async () => {
    const { renderVideo } = await import('/src/export.js');
    const started = performance.now();
    const result = await renderVideo({ settings: { obstacle: true, classicality: 1, angle: 0, seed: 1, count: 1 },
      appearance: { showWave: true, showPhase: true, showParticles: true, showTrails: true, showReference: true,
        dotSize: 30, trailSeconds: 30, brightness: 1, playback: .5 },
      view: { center: [.5, .5], zoom: 1 }, duration: 1,
      onFrame: async (canvas, frame) => { if (frame === 15) window.exportReferencePNG = canvas.toDataURL('image/png'); await new Promise(resolve => setTimeout(resolve, 40)); },
    });
    window.exportTestURL = URL.createObjectURL(result.blob);
    return { ...result.report, wallSeconds: (performance.now() - started) / 1000, extension: result.extension };
  });
  expect(result.wallSeconds).toBeGreaterThan(1);
  expect(result.frames).toBe(30); expect(result.finalState.time).toBeCloseTo(29 / 60, 8);
  expect(result.finalState.finite).toBe(true); expect(result.finalState.normError).toBeLessThan(.001);
  const downloaded = page.waitForEvent('download');
  await page.evaluate(() => { const a = document.createElement('a'); a.href = window.exportTestURL; a.download = 'export-2k.mp4'; a.click(); });
  const file = await downloaded;
  const path = `validation/export-2k.${result.extension}`; await file.saveAs(path);
  await writeFile('validation/export-2k-reference.png', Buffer.from((await page.evaluate(() => window.exportReferencePNG)).split(',')[1], 'base64'));
  const media = probe(path), stream = media.streams[0];
  expect(stream.width).toBe(2560); expect(stream.height).toBe(1600);
  expect(stream.avg_frame_rate).toBe('30/1'); expect(Number(stream.nb_read_frames)).toBe(30);
  expect(Number(media.format.duration)).toBeCloseTo(1, 4);
  await writeFile('validation/export-2k-report.json', JSON.stringify({ result, media }, null, 2));
});

test('WebM fallback exports at 30 fps when the browser has no AVC encoder', async ({ page }) => {
  await page.addInitScript(() => {
    const original = VideoEncoder.isConfigSupported.bind(VideoEncoder);
    VideoEncoder.isConfigSupported = config => config.codec.startsWith('avc')
      ? Promise.resolve({ supported: false, config }) : original(config);
  });
  await page.goto('/?obstacle=0&paused=1&test=1&classicality=1');
  await page.waitForFunction(() => window.__classicalLimit?.ready);
  await page.locator('#export-size').selectOption('2560');
  await page.locator('#export-duration').fill('1');
  const downloaded = page.waitForEvent('download');
  await page.locator('#record').click();
  const file = await downloaded;
  expect(file.suggestedFilename()).toMatch(/\.webm$/);
  await file.saveAs('validation/export-fallback.webm');
  const media = probe('validation/export-fallback.webm'), stream = media.streams[0];
  expect(stream.codec_name).toBe('vp9'); expect(stream.width).toBe(2560); expect(stream.height).toBe(1600);
  expect(Number(stream.nb_read_frames)).toBe(30); expect(stream.avg_frame_rate).toBe('30/1');
  expect(Number(media.format.duration)).toBeCloseTo(1, 4);
  await writeFile('validation/export-fallback-report.json', JSON.stringify(media, null, 2));
});
