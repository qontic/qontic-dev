// Weak position measurement followed by a strong position measurement,
// behind the analytical double slit (Wiseman's protocol).
//
// Units: hbar = m = 1, lengths in units of 100 nm, as in the analytical
// double-slit app. Paraxial model: the transverse wave obeys
// i d/dtau psi = -1/2 d^2/dy^2 psi with tau = (x - wall)/k.
//
// Behind the wall the transverse wave is a finite sum of complex Gaussians.
// Every term is stored as exp(-alpha y^2 + beta y + gamma), complex alpha,
// beta, gamma. Free propagation, multiplication by the pointer coupling and
// the weak-limit weak value are all closed form for such terms, so no wave
// equation is solved numerically.
import {sourceCoefficients} from '../../double-slit-analytical/js/source-packet-model.js?cache=20261101';

// ------------------------------------------------------------ complex helpers
const C = (re, im = 0) => ({re, im});
const add = (a, b) => C(a.re + b.re, a.im + b.im);
const sub = (a, b) => C(a.re - b.re, a.im - b.im);
const mul = (a, b) => C(a.re * b.re - a.im * b.im, a.re * b.im + a.im * b.re);
const div = (a, b) => {const d = b.re * b.re + b.im * b.im; return C((a.re * b.re + a.im * b.im) / d, (a.im * b.re - a.re * b.im) / d);};
const scale = (a, s) => C(a.re * s, a.im * s);
const clog = a => C(Math.log(Math.hypot(a.re, a.im)), Math.atan2(a.im, a.re));
const I = C(0, 1);

// ------------------------------------------------------------ geometry
// Defaults are those of the analytical double-slit app (nm).
export const DEFAULT_GEOMETRY = Object.freeze({
  wavelength: 50, slitWidth: 30, separation: 300, wall: 225, distance: 1000, sourceWidth: 200,
});

export function modelParams(g = DEFAULT_GEOMETRY) {
  return {
    sy: g.slitWidth / 100,
    k: 2 * Math.PI * 100 / g.wavelength,
    wall: g.wall / 100,
    screen: (g.wall + g.distance) / 100,
    sourceSigma: g.sourceWidth / 100,
    centers: [-g.separation / 200, g.separation / 200],
    apertureWeights: [1, 1],
    slits: 2,
  };
}

// Terms just behind the wall, from the double-slit app's own coefficients.
// There each term is c exp(-A q^2 + B q), q = y - y_j. Expand about y = 0.
export function wallTerms(p) {
  return sourceCoefficients(p).map(a => {
    const A = C(a.ar, a.ai), B = C(a.br, a.bi), y0 = a.center;
    const alpha = A;
    const beta = add(scale(A, 2 * y0), B);
    const gamma = add(clog(C(a.cr, a.ci)), sub(scale(A, -y0 * y0), scale(B, y0)));
    return {alpha, beta, gamma};
  });
}

// Exact free propagation for a time tau >= 0.
export function propagate(terms, tau) {
  if (tau === 0) return terms.map(t => ({...t}));
  return terms.map(({alpha, beta, gamma}) => {
    const D = add(C(1), mul(scale(I, 2 * tau), alpha));
    return {
      alpha: div(alpha, D),
      beta: div(beta, D),
      gamma: add(gamma, sub(div(mul(scale(I, tau / 2), mul(beta, beta)), D), scale(clog(D), 0.5))),
    };
  });
}

function exponent({alpha, beta, gamma}, y) {
  return C(-alpha.re * y * y + beta.re * y + gamma.re, -alpha.im * y * y + beta.im * y + gamma.im);
}

// psi, d psi / dy at y.
export function evaluate(terms, y) {
  let re = 0, im = 0, dre = 0, dim = 0;
  for (const t of terms) {
    const e = exponent(t, y), m = Math.exp(e.re);
    if (m === 0) continue;
    const vr = m * Math.cos(e.im), vi = m * Math.sin(e.im);
    // derivative factor: -2 alpha y + beta
    const fr = -2 * t.alpha.re * y + t.beta.re, fi = -2 * t.alpha.im * y + t.beta.im;
    re += vr; im += vi; dre += fr * vr - fi * vi; dim += fr * vi + fi * vr;
  }
  return {re, im, dre, dim, rho: re * re + im * im};
}

export function density(terms, y) {return evaluate(terms, y).rho;}

// Guidance (current) velocity Im(psi'/psi) = j/rho, in units of y per tau.
export function currentVelocity(terms, y) {
  const g = evaluate(terms, y);
  return g.rho > 1e-300 ? (g.re * g.dim - g.im * g.dre) / g.rho : 0;
}

// Impulsive von Neumann coupling of the system position y to a pointer
// (ancilla) with Gaussian ready state of width sw: psi(y) phi(Y - y).
// For a fixed pointer value Y the system part is again a sum of Gaussians.
export function coupleToPointer(terms, Y, sw) {
  const s2 = sw * sw;
  const norm = -0.25 * Math.log(2 * Math.PI * s2);
  return terms.map(({alpha, beta, gamma}) => ({
    alpha: add(alpha, C(1 / (4 * s2))),
    beta: add(beta, C(Y / (2 * s2))),
    gamma: add(gamma, C(norm - Y * Y / (4 * s2))),
  }));
}

// Weak-limit (sw -> infinity) real weak value of the earlier position y,
// post-selected on the strong result yf after a time dtau.
//   <y>_w = <yf| U(dtau) y |psi> / <yf| U(dtau) |psi>.
// y times a Gaussian term is d/dbeta of the term; propagation commutes with it.
export function weakValueLimit(terms1, dtau, yf) {
  let nr = 0, ni = 0, dr = 0, di = 0;
  for (const t of terms1) {
    const D = add(C(1), mul(scale(I, 2 * dtau), t.alpha));
    const [prop] = propagate([t], dtau);
    const e = exponent(prop, yf), m = Math.exp(e.re);
    const T = C(m * Math.cos(e.im), m * Math.sin(e.im));
    const factor = div(add(C(yf), mul(scale(I, dtau), t.beta)), D);
    const f = mul(factor, T);
    nr += f.re; ni += f.im; dr += T.re; di += T.im;
  }
  return div(C(nr, ni), C(dr, di));
}

// ------------------------------------------------------------ joint table
// At fixed yf, the coupled amplitude is also a Gaussian sum in the pointer
// coordinate. Use its own conditional envelopes to bound the pointer grid;
// the detector window is not a bound on valid earlier pointer readings.
export function pointerTerms(terms1, dtau, sw, yf) {
  const q = 1 / (4 * sw * sw);
  return terms1.map(t => {
    const D = add(C(1), mul(C(0, 2 * dtau), add(t.alpha, C(q))));
    const [atZero] = propagate(coupleToPointer([t], 0, sw), dtau);
    return {
      alpha: sub(C(q), div(C(0, 2 * dtau * q * q), D)),
      beta: div(scale(add(C(yf), mul(C(0, dtau), t.beta)), 2 * q), D),
      gamma: exponent(atZero, yf),
    };
  });
}

// At least 40 strips, no wider than 20 nm. Resolve every strip with at
// least 12 output cells, with extra resolution for the sharpest pointers.
export function measurementLayout(screenNm, pointerNm) {
  const nBins = 40 * Math.max(1, Math.ceil(screenNm / 800));
  const cellsPerBin = Math.max(12, Math.ceil((screenNm / nBins) / (pointerNm / 8)));
  return {nBins, nYf: nBins * cellsPerBin};
}

export function measurementPlanes(distance, weak, gap) {
  gap = Math.max(10, Math.min(100, Math.floor(distance / 20) * 5, Math.round(gap / 5) * 5));
  const weakMax = Math.floor((distance - gap) / 10) * 10;
  return {weak: Math.max(0, Math.min(weakMax, Math.round(weak / 10) * 10)), gap, weakMax};
}

export function jointTable({terms1, dtau, sw, yfMin, yfMax, nYf = 480,
  pointerTail = 8, pointerResolution = 12}) {
  const dYf = (yfMax - yfMin) / nYf;
  const yf = Float64Array.from({length: nYf}, (_, i) => yfMin + (i + 0.5) * dYf);
  const marginal = new Float64Array(nYf), meanY = new Float64Array(nYf);
  const rows = [];
  let total = 0;
  for (let i = 0; i < nYf; i++) {
    const terms = pointerTerms(terms1, dtau, sw, yf[i]);
    const envelopes = terms.map(t => ({mu: t.beta.re / (2 * t.alpha.re), sigma: 1 / (2 * Math.sqrt(t.alpha.re))}));
    const lo = Math.min(...envelopes.map(e => e.mu - pointerTail * e.sigma));
    const hi = Math.max(...envelopes.map(e => e.mu + pointerTail * e.sigma));
    let step = Math.min(...envelopes.map(e => e.sigma)) / pointerResolution;
    // Resolve cross-term oscillations as well as the individual envelopes.
    for (let a = 0; a < terms.length; a++) for (let b = 0; b < a; b++) {
      const rate = Math.max(...[lo, hi].map(Y => Math.abs(-2 * (terms[a].alpha.im - terms[b].alpha.im) * Y + terms[a].beta.im - terms[b].beta.im)));
      if (rate > 0) step = Math.min(step, Math.PI / (8 * rate));
    }
    const n = Math.max(32, Math.ceil((hi - lo) / step));
    const dY = (hi - lo) / n, cdf = new Float64Array(n);
    let mass = 0, first = 0;
    for (let j = 0; j < n; j++) {
      const Y = lo + (j + 0.5) * dY, value = density(terms, Y) * dY;
      mass += value; first += value * Y; cdf[j] = mass;
    }
    if (mass > 0) for (let j = 0; j < n; j++) cdf[j] /= mass;
    marginal[i] = mass; meanY[i] = mass > 0 ? first / mass : NaN;
    rows.push({lo, dY, cdf}); total += mass;
  }
  const marginalCdf = new Float64Array(nYf);
  let acc = 0;
  for (let i = 0; i < nYf; i++) {acc += marginal[i]; marginalCdf[i] = acc / total;}
  for (let i = 0; i < nYf; i++) marginal[i] /= total * dYf;
  return {yf, rows, nYf, dYf, marginal, marginalCdf, meanY, dtau, sw, total: total * dYf};
}

function search(cdf, u, offset, n) {
  let lo = 0, hi = n - 1;
  while (lo < hi) {const mid = (lo + hi) >> 1; if (cdf[offset + mid] <= u) lo = mid + 1; else hi = mid;}
  return lo;
}

// One run of the experiment: returns the pointer reading Y and the strong
// result yf. Sampled from the exact joint distribution on the grid, with
// uniform jitter inside the cell.
export function sampleRun(table, random = Math.random) {
  const {nYf, marginalCdf, yf, dYf, rows} = table;
  const i = search(marginalCdf, random(), 0, nYf);
  const row = rows[i], j = search(row.cdf, random(), 0, row.cdf.length);
  return {yf: yf[i] + (random() - 0.5) * dYf,
    Y: row.lo + (j + random()) * row.dY};
}

// ------------------------------------------------------------ post-selection
export function makeBins(yMin, yMax, n) {
  return {yMin, yMax, n, w: (yMax - yMin) / n,
    count: new Float64Array(n), sumYf: new Float64Array(n), sumY: new Float64Array(n), sumY2: new Float64Array(n),
    meanDelta: new Float64Array(n), m2Delta: new Float64Array(n)};
}
export function addToBins(bins, run) {
  const i = Math.floor((run.yf - bins.yMin) / bins.w);
  if (i < 0 || i >= bins.n) return -1;
  bins.count[i]++; bins.sumYf[i] += run.yf; bins.sumY[i] += run.Y; bins.sumY2[i] += run.Y * run.Y;
  // Welford's update for the paired difference retains the covariance of the
  // two readings and avoids subtracting nearly equal second moments.
  const d = run.yf - run.Y, delta = d - bins.meanDelta[i];
  bins.meanDelta[i] += delta / bins.count[i];
  bins.m2Delta[i] += delta * (d - bins.meanDelta[i]);
  return i;
}
// Estimated velocity in each bin: (mean yf - mean Y)/dtau, with statistical
// error from the sample variance of the paired differences yf - Y.
// Bins with fewer than minCount runs give null.
export function binVelocities(bins, dtau, minCount = 30) {
  const out = [];
  for (let i = 0; i < bins.n; i++) {
    const n = bins.count[i];
    if (n < Math.max(2, minCount)) {out.push(null); continue;}
    const mYf = bins.sumYf[i] / n;
    out.push({y: mYf, v: bins.meanDelta[i] / dtau,
      err: Math.sqrt(Math.max(0, bins.m2Delta[i]) / (n * (n - 1))) / dtau, n});
  }
  return out;
}

// Expected velocity per bin from the exact table (what infinitely many runs give).
export function expectedBinVelocities(table, bins) {
  const out = [];
  for (let b = 0; b < bins.n; b++) {
    let s = 0, sY = 0, sYf = 0;
    for (let i = 0; i < table.nYf; i++) {
      const y = table.yf[i];
      if (y < bins.yMin + b * bins.w || y >= bins.yMin + (b + 1) * bins.w) continue;
      const w = table.marginal[i];
      if (!(w > 0) || !Number.isFinite(table.meanY[i])) continue;
      s += w; sY += w * table.meanY[i]; sYf += w * y;
    }
    out.push(s > 0 ? {y: sYf / s, v: (sYf - sY) / s / table.dtau, weight: s} : null);
  }
  return out;
}

// ------------------------------------------------------------ trajectories
// Integrate dy/dx = v(x, y)/k through a field given at plane positions xs
// (sorted). Each plane holds a function vAt(y) (or null where no data).
// Linear interpolation in x between planes; RK2 steps.
export function integrateField(planes, k, y0, x0, x1, steps = 400) {
  const vAt = (x, y) => {
    if (x <= planes[0].x) return planes[0].vAt(y);
    for (let i = 0; i < planes.length - 1; i++) {
      const a = planes[i], b = planes[i + 1];
      if (x <= b.x) {
        const va = a.vAt(y), vb = b.vAt(y);
        if (va === null || vb === null) return null;
        const f = (x - a.x) / (b.x - a.x);
        return va + f * (vb - va);
      }
    }
    return planes.at(-1).vAt(y);
  };
  const path = [[x0, y0]];
  let y = y0;
  const dx = (x1 - x0) / steps;
  for (let s = 0; s < steps; s++) {
    const x = x0 + s * dx;
    const a = vAt(x, y);
    if (a === null) break;
    const b = vAt(x + dx / 2, y + dx * a / k / 2);
    if (b === null) break;
    y += dx * b / k;
    path.push([x + dx, y]);
  }
  return path;
}

export function interpolateEstimates(estimates) {
  const pts = estimates.map((e, i) => e ? {i, ...e} : null);
  return y => {
    let a = null, b = null;
    for (const q of pts) {if (!q) continue; if (q.y <= y) a = q; else {b = q; break;}}
    if (!a || !b || b.i - a.i > 2) return null;
    return a.s + (b.s - a.s) * (y - a.y) / (b.y - a.y);
  };
}

// Starts use the fine detected-position histogram, not a uniform assumption
// inside a 20 nm strip. Compare like with like: the reference flow starts
// at each actual accepted coordinate, including for a small detector window.
export function reconstructFieldMap({planes, counts, yMin, yMax, nLines, reference}) {
  const field = planes.map(pl => ({x: pl.x2, vAt: interpolateEstimates(pl.est)}));
  const x0 = field[0].x, xEnd = field.at(-1).x;
  const total = counts.reduce((a, b) => a + b, 0), w = (yMax - yMin) / counts.length;
  const starts = [];
  for (let q = 0; q < nLines && total > 0; q++) {
    const target = (q + 0.5) / nLines * total;
    let acc = 0;
    for (let i = 0; i < counts.length; i++) {
      if (counts[i] > 0 && acc + counts[i] >= target) {
        const y = yMin + (i + (target - acc) / counts[i]) * w;
        if (field[0].vAt(y) !== null) starts.push(y);
        break;
      }
      acc += counts[i];
    }
  }
  const lines = starts.map(y => integrateField(field, 1, y, x0, xEnd, 600));
  const referenceLines = starts.map(y => reference(y, x0, xEnd));
  const referenceEnds = referenceLines.map(path => path.at(-1)[1]);
  let sum = 0, completed = 0;
  lines.forEach((path, i) => {
    const [x, y] = path.at(-1);
    if (Math.abs(x - xEnd) < 1e-8) {sum += (y - referenceEnds[i]) ** 2; completed++;}
  });
  return {starts, lines, referenceLines, referenceEnds, completed, intended: nLines,
    rms: completed ? Math.sqrt(sum / completed) : null};
}

// Pilot-wave trajectory from the exact wave behind the wall (for comparison),
// from (x0, y0) to x1; terms0 is the wave at the wall plane wallX.
export function bohmTrajectory(terms0, k, wallX, y0, x1, steps = 400, x0 = wallX) {
  const path = [[x0, y0]];
  let y = y0;
  const dx = (x1 - x0) / steps;
  const v = (x, q) => currentVelocity(propagate(terms0, (x - wallX) / k), q) / k;
  for (let s = 0; s < steps; s++) {
    const x = x0 + s * dx;
    const a = v(x, y), b = v(x + dx / 2, y + dx * a / 2), c = v(x + dx / 2, y + dx * b / 2), d = v(x + dx, y + dx * c);
    y += dx * (a + 2 * b + 2 * c + d) / 6;
    path.push([x + dx, y]);
  }
  return path;
}

// Density of the system averaged over all pointer readings, a time tau after
// the coupling (what the strong plane records, before post-selection):
//   rho(y) = ∫ dY |χ_Y(y, tau)|²,   χ_Y = U(tau) [ψ φ(Y - y)].
// Integrating out a Gaussian pointer multiplies the density matrix by
// exp(-(y-y')²/(8 sw²)), which equals an average of momentum kicks e^{iqy}
// with q Gaussian of standard deviation 1/(2 sw). The q-average is done on a
// uniform grid of n nodes over ±4 standard deviations.
export function ensembleDensity(terms1, sw, tau, ys, n = 41) {
  const sq = 1 / (2 * sw), out = new Float64Array(ys.length);
  let wsum = 0;
  const nodes = [];
  for (let m = 0; m < n; m++) {
    const q = n === 1 ? 0 : -4 * sq + 8 * sq * m / (n - 1), w = Math.exp(-q * q / (2 * sq * sq));
    nodes.push([q, w]); wsum += w;
  }
  for (const [q, w] of nodes) {
    const kicked = terms1.map((t) => ({ alpha: t.alpha, beta: add(t.beta, C(0, q)), gamma: t.gamma }));
    const prop = propagate(kicked, tau);
    for (let i = 0; i < ys.length; i++) out[i] += w / wsum * evaluate(prop, ys[i]).rho;
  }
  return out;
}
