# Shared Q-Ontic app template: compatibility and releases

The template is executable shared code, not a set of copied pages:

- `shared/qontic-shell.js` and `.css`: branding, header, navigation, footer.
- `shared/qontic-controls.js` and `.css`: interpretation, playback, reset, rerun, speed, tabs, and appearance.
- Each app has a small adapter and scoped layout CSS. The adapter translates shared events into existing engine actions. Physics, accumulated statistics, canvas rendering, and recording belong to the app.

Free Particle uses `apps/comparative/free-particle/js/template-adapter.js`. Its original inputs remain hidden event endpoints so the engine, keyboard shortcuts, and recorder share one behavior. Existing inputs are moved rather than cloned. Shared components must not depend on any Free Particle IDs.

## Safe shared updates

Compatible shared changes automatically affect apps importing these paths. Query strings such as `?v=2.8` refresh caches; **they do not pin an immutable version**. Do not treat them as rollback protection.

1. Preserve existing attribute defaults, event names, and event payloads. Add optional features with unchanged defaults. Do not reach into an app engine from shared code.
2. Run `templates/qontic-app/controls-check.html` after changing shared controls. It checks default behavior, event payloads, event counts, programmatic synchronization, speed configuration, export locking, and expansion.
3. Test the canonical template and representative consumers in qontic-dev: Free Particle (including expanded view and video export), analytical Double Slit, and Measurement Detector. Check narrow layouts, both themes, reset/stop, and interpretation switching.
4. Stage a migration on an app preview before replacing its entry page. Preserve unrelated concurrent commits. Promote only the tested files.
5. Use Git history to revert a regression. Shared changes require a shared-file revert; an app adapter can be reverted independently.
6. A breaking API or layout redesign must use a separate major-version path and migrate apps individually. Once published, retain the previous major version until its consumers have migrated. Never silently replace the existing shared API with an incompatible one.

This limits the risk; a shared change can still regress multiple apps. The compatibility check is a gate, not a substitute for the representative app checks. Changes to qontic-dev do not modify the separate production repository.

## Added optional public attributes (2.8)

- `speed-min`, `speed-max`, `speed-step`: configure the speed input. Omitted attributes retain the current default and continue to support older adapters that configured the input directly.
- `disabled="true"`: disable controls while an app is exporting video. `disabled="false"` restores them.
- `show-tabs="false"`: hide tabs and the appearance section in a compact expanded-view toolbar. Defaults to visible.

Use these public attributes and the documented `qontic:*` events. New adapters must not query or modify internal shadow-DOM elements. Keep app styles scoped to an app class.

## Optional expansion and live video
Import `mountQonticMedia` from `shared/qontic-media.js` and call it with:
- `stage`: the simulation wrapper; receives Expand Simulation and Record Video actions.
- `controls`: optional shared controls, moved into the expanded dialog and restored intact.
- `getCanvases()`: visible canvas layers in painting order (background first); CSS placement is preserved in the exported frame.
- `beginRecording()`: starts playback and returns an app-defined state token.
- `endRecording(token)`: restores playback after recording. Do not reset statistics.
- `filename`: download prefix.

The canonical demo and analytical Double Slit show working integrations. Escape restores the normal view. The recorder uses MediaRecorder, starts from the current state, captures up to 30 fps in real time, and offers preview plus download. Resolution changes output dimensions; it does not increase the model's spatial resolution. Only canvas layers are recorded, not DOM controls. Recording hooks should be synchronous. Do not change geometry or canvas placement during capture. Free Particle retains its model-specific offline renderer (snapshot, fixed frame stepping, high-resolution render); this optional shared recorder does not replace that engine.

The shared media toolbar uses four labeled SVG icon buttons: Screenshot, Share link, Expand/Restore, and Record video. Hover and keyboard focus reveal explanations. `getShareUrl()` optionally supplies a model-specific parameterized URL; the default is the current page URL. Screenshots composite the same ordered canvas layers as recording. Existing app-specific export buttons can be hidden when the shared actions are mounted.
