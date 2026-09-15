import { fftPlan } from './fft.js';

export const BOX = Object.freeze({ width: 1.6, height: 1 });
export const LAUNCH_SPEED = 0.18;
export const GRID_INTERVALS = 4096;
export const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const finite = (value, fallback) => Number.isFinite(Number(value)) ? Number(value) : fallback;

export function gridIntervalsFor(alpha) {
  // Resolve the shorter wavelength with extra margin for cumulative density
  // accuracy during reflections of the narrower packet.
  return 2 ** Math.ceil(Math.log2(Math.max(GRID_INTERVALS, 2 * GRID_INTERVALS * 0.00012 / alpha)) - 1e-12);
}

export function parameters(classicality = 0, angle = 45) {
  const s = clamp(finite(classicality, 0), 0, 1);
  const theta = clamp(finite(angle, 45), -180, 180) * Math.PI / 180;
  // hbar=1 fixes the unit convention. Increasing mass lowers hbar/m, while
  // p=m*v holds the continuum group velocity exactly fixed, without FD dispersion.
  const u = clamp((s - 0.5) * 2, 0, 1);
  const extension = u * u * (3 - 2 * u);
  const widthScale = Math.pow(0.5, extension);
  // Halve sigma at the endpoint and quarter alpha: sigma(t) is halved during
  // free spreading too, since the spreading time 2*sigma^2/alpha is preserved.
  const alpha = 0.0144 * Math.pow(1 / 120, s) * widthScale * widthScale;
  const sigma = 0.065 * Math.pow(0.028 / 0.065, s) * widthScale;
  const mass = 1 / alpha, momentum = mass * LAUNCH_SPEED;
  return {
    classicality: s, angle: theta * 180 / Math.PI,
    hbar: 1, alpha, mass, momentum, speed: LAUNCH_SPEED,
    vx: LAUNCH_SPEED * Math.cos(theta), vy: LAUNCH_SPEED * Math.sin(theta),
    sigma, wavelength: 2 * Math.PI / momentum, intervals: gridIntervalsFor(alpha),
    spreadingTime: 2 * sigma * sigma / alpha,
    // This bounds trail sampling, not wave stability. The wave is evaluated at
    // absolute time. Fast reflection fringes receive finer temporal sampling.
    sampleDt: clamp(0.22 * alpha / (LAUNCH_SPEED * LAUNCH_SPEED), 1 / 4800, 1 / 120),
  };
}

export function seededRandom(seed = 1) {
  let state = (Math.floor(finite(seed, 1)) >>> 0) || 1;
  return () => {
    state += 0x6D2B79F5;
    let t = Math.imul(state ^ state >>> 15, 1 | state);
    t ^= t + Math.imul(t ^ t >>> 7, 61 | t);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

export class BoxAxis {
  constructor({ length, center, sigma, velocity, alpha, intervals = GRID_INTERVALS }) {
    if (!(length > 0 && sigma > 0 && alpha > 0)) throw new RangeError('Invalid physical parameters.');
    this.length = length; this.center = center; this.sigma = sigma;
    this.velocity = velocity; this.alpha = alpha;
    this.n = intervals; this.dx = length / intervals;
    this.plan = fftPlan(2 * intervals);
    this.re = new Float64Array(2 * intervals);
    this.im = new Float64Array(2 * intervals);
    this.rho = new Float64Array(intervals + 1);
    this.cdf = new Float64Array(intervals + 1);
    // The final boundary value is known to be zero, saving one texture texel.
    this.texture = new Float32Array(intervals * 4);
    const k = velocity / alpha;
    for (let j = 1; j < intervals; j++) {
      const x = j * this.dx;
      let real = 0, imag = 0;
      // Odd, 2L-periodic image extension enforces psi(0)=psi(L)=0 smoothly.
      // Omitted images are many Gaussian widths away for the supported packet.
      for (let image = -2; image <= 2; image++) {
        const a = x + 2 * image * length - center;
        const b = -x + 2 * image * length - center;
        const ga = Math.exp(-a * a / (4 * sigma * sigma));
        const gb = Math.exp(-b * b / (4 * sigma * sigma));
        real += ga * Math.cos(k * a) - gb * Math.cos(k * b);
        imag += ga * Math.sin(k * a) - gb * Math.sin(k * b);
      }
      this.re[j] = real; this.im[j] = imag;
      this.re[2 * intervals - j] = -real; this.im[2 * intervals - j] = -imag;
    }
    let norm = 0;
    for (let j = 1; j < intervals; j++) norm += (this.re[j] ** 2 + this.im[j] ** 2) * this.dx;
    const scale = 1 / Math.sqrt(norm);
    for (let j = 0; j < 2 * intervals; j++) { this.re[j] *= scale; this.im[j] *= scale; }
    this.plan.transform(this.re, this.im);
    this.coeffRe = this.re.slice(); this.coeffIm = this.im.slice();
    this.omega = new Float64Array(2 * intervals);
    const active = [];
    let spectralNorm = 0, tail = 0, maxPower = 0;
    for (let j = 0; j < 2 * intervals; j++) maxPower = Math.max(maxPower, this.re[j] ** 2 + this.im[j] ** 2);
    for (let j = 1; j < 2 * intervals; j++) {
      const mode = Math.min(j, 2 * intervals - j), power = this.re[j] ** 2 + this.im[j] ** 2;
      this.omega[j] = 0.5 * alpha * (Math.PI * mode / length) ** 2;
      spectralNorm += power;
      if (mode > 0.65 * intervals) tail += power;
      if (power > maxPower * 1e-28) active.push(j);
    }
    this.active = Uint32Array.from(active);
    this.spectralTail = tail / spectralNorm;
    if (this.spectralTail > 1e-10) throw new Error('The wave needs a finer spatial grid.');
    this.evaluate(0);
  }

  evaluate(time, makeTexture = false) {
    if (!Number.isFinite(time) || Math.abs(time) > 1e9) throw new RangeError('Invalid simulation time.');
    const { re, im, active, coeffRe, coeffIm, omega, n, dx } = this;
    re.fill(0); im.fill(0);
    for (let a = 0; a < active.length; a++) {
      const j = active[a], phase = -(omega[j] * time) % (2 * Math.PI);
      const c = Math.cos(phase), s = Math.sin(phase);
      re[j] = coeffRe[j] * c - coeffIm[j] * s;
      im[j] = coeffRe[j] * s + coeffIm[j] * c;
    }
    this.plan.transform(re, im, true);
    re[0] = im[0] = re[n] = im[n] = 0;
    this.cdf[0] = 0; this.rho[0] = 0;
    let norm = 0, peak = 0;
    for (let j = 1; j <= n; j++) {
      const density = re[j] * re[j] + im[j] * im[j];
      this.rho[j] = density;
      norm += 0.5 * (this.rho[j - 1] + density) * dx;
      this.cdf[j] = norm;
      peak = Math.max(peak, density);
    }
    // Keep the measured raw norm for diagnostics; do not renormalize the wave
    // to conceal growth. Only the probability lookup removes roundoff in its sum.
    if (!Number.isFinite(norm) || Math.abs(norm - 1) > 1e-7) throw new Error('Wave probability failed its conservation check.');
    this.norm = norm; this.peak = peak; this.time = time;
    for (let j = 1; j <= n; j++) this.cdf[j] /= norm;
    this.cdf[n] = 1;
    if (makeTexture) this.updateTexture();
    return this;
  }

  updateTexture() {
    for (let j = 0; j < this.n; j++) {
      this.texture[4 * j] = this.re[j]; this.texture[4 * j + 1] = this.im[j];
      this.texture[4 * j + 2] = this.rho[j]; this.texture[4 * j + 3] = 0;
    }
  }

  position(probability) {
    const q = clamp(probability, 0, 1);
    if (q === 0) return 0;
    if (q === 1) return this.length;
    let lo = 0, hi = this.n;
    while (hi - lo > 1) {
      const mid = (lo + hi) >>> 1;
      if (this.cdf[mid] < q) lo = mid; else hi = mid;
    }
    // Invert the integral of linear density inside the cell. This remains
    // monotone through near-nodes and never divides a current by tiny density.
    const target = (q - this.cdf[lo]) * this.norm / this.dx;
    const a = this.rho[lo], b = this.rho[hi] - a;
    const root = Math.sqrt(Math.max(0, a * a + 2 * b * target));
    const fraction = a + root > 1e-300 ? 2 * target / (a + root) : 0;
    return (lo + clamp(fraction, 0, 1)) * this.dx;
  }

  probabilityAt(x) {
    const grid = clamp(x / this.dx, 0, this.n);
    const lo = Math.min(this.n - 1, Math.floor(grid)), f = grid - lo;
    return this.cdf[lo] + this.dx * (this.rho[lo] * f + 0.5 * (this.rho[lo + 1] - this.rho[lo]) * f * f) / this.norm;
  }

  // Independent continuous sine-series evaluation, used to verify j/rho against
  // the cumulative-probability trajectory. No finite-difference derivative.
  currentVelocity(x, time = this.time) {
    let ar = 0, ai = 0, dr = 0, di = 0;
    for (const j of this.active) {
      if (j >= this.n) continue;
      const phase = -this.omega[j] * time;
      const c = Math.cos(phase), s = Math.sin(phase);
      const cr = this.coeffRe[j] * c - this.coeffIm[j] * s;
      const ci = this.coeffRe[j] * s + this.coeffIm[j] * c;
      const k = Math.PI * j / this.length, sx = Math.sin(k * x), cx = k * Math.cos(k * x);
      ar -= ci * sx / this.n; ai += cr * sx / this.n;
      dr -= ci * cx / this.n; di += cr * cx / this.n;
    }
    return this.alpha * (ar * di - ai * dr) / (ar * ar + ai * ai);
  }
}

export class Experiment {
  constructor({ classicality = 0, angle = 45, seed = 1, count = 1, intervals } = {}) {
    this.params = parameters(classicality, angle);
    intervals ??= this.params.intervals;
    this.seed = clamp(Math.floor(finite(seed, 1)), 1, 999999);
    this.count = clamp(Math.floor(finite(count, 1)), 1, 256);
    const { sigma, vx, vy, alpha } = this.params;
    this.xAxis = new BoxAxis({ length: BOX.width, center: BOX.width * 0.36, sigma, velocity: vx, alpha, intervals });
    this.yAxis = new BoxAxis({ length: BOX.height, center: BOX.height * 0.4, sigma, velocity: vy, alpha, intervals });
    const rng = seededRandom(this.seed);
    this.quantiles = new Float64Array(this.count * 2);
    this.positions = new Float64Array(this.count * 2);
    for (let j = 0; j < this.quantiles.length; j++) this.quantiles[j] = clamp(rng(), 1e-9, 1 - 1e-9);
    this.evaluate(0);
    this.initialPositions = this.positions.slice();
  }

  evaluate(time, makeTexture = false) {
    this.xAxis.evaluate(time, makeTexture); this.yAxis.evaluate(time, makeTexture);
    for (let i = 0; i < this.count; i++) {
      this.positions[2 * i] = this.xAxis.position(this.quantiles[2 * i]);
      this.positions[2 * i + 1] = this.yAxis.position(this.quantiles[2 * i + 1]);
    }
    this.time = time;
    return this.positions;
  }

  diagnostics() {
    return {
      time: this.time, norm: this.xAxis.norm * this.yAxis.norm,
      normError: Math.abs(1 - this.xAxis.norm * this.yAxis.norm),
      spectralTail: Math.max(this.xAxis.spectralTail, this.yAxis.spectralTail),
      intervals: this.xAxis.n, count: this.count, params: this.params,
      finite: [...this.positions].every(Number.isFinite),
      positions: [...this.positions], quantiles: [...this.quantiles],
    };
  }
}

export function classicalPosition(initial, velocity, time, length) {
  const u = ((initial + velocity * time) % (2 * length) + 2 * length) % (2 * length);
  return u <= length ? u : 2 * length - u;
}
