const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'js/double-slit.js'), 'utf8');
const ctx = vm.createContext({console, Float64Array, Math, performance, setTimeout, clearTimeout, document:{}, $:()=>({ready(){}})});
vm.runInContext(source, ctx);
vm.runInContext(`k=2*Math.PI/100; omega=1; wallXWorld=0; sourceXWorld=-500; sourceYWorld=600;
slit1XWorld=0; slit2XWorld=0; slit1YWorld=350; slit2YWorld=850; worldCanvasDy=1200;
detectorXWorld=1000; particleType='electron'; slit1Open=true; slit2Open=true; whichPathDetector='none';
detectorArrayFull=precomputeYArrayWithFixedX(1000,0,4000);
singleSlitArray1=precomputeSingleSlitArray(1000,1,2000);
singleSlitArray2=precomputeSingleSlitArray(1000,2,2000);`,ctx);
assert.equal(vm.runInContext('getDetectionDistribution() === detectorArrayFull',ctx),true);
assert.equal(vm.runInContext('slit2Open=false; getDetectionDistribution() === singleSlitArray1',ctx),true);
assert.equal(vm.runInContext("whichPathDetector='slit1'; getDetectionDistribution() === singleSlitArray1",ctx),true);
assert.equal(vm.runInContext('slit2Open=true; slit1Open=false; getDetectionDistribution() === singleSlitArray2',ctx),true);
assert.equal(vm.runInContext('slit2Open=false; getDetectionDistribution()',ctx),null);
vm.runInContext("slit1Open=true; slit2Open=true; whichPathDetector='none';",ctx);
// Symmetry forbids transverse flow on the center line in this stationary setup.
for (const x of [20,100,500,1000]) assert.ok(Math.abs(vm.runInContext(`computeBohmianVelocity(${x},600,0,0).vy`,ctx)) < 1e-8);
// Photon normalization must agree with the declared nanometre/nanosecond units.
assert.ok(Math.abs(vm.runInContext("particleType='photon'; Math.hypot(...Object.values(computeBohmianVelocity(500,500,0,0)))",ctx)-299792458)<1e-6);
// Run real worker precomputation; it must echo the request id and match the main-thread full CDF.
let reply;
const worker = vm.createContext({Math,Float64Array,self:{postMessage:r=>reply=r}});
vm.runInContext(fs.readFileSync(path.join(root,'js/precompute-worker.js'),'utf8'),worker);
worker.self.onmessage({data:{seq:17,k:2*Math.PI/100,omega:1,wallXWorld:0,sourceXWorld:-500,sourceYWorld:600,
slit1XWorld:0,slit2XWorld:0,slit1YWorld:350,slit2YWorld:850,worldCanvasDy:1200,detectorXWorld:1000,
particleType:'electron',slit1Open:true,slit2Open:true,whichPathDetector:'none',radiusPre:5}});
assert.equal(reply.seq,17);
const mainCDF=vm.runInContext('detectorArrayFull.cdf',ctx);
reply.detectorArrayFull.cdf.forEach((v,i)=>assert.ok(Math.abs(v-mainCDF[i])<1e-12));
assert.equal(reply.detectorArrayFull.cdf.at(-1),1);
// Validate the worker response guard against actual out-of-order delivery.
ctx.sent=[];
vm.runInContext('precomputeWorker={postMessage:p=>sent.push(p)}; runPrecomputeAsync(); runPrecomputeAsync();',ctx);
assert.equal(ctx.sent.length,2);
ctx.precomputeWorker.onmessage({data:{...reply,seq:ctx.sent[0].seq}});
assert.equal(vm.runInContext('precomputePending',ctx),true);
ctx.precomputeWorker.onmessage({data:{...reply,seq:ctx.sent[1].seq}});
assert.equal(vm.runInContext('precomputePending',ctx),false);
// Interpretation changes preserve one experimental record, paused or running.
ctx.$=()=>({text(){return this;},html(){return this;},attr(){return this;}});
vm.runInContext(`hits=[2,3]; trajectories=[{points:[{x:10,y:20}],nPoints:1}];
nHits=5; hitMax=3; nParticles=8; logNBranches=10; time=12;
nSteps=7; lastParticleTime=4; lastRealTime=9; particleAccum=0.25; startRealTime=2;
altBranchHits=[1,4]; showAltBranch=true;
updateViewButton=()=>{}; updateInterpretationDisplay=()=>{}; updateMathFormulas=()=>{};
syncMathButtons=()=>{}; drawSystem=()=>{};`,ctx);
const record = () => vm.runInContext(`JSON.stringify({hits,trajectories,nHits,hitMax,nParticles,
logNBranches,time,nSteps,lastParticleTime,lastRealTime,particleAccum,startRealTime,altBranchHits,showAltBranch})`,ctx);
const before = record();
for (const running of [false,true]) {
  ctx.isAnimating=running;
  for (const mode of ['bohmian','manyworlds','copenhagen','manyworlds','bohmian','copenhagen']) {
    ctx.changeInterpretation(mode);
    assert.equal(record(),before);
    assert.equal(vm.runInContext('interpretation',ctx),mode);
    assert.equal(ctx.isAnimating,running);
  }
}
// Explicit reset remains available.
ctx.lightweightReset();
assert.equal(ctx.nHits,0);
assert.equal(vm.runInContext('logNBranches',ctx),0);
assert.equal(ctx.trajectories.length,0);
assert.equal(ctx.time,0);
console.log('PASS: sampling, symmetry, worker parity, stale results, preserved mode transitions, explicit reset.');

// Worker failure must restore synchronous sampling instead of blocking particles.
vm.runInContext(`precomputePending=true; precomputeWorker={terminate(){}};
setupGeo=()=>{precomputePending=false;}; recoverPrecompute();`,ctx);
assert.equal(vm.runInContext('precomputePending',ctx),false);
assert.equal(ctx.precomputeWorker,null);
console.log('PASS: worker recovery cannot leave particle generation waiting.');

