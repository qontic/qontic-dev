# ClassicalLimit

This branch adds an ideal reflecting knife edge to the Q-ONTIC classical-limit experiment. The wave packet grazes its tip, diffracts into the shadow, and guides the particles around the corner. The original `qontic-dev/apps/pilot-wave/classical-limit` is a read-only reference and was not modified.

The **Without barrier / With barrier** scene selector combines the original separable box and the two-dimensional diffraction experiment. Each retains its own physics solver, speed calibration and full classicality range. Both use the latest barrier visuals: the red–blue phase gradient, cream-centered yellow particles, warm trail overlaps, and the outlined cyan reference drawn on top. The integration branch is `codex/unified-classical-limit`.

## Run

Double-click **Start ClassicalLimit.cmd**, then open **http://127.0.0.1:5178**. Node.js is required; no package installation is necessary to run the app.

Alternatively, in this directory:

```sh
npm start
```

Keep the server terminal open while using the app. `Ctrl+C` stops it. If port 5178 is occupied, use `npm start -- --port 5179` and open that port instead. The server listens only on this computer.

The app uses **WebGL2** for rendering and for the full 2D obstacle solver. The obstacle-free experiment uses the original double-precision CPU spectral solver. All runtime assets, including the video library, are bundled locally; there are no CDN requests, accounts, or build prerequisites. The obstacle requires floating-point rendering (`EXT_color_buffer_float`). `index.html` must be served over HTTP because it loads JavaScript modules.

## Controls

- **Scene:** **Without barrier** uses the original fast, separable solver and its more extreme classical endpoint. **With barrier** uses the GPU diffraction solver and an infinitely thin Dirichlet edge at `x = 0.8`, extending from the bottom wall to `y = 0.5`. Each scene remembers its last classicality setting during the session. Switching restarts the wave and trails with newly sampled particle positions, preserving launch direction, particle count, appearance, framing and playback settings. No diffracted wave is converted into a separable state.
- **Barrier launch:** the default packet starts at `(0.44, 0.515)`, with a horizontal launch and 30% classicality. At approximately 2–4 simulation seconds the first diffraction pattern is easy to see. Later reflections from the outer box interact with it. Restart to repeat the encounter.
- **Classicality:** continuously vary from a broad, strongly spreading wave to a narrow packet whose particle makes almost straight flights. Moving it restarts the preparation with freshly sampled positions. It selects a family of experiments; it does not suddenly change the mass of an already evolving wave. Each scene has its own calibration: equal percentages do not mean equal mass or wavelength across scenes, and 100% without the barrier reaches further than 100% with it.
- **Launch direction:** −180° to +180°. Positive angles point upward. Changing direction restarts the experiment.
- **Pause / Restart:** also Space / R when focus is outside interactive controls. Each restart samples fresh particle positions from the initial density. H hides the control panel.
- **Appearance & particles:** Wave toggles density and phase together; Particles toggles the Bohmian particles and their trails together. Classical comparison independently controls the classical particle and its trail, which remain visible when Bohmian particles are hidden. Both are on by default. Brightness stays at 1. A particle-count slider covers 1–256 samples, with controls for particle size and trail duration. Playback retains the latest stops: 1×, 2×, 3× and 4×. Changing particle count starts a fresh sample; changing playback speed preserves the current scene.
- **Velocity field:** on by default and independent of Wave, Particles and Classical comparison. Mint arrows show the instantaneous Bohmian velocity. Faster flow gives longer, thicker and more opaque arrows, with a smooth bounded display scale to keep very fast arrows readable. Almost empty regions fade out; nodes and the immediate wall strip are omitted. The overlay follows pan, zoom and resizing, and is included in recordings.
- **Trails:** toggle Particles off and on to clear old trails and begin fresh ones at the current particle positions. No Bohmian history accumulates while particles are off; the classical reference trail is independent. Current-time recordings respect the last toggle; recordings from the beginning start fresh at launch.
- **Particle and trail styling:** the latest defaults are a 15 CSS-pixel particle diameter and a five-second trail. Soft yellow trails use 60% of the particle diameter (9 pixels by default), including under zoom and high-DPI rendering. Overlapping trails accumulate brightness and shift toward orange and pink, using the original WebGPU colour mapping. Integrating the soft brush along each segment prevents extra path samples from creating bright beads.
- **Classical comparison:** enabled by default; an opaque cyan particle and dashed specular path for the first particle, starting at its actual initial position. Both have dark outlines and are drawn above the yellow particles and trails. The golden trajectories remain Bohmian.
- **Window layout:** the simulation fits the available width and height without stretching the physical box. Controls scroll independently beneath their compact logo and title. On narrow portrait screens the scene stays above the scrolling controls. H or the header button collapses the controls; resizing preserves the wave, trails and framing.
- **Scroll / drag / double-click:** zoom, pan and restore the view. Resizing and zooming do not reset or rescale the physics.
- **Video export:** choose 1920 × 1200 or the default **2K, 2560 × 1600**; these preserve the box's 8:5 aspect ratio. Set a length of 1–120 seconds and start from the beginning or current simulation time. **Render video · 30 fps** saves an MP4 (WebM fallback when AVC encoding is unavailable). A progress indicator and Cancel button remain responsive. The saved file contains the scene and phase legend, without the controls.

The velocity overlay samples `v = alpha Im(psi* grad(psi)) / |psi|²` on a small GPU surface. For the free box it differentiates an eight-point interpolation of the existing complex wave textures; for the barrier it shares the exact spatial interpolation used by particle guidance. This only reads the wave and does not alter either solver. Arrowheads, tapered shafts, dark edging and a subtle halo are rendered with antialiasing below trajectories. The sampling density follows display size, and exports retain the corresponding arrow scale.

## Video quality

**Phase legend:** a small red–blue colour wheel stays inside the lower-right corner of the scene and recordings, with no separate visibility checkbox. It labels 0, +π/2, −π/2 and ±π and explains that black can mean phase zero, even with nonzero probability density. The key shows the palette before density and classicality shading. Its position and relative size match between the live scene and video, including on smaller screens. It does not intercept zooming or dragging.

**Phase palette:** both scenes and recordings use only the red–blue mapping from `Bohmian Free Packet/shaders/wave_render.frag`: blue for positive phase, red for negative phase, magenta at ±π, and a symmetric smooth fade to black near zero. The alternate palette and its button have been removed. The latest barrier renderer's density brightness, gradual phase-colour fade toward the classical end, and density-only view are retained.

Export advances a separate instance of the same physics solver at exact video times `startTime + frameIndex * playback / 30`. It samples particle paths at intervals no larger than 1/120 simulation second. The obstacle solver retains its internal adaptive steps. Wall time does not affect the video: even a slow render produces every frame at **30 fps**, with explicit timestamps, duration and a seekable index. The live experiment is paused and preserved during export, then its previous playback state is restored. A current-time export reconstructs its wave and trail history from the seeded launch; small floating-point differences from the live 2D run are possible because of its different step schedule.

2K frames are rendered at **5120 × 3200**, then downsampled to **2560 × 1600** before encoding. Both available sizes use 2× spatial supersampling; 4K is no longer offered. Export dimensions and particle scale are fixed at the start and cannot be changed by resizing the browser. Encoding retains its previous WebCodecs quality mode and bitrate scaling, approximately 35.6 Mb/s at 2K. Actual bitrate depends on scene detail. MP4 uses ordinary 8-bit, chroma-subsampled video; it is not a lossless scientific data format.

The display retains the latest barrier version's red–blue phase and purple density colours, cubic reconstruction of the 2D complex field, and attenuation of phase detail too fine for the output pixels. Particles use the soft, cream-centred yellow profile. Trails accumulate in a half-float surface and use the yellow-to-orange/pink mapping at crowded crossings, with a **60% trail-to-particle diameter**. The soft brush is integrated along each segment so brightness is independent of straight-path subdivision; both different particles and returning paths contribute to crossings. Floating-point colour rendering is required for the accumulated trail surface in either experiment.

Export needs a browser with WebCodecs (tested in Chromium). The video library is bundled locally, so no account, upload, CDN or network service is involved. `npm run vendor` reproduces the checked-in Mediabunny bundle; its MPL-2.0 license and upstream source notice are alongside it in `src/vendor/`. The exporter uses the [Mediabunny canvas source](https://mediabunny.dev/guide/media-sources) with [WebCodecs quality-mode encoding](https://www.w3.org/TR/webcodecs/#enumdef-latencymode).

There is no seed control. Each page load and user-triggered restart samples fresh positions; the current launch retains its internal seed so recordings reproduce it. A seed in the URL can still reproduce the initial launch for validation, but subsequent restarts sample anew.

Optional URL parameters: `?scene=barrier&classicality=0.3&angle=0&seed=2&count=8&paused=1`. The default is Without barrier (`scene=free`), the original box; its defaults are 0% classicality and a 45° launch when omitted from the URL. Legacy `obstacle=0` links still work; an explicit valid `scene` takes precedence. Export filenames identify the scene, and the render report records which scene and solver parameters were used. `embed=1` hides the compact logo. An embedding page on the same origin can send `{type:'qontic:set-paused', paused:true}`.

## Obstacle physics and numerical limits

The obstacle is part of the wave Hamiltonian: `psi = 0` on the edge and on the outer box walls. Connections through the edge are absent, including the longer connections used by the eighth-order stencil. It reflects probability rather than absorbing it; there is no potential transmission or particle collision rule. The thin line drawn on the canvas marks this boundary. Its screen width does not set its physical thickness.

The full state `psi(x,y,t)` evolves under the 2D Schrödinger equation. On the grid, the kinetic Hamiltonian is

```text
H = alpha / (2 dx²) [f(Lx) + f(Ly)]
f(L) = L + L²/12 + L³/90 + L⁴/560
```

Here each `L` is the positive second-difference Dirichlet matrix on its connected row or column. This construction is Hermitian. Odd boundary ghosts implement the matrix powers correctly. The wave propagator uses an adaptive 8–24 term Chebyshev expansion of the exponential, with its argument bounded by 8 and its first omitted coefficient below `1e-10`. The GPU stores single-precision complex amplitudes. Raw probability is measured by a GPU reduction and is never periodically renormalized to conceal drift. A uniform carrier-energy phase is removed, which changes neither density nor Bohmian velocities.

Particles follow `v = alpha Im(psi* grad(psi)) / |psi|²`, using an eight-point polynomial interpolation in each direction and its analytic spatial derivatives. Differentiating the same complex interpolant preserves phase circulation near interference zeros. Adaptive midpoint integration uses temporal interpolation of the wave. Steps are reduced near fast turns and are rejected if they cross a Dirichlet boundary. Difficult intervals restore a GPU checkpoint of both wave and particles, then replay with smaller wave steps. No particle is assigned a classical bounce, speed cap, or clamped position. Near a straight wall the real vanishing factor in `psi = d A` is removed analytically from the phase gradient. Grid anchors and small local offsets keep particle coordinates precise very close to a wall. These are numerical approximations to continuum Bohmian guidance; unlike the separable box, there is no exact cumulative-probability inversion.

**The obstacle uses a less extreme classical range than the obstacle-free box.** A full 2D grid cannot economically resolve the former endpoint's extremely short carrier wavelength. Instead, the obstacle uses `alpha(s) = 0.0144 * 96^(-s)` while retaining the original initial packet-width function, including `sigma(1) = 0.014`. The mass therefore ranges from 69.44 to 6666.67. The grid grows from 257 × 161 to 2049 × 1281 nodes; the largest carrier phase step stays below one radian. At the right end the wavelength is approximately 0.00523 and the continuum free spreading time is 2.61, versus 0.00105 and 13.07 in the original box. Thus the initial narrow packet is retained, but it spreads faster. Turning the edge off restores the original range without changing its solver.

Launch momentum is calibrated against the actual spatial operator, independently in both directions:

```text
v_i = alpha / dx [8 sin(k_i dx)/5 - 2 sin(2 k_i dx)/5
                 + 8 sin(3 k_i dx)/105 - sin(4 k_i dx)/140]
```

Solving this equation for `k_i` keeps the group velocity at the requested components of speed 0.18. The high-order stencil also keeps this close to the continuum phase-gradient launch speed `alpha * k`. Grid and timestep checks, an independent free-Gaussian benchmark, and live browser timing are recorded under `validation/`. These checks characterize the finite grid; they do not establish accuracy for arbitrarily long chaotic trajectories or every possible seed.

The idealized geometry and boundary choice follow the Dirichlet case in [Dubertrand, Shim and Struyve, *Bohmian trajectories for the half-line barrier*](https://arxiv.org/abs/1707.06173). This implementation uses a finite reflecting box and a numerical 2D propagator, rather than that paper's infinite-domain exact propagator.

If the browser loses its graphics context, the obstacle experiment restarts in a paused state after restoration because the wave lived in GPU memory. The original box retains its CPU state. A numerical error pauses the scene; Restart or changing the controls rebuilds the state.

## Obstacle-free physical model and speed matching

The domain is a fixed **1.6 × 1** rectangle with infinite-potential (Dirichlet) walls and no interior potential. Units are dimensionless, with ℏ = 1. The state remains separable:

```text
ψ(x,y,t) = ψx(x,t) ψy(y,t)
i ∂tψ = −(α/2) ∇²ψ,     α = ℏ/m
vB = α Im(ψ* ∇ψ) / |ψ|²
```

For slider position `s ∈ [0,1]`:

```text
u    = clamp(2s − 1, 0, 1)
g(s) = u²(3 − 2u)
w(s) = 2^(−g(s))
α(s) = 0.0144 × 120^(−s) × w(s)²
m(s) = 1 / α(s)
v0   = 0.18                  (constant)
p(s) = m(s) × v0
k(s) = p(s) / ℏ = v0 / α(s)
λ(s) = 2π / k(s)
σ(s) = 0.065 × (0.028 / 0.065)^s × w(s)
```

`σ` is the standard deviation of the initial probability density in each direction; the amplitude envelope is `exp(−(x−x0)²/(4σ²))`. Its center is `(0.36 Lx, 0.4 Ly)`. An odd periodic image preparation enforces the walls smoothly instead of abruptly truncating a Gaussian. An internal seed fixes probability quantiles within a launch so its recording is reproducible. User-triggered restarts, including changes to particle count or classicality, choose a fresh seed.

| Slider | ℏ/m | Mass | Momentum | Launch speed | Wavelength | σ | Free spreading time 2σ²/α |
|---|---:|---:|---:|---:|---:|---:|---:|
| 0% | 0.0144 | 69.444 | 12.5 | 0.180 | 0.50265 | 0.06500 | 0.587 |
| 50% | 0.00131453 | 760.726 | 136.931 | 0.180 | 0.04589 | 0.04266 | 2.769 |
| 100% | 0.000030 | 33333.333 | 6000 | 0.180 | 0.001047 | 0.01400 | 13.067 |

The extended endpoint halves the original maximum-classical packet width from 0.028 to 0.014 and quarters ℏ/m. Thus its freely spreading width is also halved at corresponding times; the relative spreading time is unchanged. The extra narrowing blends smoothly into the upper half of the slider, leaving the lower half's physical parameters unchanged. Wall-interference patterns need not be literal scaled copies.

The physical launch speed and wall-clock playback rate are the same across the slider. **Instantaneous and long-time average particle speeds are not forced to be equal.** Wave spreading and interference can accelerate, slow or reverse a Bohmian particle; rescaling every velocity would violate the guiding equation. Different seeds and time windows give different averages.

The right end is a finite semiclassical regime, not an exact classical switch or proof of the classical limit for arbitrary quantum states. Reflections retain a small wave-guided turn, and spreading eventually becomes visible at long times. No decoherence, environment, Pauli spin current, nonseparable potentials or entangled states are included.

## Why the obstacle-free solver remains stable

For each axis of length L:

```text
ψ(u,t) = Σn cn sin(nπu/L) exp[−i α(nπ/L)² t/2]
```

The sine basis uses 4096–32768 physical intervals per axis, increasing with momentum to resolve the new endpoint. Its odd Fourier extension has twice as many samples. Long wave textures are packed into rows of at most 4096 texels for WebGL2 compatibility. The initial coefficients are computed once. Each requested time is evaluated directly from those coefficients using double precision and an inverse FFT. Mode phases have unit modulus. There is no accumulated explicit wave time step, leapfrog parasitic branch, finite-difference group-velocity error, or CFL instability. Tiny coefficients below a relative amplitude of `1e−14` are omitted. The measured upper-spectrum tail rejects under-resolved preparations.

For this separable state and zero boundary current, the continuity equation implies:

```text
Fx(x(t),t) = qx,    Fx(x,t) = ∫0ˣ |ψx(u,t)|² du
Fy(y(t),t) = qy
```

Differentiating gives `dx/dt = jx/ρx` and `dy/dt = jy/ρy`, the usual Bohmian law. Positions are obtained by monotone inversion of these cumulative probabilities. They do not need current division near nodes, artificial velocity caps, clamping back into the box, or a classical fallback. This construction is supported by Coffey, Wyatt and Schieve, *Uniqueness of Bohmian Mechanics, and Solutions From Probability Conservation* (2007), including its extension to separable higher-dimensional states.

The time evolution is exact **within the retained spectral representation**; the sampled density integral and within-cell inversion introduce a small spatial discretization error. Cumulative probability uses trapezoidal cell integrals and their monotone quadratic inverse. Resolution and independent phase-gradient comparisons test that approximation.

The animation clock follows `requestAnimationFrame` timestamps. Adaptive midpoint refinement adds trajectory samples at bends; its lower time scale is based on `α/v0²`, with finite work and memory limits. Those limits affect trail detail, not the endpoint wave or particle positions. A background tab does not accumulate catch-up steps. Long display stalls above 250 ms are discarded rather than drawing a jump. Ordinary performance was verified at both slider ends; no promise is made about real-time performance on all hardware.

The probability diagnostic uses the raw, unrenormalized wave norm. Only the cumulative lookup removes roundoff from its final probability sum. Render brightness is relative to the current density peak for visibility; phase coloring fades continuously toward the right end. Neither changes the physical state. Density and complex phase are interpolated separately so unresolved phase oscillations do not cancel the displayed density. WebGL2 float-texture formats follow the [MDN texture format reference](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texImage2D).

## Verification

```sh
npm install
npm test
npm run check
npx playwright install chromium
npm run test:browser
npm run build
```

`npm run build` writes a portable static app to `dist/`. To test with an existing Chromium executable, set the `CLASSICALLIMIT_BROWSER` environment variable to its path. The tests otherwise use Playwright's downloaded Chromium. Export tests also require `ffprobe` on PATH (or `CLASSICALLIMIT_FFPROBE` pointing to it) to independently verify decoded frame counts and timing. The browser inspection API is available only with `?test=1`.

See [validation/README.md](validation/README.md) for the actual results and limits. Numerical tests cover launch velocities, an independent free-Gaussian solution, phase-gradient guidance, the full slider, all directions, long-time probability conservation, boundary containment, quantile ordering, finer-grid convergence, time reversibility, and classical-path comparison. Browser tests cover rendered GPU output, UI input, rapid switching, the playback clock, 256 particles, resize, recording, and graphics recovery.

## Project layout and replacing the original later

`src/physics.js` is independent of the interface and WebGL. `src/fft.js` implements its Fourier transform. Both retain the original `main` branch implementation. `src/obstacle-physics.js` defines the obstacle preparation and classical comparison; `src/obstacle-gpu.js` evolves its full 2D wave and particles. `src/experiments.js` selects the appropriate unchanged solver for both live playback and recording. `src/renderer.js` renders both kinds of wave with the shared appearance and bounded trail history. `src/main.js` owns controls, per-scene slider memory and the live animation clock; `src/export.js` owns the independent video renderer.

All browser assets are local: `index.html`, `styles.css`, `src/`, and `assets/`. The supplied Q-ONTIC logo is included unchanged in `assets/` and used in the header and browser tab icon. These assets can be integrated into the existing app directory later after review. The current project does not depend on the Q-ONTIC shared scripts or publish to GitHub or a hosting service. The original installation remains available for comparison.
