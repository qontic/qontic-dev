import { BOX, LAUNCH_SPEED, parameters, seededRandom } from './physics.js';

export const KNIFE_EDGE = Object.freeze({ x: 0.8, tip: 0.5 });
export const PACKET_CENTER = Object.freeze([0.44, 0.515]);

export function obstacleParameters(classicality, angle = 0, refinement = 1) {
  const p = parameters(classicality, angle);
  // The separable box can resolve far shorter wavelengths than a full 2D grid.
  // Keep the original packet widths; use a separate, explicitly documented
  // 96:1 mass range for the diffraction experiment (not an aliased endpoint).
  const alpha = 0.0144 * Math.pow(96, -p.classicality);
  const required = BOX.width * Math.max(Math.abs(p.vx), Math.abs(p.vy)) / (alpha * 0.95);
  const nx = Math.max(256, 2 ** Math.ceil(Math.log2(required))) * refinement;
  const ny = nx * 5 / 8, dx = BOX.width / nx;
  const symbol = q => 8 * Math.sin(q) / 5 - 2 * Math.sin(2 * q) / 5 + 8 * Math.sin(3 * q) / 105 - Math.sin(4 * q) / 140;
  const momentumComponent = velocity => {
    let lo = 0, hi = 1;
    const target = Math.abs(velocity) * dx / alpha;
    if (target > symbol(hi)) throw new Error('The obstacle wave needs a finer grid.');
    for (let i = 0; i < 48; i++) {
      const mid = (lo + hi) / 2;
      if (symbol(mid) < target) lo = mid; else hi = mid;
    }
    return Math.sign(velocity) * (lo + hi) / (2 * dx);
  };
  // Match the group velocity of the actual eighth-order spatial operator.
  const kx = momentumComponent(p.vx), ky = momentumComponent(p.vy);
  const energy1 = k => alpha / (2 * dx * dx) * (205 / 72 - 16 * Math.cos(k * dx) / 5 + 2 * Math.cos(2 * k * dx) / 5 - 16 * Math.cos(3 * k * dx) / 315 + Math.cos(4 * k * dx) / 280);
  return { ...p, alpha, mass: 1 / alpha, momentum: Math.hypot(kx, ky),
    continuumMomentum: LAUNCH_SPEED / alpha, kx, ky, nx, ny, dx,
    wavelength: 2 * Math.PI / Math.hypot(kx, ky), intervals: nx,
    spreadingTime: 2 * p.sigma ** 2 / alpha, energy: energy1(kx) + energy1(ky),
    sampleDt: 1 / 120, model: '2D Dirichlet knife edge', refinement };
}

export function initialParticles(params, seed, count) {
  const random = seededRandom(seed), positions = new Float64Array(2 * count);
  for (let i = 0; i < count; i++) {
    let x, y;
    do {
      const radius = Math.sqrt(-2 * Math.log(Math.max(1e-12, random()))), angle = 2 * Math.PI * random();
      x = PACKET_CENTER[0] + params.sigma * radius * Math.cos(angle);
      y = PACKET_CENTER[1] + params.sigma * radius * Math.sin(angle);
    } while (x <= params.dx || x >= BOX.width - params.dx || y <= params.dx || y >= BOX.height - params.dx);
    positions[2 * i] = x; positions[2 * i + 1] = y;
  }
  return positions;
}

export function classicalObstaclePosition(initial, velocity, time, edge = KNIFE_EDGE) {
  let [x, y] = initial, [vx, vy] = velocity, remaining = time;
  for (let bounce = 0; remaining > 1e-12 && bounce < 10000; bounce++) {
    const tx = vx > 0 ? (BOX.width - x) / vx : vx < 0 ? -x / vx : Infinity;
    const ty = vy > 0 ? (BOX.height - y) / vy : vy < 0 ? -y / vy : Infinity;
    let te = edge && vx ? (edge.x - x) / vx : Infinity;
    if (te < 1e-10 || y + vy * te > edge.tip) te = Infinity;
    const next = Math.min(tx, ty, te);
    if (remaining < next || !Number.isFinite(next)) { x += vx * remaining; y += vy * remaining; break; }
    x += vx * next; y += vy * next; remaining -= next;
    if (Math.abs(next - tx) < 1e-10 || Math.abs(next - te) < 1e-10) vx = -vx;
    if (Math.abs(next - ty) < 1e-10) vy = -vy;
  }
  return [x, y];
}

export function besselJ(n, z) {
  let term = 1;
  for (let i = 1; i <= n; i++) term *= z / (2 * i);
  let sum = term;
  for (let m = 1; m < 32; m++) { term *= -z * z / (4 * m * (m + n)); sum += term; if (Math.abs(term) < 1e-18) break; }
  return sum;
}
