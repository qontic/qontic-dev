/*
 * Q-Ontic / QSF Google Analytics interaction tracking helper.
 *
 * This file intentionally tracks only coarse educational interaction choices:
 *   - which demo was opened
 *   - which representational view / interpretation is selected
 *   - which-path detector and slit configuration choices
 *   - wave-display choices such as phase, |psi|^2, log(|psi|^2), Q-potential
 *
 * It does not collect names, emails, free text, or student identifiers.
 */
(function () {
  'use strict';

  const MEASUREMENT_ID = 'G-ZWF6YQM0YV';
  const DEFAULT_DEMO_ID = inferDemoId();
  const DEFAULT_DEMO_TITLE = document.title || DEFAULT_DEMO_ID;
  const EVENT_DEBOUNCE_MS = 250;
  const pendingEvents = [];
  const lastEventTimes = new Map();

  function inferDemoId() {
    const path = window.location.pathname
      .replace(/\/$/, '')
      .split('/')
      .filter(Boolean)
      .slice(-3)
      .join('/');
    return path || 'qsf-demo';
  }

  function hasGtag() {
    return typeof window.gtag === 'function';
  }

  function ensureGtag() {
    window.dataLayer = window.dataLayer || [];

    if (!hasGtag()) {
      window.gtag = function () { window.dataLayer.push(arguments); };
      window.gtag('js', new Date());
      window.gtag('config', MEASUREMENT_ID);
    }

    if (!document.querySelector('script[data-qsf-gtag="true"]') &&
        !document.querySelector('script[src*="googletagmanager.com/gtag/js"]')) {
      const script = document.createElement('script');
      script.async = true;
      script.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(MEASUREMENT_ID);
      script.dataset.qsfGtag = 'true';
      script.onload = flushPendingEvents;
      document.head.appendChild(script);
    } else {
      window.setTimeout(flushPendingEvents, 0);
    }
  }

  function cleanValue(value) {
    if (value === null || value === undefined) return '';
    return String(value).trim().slice(0, 100);
  }

  function sendEvent(eventName, params) {
    const payload = Object.assign({
      demo_id: DEFAULT_DEMO_ID,
      demo_title: DEFAULT_DEMO_TITLE,
      page_path: window.location.pathname
    }, params || {});

    const debounceKey = eventName + ':' + JSON.stringify(payload);
    const now = Date.now();
    if ((lastEventTimes.get(debounceKey) || 0) + EVENT_DEBOUNCE_MS > now) return;
    lastEventTimes.set(debounceKey, now);

    if (!hasGtag()) {
      pendingEvents.push([eventName, payload]);
      return;
    }

    window.gtag('event', eventName, payload);
  }

  function flushPendingEvents() {
    if (!hasGtag()) return;
    while (pendingEvents.length > 0) {
      const item = pendingEvents.shift();
      window.gtag('event', item[0], item[1]);
    }
  }

  function getControlLabel(el) {
    if (!el) return '';
    const explicitLabel = el.getAttribute('data-analytics-label');
    if (explicitLabel) return explicitLabel;

    if (el.id) {
      const label = document.querySelector('label[for="' + CSS.escape(el.id) + '"]');
      if (label) return cleanValue(label.textContent);
    }

    const parentLabel = el.closest && el.closest('label');
    if (parentLabel) return cleanValue(parentLabel.textContent);

    return cleanValue(el.id || el.name || el.className || el.tagName);
  }

  function getControlValue(el) {
    if (!el) return '';
    if (el.type === 'checkbox') return el.checked ? 'checked' : 'unchecked';
    if (el.type === 'radio') return el.checked ? cleanValue(el.value) : '';
    if (el.tagName === 'BUTTON') return cleanValue(el.textContent || el.value);
    return cleanValue(el.value);
  }

  function trackCurrentState(reason) {
    const state = {
      reason: cleanValue(reason || 'state_snapshot'),
      view: cleanValue(window.interpretation || document.getElementById('toggleView')?.textContent),
      view_label: cleanValue(document.getElementById('view-label')?.textContent),
      slits: cleanValue(document.getElementById('toggleSlits')?.textContent),
      which_path: cleanValue(document.getElementById('toggleWhichPath')?.textContent),
      wave_display: cleanValue(document.getElementById('waveFunctionOption')?.value || document.getElementById('basicsWaveFunctionOption')?.value),
      particle_type: cleanValue(document.getElementById('particleType')?.value),
      source: cleanValue(document.getElementById('sourceOption')?.value)
    };
    sendEvent('qsf_state', state);
  }

  function trackControl(el, action) {
    if (!el) return;
    sendEvent('qsf_control_change', {
      action: cleanValue(action || el.type || el.tagName.toLowerCase()),
      control_id: cleanValue(el.id),
      control_label: getControlLabel(el),
      control_value: getControlValue(el),
      view: cleanValue(window.interpretation || document.getElementById('toggleView')?.textContent)
    });

    if (el.id === 'toggleView' || el.id === 'toggleSlits' || el.id === 'toggleWhichPath' || el.id === 'waveFunctionOption' || el.id === 'basicsWaveFunctionOption') {
      window.setTimeout(function () { trackCurrentState(el.id); }, 0);
    }
  }

  function attachControlListeners() {
    const importantIds = [
      'toggleView',
      'toggleSlits',
      'toggleWhichPath',
      'waveFunctionOption',
      'basicsWaveFunctionOption',
      'sourceOption',
      'particleType',
      'wave-continous',
      'onlyWallMode',
      'showWaveSlit1',
      'showWaveSlit2',
      'plot_wave',
      'plot_particles',
      'plot_trajectories',
      'plot_hits',
      'plot_sensor',
      'plot_detector',
      'plot_screen'
    ];

    importantIds.forEach(function (id) {
      const el = document.getElementById(id);
      if (!el || el.dataset.qsfAnalyticsAttached === 'true') return;
      el.dataset.qsfAnalyticsAttached = 'true';

      if (el.tagName === 'BUTTON') {
        el.addEventListener('click', function () {
          window.setTimeout(function () { trackControl(el, 'click'); }, 0);
        });
      } else {
        el.addEventListener('change', function () {
          trackControl(el, 'change');
        });
      }
    });

    document.querySelectorAll('.view-link[data-view]').forEach(function (link) {
      if (link.dataset.qsfAnalyticsAttached === 'true') return;
      link.dataset.qsfAnalyticsAttached = 'true';
      link.addEventListener('click', function () {
        sendEvent('qsf_view_link_click', {
          selected_view: cleanValue(link.dataset.view),
          link_text: cleanValue(link.textContent)
        });
        window.setTimeout(function () { trackCurrentState('view_link'); }, 0);
      });
    });
  }

  function init() {
    ensureGtag();
    sendEvent('qsf_demo_open', {
      demo_id: DEFAULT_DEMO_ID,
      demo_title: DEFAULT_DEMO_TITLE
    });
    attachControlListeners();
    window.setTimeout(function () { trackCurrentState('initial'); }, 500);
  }

  window.QSFAnalytics = {
    trackEvent: sendEvent,
    trackCurrentState: trackCurrentState,
    attachControlListeners: attachControlListeners
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
