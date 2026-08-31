const INTERPRETATIONS = [
  ["cpn", "Orthodox"],
  ["pw", "Pilot Wave"],
  ["mw", "Many Worlds"],
];

const boolAttr = (element, name, fallback = false) => {
  const value = element.getAttribute(name);
  return value == null ? fallback : value !== "false";
};

class QonticControls extends HTMLElement {
  static observedAttributes = ["interpretation", "running", "auto-run", "speed", "active-tab", "accent"];

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.innerHTML = `
      <link rel="stylesheet" href="${new URL("./qontic-controls.css", import.meta.url).href}">
      <section class="qontic-common-controls" aria-label="Simulation controls">
        <button class="qontic-interpretation" type="button"></button>
        <div class="qontic-run-row" role="group" aria-label="Run controls">
          <button class="qontic-main-run" type="button"></button>
          <button class="qontic-auto-rerun" type="button">↻</button>
          <label class="qontic-speed"><span>Speed</span><input type="range" min=".1" max="4" step=".05"><output></output></label>
        </div>
        <nav class="qontic-control-tabs" role="tablist" aria-label="Control sections">
          <button type="button" data-tab="core" role="tab">Core</button>
          <button type="button" data-tab="advanced" role="tab">Advanced</button>
          <button type="button" data-tab="display" role="tab">Display</button>
        </nav>
      </section>`;
  }

  connectedCallback() {
    if (this._connected) return;
    this._connected = true;
    const root = this.shadowRoot;
    root.querySelector(".qontic-interpretation").addEventListener("click", () => {
      const current = this.getAttribute("interpretation") || "cpn";
      const index = INTERPRETATIONS.findIndex(([id]) => id === current);
      const interpretation = INTERPRETATIONS[(index + 1) % INTERPRETATIONS.length][0];
      this.setAttribute("interpretation", interpretation);
      this.dispatch("interpretation", { interpretation });
    });
    root.querySelector(".qontic-main-run").addEventListener("click", () => {
      const running = !boolAttr(this, "running");
      this.setAttribute("running", String(running));
      this.dispatch(running ? "start" : "stop", { running });
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
    const interpretation = this.getAttribute("interpretation") || "cpn";
    const [, label] = INTERPRETATIONS.find(([id]) => id === interpretation) || INTERPRETATIONS[0];
    const interpretationButton = root.querySelector(".qontic-interpretation");
    interpretationButton.textContent = label;
    interpretationButton.style.setProperty("--qontic-control-accent", this.getAttribute("accent") || "#55d8e6");
    interpretationButton.title = "Click to change interpretation";

    const running = boolAttr(this, "running");
    const runButton = root.querySelector(".qontic-main-run");
    runButton.textContent = running ? "Stop" : "Start";
    runButton.setAttribute("aria-label", running ? "Stop simulation" : "Start simulation");

    const autoRun = boolAttr(this, "auto-run", true);
    const autoButton = root.querySelector(".qontic-auto-rerun");
    autoButton.classList.toggle("active", autoRun);
    autoButton.setAttribute("aria-pressed", String(autoRun));
    autoButton.setAttribute("aria-label", `Auto rerun ${autoRun ? "on" : "off"}`);
    autoButton.title = autoRun ? "Auto rerun is on. Click for one run only." : "One run only. Click to automatically rerun.";

    const speed = +(this.getAttribute("speed") || 1);
    const speedInput = root.querySelector(".qontic-speed input");
    if (document.activeElement !== speedInput) speedInput.value = String(speed);
    root.querySelector(".qontic-speed output").value = `${speed.toFixed(1)}×`;

    const tab = this.getAttribute("active-tab") || "core";
    root.querySelectorAll("[data-tab]").forEach(button => {
      const active = button.dataset.tab === tab;
      button.classList.toggle("active", active);
      button.setAttribute("aria-selected", String(active));
    });
  }
}

if (!customElements.get("qontic-controls")) customElements.define("qontic-controls", QonticControls);
export { QonticControls };
