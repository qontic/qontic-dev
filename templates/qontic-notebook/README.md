# Q-Ontic notebook template

This is the canonical companion to `templates/qontic-app`. It is intended for guided, multi-section notebooks in which several related visualizations share one physical state.

## Shared Q-Ontic language

- Play/Pause, speed, and representation remain permanently available.
- Control typography is regular weight and compact.
- Results float over the canvas and may be collapsed.
- Secondary controls use Core, Advanced, and Graphics groups when a section needs enough controls to justify tabs.
- Light/dark appearance is a display preference, never a physics parameter.

## Notebook-specific contract

- The header supplies section navigation and Brief/Full reading depth.
- Global physical parameters have one state. A section may repeat a relevant slider locally, but every copy must remain synchronized.
- Each section follows: title and purpose; “What to notice”; visualization; compact local controls; collapsed “Details and math.”
- A notebook may omit representations that it does not implement. Never display a representation button that changes only the label.
- A deterministic notebook may replace “New run” with a task-specific action such as clearing a detector record.

## Canonical files

- `index.html` — structural reference.
- `notebook-template.css` — shell, command bar, local controls, and floating results.
- `qontic-notebook.js` — menu, representation, theme, and result-panel behavior.

The scientific engine remains notebook-specific. The tunneling notebook is the first reference adoption.
