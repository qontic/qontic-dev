// Cluster-by-cluster simulation. Every count in the app comes from a cluster drawn here.
//
// Each cluster is a full sample of the beam: its speed and mass are drawn from the same grid
// and weights used for the averaged predictions (talbot.js averagingGrid), weighted by the
// probability of passing G1; its start point x0 is drawn from the G1 intensity transmission.
// Its position at G2 is uniform (the point-source wave has uniform density there) over an
// integer number of periods, so the ensemble is exactly periodic. It survives G2 with
// probability |t2(x2)|^2. Its position at G3 comes from
//   - 'pilot-wave': the guided trajectory (wave.js trajectory);
//   - 'sampled': a draw from |psi(x, 2L)|^2 of its own wave (Orthodox, Many-Worlds);
//   - 'classical': a straight line bent at G2 by the optical dipole force (the classical model).
// The paper's contrast factor s is applied as a Gaussian transverse jitter of the G3 position
// (vibrations, phase averaging): sigma_j = sqrt(2 ln(1/s)) d / (2 pi), which multiplies the
// l-th fringe harmonic by s^(l^2), the model used for the predicted profiles.
// The cluster is counted with probability |t3(x3 - offset)|^2.

import { PAPER, averagingGrid, talbotB } from './talbot.js';
import { makeSetup, makeCluster, densityAfterG2, intensityTransmission, trajectory } from './wave.js';

const TWO_PI = 2 * Math.PI;

export function buildEnsemble({ P, L = PAPER.L, d = PAPER.d }, beam, scale = 1, nv = 21, nm = 11) {
  const pts = averagingGrid(beam, nv, nm).map((pt) => {
    const setup = makeSetup({ massKDa: pt.m, v: pt.v, P, L, d });
    const [[pass1]] = talbotB([0], setup.g[0].n0, setup.g[0].phi0, 0, false); // mean |t1|^2
    return { setup, w: pt.w * pass1 };
  });
  const cum = []; let acc = 0;
  for (const p of pts) cum.push((acc += p.w));
  return { pts, cum, total: acc, d, L, jitter: scale < 1 ? (Math.sqrt(2 * Math.log(1 / scale)) * d) / TWO_PI : 0 };
}

export function gauss(rand) {
  let u = 0; while (u === 0) u = rand();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(TWO_PI * rand());
}

// Draw a cluster up to G2. xc: centre of the G1 opening; band: half-width of the G2 band (multiple of d).
export function drawCluster(ens, rand, xc = PAPER.d / 2, band = 2 * PAPER.d) {
  const u = rand() * ens.total;
  let lo = 0, hi = ens.cum.length - 1;
  while (lo < hi) { const mid = (lo + hi) >> 1; if (ens.cum[mid] < u) lo = mid + 1; else hi = mid; }
  const setup = ens.pts[lo].setup, d = ens.d;
  let x0;
  do { x0 = xc - d / 2 + rand() * d; } while (rand() > intensityTransmission(x0, setup.g[0].n0, d));
  // Every G1 opening is equivalent. The wave of one cluster repeats with period 2d at G3, so
  // the start point is drawn from two neighbouring openings, or arrivals folded over two
  // periods would keep a spurious 2d structure. (The mask has period d and is unaffected.)
  if (rand() < 0.5) x0 += d;
  const x2 = xc - band + rand() * 2 * band;
  const g2 = rand() <= intensityTransmission(x2, setup.g[1].n0, d);
  return { setup, x0, x2, g2 };
}

// Position at G3 of a cluster that passed G2.
export function positionAtG3(c, mode, rand, steps = 120) {
  const st = c.setup, L = st.L, d = st.d;
  if (mode === 'classical') {
    // straight from x0 to x2; G2's dipole force adds slope -(phi0 pi / (k d)) sin(2 pi x2 / d)
    const slope = (c.x2 - c.x0) / L - ((st.g[1].phi0 * Math.PI) / (st.k * d)) * Math.sin((TWO_PI * c.x2) / d);
    return { x3: c.x2 + slope * L, pts: [[0, c.x0], [L, c.x2], [2 * L, c.x2 + slope * L]] };
  }
  const cl = makeCluster(st, c.x0);
  if (mode === 'pilot-wave') {
    const tr = trajectory(st, cl, c.x2, { steps, rand: () => 0 }); // survival handled by the caller
    return { x3: tr.pts[tr.pts.length - 1][1], pts: tr.pts };
  }
  // sampled from |psi(x, 2L)|^2, which is periodic in x with period 2d
  const n = 96, xs = [], cum = []; let acc = 0;
  for (let i = 0; i < n; i++) { const x = c.x0 + ((i + 0.5) * 2 * d) / n; xs.push(x); acc += densityAfterG2(st, cl, x, L); cum.push(acc); }
  const r = rand() * acc; let i = cum.findIndex((v) => v >= r); if (i < 0) i = n - 1;
  let x3 = xs[i] + (rand() - 0.5) * ((2 * d) / n);
  // place it in the period nearest the straight-line continuation, for display
  const guess = 2 * c.x2 - c.x0;
  x3 += 2 * d * Math.round((guess - x3) / (2 * d));
  return { x3, pts: null };
}

// Complete fate of one cluster at G3 offset x3off.
export function runCluster(ens, mode, x3off, rand, opts = {}) {
  const c = drawCluster(ens, rand, opts.xc, opts.band);
  if (!c.g2) return { ...c, fate: 'G2' };
  const { x3, pts } = positionAtG3(c, mode, rand, opts.steps);
  const xj = x3 + (ens.jitter ? ens.jitter * gauss(rand) : 0);
  const counted = rand() <= intensityTransmission(xj - x3off, c.setup.g[2].n0, c.setup.d);
  return { ...c, x3, xj, pts, fate: counted ? 'counted' : 'G3' };
}
