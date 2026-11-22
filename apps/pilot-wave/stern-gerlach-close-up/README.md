# Stern–Gerlach Close-Up

A WebGPU simulation of a spin-½ atom (a two-component Pauli spinor) flying through model Stern–Gerlach magnets to a screen, in two readings: Pilot Wave (dots guided by the Pauli current) and Orthodox (the wave and the probabilities). It is an advanced companion to the three-view Stern–Gerlach app (apps/comparative/stern-gerlach), with which it is being merged.

## Axes and units

Lab axes follow the textbook field B = −αx x̂ + (B0 + αz) ẑ (Griffiths and Schroeter): the beam travels along y, z is up, x across the beam. The grid keeps its own order (grid x = beam); lab x = −grid y (`labFromGrid` / `gridFromLab` in main.js). Each axis has its own lab scale, matched to the 1922 experiment: y in cm, x and z in µm, time in µs (Physics tab: Units). Lengths along the beam are drawn 2.5 times shorter (X_VIS = 0.4). The model's ħ/m is about 8 × 10³ times a silver atom's. Internally ħ = 6, m = 1, grid spacing 1.

## Physics

- Field of a z magnet: B = g(−x′, 0, 2 + z′), x′, z′ from the box centre in units of half the box height (uniform part 0.3 g for Weak field). Field = Textbook or Knife edge (a line pole along the beam at 1.5 L, K = g hp², same centre gradient). Pole faces are drawn on equipotentials. The field at the magnet ends is p(y)·B⊥(x, z): no component along the beam (not curl-free in the ramps; stated in Physics).
- The magnetic moment is parallel to the spin (+z goes toward the stronger field; the other way for silver).
- Guidance: Pauli current with spin term s = ½ (Spin term switch, Expert level: s = 0).
- Magnet angle turns all magnets about the beam (from +z toward +x). Spin: θ from +z, φ about z from +x toward +y. The sphere shows the spin, the magnet axis and the predicted fractions (cos²(γ/2), or four outcomes with two magnets).
- Colour of dots, trails and cloud: the spin of the wave along the axis of the magnet the packet has reached; pale blue before the field, green +, red −. The counts in the corner are by halves of the screen.

## Engines (Engine tab, Standard and Expert)

- Fast (2D): Ψ = φ(y, t) χ(x, z, t) — exact free Gaussian along the beam, spinor on a 128 × 128 grid across it, field at the packet centre. Exact while the field does not vary along the packet.
- Full 3D: Ψ′ on a 128³ window moving with the beam (Galilean frame), each cell feeling its own field. ψ′(t) and ψ′(t − dt) in two spinor arrays (64 MB), ψ′(t + dt) written over ψ′(t − dt) in place; |ψ′|² < 1e-24 is set to zero (tiny numbers slowed the step on some GPUs). Shaders compile when Full 3D is first chosen, or in the background a few seconds after load at Standard/Expert.
- BEAM_SCALE = 8: the beam moves at 44 cells per time unit, magnetic energy ≈ 4% of the kinetic energy, speed spread ≈ 1%. numpy full 3D vs factorized: −2.3% deflection.

## Levels

Basic · Standard · Expert (`levels` / `tab-levels` on `qontic-controls`; `?level=`; remembered in localStorage). Controls above the current level are hidden and take their defaults (`LEVEL_CONTROLS` in main.js); user values come back at the higher level. Basic: no Engine or Advanced tab, no Edit geometry; the sphere moves the spin in the z–x half plane (φ = 0).

## Controls and keyboard

- Drag to orbit; wheel or − + to zoom; 3D, XY, YZ (side), XZ (along the beam) views.
- With the canvas focused: Space start/stop, R reset, W/A/S/D/Q/E turn the view. Level and control tabs: arrow keys. Edit geometry (toolbar pencil or right-click; Escape exits): drag the handles or use the arrow keys (Shift for larger steps).
- Speed sets the steps per frame; a frame budget (28 ms at 1×, up to 50 ms at the top speed, measured GPU cost) keeps the frame rate steady and the badge says when the GPU limits the speed.

## Performance notes

The particle update runs RK4 as four dispatches, one per stage, so each shader holds the guidance code once (the written-out step took 24 s to compile on an Intel GPU under Windows). The wave cloud is prepared once per cell in a compute pass and drawn indirectly at half resolution. `?debug=1` exposes `qonticSG.timing()`, `benchmark(steps)`, `particles()`, `frameStats()`, `separation()`.

## License and credit

MIT License. Copyright (c) 2026 anssiZander. See [LICENSE](LICENSE).
