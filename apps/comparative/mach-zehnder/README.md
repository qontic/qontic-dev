# Atom Mach–Zehnder Interferometer

Prototype for the NSF IUSE proposal "Building Physical Intuition in Quantum Mechanics for an Era of AI-Assisted Calculation". It covers three core items: the second beam splitter in or out, a which-way record nobody reads, and the bomb tester.

## Files
- `index.html` — shared Q-Ontic shell, layout and controls.
- `js/physics.js` — geometry, statistics, branch structure, pilot-wave trajectories.
- `js/content.js` — explanations for each setup in each account.
- `js/app.js` — adapter, rendering, prediction mode and log.
- `js/qontic-controls.js` — template adapter, extended with `sc` (spontaneous collapse).

## Model notes
- Statistics are exact for an ideal symmetric interferometer with phase φ between the arms: P(D2) = sin²(φ/2) with nothing in the arms; marker, bomb and removed-splitter counts do not depend on φ.
- One hidden number per atom fixes the run in every view; in pilot wave it is the initial position.
- With the second beam splitter removed, trajectories are integrated (RK4) from the exact free evolution of two equal Gaussian packets (ħ = m = 1); they include the relative phase and never cross each other; upper-arm atoms end at D1 for every phase.
- The beam splitter itself is instantaneous: in pilot wave, the output depends on the atom's position in its packet. This is a simplification, stated on the Physics tab.
- The configuration-space panel shows atom position against the marker or bomb state.

## Shared change
`shared/qontic-controls.js` gained an optional `interpretations` attribute (e.g. `cpn,pw,mw,sc`) and an optional `sc` entry. Without the attribute the cycle is unchanged; `templates/qontic-app/controls-check.html` has a new check.
