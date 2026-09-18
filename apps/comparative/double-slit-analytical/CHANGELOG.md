# Analytical Double Slit releases

## Version 48 — Compact handles and brighter transmitted waves (2026-09-18)

- Detector movement and height controls appear only at the bottom; add a bottom slit-wall handle that keeps the detector fixed.
- Smoothly enhance transmitted-wave brightness without changing probabilities or trajectories.
- Always repeat packets; remove repeat checkbox and control-panel drag explanation, retain handle tooltips.
- Move the particle species selector to the top of Advanced.

## Version 47 — Canvas geometry and trajectory tails (2026-09-17)

- Remove the source marker and source-position control; fix the preparation plane at 225 nm before the apertures.
- Replace detector distance and screen-height sliders with draggable canvas handles and keyboard adjustment. Preview while dragging; commit starts a new record, Escape cancels.
- Keep the horizontal viewport stable when moving the detector; expand it when necessary.
- Inline packet-width controls with numeric entry and units. Add trajectory tail length in nm; completed paths fade over 0.8 playback seconds.
- Geometry, bounds, tail-length and fade checks passed. Browser verification unavailable because the execution environment was disconnected.

## Version 46 — Gaussian packets across interpretations (2026-09-17)

- Gaussian source packets are the sole engine; previous models remain recoverable in git.
- Orthodox samples absorption and screen outcomes from the packet probabilities, shows localized absorbing-detector registration and removes only the detected member from the ensemble.
- MW packet detections now drive split-and-zoom views with integrated pixel weights, branch-specific records at splitting, and no duplicate hit on selection.
- Pilot-Wave retains source preparation and forward propagation. Switching preserves records and conditions unresolved preparations on survival.
- Rewrite Math/Rationale for the packet model and its effective detector, aperture and finite branch approximations.

## Version 45 — Source cone and reusable preparation (2026-09-17)

- Save the latest spherical field in browser storage and restore matching geometry across reloads; show preparation stages. First preparation and changed geometry still require computation.
- Default particle emission to one cone spanning the open Gaussian slits, using two-sigma outer limits. Draw the source and cone guides. This biased particle sampling leaves the wave unchanged; the ordinary prediction stays hidden.
- Remove the slit-exit packet selector; legacy slit-exit links open spherical-source mode. Retain Continuous and Gaussian source.
- Preserve version 44 in git history.

## Version 44 — Packet playback and launch controls (2026-09-17)

- Cache and interpolate the carrier-demodulated spectral solution once per geometry; reuse it for repeat packets and resets.
- Independent Launch interval control (0.5–10 playback seconds, default 3); concurrent independent packets, capped at 12 without truncating existing packets.
- Keep packet motion speed in the shared Speed control; eliminate the one-small-step-per-frame cap and allow catch-up substeps.
- Extend slit/exit Gaussian width to 200 nm.
- Optional biased slit-directed particle sampling; hide the ordinary prediction curve while enabled, preserve actual hit counts and explain the limitation.
- Numerical cache-convergence, speed benchmark, emission scheduling, angular sampling and detector-statistics checks.
- Prior release retained in git at ef9396480f07c7b509e76ca12bb0173e0446db3e.


## Version 43 — Circular-source packet prototype (2026-09-17)

- Integrated into the existing Wave model selector; previous engines retained.
- Analytical outgoing 2D Hankel kernels and angular-spectrum propagation; spectral/aperture quadrature, analytical time phases and numerical current-guided trajectories. No time-stepped wave PDE.
- Radial source emission and reduced one-way aperture transmission, with assumptions and 2D/3D distinction documented in Math and Rationale.
- Background preparation, resolution guards, hit-driven histogram scaling, existing display and capture controls.
- Seeded 30,000-emission validation: 1,375 screen hits; maximum screen CDF difference 0.01528. This validates the tested configuration, not arbitrary geometries.
- Rollback: rollback/double-slit-v42-before-spherical at a4ddfc53354bdee79d817f47ee6b0b33a066a959.



## Version 42 — Analytical source-to-screen packets (2026-09-17)

- Added Packet · source to the existing Wave model selector; retained the exact free Packet · slit exits engine and continuous engine.
- Connected one translating Gaussian pulse to analytical Gaussian-aperture transmission with inherited complex phase and spatial transverse propagation. No fade, phase reset, or downstream packet reinjection at the wall.
- Added source width in Advanced. Existing source distance, aperture width, slit switches, wavelength, detector geometry, opacity, screenshot/video and interpretation controls continue to apply.
- Source trajectories sample the incident ensemble. Effective mask absorption uses T²; transmitted paths continue at their crossing positions. Screen density and counts share the hit-driven scale.
- Cached the analytical transverse field and used a fixed brightness reference for smooth pulse motion and stable opacity across transmission.
- Math and Rationale distinguish the paraxial, non-reflecting source model from exact free slit-exit evolution, including stochastic absorption and longitudinal-dispersion limits.
- Validated complex aperture matching, paraxial equation residuals, transmitted flux conservation, overlapping/single apertures, and a seeded 12,000-particle screen-distribution comparison.

## 41 — 2026-09-17
- Prepare packet centers three standard deviations beyond the exit plane, retain analytical tails and adjust the detector flight distance consistently.
- Draw a smooth current profile independent of detector binning. Normalize model and sampled counts to observed hits on one shared scale, unchanged by packet launches.
- Strengthen packet visibility with a display-only envelope in all interpretations, retaining the Wave opacity control.

## 40 — 2026-09-17
- Integrate analytical packets into the existing app through Core → Wave model. Reuse playback, geometry, display, canvas layers, media tools, stats and Math/Rationale.
- Packet-only widths live in Advanced; Max. Particles controls particles per packet. Interpretation switching preserves the packet history.
- Remove the separate preview entry. The packet engine currently excludes source propagation, which-path coupling, photons and MW split-tour animation; these remain available with the continuous engine.
- The version 38 rollback branch and complete Git history remain available.

## 39 — 2026-09-17
- Add a separate experimental analytical Gaussian packet preview linked from Core, with single/pair slit-exit preparation, repeated independent pulses, and a Pilot-Wave ensemble.
- Use exact free Gaussian fields and longitudinal trajectories, RK4 transverse trajectories, and quadrature of analytical screen current. No screen-endpoint seeding.
- Validation: normalization, spreading, gradients, step convergence; 2,500 seeded trajectories give maximum screen CDF discrepancy 0.01088.
- Rollback snapshot: `rollback/double-slit-v38-before-packets` at `faaa6861163976c8a0d3b1f1ce17f47f14e72c02`. To undo this release, revert its commit only; do not reset main or overwrite unrelated shared-template work.

## 38 — 2026-09-17
- Hide branch probability labels by default; add an optional Show probabilities checkbox.
- Show labels only when complete text fits; remove their reserved space otherwise. Keep full probabilities in tooltips and accessible names.

## 37 — 2026-09-17
- Prefer complete balanced branch grids: 25 outcomes form 5×5; 500 form 25×20.
- Fit desktop grids within the canvas by scaling their width while retaining each miniature’s aspect ratio.

## 36 — 2026-09-17
- Show relative Born weights through branch opacity during splitting and in the grid, with a visibility floor and readable probability labels.
- Restore the selected branch smoothly to full opacity during entry; document the visual mapping in Rationale.

## 35 — 2026-09-17
- Remove the temporary yellow detection highlight at the instant the selected branch fills the canvas, retaining its detector record and histogram.

## 34 — 2026-09-17
- Each branch has its updated histogram and sensor record from the first split frame, through the grid and zoom.
- Advance hit and branch totals at detection; following a branch adopts its existing record without counting another hit.
- Cache detector strips once per split while sharing the live wave rendering.

## 33 — 2026-09-17
- Animate detection and branching together: fired detector records emerge in a depth stack and fan out into the branch grid.
- Keep the wave live during the split; enable selection and start the one-second automatic-choice delay after the grid settles.
- Preserve the branch-entry camera zoom and record one outcome when a branch is followed.

## 32 — 2026-09-16
- Scale the model curve and sampled histogram together to keep all count markers and upper sqrt(n) error bars inside the plotting area, including at very low counts.
- Fade the branch-entry status banner during zoom so it cannot hide the topmost fired detector pixel.

## 31 — 2026-09-16
- Keep the wave evolving in every MW miniature and during branch-entry zooms; only new detections wait for selection.
- Reuse a single evolving wave render and one downsampled frame across all miniature canvases.
- Preserve Start/Stop behavior, branch dwell timing, and one recorded hit per selection.

## 30 — 2026-09-16
- Add an MW slow-motion Time in branch slider (1–5 seconds, default 1 second).
- Run the full-size branch before the first split and after each selection; exclude paused time and prevent queued detections during this interval.

## 29 — 2026-09-16
- Highlight the selected MW branch, then move the entire branch grid through a shared camera zoom until the selected system fills the canvas.
- Add a selection pause, a smooth 1.2-second zoom, and a brief full-view hold.

## 28 — 2026-09-16
- Add optional slow-motion Many-Worlds branching: one miniature per detector pixel, Born-weighted automatic following or manual selection, and expansion into the followed world.
- Pause evolution during the branch tour; cancel pending outcomes on reset, geometry, or interpretation changes.
- Explain the schematic branch view and manually selected histories in the Rationale.

## 27 — 2026-09-16
- Remove the redundant range drag grip; retain panel dragging and keyboard movement.
- Make the distance-scale background nearly transparent through the shared template.

The displayed release is defined in `js/release.js`. For each published app change, increment that version, add an entry here, and refresh changed assets' import URLs. Query strings are cache refreshes, not a release history.

## 26 — 2026-09-16
- Drag the wave-range panel from its palette, values, or background.
- Protect slider handles and their surrounding area from panel dragging.
- Apply the same behavior in the shared template.

## 25 — 2026-09-16
- Make the wave-range slider, values, and palette movable together with a drag grip.
- Add a Wave range toolbar toggle; hiding preserves the selected range.
- Extend the reusable template components and demo.

## 24 — 2026-09-16
- Correct the footer's stale Version 15 label and centralize the displayed release.
- Adopt shared draggable distance scale, toolbar toggle, and two-handle color-range control.
- Add working examples and integration contract to the canonical template.

## Changes since the former Version 15 label
- Group capture actions; add configurable resource breadcrumbs and deployment-only navigation settings.
- Replace Display switches with independent opacity sliders and unify slider styles across Core, Advanced, and Display.
- Remove particle-based wave masking and fix screen-endpoint initialization.
- Expand Math and Rationale with readable typography and explicit model limitations.
