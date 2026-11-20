// Optional Engine tab for Q-Ontic apps that compute the same experiment with more than one
// physics engine (e.g. a closed-form model and a numerical solver). The controls component
// shows the tab with <qontic-controls show-engine="true">; this module fills its pane.
//
//   const tab = mountQonticEngineTab({
//     panel,                                  // the element shown for the "engine" tab
//     intro: 'The same geometry, computed with two models. …',
//     engines: [
//       { id: 'analytical', label: 'Analytical', title: 'tooltip', note: 'one line under the switch' },
//       { id: 'numerical',  label: 'Numerical',  title: '…',       note: '…' },
//     ],
//     value: 'analytical',                    // the engine the app opens with (first by default)
//     onChange: id => app.setEngine(id),
//   });
//   tab.options('numerical').append(rows);   // options shown only while that engine is active
//   tab.setNote('Grid 400 × 232 …');         // replace the note of the active engine
//   tab.setValue('numerical');               // switch from code (does not call onChange)
//
// Keep the engine choice out of Core: students meet one model first; the Engine tab and a
// one-time hint (e.g. in the caption after the first run) introduce the second.
const STYLE_ID = "qontic-engine-tab-style";
const CSS = `.qontic-engine-intro{font-size:12px;line-height:1.45;margin:2px 0 8px;opacity:.9}
.qontic-engine-row{display:flex;flex-wrap:wrap;align-items:center;gap:6px;margin:0 0 4px}
.qontic-engine-row>.qontic-engine-label{font-size:12px;font-weight:600;min-width:52px;margin-right:4px}
.qontic-engine-row button{flex:1 1 0;min-width:0}
.qontic-engine-row button.active{background:#2d6e86;border-color:#7ee9fb;color:#fff}
.qontic-engine-note{font-size:11px;line-height:1.35;margin:2px 0 6px;opacity:.85}
.qontic-engine-options{margin-top:8px;padding-top:6px;border-top:1px solid var(--border-color,#476477)}
.qontic-engine-options[hidden]{display:none!important}`;

export function mountQonticEngineTab({ panel, engines, value = engines?.[0]?.id, intro = "", onChange = null, label = "Engine" }) {
  if (!panel || !engines?.length) return null;
  if (!document.getElementById(STYLE_ID)) { const st = document.createElement("style"); st.id = STYLE_ID; st.textContent = CSS; document.head.append(st); }
  const introEl = document.createElement("p"); introEl.className = "qontic-engine-intro"; introEl.innerHTML = intro; introEl.hidden = !intro;
  const row = document.createElement("div"); row.className = "qontic-engine-row"; row.setAttribute("role", "group");
  const labelEl = document.createElement("span"); labelEl.className = "qontic-engine-label"; labelEl.id = `qontic-engine-label-${Math.random().toString(36).slice(2, 8)}`; labelEl.textContent = label;
  row.setAttribute("aria-labelledby", labelEl.id); row.append(labelEl);
  const note = document.createElement("p"); note.className = "qontic-engine-note"; note.setAttribute("aria-live", "polite");
  const buttons = new Map(), optionBoxes = new Map();
  for (const e of engines) {
    const b = document.createElement("button"); b.type = "button"; b.className = "qontic-app-toggle"; b.dataset.engine = e.id; b.textContent = e.label || e.id;
    if (e.title) b.title = e.title;
    b.addEventListener("click", () => { if (b.disabled || current === e.id) return; set(e.id); onChange?.(e.id); });
    row.append(b); buttons.set(e.id, b);
    const box = document.createElement("div"); box.className = "qontic-engine-options"; box.dataset.engineOptions = e.id; box.hidden = true; optionBoxes.set(e.id, box);
  }
  panel.append(introEl, row, note, ...optionBoxes.values());
  let current = null;
  function set(id) {
    current = id;
    for (const [k, b] of buttons) { const on = k === id; b.classList.toggle("active", on); b.setAttribute("aria-pressed", String(on)); }
    for (const [k, box] of optionBoxes) box.hidden = k !== id || !box.childElementCount;
    note.textContent = engines.find(e => e.id === id)?.note || "";
  }
  set(value);
  return {
    get value() { return current; },
    setValue: id => set(id),
    setNote: text => { note.textContent = text; },
    // Container for options of one engine; shown only while that engine is active.
    options(id) { const box = optionBoxes.get(id); if (box) queueMicrotask(() => set(current)); return box; },
    disable(id, reason) { const b = buttons.get(id); if (b) { b.disabled = true; if (reason) b.title = reason; } },
    elements: { intro: introEl, row, note, buttons, optionBoxes },
  };
}
