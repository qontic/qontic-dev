import { mountClassicalTemplate } from './template.js?v=3';
import { BOX, parameters, clamp } from './physics.js';
import { lengthUnitNm, timeUnitPs, massInElectronUnits, formatDistance } from './physical-units.js';
import { Renderer, TrailHistory } from './renderer.js';
import { createExperiment, SCENES, sceneKey } from './experiments.js';
import { renderVideo } from './export.js?v=4';
import { mountPhaseLegend } from './phase-legend.js?v=4';

const $ = id => document.getElementById(id);
const query = new URLSearchParams(location.search);
const numericQuery = (name, fallback) => query.has(name) && Number.isFinite(Number(query.get(name))) ? Number(query.get(name)) : fallback;
const initialScene = Object.hasOwn(SCENES, query.get('scene')) ? query.get('scene') : sceneKey(query.get('obstacle') === '1');
const sceneClassicality = { free: SCENES.free.classicality, barrier: SCENES.barrier.classicality };
function freshSeed(previous) {
  let seed;
  do { seed = 1 + crypto.getRandomValues(new Uint32Array(1))[0] % 999999; } while (seed === previous);
  return seed;
}
const settings = {
  obstacle: initialScene === 'barrier',
  classicality: clamp(numericQuery('classicality', SCENES[initialScene].classicality), 0, 1),
  angle: clamp(numericQuery('angle', SCENES[initialScene].angle), -180, 180),
  seed: clamp(Math.floor(numericQuery('seed', freshSeed())), 1, 999999),
  count: clamp(Math.floor(numericQuery('count', 1)), 1, 256),
};
const appearance = {
  showWave: true, showPhase: true, showVelocity: true, showParticles: true, showTrails: true,
  trailStartTime: 0,
  showReference: true, dotSize: 15, trailSeconds: 5, brightness: 1, playback: 1,
};
let renderer, experiment, history;
let paused = query.get('paused') === '1';
let failed = false, pendingReset = false, waveDirty = true, drawingDirty = true;
let lastFrame = null, lastReadout = 0, frames = 0, fps = 60, maxNormError = 0;
let rafId = 0, evaluations = 0, lastEvaluations = 0;
let exportJob = null, lastExport = null, downloadURL = null;

const template = mountClassicalTemplate(() => {
  const [x, y] = renderer?.center ?? [0.5, 0.5];
  const half = 0.5 / (renderer?.zoom ?? 1);
  return {
    xMin: (x - half) * BOX.width * lengthUnitNm, xMax: (x + half) * BOX.width * lengthUnitNm,
    yMin: (y - half) * BOX.height * lengthUnitNm, yMax: (y + half) * BOX.height * lengthUnitNm,
  };
});
const sharedControls = template?.controls;
const phaseLegend = mountPhaseLegend($('phase-legend'));

function showError(error) {
  failed = true; paused = true;
  const message = error instanceof Error ? error.message : String(error);
  $('error').textContent = message; $('error').hidden = false;
  $('status').classList.add('failed'); $('status').lastElementChild.textContent = 'Paused · attention needed';
  $('pause').disabled = true;
  syncRunControls();
  syncRecordButton();
  exportJob?.abort();
  console.error(error);
}

function syncParameters() {
  const p = parameters(settings.classicality, settings.angle), s = p.classicality;
  const scene = sceneKey(settings.obstacle);
  sceneClassicality[scene] = s;
  $('classicality').value = s; $('classicality-value').textContent = `${Math.round(s * 100)}%`;
  $('classicality').setAttribute('aria-valuetext', `${Math.round(s * 100)} percent toward nearly classical`);
  $('angle').value = settings.angle; $('angle-value').textContent = `${settings.angle}°`;
  $('count').value = settings.count;
  $('count-value').textContent = settings.count;
  $('scene-free').checked = !settings.obstacle;
  $('scene-barrier').checked = settings.obstacle;
  $('scene-name').textContent = SCENES[scene].heading;
  $('scene-note').textContent = SCENES[scene].note;
  $('regime-name').textContent = s < 0.23 ? 'WAVE DOMINATED' : s < 0.62 ? 'TOWARD THE CLASSICAL LIMIT' : s < 0.86 ? 'LOCALIZED PACKET' : 'NEARLY CLASSICAL';
  $('regime-description').textContent = s < 0.23 ? 'Spreading and interference shape the path.' : s < 0.62 ? 'A shorter wavelength and gentler spreading.' : s < 0.86 ? 'A compact packet guides the particle along a straighter path.' : 'Almost straight flights, with wave-guided turns.';
}

function syncPhysicalReadouts() {
  const { alpha, wavelength, sigma, speed } = experiment.params;
  $('wavelength-nm').textContent = formatDistance(wavelength * lengthUnitNm);
  $('width-nm').textContent = formatDistance(sigma * lengthUnitNm);
  $('mass-me').textContent = `${Number(massInElectronUnits(alpha).toPrecision(3))} mₑ`;
  $('launch-speed').textContent = `${(speed * lengthUnitNm / timeUnitPs).toFixed(1)} km/s`;
}

function syncSimTime() {
  $('sim-time').textContent = `${(experiment.time * timeUnitPs).toFixed(2)} ps`;
}

function reset() {
  // Construct the complete new state before replacing the displayed experiment.
  const next = createExperiment(renderer.gl, settings);
  experiment?.dispose?.();
  experiment = next; history = new TrailHistory(next.count);
  appearance.trailStartTime = 0;
  history.append(0, next.positions); waveDirty = true; drawingDirty = true;
  pendingReset = false; lastFrame = null; maxNormError = 0;
  failed = false; $('error').hidden = true; $('pause').disabled = false; $('status').classList.remove('failed');
  syncRunControls();
  syncRecordButton();
  syncParameters();
  syncPhysicalReadouts();
  syncSimTime();
}

function scheduleReset() {
  // Keep this seed for the lifetime of the launch so exports reproduce it.
  settings.seed = freshSeed(settings.seed);
  pendingReset = true; syncParameters();
}

function selectScene(obstacle) {
  if (settings.obstacle === obstacle) return;
  sceneClassicality[sceneKey(settings.obstacle)] = settings.classicality;
  settings.obstacle = obstacle;
  settings.classicality = sceneClassicality[sceneKey(obstacle)];
}

function syncRunControls() {
  sharedControls?.setAttribute('running', String(!paused));
  sharedControls?.setAttribute('disabled', String(Boolean(exportJob)));
}

function setPaused(value) {
  paused = Boolean(value); lastFrame = null; drawingDirty = true;
  $('pause').textContent = paused ? 'Play' : 'Pause';
  syncRunControls();
  $('paused-badge').hidden = !paused;
  $('status').lastElementChild.textContent = paused ? 'Paused' : 'Live';
}

function syncCanvasLayout() {
  const slot = $('canvas-slot');
  // Fit the physical box inside both available dimensions. Resizing only changes
  // the display; the wave, trajectories and camera keep their current state.
  const border = 2, aspect = BOX.width / BOX.height;
  const width = Math.max(0, Math.min(slot.clientWidth - border, (slot.clientHeight - border) * aspect));
  Object.assign($('canvas-wrap').style, { width: `${width + border}px`, height: `${width / aspect + border}px` });
  phaseLegend.update();
  drawingDirty = true;
}

function appendTrail(time, positions, force = false) {
  if (appearance.showTrails) history.append(time, positions, force);
}

function advanceTo(target) {
  if (experiment.is2D) {
    experiment.evaluate(target); evaluations++;
    appendTrail(target, experiment.positions);
    maxNormError = Math.max(maxNormError, experiment.maxNormError); waveDirty = true;
    return;
  }
  const begin = experiment.time, before = experiment.positions.slice();
  const end = experiment.evaluate(target).slice(); evaluations++;
  let budget = 14;
  const refine = (t0, p0, t1, p1, depth) => {
    if (t1 - t0 <= experiment.params.sampleDt || depth >= 5 || budget <= 0) { appendTrail(t1, p1, depth > 0); return; }
    const mid = (t0 + t1) / 2, pm = experiment.evaluate(mid).slice(); evaluations++; budget--;
    let error = 0, distance = 0;
    for (let i = 0; i < pm.length; i += 2) {
      error = Math.max(error, Math.hypot(pm[i] - (p0[i] + p1[i]) / 2, pm[i + 1] - (p0[i + 1] + p1[i + 1]) / 2));
      distance = Math.max(distance, Math.hypot(p1[i] - p0[i], p1[i + 1] - p0[i + 1]));
    }
    if (error > 0.0004 || distance > 0.018) { refine(t0, p0, mid, pm, depth + 1); refine(mid, pm, t1, p1, depth + 1); }
    else { appendTrail(mid, pm, depth > 0); appendTrail(t1, p1, depth > 0); }
  };
  refine(begin, before, target, end, 0);
  if (experiment.time !== target) { experiment.evaluate(target); evaluations++; }
  maxNormError = Math.max(maxNormError, Math.abs(experiment.xAxis.norm * experiment.yAxis.norm - 1));
  waveDirty = true;
}

function draw() { renderer.render(experiment, history, appearance, waveDirty); waveDirty = false; drawingDirty = false; }

function frame(now) {
  if (!failed || pendingReset) {
    try {
      if (pendingReset) { pendingReset = false; reset(); }
      const elapsed = lastFrame === null ? 0 : (now - lastFrame) / 1000;
      lastFrame = now;
      if (elapsed > 0 && !paused && !document.hidden && (experiment.is2D || elapsed < 0.25)) {
        // Keep expensive 2D frames from queuing bigger batches as the GPU slows.
        // The solver keeps its normal timestep and guidance checks within each batch.
        const requested = elapsed * appearance.playback;
        const duration = experiment.is2D
          ? Math.min(requested, 0.05, 8 * experiment.maxDt * experiment.guidanceStepScale)
          : requested;
        advanceTo(experiment.time + duration);
        fps = fps * 0.95 + 0.05 / elapsed;
      }
      if (waveDirty || drawingDirty) draw();
      frames++;
      if (now - lastReadout > 200) {
        $('status').lastElementChild.textContent = exportJob ? 'Rendering video' : document.hidden ? 'Inactive tab' : paused ? 'Paused' : 'Live';
        syncSimTime();
        lastReadout = now; lastEvaluations = evaluations; evaluations = 0;
      }
    } catch (error) { showError(error); }
  }
  rafId = requestAnimationFrame(frame);
}

for (const [id, name] of [['classicality', 'classicality'], ['angle', 'angle']]) {
  $(id).addEventListener('input', () => { settings[name] = Number($(id).value); scheduleReset(); });
}
$('count').addEventListener('input', () => { settings.count = Number($('count').value); scheduleReset(); });
for (const scene of Object.keys(SCENES)) {
  $(`scene-${scene}`).addEventListener('change', () => {
    if (!$(`scene-${scene}`).checked) return;
    selectScene(scene === 'barrier'); scheduleReset();
  });
}

function syncVisibility() {
  appearance.showVelocity = $('show-velocity').checked;
  appearance.showWave = appearance.showPhase = $('show-wave').checked;
  appearance.showParticles = appearance.showTrails = $('show-particles').checked;
  appearance.showReference = $('show-reference').checked;
  $('reference-legend').hidden = !appearance.showReference;
  drawingDirty = true;
}
for (const id of ['show-wave', 'show-velocity', 'show-reference']) $(id).addEventListener('change', syncVisibility);
$('show-particles').addEventListener('change', () => {
  syncVisibility();
  if (!experiment) return;
  appearance.trailStartTime = experiment.time;
  history.clear(); history.append(experiment.time, experiment.positions);
});
for (const [id, key, format] of [['dot-size', 'dotSize', x => `${x} px`], ['trail-seconds', 'trailSeconds', x => `${(x * timeUnitPs).toFixed(1)} ps`], ['playback', 'playback', x => `${x.toFixed(1)}×`]]) {
  const input = $(id);
  const updateValue = value => {
    const label = format(value);
    $(`${id}-value`).textContent = label;
    input.setAttribute('aria-valuetext', label);
  };
  input.value = appearance[key];
  updateValue(appearance[key]);
  input.addEventListener('input', () => {
    appearance[key] = Number(input.value);
    updateValue(appearance[key]);
    if (key === 'playback') lastFrame = null;
    drawingDirty = true;
  });
}
$('reset').addEventListener('click', scheduleReset);
$('pause').addEventListener('click', () => setPaused(!paused));
sharedControls?.addEventListener('qontic:start', () => {
  if (failed) syncRunControls();
  else setPaused(false);
});
sharedControls?.addEventListener('qontic:stop', () => setPaused(true));
sharedControls?.addEventListener('qontic:reset', () => { if (renderer) scheduleReset(); });
function collapse() {
  const collapsed = document.body.classList.toggle('collapsed');
  $('collapse').textContent = collapsed ? '+' : '−'; $('collapse').setAttribute('aria-expanded', String(!collapsed));
  $('collapse').setAttribute('aria-label', collapsed ? 'Expand controls' : 'Collapse controls');
  drawingDirty = true;
}
$('collapse').addEventListener('click', collapse);
document.addEventListener('keydown', event => {
  if (exportJob) return;
  if (event.ctrlKey || event.altKey || event.metaKey || event.repeat || event.target.closest('input,select,textarea,button,summary,a,dialog')) return;
  if (event.code === 'Space' && !failed) { event.preventDefault(); setPaused(!paused); }
  if (event.key.toLowerCase() === 'r') scheduleReset();
  if (event.key.toLowerCase() === 'h') collapse();
});
document.addEventListener('visibilitychange', () => { lastFrame = null; });
window.addEventListener('message', event => {
  if (event.origin === location.origin && event.data?.type === 'qontic:set-paused' && event.data.paused) setPaused(true);
});
const layoutObserver = new ResizeObserver(syncCanvasLayout);
layoutObserver.observe($('canvas-slot'));
window.addEventListener('resize', syncCanvasLayout);
function viewChanged() {
  template?.updateOverlays();
  drawingDirty = true;
}
function resetView() {
  renderer?.resetView();
  viewChanged();
}
$('reset-view').addEventListener('click', resetView);
$('canvas').addEventListener('dblclick', () => { if (!template?.isMeasuring()) resetView(); });
$('canvas').addEventListener('wheel', event => {
  if (!renderer || failed || exportJob) return;
  event.preventDefault();
  const rect = $('canvas').getBoundingClientRect();
  const mouse = [(event.clientX - rect.left) / rect.width, 1 - (event.clientY - rect.top) / rect.height];
  const previous = renderer.zoom, next = clamp(previous * Math.exp(-event.deltaY * 0.0015), 1, 12);
  for (let i = 0; i < 2; i++) renderer.center[i] += (mouse[i] - 0.5) * (1 / previous - 1 / next);
  renderer.zoom = next; renderer.clampView(); viewChanged();
}, { passive: false });
let drag = null;
$('canvas').addEventListener('pointerdown', event => {
  if (!renderer || template?.isMeasuring()) return;
  drag = [event.clientX, event.clientY, ...renderer.center];
  $('canvas').setPointerCapture(event.pointerId);
});
$('canvas').addEventListener('pointermove', e => {
  if (!drag || !renderer) return;
  const r = $('canvas').getBoundingClientRect();
  renderer.center = [drag[2] - (e.clientX - drag[0]) / r.width / renderer.zoom, drag[3] + (e.clientY - drag[1]) / r.height / renderer.zoom];
  renderer.clampView(); viewChanged();
});
for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) $('canvas').addEventListener(type, () => { drag = null; });

function syncRecordButton() {
  const active = Boolean(exportJob);
  $('record').classList.toggle('recording', active);
  $('record-label').textContent = active ? 'Cancel render' : 'Render video · 30 fps';
  const hasEncoder = typeof VideoEncoder !== 'undefined';
  $('record').disabled = !active && (failed || !hasEncoder);
  if (failed && !active) $('export-status').textContent = 'The simulation must be available to render a video.';
  else if (!hasEncoder) $('export-status').textContent = 'Open in Chrome or Edge to render video.';
}
async function record() {
  if (exportJob) { exportJob.abort(); $('record').disabled = true; return; }
  if (failed) return;
  if (pendingReset) reset();
  const wasPaused = paused;
  const controller = new AbortController(); exportJob = controller; lastExport = null;
  setPaused(true); syncRecordButton();
  const controls = [...document.querySelectorAll(
    ':is(aside, .classical-export-dialog) :is(input, select, button:not(#record)), #reset-view'
  )];
  const disabled = controls.map(control => control.disabled);
  controls.forEach(control => { control.disabled = true; });
  $('export-progress').hidden = false; $('export-progress').value = 0;
  $('export-download').hidden = true;
  $('canvas-wrap').classList.add('rendering-video');
  try {
    if (downloadURL) { URL.revokeObjectURL(downloadURL); downloadURL = null; }
    const result = await renderVideo({ settings: { ...settings }, appearance: { ...appearance },
      view: { center: [...renderer.center], zoom: renderer.zoom }, displayWidth: $('canvas').clientWidth,
      phaseLegend: phaseLegend.exportState(),
      width: Number($('export-size').value), duration: Number($('export-duration').value),
      startTime: $('export-start').value === 'current' ? experiment.time : 0, signal: controller.signal,
      onPreview: canvas => $('canvas-wrap').append(canvas),
      onProgress: ({ stage, completed, total }) => {
        $('export-progress').max = total; $('export-progress').value = completed;
        $('export-status').textContent = stage === 'Rendering' ? `Rendering ${Math.round(100 * completed / total)}% · ${completed} / ${total} frames` : `${stage} video…`;
      },
    });
    lastExport = result.report;
    downloadURL = URL.createObjectURL(result.blob);
    const link = $('export-download'); link.href = downloadURL;
    link.download = `classical-limit-${SCENES[sceneKey(settings.obstacle)].filename}-${Math.round(settings.classicality * 100)}-${result.report.width}x${result.report.height}-30fps-${new Date().toISOString().replace(/[:.]/g, '-')}.${result.extension}`;
    link.hidden = false; link.textContent = `Save ${result.extension.toUpperCase()} again`;
    $('export-status').textContent = `Ready · ${result.report.width} × ${result.report.height} · 30 fps · ${result.report.duration} s`;
    link.click();
  } catch (error) {
    $('export-status').textContent = error.name === 'AbortError' ? 'Render cancelled.' : `Export failed: ${error.message}`;
    if (error.name !== 'AbortError') console.error('Video export:', error);
  } finally {
    exportJob = null;
    controls.forEach((control, i) => { control.disabled = disabled[i]; });
    $('export-progress').hidden = true; $('canvas-wrap').classList.remove('rendering-video');
    syncRecordButton(); setPaused(failed || wasPaused); drawingDirty = true;
  }
}
$('record').addEventListener('click', record);
$('canvas').addEventListener('webglcontextlost', event => {
  if (experiment?.is2D) experiment.contextLost = true;
  event.preventDefault(); showError(new Error('The graphics context was lost. Waiting for the browser to restore it…'));
});
$('canvas').addEventListener('webglcontextrestored', () => {
  try {
    renderer = new Renderer($('canvas')); failed = false; waveDirty = true; drawingDirty = true; lastFrame = null;
    if (settings.obstacle) reset();
    $('error').hidden = true; $('status').classList.remove('failed'); $('pause').disabled = false;
    syncRecordButton(); setPaused(true); viewChanged(); draw();
  } catch (e) { showError(e); }
});
window.addEventListener('beforeunload', () => {
  layoutObserver.disconnect();
  cancelAnimationFrame(rafId); exportJob?.abort();
  if (downloadURL) URL.revokeObjectURL(downloadURL);
  renderer?.dispose();
  experiment?.dispose?.();
});

try {
  if (query.get('embed') === '1') document.querySelector('.brand-home').hidden = true;
  syncCanvasLayout();
  renderer = new Renderer($('canvas')); reset(); setPaused(paused);
  draw();
  // Explicit test mode only: numerical inspection and deterministic stress tests.
  if (query.get('test') === '1') window.__classicalLimit = {
    ready: true,
    snapshot: () => ({ ...experiment.diagnostics(), settings: { ...settings }, appearance: { ...appearance },
      scene: sceneKey(settings.obstacle), sceneClassicality: { ...sceneClassicality }, paused, failed, frames, fps,
      maxNormError, historyLength: history.length, lastEvaluations, gpu: renderer.gpu,
      exporting: Boolean(exportJob), lastExport,
      glError: renderer.gl.getError(), canvas: [$('canvas').width, $('canvas').height],
      view: { center: [...renderer.center], zoom: renderer.zoom } }),
    pause: setPaused,
    configure: options => {
      if ('obstacle' in options) selectScene(Boolean(options.obstacle));
      for (const key of ['classicality', 'angle', 'seed', 'count']) if (key in options) settings[key] = options[key];
      const p = parameters(settings.classicality, settings.angle);
      settings.classicality = p.classicality; settings.angle = p.angle;
      settings.seed = clamp(Math.floor(settings.seed), 1, 999999); settings.count = clamp(Math.floor(settings.count), 1, 256);
      reset(); draw(); return experiment.diagnostics();
    },
    seek: time => { if (experiment.is2D && time < experiment.time) reset(); experiment.evaluate(time); history.clear(); history.append(time, experiment.positions); waveDirty = true; draw(); return experiment.diagnostics(); },
    run: (duration, dt = 1 / 60) => {
      const target = experiment.time + duration;
      while (experiment.time < target - 1e-10) advanceTo(Math.min(target, experiment.time + dt));
      draw(); return experiment.diagnostics();
    },
    recoverContext: () => { const ext = renderer.gl.getExtension('WEBGL_lose_context'); ext.loseContext(); setTimeout(() => ext.restoreContext(), 100); },
  };
  rafId = requestAnimationFrame(frame);
} catch (error) { showError(error); }
