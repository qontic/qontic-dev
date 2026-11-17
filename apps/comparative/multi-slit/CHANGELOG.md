# Changelog — Which Slit? Many-Slit Interference

## 0.1.0 — 2026-11-17
First draft.
- Exact paraxial wave behind N Gaussian slits (N = 1–15), in units of the slit spacing d and the Talbot length z_T = 2d²/λ; optional Gaussian illumination for unequal weights; slits can be opened and closed.
- Pilot-wave trajectories from the quantile map F_z(y(z)) = F_0(y(0)); each slit's screen band, its weight and its hits; trajectory fan, slit domains and separatrices.
- Orthodox, Pilot Wave and Many Worlds views of one shared record; Many Worlds can sample another branch.
- Story strip with a prediction question (where do the particles of the followed slit land?), a verdict computed from the run, and a "close a distant slit" follow-up.
- Tests: closed form against FFT propagation (Python reference, 1e-14), band boundaries against the reference, quantile map against RK4 integration of the guidance equation, velocity against the phase gradient, the paraxial equation, norm conservation, Monte Carlo band and histogram checks, Talbot revival, remote-slit shift.
