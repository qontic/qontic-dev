import { Experiment } from './physics.js';
import { ObstacleExperiment } from './obstacle-gpu.js?v=5';

export const SCENES = Object.freeze({
  free: Object.freeze({ label: 'Without barrier', filename: 'without-barrier', classicality: 0, angle: 45,
    heading: 'REFLECTING BOX', note: 'Try both ends of the slider. Where does the gold trajectory come closest to the cyan path?' }),
  barrier: Object.freeze({ label: 'With barrier', filename: 'with-barrier', classicality: 0.3, angle: 0,
    heading: 'KNIFE-EDGE DIFFRACTION', note: 'Watch the wave spread past the edge. Can a gold trajectory bend into the shadow of the barrier?' }),
});

export const sceneKey = obstacle => obstacle ? 'barrier' : 'free';

// Live playback and recording must select the same solver and calibration.
// The free scene retains the original separable solver and its full endpoint.
export function createExperiment(gl, settings) {
  return settings.obstacle ? new ObstacleExperiment(gl, settings) : new Experiment(settings);
}
