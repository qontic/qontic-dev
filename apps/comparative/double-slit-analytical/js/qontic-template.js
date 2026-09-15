import { mountQonticShell } from '../../../../shared/qontic-shell.js';
import '../../../../shared/qontic-controls.js?v=2.7';

// Adapt the existing controls in place so their listeners and physics stay intact.
$(function () {
  const shell = document.createElement('main');
  shell.className = 'shell analytical-shell';
  shell.innerHTML = `<header><div><p class="eyebrow">Q-Ontic interactive laboratory</p><h1>Double Slit</h1></div></header>
    <nav class="tabs" aria-label="Application sections">
      <button type="button" data-page="0" class="active">Simulation</button>
      <button type="button" data-page="2">Math</button>
      <button type="button" data-page="1">Rationale</button>
    </nav>`;
  const root = document.getElementById('superContainer');
  root.before(shell);
  shell.append(root);
  $('#psiTabs').tabs('destroy');
  const math = document.getElementById('math-container');
  root.append(math);
  $('#superContainer > ul').append('<li><a href="#math-container">Math</a></li>');
  $('#superContainer').tabs('refresh');
  const pageButtons = shell.querySelectorAll('[data-page]');
  const syncPage = () => {
    const active = $('#superContainer').tabs('option', 'active');
    pageButtons.forEach(button => {
      const selected = Number(button.dataset.page) === active;
      button.classList.toggle('active', selected);
      button.setAttribute('aria-pressed', String(selected));
    });
  };
  pageButtons.forEach(button => button.addEventListener('click', () => {
    $('#superContainer').tabs('option', 'active', Number(button.dataset.page));
    syncPage();
  }));
  $('#superContainer').on('tabsactivate', syncPage);

  const controls = document.createElement('qontic-controls');
  controls.id = 'sharedControls';
  controls.setAttribute('show-reset', 'true');
  controls.setAttribute('show-autorun', 'false');
  document.getElementById('psiTabs').prepend(controls);
  const core = document.getElementById('basics-container');
  core.prepend(document.getElementById('experiment-bar'));
  const advanced = document.createElement('div');
  advanced.id = 'analytical-advanced';
  core.after(advanced);
  for (const [id, title] of [['particle-parameter-container', 'Particles'], ['detector-parameter-container', 'Geometry and detector']]) {
    const panel = document.getElementById(id);
    const heading = document.createElement('h3');
    heading.textContent = title;
    panel.prepend(heading);
    advanced.append(panel);
  }
  // Keep one visible copy of each control, preserving the original input IDs.
  document.getElementById('graphics-parameter-container').prepend(core.querySelector('.wave-range-box'));
  const panels = {core, advanced, display: document.getElementById('graphics-parameter-container')};
  const showControls = name => {
    Object.entries(panels).forEach(([key, panel]) => { panel.hidden = key !== name; });
    document.body.classList.toggle('show-advanced', name === 'advanced');
  };
  controls.addEventListener('qontic:tab', event => showControls(event.detail.tab));
  showControls('core');

  const modeMap = {cpn: 'copenhagen', pw: 'bohmian', mw: 'manyworlds'};
  const reverseModes = {copenhagen: 'cpn', bohmian: 'pw', manyworlds: 'mw'};
  const setAttribute = (key, value) => {
    if (controls.getAttribute(key) !== String(value)) controls.setAttribute(key, String(value));
  };
  const sync = () => {
    setAttribute('interpretation', reverseModes[interpretation]);
    setAttribute('running', isAnimating);
    setAttribute('speed', $('#animationStep-group')[0].getValueInFirstUnit());
    setAttribute('theme', document.documentElement.getAttribute('data-theme') || 'dark');
    setAttribute('show-interpretation', !viewLocked);
    const slider = controls.shadowRoot.querySelector('.qontic-speed input');
    slider.min = document.getElementById('animationStep').min;
    slider.max = document.getElementById('animationStep').max;
    slider.step = document.getElementById('animationStep').step;
    slider.value = controls.getAttribute('speed');
    slider.setAttribute('aria-label', 'Simulation speed');
  };
  controls.addEventListener('qontic:interpretation', event => { changeInterpretation(modeMap[event.detail.interpretation]); sync(); });
  for (const action of ['start', 'stop']) controls.addEventListener('qontic:' + action, () => {
    if ((action === 'start') !== isAnimating) $('#startButton').trigger('click');
    sync();
  });
  controls.addEventListener('qontic:reset', () => { $('#resetButton').trigger('click'); sync(); });
  controls.addEventListener('qontic:speed', event => {
    $('#animationStep').val(event.detail.speed).trigger('input').trigger('change');
    sync();
  });
  controls.addEventListener('qontic:theme', event => {
    if (document.documentElement.getAttribute('data-theme') !== event.detail.theme) toggleTheme();
    sync();
  });
  // Prevent typing/arrow/space events inside shadow controls from activating
  // the legacy document shortcuts as though the user had clicked the canvas.
  controls.addEventListener('keydown', event => event.stopPropagation());
  for (const id of ['startButton', 'toggleView']) new MutationObserver(sync).observe(document.getElementById(id), {childList: true});
  new MutationObserver(sync).observe(document.documentElement, {attributes: true, attributeFilter: ['data-theme']});
  $('#animationStep, #animationStep-input').on('input.template change.template', sync);
  sync();

  mountQonticShell({
    title: 'Double Slit',
    purpose: 'Compare Orthodox, Pilot-Wave, and Many-Worlds accounts of one double-slit experiment.',
    version: 'Analytical double slit · Version 7 · Q-Ontic template',
    homeHref: '../../../index.html',
  });
  document.body.classList.add('analytical-template');
  syncPage();

  // Match actual canvas pixels to the displayed size. Geometry and time step
  // in world units, all detections, and in-flight trajectories are preserved.
  const container = document.getElementById('canvas-container');
  const resizeCanvas = () => {
    const width = Math.round(container.clientWidth), height = Math.round(container.clientHeight);
    if (width < 100 || height < 100 || (canvas.width === width && canvas.height === height)) return;
    const previousDeltaT = deltaT, previousStepsPerCycle = stepsPerCycle;
    for (const id of ['setupCanvas', 'waveCanvas', 'partCanvas']) {
      const layer = document.getElementById(id);
      layer.width = width; layer.height = height;
    }
    // Reuse the GPU context/resources instead of creating a context per resize.
    if (waveGlCanvas) { waveGlCanvas.width = width; waveGlCanvas.height = height; }
    invalidateAllCaches();
    setupGeo(false);
    deltaT = previousDeltaT;
    stepsPerCycle = previousStepsPerCycle;
    renderSetupFlag = 1;
    if (!isAnimating) drawSystem(currentCycleIndex);
  };
  let resizeFrame;
  new ResizeObserver(() => {
    cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(resizeCanvas);
  }).observe(container);
  resizeCanvas();
});
