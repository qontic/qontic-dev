// Physics engine for the many-slit app. No DOM; importable from node.
//
// Units: transverse position y in units of the slit spacing d; distance behind the
// slits ζ = z / z_T in units of the Talbot length z_T = 2d²/λ. In these units the
// paraxial equation is ∂ψ/∂ζ = (i / 2π) ∂²ψ/∂y², the only parameter left is the slit
// width σ/d, and the pilot-wave guidance equation is dy/dζ = Im(∂_yψ / ψ) / π.
//
// Each slit transmits a Gaussian, ψ_k(y, 0) = a_k exp[-(y - y_k)² / 4σ²], so |ψ_k|²
// has standard deviation σ. Each evolves exactly:
//   ψ_k(y, ζ) = a_k (σ / √s) exp[-(y - y_k)² / 4s],   s = σ² + iζ/(2π).

export const TWO_PI = 2 * Math.PI;

export function slitCentres(N) {
  // slit 0 is the top one (largest y)
  return Array.from({ length: N }, (_, k) => (N - 1) / 2 - k);
}

export function makeSetup({ N = 5, sigma = 0.15, open = null, beam = null } = {}) {
  const y = slitCentres(N);
  const isOpen = y.map((_, k) => (open ? open[k] !== false : true));
  const amp = y.map((yk, k) => {
    if (!isOpen[k]) return 0;
    if (!beam || !beam.on) return 1;
    return Math.exp(-((yk - beam.centre) ** 2) / (4 * beam.width ** 2));
  });
  return { N, sigma, y, open: isOpen, amp };
}

// complex helpers on [re, im]
function csqrt(re, im) {
  const r = Math.hypot(re, im);
  const a = Math.sqrt((r + re) / 2);
  const b = Math.sign(im || 1) * Math.sqrt(Math.max(0, (r - re) / 2));
  return [a, b];
}

// Per-ζ constants shared by all slits: 1/(4s) and σ/√s.
export function zetaConstants(sigma, zeta) {
  const sr = sigma * sigma, si = zeta / TWO_PI;
  const den = sr * sr + si * si;
  const inv4s = [sr / (4 * den), -si / (4 * den)]; // 1/(4s)
  const [qr, qi] = csqrt(sr, si);
  const qd = qr * qr + qi * qi;
  const pref = [sigma * qr / qd, -sigma * qi / qd]; // σ/√s
  return { inv4s, pref, s: [sr, si] };
}

// ψ(y, ζ) and ∂_yψ. Returns [re, im, dre, dim].
export function psiAt(setup, y, zeta, C = zetaConstants(setup.sigma, zeta)) {
  const [ar, ai] = C.inv4s, [pr, pi] = C.pref;
  let re = 0, im = 0, dre = 0, dim = 0;
  for (let k = 0; k < setup.N; k++) {
    const a = setup.amp[k];
    if (a === 0) continue;
    const u = y - setup.y[k];
    const er = -u * u * ar, ei = -u * u * ai;
    if (er < -700) continue;
    const m = a * Math.exp(er), c = Math.cos(ei), sn = Math.sin(ei);
    const gr = m * (pr * c - pi * sn), gi = m * (pr * sn + pi * c);
    re += gr; im += gi;
    // ∂_y exp(-u²/4s) = -2u/(4s) · exp(...)
    const fr = -2 * u * ar, fi = -2 * u * ai;
    dre += fr * gr - fi * gi; dim += fr * gi + fi * gr;
  }
  return [re, im, dre, dim];
}

export function densityAt(setup, y, zeta, C) {
  const [re, im] = psiAt(setup, y, zeta, C);
  return re * re + im * im;
}

// Pilot-wave guidance: dy/dζ = Im(ψ'/ψ)/π.
export function velocityAt(setup, y, zeta, C) {
  const [re, im, dre, dim] = psiAt(setup, y, zeta, C);
  const n = re * re + im * im;
  if (n === 0) return 0;
  return (re * dim - im * dre) / n / Math.PI;
}

// Half-width of the region where the wave lives at ζ: the grating plus 4.5 single-slit widths.
export function waveHalfWidth(setup, zeta) {
  const ys = setup.y.filter((_, k) => setup.amp[k] > 1e-6);
  const top = ys.length ? Math.max(...ys.map(Math.abs)) : 0;
  const w = singleSlitWidth(setup.sigma, zeta);
  return top + 4.5 * w;
}
// standard deviation of |ψ_k|² at ζ: |s|/σ
export function singleSlitWidth(sigma, zeta) {
  return Math.hypot(sigma * sigma, zeta / TWO_PI) / sigma;
}

// Tables of the cumulative distribution F_ζ(y) on columns ζ_j = j ζmax/(nz-1).
// Each column has its own uniform y grid covering the wave at that ζ.
export function buildTables(setup, zetaMax, { nz = 241, ny = 2401 } = {}) {
  const cols = [];
  for (let j = 0; j < nz; j++) {
    const zeta = (j * zetaMax) / (nz - 1);
    const H = waveHalfWidth(setup, zeta);
    const y0 = -H, dy = (2 * H) / (ny - 1);
    const C = zetaConstants(setup.sigma, zeta);
    const rho = new Float64Array(ny), cdf = new Float64Array(ny);
    for (let i = 0; i < ny; i++) rho[i] = densityAt(setup, y0 + i * dy, zeta, C);
    for (let i = 1; i < ny; i++) cdf[i] = cdf[i - 1] + 0.5 * (rho[i] + rho[i - 1]) * dy;
    const tot = cdf[ny - 1] || 1;
    for (let i = 0; i < ny; i++) cdf[i] /= tot;
    cols.push({ zeta, y0, dy, rho, cdf, total: tot });
  }
  return { zetaMax, nz, ny, cols };
}

// F_ζ^{-1}(q) on column j, linear between grid points.
export function quantile(col, q) {
  const c = col.cdf, n = c.length;
  if (q <= 0) return col.y0;
  if (q >= 1) return col.y0 + (n - 1) * col.dy;
  let lo = 0, hi = n - 1;
  while (hi - lo > 1) { const mid = (lo + hi) >> 1; if (c[mid] < q) lo = mid; else hi = mid; }
  const f = c[hi] > c[lo] ? (q - c[lo]) / (c[hi] - c[lo]) : 0.5;
  return col.y0 + (lo + f) * col.dy;
}
export function cdfAt(col, y) {
  const x = (y - col.y0) / col.dy, n = col.cdf.length;
  if (x <= 0) return 0;
  if (x >= n - 1) return 1;
  const i = Math.floor(x), f = x - i;
  return col.cdf[i] * (1 - f) + col.cdf[i + 1] * f;
}

// Which slit a particle with quantile q came through: the slit whose cell
// (between midpoints of neighbouring open slits) contains F_0^{-1}(q).
// Returns cumulative boundaries P (length = number of open slits + 1) and the slit index of each cell.
export function slitCells(setup, tables) {
  const col = tables.cols[0];
  const openIdx = setup.y.map((_, k) => k).filter((k) => setup.amp[k] > 0);
  const P = [0];
  for (let i = 0; i < openIdx.length - 1; i++) {
    const mid = 0.5 * (setup.y[openIdx[i]] + setup.y[openIdx[i + 1]]);
    // cdf runs from bottom (y = -H) up; slit 0 is at the top, so measure from the top.
    P.push(1 - cdfAt(col, mid));
  }
  P.push(1);
  return { P, slit: openIdx };
}
// quantile measured from the top: q = 1 - F(y). Convert to y on a column.
export const yFromTop = (col, qTop) => quantile(col, 1 - qTop);

export function slitOf(cells, qTop) {
  const { P, slit } = cells;
  for (let i = 0; i < slit.length; i++) if (qTop < P[i + 1]) return slit[i];
  return slit[slit.length - 1];
}

// Fraction of the wave of slit k alone (normalized) that lies in [a, b] at ζ.
export function singleSlitFraction(setup, k, zeta, a, b) {
  const w = singleSlitWidth(setup.sigma, zeta), yk = setup.y[k];
  const Phi = (x) => 0.5 * (1 + erf((x - yk) / (w * Math.SQRT2)));
  return Phi(b) - Phi(a);
}
export function erf(x) {
  // Abramowitz–Stegun 7.1.26 is too coarse for tests; use a series/continued fraction.
  const t = Math.abs(x);
  if (t < 2.5) {
    let sum = t, term = t, n = 0;
    while (Math.abs(term) > 1e-17 * Math.abs(sum)) { n++; term *= -t * t / n; sum += term / (2 * n + 1); }
    return Math.sign(x) * (2 / Math.sqrt(Math.PI)) * sum;
  }
  // continued fraction for erfc
  let f = 0;
  for (let n = 60; n >= 1; n--) f = n / 2 / (t + f);
  const erfc = Math.exp(-t * t) / Math.sqrt(Math.PI) / (t + f);
  return Math.sign(x) * (1 - erfc);
}

// Independent route for tests: integrate the guidance equation with RK4.
export function rk4Trajectory(setup, y0, zetaMax, steps = 4000) {
  let y = y0; const h = zetaMax / steps; const out = [y];
  for (let i = 0; i < steps; i++) {
    const z = i * h;
    const k1 = velocityAt(setup, y, z);
    const k2 = velocityAt(setup, y + 0.5 * h * k1, z + 0.5 * h);
    const k3 = velocityAt(setup, y + 0.5 * h * k2, z + 0.5 * h);
    const k4 = velocityAt(setup, y + h * k3, z + h);
    y += (h / 6) * (k1 + 2 * k2 + 2 * k3 + k4);
    out.push(y);
  }
  return out;
}

// Local minima of the density on a column, used to delimit bright fringes (diffraction orders).
export function brightFringeAround(col, yCentre = 0) {
  const r = col.rho, n = r.length;
  let i = Math.round((yCentre - col.y0) / col.dy);
  i = Math.max(1, Math.min(n - 2, i));
  // climb to the local maximum first
  while (i > 0 && i < n - 1 && (r[i + 1] > r[i] || r[i - 1] > r[i])) i += r[i + 1] > r[i - 1] ? 1 : -1;
  let lo = i, hi = i;
  while (lo > 0 && r[lo - 1] <= r[lo]) lo--;
  while (hi < n - 1 && r[hi + 1] <= r[hi]) hi++;
  return { lo: col.y0 + lo * col.dy, hi: col.y0 + hi * col.dy, peak: col.y0 + i * col.dy };
}

// Bright fringes on the screen that are "orders": maxima holding at least minFrac of the probability.
export function fringes(col, minFrac = 0.02) {
  const r = col.rho, n = r.length, out = [];
  let start = 0;
  for (let i = 1; i < n - 1; i++) {
    if (r[i] <= r[i - 1] && r[i] < r[i + 1]) { out.push([start, i]); start = i; }
  }
  out.push([start, n - 1]);
  return out
    .map(([a, b]) => ({ lo: col.y0 + a * col.dy, hi: col.y0 + b * col.dy, mass: col.cdf[b] - col.cdf[a] }))
    .filter((f) => f.mass >= minFrac);
}
