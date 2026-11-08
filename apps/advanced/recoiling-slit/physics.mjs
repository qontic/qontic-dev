// Ideal balanced two-path interferometer. Recoil PDFs have unit variance in u=p/sigma_p.
export const visibility = r => Math.exp(-r*r/8);
export const portProbability = (r, phase) => (1+visibility(r)*Math.cos(phase))/2;
export const gaussian = (u,mean=0) => Math.exp(-0.5*(u-mean)**2)/Math.sqrt(2*Math.PI);
export function recoilDensities(u,r) { return [gaussian(u,-r/2),gaussian(u,r/2)]; }
export function jointDensity(u,r,phase,port=1) {
  const [a,b]=recoilDensities(u,r);
  return Math.max(0,(a+b+port*2*Math.sqrt(a*b)*Math.cos(phase))/4);
}
// Posterior port probability given a momentum readout. Stable even in Gaussian tails.
export const conditionalPortProbability = (u,r,phase) => (1+Math.cos(phase)/Math.cosh(u*r/2))/2;
export function sampleEvent(r,phase,rng=Math.random) {
  const normal=Math.sqrt(-2*Math.log(Math.max(Number.MIN_VALUE,rng())))*Math.cos(2*Math.PI*rng());
  // This mixture samples the reduced atom state; the chosen mixture term is not a measured path.
  const u=normal+(rng()<0.5?-r/2:r/2);
  return {u,port:rng()<conditionalPortProbability(u,r,phase)?1:-1};
}
