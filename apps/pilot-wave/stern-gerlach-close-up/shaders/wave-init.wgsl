
@group(0) @binding(1) var<storage, read_write> waveOut: array<WaveCell>;

fn initialAmp(y: f32, z: f32) -> f32 {
  let H = uni.sim.y;
  let D = uni.sim.z;
  if (y <= 0.0 || z <= 0.0 || y >= H - 1.0 || z >= D - 1.0) { return 0.0; }
  let y0 = uni.packet.y * (H - 1.0);
  let z0 = uni.packet.z * (D - 1.0);
  let s = uni.packet.w;
  let sy = s * max(uni.win.w, 1.0);   // a ribbon beam is wider across (grid y = lab x)
  return exp(-(y - y0) * (y - y0) / (2.0 * sy * sy) - (z - z0) * (z - z0) / (2.0 * s * s));
}

@compute @workgroup_size(${WAVE_WORKGROUP_SIZE})
fn main(@builtin(global_invocation_id) gid: vec3<u32>) {
  let id = gid.x;
  if (id >= waveCountU()) { return; }
  let H = u32(gridH());
  let yi = i32(id % H);
  let zi = i32(id / H);
  if (yi <= 0 || zi <= 0 || yi >= gridH() - 1 || zi >= gridD() - 1) {
    waveOut[id] = WaveCell(vec2<f32>(0.0), vec2<f32>(0.0), vec2<f32>(0.0), vec2<f32>(0.0));
    return;
  }
  let y = f32(yi);
  let z = f32(zi);
  let a0 = initialAmp(y, z);
  let lap = (
    -initialAmp(y + 2.0, z) + 16.0 * initialAmp(y + 1.0, z) - 30.0 * a0 + 16.0 * initialAmp(y - 1.0, z) - initialAmp(y - 2.0, z)
    -initialAmp(y, z + 2.0) + 16.0 * initialAmp(y, z + 1.0) - 30.0 * a0 + 16.0 * initialAmp(y, z - 1.0) - initialAmp(y, z - 2.0)
  ) / 12.0;
  // Spin direction (θ, φ): spinor (cos θ/2, e^{iφ} sin θ/2).
  let th = uni.sgField.z;
  let ph = uni.sgField.w;
  let up = vec2<f32>(cos(0.5 * th), 0.0);
  let dn = sin(0.5 * th) * vec2<f32>(cos(ph), sin(ph));
  let psi = Spinor(up * a0, dn * a0);
  let lapS = Spinor(up * lap, dn * lap);
  let rhs = pauliRHS(psi, lapS, magneticFieldYZ(y, z));
  let dt = uni.physics.w;
  waveOut[id] = WaveCell(psi.up, psi.down, psi.up - dt * rhs.up, psi.down - dt * rhs.down);
}
