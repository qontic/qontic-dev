// Dimensionless units: hbar = mass = 1. Exact free Gaussian propagation.
export const defaults={sx:1.2,sy:0.8,separation:6,k:4,screen:24,bins:40,particles:300,slits:2,duration:12};
export function gaussian(q,t,s,center=0,k=0){
 const b=t/(2*s*s),u=q-center-k*t,D=1+b*b;
 const amplitude=Math.exp(-u*u/(4*s*s*D))/Math.pow(2*Math.PI*s*s*D,.25);
 const phase=k*(q-center)-k*k*t/2+u*u*b/(4*s*s*D)-Math.atan(b)/2;
 const re=amplitude*Math.cos(phase),im=amplitude*Math.sin(phase);
 const lr=-u/(2*s*s*D),li=u*b/(2*s*s*D)+k;
 return {re,im,dr:lr*re-li*im,di:lr*im+li*re,rho:amplitude*amplitude};
}
export function transverse(y,t,p){
 const a=gaussian(y,t,p.sy,p.slits===1?0:-p.separation/2);
 if(p.slits===1)return {...a,v:(a.re*a.di-a.im*a.dr)/Math.max(a.rho,1e-300)};
 const b=gaussian(y,t,p.sy,p.separation/2),norm=Math.sqrt(2*(1+Math.exp(-(p.separation**2)/(8*p.sy*p.sy))));
 const re=(a.re+b.re)/norm,im=(a.im+b.im)/norm,dr=(a.dr+b.dr)/norm,di=(a.di+b.di)/norm,rho=re*re+im*im;
 return {re,im,dr,di,rho,v:rho>1e-24?(re*di-im*dr)/rho:0};
}
export function longitudinal(x,t,p){const g=gaussian(x,t,p.sx,0,p.k);return {...g,v:p.k+(x-p.k*t)*t/(4*p.sx**4+t*t)};}
export function positionX(x0,t,p){return p.k*t+x0*Math.sqrt(1+(t/(2*p.sx*p.sx))**2);}
export function advanceY(y,t,dt,p){
 const v=(q,s)=>transverse(q,s,p).v;
 const a=v(y,t),b=v(y+dt*a/2,t+dt/2),c=v(y+dt*b/2,t+dt/2),d=v(y+dt*c,t+dt);
 return y+dt*(a+2*b+2*c+d)/6;
}
function normal(random){return Math.sqrt(-2*Math.log(Math.max(1e-15,random())))*Math.cos(2*Math.PI*random());}
export function sample(p,random=Math.random){
 const x0=p.sx*normal(random);let y;
 if(p.slits===1)y=p.sy*normal(random);
 else for(;;){
  y=(random()<.5?-1:1)*p.separation/2+p.sy*normal(random);
  const mixture=(gaussian(y,0,p.sy,-p.separation/2).rho+gaussian(y,0,p.sy,p.separation/2).rho)/2;
  if(random()*2*mixture<=transverse(y,0,p).rho)break;
 }
 return {x0,x:x0,y,done:false,path:[]};
}
export function prediction(p,ymin=-14,ymax=14,dt=.01){
 const bins=Array(p.bins).fill(0),dy=(ymax-ymin)/p.bins;
 for(let t=dt/2;t<p.duration;t+=dt){const g=longitudinal(p.screen,t,p),flux=g.rho*g.v;
  for(let i=0;i<p.bins;i++){
   // Composite midpoint quadrature across each detector pixel.
   for(let j=0;j<4;j++)bins[i]+=flux*transverse(ymin+(i+(j+.5)/4)*dy,t,p).rho*dt*dy/4;
  }
 }
 return bins;
}
