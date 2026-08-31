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

### Permanent controls

The interpretation selector occupies the full panel width and cycles through the available interpretations. It shows only the current interpretation name—no label or arrow. The next row contains a narrow **Start/Stop** button, an optional **Reset** action, a two-state **↻** automatic-rerun toggle, and the **Speed** slider.

Start/Stop preserves the current state. Reset returns the app to its defined initial state and emits `qontic:reset`; apps enable it with `show-reset="true"`. With ↻ enabled, completion starts a newly sampled run automatically. With ↻ disabled, the simulation completes one run and stops. The template intentionally has no pull-down run menu and no separate replay action.

### Interpretations

Comparative apps use these exact labels and identifiers:

- `orthodox` — Orthodox
- `pilot-wave` — Pilot Wave
- `many-worlds` — Many Worlds

Apps that do not compare interpretations may omit this selector.

### Control groups

- **Core** — scenario and parameters essential to the lesson; PW particle count belongs here when pedagogically important.
- **Advanced** — model parameters, widths, couplings, detector positions, numerical settings, and random seed.
- **Display** — projections, axes, labels, opacity, trajectories, trail appearance, camera, and font size.

The particle-count slider appears in Core only while Pilot Wave is selected. The shared runtime always supplies the light/dark appearance switch under Display; apps must theme their canvas as well as their surrounding interface.

Core, Advanced, and Display are attached tabs that visually open one bordered control-panel section; they must not look like independent action buttons. Results never occupy a control tab. When present, they use the draggable and collapsible floating Results panel inside the canvas. Stage indicators and scenario selectors are not part of the common template. The desktop control column is approximately 10% wider than the original 310 px panel (341 px in the canonical example), and controls use regular—not bold—13 px type.

## JavaScript API

```js
import { mountQonticControls } from './qontic-controls.js';

const controls = mountQonticControls({
  onStart: () => engine.start(),
  onStop: () => engine.stop(),
  onReset: () => engine.reset(),
  onAutorun: ({ autoRerun }) => engine.setAutoRerun(autoRerun),
  onInterpretation: ({ interpretation }) => engine.setInterpretation(interpretation),
  onControlchange: ({ name, value }) => engine.setControl(name, value)
});

controls.setRunning(false);
controls.setAutoRerun(true);
controls.setInterpretation('pilot-wave');
controls.setResult('time', '2.4');
```

Every callback is also emitted as a bubbling event: `qontic:start`, `qontic:stop`, `qontic:autorun`, `qontic:interpretation`, and `qontic:controlchange`.

## Adoption rule

Import `../../shared/qontic-controls.js` and render the `<qontic-controls>` runtime component; do not copy its markup or CSS. Connect its standard events to the app engine.  Do not copy the placeholder physics or force irrelevant controls into an app. The shared runtime component standardizes names, behavior, placement, states, accessibility, and responsive layout; the scientific engine and tab contents remain app-specific. Model-specific buttons must use the shared `.qontic-app-toggle`, `.active`, `.qontic-app-toggle--wide`, and `.qontic-app-toggle-group` classes so they match the common controls in dark and light themes. Compatible updates to the shared component propagate to every connected app.
