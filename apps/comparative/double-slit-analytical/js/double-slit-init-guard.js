// Defensive startup guard for the analytical double-slit demo.
// This runs after double-slit.js is parsed but before jQuery's document-ready
// initialization callbacks execute.
(function () {
  const defaults = {
    'wavelength': 100,
    'screen-height': 1200,
    'det-pixels': 100,
    'source-position': 225,
    'slit-separation': 500,
    'detector-distance': 400
  };

  // Old saved UI state can call updateParameter() during startup before all
  // generated controls are fully usable. Clear it for the dev build so startup
  // is deterministic while the layout/telemetry work is being tested.
  try {
    window.localStorage && window.localStorage.removeItem('doubleSlitState');
  } catch (_err) {}

  function numericValue(id) {
    const slider = document.getElementById(id);
    const number = document.getElementById(id + '-input') || document.getElementById(id + 'Val');
    const raw = slider && slider.value !== '' ? slider.value : (number ? number.value : defaults[id]);
    const val = parseFloat(raw);
    return Number.isFinite(val) ? val : defaults[id];
  }

  function ensureAccessor(id) {
    let group = document.getElementById(id + '-group');
    if (!group) {
      group = document.createElement('div');
      group.id = id + '-group';
      group.style.display = 'none';
      document.body.appendChild(group);
    }
    if (typeof group.getValueInFirstUnit !== 'function') {
      group.getValueInFirstUnit = function () { return numericValue(id); };
    }
    if (typeof group.setValueInFirstUnit !== 'function') {
      group.setValueInFirstUnit = function (value) {
        const slider = document.getElementById(id);
        const number = document.getElementById(id + '-input') || document.getElementById(id + 'Val');
        if (slider) slider.value = value;
        if (number) number.value = value;
      };
    }
  }

  function ensureCoreParameterAccessors() {
    Object.keys(defaults).forEach(ensureAccessor);
  }

  const originalSetupGeo = window.setupGeo;
  if (typeof originalSetupGeo === 'function') {
    window.setupGeo = function guardedSetupGeo() {
      ensureCoreParameterAccessors();
      return originalSetupGeo.apply(this, arguments);
    };
  }

  // Also run once after DOM creation, before later user interactions.
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', ensureCoreParameterAccessors, { once: true });
  } else {
    ensureCoreParameterAccessors();
  }
})();