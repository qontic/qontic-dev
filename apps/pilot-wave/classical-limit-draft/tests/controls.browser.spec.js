import { test, expect } from '@playwright/test';

const snapshot = page => page.evaluate(() => window.__classicalLimit.snapshot());

for (const scene of ['free', 'barrier']) {
  test(`${scene}: simplified visibility and fresh restart samples`, async ({ page }) => {
    const errors = []; page.on('pageerror', error => errors.push(error.message));
    await page.goto(`/?scene=${scene}&test=1&paused=1&seed=2`);
    await page.waitForFunction(() => window.__classicalLimit?.ready);
    await expect(page.locator('#show-reference')).toBeChecked();
    await expect(page.locator('#dot-size')).toHaveValue('15');
    await expect(page.locator('#seed, #brightness, #show-phase, #show-trails')).toHaveCount(0);
    let before = await snapshot(page);
    expect(before.appearance.brightness).toBe(1);
    expect(before.appearance.showReference).toBe(true);
    for (let i = 0; i < 3; i++) {
      await page.locator('#reset').click();
      await expect.poll(async () => (await snapshot(page)).positions).not.toEqual(before.positions);
      const after = await snapshot(page);
      expect(after.positions).not.toEqual(before.positions);
      expect(after.time).toBe(0); expect(after.historyLength).toBe(1);
      before = after;
    }
    await page.evaluate(() => window.__classicalLimit.run(.2));
    const running = await snapshot(page);
    await page.locator('#show-wave').uncheck();
    let hidden = await snapshot(page);
    expect(hidden.appearance.showWave).toBe(false); expect(hidden.appearance.showPhase).toBe(false);
    expect(hidden.positions).toEqual(running.positions);
    await page.locator('#show-particles').uncheck();
    hidden = await snapshot(page);
    expect(hidden.appearance.showParticles).toBe(false); expect(hidden.appearance.showTrails).toBe(false);
    await expect(page.locator('#reference-legend')).toBeVisible();
    // Verify only the independent classical particle and trail are drawn.
    const captureDraws = () => page.evaluate(async () => {
      const { Renderer } = await import('/src/renderer.js');
      const calls = [], originals = {};
      for (const name of ['drawPoints', 'drawTrails']) {
        originals[name] = Renderer.prototype[name];
        Renderer.prototype[name] = function (...args) { calls.push({ name, reference: name === 'drawPoints' ? args[3] : args[4] }); return originals[name].apply(this, args); };
      }
      try { window.__classicalLimit.run(.2); } finally {
        for (const name of Object.keys(originals)) Renderer.prototype[name] = originals[name];
      }
      return calls;
    });
    expect(await captureDraws()).toEqual([
      { name: 'drawTrails', reference: true }, { name: 'drawPoints', reference: true },
    ]);
    await page.locator('#show-reference').uncheck();
    expect(await captureDraws()).toEqual([]);
    await expect(page.locator('#reference-legend')).toBeHidden();
    await page.locator('#show-reference').check();
    expect((await snapshot(page)).historyLength).toBe(1);
    await page.locator('#show-wave').check(); await page.locator('#show-particles').check();
    const visible = await snapshot(page);
    expect(visible.appearance.showWave && visible.appearance.showPhase).toBe(true);
    expect(visible.appearance.showParticles && visible.appearance.showTrails).toBe(true);
    expect(visible.settings.seed).toBe(before.settings.seed);
    expect(visible.appearance.trailStartTime).toBe(visible.time);
    await expect(page.locator('#reference-legend')).toBeVisible();
    expect(visible.glError).toBe(0); expect(errors).toEqual([]);
    await page.screenshot({ path: `validation/simplified-controls-${scene}.png` });
  });
}
