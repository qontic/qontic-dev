# Weak Velocity in the Double Slit — changelog

## 0.1.3 — 2026-11-06
- Display toggle "Runs on the planes" (on by default) for the pointer readings and detections drawn beside the two planes.

## 0.1.2 — 2026-11-06
- Stage 2 runs a set number of runs (100 000, 1 000 000 or 5 000 000; same control as stage 3) instead of running to 5 million.
- The last 1 500 runs are drawn on the planes: pointer readings beside the weak plane, detections beside the strong plane.
- The data plot states how many runs it shows (the last 4 000) out of how many collected; strip means use all runs.

## 0.1.1 — 2026-11-06
- Pointer scale drawn along the weak plane (was a separate horizontal gauge). Stage 1 marks the reading Y on it with its ±σp spread; stage 2 marks the mean reading for the selected strip and joins it to the mean detected position.

## 0.1.0 — 2026-11-06
- First version. Idea and first renders: Anssi Kuha (Sept–Oct 2026), with comments from Xavier Oriols.
- Wiseman's protocol: weak position measurement with a separate pointer, strong position measurement a gap later, post-selection on the strong result.
- Exact joint distribution P(Y, y_f) from the analytical double-slit wave (same coefficients as that app); runs sampled from it.
- Three stages: one run, many runs at one pair of planes, map of the field over 12 planes with lines integrated through the measured arrows.
- Tests: tests/weak-model.test.mjs (7).
