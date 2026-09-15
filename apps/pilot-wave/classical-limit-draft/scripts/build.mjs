import { mkdir, cp } from 'node:fs/promises';
await mkdir('dist', { recursive: true });
for (const file of ['index.html', 'styles.css', 'src', 'assets']) await cp(file, `dist/${file}`, { recursive: true });
console.log('Static app built in dist/. All runtime assets are local; no CDN requests.');
