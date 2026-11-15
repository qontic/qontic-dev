// The wave of one cluster through the three gratings, in the paraxial approximation.
// x: transverse coordinate (m). z: distance from G1 (m); G2 at z = L, G3 at z = 2L.
// Free propagation over z is free Schrödinger evolution in x with time t = z/v.
//
// The beam reaching G1 has a transverse coherence width of about 0.05 nm, far below the
// period d = 133 nm. Each cluster therefore leaves G1 as a point-source wave from one
// position x0, and the beam is an incoherent mixture over x0 weighted by the G1 intensity
// transmission |t1(x0)|^2. Between G1 and G2 the wave is the paraxial point-source wave
//   psi = exp[i k (x - x0)^2 / (2z)] / sqrt(z).
// G2 multiplies it by t2(x) = sum_n b_n exp(i n g x), g = 2 pi / d. Each term is again a
// point-source wave, from a virtual source at x_n = x0 - n lambda L / d a distance L behind
// G2, so behind G2 (s = z - L, R = L + s) the wave is exactly
//   psi = R^{-1/2} sum_n b_n exp(i n g x0 - i n^2 g^2 L / (2k)) exp[i k (x - x_n)^2 / (2R)].
// The guidance velocity of pilot-wave theory, dx/dz = (1/k) Im(d_x psi / psi), follows in
// closed form from the same sum.

import { deBroglie, n0, phi0, PAPER } from './talbot.js';

const TWO_PI = 2 * Math.PI;

// Complex amplitude transmission of an optical depletion grating, antinodes at x = 0 (mod d).
export function transmission(x, n0v, phi0v, d = PAPER.d) {
  const c2 = Math.cos((Math.PI * x) / d) ** 2;
  const mag = Math.exp((-n0v / 2) * c2);
  return [mag * Math.cos(phi0v * c2), mag * Math.sin(phi0v * c2)];
}
export const intensityTransmission = (x, n0v, d = PAPER.d) => Math.exp(-n0v * Math.cos((Math.PI * x) / d) ** 2);

// Fourier coefficients b_n, |n| <= K, of t(x) over one period; small ones dropped.
export function gratingCoefficients(n0v, phi0v, K = 60, M = 512) {
  const out = [];
  for (let n = -K; n <= K; n++) {
    let re = 0, im = 0;
    for (let j = 0; j < M; j++) {
      const u = j / M; // x / d
      const c2 = Math.cos(Math.PI * u) ** 2;
      const mag = Math.exp((-n0v / 2) * c2), ph = phi0v * c2 - TWO_PI * n * u;
      re += mag * Math.cos(ph); im += mag * Math.sin(ph);
    }
    re /= M; im /= M;
    if (Math.hypot(re, im) > 1e-9) out.push({ n, re, im });
  }
  return out;
}

// Physical setup for one mass and speed.
export function makeSetup({ massKDa, v, P, L = PAPER.L, d = PAPER.d, waist = PAPER.waist }) {
  const lambda = deBroglie(massKDa, v);
  const g = [0, 1, 2].map((i) => ({ n0: n0(P[i], massKDa, v, waist[i]), phi0: phi0(P[i], massKDa, v, waist[i]) }));
  return { lambda, k: TWO_PI / lambda, L, d, g, b2: gratingCoefficients(g[1].n0, g[1].phi0) };
}

// The wave of a cluster leaving G1 at x0: virtual sources and their complex weights.
export function makeCluster(setup, x0) {
  const { k, L, d, lambda, b2 } = setup;
  const gk = TWO_PI / d;
  const terms = b2.map(({ n, re, im }) => {
    const ph = n * gk * x0 - (n * n * gk * gk * L) / (2 * k);
    const c = Math.cos(ph), s = Math.sin(ph);
    return { dx: (n * lambda * L) / d, re: re * c - im * s, im: re * s + im * c }; // dx = x0 - x_n
  });
  return { x0, terms };
}

// psi behind G2 (s >= 0), without the common factor exp[i k (x - x0)^2 / (2R)].
// Returns { re, im, R }. |psi|^2 = (re^2 + im^2) / R.
export function psiAfterG2(setup, cl, x, s) {
  const R = setup.L + s, k = setup.k, X = x - cl.x0;
  let re = 0, im = 0;
  for (const t of cl.terms) {
    // k[(x - x_n)^2 - (x - x0)^2] / (2R) with x - x_n = X + dx
    const ph = (k * t.dx * (2 * X + t.dx)) / (2 * R);
    const c = Math.cos(ph), sn = Math.sin(ph);
    re += t.re * c - t.im * sn; im += t.re * sn + t.im * c;
  }
  return { re, im, R };
}
export function densityAfterG2(setup, cl, x, s) {
  const p = psiAfterG2(setup, cl, x, s);
  return (p.re * p.re + p.im * p.im) / p.R;
}

// Pilot-wave slope dx/dz behind G2.
export function slopeAfterG2(setup, cl, x, s) {
  const R = setup.L + s, k = setup.k, X = x - cl.x0;
  let re = 0, im = 0, wr = 0, wi = 0;
  for (const t of cl.terms) {
    const ph = (k * t.dx * (2 * X + t.dx)) / (2 * R);
    const c = Math.cos(ph), sn = Math.sin(ph);
    const ar = t.re * c - t.im * sn, ai = t.re * sn + t.im * c;
    re += ar; im += ai; wr += ar * t.dx; wi += ai * t.dx;
  }
  const den = re * re + im * im;
  if (den < 1e-300) return X / R;
  // Re[(sum w dx) / (sum w)]
  return X / R + (wr * re + wi * im) / den / R;
}

// One pilot-wave trajectory. The cluster leaves G1 at x0 and reaches G2 at x2 on a straight
// line (the point-source wave has dx/dz = (x - x0)/z). It survives G2 with probability
// |t2(x2)|^2 and G3 (offset x3) with probability |t3(x - x3)|^2: an effective absorption rule.
export function trajectory(setup, cl, x2, { x3 = 0, steps = 160, rand = Math.random } = {}) {
  const { L, d, g } = setup;
  const pts = [[0, cl.x0], [L, x2]];
  if (rand() > intensityTransmission(x2, g[1].n0, d)) return { pts, fate: 'G2' };
  const h = L / steps;
  let x = x2;
  for (let i = 0; i < steps; i++) {
    const s = i * h;
    const k1 = slopeAfterG2(setup, cl, x, s);
    const k2 = slopeAfterG2(setup, cl, x + (h / 2) * k1, s + h / 2);
    const k3 = slopeAfterG2(setup, cl, x + (h / 2) * k2, s + h / 2);
    const k4 = slopeAfterG2(setup, cl, x + h * k3, s + h);
    x += (h / 6) * (k1 + 2 * k2 + 2 * k3 + k4);
    pts.push([L + s + h, x]);
  }
  const survived = rand() <= intensityTransmission(x - x3, g[2].n0, d);
  return { pts, fate: survived ? 'counted' : 'G3', xEnd: x };
}

// Ensemble density at z = 2L, summed incoherently over source points x0 in one G1 period.
export function ensembleDensityAtG3(setup, xs, nx0 = 48) {
  const out = new Float64Array(xs.length);
  const { d, g, L } = setup;
  for (let j = 0; j < nx0; j++) {
    const x0 = ((j + 0.5) * d) / nx0;
    const w = intensityTransmission(x0, g[0].n0, d);
    const cl = makeCluster(setup, x0);
    for (let i = 0; i < xs.length; i++) out[i] += w * densityAfterG2(setup, cl, xs[i], L);
  }
  return out;
}
