// Kinematics of Bell's spaceship problem (special relativity, units c = 1).
// Lengths are in units of the initial separation L, times in units of L/c.
//
// Two ships start at rest in the launch frame: the rear ship B at x = 0 and the
// front ship C at x = L. At t = 0 (launch frame) both start a constant proper
// acceleration and stop accelerating when they reach the final speed beta.
//
//   mode 'bell'  : both ships have the same proper acceleration a (Bell's case).
//   mode 'rigid' : Born-rigid motion. The rear ship has proper acceleration a,
//                  the front ship a / (1 + a L); both worldlines share one
//                  Rindler pivot, so the proper distance between them stays L.

export function makeModel({ beta = 0.9, accel = 0.6, L = 1, mode = 'bell' } = {}) {
  const b = Math.min(Math.max(beta, 1e-4), 0.9999);
  const gf = 1 / Math.sqrt(1 - b * b);
  const ships = [0, L].map((x0, index) => {
    const a = mode === 'rigid' && index === 1 ? accel / (1 + accel * L) : accel;
    const t1 = (gf * b) / a; // launch-frame time at which the ship reaches beta
    const x1 = x0 + (Math.sqrt(1 + (a * t1) ** 2) - 1) / a;
    const tau1 = Math.asinh(a * t1) / a;
    return { x0, a, t1, x1, tau1 };
  });
  return { beta: b, gammaF: gf, accel, L, mode, ships };
}

// State of ship i (0 = rear B, 1 = front C) at launch-frame time t.
export function shipState(model, i, t) {
  const s = model.ships[i];
  if (t <= 0) return { x: s.x0, v: 0, tau: t };
  if (t <= s.t1) {
    const at = s.a * t;
    const root = Math.sqrt(1 + at * at);
    return { x: s.x0 + (root - 1) / s.a, v: at / root, tau: Math.asinh(at) / s.a };
  }
  return {
    x: s.x1 + model.beta * (t - s.t1),
    v: model.beta,
    tau: s.tau1 + (t - s.t1) / model.gammaF,
  };
}

// Event on the front ship's worldline that is simultaneous, in the rear ship's
// instantaneous rest frame, with the rear ship's event at launch time tB.
// Returns the proper distance D measured in that frame, the front ship's
// proper time and launch-frame time there, and the front ship's velocity
// relative to the rear ship.
export function rearFrameView(model, tB) {
  const B = shipState(model, 0, tB);
  const f = (tC) => tC - tB - B.v * (shipState(model, 1, tC).x - B.x);
  // f is strictly increasing because |v_B v_C| < 1.
  let span = 1 + model.L;
  let lo = tB - span;
  let hi = tB + span;
  while (f(lo) > 0) { span *= 2; lo = tB - span; }
  while (f(hi) < 0) { span *= 2; hi = tB + span; }
  for (let k = 0; k < 80; k++) {
    const mid = 0.5 * (lo + hi);
    if (f(mid) < 0) lo = mid; else hi = mid;
  }
  const tC = 0.5 * (lo + hi);
  const C = shipState(model, 1, tC);
  const gB = 1 / Math.sqrt(1 - B.v * B.v);
  const D = gB * ((C.x - B.x) - B.v * (tC - tB));
  const vRel = (C.v - B.v) / (1 - C.v * B.v);
  return { tB, tC, xB: B.x, xC: C.x, vB: B.v, D, tauB: B.tau, tauC: C.tau, vRel };
}

// Elongation of a thread of rest length L stretched between the ships,
// measured in the rear ship's instantaneous rest frame.
export function strainAt(model, tB) {
  return rearFrameView(model, tB).D / model.L - 1;
}

export function runEnd(model) {
  const tAcc = Math.max(model.ships[0].t1, model.ships[1].t1);
  return tAcc * 1.2 + 2.5 * model.L;
}

// First rear-ship launch time at which the elongation reaches breakStrain,
// or null if the thread survives the whole run (and the coasting afterwards).
export function findBreak(model, breakStrain, tEnd = runEnd(model)) {
  const n = 600;
  let prevT = 0;
  for (let k = 1; k <= n; k++) {
    const t = (tEnd * k) / n;
    if (strainAt(model, t) >= breakStrain) {
      let lo = prevT;
      let hi = t;
      for (let j = 0; j < 50; j++) {
        const mid = 0.5 * (lo + hi);
        if (strainAt(model, mid) >= breakStrain) hi = mid; else lo = mid;
      }
      return hi;
    }
    prevT = t;
  }
  return null;
}

// Speed above which a thread with the given breaking elongation must break in
// Bell's case: gamma - 1 = breakStrain once both ships coast.
export function criticalBeta(breakStrain) {
  const g = 1 + breakStrain;
  return Math.sqrt(1 - 1 / (g * g));
}

export const gammaOf = (v) => 1 / Math.sqrt(1 - v * v);
