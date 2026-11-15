// Run with: node apps/experiments/nanoparticle-interference/tests/sim.test.mjs
// The cluster-by-cluster simulation must reproduce the predicted fringes: sampled (Orthodox,
// Many-Worlds) and pilot-wave clusters the quantum visibility, classical clusters the classical one.
import assert from 'node:assert/strict';
import { PAPER, visibility, fitSine } from '../js/talbot.js';
import { buildEnsemble, runCluster } from '../js/sim.js';

let passed = 0;
const test = (name, fn) => { fn(); passed++; console.log('ok', name); };
let seed = 987654321;
const rand = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
const D = PAPER.d;
const X3 = Array.from({ length: 18 }, (_, i) => (i * 2 * D) / 18);
const p = { P: PAPER.fig2a.P, waist: PAPER.waist, L: PAPER.L, d: D };
const beam = PAPER.fig2a;
const ens = buildEnsemble(p, beam, PAPER.scale, 9, 5); // coarser grid keeps the test quick
const vq = visibility(p, beam, false, PAPER.scale, 9, 5), vc = visibility(p, beam, true, PAPER.scale, 9, 5);

function scan(mode, perPoint, steps) {
  const counts = X3.map((x3) => { let n = 0; for (let i = 0; i < perPoint; i++) if (runCluster(ens, mode, x3, rand, { steps }).fate === 'counted') n++; return n; });
  return fitSine(X3, counts, D);
}

test(`sampled clusters reproduce the quantum visibility (${vq.toFixed(3)})`, () => {
  const f = scan('sampled', 6000);
  assert.ok(Math.abs(f.V - vq) < 3.5 * f.dV, `V = ${f.V.toFixed(4)} ± ${f.dV.toFixed(4)}`);
  assert.ok(Math.abs(f.V - vc) > 4 * f.dV, 'and differ from the classical value');
  console.log(`   V = ${f.V.toFixed(4)} ± ${f.dV.toFixed(4)}`);
});

test(`classical clusters reproduce the classical visibility (${vc.toFixed(3)})`, () => {
  const f = scan('classical', 6000);
  assert.ok(Math.abs(f.V - vc) < 3.5 * f.dV, `V = ${f.V.toFixed(4)} ± ${f.dV.toFixed(4)}`);
  console.log(`   V = ${f.V.toFixed(4)} ± ${f.dV.toFixed(4)}`);
});

test('pilot-wave clusters reproduce the quantum visibility', () => {
  const f = scan('pilot-wave', 1500, 60);
  assert.ok(Math.abs(f.V - vq) < 3.5 * f.dV, `V = ${f.V.toFixed(4)} ± ${f.dV.toFixed(4)}`);
  console.log(`   V = ${f.V.toFixed(4)} ± ${f.dV.toFixed(4)}`);
});

console.log(`${passed} tests passed`);
