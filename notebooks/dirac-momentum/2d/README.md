# DiracPacketSplitting2D

A WebGL2 visualization of free 2D Dirac-wave-packet splitting, adapted from the
visual style of the supplied Klein-tunneling project.

The physics is the free two-component Dirac equation in two space dimensions:

```text
i hbar d_t psi =
[c (sigma_x p_x + sigma_y p_y) + m c^2 sigma_z] psi.
```

The initial wave function is a localized 2D Gaussian with mean wave vector
`k0`, multiplied by one **fixed spinor**. A generic fixed spinor is not an
energy eigenvector for every momentum in the packet. Therefore the initial
state contains both positive- and negative-energy spectral components.

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
- Bohmian particles use the periodic 2D Dirac guidance field

```text
rho = psi^dagger psi
j = c psi^dagger (sigma_x, sigma_y) psi
rdot = j / rho
```

- Particle positions wrap on the torus instead of dying at the edges.
- Velocity interpolation also wraps periodically across grid seams.

## The ±E mix angle

The `±E mix angle` slider chooses the fixed initial spinor relative to the
central positive-energy eigenspinor:

- `0 deg`: central momentum is +E.
- `90 deg`: central momentum has 50/50 +E and -E weights.
- `180 deg`: central momentum is -E.

For the central momentum,

```text
w+ = (1 + cos chi) / 2
w- = (1 - cos chi) / 2
```

Because the packet has finite momentum width while the spinor is fixed, the
exact FFT spectral populations can differ slightly from these central-mode
weights. The app computes and displays both.

## Visuals

The original density palette, yellow Bohmian particles, soft dots, and fading
particle trails are retained. The cyan border now marks one fundamental cell
of the periodic torus rather than a hard wall.

The `amp view` toggle changes only the background diagnostic between total
spinor density and lower-component density. Particle guidance always uses the
full spinor current.

## Run

Serve the folder with a local static server, for example:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000`.
