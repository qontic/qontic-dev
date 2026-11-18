import '../../../shared/qontic-controls.js';
import { mountQonticShell } from '../../../shared/qontic-shell.js';
import { mountQonticMedia } from '../../../shared/qontic-media.js';
import { mountDistanceScale } from '../../../shared/qontic-overlays.js';
import { mountQonticShortcuts } from '../../../shared/qontic-shortcuts.js';
import { APP_RELEASE } from './release.js?v=1.2.3';

const controls = document.querySelector('qontic-controls');
const canvas = document.getElementById('c');
const stage = document.querySelector('.hydrogen-stage');
const viewButtons = [...document.querySelectorAll('button[data-view]')];
const paneSections = [...document.querySelectorAll('[data-control-pane]')];

mountQonticShell({
  title: 'Hydrogen Atom',
  navigation: 'breadcrumbs',
  purpose: 'Explore hydrogen orbitals, their density and phase, and the electron trajectories of pilot-wave theory, with or without the spin term.',
  homeHref: '../../../index.html?tab=apps',
  version: `Hydrogen Atom · Version ${APP_RELEASE.version} · ${APP_RELEASE.date}`,
});

// The template header can wrap or be hidden. Budget its actual height in the
// stacked layout so the canvas and the jump to controls fit the first screen.
const header = document.getElementById('qontic-app-header');
function updateHeaderHeight() {
  stage.style.setProperty('--hydrogen-header-height', `${header.getBoundingClientRect().height}px`);
}
new ResizeObserver(updateHeaderHeight).observe(header);
updateHeaderHeight();

const stagePlay = document.getElementById('stagePlay');
function setRunning(value) {
  hydrogenSimulation.setRunning(value);
  controls.setAttribute('running', String(value));
  stagePlay.textContent = value ? 'Pause' : 'Play';
  stagePlay.setAttribute('aria-pressed', String(value));
}
stagePlay.addEventListener('click', () => setRunning(!hydrogenSimulation.isRunning()));

controls.addEventListener('qontic:start', () => setRunning(true));
controls.addEventListener('qontic:stop', () => setRunning(false));
controls.addEventListener('qontic:reset', () => hydrogenSimulation.reset());
controls.addEventListener('qontic:speed', event => hydrogenSimulation.setSpeed(event.detail.speed));
controls.addEventListener('qontic:theme', event => hydrogenSimulation.setTheme(event.detail.theme));
controls.addEventListener('qontic:interpretation', ({ detail }) => setInterpretation(detail.interpretation));
function applyInterpretation(id) {
  controls.setAttribute('interpretation', id);
  setInterpretation(id);
}
applyInterpretation(new URLSearchParams(location.search).get('interp') === 'cpn' ? 'cpn' : 'pw');
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
  if (view !== 'simulation') setRunning(false);
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
  getShareUrl: () => hydrogenShareUrl(),
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

// ── Predict, then watch: three states that show the guidance law at work ──
const steps = [
  { label: '1s', select: () => selectPureOrbital(0), answer: 'still',
    question: 'Step 1 of 3 · 1s ground state, spin term off. In pilot-wave theory, how do the electrons move?',
    explain: 'ψ is real, so the guidance velocity Im(∇ψ/ψ) is zero everywhere: each electron stays where it started. The quantum potential cancels the Coulomb force (Physics § 3).' },
  { label: '2p₊₁', select: () => selectPureOrbital(3), answer: 'circle',
    question: 'Step 2 of 3 · 2p₊₁, the same |ψ|² shape as a ring about z. How do the electrons move?',
    explain: 'ψ ∝ exp(iφ) carries angular momentum ħ about z. Each electron circles the z axis at fixed height and radius, faster near the axis (vᵩ = 1/ρ in atomic units).' },
  { label: '1s + 2p₀', select: () => document.getElementById('beatPreset').click(), answer: 'swing',
    question: 'Step 3 of 3 · 1s + 2p₀, a superposition of two energies. How do the electrons move?',
    explain: 'The density sloshes up and down z every 405 as, and the electrons ride with it, so their distribution stays |ψ|². Nothing circles: both states have m = 0.' },
];
const answerButtons = [...document.querySelectorAll('[data-predict]')];
const feedback = document.getElementById('predictFeedback');
let step = -1;   // -1: no step chosen yet; the app opens on its default state

function showStep(index) {
  step = index % steps.length;
  if (interp !== 'pw') applyInterpretation('pw');
  if (spinEnabled) toggleSpin();
  steps[step].select();
  hydrogenSimulation.reset();
  setRunning(false);
  document.querySelector('.predict-answers').hidden = false;
  document.getElementById('predictQ').textContent = steps[step].question;
  feedback.textContent = 'Choose an answer; the simulation starts when you do.';
  for (const button of answerButtons) button.setAttribute('aria-pressed', 'false');
  document.getElementById('predictNext').textContent = `Next: ${steps[(step + 1) % steps.length].label} →`;
}

for (const button of answerButtons) button.addEventListener('click', () => {
  const right = button.dataset.predict === steps[step].answer;
  for (const other of answerButtons) other.setAttribute('aria-pressed', String(other === button));
  feedback.textContent = `${right ? 'Yes.' : 'Not quite.'} ${steps[step].explain}`;
  setRunning(true);
});
document.getElementById('predictNext').addEventListener('click', () => showStep(step + 1));
document.getElementById('predictQ').textContent = 'Three quick predictions about how pilot-wave electrons move. Start with the ground state.';
document.getElementById('predictNext').textContent = `Start with ${steps[0].label} →`;
