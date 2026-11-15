import { parameters } from './physics.js';

// Illustrative calibration: a 100 nm length unit and one electron mass
// at Classicality = 0. Keep the simulation itself in model units.
const electronMassKg = 9.1093837139e-31;
const hbarJs = 1.054571817e-34;
export const lengthUnitNm = 100;
const lengthUnitM = lengthUnitNm * 1e-9;
const referenceAlpha = parameters(0).alpha;

export const timeUnitPs = 1e12 * referenceAlpha * lengthUnitM ** 2 * electronMassKg / hbarJs;
export const massInElectronUnits = alpha => referenceAlpha / alpha;
export const formatDistance = distanceNm => `${Number(distanceNm.toPrecision(3))} nm`;
