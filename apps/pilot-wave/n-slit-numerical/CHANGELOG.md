# Double Slit · N Slits — Numerical (preview)

Draft copy of the published numerical double-slit app (`apps/pilot-wave/double-slit-webgl/`, unchanged).

## 1.0-dev.3 — 2026-11-19
- Text correction (three-reviewer panel on the N-Slits app): the change ahead of the cut comes from the packet's faster components and from fast waves scattered by a sudden closure; diffraction to wide angles slows the forward motion and leaves wave behind the cut (a check of the reference case put 90% of the change in components faster than the central speed). The part already past is said to change very little, not to be unchanged (0.7%). Packet sigma is the amplitude width; density widths 0.7λ and 1.7λ given.

## 1.0-dev.2 — 2026-11-19
Pablo: slow on his desktop but faster on his phone; triangular histogram outline; glow around the wall at the end; wants a repeat button, on by default.
- **Grid independent of the screen:** the grid was canvas pixels × sim scale, so a large high-resolution display got a physically larger domain (about 4× the cells and twice the distance to travel) than a phone. Now 1120 × sim scale steps wide (560 at the default), height from the canvas shape (0.35–1.6 of the width), picture scaled.
- **Constant time step:** the speed control changed dt on every frame (frame-duration factor), which leapfrog does not tolerate. dt is now fixed; speed sets steps per frame (with a fractional accumulator). Changing the dt slider starts a new run.
- **Glow at the wall:** leapfrog's spurious alternating mode evolves roughly under −H, so the wall (V₀ = 50) traps it. Test in the app's scheme: amplitude inside the solid wall after a run 5.9×10⁻³ (display threshold 10⁻³); a Robert–Asselin filter with ν = 0.01 brings it to 7.5×10⁻⁴ with the free-space wave unchanged. Added to wave_step.
- **Histogram:** the outline is drawn as steps along the bin edges instead of a line through bin centres.
- **Repeat (↻, on by default):** a run ends at 1.6 × (distance from the packet to the detector)/v; a repeat restores the slits as at the start of the run, replays the slit clicks at the same simulation times, and keeps accumulating hits while nothing else changed.

## 1.0-dev.1 — 2026-11-19
- **N slits:** 1–16 slits (Core), slit 1 at the top, one open/closed button per slit. One shared GLSL include (`shaders/slits.glsl`) defines the wall for the wave, particle and barrier shaders. Separation limited so all slits fit in the stage; on a change of N the width is capped at half the separation when the slits would otherwise almost touch. The which-slit detector is kept for exactly two open slits.
- **Shutter:** clicking a slit during a run moves a blade across it over the closing time τ (0 = instantaneous). Reflecting blade: wall potential V0 in the covered part. Absorbing blade: imaginary potential −iW in the covered part; Pilot-Wave particles there are removed with the probability that |ψ|² is absorbed (effective rule). "Wait for packet" starts the blade when the packet centre reaches the wall. Clicks before a run start apply at once.
- First version ramped the potential height in the whole slit instead of moving a blade. Rejected: raising V under the wave pumps energy into it (a slower ramp gave a larger change and up to 37% more probability ahead of the cut in the reference study).
- **Show change:** at the first slit click of a run the app copies the live wave into a reference simulation that keeps the old slits; the picture can show ψ − ψ_ref, and the stats give |δψ|/|ψ| ahead of and behind the cut (the slice that left the wall exit when the shutter started, moving at p/m).
- **Stability fix (also affects the published app):** above 1× speed the app stretched dt by the frame-duration factor (up to 3×); leapfrog with the 5-point Laplacian is unstable above dt ≈ 1/(4ħ/m + V0/ħ) ≈ 0.031, so slow machines got NaN. dt is now capped at 0.9 of that limit.
