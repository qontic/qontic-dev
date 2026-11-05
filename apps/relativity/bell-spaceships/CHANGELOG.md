# Bell's Spaceships — changelog

## 0.3.0 (2026-11-05)
- Front engine is now a continuous setting k (front proper acceleration a/(1 + k·aL/c²)) with presets "Same as rear (Bell)" (k = 0) and "Exactly right" (k = 1), replacing the two-way toggle. Final stretch (γ − 1)(1 − k): only k = 1 keeps the thread at its natural length; k < 1 still stretches it (and it can snap), k > 1 leaves it slack (drawn sagging).
- One prediction question (It snaps / It holds), asked only on the first run.
- Physics tab: the formula and why k = 1 is a special tuning (Bell's strong-thread proviso).
- Tests: final-stretch formula for several k (15 tests).

## 0.2.1 (2026-11-05)
- Engines renamed "Same engines (Bell)" / "Front engine gentler" (was Identical / Rigid), with a one-line hint for each.
- Launch frame shows "gap held at … L" or "gap shrinking with the thread" during the run.
- Physics tab: why a gentler front engine keeps the thread intact, and its link to Bell's strong-thread proviso.

## 0.2.0 (2026-11-05)
After a review by ten simulated students (project doc 2026-11-05-bell-spaceships-student-review).
- Launch frame alone is the default view; ships' frame and spacetime are reveals (View: Launch frame / + Ships' frame / Spacetime / All).
- Thread elongation now computed as in Bell's argument: in the launch frame, gap divided by the natural length L/γ at the ships' speed. The thread snaps exactly when the ships pass the critical speed (fixes the 0.46 c vs 0.55 c contradiction). Rear-frame distance still shown in the ships' frame.
- Gentle default acceleration (aL = 0.2 c²; range 0.05–1).
- Story strip below the canvas (no overlays): short setup, a prediction with a reason (four choices), a live readout (speed, gap, natural length, stretch), a verdict with feedback on the chosen reason and next steps (Try Rigid, See it from the ships' frame, Run again).
- Results trimmed to speed, gap, natural length, stretch, status (+ ships'-frame gap when shown). Clocks off by default.
- Physics and Rationale rewritten: spoiler note; one-frame answer first; precise statement of Bell's atom result; Bell's strong-thread proviso; Brown & Pooley caveat; where the parallel to quantum mechanics breaks. Links to the new Bell's atom notebook.
- Spacetime diagram clipped to its panel.

## 0.1.1 (2026-11-05)
- Fix: the canvas stayed blank after visiting Physics or Rationale (drawing at zero size threw and stopped the animation loop).
- The run pauses when you leave the Simulation section.
- New setup card before the question: five numbered points (ships, thread, start signal, engines, breaking limit). "Show the setup" button in Core reopens it.

## 0.1.0 (2026-11-05)
- First version (draft, dev site only).
- Identical (Bell) and rigid (Born) acceleration programs; final speed, breaking elongation, rear-ship proper acceleration.
- Launch-frame and rear-ship-frame panels at a common scale; spacetime diagram with the thread's history, lines of simultaneity and the break event.
- Prediction prompt and end-of-run verdict; ship clocks; optional atoms with flattened fields.
- Kinematics tests: `node apps/relativity/bell-spaceships/tests/kinematics.test.mjs`.
