@group(0) @binding(1) var<storage, read> wave: array<WaveCell>;
@group(0) @binding(2) var<storage, read> particlesIn: array<vec4<f32>>;
@group(0) @binding(3) var<storage, read_write> particlesOut: array<vec4<f32>>;
// Spin direction of the wave at each dot: Psi^dagger sigma Psi / Psi^dagger Psi (a unit vector).
@group(0) @binding(4) var<storage, read_write> spinOut: array<vec4<f32>>;

fn fetchCell(y: i32, z: i32) -> Spinor {
  if (y < 0 || z < 0 || y >= gridH() || z >= gridD()) { return spinorZero(); }
  return waveSpinor(wave[cellIndex(y, z)]);
}
fn mixSpinor(a: Spinor, b: Spinor, t: f32) -> Spinor {
  return Spinor(mix(a.up, b.up, t), mix(a.down, b.down, t));
}
fn sampleChi(y: f32, z: f32) -> Spinor {
  let y0 = floor(y);
  let z0 = floor(z);
  let fy = y - y0;
  let fz = z - z0;
  let iy = i32(y0);
  let iz = i32(z0);
  let a = mixSpinor(fetchCell(iy, iz), fetchCell(iy + 1, iz), fy);
  let b = mixSpinor(fetchCell(iy, iz + 1), fetchCell(iy + 1, iz + 1), fy);
  return mixSpinor(a, b, fz);
}
fn deriv4(p2: Spinor, p1: Spinor, m1: Spinor, m2: Spinor) -> Spinor {
  return Spinor(
    (-p2.up + 8.0 * p1.up - 8.0 * m1.up + m2.up) / 12.0,
    (-p2.down + 8.0 * p1.down - 8.0 * m1.down + m2.down) / 12.0
  );
}

// Velocity from the Pauli current of Psi = phi(x) chi(y, z): x from the free Gaussian,
// y and z from chi, plus s times the spin term (hbar/m) curl(Psi^dagger sigma Psi) / rho.
fn guidingVelocity(p: vec3<f32>) -> vec3<f32> {
  let y = p.y;
  let z = p.z;
  let c = sampleChi(y, z);
  let yp1 = sampleChi(y + 1.0, z); let yp2 = sampleChi(y + 2.0, z);
  let ym1 = sampleChi(y - 1.0, z); let ym2 = sampleChi(y - 2.0, z);
  let zp1 = sampleChi(y, z + 1.0); let zp2 = sampleChi(y, z + 2.0);
  let zm1 = sampleChi(y, z - 1.0); let zm2 = sampleChi(y, z - 2.0);
  let dy = deriv4(yp2, yp1, ym1, ym2);
  let dz = deriv4(zp2, zp1, zm1, zm2);
  let rhoEff = max(spinorRho(c), uni.particle1.x);
  let scale = max(uni.physics.x, 1e-6) / max(uni.physics.y, 1e-6);
  var v = vec3<f32>(
    phiVelocity(p.x),
    scale * (imagConjMul(c.up, dy.up) + imagConjMul(c.down, dy.down)) / rhoEff,
    scale * (imagConjMul(c.up, dz.up) + imagConjMul(c.down, dz.down)) / rhoEff
  );
  let s = uni.particle0.w;
  if (s != 0.0) {
    let m = spinDensity(c);
    let dMy = (-spinDensity(yp2) + 8.0 * spinDensity(yp1) - 8.0 * spinDensity(ym1) + spinDensity(ym2)) / 12.0;
    let dMz = (-spinDensity(zp2) + 8.0 * spinDensity(zp1) - 8.0 * spinDensity(zm1) + spinDensity(zm2)) / 12.0;
    let dl = phiDlnRho(p.x);  // d ln|phi|^2 / dx
    let curl = vec3<f32>(dMy.z - dMz.y, dMz.x - m.z * dl, m.y * dl - dMy.x);
    v = v + s * scale * curl / rhoEff;
  }
  let sp = length(v);
  if (sp > uni.particle1.y) { v = v * (uni.particle1.y / sp); }
  return v;
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

@compute @workgroup_size(${PARTICLE_WORKGROUP_SIZE})
fn main(@builtin(global_invocation_id) gid: vec3<u32>) {
  let id = gid.x;
  if (id >= u32(uni.particle1.z)) { return; }
  let state = particlesIn[id];
  if (particleIsFrozen(state)) {
    particlesOut[id] = vec4<f32>(detectorFlashBrightness(state.x), state.y, state.z, state.w);
    return;
  }
  let dt = uni.physics.w;
  let x = vec3<f32>(state.w, state.y, state.z);
  let v1 = guidingVelocity(x);
  let v2 = guidingVelocity(reflectIntoBox(x + 0.5 * dt * v1));
  let v3 = guidingVelocity(reflectIntoBox(x + 0.5 * dt * v2));
  let v4 = guidingVelocity(reflectIntoBox(x + dt * v3));
  let xn = reflectIntoBox(x + (dt / 6.0) * (v1 + 2.0 * v2 + 2.0 * v3 + v4));
  if (uni.detector.y > 0.5 && x.x < uni.detector.x && xn.x >= uni.detector.x) {
    let t = clamp((uni.detector.x - x.x) / max(1e-6, xn.x - x.x), 0.0, 1.0);
    let hit = mix(x, xn, t);
    particlesOut[id] = vec4<f32>(10000.0, hit.y, hit.z, uni.detector.x);
    let mh = spinDensity(sampleChi(hit.y, hit.z));
    if (length(mh) > 1e-12) { spinOut[id] = vec4<f32>(normalize(mh), 1.0); }
    return;
  }
  particlesOut[id] = vec4<f32>(xn.x, xn.y, xn.z, xn.x);
  let m = spinDensity(sampleChi(xn.y, xn.z));
  let len = length(m);
  if (len > 1e-12) { spinOut[id] = vec4<f32>(m / len, 1.0); }
}
