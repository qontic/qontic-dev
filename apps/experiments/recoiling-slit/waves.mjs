import {portProbability} from './physics.mjs';

// Analytic atom wave in momentum u=p/sigma_p. |a|^2 is a unit-variance Gaussian.
// tau=sigma_p^2 * t / (2 m hbar); free motion contributes exp(-i tau u^2).
export function atomWave(u,r,branch,tau=0) {
  const amplitude=Math.exp(-((u-branch*r/2)**2)/4)/Math.pow(2*Math.PI,.25);
  return {re:amplitude*Math.cos(tau*u*u),im:-amplitude*Math.sin(tau*u*u)};
}
export const norm2=z=>z.re*z.re+z.im*z.im;
export const rotate=(z,phase)=>({re:z.re*Math.cos(phase)-z.im*Math.sin(phase),im:z.re*Math.sin(phase)+z.im*Math.cos(phase)});
export function pathWaves(u,r,phase,tau=0) {
  const a=atomWave(u,r,-1,tau),b=rotate(atomWave(u,r,1,tau),phase);
  return [{re:a.re/Math.SQRT2,im:a.im/Math.SQRT2},{re:b.re/Math.SQRT2,im:b.im/Math.SQRT2}];
}
export function outputWaves(u,r,phase,tau=0) {
  const [a,b]=pathWaves(u,r,phase,tau);
  // A balanced, unitary recombiner, with fixed beam-splitter phases absorbed in phi.
  return [{re:(a.re+b.re)/Math.SQRT2,im:(a.im+b.im)/Math.SQRT2},{re:(a.re-b.re)/Math.SQRT2,im:(a.im-b.im)/Math.SQRT2}];
}
export function branchWave(u,r,phase,port,tau=0) {
  const p=port===1?portProbability(r,phase):1-portProbability(r,phase);
  if(p<1e-14)return null; // A zero-weight outcome has no normalized conditional wave.
  const z=outputWaves(u,r,phase,tau)[port===1?0:1];
  return {re:z.re/Math.sqrt(p),im:z.im/Math.sqrt(p)};
}
export function photonMode(s,center,phase=0,sigma=.055) {
  const amplitude=Math.exp(-((s-center)**2)/(4*sigma*sigma))/Math.pow(2*Math.PI*sigma*sigma,.25);
  return {re:amplitude*Math.cos(28*Math.PI*(s-center)+phase),im:amplitude*Math.sin(28*Math.PI*(s-center)+phase)};
}
export function stageOf(progress) {
  return progress<.18?0:progress<.65?1:progress<.91?2:3;
}
export function displayedPorts(view,detectedPort=null) {
  return view==='cpn'&&detectedPort!==null?[detectedPort]:[1,-1];
}
