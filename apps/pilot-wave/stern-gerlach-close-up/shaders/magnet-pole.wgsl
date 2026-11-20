// Magnet poles: flat-shaded translucent prisms outside the tunnel. Faded when the field is off.
struct PoleIn {
  @location(0) position: vec3<f32>,
  @location(1) normal: vec3<f32>,
  @location(2) color: vec4<f32>,
};
struct PoleOut {
  @builtin(position) position: vec4<f32>,
  @location(0) worldPos: vec3<f32>,
  @location(1) normal: vec3<f32>,
  @location(2) color: vec4<f32>,
};
@vertex
fn vs(in: PoleIn) -> PoleOut {
  var out: PoleOut;
  out.worldPos = in.position;
  out.normal = in.normal;
  out.color = in.color;
  out.position = uni.viewProj * vec4<f32>(in.position, 1.0);
  return out;
}
@fragment
fn fs(in: PoleOut) -> @location(0) vec4<f32> {
  let n = normalize(in.normal);
  let v = normalize(uni.camera.xyz - in.worldPos);
  let light = normalize(vec3<f32>(0.35, -0.45, 0.82));
  let diffuse = 0.32 + 0.68 * max(dot(n, light), 0.0);
  let rim = pow(1.0 - abs(dot(n, v)), 2.0);
  let color = in.color.rgb * diffuse + vec3<f32>(0.55, 0.7, 1.0) * rim * 0.22;
  let on = mix(0.4, 1.0, clamp(uni.sgField.y, 0.0, 1.0));
  return vec4<f32>(color, in.color.a * on);
}
