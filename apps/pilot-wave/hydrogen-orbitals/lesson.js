import '../../../shared/qontic-controls.js';
import { mountQonticShell } from '../../../shared/qontic-shell.js';
import { mountQonticMedia } from '../../../shared/qontic-media.js';
import { orbitals, samplePosition, positionAt } from './orbitals.js';

const get = id => document.getElementById(id);
const canvas = get('orbital-canvas');
const ctx = canvas.getContext('2d');
const background = document.createElement('canvas');
const bg = background.getContext('2d');
const controls = document.querySelector('qontic-controls');
const orbitalPicker = get('orbital');
const answers = [...document.querySelectorAll('[data-answer]')];
const tabs = [...document.querySelectorAll('[data-view]')];
const initial = [2.5, 0, 1.4];
const startYaw = 0.55, startPitch = 0.33;
const bohrRadiusPm = 52.9177, atomicTimeAs = 24.1888;
const modelUnitsPerSecond = 8;

let orbital = orbitals['1s'], cloud = [];
let running = false, speed = 1, time = 0, previousFrame = null, frameId = null;
let yaw = startYaw, pitch = startPitch, drag;
let dirty = true, w = 0, h = 0, pixelRatio = 1, scale = 1;
let palette;
const visibility = { density: true, trail: true, axes: true };

mountQonticShell({
  title: 'Hydrogen Atom — Orbitals and Trajectories',
  navigation: 'breadcrumbs',
  homeHref: '../../../index.html',
  breadcrumbs: [
    { label: 'Q-Ontic Lab', href: '../../../index.html' },
    { label: 'Potential Wells and Bound States', href: '../../../modules/potential-well/' },
  ],
  version: 'Hydrogen Atom · Draft',
});

mountQonticMedia({
  stage: document.querySelector('.qontic-stage'),
  getCanvases: () => [canvas],
  filename: 'hydrogen-orbitals',
  beginRecording() {
    const wasRunning = running;
    setRunning(true);
    return wasRunning;
  },
  endRecording(wasRunning) { setRunning(wasRunning); },
});

function requestDraw(rebuild = false) {
  dirty ||= rebuild;
  if (frameId === null) frameId = requestAnimationFrame(frame);
}

function resetRun() {
  time = 0;
  previousFrame = null;
  requestDraw();
}

function setRunning(value) {
  if (running === value) return;
  running = value;
  previousFrame = null;
  controls.setAttribute('running', String(value));
  requestDraw();
}

function selectOrbital(key) {
  orbital = orbitals[key];
  let seed = 13827;
  const random = () => {
    seed = (Math.imul(1664525, seed) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  cloud = Array.from({ length: 4400 }, () => samplePosition(orbital, random));
  get('orbital-name').textContent = orbital.label;
  get('orbital-numbers').textContent = `n = ${orbital.n}, ℓ = ${orbital.l}, mℓ = ${orbital.m > 0 ? '+' : ''}${orbital.m}`;
  get('orbital-summary').textContent = orbital.summary;
  get('prediction-feedback').textContent = 'Make a prediction, then press Start.';
  answers.forEach(button => button.setAttribute('aria-pressed', 'false'));
  setRunning(false);
  resetRun();
  requestDraw(true);
}

for (const button of answers) button.addEventListener('click', () => {
  const expected = orbital.m === 0 ? 'still' : 'circle';
  const response = button.dataset.answer === expected ? 'Correct.' : 'Try again.';
  answers.forEach(candidate => candidate.setAttribute('aria-pressed', String(candidate === button)));
  get('prediction-feedback').textContent = `${response} ${orbital.explanation}`;
});

for (const button of tabs) button.addEventListener('click', () => {
  const view = button.dataset.view;
  document.body.dataset.view = view;
  for (const tab of tabs) {
    const selected = tab === button;
    tab.classList.toggle('active', selected);
    tab.setAttribute('aria-pressed', String(selected));
    get(tab.dataset.view).hidden = !selected;
  }
  if (view === 'physics') setRunning(false);
  else requestDraw(true);
});

orbitalPicker.addEventListener('change', () => selectOrbital(orbitalPicker.value));
controls.addEventListener('qontic:start', () => {
  const feedback = get('prediction-feedback');
  if (!answers.some(button => button.getAttribute('aria-pressed') === 'true')) {
    feedback.textContent = 'Watch the gold particle, then test your prediction.';
  }
  setRunning(true);
});
controls.addEventListener('qontic:stop', () => setRunning(false));
controls.addEventListener('qontic:reset', resetRun);
controls.addEventListener('qontic:speed', event => { speed = event.detail.speed; });
controls.addEventListener('qontic:tab', ({ detail }) => {
  get('core-controls').hidden = detail.tab !== 'core';
  get('display-controls').hidden = detail.tab !== 'display';
});
controls.addEventListener('qontic:theme', () => requestDraw(true));
for (const name of Object.keys(visibility)) get(name).addEventListener('change', event => {
  visibility[name] = event.target.checked;
  requestDraw(true);
});

function rotate(dx, dy) {
  yaw += dx;
  pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, pitch + dy));
  requestDraw(true);
}
get('top-view').addEventListener('click', () => { yaw = 0; pitch = Math.PI / 2; requestDraw(true); });
get('reset-view').addEventListener('click', () => { yaw = startYaw; pitch = startPitch; requestDraw(true); });
canvas.addEventListener('pointerdown', event => {
  if (event.button !== 0 || drag) return;
  drag = { id: event.pointerId, x: event.clientX, y: event.clientY };
  canvas.setPointerCapture(event.pointerId);
});
canvas.addEventListener('pointermove', event => {
  if (drag?.id !== event.pointerId) return;
  rotate((event.clientX - drag.x) * 0.008, (event.clientY - drag.y) * 0.008);
  drag.x = event.clientX;
  drag.y = event.clientY;
});
canvas.addEventListener('lostpointercapture', event => { if (drag?.id === event.pointerId) drag = null; });
canvas.addEventListener('keydown', event => {
  const move = { ArrowLeft: [-0.13, 0], ArrowRight: [0.13, 0], ArrowUp: [0, -0.13], ArrowDown: [0, 0.13] }[event.key];
  if (!move) return;
  event.preventDefault();
  rotate(...move);
});

function projector() {
  const cy = Math.cos(yaw), sy = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch);
  return ([x, y, z]) => [w / 2 + scale * (cy * x + sy * y), h / 2 - scale * (cp * z + sp * (cy * y - sy * x))];
}

function rebuildBackground(project) {
  dirty = false;
  const style = getComputedStyle(document.documentElement);
  palette = Object.fromEntries(['primary', 'axis', 'cloud', 'particle', 'proton'].map(name => {
    const css = { primary: '--bg-primary', axis: '--text-secondary' }[name] ?? `--orbital-${name}`;
    return [name, style.getPropertyValue(css).trim()];
  }));
  bg.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  const light = document.documentElement.classList.contains('qontic-light');
  bg.fillStyle = palette.primary;
  bg.fillRect(0, 0, w, h);

  if (visibility.axes) {
    bg.strokeStyle = bg.fillStyle = palette.axis;
    bg.font = '12px system-ui';
    const origin = project([0, 0, 0]);
    for (const [i, label] of ['x', 'y', 'z'].entries()) {
      const endpoint = [0, 0, 0];
      endpoint[i] = 7.5;
      const end = project(endpoint);
      if (Math.hypot(end[0] - origin[0], end[1] - origin[1]) < 9) continue;
      bg.beginPath();
      bg.moveTo(...origin);
      bg.lineTo(...end);
      bg.globalAlpha = 0.42;
      bg.stroke();
      bg.globalAlpha = 1;
      bg.fillText(label, end[0] + 4, end[1]);
    }
  }

  if (visibility.density) {
    bg.fillStyle = palette.cloud;
    bg.globalAlpha = light ? 0.21 : 0.3;
    for (const point of cloud) {
      const [x, y] = project(point);
      bg.fillRect(x, y, 1.8, 1.8);
    }
    bg.globalAlpha = 1;
  }

  bg.fillStyle = palette.proton;
  bg.beginPath();
  bg.arc(w / 2, h / 2, 3.5, 0, 2 * Math.PI);
  bg.fill();

  const barWidth = scale * 100 / bohrRadiusPm;
  bg.strokeStyle = bg.fillStyle = palette.axis;
  bg.beginPath();
  bg.moveTo(12, h - 15);
  bg.lineTo(12 + barWidth, h - 15);
  bg.moveTo(12, h - 18);
  bg.lineTo(12, h - 12);
  bg.moveTo(12 + barWidth, h - 18);
  bg.lineTo(12 + barWidth, h - 12);
  bg.stroke();
  bg.font = '11px system-ui';
  bg.fillText('100 pm', 12, h - 22);
}

function frame(now) {
  frameId = null;
  if (running && previousFrame !== null) time += (now - previousFrame) / 1000 * modelUnitsPerSecond * speed;
  previousFrame = running ? now : null;
  if (w === 0 || h === 0) return;

  const project = projector();
  if (dirty) rebuildBackground(project);
  ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  ctx.drawImage(background, 0, 0, w, h);
  ctx.strokeStyle = ctx.fillStyle = palette.particle;
  if (visibility.trail && orbital.m !== 0 && time > 0) {
    const trailStart = Math.max(0, time - 24);
    ctx.globalAlpha = 0.65;
    ctx.lineWidth = 1.7;
    ctx.beginPath();
    ctx.moveTo(...project(positionAt(orbital, initial, trailStart)));
    for (let i = 1; i <= 56; i++) {
      ctx.lineTo(...project(positionAt(orbital, initial, trailStart + (time - trailStart) * i / 56)));
    }
    ctx.stroke();
    ctx.globalAlpha = 1;
  }
  const [x, y] = project(positionAt(orbital, initial, time));
  ctx.beginPath();
  ctx.arc(x, y, 4.5, 0, 2 * Math.PI);
  ctx.fill();
  const clock = get('clock'), label = `${Math.round(time * atomicTimeAs)} as`;
  if (clock.value !== label) clock.value = label;
  if (running) requestDraw();
}

new ResizeObserver(() => {
  w = canvas.clientWidth;
  h = canvas.clientHeight;
  if (w === 0 || h === 0) return;
  scale = Math.min(w, h) / 18;
  pixelRatio = Math.min(devicePixelRatio || 1, 2);
  canvas.width = background.width = Math.round(w * pixelRatio);
  canvas.height = background.height = Math.round(h * pixelRatio);
  requestDraw(true);
}).observe(canvas);
document.addEventListener('visibilitychange', () => { previousFrame = null; });
selectOrbital(orbitalPicker.value);
