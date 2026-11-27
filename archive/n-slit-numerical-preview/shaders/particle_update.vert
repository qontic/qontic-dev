#version 300 es
precision highp float;
precision highp sampler2D;

// mode: 0 dead, 1 moving, 2 left detection, 3 right, 4 bottom, 5 top.
layout(location=0) in vec4 aState; // x, y, mode, color groups (quadrant bits 0–1, radial bits 2–3)
out vec4 vState;

uniform sampler2D uState;
uniform ivec2 uSimRes;

uniform float uHBAR;
uniform float uMass;
uniform float uDT;
uniform int uGuidingMode;
uniform float uSpinMagnitude;
uniform float uSpinSign;

uniform float uBarrierXFrac;
uniform float uBarrierThickPx;
uniform float uParticleKillMarginPx;
uniform float uV0;

uniform float uAbsorbPx;
uniform float uVerticalDetectorInset;
uniform float uBoundaryFreezeChance;
uniform int uPhysicsFrame;

uniform float uRhoMin;
uniform float uVelClamp;
// Detector branches. uBranchPass = -1: particles not yet behind the wall,
// guided by the total wave; they get a branch when they cross uDriveX.
// uBranchPass = b: particles of branch b, guided by branch field b (offset texture).
uniform int uBranchPass;
uniform int uHasBranches;
uniform float uDriveX;
uniform float uBranchOfSlit[16];
uniform int uOffsetX;
//#include slits.glsl

float random01(float seed) {
  return fract(sin(seed) * 43758.5453123);
}

bool boundaryDetectionRoll() {
  float chance = clamp(uBoundaryFreezeChance, 0.0, 1.0);
  float seed = float(gl_VertexID + 1) * 12.9898 + float(uPhysicsFrame + 1) * 78.233;
  return random01(seed) < chance;
}

float band(float x, float c, float halfW, float feather) {
  return smoothstep(c - halfW - feather, c - halfW, x) *
         (1.0 - smoothstep(c + halfW, c + halfW + feather, x));
}

float barrierWallMaskAtPx(vec2 xPx) {
  float bx = uBarrierXFrac * float(uSimRes.x);
  float slab = band(xPx.x, bx, 0.5 * uBarrierThickPx, 1.0);

  if (slab <= 0.0) return 0.0;
  float xFront = xPx.x - (bx - 0.5 * uBarrierThickPx);
  return wallFraction(slab, slitProfile(xPx.y, 0.5 * float(uSimRes.y)), xFront, uBarrierThickPx);
}

// Rate (per unit time) at which |psi|^2 is removed by the absorbing wall or blades.
float shutterRateAtPx(vec2 xPx) {
  float bx = uBarrierXFrac * float(uSimRes.x);
  float slab = band(xPx.x, bx, 0.5 * uBarrierThickPx, 1.0);
  if (slab <= 0.0) return 0.0;
  float xFront = xPx.x - (bx - 0.5 * uBarrierThickPx);
  return 2.0 * wallVW(slab, slitProfile(xPx.y, 0.5 * float(uSimRes.y)), xFront, uBarrierThickPx).y / uHBAR;
}

struct BoundaryAction {
  bool freeze;
  vec2 frozenPos;
  float detectedMode;
};

BoundaryAction boundaryAction(vec2 xPx) {
  float base = uAbsorbPx + uParticleKillMarginPx;
  float absDistX = 1.5 * base;
  float freezeDistX = 1.5 * absDistX;
  float freezeDistXLeft = freezeDistX * 1.20;
  float freezeDistY = uVerticalDetectorInset;

  float w = float(uSimRes.x) - 1.0;
  float h = float(uSimRes.y) - 1.0;

  BoundaryAction a;
  a.freeze = false;
  a.detectedMode = 0.0;
  a.frozenPos = clamp(xPx, vec2(0.0), vec2(w, h));

  if (xPx.x < freezeDistXLeft) {
    a.freeze = true;
    a.detectedMode = 2.0;
    return a;
  }

  if (xPx.x > (w - freezeDistX)) {
    a.freeze = true;
    a.detectedMode = 3.0;
    return a;
  }

  if (xPx.y < freezeDistY) {
    a.freeze = true;
    a.detectedMode = 4.0;
    return a;
  }

  if (xPx.y > (h - freezeDistY)) {
    a.freeze = true;
    a.detectedMode = 5.0;
    return a;
  }

  return a;
}

vec2 samplePsiBilinear(vec2 xPx) {
  // Wave samples live at pixel centers (i + 0.5); positions use domain coordinates.
  ivec2 size = textureSize(uState, 0);
  vec2 maxX = vec2(size) - vec2(1.0);
  vec2 x = clamp(xPx - vec2(0.5) - vec2(float(uOffsetX), 0.0), vec2(0.0), maxX);

  vec2 x0 = floor(x);
  vec2 f = x - x0;

  ivec2 p00 = ivec2(x0);
  ivec2 p10 = min(p00 + ivec2(1, 0), size - ivec2(1));
  ivec2 p01 = min(p00 + ivec2(0, 1), size - ivec2(1));
  ivec2 p11 = min(p00 + ivec2(1, 1), size - ivec2(1));

  vec2 a = texelFetch(uState, p00, 0).rg;
  vec2 b = texelFetch(uState, p10, 0).rg;
  vec2 c = texelFetch(uState, p01, 0).rg;
  vec2 d = texelFetch(uState, p11, 0).rg;

  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

vec2 schrodingerVelocity(vec2 psi, vec2 dpsidx, vec2 dpsidy, float rhoEff) {
  float a = psi.x;
  float b = psi.y;

  float jx = (uHBAR / uMass) * (a * dpsidx.y - b * dpsidx.x);
  float jy = (uHBAR / uMass) * (a * dpsidy.y - b * dpsidy.x);

  return vec2(jx, jy) / rhoEff;
}

vec2 pauliSpinCorrection(float rhoEff, float drhodx, float drhody) {
  return uSpinMagnitude * uSpinSign * (uHBAR / uMass) * vec2(drhody, -drhodx) / rhoEff;
}

vec2 guidingVelocity(vec2 xPx) {
  vec2 psi = samplePsiBilinear(xPx);
  vec2 psiE = samplePsiBilinear(xPx + vec2(1.0, 0.0));
  vec2 psiW = samplePsiBilinear(xPx + vec2(-1.0, 0.0));
  vec2 psiN = samplePsiBilinear(xPx + vec2(0.0, 1.0));
  vec2 psiS = samplePsiBilinear(xPx + vec2(0.0, -1.0));

  vec2 dpsidx = 0.5 * (psiE - psiW);
  vec2 dpsidy = 0.5 * (psiN - psiS);

  float rho = dot(psi, psi);
  float rhoEff = max(rho, uRhoMin);

  vec2 v = schrodingerVelocity(psi, dpsidx, dpsidy, rhoEff);

  if (uGuidingMode == 1) {
    float rhoE = dot(psiE, psiE);
    float rhoW = dot(psiW, psiW);
    float rhoN = dot(psiN, psiN);
    float rhoS = dot(psiS, psiS);
    float drhodx = 0.5 * (rhoE - rhoW);
    float drhody = 0.5 * (rhoN - rhoS);
    v += pauliSpinCorrection(rhoEff, drhodx, drhody);
  }

  float sp = length(v);
  if (sp > uVelClamp) v *= (uVelClamp / sp);

  return v;
}

void main() {
  vec2 x = aState.xy;
  float mode = aState.z;
  int code = int(aState.w + 0.5);
  int branch = (code >> 4) & 31;
  if (uHasBranches == 1 && branch != uBranchPass + 1) {
    // Not this pass's particle: unchanged.
    vState = aState;
    gl_Position = vec4(-2.0);
    return;
  }

  if (mode < 0.5) {
    vState = aState;
    gl_Position = vec4(-2.0);
    return;
  }

  if (mode > 1.5) {
    vState = aState;
    gl_Position = vec4(-2.0);
    return;
  }

  BoundaryAction act0 = boundaryAction(x);
  bool detectedAtBoundary = boundaryDetectionRoll();
  if (barrierWallMaskAtPx(x) > 0.5) {
    vState = vec4(-10.0, -10.0, 0.0, aState.w);
    gl_Position = vec4(-2.0);
    return;
  }
  // Effective rule for the absorbing wall and blades: remove the particle with the
  // probability that |psi|^2 at its position is absorbed during this step.
  float absorbRate = shutterRateAtPx(x);
  if (absorbRate > 0.0) {
    float seed = float(gl_VertexID + 7) * 39.3468 + float(uPhysicsFrame + 3) * 11.135;
    if (random01(seed) < 1.0 - exp(-absorbRate * uDT)) {
      vState = vec4(-10.0, -10.0, 0.0, aState.w);
      gl_Position = vec4(-2.0);
      return;
    }
  }
  if (act0.freeze && detectedAtBoundary) {
    vState = vec4(act0.frozenPos, act0.detectedMode, aState.w);
    gl_Position = vec4(-2.0);
    return;
  }

  vec2 v1 = guidingVelocity(x);
  vec2 xm = clamp(x + 0.5 * uDT * v1, vec2(0.0), vec2(uSimRes) - vec2(1.0));

  BoundaryAction actM = boundaryAction(xm);
  if (actM.freeze && detectedAtBoundary) {
    vState = vec4(actM.frozenPos, actM.detectedMode, aState.w);
    gl_Position = vec4(-2.0);
    return;
  }

  vec2 v2 = guidingVelocity(xm);
  vec2 xn = x + uDT * v2;

  BoundaryAction actN = boundaryAction(xn);
  if (actN.freeze && detectedAtBoundary) {
    vState = vec4(actN.frozenPos, actN.detectedMode, aState.w);
    gl_Position = vec4(-2.0);
    return;
  }

  float w = aState.w;
  if (uBranchPass == -1 && xn.x > uDriveX && ((code >> 9) & 31) == 0) {
    // Crossing the wall exit. Bits: 0-3 start group, 4-8 detector record + 1,
    // 9-13 slit + 1, 14-19 crossing height level 1-63 (spectrum colouring).
    float y0 = 0.5 * float(uSimRes.y);
    int k = int(clamp(floor(0.5 * float(uNumSlits - 1) - (xn.y - y0) / uSlitSepPx + 0.5), 0.0, float(uNumSlits - 1)));
    float top = slitCenterY(0, y0) + 0.5 * uSlitWidthPx, bottom = slitCenterY(uNumSlits - 1, y0) - 0.5 * uSlitWidthPx;
    int level = 1 + int(clamp((top - xn.y) / max(1.0, top - bottom), 0.0, 1.0) * 62.0 + 0.5);
    code = code | ((k + 1) << 9) | (level << 14);
    if (uHasBranches == 1) { float b = uBranchOfSlit[k]; if (b >= 0.0) code = code | ((int(b) + 1) << 4); }
    w = float(code);
  }
  vState = vec4(xn, 1.0, w);
  gl_Position = vec4(-2.0);
}
