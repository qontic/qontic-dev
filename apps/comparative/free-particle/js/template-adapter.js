import { mountQonticShell } from '../../../../shared/qontic-shell.js';
import '../../../../shared/qontic-controls.js?v=2.8';

// The shared component owns presentation; the original engine owns all state.
// Keep legacy controls as hidden event endpoints so keyboard and export behavior
// retain the same code paths. No shadow-DOM implementation details are used here.
function mountFreeParticleTemplate() {
  const $ = id => document.getElementById(id);
  const app = document.querySelector('.app-outer');
  if (!app || document.body.classList.contains('fp-template')) return;
  const left = app.querySelector('.left-panel');
  const cards = [...left.querySelectorAll(':scope > .panel-card')];
  const shell = document.createElement('main');
  shell.className = 'shell fp-shell';
  shell.innerHTML = '<header><div><p class="eyebrow">Q-Ontic interactive laboratory</p><h1>Free Particle</h1></div></header>';
  const nav = document.querySelector('.view-tab-bar');
  nav.classList.add('tabs');
  nav.setAttribute('aria-label', 'Application sections');
  nav.querySelector('[data-viewtab="sim"]').textContent = 'Simulation';
  nav.querySelector('[data-viewtab="physics"]').textContent = 'Math';
  nav.querySelector('[data-viewtab="compare"]').textContent = 'Compare';
  app.before(shell);
  shell.append(nav, app);
  const modelNote = document.querySelector('.top-bar').nextElementSibling;
  if (modelNote !== shell && modelNote.textContent.includes('Pedagogical')) {
    modelNote.removeAttribute('style');
    modelNote.className = 'fp-model-note';
    $('viewpanel-rationale').prepend(modelNote);
  }

  const controls = document.createElement('qontic-controls');
  controls.id = 'fp-shared-controls';
  for (const [name, value] of Object.entries({
    'show-reset':'true', 'interpretation':'pw', 'theme':document.documentElement.dataset.theme || 'light',
    'speed-min':'0.1', 'speed-max':'16', 'speed-step':'0.01', 'speed':String(fp.speed),
  })) controls.setAttribute(name, value);
  const controlPanel = document.createElement('section');
  controlPanel.className = 'fp-control-panel';
  controlPanel.setAttribute('aria-label', 'Free Particle controls');
  const panes = {};
  for (const name of ['core','advanced','display']) {
    const pane = document.createElement('div');
    pane.id = 'fp-controls-' + name;
    pane.className = 'fp-control-pane';
    pane.hidden = name !== 'core';
    panes[name] = pane;
  }
  controlPanel.append(controls, ...Object.values(panes));
  left.prepend(controlPanel);
  // Move existing inputs rather than cloning them or registering a second engine.
  panes.core.append($('fp-energy-slider').closest('.slider-row'), $('fp-bin-control'));
  panes.advanced.append($('fp-sigma-row'), $('fp-sigma-y-row'));
  panes.display.append($('fp-display-row'));
  $('fp-display-row').querySelectorAll('label').forEach(label => label.classList.add('qontic-app-toggle'));
  $('fp-display-row').classList.add('qontic-app-toggle-group');
  cards.forEach(card => card.classList.add('fp-legacy-control'));
  for (const id of ['fp-playback-controls', 'fp-speed-control']) $(id).classList.add('fp-legacy-control');
  for (const [id,label] of [['fp-energy-slider','Energy'],['fp-sigma-slider','Packet width'],['fp-sigmay-slider','Vertical spread']]) $(id).setAttribute('aria-label',label);
  const modeMap = {cpn:'collapse', pw:'pilotwave', mw:'manyworlds'};
  const reverseModes = {collapse:'cpn', pilotwave:'pw', manyworlds:'mw'};
  const set = (key,value) => { if (controls.getAttribute(key) !== String(value)) controls.setAttribute(key,String(value)); };
  function sync() {
    set('running', fp.running);
    set('interpretation', reverseModes[fp.interpMode]);
    set('auto-run', fp.autoNextCycle);
    set('speed', fp.speed);
    // Recorder disables legacy reset for the duration of the export.
    set('disabled', $('fp-btn-reset').disabled);
    const theme = document.documentElement.dataset.theme || 'light';
    set('theme', theme);
    set('accent', theme === 'light' ? '#087487' : '#55d8e6');
  }
  controls.addEventListener('qontic:start', () => { $('fp-btn-start').click(); sync(); });
  controls.addEventListener('qontic:stop', () => { $('fp-btn-stop').click(); sync(); });
  controls.addEventListener('qontic:reset', () => { $('fp-btn-reset').click(); sync(); });
  controls.addEventListener('qontic:autorun', event => {
    $('fp-auto-next').checked = event.detail.autoRun;
    $('fp-auto-next').dispatchEvent(new Event('change', {bubbles:true})); sync();
  });
  controls.addEventListener('qontic:speed', event => {
    $('fp-speed').value = event.detail.speed;
    $('fp-speed').dispatchEvent(new Event('input', {bubbles:true})); sync();
  });
  controls.addEventListener('qontic:interpretation', event => {
    const radio = document.querySelector(`input[name="fp-interp"][value="${modeMap[event.detail.interpretation]}"]`);
    radio.checked = true;
    radio.dispatchEvent(new Event('change', {bubbles:true})); sync();
  });
  controls.addEventListener('qontic:tab', event => {
    Object.entries(panes).forEach(([name,pane]) => { pane.hidden = name !== event.detail.tab; });
  });
  controls.addEventListener('qontic:theme', event => {
    const current = document.documentElement.dataset.theme || 'light';
    if (current !== event.detail.theme) $('fp-theme-btn').click();
    sync();
  });
  controls.addEventListener('keydown', event => event.stopPropagation());
  const observer = new MutationObserver(sync);
  for (const id of ['fp-btn-start','fp-btn-stop','fp-btn-reset']) observer.observe($(id),{attributes:true,attributeFilter:['disabled']});
  observer.observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
  left.addEventListener('change',sync);
  document.addEventListener('keyup',sync);

  function syncPage() {
    const active = nav.querySelector('.view-tab-active')?.dataset.viewtab || 'sim';
    left.hidden = active !== 'sim';
    nav.querySelectorAll('button').forEach(button => {
      const selected = button.dataset.viewtab === active;
      button.classList.toggle('active',selected);
      button.setAttribute('aria-pressed',String(selected));
    });
  }
  nav.addEventListener('click',syncPage);
  // Use the same shared controls in expanded view; never duplicate state.
  const controlHome = document.createComment('Shared controls home');
  let expanded = false;
  new MutationObserver(() => {
    const next = $('viewpanel-sim').classList.contains('sim-expanded');
    if (next === expanded) return;
    expanded = next;
    if (expanded) {
      controls.replaceWith(controlHome);
      $('fp-expanded-playback').append(controls);
    } else controlHome.replaceWith(controls);
    set('show-interpretation', !expanded);
    set('show-tabs', !expanded);
  }).observe($('viewpanel-sim'),{attributes:true,attributeFilter:['class']});

  // Preserve every readout in a compact, collapsible Results panel.
  const results = document.querySelector('.info-compact');
  const resultBody = document.createElement('div');
  resultBody.className = 'fp-results-body';
  while(results.firstChild) resultBody.append(results.firstChild);
  const toggle = document.createElement('button');
  toggle.type = 'button'; toggle.className = 'qontic-app-toggle fp-results-title';
  toggle.textContent = 'Results'; toggle.setAttribute('aria-expanded','false');
  resultBody.hidden = true;
  toggle.addEventListener('click',() => { resultBody.hidden = !resultBody.hidden; toggle.setAttribute('aria-expanded',String(!resultBody.hidden)); });
  let drag = null;
  toggle.addEventListener('pointerdown', event => {
    drag = {x:event.clientX,y:event.clientY,left:results.offsetLeft,top:results.offsetTop,moved:false};
    toggle.setPointerCapture(event.pointerId);
  });
  toggle.addEventListener('pointermove', event => {
    if (!drag) return;
    const dx = event.clientX-drag.x, dy = event.clientY-drag.y;
    if (Math.abs(dx)+Math.abs(dy)<5 && !drag.moved) return;
    drag.moved = true;
    const parent = results.offsetParent;
    results.style.left = Math.max(0,Math.min(parent.clientWidth-results.offsetWidth,drag.left+dx))+'px';
    results.style.top = Math.max(0,Math.min(parent.clientHeight-results.offsetHeight,drag.top+dy))+'px';
    results.style.right = 'auto'; results.style.bottom = 'auto';
  });
  toggle.addEventListener('click', event => {
    if (drag?.moved) { event.stopImmediatePropagation(); resultBody.hidden = !resultBody.hidden; toggle.setAttribute('aria-expanded',String(!resultBody.hidden)); }
    drag = null;
  });
  toggle.addEventListener('pointercancel',()=>{drag=null;});
  results.append(toggle,resultBody);
  results.classList.add('fp-results');
  $('viewpanel-sim').append(results);

  mountQonticShell({title:'Free Particle', purpose:'Explore wave-packet spreading and detector outcomes in three quantum interpretations.',
    version:'Free Particle · Q-Ontic shared template 2.8', homeHref:'../../../index.html'});
  document.body.classList.add('fp-template');
  sync(); syncPage();
  // Existing resize handler refreshes all canvases after the layout changes.
  window.dispatchEvent(new Event('resize'));
}
if (document.readyState === 'complete') mountFreeParticleTemplate();
else window.addEventListener('load', mountFreeParticleTemplate, {once:true});
