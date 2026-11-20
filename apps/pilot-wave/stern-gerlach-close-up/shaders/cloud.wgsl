
@group(0) @binding(1) var<storage, read> wave: array<WaveCell>;

struct CloudOut {
  @builtin(position) position: vec4<f32>,
  @location(0) alpha: f32,
  @location(1) phase: f32,
  @location(2) intensity: f32,
  @location(3) local: vec2<f32>,
};

@vertex
fn vs(@builtin(vertex_index) vertexIndex: u32, @builtin(instance_index) instanceIndex: u32) -> CloudOut {
  var out: CloudOut;
  out.position = vec4<f32>(2.0, 2.0, 2.0, 1.0);
  // Instances cover a window along x around the packet and the y-z grid with a stride.
  let id = instanceIndex;
  let W = u32(uni.sim.x);
  let stride = max(1u, u32(uni.visual2.y));
  let Hr = u32(uni.sim.y) / stride;
  let Dr = u32(uni.sim.z) / stride;
  let ix = id % W;
  let rest = id / W;
  let iy = rest % Hr;
  let iz = rest / Hr;
  if (iz >= Dr) { return out; }
  let y = iy * stride;
  let z = iz * stride;
  let x = uni.visual2.z + f32(ix);

  let spinor = waveSpinor(wave[cellIndex(i32(y), i32(z))]);
  let rho = phiRho(x) * spinorRho(spinor);
  let base = 1.0 - exp(-uni.visual0.x * rho);
  if (base <= 0.0) { return out; }
  var intensity = pow(clamp(base, 0.0, 1.0), uni.visual0.y);
  intensity = mix(intensity, pow(intensity, 0.52), clamp(uni.visual0.z, 0.0, 1.0));
  if (intensity < uni.visual0.w) { return out; }

  let visualX = x;
  if (uni.detector.y > 0.5 && visualX > uni.detector.x) { return out; }
  out.intensity = intensity;
  out.alpha = 0.24 * intensity;
  let corner = quadCorner(vertexIndex);
  out.local = corner + vec2<f32>(0.5);
  if (i32(uni.visual1.y) == 1) {
    let upRho = dot(spinor.up, spinor.up);
    let downRho = dot(spinor.down, spinor.down);
    let upWeight = upRho * upRho;
    let downWeight = downRho * downRho;
    let phaseVec =
      spinor.up * (upWeight / sqrt(max(upRho, 1e-30))) +
      spinor.down * (downWeight / sqrt(max(downRho, 1e-30)));
    let phasePsi = select(vec2<f32>(1.0, 0.0), phaseVec, dot(phaseVec, phaseVec) > 1e-20);
    out.phase = atan2(phasePsi.y, phasePsi.x) + phiPhase(x);
  }
  let worldPos = vec3<f32>(visualX, f32(y), f32(z)) * uni.visual1.w;
  let clip = uni.viewProj * vec4<f32>(worldPos, 1.0);
  var viewScale = clamp(160.0 / max(1.0, clip.w), 0.35, 2.3);
  if (i32(uni.viewport.z) == 1) {
    viewScale = clamp(160.0 / max(1.0, uni.camera.w), 0.35, 2.3);
  }
  let pointSize = uni.visual1.x * viewScale * mix(0.65, 1.45, intensity) * sqrt(f32(stride));
  let ndcOffset = corner * pointSize * 2.0 / max(uni.viewport.xy, vec2<f32>(1.0));
  out.position = vec4<f32>(
    clip.x + ndcOffset.x * clip.w,
    clip.y + ndcOffset.y * clip.w,
    clip.z,
    clip.w
  );
  return out;
}

@fragment
fn fs(in: CloudOut) -> @location(0) vec4<f32> {
  if (in.alpha <= 0.0) { discard; }
  let p = in.local - vec2<f32>(0.5);
  let r = length(p);
  if (r > 0.5) { discard; }
  let edge = smoothstep(0.5, 0.18, r);
  let blur = exp(-16.0 * r * r);
  let a = in.alpha * edge * blur;
  var col = mix(vec3<f32>(0.05, 0.22, 0.46), vec3<f32>(0.58, 0.95, 1.00), smoothstep(0.08, 0.95, in.intensity));
  var alpha = a;
  if (i32(uni.visual1.y) == 1) {
    let params = getPaletteParams(i32(uni.visual1.z));
    let phaseT = fract((in.phase + 3.14159265) / 6.2831853);
    col = 0.92 * palette(phaseT, params.a, params.b, params.c, params.d);
    alpha = alpha * smoothstep(0.0, 0.25, in.intensity);
  }
  col = col * (0.35 + 1.15 * in.intensity);
  return vec4<f32>(col * alpha, alpha);
}
