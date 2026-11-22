
@group(0) @binding(1) var<storage, read> waveIn: array<WaveCell>;
@group(0) @binding(2) var<storage, read_write> waveOut: array<WaveCell>;

fn fetch2(y: i32, z: i32) -> Spinor {
  if (y < 0 || z < 0 || y >= gridH() || z >= gridD()) { return spinorZero(); }
  return waveSpinor(waveIn[cellIndex(y, z)]);
}
fn lapComponent(c: vec2<f32>, n1: vec2<f32>, n2: vec2<f32>, s1: vec2<f32>, s2: vec2<f32>,
                e1: vec2<f32>, e2: vec2<f32>, w1: vec2<f32>, w2: vec2<f32>) -> vec2<f32> {
  return (-n2 + 16.0 * n1 - 30.0 * c + 16.0 * s1 - s2 - e2 + 16.0 * e1 - 30.0 * c + 16.0 * w1 - w2) / 12.0;
}

@compute @workgroup_size(${WAVE_WORKGROUP_SIZE})
fn main(@builtin(global_invocation_id) gid: vec3<u32>) {
  let id = gid.x;
  if (id >= waveCountU()) { return; }
  let H = u32(gridH());
  let y = i32(id % H);
  let z = i32(id / H);
  if (y <= 0 || z <= 0 || y >= gridH() - 1 || z >= gridD() - 1) {
    waveOut[id] = WaveCell(vec2<f32>(0.0), vec2<f32>(0.0), vec2<f32>(0.0), vec2<f32>(0.0));
    return;
  }
  let state = waveIn[id];
  let c = Spinor(state.psiUp, state.psiDown);
  let yp1 = fetch2(y + 1, z); let yp2 = fetch2(y + 2, z);
  let ym1 = fetch2(y - 1, z); let ym2 = fetch2(y - 2, z);
  let zp1 = fetch2(y, z + 1); let zp2 = fetch2(y, z + 2);
  let zm1 = fetch2(y, z - 1); let zm2 = fetch2(y, z - 2);
  let lap = Spinor(
    lapComponent(c.up, yp1.up, yp2.up, ym1.up, ym2.up, zp1.up, zp2.up, zm1.up, zm2.up),
    lapComponent(c.down, yp1.down, yp2.down, ym1.down, ym2.down, zp1.down, zp2.down, zm1.down, zm2.down)
  );
  let rhs = pauliRHS(c, lap, magneticFieldYZ(f32(y), f32(z)));
  let dt2 = 2.0 * uni.physics.w;
  let m = blockMask(f32(y), f32(z));
  waveOut[id] = WaveCell(m * (state.prevUp + dt2 * rhs.up), m * (state.prevDown + dt2 * rhs.down), m * c.up, m * c.down);
}
