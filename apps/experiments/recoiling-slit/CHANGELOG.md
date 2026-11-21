# Einstein’s Recoiling Slit

## 1.1.0 — 2026-11-21

Restructured after a ten-student review (Clarity 2/5 for nine of ten). Part 1 · Measure the fringe: Einstein-to-experiment mapping line, "Measure the fringe" (4,800 photons at 12 phases, fitted V ± σ), fringe plot with the previous depth kept for comparison, visibility-vs-depth with measured points, the two recoil waves with the overlap shaded (area = V), and the atom's position spread against the 390 nm stripes for all three views (pilot-wave adds actual positions and X). Part 2 · One photon, three views: apparatus, one wave panel per stage (no duplicate at Detect), records panel per view. Opens at the deepest trap with a prediction first. Heating, Re/Im display, momentum readout and η moved to Advanced; density is the default display; speed control removed. Fixed: histogram drawing outside its panel; stale event after a phase change; "observer history" wording outside Many Worlds; 1,001 counts; heating now widens the displayed Δp; slider announces mK; dashed lines distinguish curves for colour-blind readers. Physics text: visibility is the modulus of the overlap (the paper writes a square); heating explained as a mixture of displaced states; Bohr's complementarity in the Orthodox view.

## 1.0.0 — 2026-11-20

Moved to the Experiments section (module recoiling-slit). Tied to Zhang et al., PRL 135, 230202 (2025): trap-depth control (0.02–20 mK, measured range 0.60–10.49 mK marked) with Δp = 1.60 ħk·(U/10.49 mK)^¼, residual heating n̄ with V = exp(−2η²(2n̄+1)), sampled exactly as a mixture of coherent states. Momentum plots in units of ħk. New visibility-versus-depth graph with the measured n̄ band and the reported 84(4)% point. Pilot Wave view now shows the atom's actual position X, P(D₊|X) = [1 + cos(2kX + φ)]/2 and the collected positions behind each detector. Removed the free-particle phase ripple (the trap period is far longer than the event). Python reference (tests/reference.py: trap frequency, Fock-state visibility, Fock-route Monte Carlo) with JS tests against it. Physics, Views and Experiment tabs rewritten.

## 0.2.0 — 2026-11-07

Add an explicit complex two-mode photon/continuous atom wave model, a four-stage packet walkthrough, real/imaginary/density views, and detector-record comparisons for Orthodox, Pilot Wave, and Many Worlds. Conditional atom waves are normalized for collapsed/record branches. Interpretation switches preserve the sampled event and counts. Pilot Wave displays retained waves and a Born-sampled definite record; it does not solve field guidance dynamics. Add unitary, normalization, and free-phase checks.

## 0.1.1 — 2026-11-07

Improve light-theme contrast and compact plot labels; refresh asset versions.

## 0.1.0 — 2026-11-07

First research-example prototype: ideal Gaussian recoil states, balanced interferometer, phase scan, joint atom/photon sampling, optional recoil readout, prediction activity, and model/reference notes. Shared Q-Ontic shell, controls, screenshot, expansion, and recording. Does not reproduce laboratory calibration, heating, optical geometry, or detector noise.
