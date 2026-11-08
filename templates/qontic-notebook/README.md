# Q-Ontic notebook template (1.0)

Companion to `templates/qontic-app`. Notebooks get the same branded header (logo, breadcrumbs, purpose tooltip), footer (version, qonticlab@rice.edu), palette and light/dark themes as the apps.

## Files

- `../../shared/qontic-notebook.css` — notebook components, scoped to `body.qontic-notebook`. Load after `../../shared/qontic-shell.css`.
- `../../shared/qontic-notebook.js` — `mountQonticNotebook(options)`: mounts the app shell (`mountQonticShell`, breadcrumbs navigation), builds the sticky section bar from `section.section[id]` (label from `data-nav-label` or the h2), adds the light/dark switch (dark by default as in the apps; remembered in `localStorage` key `qontic-notebook-theme`), and wires every `[data-quiz]`.
- `index.html` — canonical structure; copy it to start a notebook.
- `legacy-demo-bar.html`, `notebook-template.css`, `qontic-notebook.js` (in this folder) — the earlier in-demo run bar, retained as a legacy reference. The double-slit notebook now uses the shared notebook shell.

## Page structure

```html
<body>
<main class="shell">
  <header><div><p class="eyebrow">Q-Ontic · Topic</p><h1>Title</h1></div></header>
  <div class="qn-intro"><p class="lead">…</p><p class="prereq"><b>You will need:</b> …</p></div>
  <section class="section" id="s1" data-nav-label="1 Short label">…</section>
</main>
<script type="module">
  import { mountQonticNotebook } from '../../shared/qontic-notebook.js?v=1.0';
  mountQonticNotebook({ title, eyebrow, purpose, version, breadcrumbs? });
</script>
```

Options are those of `mountQonticShell` (title, eyebrow, purpose, version, breadcrumbs, homeHref, labHref, showBranding, showFooter) plus `theme` ('dark' | 'light', default before the reader chooses) and `sectionBar` (false to omit).

## Section contract

Each section: title and one-line purpose; plain explanation; “What to notice”; demonstration (`.section-body` with `.canvas-card` and `.controls`); optional `.challenges`; collapsed `details.derivation` for math and caveats; optional `.quiz` that needs the idea, not the wording.

Components: `.prose`, `.formula`, `.notice`, `.controls` (`.buttons`/`.button(.primary)`, `.row` with label + output + range, `.check`, `fieldset`), `.readout` (`.hl` agreement, `.bad` disagreement, `.sub` expected values), `.mini(.warn)`, `.challenges` (`li.done` ticks), `.quiz` (`button[data-ok][data-fb]`, `.fb`), `.cards/.card`, `.references`.

Reading depth: mark text `.qn-brief` (shown only in Brief) or `.qn-full` (only in Full). Brief/Full buttons appear in the section bar when any such element exists; Brief is the default and the choice is remembered (`qontic-notebook-depth`). A section marked `.qn-full` drops out of the section bar in Brief. Each `.prose.qn-brief` gets a “Full explanation” link. Brief should keep the section heads, a two-to-three-sentence summary, “What to notice”, the demonstration, challenges and questions; Full adds the explanations and the collapsed math.

Canvases stay dark in both themes. Questions dispatch a bubbling `qontic:quiz` event `{quiz, correct}`.

## Reference adoption

`notebooks/bell-atom` (0.2.1), and `notebooks/double-slit` (development draft; layout migration under review).
