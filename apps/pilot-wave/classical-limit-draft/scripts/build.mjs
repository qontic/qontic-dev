import { cp, mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { templateAssets, templateDirectory } from './template-assets.mjs';

await mkdir('dist/shared', { recursive: true });
for (const file of ['index.html', 'styles.css', 'template.css', 'src', 'assets']) {
  await cp(file, `dist/${file}`, { recursive: true });
}
for (const file of templateAssets) {
  await cp(path.join(templateDirectory, file), `dist/shared/${file}`);
}
for (const [file, source, target] of [
  ['dist/index.html', '../../../shared/', './shared/'],
  ['dist/src/template.js', '../../../../shared/', '../shared/'],
]) {
  await writeFile(file, (await readFile(file, 'utf8')).replaceAll(source, target));
}
console.log('Static app built in dist/. All runtime assets are local; no CDN requests.');
