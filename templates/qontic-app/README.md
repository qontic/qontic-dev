# Q-Ontic functional app template

This directory is the canonical, reusable template for simulation-style Q-Ontic apps. The live reference is `index.html`.

## Canonical files

- `index.html` — complete live reference and markup to copy.
- `../../shared/qontic-app.css` — reusable two-column layout, panels, and host-app buttons.
- `starter.css` — demo-canvas and example-content styling only.
- `qontic-controls.js` — functional control wiring and public API.
- `template-demo.js` — small example connecting the controls to a canvas.
- `starter.html` — short entry point for developers.
- `../../shared/qontic-shell.js` and `.css` — logo, title-purpose tooltip, Demo/Math navigation, footer, and responsive shell.
- `../../shared/qontic-media.js`, `qontic-shortcuts.js`, and `qontic-expanded-resize.js` — optional canvas tools and standard interactions.

## Functional contract

### Permanent controls

The interpretation selector occupies the full panel width and cycles through the available interpretations. It shows only the current interpretation name—no label or arrow. The next row contains a narrow **Start/Stop** button, an optional **Reset** action, a two-state **↻** automatic-rerun toggle, and the **Speed** slider.

Start/Stop preserves the current state. Reset returns the app to its defined initial state and emits `qontic:reset`; apps enable it with `show-reset="true"`. With ↻ enabled, completion starts a newly sampled run automatically. With ↻ disabled, the simulation completes one run and stops. Speed is optional: apps should set `show-speed="false"` when faster evolution would reduce rendering smoothness or numerical clarity. The template intentionally has no pull-down run menu and no separate replay action.

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

## Shared layout and host controls

Link `../../shared/qontic-app.css`, then use `qontic-workspace`, `qontic-sidebar`, and `qontic-stage` for the responsive controls-and-canvas arrangement. Use `qontic-panel` and `qontic-control-panel` for the common surface treatment. Legacy apps may retain a small scoped adapter where old ID selectors must be neutralized, but new apps should not reproduce the shared grid or breakpoint rules.

Model-specific buttons use the global `.qontic-app-toggle`, `.active`, `.qontic-app-toggle--wide`, and `.qontic-app-toggle-group` classes. These classes intentionally live in `qontic-app.css`, outside the controls component's shadow DOM, so ordinary app buttons inherit them.

`mountQonticShortcuts` supplies the common Space (play/pause), R (reset), and S (screenshot) behavior and accepts an `additional` action map for model-specific keys. `mountExpandedResize` optionally adds display-only resizing to a canvas in the shared expanded dialog; apps provide their own storage key.

## Adoption rule

Import `../../shared/qontic-controls.js` and render the `<qontic-controls>` runtime component; do not copy its markup or CSS. Connect its standard events to the app engine. Do not copy the placeholder physics or force irrelevant controls into an app. The shared runtime component standardizes names, behavior, placement, states, and accessibility; `qontic-app.css` standardizes the surrounding responsive layout and host controls. The scientific engine and tab contents remain app-specific. Compatible updates to the shared modules propagate to every connected app.
