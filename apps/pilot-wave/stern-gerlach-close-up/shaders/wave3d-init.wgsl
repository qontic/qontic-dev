// Full 3D engine: initial packet in the moving window, a Gaussian in x', y, z with the chosen
// spin, and prev = psi - dt * rhs for the first leapfrog step.
@group(0) @binding(1) var<storage, read_write> waveOut: array<WaveCell>;

fn amp3(xp: f32, y: f32, z: f32) -> f32 {
  let H = uni.sim.y;
  let D = uni.sim.z;
  if (y <= 0.0 || z <= 0.0 || y >= H - 1.0 || z >= D - 1.0) { return 0.0; }
  if (abs(xp) >= winX0()) { return 0.0; }
  let y0 = uni.packet.y * (H - 1.0);
  let z0 = uni.packet.z * (D - 1.0);
  let s = uni.packet.w;
  let sy = s * max(uni.win.w, 1.0);
  return exp(-(xp * xp + (z - z0) * (z - z0)) / (2.0 * s * s) - (y - y0) * (y - y0) / (2.0 * sy * sy));
}

@compute @workgroup_size(${WAVE_WORKGROUP_SIZE})
fn main(@builtin(global_invocation_id) gid: vec3<u32>) {
  let id = gid.x;
  if (id >= waveCountU()) { return; }
  let H = u32(gridH());
  let D = u32(gridD());
  let y = f32(id % H);
  let z = f32((id / H) % D);
  let ix = f32(id / (H * D));
  let xp = ix - winX0();
  let a0 = amp3(xp, y, z);
  let lap = (
    -amp3(xp + 2.0, y, z) + 16.0 * amp3(xp + 1.0, y, z) - 30.0 * a0 + 16.0 * amp3(xp - 1.0, y, z) - amp3(xp - 2.0, y, z)
    -amp3(xp, y + 2.0, z) + 16.0 * amp3(xp, y + 1.0, z) - 30.0 * a0 + 16.0 * amp3(xp, y - 1.0, z) - amp3(xp, y - 2.0, z)
    -amp3(xp, y, z + 2.0) + 16.0 * amp3(xp, y, z + 1.0) - 30.0 * a0 + 16.0 * amp3(xp, y, z - 1.0) - amp3(xp, y, z - 2.0)
  ) / 12.0;
  let th = uni.sgField.z;
  let ph = uni.sgField.w;
  let up = vec2<f32>(cos(0.5 * th), 0.0);
  let dn = sin(0.5 * th) * vec2<f32>(cos(ph), sin(ph));
  let psi = Spinor(up * a0, dn * a0);
  let lapS = Spinor(up * lap, dn * lap);
  let rhs = pauliRHS(psi, lapS, magneticField3(uni.win.x + xp, y, z));
  let dt = uni.physics.w;
  waveOut[id] = WaveCell(psi.up, psi.down, psi.up - dt * rhs.up, psi.down - dt * rhs.down);
}
