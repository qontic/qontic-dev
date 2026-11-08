# Double-slit companion notebook — development draft

This notebook is available only on qontic-dev while its graphics and teaching
content are reviewed. Publishing it to the public site requires a separate
review and approval.

The page uses the canonical notebook template:

- `shared/qontic-shell.css` for the app-style header, navigation and footer;
- `shared/qontic-notebook.css` and `shared/qontic-notebook.js` for the notebook
  layout, section bar, themes, Brief/Full reading modes and quizzes;
- `notebook.css` and `notebook-ui.js` for the double-slit controls and readouts.

The migration preserves all five figures, prediction questions, team tasks and
the full inline simulation engine. The engine was compared byte for byte with
the preceding version (SHA-256
`934aa2b50cbb3e6dcb4da0a77a1643460a79acb55909f95590aa7eb3e94668bb`).
Results now sit below the figures rather than covering the wave. Pause and
restart/clear controls are visible, without the former dropdown. Full is the
default unless a reading preference is saved; the reset button clears it.

Validation: catalog build, unchanged engine, unique HTML IDs, five correctly
wired template quizzes; desktop browser checks of Brief/Full, light/dark,
batch hit counts, which-slit controls, interpretation switching and feedback.
