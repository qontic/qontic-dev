const INTERPRETATIONS = [
  ["cpn", "Orthodox"],
  ["pw", "Pilot Wave"],
  ["mw", "Many Worlds"],
];
// Optional entries an app may opt into with the `interpretations` attribute,
// e.g. interpretations="cpn,pw,mw,sc". The default cycle is unchanged.
const OPTIONAL_INTERPRETATIONS = [
  ["sc", "Spontaneous Collapse"],
];
const interpretationList = element => {
  const requested = (element.getAttribute("interpretations") || "").split(",").map(id => id.trim()).filter(Boolean);
  if (!requested.length) return INTERPRETATIONS;
  const catalog = [...INTERPRETATIONS, ...OPTIONAL_INTERPRETATIONS];
  const list = requested.map(id => catalog.find(([known]) => known === id)).filter(Boolean);
  return list.length ? list : INTERPRETATIONS;
};

const boolAttr = (element, name, fallback = false) => {
  const value = element.getAttribute(name);
  return value == null ? fallback : value !== "false";
};

const parseLevels = value => (value || "").split(",").map(t => t.trim()).filter(Boolean).map(t => { const [id, label] = t.split(":"); return [id, label || id[0].toUpperCase() + id.slice(1)]; });
// One page-wide rule set for data-level-min / data-level-max (light DOM).
const installLevelStyle = order => {
  const key = order.join(",");
  let style = document.getElementById("qontic-level-style");
  if (style?.dataset.key === key) return;
  if (!style) { style = document.createElement("style"); style.id = "qontic-level-style"; document.head.append(style); }
  style.dataset.key = key;
  const rules = [];
  order.forEach((current, i) => {
    // :is(..., #_#_#_) lifts the specificity to three ids, so app rules that set display
    // on the same rows (often through an id) do not win over the level.
    order.slice(i + 1).forEach(higher => rules.push(`body[data-qontic-level="${current}"] :is([data-level-min="${higher}"],#_#_#_)`));
    order.slice(0, i).forEach(lower => rules.push(`body[data-qontic-level="${current}"] :is([data-level-max="${lower}"],#_#_#_)`));
  });
  style.textContent = rules.length ? `${rules.join(",")}{display:none!important}` : "";
};

class QonticControls extends HTMLElement {
  static observedAttributes = ["interpretation", "interpretations", "running", "auto-run", "speed", "active-tab", "accent", "theme", "show-interpretation", "show-autorun", "show-reset", "show-rerun", "show-speed", "speed-min", "speed-max", "speed-step", "disabled", "show-tabs", "show-appearance", "show-advanced", "show-expert", "extra-tabs", "show-engine", "levels", "level", "tab-levels"];

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.innerHTML = `
      <link rel="stylesheet" href="${new URL("./qontic-controls.css?v=6", import.meta.url).href}">
      <section class="qontic-common-controls" aria-label="Simulation controls">
        <div class="qontic-level" role="radiogroup" aria-label="Level of detail" hidden></div>
        <button class="qontic-interpretation" type="button"></button>
        <div class="qontic-run-row" role="group" aria-label="Run controls">
          <button class="qontic-main-run" type="button"></button>
          <button class="qontic-reset" type="button">Reset</button>
          <button class="qontic-rerun" type="button" aria-label="Rerun simulation" title="Restart and run with the current settings" hidden>↻</button>
          <button class="qontic-auto-rerun" type="button">↻</button>
          <label class="qontic-speed"><span>Speed</span><input type="range" min=".1" max="4" step=".05"><output></output></label>
        </div>
        <nav class="qontic-control-tabs" role="tablist" aria-label="Control sections">
          <button type="button" data-tab="core" role="tab">Core</button>
          <button type="button" data-tab="advanced" role="tab">Advanced</button>
          <button type="button" data-tab="expert" role="tab">Expert</button>
          <button type="button" data-tab="display" role="tab">Display</button>
        </nav>
        <div class="qontic-common-display" hidden>
          <button class="qontic-theme-toggle" type="button" role="switch"><span>Light theme</span><i></i></button>
        </div>
      </section>`;
  }

  connectedCallback() {
    if (this._connected) return;
    this._connected = true;
    const root = this.shadowRoot;
    root.querySelector(".qontic-level").addEventListener("click", event => {
      const button = event.target.closest("[data-level]");
      if (!button || button.dataset.level === this.getAttribute("level")) return;
      this.setAttribute("level", button.dataset.level);
      this.dispatch("level", { level: button.dataset.level });
    });
    root.querySelector(".qontic-interpretation").addEventListener("click", () => {
      const list = interpretationList(this);
      const current = this.getAttribute("interpretation") || list[0][0];
      const index = list.findIndex(([id]) => id === current);
      const interpretation = list[(index + 1) % list.length][0];
      this.setAttribute("interpretation", interpretation);
      this.dispatch("interpretation", { interpretation });
    });
    root.querySelector(".qontic-main-run").addEventListener("click", () => {
      const running = !boolAttr(this, "running");
      this.setAttribute("running", String(running));
      this.dispatch(running ? "start" : "stop", { running });
    });
    root.querySelector(".qontic-reset").addEventListener("click", () => {
      this.dispatch("reset", {});
    });
    root.querySelector(".qontic-rerun").addEventListener("click", () => {
      this.dispatch("rerun", {});
    });
    root.querySelector(".qontic-auto-rerun").addEventListener("click", () => {
      const autoRun = !boolAttr(this, "auto-run", true);
      this.setAttribute("auto-run", String(autoRun));
      this.dispatch("autorun", { autoRun });
    });
    root.querySelector(".qontic-speed input").addEventListener("input", event => {
      const speed = +event.target.value;
      this.setAttribute("speed", String(speed));
      this.dispatch("speed", { speed });
    });
    root.querySelector(".qontic-control-tabs").addEventListener("click", event => {
      const button = event.target.closest("[data-tab]");
      if (button) {
        this.setAttribute("active-tab", button.dataset.tab);
        this.dispatch("tab", { tab: button.dataset.tab });
      }
    });
    root.querySelector(".qontic-theme-toggle").addEventListener("click", () => {
      const theme = (this.getAttribute("theme") || "dark") === "light" ? "dark" : "light";
      this.setAttribute("theme", theme);
      this.dispatch("theme", { theme });
    });
    this.sync();
  }

  attributeChangedCallback() {
    if (this._connected) this.sync();
  }

  dispatch(name, detail) {
    this.dispatchEvent(new CustomEvent(`qontic:${name}`, { detail, bubbles: true }));
  }

  sync() {
    const root = this.shadowRoot;
    const list = interpretationList(this);
    const interpretation = this.getAttribute("interpretation") || list[0][0];
    const [, label] = list.find(([id]) => id === interpretation) || list[0];
    const interpretationButton = root.querySelector(".qontic-interpretation");
    interpretationButton.hidden = this.getAttribute("show-interpretation") === "false";
    interpretationButton.textContent = label;
    interpretationButton.style.setProperty("--qontic-control-accent", this.getAttribute("accent") || "#55d8e6");
    interpretationButton.title = "Click to change interpretation";
    // Screen readers: say what the button is, what it shows now and what it switches to.
    const next = list[(list.findIndex(([id]) => id === interpretation) + 1) % list.length][1];
    interpretationButton.setAttribute("aria-label", list.length > 1 ? `Interpretation: ${label}. Activate to switch to ${next}.` : `Interpretation: ${label}`);

    const running = boolAttr(this, "running");
    const runButton = root.querySelector(".qontic-main-run");
    runButton.textContent = running ? "Stop" : "Start";
    runButton.setAttribute("aria-label", running ? "Stop simulation" : "Start simulation");

    const resetButton = root.querySelector(".qontic-reset");
    resetButton.hidden = this.getAttribute("show-reset") !== "true";
    resetButton.setAttribute("aria-label", "Reset simulation");
    resetButton.title = "Return the simulation to its initial state";

    root.querySelector(".qontic-rerun").hidden = this.getAttribute("show-rerun") !== "true";

    const autoRun = boolAttr(this, "auto-run", true);
    const autoButton = root.querySelector(".qontic-auto-rerun");
    autoButton.hidden = this.getAttribute("show-autorun") === "false";
    const runRow = root.querySelector(".qontic-run-row");
    runRow.classList.toggle("without-autorun", autoButton.hidden);
    runRow.classList.toggle("without-reset", resetButton.hidden);
    autoButton.classList.toggle("active", autoRun);
    autoButton.setAttribute("aria-pressed", String(autoRun));
    autoButton.setAttribute("aria-label", `Auto rerun ${autoRun ? "on" : "off"}`);
    autoButton.title = autoRun ? "Auto rerun is on. Click for one run only." : "One run only. Click to automatically rerun.";

    const speedControl = root.querySelector(".qontic-speed");
    speedControl.hidden = this.getAttribute("show-speed") === "false";
    const speed = +(this.getAttribute("speed") || 1);
    const speedInput = root.querySelector(".qontic-speed input");
    // Additive public configuration: adapters never need shadow DOM selectors.
    for (const name of ["min", "max", "step"]) {
      if (this.hasAttribute(`speed-${name}`)) speedInput[name] = this.getAttribute(`speed-${name}`);
    }
    if (root.activeElement !== speedInput) speedInput.value = String(speed);
    speedInput.setAttribute("aria-label", "Simulation speed");
    root.querySelector(".qontic-speed output").value = `${speed.toFixed(1)}×`;

    // Optional level switch (additive): levels="basic:Basic,standard:Standard,expert:Expert",
    // level="basic", tab-levels="advanced:standard,engine:standard" (lowest level that shows
    // a tab). The level is mirrored on <body data-qontic-level>; any element in the page with
    // data-level-min="standard" (or "expert") is hidden below that level, and one with
    // data-level-max="basic" only shows at that level or below.
    const levels = parseLevels(this.getAttribute("levels"));
    const levelBox = root.querySelector(".qontic-level");
    levelBox.hidden = !levels.length;
    let level = null, rank = () => Infinity;
    if (levels.length) {
      level = levels.some(([id]) => id === this.getAttribute("level")) ? this.getAttribute("level") : levels[0][0];
      const html = levels.map(([id, label]) => `<button type="button" role="radio" data-level="${id}">${label}</button>`).join("");
      if (levelBox.dataset.html !== html) { levelBox.innerHTML = `<span>Level</span>${html}`; levelBox.dataset.html = html; }
      levelBox.querySelectorAll("[data-level]").forEach(b => { const on = b.dataset.level === level; b.classList.toggle("active", on); b.setAttribute("aria-checked", String(on)); b.tabIndex = on ? 0 : -1; });
      const order = levels.map(([id]) => id);
      rank = id => (order.includes(id) ? order.indexOf(id) : 0);
      installLevelStyle(order);
      if (document.body && document.body.dataset.qonticLevel !== level) document.body.dataset.qonticLevel = level;
    }
    const tabMin = Object.fromEntries((this.getAttribute("tab-levels") || "").split(",").map(t => t.trim().split(":")).filter(t => t[0] && t[1]));
    const levelHides = id => level != null && tabMin[id] != null && rank(tabMin[id]) > rank(level);

    const showAdvanced = this.getAttribute("show-advanced") !== "false" && !levelHides("advanced");
    const advancedButton = root.querySelector('[data-tab="advanced"]');
    advancedButton.hidden = !showAdvanced;
    const showExpert = this.getAttribute("show-expert") === "true";
    const expertButton = root.querySelector('[data-tab="expert"]');
    expertButton.hidden = !showExpert;
    // Optional app tabs after Core (additive; apps without these attributes are unchanged):
    // show-engine="true" adds an Engine tab (an app with more than one physics engine; see
    // shared/qontic-engine-tab.js), extra-tabs="id:Label,id2:Label2" adds others. The grid
    // then has one column per visible tab.
    const nav = root.querySelector(".qontic-control-tabs");
    const extra = (this.getAttribute("extra-tabs") || "").split(",").map(t => t.trim()).filter(Boolean).map(t => t.split(":"));
    if (this.getAttribute("show-engine") === "true" && !extra.some(([id]) => id === "engine")) extra.unshift(["engine", "Engine"]);
    let anchor = nav.querySelector('[data-tab="core"]');
    for (const [id, label] of extra) {
      let b = nav.querySelector(`[data-tab="${id}"]`);
      if (!b) { b = document.createElement("button"); b.type = "button"; b.dataset.tab = id; b.dataset.extraTab = "1"; b.setAttribute("role", "tab"); b.textContent = label || id; anchor.after(b); }
      b.hidden = levelHides(id); anchor = b;
    }
    nav.querySelectorAll("[data-extra-tab]").forEach(b => { if (!extra.some(([id]) => id === b.dataset.tab)) b.hidden = true; });
    if (nav.querySelector(`[data-tab="${this.getAttribute("active-tab")}"]`)?.hidden) { this.setAttribute("active-tab", "core"); this.dispatch("tab", { tab: "core" }); }
    let tab = this.getAttribute("active-tab") || "core";
    if ((tab === "advanced" && !showAdvanced) || (tab === "expert" && !showExpert)) {
      tab = "core";
      this.setAttribute("active-tab", tab);
    }
    const showTabs = this.getAttribute("show-tabs") !== "false";
    const showAppearance = this.getAttribute("show-appearance") === "true" || (showTabs && tab === "display");
    root.querySelector(".qontic-control-tabs").hidden = !showTabs;
    root.querySelector(".qontic-common-display").hidden = !showAppearance;
    const disabled = boolAttr(this, "disabled");
    root.querySelectorAll("button, input").forEach(control => { control.disabled = disabled; });
    root.querySelectorAll("[data-tab]").forEach(button => {
      const active = button.dataset.tab === tab;
      button.classList.toggle("active", active);
      button.setAttribute("aria-selected", String(active));
    });
    if (extra.length || levels.length || nav.querySelector("[data-extra-tab]")) nav.style.gridTemplateColumns = `repeat(${[...nav.querySelectorAll("[data-tab]")].filter(b => !b.hidden).length},minmax(0,1fr))`;

    const theme = this.getAttribute("theme") || "dark";
    const light = theme === "light";
    document.documentElement.classList.toggle("qontic-light", light);
    document.body?.classList.toggle("qontic-light", light);
    const themeButton = root.querySelector(".qontic-theme-toggle");
    themeButton.setAttribute("aria-checked", String(light));
    themeButton.classList.toggle("active", light);
  }
}

if (!customElements.get("qontic-controls")) customElements.define("qontic-controls", QonticControls);
export { QonticControls };
