# Michelson–Morley: Two Accounts — changelog

## 0.1.0 (2026-11-05)
- First version (draft, dev site only). Replaces Mark Hattarki's Michelson–Morley notebook, now in archive/notebooks/.
- Accounts: 1887 expectation (ether, no contraction), Lorentz (ether frame, contraction 1/γ, slow clocks), Einstein (apparatus frame, no ether), and Both (Lorentz and Einstein side by side on the apparatus clock).
- Controls: speed (exaggerated, 0.05–0.8 c), rotation 0–90°. Prediction prompt, live readout, verdict with next steps; Keeps / Adds / Owes for the two accounts.
- Delay-vs-rotation chart: the 1887 expectation and the flat line of the two accounts.
- Tests: `node apps/relativity/michelson-morley/tests/optics.test.mjs` (9 tests: closed-form 1887 times, zero at 45° and reversal at 90°, Lorentz 2γ at every angle, apparatus clock 2 L/c, Einstein 2 L/c, pulse speed and return point).
