# Hydrogen Atom — changelog

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
