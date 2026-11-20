// Numerical engine: the time-dependent Schrödinger equation on a grid (WebGL2),
// for the same geometry as the analytical (paraxial) engine.
//
// Units are the analytical model's: lengths in 100 nm, hbar = m = 1. The grid step
// is h = lambda / PPW (PPW points per wavelength). On the grid (x = h xi, t = h^2 tau)
// the equation is i d_tau psi = -1/2 lap_xi psi + V psi - i W psi, solved by leapfrog
// with the five-point Laplacian, a constant step (stable for dt (4 + V0) < 1), a weak
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
// Pilot-wave particles start from |psi|^2 of the initial packet and move with
// v = Im(grad psi / psi) (RK2, every step) on the GPU; their positions are read back
// once per frame and handed to the app as ordinary particle objects. A particle that
// reaches the screen is a detection; the probability flux through the screen is
// accumulated as the numerical prediction.

const PPW = 16;            // numerical method: grid points per wavelength
const RA_NU = 0.01;
const MAX_CELLS = 2.2e6;   // grid size limit (x * y cells)
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
  vec2 prev = cmul(p, vec2(cos(uE*uDt), sin(uE*uDt)));
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
  vec2 lap = f(p+ivec2(1,0)) + f(p-ivec2(1,0)) + f(p+ivec2(0,1)) + f(p-ivec2(0,1)) - 4.*psi;
  vec2 VW = potential(gl_FragCoord.xy);
  // i dpsi/dt = -lap/2 + V psi  ->  dpsi/dt = (i lap/2 - i V psi)
  vec2 rhs = vec2(-.5*lap.y + VW.x*psi.y, .5*lap.x - VW.x*psi.x);
  float a = uDt * VW.y;
  vec2 next = ((1. - a)*prev + 2.*uDt*rhs) / (1. + a);
  vec2 filtered = psi + ${RA_NU.toFixed(3)} * (next - 2.*psi + prev);
  o = vec4(next, filtered);
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
  vec2 d = .5*(e - w);
  float jx = c.x*d.y - c.y*d.x;
  vec4 acc = texelFetch(uAcc, ivec2(0, j), 0);
  o = vec4(acc.x + max(jx, 0.)*uDt, acc.y + jx*uDt, 0., 0.);
}`;

// Particle state: x, y (grid), mode (1 moving, 2 detected, 3 absorbed at the wall, 4 lost at the edge), seed.
const PARTICLE_VS = `#version 300 es
precision highp float;
${COMMON}
layout(location=0) in vec4 aState;
out vec4 vState;
uniform sampler2D uState;
uniform float uDt, uScreenX;
uniform int uFrame;
vec2 samp(vec2 x){
  vec2 m = vec2(uRes) - 1.;
  vec2 y = clamp(x - .5, vec2(0.), m);
  vec2 x0 = floor(y), t = y - x0;
  ivec2 p = ivec2(x0), pe = min(p + ivec2(1,0), uRes-1), pn = min(p + ivec2(0,1), uRes-1), pne = min(p + ivec2(1,1), uRes-1);
  return mix(mix(texelFetch(uState,p,0).rg, texelFetch(uState,pe,0).rg, t.x), mix(texelFetch(uState,pn,0).rg, texelFetch(uState,pne,0).rg, t.x), t.y);
}
vec2 vel(vec2 x){
  vec2 c = samp(x);
  vec2 dx = .5*(samp(x+vec2(1.,0.)) - samp(x-vec2(1.,0.))), dy = .5*(samp(x+vec2(0.,1.)) - samp(x-vec2(0.,1.)));
  float r = max(dot(c,c), 1e-12);
  vec2 v = vec2(c.x*dx.y - c.y*dx.x, c.x*dy.y - c.y*dy.x) / r;
  float s = length(v); if (s > 4.) v *= 4./s;
  return v;
}
float rnd(float s){ return fract(sin(s)*43758.5453123); }
void main(){
  vState = aState;
  gl_Position = vec4(-2.);
  if (aState.z != 1.) return;
  vec2 x = aState.xy;
  vec2 x1 = x + .5*uDt*vel(x);
  vec2 xn = x + uDt*vel(x1);
  vec2 VW = potential(xn);
  float seed = aState.w * 17.13 + float(uFrame) * 0.618;
  float d = min(min(xn.x, float(uRes.x) - xn.x), min(xn.y, float(uRes.y) - xn.y));
  if (xn.x >= uScreenX) { vState = vec4(uScreenX, xn.y, 2., aState.w); return; }
  if (VW.x > .5*uV0) { vState = vec4(xn, 3., aState.w); return; }
  if (VW.y > 0. && rnd(seed) < 1. - exp(-2.*VW.y*uDt)) { vState = vec4(xn, d < uAbsPx ? 4. : 3., aState.w); return; }
  vState = vec4(xn, 1., aState.w);
}`;
const PARTICLE_FS = `#version 300 es
precision highp float; out vec4 o; void main(){ o = vec4(0.); }`;

// Wave picture in the app's colours: one pass over the display grid.
const RENDER = `#version 300 es
precision highp float;
uniform sampler2D uState, uPalette;
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
vec3 pal(float v){ return texture(uPalette, vec2(clamp(v,0.,1.), .5)).rgb; }
void main(){
  float u = vUV.x, v = 1. - vUV.y;     // canvas y downwards
  if (u > uFieldU) { o = vec4(0.); return; }
  vec2 psi = samp(vec2(uMap.x + u*uMap.y, uMap.z + v*uMap.w));
  float rho = dot(psi, psi), rel = rho / uPeak;
  if (uShow == 4) {
    float vis = smoothstep(0.001, 0.002, sqrt(rel));
    float I = pow(clamp(1. - exp(-20.*rel), 0., 1.), 0.5);
    float ph = rel > 0. && vis > 0. ? atan(psi.y, psi.x) : 0.;
    vec3 dens = mix(vec3(0.26,0.13,0.49), vec3(0.72,0.50,0.99), pow(I, 0.7));
    o = vec4(mix(dens, phaseColor(ph), 0.77905591) * I * vis * uAlpha, 1.0);
    return;
  }
  // Visibility on a log scale (down to 1e-4 of the incoming peak), so the much
  // weaker transmitted wave shows; colour as in the analytical engine.
  float raw = clamp((log(max(rel, 1e-12))/2.302585 + 4.)/3., 0., 1.);
  float weight = (1. - exp(-3.*raw)) / (1. - exp(-3.));
  if (weight <= 0.002) { o = vec4(0.); return; }
  float c = rho > 0. ? psi.x / sqrt(rho) : 1.;
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

  let G = null;           // grid and geometry
  let state = null;       // textures, buffers
  let parts = [];         // particle objects for the app
  let partData = null, partBufA = null, partBufB = null, partVao = null, tf = null;
  let frame = 0, simTau = 0, stepsDone = 0, stepCarry = 0;
  // Asynchronous GPU -> CPU reads (no pipeline stall): copy, fence, read when signalled.
  let readBuf = null, partFence = null, partGen = 0, readGen = -1;
  let fluxPBO = null, fluxFence = null, fluxData = null, fluxReady = null;

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

  function setPotentialUniforms(prog) {
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
  }

  function reset(p, view, mode) {
    G = geometry(p, view, mode);
    if (G.tooBig) { free(); return { ok: false, reason: `The numerical grid would be ${G.nx} × ${G.ny} cells (limit ${MAX_CELLS / 1e6} million). Shorten the screen distance or the screen length.` }; }
    const k = p.k * G.h, E = 0.5 * k * k;
    G.V0 = Math.max(1, 12 * E);
    G.dt = 0.9 / (4 + G.V0);
    G.k = k;
    G.screenCol = Math.round(G.gx(G.geom.screen));
    free();
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
    gl.uniform1f(progInit.u("uE"), 0.5 * G.k * G.k); gl.uniform1f(progInit.u("uDt"), G.dt);
    gl.viewport(0, 0, G.nx, G.ny);
    for (const f of [state.fA, state.fB]) { gl.bindFramebuffer(gl.FRAMEBUFFER, f); gl.drawArrays(gl.TRIANGLES, 0, 3); }
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    state.flip = 0;
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
    simTau = 0; stepsDone = 0; stepCarry = 0;
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
    gl.uniform1f(progStep.u("uDt"), G.dt);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, src); gl.uniform1i(progStep.u("uState"), 0);
    gl.bindFramebuffer(gl.FRAMEBUFFER, dst); gl.viewport(0, 0, G.nx, G.ny); gl.drawArrays(gl.TRIANGLES, 0, 3);
    state.flip = 1 - state.flip;
    const cur = state.flip ? state.B : state.A;
    // flux at the screen
    gl.useProgram(progFlux);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, cur); gl.uniform1i(progFlux.u("uState"), 0);
    gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, state.fflip ? state.FB : state.FA); gl.uniform1i(progFlux.u("uAcc"), 1);
    gl.uniform1i(progFlux.u("uCol"), G.screenCol); gl.uniform1f(progFlux.u("uDt"), G.dt);
    gl.bindFramebuffer(gl.FRAMEBUFFER, state.fflip ? state.ffA : state.ffB); gl.viewport(0, 0, 1, G.ny); gl.drawArrays(gl.TRIANGLES, 0, 3);
    state.fflip = 1 - state.fflip;
    gl.activeTexture(gl.TEXTURE0);
    // particles
    gl.useProgram(progPart); setPotentialUniforms(progPart);
    gl.uniform1f(progPart.u("uDt"), G.dt); gl.uniform1f(progPart.u("uScreenX"), G.gx(G.geom.screen)); gl.uniform1i(progPart.u("uFrame"), frame++);
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
  function advance(modelDt, maxSteps = 400) {
    if (!state) return [];
    const exact = modelDt / (G.h * G.h) / G.dt + stepCarry;
    const n = Math.min(maxSteps, Math.max(0, Math.floor(exact)));
    stepCarry = Math.min(1, exact - n);
    for (let i = 0; i < n; i++) step();
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
    gl.uniform1f(progRender.u("uGain"), 30.0);   // |psi|^2 display gain (the transmitted wave is weak)
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    gl.activeTexture(gl.TEXTURE0);
    return canvas;
  }

  return {
    available: true, reset, newPacket, advance, profile, render,
    // Slits opened or closed during a run: a new geometry object, same grid.
    setGeometry(geom) { if (G) G.geom = geom; },
    get particles() { return parts; },
    get grid() { return G ? { nx: G.nx, ny: G.ny, h: G.h, dt: G.dt, x0: G.x0, xMin: G.xMin, yMin: G.yMin, peak: G.peak } : null; },
    get modelTime() { return G ? simTau * G.h * G.h : 0; },
    get steps() { return stepsDone; },
    gridX: x => G.gx(x), gridY: y => G.gy(y),
    readField() {  // tests: current psi as Float32Array (nx * ny * 4)
      const out = new Float32Array(G.nx * G.ny * 4);
      gl.bindFramebuffer(gl.FRAMEBUFFER, state.flip ? state.fB : state.fA);
      gl.readPixels(0, 0, G.nx, G.ny, gl.RGBA, gl.FLOAT, out); gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      return { data: out, nx: G.nx, ny: G.ny };
    },
  };
}
