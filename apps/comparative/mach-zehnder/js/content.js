// Explanations for each setup in each account. Keys: `${bs2 ? 'in' : 'out'}-${object}`.
// All accounts give the same detector statistics; they differ in what they say happens.

export const COMMON = {
  'in-none': 'Calibration: with the second beam splitter in place and nothing in the arms, every atom reaches D1 and D2 never fires. This is how the interferometer is tuned.',
  'out-none': 'All accounts agree: D1 and D2 each fire half the time.',
  'in-marker': 'All accounts agree: D1 and D2 each fire half the time. The marker removes the interference even though nobody reads it.',
  'out-marker': 'All accounts agree: D1 and D2 each fire half the time, exactly as without the marker.',
  'in-bomb': 'All accounts agree: half the atoms are absorbed by the bomb, a quarter reach D1 and a quarter reach D2. A D2 click shows that a live bomb is there, although it absorbed nothing.',
  'out-bomb': 'All accounts agree: half the atoms are absorbed by the bomb and the rest reach D1.',
};

export const EXPLAIN = {
  orthodox: {
    'in-none': 'The wave splits at the first beam splitter and travels both arms. At the second beam splitter the two parts add at D1 and cancel at D2. The state collapses when D1 clicks.',
    'out-none': 'With the second beam splitter removed nothing recombines. Each part of the wave heads to one detector, and the state collapses onto whichever detector clicks.',
    'in-marker': 'The marker becomes entangled with the atom’s path: the two parts of the wave are tied to different marker states, so they no longer interfere at the second beam splitter. This alone removes the interference, whether or not you call it a measurement. Collapse at the detectors then gives D1 and D2 equally.',
    'out-marker': 'Nothing recombines, so the marker changes nothing here. Collapse happens at whichever detector clicks.',
    'in-bomb': 'The bomb acts as a measurement of the upper arm. Half the time the state collapses onto the upper arm and the bomb absorbs the atom. Otherwise it collapses onto the lower arm, a single part arrives at the second beam splitter, and D1 and D2 are equally likely.',
    'out-bomb': 'Half the time the bomb absorbs the atom. Otherwise the state collapses onto the lower arm, which leads straight to D1.',
  },
  'pilot-wave': {
    'in-none': 'The atom goes through one arm only; the wave goes through both. At the second beam splitter the two parts of the wave recombine and guide the atom to D1, whichever arm it took.',
    'out-none': 'The two wave packets cross, but trajectories cannot cross the symmetry line between them (computed here from the guiding equation for two identical packets). So an atom from the upper arm turns back at the crossing and ends at D1, not at D2, where its beam was heading. Reading the path off the detector is wrong in pilot wave.',
    'in-marker': 'The marker is part of the system. In the panel below, the part of the wave with the atom in the upper arm goes with “marker flipped”, the other with “marker ready”. At the second beam splitter the two parts no longer overlap in this combined picture, so the empty part cannot steer the atom: D1 and D2 are each reached half the time.',
    'out-marker': 'The two parts of the wave go with different marker states, so they no longer steer the atom together. The atom goes straight through the crossing: upper arm to D2, lower arm to D1. Without the marker it would turn back at the crossing.',
    'in-bomb': 'If the atom is in the upper arm, the bomb absorbs it. If it is in the lower arm, only the empty part of the wave reaches the bomb. That part becomes tied to an exploded bomb, which is not what happened, so it can no longer cancel the wave at D2: the atom reaches D1 or D2 equally. A D2 click means the wave touched the bomb and the atom did not.',
    'out-bomb': 'Atoms in the upper arm are absorbed by the bomb; atoms in the lower arm go straight to D1, because nothing is left in the upper arm to turn them back.',
  },
  'many-worlds': {
    'in-none': 'Nothing inside the interferometer makes a record, so nothing splits there. The two parts of the wave recombine at the second beam splitter and only D1 has any weight, so even at the detector the world does not split.',
    'out-none': 'When the detectors fire, the world splits into two copies of equal weight: one where D1 clicked and one where D2 clicked.',
    'in-marker': 'The marker records the path, and the world splits into two copies: marker flipped and marker ready. While the record persists the copies do not interfere, so at the detectors each splits again. D1 and D2 each carry total weight one half.',
    'out-marker': 'The marker splits the world into two copies; in each, the atom reaches one detector.',
    'in-bomb': 'The bomb splits the world. In one copy, of weight one half, it explodes. In the other nothing was absorbed and only the lower part of the wave reaches the second beam splitter, so the D1 and D2 copies each get weight one quarter.',
    'out-bomb': 'An explosion copy of weight one half, and an intact copy in which the atom reaches D1.',
  },
  'spontaneous-collapse': {
    'in-none': 'A single atom almost never collapses on its own (about 3.6 million years on average). Nothing collapses inside the interferometer. When D1 registers the atom, about 10²³ of its nucleons move, and collapse follows within about 100 ns.',
    'out-none': 'No collapse inside the interferometer. When the wave reaches both detectors, their combined state of “clicked” and “not clicked” involves many particles and collapses within about 100 ns onto one detector.',
    'in-marker': 'A microscopic marker does not collapse either (it adds only a few nucleons), but it is entangled with the path, so the interference is lost anyway, exactly as in standard quantum mechanics. Collapse happens at the detectors. With a macroscopic marker (Advanced tab) collapse happens at the marker instead; the statistics are the same.',
    'out-marker': 'Nothing recombines, so there is no interference to lose; collapse happens at whichever detector clicks.',
    'in-bomb': 'Exploded and intact bombs differ macroscopically, so collapse picks one within about 100 ns. If the bomb stays intact, the upper part of the wave is gone; the lower one alone reaches the second beam splitter, and D1 and D2 are equally likely.',
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
// Answer functions receive { arm, result, done, pastObject }.
const det = arm => (arm === 'upper' ? 'D2' : 'D1');
const pathQ = 'Which way did this atom go?';
const pathAnswers = {
  orthodox: 'The question has no answer: until a detector clicks the atom has no path, and its wave goes through both arms.',
  'pilot-wave': ({ arm, result, done }) => done && result !== 'bomb' ? `The ${arm} arm, and it reached ${result.toUpperCase()}.` : `The ${arm} arm; its wave took both.`,
  'many-worlds': ({ done }) => done ? 'Both arms, in one world. Only the detector can split it.' : 'Both arms, in one world: nothing inside the interferometer makes a record, so nothing splits there.',
  'spontaneous-collapse': ({ done }) => done ? 'Settled when the detector, with about 10²³ nucleons, registered the atom: collapse within about 100 ns.' : 'No fact yet: a single atom almost never collapses. The detector will settle it.',
};
const markerQ = 'Why is there no interference, although nobody reads the marker?';
const markerAnswers = {
  orthodox: 'The path became entangled with the marker. That alone removes the interference; nobody needs to read the marker.',
  'pilot-wave': 'The two parts of the wave go with different marker states (ready or flipped), so they cannot overlap and steer the atom together.',
  'many-worlds': 'The record split the world into two copies, and the copies do not interfere.',
  'spontaneous-collapse': ({ done }) => done ? 'Entanglement removed the interference; collapse happened later, at the detector.' : 'Entanglement removes the interference without any collapse; a microscopic marker is far too small to collapse.',
};
const markerOutQ = 'Does the marker change which detector clicks?';
const markerOutAnswers = {
  orthodox: 'No. Without the second beam splitter nothing recombines, so each part of the wave reaches its own detector, marker or not.',
  'pilot-wave': ({ arm }) => `Not the statistics, but this atom’s path: from the ${arm} arm it goes straight on to ${det(arm)}. Without the marker it would have turned back at the crossing.`,
  'many-worlds': 'No. The marker splits the world into two copies, and in each the atom reaches one detector.',
  'spontaneous-collapse': 'No. There is no interference to lose; collapse happens at the detector either way.',
};
const bombQ = 'Did the atom touch the bomb?';
const bombAnswers = {
  orthodox: ({ result, pastObject }) => !pastObject ? 'Not yet decided: the bomb will act as a measurement of the upper arm.' : result === 'bomb' ? 'Yes: the state collapsed onto the bomb’s arm and the bomb absorbed the atom.' : 'No, yet the bomb acted as a measurement: the state collapsed onto the lower arm although nothing was absorbed.',
  'pilot-wave': ({ arm, result }) => result === 'bomb' ? 'Yes: the atom was in the bomb’s arm.' : `No: the atom took the ${arm} arm. Only the empty part of the wave reached the bomb.`,
  'many-worlds': ({ result, pastObject }) => !pastObject ? 'Both possibilities are still in one world.' : result === 'bomb' ? 'In this copy, yes: the bomb absorbed the atom.' : 'Not in this copy. In another copy the bomb absorbed the atom and exploded.',
  'spontaneous-collapse': ({ result, pastObject }) => !pastObject ? 'Not yet: the wave has not reached the bomb.' : result === 'bomb' ? 'Yes: collapse picked “exploded” within about 100 ns.' : 'No: collapse picked “intact” within about 100 ns.',
};
export const ANSWERS = {
  'in-none': { q: pathQ, ...pathAnswers },
  'out-none': { q: pathQ, ...pathAnswers },
  'in-marker': { q: markerQ, ...markerAnswers },
  'out-marker': { q: markerOutQ, ...markerOutAnswers },
  'in-bomb': { q: bombQ, ...bombAnswers },
  'out-bomb': { q: bombQ, ...bombAnswers },
};

export const GLOSSARY = [
  ['Entangled', 'The atom’s path and another object (the marker, the bomb) can no longer be described separately: each path goes with its own state of the object.'],
  ['Record', 'A lasting physical difference in some object that depends on which path the atom took, read or not.'],
  ['Collapse', 'In the orthodox and spontaneous-collapse accounts, the sudden change of the wave to one outcome. Orthodox: at a measurement (a postulate). Spontaneous collapse: a physical process, fast only when many particles are involved.'],
  ['Copy of the world', 'Many worlds: after a record, the wave splits into parts that no longer interfere; each part is a separate world. Its weight is the Born-rule probability.'],
  ['Born rule', 'The probability of an outcome is the squared size of the wave for that outcome.'],
  ['Configuration space', 'A combined picture with one axis for the atom’s position and one for the marker or bomb. Pilot wave: two parts of the wave steer the atom together only if they overlap there.'],
  ['Bright and dark port', 'With the interferometer tuned, every atom leaves toward D1 (bright port) and none toward D2 (dark port).'],
];
