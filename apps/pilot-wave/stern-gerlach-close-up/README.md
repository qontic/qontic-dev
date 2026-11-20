# Stern–Gerlach Close-Up

This WebGPU simulation follows a two-component Pauli spinor and pilot-wave trajectories through model Stern–Gerlach magnets. Along the beam the wave is the exact free Gaussian; across the beam (y, z) the spinor is solved on a 128 × 128 grid, and the magnets act through the field at the packet's position. It is an advanced companion to the three-view Stern–Gerlach app.

## Compare the two initial spin states

Choose the XZ view and leave the field gradient on. The default packet is an equal, in-phase superposition of +z and −z spin. Compare its early splitting with the deflection of a +z packet. Changing the initial spin prepares a new packet. The cloud displays total spinor density.

The transverse grid has hard walls. The Magnets control chooses the field: long magnet, short magnet then drift, two magnets at 90°, or a weak uniform field (spin flips). The Magnet angle slider turns all magnets about the beam axis (0–360°, from +z toward +y). The initial spin points in any direction (θ from +z, φ from the beam axis +x toward +y); a small sphere shows the spin, the magnet axes and the expected split cos²(γ/2). The field has a uniform part twice the gradient strength (0.3 for the weak-field setting), so it does not vanish inside the box. A detector plate stops the dots on contact while the wave keeps evolving. The field of a z magnet is B = g(0, −y′, 2 + z′) with y′, z′ measured from the box centre in units of half the box height; the "Magnetic field" switch turns all of it off. The magnetic moment is parallel to the spin, so +z goes toward the stronger field (for a silver atom it is the other way).

The Spin term switch (Advanced) turns the spin part of the Pauli current on (default) or off; it changes trajectories, not the |Ψ|² statistics. The app shows lab units: each axis has its own scale, matched to the 1922 experiment (x in cm, y and z in µm, time in µs). The sliders show the field gradient in T/cm, the atom speed in m/s and the beam width in µm; the Axes button in the toolbar draws axes in these units. The model's ħ/m in these units is about 2 × 10⁴ times a silver atom's, so its wave spreads much faster. Internally the solver uses ħ = 6, m = 1 and grid spacing 1.

## Controls

- Drag to orbit or use XY, XZ and YZ to select a view. Use the wheel or zoom buttons to zoom.
- Change the spin direction, magnets, magnet angle or gradient strength in the Core controls. Dots are yellow if they start in the upper half of the packet and green if they start in the lower half; the box in the top-right corner counts the dots at the plate.
- Speed changes the number of simulation steps per frame. The numerical time step is a separate Advanced control.
- Reset restarts the wave, particles and trails. Pause stops time stepping.

## License and credit

MIT License. Copyright (c) 2026 anssiZander. See [LICENSE](LICENSE).
