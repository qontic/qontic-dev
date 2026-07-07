struct BarrierOut {
  @builtin(position) position: vec4<f32>,
  @location(0) uv: vec2<f32>,
  @location(1) side: f32,
};

@vertex
fn vs(@builtin(vertex_index) vertexIndex: u32) -> BarrierOut {
  var out: BarrierOut;
  let local = vertexIndex % 6u;
  let face = vertexIndex / 6u;

  var yz = vec2<f32>(0.0, 0.0);
  if (local == 1u) { yz = vec2<f32>(1.0, 0.0); }
  if (local == 2u) { yz = vec2<f32>(0.0, 1.0); }
  if (local == 3u) { yz = vec2<f32>(0.0, 1.0); }
  if (local == 4u) { yz = vec2<f32>(1.0, 0.0); }
  if (local == 5u) { yz = vec2<f32>(1.0, 1.0); }

  let maxP = uni.sim.xyz - vec3<f32>(1.0);
  let halfWidth = 0.5 * max(uni.detector.y, 0.0);
  var side = -1.0;
  if (face > 0u) {
    side = 1.0;
  }
  let x = clamp(uni.detector.x + side * halfWidth, 0.0, maxP.x);
  let gridPos = vec3<f32>(x, yz.x * maxP.y, yz.y * maxP.z);

  out.uv = yz;
  out.side = side;
  out.position = uni.viewProj * vec4<f32>(gridPos * uni.visual1.w, 1.0);
  return out;
}

@fragment
fn fs(in: BarrierOut) -> @location(0) vec4<f32> {
  let edge = min(min(in.uv.x, 1.0 - in.uv.x), min(in.uv.y, 1.0 - in.uv.y));
  let border = 1.0 - smoothstep(0.0, 0.026, edge);
  let gridY = 1.0 - smoothstep(0.0, 0.012, abs(fract(in.uv.x * 9.0) - 0.5));
  let gridZ = 1.0 - smoothstep(0.0, 0.012, abs(fract(in.uv.y * 9.0) - 0.5));
  let grid = max(gridY, gridZ);
  let strength = clamp(uni.detector.z / 14.0, 0.0, 1.0);
  let faceTint = 0.82 + 0.10 * in.side;
  let base = vec3<f32>(1.0, 0.38 + 0.22 * strength, 0.08) * faceTint;
  let hot = vec3<f32>(1.0, 0.88, 0.44);
  let color = mix(base, hot, max(border, 0.45 * grid));
  let alpha = (0.09 + 0.22 * strength) + 0.26 * border + 0.075 * grid;
  return vec4<f32>(color, clamp(alpha, 0.0, 0.68));
}
