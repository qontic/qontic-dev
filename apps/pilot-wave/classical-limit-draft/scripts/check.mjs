import { readdir } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
const files = ['server.mjs', 'playwright.config.js'];
for (const directory of ['src', 'scripts', 'tests']) {
  for (const file of await readdir(new URL(`../${directory}/`, import.meta.url))) {
    if (/\.(m?js)$/.test(file)) files.push(`${directory}/${file}`);
  }
}
for (const file of files) {
  const result = spawnSync(process.execPath, ['--check', file], { stdio: 'inherit' });
  if (result.status) process.exit(result.status);
}
console.log(`Checked ${files.length} JavaScript files.`);
