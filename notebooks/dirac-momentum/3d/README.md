# DiracPacketSplitting3D

WebGPU visualization of a free massive four-component Dirac wave packet in three spatial dimensions, with Bohmian trajectories guided by the Dirac current.

The simulation is a 3D analogue of the packet-splitting mechanism discussed in *Asymptotic Momentum of Dirac Particles in One Space Dimension* (Narayanan, Perryman, Tahvildar-Zadeh, 2026). It is not a claim that the paper's 1D theorem has been proved in 3D.

## Physics

The wave obeys the free Dirac equation in the standard representation:

```text
i hbar d_t psi = [-i hbar c alpha.grad + m c^2 beta] psi
```

`psi` has four complex components. The initial state is a periodic 3D Gaussian envelope times a plane-wave phase and a single fixed four-spinor. At the central momentum `p0 = hbar k0`, that spinor is chosen as

```text
cos(chi/2) u_+(p0) + sin(chi/2) u_-(p0)
```

where `u_+` and `u_-` are positive- and negative-energy free Dirac eigenvectors with the same central momentum. The fixed default `chi = 90 deg` gives a 50/50 central-mode mixture.

For a narrow packet, the two branches have approximately the same momentum but opposite group velocities:

```text
E_±(p) = ±sqrt(m^2 c^4 + c^2 p^2)
v_g,± = ± c^2 p / sqrt(m^2 c^4 + c^2 p^2)
```

Because the spinor is fixed over the finite momentum width of the Gaussian, exact branch populations are only approximately the central-mode values.

The Bohmian particles use

```text
rho = psi^dagger psi
j   = c psi^dagger alpha psi
v   = j / rho
```

The wave is advanced on the GPU with fourth-order centered spatial derivatives and a leapfrog time update. All three spatial directions are periodic. Particles use periodic trilinear interpolation of the four-spinor and RK4 integration of the guidance law.

## Visual template

The project retains the WebGPU camera, 3D density cloud, glowing yellow Bohmian particles, fading trails, box shell, and orthographic view buttons from the supplied Stern-Gerlach project, while replacing the Pauli/SG physics with free four-component Dirac dynamics.

## Running

Serve the project folder from a local static HTTP server and open `index.html` in a current Chrome or Edge desktop browser with WebGPU available.
