// Einstein–Bohr recoiling slit (Zhang et al., PRL 135, 230202 (2025)).
// Units: momentum u = p/sigma_p (sigma_p = ground-state momentum spread Δp), position xi = x/Δx0 with
// Δx0 = ħ/(2Δp). The two recoil waves are the ground state kicked by -ħk (path A) and +ħk (path B), so
// their separation is r = 2ħk/Δp = 4η with η = ħk/(2Δp).

export const LAMBDA_NM = 780.241;                 // Rb-87 D2, F=2 → F'=3 cycling transition
export const PAPER = {depthMin: 0.60, depthMax: 10.49, dpMin: 0.78, dpMax: 1.60, nbarMin: 0.08, nbarMax: 0.37};
// Reported visibility at the start of the time-resolved run (Fig. 4a): 84(4)% at 10.49 mK.
export const PAPER_POINT = {depth: 10.49, visibility: 0.84, error: 0.04};

// Ground-state momentum spread in units of ħk; Δp ∝ ω^½ ∝ (trap depth)^¼, anchored at the paper's 1.60 ħk.
export const momentumSpread = depth => PAPER.dpMax * Math.pow(depth / PAPER.depthMax, 0.25);
export const recoilRatio = dp => 2 / dp;
export const eta = dp => 1 / (2 * dp);
export const positionSpreadNm = dp => eta(dp) * LAMBDA_NM / (2 * Math.PI);   // Δx0 = η/k

// Visibility |Tr ρ e^{2ikx}| for a thermal state with mean phonon number nbar: exp(-2η²(2n̄+1)).
export const visibility = (r, nbar = 0) => Math.exp(-r * r * (1 + 2 * nbar) / 8);
export const portProbability = (r, phase, nbar = 0) => (1 + visibility(r, nbar) * Math.cos(phase)) / 2;

// Position picture. The kicks multiply the atom wave by e^{∓ikx}; for an atom at xi the D₊ amplitude is
// (e^{-ikx} + e^{iφ}e^{ikx})/2, so P(D₊ | xi) = [1 + cos(r·xi/2 + φ)]/2.
export const positionPortProbability = (xi, r, phase) => (1 + Math.cos(r * xi / 2 + phase)) / 2;
export const groundPosition = xi => Math.exp(-xi * xi / 2) / Math.sqrt(2 * Math.PI);
export const thermalPosition = (xi, nbar = 0) => groundPosition(xi / Math.sqrt(1 + 2 * nbar)) / Math.sqrt(1 + 2 * nbar);

// Momentum picture for the ground state.
export const gaussian = (u, mean = 0) => Math.exp(-0.5 * (u - mean) ** 2) / Math.sqrt(2 * Math.PI);
export function recoilDensities(u, r) { return [gaussian(u, -r / 2), gaussian(u, r / 2)]; }
export function jointDensity(u, r, phase, port = 1) {
  const [a, b] = recoilDensities(u, r);
  return Math.max(0, (a + b + port * 2 * Math.sqrt(a * b) * Math.cos(phase)) / 4);
}
// P(D₊ | momentum readout u) for the ground state. Stable in the Gaussian tails.
export const conditionalPortProbability = (u, r, phase) => (1 + Math.cos(phase) / Math.cosh(u * r / 2)) / 2;

function normal(rng) {
  return Math.sqrt(-2 * Math.log(Math.max(Number.MIN_VALUE, rng()))) * Math.cos(2 * Math.PI * rng());
}

// One event. A thermal state is a Gaussian mixture of coherent states (ground state displaced by xa, pa;
// variances 2n̄ in these units). The atom position xi is drawn from the coherent state, the port from
// P(D₊|xi), and an optional later momentum reading u from the port-conditional momentum density.
// Quantum mechanics gives no joint distribution of xi and u, so u is drawn given the port only.
export function sampleEvent(r, phase, nbar = 0, rng = Math.random) {
  const s = Math.sqrt(2 * nbar), xa = s ? s * normal(rng) : 0, pa = s ? s * normal(rng) : 0;
  const x = xa + normal(rng);
  const port = rng() < positionPortProbability(x, r, phase) ? 1 : -1;
  const phaseEff = phase + r * xa / 2;
  let u = 0;
  for (let i = 0; i < 100000; i++) {           // proposal (a+b)/2, accept with P(port | u)
    u = normal(rng) + (rng() < 0.5 ? -r / 2 : r / 2);
    const p = conditionalPortProbability(u, r, phaseEff);
    if (rng() < (port === 1 ? p : 1 - p)) break;
  }
  return {x, u: u + pa, port};
}
