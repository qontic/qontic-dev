# Bell's Spaceships — changelog

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
