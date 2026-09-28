# Bohmian Tunneling

WebGL2 Bohmian mechanics Tunneling simulation with two selectable guiding laws.

- `Schrodinger`: `v = j / rho`
- `Pauli spin-1/2 (+z)`: `v = j / rho + (hbar / (2 m rho)) * (d_y rho, -d_x rho)`


## Controls

- `guiding law` switches between the two trajectory laws and resets the run.
- `Reset` restarts the wave, particles, and trails.
- `Stop` pauses time stepping; the simulation starts running on load.
- `Auto rerun` starts another packet after a travel-time interval estimated from the grid height and incoming momentum. It is on by default.
- Changing particle count applies the new count on release, restarts the packet and trails, and resumes playback.
- `R` resets, `Space` starts or stops, and `S` saves a screenshot.
- Core contains physical parameters, guiding law, and particle count. Advanced contains numerical settings. Display contains the palette, particles, trails, and phase controls.
- The simulation toolbar provides screenshot, recording, sharing, expanded view, a grid, coordinate measurement, and a distance scale. The Display tab sets the physical length calibration (default 1 nm per simulation-grid step). The solver has no unique physical length; the app interprets its model mass as an electron mass and derives length, momentum, energy, and time units consistently from the chosen length and reduced Planck constant. Changing the calibration updates every physical label without changing trajectories. Counts, ratios, and screen marker widths use their respective display units.
- The simulation status shows the total incoming central kinetic energy and its normal component `p0²/(4m)` for the 45° launch. The normal component governs the below-barrier comparison. With the default numerical settings it is only slightly above the barrier in the continuum estimate; packet spread and finite-grid dispersion affect the detailed behavior.
- The packet approaches the horizontal barrier diagonally by design. Pauli spin guidance can also bend trajectories before the barrier; select Schrodinger guidance to compare paths without the spin current.
- The particle-freeze boundary is half its previous distance from each edge. The wave absorber itself keeps its original width and strength.

## License and Credit

This project is released under the MIT License. Copyright (c) 2026 anssiZander. See `LICENSE` for the full license text.
