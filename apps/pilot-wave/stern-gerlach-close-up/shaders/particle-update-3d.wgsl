// Full 3D engine version of particle-update.wgsl (same bindings and plate handling).
@group(0) @binding(1) var<storage, read> wave: array<vec4<f32>>;
@group(0) @binding(2) var<storage, read> particlesIn: array<vec4<f32>>;
@group(0) @binding(3) var<storage, read_write> particlesOut: array<vec4<f32>>;
// Spin direction of the wave at each dot: Psi^dagger sigma Psi / Psi^dagger Psi (a unit vector).
@group(0) @binding(4) var<storage, read_write> spinOut: array<vec4<f32>>;
// RK4 scratch per dot: [2i] = position of the next stage, [2i + 1] = running sum of weighted velocities.
@group(0) @binding(5) var<storage, read_write> rk: array<vec4<f32>>;

fn fetchCell3(ix: i32, y: i32, z: i32) -> Spinor {
  if (ix < 0 || y < 0 || z < 0 || ix >= win3NX() || y >= gridH() || z >= gridD()) { return spinorZero(); }
  return spinor4(wave[cell3(ix, y, z)]);
}
fn mixSpinor(a: Spinor, b: Spinor, t: f32) -> Spinor {
  return Spinor(mix(a.up, b.up, t), mix(a.down, b.down, t));
}
// Trilinear sample of psi' at window coordinates (u = x' + winX0, y, z).
fn sample3(u: f32, y: f32, z: f32) -> Spinor {
  let u0 = floor(u); let y0 = floor(y); let z0 = floor(z);
  let fu = u - u0; let fy = y - y0; let fz = z - z0;
  let iu = i32(u0); let iy = i32(y0); let iz = i32(z0);
  let a = mixSpinor(mixSpinor(fetchCell3(iu, iy, iz), fetchCell3(iu, iy + 1, iz), fy),
                    mixSpinor(fetchCell3(iu, iy, iz + 1), fetchCell3(iu, iy + 1, iz + 1), fy), fz);
  let b = mixSpinor(mixSpinor(fetchCell3(iu + 1, iy, iz), fetchCell3(iu + 1, iy + 1, iz), fy),
                    mixSpinor(fetchCell3(iu + 1, iy, iz + 1), fetchCell3(iu + 1, iy + 1, iz + 1), fy), fz);
  return mixSpinor(a, b, fu);
}
fn deriv4(p2: Spinor, p1: Spinor, m1: Spinor, m2: Spinor) -> Spinor {
  return Spinor(
    (-p2.up + 8.0 * p1.up - 8.0 * m1.up + m2.up) / 12.0,
    (-p2.down + 8.0 * p1.down - 8.0 * m1.down + m2.down) / 12.0
  );
}
fn dSpin4(p2: Spinor, p1: Spinor, m1: Spinor, m2: Spinor) -> vec3<f32> {
  return (-spinDensity(p2) + 8.0 * spinDensity(p1) - 8.0 * spinDensity(m1) + spinDensity(m2)) / 12.0;
}

// Full 3D engine: velocity from the Pauli current of psi = exp(i(p0 x - E0 t)/hbar) psi'(x - Xc):
// v = p0/m + (hbar/m) Im(psi'* grad psi')/rho, plus s (hbar/m) curl(psi'^dagger sigma psi')/rho.
fn guidingVelocity(p: vec3<f32>) -> vec3<f32> {
  let u = p.x - uni.win.x + winX0();
  let y = p.y;
  let z = p.z;
  let hbar = max(uni.physics.x, 1e-6);
  let mass = max(uni.physics.y, 1e-6);
  let v0 = uni.physics.z / mass;
  if (u < 2.0 || u > f32(win3NX()) - 3.0) { return vec3<f32>(v0, 0.0, 0.0); }
  let c = sample3(u, y, z);
  let xp1 = sample3(u + 1.0, y, z); let xp2 = sample3(u + 2.0, y, z);
  let xm1 = sample3(u - 1.0, y, z); let xm2 = sample3(u - 2.0, y, z);
  let yp1 = sample3(u, y + 1.0, z); let yp2 = sample3(u, y + 2.0, z);
  let ym1 = sample3(u, y - 1.0, z); let ym2 = sample3(u, y - 2.0, z);
  let zp1 = sample3(u, y, z + 1.0); let zp2 = sample3(u, y, z + 2.0);
  let zm1 = sample3(u, y, z - 1.0); let zm2 = sample3(u, y, z - 2.0);
  let dx = deriv4(xp2, xp1, xm1, xm2);
  let dy = deriv4(yp2, yp1, ym1, ym2);
  let dz = deriv4(zp2, zp1, zm1, zm2);
  let rhoEff = max(spinorRho(c), uni.particle1.x);
  let scale = hbar / mass;
  var v = vec3<f32>(
    v0 + scale * (imagConjMul(c.up, dx.up) + imagConjMul(c.down, dx.down)) / rhoEff,
    scale * (imagConjMul(c.up, dy.up) + imagConjMul(c.down, dy.down)) / rhoEff,
    scale * (imagConjMul(c.up, dz.up) + imagConjMul(c.down, dz.down)) / rhoEff
  );
  let s = uni.particle0.w;
  if (s != 0.0) {
    let dMx = dSpin4(xp2, xp1, xm1, xm2);
    let dMy = dSpin4(yp2, yp1, ym1, ym2);
    let dMz = dSpin4(zp2, zp1, zm1, zm2);
    let curl = vec3<f32>(dMy.z - dMz.y, dMz.x - dMx.z, dMx.y - dMy.x);
    v = v + s * scale * curl / rhoEff;
  }
  let sp = length(v);
  if (sp > uni.particle1.y) { v = v * (uni.particle1.y / sp); }
  return v;
}
fn spinAt(p: vec3<f32>) -> vec3<f32> {
  return spinDensity(sample3(p.x - uni.win.x + winX0(), p.y, p.z));
}
fn modf1(x: f32, y: f32) -> f32 { return x - y * floor(x / y); }
fn reflectCoord(x: f32, lo: f32, hi: f32) -> f32 {
  if (hi <= lo) { return 0.5 * (lo + hi); }
  let width = hi - lo;
  let period = 2.0 * width;
  let y = modf1(x - lo, period);
  return lo + select(period - y, y, y <= width);
}
fn reflectIntoBox(p: vec3<f32>) -> vec3<f32> {
  return vec3<f32>(
    p.x,
    reflectCoord(p.y, 1.001, uni.sim.y - 2.001),
    reflectCoord(p.z, 1.001, uni.sim.z - 2.001)
  );
}
fn particleIsFrozen(state: vec4<f32>) -> bool {
  return uni.detector.y > 0.5 && state.w >= uni.detector.x - 1e-4;
}
fn detectorFlashBrightness(currentBrightness: f32) -> f32 {
  let targetBrightness = 2.0;
  let flashDecayTime = 0.2;
  let decay = exp(-uni.physics.w / flashDecayTime);
  return max(targetBrightness, targetBrightness + (currentBrightness - targetBrightness) * decay);
}

// RK4 in four dispatches, one per stage (the dispatch has stage + 1 workgroup rows; only the
// last row works), so the shader holds the velocity code once instead of four times: the fully
// written-out step took tens of seconds to compile on some Windows drivers. Same arithmetic:
// stages at x, x + dt/2 v1, x + dt/2 v2, x + dt v3; x_new = x + dt/6 (v1 + 2 v2 + 2 v3 + v4).
@compute @workgroup_size(${PARTICLE_WORKGROUP_SIZE})
fn main(@builtin(global_invocation_id) gid: vec3<u32>, @builtin(num_workgroups) groups: vec3<u32>) {
  let stage = groups.y - 1u;
  if (gid.y != stage) { return; }
  let id = gid.x;
  if (id >= u32(uni.particle1.z)) { return; }
  let state = particlesIn[id];
  let frozen = particleIsFrozen(state);
  let dt = uni.physics.w;
  let x = vec3<f32>(state.w, state.y, state.z);
  if (stage < 3u) {
    if (frozen) { return; }
    let at = select(rk[2u * id].xyz, x, stage == 0u);
    let v = guidingVelocity(at);
    let acc = select(rk[2u * id + 1u].xyz, vec3<f32>(0.0), stage == 0u) + select(2.0, 1.0, stage == 0u) * v;
    rk[2u * id] = vec4<f32>(reflectIntoBox(x + select(0.5, 1.0, stage == 2u) * dt * v), 0.0);
    rk[2u * id + 1u] = vec4<f32>(acc, 0.0);
    return;
  }
  if (frozen) {
    particlesOut[id] = vec4<f32>(detectorFlashBrightness(state.x), state.y, state.z, state.w);
    return;
  }
  let acc = rk[2u * id + 1u].xyz + guidingVelocity(rk[2u * id].xyz);
  let xn = reflectIntoBox(x + (dt / 6.0) * acc);
  if (uni.detector.y > 0.5 && x.x < uni.detector.x && xn.x >= uni.detector.x) {
    let t = clamp((uni.detector.x - x.x) / max(1e-6, xn.x - x.x), 0.0, 1.0);
    let hit = mix(x, xn, t);
    particlesOut[id] = vec4<f32>(10000.0, hit.y, hit.z, uni.detector.x);
    let mh = spinAt(hit);
    if (length(mh) > 1e-12) { spinOut[id] = vec4<f32>(normalize(mh), 1.0); }
    return;
  }
  particlesOut[id] = vec4<f32>(xn.x, xn.y, xn.z, xn.x);
  let m = spinAt(xn);
  let len = length(m);
  if (len > 1e-12) { spinOut[id] = vec4<f32>(m / len, 1.0); }
}
