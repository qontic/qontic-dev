# Stern–Gerlach Close-Up

This WebGPU simulation follows a two-component Pauli spinor and pilot-wave trajectories through a model Stern–Gerlach magnetic field. It is an advanced companion to the three-view Stern–Gerlach app.

## Compare the two initial spin states

Choose the XZ view and leave the field gradient on. The default packet is an equal, in-phase superposition of +z and −z spin. Compare its early splitting with the deflection of a +z packet. Changing the initial spin prepares a new packet. The cloud displays total spinor density.

The grid is twice as tall along z as along x and y. Wave propagation is periodic along x and hard-walled along y and z. The field has a uniform part along z, twice the gradient strength, so it does not vanish inside the box. A detector plate stops the dots on contact while the wave keeps evolving. The packet starts inside the field; the plate is two box lengths from the start of the first box. The field is B = g(0, −y′, 2 + z′) with y′, z′ measured from the box centre in units of half the box height; the "Magnetic field" switch turns all of it off. The magnetic moment is parallel to the spin, so +z goes toward the stronger field (for a silver atom it is the other way). Compare the early motion before reflections become important.

The spin-current coefficient defaults to ½ for the Pauli current. The coefficient affects trajectories while the spinor evolves with the same Pauli equation. The app shows lab units: each axis has its own scale, matched to the 1922 experiment (x in cm, y and z in µm, time in µs). The sliders show the field gradient in T/cm, the atom speed in m/s and the beam width in µm; the Axes button in the toolbar draws axes in these units. The model's ħ/m in these units is about 2 × 10⁴ times a silver atom's, so its wave spreads much faster. Internally the solver uses ħ = 6, m = 1 and grid spacing 1.

## Controls

- Drag to orbit or use XY, XZ and YZ to select a view. Use the wheel or zoom buttons to zoom.
- Change the magnetic field, gradient strength (up to 3.5) or initial spin in the Core controls. Dots are yellow if they start in the upper half of the packet and green if they start in the lower half; the box in the top-right corner counts the dots at the plate.
- The default grid is 64 × 64 × 128. Set Grid x/y to 128 in Advanced for the former larger tunnel. Changing the grid restarts the packet.
- Speed changes the number of simulation steps per frame. The numerical time step is a separate Advanced control.
- Reset restarts the wave, particles and trails. Pause stops time stepping.

## License and credit

MIT License. Copyright (c) 2026 anssiZander. See [LICENSE](LICENSE).
