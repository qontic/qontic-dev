import assert from 'node:assert/strict';
import {flowSlope,traceFlow} from '../js/flow-overlay.js';
import {sourceTransverse,sourceCoefficients} from '../js/source-packet-model.js';
const p={sx:.5,sy:.3,sourceSigma:2,wall:2.25,screen:12.25,k:2*Math.PI,centers:[-1.5,1.5]};
for(const centers of [[-1.5,1.5],[-1.5],[1.5]]){
 const q={...p,centers},coeff=sourceCoefficients(q);
 for(const [x,y] of [[1,.4],[3,.6],[7,1.2]]){
  const g=sourceTransverse(y,x,q,coeff),h=1e-5,a=sourceTransverse(y-h,x,q,coeff),b=sourceTransverse(y+h,x,q,coeff);
  const phaseDifference=Math.atan2(b.im*a.re-b.re*a.im,b.re*a.re+b.im*a.im);
  assert(Math.abs(flowSlope(x,y,q,coeff)-phaseDifference/(2*h*q.k))<1e-7,'slope agrees with independent phase derivative');
 }
 for(const seed of centers){
  const coarse=traceFlow(seed,q,coeff,180),fine=traceFlow(seed,q,coeff,720);
  assert(coarse.every(point=>point.every(Number.isFinite)));
  assert(Math.abs(coarse.at(-1)[0]-q.screen)<1e-6);
  assert(Math.abs(coarse.at(-1)[1]-fine.at(-1)[1])<1e-5,'streamline converges with step refinement');
 }
}
console.log('Flow field and streamline convergence checks passed.');
