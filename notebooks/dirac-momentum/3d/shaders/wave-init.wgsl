@group(0) @binding(1) var<storage, read_write> waveOut: array<WaveCell>;

fn add4(a: Dirac4, b: Dirac4) -> Dirac4 {
  return Dirac4(a.c0+b.c0, a.c1+b.c1, a.c2+b.c2, a.c3+b.c3);
}
fn sub4(a: Dirac4, b: Dirac4) -> Dirac4 {
  return Dirac4(a.c0-b.c0, a.c1-b.c1, a.c2-b.c2, a.c3-b.c3);
}
fn scale4(a: Dirac4, s: f32) -> Dirac4 {
  return Dirac4(a.c0*s, a.c1*s, a.c2*s, a.c3*s);
}
fn packetKVec() -> vec3<f32> {
  let kMag = max(uni.sgField.x, 0.0);
  let az = uni.sgField.y;
  let el = uni.sgField.z;
  let requested = kMag * vec3<f32>(cos(el)*cos(az), cos(el)*sin(az), sin(el));
  let p = periodF();
  let modes = round(requested * p / 6.28318530718);
  return modes * 6.28318530718 / p;
}
fn centralSpinor() -> Dirac4 {
  let hbar = max(uni.physics.x, 1e-6);
  let mass = max(uni.physics.y, 1e-6);
  let c = max(uni.physics.z, 1e-6);
  let k = packetKVec();
  let p = hbar * k;
  let M = mass * c * c;
  let E = sqrt(M*M + c*c*dot(p,p));
  let N = sqrt(max((E + M) / max(2.0*E, 1e-8), 0.0));
  let q = N * c / max(E + M, 1e-8);

  // Spin-up Pauli reference spinor xi=(1,0).  u_+(p) and u_-(p)
  // are exact free-Dirac eigenvectors at the packet's central momentum.
  let up0 = vec2<f32>(N, 0.0);
  let up1 = vec2<f32>(0.0);
  let up2 = vec2<f32>(q*p.z, 0.0);
  let up3 = vec2<f32>(q*p.x, q*p.y);

  let dn0 = vec2<f32>(-q*p.z, 0.0);
  let dn1 = vec2<f32>(-q*p.x, -q*p.y);
  let dn2 = vec2<f32>(N, 0.0);
  let dn3 = vec2<f32>(0.0);

  let chi = uni.sgField.w;
  let a = cos(0.5*chi);
  let b = sin(0.5*chi);
  return Dirac4(
    a*up0 + b*dn0,
    a*up1 + b*dn1,
    a*up2 + b*dn2,
    a*up3 + b*dn3
  );
}
fn initialStateAtPx(xPx: vec3<f32>) -> Dirac4 {
  let center = uni.packet.xyz * periodF();
  let xw = wrapCoord3(xPx);
  let d = periodicDelta3(xw, center);
  let sigma = max(uni.packet.w, 1e-4);
  let amp = exp(-dot(d,d)/(2.0*sigma*sigma));
  let k = packetKVec();
  let ph = cis(dot(k,d));
  let s = centralSpinor();
  return Dirac4(
    amp*cmul(s.c0, ph),
    amp*cmul(s.c1, ph),
    amp*cmul(s.c2, ph),
    amp*cmul(s.c3, ph)
  );
}
fn deriv4(am2: Dirac4, am1: Dirac4, ap1: Dirac4, ap2: Dirac4) -> Dirac4 {
  return scale4(add4(add4(scale4(am2, 1.0), scale4(am1, -8.0)), add4(scale4(ap1, 8.0), scale4(ap2, -1.0))), 1.0/12.0);
}
fn sigmaDotGrad(a: Dirac4, dx: Dirac4, dy: Dirac4, dz: Dirac4, lower: bool) -> vec4<f32> {
  var q0: vec2<f32>;
  var q1: vec2<f32>;
  if (lower) {
    // sigma.grad acting on (c2,c3)
    q0 = dz.c2 + dx.c3 + mulNegI(dy.c3);
    q1 = dx.c2 + mulI(dy.c2) - dz.c3;
  } else {
    // sigma.grad acting on (c0,c1)
    q0 = dz.c0 + dx.c1 + mulNegI(dy.c1);
    q1 = dx.c0 + mulI(dy.c0) - dz.c1;
  }
  return vec4<f32>(q0, q1);
}
fn diracRHS(psi: Dirac4, dx: Dirac4, dy: Dirac4, dz: Dirac4) -> Dirac4 {
  let hbar = max(uni.physics.x, 1e-6);
  let mass = max(uni.physics.y, 1e-6);
  let c = max(uni.physics.z, 1e-6);
  let omegaM = mass*c*c/hbar;
  let sgL = sigmaDotGrad(psi, dx, dy, dz, true);
  let sgU = sigmaDotGrad(psi, dx, dy, dz, false);
  let r0 = -c*sgL.xy + omegaM*mulNegI(psi.c0);
  let r1 = -c*sgL.zw + omegaM*mulNegI(psi.c1);
  let r2 = -c*sgU.xy + omegaM*mulI(psi.c2);
  let r3 = -c*sgU.zw + omegaM*mulI(psi.c3);
  return Dirac4(r0,r1,r2,r3);
}

@compute @workgroup_size(${WAVE_WORKGROUP_SIZE})
fn main(@builtin(global_invocation_id) gid: vec3<u32>) {
  let id = gid.x;
  if (id >= u32(uni.sim.w)) { return; }
  let s = simResU();
  let slice = s.x*s.y;
  let z = id/slice;
  let rem = id-z*slice;
  let y = rem/s.x;
  let x = rem-y*s.x;
  let xp = vec3<f32>(f32(x),f32(y),f32(z));

  let p0 = initialStateAtPx(xp);
  let dx = deriv4(
    initialStateAtPx(xp+vec3<f32>(-2.0,0.0,0.0)),
    initialStateAtPx(xp+vec3<f32>(-1.0,0.0,0.0)),
    initialStateAtPx(xp+vec3<f32>( 1.0,0.0,0.0)),
    initialStateAtPx(xp+vec3<f32>( 2.0,0.0,0.0))
  );
  let dy = deriv4(
    initialStateAtPx(xp+vec3<f32>(0.0,-2.0,0.0)),
    initialStateAtPx(xp+vec3<f32>(0.0,-1.0,0.0)),
    initialStateAtPx(xp+vec3<f32>(0.0, 1.0,0.0)),
    initialStateAtPx(xp+vec3<f32>(0.0, 2.0,0.0))
  );
  let dz = deriv4(
    initialStateAtPx(xp+vec3<f32>(0.0,0.0,-2.0)),
    initialStateAtPx(xp+vec3<f32>(0.0,0.0,-1.0)),
    initialStateAtPx(xp+vec3<f32>(0.0,0.0, 1.0)),
    initialStateAtPx(xp+vec3<f32>(0.0,0.0, 2.0))
  );
  let rhs = diracRHS(p0,dx,dy,dz);
  let dt = uni.physics.w;
  waveOut[id] = WaveCell(
    p0.c0,p0.c1,p0.c2,p0.c3,
    p0.c0-dt*rhs.c0,
    p0.c1-dt*rhs.c1,
    p0.c2-dt*rhs.c2,
    p0.c3-dt*rhs.c3
  );
}
