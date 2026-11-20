export const orbitals = Object.freeze({
  '1s': {
    label: '1s', n: 1, l: 0, m: 0,
    summary: 'The probability cloud is spherical and concentrated near the proton.',
    explanation: 'The 1s wave has no spatial phase gradient in the spin-free model, so the particle stays still.',
  },
  '2p0': {
    label: '2p₀', n: 2, l: 1, m: 0,
    summary: 'Two lobes sit above and below a plane of zero probability density.',
    explanation: 'The 2p₀ wave has no spatial phase gradient away from its nodal plane, so the particle stays still.',
  },
  '2p1': {
    label: '2p₊₁', n: 2, l: 1, m: 1,
    summary: 'The cloud surrounds the z-axis, where the probability density is zero.',
    explanation: 'The 2p₊₁ phase winds around the z-axis, so the particle circles that axis at a constant height.',
  },
});

// Radial measures in a₀: 1s is proportional to r² exp(-2r), 2p to r⁴ exp(-r).
// The polar measure in μ=cos θ is uniform, proportional to μ², or proportional
// to 1-μ² for these states. The azimuthal distribution is uniform in all three.
export function samplePosition(orbital, random) {
  const sOrbital = orbital.l === 0;
  const radialShape = sOrbital ? 3 : 5;
  let radius = 0;
  for (let i = 0; i < radialShape; i++) radius -= Math.log(1 - random());
  if (sOrbital) radius /= 2;

  let cosine = 2 * random() - 1;
  if (!sOrbital) {
    if (orbital.m === 0) cosine = Math.cbrt(cosine);
    else while (random() >= 1 - cosine ** 2) cosine = 2 * random() - 1;
  }

  const phi = 2 * Math.PI * random();
  const transverse = radius * Math.sqrt(1 - cosine ** 2);
  return [transverse * Math.cos(phi), transverse * Math.sin(phi), radius * cosine];
}

// Exact integration of the scalar guiding law, in atomic units.
export function positionAt(orbital, initial, time) {
  const [x, y, z] = initial;
  if (orbital.m === 0) return initial;
  const radiusSquared = x * x + y * y;
  const angle = orbital.m * time / radiusSquared;
  const cosine = Math.cos(angle), sine = Math.sin(angle);
  return [x * cosine - y * sine, x * sine + y * cosine, z];
}
