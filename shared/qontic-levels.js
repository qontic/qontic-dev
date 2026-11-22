// Level of detail for a Q-Ontic app: Basic · Standard · Expert (or any ordered list).
//
// The switch itself and the hiding of marked elements live in <qontic-controls>
// (attributes levels, level, tab-levels; elements with data-level-min /
// data-level-max). This module adds what every app with levels needs around it:
//   - the level is remembered (localStorage) and can come from the link (?level= or #level=);
//   - a first-time visitor starts at the lowest level, unless the link uses settings
//     that need a higher one (raiseFor);
//   - a setting hidden by the level goes back to its default, and the user's own value
//     is kept and comes back when the level shows the setting again.
//
// mountQonticLevels({
//   controls,                 // the <qontic-controls> element
//   storageKey,               // e.g. 'qontic-weak-velocity'
//   levels: ['basic', 'standard', 'expert'],
//   settings: [{ id, min, get, set, value }],   // id: stable name; min: lowest level that shows it;
//                                               // value: the default used below that level
//   minimumLevel: () => 'basic',                // optional: lowest level the opening link needs
//   onChange: (level) => {},                    // after defaults are applied
//   keepAcrossLoads: false,                     // true for apps that also keep their settings
//                                               // between visits; otherwise saved values last one page load
// }) -> { level(), set(level), rank(level) }
export function mountQonticLevels({ controls, storageKey, levels = ['basic', 'standard', 'expert'], settings = [], minimumLevel = null, onChange = () => {}, keepAcrossLoads = false }) {
  const rank = (l) => Math.max(0, levels.indexOf(l));
  const LEVEL_KEY = `${storageKey}-level`, SAVED_KEY = `${storageKey}-level-saved`;
  const read = (k) => { try { return localStorage.getItem(k); } catch (e) { return null; } };
  const write = (k, v) => { try { localStorage.setItem(k, v); } catch (e) { /* storage unavailable */ } };
  let saved = {};
  if (keepAcrossLoads) { try { saved = JSON.parse(read(SAVED_KEY) || '{}') || {}; } catch (e) { saved = {}; } }
  const same = (a, b) => (typeof a === 'number' && typeof b === 'number' ? Math.abs(a - b) < 1e-9 : JSON.stringify(a) === JSON.stringify(b));
  let current = null;

  function apply(level) {
    if (!levels.includes(level)) level = levels[0];
    current = level;
    if (controls.getAttribute('level') !== level) controls.setAttribute('level', level);
    document.body.dataset.qonticLevel = level;
    write(LEVEL_KEY, level);
    for (const s of settings) {
      if (rank(s.min) > rank(level)) {
        const v = s.get();
        if (!(s.id in saved)) saved[s.id] = v;
        if (!same(v, s.value)) s.set(s.value);
      } else if (s.id in saved) {
        const v = saved[s.id]; delete saved[s.id];
        if (!same(s.get(), v)) s.set(v);
      }
    }
    write(SAVED_KEY, JSON.stringify(saved));
    onChange(level);
  }

  controls.addEventListener('qontic:level', (e) => apply(e.detail.level));
  const params = new URLSearchParams(location.search), hash = new URLSearchParams(location.hash.slice(1));
  const fromLink = hash.get('level') || params.get('level');
  let start = levels.includes(fromLink) ? fromLink : levels.includes(read(LEVEL_KEY)) ? read(LEVEL_KEY) : levels[0];
  // A link that uses higher-level settings opens at the level that shows them.
  if (!levels.includes(fromLink) && minimumLevel) { const need = minimumLevel(); if (rank(need) > rank(start)) start = need; }
  apply(start);
  return { level: () => current, set: apply, rank };
}
