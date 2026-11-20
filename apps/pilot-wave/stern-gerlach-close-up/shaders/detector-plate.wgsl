// Detector screen at the plate: a panel larger than the tunnel, with the tunnel's cross-section
// outlined and gridded. Dots stop where they reach it.
const SCREEN_MARGIN: f32 = 0.35;
struct DetectorOut {
  @builtin(position) position: vec4<f32>,
  @location(0) uv: vec2<f32>,
};

@vertex
fn vs(@builtin(vertex_index) vertexIndex: u32) -> DetectorOut {
  var out: DetectorOut;
  var yz = vec2<f32>(0.0, 0.0);
  if (vertexIndex == 1u) { yz = vec2<f32>(1.0, 0.0); }
  if (vertexIndex == 2u) { yz = vec2<f32>(0.0, 1.0); }
  if (vertexIndex == 3u) { yz = vec2<f32>(0.0, 1.0); }
  if (vertexIndex == 4u) { yz = vec2<f32>(1.0, 0.0); }
  if (vertexIndex == 5u) { yz = vec2<f32>(1.0, 1.0); }

  let maxP = uni.sim.xyz - vec3<f32>(1.0);
  let inner = mix(vec2<f32>(-SCREEN_MARGIN), vec2<f32>(1.0 + SCREEN_MARGIN), yz);
  let gridPos = vec3<f32>(uni.detector.x, inner.x * maxP.y, inner.y * maxP.z);
  out.uv = inner;
  out.position = uni.viewProj * vec4<f32>(gridPos * worldScale(), 1.0);
  return out;
}

@fragment
fn fs(in: DetectorOut) -> @location(0) vec4<f32> {
  let outerUv = (in.uv + vec2<f32>(SCREEN_MARGIN)) / (1.0 + 2.0 * SCREEN_MARGIN);
  let outerEdge = min(min(outerUv.x, 1.0 - outerUv.x), min(outerUv.y, 1.0 - outerUv.y));
  let frame = 1.0 - smoothstep(0.0, 0.012, outerEdge);
  let inside = step(0.0, in.uv.x) * step(in.uv.x, 1.0) * step(0.0, in.uv.y) * step(in.uv.y, 1.0);
  let innerEdge = min(min(abs(in.uv.x), abs(1.0 - in.uv.x)), min(abs(in.uv.y), abs(1.0 - in.uv.y)));
  let outline = 1.0 - smoothstep(0.0, 0.012, innerEdge);
  let gridY = 1.0 - smoothstep(0.0, 0.014, abs(fract(in.uv.x * 8.0) - 0.5));
  let gridZ = 1.0 - smoothstep(0.0, 0.014, abs(fract(in.uv.y * 8.0) - 0.5));
  let grid = max(gridY, gridZ) * inside;
  let line = max(max(frame, outline), 0.55 * grid);
  let color = mix(vec3<f32>(0.10, 0.22, 0.55), vec3<f32>(0.70, 0.88, 1.0), line);
  let alpha = 0.10 + 0.08 * inside + 0.42 * max(frame, outline) + 0.08 * grid;
  return vec4<f32>(color, alpha);
}
