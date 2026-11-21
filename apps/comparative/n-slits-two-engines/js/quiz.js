// Quiz tab for the N-slit preview: predict before you watch (shared module).
// Each question sets the app to a paused state and shows a still schematic of the
// apparatus (slits, detectors, screen), drawn here, so that the running simulation
// cannot give the answer away. Uses the app's classic-script globals (numSlits,
// slitOpen, slitDetector, interpretation, …) from double-slit.js.
import { mountQonticQuiz } from '../../../../shared/qontic-quiz.js?v=12';

const light = () => document.body.classList.contains('qontic-light');

// Schematic: source on the left, wall with N slits, screen on the right.
// slits: array of 'open' | 'closed' | 'detector'. Options: hitY (fraction of the
// screen height, 0 = top) marks one detection; packet draws wavefronts past the
// wall; shutter marks a slit being closed.
function drawSetup(canvas, slits, { hitY = null, packet = false, shutter = null, arrow = false, reflected = false, label = null } = {}) {
  const g = canvas.getContext('2d'), W = canvas.width, H = canvas.height, isLight = light();
  const ink = isLight ? '#16324a' : '#d8ecf5', dim = isLight ? '#6b8796' : '#7f9cab';
  g.fillStyle = isLight ? '#eef4f8' : '#16293a'; g.fillRect(0, 0, W, H);
  const wallX = 150, screenX = 318, n = slits.length, gap = Math.min(46, 240 / n), pitch = Math.min(70, 260 / Math.max(1, n - 1));
  const centre = k => H / 2 + (k - (n - 1) / 2) * pitch;
  // source
  const grad = g.createRadialGradient(34, H / 2, 2, 34, H / 2, 40);
  grad.addColorStop(0, isLight ? 'rgba(8,116,135,.8)' : 'rgba(129,231,245,.9)'); grad.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = grad; g.fillRect(0, H / 2 - 50, 80, 100);
  g.fillStyle = dim; g.font = '11px Inter, system-ui, sans-serif'; g.textAlign = 'center';
  g.fillText('source', 34, H / 2 + 58);
  // incoming wavefronts
  g.strokeStyle = isLight ? 'rgba(8,116,135,.35)' : 'rgba(129,231,245,.35)'; g.lineWidth = 2;
  for (let x = 70; x < wallX - 8; x += 16) { g.beginPath(); g.moveTo(x, H / 2 - 120); g.lineTo(x, H / 2 + 120); g.stroke(); }
  // wall with openings
  g.strokeStyle = ink; g.lineWidth = 6; g.beginPath(); let y = 14;
  const openings = slits.map((s, k) => [centre(k) - gap / 2, centre(k) + gap / 2, s, k]);
  for (const [top, bottom, s] of openings) { if (s === 'closed') continue; g.moveTo(wallX, y); g.lineTo(wallX, top); y = bottom; }
  g.moveTo(wallX, y); g.lineTo(wallX, H - 14); g.stroke();
  for (const [top, bottom, s, k] of openings) {
    g.fillStyle = dim; g.font = '12px Inter, system-ui, sans-serif'; g.textAlign = 'right';
    g.fillText(String(k + 1), wallX + 26, (top + bottom) / 2 + 4);
    if (s === 'detector') {
      g.fillStyle = '#ffd54a'; g.strokeStyle = '#3b2d00'; g.lineWidth = 1.5;
      g.fillRect(wallX - 22, (top + bottom) / 2 - 10, 14, 20); g.strokeRect(wallX - 22, (top + bottom) / 2 - 10, 14, 20);
      g.fillStyle = '#3b2d00'; g.font = 'bold 11px Inter, system-ui, sans-serif'; g.textAlign = 'center'; g.fillText('D', wallX - 15, (top + bottom) / 2 + 4);
    }
    if (shutter === k) {
      g.strokeStyle = '#e66767'; g.lineWidth = 6; g.setLineDash([4, 3]); g.beginPath(); g.moveTo(wallX, top); g.lineTo(wallX, bottom); g.stroke(); g.setLineDash([]);
      g.fillStyle = '#e66767'; g.font = '11px Inter, system-ui, sans-serif'; g.textAlign = 'left'; g.fillText('closing', wallX + 8, bottom + 14);
    }
  }
  // wavefronts that have passed the wall
  if (packet) {
    g.strokeStyle = isLight ? 'rgba(8,116,135,.45)' : 'rgba(129,231,245,.45)'; g.lineWidth = 2;
    for (const [top, bottom, s] of openings) {
      if (s === 'closed') continue;
      for (let r = 18; r <= 66; r += 12) { g.beginPath(); g.arc(wallX, (top + bottom) / 2, r, -Math.PI / 2.6, Math.PI / 2.6); g.stroke(); }
    }
  }
  // a particle heading for the wall between slits 1 and 2
  if (arrow) {
    const yy = (centre(0) + centre(1)) / 2;
    g.fillStyle = '#ff4d4d'; g.beginPath(); g.arc(wallX - 52, yy, 6, 0, 2 * Math.PI); g.fill();
    g.strokeStyle = '#ff4d4d'; g.lineWidth = 2; g.beginPath(); g.moveTo(wallX - 44, yy); g.lineTo(wallX - 14, yy); g.stroke();
    g.beginPath(); g.moveTo(wallX - 14, yy); g.lineTo(wallX - 22, yy - 5); g.lineTo(wallX - 22, yy + 5); g.closePath(); g.fill();
  }
  // a question mark for the wave coming back from the wall
  if (reflected) { g.fillStyle = '#e66767'; g.font = 'bold 22px Inter, system-ui, sans-serif'; g.textAlign = 'center'; g.fillText('← ?', wallX - 45, 40); }
  if (label) { g.fillStyle = dim; g.font = '11px Inter, system-ui, sans-serif'; g.textAlign = 'left'; g.fillText(label, 8, 16); }
  // screen
  g.strokeStyle = ink; g.lineWidth = 3; g.beginPath(); g.moveTo(screenX, 14); g.lineTo(screenX, H - 14); g.stroke();
  g.fillStyle = dim; g.font = '11px Inter, system-ui, sans-serif'; g.textAlign = 'center'; g.fillText('screen', screenX, H - 2);
  if (hitY !== null) {
    const yy = 14 + hitY * (H - 28);
    g.fillStyle = '#ff4d4d'; g.beginPath(); g.arc(screenX, yy, 6, 0, 2 * Math.PI); g.fill();
    g.strokeStyle = isLight ? '#16324a' : '#ffffff'; g.lineWidth = 1.5; g.stroke();
  }
}

// The colour selector is attached to the page a little after the engine starts;
// with ?quiz=1 the first question is prepared before that, so wait for it.
function setColor(color, tries = 60) {
  const select = document.getElementById('packet-particle-color');
  if (!select) { if (tries > 0) setTimeout(() => setColor(color, tries - 1), 50); return; }
  if (select.value !== color) { select.value = color; select.dispatchEvent(new Event('change', { bubbles: true })); }
}

// Watch for the blade questions: tick "Apply slit changes when the packet reaches the
// wall", start, and click slit 2 so that it closes when the packet centre gets there.
function closeSlit2AtWall() {
  const atWall = document.getElementById('slit-at-wall');
  if (atWall && !atWall.checked) { atWall.checked = true; atWall.dispatchEvent(new Event('change', { bubbles: true })); }
  setTimeout(() => document.querySelector('#slit-open-buttons [data-slit="1"]')?.click(), 150);
}

// Quiz state is not saved as the user's settings; leaving the quiz for the Simulation tab
// (not through "Watch it") puts back the engine and options the user had before.
let quizSaved = null, quizWatching = false;

function isRunning() { return typeof isAnimating !== 'undefined' && isAnimating; }

// Put the app in the question's configuration, paused and reset.
function setTo({ view, slits, color = null, engine = 'analytical', num = null }) {
  if (isRunning()) $('#startButton').trigger('click');
  const pe = window.qonticPacketEngine;
  // Remember the user's engine and numerical options the first time the quiz changes them.
  if (pe && !quizSaved) {
    const color = document.getElementById('packet-particle-color');
    quizSaved = { engine: pe.engine, num: pe.numOptions, view: interpretation, numSlits, open: slitOpen.slice(), det: slitDetector.slice(),
      color: color ? color.value : null, atWall: !!document.getElementById('slit-at-wall')?.checked };
  }
  if (pe?.setEngine && pe.engine !== engine) pe.setEngine(engine);
  // Numerical questions set the wall, blade, closing time, Show change and guiding law;
  // the others put back the defaults.
  pe?.setNumOptions?.(num || { wall: 'reflecting', blade: 'reflecting', tau: 0, showChange: false, guide: 'schrodinger', replay: false }, { persist: false });
  // Q5's Watch ticks this; every question starts with it off.
  const atWall = document.getElementById('slit-at-wall'); if (atWall && atWall.checked) { atWall.checked = false; atWall.dispatchEvent(new Event('change', { bubbles: true })); }
  if (view && interpretation !== view) changeInterpretation(view);
  numSlits = slits.length;
  for (let k = 0; k < MAX_SLITS; k++) {
    const s = slits[k];
    slitOpen[k] = s === undefined || s !== 'closed';
    slitDetector[k] = s === 'detector';
  }
  if (color) setColor(color);
  slitConfigurationChanged();
  window.qonticPacketEngine?.setWhichPath?.(whichPathDetector);
}

// Leaving the quiz (not through "Watch it"): the engine, numerical options, view, slits,
// detectors, particle colour and "Apply at the wall" the user had before the quiz.
function restoreSaved(pe) {
  const q = quizSaved;
  if (isRunning()) $('#startButton').trigger('click');
  if (pe.engine !== q.engine) pe.setEngine(q.engine);
  pe.setNumOptions(q.num, { persist: false });
  if (interpretation !== q.view) changeInterpretation(q.view);
  numSlits = q.numSlits;
  for (let k = 0; k < MAX_SLITS; k++) { slitOpen[k] = q.open[k]; slitDetector[k] = q.det[k]; }
  if (q.color) setColor(q.color);
  const atWall = document.getElementById('slit-at-wall'); if (atWall && atWall.checked !== q.atWall) { atWall.checked = q.atWall; atWall.dispatchEvent(new Event('change', { bubbles: true })); }
  slitConfigurationChanged();
  pe.setWhichPath?.(whichPathDetector);
}

export function mountNSlitQuiz({ panel, tab, simulationTab }) {
  panel?.addEventListener('click', e => { if (e.target.closest('[data-quiz="watch"]')) quizWatching = true; }, true);
  simulationTab?.addEventListener('click', () => {
    const pe = window.qonticPacketEngine;
    if (quizSaved && !quizWatching && pe) restoreSaved(pe);
    if (!quizWatching) quizSaved = null;
    quizWatching = false;
  });
  const questions = [
    // Basic (first look): five questions that need no equations.
    {
      question: 'Two slits are open and fringes build up on the screen. You close one slit. What happens to the fringes?',
      caption: 'Slit 2 closed; slit 1 still open.',
      plain: 'The fringes disappear: one broad bump is left.',
      answers: [{ id: 'gone', label: 'They disappear: one broad bump is left' }, { id: 'half', label: 'The same fringes, half as bright' }, { id: 'shift', label: 'The fringes move towards the open slit' }],
      answer: 'gone',
      explain: 'Fringes come from the waves of the two slits adding up (bright) or cancelling (dark). With one slit there is nothing to add or cancel with, so the hits form one broad bump: the wave spreading out from a single slit.',
      prepare: () => setTo({ view: 'copenhagen', slits: ['open', 'closed'] }),
      draw: c => drawSetup(c, ['open', 'closed']),
    },
    {
      question: 'Two open slits. You move them closer together. What happens to the fringes?',
      caption: 'Two open slits, moved closer together.',
      plain: 'They get wider apart.',
      answers: [{ id: 'wider', label: 'They get wider apart' }, { id: 'narrower', label: 'They get closer together' }, { id: 'same', label: 'Nothing changes' }],
      answer: 'wider',
      explain: 'The distance between bright fringes is about λ × (distance to the screen) ÷ (distance between the slits). Halve the distance between the slits and the fringes are twice as far apart. Try it with the Slit Sep. slider.',
      prepare: () => setTo({ view: 'copenhagen', slits: ['open', 'open'] }),
      draw: c => drawSetup(c, ['open', 'open'], { packet: true }),
    },
    {
      question: 'A single electron is sent towards two open slits. What appears on the screen?',
      caption: 'Two open slits; one electron.',
      plain: 'One dot, at a place that cannot be predicted.',
      answers: [{ id: 'dot', label: 'One dot, at a place that cannot be predicted' }, { id: 'faint', label: 'A faint copy of the whole fringe pattern' }, { id: 'two', label: 'Two dots, one behind each slit' }, { id: 'centre', label: 'One dot, always in the centre' }],
      answer: 'dot',
      explain: 'Each electron makes one dot. Where it lands is random: the wave gives the probability, highest in the bright fringes and zero in the dark ones. The fringes appear only after many electrons, one dot at a time.',
      prepare: () => setTo({ view: 'copenhagen', slits: ['open', 'open'] }),
      draw: c => drawSetup(c, ['open', 'open'], { hitY: .38 }),
    },
    {
      question: 'Two open slits, with a which-slit detector on slit 1. What does the screen show after many hits?',
      caption: 'Two open slits; D marks the detector on slit 1.',
      plain: 'No fringes: a smooth bump.',
      answers: [{ id: 'smooth', label: 'No fringes: a smooth bump' }, { id: 'same', label: 'The same fringes as without the detector' }, { id: 'one', label: 'Fringes only behind slit 2' }, { id: 'none', label: 'Nothing: the detector stops the electrons' }],
      answer: 'smooth',
      explain: 'Once it is recorded which slit each electron went through, the waves from the two slits no longer add up and cancel, so the fringes go. What is left is the sum of the two single-slit bumps, which overlap here into one smooth bump. The Views tab says how each view describes this.',
      prepare: () => setTo({ view: 'copenhagen', slits: ['detector', 'open'] }),
      draw: c => drawSetup(c, ['detector', 'open']),
    },
    {
      question: 'In which view does the app draw a path for each electron between the source and the screen?',
      caption: 'Same slits, same hits; three views.',
      plain: 'Pilot Wave.',
      answers: [{ id: 'pw', label: 'Pilot Wave' }, { id: 'orth', label: 'Orthodox' }, { id: 'mw', label: 'Many Worlds' }, { id: 'all', label: 'All three' }],
      answer: 'pw',
      explain: 'In Pilot Wave each electron is a particle with a position at all times, steered by the wave, so its path can be drawn. Orthodox says nothing about where the electron is before it is detected. In Many Worlds the wave is all there is, and every result happens in some branch. All three predict the same hits.',
      prepare: () => setTo({ view: 'bohmian', slits: ['open', 'open'] }),
      draw: c => drawSetup(c, ['open', 'open'], { packet: true }),
    },
    {
      question: 'Pilot Wave, three equal slits open. A particle lands near the top of the screen. Which slit did it go through?',
      caption: 'Three open slits; the dot is where the particle landed.',
      plain: 'Slit 1: in this model of pilot-wave motion paths never cross, so the top slit feeds the top of the screen.',
      answers: [{ id: 's1', label: 'Slit 1' }, { id: 's2', label: 'Slit 2' }, { id: 's3', label: 'Slit 3' }, { id: 'any', label: 'Any of them: the waves overlap there' }],
      answer: 's1',
      explain: 'In pilot-wave theory each particle passes one slit, and in this model, where every particle moves forward at the same speed, trajectories never cross, so the slits map onto bands of the screen in order: slit 1 to the top band, slit 3 to the bottom one. The band edges follow from the guidance law itself; how many particles land in each band comes from the theory’s assumption that starting positions are distributed as |ψ|². In the simulation, Color: By slit colours each particle by its slit, and dashed lines on the histogram mark the bands. The Orthodox view gives no slit at all (question 4).',
      prepare: () => setTo({ view: 'bohmian', slits: ['open', 'open', 'open'], color: 'slit' }),
      draw: c => drawSetup(c, ['open', 'open', 'open'], { hitY: .1 }),
    },
    {
      question: 'Four slits, with an ideal which-slit detector on slit 2 only. What does the screen show?',
      caption: 'Four open slits; D marks the detector on slit 2.',
      plain: 'Slits 1, 3 and 4 still make fringes together; slit 2 only adds a smooth bump.',
      answers: [
        { id: 'none', label: 'No interference left anywhere on the screen' },
        { id: 'partial', label: 'Slits 1, 3, 4 interfere; slit 2 adds a bump' },
        { id: 'same', label: 'Exactly the same fringes as without it' },
        { id: 'blocked', label: 'Slit 2 is blocked; the rest is unchanged' },
      ],
      answer: 'partial',
      explain: 'The detector record separates the wave from slit 2 from the rest: the density is |ψ₂|² + |ψ₁ + ψ₃ + ψ₄|². Only the cross terms involving slit 2 disappear; the undetected slits still interfere with each other, and slit 2 adds its own single-slit bump. The detector does not block the slit.',
      prepare: () => setTo({ view: 'copenhagen', slits: ['open', 'detector', 'open', 'open'] }),
      draw: c => drawSetup(c, ['open', 'detector', 'open', 'open']),
    },
    {
      question: 'The same four slits, now with a detector on every slit. What does the screen show?',
      caption: 'Four open slits, each with a detector.',
      plain: 'No fringes: every slit is told apart, so only smooth single-slit bumps add up.',
      answers: [
        { id: 'four', label: 'The four-slit fringes, unchanged' },
        { id: 'pairs', label: 'Weaker fringes from neighbouring pairs' },
        { id: 'smooth', label: 'No fringes: a sum of single-slit bumps' },
        { id: 'nothing', label: 'Nothing: detectors absorb the particles' },
      ],
      answer: 'smooth',
      explain: 'Every pair of slits is now told apart by the detector records, so no cross term is left: the density is |ψ₁|² + |ψ₂|² + |ψ₃|² + |ψ₄|². Here the single-slit bumps overlap into one smooth hump; with slits farther apart they would show as separate humps, still without fringes. This is how decoherence removes interference; with these ideal detectors the records could in principle be erased and the fringes brought back. With imperfect detectors the fringes would only fade.',
      prepare: () => setTo({ view: 'copenhagen', slits: ['detector', 'detector', 'detector', 'detector'] }),
      draw: c => drawSetup(c, ['detector', 'detector', 'detector', 'detector']),
    },
    {
      question: 'Orthodox view, two slits, no detector. A particle is detected in the central bright fringe. Which slit did it go through?',
      caption: 'Two open slits; the dot is the detection in the central fringe.',
      plain: 'Standard quantum mechanics does not say: without a measurement at the slits it assigns no slit.',
      answers: [
        { id: 'upper', label: 'The upper slit; which one is random' },
        { id: 'lower', label: 'The lower slit; which one is random' },
        { id: 'half', label: 'Half of it went through each of the slits' },
        { id: 'none', label: 'No slit is assigned without measuring' },
      ],
      answer: 'none',
      explain: 'In the orthodox view, quantum mechanics gives the probabilities of measurement outcomes. With no measurement at the slits it says nothing about a path, not even that the particle split in two. Put a detector on a slit and the question gets an answer, but the interference involving that slit goes away.',
      prepare: () => setTo({ view: 'copenhagen', slits: ['open', 'open'] }),
      draw: c => drawSetup(c, ['open', 'open'], { hitY: .5 }),
    },
    {
      question: 'Pilot Wave, two slits. The packet centre is reaching the wall when you close the lower slit. In this app\u2019s model, what do the particles already past the wall do?',
      caption: 'The packet centre is reaching the wall; slit 2 is being closed.',
      plain: 'In the app\u2019s model they keep the two-slit pattern, because the wave from slit 2 is already past the wall. In the full Schr\u00f6dinger equation the later, changed part of the wave also reaches them, so the wave guiding them changes substantially (by 31% of its amplitude in this app\u2019s numerical engine, Show change).',
      answers: [
        { id: 'keep', label: 'Keep moving in the two-slit pattern' },
        { id: 'switch', label: 'Switch at once to a one-slit pattern' },
        { id: 'stop', label: 'Stop, or vanish from the screen' },
      ],
      answer: 'keep',
      explain: 'In the app\u2019s model each particle went through one slit but is guided by the whole wave, including the part from the other slit, which is already past the wall. The model carries each slice of the packet forward at the packet speed, so only slices that cross the wall after the click see one slit. This is an approximation: in the full equation the part already past changes very little, but the later, changed part spreads into its region (see Physics, \u201cWhat the full Schr\u00f6dinger equation does\u201d). Watch it: the app ticks \u201cApply slit changes when the packet reaches the wall\u201d and closes slit 2 as the packet centre reaches the wall. The front of the packet keeps the two-slit fringes; the back shows one slit. The dashed curve on the screen is the two-slit prediction for the part of the packet already past the wall. At these default settings the model is outside its range of validity: the fringes kept at the front show the model, not the Schr\u00f6dinger equation.',
      prepare: () => setTo({ view: 'bohmian', slits: ['open', 'open'], color: 'slit' }),
      afterWatch: () => { const box = document.getElementById('slit-at-wall'); if (box) box.checked = true; setTimeout(() => document.querySelector('#slit-open-buttons button[data-slit="1"]')?.click(), 100); },
      draw: c => drawSetup(c, ['open', 'open'], { packet: true, shutter: 1 }),
    },
    {
      question: 'Many Worlds, two slits, a (macroscopic) which-slit detector on the upper slit. What happens at the slits?',
      caption: 'Two open slits; D marks the detector on slit 1.',
      plain: 'The state splits into two branches: one where the detector fired, one where it stayed silent.',
      answers: [
        { id: 'split', label: 'Two branches: detector fired, and silent' },
        { id: 'late', label: 'One branch until the particle hits the screen' },
        { id: 'interfere', label: 'Two branches that still interfere later' },
        { id: 'nothing', label: 'No change: the detector does not affect the wave' },
      ],
      answer: 'split',
      explain: 'The wave never collapses. The detector becomes correlated with the slit: (upper-slit wave) × (detector fired) + (lower-slit wave) × (detector silent). With a macroscopic detector these two branches have different, practically irreversible records, so they no longer interfere on the screen. Each branch’s weight is |ψ|² of its part; reading weights as probabilities is assumed here, and how Many Worlds justifies that is debated.',
      prepare: () => setTo({ view: 'manyworlds', slits: ['detector', 'open'] }),
      draw: c => drawSetup(c, ['detector', 'open']),
    },
    // Numerical engine (ported from the numerical N-slit app, numbers from this app).
    {
      question: 'Numerical engine, reflecting wall. Slit 2 is closed at once just as the packet centre reaches the wall. What happens to the part of the wave that had already passed the slits?',
      caption: 'The packet is crossing the wall; slit 2 is being closed.',
      plain: 'That part itself is unchanged, but the wave in the region it occupies changes: later parts, changed by the closing, move into it.',
      answers: [{ id: 'same', label: 'Unchanged, and so is the wave in that region' }, { id: 'spread', label: 'Unchanged, but the wave in that region changes' }, { id: 'instant', label: 'It is changed at once by the closing' }],
      answer: 'spread',
      explain: 'The Schrödinger equation is local and linear: the part that has already left the slits does not come back to them, so closing slit 2 does not touch it. But the parts still in front of the wall or inside the slit are changed, and they do not stay behind: the faster components of the packet and the fast waves scattered by a sudden closure carry them forward (diffraction to wide angles does the opposite: it slows the forward motion). Measured in this app (default geometry), when the cut reaches the screen the wave ahead of it differs by 31% from the wave with slit 2 left open, and by 59% behind it. Watch with Show change on: the picture shows ψ − ψ(slit left open), and the dashed line is the cut.',
      prepare: () => setTo({ engine: 'numerical', view: 'copenhagen', slits: ['open', 'open'], num: { wall: 'reflecting', blade: 'reflecting', tau: 0, showChange: true, guide: 'schrodinger', replay: false } }),
      draw: c => drawSetup(c, ['open', 'open'], { shutter: 1, packet: true, label: 'numerical engine' }),
      afterWatch: closeSlit2AtWall,
    },
    {
      question: 'Numerical engine, reflecting wall, Pilot Wave. A particle heads straight for the wall between the two slits. What happens to it?',
      caption: 'The red particle moves towards the wall between the slits.',
      plain: 'It is turned away before it reaches the wall.',
      answers: [{ id: 'turned', label: 'It is turned away before it reaches the wall' }, { id: 'through', label: 'It goes through the wall' }, { id: 'stops', label: 'It stops at the wall' }],
      answer: 'turned',
      explain: 'The particle moves with the velocity given by the wave, (ħ/m) Im(∇ψ/ψ). In front of the reflecting wall the incident and reflected waves overlap, and the guidance turns the particle back or sideways; it never enters the wall, where ψ is almost zero. With the Absorbing wall, particles that reach it are removed instead (an effective rule, with the probability that |ψ|² is absorbed there). The analytical engine has no reflected wave: its mask only absorbs.',
      prepare: () => setTo({ engine: 'numerical', view: 'bohmian', slits: ['open', 'open'], color: 'updown', num: { wall: 'reflecting', blade: 'reflecting', tau: 0, showChange: false, guide: 'schrodinger', replay: false } }),
      draw: c => drawSetup(c, ['open', 'open'], { arrow: true, label: 'numerical engine' }),
    },
    {
      question: 'Numerical engine. Slit 2 is closed from the moment the packet centre reaches the wall, either at once or by a blade taking 6 σₓ/v. Which changes the wave ahead of the cut more?',
      caption: 'Same start time; the blade closes at once or slowly.',
      plain: 'The instant closure, by far.',
      answers: [{ id: 'fast', label: 'The instant closure' }, { id: 'slow', label: 'The slow blade' }, { id: 'neither', label: 'Neither: nothing ahead of the cut changes' }],
      answer: 'fast',
      explain: 'Measured in this app (default geometry, reflecting blade), when the cut reaches the screen the wave ahead of it differs from the open-slit wave by 31% for the instant closure and by 1% for the slow blade (behind the cut: 59% and 16%). A sudden closure scatters fast waves that overtake the cut; the slow blade scatters little, and most of the packet has passed slit 2 before it closes. An instant absorbing blade gives 29%. Try it with Show change on and different closing times (Engine tab).',
      prepare: () => setTo({ engine: 'numerical', view: 'copenhagen', slits: ['open', 'open'], num: { wall: 'reflecting', blade: 'reflecting', tau: 6, showChange: true, guide: 'schrodinger', replay: false } }),
      draw: c => drawSetup(c, ['open', 'open'], { shutter: 1, packet: true, label: 'numerical engine · slow blade' }),
      afterWatch: closeSlit2AtWall,
    },
    {
      question: 'Numerical engine, Pilot Wave. The current is switched from Schrödinger to Pauli ↑ (a spin-½ particle with spin along z). What changes?',
      caption: 'Same wave; two currents for the particles.',
      plain: 'The trajectories change; the pattern of hits changes only very slightly.',
      answers: [{ id: 'paths', label: 'The trajectories, and the pattern of hits only very slightly' }, { id: 'both', label: 'The trajectories and the fringes: different bands and spacing' }, { id: 'nothing', label: 'Nothing: the wave is the same' }],
      answer: 'paths',
      explain: 'The Pauli velocity adds (ħ/2m) ∇×(ρ ẑ)/ρ to the Schrödinger one. The extra current has zero divergence, so |ψ|² at each time still moves with the particles (equivariance). The paths differ, most visibly where ρ changes quickly, near the wall and the slits. The hits are crossings of the screen line, and the spin current adds (ħ/2m) ∂ρ/∂y to the flux through it, so the pattern shifts by a few nanometres here: far below the fringe spacing. The green curve and the hits follow the chosen current in every view. Whether such spin-dependent arrival statistics could be measured is debated (Das and Dürr, Sci. Rep. 9, 2242 (2019); Goldstein, Tumulka and Zanghì, Sci. Rep. 14, 3775 (2024)).',
      prepare: () => setTo({ engine: 'numerical', view: 'bohmian', slits: ['open', 'open'], color: 'slit', num: { wall: 'reflecting', blade: 'reflecting', tau: 0, showChange: false, guide: 'up', replay: false } }),
      draw: c => drawSetup(c, ['open', 'open'], { packet: true, label: 'numerical engine · Pauli ↑' }),
    },
    {
      question: 'Two slits, default geometry. With the numerical engine and the reflecting wall, how much of the packet comes back from the wall?',
      caption: 'Numerical engine, reflecting wall.',
      plain: 'About three quarters.',
      answers: [{ id: 'none', label: 'Almost none, as in the analytical engine' }, { id: 'quarter', label: 'About a quarter' }, { id: 'most', label: 'About three quarters' }],
      answer: 'most',
      explain: 'The slits are narrow, so most of the packet hits the wall: in this app the reflecting wall sends back 78% of the packet and lets 20% past (the rest leaves through the side edges of the grid). The analytical engine’s mask reflects nothing; the numerical Mask and Absorbing walls reflect 0.3% or less. The screen pattern depends on what passes, so the engines can agree on the fringes while disagreeing about the wave in front of the wall.',
      prepare: () => setTo({ engine: 'numerical', view: 'copenhagen', slits: ['open', 'open'], num: { wall: 'reflecting', blade: 'reflecting', tau: 0, showChange: false, guide: 'schrodinger', replay: false } }),
      draw: c => drawSetup(c, ['open', 'open'], { reflected: true, label: 'numerical engine · reflecting wall' }),
    },
  ];
  // Level of each question (shared level switch): Basic shows the five first-look questions,
  // Standard adds the detector, view and wall questions, Expert the numerical details.
  const LEVEL = ['basic', 'basic', 'basic', 'basic', 'basic', 'standard', 'standard', 'standard', 'standard', 'standard', 'standard', 'expert', 'standard', 'expert', 'expert', 'standard'];
  const all = questions.map((q, i) => Object.assign(q, { level: LEVEL[i] || 'expert' }));
  const rank = { basic: 0, standard: 1, expert: 2 };
  let current = null;
  const quiz = mountQonticQuiz({
    panel, tab, simulationTab, questions, shuffle: true, score: true, shareLink: true,
    linkParams: () => ({ level: document.body.dataset.qonticLevel || 'basic' }),
    title: 'Quiz · predict before you watch',
    onWatch: q => { if (!isRunning()) $('#startButton').trigger('click'); q?.afterWatch?.(); },
  });
  return {
    quiz,
    setLevel(level) {
      if (level === current || !(level in rank)) return;
      const first = current === null;
      current = level;
      questions.splice(0, questions.length, ...all.filter(q => rank[q.level] <= rank[level]));
      // A link to a question (?quiz=N&level=…): N counts the questions of that level.
      const start = first ? parseInt(new URLSearchParams(location.search).get('quiz'), 10) : NaN;
      if (start >= 1) { quiz.reset(false); quiz.show(Math.min(start, questions.length) - 1); return; }
      // Prepare a question (which changes the app's settings) only if the quiz is open.
      quiz.reset(document.body.dataset.view === 'quiz');
    },
  };
}
