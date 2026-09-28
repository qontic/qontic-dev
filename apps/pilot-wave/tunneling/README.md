# Bohmian Tunneling

WebGL2 Bohmian mechanics Tunneling simulation with two selectable guiding laws.

- `Schrodinger`: `v = j / rho`
- `Pauli spin-1/2 (+z)`: `v = j / rho + (hbar / (2 m rho)) * (d_y rho, -d_x rho)`


## Controls

- `guiding law` switches between the two trajectory laws and resets the run.
- `Reset` restarts the wave, particles, and trails.
- `Stop` pauses time stepping; the simulation starts running on load.
- `Auto rerun` starts another packet after the outgoing packets reach the absorbing boundaries. It is on by default.
- `R` resets, `Space` starts or stops, and `S` saves a screenshot.
- Core contains physical parameters, guiding law, and particle count. Advanced contains numerical settings. Display contains the palette, particles, trails, and phase controls.
- The simulation toolbar provides screenshot, recording, sharing, expanded view, a grid, coordinate measurement, and a distance scale. Distances are given in simulation-grid pixels, not physical units.

## License and Credit

This project is released under the MIT License. Copyright (c) 2026 anssiZander. See `LICENSE` for the full license text.
