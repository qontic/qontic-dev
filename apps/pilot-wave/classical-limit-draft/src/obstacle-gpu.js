import { guidanceFieldGLSL } from './guidance-field.js';
import { BOX } from './physics.js';
import { KNIFE_EDGE, PACKET_CENTER, obstacleParameters, initialParticles, besselJ, classicalObstaclePosition } from './obstacle-physics.js';

const vertex = `#version 300 es
void main(){vec2 p=vec2(float((gl_VertexID<<1)&2),float(gl_VertexID&2));gl_Position=vec4(p*2.0-1.0,0,1);}`;
const header = `#version 300 es
precision highp float;
precision highp int;
precision highp sampler2D;
uniform ivec2 grid;
uniform ivec2 edge;
uniform bool hasEdge;
bool boundary(ivec2 p){return p.x<=0||p.y<=0||p.x>=grid.x||p.y>=grid.y||(hasEdge&&p.x==edge.x&&p.y<=edge.y);}
vec2 multiply(vec2 a,vec2 b){return vec2(a.x*b.x-a.y*b.y,a.x*b.y+a.y*b.x);}
`;
const initializeFragment = header + `
uniform float spacing;
uniform float sigma;
uniform float normalization;
uniform vec2 packetCenter;
uniform vec2 momentum;
out vec2 value;
void main(){
  ivec2 p=ivec2(gl_FragCoord.xy);
  if(boundary(p)){value=vec2(0);return;}
  vec2 r=vec2(p)*spacing-packetCenter;
  float phase=dot(momentum,r), amplitude=normalization*exp(-dot(r,r)/(4.0*sigma*sigma));
  value=amplitude*vec2(cos(phase),sin(phase));
}`;

// H = alpha/(2 dx²) [f(Lx) + f(Ly)], f(L)=L+L²/12+L³/90+L⁴/560. L is the
// positive second-difference Dirichlet matrix on each connected row/column.
// This is Hermitian, eighth order away from the corner, and has no connection
// through the edge. Odd ghosts implement the matrix powers at boundaries.
const chebyshevFragment = header + `
uniform sampler2D currentTerm;
uniform sampler2D previousTerm;
uniform sampler2D accumulated;
uniform int order;
uniform vec2 coefficient;
uniform float firstCoefficient;
uniform bool finalTerm;
uniform vec2 rotation;
layout(location=0) out vec2 nextTerm;
layout(location=1) out vec2 sum;
vec2 neighbor(ivec2 p,ivec2 direction,int distance,vec2 center){
  for(int d=1;d<=4;d++){
    if(d>=distance)break;
    if(boundary(p+direction*d))return -texelFetch(currentTerm,p+direction*(2*d-distance),0).xy;
  }
  ivec2 q=p+direction*distance;
  return boundary(q)?vec2(0):texelFetch(currentTerm,q,0).xy;
}
void main(){
  ivec2 p=ivec2(gl_FragCoord.xy);
  if(boundary(p)){nextTerm=vec2(0);sum=vec2(0);return;}
  vec2 u=texelFetch(currentTerm,p,0).xy;
  vec2 nearSum=vec2(0),farSum=vec2(0),thirdSum=vec2(0),fourthSum=vec2(0);
  ivec2 directions[4]=ivec2[4](ivec2(1,0),ivec2(-1,0),ivec2(0,1),ivec2(0,-1));
  for(int d=0;d<4;d++){nearSum+=neighbor(p,directions[d],1,u);farSum+=neighbor(p,directions[d],2,u);thirdSum+=neighbor(p,directions[d],3,u);fourthSum+=neighbor(p,directions[d],4,u);}
  // The spectrum of A=(H-cI)/c lies in [-1,1], c=(2048/315)*alpha/(2 dx²).
  vec2 applied=((205.0/36.0-2048.0/315.0)*u-1.6*nearSum+0.2*farSum-8.0*thirdSum/315.0+fourthSum/560.0)*(315.0/2048.0);
  nextTerm=order==1?applied:2.0*applied-texelFetch(previousTerm,p,0).xy;
  sum=(order==1?firstCoefficient*u:texelFetch(accumulated,p,0).xy)+multiply(coefficient,nextTerm);
  if(finalTerm)sum=multiply(rotation,sum);
}`;

const particleFragment = header + `
uniform sampler2D oldWave;
uniform sampler2D newWave;
uniform sampler2D particles;
uniform float spacing;
uniform float alpha;
uniform float dt;
layout(location=0) out vec4 result;
layout(location=1) out vec4 information;
${guidanceFieldGLSL}
vec2 velocity(vec2 position,float timeFraction){
  vec2 a,ax,ay,b,bx,by;
  field(oldWave,position,a,ax,ay);field(newWave,position,b,bx,by);
  vec2 psi=mix(a,b,timeFraction),gx=mix(ax,bx,timeFraction),gy=mix(ay,by,timeFraction);
  float rho=dot(psi,psi);
  if(rho<1e-25)return vec2(1e20);
  return alpha*vec2(psi.x*gx.y-psi.y*gx.x,psi.x*gy.y-psi.y*gy.x)/rho;
}
bool crosses(vec2 a,vec2 b){
  if(any(lessThanEqual(b,-vec2(anchor)))||any(greaterThanEqual(b,vec2(grid-anchor))))return true;
  float wall=float(edge.x-anchor.x);
  if(hasEdge&&(a.x-wall)*(b.x-wall)<=0.0&&abs(b.x-a.x)>1e-15){
    float y=mix(a.y,b.y,(wall-a.x)/(b.x-a.x));
    if(y<=float(edge.y-anchor.y))return true;
  }
  return false;
}
void main(){
  vec4 state=texelFetch(particles,ivec2(int(gl_FragCoord.x),0),0);
  if(state.z<0.0){result=state;information=vec4(0,1,0,0);return;}
  // Store the integer grid anchor separately from the small local offset.
  // Near a Dirichlet wall the offset stays precise even far below a world-space
  // float's ulp. Mirrored interpolation weights likewise avoid 1-epsilon loss.
  anchor=ivec2(state.zw);vec2 p=state.xy;float t=0.0,h=dt;int attempts=0;
  for(int iteration=0;iteration<512;iteration++){
    if(t>=dt*(1.0-1e-6))break;
    attempts++;
    vec2 v0=velocity(p,t/dt);
    h=min(min(h,dt-t),0.22*spacing/max(length(v0),1e-12));
    vec2 midpoint=p+0.5*h*v0/spacing;
    if(crosses(p,midpoint)){h*=0.5;continue;}
    vec2 vm=velocity(midpoint,(t+0.5*h)/dt),next=p+h*vm/spacing;
    float error=length(h*(vm-v0));
    if(crosses(p,next)||error>0.025*spacing||any(isnan(next))||any(isinf(next))){h*=0.5;continue;}
    if(h<dt*1e-8)break;
    ivec2 shift=ivec2(round(next));anchor+=shift;p=next-vec2(shift);t+=h;h=min(dt,2.0*h);
  }
  // A failed step is reported, never repaired with a velocity cap or a bounce.
  ivec2 shift=ivec2(round(p));anchor+=shift;p-=vec2(shift);
  bool failed=t<dt*(1.0-1e-6);
  result=vec4(p,failed?-10000.0-float(anchor.x):float(anchor.x),float(anchor.y));
  information=vec4(float(attempts),failed?1.0:0.0,t/dt,h/dt);
}`;

const reduceFragment = header + `
uniform sampler2D source;
uniform bool first;
out vec4 value;
void main(){
  ivec2 base=ivec2(gl_FragCoord.xy)*2,size=textureSize(source,0);value=vec4(0);
  for(int j=0;j<2;j++)for(int i=0;i<2;i++){
    ivec2 q=base+ivec2(i,j);if(any(greaterThanEqual(q,size)))continue;
    vec4 v=texelFetch(source,q,0);
    if(first){float rho=dot(v.xy,v.xy);v=vec4(rho,rho,(q.x>edge.x&&q.y<edge.y)?rho:0.0,boundary(q)?rho:0.0);}
    value.x+=v.x;value.y=max(value.y,v.y);value.z+=v.z;value.w=max(value.w,v.w);
  }
}`;

function makeProgram(gl, fragment) {
  const p = gl.createProgram();
  for (const [type, source] of [[gl.VERTEX_SHADER, vertex], [gl.FRAGMENT_SHADER, fragment]]) {
    const shader = gl.createShader(type); gl.shaderSource(shader, source); gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader));
    gl.attachShader(p, shader); gl.deleteShader(shader);
  }
  gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
  const uniforms = new Map();
  return { p, u(name) { if (!uniforms.has(name)) uniforms.set(name, gl.getUniformLocation(p, name)); return uniforms.get(name); } };
}

export class ObstacleExperiment {
  constructor(gl, { classicality = 0.3, angle = 0, seed = 2, count = 1, refinement = 1, edge = true, stepScale = 1 } = {}) {
    this.gl = gl; this.seed = seed; this.count = count; this.is2D = true;
    this.params = obstacleParameters(classicality, angle, refinement);
    this.edge = edge ? KNIFE_EDGE : null;
    this.resources = []; this.programs = []; this.time = 0; this.steps = 0; this.maxNormError = 0; this.maxParticleSubsteps = 0;
    this.guidanceStepScale = 1; this.guidanceRetries = 0;
    this.positions = initialParticles(this.params, seed, count); this.initialPositions = this.positions.slice();
    const { nx, ny, dx, alpha } = this.params;
    this.width = nx + 1; this.height = ny + 1;
    this.radius = 1024 * alpha / (315 * dx * dx); this.maxDt = stepScale * Math.min(8 / this.radius, 0.12 * this.params.sigma / this.params.speed);
    if (!gl.getExtension('EXT_color_buffer_float')) throw new Error('The obstacle needs floating-point WebGL2 rendering. Please enable hardware acceleration.');
    if (Math.max(this.width, this.height) > gl.getParameter(gl.MAX_TEXTURE_SIZE)) throw new Error('This GPU cannot resolve the obstacle at this slider setting.');
    this.vao = gl.createVertexArray(); this.framebuffer = gl.createFramebuffer(); this.copyFramebuffer = gl.createFramebuffer();
    try {
      this.initializeProgram = this.program(initializeFragment); this.stepProgram = this.program(chebyshevFragment);
      this.particleProgram = this.program(particleFragment); this.reduceProgram = this.program(reduceFragment);
      this.waves = [this.texture(this.width, this.height), this.texture(this.width, this.height)];
      this.checkpointWave = this.texture(this.width, this.height);
      this.terms = Array.from({ length: 3 }, () => this.texture(this.width, this.height));
      this.sums = [this.texture(this.width, this.height), this.texture(this.width, this.height)];
      this.particleTextures = [this.texture(count, 1, true), this.texture(count, 1, true)];
      this.checkpointParticles = this.texture(count, 1, true);
      this.particleInformation = this.texture(count, 1, true);
      this.particleReadback = new Float32Array(count * 4); this.informationReadback = new Float32Array(count * 4); this.measurement = new Float32Array(4);
      this.reductions = [];
      let w = this.width, h = this.height;
      do { w = Math.ceil(w / 2); h = Math.ceil(h / 2); this.reductions.push({ texture: this.texture(w, h, true), w, h }); } while (w > 1 || h > 1);
      this.initialize();
    } catch (error) { this.dispose(); throw error; }
  }
  program(source) { const p = makeProgram(this.gl, source); this.programs.push(p); return p; }
  texture(w, h, rgba = false) {
    const gl = this.gl, texture = gl.createTexture(); this.resources.push(texture);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texStorage2D(gl.TEXTURE_2D, 1, rgba ? gl.RGBA32F : gl.RG32F, w, h);
    return texture;
  }
  use(p) {
    const gl = this.gl; gl.useProgram(p.p); gl.bindVertexArray(this.vao); gl.disable(gl.BLEND);
    gl.uniform2i(p.u('grid'), this.params.nx, this.params.ny);
    gl.uniform2i(p.u('edge'), Math.round(KNIFE_EDGE.x / this.params.dx), Math.round(KNIFE_EDGE.tip / this.params.dx));
    gl.uniform1i(p.u('hasEdge'), this.edge ? 1 : 0);
  }
  bind(p, name, texture, unit) { const gl = this.gl; gl.activeTexture(gl.TEXTURE0 + unit); gl.bindTexture(gl.TEXTURE_2D, texture); gl.uniform1i(p.u(name), unit); }
  target(a, b = null, w = this.width, h = this.height) {
    const gl = this.gl; gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, a, 0);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT1, gl.TEXTURE_2D, b, 0);
    gl.drawBuffers(b ? [gl.COLOR_ATTACHMENT0, gl.COLOR_ATTACHMENT1] : [gl.COLOR_ATTACHMENT0]);
    gl.readBuffer(gl.COLOR_ATTACHMENT0);
    gl.viewport(0, 0, w, h);
  }
  initialize() {
    const gl = this.gl, p = this.initializeProgram, { nx, ny, dx, sigma, kx, ky } = this.params;
    let sumX = 0, sumY = 0, blockedY = 0;
    for (let x = 1; x < nx; x++) sumX += Math.exp(-((x * dx - PACKET_CENTER[0]) ** 2) / (2 * sigma * sigma));
    for (let y = 1; y < ny; y++) { const rho = Math.exp(-((y * dx - PACKET_CENTER[1]) ** 2) / (2 * sigma * sigma)); sumY += rho; if (y * dx <= KNIFE_EDGE.tip) blockedY += rho; }
    const wallDensity = Math.exp(-((KNIFE_EDGE.x - PACKET_CENTER[0]) ** 2) / (2 * sigma * sigma));
    const norm = (sumX * sumY - (this.edge ? wallDensity * blockedY : 0)) * dx * dx;
    this.use(p); gl.uniform1f(p.u('spacing'), dx); gl.uniform1f(p.u('sigma'), sigma);
    gl.uniform1f(p.u('normalization'), 1 / Math.sqrt(norm));
    gl.uniform2fv(p.u('packetCenter'), PACKET_CENTER); gl.uniform2f(p.u('momentum'), kx, ky);
    this.target(this.waves[0]);
    if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) throw new Error('Could not allocate the 2D wave surface.');
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    for (let i = 0; i < this.count; i++) for (let axis = 0; axis < 2; axis++) {
      const q = this.positions[2 * i + axis] / dx, anchor = Math.round(q);
      this.particleReadback[4 * i + axis] = q - anchor; this.particleReadback[4 * i + axis + 2] = anchor;
    }
    gl.bindTexture(gl.TEXTURE_2D, this.particleTextures[0]); gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, this.count, 1, gl.RGBA, gl.FLOAT, this.particleReadback);
    this.waveIndex = 0; this.particleIndex = 0; this.refresh();
  }
  get waveTexture() { return this.waves[this.waveIndex]; }
  copy(source, destination, width, height) {
    const gl = this.gl; this.target(source, null, width, height);
    gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, this.copyFramebuffer);
    gl.framebufferTexture2D(gl.DRAW_FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, destination, 0);
    gl.drawBuffers([gl.COLOR_ATTACHMENT0]);
    gl.blitFramebuffer(0, 0, width, height, 0, 0, width, height, gl.COLOR_BUFFER_BIT, gl.NEAREST);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }
  step(dt) {
    const gl = this.gl, p = this.stepProgram, oldWave = this.waveTexture, nextWave = this.waves[1 - this.waveIndex];
    const z = this.radius * dt;
    this.use(p); gl.uniform1f(p.u('firstCoefficient'), besselJ(0, z));
    const phase = -(this.radius - this.params.energy) * dt;
    gl.uniform2f(p.u('rotation'), Math.cos(phase), Math.sin(phase));
    let current = oldWave, previous = oldWave, accumulated = oldWave;
    let degree = 8;
    while (degree < 24 && Math.abs(2 * besselJ(degree + 1, z)) > 1e-10) degree++;
    for (let n = 1; n <= degree; n++) {
      const term = this.terms[(n - 1) % 3], sum = n === degree ? nextWave : this.sums[(n - 1) % 2];
      this.bind(p, 'currentTerm', current, 0); this.bind(p, 'previousTerm', previous, 1); this.bind(p, 'accumulated', accumulated, 2);
      const coefficient = 2 * besselJ(n, z), phaseIndex = n % 4;
      gl.uniform2f(p.u('coefficient'), phaseIndex === 0 ? coefficient : phaseIndex === 2 ? -coefficient : 0, phaseIndex === 1 ? -coefficient : phaseIndex === 3 ? coefficient : 0);
      gl.uniform1i(p.u('order'), n); gl.uniform1i(p.u('finalTerm'), n === degree ? 1 : 0);
      this.target(term, sum); gl.drawArrays(gl.TRIANGLES, 0, 3);
      previous = current; current = term; accumulated = sum;
    }
    const q = this.particleProgram; this.use(q);
    this.bind(q, 'oldWave', oldWave, 0); this.bind(q, 'newWave', nextWave, 1); this.bind(q, 'particles', this.particleTextures[this.particleIndex], 2);
    gl.uniform1f(q.u('spacing'), this.params.dx); gl.uniform1f(q.u('alpha'), this.params.alpha); gl.uniform1f(q.u('dt'), dt);
    this.target(this.particleTextures[1 - this.particleIndex], this.particleInformation, this.count, 1); gl.drawArrays(gl.TRIANGLES, 0, 3);
    this.waveIndex = 1 - this.waveIndex; this.particleIndex = 1 - this.particleIndex; this.steps++;
  }
  evaluate(time) {
    if (!Number.isFinite(time) || time < this.time - 1e-10) throw new Error('The 2D wave evolves forward. Restart before seeking backward.');
    const duration = Math.max(0, time - this.time), previousSteps = this.steps;
    if (!duration) return this.positions;
    this.copy(this.waveTexture, this.checkpointWave, this.width, this.height);
    this.copy(this.particleTextures[this.particleIndex], this.checkpointParticles, this.count, 1);
    for (let retry = 0; retry <= 8; retry++) {
      const steps = Math.ceil(duration / (this.maxDt * this.guidanceStepScale));
      this.guidanceFailure = undefined;
      for (let i = 0; i < steps; i++) this.step(duration / steps);
      this.time = time;
      try {
        this.refresh();
        this.guidanceStepScale = Math.min(1, this.guidanceStepScale * 1.02);
        return this.positions;
      } catch (error) {
        if (!this.guidanceFailure || retry === 8) throw error;
        // A difficult node triggers a replay of the complete interval. Restore
        // both wave and particles exactly, then reduce the wave timestep too.
        this.copy(this.checkpointWave, this.waveTexture, this.width, this.height);
        this.copy(this.checkpointParticles, this.particleTextures[this.particleIndex], this.count, 1);
        this.guidanceStepScale *= 0.5; this.guidanceRetries++; this.steps = previousSteps;
      }
    }
    return this.positions;
  }
  refresh() {
    const gl = this.gl, p = this.reduceProgram; this.use(p);
    let source = this.waveTexture;
    for (let i = 0; i < this.reductions.length; i++) {
      const level = this.reductions[i]; this.bind(p, 'source', source, 0); gl.uniform1i(p.u('first'), i === 0 ? 1 : 0);
      this.target(level.texture, null, level.w, level.h); gl.drawArrays(gl.TRIANGLES, 0, 3); source = level.texture;
    }
    gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.FLOAT, this.measurement);
    this.norm = this.measurement[0] * this.params.dx ** 2; this.peak = this.measurement[1];
    this.shadowProbability = this.measurement[2] * this.params.dx ** 2; this.boundaryDensity = this.measurement[3];
    this.maxNormError = Math.max(this.maxNormError, Math.abs(this.norm - 1));
    this.target(this.particleTextures[this.particleIndex], this.particleInformation, this.count, 1);
    gl.readPixels(0, 0, this.count, 1, gl.RGBA, gl.FLOAT, this.particleReadback);
    gl.readBuffer(gl.COLOR_ATTACHMENT1); gl.readPixels(0, 0, this.count, 1, gl.RGBA, gl.FLOAT, this.informationReadback); gl.readBuffer(gl.COLOR_ATTACHMENT0);
    for (let i = 0; i < this.count; i++) {
      const baseX = this.particleReadback[4 * i + 2], failed = baseX < 0;
      const x = (this.particleReadback[4 * i] + (failed ? -baseX - 10000 : baseX)) * this.params.dx;
      const y = (this.particleReadback[4 * i + 1] + this.particleReadback[4 * i + 3]) * this.params.dx;
      if (!Number.isFinite(x + y) || failed) {
        this.guidanceFailure = { index: i, x, y, attempts: this.informationReadback[4 * i], time: this.time, steps: this.steps,
          completion: this.informationReadback[4 * i + 2], fraction: this.informationReadback[4 * i + 3], scale: this.guidanceStepScale };
        throw new Error('A particle needs finer guidance steps. Restart the experiment to continue.');
      }
      this.positions[2 * i] = x; this.positions[2 * i + 1] = y;
      this.maxParticleSubsteps = Math.max(this.maxParticleSubsteps, this.informationReadback[4 * i]);
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER, null); gl.bindVertexArray(null);
    if (!Number.isFinite(this.norm) || this.maxNormError > 0.01) throw new Error('The 2D wave failed its probability-conservation check.');
  }
  classicalAt(time) { return classicalObstaclePosition(this.initialPositions.subarray(0, 2), [this.params.vx, this.params.vy], time, this.edge); }
  diagnostics() {
    return { time: this.time, norm: this.norm, normError: Math.abs(this.norm - 1), maxNormError: this.maxNormError,
      intervals: this.params.nx, grid: [this.width, this.height], params: this.params, count: this.count,
      positions: [...this.positions], initialPositions: [...this.initialPositions], finite: [...this.positions].every(Number.isFinite),
      shadowProbability: this.shadowProbability, boundaryDensity: this.boundaryDensity, steps: this.steps,
      maxDt: this.maxDt, maxParticleSubsteps: this.maxParticleSubsteps, obstacle: Boolean(this.edge), guidanceFailure: this.guidanceFailure,
      guidanceRetries: this.guidanceRetries, guidanceStepScale: this.guidanceStepScale };
  }
  readWave() {
    const gl = this.gl, data = new Float32Array(this.width * this.height * 4);
    this.target(this.waveTexture); gl.readPixels(0, 0, this.width, this.height, gl.RGBA, gl.FLOAT, data);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null); return data;
  }
  dispose() {
    if (this.contextLost) return;
    const gl = this.gl;
    for (const texture of this.resources) gl.deleteTexture(texture);
    for (const p of this.programs) gl.deleteProgram(p.p);
    gl.deleteFramebuffer(this.framebuffer); gl.deleteFramebuffer(this.copyFramebuffer); gl.deleteVertexArray(this.vao);
  }
}
