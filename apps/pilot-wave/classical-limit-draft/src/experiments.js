import { Experiment } from './physics.js';
import { ObstacleExperiment } from './obstacle-gpu.js';

export const SCENES = Object.freeze({
  free: Object.freeze({ label: 'Without barrier', filename: 'without-barrier', classicality: 0, angle: 45,
    heading: 'REFLECTING BOX', note: 'The full classical range, with a compact packet and gentler spreading.' }),
  barrier: Object.freeze({ label: 'With barrier', filename: 'with-barrier', classicality: 0.3, angle: 0,
    heading: 'KNIFE-EDGE DIFFRACTION', note: 'Diffraction around a knife edge, with its own classical range.' }),
});

export const sceneKey = obstacle => obstacle ? 'barrier' : 'free';

// Live playback and recording must select the same solver and calibration.
// The free scene retains the original separable solver and its full endpoint.
export function createExperiment(gl, settings) {
  return settings.obstacle ? new ObstacleExperiment(gl, settings) : new Experiment(settings);
}
