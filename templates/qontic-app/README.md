# Q-Ontic app template

This is the canonical template for a simulation-style Q-Ontic app.

## Files

- `index.html` — live reference showing the standard regions and behavior.
- `starter.html` — minimal file to copy when beginning a new app.
- `starter.css` — baseline layout for the starter and reference pages.
- `../../shared/qontic-shell.js` — shared header, title-purpose help, compact Demo/Math tabs, navigation, and footer.
- `../../shared/qontic-shell.css` — shared Q-Ontic branding and responsive shell styles.
- `../../shared/qontic-logo.png` — current placeholder logo.

## Start a new app

1. Copy `starter.html` and `starter.css` into the new app directory.
2. Keep the required structural hooks: `main.shell`, its direct `header`, `nav.tabs`, `.lab`, and `.details-panel`.
3. Update the `mountQonticShell({...})` configuration near the bottom of `starter.html`.
4. Replace the placeholder visualization and controls, but preserve the shell structure and the Demo/Math tabs.
5. Use app-specific CSS only for the scientific visualization and controls. Put broadly reusable changes in `shared/qontic-shell.css`.

## Configuration

```js
mountQonticShell({
  title: 'Your app title',
  eyebrow: 'Comparative quantum demonstration',
  purpose: 'One or two sentences explaining what the user should investigate.',
  badge: 'Model or method label',
  version: 'App version',
  homeHref: '../../index.html',
  labHref: 'https://qonticlab.rice.edu/'
});
```

The purpose is shown when the title is hovered or focused and is automatically repeated at the beginning of the Math view.

## Template contract

Standardize these elements across apps:

- logo, app title, navigation, and version/model badge;
- compact Demo and Math views;
- title-purpose tooltip;
- stage indicator when the simulation has meaningful stages;
- primary visualization plus a consistent control column;
- mathematical/model explanation in the Math view;
- shared footer and responsive behavior.

The scientific visualization, controls, number of stages, and interpretation-specific behavior remain app-specific.
