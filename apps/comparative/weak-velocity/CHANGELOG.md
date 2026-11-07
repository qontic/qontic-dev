# Weak Velocity in the Double Slit — changelog

## 0.5.6 — 2026-11-07
- Velocity and shift error bars use the sample variance of paired differences y_f − Y, including their covariance, accumulated with Welford's algorithm.
- Field-map captions distinguish sampling noise, finite-pointer bias, strip averaging and interpolation; remove the fixed 4 nm error floor.
- Correct the Kocsis comparison: the coupling is weak; commutation with free propagation permits a fixed crystal, not an undisturbing strong measurement. Counts alone do not compare precision across the two apparatuses.
- Clarify that one million runs are collected per pair and shared among strips; each run uses two planes, but no particle is followed through the full map.
- Larger plot labels and legends; plot titles and legend entries wrap instead of truncating.

## 0.5.5 — 2026-11-07
- Physics: the app simulates Wiseman's proposed scheme, not an experiment; why Kocsis et al. needed far fewer particles (about 31,000 photons per exposure, 41 planes): direct momentum readout, and a coupling that can be strong because momentum is conserved in free flight (±28 µm shift against ~1 mm fringes).

## 0.5.4 — 2026-11-07
- Noisy arrows are drawn faint instead of hidden, and stage 2 draws an arrow for any strip with 200 runs (was 2 000); with a short gap or few runs most arrows used to disappear.
- Stage 3: after a setting change clears the map, the caption says to press Start.
- Physics: the error of each arrow grows as 1/gap (a 20 nm gap needs about six times the runs of 50 nm), and line noise is largest where the velocity changes steeply.

## 0.5.3 — 2026-11-07
- Stage 3: a plane pair's arrows appear only when all its runs are in, not while they are being collected.

## 0.5.2 — 2026-11-07
- Overlay label: "j/|ψ|² flow lines (trajectories in pilot-wave)" instead of "(= pilot-wave)", on the drawing, in the key and in the Display tab.

## 0.5.1 — 2026-11-07
Fixes from the second review round (context/2026-11-07-weak-velocity-review-2.md).
- Model: the y_f table uses cell-centred cells that nest inside the strips. Before, a sampled run could cross a strip edge while the exact strip means assigned its cell to one strip; with a 10 nm pointer this gave a small systematic offset (χ²/n 1.2 at 1M runs, 2.2 at 4M). New test (10 tests).
- The y_f − Y view (was Y − y_f) now has the sign of the caption and the velocity plot.
- ?bohm=1 also sets the switch on the drawing.
- Setup card: the mean pointer reading is the quantity; for a wide pointer it tends to the real part of the weak value; whether it tells where the particles were is left to the Rationale.
- Stage-1 caption: "wider than the whole pattern" only from 300 nm; "comparable" from 100 nm; no "where the particle was".
- Default strip 300–320 nm, where the signal is clear (about +12.8 ± 2.6 nm at 1M runs), instead of 100–120 nm (−1.3 ± 0.9 nm).
- Stage-3 caption: the rms offset of the line ends comes with its scale (about 4 nm with infinitely many runs); also given for a strong pointer.
- Caption, Results and plot counts update together; "the only run shown".
- Links: adjusted values (including pointer spread, gap, runs and an unknown stage) are listed with old → new values in the caption until the first run; the slit limits no longer use an unclamped screen length.
- Physics: dark fringes are not zeros in the default geometry (about a fifth of the peak); Kocsis et al. differ in two ways, not three, and did note that their trajectories reproduce Bohm's while stressing that the reconstruction does not depend on an interpretation.
- For instructors: question at +300 nm (not +150 nm, where the slope is −0.009, inside the error); expected answers and links.
- Rationale: the orthodox card ends on "j/|ψ|² is a property of the prepared state"; the Kocsis quote moved to "What is measured"; Bliokh et al. (classical optics) and Vaidman (pre- and post-selection) moved from the orthodox and many-worlds cards to "What the lines do not settle"; many-worlds card speaks of the weights branches will have once a detector records.
- Layout: stage-3 switches wrap on narrow drawings; short labels in the key when narrow; shorter drawing on short screens so the caption shows; distance scale defaults to the bottom right.

## 0.5.0 — 2026-11-07
Changes from a five-reviewer evaluation (context/2026-11-07-weak-velocity-review.md in the Project).
- Captions: the stage-1 text depends on the pointer spread (it no longer says the spread is wider than the pattern at 10–40 nm); "Press Start", "1 run". Stage 2 no longer says the particle "moved": it reports the mean pointer reading, detection minus pointer mean, and that this is a difference of two averages, not a path. One-sigma note when a collection ends; "Repeat these runs" button.
- Post-selection: one instruction (point at or tap the strong plane, or click a plot); a tap selects on phones; clicking a plot in stage 1 no longer switches stage.
- Stage 3: the overlay is "flow lines of j/|ψ|² from ψ (= pilot-wave trajectories)"; lines are clipped to the region between slits and screen; screen equal-probability positions use the whole wave (they used ±500 nm while starts used all the probability); the caption gives the rms offset of the line ends and says agreement checks the measurement, with a link to Rationale; plots and Results name the plane pair.
- Data plot: a Y − y_f button magnifies the signal (mean pointer reading minus detection per strip, with both predictions).
- Labels: "Prediction for this pointer", "Ideal weak pointer, j/|ψ|²", "Measured slope v_y/v_x", with tooltips; stage 1 shows only the run count in Results. Velocity plot range includes the prediction for a strong pointer. Hover labels on a backing; the averaged-density note moved below the pattern; no "points: one run in N" label in stage 1 (stage 1 keeps every run as a point). Legends wrap; shorter plot titles; runs shown as 10k–10M.
- Phones: Start, Reset and Controls in a bar fixed at the bottom of the window.
- Links: runs and show are included; values outside the Advanced-tab limits are adjusted and the app says so (a geometry with no room for two slits falls back to the default).
- Show (density, crests, phase) moved to the Display tab. Distance scale defaults to the top right.
- Physics: finite pointer and gap (bias grows with the gap), real part of the weak value, strip averaging and divergence near nodes, strip width follows the screen, flow-line wording for stage 3, Kocsis et al. as a related measurement with its differences, Bliokh et al. on the Poynting reading, a For instructors section (main point, common mistake, sequence, questions, link parameters).
- Rationale: fuller orthodox reading; pilot-wave reading qualified for a weak pointer and finite gap; many-worlds reading in terms of branch weight, with Vaidman; new "What the lines do not settle" (Englert et al., Mahler et al.); "Why it belongs here" no longer says the data give the pilot-wave lines. Four references added (6–9), checked against Crossref.

## 0.4.4 — 2026-11-07
- The mean pointer reading for a strip is no longer drawn for a fixed strip. Pointing at the strong plane (stages 2 and 3) selects the strip under the pointer, highlights it, and draws its mean pointer reading on the weak plane joined to its mean detected position; the plots and Results follow. Nothing is drawn when the pointer is elsewhere.

## 0.4.3 — 2026-11-07
- Arrows per plane slider runs the same way as Lines: fewest on the left (8), all 40 on the right.

## 0.4.2 — 2026-11-07
- Stage 2: the drawing and the plots follow one schedule. The collection takes about 6 s at speed 1 (longer if the computer cannot keep up), starting slowly so the first points appear one by one, and both end with the last run. The points beside the planes are one run in every N (N = runs per pair ÷ 6 000), so they fill in over the whole collection instead of stopping after the first 6 000 runs.

## 0.4.1 — 2026-11-07
- Density is the default Show mode.
- Stage 3, once mapped: switches on the drawing for measured arrows, lines through the arrows and pilot-wave trajectories (also in Display). The on-canvas key lists only what is shown.
- Advanced › Field map: arrows per plane (40, 20, 13, 10 or 8) and number of lines (4–60; the pilot-wave trajectories start from the same points).
- Runs per pair of planes is a slider: 10 000 to 10 000 000 in 1-2-5 steps.

## 0.4.0 — 2026-11-07
- Show control (Core): density |ψ|², travelling crests (default) or phase as colour, as in the analytical double-slit app; crests and phase move whenever the simulation runs. Too short a wavelength to resolve falls back to the density, with a note.
- The drawing beyond the weak plane now shows the measured wave: in stage 1, the current run's wave ψ(y) φ(Y − y) for its reading; in stage 2, the density averaged over all readings (a mixture: no crests or phase there). Stage 3 shows ψ. In stage 2 the |ψ|² curve beside the screen is the averaged density too.
- weak-model.js: ensembleDensity (pointer-averaged density, exact via an average of momentum kicks). Test: equal to |ψ|² at the weak plane and to the table marginal downstream (9 tests).
- Physics tab: what the measurement does to the wave.

## 0.3.5 — 2026-11-07
- Stage 1: continuous beam instead of one packet per run. The wave is drawn with travelling crests, cos(kx − ωt + arg φ), brightness from |ψ| (each column scaled); runs are events at random times. Falls back to the density when the wavelength is too short to resolve. Physics text updated.

## 0.3.4 — 2026-11-07
- Stage 1: each run's packet (σ = 50 nm, as in the double-slit app) moves from the source through the slits; the pointer moves as it crosses the weak plane and the detection flashes as it reaches the strong plane. Beyond the weak plane the drawn wave is that run's wave, ψ times the pointer factor for its reading. The steady beam stays faint behind. Runs last 2.4 s at speed 1.
- Physics tab: why the velocity field does not depend on time, and when that fails.

## 0.3.3 — 2026-11-07
- Toolbar buttons from the analytical double-slit app: distance scale (hidden by default; drag to move), coordinate grid, and coordinates and distance measurement (click two points; Escape clears). Lengths in nm, x from the slits, y upward. The fixed 100 nm bar is gone.
- Shared template: mountCoordinateTools takes an optional yUp (default false, so other apps are unchanged).

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
