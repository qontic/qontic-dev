const vr = {
  mode: 'single', running: false, timer: null, runs: [], tau: .55,
  sigmaFinal: 1.35, weakNoise: 2.4, v0: .55, chirp: .72, bins: 11,
  interpretation: 'pilot', displayedBranch: null
};

const gaussian = () => {
  let u = 0, v = 0;
  while (!u) u = Math.random(); while (!v) v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
};
const bornVelocity = x => vr.v0 + vr.chirp * x;

function sampleRun() {
  const xf = vr.sigmaFinal * gaussian();
  const w = xf + .06 * gaussian();
  const trueV = bornVelocity(xf);
  const xWeak = xf - vr.tau * trueV + vr.weakNoise * gaussian();
  const branch = Math.max(0, Math.min(vr.bins - 1,
    Math.floor((w + 3 * vr.sigmaFinal) / (6 * vr.sigmaFinal) * vr.bins)));
  vr.runs.push({ xf, w, xWeak, estimate: (w - xWeak) / vr.tau, branch });
  vr.displayedBranch = branch;
  if (vr.runs.length > 50000) vr.runs.splice(0, vr.runs.length - 50000);
}

function binned() {
  const lo = -3 * vr.sigmaFinal, hi = 3 * vr.sigmaFinal, width = (hi - lo) / vr.bins;
  return Array.from({ length: vr.bins }, (_, i) => {
    const x = lo + (i + .5) * width;
    const values = vr.runs.filter(r => r.w >= lo + i * width && r.w < lo + (i + 1) * width).map(r => r.estimate);
    const n = values.length, mean = n ? values.reduce((a, b) => a + b, 0) / n : NaN;
    const variance = n > 1 ? values.reduce((a, b) => a + (b - mean) ** 2, 0) / (n - 1) : NaN;
    return { x, n, mean, se: n > 1 ? Math.sqrt(variance / n) : NaN };
  });
}

function drawStrongMeasurement() {
  const canvas = document.querySelector('#vr-strong-chart'); if (!canvas) return;
  const dpr = Math.min(devicePixelRatio || 1, 2), w = canvas.clientWidth, h = canvas.clientHeight;
  canvas.width = w * dpr; canvas.height = h * dpr;
  const c = canvas.getContext('2d'); c.scale(dpr, dpr);
  const light = document.body.classList.contains('qontic-light'), lo = -3 * vr.sigmaFinal, hi = 3 * vr.sigmaFinal;
  c.fillStyle = light ? '#f8fbfc' : '#06131d'; c.fillRect(0, 0, w, h);
  const m = { l: 35, r: 12, t: 18, b: 25 }, X = x => m.l + (x-lo)/(hi-lo)*(w-m.l-m.r), Y = y => m.t + (hi-y)/(hi-lo)*(h-m.t-m.b);
  c.strokeStyle = light ? '#a8bbc4' : '#355366'; c.beginPath(); c.moveTo(X(lo),Y(lo)); c.lineTo(X(hi),Y(hi)); c.stroke();
  for (const r of vr.runs.slice(-160)) { c.fillStyle='#ef718d88'; c.beginPath(); c.arc(X(r.xf),Y(r.w),2.1,0,Math.PI*2); c.fill(); }
  c.fillStyle = light ? '#304d5d' : '#b8cfdb'; c.font='10px Arial'; c.fillText('system X at t + τ',w/2-36,h-6); c.save(); c.translate(10,h/2+22); c.rotate(-Math.PI/2); c.fillText('record W',0,0); c.restore();
  c.fillStyle='#ef718d'; c.fillText('Later strong measurement: X → W',m.l,11);
}

function drawChart() {
  const canvas = document.querySelector('#vr-chart'); if (!canvas) return;
  const dpr = Math.min(devicePixelRatio || 1, 2), w = canvas.clientWidth, h = canvas.clientHeight;
  canvas.width = w * dpr; canvas.height = h * dpr;
  const c = canvas.getContext('2d'); c.scale(dpr, dpr);
  const light = document.body.classList.contains('qontic-light');
  c.fillStyle = light ? '#f8fbfc' : '#06131d'; c.fillRect(0, 0, w, h);
  const m = { l: 42, r: 13, t: 16, b: 29 }, xmin = -3 * vr.sigmaFinal, xmax = 3 * vr.sigmaFinal;
  const ymax = Math.max(3.8, Math.abs(vr.v0) + 3 * vr.chirp * vr.sigmaFinal + 1);
  const X = x => m.l + (x - xmin) / (xmax - xmin) * (w - m.l - m.r);
  const Y = y => m.t + (ymax - y) / (2 * ymax) * (h - m.t - m.b);
  c.strokeStyle = light ? '#9db2bd' : '#38576a'; c.lineWidth = 1;
  c.beginPath(); c.moveTo(m.l, Y(0)); c.lineTo(w - m.r, Y(0)); c.moveTo(X(0), m.t); c.lineTo(X(0), h - m.b); c.stroke();
  c.strokeStyle = '#55d8e6'; c.lineWidth = 2; c.beginPath();
  for (let i = 0; i <= 160; i++) { const x = xmin + i / 160 * (xmax - xmin), y = bornVelocity(x); i ? c.lineTo(X(x), Y(y)) : c.moveTo(X(x), Y(y)); } c.stroke();
  for (const p of binned()) if (p.n) {
    c.strokeStyle = '#ffd166'; c.fillStyle = '#ffd166'; c.lineWidth = 1.4;
    if (Number.isFinite(p.se)) { c.beginPath(); c.moveTo(X(p.x), Y(p.mean - p.se)); c.lineTo(X(p.x), Y(p.mean + p.se)); c.stroke(); }
    c.beginPath(); c.arc(X(p.x), Y(p.mean), 3.2, 0, Math.PI * 2); c.fill();
  }
  c.fillStyle = light ? '#304d5d' : '#b8cfdb'; c.font = '11px Arial';
  c.fillText('final position x', w / 2 - 30, h - 7); c.save(); c.translate(12, h / 2 + 28); c.rotate(-Math.PI / 2); c.fillText('velocity', 0, 0); c.restore();
  c.fillStyle = '#55d8e6'; c.fillText('— j/ρ theory', m.l + 5, 12); c.fillStyle = '#ffd166'; c.fillText('● reconstructed ± SE', m.l + 86, 12);
}

function refresh() {
  const panel = document.querySelector('.velocity-results'); if (!panel) return;
  panel.querySelector('[data-vr-count]').textContent = vr.runs.length.toLocaleString();
  panel.querySelector('[data-vr-state]').textContent = vr.running ? 'Running' : 'Paused';
  panel.querySelector('[data-vr-run]').textContent = vr.running ? 'Pause accumulation' : 'Accumulate';
  const populated = binned().filter(b => b.n > 1);
  const rmse = populated.length ? Math.sqrt(populated.reduce((s, b) => s + (b.mean - bornVelocity(b.x)) ** 2, 0) / populated.length) : NaN;
  panel.querySelector('[data-vr-rmse]').textContent = Number.isFinite(rmse) ? rmse.toFixed(3) : '—';
  const branchText = panel.querySelector('[data-vr-branch]');
  branchText.textContent = vr.interpretation === 'many-worlds'
    ? `Representative displayed branch: ${vr.displayedBranch == null ? '—' : vr.displayedBranch + 1}. Other branches remain in the weighted ensemble.`
    : vr.interpretation === 'pilot' ? 'Each run follows one actual Bohmian configuration.' : 'Each run contributes one postselected outcome.';
  drawStrongMeasurement(); drawChart();
}

function setRunning(on) {
  vr.running = on; clearInterval(vr.timer);
  if (on) vr.timer = setInterval(() => { for (let i = 0; i < 12; i++) sampleRun(); refresh(); }, 120);
  refresh();
}

function setMode(mode) {
  vr.mode = mode; const active = mode === 'velocity';
  document.body.classList.toggle('velocity-mode', active);
  document.querySelectorAll('[data-vr-mode]').forEach(b => b.classList.toggle('active', b.dataset.vrMode === mode));
  document.querySelector('.velocity-results')?.toggleAttribute('hidden', !active);
  document.querySelector('.final-x-plane')?.toggleAttribute('hidden', !active);
  if (!active) setRunning(false); else refresh();
}

function install() {
  const permanent = document.querySelector('.interaction-controls'), lab = document.querySelector('.lab');
  if (!permanent || !lab || document.querySelector('.velocity-results')) return false;
  const modes = document.createElement('div'); modes.className = 'vr-mode-toggle projection-toggle'; modes.setAttribute('role', 'group'); modes.setAttribute('aria-label', 'Experiment mode');
  modes.innerHTML = '<button class="active" data-vr-mode="single">Single measurement</button><button data-vr-mode="velocity">Velocity reconstruction</button>';
  permanent.prepend(modes);
  modes.addEventListener('click', e => { const b = e.target.closest('[data-vr-mode]'); if (b) setMode(b.dataset.vrMode); });

  const plane = document.createElement('div'); plane.className = 'final-x-plane'; plane.hidden = true; plane.innerHTML = '<span>Final X (strong)</span>'; lab.append(plane);
  const panel = document.createElement('section'); panel.className = 'velocity-results'; panel.hidden = true;
  panel.innerHTML = `<header><div><b>Velocity reconstruction</b><small>Wiseman postselected ensemble</small></div><button data-vr-collapse aria-label="Collapse results">−</button></header>
    <div class="vr-body"><div class="vr-sequence"><span>X–Y–Z weak measurement</span><i>→ delay τ →</i><span>X–W strong measurement</span></div><canvas id="vr-strong-chart" aria-label="Later strong X measurement recorded by pointer W"></canvas><canvas id="vr-chart" aria-label="Accumulated postselected velocity reconstruction"></canvas><div class="vr-metrics"><span>Accumulated runs <b data-vr-count>0</b></span><span>RMSE <b data-vr-rmse>—</b></span><span data-vr-state>Paused</span></div>
    <div class="vr-controls"><button data-vr-run>Accumulate</button><button class="secondary" data-vr-batch>+1000 runs</button><button class="secondary" data-vr-clear>Clear</button></div>
    <label>Delay τ <output>${vr.tau.toFixed(2)}</output></label><input data-vr-tau type="range" min=".15" max="1.2" step=".05" value="${vr.tau}">
    <label>Weak-readout noise <output>${vr.weakNoise.toFixed(1)}</output></label><input data-vr-noise type="range" min=".6" max="4" step=".1" value="${vr.weakNoise}">
    <p data-vr-branch></p><p class="vr-equation">v<sub>rec</sub>(x) = [x − ⟨X<sub>weak</sub>⟩<sub>Xfinal=x</sub>]/τ</p></div>`;
  lab.append(panel);
  panel.querySelector('[data-vr-run]').onclick = () => setRunning(!vr.running);
  panel.querySelector('[data-vr-batch]').onclick = () => { for (let i = 0; i < 1000; i++) sampleRun(); refresh(); };
  panel.querySelector('[data-vr-clear]').onclick = () => { vr.runs = []; vr.displayedBranch = null; refresh(); };
  panel.querySelector('[data-vr-collapse]').onclick = e => { panel.classList.toggle('collapsed'); e.currentTarget.textContent = panel.classList.contains('collapsed') ? '+' : '−'; };
  panel.querySelector('[data-vr-tau]').oninput = e => { vr.tau = +e.target.value; e.target.previousElementSibling.querySelector('output').textContent = vr.tau.toFixed(2); vr.runs = []; refresh(); };
  panel.querySelector('[data-vr-noise]').oninput = e => { vr.weakNoise = +e.target.value; e.target.previousElementSibling.querySelector('output').textContent = vr.weakNoise.toFixed(1); vr.runs = []; refresh(); };
  window.addEventListener('message', e => { if (e.data?.source !== 'xavier-model') return; if (e.data.type === 'ended' && vr.mode === 'velocity') { sampleRun(); refresh(); } });
  document.addEventListener('click', e => { const b = e.target.closest('[data-interpretation]'); if (b) { vr.interpretation = b.dataset.interpretation; refresh(); } });
  const details = document.querySelector('.details-panel');
  if (details && !details.querySelector('.vr-details')) details.insertAdjacentHTML('beforeend', `<section class="vr-details"><h2>Velocity reconstruction mode</h2><p>The complete weak measurement is repeated, followed after a delay τ by a strong measurement of the system position X. Runs are postselected by that final position. The conditional mean of the earlier noisy weak readings reconstructs Wiseman's operational velocity, which is compared with the theoretical Bohmian field j/ρ. This reconstruction panel uses a chirped packet with v<sub>B</sub>(x)=v<sub>0</sub>+κx so the position dependence is clearly visible.</p><p>In Many-Worlds mode, one Born-weighted representative branch is animated to prevent exponential visual growth. This is a visualization and sampling convention, not a physical collapse: the ensemble statistics retain the Born weights of all outcomes.</p></section>`);
  setMode('single'); return true;
}

const css = document.createElement('style'); css.textContent = `
.vr-mode-toggle{grid-template-columns:1fr 1.25fr!important;margin:0!important}.vr-mode-toggle button{font-size:10.5px!important;padding:6px 3px!important}
.lab{position:relative}.velocity-results{position:absolute;z-index:28;left:12px;bottom:12px;width:min(480px,calc(100% - 365px));max-height:calc(100% - 24px);overflow:auto;border:1px solid #3a6578;border-radius:10px;background:#07131df2;color:#dbeaf2;box-shadow:0 10px 35px #0009}.velocity-results[hidden]{display:none}.velocity-results header{display:flex;justify-content:space-between;align-items:center;padding:8px 10px;background:#102a39;border-bottom:1px solid #31556c}.velocity-results header div{display:flex;flex-direction:column}.velocity-results header small{color:#8faaba;font-size:10px}.velocity-results header button{padding:2px 8px}.vr-body{padding:8px 10px}.velocity-results.collapsed .vr-body{display:none}.velocity-results canvas{display:block;width:100%;height:165px;border:1px solid #203d4f;border-radius:6px}.velocity-results #vr-strong-chart{height:105px;margin-bottom:7px}.vr-metrics,.vr-controls{display:flex;gap:8px;align-items:center;margin-top:7px}.vr-metrics span{padding:3px 7px;border-radius:99px;background:#102a39;color:#a9c4d3;font-size:10px}.vr-controls button{padding:5px 9px;font-size:10px}.velocity-results label{margin-top:6px;font-size:10px}.velocity-results input{height:11px}.velocity-results p{margin:6px 0 0;color:#a9c4d3;font-size:10px;line-height:1.3}.vr-equation{color:#80dce5!important;font-family:Georgia,serif}.final-x-plane{position:absolute;z-index:20;left:calc((100% - 337px)*.78);top:34px;height:calc(100% - 68px);border-left:2px dashed #ef718d;pointer-events:none}.final-x-plane[hidden]{display:none}.final-x-plane span{position:absolute;top:8px;left:6px;padding:3px 6px;background:#2b1019e8;color:#ff9aad;border-radius:4px;font-size:10px;white-space:nowrap}.vr-details{border-top:1px solid var(--line);padding-top:14px}
.vr-sequence{display:flex;justify-content:center;align-items:center;gap:8px;margin:0 0 7px;color:#dbeaf2;font-size:10px}.vr-sequence span{padding:3px 7px;border:1px solid #41677a;border-radius:99px;background:#102a39}.vr-sequence i{color:#8faaba;font-style:normal}
body.qontic-light .velocity-results{background:#f8fbfcf2;color:#203746;border-color:#9bb5c1}body.qontic-light .velocity-results header{background:#e7f0f3;border-color:#9bb5c1}body.qontic-light .vr-metrics span{background:#e7f0f3;color:#405d6b}
@media(max-width:900px){.velocity-results{left:10px;right:10px;width:auto;bottom:345px}.final-x-plane{left:78%;height:500px}}
`; document.head.append(css);

if (!install()) new MutationObserver(() => install()).observe(document.documentElement, { childList: true, subtree: true });
