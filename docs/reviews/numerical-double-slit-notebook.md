# Numerical double-slit notebook review and template preview

## Recommendation

Use the shared notebook template, retaining the numerical notebook and standalone
WebGL2 app as distinct listed resources. Preview the migration on dev first.
The old notebook is preserved at `notebooks/double-slit-webgl/index-pre-template.html`.

## Findings addressed in the dev preview

- The progression from one trajectory to multiple configurations and equivariance
  is useful. Add explicit observation tasks and three short concept checks.
- Replace the custom page shell with the shared header, section bar, light/dark
  themes, Brief/Full reading depth and quiz feedback. Full is the initial default.
- Keep essential explanations, demonstrations and questions in Brief. Put the
  full equations behind a disclosure in Full.
- Distinguish wave phase/density, particle trails and independent configurations.
- The phase-gradient formula applies to the scalar Schrödinger setting fixed in
  the focused presets. The standalone app also offers an additional Pauli current.
- Replace the unqualified conclusion that the views are empirically equivalent
  with the conditional equivariance statement. A finite animation does not prove
  universal measurement equivalence or relaxation from an arbitrary distribution.
- The model has a finite grid, absorbing edges, particle freezing/removal,
  a density floor and velocity cap. These limit visual equivariance comparisons,
  especially near nodes and boundaries. No convergence result is claimed.
- An unsupported WebGL2 browser keeps the static preview with a clear message.

## Scope and author review

The updated teaching text is explicitly marked as a dev proposal for author
review. The prior notebook is preserved byte for byte. main.js, full-applet.html,
shaders, numerical constants, three presets and preview images are unchanged.
The standalone WebGL2 entry and production notebook are unchanged.

## Verification

Catalog build, source equality, unique IDs, local dependency URLs, three original
preset URLs and three quizzes checked. Browser checks cover the template, reading
depth, themes, feedback, old-layout link, speed controls and WebGL2 fallback.
The test browser lacks WebGL2; numerical animation, performance, convergence and
phone layout are not certified by this review. A WebGL2-capable browser trial is
still needed before promoting the preview.
