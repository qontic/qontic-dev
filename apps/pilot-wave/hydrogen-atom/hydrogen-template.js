import '../../../shared/qontic-controls.js';
import { mountQonticShell } from '../../../shared/qontic-shell.js';
import { mountQonticMedia } from '../../../shared/qontic-media.js';
import { mountDistanceScale } from '../../../shared/qontic-overlays.js';
import { mountQonticShortcuts } from '../../../shared/qontic-shortcuts.js';
import { mountQonticQuiz } from '../../../shared/qontic-quiz.js?v=4';
import { APP_RELEASE } from './release.js?v=1.2.13';

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
  stagePlay.textContent = value ? 'Stop' : 'Start';
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

// ── Quiz tab (shared module): predict before watching ──────────────────────
// Each question shows a still image of |ψ|² only, without electrons.
function drawDensity(canvas, plane, halfWidth) {
  const g = canvas.getContext('2d');
  const light = document.body.classList.contains('light');
  const half = halfWidth || 1.8 * Math.max(...comps.map(c => exactR(c.n, c.l))) * 1.15;
  const N = 240, vals = new Float32Array(N * N);
  let maxV = 1e-30;
  for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
    const u = -half + (i + 0.5) * 2 * half / N, w = half - (j + 0.5) * 2 * half / N;
    const d = plane === 'xy' ? densityAt(u, w, 0, 0) : densityAt(u, 0, w, 0);
    vals[j * N + i] = d; if (d > maxV) maxV = d;
  }
  const img = new ImageData(N, N);
  for (let k = 0; k < N * N; k++) {
    const vn = Math.pow(vals[k] / maxV, DENS_GAMMA), [r, gg, bb] = sliceCol(vn);
    img.data[k * 4] = r; img.data[k * 4 + 1] = gg; img.data[k * 4 + 2] = bb; img.data[k * 4 + 3] = 255;
  }
  const tmp = document.createElement('canvas');
  tmp.width = N; tmp.height = N;
  tmp.getContext('2d').putImageData(img, 0, 0);
  g.imageSmoothingEnabled = true;
  g.drawImage(tmp, 0, 0, canvas.width, canvas.height);
  const [h, v] = plane === 'xy' ? ['x', 'y'] : ['x', 'z'];
  g.strokeStyle = light ? 'rgba(20,40,70,.5)' : 'rgba(200,220,255,.45)'; g.lineWidth = 1;
  g.beginPath(); g.moveTo(12, canvas.height / 2); g.lineTo(canvas.width - 12, canvas.height / 2);
  g.moveTo(canvas.width / 2, canvas.height - 12); g.lineTo(canvas.width / 2, 12); g.stroke();
  g.fillStyle = light ? '#1a2540' : '#cfe0ff'; g.font = '13px Inter, system-ui, sans-serif';
  g.fillText(h, canvas.width - 20, canvas.height / 2 - 6); g.fillText(v, canvas.width / 2 + 6, 20);
}
function prepare(select, reading = 'pw') {
  return () => {
    if (interp !== reading) applyInterpretation(reading);
    clearSpin();
    select();
    hydrogenSimulation.reset();
    setRunning(false);
  };
}
const orbital = label => () => selectPureOrbital(ORBITALS.findIndex(o => o.label === label));
const superposition = key => () => {
  const menu = document.getElementById('superSel');
  menu.value = key;
  menu.dispatchEvent(new Event('change'));
};
const motionAnswers = [
  { id: 'still', label: 'They stay still' },
  { id: 'circle', label: 'They circle the z axis' },
  { id: 'swing', label: 'They swing along z' },
  { id: 'radial', label: 'They move in and out along radii' },
];
mountQonticQuiz({
  panel: document.getElementById('quiz'),
  tab: document.querySelector('button[data-view="quiz"]'),
  simulationTab: document.querySelector('button[data-view="simulation"]'),
  answers: motionAnswers,
  shuffle: true,
  score: true,
  shareLink: true,
  questions: [
    { question: 'The 1s ground state, with the standard guidance law (no spin term). In pilot-wave theory, how do the electrons move?',
      answer: 'still', caption: '1s: |ψ|² in the xz plane.',
      prepare: prepare(orbital('1s')), draw: c => drawDensity(c, 'xz'),
      plain: 'In this state the wave has no swirl and does not change, so nothing moves the electron.',
      explain: 'ψ is real, so the guidance velocity Im(∇ψ/ψ) is zero everywhere: each electron stays where it started. (With the spin term of Physics § 4 it would move; the statistics are the same.)' },
    { question: 'The 2p₊₁ state, whose |ψ|² is a ring around the z axis. In pilot-wave theory, how do the electrons move?',
      answer: 'circle', caption: '2p₊₁: |ψ|² in the xy plane (the z axis points out of the page).',
      prepare: prepare(orbital('2p₊₁')), draw: c => drawDensity(c, 'xy'),
      plain: 'The wave swirls around the z axis, and the electrons go round with it.',
      explain: 'ψ ∝ exp(iφ) carries angular momentum ħ about z. Each electron circles the z axis at fixed height and radius, faster near the axis (vᵩ = 1/(r sinθ) in atomic units).' },
    { question: 'The real orbital 2p_x, as drawn in chemistry: two lobes along x. In pilot-wave theory, how do the electrons move?',
      answer: 'still', caption: '2p_x: |ψ|² in the xy plane.',
      prepare: prepare(superposition('px')), draw: c => drawDensity(c, 'xy'),
      plain: 'They stay still: 2p_x is an equal mix of a clockwise and an anticlockwise swirl, and the two cancel.',
      explain: '2p_x = (2p₋₁ − 2p₊₁)/√2 is real, so Im(∇ψ/ψ) = 0. The ring-shaped 2p₊₁ and the lobes of 2p_x are both 2p states with the same energy; only 2p₊₁ carries angular momentum about z.' },
    { question: 'The superposition 1s + 2p₀ of two energies. In pilot-wave theory, how do the electrons move?',
      answer: 'swing', caption: '1s + 2p₀: |ψ|² in the xz plane at t = 0.',
      prepare: prepare(superposition('sp')), draw: c => drawDensity(c, 'xz'),
      plain: 'The cloud slides up and down the z axis, and the electrons ride along with it.',
      explain: 'The density sloshes up and down z every 405 attoseconds, and the electrons ride with it, so their distribution stays |ψ|². Nothing circles: both states have m = 0.' },
    { question: 'The superposition 1s + 2s. In pilot-wave theory, how do the electrons move?',
      answer: 'radial', caption: '1s + 2s: |ψ|² in the xz plane at t = 0.',
      prepare: prepare(superposition('ss')), draw: c => drawDensity(c, 'xz'),
      plain: 'The cloud swells and shrinks like a breathing ball, and the electrons move in and out with it.',
      explain: 'Both states are spherical, so the density breathes radially every 405 attoseconds. The phase of ψ depends only on r, so the velocity points along the radius.' },
    { question: 'How many radial nodes (spheres where |ψ|² = 0) does the 3s state have?',
      answer: 'two', caption: '3s: |ψ|² in the xz plane.',
      shuffle: false,
      answers: [{ id: 'zero', label: 'None' }, { id: 'one', label: 'One' }, { id: 'two', label: 'Two' }, { id: 'three', label: 'Three' }],
      prepare: prepare(orbital('3s')), draw: c => drawDensity(c, 'xz', 14),
      plain: 'Two: the picture shows three bright shells separated by two dark spheres.',
      explain: 'A state has n − l − 1 radial nodes: 3 − 0 − 1 = 2. All n = 3 states have the same energy, E₃ = −13.6/9 eV = −1.51 eV. The P(r) inset (Display tab) shows the nodes as zeros of the radial probability.' },
    { question: 'Orthodox reading: what does the 2p₊₁ display say about where the electron is between measurements?',
      answer: 'prob', caption: '2p₊₁: |ψ|² in the xy plane.',
      answers: [
        { id: 'circ', label: 'It circles the z axis' },
        { id: 'peak', label: 'It sits where |ψ|² is largest' },
        { id: 'prob', label: 'Nothing: |ψ|² gives the chance of finding it in a region if its position is measured' },
      ],
      prepare: prepare(orbital('2p₊₁'), 'cpn'), draw: c => drawDensity(c, 'xy'),
      plain: 'In the orthodox reading the electron has no position until one is measured; the picture gives the odds of each result.',
      explain: 'The probability current circulates about z, but the orthodox reading does not take it as electron motion; that is the pilot-wave step. Watch it: the Orthodox display has no dots or trails.' },
  ],
  onWatch: () => setRunning(true),
});
