import { fileURLToPath } from 'node:url';

export const templateAssets = new Set([
  'qontic-app.css', 'qontic-shell.css', 'qontic-shell.js', 'qontic-logo.png',
  'qontic-overlays.css', 'qontic-overlays.js',
  'qontic-controls.css', 'qontic-controls.js', 'qontic-media.css', 'qontic-media.js',
]);
export const templateDirectory = fileURLToPath(new URL('../../../../shared/', import.meta.url));
