import { mountExpandedResize } from '../../../../shared/qontic-expanded-resize.js?v=1';
import { mountQonticShortcuts } from '../../../../shared/qontic-shortcuts.js?v=1';
import { mountPacketEngine } from './packet-engine.js?cache=te430';
import { mountMWBranching } from './mw-branching.js?cache=te430';
import { APP_RELEASE } from './release.js?cache=te430';
import { mountNSlitQuiz } from './quiz.js?cache=te430';
import { mountCoordinateTools, mountDistanceScale, mountValueRange } from '../../../../shared/qontic-overlays.js?v=5';
import { mountQonticMedia } from '../../../../shared/qontic-media.js?cache=te430';
import { enableResizableSidebar } from '../../../../shared/qontic-resize.js?v=1';
import { mountQonticShell } from '../../../../shared/qontic-shell.js?v=3.7';
import '../../../../shared/qontic-controls.js?v=3.6';

// Adapt the existing controls in place so their listeners and physics stay intact.
$(function () {
  const shell = document.createElement('main');
  shell.className = 'shell analytical-shell';
  shell.innerHTML = `<header><div><p class="eyebrow">Q-Ontic interactive laboratory</p><h1>N-Slits</h1></div></header>
    <nav class="tabs" aria-label="Application sections">
      <button type="button" data-page="0" data-view="simulation" class="active">Simulation</button>
      <button type="button" data-page="1" data-view="quiz">Quiz</button>
      <button type="button" data-page="2">Physics</button>
      <button type="button" data-page="3">Views</button>
    </nav>`;
  const root = document.getElementById('superContainer');
  root.before(shell);
  shell.append(root);
  $('#psiTabs').tabs('destroy');
  const math = document.getElementById('math-container');
  root.append(math);
  document.querySelector('#superContainer > ul a[href="#rationale"]')?.closest('li').remove();
  document.getElementById('rationale')?.remove();
  // Quiz panel (shared module), between Simulation and Physics.
  const quizPanel=document.createElement('section');quizPanel.id='quiz-panel';quizPanel.setAttribute('aria-label','Quiz');root.append(quizPanel);
  $('#superContainer > ul').append('<li><a href="#quiz-panel">Quiz</a></li>');
  $('#superContainer > ul').append('<li><a href="#math-container">Physics</a></li>');
  const views=document.createElement('div');views.id='rationale';root.append(views);
  $('#superContainer > ul').append('<li><a href="#rationale">Views</a></li>');
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
  const showPage = index => {
    $('#superContainer').tabs('option', 'active', index);
    syncPage();
    shell.scrollIntoView({block: 'start'});
  };
  pageButtons.forEach(button => button.addEventListener('click', () => {
    showPage(Number(button.dataset.page));
  }));
  $('#superContainer').on('tabsactivate', syncPage);
  $('#superContainer').on('tabsactivate', () => { document.body.dataset.view = $('#superContainer').tabs('option', 'active') === 1 ? 'quiz' : ''; });
  // Handle these links directly: the outer jQuery tabs widget can consume
  // their hash-link click before the legacy document-level handler sees it.
  root.querySelectorAll('.view-link').forEach(link => link.addEventListener('click', event => {
    event.preventDefault();
    event.stopPropagation();
    changeInterpretation(link.dataset.view);
    showPage(0);
  }));

  const controls = document.createElement('qontic-controls');
  controls.id = 'sharedControls';
  controls.setAttribute('show-reset', 'true');
  controls.setAttribute('show-autorun', 'false');
  // Engine tab (between Core and Advanced): the analytical/numerical choice and the numerical options.
  controls.setAttribute('show-engine', 'true');
  // Views as three buttons (students did not see that the single pill switches views).
  controls.setAttribute('interpretation-style', 'segmented');
  document.getElementById('psiTabs').prepend(controls);
  const themeStyle = document.createElement('style');
  themeStyle.textContent = `:host-context(.qontic-light) .qontic-speed { color: #526a77; }
    :host-context(.qontic-light) .qontic-speed output { color: #075c69; }
    :host-context(.qontic-light) .qontic-speed input { accent-color: #087487; }`;
  controls.shadowRoot.append(themeStyle);
  const core = document.getElementById('basics-container');
  core.prepend(document.getElementById('experiment-bar'));
  document.getElementById('experiment-bar').after(document.getElementById('slit-count-bar'));
  const waveChoice = document.getElementById('basicsWaveFunctionOption').closest('.input-group');
  const waveChoiceBox = waveChoice.closest('.wave-range-box');
  waveChoice.classList.add('analytical-wave-choice');
  waveChoiceBox.replaceWith(waveChoice);

  const advanced = document.createElement('div');
  advanced.id = 'analytical-advanced';
  core.after(advanced);
  const enginePanel = document.createElement('div');
  enginePanel.id = 'engine-panel';
  enginePanel.className = 'packet-settings engine-panel';
  advanced.before(enginePanel);
  for (const id of ['particle-parameter-container', 'detector-parameter-container']) {
    advanced.append(document.getElementById(id));
  }
  const basicsParams = document.getElementById('basics-params');
  basicsParams.append(document.getElementById('detector-distance-group'));
  basicsParams.append(document.getElementById('screen-height-group'));
  // Keep the engine's unit conversion controls, but present units as quiet text.
  const quietUnits = panel => panel.querySelectorAll('select[id$="-units"]').forEach(select => {
    select.hidden = true;
    const unit = document.createElement('span');
    unit.className = 'analytical-unit';
    const syncUnit = () => {
      unit.textContent = select.selectedOptions[0]?.textContent.trim() || '';
      unit.hidden = !unit.textContent;
    };
    select.after(unit);
    select.addEventListener('change', syncUnit);
    syncUnit();
  });
  quietUnits(advanced);
  quietUnits(basicsParams);
  // Keep one visible copy of each control, preserving the original input IDs.
  // The wave quantity selector belongs with the main experiment controls.
  // Reuse the original inputs and color actions in a single readable layer list.
  const displayPanel = document.getElementById('graphics-parameter-container');
  const layerTable = displayPanel.querySelector('table');
  const layers = document.createElement('div');
  layers.className = 'analytical-layers';
  layerTable.before(layers);
  // 2.128: the swatch is first drawn while its row is still detached from the page,
  // where getElementById finds nothing; keep a direct reference to the canvas.
  const waveSwatch = document.getElementById('openPaletteBtn');
  const updateWavePalettePreview = () => {
    const canvas = waveSwatch || document.getElementById('openPaletteBtn');
    if (!(canvas instanceof HTMLCanvasElement)) return;
    const colors = Array.isArray(window.graphPalette) && window.graphPalette.length
      ? window.graphPalette
      : window.paletteModule.prepareRgbPalette(window.paletteModule.palettes.Gray);
    const context = canvas.getContext('2d');
    const gradient = context.createLinearGradient(0, 0, canvas.width, 0);
    colors.forEach((color, index) => {
      const [red, green, blue] = color;
      gradient.addColorStop(colors.length === 1 ? 0 : index / (colors.length - 1), `rgb(${red},${green},${blue})`);
    });
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = gradient;
    context.fillRect(0, 0, canvas.width, canvas.height);
    const paletteName = window.paletteModule.getCurrentPaletteName();
    const button = canvas.closest('.analytical-palette-button');
    if (button) {
      const description = paletteName ? `Choose wave palette. Current palette: ${paletteName}` : 'Choose wave palette';
      button.title = description;
      button.setAttribute('aria-label', description);
    }
  };
  window.qonticUpdateWavePalettePreview = updateWavePalettePreview;
  for (const [id, name, colorId] of [
    ['plot_wave', 'Wave', 'openPaletteBtn'],
    ['plot_palette', 'Color scale', null],
    ['hit_prob', 'Probability curve', 'prob-color'],
    ['plot_hits', 'Screen hits', 'hit-color'],
    ['plot_sensor', 'Sensor band', 'sensor-color'],
    ['plot_trajectories', 'Trajectories', 'traj-color'],
    ['plot_particles', 'Particles', 'part-color'],
    ['plot_screen', 'Slit wall', 'screen-color'],
    ['plot_detector', 'Screen', 'detector-color'],
    ['plot_scales', 'Distance scales', 'scale-color'],
  ]) {
    const input = document.getElementById(id);
    const oldLabel = input.closest('label');
    const row = document.createElement('div');
    row.className = 'analytical-layer' + (input.closest('.bohmian-only') ? ' bohmian-only' : '');
    if (input.closest('.bohmian-only')) row.style.display = input.closest('.bohmian-only').style.display;
    const label = document.createElement('label');
    label.htmlFor = id + '-opacity';
    label.title = oldLabel.dataset.tip || name;
    // Keep engine visibility endpoints, but make opacity the visible control.
    input.hidden = true;
    if (!Number.isFinite(displayOpacities[id])) {
      displayOpacities[id] = (input.checked || id === 'plot_particles' || id === 'plot_trajectories') ? 1 : 0;
    }
    if (id !== 'plot_particles' && id !== 'plot_trajectories') input.checked = true;
    label.textContent = name;
    const slider = document.createElement('input');
    slider.type = 'range'; slider.id = id + '-opacity';
    slider.min = '0'; slider.max = '100'; slider.step = '5';
    slider.value = Math.round(elementOpacity(id) * 100);
    slider.className = 'analytical-opacity-slider';
    slider.setAttribute('aria-label', name + ' opacity');
    const updateValue = () => {
      const value = Number(slider.value);
      slider.title = name + ': ' + value + '% opacity (0 hides)';
      slider.setAttribute('aria-valuetext', value === 0 ? 'Hidden' : value + '% opacity');
      row.classList.toggle('is-transparent', value === 0);
      if (id === 'plot_palette') {
        for (const element of document.querySelectorAll('#paletteRangeSlider, #waveRangeLabel')) {
          element.style.opacity = value / 100;
          element.style.pointerEvents = value === 0 ? 'none' : '';
        }
      }
    };
    slider.addEventListener('input', () => {
      displayOpacities[id] = Number(slider.value) / 100;
      updateValue();
      renderSetupFlag = 1;
      invalidateWaveCache();
      lastCycleIndex = -1;
      if (!isAnimating) drawSystem(currentCycleIndex);
    });
    slider.addEventListener('change', saveSimulationState);
    updateValue();
    row.append(input, label, slider);
    if (colorId) {
      const color = document.getElementById(colorId);
      color.title = colorId === 'openPaletteBtn' ? 'Choose wave palette' : 'Choose ' + name.toLowerCase() + ' color';
      color.setAttribute('aria-label', color.title);
      if (color.tagName === 'CANVAS') {
        const paletteButton = document.createElement('button');
        paletteButton.type = 'button';
        paletteButton.className = 'analytical-palette-button';
        paletteButton.setAttribute('aria-label', color.title);
        paletteButton.title = color.title;
        paletteButton.append(color);
        paletteButton.addEventListener('click', event => { if (event.target !== color) color.click(); });
        row.append(paletteButton);
        updateWavePalettePreview();
      } else {
        color.type = 'button';
        row.append(color);
      }
    }
    layers.append(row);
  }
  layerTable.remove();
  // Plain tooltips for controls a beginner meets first.
  { const nf = document.getElementById('niceFringesButton'); if (nf) { nf.dataset.tipFull = nf.title; }
    const wl = document.querySelector('label[for="wavelength"]') || document.getElementById('wavelength')?.closest('.input-group')?.querySelector('label'); if (wl && !wl.title) wl.title = 'Wavelength λ of the electrons (their de Broglie wavelength). Longer wavelength: wider fringes.';
    const wli = document.getElementById('wavelength'); if (wli && !wli.title) wli.title = 'Wavelength λ of the electrons';
    window.qonticBasicTips = level => { if (nf) nf.title = level === 'basic' ? 'Picks a slit width, separation and screen distance that give clear fringes, and starts a new run.' : nf.dataset.tipFull; };
  }
  // Particle and trajectory colours apply only with the Uniform particle colour (not at Basic, where particles are coloured by slit).
  for (const id of ['traj-color', 'part-color']) { const el = document.getElementById(id); if (el) { el.dataset.levelMin = 'standard'; el.title = 'Particle colour (used when the Pilot-Wave Color setting is Uniform)'; } }
  { const tips = { 'Wave': 'Opacity of the wave picture; the swatch opens the wave palettes.', 'Color scale': 'Opacity of the colour scale shown with the non-Classic palettes.', 'Probability curve': 'Opacity and colour of the predicted distribution on the screen panel.', 'Screen hits': 'Opacity and colour of the counted hits on the screen panel.', 'Sensor band': 'Shading of the detector strip at the screen by hit count.', 'Trajectories': 'Opacity of the Pilot-Wave particle paths.', 'Particles': 'Opacity of the Pilot-Wave particles.', 'Slit wall': 'Opacity and colour of the wall with the slits.', 'Screen': 'Opacity and colour of the screen line.', 'Distance scales': 'Opacity and colour of the scale bars.' };
    for (const row of layers.children) { const name = Object.keys(tips).find(k => row.textContent.trim().startsWith(k)); if (name && !row.title) row.title = tips[name]; } }
  // Canvas background: slate grey (default) or black. Stored per browser.
  {
    const row = document.createElement('div');
    row.className = 'input-group packet-inline engine-slits-row te-bg-row';
    row.innerHTML = '<label title="Colour behind the wave.">Background</label><span class="engine-slit-buttons"><button type="button" class="qontic-app-toggle" data-te-bg="grey">Grey</button><button type="button" class="qontic-app-toggle" data-te-bg="black">Black</button></span>';
    layers.after(row);
    const sync = () => { let bg = 'grey'; try { bg = localStorage.getItem('qontic-te-bg') === 'black' ? 'black' : 'grey'; } catch (_) {} row.querySelectorAll('[data-te-bg]').forEach(b => { const on = b.dataset.teBg === bg; b.classList.toggle('active', on); b.setAttribute('aria-pressed', String(on)); }); };
    row.querySelectorAll('[data-te-bg]').forEach(b => b.addEventListener('click', () => {
      try { localStorage.setItem('qontic-te-bg', b.dataset.teBg); } catch (_) {}
      sync(); invalidateWaveCache(); renderSetupFlag = 1; lastCycleIndex = -1;
      if (!isAnimating) window.qonticPacketEngine?.redraw?.();
    }));
    sync();
  }
  document.getElementById('waveCanvas').style.display = '';
  sensorWidth = 30;
  // Browser zoom supplies consistent sizing across controls and canvas.
  displayPanel.querySelector('#fontTarget').parentElement.parentElement.hidden = true;
  document.getElementById('opacity-box').hidden = true;
  invalidateWaveCache();
  renderSetupFlag = 1;
  lastCycleIndex = -1;
  if (!isAnimating) drawSystem(currentCycleIndex);

  const panels = {core, engine: enginePanel, advanced, display: document.getElementById('graphics-parameter-container')};
  const showControls = name => {
    Object.entries(panels).forEach(([key, panel]) => { panel.hidden = key !== name; });
    document.body.classList.toggle('show-advanced', name === 'advanced');
  };
  controls.addEventListener('qontic:tab', event => { showControls(event.detail.tab); if (event.detail.tab === 'engine') { try { localStorage.setItem('qontic-te-engine-tab-seen', '1'); } catch (_) {} window.dispatchEvent(new Event('qontic-engine-tab')); } });
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
    setAttribute('accent', document.documentElement.getAttribute('data-theme') === 'light' ? '#087487' : '#55d8e6');
    setAttribute('show-interpretation', !viewLocked && !controls.closest('.qontic-expanded-dialog'));
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
  $('#resetButton').on('click.template', () => {
    $('#nhits, #shownParticles, #systemTime').text('0');
    sync();
  });
  controls.addEventListener('qontic:reset', () => { $('#resetButton').trigger('click'); });
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
    title: 'N-Slits', navigation: 'breadcrumbs',
    version: `N-Slits · Version ${APP_RELEASE.version} · ${APP_RELEASE.date}`,
    homeHref: '../../../index.html',
  });
  document.body.classList.add('analytical-template');
  const layout = document.querySelector('.main-container');
  const sidebar = document.getElementById('leftPanel');
  const controlPanel = document.getElementById('psiTabs');
  const stage = document.getElementById('canvas-wrapper');
  layout.classList.add('qontic-workspace');
  sidebar.classList.add('qontic-sidebar');
  controlPanel.classList.add('qontic-panel', 'qontic-control-panel');
  stage.classList.add('qontic-stage');
  document.getElementById('experiment-bar').classList.add('qontic-app-toggle-group');
  for (const id of ['toggleSlits', 'toggleWhichPath', 'resetDefaultsButton', 'resampleHitsButton', 'resetBranches']) {
    document.getElementById(id)?.classList.add('qontic-app-toggle');
  }
  syncPage();
  enableResizableSidebar({
    panel: document.getElementById('leftPanel'),
    container: document.querySelector('.main-container'),
    storageKey: 'qontic-double-slit-sidebar-width',
    minWidth: 320,
  });

  // Use the same preferred sidebar width when bounding the whole desktop
  // arrangement, so spare space stays outside the controls-and-canvas group.
  const syncLayoutWidth = () => layout.style.setProperty('--qontic-sidebar-width',
    sidebar.style.getPropertyValue('--qontic-sidebar-width') || '340px');
  new MutationObserver(syncLayoutWidth).observe(sidebar, {attributes: true, attributeFilter: ['style']});
  syncLayoutWidth();

  // On phones, keep playback and the experiment first; statistics follow
  // the canvas instead of pushing it beneath a tall sidebar.
  const phone = matchMedia('(max-width: 600px)');
  const info = document.getElementById('Info');
  const placeStatistics = () => {
    if (phone.matches) document.getElementById('canvas-wrapper').after(info);
    else sidebar.append(info);
  };
  phone.addEventListener('change', placeStatistics);
  placeStatistics();

  // Match actual canvas pixels to the displayed size. Geometry and time step
  // in world units, all detections, and in-flight trajectories are preserved.
  const container = document.getElementById('canvas-container');
  window.qonticMWBranches = mountMWBranching({host:container,controls:core,isMW:()=>interpretation==='manyworlds',isRunning:()=>isAnimating});
  core.append(document.getElementById('resetDefaultsButton'));
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
  document.getElementById('screenshotButton').parentElement.hidden = true;
  let previewScreenHeight=null;
  const scale = mountDistanceScale({
    host:container,storageKey:'qontic-double-slit-scale-position',
    getUnitsPerPixel:()=>{const z=window.qonticPacketEngine?.zoom?.z||1;return {x:worldCanvasDx/Math.max(1,container.clientWidth)/z,y:(previewScreenHeight??screenHeight)/Math.max(1,container.clientHeight)/z};},
    format:value=>value>=1e6?(value/1e6).toPrecision(3)+' mm':value>=1e3?(value/1e3).toPrecision(3)+' µm':Number(value.toPrecision(3))+' nm'
  });
  const formatDistance=value=>Math.abs(value)>=1e6?Number((value/1e6).toPrecision(4))+' mm':Math.abs(value)>=1e3?Number((value/1e3).toPrecision(4))+' µm':Number(value.toPrecision(4))+' nm';
  const coordinates=mountCoordinateTools({
    host:container,storageKey:'qontic-double-slit-grid-visible',formatValue:formatDistance,
    getBounds:()=>{
      // Visible region: with the canvas zoomed (z) and panned (tx, ty), the grid and readouts follow.
      const H=previewScreenHeight??screenHeight,b={xMin:-wallXWorld,xMax:worldCanvasDx-wallXWorld,yMin:-H/2,yMax:H/2},zm=window.qonticPacketEngine?.zoom;
      if(!zm||zm.z===1)return b;
      const W=Math.max(1,container.clientWidth),Hp=Math.max(1,container.clientHeight),ux=(b.xMax-b.xMin)/W,uy=(b.yMax-b.yMin)/Hp;
      const x0=b.xMin+(-zm.tx/zm.z)*ux,y0=b.yMin+(-zm.ty/zm.z)*uy;
      return {xMin:x0,xMax:x0+W/zm.z*ux,yMin:y0,yMax:y0+Hp/zm.z*uy};}
  });
  let lastScaleOpacity=elementOpacity('plot_scales')||1;
  window.qonticScaleOverlay={zoomed:()=>{scale.update();coordinates.update();},previewHeight:height=>{previewScreenHeight=height;scale.update();coordinates.update();},update:()=>{scale.setOpacity(elementOpacity('plot_scales'));coordinates.update();media?.syncScale();}};
  const rangeHost=document.getElementById('paletteRangeSlider');
  const rangePanel=document.createElement('div');rangePanel.className='qontic-range-panel';
  rangePanel.style.left='0px';rangePanel.style.bottom='0px';container.append(rangePanel);
  for(const id of ['paletteScaleCanvas','paletteScaleCanvas1','paletteScaleCanvas2']){
    const palette=document.getElementById(id);rangePanel.append(palette);
    palette.style.left='78px';
    palette.style.bottom=id==='paletteScaleCanvas1'?'100px':'0px';
  }
  rangePanel.append(rangeHost);rangeHost.style.left='0px';rangeHost.style.bottom='8px';

  document.getElementById('waveRangeLabel').hidden=true;
  window.qonticWaveRangeControl=mountValueRange({
    host:rangeHost,label:'wave display range',movableContainer:rangePanel,storageKey:'qontic-double-slit-range-position-v2.86-left',
    format:value=>formatWaveRangeValue(window.qonticPacketEngine?.enabled && $('#waveFunctionOption').val()==='Phase'?2*value-1:useWebGLWave && $('#waveFunctionOption').val()==='Phase'?value*2*Math.PI:(useWebGLWave || window.qonticPacketEngine?.enabled) && $('#waveFunctionOption').val()==='LogPsi2'?(value*15-15)/Math.log(10):value),
    onChange:({lower,upper})=>{
      waveRangeUserMin=lower;waveRangeUserMax=upper;waveRangeLockedByUser=true;
      lastCycleIndex=-1;
      if(!isAnimating)renderWaveFunction(currentCycleIndex);
    }
  });
  updateWaveRangeSliderUI();
  // Embedded (notebook): no level switch; a link opens the same set-up in the full app.
  if (document.documentElement.classList.contains('te-embed')) {
    const hideLevel = () => { const r = controls.shadowRoot; if (!r) return setTimeout(hideLevel, 50); if (!r.getElementById('te-embed-style')) { const st = document.createElement('style'); st.id = 'te-embed-style'; st.textContent = '.qontic-level, .qontic-level-row { display: none !important; }'; r.append(st); const lv = r.querySelector('.qontic-level'); const row = lv?.parentElement; if (row && row.children.length <= 2) row.style.display = 'none'; } };
    hideLevel();
    const stage = document.getElementById('canvas-wrapper');
    if (stage) { const a = document.createElement('a'); a.className = 'te-embed-open'; a.target = '_blank'; a.rel = 'noopener'; a.textContent = 'Open in N-Slits ↗'; a.href = '#';
      a.addEventListener('click', () => { const u = new URL(location.href.split('#')[0]); u.searchParams.delete('embed'); u.searchParams.delete('level'); a.href = u.toString() + buildUrlHash(); });
      if (getComputedStyle(stage).position === 'static') stage.style.position = 'relative'; stage.append(a); }
    // Narrow screens: the settings panel and readouts are folded under a Controls button, so the
    // picture is not pushed below a long panel. The page reports its height to the notebook,
    // which sizes the frame to fit (no inner scrolling).
    if (stage) {
      const tg = document.createElement('button'); tg.type = 'button'; tg.className = 'te-embed-controls'; tg.textContent = 'Controls ▾'; tg.setAttribute('aria-expanded', 'false');
      tg.addEventListener('click', () => { const on = document.documentElement.classList.toggle('te-embed-showcontrols'); tg.textContent = on ? 'Hide controls ▴' : 'Controls ▾'; tg.setAttribute('aria-expanded', String(on)); });
      stage.append(tg);
    }
    { const shell = document.querySelector('main.shell'); let last = 0;
      const post = () => { const h = Math.ceil((shell?.getBoundingClientRect().height || document.body.scrollHeight) + 16); if (Math.abs(h - last) > 2) { last = h; try { window.parent.postMessage({ type: 'ns-height', h }, '*'); } catch (_) {} } };
      try { new ResizeObserver(post).observe(shell || document.body); } catch (_) {} window.addEventListener('load', post); setTimeout(post, 1500); }
    // The notebook's set-up buttons: apply a set-up without reloading the page. The notebook
    // sends only set-ups that differ in view, slits, λ, geometry, electrons per wave and speed.
    window.addEventListener('message', event => {
      if (event.source !== window.parent || event.data?.type !== 'ns-setup') return;
      const hash = String(event.data.hash || ''), h = new URLSearchParams(hash);
      if (isAnimating) $('#startButton').trigger('click');
      history.replaceState(null, '', location.pathname + location.search + '#' + hash);
      const lvl = document.body.dataset.qonticLevel;
      applyUrlHash();
      if (typeof window.changeInterpretation === 'function') window.changeInterpretation(interpretation);
      try { updateSlitCountControls?.(); } catch (_) {}
      const n = Math.round(+h.get('packetCount'));
      if (n >= 1) {
        const r = document.getElementById('te-basic-hits');
        if (lvl === 'basic' && r) { r.value = String(Math.min(100, n)); r.dispatchEvent(new Event('change', { bubbles: true })); }
        else document.getElementById('MaxPart-group')?.setValueInFirstUnit(n);
      }
      const sp = +h.get('speed'); if (sp > 0) document.getElementById('animationStep-group')?.setValueInFirstUnit(sp);
      if (h.has('arrows')) window.qonticArrows?.set(h.get('arrows') === '1', h.has('arrowsY') ? +h.get('arrowsY') : undefined);
      $('#resetButton').trigger('click');
      if (h.get('run') === '1') setTimeout(() => { if (!isAnimating) $('#startButton').trigger('click'); }, 150);
      event.source.postMessage({ type: 'ns-applied' }, '*');
    });
  }
  let media;
  media=mountQonticMedia({
    stage: document.getElementById('canvas-wrapper'), controls,
    filename: 'n-slits', labelNode:document.getElementById('view-label'), rangeControl:window.qonticWaveRangeControl, dynamicCanvases:true,
    coordinateControl:coordinates,
    scaleControl:{getVisible:()=>elementOpacity('plot_scales')>0,setVisible:shown=>{if(!shown)lastScaleOpacity=elementOpacity('plot_scales')||1;const slider=document.getElementById('plot_scales-opacity');slider.value=shown?lastScaleOpacity*100:0;slider.dispatchEvent(new Event('input',{bubbles:true}));slider.dispatchEvent(new Event('change',{bubbles:true}));}},
    getShareUrl: () => { const u = new URL(location.href.split('#')[0]); u.searchParams.delete('level'); u.searchParams.delete('embed'); return u.toString() + buildUrlHash(); },
    getCanvases: () => {
      const canvases=[...container.querySelectorAll('canvas')];
      const visibleBranches=canvases.filter(canvas=>{
        if(!canvas.closest('.mw-branch-overlay'))return false;
        const rect=canvas.getBoundingClientRect(),style=getComputedStyle(canvas);
        return rect.width>0&&rect.height>0&&style.display!=='none'&&style.visibility!=='hidden'&&style.opacity!=='0';
      });
      return (visibleBranches.length?visibleBranches:canvases.filter(canvas=>!canvas.closest('.mw-branch-overlay'))).sort((a,b) => {
      const aBranch=!!a.closest('.mw-branch-overlay'),bBranch=!!b.closest('.mw-branch-overlay');
      if(aBranch!==bBranch)return aBranch?1:-1;
      return (Number(getComputedStyle(a).zIndex) || 0) - (Number(getComputedStyle(b).zIndex) || 0);
      });
    },
    beginRecording: () => {
      const wasRunning = isAnimating;
      if (!wasRunning) $('#startButton').trigger('click');
      sync();
      return wasRunning;
    },
    endRecording: wasRunning => {
      if (!wasRunning && isAnimating) $('#startButton').trigger('click');
      sync();
    },
  });
  container.addEventListener('qontic:surface-view',event=>{
    const active=!!event.detail?.active;
    for(const label of ['Grid','Coordinates and measure','Distance scale']){
      const button=document.querySelector(`.qontic-media-toolbar button[aria-label="${label}"]`);
      if(button){button.disabled=active;button.title=active?'Available in the 2D coordinate view':'';}
    }
  });
  // Many Worlds: the branch count at the top right of the picture (also in the expanded view).
  const worldCount = document.createElement('div');
  worldCount.className = 'expanded-world-count';
  worldCount.title = document.getElementById('infoBranchCount').closest('tr').dataset.tip;
  const syncWorldCount = () => {
    worldCount.hidden = interpretation !== 'manyworlds';
    const exponent = logNBranches.toFixed(0);
    // 4.3: same number as the Branch records readout (exact powers of N while short).
    const html = 'Branches: ' + (logNBranches > 0 ? (document.getElementById('infoBranchCount')?.innerHTML || `10<sup>${exponent}</sup>`) : '1');
    if (worldCount.innerHTML !== html) worldCount.innerHTML = html;
    worldCount.setAttribute('aria-label', logNBranches > 0 ? `Branches: 10 to the power of ${exponent}` : 'Branches: 1');
  };
  container.append(worldCount);
  const worldCountObserver = new MutationObserver(syncWorldCount);
  worldCountObserver.observe(document.getElementById('nhits'), {childList:true,subtree:true,characterData:true});
  worldCountObserver.observe(document.getElementById('view-label'), {childList:true,subtree:true,characterData:true});
  worldCountObserver.observe(controls, {attributes:true,attributeFilter:['interpretation']});
  syncWorldCount();
  mountExpandedResize({container,storageKey:'qontic-double-slit-expanded-size'});
  renderSetupFlag=1;window.qonticScaleOverlay.update();if(!isAnimating)drawSystem(currentCycleIndex);
  window.qonticPacketEngine=mountPacketEngine({core,advanced,engine:enginePanel});
  // Quiz after the engine exists: with ?quiz=1 the first question is prepared at once.
  const quizApi = mountNSlitQuiz({ panel: quizPanel, tab: shell.querySelector('[data-view="quiz"]'), simulationTab: shell.querySelector('[data-view="simulation"]') });
  // Level of detail: Basic (first visit) · Standard · Expert. ?level= sets it; the choice is
  // remembered. Changing level only shows or hides controls (hidden expert options of the
  // numerical engine take their defaults; Basic uses the analytical engine).
  const LEVELS = ['basic', 'standard', 'expert'];
  const levelRow = (id, sel = '.input-group, tr, .analytical-layer, label, .slit-count-row') => { const el = document.getElementById(id); return el ? (el.closest(sel) || el) : null; };
  const tag = (ids, level) => ids.forEach(id => { const row = levelRow(id); if (row) row.dataset.levelMin = level; });
  tag(['slit-at-wall', 'basicsWaveFunctionOption', 'detector-distance-group', 'screen-height-group', 'systemTime', 'realTime', 'waveSpeed', 'particleEnergy', 'noHitCount', 'waveFunctionOption', 'plot_palette-opacity', 'plot_sensor-opacity', 'plot_scales-opacity'], 'standard');
  for (const [id, lvl] of [['packet-directed-slits', 'expert'], ['shownParticles', 'standard']]) { const el = document.getElementById(id); const row = el?.closest('label, tr'); if (row) row.dataset.levelMin = lvl; }
  { const c = document.getElementById('packet-particle-color'); const row = c?.closest('label'); if (row) row.dataset.levelMin = 'standard'; }
  tag(['packet-slit-extent', 'packet-slit-balance', 'packet-tail-length', 'packet-interval', 'source-position-group', 'det-pixels-group', 'nSteps', 'flow-arrows', 'flow-lines'], 'expert');
  for (const id of ['flow-arrows', 'flow-lines']) { const el = document.getElementById(id); const box = el?.closest('.flow-overlay-controls, .input-group, div'); if (box) box.dataset.levelMin = 'expert'; }
  for (const id of ['paletteRangeSlider', 'waveRangeLabel']) { const el = document.getElementById(id); if (el) el.dataset.levelMin = 'standard'; }
  // Basic: no power tools in the toolbar, no range panel over the source, no flow or
  // slow-motion branching boxes, no Branch records row.
  const levelTag = (sel, level) => document.querySelectorAll(sel).forEach(el => { el.dataset.levelMin = level; });
  levelTag('.qontic-range-panel', 'standard');
  levelTag('.flow-settings', 'expert');
  for (const label of ['Wave range', 'Grid', 'Coordinates and measure', '3D wave surface', 'Edit geometry']) levelTag(`.qontic-media-toolbar button[aria-label="${label}"]`, 'standard');
  // 4.2: Branch records shown at every level in Many Worlds (with more than one electron per wave the split is not drawn; the count is the record).
  // The Pilot-Wave field button only in the Pilot Wave view.
  const pwFieldButton = document.querySelector('.qontic-media-toolbar button[aria-label="Pilot-Wave field"]');
  const syncPwField = () => { if (pwFieldButton) { pwFieldButton.hidden = interpretation !== 'bohmian'; pwFieldButton.style.setProperty('display', interpretation !== 'bohmian' ? 'none' : '', interpretation !== 'bohmian' ? 'important' : ''); } };
  controls.addEventListener('qontic:interpretation', () => setTimeout(syncPwField, 0));
  new MutationObserver(syncPwField).observe(controls, { attributes: true, attributeFilter: ['interpretation'] });
  syncPwField();
  const slitRange = document.getElementById('slit-count');
  // Controls hidden below a level take their default there (so a hidden control never changes
  // the physics); the user's value is kept and comes back at that level (also across reloads).
  // kind: group (unit-converted parameter), range, check, select. basicDef: value used at Basic
  // when it differs from the fresh-page default.
  const LEVEL_DEFAULTS = [
    ['slit-at-wall', 'standard', 'check', false],
    ['basicsWaveFunctionOption', 'standard', 'select', 'Phase'],
    ['detector-distance-group', 'standard', 'group', 1000],
    ['screen-height-group', 'standard', 'group', 1200],
    ['particleType', 'standard', 'select', 'electron'],
    ['packet-source-width', 'standard', 'range', 400],
    ['packet-length', 'standard', 'range', 100],
    ['packet-slit-width', 'standard', 'range', 30],
    ['packet-particle-color', 'standard', 'select', 'uniform', 'slit'],
    ['packet-directed-slits', 'expert', 'check', true],
    ['packet-slit-extent', 'expert', 'range', 1.5],
    ['packet-slit-balance', 'expert', 'range', 0],
    ['packet-tail-length', 'expert', 'range', 250],
    ['packet-interval', 'expert', 'range', 0],
    ['source-position-group', 'expert', 'group', 225],
    ['det-pixels-group', 'expert', 'group', 100],
    ['flow-arrows', 'expert', 'check', false],
    ['flow-lines', 'expert', 'check', false],
  ];
  const RANK = { basic: 0, standard: 1, expert: 2 };
  const SAVED_KEY = 'qontic-te-level-saved';
  let levelSaved = {}; try { levelSaved = JSON.parse(localStorage.getItem(SAVED_KEY) || '{}'); } catch (_) {}
  const ctlGet = (el, kind) => kind === 'group' ? el.getValueInFirstUnit() : kind === 'check' ? el.checked : kind === 'range' ? +el.value : el.value;
  const ctlSet = (el, kind, v) => {
    if (kind === 'group') { el.setValueInFirstUnit(v); return; }
    if (kind === 'check') el.checked = !!v; else el.value = String(v);
    for (const type of (kind === 'range' ? ['input', 'change'] : ['change'])) el.dispatchEvent(new Event(type, { bubbles: true }));
  };
  const same = (a, b) => (typeof a === 'number' || typeof b === 'number') ? Math.abs(+a - +b) < 1e-9 : a === b;
  const levelDefaults = level => {
    let changed = false;
    for (const [id, min, kind, def, basicDef] of LEVEL_DEFAULTS) {
      const el = document.getElementById(id); if (!el) continue;
      const target = level === 'basic' && basicDef !== undefined ? basicDef : def;
      if (RANK[min] > RANK[level]) {
        const cur = ctlGet(el, kind);
        if (!(id in levelSaved)) levelSaved[id] = cur;
        if (!same(cur, target)) { ctlSet(el, kind, target); changed = true; }
      } else if (id in levelSaved) {
        const v = levelSaved[id]; delete levelSaved[id];
        if (!same(ctlGet(el, kind), v)) { ctlSet(el, kind, v); changed = true; }
      }
    }
    try { localStorage.setItem(SAVED_KEY, JSON.stringify(levelSaved)); } catch (_) {}
    return changed;
  };
  { const r = document.getElementById('wavelength'); if (r) r.dataset.minAll = r.min; }
  const applyLevel = level => {
    if (!LEVELS.includes(level)) level = 'basic';
    if (controls.getAttribute('level') !== level) controls.setAttribute('level', level);
    document.body.dataset.qonticLevel = level;
    try { localStorage.setItem('qontic-te-level', level); } catch (_) {}
    window.qonticPacketEngine?.setLevel?.(level);
    quizApi?.setLevel?.(level);
    levelDefaults(level);
    try { window.qonticBasicTips?.(level); } catch (_) {}
    // Many Worlds at Basic shows the world splitting at each hit (slow-motion branching) unless
    // the user has switched it off there.
    { const tour = document.getElementById('mw-branch-tour'), K = 'qontic-te-mw-tour-basic';
      let pref = null; try { pref = localStorage.getItem(K); } catch (_) {}
      if (tour && level === 'basic' && pref !== 'off' && !tour.checked) { tour.checked = true; tour.dispatchEvent(new Event('change', { bubbles: true })); }
      if (tour && !tour.dataset.basicPref) { tour.dataset.basicPref = '1'; tour.addEventListener('change', event => { if (event.isTrusted && document.body.dataset.qonticLevel === 'basic') { try { localStorage.setItem(K, tour.checked ? 'on' : 'off'); } catch (_) {} } }); } }
    // Basic runs at 3× by default (beginners waited 10–15 s for the first hit at 1×); the speed
    // chosen before comes back above Basic.
    { const sp = document.getElementById('animationStep'), K = 'qontic-te-speed-before-basic';
      if (sp) { let saved = null; try { saved = localStorage.getItem(K); } catch (_) {}
        if (level === 'basic' && saved === null && Math.abs(+sp.value - 1) < 1e-9) { try { localStorage.setItem(K, sp.value); } catch (_) {} $(sp).val(3).trigger('input').trigger('change'); }
        else if (level !== 'basic' && saved !== null) { if (Math.abs(+sp.value - 3) < 1e-9) $(sp).val(+saved).trigger('input').trigger('change'); try { localStorage.removeItem(K); } catch (_) {} } } }
    // Basic: at most four slits (the slider and the model), λ from 30 to 50 nm (below 30 nm the
    // slit beams barely overlap at the default geometry and the fringes go).
    slitRange.max = level === 'basic' ? '4' : '8';
    if (level === 'basic' && numSlits > 4) { slitRange.value = '4'; $(slitRange).trigger('input'); }
    const lam = document.getElementById('wavelength-group'), lamRange = document.getElementById('wavelength');
    if (lamRange) { lamRange.min = level === 'basic' ? '30' : lamRange.dataset.minAll; const n = document.getElementById('wavelength-input'); if (n) n.min = lamRange.min; }
    if (lam && level === 'basic' && lam.getValueInFirstUnit() < 30) lam.setValueInFirstUnit(30);
  };
  controls.setAttribute('levels', 'basic:Basic,standard:Standard,expert:Expert');
  controls.setAttribute('tab-levels', 'engine:standard,advanced:standard');
  controls.addEventListener('qontic:level', event => applyLevel(event.detail.level));
  {
    // A share link's hash carries the level it was made at; it wins over a ?level= left in the address.
    const fromUrl = new URLSearchParams(location.hash.slice(1)).get('level') || new URLSearchParams(location.search).get('level');
    let saved = null; try { saved = localStorage.getItem('qontic-te-level'); } catch (_) {}
    let fresh = false; try { fresh = !saved && !localStorage.getItem('nSlitTwoEnginesState'); } catch (_) {}
    // A Basic link's packetCount is the Basic "Electrons per wave".
    { const h = new URLSearchParams(location.hash.slice(1)), n = Math.round(+h.get('packetCount'));
      if (h.get('level') === 'basic' && n >= 1) try { localStorage.setItem('qontic-te-basic-hits', String(Math.min(100, n))); } catch (_) {} }
    applyLevel(LEVELS.includes(fromUrl) ? fromUrl : LEVELS.includes(saved) ? saved : 'basic');
    // The Pilot-Wave colour menu and Direct PW are attached a little later: a second pass for them.
    const again = (tries = 40) => { if (document.getElementById('packet-particle-color') && document.getElementById('packet-directed-slits')) levelDefaults(document.body.dataset.qonticLevel); else if (tries > 0) setTimeout(() => again(tries - 1), 100); };
    setTimeout(again, 0);
    // run=1 in the link: start the run once the page is ready (used by the notebook's set-ups).
    { const sp = +new URLSearchParams(location.hash.slice(1)).get('speed'); if (sp > 0) document.getElementById('animationStep-group')?.setValueInFirstUnit(sp); }
    if (new URLSearchParams(location.hash.slice(1)).get('run') === '1') setTimeout(() => { if (!isAnimating) $('#startButton').trigger('click'); }, 900);
  }
  // Switching view while paused: redraw the picture (the legacy redraw left the wave blank).
  if (typeof window.changeInterpretation === 'function' && !window.changeInterpretation.teWrapped) {
    const orig = window.changeInterpretation;
    window.changeInterpretation = function (...args) { const r = orig.apply(this, args); if (!isAnimating) setTimeout(() => window.qonticPacketEngine?.redraw?.(), 0); return r; };
    window.changeInterpretation.teWrapped = true;
  }
  // Typed values outside a control's range: say so next to the box (the value is clamped).
  document.addEventListener('change', event => {
    const input = event.target;
    if (!(input instanceof HTMLInputElement) || input.type !== 'number' || input.value === '') return;
    const v = +input.value, min = input.min === '' ? -Infinity : +input.min, max = input.max === '' ? Infinity : +input.max;
    if (v >= min && v <= max) return;
    let note = input.parentElement.querySelector('.te-range-note');
    if (!note) { note = document.createElement('span'); note.className = 'te-range-note'; note.setAttribute('role', 'status'); input.after(note); }
    note.textContent = `range ${input.min}–${input.max}`;
    clearTimeout(note._t); note._t = setTimeout(() => note.remove(), 3500);
  }, true);
  // Escape closes the palette chooser.
  document.addEventListener('keydown', event => { if (event.key === 'Escape') $('#palettePopup:visible').hide(); });
  // "What is the difference?" in the Engine tab: Physics tab, section on the two engines.
  document.addEventListener('click', event => {
    const link = event.target.closest('.te-engines-link');
    if (!link) return;
    event.preventDefault();
    showPage(2);
    setTimeout(() => document.getElementById('te-engines')?.scrollIntoView({ block: 'start' }), 50);
  });
  mountQonticShortcuts({
    togglePlayback:()=>document.getElementById('startButton').click(),
    reset:()=>document.getElementById('resetButton').click(),
    screenshot:()=>document.querySelector('.qontic-media-toolbar button[aria-label="Screenshot"]')?.click(),
    additional:{
      KeyV:()=>{if(!viewLocked)document.getElementById('toggleView').click();},
      KeyW:()=>{if(document.body.dataset.qonticLevel==='basic')return;const select=document.getElementById('waveFunctionOption');select.selectedIndex=(select.selectedIndex+1)%select.options.length;$(select).trigger('change');},
    },
  });
});

