# Nanoparticle Interference (Vienna 2026) — changelog

## 0.1.0 (2026-11-15)
First draft, the first app of a new Experiments section.
- Talbot–Lau interferometer with three optical depletion gratings, following Pedalino et al., Nature 649, 866 (2026) (arXiv:2507.21211v1, Eqs. 1–9): quantum and classical (moiré) predictions, averaged over speed and the mass window.
- Parameters from the paper's Methods. The laser waist w_y in Eqs. 3–4 is taken as the vertical beam height of each grating (620/575/575 µm); this reproduces the measured V ≈ 0.10 at the Fig. 2a settings (app: 0.106 quantum, 0.028 classical, with the paper's 0.78 factor).
- Simulated G3 scan with Poisson counts, sine fit, χ² comparison with both predictions, and a prediction question.
- Charts: visibility vs G2 power (with the paper's two measured points at the Fig. 2a settings) and vs cluster mass.
- Tests: tests/talbot.test.mjs checks the engine against an independent Python implementation.
