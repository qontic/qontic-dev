import assert from 'node:assert/strict';
import {defaults,gaussian,transverse,positionX,advanceY,sample,prediction} from '../js/packet-model.js';
const p={...defaults};
for(const t of [0,3,8]){let norm=0,moment=0;for(let x=-100;x<100;x+=.01){const r=gaussian(x,t,1.2).rho;norm+=r*.01;moment+=x*x*r*.01;}assert(Math.abs(norm-1)<1e-8);assert(Math.abs(moment-(1.2**2+t*t/(4*1.2**2)))<1e-7);
let sum=0;for(let y=-100;y<100;y+=.01)sum+=transverse(y,t,p).rho*.01;assert(Math.abs(sum-1)<1e-7);}
for(const y of [-5,-1,.2,3]){const t=2,h=1e-5,a=transverse(y,t,p),left=transverse(y-h,t,p),right=transverse(y+h,t,p);assert(Math.abs(a.dr-(right.re-left.re)/(2*h))<1e-7);assert(Math.abs(a.di-(right.im-left.im)/(2*h))<1e-7);}
function integrate(dt){let y=1.2;for(let t=0;t<6-dt/2;t+=dt)y=advanceY(y,t,dt,p);return y;}
assert(Math.abs(integrate(.005)-integrate(.0025))<1e-5);
let seed=12345;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
const N=2500,counts=Array(p.bins).fill(0);for(let n=0;n<N;n++){const a=sample(p,random);let y=a.y,x=a.x;for(let t=0;t<p.duration;t+=.01){const ny=advanceY(y,t,.01,p),nx=positionX(a.x0,t+.01,p);if(nx>=p.screen&&x<p.screen){const hitY=y+(ny-y)*(p.screen-x)/(nx-x),i=Math.floor((hitY+14)/28*p.bins);if(i>=0&&i<p.bins)counts[i]++;break;}y=ny;x=nx;}}
const expected=prediction(p);let worst=0,cum=0;for(let i=0;i<p.bins;i++){cum+=counts[i]/N-expected[i];worst=Math.max(worst,Math.abs(cum));}assert(worst<.04,'Screen CDF disagreement '+worst);
console.log(JSON.stringify({normalization:'pass',spreading:'pass',gradients:'pass',trajectoryConvergence:'pass',screenCDFMaxError:worst,particles:N,detected:counts.reduce((a,b)=>a+b,0),predictedFraction:expected.reduce((a,b)=>a+b,0)}));
