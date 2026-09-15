import { build } from 'esbuild';
import { mkdir, copyFile, writeFile } from 'node:fs/promises';

await mkdir('src/vendor', { recursive: true });
await build({
  stdin: { contents: "export { Output, BufferTarget, Mp4OutputFormat, WebMOutputFormat, CanvasSource, Quality, canEncodeVideo } from 'mediabunny';", resolveDir: process.cwd(), loader: 'js' },
  outfile: 'src/vendor/media.js', bundle: true, minify: true, format: 'esm', target: 'es2022',
  legalComments: 'inline', banner: { js: '/* Mediabunny 1.56.0, MPL-2.0. See media-LICENSE.txt and media-NOTICE.txt. */' },
});
await copyFile('node_modules/mediabunny/LICENSE', 'src/vendor/media-LICENSE.txt');
await writeFile('src/vendor/media-NOTICE.txt', 'Mediabunny 1.56.0 by Vanilagy and contributors.\nLicense: Mozilla Public License 2.0 (media-LICENSE.txt).\nUnmodified upstream source: https://github.com/Vanilagy/mediabunny/tree/v1.56.0\nPackage source: https://www.npmjs.com/package/mediabunny/v/1.56.0\nThis browser bundle is generated with scripts/vendor-media.mjs.\n');
console.log('Bundled the local video encoder/muxer. No network requests are needed at runtime.');
