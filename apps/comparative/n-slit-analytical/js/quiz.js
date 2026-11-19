// Quiz tab for the N-slit preview: predict before you watch (shared module).
// Each question sets the app to a paused state and shows a still schematic of the
// apparatus (slits, detectors, screen), drawn here, so that the running simulation
// cannot give the answer away. Uses the app's classic-script globals (numSlits,
// slitOpen, slitDetector, interpretation, …) from double-slit.js.
import { mountQonticQuiz } from '../../../../shared/qontic-quiz.js?v=2';

const light = () => document.body.classList.contains('qontic-light');

// Schematic: source on the left, wall with N slits, screen on the right.
// slits: array of 'open' | 'closed' | 'detector'. Options: hitY (fraction of the
// screen height, 0 = top) marks one detection; packet draws wavefronts past the
// wall; shutter marks a slit being closed.
function drawSetup(canvas, slits, { hitY = null, packet = false, shutter = null } = {}) {
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

function isRunning() { return typeof isAnimating !== 'undefined' && isAnimating; }

// Put the app in the question's configuration, paused and reset.
function setTo({ view, slits, color = null }) {
  if (isRunning()) $('#startButton').trigger('click');
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

export function mountNSlitQuiz({ panel, tab, simulationTab }) {
  const questions = [
    {
      question: 'Pilot Wave, three equal slits open. A particle lands near the top of the screen. Which slit did it go through?',
      caption: 'Three open slits; the red dot is where the particle landed.',
      answers: [{ id: 's1', label: 'Slit 1' }, { id: 's2', label: 'Slit 2' }, { id: 's3', label: 'Slit 3' }, { id: 'all', label: 'All three' }],
      answer: 's1',
      explain: 'In pilot-wave theory each particle passes one slit, and trajectories never cross. So the slits map onto bands of the screen in order: slit 1 to the top band, slit 3 to the bottom one. In the simulation, Color: By slit colours each particle by its slit, and dashed lines on the histogram mark the bands.',
      prepare: () => setTo({ view: 'bohmian', slits: ['open', 'open', 'open'], color: 'slit' }),
      draw: c => drawSetup(c, ['open', 'open', 'open'], { hitY: .1 }),
    },
    {
      question: 'Four slits, with an ideal which-slit detector on slit 2 only. What does the screen show?',
      caption: 'Four open slits; D marks the detector on slit 2.',
      answers: [
        { id: 'none', label: 'No interference anywhere' },
        { id: 'partial', label: 'Slits 1, 3 and 4 still interfere; slit 2 adds its own single-slit pattern' },
        { id: 'same', label: 'The same pattern as without the detector' },
      ],
      answer: 'partial',
      explain: 'The detector record separates the wave from slit 2 from the rest: the density is |ψ₂|² + |ψ₁ + ψ₃ + ψ₄|². Only the cross terms involving slit 2 disappear; the undetected slits still interfere with each other.',
      prepare: () => setTo({ view: 'copenhagen', slits: ['open', 'detector', 'open', 'open'] }),
      draw: c => drawSetup(c, ['open', 'detector', 'open', 'open']),
    },
    {
      question: 'The same four slits, now with a detector on every slit. What does the screen show?',
      caption: 'Four open slits, each with a detector.',
      answers: [
        { id: 'four', label: 'Four-slit fringes' },
        { id: 'two', label: 'Two-slit fringes' },
        { id: 'smooth', label: 'A smooth sum of four single-slit patterns' },
      ],
      answer: 'smooth',
      explain: 'Every pair of slits is now told apart by the detector records, so no cross term is left: the density is |ψ₁|² + |ψ₂|² + |ψ₃|² + |ψ₄|². This is decoherence by the detectors. With imperfect detectors the fringes would only fade, not vanish.',
      prepare: () => setTo({ view: 'copenhagen', slits: ['detector', 'detector', 'detector', 'detector'] }),
      draw: c => drawSetup(c, ['detector', 'detector', 'detector', 'detector']),
    },
    {
      question: 'Orthodox view, two slits, no detector. A particle is detected in the central bright fringe. Which slit did it go through?',
      caption: 'Two open slits; the red dot is the detection in the central fringe.',
      answers: [
        { id: 'upper', label: 'The upper slit' },
        { id: 'lower', label: 'The lower slit' },
        { id: 'half', label: 'Half through each' },
        { id: 'none', label: 'The formalism assigns no slit without a measurement at the slits' },
      ],
      answer: 'none',
      explain: 'The orthodox formalism gives the probabilities of measurement outcomes. With no measurement at the slits it says nothing about a path. Put a detector on a slit and the question gets an answer, but the interference involving that slit goes away.',
      prepare: () => setTo({ view: 'copenhagen', slits: ['open', 'open'] }),
      draw: c => drawSetup(c, ['open', 'open'], { hitY: .5 }),
    },
    {
      question: 'Pilot Wave, two slits. The packet has just crossed the wall when you close the lower slit. What do the particles already past the wall do?',
      caption: 'The packet is past the wall; slit 2 is being closed.',
      answers: [
        { id: 'keep', label: 'Keep moving in the two-slit pattern' },
        { id: 'switch', label: 'Switch at once to a one-slit pattern' },
        { id: 'stop', label: 'Stop where they are' },
      ],
      answer: 'keep',
      explain: 'The part of the wave that came through the lower slit is already past the wall. Closing the slit cannot remove it, and it keeps guiding the particles. For the particles that used the upper slit it is an empty wave. Only the part of the packet that crosses the wall after the click sees one slit. Try it: the run starts when you watch; click slit 2 to close it when the packet reaches the wall (lower the Speed to make this easier).',
      prepare: () => setTo({ view: 'bohmian', slits: ['open', 'open'], color: 'slit' }),
      draw: c => drawSetup(c, ['open', 'open'], { packet: true, shutter: 1 }),
    },
    {
      question: 'Many Worlds, two slits, a detector on the upper slit. What happens at the slits?',
      caption: 'Two open slits; D marks the detector on slit 1.',
      answers: [
        { id: 'collapse', label: 'The wave collapses into one slit' },
        { id: 'split', label: 'Two branches: detector fired with the upper-slit wave, detector silent with the lower-slit wave' },
        { id: 'nothing', label: 'Nothing: the detector does not change the wave' },
      ],
      answer: 'split',
      explain: 'The wave never collapses. The detector becomes correlated with the slit: ψᵤ|fired⟩ + ψₗ|silent⟩. The two branches carry different records, so they no longer interfere on the screen; the weight of each branch comes from |ψ|².',
      prepare: () => setTo({ view: 'manyworlds', slits: ['detector', 'open'] }),
      draw: c => drawSetup(c, ['detector', 'open']),
    },
  ];
  return mountQonticQuiz({
    panel, tab, simulationTab, questions, shuffle: true, score: true,
    title: 'Quiz · predict before you watch',
    onWatch: () => { if (!isRunning()) $('#startButton').trigger('click'); },
  });
}
