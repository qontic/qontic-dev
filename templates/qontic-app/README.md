# Q-Ontic functional app template

This directory is the canonical, reusable template for simulation-style Q-Ontic apps. The live reference is `index.html`.

## Canonical files

- `index.html` — complete live reference and markup to copy.
- `starter.css` — shared simulation layout and control components.
- `qontic-controls.js` — functional control wiring and public API.
- `template-demo.js` — small example connecting the controls to a canvas.
- `starter.html` — short entry point for developers.
- `../../shared/qontic-shell.js` and `.css` — logo, title-purpose tooltip, Demo/Math navigation, footer, and responsive shell.

## Functional contract

### Combined run control

The run control is one visual unit. Its main area toggles Play/Pause; its arrow menu contains Restart same run and New run.

- Play/Pause preserves the current state.
- Restart returns to the same initial state and resumes.
- New Run generates new stochastic or Born-sampled initial conditions and resumes.

### Representations

Comparative apps use these exact labels and identifiers:

- `orthodox` — Orthodox
- `pilot-wave` — Pilot Wave
- `many-worlds` — Many Worlds

Apps that do not compare representations may omit this selector.

### Control groups

- **Core** — scenario and parameters essential to the lesson; PW particle count belongs here when pedagogically important.
- **Advanced** — model parameters, widths, couplings, detector positions, numerical settings, and random seed.
- **Display** — projections, axes, labels, opacity, trajectories, trail appearance, camera, and font size.

Speed remains in the always-visible toolbar when the model evolves in time. Results never occupy a control tab. When present, they use the draggable and collapsible floating Results panel inside the canvas.

## JavaScript API

```js
import { mountQonticControls } from './qontic-controls.js';

const controls = mountQonticControls({
  onPlay: () => engine.play(),
  onPause: () => engine.pause(),
  onRestart: () => engine.restartSameRun(),
  onNewrun: () => engine.newBornSample(),
  onRepresentation: ({ representation }) => engine.setRepresentation(representation),
  onControlchange: ({ name, value }) => engine.setControl(name, value)
});

controls.setRunning(false);
controls.setResult('time', '2.4');
```

Every callback is also emitted as a bubbling event: `qontic:play`, `qontic:pause`, `qontic:restart`, `qontic:newrun`, `qontic:representation`, and `qontic:controlchange`.

## Adoption rule

Copy the canonical structure and connect it through callbacks. Do not copy the placeholder physics or force irrelevant controls into an app. The template standardizes names, behavior, placement, states, accessibility, and responsive layout; the scientific engine remains app-specific.
