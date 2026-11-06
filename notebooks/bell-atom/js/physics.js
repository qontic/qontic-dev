// Physics for the "Bell's atom" notebook. Units: c = 1, electron mass m = 1,
// initial orbit radius r0 = 1. The nucleus-electron coupling K = Z e^2 (Gaussian
// units) is K = v0^2 with v0 = 0.1 c; the orbit speed is set slightly below v0 so that
// the orbit is exactly circular for a relativistic electron (0.1 c by
// default; Bell notes that a heavy nucleus makes the computation feasible).
// The orbit lies in the x-z plane; the nucleus moves along +z.

export const gammaOf = (v) => 1 / Math.sqrt(1 - v * v);

// Field of a charge (strength K) moving uniformly at speed V along z, at the
// point (x, z) measured from the charge's present position (Heaviside 1889;
// Bell 1976, eq. 1). Returns E components, the magnetic field component B_y,
// and the scalar potential phi.
export function movingChargeField(x, z, V, K = 1) {
  const g = gammaOf(V);
  const s2 = x * x + g * g * z * z;
  const d3 = Math.pow(s2, 1.5);
  const Ex = (K * g * x) / d3;
  const Ez = (K * g * z) / d3;
  return { Ex, Ez, By: V * Ex, phi: (K * g) / Math.sqrt(s2) };
}

// Smooth speed program for the nucleus: 0 -> Vf over a time Tacc (smoothstep),
// then constant. Position is integrated analytically.
export function makeProgram(Vf, Tacc) {
  const V = (t) => { const s = Math.min(Math.max(t / Tacc, 0), 1); return Vf * (3 * s * s - 2 * s * s * s); };
  const z = (t) => {
    if (t <= 0) return 0;
    const s = Math.min(t / Tacc, 1);
    const base = Vf * Tacc * (s ** 3 - 0.5 * s ** 4);
    return t > Tacc ? base + Vf * (t - Tacc) : base;
  };
  // d(gamma V)/dt: the rate of change of momentum per unit mass needed to keep up
  const dU = (t) => {
    const s = t / Tacc;
    if (s <= 0 || s >= 1) return 0;
    const v = V(t);
    return (Vf * (6 * s - 6 * s * s)) / Tacc / Math.pow(1 - v * v, 1.5);
  };
  // dV/dt: the push per unit mass for an electron with Newtonian inertia
  const dV = (t) => {
    const s = t / Tacc;
    if (s <= 0 || s >= 1) return 0;
    return (Vf * (6 * s - 6 * s * s)) / Tacc;
  };
  return { V, z, dU, dV, Vf, Tacc };
}

// Bell's atom: an electron in the field of a nucleus that is gently pushed to
// speed Vf. With pushElectron = true the electron also receives the push
// m d(gamma V)/dt, as both particles would in a uniform field acting on mass;
// see the notebook text for why.
// The three ingredients of Bell's calculation can be switched off one at a
// time, to show that all three are needed:
//   flatField: the field of the moving nucleus is Heaviside's flattened field
//              (off: the nucleus carries its rest-frame Coulomb field along);
//   magnetic:  the moving electron feels the magnetic force v x B;
//   relInertia: Lorentz's relation p = gamma m v (off: Newton's p = m v, and
//              the push on the electron is m dV/dt).
// With all three off the physics is Galilean and the atom is simply carried
// along, unchanged.
export class BellAtom {
  constructor({ v0 = 0.1, Vf = 0.8, rampOrbits = 100, pushElectron = true, stepsPerOrbit = 300,
    flatField = true, magnetic = true, relInertia = true } = {}) {
    this.K = v0 * v0;
    this.flat = flatField; this.mag = magnetic; this.relI = relInertia;
    // Exactly circular orbit of radius 1: K / r^2 = gamma m v^2 / r, i.e.
    // v^2 / sqrt(1 - v^2) = K (relativistic), or v^2 = K (Newtonian).
    const K2 = this.K * this.K;
    this.v0 = relInertia ? Math.sqrt((Math.sqrt(K2 * K2 + 4 * K2) - K2) / 2) : v0;
    this.T0 = (2 * Math.PI) / this.v0;
    this.prog = makeProgram(Vf, rampOrbits * this.T0);
    this.push = pushElectron;
    this.dt = this.T0 / stepsPerOrbit;
    this.reset();
  }

  reset() {
    const p0 = this.relI ? this.v0 / Math.sqrt(1 - this.v0 * this.v0) : this.v0;
    this.t = 0;
    this.s = [1, 0, 0, p0]; // x, z (lab), px, pz
    this.orbit = null; // extents of the revolution in progress
    this.last = null; // measured extents and period of the last complete revolution
    this.lastCross = null;
    this.lost = null; // set when the electron leaves the region where the model holds
  }

  deriv([x, z, px, pz], t) {
    const V = this.prog.V(t);
    const f = movingChargeField(x, z - this.prog.z(t), this.flat ? V : 0, this.K);
    const By = this.mag ? V * f.Ex : 0;
    const gp = this.relI ? Math.sqrt(1 + px * px + pz * pz) : 1;
    const vx = px / gp, vz = pz / gp;
    // electron charge -1: F = -(E + v x B), with B = (0, By, 0)
    const Fx = -(f.Ex - vz * By);
    const Fz = -(f.Ez + vx * By) + (this.push ? (this.relI ? this.prog.dU(t) : this.prog.dV(t)) : 0);
    return [vx, vz, Fx, Fz];
  }

  step(n = 1) {
    const h = this.dt;
    for (let i = 0; i < n; i++) {
      if (this.lost) return;
      const s = this.s, t = this.t;
      const k1 = this.deriv(s, t);
      const a = s.map((v, j) => v + 0.5 * h * k1[j]);
      const k2 = this.deriv(a, t + 0.5 * h);
      const b = s.map((v, j) => v + 0.5 * h * k2[j]);
      const k3 = this.deriv(b, t + 0.5 * h);
      const c = s.map((v, j) => v + h * k3[j]);
      const k4 = this.deriv(c, t + h);
      const next = s.map((v, j) => v + (h / 6) * (k1[j] + 2 * k2[j] + 2 * k3[j] + k4[j]));
      this.track(s[0], next[0], next[1] - this.prog.z(t + h), t + h);
      this.s = next;
      this.t = t + h;
      // A nearly radial orbit takes the point electron through the nucleus,
      // where a fixed-step integration (and the classical model) fails.
      const r = Math.hypot(next[0], next[1] - this.prog.z(this.t));
      if (r < BellAtom.R_MIN || r > BellAtom.R_MAX) this.lost = { t: this.t, r, V: this.prog.V(this.t) };
    }
  }

  // Track extents relative to the nucleus; a revolution ends at each upward
  // crossing of x = 0.
  track(xPrev, x, zRel, t) {
    if (!this.orbit) this.orbit = { xmin: x, xmax: x, zmin: zRel, zmax: zRel };
    const o = this.orbit;
    o.xmin = Math.min(o.xmin, x); o.xmax = Math.max(o.xmax, x);
    o.zmin = Math.min(o.zmin, zRel); o.zmax = Math.max(o.zmax, zRel);
    if (xPrev < 0 && x >= 0) {
      if (this.lastCross !== null) {
        this.last = {
          width: o.xmax - o.xmin,
          length: o.zmax - o.zmin,
          period: t - this.lastCross,
          V: this.prog.V(t),
        };
      }
      this.lastCross = t;
      this.orbit = null;
    }
  }

  static R_MIN = 0.1;
  static R_MAX = 3;

  get rel() { return { x: this.s[0], z: this.s[1] - this.prog.z(this.t), t: this.t, V: this.prog.V(this.t) }; }
}

// Run an atom through its ramp and record one or more revolutions while it
// coasts. Returns lab-frame electron events and the nucleus worldline offset.
export function steadyOrbit({ v0 = 0.1, Vf = 0.8, rampOrbits = 100, revolutions = 3, samplesPerOrbit = 300 } = {}) {
  const atom = new BellAtom({ v0, Vf, rampOrbits, stepsPerOrbit: samplesPerOrbit });
  const Tacc = atom.prog.Tacc;
  while (atom.t < Tacc + 3 * atom.T0 && !atom.lost) atom.step(50);
  if (atom.lost) throw new Error('steadyOrbit: electron lost during the push');
  const g = gammaOf(Vf);
  const n = Math.round(revolutions * g * samplesPerOrbit);
  const events = [];
  for (let i = 0; i < n; i++) {
    atom.step(1);
    events.push({ t: atom.t, x: atom.s[0], z: atom.s[1] });
  }
  // nucleus during coasting: z = c0 + Vf t
  const c0 = atom.prog.z(atom.t) - Vf * atom.t;
  return { events, c0, Vf, gamma: g, T0: atom.T0, measured: atom.last };
}

// Lorentz transformation to the variables of an observer moving with speed V
// along z (Bell 1976, eqs. 12-14).
export function toPrimed({ t, x, z }, V) {
  const g = gammaOf(V);
  return { t: g * (t - V * z), x, z: g * (z - V * t) };
}

// The orbit of an atom brought gently to speed Vf (the push lasts rampOrbits
// rest periods), with any of Bell's ingredients switched off. Returns one
// complete revolution after the push, relative to the nucleus, with its
// length (along the motion), width and period in units of the rest diameter
// and rest period. If the electron is lost during the push, returns
// {lost: {orbit, V}} and the last part of its path.
export function orbitAtSpeed({ Vf = 0.8, flatField = true, magnetic = true, relInertia = true, rampOrbits = 60, stepsPerOrbit = 300 } = {}) {
  const atom = new BellAtom({ Vf, rampOrbits: Vf > 0 ? rampOrbits : 1, flatField, magnetic, relInertia, stepsPerOrbit });
  const tail = [];
  const keep = 3 * stepsPerOrbit;
  const settle = atom.prog.Tacc + 2 * atom.T0 * gammaOf(Vf);
  while (atom.t < settle && !atom.lost) {
    atom.step(1);
    tail.push({ x: atom.s[0], z: atom.s[1] - atom.prog.z(atom.t) });
    if (tail.length > keep) tail.shift();
  }
  if (atom.lost) return { lost: { orbit: atom.lost.t / atom.T0, V: atom.lost.V }, path: tail, T0: atom.T0 };
  // record from one upward crossing of x = 0 to the next
  let prevX = atom.s[0], started = false, t0 = 0;
  const path = [];
  for (let i = 0; i < 40 * stepsPerOrbit && !atom.lost; i++) {
    atom.step(1);
    const x = atom.s[0], z = atom.s[1] - atom.prog.z(atom.t);
    const up = prevX < 0 && x >= 0;
    prevX = x;
    if (up && started) {
      const xs = path.map((p) => p.x), zs = path.map((p) => p.z);
      return {
        path, T0: atom.T0, period: (atom.t - t0) / atom.T0,
        length: (Math.max(...zs) - Math.min(...zs)) / 2,
        width: (Math.max(...xs) - Math.min(...xs)) / 2,
      };
    }
    if (up) { started = true; t0 = atom.t; }
    if (started) path.push({ t: atom.t - t0, x, z });
  }
  return { lost: { orbit: atom.t / atom.T0, V: Vf }, path, T0: atom.T0 };
}
