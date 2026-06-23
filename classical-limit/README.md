# Classical Limit

WebGPU pilot-wave applet for exploring how a free Gaussian packet in a reflecting box approaches a more classical-looking regime.

The wave uses finite-difference Schrodinger evolution in WebGPU compute passes. The displayed density/phase and the Bohmian particle guidance both read from that evolved wave state, so the particles are guided by the simulated wave rather than by a separate analytic approximation.

The `classical limit` slider changes hidden effective parameters together:

- lowers the displayed effective `hbar`;
- lowers `hbar / mass` within a grid-resolvable range;
- adjusts `p0` and `mass` so the packet speed stays approximately fixed;
- widens the initial packet enough to keep the motion more ray-like;

The `packet spread` slider scales the initial Gaussian sigma on top of that regime mapping.
It can now go lower than the old WebGL version, but the effective packet width is still clamped to a 10-grid-cell floor to avoid under-resolved finite-difference artifacts.

The `velocity angle` slider rotates the initial plane-wave momentum from `-90deg` to `90deg`.
Mouse-wheel scrolling over the canvas zooms the view; double-clicking the canvas resets the view.

The guidance law is purely Schrodinger/Bohmian, with no Pauli spin-current term.

At the quantum end, the particle trails show stronger curvature from wave spreading. At the classical end, the wider packet and smaller `hbar / mass` reduce spreading while keeping the phase wavelength above the grid's aliasing limit.

The `sim scale` slider can now run larger grids than the old WebGL2 version, subject to the device's WebGPU storage-buffer limits.
