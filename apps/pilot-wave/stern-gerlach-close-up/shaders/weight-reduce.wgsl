
// Sums |Psi|^2 above the packet-centre height and in total, per workgroup.
// The orthodox reading shows the upper/lower probability weights from these sums.
@group(0) @binding(1) var<storage, read> waveIn: array<WaveCell>;
@group(0) @binding(2) var<storage, read_write> partialSums: array<vec2<f32>>;

var<workgroup> wgSums: array<vec2<f32>, ${WAVE_WORKGROUP_SIZE}>;

@compute @workgroup_size(${WAVE_WORKGROUP_SIZE})
fn main(
  @builtin(global_invocation_id) gid: vec3<u32>,
  @builtin(local_invocation_index) lid: u32,
  @builtin(workgroup_id) wid: vec3<u32>
) {
  let id = gid.x;
  var sums = vec2<f32>(0.0);
  if (id < u32(uni.sim.w)) {
    let s = simResU();
    let z = id / (s.x * s.y);
    let rem = id - z * s.x * s.y;
    let x = rem - (rem / s.x) * s.x;
    // x = s.x - 1 duplicates x = 0 on the periodic grid; count each point once.
    if (x < s.x - 1u || s.x == 1u) {
      let rho = spinorRho(waveSpinor(waveIn[id]));
      let zMid = uni.packet.z * (uni.sim.z - 1.0);
      sums = vec2<f32>(select(0.0, rho, f32(z) > zMid), rho);
    }
  }
  wgSums[lid] = sums;
  workgroupBarrier();
  var stride = ${WAVE_WORKGROUP_SIZE}u / 2u;
  loop {
    if (stride == 0u) { break; }
    if (lid < stride) { wgSums[lid] = wgSums[lid] + wgSums[lid + stride]; }
    workgroupBarrier();
    stride = stride / 2u;
  }
  if (lid == 0u) { partialSums[wid.x] = wgSums[0]; }
}
