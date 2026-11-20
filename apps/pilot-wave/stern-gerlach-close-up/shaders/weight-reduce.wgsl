
// Orthodox reading: per workgroup, (1) sums of |chi|^2 on the + side of axis n1, on the + side
// of n2, on the + side of both, and in total; (2) the spin density chi^dagger sigma chi; (3) the
// first moments of |chi|^2 in y and z. The x factor |phi|^2 integrates to the same constant
// everywhere, so it cancels in the probabilities and in <sigma>.
@group(0) @binding(1) var<storage, read> waveIn: array<WaveCell>;
@group(0) @binding(2) var<storage, read_write> partialSums: array<vec4<f32>>;

var<workgroup> wgSums: array<vec4<f32>, ${WAVE_WORKGROUP_SIZE}>;
var<workgroup> wgSpin: array<vec4<f32>, ${WAVE_WORKGROUP_SIZE}>;
var<workgroup> wgMoment: array<vec4<f32>, ${WAVE_WORKGROUP_SIZE}>;

@compute @workgroup_size(${WAVE_WORKGROUP_SIZE})
fn main(
  @builtin(global_invocation_id) gid: vec3<u32>,
  @builtin(local_invocation_index) lid: u32,
  @builtin(workgroup_id) wid: vec3<u32>
) {
  let id = gid.x;
  var sums = vec4<f32>(0.0);
  var spin = vec4<f32>(0.0);
  var moment = vec4<f32>(0.0);
  if (id < waveCountU()) {
    let H = u32(gridH());
    let c = boxCenterYZ();
    let r = vec2<f32>(f32(id % H), f32(id / H)) - c;
    let chi = waveSpinor(waveIn[id]);
    let rho = spinorRho(chi);
    spin = vec4<f32>(spinDensity(chi), 0.0);
    moment = vec4<f32>(rho * r.x, rho * r.y, 0.0, 0.0);
    let a = dot(r, uni.axes.xy) > 0.0;
    let b = dot(r, uni.axes.zw) > 0.0;
    sums = vec4<f32>(select(0.0, rho, a), select(0.0, rho, b), select(0.0, rho, a && b), rho);
  }
  wgSums[lid] = sums;
  wgSpin[lid] = spin;
  wgMoment[lid] = moment;
  workgroupBarrier();
  var stride = ${WAVE_WORKGROUP_SIZE}u / 2u;
  loop {
    if (stride == 0u) { break; }
    if (lid < stride) {
      wgSums[lid] = wgSums[lid] + wgSums[lid + stride];
      wgSpin[lid] = wgSpin[lid] + wgSpin[lid + stride];
      wgMoment[lid] = wgMoment[lid] + wgMoment[lid + stride];
    }
    workgroupBarrier();
    stride = stride / 2u;
  }
  if (lid == 0u) {
    partialSums[3u * wid.x] = wgSums[0];
    partialSums[3u * wid.x + 1u] = wgSpin[0];
    partialSums[3u * wid.x + 2u] = wgMoment[0];
  }
}
