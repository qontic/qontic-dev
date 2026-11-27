// N-slit wall geometry, shared by the wave, particle and barrier shaders.
// Slit k (k = 0 … N-1) is centred at y0 - (k - (N-1)/2) * separation, so slit 1
// is at the top of the screen (the GL y axis points up).
// A shutter is a blade that slides across the opening from its upper edge.
// uSlitV[k]: fraction of slit k covered by a reflecting blade (wall potential V0).
// uSlitW[k]: fraction of slit k covered by an absorbing blade (-i uShutterW).
uniform int uNumSlits;
uniform float uSlitWidthPx;
uniform float uSlitSepPx;
uniform float uSlitV[16];
uniform float uSlitW[16];
uniform float uShutterW;
uniform int uWallAbsorb;   // 1: absorbing wall (absorbing ramp in front, wall behind)
uniform float uWallW;

float slitCenterY(int k, float y0) {
  return y0 - (float(k) - 0.5 * float(uNumSlits - 1)) * uSlitSepPx;
}

float slitBand(float x, float c, float halfW, float feather) {
  return smoothstep(c - halfW - feather, c - halfW, x) *
         (1.0 - smoothstep(c + halfW, c + halfW + feather, x));
}

// x: open part of the slits at height y; y: part covered by an absorbing blade;
// z: total slit opening (open or covered by a blade).
vec3 slitProfile(float y, float y0) {
  float hw = 0.5 * uSlitWidthPx;
  vec3 r = vec3(0.0);
  for (int k = 0; k < 16; k++) {
    if (k >= uNumSlits) break;
    float c = slitCenterY(k, y0);
    float f = clamp(uSlitV[k] + uSlitW[k], 0.0, 1.0);
    float openHalf = hw * (1.0 - f);
    // The open part keeps the lower edge of the slit; the blade comes from above.
    float open = slitBand(y, c - hw + openHalf, openHalf, 1.0) * clamp(2.0 * openHalf, 0.0, 1.0);
    float slit = slitBand(y, c, hw, 1.0);
    float covered = max(slit - open, 0.0);
    float absorbShare = f > 0.0 ? uSlitW[k] / f : 0.0;
    r += vec3(open, covered * absorbShare, slit);
  }
  return r;
}

// Wall at a point: x = fraction filled by reflecting wall (potential V0),
// y = imaginary potential W there (absorbing wall and absorbing blades).
// xFront: distance from the wall's front face (facing the source), thick: thickness.
vec2 wallVW(float slab, vec3 prof, float xFront, float thick) {
  float solid = slab * clamp(1.0 - prof.z, 0.0, 1.0);
  float blade = slab * clamp(prof.z - prof.x - prof.y, 0.0, 1.0);
  float w = uShutterW * slab * prof.y;
  if (uWallAbsorb == 1) {
    float u = clamp(xFront / max(thick, 1.0), 0.0, 1.0);
    float front = 1.0 - smoothstep(0.88, 0.92, u);
    float ramp = clamp(u / 0.9, 0.0, 1.0);
    return vec2(blade + solid * (1.0 - front), w + uWallW * solid * front * ramp * ramp);
  }
  return vec2(blade + solid, w);
}

// Fraction of the point that is reflecting wall (0 … 1).
float wallFraction(float slab, vec3 prof, float xFront, float thick) {
  return wallVW(slab, prof, xFront, thick).x;
}
