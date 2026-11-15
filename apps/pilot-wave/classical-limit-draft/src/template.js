import '../../../../shared/qontic-controls.js';
import { mountQonticMedia } from '../../../../shared/qontic-media.js';
import { mountQonticShell } from '../../../../shared/qontic-shell.js';

export function mountClassicalTemplate() {
  const params = new URLSearchParams(location.search);
  if (params.get('embed') === '1') return null;

  const shell = document.querySelector('main');
  const panel = document.getElementById('panel');
  const stage = document.querySelector('.stage');
  const body = document.getElementById('panel-body');
  const toolbar = panel.querySelector('.panel-heading');
  const header = document.createElement('header');
  header.innerHTML = `<div><p class="eyebrow">Q-Ontic interactive laboratory</p><h1>Classical Limit</h1></div>`;
  const views = document.createElement('nav');
  views.className = 'tabs';
  views.setAttribute('aria-label', 'Views');
  views.innerHTML = `<button class="active" type="button" data-view="simulation" aria-pressed="true">Simulation</button>
    <button type="button" data-view="physics" aria-pressed="false">Physics</button>`;
  const workspace = document.createElement('div');
  workspace.className = 'qontic-workspace';
  shell.classList.add('shell');
  document.body.classList.add('classical-template');
  panel.classList.add('qontic-sidebar', 'qontic-panel', 'qontic-control-panel');
  stage.classList.add('qontic-stage', 'qontic-panel');
  workspace.append(panel, stage);

  const physics = document.createElement('section');
  physics.className = 'qontic-reading-panel qontic-panel';
  physics.hidden = true;
  physics.innerHTML = `<h2>Physics</h2>
    <p>In the reflecting box, the wave can be evolved separately along the two axes.
    Adding the barrier requires a two-dimensional wave calculation so the packet can diffract around its tip.</p>
    <p>The gold trajectory follows the probability current divided by the wave density.
    The cyan reference follows straight flights and ideal reflections from the walls and barrier.</p>
    <p>Within each scene, increasing Classicality shortens the wavelength while keeping the nominal launch speed fixed.
    The scenes use different slider calibrations.</p>`;
  shell.append(header, views, workspace, physics);

  // Retain the existing input elements and their simulation event handlers.
  const sharedControls = document.createElement('qontic-controls');
  const attributes = {
    'show-interpretation': 'false', 'show-reset': 'true', 'show-autorun': 'false',
    'speed-min': '1', 'speed-max': '4', 'speed-step': '1', speed: '1',
    running: String(params.get('paused') !== '1'), 'active-tab': 'core',
  };
  for (const [key, value] of Object.entries(attributes)) sharedControls.setAttribute(key, value);
  const count = document.getElementById('count');
  const countLabel = count.previousElementSibling;
  const display = document.getElementById('appearance');
  const advanced = document.getElementById('export-options');
  display.open = true;
  advanced.open = true;
  const controlsBody = document.createElement('div');
  controlsBody.className = 'qontic-control-body';
  const core = document.createElement('div');
  const legacyRunButtons = body.querySelector('.buttons');
  core.append(...[...body.children].filter(node =>
    node !== display && node !== advanced && node !== legacyRunButtons && !node.matches('.keyboard-hint')
  ), countLabel, count);
  const panes = { core, advanced, display };
  for (const [name, pane] of Object.entries(panes)) {
    pane.hidden = name !== 'core';
    controlsBody.append(pane);
  }
  body.prepend(sharedControls, controlsBody);
  legacyRunButtons.hidden = true;
  document.getElementById('playback').hidden = true;
  document.querySelector('label[for="playback"]').parentElement.hidden = true;
  body.querySelector('.playback-steps').hidden = true;
  toolbar.querySelector('.brand-home').hidden = true;
  toolbar.querySelector('.panel-title').hidden = true;
  toolbar.prepend(Object.assign(document.createElement('h2'), { textContent: 'Controls' }));

  function selectPane(name) {
    sharedControls.setAttribute('active-tab', name);
    for (const [key, pane] of Object.entries(panes)) pane.hidden = key !== name;
  }
  sharedControls.addEventListener('qontic:tab', event => selectPane(event.detail.tab));
  sharedControls.addEventListener('qontic:speed', event => {
    const speed = document.getElementById('playback');
    speed.value = event.detail.speed;
    speed.dispatchEvent(new Event('input'));
  });

  function showView(name) {
    workspace.hidden = name !== 'simulation';
    physics.hidden = name !== 'physics';
    for (const button of views.querySelectorAll('button')) {
      const active = button.dataset.view === name;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    }
  }
  views.addEventListener('click', event => {
    const button = event.target.closest('button[data-view]');
    if (button) showView(button.dataset.view);
  });

  mountQonticShell({
    title: 'Classical Limit', navigation: 'breadcrumbs',
    purpose: 'Compare wave-guided and classical trajectories, with or without a diffraction barrier.',
    homeHref: '../../../index.html?tab=apps', version: 'Classical Limit · Draft',
  });
  // Keep an explicit Apps fallback on the standalone build, too.
  const back = document.getElementById('catalog-back');
  back.textContent = '← Back';
  const breadcrumbs = header.querySelector('.qontic-breadcrumbs ol');
  if (breadcrumbs) {
    const item = document.createElement('li');
    const existingBack = document.getElementById('qontic-context-back');
    if (existingBack) back.href = existingBack.href;
    existingBack?.remove();
    back.id = 'qontic-context-back';
    item.append(back);
    breadcrumbs.prepend(item);
  } else {
    header.prepend(back);
  }

  const media = mountQonticMedia({
    stage,
    getCanvases: () => [document.getElementById('canvas'), document.getElementById('phase-legend-canvas')],
    filename: 'classical-limit',
    onRecord: () => {
      showView('simulation');
      if (stage.closest('dialog')) media.setExpanded(false);
      if (document.body.classList.contains('collapsed')) document.getElementById('collapse').click();
      selectPane('advanced');
      advanced.querySelector('summary').focus();
    },
  });
  return sharedControls;
}
