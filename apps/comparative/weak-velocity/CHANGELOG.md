# Weak Velocity in the Double Slit — changelog

## 0.11.0 — 2026-11-27
- Two methods, not four stages (Pablo, option B). A Method switch, "Planes | Windows" (Standard and up), sits above the steps; the steps read the same for both: 1 · One run, 2 · Many runs, 3 · Map the field. Basic shows planes only. Changing method keeps the step.
  - Windows, step 1 (new): single runs, each at two instants chosen at random. The weak reading (both coordinates, dashed ring of one σₚ) appears at t₁, then the detection at t₂, with both times in ps and dotted lines marking the distance behind the slits at each instant. Pause after each run applies. A reading beyond the drawing is shown at its edge.
  - Windows, step 2: the former stage 4: collect 20 million runs, point anywhere, trace back.
  - Windows, step 3: arrows from windows on a grid and lines traced back from the screen. It uses the runs from step 2 when the settings are unchanged; Start or Reset collects a fresh sample.
  - Links: `stage=wone|window|wmap`, or `method=windows`. `stage=window` still works.
  - The gap control reads "Travel from t₁ to t₂" for Windows. The caption, Results, plot titles and Next buttons follow the step.
- Physics, instructor notes, levels and link descriptions now speak of the two methods instead of stage 4.

## 0.10.0 — 2026-11-27
- Removed "Measure at: Instants" (Pablo). Stages 1–3 use planes, as in the Kocsis experiment. Wiseman's protocol, with runs at random times, the full position recorded and post-selection on any region of strong results, is stage 4, Windows. The Instants stage 2 was a roundabout slice of it: one packet time, one of 13 positions kept, about 80% of runs discarded. Transverse-only was neither experiment.
  - Removed from the interface: the Planes/Instants switch, packet length, the position-along-the-beam switch and Δ slider, the fixed-time curve option and its Results row, "Runs at this Δ".
  - The code and model functions stay (unused), and the 24 tests still run them.
  - The Windows stage always uses the timing language (t₁, t₂ = t₁ + τ, times in ps).
  - A link with `timing=instant` opens with planes and says why.
- Physics: "A plane or an instant?" became "Planes, and measuring at times", a short paragraph. The Instants instructor question, the link parameters timing / packet / recx / ft, and the level descriptions were updated.

## 0.9.9 — 2026-11-27
- Instants with the position recorded (Pablo): one position's arrows at a time. Many runs had drawn all 13 positions' columns across the packet box. Map the field had shown all 13 while a pair ran and kept only the centre one when it finished, so arrows seemed to come from other times and then vanish.
  - Many runs: the selected position (Δ = 0 by default) gives one column at its own place along the beam. The ticks mark the others; pointing or the Δ slider chooses which.
  - Map the field: the central position, live and when finished.
- Caption and Physics updated to match.

## 0.9.8 — 2026-11-27
- Instants (Pablo): the position along the beam is now recorded by default, as in Wiseman's protocol. Each of the 13 positions in the packet is its own weak–strong pair, with its own column of arrows at its true place along the beam. Before, the default used the transverse position only, so the arrows averaged over the packet and were drawn at its centre by convention while the points were scattered.
- Switching to Instants raises the runs to 10 million, because each position gets a fifth to a thirteenth of them.
- The position selector (Δ) and "Runs at this Δ" are now at Standard.
- Transverse-only is now the Expert option "Drop the position along the beam (shows the averaging)"; turning it on also shows the dotted fixed-time curve. Instants no longer switches on that curve by itself.
- Links: `recx=0` drops the position; `recx=1` is no longer needed.
- Physics and instructor question rewritten: Kocsis used planes and Wiseman the full position, so transverse-only is a contrast, not either experiment.

## 0.9.7 — 2026-11-27
- Instants (Pablo): the two controls are now times. "Weak at t₁" shows 34.4 ps and "Strong, τ later" shows 3.44 ps, for an electron with the chosen λ; they read "Packet centre at t₁ 500 nm" and "Travel from t₁ to t₂ 50 nm" before. The distances are in the hover text and the screen-reader text. At Planes they stay distances.

## 0.9.6 — 2026-11-27
- Map the field (Pablo): on a second run the arrows were missing because the "Measured arrows" switch was off. The switch at the top of the drawing showed only once a map was finished and hid as soon as the next run started, so a click on it after the first map went unseen. Nothing in the code turns it off by itself; checked with mouse clicks on Start and with the Space bar.
  - The display switches now show for the whole of stage 3, including during a run.
  - In stages 2–4 the caption says "Measured arrows are switched off (switch on the drawing, or Display)" whenever they are.
  - In stage 3 the plane labels and the off-scale count sit below the switches.

## 0.9.5 — 2026-11-27
- Bug (Pablo): on a second Map the field run, the pair being measured showed no arrows. Since 0.9.3 its arrows run between the weak and strong planes, where its stored pointer readings and detections are drawn, and the points were drawn on top. The first run looked fine only because the finished map has no points. The pair being measured now has its arrows drawn after its points, in stages 2 and 3. Finished pairs are drawn as before.

## 0.9.4 — 2026-11-27
- Map the field (Pablo): the current plane pair's arrows are shown while its runs come in, as in Many runs; noisy ones are faint. This reverses the 0.4 choice of drawing a pair's arrows only when it was complete. Each pair now takes about 1.2 s at speed 1, starting slowly so the arrows can be seen building up. A full map takes about 15 s instead of about 5 s; the speed control shortens it.

## 0.9.3 — 2026-11-27
- Arrows (Pablo): in stages 2 and 3 each arrow is now the measured vector itself. It runs from the strip's mean pointer reading at the weak position to its mean detected position at the strong position, as in the Windows stage. Before, it started at the strong position with a fixed length. Where the gap is too short on screen, the tail is extended back along the same direction (at least 12 px), so the head stays on the strong position. The Windows end-of-run grid arrows follow the same rule. Physics text says so.

## 0.9.2 — 2026-11-27
- Planes (Xavier Oriols, 16 Nov): the lines are labelled as position measurements across the whole plane, "weak plane: pointer coupled at any y" and "strong plane: y measured, any value", not detection at one point. Short labels on a narrow drawing and in the map.
- Flow-line overlay (this app): the key gives all three readings ("pilot-wave: the particles' trajectories · orthodox, many-worlds: lines of probability flow"). The lines are drawn light grey (dark grey in the light theme) with a dark casing instead of pink, which a red-green colour-blind viewer could not tell from the blue prediction. The button label is unchanged.
- Drawing scale: the status line says when the drawing is stretched and by how much ("drawing stretched ×1.4 across the beam (slopes in the numbers are true)"). Display → "Equal scales (true arrow angles)" (Standard and up) draws 1 nm the same length both ways; pointing and dragging still work.
- Kocsis et al.: two statements that could not be checked against the paper were removed: "41 planes" (now "a series of imaging planes", as in the abstract) and the attribution of trajectory bunching to measurement noise.
- Basic: the stage-2 caption explains the slope v_y/v_x and j/|ψ|² in one sentence each.
- Short screens (projector at 1024 × 576): the plots start closed unless a layout was saved, so the drawing takes the width; they reopen from the drawing or Display.
- The off-scale count at the bottom no longer overlaps the status line.

## 0.9.1 — 2026-11-22 (ten-student review of 0.9.0)
- Bug: at Basic, "Next: windows over the field" opened stage 4 while the level stayed Basic (no stage button lit). It now reads "(opens Standard)" and switches the level. Next-step buttons are rebuilt with each run, so a finished run's buttons no longer stay up after a restart.
- Bug: the window's effective area jumped by up to 19% when it moved by 1 nm. Cells were counted by their centres on a 2 nm grid. Edge cells now count by the fraction inside, across the beam and along it. The default window's prediction at (550, 50) nm is −0.360 (was −0.362).
- Bug: moving the window announced the caption at every step to screen readers. It is now silent while moving and announced once when it stops. The canvas has role="img" and a stage-aware label. The plot Key buttons are named "Legend of the data/velocity plot". The runs slider's text follows the stage.
- Speed: a 20M Windows run took about 54 s (since 0.7.3); it now takes about 20 s. Redraws are about 6 per second during the run and sampling gets 40 ms per frame. The status line shows the % of runs done.
- Wording:
  - Window sliders: "Window centre, along / across" and "Window size, length / width". The size sliders are now at Standard, since the text there explains why the shape matters.
  - "Circle" became "window" or "outline".
  - The trace is "a chain of windows, not a path: each dot uses different runs and no particle is followed", both on the drawing and at the start of its caption sentence; steps are "about one gap".
  - Instants: "detector click at t₂"; the dotted curve is mentioned only when shown.
  - Pointer hint: the predictions separate below about 50 nm.
- Text:
  - Rationale: Wiseman's own position (the operational velocity as the natural definition, giving the standard guidance law for deterministic motion), before the Dürr–Goldstein–Zanghì reply.
  - Physics: j in Griffiths' notation; stage 4's reading along the beam is modelled as noise with no back-action; why the wave is drawn beyond the strong plane.
  - Instructor sequence says which level each step needs.
- Layout: the Results columns no longer squeeze labels to one word per line. The window has a dark casing. On phones the arrow is thicker and the "mean weak" label is left out. The off-scale label sits below the map switches.

## 0.9.0 — 2026-11-22
- N slits: Advanced → Number of slits, 1–8 (Standard level and up; default 2). They are equal Gaussian slits, equally spaced, the same model as the analytical N-slit app. The Gaussian-sum model already took any number of apertures, so it stays exact. The separation limit keeps the outermost slits on the screen. Dragging an outer slit sets the spacing (slit i sits at (i − (N−1)/2) × separation); a middle slit has no handle. Link parameter `slits`.
- Checked:
  - 3 slits: map lines end 4.9 nm (rms) from the j/|ψ|² flow lines (500k runs per pair).
  - 1 slit: −0.080 ± 0.014 measured against −0.078 predicted.
  - 8 slits: the separation is limited to 100 nm.
  - New test (24): probability is conserved and the weak limit equals j/|ψ|² for 1, 3 and 8 slits.

## 0.8.1 — 2026-11-22
- Changing the pointer spread (or the weak plane, gap or packet length) after a run cleared the arrows. That was by design: a new setting is a new experiment. But it was easy to miss that Start was needed again. Now the new runs start when the slider is released, if there were results to replace (stages 2–4; stage 1 stays manual).
- Display: "Moving wave (travelling crests)", at every level. Crests keep moving between runs. The density of a steady beam does not move; the crests (the phase) do. Turning it on from the density view switches to crests; turning it off switches back.
- The "density averaged over pointer readings" note moved up so it no longer overlaps the off-scale count.

## 0.8.0 — 2026-11-22
- Levels: Basic · Standard · Expert (switch above Start). First-time visitors start at Basic.
  - Basic: stages 1–3, pointer spread, pause after each run, the two predictions and both plots. Tabs Core and Display; five Results rows.
  - Standard adds the Windows stage, Measure at (planes or instants), packet length, weak plane, gap, runs, the strip slider, the Advanced tab (geometry), Edit geometry, wave display modes, accumulated runs, times and the full Results.
  - Expert adds recording the position along the beam, window length and width, the fixed-time curve, arrows per plane and lines, and the y_f − Y view.
  - A setting the level hides takes its default value; the user's value comes back with the level. Links carry `level`. A link that uses Standard or Expert settings opens at that level.
- Each plot has a Key button that shows or hides its legend (remembered).
- Uses the new shared helper `shared/qontic-levels.js` (template docs: "Optional levels of detail").

## 0.7.3 — 2026-11-22
- Stage 4: the window is an ellipse with its own length along the beam and width across (sliders "Window length (along)", 20–200 nm, and "Window width (across)", 4–100 nm; equal values give a circle). The default is 100 × 10 nm instead of a circle 50 nm across. The window decides which runs are averaged, so its shape changes the result. Across the beam the velocity changes fast near the fringes; along the beam it changes slowly. At (550, 50) nm, where j/|ψ|² is −0.372, the prediction is −0.362 for the ellipse and −0.249 for the old circle. With 20M runs the end-of-run lines now end 3–4 nm (rms) from the j/|ψ|² flow lines instead of 16 nm. The transverse grid of strong positions is 2 nm (was 5 nm). The weak-readings panel samples up to 400k runs.
- Model: windowQuery(field, acc, xc, yc, rx, ry). New test (23): in a steep region the long narrow window follows j/|ψ|² within 0.02, and the 50 nm circle misses by more than 0.08.
- Physics and instructor question updated. Link parameters winl, winw (winr still gives a circle).

## 0.7.2 — 2026-11-22
- Legend button (template header) shows or hides the explanatory labels in the drawing: what the two boxes are, the off-scale counts and the trace description. Data labels (times, readings, window counts) stay. The choice is remembered.
- Instants: the full-height lines at the packet centre (dashed amber at t₁, solid cyan at t₂) read as a boundary between the two boxes. Nothing happens on those lines at instants, so they are now short ticks at the top and bottom edges. The arrows are still drawn at the packet centre at t₂, by convention. Planes are unchanged: there the lines are the detectors.

## 0.7.1 — 2026-11-22
- Pointer readings beyond the drawing (about one in eight with a 200 nm pointer) were silently left out of the drawing. They are now counted and marked at the top and bottom edges ("6% of readings above the drawing"), in stage 2 at planes and at instants and for the window's cloud in stage 4. They always entered the averages.
- Stage 4: when the run finishes, the field is drawn as in stage 3. Arrows come from windows on a grid. Lines are traced back from windows next to the screen, started at equal shares of the runs detected there. Optional dashed j/|ψ|² flow lines are followed backward from the same windows. The same three switches as stage 3 apply, and the Lines slider sets the number of lines. The caption gives the rms difference at the line ends (16 nm at the defaults), mostly from window averaging.
- Instants: the frame labels say what the boxes are ("dashed box: the packet at t₁ — the particle is somewhere inside when the pointer is coupled"; "solid box: the packet at t₂, 50 nm further on — where it is when its position is measured").
- Physics, model assumptions: why only the transverse position is measured in stages 1–3 (v_x = ħk/m is the same everywhere in the paraxial model), and the note on off-scale readings.

## 0.7.0 — 2026-11-21
- New stage 4, Windows. Runs at all times fill the whole field: each run is one packet, measured weakly at a random instant t₁ (the pointer reads both coordinates) and strongly at t₂ = t₁ + τ (full position). Point anywhere: a window (disc) of strong results, the weak readings of the runs that ended in it (amber cloud, a sample), their mean, and the arrow from the mean weak position to the mean strong position, with its slope ± error beside the exact prediction for that window and pointer. Click to trace back: the mean weak position becomes the next window, one gap at a time, to the slits (Anssi Kuha's construction), compared with the j/|ψ|² flow line followed backward from the same window. Plots: the weak readings in the window; the slope across the field at the window's x. Controls: window radius (10–60 nm), centre along and across, trace button. 20 million runs by default (about 15 s); runs slider now goes to 50 million. Link parameters stage=window, winx, winy, winr.
- Model: windowPlanes / windowField / sampleWindowRun / addWindowRun / windowQuery. In this model a run at x₁ is a run at the planes (x₁, x₁ + gap), so the field is a stack of exact joint tables 10 nm apart. Two new tests (22): a small window with a wide pointer gives j/|ψ|² at its centre; sampled windows match their predictions (χ²).
- Times: at instants, t₁ and t₂ are shown in picoseconds (frame labels, stage-1 status line, Results) for an electron with the chosen wavelength (v = h/mλ); the defaults give t₁ = 34.4 ps, t₂ = 37.8 ps, τ = 3.44 ps. The app has no mass otherwise; Physics says so.
- Physics: new section "Stage 4: windows over the field", including why a trace and the flow line differ (mostly the window's averaging: 2–20 nm at 25 nm, within about 8 nm at 10 nm, with exact averages). New instructor question on window size.

## 0.6.6 — 2026-11-21
- Instants: the two measurements no longer look simultaneous. Before, the weak coupling and the detection fired about 70 ms apart in stage 1 (the packet crossed the 50 nm gap at its drawing speed). Now the packet stops with its centre at the weak position (t₁, amber frame flashes), creeps the gap over about a second (labelled "slowed down"), and stops at the strong position (t₂, detection). Stages 2–3: the train slows to about 2 s across the gap, the flashes are narrower and stronger, and a status line reads t₁ / between / t₂ from the packet nearest the gap. Physics text says why the real-speed version would look simultaneous.

## 0.6.5 — 2026-11-21
- Instants, drawing matches the physics: the pointer marker and the detection are drawn at the particle's position in the packet (Δ), 50 nm apart, instead of on the packet-centre lines; with the position along the beam recorded, the stored pointer samples are drawn at their own positions (selected cell bright) and thirteen ticks mark the cells. Frames widened to ±3σₓ, the range runs are drawn from (and the range used for pointing). Labels "packet centre at t₁/t₂"; the weak frame says the coupling acts on the whole packet. Pointer label kept inside the plot.
- Stage-2 caption at instants leads with one plain sentence on what the arrow is. Results: "Runs (packets)" at instants; "Ideal weak pointer at Δ = …" when a cell is selected (it no longer changes value under an unchanged label).
- Turning on "Record the position along the beam too" raises the runs to 10 million (each position gets a thirteenth to a fifth of them) and says so; a shared link with recx=1 does the same unless it gives runs.
- Physics text: the app records the position along the beam at t₂ and infers it at t₁ from the forward speed (the packet translates rigidly). Stale wording removed ("shaded bands", "screen click").

## 0.6.4 — 2026-11-21
- Stage 1: "Pause after each run" (on by default). The simulation stops after each run with its pointer reading and detection drawn large and labelled, and the caption states both numbers; Start begins the next run, and the held markers shrink into the small stored points. Labels on a dark backing (cyan on the bright wave was hard to read); off-scale pointer label kept clear of the status line.

## 0.6.3 — 2026-11-21
- Instants with the position along the beam recorded: runs are sorted by their position Δ in the packet (thirteen cells). Each cell is its own pair of weak and strong positions, a gap apart, so one fixed-time experiment gives arrows at thirteen positions along the beam (faint), with the selected one bright. Pointing inside the strong frame chooses Δ and the strip; a "Position along the beam Δ" slider does the same from the keyboard. The selection draws the mean pointer reading at that cell's weak position joined to the mean detection at its strong position; plots, Results and predictions follow the cell (Δ = 0 gives the planes). New Results row "Runs at Δ".
- Instants, transverse position only: the selected strip's mean pointer reading is drawn as a bar across the dashed frame (the weak position is not recorded), and the arrow is said to be placed at the packet centre by convention.

## 0.6.2 — 2026-11-21
- Instants: the packet's extent at t₁ and t₂ (±2σₓ) is drawn as outlined frames (dashed amber, solid cyan) with labels, instead of filled bands whose overlap read as a third, green region.
- Instants, stages 2–3: while running, a slowed, representative train of packets moves through; each flashes amber as its centre passes the weak position (t₁) and cyan at the strong one (t₂), and the train slows near the measurements. Shown for timing only; the caption says one packet is drawn for many runs.

## 0.6.1 — 2026-11-21
Fixes from the ten-student review (context/2026-11-21-weak-velocity-ten-student-review.md).
- Model: the Instants mixture and the fixed-time curve use the same rule — an offset counts only if its weak position is behind the slit wall and its strong position is not past the screen (they disagreed by 22% at the first map pair, and runs could be measured beyond the screen). New test (20 tests); weak-limit tolerance tightened to 1%.
- Instants framing: recording the position along the beam too is Wiseman's protocol and gives the planes' field; transverse-only drops a coordinate. Toggle renamed "Record the position along the beam too (Wiseman)". Without it, detections are drawn at positions sampled from the packet for display, and the captions say they are not recorded.
- Instants labels: "Packet centre at t₁", "Travel from t₁ to t₂", "Runs (one packet each)", "Packet centre at t₁ → t₂", "Prediction, pointer + packet"; caption divides by v_xΔt; σₚ (pointer) and σₓ (packet).
- Instants defaults: Packet length σₓ under the switch, default 150 nm; the dotted fixed-time curve turns on with Instants; one caption sentence says the prediction changed and why. New Results row "Fixed time, transverse only".
- Physics: "In brief" summary at the top; corrected planes-vs-instants numbers (default planes 5% / 26%; middle ten map pairs 2–9% / 9–40%; up to 32% / 55% at the two ends); the central cell treated as zero offset (a real cut would differ by 0.1–2%).
- Default strip 40–60 nm (slope −0.34 ± 0.035 at 1M runs, inward); instructor question moved there with expected ranges; new Instants question; link parameters timing, packet, recx, ft.
- Bugs: the longitudinal toggle no longer shows in Planes mode; the stage-1 caption no longer says "Press Start" during the first run; the status line moved above the key.
- Colours: the prediction curve is blue (amber and green merged under deuteranopia); legends name the marks; short legends on small plots.
- Accessibility: caption and Results silent during runs, announced at the end; focus moves to the reopen button when a plot is closed and back when reopened; sliders announce units; the canvas label points to the keyboard alternatives.
- Phones: the bottom run bar hides while the control panel is on screen; vertical swipes over sliders scroll the page; taller sliders on touch screens.

## 0.6.0 — 2026-11-21
New mode: Measure at planes or at instants (Wiseman's timing).
- Core: "Measure at: Planes / Instants". At instants each run is one packet; the particle's longitudinal offset is drawn from |F|², and since F only translates the run is a run at a shifted plane pair. Exact predictions are mixtures over thirteen offset cells across ±3σ (model: packetSlices, mixtureTable, sampleMixtureRun, expectedMixtureBinVelocities, mixtureCurves; test: central cell = planes, short packet = planes, weak limit = packet-averaged j/|ψ|², sampled strip means χ²/n < 1.5; 19 tests).
- Drawing at instants: bands (±2σ) around the packet centre at t₁ and t₂; detections drawn where the particle was along its packet; in stage 1 the packet moves through and slows between the two measurements.
- "Post-select on longitudinal position too": only runs within ±3σ/13 of the packet centre enter the averages; the result returns to that of the planes, and about 80% of runs are discarded (for any σ).
- Advanced: Packet length σ, 50–300 nm (also sets the fixed-time curve). Link parameters timing=instant, packet, recx=1.
- Physics: the mode described in "A plane or an instant?"; Wiseman's definition stated (weak at t, strong a short time τ later, τ → 0; checked against arXiv:0706.2522).

## 0.5.8 — 2026-11-21
Prompted by X. Oriols's question whether the lines are detections at one position or measurements of position.
- Points beside the planes are drawn in a narrow band just beside each line (they were spread across the gap, which suggested an uncertainty along x); the caption says only transverse positions are recorded.
- Physics: new section "A plane or an instant?": each line is a detector across the whole transverse range at a fixed distance, as in Kocsis et al.; Wiseman's protocol is at fixed times; the two agree when the longitudinal position is recorded or the packet is short; with the 50 nm packet, using only the transverse position at a fixed time changes slopes by up to about 5–9% (25–35% for 150 nm).
- Display option "Fixed-time measurement, transverse position only": a dotted prediction curve (weak limit) in the velocity and shift plots; link parameter ft=1. Model function packetAveragedVelocity with a test (18 tests).

## 0.5.7 — 2026-11-07
- Conditional pointer grids follow the Gaussian envelopes at each detected position, including valid readings outside the detector window. Output resolution and strip count adapt to pointer spread and screen size.
- Field maps use fine detected-position histograms for starts and compare against exact flow lines from those same coordinates. Captions count completed lines; open endpoints mark missing data.
- Changing the gap clamps and synchronizes the measurement planes. Noisy plot estimates remain visible with overflow indicators.
- Prediction switches also hide numerical predictions in Results, and shared links retain hidden-prediction settings. Instructor answers are collapsed by default, with a short student-tryout guide.
- Add a keyboard-accessible strip selector; correct slider value announcements, collapse/restore names and reference navigation. Canvas exports retain stage/pointer/gap context.
- Clarify pointer preparation spread, slope units, sampling, physical scope of sharp pointers, and the ideal weak limit. Correct the central-strip sample-count estimate.

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
