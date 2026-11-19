import '../../../shared/qontic-controls.js?v=4';
import { mountQonticShell } from '../../../shared/qontic-shell.js';
import { mountQonticMedia } from '../../../shared/qontic-media.js';
import { mountQonticShortcuts } from '../../../shared/qontic-shortcuts.js';

const controls = document.querySelector('qontic-controls');
const canvas = document.getElementById('c');
const stage = document.querySelector('.stage');
const viewButtons = [...document.querySelectorAll('[data-view]')];
let simulation;

mountQonticShell({
  title: 'Stern–Gerlach Close-Up',
  navigation: 'breadcrumbs',
  purpose: 'Advanced pilot-wave simulation · Requires WebGPU',
  homeHref: '../../../index.html?tab=apps',
});

const header = document.getElementById('qontic-app-header');
function updateHeaderHeight() {
  stage.style.setProperty('--app-header-height', `${header.getBoundingClientRect().height}px`);
}
new ResizeObserver(updateHeaderHeight).observe(header);
updateHeaderHeight();

function setRunning(running) {
  simulation?.setRunning(running);
  controls.setAttribute('running', String(Boolean(simulation?.isRunning())));
}

controls.addEventListener('qontic:start', () => setRunning(true));
controls.addEventListener('qontic:stop', () => setRunning(false));
controls.addEventListener('qontic:reset', () => simulation?.reset());
controls.addEventListener('qontic:rerun', () => {
  simulation?.reset();
  setRunning(true);
});
controls.addEventListener('qontic:autorun', event => simulation?.setAutoRun(event.detail.autoRun));
controls.addEventListener('qontic:speed', event => simulation?.setSpeed(event.detail.speed));
controls.addEventListener('qontic:tab', ({ detail }) => {
  for (const pane of document.querySelectorAll('[data-control-pane]')) {
    pane.hidden = pane.dataset.controlPane !== detail.tab;
  }
});

for (const button of viewButtons) button.addEventListener('click', () => {
  const view = button.dataset.view;
  document.body.dataset.view = view;
  for (const tab of viewButtons) {
    const selected = tab === button;
    document.getElementById(tab.dataset.view).hidden = !selected;
    tab.classList.toggle('active', selected);
    tab.setAttribute('aria-pressed', String(selected));
  }
  if (view === 'physics') setRunning(false);
  else simulation?.redraw();
});

canvas.addEventListener('stern-gerlach:unavailable', () => {
  controls.setAttribute('disabled', '');
  controls.setAttribute('running', 'false');
  document.body.classList.remove('simulation-ready');
});

try {
  ({ simulation } = await import('./main.js?v=11'));
} catch (error) {
  // The engine displays specific WebGPU errors when it can.
  if (document.getElementById('gpu-help').hidden) {
    console.error('Could not load Stern–Gerlach Close-Up', error);
    document.getElementById('gpu-status-title').textContent = 'The simulation could not load';
    document.getElementById('gpu-help').hidden = false;
  }
}

if (simulation?.isAvailable()) {
  if (document.body.dataset.view === 'physics') simulation.setRunning(false);
  controls.setAttribute('running', String(simulation.isRunning()));
  controls.removeAttribute('disabled');
  document.body.classList.add('simulation-ready');

  mountQonticMedia({
    stage,
    controls,
    filename: 'stern-gerlach-close-up',
    getCanvases: () => [canvas],
    beginRecording() {
      const wasRunning = simulation.isRunning();
      setRunning(true);
      return wasRunning;
    },
    endRecording: setRunning,
  });

  mountQonticShortcuts({
    target: canvas,
    togglePlayback: () => setRunning(!simulation.isRunning()),
    reset: () => simulation.reset(),
    // S remains the existing camera-orbit shortcut in this app.
  });
}
