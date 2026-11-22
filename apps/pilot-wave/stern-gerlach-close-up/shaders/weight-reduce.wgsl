
// Orthodox reading: per workgroup, (1) the weight of |chi|^2 in each of the four outcome regions
// (nearest expected spot centre); (2) the spin density chi^dagger sigma chi; (3) the first moments of
// |chi|^2 in y and z. The x factor |phi|^2 integrates to the same constant everywhere, so it cancels
// in the probabilities and in <sigma>.
@group(0) @binding(1) var<storage, read> waveIn: array<WaveCell>;
@group(0) @binding(2) var<storage, read_write> partialSums: array<vec4<f32>>;
@group(0) @binding(3) var<storage, read> waveIn3: array<vec4<f32>>;   // Full 3D window (dummy for the fast engine)

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
    let r = vec2<f32>(f32(id % H), f32((id / H) % u32(gridD()))) - c;   // 2D grid or 3D window
    var chi: Spinor;
    if (engine3D()) { chi = spinor4(waveIn3[id]); } else { chi = waveSpinor(waveIn[id]); }
    let rho = spinorRho(chi);
    spin = vec4<f32>(spinDensity(chi), 0.0);
    // Third slot: first moment along the beam in the 3D window (x' from the window centre).
    let xp = select(0.0, f32(id / (H * u32(gridD()))) - winX0(), engine3D());
    moment = vec4<f32>(rho * r.x, rho * r.y, rho * xp, 0.0);
    // Weight of |chi|^2 in each outcome region (nearest expected spot centre).
    let k = regionIndex(r);
    sums = vec4<f32>(select(0.0, rho, k == 0u), select(0.0, rho, k == 1u), select(0.0, rho, k == 2u), select(0.0, rho, k == 3u));
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
