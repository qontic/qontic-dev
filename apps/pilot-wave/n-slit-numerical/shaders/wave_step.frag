#version 300 es
precision highp float;
precision highp sampler2D;

uniform sampler2D uState; 
uniform ivec2 uSimRes;

uniform float uHBAR;
uniform float uMass;
uniform float uP0;
uniform float uDT;

uniform float uBarrierXFrac;
uniform float uBarrierThickPx;
uniform float uV0;

uniform float uAbsorbPx;        
uniform float uAbsorbYPx;
uniform float uAbsorbYStrength;
uniform float uAbsorbStrength;  

out vec4 fragColor;

float band(float x, float c, float halfW, float feather){
  return smoothstep(c-halfW-feather, c-halfW, x) *
         (1.0 - smoothstep(c+halfW, c+halfW+feather, x));
}

//#include slits.glsl
float barrierSlab(vec2 xPx){
  float bx = uBarrierXFrac * float(uSimRes.x);
  return band(xPx.x, bx, 0.5*uBarrierThickPx, 1.0);
}

float barrierPotentialPx(vec2 xPx){
  float slab = barrierSlab(xPx);
  if (slab <= 0.0) return 0.0;
  return uV0 * wallFraction(slab, slitProfile(xPx.y, 0.5 * float(uSimRes.y)));
}

// Absorbing shutter inside closing slits (imaginary potential -i W).
float shutterW(vec2 xPx){
  float slab = barrierSlab(xPx);
  if (slab <= 0.0 || uShutterW <= 0.0) return 0.0;
  return uShutterW * slab * slitProfile(xPx.y, 0.5 * float(uSimRes.y)).y;
}

float absorberProfile(float distance, float width){
  if(width <= 0.0) return 0.0;
  float t = clamp((width - distance) / width, 0.0, 1.0);
  float s = t * t * t * (t * (t * 6.0 - 15.0) + 10.0);
  return s * s;
}

float absorbW(vec2 xPx){
  float dx = min(xPx.x * 1.20, float(uSimRes.x) - xPx.x);
  float dy = min(xPx.y, float(uSimRes.y) - xPx.y);
  // The vertical ramp is wider and entirely in the offscreen extension.
  return max(uAbsorbStrength * absorberProfile(dx, uAbsorbPx), uAbsorbYStrength * absorberProfile(dy, uAbsorbYPx)) + shutterW(xPx);
}

vec2 fetchPsi(ivec2 q){
  if(q.x < 0 || q.y < 0 || q.x >= uSimRes.x || q.y >= uSimRes.y) return vec2(0.0);
  return texelFetch(uState, q, 0).rg;
}

vec2 schrodingerRHS(vec2 psi, vec2 lapPsi, float V){
  
  float cLap = uHBAR / (2.0*uMass);
  float cV   = V / uHBAR;
  return vec2(-cLap*lapPsi.y + cV*psi.y,
               cLap*lapPsi.x - cV*psi.x);
}

void main() {
  ivec2 p = ivec2(gl_FragCoord.xy);

  vec4 s = texelFetch(uState, p, 0);
  vec2 psi     = s.rg;
  vec2 psiPrev = s.ba;

  
  vec2 psiE = fetchPsi(p + ivec2( 1, 0));
  vec2 psiW = fetchPsi(p + ivec2(-1, 0));
  vec2 psiN = fetchPsi(p + ivec2( 0, 1));
  vec2 psiS = fetchPsi(p + ivec2( 0,-1));
  vec2 lapPsi = (psiE + psiW + psiN + psiS - 4.0*psi);

  // Use the same pixel centers as initialization, rendering, and particle sampling.
  vec2 xPx = gl_FragCoord.xy;
  float V = barrierPotentialPx(xPx);

  
  vec2 rhs = schrodingerRHS(psi, lapPsi, V);

  float W = absorbW(xPx);
  float absorbA = uDT * W / uHBAR;

  // Time-center the local absorber so the leapfrog update stays stable
  // even when the absorbing potential is strong.
  vec2 psiNext = ((1.0 - absorbA) * psiPrev + 2.0 * uDT * rhs) / (1.0 + absorbA);

  // Robert–Asselin time filter (nu = 0.01). Leapfrog carries a spurious mode
  // that alternates sign every step and evolves roughly under -H, so the high
  // wall traps it and it shows as a glow there. The filter damps that mode;
  // for travelling waves its damping is ~ nu (omega dt)^2 ~ 1e-7 per step.
  const float RA_NU = 0.01;
  vec2 psiFiltered = psi + RA_NU * (psiNext - 2.0 * psi + psiPrev);
  fragColor = vec4(psiNext, psiFiltered);
}
