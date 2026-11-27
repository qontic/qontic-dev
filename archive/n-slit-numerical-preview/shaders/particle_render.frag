#version 300 es
precision highp float;

in float vAlive;
in float vOriginQuadrant;
in float vTailAlpha;
out vec4 fragColor;

uniform float uDotSigma;
uniform float uDotGain;
uniform int   uColorCodeMask;

vec3 colorMap(in float t, in vec3 a, in vec3 b, in vec3 c, in vec3 d)
{
    return a + b*cos(6.283185*(c*t+d));
}

void main(){
  if(vAlive < 0.5) discard;
  if(vTailAlpha <= 0.001) discard;

  vec2 p = gl_PointCoord * 2.0 - vec2(1.0);
  float r2 = dot(p, p);
  if(r2 > 1.0) discard;

  vec3 A = vec3(0.08,0.06,0.02);
  vec3 B = vec3(1.00,0.90,0.40);
  vec3 C = vec3(1.0);
  vec3 D = vec3(0.08,0.18,0.28);
  vec3 particleCol = max(colorMap(0.85, A,B,C,D), vec3(0.0));
  vec3 coreCol = vec3(1.0, 0.98, 0.88);
  int origin = int(vOriginQuadrant + 0.5);
  int colorGroup = uColorCodeMask == 4 ? ((origin >> 2) & 3) : (uColorCodeMask < 4 ? (origin & uColorCodeMask) : 0);
  if (colorGroup == 1) {
    particleCol = vec3(0.15, 0.95, 1.00);
    coreCol = vec3(0.88, 0.99, 1.00);
  } else if (colorGroup == 2) {
    particleCol = vec3(1.00, 0.28, 0.18);
    coreCol = vec3(1.00, 0.90, 0.86);
  } else if (colorGroup == 3) {
    particleCol = vec3(0.74, 0.32, 1.00);
    coreCol = vec3(0.96, 0.89, 1.00);
  }
  if (uColorCodeMask == 0) {
    particleCol = vec3(1.0, 0.92, 0.08);
    coreCol = vec3(1.0, 0.99, 0.78);
  }

  if (uColorCodeMask == 5 || uColorCodeMask == 6) {
    // By slit (colour-blind-safe palette of the analytical app) or spectrum
    // (wall-crossing height, blue at the top to yellow at the bottom).
    // Particles that have not crossed the wall yet are light grey.
    int slit = (origin >> 9) & 31, level = (origin >> 14) & 63;
    particleCol = vec3(0.78, 0.82, 0.88);
    if (uColorCodeMask == 5 && slit > 0) {
      int i = (slit - 1) % 8;
      particleCol = i == 0 ? vec3(0.902, 0.624, 0.0) : i == 1 ? vec3(0.2, 0.733, 0.933) : i == 2 ? vec3(0.0, 0.6, 0.533)
        : i == 3 ? vec3(0.941, 0.894, 0.259) : i == 4 ? vec3(0.604, 0.435, 0.878) : i == 5 ? vec3(1.0, 0.616, 0.655)
        : i == 6 ? vec3(0.835, 0.369, 0.0) : vec3(0.906, 0.541, 0.765);
    }
    if (uColorCodeMask == 6 && level > 0) {
      float t = float(level - 1) / 62.0;
      particleCol = t < 0.5 ? mix(vec3(0.27, 0.0, 0.33), vec3(0.13, 0.57, 0.55), t * 2.0) : mix(vec3(0.13, 0.57, 0.55), vec3(0.99, 0.91, 0.14), t * 2.0 - 1.0);
      particleCol = mix(particleCol, vec3(0.2, 0.4, 1.0), 0.25 * (1.0 - t));
    }
    coreCol = mix(particleCol, vec3(1.0), 0.6);
  }
  float softness = clamp(uDotSigma, 0.08, 0.65);
  float halo = exp(-r2 / softness) * (1.0 - smoothstep(0.72, 1.0, r2));
  float body = 1.0 - smoothstep(0.16, 0.72, r2);
  float core = 1.0 - smoothstep(0.0, 0.13, r2);

  vec3 col = mix(particleCol * 0.72, particleCol * 1.18, body);
  col = mix(col, coreCol, core * 0.92);

  float a = uDotGain * (11.72 * halo + 0.78 * body + 0.28 * core) * vTailAlpha;
  a = clamp(a, 0.0, 0.92);

  fragColor = vec4(col, a);
}
