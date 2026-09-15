import { test, expect } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';

const snapshot = page => page.evaluate(() => window.__classicalLimit.snapshot());
const settleLayout = page => page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
const measure = page => page.evaluate(() => {
  const rect = selector => document.querySelector(selector).getBoundingClientRect().toJSON();
  const canvas = document.querySelector('#canvas'), panel = document.querySelector('#panel-body');
  return {
    viewport: [innerWidth, innerHeight], document: [document.documentElement.scrollWidth, document.documentElement.scrollHeight],
    scroll: [scrollX, scrollY], canvas: rect('#canvas'), slot: rect('#canvas-slot'), legend: rect('#phase-legend'),
    heading: rect('.panel-heading'), panel: rect('#panel-body'),
    buffer: [canvas.width, canvas.height], expectedBuffer: [canvas.clientWidth, canvas.clientHeight].map(size => Math.round(size * Math.min(2, devicePixelRatio))),
    controlsScroll: panel.scrollTop, controlsHeight: panel.scrollHeight,
  };
});

function expectFits(view) {
  expect(view.document).toEqual(view.viewport);
  expect(view.scroll).toEqual([0, 0]);
  expect(view.canvas.width).toBeGreaterThan(100);
  expect(Math.abs(view.canvas.width / view.canvas.height - 1.6)).toBeLessThan(.001);
  expect(view.canvas.left).toBeGreaterThanOrEqual(view.slot.left);
  expect(view.canvas.top).toBeGreaterThanOrEqual(view.slot.top);
  expect(view.canvas.right).toBeLessThanOrEqual(view.slot.right);
  expect(view.canvas.bottom).toBeLessThanOrEqual(view.slot.bottom);
  // The box fills at least one available dimension, including short/ultrawide windows.
  expect(Math.min(view.slot.width - view.canvas.width, view.slot.height - view.canvas.height)).toBeLessThan(3);
  expect(view.legend.left).toBeGreaterThanOrEqual(view.canvas.left);
  expect(view.legend.top).toBeGreaterThanOrEqual(view.canvas.top);
  expect(view.legend.right).toBeLessThanOrEqual(view.canvas.right);
  expect(view.legend.bottom).toBeLessThanOrEqual(view.canvas.bottom);
  expect(view.buffer).toEqual(view.expectedBuffer);
}

for (const scene of ['free', 'barrier']) {
  test(`${scene}: resize and independent control scrolling keep the scene, trails and camera intact`, async ({ page }) => {
    const errors = []; page.on('pageerror', error => errors.push(error.message));
    await page.goto(`/?scene=${scene}&paused=1&test=1&count=64`);
    await page.waitForFunction(() => window.__classicalLimit?.ready);
    await page.evaluate(() => window.__classicalLimit.run(1));
    await page.locator('#show-reference').check();
    await expect(page.locator('.topbar')).toHaveCount(0);
    await expect(page.locator('#panel .brand-logo')).toBeVisible();
    const box = await page.locator('#canvas').boundingBox();
    await page.mouse.move(box.x + box.width * .4, box.y + box.height * .4);
    await page.mouse.wheel(0, -400);
    await expect.poll(async () => (await snapshot(page)).view.zoom).toBeGreaterThan(1);
    const before = await snapshot(page), views = [];

    for (const [width, height] of [[1440, 1000], [1440, 650], [2560, 720], [800, 1100], [390, 844], [320, 568], [640, 360]]) {
      await page.setViewportSize({ width, height }); await settleLayout(page);
      const initialView = await measure(page); expectFits(initialView);
      // Actual wheel input scrolls only controls, even after reaching their end.
      await page.locator('#panel-body').evaluate(panel => { panel.scrollTop = 0; });
      await page.mouse.move(initialView.panel.x + initialView.panel.width / 2, initialView.panel.y + initialView.panel.height / 2);
      await page.mouse.wheel(0, 420);
      await expect.poll(async () => (await measure(page)).controlsScroll).toBeGreaterThan(0);
      await page.locator('#record').scrollIntoViewIfNeeded();
      await expect(page.locator('#record')).toBeInViewport();
      await page.mouse.wheel(0, 3000); await settleLayout(page);
      const scrolled = await measure(page);
      expectFits(scrolled);
      expect(scrolled.canvas).toEqual(initialView.canvas);
      expect(scrolled.heading).toEqual(initialView.heading);
      const after = await snapshot(page);
      expect(after.positions).toEqual(before.positions);
      expect(after.time).toBe(before.time); expect(after.historyLength).toBe(before.historyLength);
      expect(after.view).toEqual(before.view); expect(after.glError).toBe(0); expect(after.failed).toBe(false);
      views.push(scrolled);
    }
    await page.setViewportSize({ width: 1440, height: 1000 }); await settleLayout(page);
    const expanded = await measure(page);
    await page.getByRole('button', { name: 'Collapse controls', exact: true }).click(); await settleLayout(page);
    const collapsed = await measure(page); expectFits(collapsed);
    expect(collapsed.canvas.width).toBeGreaterThan(expanded.canvas.width);
    await expect(page.locator('#panel-body')).toBeHidden();
    await page.getByRole('button', { name: 'Expand controls', exact: true }).click(); await settleLayout(page);
    expect((await measure(page)).canvas).toEqual(expanded.canvas);
    expect((await snapshot(page)).view).toEqual(before.view);
    expect((await snapshot(page)).positions).toEqual(before.positions);

    await page.setViewportSize({ width: 390, height: 844 });
    await page.locator('#collapse').click(); await settleLayout(page); expectFits(await measure(page));
    await page.locator('#collapse').click(); await settleLayout(page); expectFits(await measure(page));
    await expect(page.locator('#panel-body')).toBeVisible();
    expect(errors).toEqual([]);
    await mkdir('validation', { recursive: true });
    await writeFile(`validation/layout-${scene}-report.json`, JSON.stringify({ views, expanded, collapsed, errors }, null, 2));
  });
}

test('embedded high-DPI view fits on first paint and updates while paused', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 1200, height: 740 }, deviceScaleFactor: 2 });
  const page = await context.newPage(), errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('http://127.0.0.1:5178/?scene=free&embed=1&paused=1&test=1');
  await page.waitForFunction(() => window.__classicalLimit?.ready); await settleLayout(page);
  await expect(page.locator('.brand-home')).toBeHidden();
  expectFits(await measure(page));
  await page.setViewportSize({ width: 840, height: 400 }); await settleLayout(page);
  expectFits(await measure(page));
  expect((await snapshot(page)).time).toBe(0);
  expect(errors).toEqual([]);
  await context.close();
});
