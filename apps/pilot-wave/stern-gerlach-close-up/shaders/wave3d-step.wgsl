// Full 3D engine: one leapfrog step of the Pauli equation in the window moving with the packet,
// with a fourth-order Laplacian in x', y, z and hard walls on all faces of the window. Each cell
// feels the field at its own position along the beam, Xc + x'.
// psi(t) is read from waveCur; psi(t - dt) in wavePrev is replaced by psi(t + dt) in place
// (each cell reads and writes only its own entry there).
@group(0) @binding(1) var<storage, read> waveCur: array<vec4<f32>>;
@group(0) @binding(2) var<storage, read_write> wavePrev: array<vec4<f32>>;

fn fetch3(ix: i32, y: i32, z: i32) -> Spinor {
  if (ix < 0 || y < 0 || z < 0 || ix >= win3NX() || y >= gridH() || z >= gridD()) { return spinorZero(); }
  return spinor4(waveCur[cell3(ix, y, z)]);
}
fn lap1(c: vec2<f32>, p1: vec2<f32>, p2: vec2<f32>, m1: vec2<f32>, m2: vec2<f32>) -> vec2<f32> {
  return (-p2 + 16.0 * p1 - 30.0 * c + 16.0 * m1 - m2) / 12.0;
}

@compute @workgroup_size(${WAVE_WORKGROUP_SIZE})
fn main(@builtin(global_invocation_id) gid: vec3<u32>) {
  let id = gid.x;
  if (id >= waveCountU()) { return; }
  let H = u32(gridH());
  let D = u32(gridD());
  let y = i32(id % H);
  let z = i32((id / H) % D);
  let ix = i32(id / (H * D));
  if (y <= 0 || z <= 0 || ix <= 0 || y >= gridH() - 1 || z >= gridD() - 1 || ix >= win3NX() - 1) {
    wavePrev[id] = vec4<f32>(0.0);
    return;
  }
  let c = spinor4(waveCur[id]);
  let xp1 = fetch3(ix + 1, y, z); let xp2 = fetch3(ix + 2, y, z);
  let xm1 = fetch3(ix - 1, y, z); let xm2 = fetch3(ix - 2, y, z);
  let yp1 = fetch3(ix, y + 1, z); let yp2 = fetch3(ix, y + 2, z);
  let ym1 = fetch3(ix, y - 1, z); let ym2 = fetch3(ix, y - 2, z);
  let zp1 = fetch3(ix, y, z + 1); let zp2 = fetch3(ix, y, z + 2);
  let zm1 = fetch3(ix, y, z - 1); let zm2 = fetch3(ix, y, z - 2);
  let lap = Spinor(
    lap1(c.up, xp1.up, xp2.up, xm1.up, xm2.up) + lap1(c.up, yp1.up, yp2.up, ym1.up, ym2.up) + lap1(c.up, zp1.up, zp2.up, zm1.up, zm2.up),
    lap1(c.down, xp1.down, xp2.down, xm1.down, xm2.down) + lap1(c.down, yp1.down, yp2.down, ym1.down, ym2.down) + lap1(c.down, zp1.down, zp2.down, zm1.down, zm2.down)
  );
  let xLab = uni.win.x + f32(ix) - winX0();
  let rhs = pauliRHS(c, lap, magneticField3(xLab, f32(y), f32(z)));
  let dt2 = 2.0 * uni.physics.w;
  let next = blockMask(f32(y), f32(z)) * (wavePrev[id] + dt2 * vec4<f32>(rhs.up, rhs.down));
  // Values with |psi'|^2 < 1e-24 (the packet peak is ~1e-2 or more) are set to zero, so the empty
  // part of the window holds exact zeros rather than ever-smaller numbers, which slowed the
  // step down on some GPUs once the field had spread the wave. No visible or measurable effect.
  wavePrev[id] = select(next, vec4<f32>(0.0), dot(next, next) < 1e-24);
}
