# Bohmian Double Slit

WebGL2 Bohmian mechanics double-slit simulation with two selectable guiding laws.

- `Schrodinger`: `v = j / rho`
- `Pauli spin-1/2 (+z)`: `v = j / rho + (hbar / (2 m rho)) * (d_y rho, -d_x rho)`


## Controls

- `guiding law` switches between the two trajectory laws and resets the run.
- `Reset` restarts the wave, particles, and trails.
- `Pause` stops time stepping.
- `R` resets the simulation.

## License and Credit

This project is released under the MIT License. Copyright (c) 2026 anssiZander. See `LICENSE` for the full license text.

## Notebook template preview (dev)

The index page now uses the canonical shared notebook shell with Brief/Full,
themes, section navigation and three prediction checks. Proposed teaching text
is labelled for author review. The prior page is retained byte for byte at
`index-pre-template.html`; its relative applet and asset URLs remain valid.
Simulation main.js, full-applet.html, presets, shaders and all preview images
are unchanged. A host-only WebGL2 check keeps the preview visible and explains
unsupported browsers rather than opening a blank applet.

This is a layout and teaching-content review, not a numerical convergence test.
