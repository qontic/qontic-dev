// The slit geometry object is the single source for both engines.
import { readFileSync } from "node:fs";
import { buildSlitGeometry, maskTransmission } from "../js/slit-geometry.js";
import { aperture } from "../js/source-packet-model.js";
let failed = 0;
const check = (ok, msg) => { console.log((ok ? "PASS  " : "FAIL  ") + msg); if (!ok) failed++; };
for (const [n, states, sep, sig] of [[2, ["open", "open"], 300, 30], [5, ["open", "closed", "detector", "open", "open"], 240, 25], [16, Array(16).fill("open"), 90, 20]]) {
  const g = buildSlitGeometry({ numSlits: n, states, separationNm: sep, slitSigmaNm: sig, extentSigma: 1.5, sourceToWallNm: 225, wallToScreenNm: 1000, screenHeightNm: 1200 });
  const ids = states.map((s, k) => s === "closed" ? -1 : k).filter(k => k >= 0);
  const old = ids.map(k => (2 * k - (n - 1)) * sep / 200);   // the formula the analytical app used
  check(JSON.stringify(g.open.centers) === JSON.stringify(old), `${n} slits: centres as before`);
  check(Object.isFrozen(g) && Object.isFrozen(g.open.centers) && Object.isFrozen(g.slits[0]), `${n} slits: object frozen`);
  // Analytical mask with and without the geometry object (old bound computed by the model itself).
  const pOld = { centers: old, sy: sig / 100, apertureWeights: old.map(() => 1) }, pNew = { ...pOld, geometry: g };
  let maxDiff = 0;
  for (let y = -6; y <= 6; y += 0.01) maxDiff = Math.max(maxDiff, Math.abs(aperture(y, pOld) - aperture(y, pNew)), Math.abs(aperture(y, pNew) - maskTransmission(y, g)));
  check(maxDiff < 1e-12, `${n} slits: analytical mask identical through the geometry object (max diff ${maxDiff.toExponential(1)})`);
  check(g.detectorIds.join() === states.map((s, k) => s === "detector" ? k : -1).filter(k => k >= 0).join(), `${n} slits: detectors`);
}
// Static: the numerical engine takes slit and wall geometry only from the geometry object.
const src = readFileSync(new URL("../js/numerical-engine.js", import.meta.url), "utf8").split("\n").filter(l => !l.trim().startsWith("//")).join("\n");
const forbidden = src.match(/\bp\.(wall|screen|sy|centers|apertureWeights|slitIds|launch)\b/g) || [];
check(forbidden.length === 0, `numerical engine reads no slit geometry from p (found: ${forbidden.join(", ") || "none"})`);
check(/geom\.wall/.test(src) && /geom\.open\.centers/.test(src) && /geom\.maskBound/.test(src) && /geom\.openingHalf/.test(src), "numerical engine reads wall, slit centres, mask bound and opening from the geometry object");
console.log(JSON.stringify({ passed: failed === 0 }));
process.exit(failed ? 1 : 0);
