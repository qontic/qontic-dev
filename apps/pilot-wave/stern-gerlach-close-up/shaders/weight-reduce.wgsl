
// Orthodox reading: per workgroup, sums of |chi|^2 on the + side of axis n1, on the + side
// of n2, on the + side of both, and in total. The x factor |phi|^2 integrates to the same
// constant everywhere, so it cancels in the probabilities.
@group(0) @binding(1) var<storage, read> waveIn: array<WaveCell>;
@group(0) @binding(2) var<storage, read_write> partialSums: array<vec4<f32>>;

var<workgroup> wgSums: array<vec4<f32>, ${WAVE_WORKGROUP_SIZE}>;

@compute @workgroup_size(${WAVE_WORKGROUP_SIZE})
fn main(
  @builtin(global_invocation_id) gid: vec3<u32>,
  @builtin(local_invocation_index) lid: u32,
  @builtin(workgroup_id) wid: vec3<u32>
) {
  let id = gid.x;
  var sums = vec4<f32>(0.0);
  if (id < waveCountU()) {
    let H = u32(gridH());
    let c = boxCenterYZ();
    let r = vec2<f32>(f32(id % H), f32(id / H)) - c;
    let rho = spinorRho(waveSpinor(waveIn[id]));
    let a = dot(r, uni.axes.xy) > 0.0;
    let b = dot(r, uni.axes.zw) > 0.0;
    sums = vec4<f32>(select(0.0, rho, a), select(0.0, rho, b), select(0.0, rho, a && b), rho);
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
