# Hydrogen Atom — changelog

## 1.2.8 · 2026-11-18
- The prediction questions moved from the Core tab to a new Quiz tab (next to Simulation and Physics; app-level, the shared template is unchanged). Each question shows a still image of |ψ|² only, without electrons, so the picture cannot give the answer away. After an answer, "Watch it in the simulation" switches to Simulation with that state running.
- Opening the app with ?quiz=1 starts on the Quiz tab and keeps Simulation locked until the first answer. Without it the app opens as before.
- Core tab: the prediction panel is gone; only states and controls remain.

## 1.2.7 · 2026-11-18
- Real orbitals 2p_x, 2p_y, 3d_xz, 3d_yz, 3d_xy, 3d_x²−y² in the existing superposition menu (group "Real orbitals (as drawn in chemistry)"), signed as in chemistry so Lobes colours match textbook pictures. ψ is real, so pilot-wave electrons stand still; the descriptions point to the complex m states, where they circulate. The p_x preset now has the chemistry sign. No new controls.

## 1.2.6 · 2026-11-18
- The Spin term button no longer changes the state on a spin preset or a j-state: it switches only the guidance law (with the spin term, or the convective current Im(Ψ†∇Ψ)/ρ alone), keeps the electrons where they are and restarts their trails. On a plain orbital it works as before. Same single button; the Spin stat reads "Off (spinor kept)" when the spinor stays without the term. Share links carry term=0.

## 1.2.5 · 2026-11-18
Student suggestions that need no new controls:
- Radial nodes of s orbitals visible: brightness ∝ (ρ/ρmax)^0.25 (was 0.42) in Volume, Slices and Projections, and the volume texture stores (ρ/ρmax)^¼ so faint outer shells survive 8 bits.
- Phase view without the global phase e^{−iEt}: real orbitals show fixed colours; superpositions show phase relative to the first component.
- P(r) inset: r ticks and the ⟨r⟩ value.
- Slices: the camera looks at the slice face-on when Slices is chosen or the state changes (xy from +z, x right, y up), so 1s looks round.
- A label "Reading of the display (click to switch)" above the Orthodox/Pilot Wave button.
- Software-graphics banner only with Volume or Lobes; on phones the prediction panel sits under the canvas; stage button says Stop/Start like the sidebar; larger tap targets on phones; darker trails and distinct legend swatches in the light theme.

## 1.2.4 · 2026-11-18
1.3.0 was withdrawn: Pablo found it more confusing than 1.2.3. This release is 1.2.3 plus five small corrections from the student review:
- Verify: the 1s spin r-independence check samples perpendicular to the spin axis (it compared 0 with 0 on the axis).
- Physics § 4: the added current ½∇×S is divergence-free, not the added velocity.
- j-state labels say "(coupled)" instead of "(mixed)"; Electrons note: "In an actual atom, one orbital holds at most two electrons."
- Consistent names: 2p₊₁, 3d₋₁ … (old share links still work), 2p₀ rather than 2p_z, vᵩ = 1/(r sinθ) in the prediction feedback.
- Predictions no longer give away the answer: state text and caption stay neutral until the student answers.

## 1.3.0 · 2026-11-18 (withdrawn)
Response to the five-student review of 1.2.3 (sophomore, QM I, QM II, chemistry, phone/laptop user).

Spin
- Spin state and guidance law are separate. Advanced → Spinor sets the state (product direction or j-state; spin presets) in both readings. Advanced → Spin term chooses the pilot-wave guidance law; toggling it keeps the state and the positions, so the two laws can be compared on the same spinor. Without the spin term the guidance velocity is Im(Ψ†∇Ψ)/ρ.
- In Orthodox the guidance-law and trajectory settings are hidden; the spinor controls stay.
- Physics § 4: the added current ½∇×S is divergence-free (not the added velocity).

Checks
- Verify: the 1s spin r-independence test now samples perpendicular to the spin axis (it compared 0 with 0 on the axis); new checks for real orbitals (v = 0), product spinor without the spin term (v equals the scalar velocity) and continuity with spinors.
- Sweep: continuity for five spinor states with and without the spin term, scaled by the largest single term; v = 0 for all 44 real orbitals. Continuity stencil refined near the 1s cusp.

New displays
- Probability current arrows (Display → Probability current j): j = (ħ/m) Im(ψ*∇ψ) in Orthodox (on by default there), ρv of the guidance law in Pilot wave.
- Real orbitals (p_x, p_y, d_xy, d_xz, d_yz, d_x²−y², seven f's) in a second grid row, signed as in chemistry. The p_x preset now has the same sign.
- Faint-region control (γ, default 0.25) for Volume, Slices and Projections; the volume texture stores (ρ/ρmax)^¼ so outer s shells survive 8 bits; radial nodes of 2s, 3s… now visible. Cutaway toggle for Volume, Lobes and Cloud.
- Phase view without the global phase e^{−iEt}: real orbitals show fixed colours; superpositions show phase relative to the first component.
- P(r) inset with r ticks and the ⟨r⟩ value.

Interface and wording
- Orthodox / Pilot wave as a two-button switch at the top of the controls.
- Predictions no longer give away the answer: state descriptions and captions are neutral until the student answers. On narrow screens the prediction panel sits under the canvas.
- Consistent names: 2p₊₁, 3d₋₁ … (old share links still work), 2p₀ rather than 2p_z, vᵩ = m/(r sinθ) everywhere; "(coupled)" instead of "(mixed)" for j-states; "In an actual atom, one orbital holds at most two electrons."
- Slices view looks at the slice face-on (x right, y up for xy); axes shown by default.
- Software-graphics banner only with Volume or Lobes; stage button says Stop/Start like the sidebar; larger tap targets on phones; darker trails and distinct legend swatches in the light theme; orbital grid highlight clears with presets; spinor states keep their state description; Orthodox says when a state is stationary.

## 1.2.3 · 2026-11-17
- Spin and Trajectory settings are always shown in the Advanced tab; no extra click to expand.

## 1.2.2 · 2026-11-17
- Display settings (opacity, hide low density, point size, axes, P(r), projections) are always shown in the Display tab; no extra click to expand.

## 1.2.1 · 2026-11-17
- Slider and stat renamed from "Atoms" to "Electrons", with a note under the slider: each electron belongs to its own hydrogen atom in the same state, drawn together; they do not interact; a real orbital holds at most two electrons.

## 1.2.0 · 2026-11-17
- Two readings of the display, chosen with the interpretation button next to Reset: Orthodox (|ψ|² only; no dots or trails; Cloud samples are possible position-measurement outcomes and do not move) and Pilot Wave (adds the electrons and their trajectories; default). Switching keeps the clock and the particles.
- In Orthodox the spin-term button and the prediction sequence are hidden or disabled (both concern pilot-wave motion); the caption and legend change with the reading.
- Share links carry the reading (interp=cpn).
- Physics § 1 explains the two readings and why many-worlds is not offered separately (no measurement, no branches; its display would be the orthodox one).

## 1.1.1 · 2026-11-17
- Removed the Views tab. With no measurement in a stationary atom, orthodox quantum mechanics and many-worlds have nothing to draw beyond |ψ|², which the density displays already show; the app is presented as a pilot-wave app. Physics § 1 now says so in two sentences, and notes that the Cloud view (where position measurements would find the electron) is accepted by every view.

## 1.1.0 · 2026-11-17
Response to the three-reviewer evaluation of 2026-11-17 (physicist, instructor, student and orthodox-view reader).

Physics and numerics
- Removed the r < 0.15 a₀ velocity cutoff. It froze any electron that stepped near the nucleus (27 of 2000 stuck in 1s + 2p₀ against about 2 expected). ψ is smooth there; only the density guard remains.
- Cloud sampler rewritten as grid-bounded rejection sampling. The old stratified grid with ±0.75-voxel jitter smeared |ψ|² outward (⟨r⟩ 1.5–2 % high for 1s, radial KS failed). New sampler passes KS for 1s–6s.
- Cloud view now moves its dots along the Pauli–Bohm trajectories when the spin term is on (up to 500 dots, RK4 step 0.12 a.u.); before, nothing moved.
- Leaving a spin preset turns the spin term off again unless the user switched it on.
- Lobes are coloured by the sign of ψ only when ψ is real up to a global phase; complex states get one colour and a legend note.
- j-state list now includes m_j = −j (2p offered 4 of 6 states).
- Grid ⟨r⟩ check flags differences above 2 % (was 5 %).
- Shared particle stepper for trail and cloud modes. Node tests added: tests/hydrogen-physics.test.mjs.

Text and framing
- Physics tab rewritten: what the display shows, why the 1s electron is at rest (quantum potential), the spin term as a choice of guidance law with the same |ψ|² predictions, numerics.
- New Views tab: orthodox, pilot-wave and many-worlds readings of the same |ψ|², and what a measurement can decide.
- Pilot-wave statements in the app's voice now say "in pilot-wave theory".
- References: removed the unpublished "BYU preprint" placeholder and "Tumulka 2004"; added Holland 1999 and 2003, Colijn and Vrscay 2002 (with erratum) and 2003. Spin term no longer credited to Bohm–Schiller–Tiomno. Removed the unsupported optical-pumping sentence.
- Corrected orbital sizes for n = 4–6 (they were about twice too large), the p_x reason (ψ real, not degeneracy), "+0" in kets, ⟨E⟩ label for superpositions, beat periods also in attoseconds.

Interface
- Predict-then-watch sequence (1s → 2p₊₁ → 1s + 2p₀) with feedback.
- Caption strip under the canvas saying what the marks mean; state description moved out of the canvas.
- 12 atoms by default (up to 50), labelled "Atoms"; zoom fitted to each state; slice plane and camera chosen so rings and lobes are not seen edge-on.
- Share link carries state, guidance law, view and camera.
- Version in the footer and this changelog.
- Legend collapses on short screens; Play/Pause under the canvas on narrow screens; Axes, P(r), Projections use the standard toggle style.
- Darker dots and trails in the light theme.
- Software WebGL renders Volume and Lobes at reduced resolution instead of freezing the page.
- "None (pure state)" no longer breaks the info box.
