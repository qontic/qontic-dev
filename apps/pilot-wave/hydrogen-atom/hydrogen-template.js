import '../../../shared/qontic-controls.js';
import { mountQonticShell } from '../../../shared/qontic-shell.js';
import { mountQonticMedia } from '../../../shared/qontic-media.js';
import { mountDistanceScale } from '../../../shared/qontic-overlays.js';
import { mountQonticShortcuts } from '../../../shared/qontic-shortcuts.js';

const controls = document.querySelector('qontic-controls');
const canvas = document.getElementById('c');
const stage = document.querySelector('.hydrogen-stage');
const viewButtons = [...document.querySelectorAll('button[data-view]')];
const paneSections = [...document.querySelectorAll('[data-control-pane]')];

mountQonticShell({
  title: 'Hydrogen Atom',
  navigation: 'breadcrumbs',
  purpose: 'Explore hydrogen orbitals, their phase and density, and pilot-wave trajectories with or without spin.',
  homeHref: '../../../index.html?tab=apps',
  version: 'Hydrogen Atom',
});

// The template header can wrap or be hidden. Budget its actual height in the
// stacked layout so the canvas and the jump to controls fit the first screen.
const header = document.getElementById('qontic-app-header');
function updateHeaderHeight() {
  stage.style.setProperty('--hydrogen-header-height', `${header.getBoundingClientRect().height}px`);
}
new ResizeObserver(updateHeaderHeight).observe(header);
updateHeaderHeight();

function setRunning(value) {
  hydrogenSimulation.setRunning(value);
  controls.setAttribute('running', String(value));
}

controls.addEventListener('qontic:start', () => setRunning(true));
controls.addEventListener('qontic:stop', () => setRunning(false));
controls.addEventListener('qontic:reset', () => hydrogenSimulation.reset());
controls.addEventListener('qontic:speed', event => hydrogenSimulation.setSpeed(event.detail.speed));
controls.addEventListener('qontic:theme', event => hydrogenSimulation.setTheme(event.detail.theme));
controls.addEventListener('qontic:tab', ({ detail }) => {
  for (const section of paneSections) section.hidden = section.dataset.controlPane !== detail.tab;
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
});

// Rotation uses an orthographic projection with a single length scale.
let lastScale, scaleFrame;
function refreshScale() {
  if (!scale.getVisible()) return;
  const next = hydrogenSimulation.getCanvasScale();
  if (next > 0 && next !== lastScale) {
    lastScale = next;
    scale.update();
  }
  scaleFrame = requestAnimationFrame(refreshScale);
}
const scale = mountDistanceScale({
  host: canvas.parentElement,
  getUnitsPerPixel() {
    const pmPerPixel = 52.9177 / hydrogenSimulation.getCanvasScale();
    return { x: pmPerPixel, y: pmPerPixel };
  },
  format: value => `${Number(value.toPrecision(3))} pm`,
  onVisibilityChange(visible) {
    if (visible) scaleFrame = requestAnimationFrame(refreshScale);
    else cancelAnimationFrame(scaleFrame);
  },
});
scale.setVisible(false);

mountQonticMedia({
  stage,
  controls,
  scaleControl: scale,
  filename: 'hydrogen-atom',
  getCanvases: () => [canvas, scale.canvas],
  beginRecording() {
    const wasRunning = hydrogenSimulation.isRunning();
    setRunning(true);
    return wasRunning;
  },
  endRecording(wasRunning) { setRunning(wasRunning); },
});

mountQonticShortcuts({
  target: canvas,
  togglePlayback: () => setRunning(!hydrogenSimulation.isRunning()),
  reset: () => hydrogenSimulation.reset(),
  screenshot: () => document.querySelector('#qontic-media-tools button[aria-label="Screenshot"]')?.click(),
});
