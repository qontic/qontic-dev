# Stern–Gerlach Close-Up

This WebGPU simulation follows a two-component Pauli spinor and pilot-wave trajectories through a model Stern–Gerlach magnetic field. It is an advanced companion to the three-view Stern–Gerlach app.

## Compare the two initial spin states

Choose the XZ view and leave the field gradient on. The default packet is an equal, in-phase superposition of +z and −z spin. Compare its early splitting with the deflection of a +z packet. Changing the initial spin prepares a new packet. The cloud displays total spinor density.

The grid is twice as tall along z as along x and y. Wave propagation is periodic along x and hard-walled along y and z. A detector plate stops trajectories on contact while the wave keeps evolving. Compare the early motion before reflections become important.

The spin-current coefficient defaults to ½ for the Pauli current. The coefficient affects trajectories while the spinor evolves with the same Pauli equation. The app uses simulation units.

## Controls

- Drag to orbit or use XY, XZ and YZ to select a view. Use the wheel or zoom buttons to zoom.
- Change the field gradient or initial spin in Simulation controls.
- Adjust the grid resolution and steps per frame to suit the device.
- Reset restarts the wave, particles and trails. Pause stops time stepping.

## License and credit

MIT License. Copyright (c) 2026 anssiZander. See [LICENSE](LICENSE).
