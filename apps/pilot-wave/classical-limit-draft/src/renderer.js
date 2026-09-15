import { VelocityField } from './velocity-field.js';
import { BOX, clamp, classicalPosition } from './physics.js';

export const TRAIL_WIDTH_RATIO = 0.6;
const PARTICLE_COLOR = [0.08 + Math.cos(2 * Math.PI * 0.93), 0.06 + 0.9 * Math.cos(2 * Math.PI * 1.03), 0.02 + 0.4 * Math.cos(2 * Math.PI * 1.13)];
const REFERENCE_COLOR = [0.35, 0.9, 1.0];

const vertex = `#version 300 es
precision highp float;
out vec2 uv;
void main(){vec2 p=vec2(float((gl_VertexID<<1)&2),float(gl_VertexID&2));uv=p;gl_Position=vec4(p*2.0-1.0,0,1);}`;

const waveFragment = `#version 300 es
precision highp float;
precision highp sampler2D;
uniform sampler2D waveX;
uniform sampler2D waveY;
uniform sampler2D field;
uniform bool fullWave;
uniform vec2 waveGrid;
uniform vec3 obstacle;
uniform vec2 viewport;
uniform vec2 center;
uniform float zoom;
uniform float peak;
uniform float brightness;
uniform float phaseAmount;
uniform float pixelScale;
uniform float outputPixelScale;
uniform bool visible;
in vec2 uv;
out vec4 color;
vec4 sampleWave(sampler2D wave,float u){
  ivec2 res=textureSize(wave,0);int n=res.x*res.y;float q=clamp(u,0.0,1.0)*float(n);
  int a=min(int(floor(q)),n-1);float f=q-float(a);
  vec4 p=texelFetch(wave,ivec2(a%res.x,a/res.x),0);
  int b=a+1;
  vec4 r=b<n?texelFetch(wave,ivec2(b%res.x,b/res.x),0):vec4(0.0);
  return mix(p,r,f);
}
vec4 node(ivec2 p){vec2 z=texelFetch(field,clamp(p,ivec2(0),ivec2(waveGrid)),0).xy;return vec4(z,dot(z,z),0);}
vec4 cubic(float f){return vec4(-0.5*f+f*f-0.5*f*f*f,1.0-2.5*f*f+1.5*f*f*f,0.5*f+2.0*f*f-1.5*f*f*f,-0.5*f*f+0.5*f*f*f);}
vec4 sampleField(vec2 world){
  vec2 q=world*waveGrid,f=fract(q);ivec2 p=ivec2(floor(q));
  vec4 wx=cubic(f.x),wy=cubic(f.y);vec2 z=vec2(0);
  for(int j=0;j<4;j++)for(int i=0;i<4;i++)z+=node(p+ivec2(i-1,j-1)).xy*wx[i]*wy[j];
  return vec4(z,dot(z,z),0);
}
vec3 drawEdge(vec3 c,vec2 world){
  if(obstacle.z<0.5)return c;
  vec2 pixel=(world-obstacle.xy)*viewport*zoom;
  float d=length(vec2(pixel.x,max(0.0,pixel.y)))/pixelScale;
  c=mix(c,vec3(0.012,0.017,0.03),0.8*(1.0-smoothstep(2.0,4.0,d)));
  return mix(c,vec3(0.65,0.75,0.83),1.0-smoothstep(0.8,1.8,d));
}
// Phase mapping from Bohmian Free Packet/shaders/wave_render.frag.
vec3 freePacketPhaseColor(float ph){
  const float halfPi=1.57079633;
  const float blackFadeWidth=1.05;
  const vec3 blue=vec3(0.08,0.25,1.0);
  const vec3 red=vec3(1.0,0.08,0.02);
  const vec3 magenta=vec3(0.72,0.04,0.88);
  float magnitude=abs(ph);
  vec3 branchColor=ph>=0.0?blue:red;
  float seamBlend=clamp((magnitude-halfPi)/halfPi,0.0,1.0);
  float fadeProgress=clamp(magnitude/blackFadeWidth,0.0,1.0);
  float phaseVisibility=fadeProgress*fadeProgress*fadeProgress
    *(fadeProgress*(fadeProgress*6.0-15.0)+10.0);
  return mix(branchColor,magenta,seamBlend)*phaseVisibility;
}
void main(){
  vec2 world=center+(uv-0.5)/zoom;
  vec3 bg=vec3(0.008,0.012,0.028);
  if(any(lessThan(world,vec2(0)))||any(greaterThan(world,vec2(1)))){color=vec4(bg,1);return;}
  float edge=min(min(world.x,1.0-world.x),min(world.y,1.0-world.y));
  bg+=vec3(0.014,0.01,0.028)*exp(-edge*35.0);
  if(!visible){color=vec4(drawEdge(bg,world),1);return;}
  vec2 psi;float density;
  if(fullWave){vec4 a=sampleField(world);psi=a.xy;density=a.z;}
  else{vec4 a=sampleWave(waveX,world.x),b=sampleWave(waveY,world.y);density=a.z*b.z;psi=vec2(a.x*b.x-a.y*b.y,a.x*b.y+a.y*b.x);}
  float rho=max(density,0.0)/max(peak,1e-8);
  float intensity=pow(1.0-exp(-3.1*brightness*pow(rho,0.66)),1.08);
  // Restore the earlier palette, with a small contrast lift in the density.
  // Attenuate only phase detail too fine for the final output pixels.
  vec2 unit=psi/max(length(psi),1e-20);
  float footprint=max(length(dFdx(unit)),length(dFdy(unit)))*outputPixelScale;
  float resolved=1.0-smoothstep(0.55,1.5,footprint);
  float ph=atan(psi.y,psi.x);
  vec3 phaseColor=freePacketPhaseColor(ph);
  vec3 densityColor=mix(vec3(0.26,0.13,0.49),vec3(0.72,0.50,0.99),pow(intensity,0.7));
  vec3 waveColor=mix(densityColor,phaseColor,phaseAmount*resolved);
  color=vec4(drawEdge(bg+waveColor*intensity,world),1);
}`;

const lineVertex = `#version 300 es
precision highp float;
layout(location=0) in vec2 position;
layout(location=1) in float opacity;
uniform vec2 center;
uniform float zoom;
out float alpha;
void main(){vec2 uv=position/vec2(1.6,1.0);gl_Position=vec4((uv-center)*zoom*2.0,0,1);alpha=opacity;}`;
const lineFragment = `#version 300 es
precision highp float;
uniform vec3 tint;
in float alpha;
out vec4 color;
void main(){color=vec4(tint,alpha);}`;
const pointVertex = `#version 300 es
precision highp float;
layout(location=0) in vec2 position;
uniform vec2 center;
uniform float zoom;
uniform float size;
uniform vec2 viewport;
out vec2 local;
void main(){
  vec2 corners[6]=vec2[6](vec2(-1,-1),vec2(1,-1),vec2(-1,1),vec2(-1,1),vec2(1,-1),vec2(1,1));
  local=corners[gl_VertexID];
  vec2 uv=position/vec2(1.6,1.0);
  gl_Position=vec4((uv-center)*zoom*2.0+local*size/viewport,0,1);
}`;
const pointFragment = `#version 300 es
precision highp float;
uniform vec3 tint;
uniform bool outlined;
in vec2 local;
out vec4 color;
void main(){
  float r2=dot(local,local);if(r2>1.0)discard;
  if(outlined){
    float r=sqrt(r2),aa=max(fwidth(r),0.01);
    float body=1.0-smoothstep(0.72-aa,0.72+aa,r);
    vec3 c=mix(vec3(0.006,0.018,0.032),tint,body);
    c=mix(c,vec3(0.92,1.0,1.0),0.9*(1.0-smoothstep(0.0,0.35,r)));
    color=vec4(c,1.0-smoothstep(1.0-aa,1.0,r));
    return;
  }
  float halo=exp(-r2/0.28)*(1.0-smoothstep(0.72,1.0,r2));
  float body=1.0-smoothstep(0.16,0.72,r2);
  float core=1.0-smoothstep(0.0,0.13,r2);
  vec3 c=mix(tint*0.72,tint*1.18,body);
  c=mix(c,vec3(1.0,0.98,0.88),core*0.92);
  float alpha=clamp(11.72*halo+0.78*body+0.28*core,0.0,0.92);
  color=vec4(c,alpha);
}`;

// Screen-space capsules make the width independent of WebGL's line-width limit.
const trailVertex = `#version 300 es
precision highp float;
layout(location=0) in vec3 startPoint;
layout(location=1) in vec3 endPoint;
uniform vec2 center;
uniform float zoom;
uniform vec2 viewport;
uniform float radius;
out vec2 local;
flat out float segmentLength;
flat out vec2 fade;
void main(){
  vec2 corners[6]=vec2[6](vec2(0,-1),vec2(1,-1),vec2(0,1),vec2(0,1),vec2(1,-1),vec2(1,1));
  vec2 corner=corners[gl_VertexID];
  vec2 a=((startPoint.xy/vec2(1.6,1.0)-center)*zoom+0.5)*viewport;
  vec2 b=((endPoint.xy/vec2(1.6,1.0)-center)*zoom+0.5)*viewport;
  vec2 delta=b-a;segmentLength=length(delta);
  vec2 tangent=segmentLength>1e-5?delta/segmentLength:vec2(1,0);
  local=vec2(mix(-radius,segmentLength+radius,corner.x),corner.y*radius);
  vec2 pixel=a+tangent*local.x+vec2(-tangent.y,tangent.x)*local.y;
  gl_Position=vec4(pixel/viewport*2.0-1.0,0,1);
  fade=vec2(startPoint.z,endPoint.z)/0.62;
}`;
const trailFragment = `#version 300 es
precision highp float;
uniform float radius;
in vec2 local;
flat in float segmentLength;
flat in vec2 fade;
out vec4 color;
float erfApprox(float x){
  float a=abs(x),t=1.0/(1.0+0.3275911*a);
  float p=(((((1.061405429*t-1.453152027)*t)+1.421413741)*t-0.284496736)*t+0.254829592)*t;
  return sign(x)*(1.0-p*exp(-a*a));
}
void main(){
  float closest=clamp(local.x,0.0,segmentLength);
  float r=length(vec2(local.x-closest,local.y))/radius;
  if(r>=1.0)discard;
  float age=mix(fade.x,fade.y,segmentLength>1e-5?closest/segmentLength:1.0);
  // Integrate a soft round brush along the segment. Additive integrals preserve
  // real crossings without bright joints or dependence on path subdivision.
  float y=local.y/radius,x=local.x/radius,len=segmentLength/radius;
  float reach=sqrt(max(0.0,1.0-y*y));
  float lo=max(-x,-reach),hi=min(len-x,reach);
  float coverage=max(0.0,0.5*(erfApprox(hi/sqrt(0.28))-erfApprox(lo/sqrt(0.28))));
  float density=age*exp(-y*y/0.28)*coverage*(1.0-smoothstep(0.84,1.0,abs(y)));
  color=vec4(density,0,0,1);
}`;
const trailCompositeFragment = `#version 300 es
precision highp float;
uniform sampler2D trailMask;
uniform vec3 tint;
uniform bool warmOverlaps;
uniform bool outlined;
in vec2 uv;
out vec4 color;
void main(){
  float density=texture(trailMask,uv).r;
  if(outlined){
    // Opaque cyan with a dark rim stays legible over bright ensemble crossings.
    float coverage=smoothstep(0.02,0.09,density);
    float body=smoothstep(0.13,0.33,density);
    color=vec4(mix(vec3(0.006,0.018,0.032),tint,body),coverage);
    return;
  }
  float exposure=1.35*density;
  float alpha=pow(1.0-exp(-exposure),0.6);
  vec3 c=tint;
  if(warmOverlaps){
    c=mix(c,vec3(1.0,0.55,0.08),0.45*smoothstep(1.0,3.0,exposure));
    c=mix(c,vec3(1.0,0.35,0.62),0.30*smoothstep(3.0,5.0,exposure));
  }
  color=vec4(c,alpha);
}`;

function program(gl, vsSource, fsSource) {
  const p = gl.createProgram();
  for (const [type, source] of [[gl.VERTEX_SHADER, vsSource], [gl.FRAGMENT_SHADER, fsSource]]) {
    const s = gl.createShader(type); gl.shaderSource(s, source); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
    gl.attachShader(p, s); gl.deleteShader(s);
  }
  gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
  const locations = new Map();
  return { p, uniform(name) { if (!locations.has(name)) locations.set(name, gl.getUniformLocation(p, name)); return locations.get(name); } };
}

export class TrailHistory {
  constructor(count, capacity = Math.min(18000, Math.floor(1000000 / count))) {
    this.count = count; this.capacity = capacity; this.head = 0; this.length = 0;
    this.times = new Float64Array(capacity);
    this.positions = new Float32Array(capacity * count * 2);
    this.vertices = new Float32Array(capacity * count * 6);
    this.sampleInterval = count > 64 ? 1 / 30 : 1 / 120;
  }
  append(time, positions, force = false) {
    // High-refresh monitors should not fill history faster than 60 Hz monitors.
    // Curvature-refined samples can bypass this visual-only spacing limit.
    const previous = (this.head - 1 + this.capacity) % this.capacity;
    if (!force && this.length && time - this.times[previous] < this.sampleInterval - 1e-8) return;
    const i = this.head; this.times[i] = time;
    this.positions.set(positions, i * this.count * 2);
    this.head = (this.head + 1) % this.capacity;
    this.length = Math.min(this.capacity, this.length + 1);
  }
  clear() { this.head = 0; this.length = 0; }
  lines(time, seconds) {
    let write = 0;
    const start = (this.head - this.length + this.capacity) % this.capacity;
    for (let k = 1; k < this.length; k++) {
      const a = (start + k - 1) % this.capacity, b = (start + k) % this.capacity;
      if (this.times[b] < time - seconds) continue;
      const alphaA = 0.62 * Math.pow(Math.max(0, 1 - (time - this.times[a]) / seconds), 0.55);
      const alphaB = 0.62 * Math.pow(Math.max(0, 1 - (time - this.times[b]) / seconds), 0.55);
      for (let j = 0; j < this.count; j++) {
        const ai = (a * this.count + j) * 2, bi = (b * this.count + j) * 2;
        this.vertices[write++] = this.positions[ai]; this.vertices[write++] = this.positions[ai + 1]; this.vertices[write++] = alphaA;
        this.vertices[write++] = this.positions[bi]; this.vertices[write++] = this.positions[bi + 1]; this.vertices[write++] = alphaB;
      }
    }
    return this.vertices.subarray(0, write);
  }
}

export class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    const gl = canvas.getContext('webgl2', { alpha: false, antialias: true, preserveDrawingBuffer: true });
    if (!gl) throw new Error('WebGL2 is unavailable. Enable hardware acceleration in your browser and reload.');
    if (!gl.getExtension('EXT_color_buffer_float')) throw new Error('Floating-point rendering is needed for the luminous trails. Enable hardware acceleration and reload.');
    this.gl = gl; this.center = [0.5, 0.5]; this.zoom = 1;
    this.wave = program(gl, vertex, waveFragment);
    this.lines = program(gl, lineVertex, lineFragment);
    this.points = program(gl, pointVertex, pointFragment);
    this.trails = program(gl, trailVertex, trailFragment);
    this.trailComposite = program(gl, vertex, trailCompositeFragment);
    this.emptyVAO = gl.createVertexArray();
    this.lineVAO = gl.createVertexArray(); this.lineBuffer = gl.createBuffer();
    gl.bindVertexArray(this.lineVAO); gl.bindBuffer(gl.ARRAY_BUFFER, this.lineBuffer);
    gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 12, 0);
    gl.enableVertexAttribArray(1); gl.vertexAttribPointer(1, 1, gl.FLOAT, false, 12, 8);
    this.pointVAO = gl.createVertexArray(); this.pointBuffer = gl.createBuffer();
    gl.bindVertexArray(this.pointVAO); gl.bindBuffer(gl.ARRAY_BUFFER, this.pointBuffer);
    gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 8, 0);
    gl.vertexAttribDivisor(0, 1);
    this.trailVAO = gl.createVertexArray(); this.trailBuffer = gl.createBuffer();
    gl.bindVertexArray(this.trailVAO); gl.bindBuffer(gl.ARRAY_BUFFER, this.trailBuffer);
    gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 24, 0); gl.vertexAttribDivisor(0, 1);
    gl.enableVertexAttribArray(1); gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 24, 12); gl.vertexAttribDivisor(1, 1);
    this.trailMask = gl.createTexture(); this.trailFramebuffer = gl.createFramebuffer();
    this.trailMaskWidth = 0; this.trailMaskHeight = 0;
    gl.bindTexture(gl.TEXTURE_2D, this.trailMask);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    this.textures = [gl.createTexture(), gl.createTexture()]; this.textureSize = 0;
    for (const t of this.textures) {
      gl.bindTexture(gl.TEXTURE_2D, t);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    }
    const debug = gl.getExtension('WEBGL_debug_renderer_info');
    this.gpu = debug ? gl.getParameter(debug.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER);
    this.recordingSize = null;
    this.velocityField = new VelocityField(gl, program);
  }
  resize() {
    this.dpr = this.recordingScale ?? Math.min(2, window.devicePixelRatio || 1);
    const width = this.recordingSize?.[0] ?? Math.max(2, Math.round(this.canvas.clientWidth * this.dpr));
    const height = this.recordingSize?.[1] ?? Math.max(2, Math.round(this.canvas.clientHeight * this.dpr));
    if (this.canvas.width !== width || this.canvas.height !== height) { this.canvas.width = width; this.canvas.height = height; }
    this.gl.viewport(0, 0, width, height);
  }
  resetView() { this.center = [0.5, 0.5]; this.zoom = 1; }
  clampView() {
    const half = 0.5 / this.zoom;
    this.center[0] = clamp(this.center[0], half, 1 - half);
    this.center[1] = clamp(this.center[1], half, 1 - half);
  }
  setView(program) {
    this.gl.uniform2fv(program.uniform('center'), this.center);
    this.gl.uniform1f(program.uniform('zoom'), this.zoom);
  }
  uploadWave(experiment) {
    const gl = this.gl, n = experiment.xAxis.n;
    // Pack long 1D waves into rows, keeping compatibility with a 4096 texture
    // dimension limit even at the new 32768-interval endpoint.
    const width = Math.min(n, 4096), height = n / width;
    if (Math.max(width, height) > gl.getParameter(gl.MAX_TEXTURE_SIZE)) throw new Error('This GPU cannot hold the required wave resolution.');
    const axes = [experiment.xAxis, experiment.yAxis];
    for (let i = 0; i < 2; i++) {
      axes[i].updateTexture(); gl.activeTexture(gl.TEXTURE0 + i); gl.bindTexture(gl.TEXTURE_2D, this.textures[i]);
      if (this.textureSize !== n) gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, width, height, 0, gl.RGBA, gl.FLOAT, axes[i].texture);
      else gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, width, height, gl.RGBA, gl.FLOAT, axes[i].texture);
    }
    this.textureSize = n;
  }
  drawLines(data, tint) {
    if (!data.length) return;
    const gl = this.gl;
    gl.useProgram(this.lines.p); this.setView(this.lines); gl.uniform3fv(this.lines.uniform('tint'), tint);
    gl.bindVertexArray(this.lineVAO); gl.bindBuffer(gl.ARRAY_BUFFER, this.lineBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.DYNAMIC_DRAW); gl.drawArrays(gl.LINES, 0, data.length / 3);
  }
  drawPoints(data, tint, size, outlined = false) {
    const gl = this.gl;
    gl.useProgram(this.points.p); this.setView(this.points);
    gl.uniform3fv(this.points.uniform('tint'), tint); gl.uniform1f(this.points.uniform('size'), size * this.dpr * Math.sqrt(this.zoom));
    gl.uniform1i(this.points.uniform('outlined'), outlined ? 1 : 0);
    gl.uniform2f(this.points.uniform('viewport'), this.canvas.width, this.canvas.height);
    gl.bindVertexArray(this.pointVAO); gl.bindBuffer(gl.ARRAY_BUFFER, this.pointBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.DYNAMIC_DRAW); gl.drawArraysInstanced(gl.TRIANGLES, 0, 6, data.length / 2);
  }
  drawTrails(data, particleSize, tint = [1, 1, 0], warmOverlaps = true, outlined = false) {
    if (!data.length) return;
    const gl = this.gl, width = this.canvas.width, height = this.canvas.height;
    gl.activeTexture(gl.TEXTURE2); gl.bindTexture(gl.TEXTURE_2D, this.trailMask);
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.trailFramebuffer);
    if (this.trailMaskWidth !== width || this.trailMaskHeight !== height) {
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.R16F, width, height, 0, gl.RED, gl.HALF_FLOAT, null);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.trailMask, 0);
      if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) throw new Error('Could not create the trail surface.');
      this.trailMaskWidth = width; this.trailMaskHeight = height;
    }
    gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
    // Preserve accumulated density above one so crossings can warm in colour,
    // matching the original WebGPU effect instead of flattening all overlaps.
    gl.blendEquation(gl.FUNC_ADD); gl.blendFunc(gl.ONE, gl.ONE);
    gl.useProgram(this.trails.p); this.setView(this.trails);
    gl.uniform2f(this.trails.uniform('viewport'), width, height);
    gl.uniform1f(this.trails.uniform('radius'), particleSize * TRAIL_WIDTH_RATIO * this.dpr * Math.sqrt(this.zoom) / 2);
    gl.bindVertexArray(this.trailVAO); gl.bindBuffer(gl.ARRAY_BUFFER, this.trailBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.DYNAMIC_DRAW); gl.drawArraysInstanced(gl.TRIANGLES, 0, 6, data.length / 6);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.blendEquation(gl.FUNC_ADD); gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.useProgram(this.trailComposite.p); gl.bindVertexArray(this.emptyVAO);
    gl.uniform1i(this.trailComposite.uniform('trailMask'), 2);
    gl.uniform1i(this.trailComposite.uniform('warmOverlaps'), warmOverlaps ? 1 : 0);
    gl.uniform1i(this.trailComposite.uniform('outlined'), outlined ? 1 : 0);
    gl.uniform3fv(this.trailComposite.uniform('tint'), tint); gl.drawArrays(gl.TRIANGLES, 0, 3);
  }
  render(experiment, history, options, waveDirty = true) {
    const gl = this.gl;
    this.resize();
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    if (waveDirty && !experiment.is2D) this.uploadWave(experiment);
    gl.disable(gl.BLEND); gl.useProgram(this.wave.p); this.setView(this.wave);
    gl.bindVertexArray(this.emptyVAO);
    for (let i = 0; i < 2; i++) { gl.activeTexture(gl.TEXTURE0 + i); gl.bindTexture(gl.TEXTURE_2D, experiment.is2D ? experiment.waveTexture : this.textures[i]); }
    gl.uniform1i(this.wave.uniform('waveX'), 0); gl.uniform1i(this.wave.uniform('waveY'), 1);
    gl.activeTexture(gl.TEXTURE3); gl.bindTexture(gl.TEXTURE_2D, experiment.is2D ? experiment.waveTexture : this.textures[0]);
    gl.uniform1i(this.wave.uniform('field'), 3); gl.uniform1i(this.wave.uniform('fullWave'), experiment.is2D ? 1 : 0);
    gl.uniform2f(this.wave.uniform('waveGrid'), experiment.params.nx || 1, experiment.params.ny || 1);
    gl.uniform2f(this.wave.uniform('viewport'), this.canvas.width, this.canvas.height);
    gl.uniform3f(this.wave.uniform('obstacle'), (experiment.edge?.x || 0) / BOX.width, experiment.edge?.tip || 0, experiment.edge ? 1 : 0);
    gl.uniform1f(this.wave.uniform('peak'), experiment.is2D ? experiment.peak : experiment.xAxis.peak * experiment.yAxis.peak);
    gl.uniform1f(this.wave.uniform('brightness'), options.brightness);
    gl.uniform1f(this.wave.uniform('pixelScale'), this.dpr);
    gl.uniform1f(this.wave.uniform('outputPixelScale'), this.outputPixelScale || 1);
    gl.uniform1f(this.wave.uniform('phaseAmount'), options.showPhase ? Math.pow(1 - experiment.params.classicality, 0.7) : 0);
    gl.uniform1i(this.wave.uniform('visible'), options.showWave ? 1 : 0); gl.drawArrays(gl.TRIANGLES, 0, 3);
    gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    if (options.showVelocity) this.velocityField.draw(this, experiment);
    if (options.showParticles && options.showTrails) this.drawTrails(history.lines(experiment.time, options.trailSeconds), options.dotSize);
    if (options.showParticles) this.drawPoints(experiment.positions, PARTICLE_COLOR, options.dotSize);
    if (options.showReference) {
      // Draw the outlined reference last so yellow particles and trails cannot cover it.
      const data = [], initial = experiment.initialPositions, p = experiment.params;
      const referenceAt = t => experiment.classicalAt ? experiment.classicalAt(t) : [classicalPosition(initial[0], p.vx, t, BOX.width), classicalPosition(initial[1], p.vy, t, BOX.height)];
      const start = Math.max(0, experiment.time - options.trailSeconds);
      const referenceWidth = options.dotSize * TRAIL_WIDTH_RATIO * this.dpr * Math.sqrt(this.zoom);
      const pixelSpeed = Math.hypot(p.vx * this.canvas.width / BOX.width, p.vy * this.canvas.height / BOX.height) * this.zoom;
      const dashPeriod = Math.max(0.08, 4.5 * referenceWidth / pixelSpeed);
      for (let t = start; t < experiment.time; t += dashPeriod) {
        const end = Math.min(t + dashPeriod * 0.42, experiment.time);
        // Keep gaps open with the wider round caps; short pieces also follow
        // wall reflections within a dash rather than cutting across the turn.
        for (let piece = t; piece < end; piece += 0.025) {
          for (const q of [piece, Math.min(piece + 0.025, end)]) {
            data.push(...referenceAt(q), 0.65);
          }
        }
      }
      this.drawTrails(new Float32Array(data), options.dotSize, REFERENCE_COLOR, false, true);
      this.drawPoints(referenceAt(experiment.time), REFERENCE_COLOR, options.dotSize, true);
    }
    gl.bindVertexArray(null); gl.disable(gl.BLEND);
  }
  dispose() {
    this.velocityField.dispose();
    const gl = this.gl;
    for (const t of this.textures) gl.deleteTexture(t);
    gl.deleteTexture(this.trailMask); gl.deleteFramebuffer(this.trailFramebuffer);
    for (const p of [this.wave, this.lines, this.points, this.trails, this.trailComposite]) gl.deleteProgram(p.p);
    for (const b of [this.lineBuffer, this.pointBuffer, this.trailBuffer]) gl.deleteBuffer(b);
    for (const vao of [this.emptyVAO, this.lineVAO, this.pointVAO, this.trailVAO]) gl.deleteVertexArray(vao);
  }
}
