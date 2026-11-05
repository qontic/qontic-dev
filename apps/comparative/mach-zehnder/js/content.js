// Explanations for each setup in each account. Keys: `${bs2 ? 'in' : 'out'}-${object}`.
// All accounts give the same detector statistics; they differ in what they say happens.

export const COMMON = {
  'in-none': 'All accounts agree: D2 never fires. Every atom reaches D1.',
  'out-none': 'All accounts agree: D1 and D2 each fire half the time.',
  'in-marker': 'All accounts agree: D1 and D2 each fire half the time. The marker removes the interference even though nobody reads it.',
  'out-marker': 'All accounts agree: D1 and D2 each fire half the time.',
  'in-bomb': 'All accounts agree: half the atoms are absorbed by the bomb, a quarter reach D1 and a quarter reach D2. A D2 click reveals the bomb although it absorbed nothing.',
  'out-bomb': 'All accounts agree: half the atoms are absorbed by the bomb and the rest reach D1.',
};

export const EXPLAIN = {
  orthodox: {
    'in-none': 'The wave splits at the first beam splitter and travels both arms. At the second beam splitter the two parts add at D1 and cancel at D2. The state collapses when D1 clicks.',
    'out-none': 'With the second beam splitter removed nothing recombines. Each part of the wave heads to one detector, and the state collapses onto whichever detector clicks.',
    'in-marker': 'The marker becomes entangled with the atom’s path. The two parts of the wave are now tied to different marker states, so they no longer interfere at the second beam splitter. Collapse at the detectors then gives D1 and D2 equally. A textbook collapse at the marker gives the same statistics.',
    'out-marker': 'Nothing recombines, so the marker changes nothing here. Collapse happens at whichever detector clicks.',
    'in-bomb': 'The bomb acts as a measurement of the upper arm. Half the time the state collapses onto the upper arm and the bomb absorbs the atom. Otherwise it collapses onto the lower arm, a single part arrives at the second beam splitter, and D1 and D2 are equally likely.',
    'out-bomb': 'Half the time the bomb absorbs the atom. Otherwise the state collapses onto the lower arm, which leads straight to D1.',
  },
  'pilot-wave': {
    'in-none': 'The atom goes through one arm only; the wave goes through both. At the second beam splitter the two parts of the wave recombine and guide the atom to D1, whichever arm it took.',
    'out-none': 'The two wave packets cross, but trajectories cannot cross the symmetry line (they are computed here from the guiding equation). An atom from the upper arm ends at D1, the upper detector, not at D2, where a straight-line reading of the path would send it. Reading the path off the detector is wrong in pilot wave.',
    'in-marker': 'The marker’s pointer is part of the system. In the panel below, the part of the wave with the atom in the upper arm sits at “marker flipped”, the other at “marker ready”. When the atom reaches the second beam splitter the two parts no longer overlap, so the empty part cannot steer the atom: D1 and D2 are each reached half the time.',
    'out-marker': 'Because the two parts of the wave are separated in configuration space, the atom simply goes straight: upper arm to D2, lower arm to D1. Compare with no marker, where it turns back at the crossing.',
    'in-bomb': 'If the atom is in the upper arm, the bomb absorbs it. If it is in the lower arm, only the empty part of the wave reaches the bomb. That part ends up in the “exploded” branch, which is empty, so it can no longer cancel the dark port: the atom reaches D1 or D2 equally. A D2 click means the wave touched the bomb and the atom did not.',
    'out-bomb': 'Atoms in the upper arm are absorbed by the bomb; atoms in the lower arm go straight to D1.',
  },
  'many-worlds': {
    'in-none': 'No record forms inside the interferometer, so there is a single world until a detector fires. The two components recombine at the second beam splitter and only the D1 branch has any weight.',
    'out-none': 'When the detectors fire, the world splits into two branches of equal weight: one where D1 clicked and one where D2 clicked.',
    'in-marker': 'The marker records the path, and the world splits into two branches: marker flipped and marker ready. While the record persists the branches do not interfere, so at the detectors each splits again. D1 and D2 each carry total weight one half.',
    'out-marker': 'The marker splits the world into two branches; in each, the atom reaches one detector.',
    'in-bomb': 'The bomb splits the world. In one branch, of weight one half, it explodes. In the other nothing was absorbed and only the lower component reaches the second beam splitter, so the D1 and D2 branches each get weight one quarter.',
    'out-bomb': 'An explosion branch of weight one half, and an intact branch in which the atom reaches D1.',
  },
  'spontaneous-collapse': {
    'in-none': 'A single atom almost never collapses on its own. Nothing collapses inside the interferometer. When D1 registers the atom, many of its particles move, and collapse follows within microseconds.',
    'out-none': 'No collapse inside the interferometer. When the wave reaches both detectors, their combined state of “clicked” and “not clicked” involves many particles and collapses quickly onto one detector.',
    'in-marker': 'A microscopic marker does not collapse either, but it is entangled with the path, so the interference is lost anyway, exactly as in standard quantum mechanics. Collapse happens at the detectors. With a macroscopic marker (Advanced tab) collapse happens at the marker instead; the statistics are the same.',
    'out-marker': 'Nothing recombines; collapse happens at whichever detector clicks.',
    'in-bomb': 'Exploded and intact bombs differ macroscopically, so collapse quickly picks one. If the bomb stays intact, the upper component is gone; the lower one alone reaches the second beam splitter, and D1 and D2 are equally likely.',
    'out-bomb': 'Collapse at the bomb picks explosion or no explosion. If the bomb stays intact, the atom reaches D1.',
  },
};

export const VIEW_LABEL = {
  orthodox: 'Orthodox',
  'pilot-wave': 'Pilot Wave',
  'many-worlds': 'Many Worlds',
  'spontaneous-collapse': 'Spontaneous Collapse',
};

// Compare mode: one question per setup, answered by each account for the atom shown.
const pathQ = 'Which way did this atom go?';
const pathAnswers = {
  orthodox: 'No fact of the matter: the wave took both arms until a detector clicked.',
  'pilot-wave': ({ arm, result, done }) => done && result !== 'bomb' ? `The ${arm} arm, and it still reached ${result.toUpperCase()}.` : `The ${arm} arm; its wave took both.`,
  'many-worlds': 'Both arms, in a single world; the world splits only when a detector fires.',
  'spontaneous-collapse': 'No fact yet: a single atom almost never collapses. The detector settles it.',
};
const markerQ = 'Why is there no interference, although nobody reads the marker?';
const markerAnswers = {
  orthodox: 'The path is entangled with the marker (or, in textbook terms, the marker measured it).',
  'pilot-wave': 'The two parts of the wave sit at different marker positions, so they cannot overlap and steer the atom together.',
  'many-worlds': 'The record split the world into two branches, and branches do not interfere.',
  'spontaneous-collapse': 'Entanglement removes the interference first; collapse comes later, at a detector or a macroscopic marker.',
};
const bombQ = 'Did the bomb interact with the atom?';
const bombAnswers = {
  orthodox: ({ result, done }) => done && result === 'bomb' ? 'Yes: the state collapsed onto the bomb’s arm and it absorbed the atom.' : 'Not by absorbing it, yet it measured the atom: the state collapsed because nothing happened.',
  'pilot-wave': ({ arm, result }) => result === 'bomb' ? 'Yes: the atom was in the bomb’s arm.' : `No: the atom took the ${arm} arm. Only the empty part of the wave reached the bomb.`,
  'many-worlds': ({ result }) => result === 'bomb' ? 'In this branch, yes: the bomb absorbed the atom.' : 'Not in this branch. In another branch the bomb absorbed the atom and exploded.',
  'spontaneous-collapse': 'Exploded and intact bombs differ macroscopically, so collapse quickly picked one.',
};
export const ANSWERS = {
  'in-none': { q: pathQ, ...pathAnswers },
  'out-none': { q: pathQ, ...pathAnswers },
  'in-marker': { q: markerQ, ...markerAnswers },
  'out-marker': { q: markerQ, ...markerAnswers },
  'in-bomb': { q: bombQ, ...bombAnswers },
  'out-bomb': { q: bombQ, ...bombAnswers },
};
