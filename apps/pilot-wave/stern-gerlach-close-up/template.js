import '../../../shared/qontic-controls.js?v=4';
import { mountQonticShell } from '../../../shared/qontic-shell.js';
import { mountQonticMedia } from '../../../shared/qontic-media.js?v=legend1';
import { mountQonticShortcuts } from '../../../shared/qontic-shortcuts.js';
import { mountQonticQuiz } from '../../../shared/qontic-quiz.js?v=8';

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
controls.addEventListener('qontic:interpretation', ({ detail }) => simulation?.setReading(detail.interpretation));
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
  if (view === 'physics' || view === 'quiz') setRunning(false);
  else simulation?.redraw();
});

canvas.addEventListener('stern-gerlach:unavailable', () => {
  controls.setAttribute('disabled', '');
  controls.setAttribute('running', 'false');
  document.body.classList.remove('simulation-ready');
});

try {
  ({ simulation } = await import('./main.js?v=22'));
} catch (error) {
  // The engine displays specific WebGPU errors when it can.
  if (document.getElementById('gpu-help').hidden) {
    console.error('Could not load Stern–Gerlach Close-Up', error);
    document.getElementById('gpu-status-title').textContent = 'The simulation could not load';
    document.getElementById('gpu-help').hidden = false;
  }
}

if (simulation?.isAvailable()) {
  if (document.body.dataset.view === 'physics' || document.body.dataset.view === 'quiz') simulation.setRunning(false);
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
    axesControl: {
      getVisible: () => simulation.getAxesVisible(),
      setVisible: value => simulation.setAxesVisible(value),
    },
    legendControl: {
      getVisible: () => !document.getElementById('scene-legend').hidden,
      setVisible: value => { document.getElementById('scene-legend').hidden = !value; },
    },
  });

  mountQonticShortcuts({
    target: canvas,
    togglePlayback: () => setRunning(!simulation.isRunning()),
    reset: () => simulation.reset(),
    // S remains the existing camera-orbit shortcut in this app.
  });
}


// ── Quiz tab (shared module): predict before watching ──────────────────────
function applyReading(id) {
  controls.setAttribute('interpretation', id);
  simulation?.setReading(id);
}
function prepare({ spin, reading = 'pw' }) {
  return () => {
    applyReading(reading);
    simulation?.setMagnetPreset(0);
    simulation?.setMagnetAngle?.(0);
    simulation?.setInitialSpin(spin);
    setRunning(false);
  };
}
// A still side view (x to the right, z up) that does not show the outcome.
function drawSideView(c, { dot = false } = {}) {
  const g = c.getContext('2d');
  const W = c.width, H = c.height;
  g.fillStyle = '#03080f';
  g.fillRect(0, 0, W, H);
  const x0 = 24, x1 = W - 24, y0 = 56, y1 = H - 56;
  g.strokeStyle = 'rgba(160, 190, 210, 0.45)';
  g.lineWidth = 1;
  g.strokeRect(x0, y0, x1 - x0, y1 - y0);
  for (let x = x0 + 18; x < x1 - 20; x += 24) {
    g.strokeStyle = 'rgba(255, 70, 40, 0.75)';
    g.lineWidth = 2;
    g.beginPath(); g.moveTo(x, y1); g.lineTo(x, y0); g.stroke();
  }
  g.strokeStyle = '#5cc6f0';
  g.lineWidth = 3;
  g.beginPath(); g.moveTo(x1 - 4, y0); g.lineTo(x1 - 4, y1); g.stroke();
  const cx = x0 + 70, cz = (y0 + y1) / 2, r = 42;
  const blob = g.createRadialGradient(cx, cz, 0, cx, cz, r);
  blob.addColorStop(0, 'rgba(232, 251, 255, 0.95)');
  blob.addColorStop(0.45, 'rgba(74, 168, 255, 0.8)');
  blob.addColorStop(1, 'rgba(40, 90, 220, 0)');
  g.fillStyle = blob;
  g.beginPath(); g.arc(cx, cz, r, 0, 2 * Math.PI); g.fill();
  if (dot) {
    g.fillStyle = '#ffdb14';
    g.beginPath(); g.arc(cx + 6, cz - 16, 5, 0, 2 * Math.PI); g.fill();
  }
  g.fillStyle = '#d7e4ee';
  g.font = '13px Inter, system-ui, sans-serif';
  g.fillText('beam →', cx - 22, y1 + 22);
  g.fillText('z ↑', 6, y0 - 10);
  g.fillText('B up, stronger toward the top', x0 + 40, y0 - 12);
  g.fillText('plate', x1 - 40, y1 + 22);
}
const spinAnswers = [
  { id: 'up', label: 'The whole packet moves up' },
  { id: 'down', label: 'The whole packet moves down' },
  { id: 'split', label: 'It splits into an upper and a lower part of equal weight' },
  { id: 'straight', label: 'It goes straight, without moving up or down' },
];
const PW = 'Pilot wave.';
mountQonticQuiz({
  panel: document.getElementById('quiz'),
  tab: document.querySelector('button[data-view="quiz"]'),
  simulationTab: document.querySelector('button[data-view="simulation"]'),
  intro: 'In this model the magnetic moment is parallel to the spin, so the +z spin part is pushed toward the stronger field. The field points up and is stronger toward the top of the box.',
  shuffle: true,
  score: true,
  shareLink: true,
  onWatch: () => setRunning(true),
  questions: [
    { question: 'A packet with spin +z enters the field. What happens to it?',
      answer: 'up', answers: spinAnswers, caption: 'Side view at the start. Initial spin +z.',
      prepare: prepare({ spin: 0 }), draw: c => drawSideView(c),
      plain: 'It moves up as a whole: all of it is +z, and +z is pushed toward the stronger field.',
      explain: 'The force on the moment is ∇(μ·B). With μ parallel to the spin and B_z growing upward, the +z part is pushed up. Nothing splits, because there is only one spin component.' },
    { question: 'Now the packet is an equal superposition of +z and −z. What happens?',
      answer: 'split', answers: spinAnswers, caption: 'Side view at the start. Initial spin: equal +z and −z.',
      prepare: prepare({ spin: 1 }), draw: c => drawSideView(c),
      plain: 'It splits: the +z part goes up and the −z part goes down, each with half the weight.',
      explain: 'Apart from a small y component of the field, which barely matters here, the Pauli equation acts on each spin component separately, so the two components feel opposite forces. The uniform part of the field keeps them from mixing, so each part keeps weight ½.' },
    { question: `${PW} Same superposition. The yellow particle starts in the upper half of the packet. Where does it end up?`,
      answer: 'upper', caption: 'Side view at the start. The yellow dot is the particle.',
      answers: [
        { id: 'upper', label: 'In the upper branch' },
        { id: 'lower', label: 'In the lower branch' },
        { id: 'coin', label: 'Either one, with a 50–50 chance decided at the plate' },
        { id: 'hidden', label: 'Either one, set by a hidden spin direction the particle carries' },
      ],
      prepare: prepare({ spin: 1 }), draw: c => drawSideView(c, { dot: true }),
      plain: 'In the upper branch: its starting position decides.',
      explain: 'The particle follows the velocity field of the wave, and particle paths cannot cross in this description. Particles from the upper half follow the upper branch and those from the lower half the lower one; only particles that start very near the middle can end in the other branch. The particle carries no extra spin variable: the spin is in the wave.' },
    { question: `${PW} Same superposition, 500 dots. About how many end up on the upper half of the plate?`,
      answer: 'half', caption: 'Side view at the start.',
      answers: [
        { id: 'half', label: 'About 250, give or take about 11' },
        { id: 'exact', label: 'Exactly 250' },
        { id: 'all', label: 'All 500 in one half, chosen at random on each run' },
        { id: 'most', label: 'About 400' },
      ],
      prepare: prepare({ spin: 1 }), draw: c => drawSideView(c),
      plain: 'About 250: the starting positions are random, drawn from |Ψ|², and half the weight is in the upper part.',
      explain: 'Each dot lands in the upper half with probability ½, so the count fluctuates around 250 with a standard deviation of √(500 × ½ × ½) ≈ 11. Watch the counts in the corner over a few reruns.' },
    { question: 'Orthodox reading. Same superposition. Where is the particle while the packet is splitting, before it reaches the plate?',
      answer: 'none', caption: 'Side view at the start. The cloud is |Ψ|².',
      answers: [
        { id: 'none', label: 'The theory gives it no position; |Ψ|² gives the chances of where it will be found' },
        { id: 'unknown', label: 'In one of the two branches; we just do not know which' },
        { id: 'smeared', label: 'Spread over both branches as a smeared-out particle' },
        { id: 'centre', label: 'At the centre of the cloud' },
      ],
      prepare: prepare({ spin: 1, reading: 'cpn' }), draw: c => drawSideView(c),
      plain: 'The orthodox reading gives it no position until it is detected.',
      explain: 'Only the wave is described. At the plate a single hit appears in one half, with probability ½ each. "In one branch, we do not know which" is the pilot-wave answer; the simulation shows only the cloud in this reading.' },
    { question: `${PW} The spin term of the guidance law is switched off (Advanced: Spin term). What changes at the plate?`,
      answer: 'paths', caption: 'Side view at the start.', watch: false,
      answers: [
        { id: 'paths', label: 'Only the individual trajectories; the counts have the same statistics' },
        { id: 'counts', label: 'The upper and lower counts change' },
        { id: 'nosplit', label: 'The packet no longer splits' },
        { id: 'nothing', label: 'Nothing changes, not even the trajectories' },
      ],
      prepare: prepare({ spin: 1 }), draw: c => drawSideView(c),
      plain: 'Only the trajectories change; the statistics stay the same.',
      explain: 'The spin term (ħ/2mρ)∇×(Ψ†σΨ) has zero divergence, so it does not change how the dot density evolves: it stays |Ψ|² with or without it. It does change which way individual dots move, and which dots near the middle cross to the other branch. Try the Spin term switch in the Advanced tab.' },
    { question: 'For a silver atom the magnetic moment is antiparallel to the spin. In this field, which spin part goes up?',
      answer: 'minus', caption: 'Side view at the start.', watch: false,
      answers: [
        { id: 'minus', label: 'The −z part' },
        { id: 'plus', label: 'The +z part' },
        { id: 'neither', label: 'Neither; both go straight' },
        { id: 'both', label: 'Both' },
      ],
      prepare: prepare({ spin: 1 }), draw: c => drawSideView(c),
      plain: 'The −z part: its moment points up, toward the stronger field.',
      explain: 'The force pushes the moment toward the stronger field. With the moment antiparallel to the spin, it is the −z spin part whose moment points up. The splitting looks the same; only the labels swap.' },
  ],
});
