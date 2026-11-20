import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {momentumSpread,recoilRatio,eta,visibility,portProbability,positionPortProbability,thermalPosition,sampleEvent,PAPER,positionSpreadNm} from '../physics.mjs';
const ref=JSON.parse(readFileSync(new URL('./reference.json',import.meta.url)));
let seed=20251201;const rng=()=>{seed=(1664525*seed+1013904223)>>>0;return (seed+.5)/4294967296;};
const integral=(fn,a=-30,b=30,n=60000)=>{const h=(b-a)/n;let s=0;for(let i=0;i<n;i++)s+=fn(a+(i+.5)*h)*h;return s;};

test('Trap-depth scaling reproduces the paper range 0.78–1.60 ħk',()=>{
  assert.ok(Math.abs(momentumSpread(PAPER.depthMax)-1.60)<1e-12);
  assert.ok(Math.abs(momentumSpread(PAPER.depthMin)-ref.dp_at_0p60_from_scaling)<1e-12);
  assert.ok(Math.abs(momentumSpread(PAPER.depthMin)-0.78)<0.005);
  assert.ok(Math.abs(ref['axial_kHz_dp1.6']-40)<2.5); // paper: axial ~40 kHz
});
test('Thermal visibility matches the Fock-state calculation in Python',()=>{
  for(const v of ref.visibility){assert.ok(Math.abs(visibility(recoilRatio(v.dp),v.nbar)-v.numeric)<1e-9,JSON.stringify(v));
    assert.ok(Math.abs(Math.exp(-2*eta(v.dp)**2*(2*v.nbar+1))-v.numeric)<1e-9);}
});
test('Position picture: averaging P(D₊|x) over the thermal position density gives P(D₊)',()=>{
  for(const r of [0.5,1.25,2.56,6])for(const nbar of [0,.2,.37])for(const phase of [0,1,2.5])
    assert.ok(Math.abs(integral(x=>thermalPosition(x,nbar)*positionPortProbability(x,r,phase))-portProbability(r,phase,nbar))<1e-9);
});
test('Sampler agrees with Python Monte Carlo (Fock route) and with the closed form',()=>{
  for(const c of ref.monte_carlo){const r=recoilRatio(c.dp),n=200000;let plus=0,xp=0,xm=0;
    for(let i=0;i<n;i++){const e=sampleEvent(r,c.phase,c.nbar,rng);if(e.port===1){plus++;xp+=e.x;}else xm+=e.x;}
    const p=plus/n,sig=Math.sqrt(p*(1-p)/n),sigPy=Math.sqrt(p*(1-p)/c.N);
    assert.ok(Math.abs(p-c.Pplus_closed)<5*sig,`P ${p} vs ${c.Pplus_closed}`);
    assert.ok(Math.abs(p-c.Pplus)<5*Math.hypot(sig,sigPy));
    const sx=Math.sqrt(1+2*c.nbar);
    assert.ok(Math.abs(xp/plus-c.meanX_plus)<6*sx*Math.hypot(1/Math.sqrt(plus),1/Math.sqrt(c.N*c.Pplus)),`x+ ${xp/plus} vs ${c.meanX_plus}`);
    assert.ok(Math.abs(xm/(n-plus)-c.meanX_minus)<6*sx*Math.hypot(1/Math.sqrt(n-plus),1/Math.sqrt(c.N*(1-c.Pplus))));
  }
});
test('Momentum readout: variance 1 + r²/4 + 2n̄ and phase-independent marginal',()=>{
  for(const [r,nbar] of [[1.25,0],[2.56,.37],[4,.2]]){const n=100000;let m2a=0,m2b=0;
    for(let i=0;i<n;i++){m2a+=sampleEvent(r,0,nbar,rng).u**2;m2b+=sampleEvent(r,2,nbar,rng).u**2;}
    const want=1+r*r/4+2*nbar;assert.ok(Math.abs(m2a/n-want)<0.04*want);assert.ok(Math.abs(m2b/n-want)<0.04*want);}
});
test('Position spread is tens of nanometres across the paper range',()=>{
  assert.ok(Math.abs(positionSpreadNm(1.60)-38.8)<0.2);assert.ok(Math.abs(positionSpreadNm(0.78)-79.6)<0.3);
});
