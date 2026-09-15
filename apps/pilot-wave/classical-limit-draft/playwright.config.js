import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests', testMatch: '**/*browser.spec.js', workers: 1, timeout: 120000,
  use: {
    baseURL: 'http://127.0.0.1:5178', viewport: { width: 1440, height: 1000 },
    launchOptions: { executablePath: process.env.CLASSICALLIMIT_BROWSER || undefined, args: ['--enable-webgl', '--ignore-gpu-blocklist'] },
    screenshot: 'only-on-failure',
  },
  webServer: { command: 'node server.mjs', url: 'http://127.0.0.1:5178', reuseExistingServer: true },
});
