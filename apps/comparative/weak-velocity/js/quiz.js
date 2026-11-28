// Quiz tab: predict before you watch (shared module, as in the N-Slits and
// Recoiling-Slit apps). Each question puts the app in a paused state and shows a
// still sketch drawn here, so the running simulation cannot give the answer away.
// The questions target misreadings students reported in the reviews: one run as
// a velocity, post-selection on the wrong measurement, a sharp pointer as better,
// a map as the path of one particle, agreement with j/|ψ|² as a test of an
// interpretation.
import { mountQonticQuiz } from '../../../../shared/qontic-quiz.js?v=12';

const light = () => document.body.classList.contains('qontic-light');

// A fixed pseudo-random sequence, so each sketch looks the same every time.
function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const gauss = (r) => Math.sqrt(-2 * Math.log(r() + 1e-12)) * Math.cos(2 * Math.PI * r());

// Sketch: slits on the left, screen on the right, faint fringes between.
// opts: planes {w, s} (x of the weak and strong planes); run {Y, yf}; strip {y, h} (a
// selected strip on the strong plane); column {n, spread, y, seed} (pointer readings of
// the strip's runs, beside the weak plane); ring (their mean); arrow (mean → strip);
// flows (dashed flow lines); line (points of a reconstructed line, amber); twelve (the
// twelve plane pairs of a map); labels; note.
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
  if (o.twelve) {
    g.lineWidth = 1; g.setLineDash([3, 4]);
    for (let i = 0; i < 12; i++) { const x = x0 + 14 + i * (x1 - x0 - 30) / 11; g.strokeStyle = C.weak; g.globalAlpha = 0.55; g.beginPath(); g.moveTo(x, top); g.lineTo(x, bot); g.stroke(); g.strokeStyle = C.strong; g.beginPath(); g.moveTo(x + 8, top); g.lineTo(x + 8, bot); g.stroke(); }
    g.setLineDash([]); g.globalAlpha = 1;
  }
  let mean = null;
  if (o.column && o.planes) {
    const r = rng(o.column.seed || 3); let sy = 0;
    g.globalAlpha = 0.7; g.fillStyle = C.weak;
    for (let i = 0; i < o.column.n; i++) { const y = o.column.y + gauss(r) * o.column.spread; sy += y; if (y > top && y < bot) g.fillRect(o.planes.w - 14 + r() * 10, y - 1.5, 3, 3); }
    g.globalAlpha = 1; mean = { x: o.planes.w, y: sy / o.column.n };
  }
  if (o.strip && o.planes) {
    g.strokeStyle = C.casing; g.lineWidth = 9; g.beginPath(); g.moveTo(o.planes.s, o.strip.y - o.strip.h / 2); g.lineTo(o.planes.s, o.strip.y + o.strip.h / 2); g.stroke();
    g.strokeStyle = C.strong; g.lineWidth = 5; g.beginPath(); g.moveTo(o.planes.s, o.strip.y - o.strip.h / 2); g.lineTo(o.planes.s, o.strip.y + o.strip.h / 2); g.stroke();
  }
  if (o.ring && mean) { g.strokeStyle = C.casing; g.lineWidth = 4; g.beginPath(); g.arc(mean.x, mean.y, 6, 0, 2 * Math.PI); g.stroke(); g.strokeStyle = C.weak; g.lineWidth = 2; g.beginPath(); g.arc(mean.x, mean.y, 6, 0, 2 * Math.PI); g.stroke(); }
  if (o.arrow && mean && o.strip) {
    const ex = o.planes.s, ey = o.strip.y, a = Math.atan2(ey - mean.y, ex - mean.x);
    g.strokeStyle = C.weak; g.fillStyle = C.weak; g.lineWidth = 2.5; g.beginPath(); g.moveTo(mean.x, mean.y); g.lineTo(ex, ey); g.stroke();
    g.beginPath(); g.moveTo(ex, ey); g.lineTo(ex - 9 * Math.cos(a - 0.4), ey - 9 * Math.sin(a - 0.4)); g.lineTo(ex - 9 * Math.cos(a + 0.4), ey - 9 * Math.sin(a + 0.4)); g.closePath(); g.fill();
  }
  if (o.line) {
    g.strokeStyle = C.weak; g.lineWidth = 2.2; g.beginPath(); o.line.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.stroke();
  }
  if (o.labels) for (const [s, x, y, c, align = 'left'] of o.labels) { g.font = '11px Inter, system-ui, sans-serif'; g.textAlign = align; g.fillStyle = C[c] || c; g.fillText(s, x, y); }
  if (o.note) { g.fillStyle = C.ink; g.font = '13px Inter, system-ui, sans-serif'; g.textAlign = 'center'; g.fillText(o.note, W / 2, H - 12); }
  g.textAlign = 'start';
}

// Points along one of the sketched flow lines (k = −1.5), slightly off it, for the agreement question.
const ALONG = Array.from({ length: 12 }, (_, i) => { const f = 1 - i / 11, x = 36 + 294 * f; return [x, 165 - 1.5 * (5 + 33 * f) - 4 * Math.sin(6 * f) + 1.5 * Math.sin(5 * i)]; });

export function mountWeakQuiz({ panel, tab, simulationTab, setTo, run }) {
  const questions = [
    {
      question: 'One run: the pointer reads Y = −236 nm at the weak plane, and the particle is detected at y_f = −130 nm at the strong plane, 50 nm further on. What does this run tell you about the particle’s sideways velocity?',
      caption: 'Stage 1: one run, pointer spread 200 nm.',
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
      question: 'To get the arrow at one strip of the strong plane, which runs’ pointer readings are averaged?',
      caption: 'Stage 2: one strip selected on the strong plane (cyan).',
      plain: 'The runs whose particle was detected in that strip at the strong plane.',
      answers: [
        { id: 'strong', label: 'The runs detected in that strip at the strong plane' },
        { id: 'weak', label: 'The runs whose pointer reading fell in that strip' },
        { id: 'all', label: 'All runs: the mean of every pointer reading' },
        { id: 'both', label: 'The runs whose pointer reading and detection both fell in the strip' },
      ],
      answer: 'strong',
      explain: 'This is post-selection on the strong result. The runs detected in the strip are kept, and their pointer readings, spread over hundreds of nanometres, are averaged. Detected position minus that mean reading, over the gap, gives the slope. The mean of all readings, without selection, only gives the mean position of the whole beam, which is zero by symmetry. Selecting on the pointer reading instead would not give a velocity: one reading says almost nothing about where the particle was.',
      prepare: () => setTo({ level: 'basic', stage: 'many', sw: 200 }),
      draw: (c) => sketch(c, { planes: { w: 170, s: 200 }, strip: { y: 150, h: 10 }, labels: [['selected strip', 208, 134, 'strong']] }),
    },
    {
      question: 'The pointer readings of the runs detected in one strip are spread over about 500 nm, yet the slope is quoted with an error of about ±0.035. How can that be?',
      caption: 'Stage 2: the readings of the strip’s runs (amber dots) and their mean (ring).',
      plain: 'Only their mean is used, and its error shrinks as one over the square root of the number of runs.',
      answers: [
        { id: 'mean', label: 'Only the mean is used, and its error falls as 1/√N' },
        { id: 'smooth', label: 'The app smooths the readings before averaging' },
        { id: 'strong', label: 'The strong measurement corrects each weak reading' },
        { id: 'cancel', label: 'The pointer noise is the same in every run, so it cancels' },
      ],
      answer: 'mean',
      explain: 'Each amber dot is one reading with a spread of 200 nm. With 1 million runs, about 13,000 are detected in a strip next to the centre, and the mean of their readings (the ring) has an error of about 200/√13,000 ≈ 1.8 nm. Over the 50 nm gap that is an error of about 0.035 in the slope. More runs make the ring sharper; they do not make any single reading more precise.',
      prepare: () => setTo({ level: 'basic', stage: 'many', sw: 200 }),
      draw: (c) => sketch(c, { planes: { w: 205, s: 255 }, strip: { y: 150, h: 10 }, column: { n: 220, spread: 55, y: 156, seed: 5 }, ring: true, arrow: true, labels: [['amber dots: readings', 46, 22, 'weak'], ['ring: their mean', 46, 38, 'weak']] }),
    },
    {
      question: 'With the default settings, the strip selected at the strong plane is 40–60 nm above the centre line. Which way does the measured arrow point?',
      caption: 'Stage 2: the strip just above the centre line, weak plane 500 nm behind the slits.',
      plain: 'Towards the centre line (slope about −0.34): the particles detected there were, on average, a little farther out at the weak plane.',
      answers: [
        { id: 'in', label: 'Towards the centre line (negative slope)' },
        { id: 'out', label: 'Away from the centre line (positive slope)' },
        { id: 'zero', label: 'Straight along the beam (slope zero)' },
        { id: 'random', label: 'It cannot be predicted: it changes from run to run' },
      ],
      answer: 'in',
      explain: 'Behind a double slit the flow is not a simple fan spreading out from the slits. Just off the centre line, at these planes, it points back towards the centre line: the prediction in this strip is −0.34. At 1 million runs the error is about ±0.035, so the sign is clear. Farther out, at 300–320 nm, the slope is about +0.25, outward. Most students expect outward everywhere; the measurement says otherwise.',
      prepare: () => setTo({ level: 'basic', stage: 'many', sw: 200 }),
      draw: (c) => sketch(c, { planes: { w: 170, s: 200 }, strip: { y: 158, h: 8 }, labels: [['40–60 nm', 208, 146, 'strong'], ['centre line', 46, 170, 'dim']] }),
    },
    {
      question: 'The pointer spread is changed from 200 nm to 10 nm, and the field is mapped again. How do the measured arrows compare with the flow lines of j/|ψ|²?',
      caption: 'Stage 3: the measured arrows and the dashed j/|ψ|² flow lines.',
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
      question: 'The map measures twelve pairs of planes, from the slits to the screen, and joins the arrows into lines. Was any particle measured at all twelve pairs?',
      caption: 'Stage 3: twelve pairs of planes.',
      plain: 'No. Each pair of planes is a separate experiment with fresh particles; joining the arrows is a step in the analysis.',
      answers: [
        { id: 'no', label: 'No: each pair is a separate experiment with fresh particles' },
        { id: 'yes', label: 'Yes: each particle passes all twelve pairs, one after the other' },
        { id: 'some', label: 'Only the particles that end on a line' },
        { id: 'last', label: 'Only at the last pair, next to the screen' },
      ],
      answer: 'no',
      explain: 'A strong position measurement at one pair of planes would disturb the particle for all later pairs, so each pair is measured with new runs. The lines are drawn afterwards, by following the measured arrows from plane to plane. They describe how the measured velocity field flows, not the history of any particle that was measured.',
      prepare: () => setTo({ level: 'basic', stage: 'map', sw: 200 }),
      draw: (c) => sketch(c, { twelve: true, note: 'twelve pairs of planes, each a separate experiment' }),
    },
    {
      question: 'The lines through the measured arrows end within a few nanometres of the flow lines of j/|ψ|². What does this agreement establish?',
      caption: 'Stage 3: a reconstructed line (amber) and the dashed j/|ψ|² flow lines.',
      plain: 'That the procedure reconstructs j/|ψ|². All three views predict this, so it does not decide between them.',
      answers: [
        { id: 'recon', label: 'The procedure reconstructs j/|ψ|²; all three views predict that' },
        { id: 'pw', label: 'Particles follow these trajectories: pilot-wave is confirmed' },
        { id: 'orth', label: 'Orthodox quantum mechanics is refuted' },
        { id: 'mw', label: 'The lines are branches of the wave function' },
      ],
      answer: 'recon',
      explain: 'Quantum mechanics predicts the joint statistics of the pointer readings and detections, and from them the weak-velocity field j/|ψ|². Orthodox quantum mechanics, pilot-wave and many-worlds share these predictions, so the agreement checks the measurement and its statistics, not an interpretation. Pilot-wave reads the lines as the particles’ trajectories; orthodox quantum mechanics as a regression of the data; many-worlds as the flow of the branch weights. The Rationale tab gives the three readings.',
      prepare: () => setTo({ level: 'basic', stage: 'map', sw: 200, bohm: true }),
      draw: (c) => sketch(c, { flows: true, line: ALONG, labels: [['amber: line through the arrows', 46, 22, 'weak'], ['dashed: j/|ψ|² flow lines', 46, 38, 'ink']] }),
    },
  ];
  return mountQonticQuiz({
    panel, tab, simulationTab, questions, shuffle: true, score: true, shareLink: true,
    intro: 'The double slit with a weak pointer and a strong detector. Answer first; then watch it in the simulation.',
    onWatch: () => run(),
  });
}
