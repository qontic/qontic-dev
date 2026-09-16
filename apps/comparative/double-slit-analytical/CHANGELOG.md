# Analytical Double Slit releases

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
