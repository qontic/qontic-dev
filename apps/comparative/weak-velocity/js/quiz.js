// Quiz tab: predict before you watch (shared module, as in the N-Slits and
// Recoiling-Slit apps). Each question puts the app in a paused state and shows a
// still sketch drawn here, so the running simulation cannot give the answer away.
// The questions target misreadings students reported in the reviews: one run as
// a velocity, the window as a region of weak readings, the trace as a path,
// agreement with j/|ψ|² as a test of an interpretation.
import { mountQonticQuiz } from '../../../../shared/qontic-quiz.js?v=12';

const light = () => document.body.classList.contains('qontic-light');

// A fixed pseudo-random sequence, so each sketch looks the same every time.
function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const gauss = (r) => Math.sqrt(-2 * Math.log(r() + 1e-12)) * Math.cos(2 * Math.PI * r());

// Sketch: slits on the left, screen on the right, faint fringes between.
// opts: planes {w, s} (x of the weak and strong planes); run {Y, yf}; window {x, y, rx, ry};
// cloud {n, spread, dx} (weak readings of the window's runs); ring; arrow; trace (chain of
// windows); flows (flow lines); field (faint strong results everywhere); note.
function sketch(canvas, o = {}) {
  const g = canvas.getContext('2d'), W = canvas.width, H = canvas.height, L = light();
  const C = L
    ? { bg: '#eef4f8', ink: '#16324a', dim: '#6b8796', wave: 'rgba(12,90,140,', weak: '#a36400', strong: '#087788', flow: '#33424d', casing: '#ffffff' }
    : { bg: '#16293a', ink: '#d8ecf5', dim: '#7f9cab', wave: 'rgba(120,210,235,', weak: '#f0a640', strong: '#5fd6e6', flow: '#e8f0f4', casing: '#07131d' };
  g.fillStyle = C.bg; g.fillRect(0, 0, W, H);
  const x0 = 36, x1 = 330, top = 30, bot = 300, cy = (top + bot) / 2;
  // fringes: bands that open out from the slits
  for (let k = -3; k <= 3; k++) {
    g.fillStyle = C.wave + (k === 0 ? 0.22 : 0.13 - 0.02 * Math.abs(k)) + ')';
    g.beginPath(); g.moveTo(x0, cy - 6); g.lineTo(x1, cy + k * 38 - 12); g.lineTo(x1, cy + k * 38 + 12); g.lineTo(x0, cy + 6); g.closePath(); g.fill();
  }
  // wall with two slits, and the screen
  g.strokeStyle = C.ink; g.lineWidth = 4; g.beginPath();
  g.moveTo(x0, top); g.lineTo(x0, cy - 30); g.moveTo(x0, cy - 14); g.lineTo(x0, cy + 14); g.moveTo(x0, cy + 30); g.lineTo(x0, bot); g.stroke();
  g.lineWidth = 3; g.beginPath(); g.moveTo(x1, top); g.lineTo(x1, bot); g.stroke();
  g.font = '11px Inter, system-ui, sans-serif'; g.fillStyle = C.dim; g.textAlign = 'center';
  g.fillText('slits', x0, bot + 16); g.fillText('screen', x1, bot + 16);
  const dot = (x, y, r, c) => { g.fillStyle = c; g.beginPath(); g.arc(x, y, r, 0, 2 * Math.PI); g.fill(); };
  if (o.field) { const r = rng(7); g.globalAlpha = 0.35; for (let i = 0; i < 900; i++) { const x = x0 + 6 + r() * (x1 - x0 - 8), k = Math.round(gauss(r) * 1.3); const y = cy + k * 38 * (x - x0) / (x1 - x0) + gauss(r) * 7; g.fillStyle = C.strong; g.fillRect(x, y, 1.6, 1.6); } g.globalAlpha = 1; }
  if (o.flows) {
    g.setLineDash([5, 4]); g.lineWidth = 1.4; g.strokeStyle = C.flow;
    for (const k of [-2.4, -1.5, -0.8, -0.25, 0.25, 0.8, 1.5, 2.4]) { g.beginPath(); for (let i = 0; i <= 40; i++) { const x = x0 + (x1 - x0) * i / 40, f = (x - x0) / (x1 - x0); const y = cy + k * (5 + 33 * f) + 4 * Math.sin(6 * f) * Math.sign(k); i ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke(); }
    g.setLineDash([]);
  }
  if (o.planes) {
    g.setLineDash([4, 4]); g.lineWidth = 1.5;
    g.strokeStyle = C.weak; g.beginPath(); g.moveTo(o.planes.w, top); g.lineTo(o.planes.w, bot); g.stroke();
    g.strokeStyle = C.strong; g.beginPath(); g.moveTo(o.planes.s, top); g.lineTo(o.planes.s, bot); g.stroke();
    g.setLineDash([]);
    g.fillStyle = C.weak; g.textAlign = 'right'; g.fillText('weak', o.planes.w - 4, top + 12);
    g.fillStyle = C.strong; g.textAlign = 'left'; g.fillText('strong', o.planes.s + 4, top + 12);
  }
  if (o.run) {
    dot(o.planes.w, o.run.Y, 6, C.weak); dot(o.planes.s, o.run.yf, 6, C.strong);
    g.font = '11px Inter, system-ui, sans-serif'; g.textAlign = 'right'; g.fillStyle = C.weak; g.fillText('pointer reading Y', o.planes.w - 9, o.run.Y + 4);
    g.textAlign = 'left'; g.fillStyle = C.strong; g.fillText('detected y_f', o.planes.s + 9, o.run.yf + 4);
  }
  let mean = null;
  if (o.cloud && o.window) {
    const r = rng(o.cloud.seed || 3), wx = o.window.x - (o.cloud.dx || 18);
    let sx = 0, sy = 0;
    for (let i = 0; i < o.cloud.n; i++) { const x = wx + gauss(r) * o.cloud.spread, y = o.window.y + gauss(r) * o.cloud.spread; sx += x; sy += y; g.globalAlpha = 0.7; g.fillStyle = C.weak; g.fillRect(x - 1.5, y - 1.5, 3, 3); }
    g.globalAlpha = 1; mean = { x: sx / o.cloud.n, y: sy / o.cloud.n };
  }
  if (o.window) {
    const { x, y, rx, ry } = o.window;
    g.strokeStyle = C.casing; g.lineWidth = 4.5; g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, 2 * Math.PI); g.stroke();
    g.strokeStyle = C.strong; g.lineWidth = 2; g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, 2 * Math.PI); g.stroke();
  }
  if (o.ring && mean) { g.strokeStyle = C.weak; g.lineWidth = 2; g.beginPath(); g.arc(mean.x, mean.y, 6, 0, 2 * Math.PI); g.stroke(); }
  if (o.arrow && mean) {
    const ex = o.window.x, ey = o.window.y, a = Math.atan2(ey - mean.y, ex - mean.x);
    g.strokeStyle = C.weak; g.fillStyle = C.weak; g.lineWidth = 2.5; g.beginPath(); g.moveTo(mean.x, mean.y); g.lineTo(ex, ey); g.stroke();
    g.beginPath(); g.moveTo(ex, ey); g.lineTo(ex - 9 * Math.cos(a - 0.4), ey - 9 * Math.sin(a - 0.4)); g.lineTo(ex - 9 * Math.cos(a + 0.4), ey - 9 * Math.sin(a + 0.4)); g.closePath(); g.fill();
  }
  if (o.trace) {
    const pts = o.trace;
    g.strokeStyle = C.ink; g.globalAlpha = 0.6; g.lineWidth = 1; g.setLineDash([2, 3]); g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.stroke(); g.setLineDash([]); g.globalAlpha = 1;
    for (const [x, y] of pts) { g.beginPath(); g.arc(x, y, 4, 0, 2 * Math.PI); g.fillStyle = C.casing; g.fill(); g.strokeStyle = C.ink; g.lineWidth = 1.6; g.stroke(); }
  }
  if (o.labels) for (const [s, x, y, c, align = 'left'] of o.labels) { g.font = '11px Inter, system-ui, sans-serif'; g.textAlign = align; g.fillStyle = C[c] || c; g.fillText(s, x, y); }
  if (o.note) { g.fillStyle = C.ink; g.font = '13px Inter, system-ui, sans-serif'; g.textAlign = 'center'; g.fillText(o.note, W / 2, H - 12); }
  g.textAlign = 'start';
}

// A chain of windows from (290, 120) back to the slits, bending as the flow does.
// Points along one of the sketched flow lines (k = −1.5), slightly off it, for the agreement question.
const ALONG = Array.from({ length: 12 }, (_, i) => { const f = 1 - i / 11, x = 36 + 294 * f; return [x, 165 - 1.5 * (5 + 33 * f) - 4 * Math.sin(6 * f) + 1.5 * Math.sin(5 * i)]; });
const TRACE = Array.from({ length: 12 }, (_, i) => { const f = 1 - i / 11; return [60 + 230 * f, 165 - 45 * f ** 1.3 + 3 * Math.sin(9 * f)]; });

export function mountWeakQuiz({ panel, tab, simulationTab, setTo, run }) {
  const questions = [
    {
      question: 'One run: the pointer reads Y = −236 nm at the weak plane, and the particle is detected at y_f = −130 nm at the strong plane, 50 nm further on. What does this run tell you about the particle’s sideways velocity?',
      caption: 'Planes method, step 1: one run, pointer spread 200 nm.',
      plain: 'Almost nothing. One pointer reading is spread over about 200 nm, far more than the particle’s sideways motion over 50 nm.',
      answers: [
        { id: 'nothing', label: 'Almost nothing' },
        { id: 'slope', label: 'It moved 106 nm sideways in 50 nm: slope +2.1' },
        { id: 'back', label: 'It moved towards the axis, so its velocity points inward' },
        { id: 'exact', label: 'The pointer reading is exact; only the detection is uncertain' },
      ],
      answer: 'nothing',
      explain: 'The pointer starts with its own spread σₚ = 200 nm, so a single reading Y can land almost anywhere across the pattern. That is the price of disturbing the wave very little. The difference y_f − Y for one run is dominated by this spread. A velocity appears only after many runs: keep those detected in one strip and average their readings. In the simulation, run a few single runs and compare their scatter with the 50 nm gap.',
      prepare: () => setTo({ level: 'basic', stage: 'one', sw: 200 }),
      draw: (c) => sketch(c, { planes: { w: 170, s: 200 }, run: { Y: 228, yf: 196 }, note: 'pointer spread 200 nm, gap 50 nm' }),
    },
    {
      question: 'The pointer readings of the selected runs are spread over about 500 nm, yet the slope is quoted with an error of about ±0.04. How can that be?',
      caption: 'Windows method, step 2: the weak readings (amber dots) of the runs in one window.',
      plain: 'Only their mean is sharp: its error shrinks as one over the square root of the number of runs.',
      answers: [
        { id: 'mean', label: 'Only the mean is used, and its error falls as 1/√N' },
        { id: 'smooth', label: 'The app smooths the readings before averaging' },
        { id: 'strong', label: 'The strong measurement corrects each weak reading' },
        { id: 'cancel', label: 'The pointer noise is the same in every run, so it cancels' },
      ],
      answer: 'mean',
      explain: 'Each amber dot is one reading with a spread of 200 nm. With about 10,000 runs in the window, the mean of their readings (the amber ring) has a spread of about 200/√10,000 = 2 nm. The arrow runs from that mean to the mean strong position, a few tens of nanometres away, so its direction is sharp even though no single reading is. More runs make the ring sharper; they do not make any dot more precise.',
      prepare: () => setTo({ level: 'standard', stage: 'window', sw: 200, win: { len: 100, wid: 10, x: 550, y: 50 } }),
      draw: (c) => sketch(c, { field: true, window: { x: 220, y: 180, rx: 22, ry: 4 }, cloud: { n: 260, spread: 34, dx: 14 }, ring: true, arrow: true, labels: [['amber dots: readings', 46, 22, 'weak'], ['ring: their mean', 46, 38, 'weak']] }),
    },
    {
      question: 'With the Windows method you point at a place in the field. Which runs does the window select?',
      caption: 'The window (cyan outline) over the collected runs.',
      plain: 'The runs whose strong (later) result fell inside it.',
      answers: [
        { id: 'strong', label: 'The runs whose strong result, at t₂, fell inside it' },
        { id: 'weak', label: 'The runs whose weak reading, at t₁, fell inside it' },
        { id: 'both', label: 'The runs whose weak reading and strong result both fell inside it' },
        { id: 'near', label: 'All runs whose particle passed near the window' },
      ],
      answer: 'strong',
      explain: 'The window is a post-selection on the strong result, as the strip is in the Planes method. Their weak readings then spread far outside it, by the pointer’s 200 nm, which is why the amber dots fill a large cloud around a small window. The arrow from the mean weak reading to the mean strong position is the measured velocity for those runs. Selecting on the weak readings instead would give a different, meaningless average.',
      prepare: () => setTo({ level: 'standard', stage: 'window', sw: 200, win: { len: 100, wid: 10, x: 550, y: 50 } }),
      draw: (c) => sketch(c, { field: true, window: { x: 220, y: 180, rx: 22, ry: 4 } }),
    },
    {
      question: 'The pointer spread is changed from 200 nm to 10 nm, and the field is mapped again. How do the measured arrows compare with the flow lines of j/|ψ|²?',
      caption: 'Planes method, step 3: the measured arrows and the dashed j/|ψ|² flow lines.',
      plain: 'They depart from them. A sharp pointer disturbs the wave, and the arrows follow the prediction for that pointer, not j/|ψ|².',
      answers: [
        { id: 'depart', label: 'They depart from them: the sharp pointer disturbs the wave' },
        { id: 'closer', label: 'They follow them more closely: each reading is more precise' },
        { id: 'same', label: 'No change: the pointer only adds noise' },
        { id: 'none', label: 'No arrows can be measured with a sharp pointer' },
      ],
      answer: 'depart',
      explain: 'A pointer of spread σₚ adds a transverse momentum kick of spread ħ/(2σₚ). At 200 nm this kick is tiny, and the arrows approach j/|ψ|²: in the model the slope differs by about 0.003 (rms) at the default planes. At 10 nm the readings are sharp but the wave is disturbed, and the slope differs by about 0.09 (rms). The measured arrows still agree with the prediction for that pointer (blue), but that prediction is no longer j/|ψ|². Weak means: little disturbance, paid for with many runs.',
      prepare: () => setTo({ level: 'basic', stage: 'map', sw: 10 }),
      draw: (c) => sketch(c, { flows: true, labels: [['dashed: j/|ψ|² flow lines', 46, 22, 'ink']], note: 'pointer spread: 200 nm → 10 nm' }),
    },
    {
      question: 'At the window centred 550 nm behind the slits and 50 nm off the axis, j/|ψ|² gives a slope of −0.37. The window is changed from a 100 × 10 nm ellipse to a circle 50 nm across, which holds about three times as many runs. What happens to the measured slope?',
      caption: 'The same place, two window shapes.',
      plain: 'It moves away from −0.37 (to about −0.25), even though its error bar shrinks.',
      answers: [
        { id: 'away', label: 'It moves away from −0.37, while its error bar shrinks' },
        { id: 'closer', label: 'It gets closer to −0.37: more runs, better result' },
        { id: 'same', label: 'Same value, smaller error bar' },
        { id: 'sign', label: 'It changes sign' },
      ],
      answer: 'away',
      explain: 'The window decides which runs are averaged, so it averages the velocity over its area. Across the beam the velocity changes steeply near the fringes, so a circle 50 nm across mixes quite different velocities: the prediction for it is −0.246. Along the beam the velocity hardly changes, so the long, narrow ellipse follows the field and gives −0.360. More runs reduce the sampling error, not the averaging bias. The simulation opens with the 50 nm circle; compare it with Window size 100 × 10 nm.',
      prepare: () => setTo({ level: 'standard', stage: 'window', sw: 200, win: { len: 50, wid: 50, x: 550, y: 50 } }),
      draw: (c) => sketch(c, { field: true, window: { x: 210, y: 150, rx: 22, ry: 4 }, labels: [['100 × 10 nm', 210, 138, 'strong', 'center']], note: 'then: a circle 50 nm across, same centre' }),
    },
    {
      question: 'Clicking the window traces back: the mean weak position becomes the next window, step by step, to the slits. What is the chain of open circles?',
      caption: 'Windows method, step 2: a trace back from one window.',
      plain: 'A chain of windows built in the analysis. Each circle uses different runs; no particle is followed.',
      answers: [
        { id: 'chain', label: 'A chain of windows: each circle uses different runs, and no particle is followed' },
        { id: 'path', label: 'The path of one particle, reconstructed backward' },
        { id: 'average', label: 'The average path of the particles detected in the first window' },
        { id: 'noise', label: 'Random points; only the first window means anything' },
      ],
      answer: 'chain',
      explain: 'Each step asks a new question of the data: which runs ended in this window, and where was their mean weak reading? The runs that answer it are different at every step, so the chain is not the history of any group of particles. It approximates a flow line of j/|ψ|². Pilot-wave reads that line as a possible trajectory; orthodox and many-worlds read it as a line of probability flow. The construction is the same in all three readings.',
      prepare: () => setTo({ level: 'standard', stage: 'window', sw: 200, win: { len: 100, wid: 10, x: 834, y: 137 }, trace: true }),
      draw: (c) => sketch(c, { field: true, window: { x: 290, y: 120, rx: 22, ry: 4 }, trace: TRACE }),
    },
    {
      question: 'The lines traced back from the screen end within a few nanometres of the flow lines of j/|ψ|². What does this agreement establish?',
      caption: 'Windows method, step 3: traced lines and the dashed j/|ψ|² flow lines.',
      plain: 'That the procedure reconstructs j/|ψ|². All three views predict this, so it does not decide between them.',
      answers: [
        { id: 'recon', label: 'The procedure reconstructs j/|ψ|²; all three views predict that' },
        { id: 'pw', label: 'Particles follow these trajectories: pilot-wave is confirmed' },
        { id: 'orth', label: 'Orthodox quantum mechanics is refuted' },
        { id: 'mw', label: 'The lines are branches of the wave function' },
      ],
      answer: 'recon',
      explain: 'Quantum mechanics predicts the joint statistics of the pointer readings and detections, and from them the weak-velocity field j/|ψ|². Orthodox quantum mechanics, pilot-wave and many-worlds share these predictions, so the agreement checks the measurement and its statistics, not an interpretation. Pilot-wave reads the lines as the particles’ trajectories; orthodox quantum mechanics as a regression of the data; many-worlds as the flow of the branch weights. The Rationale tab gives the three readings.',
      prepare: () => setTo({ level: 'standard', stage: 'wmap', sw: 200, win: { len: 100, wid: 10, x: 550, y: 50 }, bohm: true }),
      draw: (c) => sketch(c, { flows: true, trace: ALONG, labels: [['open circles: traced', 46, 22, 'ink'], ['dashed: j/|ψ|² flow lines', 46, 38, 'ink']] }),
    },
    {
      question: 'The Planes method uses two fixed planes and records only the transverse position. The Windows method measures at two instants, t₁ chosen at random for each run, and records the full position. Do they give the same velocity field?',
      caption: 'Left: a pair of planes. Right: windows anywhere.',
      plain: 'Yes. Here the packet only translates, so a run at the instants t₁ and t₂ is a run at a pair of planes.',
      answers: [
        { id: 'same', label: 'Yes: here a run at two instants is a run at a pair of planes' },
        { id: 'time', label: 'No: the field changes with time, so random instants blur it' },
        { id: 'planes', label: 'No: only the Planes method measures the real field' },
        { id: 'windows', label: 'No: only the Windows method measures the real field' },
      ],
      answer: 'same',
      explain: 'In this paraxial model the forward velocity is the same everywhere and the packet only translates along the beam, so the transverse field depends on the distance behind the slits, not on the time. A run measured at t₁ and t₂ with the full position recorded is a run at the planes where it was found. Recording only the transverse position at a fixed time would mix planes; that is why the Windows method records both coordinates. The Physics tab explains why the field does not depend on time.',
      prepare: () => setTo({ level: 'standard', stage: 'wone', sw: 200 }),
      draw: (c) => sketch(c, { planes: { w: 150, s: 180 }, window: { x: 270, y: 120, rx: 18, ry: 4 }, field: true }),
    },
  ];
  return mountQonticQuiz({
    panel, tab, simulationTab, questions, shuffle: true, score: true, shareLink: true,
    intro: 'The double slit with a weak pointer and a strong detector. Answer first; then watch it in the simulation.',
    onWatch: () => run(),
  });
}
