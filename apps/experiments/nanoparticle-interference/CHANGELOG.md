# Nanoparticle Interference (Vienna 2026) — changelog

## 0.2.0 (2026-11-15)
The wave and the three interpretations.
- New top panel: |ψ|² inside the interferometer, from the exact paraxial wave (js/wave.js). Each cluster leaves G1 as a point-source wave (coherence width ≈ 0.05 nm ≪ d); behind G2 the wave is a closed-form sum over virtual sources at x0 − nλL/d weighted by G2's Fourier coefficients. Option: incoherent sum over all G1 points. Replaces the cartoon beamline.
- Interpretation selector (Orthodox / Pilot Wave / Many Worlds), following the analytical double-slit app: same wave and counts in all three. Pilot Wave draws guided trajectories (dx/dz = Im(∂ψ/ψ)/k, RK4) with effective survival |t|² at G2 and G3; Many Worlds adds "Sample another branch".
- Tests (tests/wave.test.mjs): the explicit wave reproduces the Talbot–Lau count rate of the paper to < 0.2% (172 kDa, 1 MDa at 25 m/s, 50 kDa); guidance equals the numerical phase gradient; trajectory positions at G3 match |ψ|² bin by bin.
- Physics: sections on the wave of one cluster and on pilot-wave trajectories. Rationale: "Three views of the same wave" replaces "A question for later".

## 0.1.0 (2026-11-15)
First draft, the first app of a new Experiments section.
- Talbot–Lau interferometer with three optical depletion gratings, following Pedalino et al., Nature 649, 866 (2026) (arXiv:2507.21211v1, Eqs. 1–9): quantum and classical (moiré) predictions, averaged over speed and the mass window.
- Parameters from the paper's Methods. The laser waist w_y in Eqs. 3–4 is taken as the vertical beam height of each grating (620/575/575 µm); this reproduces the measured V ≈ 0.10 at the Fig. 2a settings (app: 0.106 quantum, 0.028 classical, with the paper's 0.78 factor).
- Simulated G3 scan with Poisson counts, sine fit, χ² comparison with both predictions, and a prediction question.
- Charts: visibility vs G2 power (with the paper's two measured points at the Fig. 2a settings) and vs cluster mass.
- Tests: tests/talbot.test.mjs checks the engine against an independent Python implementation.
