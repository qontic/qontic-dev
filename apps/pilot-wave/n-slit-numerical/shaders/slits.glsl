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

float slitCenterY(int k, float y0) {
  return y0 - (float(k) - 0.5 * float(uNumSlits - 1)) * uSlitSepPx;
}

float slitBand(float x, float c, float halfW, float feather) {
  return smoothstep(c - halfW - feather, c - halfW, x) *
         (1.0 - smoothstep(c + halfW, c + halfW + feather, x));
}

// x: open part of the slits at height y; y: part covered by an absorbing blade.
vec2 slitProfile(float y, float y0) {
  float hw = 0.5 * uSlitWidthPx;
  vec2 r = vec2(0.0);
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
    r += vec2(open, covered * absorbShare);
  }
  return r;
}

// Fraction of the point that is reflecting wall (0 … 1), given the slab profile.
float wallFraction(float slab, vec2 prof) {
  return slab * clamp(1.0 - prof.x - prof.y, 0.0, 1.0);
}
