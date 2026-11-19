# Double Slit · N Slits — Numerical (preview)

Draft copy of the published numerical double-slit app (`apps/pilot-wave/double-slit-webgl/`, unchanged).

## 1.0-dev.1 — 2026-11-19
- **N slits:** 1–16 slits (Core), slit 1 at the top, one open/closed button per slit. One shared GLSL include (`shaders/slits.glsl`) defines the wall for the wave, particle and barrier shaders. Separation limited so all slits fit in the stage; on a change of N the width is capped at half the separation when the slits would otherwise almost touch. The which-slit detector is kept for exactly two open slits.
- **Shutter:** clicking a slit during a run moves a blade across it over the closing time τ (0 = instantaneous). Reflecting blade: wall potential V0 in the covered part. Absorbing blade: imaginary potential −iW in the covered part; Pilot-Wave particles there are removed with the probability that |ψ|² is absorbed (effective rule). "Wait for packet" starts the blade when the packet centre reaches the wall. Clicks before a run start apply at once.
- First version ramped the potential height in the whole slit instead of moving a blade. Rejected: raising V under the wave pumps energy into it (a slower ramp gave a larger change and up to 37% more probability ahead of the cut in the reference study).
- **Show change:** at the first slit click of a run the app copies the live wave into a reference simulation that keeps the old slits; the picture can show ψ − ψ_ref, and the stats give |δψ|/|ψ| ahead of and behind the cut (the slice that left the wall exit when the shutter started, moving at p/m).
- **Stability fix (also affects the published app):** above 1× speed the app stretched dt by the frame-duration factor (up to 3×); leapfrog with the 5-point Laplacian is unstable above dt ≈ 1/(4ħ/m + V0/ħ) ≈ 0.031, so slow machines got NaN. dt is now capped at 0.9 of that limit.
