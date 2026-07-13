# DiracPacketSplitting2D

A WebGL2 visualization of free 2D Dirac-wave-packet splitting, adapted from the
visual style of the supplied Klein-tunneling project.

The physics is the free two-component Dirac equation in two space dimensions:

```text
i hbar d_t psi =
[c (sigma_x p_x + sigma_y p_y) + m c^2 sigma_z] psi.
```

The default **1D paper mode** uses a Gaussian along `x`, is exactly uniform in
`y`, fixes `ky = 0`, and guides particles only longitudinally. This reproduces
the paper's one-dimensional experiment inside the 2D renderer. Paper mode can
be turned off to use a localized 2D Gaussian and arbitrary mean-momentum angle.

The initial fixed spinor is controlled by the paper angles `theta0` and
`omega0`. In the Pauli representation used by the solver its Bloch components
are

```text
n_parallel = cos(theta0)
n_perp     = sin(theta0) sin(omega0)
n_beta     = sin(theta0) cos(omega0)
```

The built-in paper preset uses natural units (`hbar = c = 1`) with `m = 3`,
`k0 = 10`, `sigma = 1`, `theta0 = 90 deg`, and `omega0 = 0 deg`.
Paper mode uses the article's amplitude convention
`exp(-x^2 / (4 sigma^2))`, so `sigma` is the standard deviation of the
initial position density. The localized 2D extension retains the applet's
original `exp(-r^2 / (2 sigma^2))` envelope.

For a narrow packet around `k0`, the two components have approximately

```text
E+ = +sqrt((m c^2)^2 + (hbar c |k0|)^2)
E- = -sqrt((m c^2)^2 + (hbar c |k0|)^2)

v+ ~= +hbar c^2 k0 / E0
v- ~= -hbar c^2 k0 / E0
```

so they separate in opposite directions even though their mean momenta are
approximately the same. This is the 2D analogue implemented here of the
splitting mechanism analyzed in the supplied 1D paper.

## Numerical method

- Exact free Dirac evolution in 2D Fourier space for each time step.
- No scalar potential and no absorber.
- Periodic FFT boundary conditions.
- Full-2D Bohmian particles use the periodic 2D Dirac guidance field

```text
rho = psi^dagger psi
j = c psi^dagger (sigma_x, sigma_y) psi
rdot = j / rho
```

  Paper mode instead uses the longitudinal projection `xdot = jx / rho` and
  holds `y` fixed, as required by the one-dimensional experiment.

- Particle positions wrap on the torus instead of dying at the edges.
- Velocity interpolation also wraps periodically across grid seams.

## Bohm/Vigier diagnostics

For `psi = (a,b)`, the app evaluates

```text
rho = |a|^2 + |b|^2
S   = |a|^2 - |b|^2
E_B = m c^2 rho / S
p_B = m j / S
```

These are the paper's 1D momentum and energy in the current representation and
their natural bilinear extension in 2D. They satisfy `v = c^2 p_B / E_B` and
return the plane-wave energy-momentum on either energy branch. Since both
quantities are singular at `S = 0`, particle samples with `|S| / rho < 0.06`
are omitted from an explicitly conditional educational distribution instead
of being clipped. Mask-kept and charted counts remain visible.

The analysis panel provides:

- selected-particle histories of longitudinal `v`, `p_B`, and `E_B`;
- synchronized ensemble histograms for those three quantities;
- the conserved canonical FFT momentum distribution overlaid on `p_B`;
- predicted reference values `+/-v0`, `p0`, and `+/-E0`;
- empirical and canonical means and variances;
- a conservative pre-wrap time based on the maximum Dirac speed `c`.

Three representative particles are selected automatically from the 20%, 50%,
and 80% initial longitudinal-position quantiles. Their initial and unwrapped
positions are retained, and their colors match the trajectory curves.

## Simulation scale

`simulation scale` has discrete `1x`, `2x`, and `4x` settings so every FFT
dimension remains a power of two. Scaling enlarges the physical box and grid
together, preserving longitudinal spacing and extending the clean pre-wrap
window. In paper mode the uniform transverse direction uses 32 rows; the
corresponding longitudinal grids are 256, 512, and 1024 samples. Full 2D mode
uses 256x128, 512x256, or 1024x512 grids.

Turning paper mode off returns to the interactive `1x` full-2D grid and one
step per displayed frame. Larger full-2D scales and step counts can then be
selected deliberately.

The wave FFT runs on the CPU, not the GPU. The `4x` full-2D grid is therefore a
deliberately demanding option even on a fast graphics card.

## Visuals

The original density palette, Bohmian particles, soft dots, and fading particle
trails are retained. Three enlarged colored dots identify the tracked
trajectories. The cyan border marks one fundamental cell of the periodic torus
rather than a hard wall.

The `amp view` toggle changes only the background diagnostic between total
spinor density and lower-component density. Guidance always uses the complete
spinor state, with the current projected longitudinally in paper mode.

## Run

Serve the folder with a local static server, for example:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000`.
