// Talbot–Lau interferometer with optical depletion gratings, as in
// S. Pedalino et al., Nature 649, 866 (2026); arXiv:2507.21211v1, Eqs. 1–9.
// SI units throughout. Talbot coefficients are computed numerically from the
// grating transmission (see tests for the cross-check with the closed form, Eq. 5).

export const H = 6.62607015e-34;
export const HBAR = H / (2 * Math.PI);
export const C = 2.99792458e8;
export const EPS0 = 8.8541878128e-12;
export const AMU = 1.66053906660e-27;
export const M_NA = 22.98977 * AMU;
const R_WS_NA = 2.08e-10; // Wigner–Seitz radius of sodium, for the cluster diameter

// Values from the paper, Methods. WAIST: vertical beam heights of the three
// grating beams (H1, H2, H3); see the Physics tab for why these enter Eqs. 3–4.
export const PAPER = Object.freeze({
  d: 133e-9, lambdaL: 266e-9, L: 0.983,
  waist: [620e-6, 575e-6, 575e-6],
  alphaVolPerAtom: -4.5e-30, // m^3: alpha_266 / (4 pi eps0) per atom
  scale: 0.78,
  fig2a: { P: [0.062, 0.0152, 0.068], massKDa: 172, v: 160, sigmaV: 10, dmRel: 0.32 },
});

export const sigmaIon = (mKDa) => Math.max(0, (0.537 * mKDa - 1.5) * 1e-20); // m^2
export const atomsIn = (mKDa) => (mKDa * 1e3 * AMU) / M_NA;
export const diameter = (mKDa) => 2 * R_WS_NA * Math.cbrt(atomsIn(mKDa));
export const deBroglie = (mKDa, v) => H / (mKDa * 1e3 * AMU * v);
export const talbotLength = (mKDa, v, d = PAPER.d) => (mKDa * 1e3 * AMU * v * d * d) / H;

// Mean number of ionising photons absorbed by a cluster crossing an antinode (Eq. 3).
export function n0(P, mKDa, v, wy, lambdaL = PAPER.lambdaL) {
  return (8 * sigmaIon(mKDa) * P * lambdaL) / (Math.sqrt(2 * Math.PI) * H * C * wy * v);
}
// Eikonal phase at an antinode (Eq. 4). Negative: sodium clusters are pushed out of the light at 266 nm.
export function phi0(P, mKDa, v, wy, alphaVol = PAPER.alphaVolPerAtom) {
  const alpha = 4 * Math.PI * EPS0 * alphaVol * atomsIn(mKDa);
  return (Math.sqrt(8 / Math.PI) * alpha * P) / (HBAR * C * EPS0 * wy * v);
}

const NTH = 256;
const COS = new Float64Array(NTH), SIN = new Float64Array(NTH);
for (let k = 0; k < NTH; k++) { COS[k] = Math.cos((2 * Math.PI * k) / NTH); SIN[k] = Math.sin((2 * Math.PI * k) / NTH); }

// zeta_coh and zeta_ion at Talbot parameter xi (Eqs. 6–7), or their classical limits (Eqs. 8–9).
export function zetas(n0v, phi0v, xi, classical) {
  return classical
    ? { zc: phi0v * Math.PI * xi, zi: n0v / 2 }
    : { zc: phi0v * Math.sin(Math.PI * xi), zi: (n0v / 2) * Math.cos(Math.PI * xi) };
}

// Fourier coefficients B_n, n in ns, of e^{-n0/2} exp(-zi cos th + i zc sin th).
// Returns [re, im] pairs. Exponents are combined before exp() to avoid overflow.
export function talbotB(ns, n0v, phi0v, xi, classical) {
  const { zc, zi } = zetas(n0v, phi0v, xi, classical);
  const out = ns.map(() => [0, 0]);
  for (let k = 0; k < NTH; k++) {
    const mag = Math.exp(-n0v / 2 - zi * COS[k]);
    const ph = zc * SIN[k];
    for (let j = 0; j < ns.length; j++) {
      const a = ph - (2 * Math.PI * ns[j] * k) / NTH; // e^{i(ph - n th)}
      out[j][0] += mag * Math.cos(a);
      out[j][1] += mag * Math.sin(a);
    }
  }
  for (const b of out) { b[0] /= NTH; b[1] /= NTH; }
  return out;
}

const cmul = (a, b) => [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]];

// Fringe Fourier coefficients S_l, l = 0..lmax (Eq. 2) for one mass and velocity.
// p: { P: [P1,P2,P3], waist: [w1,w2,w3], L, d }
export function fringeCoefficients(p, mKDa, v, classical, lmax = 1) {
  const LT = talbotLength(mKDa, v, p.d);
  const g = [0, 1, 2].map((i) => ({ n0: n0(p.P[i], mKDa, v, p.waist[i]), phi0: phi0(p.P[i], mKDa, v, p.waist[i]) }));
  const ls = Array.from({ length: lmax + 1 }, (_, l) => l);
  const b1 = talbotB(ls.map((l) => -l), g[0].n0, g[0].phi0, 0, classical);
  const b3 = talbotB(ls, g[2].n0, g[2].phi0, 0, classical);
  return ls.map((l) => {
    const [b2] = talbotB([2 * l], g[1].n0, g[1].phi0, (l * p.L) / LT, classical);
    return cmul(cmul(b1[l], b2), b3[l]);
  });
}

// Grids for the velocity (Gaussian, ±3σ) and mass (flat window of relative width dmRel) averages.
export function averagingGrid({ v, sigmaV, massKDa, dmRel }, nv = 21, nm = 11) {
  const pts = [];
  const vs = sigmaV > 0 ? Array.from({ length: nv }, (_, i) => v - 3 * sigmaV + (6 * sigmaV * i) / (nv - 1)) : [v];
  const ms = dmRel > 0 ? Array.from({ length: nm }, (_, i) => massKDa * (1 - dmRel / 2 + (dmRel * i) / (nm - 1))) : [massKDa];
  for (const vv of vs) {
    const w = sigmaV > 0 ? Math.exp(-0.5 * ((vv - v) / sigmaV) ** 2) : 1;
    for (const mm of ms) pts.push({ v: vv, m: mm, w });
  }
  return pts;
}

// Averaged S_l, l = 0..lmax.
export function averagedCoefficients(p, beam, classical, lmax = 1, nv = 21, nm = 11) {
  const acc = Array.from({ length: lmax + 1 }, () => [0, 0]);
  let wsum = 0;
  for (const pt of averagingGrid(beam, nv, nm)) {
    const S = fringeCoefficients(p, pt.m, pt.v, classical, lmax);
    for (let l = 0; l <= lmax; l++) { acc[l][0] += pt.w * S[l][0]; acc[l][1] += pt.w * S[l][1]; }
    wsum += pt.w;
  }
  return acc.map(([re, im]) => [re / wsum, im / wsum]);
}

// Sinusoidal visibility V = 2|S1|/S0, times an overall contrast factor (the paper uses 0.78).
export function visibility(p, beam, classical, scale = 1, nv = 21, nm = 11) {
  const [S0, S1] = averagedCoefficients(p, beam, classical, 1, nv, nm);
  return (scale * 2 * Math.hypot(S1[0], S1[1])) / Math.hypot(S0[0], S0[1]);
}

// Relative count rate at G3 offset x (Eq. 1), normalised to mean 1, with higher harmonics.
// The contrast factor s is modelled as Gaussian smearing of the fringes (vibration, phase
// averaging): harmonic l is multiplied by s^(l^2), so the first harmonic gets exactly s.
export function fringeProfile(S, xs, d, scale = 1) {
  const S0 = S[0][0];
  return xs.map((x) => {
    let s = S0;
    for (let l = 1; l < S.length; l++) {
      const a = (2 * Math.PI * l * x) / d;
      s += 2 * scale ** (l * l) * (S[l][0] * Math.cos(a) - S[l][1] * Math.sin(a));
    }
    return s / S0;
  });
}

// Unweighted least-squares fit y = a + b cos(kx) + c sin(kx). With points spread evenly over
// whole periods this picks out the first Fourier harmonic exactly, whatever the higher ones.
// Returns the visibility and its 1σ error for Poisson counts (variance y_i).
export function fitSine(xs, ys, d) {
  const k = (2 * Math.PI) / d;
  const A = [[0, 0, 0], [0, 0, 0], [0, 0, 0]], Bm = [[0, 0, 0], [0, 0, 0], [0, 0, 0]], r = [0, 0, 0];
  for (let i = 0; i < xs.length; i++) {
    const f = [1, Math.cos(k * xs[i]), Math.sin(k * xs[i])];
    for (let a = 0; a < 3; a++) {
      r[a] += f[a] * ys[i];
      for (let b = 0; b < 3; b++) { A[a][b] += f[a] * f[b]; Bm[a][b] += f[a] * f[b] * Math.max(1, ys[i]); }
    }
  }
  const inv0 = invert3(A);
  if (!inv0) return null;
  const p = [0, 1, 2].map((a) => inv0[a][0] * r[0] + inv0[a][1] * r[1] + inv0[a][2] * r[2]);
  const mm = (X, Y) => X.map((row) => [0, 1, 2].map((j) => row[0] * Y[0][j] + row[1] * Y[1][j] + row[2] * Y[2][j]));
  const inv = mm(mm(inv0, Bm), inv0); // covariance of the fitted parameters
  const amp = Math.hypot(p[1], p[2]);
  const V = amp / p[0];
  // error propagation for V = sqrt(b^2+c^2)/a
  const g = amp > 0 ? [-amp / p[0] ** 2, p[1] / (amp * p[0]), p[2] / (amp * p[0])] : [0, 0, 0];
  let varV = 0;
  for (let a = 0; a < 3; a++) for (let b = 0; b < 3; b++) varV += g[a] * inv[a][b] * g[b];
  return { V, dV: Math.sqrt(Math.max(0, varV)), mean: p[0], phase: Math.atan2(-p[2], p[1]) };
}

function invert3(m) {
  const [[a, b, c], [d, e, f], [g, h, i]] = m;
  const A = e * i - f * h, B = -(d * i - f * g), Cc = d * h - e * g;
  const det = a * A + b * B + c * Cc;
  if (!Number.isFinite(det) || Math.abs(det) < 1e-300) return null;
  return [
    [A / det, -(b * i - c * h) / det, (b * f - c * e) / det],
    [B / det, (a * i - c * g) / det, -(a * f - c * d) / det],
    [Cc / det, -(a * h - b * g) / det, (a * e - b * d) / det],
  ];
}

// Poisson sample (Knuth for small means, normal approximation for large).
export function poisson(mean, rand = Math.random) {
  if (mean <= 0) return 0;
  if (mean > 60) return Math.max(0, Math.round(mean + Math.sqrt(mean) * gauss(rand)));
  const L = Math.exp(-mean); let k = 0, p = 1;
  do { k++; p *= rand(); } while (p > L);
  return k - 1;
}
function gauss(rand) {
  let u = 0; while (u === 0) u = rand();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * rand());
}
