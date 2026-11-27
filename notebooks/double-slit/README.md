# Double-slit notebook

2026-11-27 (after a ten-student review): shortened. Title "Double Slit — Notebook"; Orthodox presented as the standard formalism, not an account. Parts: Basics · 1 Puzzle (incl. one electron at a time) · 2 Arrows (N-Slits Arrows at P) · 3 Which slit · 4 Views · 5 Full equation (optional, collapsed) · 6 Team + homework · 7 Refs. Opens in Brief. Frames sized by the app's height message. index.html is now edited directly (nb/build.py no longer used).

One notebook for the double slit (2026-11-27): the analytical notebook (Parts 1–5 and the
team questions) merged with the numerical one (now Part 6: the full Schrödinger equation,
reflection, a guided particle, many particles, equivariance). The demonstrations are
N-Slits 4.0 embedded (`embeds.js`: iframes of apps/comparative/n-slits in `?embed=1` mode,
set up by share-link hashes; the frame keeps its own settings). Parts 3 and 4 keep two
small figures N-Slits does not draw (`figures.js`: amplitude arrows at P; a partial
which-slit record), a far-field sketch of the same experiment.

The old numerical notebook is archived (archive/double-slit-webgl-notebook);
notebooks/double-slit-webgl redirects to Part 6.

---

Earlier notes (analytical notebook):

# Double-slit companion notebook

Published companion to the analytical three-view double-slit app. The development
copy is maintained in qontic-dev; the approved release is available on the public
site at `/notebooks/double-slit/`.

The notebook uses `shared/qontic-notebook.css` and `shared/qontic-notebook.js`,
with local `notebook.css` and `notebook-ui.js` for controls and readouts. Full is
the default unless a reading preference is saved; the reset button clears it.

The learner-review revisions separate prediction from observation, distinguish
phase shading from screen probabilities and hits, retain essential account
summaries in Brief, and add a three-band task with fixed conditions, a 25%
reference line and qualifying-peak count. There are six prediction/check questions.

Validation: catalog build; unchanged analytical propagation and slit model;
peak counts checked against a finer screen grid; browser checks of Brief/Full,
light/dark, shared conditions, reset, record clearing, quizzes and density display.
The learner reviews were simulated, not a study with real students.
