import { mountQonticNotebook } from '../../shared/qontic-notebook.js?v=1.2';
import '../simulation-speed-host.js';

// Guard before the shared lazy-loader runs so unsupported browsers retain the poster.
let webglAvailable;
function supportsWebGL2() {
  if (webglAvailable !== undefined) return webglAvailable;
  const probe = document.createElement('canvas');
  try {
    const gl = probe.getContext('webgl2');
    webglAvailable = Boolean(gl);
    gl?.getExtension('WEBGL_lose_context')?.loseContext();
  } catch (_) { webglAvailable = false; }
  return webglAvailable;
}
document.querySelectorAll('.applet-play').forEach(button => {
  button.addEventListener('click', event => {
    if (supportsWebGL2()) return;
    event.stopImmediatePropagation();
    const status = button.closest('.applet-stage').querySelector('.num-webgl-status');
    status.textContent = 'WebGL2 is unavailable in this browser. Use a browser with WebGL2 enabled, then reload. The preview image remains visible.';
    status.hidden = false;
    button.textContent = 'WebGL2 unavailable';
    button.disabled = true;
  }, { capture: true });
});
mountQonticNotebook({
  title: 'Double Slit: Wave Dynamics — Numerical Notebook',
  eyebrow: 'Q-Ontic · Numerical wave dynamics',
  purpose: 'Compare one trajectory, many initial configurations and the Born density in a numerical double-slit model.',
  version: 'Numerical double-slit notebook · Dev template preview',
  depth: 'full', compactHeader: true, homeHref: '../../index.html',
});
const readingButtons = document.querySelector('.qn-depth');
if (readingButtons) {
  const reset = document.createElement('button');
  reset.type = 'button'; reset.className = 'num-depth-reset'; reset.textContent = '↺';
  reset.setAttribute('aria-label', 'Reset reading preference to Full');
  reset.addEventListener('click', () => {
    readingButtons.querySelector('[data-depth="full"]').click();
    try { localStorage.removeItem('qontic-notebook-depth'); } catch (_) {}
  });
  readingButtons.after(reset);
}
