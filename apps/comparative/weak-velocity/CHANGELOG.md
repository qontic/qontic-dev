# Weak Velocity in the Double Slit — changelog

## 0.3.2 — 2026-11-07
- Geometry handles appear only in edit mode, as in the analytical double-slit app: the pencil button in the toolbar (or right-click on the drawing) turns it on; Escape or the button again turns it off. The splitter between drawing and plots is unchanged.

## 0.3.1 — 2026-11-06
- Drag the geometry on the drawing, as in the analytical double-slit app: the screen sideways (slits-to-screen distance) or its end squares (screen length); a slit's circle up or down (separation) or its edge square (slit width); the weak or strong plane sideways (stages 1 and 2). A label shows the value while dragging, and the drawing keeps its scale until release so the screen follows the pointer. The same limits apply (a wider slit can lower the largest allowed separation), and the experiment starts again on release.

## 0.3.0 — 2026-11-06
- Advanced tab: geometry and beam (wavelength, slit width, slit separation, source-to-slits distance, slits-to-screen distance, screen length, source width), with the analytical double-slit app's ranges and limits (λ ≤ 50 nm; opening and separation limits from the screen length via maximumCoreSafeSeparation). Slits-to-screen starts at 200 nm here so the 12 plane pairs fit. Default geometry button; geometry in share links.
- Strips, axes, scale bar, pointer scale and stage-3 planes scale with the geometry.
- Test: the wave equals the double-slit app's wave for two other geometries (8 tests).

## 0.2.5 — 2026-11-06
- Display › Measured arrows switches the arrows off, and stage 3 offers "Hide the arrows" once the lines are drawn.
- Pilot-wave trajectories drawn in violet, dashed and on top of the measured lines; a key on the drawing names both.
- Stage 3 lines: 20 starting points (was 21; the middle one fell between the slit packets, where no velocity is measured), and starts without a measured velocity are dropped, so every pilot-wave trajectory has a measured partner.

## 0.2.4 — 2026-11-06
- Stage 2 starts slowly and accelerates while the points beside the planes fill in (about 2 s at speed 1), so the hits appear in sequence instead of all at once.

## 0.2.3 — 2026-11-06
- Runs beside the planes are drawn as points again (one per run, first 6 000 runs kept), instead of the 4 nm bars of 0.1.4. A note gives the count when more runs were taken.

## 0.2.2 — 2026-11-06
- Default split: drawing 2/3, plots 1/3. Both plots open by default; earlier remembered widths and open/minimized states are discarded once.

## 0.2.1 — 2026-11-06
- The two plots now sit in a column to the right of the drawing, outside it, instead of floating over it. A splitter between drawing and column sets the column width (drag, or arrow keys; Display › Reset plot width). Each plot can be minimized or closed; with both closed, the column disappears and the drawing takes its space. Width and open/minimized state are remembered per browser.

## 0.2.0 — 2026-11-06
- Full window width: the app lifts the shared 4:3 width cap; the canvas fills the height of the window.
- The data plot and the velocity plot are floating panels over the canvas: drag by the title bar, resize from the corner, minimize (–) or close (×). Closed plots reopen from buttons on the canvas or Display › Data plot / Velocity plot. Positions are remembered per browser; Display › Reset plot positions. Panels parked at the right edge reserve that strip, so the drawing is not covered; moved panels float over it.
- Phone: the two plots stack below the canvas.
- Screenshots and video include the open plots.

## 0.1.4 — 2026-11-06
- All runs accumulate beside the planes (4 nm cells): pointer readings left of the weak plane, detections between the planes. Replaces the last-1 500 dots. Toggle: Display › Accumulated runs on the planes (on by default).

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
