// Shared spatial interpolation for particle guidance and the velocity overlay.
// Requires grid, edge, hasEdge, spacing and boundary() in the shader.
export const guidanceFieldGLSL = `
ivec2 anchor;
vec2 sampleAt(sampler2D wave,ivec2 p,vec2 origin){
  float signValue=1.0;
  if(p.x<0){p.x=-p.x;signValue=-signValue;}
  if(p.y<0){p.y=-p.y;signValue=-signValue;}
  if(p.x>grid.x){p.x=2*grid.x-p.x;signValue=-signValue;}
  if(p.y>grid.y){p.y=2*grid.y-p.y;signValue=-signValue;}
  if(hasEdge){
    if(p.x==edge.x&&origin.y>0.0&&p.y<edge.y){p.y=2*edge.y-p.y;signValue=-signValue;}
    if(p.y<=edge.y&&origin.y<=0.0&&((origin.x<0.0&&p.x>edge.x)||(origin.x>0.0&&p.x<edge.x))){p.x=2*edge.x-p.x;signValue=-signValue;}
  }
  if(boundary(p))return vec2(0);
  return signValue*texelFetch(wave,p,0).xy;
}
void weights(float t,out float w[8],out float derivative[8]){
  for(int i=0;i<8;i++){
    float a=1.0,b=0.0;
    for(int j=0;j<8;j++)if(j!=i){float factor=(t-float(j-3))/float(i-j);b=b*factor+a/float(i-j);a*=factor;}
    w[i]=a;derivative[i]=b;
  }
}
void oddPolynomial(vec2 one,vec2 two,float d,out vec2 value,out vec2 derivative){
  vec2 b=(two-2.0*one)/6.0,a=one-b;
  value=a+b*d*d;derivative=2.0*b*d;
}
vec2 dividedValue(sampler2D wave,ivec2 one,ivec2 direction,float d,vec2 origin){
  vec2 value,derivative;oddPolynomial(sampleAt(wave,one,origin),sampleAt(wave,one+direction,origin),d,value,derivative);return value;
}
void field(sampler2D wave,vec2 q,out vec2 psi,out vec2 gx,out vec2 gy){
  ivec2 offset=ivec2(floor(q)),base=anchor+offset;vec2 f=q-vec2(offset);
  float wx[8],wy[8],dwx[8],dwy[8];weights(f.x,wx,dwx);weights(f.y,wy,dwy);
  vec2 origin=vec2(anchor-edge)+q;
  int wallX=base.x<=1?0:base.x>=grid.x-2?grid.x:-10000;
  if(hasEdge&&origin.y<=0.0&&abs(origin.x)<1.0)wallX=edge.x;
  int wallY=base.y<=1?0:base.y>=grid.y-2?grid.y:-10000;
  float rx=float(anchor.x-wallX)+q.x,ry=float(anchor.y-wallY)+q.y;
  bool closeX=abs(rx)<0.5,closeY=abs(ry)<0.5;
  // At a Dirichlet wall psi=d*A. The real 1/d term in grad(log psi)
  // contributes no velocity. Factor it out analytically, avoiding cancellation
  // of tiny complex numbers. Odd cubic interpolation enforces psi''(wall)=0.
  if(closeX&&closeY){
    int sx=rx<0.0?-1:1,sy=ry<0.0?-1:1;
    vec2 a,b,ax,bx,dummy;
    oddPolynomial(sampleAt(wave,ivec2(wallX+sx,wallY+sy),origin),sampleAt(wave,ivec2(wallX+2*sx,wallY+sy),origin),abs(rx),a,ax);
    oddPolynomial(sampleAt(wave,ivec2(wallX+sx,wallY+2*sy),origin),sampleAt(wave,ivec2(wallX+2*sx,wallY+2*sy),origin),abs(rx),b,bx);
    oddPolynomial(a,b,abs(ry),psi,gy);oddPolynomial(ax,bx,abs(ry),gx,dummy);
    gx*=float(sx)/spacing;gy*=float(sy)/spacing;return;
  }
  if(closeX||closeY){
    bool normalX=closeX;float d=abs(normalX?rx:ry);int side=(normalX?rx:ry)<0.0?-1:1;
    ivec2 normal=normalX?ivec2(side,0):ivec2(0,side),tangent=normalX?ivec2(0,1):ivec2(1,0);
    vec2 normalGradient=vec2(0),tangentGradient=vec2(0);psi=vec2(0);
    for(int j=0;j<8;j++){
      ivec2 one=normalX?ivec2(wallX+side,base.y+j-3):ivec2(base.x+j-3,wallY+side);
      float w=normalX?wy[j]:wx[j];vec2 value,derivative;
      oddPolynomial(sampleAt(wave,one,origin),sampleAt(wave,one+normal,origin),d,value,derivative);
      psi+=w*value;normalGradient+=w*derivative*float(side)/spacing;
      tangentGradient+=(normalX?dwy[j]:dwx[j])*value/spacing;
    }
    gx=normalX?normalGradient:tangentGradient;gy=normalX?tangentGradient:normalGradient;return;
  }
  psi=vec2(0);gx=vec2(0);gy=vec2(0);
  for(int j=0;j<8;j++)for(int i=0;i<8;i++){
    ivec2 p=base+ivec2(i-3,j-3);vec2 value=sampleAt(wave,p,origin);
    psi+=wx[i]*wy[j]*value;gx+=dwx[i]*wy[j]*value;gy+=wx[i]*dwy[j]*value;
  }
  gx/=spacing;gy/=spacing;
}
`;
