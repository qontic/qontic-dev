// The slit geometry: one plain data object, built here and nowhere else, read by
// both engines. Neither engine holds a geometry constant of its own.
//
// Lengths are in the model unit, 100 nm. x runs from the source plane (x = 0) to
// the wall and the screen; y is measured from the axis, positive downwards (slit 1
// at the top). The object is frozen: to change the geometry, build a new one.
//
// What each engine takes from it:
//  - analytical (paraxial): wall, screen, the open slits' centres, weights and
//    slitSigma, maskBound, detectors. Its wall is the thin-mask limit, so it
//    ignores wallThickness and apertureLayer.
//  - numerical (grid): the same, plus openingHalf (hard-edged slits), wallThickness
//    (reflecting wall), absorbingWallThickness (absorbing wall) and apertureLayer
//    (thickness of the absorbing layer that carries the analytical Gaussian mask).

export const MODEL_UNIT_NM = 100;

// Physical thicknesses used only by the numerical engine (nm). The analytical
// engine treats the wall as an infinitely thin mask.
const WALL_THICKNESS_NM = 12.5;      // reflecting wall (hard-edged openings)
const ABSORBING_WALL_THICKNESS_NM = 60;   // absorbing wall: 1.2 wavelengths at 50 nm, as the 30-step wall of the numerical N-slit app (λ = 25 steps)
const APERTURE_LAYER_NM = 100;       // absorbing layer that carries the analytical Gaussian mask (>= 2 wavelengths for lambda <= 50 nm)

// Largest value of the summed Gaussian mask, so that T(y) <= 1 (same algorithm as the
// analytical model before this module: closed form for two slits, scan + golden
// section for more).
function maskBound(centers, weights, sigma) {
  if (weights.length < 2) return weights[0] || 1;
  if (weights.length === 2) {
    const high = Math.max(...weights), low = Math.min(...weights);
    return high + low * Math.exp(-((centers[1] - centers[0]) ** 2) / (16 * sigma * sigma));
  }
  const mask = y => { let s = 0; for (let j = 0; j < centers.length; j++) s += weights[j] * Math.exp(-((y - centers[j]) ** 2) / (4 * sigma * sigma)); return s; };
  const lo = Math.min(...centers) - 2 * sigma, hi = Math.max(...centers) + 2 * sigma, step = sigma / 4;
  let bestY = lo, best = -1;
  for (let y = lo; y <= hi + 1e-12; y += step) { const v = mask(y); if (v > best) { best = v; bestY = y; } }
  let a = bestY - step, b = bestY + step; const g = (Math.sqrt(5) - 1) / 2;
  let c = b - g * (b - a), d = a + g * (b - a), fc = mask(c), fd = mask(d);
  for (let i = 0; i < 40; i++) { if (fc > fd) { b = d; d = c; fd = fc; c = b - g * (b - a); fc = mask(c); } else { a = c; c = d; fc = fd; d = a + g * (b - a); fd = mask(d); } }
  return Math.max(best, fc, fd) * (1 + 1e-4);
}

function deepFreeze(o) { Object.values(o).forEach(v => { if (v && typeof v === "object") deepFreeze(v); }); return Object.freeze(o); }

// states[k]: 'open' | 'closed' | 'detector' for k = 0 … numSlits-1 (detector slits are open).
// openWeights: transmission factors of the open slits, in slit order (default 1).
export function buildSlitGeometry({ numSlits, states, separationNm, slitSigmaNm, extentSigma, sourceToWallNm, wallToScreenNm, screenHeightNm, openWeights = null }) {
  const u = MODEL_UNIT_NM, d = separationNm / u;
  const slits = [];
  for (let k = 0; k < numSlits; k++) slits.push({ id: k, center: (2 * k - (numSlits - 1)) * separationNm / (2 * u), state: states[k] || "open" });
  const open = slits.filter(s => s.state !== "closed");
  const weights = open.map((_, i) => openWeights?.[i] ?? 1);
  open.forEach((s, i) => { s.weight = weights[i]; });
  const slitSigma = slitSigmaNm / u;
  return deepFreeze({
    unit: u,
    source: 0,
    wall: sourceToWallNm / u,
    screen: (sourceToWallNm + wallToScreenNm) / u,
    screenHalf: screenHeightNm / (2 * u),
    separation: d,
    slitSigma,
    extentSigma,
    openingHalf: extentSigma * slitSigma,
    wallThickness: WALL_THICKNESS_NM / u,
    absorbingWallThickness: ABSORBING_WALL_THICKNESS_NM / u,
    apertureLayer: APERTURE_LAYER_NM / u,
    slits,
    open: { ids: open.map(s => s.id), centers: open.map(s => s.center), weights },
    detectorIds: open.filter(s => s.state === "detector").map(s => s.id),
    maskBound: maskBound(open.map(s => s.center), weights, slitSigma),
  });
}

// Gaussian mask transmission T(y) (amplitude) of a geometry object.
export function maskTransmission(y, g) {
  let s = 0;
  for (let j = 0; j < g.open.centers.length; j++) s += g.open.weights[j] * Math.exp(-((y - g.open.centers[j]) ** 2) / (4 * g.slitSigma * g.slitSigma));
  return s / g.maskBound;
}
