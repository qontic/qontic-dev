// Shared declarations. The wave is solved on a 2D grid across the beam (y, z); along the
// beam (x) it is the exact free Gaussian phi(x, t), because the transverse problem does not
// depend on x: Psi(x, y, z, t) = phi(x, t) chi(y, z, t). Magnets are felt through the packet's
// position x_c(t): the transverse field is B(y, z; x_c(t)).
struct Uniforms {
  sim: vec4<f32>,       // render window along x (cells), grid along y, grid along z, cloud instances
  physics: vec4<f32>,   // hbar, mass, p0, dt
  packet: vec4<f32>,    // start fractions (x, y, z), width sigma (cells)
  visual0: vec4<f32>,
  visual1: vec4<f32>,
  particle0: vec4<f32>,
  particle1: vec4<f32>,
  camera: vec4<f32>,
  viewport: vec4<f32>,
  detector: vec4<f32>,
  trail0: vec4<f32>,
  density0: vec4<f32>,
  lineColor: vec4<f32>,
  boxCenter: vec4<f32>,
  sgField: vec4<f32>,   // gradient g (0 when off), field on, spin θ, spin φ (radians)
  visual2: vec4<f32>,   // packet centre x, cloud stride, cloud window start x, unused
  magnet1: vec4<f32>,   // profile, cos(theta), sin(theta), uniform-part factor
  magnet2: vec4<f32>,   // profile, cos(theta), sin(theta), field shape (0 textbook, 1 knife edge)
  xwave: vec4<f32>,     // packet centre x, tau = hbar t / (m sigma^2), time, number of 2D cells
  axes: vec4<f32>,      // measurement axes n1 = (y, z), n2 = (y, z)
  viewProj: mat4x4<f32>,
  // Full 3D engine: the grid moves with the packet (Galilean frame); grid x' = x - Xc.
  win: vec4<f32>,       // window centre Xc (grid x), cells along x', 1 when the 3D engine is on, ribbon factor (width across / width)
  mag3a: vec4<f32>,     // magnet 1 entrance, exit; magnet 2 entrance, exit (grid x)
  mag3b: vec4<f32>,     // magnet 1 theta, magnet 2 theta, ramp length, number of magnets
};
@group(0) @binding(0) var<uniform> uni: Uniforms;

struct WaveCell {
  psiUp: vec2<f32>,
  psiDown: vec2<f32>,
  prevUp: vec2<f32>,
  prevDown: vec2<f32>,
};

struct Spinor {
  up: vec2<f32>,
  down: vec2<f32>,
};

fn spinorZero() -> Spinor { return Spinor(vec2<f32>(0.0), vec2<f32>(0.0)); }
fn waveSpinor(cell: WaveCell) -> Spinor { return Spinor(cell.psiUp, cell.psiDown); }
fn spinorRho(s: Spinor) -> f32 { return dot(s.up, s.up) + dot(s.down, s.down); }
fn spinDensity(s: Spinor) -> vec3<f32> {
  return vec3<f32>(
    2.0 * (s.up.x * s.down.x + s.up.y * s.down.y),
    2.0 * (s.up.x * s.down.y - s.up.y * s.down.x),
    dot(s.up, s.up) - dot(s.down, s.down)
  );
}
fn imagConjMul(a: vec2<f32>, b: vec2<f32>) -> f32 { return a.x * b.y - a.y * b.x; }
fn mulNegI(z: vec2<f32>) -> vec2<f32> { return vec2<f32>(z.y, -z.x); }

// ── 2D grid across the beam ─────────────────────────────────────────────────
fn gridH() -> i32 { return i32(uni.sim.y); }
fn gridD() -> i32 { return i32(uni.sim.z); }
fn waveCountU() -> u32 { return u32(uni.xwave.w); }   // active wave cells (2D, or 3D window)
fn cellIndex(y: i32, z: i32) -> u32 { return u32(y + z * gridH()); }
fn boxCenterYZ() -> vec2<f32> { return 0.5 * (uni.sim.yz - vec2<f32>(1.0)); }
fn fieldScaleL() -> f32 { return max(1.0, 0.5 * (uni.sim.z - 1.0)); }

// ── Magnetic field ───────────────────────────────────────────────────────────
// One magnet in its own frame: B = g (-u, b0 + w) with (u, w) the coordinates across and
// along its gradient axis, measured from the box centre in units of L. The frame is turned
// by theta about the beam axis; divergence and curl are zero for any theta.
fn magnetFieldYZ(m: vec4<f32>, b0: f32, y: f32, z: f32) -> vec2<f32> {
  if (m.x <= 0.0) { return vec2<f32>(0.0); }
  let g = uni.sgField.x;
  let c = boxCenterYZ();
  let L = fieldScaleL();
  let dy = y - c.x;
  let dz = z - c.y;
  let u = (dy * m.y - dz * m.z) / L;
  let w = (dy * m.z + dz * m.y) / L;
  var bu = -g * u;
  var bv = g * (b0 + w);
  if (uni.magnet2.w > 0.5) {
    // Knife-edge field: the field of the knife edge taken as a line pole along the beam at
    // (u, w) = (0, hp): B = K (−u, hp − w) / (u² + (hp − w)²), divergence- and curl-free outside the
    // line. K = g hp² gives the textbook gradient g per L at the centre; the field there is g hp.
    // The gradient grows toward the edge and falls off to the sides, as under a knife edge.
    let hp = 1.5;
    let d = vec2<f32>(-u, hp - w);
    let f = g * hp * hp * d / max(dot(d, d), 1e-6);
    bu = f.x;
    bv = f.y;
  }
  return m.x * vec2<f32>(bu * m.y + bv * m.z, -bu * m.z + bv * m.y);
}
fn magneticFieldYZ(y: f32, z: f32) -> vec3<f32> {
  let b = magnetFieldYZ(uni.magnet1, uni.magnet1.w, y, z) + magnetFieldYZ(uni.magnet2, uni.magnet1.w, y, z);
  return vec3<f32>(0.0, b.x, b.y);
}

// ── Pauli equation, transverse part ──────────────────────────────────────────
fn sigmaDotB(s: Spinor, b: vec3<f32>) -> Spinor {
  let up = b.z * s.up + vec2<f32>(b.x * s.down.x + b.y * s.down.y, b.x * s.down.y - b.y * s.down.x);
  let down = vec2<f32>(b.x * s.up.x - b.y * s.up.y, b.x * s.up.y + b.y * s.up.x) - b.z * s.down;
  return Spinor(up, down);
}
// d(chi)/dt = i (hbar/2m) lap chi + i (1/2m) sigma.B chi
fn pauliRHS(s: Spinor, lap: Spinor, b: vec3<f32>) -> Spinor {
  let hbar = max(uni.physics.x, 1e-6);
  let mass = max(uni.physics.y, 1e-6);
  let cLap = hbar / (2.0 * mass);
  let zr = 1.0 / (2.0 * mass);
  let sb = sigmaDotB(s, b);
  let up = vec2<f32>(-cLap * lap.up.y, cLap * lap.up.x) - zr * mulNegI(sb.up);
  let down = vec2<f32>(-cLap * lap.down.y, cLap * lap.down.x) - zr * mulNegI(sb.down);
  return Spinor(up, down);
}

// ── Free Gaussian along the beam ─────────────────────────────────────────────
fn phiWidth2() -> f32 {
  let s = uni.packet.w;
  let tau = uni.xwave.y;
  return s * s * (1.0 + tau * tau);
}
fn phiRho(x: f32) -> f32 {
  let d = x - uni.xwave.x;
  let tau = uni.xwave.y;
  return exp(-d * d / phiWidth2()) / sqrt(1.0 + tau * tau);
}
fn phiDlnRho(x: f32) -> f32 { return -2.0 * (x - uni.xwave.x) / phiWidth2(); }
fn phiVelocity(x: f32) -> f32 {
  let hbar = max(uni.physics.x, 1e-6);
  let mass = max(uni.physics.y, 1e-6);
  let s = uni.packet.w;
  let tau = uni.xwave.y;
  return uni.physics.z / mass + (x - uni.xwave.x) * (hbar / (mass * s * s)) * tau / (1.0 + tau * tau);
}
fn phiPhase(x: f32) -> f32 {
  let hbar = max(uni.physics.x, 1e-6);
  let mass = max(uni.physics.y, 1e-6);
  let k = uni.physics.z / hbar;
  let s = uni.packet.w;
  let tau = uni.xwave.y;
  let x0 = uni.packet.x * (uni.sim.x - 1.0);
  let d = x - uni.xwave.x;
  // The carrier k(x - x0) - ħk²t/2m is left out: at the beam speed it oscillates faster than
  // the cloud's sampling along x, so the phase is shown relative to the beam's plane wave.
  return -0.5 * atan(tau) + d * d * tau / (2.0 * s * s * (1.0 + tau * tau));
}
// Drawing scale: lengths along the beam are drawn X_VIS times shorter than across it, so the
// long flight fits the view (the grid itself is unchanged).
const X_VIS: f32 = ${X_VIS};
fn worldScale() -> vec3<f32> { return vec3<f32>(X_VIS, 1.0, 1.0) * uni.visual1.w; }

fn quadCorner(v: u32) -> vec2<f32> {
  if (v == 0u) { return vec2<f32>(-0.5, -0.5); }
  if (v == 1u) { return vec2<f32>( 0.5, -0.5); }
  if (v == 2u) { return vec2<f32>(-0.5,  0.5); }
  if (v == 3u) { return vec2<f32>(-0.5,  0.5); }
  if (v == 4u) { return vec2<f32>( 0.5, -0.5); }
  return vec2<f32>(0.5, 0.5);
}

// ── Full 3D engine (window moving with the packet) ───────────────────────────
// Cell order: y fastest, then z, then x' (index = (ix * D + z) * H + y). The wave in the
// window is psi'(x', y, z) = exp(-i(p0 x - E0 t)/hbar) psi(Xc + x', y, z): the carrier is removed
// exactly (Galilean boost), so the grid only resolves the envelope.
fn win3NX() -> i32 { return i32(uni.win.y); }
fn engine3D() -> bool { return uni.win.z > 0.5; }
fn cell3(ix: i32, y: i32, z: i32) -> u32 { return u32((ix * gridD() + z) * gridH() + y); }
fn winX0() -> f32 { return 0.5 * f32(win3NX() - 1); }           // x' = ix - winX0
fn smooth01w(t: f32) -> f32 { let u = clamp(t, 0.0, 1.0); return u * u * (3.0 - 2.0 * u); }
fn profile3(x: f32, a: f32, b: f32) -> f32 {
  let r = max(uni.mag3b.z, 1e-3);
  return smooth01w((x - a) / r) * smooth01w((b - x) / r);
}
// The field where this part of the packet is: B(x, y, z) = sum of p_k(x) B_k(y, z).
fn magneticField3(xLab: f32, y: f32, z: f32) -> vec3<f32> {
  let b0 = uni.magnet1.w;
  let t1 = uni.mag3b.x;
  var b = magnetFieldYZ(vec4<f32>(profile3(xLab, uni.mag3a.x, uni.mag3a.y), cos(t1), sin(t1), 0.0), b0, y, z);
  if (uni.mag3b.w > 1.5) {
    let t2 = uni.mag3b.y;
    b = b + magnetFieldYZ(vec4<f32>(profile3(xLab, uni.mag3a.z, uni.mag3a.w), cos(t2), sin(t2), 0.0), b0, y, z);
  }
  return vec3<f32>(0.0, b.x, b.y);
}
