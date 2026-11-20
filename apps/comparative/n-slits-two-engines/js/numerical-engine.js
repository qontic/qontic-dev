// Numerical engine: the time-dependent Schrödinger equation on a grid (WebGL2),
// for the same geometry as the analytical (paraxial) engine.
//
// Units are the analytical model's: lengths in 100 nm, hbar = m = 1. The grid step
// is h = lambda / PPW (PPW points per wavelength). On the grid (x = h xi, t = h^2 tau)
// the equation is i d_tau psi = -1/2 lap_xi psi + V psi - i W psi, solved by leapfrog
// with the fourth-order (nine-point cross) Laplacian, a constant step (stable for
// dt (16/3 + V0) < 1), a weak
// Robert–Asselin filter (nu = 0.01) against leapfrog's alternating mode, and smooth
// absorbing layers (-i W) at the edges of the domain.
//
// All slit and wall geometry comes from the geometry object (slit-geometry.js) that
// the analytical engine also uses; this file holds no geometry constants. Two slit
// wall models, all built from that object (openings of half-width geometry.openingHalf):
//  - "reflecting" (default): a wall of height V0 and thickness geometry.wallThickness
//    with sharp-edged openings; it reflects the wave that hits it, as in the numerical
//    N-slit app.
//  - "absorbing": a thicker wall (geometry.absorbingWallThickness) whose front 90% is
//    an absorbing ramp, W rising quadratically to WALL_W_OVER_E times the packet energy,
//    with V0 behind: most of the wave that hits it is absorbed, not all (as the 30-step
//    absorbing wall of the numerical N-slit app).
//  - "mask": the analytical Gaussian aperture, for comparing the engines. An absorbing
//    layer (thickness geometry.apertureLayer), W(x, y) = -ln T(y) * v / Lh * cos^2(pi (x - L) / 2 Lh)
//    with Lh half the layer, so a wave crossing it keeps the amplitude factor T(y) of the
//    analytical mask (capped at 1e-4); it does not reflect.
// What is set here are numerical-method choices, not geometry: points per wavelength,
// the absorbing margins of the domain, and the time step.
//
// Which-slit detectors (records): with detectors at slits D the state behind the wall is
//   sum_{k in D} psi_k |d_k> + (the other open slits' wave) |d_0>.
// Each record b is a field behind the wall's exit face (a layer of a 2D-array texture
// that starts at column off). By linearity the wave behind the wall is fixed by its
// values on the exit face: field b is driven there by the total wave times a smooth
// weight w_b(y) that shares the face among the open slits (sum_b w_b = 1), and evolves
// freely behind it. The fields add up to the total wave behind the wall; the picture
// and the screen prediction use sum_b |psi_b|^2. A pilot-wave particle is guided by the
// total wave until it crosses the exit face, then by the field of its slit's record.
// Detectors switched during a run (setGeometry): records that still exist keep their
// field; records that end stop being driven and keep evolving (their wave is already
// behind the wall); new records start from the exit face. When the first records
// appear, the wave already behind the wall becomes a record of its own (it passed before
// any detector was there). So the run goes on; nothing is restarted.
//
// Pilot-wave particles start from |psi|^2 of the initial packet and move with
// v = Im(grad psi / psi) (RK2, every step) on the GPU; their positions are read back
// once per frame and handed to the app as ordinary particle objects. A particle that
// reaches the screen is a detection; the probability flux through the screen is
// accumulated as the numerical prediction.

// Fourth-order differences: phase error (kh)^4/90 = 0.4% per wavelength at PPW = 8
// (the second-order five-point Laplacian needs PPW = 16 for 0.5%). The cost goes as PPW^4
// (cells and time steps per unit time each as PPW^2), so this is about 5x faster.
const PPW = 8;             // numerical method: grid points per wavelength
const RA_NU = 0.01;
const MAX_CELLS = 2.2e6;   // grid size limit (x * y cells)
const MAX_RECORDS = 12;     // record fields (texture-array layers); beyond this a detector change restarts the packet
const WALL_W_OVER_E = 2.67; // absorbing-wall material: peak W / packet energy (W = 3 at E = 1.125 in the numerical N-slit app)

const VS = `#version 300 es
out vec2 vUV;
void main(){ vec2 p = gl_VertexID == 0 ? vec2(-1.,-1.) : gl_VertexID == 1 ? vec2(3.,-1.) : vec2(-1.,3.); vUV = .5*(p+1.); gl_Position = vec4(p,0.,1.); }`;

const COMMON = `
uniform ivec2 uRes;
uniform float uWallX, uWallHalf, uLayerHalf, uV0, uWmax, uWscale, uSy, uBound, uHalfOpen, uAbsPx, uAbsW, uV, uWallW;
uniform int uMode, uNOpen;
uniform float uCenters[16], uWeights[16];
float sstep(float a, float b, float x){ float t = clamp((x-a)/(b-a), 0., 1.); return t*t*(3.-2.*t); }
float band(float x, float c, float hw){ return sstep(c-hw-1., c-hw, x) * (1. - sstep(c+hw, c+hw+1., x)); }
float apertureT(float y){
  float s = 0.;
  for (int j = 0; j < 16; j++) { if (j >= uNOpen) break; float d = y - uCenters[j]; s += uWeights[j] * exp(-d*d/(4.*uSy*uSy)); }
  return s / uBound;
}
float capProfile(float d){ float t = clamp((uAbsPx - d)/uAbsPx, 0., 1.); float s = t*t*t*(t*(t*6.-15.)+10.); return s*s; }
// x = V (real potential), y = W (absorbing potential)
vec2 potential(vec2 q){
  float W = 0., V = 0.;
  float dx = q.x - uWallX;
  if (uMode == 0) {
    if (abs(dx) < uLayerHalf) {
      float T = max(apertureT(q.y), 1e-12);
      float c = cos(1.5707963 * dx / uLayerHalf);
      W += min(uWmax, -log(T) * uWscale) * c * c;
    }
  } else {
    float slab = band(q.x, uWallX, uWallHalf);
    if (slab > 0.) {
      float open = 0.;
      for (int j = 0; j < 16; j++) { if (j >= uNOpen) break; open += band(q.y, uCenters[j], uHalfOpen); }
      float solid = slab * clamp(1. - open, 0., 1.);
      if (uMode == 2) {
        // absorbing wall: absorbing ramp over the front 90%, wall behind
        float u = clamp((q.x - (uWallX - uWallHalf)) / (2.*uWallHalf), 0., 1.);
        float front = 1. - sstep(.88, .92, u), ramp = clamp(u/.9, 0., 1.);
        V = uV0 * solid * (1. - front);
        W += uWallW * solid * front * ramp * ramp;
      } else V = uV0 * solid;
    }
  }
  float d = min(min(q.x, float(uRes.x) - q.x), min(q.y, float(uRes.y) - q.y));
  W += uAbsW * capProfile(d);
  return vec2(V, W);
}`;

const INIT = `#version 300 es
precision highp float;
${COMMON}
uniform float uX0, uSx, uK, uS, uXs, uYc, uE, uDt;
out vec4 o;
vec2 cmul(vec2 a, vec2 b){ return vec2(a.x*b.x - a.y*b.y, a.x*b.y + a.y*b.x); }
vec2 cdiv(vec2 a, vec2 b){ float d = dot(b,b); return vec2(a.x*b.x + a.y*b.y, a.y*b.x - a.x*b.y)/d; }
vec2 csqrt(vec2 z){ float r = length(z); float a = atan(z.y, z.x)*.5; return sqrt(r)*vec2(cos(a), sin(a)); }
vec2 psi0(vec2 q){
  // Longitudinal Gaussian envelope x carrier x paraxial transverse Gaussian beam
  // from a source of width uS at x = uXs (the analytical incident field).
  float dx = q.x - uX0;
  float env = exp(-dx*dx/(4.*uSx*uSx));
  float tau = (q.x - uXs) / uK;
  vec2 a = vec2(1., tau/(2.*uS*uS));
  float y = q.y - uYc;
  vec2 ex = cdiv(vec2(-y*y/(4.*uS*uS), 0.), a);
  vec2 g = cdiv(vec2(1.,0.), csqrt(a));
  g = cmul(g, exp(ex.x) * vec2(cos(ex.y), sin(ex.y)));
  float ph = uK * (q.x - uX0);
  return env * cmul(g, vec2(cos(ph), sin(ph)));
}
void main(){
  vec2 q = gl_FragCoord.xy;
  vec2 p = psi0(q);
  // Previous level from the packet's dominant frequency E = k^2/2.
  vec2 prev = cmul(p, vec2(cos(uE*uDt), sin(uE*uDt)));   // uE: the scheme's energy for k
  o = vec4(p, prev);
}`;

const STEP = `#version 300 es
precision highp float;
${COMMON}
uniform sampler2D uState;
uniform float uDt;
out vec4 o;
vec2 f(ivec2 q){ if (q.x < 0 || q.y < 0 || q.x >= uRes.x || q.y >= uRes.y) return vec2(0.); return texelFetch(uState, q, 0).rg; }
void main(){
  ivec2 p = ivec2(gl_FragCoord.xy);
  vec4 s = texelFetch(uState, p, 0);
  vec2 psi = s.rg, prev = s.ba;
  // Fourth-order Laplacian: (-f(+-2) + 16 f(+-1) - 30 f) / 12 in each direction.
  vec2 lap = (16.*(f(p+ivec2(1,0)) + f(p-ivec2(1,0)) + f(p+ivec2(0,1)) + f(p-ivec2(0,1)))
             - (f(p+ivec2(2,0)) + f(p-ivec2(2,0)) + f(p+ivec2(0,2)) + f(p-ivec2(0,2))) - 60.*psi) / 12.;
  vec2 VW = potential(gl_FragCoord.xy);
  // i dpsi/dt = -lap/2 + V psi  ->  dpsi/dt = (i lap/2 - i V psi)
  vec2 rhs = vec2(-.5*lap.y + VW.x*psi.y, .5*lap.x - VW.x*psi.x);
  float a = uDt * VW.y;
  vec2 next = ((1. - a)*prev + 2.*uDt*rhs) / (1. + a);
  vec2 filtered = psi + ${RA_NU.toFixed(3)} * (next - 2.*psi + prev);
  o = vec4(next, filtered);
}`;

// Record fields: layer uLayer of a 2D-array texture covering columns uOff.. of the grid.
// Columns up to uDrive (the wall's exit face) are driven by the total wave times the
// record's weight; elsewhere the field evolves like the total wave.
const BSTEP = `#version 300 es
precision highp float;
precision highp sampler2DArray;
${COMMON}
uniform sampler2D uTotal;
uniform sampler2DArray uSrc;
uniform int uLayer, uOff, uDrive;
uniform float uDt, uPartS, uMask[16];
out vec4 o;
vec2 f(ivec2 q, int w){ if (q.x < 0 || q.y < 0 || q.x >= w || q.y >= uRes.y) return vec2(0.); return texelFetch(uSrc, ivec3(q, uLayer), 0).rg; }
void main(){
  ivec2 p = ivec2(gl_FragCoord.xy), q = p + ivec2(uOff, 0);
  if (q.x <= uDrive) {
    // Smooth partition of the exit face among the open slits (Gaussian weights around
    // the slit centres, normalised so they add to 1 over the records).
    float y = gl_FragCoord.y, emax = -1e30, num = 0., den = 0.;
    for (int j = 0; j < 16; j++) { if (j >= uNOpen) break; float d = (y - uCenters[j]) / uPartS; emax = max(emax, -.5*d*d); }
    for (int j = 0; j < 16; j++) { if (j >= uNOpen) break; float d = (y - uCenters[j]) / uPartS; float w = exp(-.5*d*d - emax); den += w; num += uMask[j]*w; }
    o = (den > 0. ? num/den : 0.) * texelFetch(uTotal, q, 0);
    return;
  }
  int w = uRes.x - uOff;
  vec4 s = texelFetch(uSrc, ivec3(p, uLayer), 0);
  vec2 psi = s.rg, prev = s.ba;
  vec2 lap = (16.*(f(p+ivec2(1,0),w) + f(p-ivec2(1,0),w) + f(p+ivec2(0,1),w) + f(p-ivec2(0,1),w))
             - (f(p+ivec2(2,0),w) + f(p-ivec2(2,0),w) + f(p+ivec2(0,2),w) + f(p-ivec2(0,2),w)) - 60.*psi) / 12.;
  vec2 VW = potential(vec2(q) + .5);
  vec2 rhs = vec2(-.5*lap.y + VW.x*psi.y, .5*lap.x - VW.x*psi.x);
  float a = uDt * VW.y;
  vec2 next = ((1. - a)*prev + 2.*uDt*rhs) / (1. + a);
  o = vec4(next, psi + ${RA_NU.toFixed(3)} * (next - 2.*psi + prev));
}`;

// Flux of one record field (layer of the array) added to the accumulated flux.
const BFLUX = `#version 300 es
precision highp float;
precision highp sampler2DArray;
uniform sampler2DArray uSrc;
uniform sampler2D uAcc;
uniform int uCol, uLayer;
uniform float uDt;
out vec4 o;
void main(){
  int j = int(gl_FragCoord.y);
  vec2 c = texelFetch(uSrc, ivec3(uCol, j, uLayer), 0).rg;
  vec2 d = (8.*(texelFetch(uSrc, ivec3(uCol+1, j, uLayer), 0).rg - texelFetch(uSrc, ivec3(uCol-1, j, uLayer), 0).rg)
          - (texelFetch(uSrc, ivec3(uCol+2, j, uLayer), 0).rg - texelFetch(uSrc, ivec3(uCol-2, j, uLayer), 0).rg)) / 12.;
  float jx = c.x*d.y - c.y*d.x;
  vec4 acc = texelFetch(uAcc, ivec2(0, j), 0);
  o = vec4(acc.x + max(jx, 0.)*uDt, acc.y + jx*uDt, 0., 0.);
}`;

// Time-integrated probability flux j_x through the screen column.
const FLUX = `#version 300 es
precision highp float;
uniform sampler2D uState, uAcc;
uniform int uCol;
uniform float uDt;
out vec4 o;
void main(){
  int j = int(gl_FragCoord.y);
  vec2 c = texelFetch(uState, ivec2(uCol, j), 0).rg;
  vec2 e = texelFetch(uState, ivec2(uCol+1, j), 0).rg, w = texelFetch(uState, ivec2(uCol-1, j), 0).rg;
  vec2 e2 = texelFetch(uState, ivec2(uCol+2, j), 0).rg, w2 = texelFetch(uState, ivec2(uCol-2, j), 0).rg;
  vec2 d = (8.*(e - w) - (e2 - w2)) / 12.;   // fourth-order derivative
  float jx = c.x*d.y - c.y*d.x;
  vec4 acc = texelFetch(uAcc, ivec2(0, j), 0);
  o = vec4(acc.x + max(jx, 0.)*uDt, acc.y + jx*uDt, 0., 0.);
}`;

// Particle state: x, y (grid), mode, seed. Mode: 1 moving (guided by the total wave),
// 10 + b moving in record b (guided by record field b), 2 detected, 3 absorbed at the
// wall, 4 lost at the edge.
const PARTICLE_VS = `#version 300 es
precision highp float;
precision highp sampler2DArray;
${COMMON}
layout(location=0) in vec4 aState;
out vec4 vState;
uniform sampler2D uState;
uniform sampler2DArray uRec;
uniform float uDt, uScreenX, uRecordOfSlit[16];
uniform int uFrame, uNRec, uOff, uDrive, uPre;
int layer = -1;
vec2 tf(ivec2 p){
  if (layer < 0) return texelFetch(uState, p, 0).rg;
  return texelFetch(uRec, ivec3(max(p.x - uOff, 0), p.y, layer), 0).rg;
}
vec2 samp(vec2 x){
  vec2 m = vec2(uRes) - 1.;
  vec2 y = clamp(x - .5, vec2(0.), m);
  vec2 x0 = floor(y), t = y - x0;
  ivec2 p = ivec2(x0), pe = min(p + ivec2(1,0), uRes-1), pn = min(p + ivec2(0,1), uRes-1), pne = min(p + ivec2(1,1), uRes-1);
  return mix(mix(tf(p), tf(pe), t.x), mix(tf(pn), tf(pne), t.x), t.y);
}
// Current j = Im(psi* grad psi) (fourth-order differences) and density at a grid node.
vec3 jr(ivec2 p){
  ivec2 m = uRes - 1;
  vec2 c = tf(p);
  vec2 dx = (8.*(tf(min(p+ivec2(1,0),m)) - tf(max(p-ivec2(1,0),ivec2(0)))) - (tf(min(p+ivec2(2,0),m)) - tf(max(p-ivec2(2,0),ivec2(0))))) / 12.;
  vec2 dy = (8.*(tf(min(p+ivec2(0,1),m)) - tf(max(p-ivec2(0,1),ivec2(0)))) - (tf(min(p+ivec2(0,2),m)) - tf(max(p-ivec2(0,2),ivec2(0))))) / 12.;
  return vec3(c.x*dx.y - c.y*dx.x, c.x*dy.y - c.y*dy.x, dot(c, c));
}
// v = j / rho with j and rho interpolated between nodes: unlike psi they carry no
// carrier oscillation, so bilinear interpolation is accurate at 8 points per wavelength.
vec2 vel(vec2 x){
  vec2 y = clamp(x - .5, vec2(0.), vec2(uRes) - 2.);
  vec2 x0 = floor(y), t = y - x0; ivec2 p = ivec2(x0);
  vec3 a = mix(mix(jr(p), jr(p+ivec2(1,0)), t.x), mix(jr(p+ivec2(0,1)), jr(p+ivec2(1,1)), t.x), t.y);
  vec2 v = a.xy / max(a.z, 1e-12);
  float s = length(v); if (s > 4.) v *= 4./s;
  return v;
}
float rnd(float s){ return fract(sin(s)*43758.5453123); }
void main(){
  vState = aState;
  gl_Position = vec4(-2.);
  float mode = aState.z;
  if (mode != 1. && mode < 10.) return;
  vec2 x = aState.xy;
  if (mode >= 10.) layer = int(mode - 10. + .5);
  else if (uNRec > 0 && x.x > float(uDrive) + .5) {
    // Behind the exit face when the records appeared: the record of the wave that passed before.
    layer = uPre; mode = 10. + float(uPre);
  }
  if (layer >= uNRec) { layer = -1; mode = 1.; }
  vec2 x1 = x + .5*uDt*vel(x);
  vec2 xn = x + uDt*vel(x1);
  if (layer < 0 && uNRec > 0 && x.x <= float(uDrive) + .5 && xn.x > float(uDrive) + .5) {
    // Crossing the exit face: the record of the slit it came through (nearest open slit).
    int best = 0; float bd = 1e30;
    for (int j = 0; j < 16; j++) { if (j >= uNOpen) break; float d = abs(xn.y - uCenters[j]); if (d < bd) { bd = d; best = j; } }
    float r = uRecordOfSlit[best];
    if (r >= 0.) mode = 10. + r;
  }
  vec2 VW = potential(xn);
  float seed = aState.w * 17.13 + float(uFrame) * 0.618;
  float d = min(min(xn.x, float(uRes.x) - xn.x), min(xn.y, float(uRes.y) - xn.y));
  if (xn.x >= uScreenX) { vState = vec4(uScreenX, xn.y, 2., aState.w); return; }
  if (VW.x > .5*uV0) { vState = vec4(xn, 3., aState.w); return; }
  if (VW.y > 0. && rnd(seed) < 1. - exp(-2.*VW.y*uDt)) { vState = vec4(xn, d < uAbsPx ? 4. : 3., aState.w); return; }
  vState = vec4(xn, mode, aState.w);
}`;
const PARTICLE_FS = `#version 300 es
precision highp float; out vec4 o; void main(){ o = vec4(0.); }`;

// Wave picture in the app's colours: one pass over the display grid.
const RENDER = `#version 300 es
precision highp float;
precision highp sampler2DArray;
uniform sampler2D uState, uPalette;
uniform sampler2DArray uRec;
uniform int uNRec, uOff, uDrive;
uniform ivec2 uRes;
uniform vec4 uMap;      // grid x = uMap.x + u * uMap.y ; grid y = uMap.z + v * uMap.w  (u, v in 0..1 over the canvas)
uniform float uPeak, uLo, uInv, uAlpha, uFieldU, uGain;
uniform int uShow;      // 0 |psi|^2, 1 phase (cos), 2 log, 3 phase & |psi|, 4 classic (as the numerical N-slit app)
// Classic look: wave_render.frag of the numerical N-slit app (phase blue/red/magenta
// over a purple density; I = (1 - exp(-20 rho))^0.5 with rho relative to the starting peak).
vec3 phaseColor(float ph){
  float m = abs(ph);
  vec3 branch = ph >= 0. ? vec3(0.08,0.25,1.0) : vec3(1.0,0.08,0.02);
  float seam = clamp((m - 1.57079633)/1.57079633, 0., 1.), f = clamp(m/1.05, 0., 1.);
  return mix(branch, vec3(0.72,0.04,0.88), seam) * f*f*f*(f*(f*6. - 15.) + 10.);
}
in vec2 vUV;
out vec4 o;
vec2 samp(vec2 x){
  vec2 m = vec2(uRes) - 1.;
  if (x.x < 0. || x.y < 0. || x.x > float(uRes.x) || x.y > float(uRes.y)) return vec2(0.);
  vec2 y = clamp(x - .5, vec2(0.), m);
  vec2 x0 = floor(y), t = y - x0;
  ivec2 p = ivec2(x0), pe = min(p + ivec2(1,0), uRes-1), pn = min(p + ivec2(0,1), uRes-1), pne = min(p + ivec2(1,1), uRes-1);
  return mix(mix(texelFetch(uState,p,0).rg, texelFetch(uState,pe,0).rg, t.x), mix(texelFetch(uState,pn,0).rg, texelFetch(uState,pne,0).rg, t.x), t.y);
}
// Density interpolated from the nodes' |psi|^2 (no carrier ripple at 8 points per wavelength).
float r2(ivec2 p){ vec2 c = texelFetch(uState, p, 0).rg; return dot(c, c); }
float sampRho(vec2 x){
  vec2 m = vec2(uRes) - 1.;
  if (x.x < 0. || x.y < 0. || x.x > float(uRes.x) || x.y > float(uRes.y)) return 0.;
  vec2 y = clamp(x - .5, vec2(0.), m);
  vec2 x0 = floor(y), t = y - x0;
  ivec2 p = ivec2(x0), pe = min(p + ivec2(1,0), uRes-1), pn = min(p + ivec2(0,1), uRes-1), pne = min(p + ivec2(1,1), uRes-1);
  return mix(mix(r2(p), r2(pe), t.x), mix(r2(pn), r2(pne), t.x), t.y);
}
// Records behind the exit face: density sum_b |psi_b|^2; colours (phase) of the records
// mixed with weights |psi_b|^2 (recCos: cos theta, recCol: classic phase colour).
float recCos; vec3 recCol;
vec2 recAt(ivec2 p, int b){ return texelFetch(uRec, ivec3(clamp(p.x - uOff, 0, uRes.x - uOff - 1), clamp(p.y, 0, uRes.y - 1), b), 0).rg; }
vec3 recSamp(vec2 x){
  vec2 y = clamp(x - .5, vec2(0.), vec2(uRes) - 1.);
  vec2 x0 = floor(y), t = y - x0; ivec2 p = ivec2(x0);
  float rho = 0., cs = 0.; vec3 col = vec3(0.); vec2 ph = vec2(1., 0.); float best = -1.;
  for (int b = 0; b < 16; b++) {
    if (b >= uNRec) break;
    vec2 c00 = recAt(p,b), c10 = recAt(p+ivec2(1,0),b), c01 = recAt(p+ivec2(0,1),b), c11 = recAt(p+ivec2(1,1),b);
    vec2 c = mix(mix(c00, c10, t.x), mix(c01, c11, t.x), t.y);
    float r = mix(mix(dot(c00,c00), dot(c10,c10), t.x), mix(dot(c01,c01), dot(c11,c11), t.x), t.y); rho += r;
    float cn = length(c);
    if (r > 0. && cn > 0.) { cs += r * c.x / cn; col += r * phaseColor(atan(c.y, c.x)); }
    if (r > best) { best = r; ph = c; }
  }
  recCos = rho > 0. ? cs / rho : 1.; recCol = rho > 0. ? col / rho : vec3(0.);
  return vec3(ph * sqrt(rho / max(best, 1e-30)), rho);
}
vec3 pal(float v){ return texture(uPalette, vec2(clamp(v,0.,1.), .5)).rgb; }
void main(){
  float u = vUV.x, v = 1. - vUV.y;     // canvas y downwards
  if (u > uFieldU) { o = vec4(0.); return; }
  vec2 gq = vec2(uMap.x + u*uMap.y, uMap.z + v*uMap.w);
  vec2 psi = samp(gq);
  float rho = sampRho(gq);
  bool inRec = uNRec > 0 && gq.x > float(uDrive) + 1.;
  if (inRec) { vec3 r = recSamp(gq); psi = r.xy; rho = r.z; }
  float rel = rho / uPeak;
  if (uShow == 4) {
    float vis = smoothstep(0.001, 0.002, sqrt(rel));
    float I = pow(clamp(1. - exp(-20.*rel), 0., 1.), 0.5);
    float ph = rel > 0. && vis > 0. ? atan(psi.y, psi.x) : 0.;
    vec3 dens = mix(vec3(0.26,0.13,0.49), vec3(0.72,0.50,0.99), pow(I, 0.7));
    o = vec4(mix(dens, inRec ? recCol : phaseColor(ph), 0.77905591) * I * vis * uAlpha, 1.0);
    return;
  }
  // Visibility on a log scale (down to 1e-4 of the incoming peak), so the much
  // weaker transmitted wave shows; colour as in the analytical engine.
  float raw = clamp((log(max(rel, 1e-12))/2.302585 + 4.)/3., 0., 1.);
  float weight = (1. - exp(-3.*raw)) / (1. - exp(-3.));
  if (weight <= 0.002) { o = vec4(0.); return; }
  float pn = length(psi);
  float c = inRec ? recCos : pn > 0. ? psi.x / pn : 1.;
  vec3 col; float a = uAlpha * weight;
  if (uShow == 3) {
    float val = sqrt(min(1., rel*uGain)), level = clamp((val - uLo)*uInv, 0., 1.);
    col = pal(.5 + .5*c); a *= level;
  } else {
    float val = uShow == 1 ? .5 + .5*c : uShow == 2 ? clamp((log(max(1e-15, rel)) + 15.)/15., 0., 1.) : sqrt(min(1., rel*uGain));
    col = .88*pal((val - uLo)*uInv) + .12;
  }
  o = vec4(col * a, a);   // premultiplied
}`;

function compile(gl, type, src) {
  const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) + "\n" + src.split("\n").map((l, i) => (i + 1) + ": " + l).join("\n"));
  return s;
}
function program(gl, vs, fs, varyings) {
  const p = gl.createProgram();
  gl.attachShader(p, compile(gl, gl.VERTEX_SHADER, vs)); gl.attachShader(p, compile(gl, gl.FRAGMENT_SHADER, fs));
  if (varyings) gl.transformFeedbackVaryings(p, varyings, gl.INTERLEAVED_ATTRIBS);
  gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
  const cache = new Map();
  p.u = name => { if (!cache.has(name)) cache.set(name, gl.getUniformLocation(p, name)); return cache.get(name); };
  return p;
}
function randn() { let u = 0, v = 0; while (!u) u = Math.random(); while (!v) v = Math.random(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }

export function createNumericalEngine() {
  const canvas = document.createElement("canvas");
  const gl = canvas.getContext("webgl2", { premultipliedAlpha: true, alpha: true, antialias: false, depth: false, stencil: false, preserveDrawingBuffer: true });
  const available = !!(gl && gl.getExtension("EXT_color_buffer_float"));
  if (!available) return { available: false, reason: gl ? "This browser lacks float render targets (EXT_color_buffer_float)." : "This browser has no WebGL2." };

  const progInit = program(gl, VS, INIT), progStep = program(gl, VS, STEP), progFlux = program(gl, VS, FLUX), progRender = program(gl, VS, RENDER);
  const progPart = program(gl, PARTICLE_VS, PARTICLE_FS, ["vState"]);
  const progBStep = program(gl, VS, BSTEP), progBFlux = program(gl, VS, BFLUX);
  const vao = gl.createVertexArray();
  const maxTex = gl.getParameter(gl.MAX_TEXTURE_SIZE);

  function tex(w, h, type = gl.RGBA32F, format = gl.RGBA, dtype = gl.FLOAT) {
    const t = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, type, w, h, 0, format, dtype, null); return t;
  }
  function fbo(t) { const f = gl.createFramebuffer(); gl.bindFramebuffer(gl.FRAMEBUFFER, f); gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, t, 0); gl.bindFramebuffer(gl.FRAMEBUFFER, null); return f; }
  const paletteTex = gl.createTexture(); let paletteKey = "";
  // A 1-layer array texture bound when there are no records (samplers must have a texture).
  const dummyArray = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D_ARRAY, dummyArray); gl.texStorage3D(gl.TEXTURE_2D_ARRAY, 1, gl.RGBA32F, 1, 1, 1);
  gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MIN_FILTER, gl.NEAREST); gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

  let G = null;           // grid and geometry
  let state = null;       // textures, buffers
  let parts = [];         // particle objects for the app
  let partData = null, partBufA = null, partBufB = null, partVao = null, tf = null;
  let behind = false, frame = 0, simTau = 0, stepsDone = 0, stepCarry = 0, budget = 64;
  // Step budget per frame. With a GPU timer (EXT_disjoint_timer_query_webgl2) the GPU
  // time per step is measured and the budget set from it, smoothed, so it stays steady.
  // Without one, the fence of the previous frame says whether the GPU is behind; the
  // budget then changes rarely and gently (cut 15% after two late frames, then a pause;
  // grow 5% after 30 on-time frames), avoiding the slow-down / speed-up cycles of an
  // aggressive controller.
  const timerExt = gl.getExtension("EXT_disjoint_timer_query_webgl2");
  let speedRatio = 1, msPerStep = null, pendingQueries = [], lateFrames = 0, onTimeFrames = 0, cooldown = 0, lastNeed = 0;
  // Asynchronous GPU -> CPU reads (no pipeline stall): copy, fence, read when signalled.
  let readBuf = null, partFence = null, partGen = 0, readGen = -1;
  let fluxPBO = null, fluxFence = null, fluxData = null, fluxReady = null;
  // Record fields (detectors): rec = { A, B, fboA[], fboB[], layers, flip, list: [{ slits: Set of slit ids | null, pre }] }.
  let rec = null, uniformVersion = 0;

  function free() {
    if (!state) return;
    for (const t of state.textures) gl.deleteTexture(t);
    for (const f of state.fbos) gl.deleteFramebuffer(f);
    state = null;
  }

  // Geometry from the app's packet configuration p (units of 100 nm) and its view.
  // Grid for the geometry object geom = p.geometry. Numerical-method margins (in
  // wavelengths): absorbing layers 2.5 lambda around the domain, 2 lambda past the
  // screen; the packet starts just off the left of the canvas (display choice).
  function geometry(p, view, mode) {
    const geom = p.geometry, lambda = 2 * Math.PI / p.k, h = lambda / PPW;
    const absorber = 2.5 * lambda;
    const x0 = Math.min(view.canvasLeft, geom.wall - 2 * lambda) - 3 * p.sx;            // packet centre at the start
    const xMin = x0 - 4.5 * p.sx - absorber, xMax = geom.screen + 2 * lambda + absorber;
    const yHalf = geom.screenHalf + absorber;
    let nx = Math.ceil((xMax - xMin) / h), ny = Math.ceil(2 * yHalf / h);
    const tooBig = nx * ny > MAX_CELLS || nx > maxTex || ny > maxTex;
    return { p, geom, view, mode, lambda, h, absorber, x0, xMin, yMin: -yHalf, nx, ny, tooBig,
      gx: x => (x - xMin) / h, gy: y => (y + yHalf) / h, mx: i => xMin + i * h, my: j => -yHalf + j * h };
  }

  // Potential and slit uniforms change only with the geometry: set once per program and version.
  function setPotentialUniforms(prog) {
    if (prog.ver === uniformVersion) return;
    prog.ver = uniformVersion;
    const { p, h, geom } = G;
    const k = p.k * h, v = k;     // grid wavenumber and speed (hbar = m = 1)
    gl.uniform2i(prog.u("uRes"), G.nx, G.ny);
    gl.uniform1i(prog.u("uMode"), G.mode === "mask" ? 0 : G.mode === "absorbing" ? 2 : 1);
    gl.uniform1f(prog.u("uWallX"), G.gx(geom.wall));
    const lh = 0.5 * geom.apertureLayer / h;     // half the absorbing layer, in grid steps
    gl.uniform1f(prog.u("uLayerHalf"), lh);
    gl.uniform1f(prog.u("uWallHalf"), Math.max(1, 0.5 * (G.mode === "absorbing" ? geom.absorbingWallThickness : geom.wallThickness) / h));
    gl.uniform1f(prog.u("uWallW"), WALL_W_OVER_E * 0.5 * k * k);
    gl.uniform1f(prog.u("uV0"), G.V0);
    gl.uniform1f(prog.u("uWscale"), v / lh);
    gl.uniform1f(prog.u("uWmax"), -Math.log(1e-4) * v / lh);
    gl.uniform1f(prog.u("uSy"), geom.slitSigma / h);
    gl.uniform1f(prog.u("uBound"), geom.maskBound);
    gl.uniform1f(prog.u("uHalfOpen"), geom.openingHalf / h);
    const centers = new Float32Array(16), weights = new Float32Array(16);
    geom.open.centers.forEach((c, i) => { centers[i] = G.gy(c); weights[i] = geom.open.weights[i]; });
    gl.uniform1i(prog.u("uNOpen"), geom.open.centers.length);
    gl.uniform1fv(prog.u("uCenters"), centers);
    gl.uniform1fv(prog.u("uWeights"), weights);
    gl.uniform1f(prog.u("uAbsPx"), G.absorber / h);
    gl.uniform1f(prog.u("uAbsW"), 1.5 * 0.5 * k * k);
    gl.uniform1f(prog.u("uPartS"), 0.35 * geom.separation / h);
    gl.uniform1i(prog.u("uDrive"), G.drive); gl.uniform1i(prog.u("uOff"), G.off);
    gl.uniform1f(prog.u("uDt"), G.dt);
  }

  // ---- Records (which-slit detectors) ------------------------------------------
  // The record structure the geometry asks for: one record per open slit with a
  // detector, one for the open slits without (if any). Empty without detectors.
  function wantedRecords(geom) {
    const det = geom.detectorIds.filter(id => geom.open.ids.includes(id));
    if (!det.length) return [];
    const others = geom.open.ids.filter(id => !det.includes(id));
    return [...det.map(id => [id]), ...(others.length ? [others] : [])];
  }
  const sameSet = (a, b) => a && b && a.length === b.length && a.every(x => b.includes(x));
  function freeRecords() {
    if (!rec) return;
    gl.deleteTexture(rec.A); gl.deleteTexture(rec.B);
    for (const f of [...rec.fboA, ...rec.fboB]) gl.deleteFramebuffer(f);
    rec = null;
  }
  function allocRecords(layers, keep) {
    const w = G.nx - G.off, mk = () => { const t = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D_ARRAY, t);
      gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MIN_FILTER, gl.NEAREST); gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      gl.texStorage3D(gl.TEXTURE_2D_ARRAY, 1, gl.RGBA32F, w, G.ny, layers); return t; };
    const A = mk(), B = mk(), fboA = [], fboB = [];
    for (let l = 0; l < layers; l++) for (const [t, arr] of [[A, fboA], [B, fboB]]) {
      const f = gl.createFramebuffer(); gl.bindFramebuffer(gl.FRAMEBUFFER, f); gl.framebufferTextureLayer(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, t, 0, l);
      gl.clearBufferfv(gl.COLOR, 0, [0, 0, 0, 0]); arr.push(f);
    }
    const next = { A, B, fboA, fboB, layers, w, flip: 0, list: [] };
    if (keep) {
      // Copy the existing layers (both time levels live in one texel, so one copy per layer).
      const src = keep.flip ? keep.B : keep.A, dstFbo = next.fboA;
      for (let l = 0; l < keep.list.length; l++) {
        gl.bindFramebuffer(gl.READ_FRAMEBUFFER, (keep.flip ? keep.fboB : keep.fboA)[l]);
        gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, dstFbo[l]);
        gl.blitFramebuffer(0, 0, w, G.ny, 0, 0, w, G.ny, gl.COLOR_BUFFER_BIT, gl.NEAREST);
      }
      gl.bindFramebuffer(gl.READ_FRAMEBUFFER, null); gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, null);
      next.list = keep.list;
      gl.deleteTexture(keep.A); gl.deleteTexture(keep.B); for (const f of [...keep.fboA, ...keep.fboB]) gl.deleteFramebuffer(f);
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    return next;
  }
  // Bring the records in line with the geometry. live: during a run (keep the fields);
  // otherwise (new packet) start from the wanted records only. Returns false if the
  // record limit would be exceeded.
  function syncRecords(live) {
    const want = wantedRecords(G.geom);
    if (!live || !rec) {
      if (!live) freeRecords();
      if (!want.length) return true;
      const pre = live;   // first records during a run: the wave already behind the wall is a record of its own
      const n = want.length + (pre ? 1 : 0);
      rec = allocRecords(n, null);
      rec.list = want.map(slits => ({ slits }));
      if (pre) {
        rec.list.push({ slits: null, pre: true });
        // Copy the total wave behind the exit face into the pre-record layer.
        gl.bindFramebuffer(gl.READ_FRAMEBUFFER, state.flip ? state.fB : state.fA);
        gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, rec.fboA[n - 1]);
        gl.blitFramebuffer(G.off, 0, G.nx, G.ny, 0, 0, rec.w, G.ny, gl.COLOR_BUFFER_BIT, gl.NEAREST);
        gl.bindFramebuffer(gl.READ_FRAMEBUFFER, null); gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, null);
      }
      uniformVersion++;
      return true;
    }
    // Live change with records present: records whose slit set is still wanted keep
    // being driven; the others stop (slits = null) and evolve freely; new ones are added.
    // Without detectors, the open slits form one coherent record from now on.
    const target = want.length ? want : [G.geom.open.ids.slice()];
    for (const r of rec.list) if (r.slits && !target.some(t => sameSet(t, r.slits))) r.slits = null;
    const add = target.filter(t => !rec.list.some(r => sameSet(r.slits, t)));
    if (rec.list.length + add.length > MAX_RECORDS) return false;
    if (add.length) { const list = rec.list; rec = allocRecords(list.length + add.length, rec); rec.list = [...list, ...add.map(slits => ({ slits }))]; }
    uniformVersion++;
    return true;
  }
  function recordOfSlit() {
    const out = new Float32Array(16).fill(-1);
    if (!rec) return out;
    G.geom.open.ids.forEach((id, j) => { const b = rec.list.findIndex(r => r.slits && r.slits.includes(id)); out[j] = b; });
    return out;
  }
  function stepRecords(total) {
    if (!rec) return;
    const src = rec.flip ? rec.B : rec.A, dst = rec.flip ? rec.fboA : rec.fboB;
    gl.useProgram(progBStep); setPotentialUniforms(progBStep);
    gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, total); gl.uniform1i(progBStep.u("uTotal"), 1);
    gl.activeTexture(gl.TEXTURE2); gl.bindTexture(gl.TEXTURE_2D_ARRAY, src); gl.uniform1i(progBStep.u("uSrc"), 2);
    gl.viewport(0, 0, rec.w, G.ny);
    const mask = new Float32Array(16);
    rec.list.forEach((r, b) => {
      mask.fill(0); if (r.slits) G.geom.open.ids.forEach((id, j) => { if (r.slits.includes(id)) mask[j] = 1; });
      gl.uniform1fv(progBStep.u("uMask"), mask); gl.uniform1i(progBStep.u("uLayer"), b);
      gl.bindFramebuffer(gl.FRAMEBUFFER, dst[b]); gl.drawArrays(gl.TRIANGLES, 0, 3);
    });
    rec.flip = 1 - rec.flip;
    gl.activeTexture(gl.TEXTURE0);
  }

  // Exit face of the wall (or of the mask layer): the records start there.
  function setDrive() {
    const g = G.geom, half = G.mode === "mask" ? 0.5 * g.apertureLayer : 0.5 * (G.mode === "absorbing" ? g.absorbingWallThickness : g.wallThickness);
    G.drive = Math.ceil(G.gx(g.wall) + half / G.h + 1);
    G.off = G.drive - 1;
  }

  function reset(p, view, mode) {
    G = geometry(p, view, mode); uniformVersion++;
    if (G.tooBig) { free(); return { ok: false, reason: `The numerical grid would be ${G.nx} × ${G.ny} cells (limit ${MAX_CELLS / 1e6} million). Shorten the screen distance or the screen length.` }; }
    const k = p.k * G.h, E = 0.5 * k * k;
    G.V0 = Math.max(1, 12 * E);
    G.dt = 0.9 / (16 / 3 + G.V0);   // leapfrog limit: dt * (max eigenvalue 16/3 of -lap/2, plus V0) < 1
    G.k = k;
    G.screenCol = Math.round(G.gx(G.geom.screen));
    setDrive();
    free(); freeRecords();
    const A = tex(G.nx, G.ny), B = tex(G.nx, G.ny), FA = tex(1, G.ny), FB = tex(1, G.ny);
    state = { A, B, fA: fbo(A), fB: fbo(B), FA, FB, ffA: fbo(FA), ffB: fbo(FB), flip: 0, fflip: 0 };
    state.textures = [A, B, FA, FB]; state.fbos = [state.fA, state.fB, state.ffA, state.ffB];
    for (const f of [state.ffA, state.ffB]) { gl.bindFramebuffer(gl.FRAMEBUFFER, f); gl.clearBufferfv(gl.COLOR, 0, [0, 0, 0, 0]); }
    fluxReady = null; if (fluxFence) { gl.deleteSync(fluxFence); fluxFence = null; }
    newPacket();
    return { ok: true, nx: G.nx, ny: G.ny, h: G.h };
  }

  function newPacket() {
    const { p } = G;
    gl.bindVertexArray(vao);
    gl.useProgram(progInit);
    setPotentialUniforms(progInit);
    gl.uniform1f(progInit.u("uX0"), G.gx(G.x0)); gl.uniform1f(progInit.u("uSx"), p.sx / G.h); gl.uniform1f(progInit.u("uK"), G.k);
    gl.uniform1f(progInit.u("uS"), p.sourceSigma / G.h); gl.uniform1f(progInit.u("uXs"), G.gx(G.geom.source)); gl.uniform1f(progInit.u("uYc"), G.gy(0));
    gl.uniform1f(progInit.u("uE"), (30 - 32 * Math.cos(G.k) + 2 * Math.cos(2 * G.k)) / 24);   // -lap/2 of the fourth-order stencil for e^{ikx} gl.uniform1f(progInit.u("uDt"), G.dt);
    gl.viewport(0, 0, G.nx, G.ny);
    for (const f of [state.fA, state.fB]) { gl.bindFramebuffer(gl.FRAMEBUFFER, f); gl.drawArrays(gl.TRIANGLES, 0, 3); }
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    state.flip = 0;
    syncRecords(false);
    // Peak density for the display: the initial packet's maximum (|psi0| <= 1 at the waist).
    const tauW = (G.x0 - G.geom.source) / p.k, s = p.sourceSigma;
    G.peak = 1 / Math.sqrt(1 + (tauW / (2 * s * s)) ** 2);
    // Norm of the initial packet in grid cells (amplitude Gaussians exp(-x^2/4 sigma^2)).
    G.norm0 = 2 * Math.PI * (p.sx / G.h) * (s * Math.sqrt(1 + (tauW / (2 * s * s)) ** 2) / G.h);
    // Particles from |psi0|^2: x ~ N(x0, sx), y ~ N(0, sigma_y(x)) of the paraxial beam.
    const n = p.particles;
    partData = new Float32Array(n * 4);
    parts = [];
    for (let i = 0; i < n; i++) {
      const x = G.x0 + randn() * p.sx, tau = (x - G.geom.source) / p.k, sy = s * Math.sqrt(1 + (tau / (2 * s * s)) ** 2), y = randn() * sy;
      partData.set([G.gx(x), G.gy(y), 1, i + 1 + Math.random()], 4 * i);
      parts.push({ x, y, x0: x, path: [[x, y]], done: false, passed: false, absorbed: false, wallY: undefined, slitSide: undefined, numerical: true });
    }
    for (const b of [partBufA, partBufB]) if (b) gl.deleteBuffer(b);
    if (partVao) gl.deleteVertexArray(partVao); if (tf) gl.deleteTransformFeedback(tf);
    partBufA = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, partBufA); gl.bufferData(gl.ARRAY_BUFFER, partData, gl.DYNAMIC_COPY);
    partBufB = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, partBufB); gl.bufferData(gl.ARRAY_BUFFER, partData.byteLength, gl.DYNAMIC_COPY);
    partVao = gl.createVertexArray(); tf = gl.createTransformFeedback();
    simTau = 0; stepsDone = 0; stepCarry = 0; uniformVersion++;
    partGen++;
    if (partFence) { gl.deleteSync(partFence); partFence = null; }
    if (readBuf) gl.deleteBuffer(readBuf);
    readBuf = gl.createBuffer(); gl.bindBuffer(gl.COPY_WRITE_BUFFER, readBuf); gl.bufferData(gl.COPY_WRITE_BUFFER, partData.byteLength, gl.STREAM_READ);
    gl.bindBuffer(gl.COPY_WRITE_BUFFER, null);
  }

  function step() {
    const src = state.flip ? state.B : state.A, dst = state.flip ? state.fA : state.fB;
    gl.bindVertexArray(vao);
    gl.useProgram(progStep); setPotentialUniforms(progStep);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, src); gl.uniform1i(progStep.u("uState"), 0);
    gl.bindFramebuffer(gl.FRAMEBUFFER, dst); gl.viewport(0, 0, G.nx, G.ny); gl.drawArrays(gl.TRIANGLES, 0, 3);
    state.flip = 1 - state.flip;
    const cur = state.flip ? state.B : state.A;
    stepRecords(cur);
    // flux at the screen: of the total wave, or with records the sum over records
    if (rec) {
      const rs = rec.flip ? rec.B : rec.A;
      gl.useProgram(progBFlux);
      gl.activeTexture(gl.TEXTURE2); gl.bindTexture(gl.TEXTURE_2D_ARRAY, rs); gl.uniform1i(progBFlux.u("uSrc"), 2);
      gl.uniform1i(progBFlux.u("uCol"), G.screenCol - G.off); gl.uniform1f(progBFlux.u("uDt"), G.dt);
      gl.viewport(0, 0, 1, G.ny);
      for (let b = 0; b < rec.list.length; b++) {
        gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, state.fflip ? state.FB : state.FA); gl.uniform1i(progBFlux.u("uAcc"), 1);
        gl.uniform1i(progBFlux.u("uLayer"), b);
        gl.bindFramebuffer(gl.FRAMEBUFFER, state.fflip ? state.ffA : state.ffB); gl.drawArrays(gl.TRIANGLES, 0, 3);
        state.fflip = 1 - state.fflip;
      }
      gl.activeTexture(gl.TEXTURE0);
    } else {
    gl.useProgram(progFlux);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, cur); gl.uniform1i(progFlux.u("uState"), 0);
    gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, state.fflip ? state.FB : state.FA); gl.uniform1i(progFlux.u("uAcc"), 1);
    gl.uniform1i(progFlux.u("uCol"), G.screenCol); gl.uniform1f(progFlux.u("uDt"), G.dt);
    gl.bindFramebuffer(gl.FRAMEBUFFER, state.fflip ? state.ffA : state.ffB); gl.viewport(0, 0, 1, G.ny); gl.drawArrays(gl.TRIANGLES, 0, 3);
    state.fflip = 1 - state.fflip;
    gl.activeTexture(gl.TEXTURE0);
    }
    // particles
    gl.useProgram(progPart);
    if (progPart.ver !== uniformVersion) {
      setPotentialUniforms(progPart);
      gl.uniform1f(progPart.u("uScreenX"), G.gx(G.geom.screen));
      gl.uniform1i(progPart.u("uNRec"), rec ? rec.list.length : 0);
      gl.uniform1i(progPart.u("uPre"), rec ? Math.max(0, rec.list.findIndex(r => r.pre)) : 0);
      gl.uniform1fv(progPart.u("uRecordOfSlit"), recordOfSlit());
      gl.uniform1i(progPart.u("uRec"), 2);
    }
    gl.uniform1i(progPart.u("uFrame"), frame++);
    gl.activeTexture(gl.TEXTURE2); gl.bindTexture(gl.TEXTURE_2D_ARRAY, rec ? (rec.flip ? rec.B : rec.A) : dummyArray); gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, cur); gl.uniform1i(progPart.u("uState"), 0);
    gl.bindVertexArray(partVao); gl.bindBuffer(gl.ARRAY_BUFFER, partBufA); gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 4, gl.FLOAT, false, 16, 0);
    gl.enable(gl.RASTERIZER_DISCARD);
    gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, tf); gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, partBufB);
    gl.beginTransformFeedback(gl.POINTS); gl.drawArrays(gl.POINTS, 0, parts.length); gl.endTransformFeedback();
    gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, null); gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, null);
    gl.disable(gl.RASTERIZER_DISCARD);
    [partBufA, partBufB] = [partBufB, partBufA];
    gl.bindVertexArray(null); gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    simTau += G.dt; stepsDone++;
  }

  // Advance by a model time interval; returns the particle events of this frame.
  // Advance by a model time interval; returns the particle events that became
  // available this frame. The fractional step count is carried to the next frame,
  // so the wave advances evenly; a cap keeps a slow device from queueing work.
  function pollTimers() {
    while (pendingQueries.length) {
      const { q, n } = pendingQueries[0];
      if (!gl.getQueryParameter(q, gl.QUERY_RESULT_AVAILABLE)) break;
      pendingQueries.shift();
      const disjoint = gl.getParameter(timerExt.GPU_DISJOINT_EXT);
      if (!disjoint && n > 0) { const ms = gl.getQueryParameter(q, gl.QUERY_RESULT) / 1e6 / n; if (ms > 0) msPerStep = msPerStep == null ? ms : 0.9 * msPerStep + 0.1 * ms; }
      gl.deleteQuery(q);
    }
  }
  function updateBudget(frameMs, maxSteps) {
    if (partFence) { const st = gl.clientWaitSync(partFence, 0, 0); behind = st !== gl.ALREADY_SIGNALED && st !== gl.CONDITION_SATISFIED; }
    if (timerExt) pollTimers();
    if (msPerStep) {
      // Steps for about 70% of a frame of GPU time (the rest: picture, particles). A slow
      // GPU that would get fewer than 12 steps may use a 30 fps frame instead.
      let target = 0.7 * Math.min(17, Math.max(8, frameMs)) / msPerStep;
      if (target < 12) target = Math.min(12, 0.7 * 33 / msPerStep);
      target = Math.max(4, Math.min(maxSteps, target));
      budget += 0.15 * (target - budget);
      return;
    }
    if (behind) { lateFrames++; onTimeFrames = 0; } else { onTimeFrames++; lateFrames = 0; }
    if (cooldown > 0) cooldown--;
    if (lateFrames >= 2 && cooldown === 0) { budget = Math.max(4, budget * 0.85); cooldown = 20; lateFrames = 0; }
    else if (onTimeFrames >= 30 && lastNeed > budget) { budget = Math.min(maxSteps, budget * 1.05 + 1); onTimeFrames = 0; }
  }

  // Advance by a model time interval; returns the particle events that became available
  // this frame. The fractional step count is carried to the next frame, so the wave
  // advances evenly; when the budget limits the steps the clock follows the steps done.
  function advance(modelDt, frameMs = 16.7, maxSteps = 2000) {
    if (!state) return [];
    updateBudget(frameMs, maxSteps);
    const exact = modelDt / (G.h * G.h) / G.dt + stepCarry;
    lastNeed = Math.floor(exact);
    const n = Math.min(Math.floor(budget), Math.max(0, lastNeed));
    stepCarry = n < lastNeed ? 0 : Math.min(1, exact - n);
    if (exact > 0) speedRatio = 0.97 * speedRatio + 0.03 * Math.min(1, n / exact);
    const q = timerExt && n > 0 && pendingQueries.length < 8 ? gl.createQuery() : null;
    if (q) gl.beginQuery(timerExt.TIME_ELAPSED_EXT, q);
    for (let i = 0; i < n; i++) step();
    if (q) { gl.endQuery(timerExt.TIME_ELAPSED_EXT); pendingQueries.push({ q, n }); }
    return sync();
  }

  function requestParticleRead() {
    gl.bindBuffer(gl.COPY_READ_BUFFER, partBufA); gl.bindBuffer(gl.COPY_WRITE_BUFFER, readBuf);
    gl.copyBufferSubData(gl.COPY_READ_BUFFER, gl.COPY_WRITE_BUFFER, 0, 0, partData.byteLength);
    gl.bindBuffer(gl.COPY_READ_BUFFER, null); gl.bindBuffer(gl.COPY_WRITE_BUFFER, null);
    partFence = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0); readGen = partGen;
    gl.flush();
  }

  function sync() {
    const events = [];
    if (partFence) {
      const st = gl.clientWaitSync(partFence, 0, 0);
      if (st !== gl.ALREADY_SIGNALED && st !== gl.CONDITION_SATISFIED) return events;   // not ready: next frame
      gl.deleteSync(partFence); partFence = null;
      if (readGen === partGen) {
        gl.bindBuffer(gl.COPY_WRITE_BUFFER, readBuf);
        gl.getBufferSubData(gl.COPY_WRITE_BUFFER, 0, partData);
        gl.bindBuffer(gl.COPY_WRITE_BUFFER, null);
        collect(events);
      }
    }
    requestParticleRead();
    return events;
  }

  function collect(events) {
    for (let i = 0; i < parts.length; i++) {
      const a = parts[i]; if (a.done) continue;
      const x = G.mx(partData[4 * i]), y = G.my(partData[4 * i + 1]), mode = partData[4 * i + 2];
      a.x = x; a.y = y; a.path.push([x, y]);
      if (!a.passed && x >= G.geom.wall) { a.passed = true; a.wallY = y; events.push({ type: "wall", a }); }
      if (mode >= 10) a.record = mode - 10;
      if (mode === 2) { a.done = true; a.screenDetected = true; events.push({ type: "hit", a, y }); }
      else if (mode === 3) { a.done = true; a.absorbed = true; events.push({ type: "absorbed", a }); }
      else if (mode === 4) { a.done = true; events.push({ type: "missed", a }); }
    }
  }

  // Time-integrated flux through the screen, as a profile over the app's screen
  // range [yLo, yHi] (model units), in the analytical profile's format.
  function profile(yLo, yHi, samples = 2049) {
    if (!state) return null;
    // Asynchronous read of the accumulated flux; returns the last completed read.
    if (!fluxPBO || fluxData?.length !== 4 * G.ny) {
      if (fluxPBO) gl.deleteBuffer(fluxPBO);
      fluxPBO = gl.createBuffer(); gl.bindBuffer(gl.PIXEL_PACK_BUFFER, fluxPBO); gl.bufferData(gl.PIXEL_PACK_BUFFER, 16 * G.ny, gl.STREAM_READ); gl.bindBuffer(gl.PIXEL_PACK_BUFFER, null);
      fluxData = new Float32Array(4 * G.ny); fluxReady = null; if (fluxFence) { gl.deleteSync(fluxFence); fluxFence = null; }
    }
    if (fluxFence) {
      const st = gl.clientWaitSync(fluxFence, 0, 0);
      if (st === gl.ALREADY_SIGNALED || st === gl.CONDITION_SATISFIED) {
        gl.deleteSync(fluxFence); fluxFence = null;
        gl.bindBuffer(gl.PIXEL_PACK_BUFFER, fluxPBO); gl.getBufferSubData(gl.PIXEL_PACK_BUFFER, 0, fluxData); gl.bindBuffer(gl.PIXEL_PACK_BUFFER, null);
        fluxReady = fluxData.slice();
      }
    }
    if (!fluxFence) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, state.fflip ? state.ffB : state.ffA);
      gl.bindBuffer(gl.PIXEL_PACK_BUFFER, fluxPBO);
      gl.readPixels(0, 0, 1, G.ny, gl.RGBA, gl.FLOAT, 0);
      gl.bindBuffer(gl.PIXEL_PACK_BUFFER, null); gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      fluxFence = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0); gl.flush();
    }
    if (!fluxReady) return null;
    const buf = fluxReady;
    const values = new Array(samples), dy = (yHi - yLo) / (samples - 1);
    let integral = 0, total = 0;
    for (let s = 0; s < samples; s++) {
      const y = yLo + s * dy, g = G.gy(y) - 0.5, j0 = Math.floor(g), f = g - j0;
      const a = buf[4 * Math.max(0, Math.min(G.ny - 1, j0))], b = buf[4 * Math.max(0, Math.min(G.ny - 1, j0 + 1))];
      values[s] = Math.max(0, a + (b - a) * f);
      integral += values[s] * dy;
    }
    for (let j = 0; j < G.ny; j++) total += buf[4 * j];
    return { values, integral, total, fraction: total / G.norm0 };
  }

  // Draw the wave into this engine's canvas at the app's canvas size.
  function render({ width, height, map, fieldU, show, palette, paletteName, lo, inv, alpha }) {
    if (!state) return canvas;
    if (canvas.width !== width || canvas.height !== height) { canvas.width = width; canvas.height = height; }
    if (paletteKey !== paletteName) {
      paletteKey = paletteName;
      const data = new Uint8Array(1024 * 4);
      for (let i = 0; i < 1024; i++) { const c = palette[i]; data.set([c[0], c[1], c[2], 255], 4 * i); }
      gl.bindTexture(gl.TEXTURE_2D, paletteTex);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, 1024, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, width, height);
    gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(progRender); gl.bindVertexArray(vao);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, state.flip ? state.B : state.A); gl.uniform1i(progRender.u("uState"), 0);
    gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, paletteTex); gl.uniform1i(progRender.u("uPalette"), 1);
    gl.uniform2i(progRender.u("uRes"), G.nx, G.ny);
    gl.uniform4f(progRender.u("uMap"), map[0], map[1], map[2], map[3]);
    gl.uniform1f(progRender.u("uPeak"), G.peak); gl.uniform1f(progRender.u("uLo"), lo); gl.uniform1f(progRender.u("uInv"), inv);
    gl.uniform1f(progRender.u("uAlpha"), alpha); gl.uniform1f(progRender.u("uFieldU"), fieldU);
    gl.uniform1i(progRender.u("uShow"), show);
    gl.uniform1i(progRender.u("uNRec"), rec ? rec.list.length : 0);
    gl.uniform1i(progRender.u("uOff"), G.off); gl.uniform1i(progRender.u("uDrive"), G.drive);
    gl.activeTexture(gl.TEXTURE2); if (rec) gl.bindTexture(gl.TEXTURE_2D_ARRAY, rec.flip ? rec.B : rec.A); else gl.bindTexture(gl.TEXTURE_2D_ARRAY, dummyArray); gl.uniform1i(progRender.u("uRec"), 2);
    gl.uniform1f(progRender.u("uGain"), 30.0);   // |psi|^2 display gain (the transmitted wave is weak)
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    gl.activeTexture(gl.TEXTURE0);
    return canvas;
  }

  return {
    available: true, canvas, reset, newPacket, advance, profile, render,
    // Slits opened or closed during a run: a new geometry object, same grid.
    // Returns false if the change cannot be made live (record limit); the app then restarts.
    setGeometry(geom) {
      if (!G) return true;
      const old = G.geom; G.geom = geom; uniformVersion++;
      if (!state) return true;
      // Before the packet has moved there is nothing behind the wall: no pre-detector record.
      if (!syncRecords(stepsDone > 0)) { G.geom = old; uniformVersion++; return false; }
      return true;
    },
    // Tests: behind the exit face, |sum_b psi_b - psi| / |psi| and sum_b |psi_b|^2 / |psi|^2.
    checkRecords() {
      if (!rec) return null;
      const T = new Float32Array(G.nx * G.ny * 4);
      gl.bindFramebuffer(gl.FRAMEBUFFER, state.flip ? state.fB : state.fA); gl.readPixels(0, 0, G.nx, G.ny, gl.RGBA, gl.FLOAT, T);
      const L = rec.list.map((_, b) => { const a = new Float32Array(rec.w * G.ny * 4); gl.bindFramebuffer(gl.FRAMEBUFFER, (rec.flip ? rec.fboB : rec.fboA)[b]); gl.readPixels(0, 0, rec.w, G.ny, gl.RGBA, gl.FLOAT, a); return a; });
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      let d = 0, t = 0, rb = 0;
      for (let j = 0; j < G.ny; j++) for (let i = G.drive + 2; i < G.nx; i++) {
        const q = 4 * (j * G.nx + i); let sr = 0, si = 0;
        for (const a of L) { const r = 4 * (j * rec.w + i - G.off); sr += a[r]; si += a[r + 1]; rb += a[r] ** 2 + a[r + 1] ** 2; }
        d += (sr - T[q]) ** 2 + (si - T[q + 1]) ** 2; t += T[q] ** 2 + T[q + 1] ** 2;
      }
      return { mismatch: Math.sqrt(d / t), normTotal: t, normRecords: rb, records: L.length };
    },
    get records() { return rec ? rec.list.map(r => ({ slits: r.slits ? r.slits.slice() : null, pre: !!r.pre })) : []; },
    get particles() { return parts; },
    get grid() { return G ? { nx: G.nx, ny: G.ny, h: G.h, dt: G.dt, x0: G.x0, xMin: G.xMin, yMin: G.yMin, peak: G.peak } : null; },
    get modelTime() { return G ? simTau * G.h * G.h : 0; },
    get steps() { return stepsDone; },
    get governor() { return { budget: Math.floor(budget), msPerStep, timer: !!timerExt, behind, speedRatio }; },
    gridX: x => G.gx(x), gridY: y => G.gy(y),
    readField() {  // tests: current psi as Float32Array (nx * ny * 4)
      const out = new Float32Array(G.nx * G.ny * 4);
      gl.bindFramebuffer(gl.FRAMEBUFFER, state.flip ? state.fB : state.fA);
      gl.readPixels(0, 0, G.nx, G.ny, gl.RGBA, gl.FLOAT, out); gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      return { data: out, nx: G.nx, ny: G.ny };
    },
  };
}
