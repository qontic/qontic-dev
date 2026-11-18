# Nanoparticle Interference (Vienna 2026) — changelog

## 0.6.0 (2026-11-18)
- Layout: controls | canvas | plot column, using the full screen width (overrides the shared 4:3 workspace cap for this app only). Plots no longer cover the canvas; each can be minimized to its title bar. Below 1100 px the plots stack under the canvas.
- New plot "Arrivals at G3 (before the mask)": where each cluster that passed G2 lands at the G3 plane, added hit by hit as packets arrive, like a double-slit screen, with the predicted quantum and classical densities (talbot.js: Talbot–Lau coefficients without the G3 factor). The experiment does not record this; the counts plot is the measurement, made by scanning the mask.
- Fix (sim.js): start points are drawn from two neighbouring G1 openings. With one opening, arrivals folded over two periods kept a spurious 2d structure (each cluster's own pattern repeats every 2d). Counts were unaffected, since the mask has period d. New test: arrivals over two periods match the predicted density.

## 0.5.0 (2026-11-18)
Layout: the experiment first (Pablo: larger canvas, intuitive at a glance, results as movable inserts).
- The canvas shows only the interferometer and fills the stage (as in the other apps); |ψ|² and the gratings are labelled with what each grating does.
- Counts behind G3 and the visibility chart are floating windows over the canvas: drag by the title bar, resize from the corner, minimize to the bar; positions remembered; "Reset the plot windows" in Display. On phones they stack below the canvas.
- Setup list moved to the Physics tab ("What the simulation shows"); the story strip keeps one sentence and the prediction question. Canvas captions shortened to one line per view.

## 0.4.0 (2026-11-15)
Counts and animation are one simulation (Pablo: the panels must be coordinated).
- js/sim.js: every count is a cluster drawn with its own speed, mass (same grid and weights as the predictions, weighted by G1 passage) and G1 start point; G2 position uniform, survival |t2|²; position at G3 from the pilot-wave trajectory, from |ψ(x,2L)|² of its own wave (Orthodox, Many Worlds), or from the classical ray (what-if). Contrast factor 0.78 as Gaussian jitter σ ≈ 15 nm at G3. Counted with probability |t3|².
- Overlapping packets, number in flight adjustable (Advanced, 1–12, default 5; 1 = one at a time); 60 clusters each, 20 per G3 position by default: 21,600 clusters, ~6,000 counted per scan). Points fill as packets arrive; partial points hollow. "Packets per position" replaces "Counts per point".
- Many Worlds "Sample another branch" re-simulates the full record.
- Display defaults to the sum over G1 points, since the clusters come from all of G1.
- tests/sim.test.mjs: simulated clusters reproduce the predicted visibilities (sampled 0.107 ± 0.004 vs 0.105 in a long run; pilot-wave and classical within errors).

## 0.3.0 (2026-11-15)
The moving packet, as in the analytical double-slit app.
- Ψ(x, z, t) = F(z − vt) ψ(x, z): a longitudinal envelope travels G1 → G3 and lights the stationary transverse pattern, dimmed behind G2 by the fraction G2 removes; faint trace of the full pattern (Display). Packet length and transit time exaggerated (real: ≈ 0.2 pm, ≈ 12 ms), stated in Physics.
- Pilot Wave: particles ride inside the packet (positions from |F|²|ψ|²), Clusters per packet in Advanced.
- Orthodox and Many Worlds: outcomes drawn from |ψ|² as the packet reaches G2 and G3 (× ionised, • counted); Many Worlds highlights the followed branch.

## 0.2.0 (2026-11-15)
The wave and the three interpretations.
- New top panel: |ψ|² inside the interferometer, from the exact paraxial wave (js/wave.js). Each cluster leaves G1 as a point-source wave (coherence width ≈ 0.05 nm ≪ d); behind G2 the wave is a closed-form sum over virtual sources at x0 − nλL/d weighted by G2's Fourier coefficients. Option: incoherent sum over all G1 points. Replaces the cartoon beamline.
- Interpretation selector (Orthodox / Pilot Wave / Many Worlds), following the analytical double-slit app: same wave and counts in all three. Pilot Wave draws guided trajectories (dx/dz = Im(∂ψ/ψ)/k, RK4) with effective survival |t|² at G2 and G3; Many Worlds adds "Sample another branch".
- Tests (tests/wave.test.mjs): the explicit wave reproduces the Talbot–Lau count rate of the paper to < 0.2% (172 kDa, 1 MDa at 25 m/s, 50 kDa); guidance equals the numerical phase gradient; trajectory positions at G3 match |ψ|² bin by bin.
- Physics: sections on the wave of one cluster and on pilot-wave trajectories. Rationale: "Three views of the same wave" replaces "A question for later".

## 0.1.0 (2026-11-15)
First draft, the first app of a new Experiments section.
- Talbot–Lau interferometer with three optical depletion gratings, following Pedalino et al., Nature 649, 866 (2026) (arXiv:2507.21211v1, Eqs. 1–9): quantum and classical (moiré) predictions, averaged over speed and the mass window.
- Parameters from the paper's Methods. The laser waist w_y in Eqs. 3–4 is taken as the vertical beam height of each grating (620/575/575 µm); this reproduces the measured V ≈ 0.10 at the Fig. 2a settings (app: 0.106 quantum, 0.028 classical, with the paper's 0.78 factor).
- Simulated G3 scan with Poisson counts, sine fit, χ² comparison with both predictions, and a prediction question.
- Charts: visibility vs G2 power (with the paper's two measured points at the Fig. 2a settings) and vs cluster mass.
- Tests: tests/talbot.test.mjs checks the engine against an independent Python implementation.
