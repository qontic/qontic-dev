import { BOX, LAUNCH_SPEED, clamp } from './physics.js';
import { guidanceFieldGLSL } from './guidance-field.js';

const fullscreen = `#version 300 es
void main(){vec2 p=vec2(float((gl_VertexID<<1)&2),float(gl_VertexID&2));gl_Position=vec4(p*2.0-1.0,0,1);}`;

// Sample once per arrow on a small floating-point surface, never by reading the
// wave back to the CPU. The 2D path shares the particle solver's interpolation.
const sampleFragment = `#version 300 es
precision highp float;
precision highp int;
precision highp sampler2D;
uniform sampler2D waveX;
uniform sampler2D waveY;
uniform sampler2D wave2D;
uniform bool fullWave;
uniform ivec2 grid;
uniform ivec2 edge;
uniform bool hasEdge;
uniform float spacing;
uniform float alpha;
uniform float peak;
uniform vec2 counts;
uniform vec2 center;
uniform float zoom;
out vec4 value;
bool boundary(ivec2 p){return p.x<=0||p.y<=0||p.x>=grid.x||p.y>=grid.y||(hasEdge&&p.x==edge.x&&p.y<=edge.y);}
${guidanceFieldGLSL}
vec2 axisNode(sampler2D wave,int index,int n){
  float signValue=1.0;
  if(index<0){index=-index;signValue=-signValue;}
  if(index>n){index=2*n-index;signValue=-signValue;}
  if(index==0||index==n)return vec2(0);
  int width=textureSize(wave,0).x;
  return signValue*texelFetch(wave,ivec2(index%width,index/width),0).xy;
}
void axisField(sampler2D wave,float u,float length,out vec2 psi,out vec2 derivative){
  ivec2 size=textureSize(wave,0);int n=size.x*size.y;
  float q=u*float(n),w[8],dw[8];int base=int(floor(q));
  weights(fract(q),w,dw);psi=vec2(0);derivative=vec2(0);
  for(int i=0;i<8;i++){
    vec2 z=axisNode(wave,base+i-3,n);psi+=w[i]*z;derivative+=dw[i]*z;
  }
  derivative*=float(n)/length;
}
float current(vec2 psi,vec2 derivative){return psi.x*derivative.y-psi.y*derivative.x;}
void main(){
  value=vec4(0);
  vec2 world=center+(gl_FragCoord.xy/counts-0.5)/zoom;
  if(any(lessThanEqual(world,vec2(0)))||any(greaterThanEqual(world,vec2(1))))return;
  vec2 v;float rho;
  if(fullWave){
    vec2 position=world*vec2(grid),fromEdge=position-vec2(edge);
    // At walls the shared interpolant factors out a vanishing real amplitude.
    // Omit this subcell strip rather than mistake its factored value for density.
    if(min(min(position.x,float(grid.x)-position.x),min(position.y,float(grid.y)-position.y))<0.6)return;
    if(hasEdge&&fromEdge.y<=0.0&&abs(fromEdge.x)<0.6)return;
    anchor=ivec2(floor(position));vec2 psi,gx,gy;
    field(wave2D,position-vec2(anchor),psi,gx,gy);rho=dot(psi,psi);
    if(rho<1e-25)return;
    v=alpha*vec2(current(psi,gx),current(psi,gy))/rho;
  }else{
    vec2 x,dx,y,dy;axisField(waveX,world.x,1.6,x,dx);axisField(waveY,world.y,1.0,y,dy);
    float rx=dot(x,x),ry=dot(y,y);rho=rx*ry;
    if(min(rx,ry)<1e-25||rho<1e-25)return;
    v=alpha*vec2(current(x,dx)/rx,current(y,dy)/ry);
  }
  if(any(isnan(v))||any(isinf(v))||isnan(rho)||isinf(rho))return;
  value=vec4(v,rho/max(peak,1e-20),1);
}`;

const arrowVertex = `#version 300 es
precision highp float;
precision highp sampler2D;
uniform sampler2D samples;
uniform ivec2 counts;
uniform vec2 viewport;
uniform float pixelScale;
uniform float speedScale;
out vec2 local;
flat out vec4 shape;
flat out vec2 origin;
void main(){
  ivec2 cell=ivec2(gl_InstanceID%counts.x,gl_InstanceID/counts.x);
  vec4 flow=texelFetch(samples,cell,0);
  float speed=length(flow.xy),ratio=speed/speedScale;
  float strength=1.0-exp(-0.8*ratio);
  float visibility=smoothstep(0.000001,0.0002,flow.z)*flow.w*smoothstep(0.0,0.08,ratio);
  float step=min(viewport.x/float(counts.x),viewport.y/float(counts.y));
  float arrowLength=step*mix(0.14,0.88,strength);
  float thickness=pixelScale*mix(0.65,3.05,strength);
  float head=min(arrowLength*0.48,max(3.0*thickness,arrowLength*0.32));
  shape=vec4(arrowLength,thickness,head,visibility*mix(0.15,0.9,strength));
  vec2 corners[6]=vec2[6](vec2(-1,-1),vec2(1,-1),vec2(-1,1),vec2(-1,1),vec2(1,-1),vec2(1,1));
  local=corners[gl_VertexID]*vec2(arrowLength*0.5+3.0*pixelScale,head*0.52+3.0*pixelScale);
  vec2 direction=flow.xy*viewport/vec2(1.6,1.0);
  direction=length(direction)>1e-12?normalize(direction):vec2(1,0);
  origin=(vec2(cell)+0.5)/vec2(counts);
  vec2 point=origin*viewport+direction*local.x+vec2(-direction.y,direction.x)*local.y;
  gl_Position=vec4(point/viewport*2.0-1.0,0,1);
}`;

const arrowFragment = `#version 300 es
precision highp float;
uniform vec2 viewport;
uniform vec2 center;
uniform float zoom;
uniform float pixelScale;
uniform float outputPixelScale;
uniform vec3 obstacle;
in vec2 local;
flat in vec4 shape;
flat in vec2 origin;
out vec4 color;
void main(){
  if(shape.w<0.002)discard;
  vec2 world=center+(gl_FragCoord.xy/viewport-0.5)/zoom;
  if(any(lessThanEqual(world,vec2(0)))||any(greaterThanEqual(world,vec2(1))))discard;
  if(obstacle.z>0.5){
    vec2 source=center+(origin-0.5)/zoom;
    if(source.y<=obstacle.y&&world.y<=obstacle.y&&(source.x-obstacle.x)*(world.x-obstacle.x)<0.0)discard;
    if(world.y<=obstacle.y&&abs(world.x-obstacle.x)*viewport.x*zoom<2.2*pixelScale)discard;
  }
  float arrowLength=shape.x,thickness=shape.y,head=shape.z;
  float tip=0.5*arrowLength,base=tip-head,halfHead=head*0.52;
  float x=clamp(local.x,-tip,tip-head*0.55);
  float taper=mix(0.3,0.5,smoothstep(-tip,base,local.x));
  float shaft=length(local-vec2(x,0))-thickness*taper;
  float wedge=(abs(local.y)*head+halfHead*(local.x-tip))/sqrt(head*head+halfHead*halfHead);
  float d=min(shaft,max(base-local.x,wedge));
  float aa=max(fwidth(d)*0.65,0.55*outputPixelScale);
  float core=1.0-smoothstep(-aa,aa,d);
  float rim=1.0-smoothstep(0.4*pixelScale,1.5*pixelScale,d);
  float glow=0.12*exp(-pow(max(d,0.0)/(1.8*pixelScale),2.0));
  vec3 mint=mix(vec3(0.32,0.9,0.72),vec3(0.86,1.0,0.96),smoothstep(-tip,tip,local.x));
  vec3 tint=mix(vec3(0.015,0.055,0.07),mint,core);
  color=vec4(tint,shape.w*min(1.0,core+0.65*rim+glow));
}`;

export class VelocityField {
  constructor(gl, program) {
    this.gl = gl;
    this.sampler = program(gl, fullscreen, sampleFragment);
    this.arrows = program(gl, arrowVertex, arrowFragment);
    this.texture = gl.createTexture(); this.framebuffer = gl.createFramebuffer(); this.vao = gl.createVertexArray();
    this.columns = 0; this.rows = 0;
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  }

  draw(renderer, experiment) {
    const gl = this.gl, { width, height } = renderer.canvas, p = experiment.params;
    const columns = clamp(Math.round(width / renderer.dpr / 30), 12, 80);
    const rows = Math.max(8, Math.round(columns * height / width));
    gl.bindVertexArray(this.vao);
    gl.activeTexture(gl.TEXTURE4); gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
    if (columns !== this.columns || rows !== this.rows) {
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, columns, rows, 0, gl.RGBA, gl.FLOAT, null);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.texture, 0);
      if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) throw new Error('Could not create the velocity field surface.');
      this.columns = columns; this.rows = rows;
    }
    gl.viewport(0, 0, columns, rows); gl.disable(gl.BLEND);
    gl.useProgram(this.sampler.p); renderer.setView(this.sampler);
    gl.uniform1i(this.sampler.uniform('waveX'), 0); gl.uniform1i(this.sampler.uniform('waveY'), 1);
    gl.uniform1i(this.sampler.uniform('wave2D'), 3); gl.uniform1i(this.sampler.uniform('fullWave'), experiment.is2D ? 1 : 0);
    gl.uniform2i(this.sampler.uniform('grid'), p.nx || 1, p.ny || 1);
    gl.uniform2i(this.sampler.uniform('edge'), Math.round((experiment.edge?.x || 0) / (p.dx || 1)), Math.round((experiment.edge?.tip || 0) / (p.dx || 1)));
    gl.uniform1i(this.sampler.uniform('hasEdge'), experiment.edge ? 1 : 0);
    gl.uniform1f(this.sampler.uniform('spacing'), p.dx || 1);
    gl.uniform1f(this.sampler.uniform('alpha'), p.alpha);
    gl.uniform1f(this.sampler.uniform('peak'), experiment.is2D ? experiment.peak : experiment.xAxis.peak * experiment.yAxis.peak);
    gl.uniform2f(this.sampler.uniform('counts'), columns, rows);
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    gl.bindFramebuffer(gl.FRAMEBUFFER, null); gl.viewport(0, 0, width, height);
    gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.useProgram(this.arrows.p); renderer.setView(this.arrows);
    gl.uniform1i(this.arrows.uniform('samples'), 4);
    gl.uniform2i(this.arrows.uniform('counts'), columns, rows);
    gl.uniform2f(this.arrows.uniform('viewport'), width, height);
    gl.uniform1f(this.arrows.uniform('pixelScale'), renderer.dpr);
    gl.uniform1f(this.arrows.uniform('outputPixelScale'), renderer.outputPixelScale || 1);
    gl.uniform1f(this.arrows.uniform('speedScale'), LAUNCH_SPEED);
    gl.uniform3f(this.arrows.uniform('obstacle'), (experiment.edge?.x || 0) / BOX.width, experiment.edge?.tip || 0, experiment.edge ? 1 : 0);
    gl.drawArraysInstanced(gl.TRIANGLES, 0, 6, columns * rows);
  }

  dispose() {
    const gl = this.gl;
    gl.deleteTexture(this.texture); gl.deleteFramebuffer(this.framebuffer); gl.deleteVertexArray(this.vao);
    gl.deleteProgram(this.sampler.p); gl.deleteProgram(this.arrows.p);
  }
}
