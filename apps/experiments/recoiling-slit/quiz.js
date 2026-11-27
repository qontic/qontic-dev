// Quiz tab: predict before you watch (shared module, as in the N-Slits app).
// Each question puts the app in a paused state and shows a still sketch of the
// apparatus, so that the running simulation cannot give the answer away.
import {mountQonticQuiz} from '../../../shared/qontic-quiz.js?v=9';

const isLight = () => document.body.dataset.theme === 'light';

// Sketch: laser, atom in a tweezer, paths A (up) and B (down), phase shifter, beam splitter, D+ and D-.
// opts: trap 'deep' | 'shallow' | 'warm'; click '+' | '-' | 'both'; note (text under the picture); dot (pilot-wave atom position)
function sketch(canvas, {trap = 'deep', click = null, note = '', dot = false, readout = false} = {}) {
  const g = canvas.getContext('2d'), W = canvas.width, H = canvas.height, L = isLight();
  const ink = L ? '#16324a' : '#d8ecf5', dim = L ? '#6b8796' : '#7f9cab', teal = L ? '#007c70' : '#74d8ce', gold = L ? '#9f5d00' : '#edbc77', violet = L ? '#6c47ad' : '#b7a6f5', grey = L ? '#5d6f80' : '#8fa3b8';
  g.fillStyle = L ? '#eef4f8' : '#16293a'; g.fillRect(0, 0, W, H);
  const cy = 170, src = [26, cy], atom = [92, cy], up = [190, 92], dn = [190, 248], bs = [270, cy], dp = [316, 110], dm = [316, 230];
  const seg = (a, b, c, w = 2.5) => { g.strokeStyle = c; g.lineWidth = w; g.beginPath(); g.moveTo(...a); g.lineTo(...b); g.stroke(); };
  seg(src, atom, ink); seg(atom, up, teal); seg(up, bs, teal); seg(atom, dn, gold); seg(dn, bs, gold); seg(bs, dp, violet); seg(bs, dm, grey);
  // tweezer and the atom's spread
  const blob = trap === 'sharp' ? 0.1 : trap === 'deep' ? 9 : trap === 'warm' ? 17 : 20;
  g.fillStyle = L ? 'rgba(159,93,0,.12)' : 'rgba(237,188,119,.14)'; g.beginPath(); g.moveTo(atom[0] - 22, cy - 70); g.lineTo(atom[0] + 22, cy - 70); g.lineTo(atom[0] + 4 + blob * .5, cy); g.lineTo(atom[0] + 22, cy + 70); g.lineTo(atom[0] - 22, cy + 70); g.lineTo(atom[0] - 4 - blob * .5, cy); g.closePath(); g.fill();
  const grad = g.createRadialGradient(atom[0], cy, 0, atom[0], cy, blob); grad.addColorStop(0, teal); grad.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = grad; g.beginPath(); g.arc(atom[0], cy, blob, 0, 2 * Math.PI); g.fill();
  if (dot) { g.fillStyle = ink; g.beginPath(); g.arc(atom[0] + 8, cy, 5.5, 0, 2 * Math.PI); g.fill(); g.font = '11px system-ui, sans-serif'; g.textAlign = 'left'; g.fillText('X', atom[0] + 10, cy - 10); }
  if (readout) { g.strokeStyle = ink; g.setLineDash([3, 3]); g.strokeRect(atom[0] - 26, cy + 76, 52, 22); g.setLineDash([]); g.fillStyle = ink; g.font = '10px system-ui, sans-serif'; g.textAlign = 'center'; g.fillText('recoil?', atom[0], cy + 91); }
  g.fillStyle = ink; g.beginPath(); g.arc(...src, 6, 0, 2 * Math.PI); g.fill();
  g.fillStyle = violet; g.fillRect(bs[0] - 4, cy - 14, 8, 28);
  g.fillStyle = L ? '#dae5eb' : '#21364b'; g.fillRect(222, 196, 14, 24); g.strokeStyle = gold; g.strokeRect(222, 196, 14, 24);
  for (const [p, c, lab, on] of [[dp, violet, 'D₊', click === '+' || click === 'both'], [dm, grey, 'D₋', click === '-' || click === 'both']]) {
    g.fillStyle = c; g.fillRect(p[0] - 6, p[1] - 12, 12, 24);
    g.font = '14px system-ui, sans-serif'; g.textAlign = 'left'; g.fillText(lab, p[0] + 10, p[1] + 5);
    if (on) { g.strokeStyle = c; g.lineWidth = click === 'both' ? 1.5 : 2.5; g.beginPath(); g.arc(p[0], p[1], 16, 0, 2 * Math.PI); g.stroke(); }
  }
  g.font = '12px system-ui, sans-serif'; g.textAlign = 'center'; g.fillStyle = dim;
  g.fillText('laser', src[0], cy + 22); if (trap === 'sharp') { g.fillStyle = teal; g.beginPath(); g.arc(atom[0], cy, 5, 0, 2 * Math.PI); g.fill(); g.fillStyle = dim; }
  g.fillText(trap === 'sharp' ? 'classical atom' : trap === 'deep' ? 'deep trap' : trap === 'warm' ? 'deep trap, heated' : 'shallow trap', atom[0], cy + 70 + (readout ? 42 : 16));
  g.fillStyle = teal; g.fillText('A', up[0], up[1] - 8); g.fillStyle = gold; g.fillText('B', dn[0], dn[1] + 18); g.fillStyle = gold; g.fillText('φ', 229, 236);
  if (note) { g.fillStyle = ink; g.font = '13px system-ui, sans-serif'; g.fillText(note, W / 2, H - 16); }
}

export function mountRecoilQuiz({panel, tab, simulationTab, setTo, run}) {
  const deep = 10.49, shallow = 0.60;
  const questions = [
    {
      question: 'Where is Einstein’s screen in this experiment? What plays the role of a position on the screen?',
      caption: 'The light can reach the beam splitter along path A or path B.',
      plain: 'The path phase φ. The two detectors replace the screen; changing φ is like moving along it.',
      answers: [{id: 'phase', label: 'The path phase φ, read with D₊ and D₋'}, {id: 'atom', label: 'The position of the atom'}, {id: 'det', label: 'Where D₊ and D₋ are placed'}, {id: 'trap', label: 'The trap depth'}],
      answer: 'phase',
      explain: 'On a screen, moving sideways changes the path difference between the two slits, so bright and dark fringes alternate. Here the phase shifter does the same: as φ changes, the fraction of clicks in D₊ rises and falls. That curve is the fringe. The atom plays Einstein’s movable slit; paths A and B play the two slits.',
      prepare: () => setTo({depth: deep, slit: 'fixed'}),
      draw: c => sketch(c, {note: 'Einstein: two slits and a screen'}),
    },
    {
      question: 'Suppose the slit were Einstein’s: a classical atom with a sharp position and a sharp momentum. What would you get?',
      caption: 'A classical atom at rest in the trap: no spread at all.',
      plain: 'Both: a full fringe and the path from the recoil. That is what Einstein hoped, and what quantum mechanics forbids.',
      answers: [{id: 'both', label: 'A full fringe, and the path from the recoil'}, {id: 'fringe', label: 'A full fringe, but no path'}, {id: 'path', label: 'The path, but no fringe'}, {id: 'none', label: 'Neither'}],
      answer: 'both',
      explain: 'An atom at rest at one place adds the same phase to every photon, so the fringe stays at 100% (V = 1). Its momentum is sharp, so the ±ħk kick would show the path (D = 1). Quantum mechanics requires V² + D² ≤ 1 (Englert 1996). The real atom has Δx·Δp ≥ ħ/2: the sharper its momentum, the more spread its position, and the fringe pays. In the simulation, compare “Einstein’s slit” with “Atom”.',
      prepare: () => setTo({depth: deep, slit: 'einstein'}),
      draw: c => sketch(c, {trap: 'sharp'}),
    },
    {
      question: 'The trap holding the atom is made much shallower. What happens to the fringe?',
      caption: 'The same experiment with a shallow trap: the atom is held loosely.',
      plain: 'It gets weaker. A loosely held atom has a small momentum spread, so its ±ħk recoil is easy to tell apart.',
      answers: [{id: 'weaker', label: 'It gets weaker'}, {id: 'stronger', label: 'It gets stronger'}, {id: 'same', label: 'It stays the same'}],
      answer: 'weaker',
      explain: 'A shallower trap gives the atom a smaller momentum spread Δp. The photon kicks the atom by −ħk (path A) or +ħk (path B). When these two kicks are large compared with Δp, the atom’s two possible momenta barely overlap: the atom carries a record of the path, and the fringe fades. The model predicts 82% visibility at 10.49 mK and 44% at 0.60 mK; the measured visibilities in the paper follow this trend. In the simulation, the “Why” panel shows the overlap.',
      prepare: () => setTo({depth: shallow}),
      draw: c => sketch(c, {trap: 'shallow'}),
    },
    {
      question: 'With the shallow trap the fringe is weak. Does someone have to measure the atom’s recoil for this to happen?',
      caption: 'Nobody reads the atom; only the photons are counted.',
      plain: 'No. It is enough that the recoil could in principle tell the path.',
      answers: [{id: 'no', label: 'No: the possibility of telling is enough'}, {id: 'yes', label: 'Yes: only a measurement destroys the fringe'}, {id: 'noise', label: 'No: the atom shakes randomly and blurs it'}],
      answer: 'no',
      explain: 'The photon and the atom’s motion become entangled. The fringe comes from the overlap of the atom’s two possible recoil states, whether or not anyone looks at the atom. It is not random shaking: the paper checks this by measuring the atom’s residual heating separately (next question).',
      prepare: () => setTo({depth: shallow}),
      draw: c => sketch(c, {trap: 'shallow', readout: true}),
    },
    {
      question: 'The atom in a deep trap is heated a little (more thermal motion). Its momentum spread grows. What happens to the fringe?',
      caption: 'Deep trap, but the atom is warmer than the ground state.',
      plain: 'It gets weaker, even though the momentum spread grows.',
      answers: [{id: 'weaker', label: 'It gets weaker'}, {id: 'stronger', label: 'It gets stronger, since Δp is larger'}, {id: 'same', label: 'Nothing changes'}],
      answer: 'weaker',
      explain: 'The overlap argument holds for a pure quantum state. A heated atom is a mixture of slightly displaced ground states; each sees the light’s phase pattern shifted, so their fringes are out of step and average down. In position terms, the warm atom is spread over more of the 390 nm pattern. The paper uses this to separate the quantum effect from heating; the formula is V = e^(−2η²(2n̄+1)). In the simulation, Advanced → Residual heating n̄ = 0.37.',
      prepare: () => setTo({depth: deep, nbar: 0.37}),
      draw: c => sketch(c, {trap: 'warm'}),
    },
    {
      question: 'Orthodox view, deep trap. A photon clicks D₊. Which path did it take?',
      caption: 'One click in D₊.',
      plain: 'Orthodox quantum mechanics assigns no path when none was measured.',
      answers: [{id: 'none', label: 'No path is assigned'}, {id: 'A', label: 'Path A'}, {id: 'B', label: 'Path B'}, {id: 'both', label: 'Half of it went each way'}],
      answer: 'none',
      explain: 'Without a which-path measurement, quantum mechanics gives only the probabilities of the clicks. This is Bohr’s complementarity: an arrangement that records the path (a loosely held atom) cannot show the fringe, and one that shows the fringe (a tightly held atom) leaves the path undefined.',
      prepare: () => setTo({depth: deep, view: 'cpn'}),
      draw: c => sketch(c, {click: '+'}),
    },
    {
      question: 'Pilot Wave view. What decides the odds that this photon ends in D₊ rather than D₋?',
      caption: 'The dot is the atom’s actual position in the trap.',
      plain: 'Where the atom actually is: the photon’s two paths reach D₊ with a relative phase 2kX + φ.',
      answers: [{id: 'x', label: 'The atom’s actual position X'}, {id: 'path', label: 'Which path the photon took'}, {id: 'collapse', label: 'A random collapse at the detector'}, {id: 'depth', label: 'Only the trap depth'}],
      answer: 'x',
      explain: 'In pilot-wave theory the atom always has a position X, distributed as |ψ|² over many runs. For an atom at X, P(D₊) = [1 + cos(2kX + φ)]/2: a pattern of stripes 390 nm apart. A tightly held atom (Δx ≈ 40 nm) sits within one stripe and the fringe survives; a loosely held one samples many and it washes out. So the slit has a definite position, as Einstein assumed, but no one can know it better than |ψ|² allows. Which detector fires also depends on the light field and the detectors, which the app does not model.',
      prepare: () => setTo({depth: deep, view: 'pw'}),
      draw: c => sketch(c, {dot: true}),
    },
    {
      question: 'Many Worlds view. After one photon has been detected, how many outcomes are there?',
      caption: 'Both detectors are drawn as clicking.',
      plain: 'Two branches, one where D₊ clicked and one where D₋ clicked, weighted by their probabilities.',
      answers: [{id: 'two', label: 'Two branches, weighted by P(D₊) and P(D₋)'}, {id: 'one', label: 'One, chosen at random'}, {id: 'four', label: 'Four: two paths times two detectors'}],
      answer: 'two',
      explain: 'The state never collapses; detection correlates it with two different records. The paths A and B are not separate worlds: they recombine at the beam splitter. Reading the branch weights as probabilities is an assumption whose justification is debated.',
      prepare: () => setTo({depth: deep, view: 'mw'}),
      draw: c => sketch(c, {click: 'both'}),
    },
    {
      question: 'Does this experiment show which of the three views is right?',
      caption: 'The same apparatus and the same counts in every view.',
      plain: 'No. All three give the same predictions for every count here.',
      answers: [{id: 'no', label: 'No: they predict the same counts'}, {id: 'orth', label: 'Yes: it confirms Orthodox'}, {id: 'pw', label: 'Yes: it confirms Pilot Wave'}, {id: 'mw', label: 'Yes: it confirms Many Worlds'}],
      answer: 'no',
      explain: 'The experiment confirms the quantum prediction, V = e^(−2η²) with η = ħk/2Δp, and shows Einstein’s movable slit at the quantum limit. The views differ in what they say happens between laser and click, not in the counts. Switch views in the simulation: the numbers stay the same.',
      prepare: () => setTo({depth: deep}),
      draw: c => sketch(c, {note: 'Orthodox · Pilot Wave · Many Worlds'}),
    },
  ];
  return mountQonticQuiz({panel, tab, simulationTab, questions, shuffle: true, score: true, title: 'Quiz · predict before you watch', onWatch: () => run()});
}
