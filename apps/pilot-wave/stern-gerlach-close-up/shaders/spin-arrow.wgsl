// Pilot-wave reading: a short arrow on every k-th dot (k = visual2.w) along the spin direction
// of the wave at the dot. Drawn in screen space: a shaft and a head.
@group(0) @binding(1) var<storage, read> particles: array<vec4<f32>>;
@group(0) @binding(2) var<storage, read> spins: array<vec4<f32>>;

struct ArrowOut {
  @builtin(position) position: vec4<f32>,
  @location(0) fade: f32,
};

const ARROW_CELLS: f32 = 7.0;

@vertex
fn vs(@builtin(vertex_index) vi: u32, @builtin(instance_index) ii: u32) -> ArrowOut {
  var out: ArrowOut;
  out.position = vec4<f32>(2.0, 2.0, 2.0, 1.0);
  out.fade = 0.0;
  let id = ii * u32(max(1.0, uni.visual2.w));
  if (id >= u32(uni.particle1.z)) { return out; }
  let state = particles[id];
  let s = spins[id];
  if (s.w < 0.5 || particleIsAbsorbed(state)) { return out; }
  let base = vec3<f32>(state.w, state.y, state.z) * worldScale();
  // The arrow keeps its true direction: no compression along the beam.
  let tip = base + s.xyz * ARROW_CELLS * uni.visual1.w;
  let c0 = uni.viewProj * vec4<f32>(base, 1.0);
  let c1 = uni.viewProj * vec4<f32>(tip, 1.0);
  if (c0.w <= 0.0 || c1.w <= 0.0) { return out; }
  let vp = max(uni.viewport.xy, vec2<f32>(1.0));
  let p0 = c0.xy / c0.w * 0.5 * vp;
  let p1 = c1.xy / c1.w * 0.5 * vp;
  let d = p1 - p0;
  let len = length(d);
  if (len < 2.0) { return out; }
  let t = d / len;
  let n = vec2<f32>(-t.y, t.x);
  let headLen = min(0.4 * len, 7.0);
  let neck = p1 - t * headLen;
  var p = p0;
  var w = 0.0;
  // 0-5: shaft quad, 6-8: head
  switch (vi) {
    case 0u: { p = p0; w = -0.9; }
    case 1u: { p = neck; w = -0.9; }
    case 2u: { p = neck; w = 0.9; }
    case 3u: { p = p0; w = -0.9; }
    case 4u: { p = neck; w = 0.9; }
    case 5u: { p = p0; w = 0.9; }
    case 6u: { p = neck; w = -3.2; }
    case 7u: { p = p1; w = 0.0; }
    default: { p = neck; w = 3.2; }
  }
  let q = p + n * w;
  let z = mix(c0.z / c0.w, c1.z / c1.w, 0.5);
  out.position = vec4<f32>(q / (0.5 * vp), z, 1.0);
  out.fade = 1.0;
  return out;
}

@fragment
fn fs(in: ArrowOut) -> @location(0) vec4<f32> {
  if (in.fade < 0.5) { discard; }
  return vec4<f32>(1.0, 0.76, 0.29, 0.85);
}
