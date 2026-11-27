#version 300 es
precision highp float;
precision highp sampler2D;
// Difference between the live wave and the reference wave that kept the
// slits as they were before the first slit change: rg = gain * (psi - psi_ref).
uniform sampler2D uLive;
uniform sampler2D uRef;
uniform float uGain;
out vec4 fragColor;
void main() {
  ivec2 p = ivec2(gl_FragCoord.xy);
  vec2 d = texelFetch(uLive, p, 0).rg - texelFetch(uRef, p, 0).rg;
  fragColor = vec4(uGain * d, 0.0, 0.0);
}
