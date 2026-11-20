
@group(0) @binding(1) var<storage, read> particles: array<vec4<f32>>;
// 1 = started above the packet centre, 0 = below.
@group(0) @binding(2) var<storage, read> startSide: array<f32>;

struct ParticleOut {
  @builtin(position) position: vec4<f32>,
  @location(0) alive: f32,
  @location(1) particleId: f32,
  @location(2) depthFade: f32,
  @location(3) local: vec2<f32>,
  @location(4) brightness: f32,
  @location(5) upperStart: f32,
};

fn particleVertex(vertexIndex: u32, instanceIndex: u32, stamp: bool) -> ParticleOut {
  var out: ParticleOut;
  let state = particles[instanceIndex];
  out.alive = 1.0;
  out.particleId = f32(instanceIndex) / max(1.0, uni.particle1.z);
  out.upperStart = startSide[instanceIndex];
  out.depthFade = 1.0;
  out.local = quadCorner(vertexIndex) + vec2<f32>(0.5);
  let hitDetector = uni.detector.y > 0.5 && state.w >= uni.detector.x - 1e-4;
  out.brightness = select(1.0, max(1.0, state.x), hitDetector);
  let maxP = uni.sim.xyz - vec3<f32>(1.0);
  let p = clamp(state.xyz, vec3<f32>(0.0), maxP);
  var worldGrid = p;
  worldGrid.x = state.w;
  let worldPos = worldGrid * worldScale();
  let clip = uni.viewProj * vec4<f32>(worldPos, 1.0);
  if (clip.w <= 0.0 || abs(clip.x) > 1.2 * clip.w || abs(clip.y) > 1.2 * clip.w) {
    out.alive = 0.0;
    out.position = vec4<f32>(2.0, 2.0, 2.0, 1.0);
    return out;
  }
  let sceneRadius = 0.5 * length(maxP * worldScale());
  let distToCamera = distance(worldPos, uni.camera.xyz);
  let depthSpan = max(1.0, sceneRadius * 0.72);
  let depthT = smoothstep(uni.camera.w - depthSpan, uni.camera.w + depthSpan, distToCamera);
  out.depthFade = mix(1.0, 0.12, depthT);
  var size = uni.particle0.x;
  if (stamp) {
    size = uni.particle1.w * uni.density0.w;
  }
  var viewScale = clamp(180.0 / max(1.0, clip.w), 0.45, 2.4);
  if (i32(uni.viewport.z) == 1) {
    viewScale = clamp(180.0 / max(1.0, uni.camera.w), 0.45, 2.4);
  }
  let pointSize = size * viewScale;
  let ndcOffset = quadCorner(vertexIndex) * pointSize * 2.0 / max(uni.viewport.xy, vec2<f32>(1.0));
  out.position = vec4<f32>(
    clip.x + ndcOffset.x * clip.w,
    clip.y + ndcOffset.y * clip.w,
    clip.z,
    clip.w
  );
  return out;
}

@vertex
fn vsRender(@builtin(vertex_index) vertexIndex: u32, @builtin(instance_index) instanceIndex: u32) -> ParticleOut {
  return particleVertex(vertexIndex, instanceIndex, false);
}
@vertex
fn vsStamp(@builtin(vertex_index) vertexIndex: u32, @builtin(instance_index) instanceIndex: u32) -> ParticleOut {
  return particleVertex(vertexIndex, instanceIndex, true);
}

@fragment
fn fsRender(in: ParticleOut) -> @location(0) vec4<f32> {
  if (in.alive < 0.5) { discard; }
  let p = in.local - vec2<f32>(0.5);
  let r = length(p);
  if (r > 0.5) { discard; }
  let edge = smoothstep(0.5, 0.42, r);
  let blur = exp(-(r * r) / max(uni.particle0.y, 1e-4));
  let a = clamp(uni.particle0.z * in.depthFade * blur * edge, 0.0, 0.85);
  let flashT = smoothstep(2.0, 10.0, in.brightness);
  // Yellow: started in the upper half of the packet. Green: lower half.
  let base = select(vec3<f32>(0.22, 0.95, 0.32), vec3<f32>(1.0, 0.86, 0.08), in.upperStart > 0.5);
  let col = mix(base, vec3<f32>(1.0), 0.6 * flashT);
  let a2 = clamp(a * 1.6 + 0.4 * flashT, 0.0, 1.0);
  return vec4<f32>(col, a2);
}

@fragment
fn fsStamp(in: ParticleOut) -> @location(0) vec4<f32> {
  if (in.alive < 0.5) { discard; }
  let p = in.local - vec2<f32>(0.5);
  let r = length(p);
  if (r > 0.5) { discard; }
  let edge = smoothstep(0.5, 0.42, r);
  let blur = exp(-(r * r) / max(uni.particle0.y, 1e-4));
  let a = clamp(uni.particle0.z * uni.viewport.w * in.depthFade * blur * edge, 0.0, 1.0);
  return vec4<f32>(1.0, 1.0, 0.0, a);
}
