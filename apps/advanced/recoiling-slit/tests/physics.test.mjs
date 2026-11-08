import test from 'node:test';
import assert from 'node:assert/strict';
import {visibility,portProbability,recoilDensities,jointDensity,conditionalPortProbability,sampleEvent} from '../physics.mjs';
const integral=fn=>{const step=.002;let sum=0;for(let u=-14+step/2;u<14;u+=step)sum+=fn(u)*step;return sum;};
test('Joint probabilities normalize and reproduce the analytic port fringe',()=>{for(const r of [0,.5,2.5,6,8])for(const phase of [0,Math.PI/2,Math.PI,5.2]){
  const plus=integral(u=>jointDensity(u,r,phase,1));const minus=integral(u=>jointDensity(u,r,phase,-1));assert.ok(Math.abs(plus+minus-1)<1e-9);assert.ok(Math.abs(plus-portProbability(r,phase))<1e-9);
}});
test('Gaussian overlap reproduces visibility and readout marginal is phase independent',()=>{for(const r of [0,1,3,8]){const overlap=integral(u=>{const [a,b]=recoilDensities(u,r);return Math.sqrt(a*b);});assert.ok(Math.abs(overlap-visibility(r))<1e-9);for(const u of [-7,-2,0,3,7]){const [a,b]=recoilDensities(u,r);assert.ok(Math.abs(jointDensity(u,r,1.2,1)+jointDensity(u,r,1.2,-1)-(a+b)/2)<1e-12);assert.ok(conditionalPortProbability(u,r,1.2)>=0&&conditionalPortProbability(u,r,1.2)<=1);}}});
test('Identical recoil states give deterministic constructive and destructive ports',()=>{assert.equal(visibility(0),1);assert.equal(portProbability(0,0),1);assert.equal(portProbability(0,Math.PI),0);assert.ok(visibility(8)<.001);});
test('Joint sampler matches the port probability and recoil variance',()=>{let seed=91823;const rng=()=>{seed=(1664525*seed+1013904223)>>>0;return (seed+.5)/4294967296;};for(const r of [0,2,6]){const n=80000,phase=.7;let count=0,m=0,m2=0;for(let i=0;i<n;i++){const e=sampleEvent(r,phase,rng);count+=e.port===1;m+=e.u;m2+=e.u*e.u;}const p=portProbability(r,phase);assert.ok(Math.abs(count/n-p)<6*Math.sqrt(p*(1-p)/n)+1e-4);assert.ok(Math.abs(m/n)<.05);assert.ok(Math.abs(m2/n-(1+r*r/4))<.12);}});
