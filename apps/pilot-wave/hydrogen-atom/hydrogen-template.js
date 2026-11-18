import '../../../shared/qontic-controls.js';
import { mountQonticShell } from '../../../shared/qontic-shell.js';
import { mountQonticMedia } from '../../../shared/qontic-media.js';
import { mountDistanceScale } from '../../../shared/qontic-overlays.js';
import { mountQonticShortcuts } from '../../../shared/qontic-shortcuts.js';
import { APP_RELEASE } from './release.js?v=1.2.8';

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

// ── Quiz tab: predict before watching ──────────────────────────────────────
// The question shows a still image of |ψ|² only (no electrons), so the picture cannot
// give the answer away. Opening the app with ?quiz=1 starts on the Quiz tab and keeps the
// Simulation tab locked until the first answer.
const quiz = [
  { label: '1s', plane: 'xz', select: () => selectPureOrbital(0), answer: 'still',
    question: 'The 1s ground state (no spin). In pilot-wave theory, how do the electrons move?',
    figure: '1s: |ψ|² in the xz plane.',
    explain: 'ψ is real, so the guidance velocity Im(∇ψ/ψ) is zero everywhere: each electron stays where it started. The quantum potential cancels the Coulomb force (Physics § 3).' },
  { label: '2p₊₁', plane: 'xy', select: () => selectPureOrbital(3), answer: 'circle',
    question: 'The 2p₊₁ state, whose |ψ|² is a ring around the z axis. In pilot-wave theory, how do the electrons move?',
    figure: '2p₊₁: |ψ|² in the xy plane (the z axis points out of the page).',
    explain: 'ψ ∝ exp(iφ) carries angular momentum ħ about z. Each electron circles the z axis at fixed height and radius, faster near the axis (vᵩ = 1/(r sinθ) in atomic units).' },
  { label: '1s + 2p₀', plane: 'xz', select: () => document.getElementById('beatPreset').click(), answer: 'swing',
    question: 'The superposition 1s + 2p₀ of two energies. In pilot-wave theory, how do the electrons move?',
    figure: '1s + 2p₀: |ψ|² in the xz plane at t = 0.',
    explain: 'The density sloshes up and down z every 405 as, and the electrons ride with it, so their distribution stays |ψ|². Nothing circles: both states have m = 0.' },
];
const quizMode = new URLSearchParams(location.search).get('quiz') === '1';
const simTab = document.querySelector('button[data-view="simulation"]');
const quizTab = document.querySelector('button[data-view="quiz"]');
const answers = [...document.querySelectorAll('[data-answer]')];
let quizIndex = 0, answered = false;

function drawQuizFigure(q) {
  const qc = document.getElementById('quizCanvas'), g = qc.getContext('2d');
  const light = document.body.classList.contains('light');
  // Dedicated 240 × 240 image of |ψ|² over the region that holds most of the density.
  const half = 1.8 * Math.max(...comps.map(c => exactR(c.n, c.l))) * 1.15;
  const N = 240, vals = new Float32Array(N * N);
  let maxV = 1e-30;
  for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
    const u = -half + (i + 0.5) * 2 * half / N, w = half - (j + 0.5) * 2 * half / N;
    const d = q.plane === 'xy' ? densityAt(u, w, 0, 0) : densityAt(u, 0, w, 0);
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
  g.drawImage(tmp, 0, 0, qc.width, qc.height);
  const [h, v] = q.plane === 'xy' ? ['x', 'y'] : ['x', 'z'];
  g.strokeStyle = light ? 'rgba(20,40,70,.5)' : 'rgba(200,220,255,.45)'; g.lineWidth = 1;
  g.beginPath(); g.moveTo(12, qc.height / 2); g.lineTo(qc.width - 12, qc.height / 2);
  g.moveTo(qc.width / 2, qc.height - 12); g.lineTo(qc.width / 2, 12); g.stroke();
  g.fillStyle = light ? '#1a2540' : '#cfe0ff'; g.font = '13px Inter, system-ui, sans-serif';
  g.fillText(h, qc.width - 20, qc.height / 2 - 6); g.fillText(v, qc.width / 2 + 6, 20);
  document.getElementById('quizFigCaption').textContent = q.figure;
}

function showQuestion(index) {
  quizIndex = index % quiz.length;
  answered = false;
  const q = quiz[quizIndex];
  if (interp !== 'pw') applyInterpretation('pw');
  if (spinEnabled) toggleSpin();
  q.select();
  hydrogenSimulation.reset();
  setRunning(false);
  document.getElementById('quizStep').textContent = `Question ${quizIndex + 1} of ${quiz.length}`;
  document.getElementById('quizQuestion').textContent = q.question;
  document.getElementById('quizFeedback').textContent = '';
  for (const b of answers) { b.setAttribute('aria-pressed', 'false'); b.disabled = false; }
  document.getElementById('quizWatch').hidden = true;
  document.getElementById('quizNext').hidden = true;
  drawQuizFigure(q);
}

for (const b of answers) b.addEventListener('click', () => {
  if (answered) return;
  answered = true;
  const q = quiz[quizIndex], right = b.dataset.answer === q.answer;
  for (const other of answers) { other.setAttribute('aria-pressed', String(other === b)); other.disabled = true; }
  document.getElementById('quizFeedback').textContent = `${right ? 'Yes.' : 'Not quite.'} ${q.explain}`;
  document.getElementById('quizWatch').hidden = false;
  document.getElementById('quizNext').hidden = false;
  document.getElementById('quizNext').textContent = quizIndex + 1 < quiz.length ? 'Next question' : 'Start again';
  simTab.disabled = false;
  simTab.title = '';
});
document.getElementById('quizWatch').addEventListener('click', () => {
  simTab.click();
  setRunning(true);
});
document.getElementById('quizNext').addEventListener('click', () => showQuestion(quizIndex + 1));
quizTab.addEventListener('click', () => { if (!answered) showQuestion(quizIndex); });

if (quizMode) {
  simTab.disabled = true;
  simTab.title = 'Answer the quiz question first';
  quizTab.click();
}
