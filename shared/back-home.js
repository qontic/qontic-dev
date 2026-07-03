(function () {
  const mainHref = '../../../index.html';

  function loadQSFAnalytics() {
    if (document.querySelector('script[data-qsf-analytics="true"]')) return;

    const currentScript = document.currentScript;
    const src = currentScript && currentScript.src ? currentScript.src : '';
    const base = src ? src.replace(/back-home\.js(?:\?.*)?$/, '') : '../../../shared/';

    const script = document.createElement('script');
    script.src = base + 'qsf-analytics.js';
    script.defer = true;
    script.dataset.qsfAnalytics = 'true';
    document.head.appendChild(script);
  }

  function init() {
    loadQSFAnalytics();

    if (new URLSearchParams(window.location.search).get('embed') === '1') return;
    if (document.getElementById('qontic-back-home')) return;

    const link = document.createElement('a');
    link.id = 'qontic-back-home';
    link.className = 'qontic-back-home';
    link.href = mainHref;
    link.textContent = '← Back to Main Page';
    link.setAttribute('aria-label', 'Back to the Q-Ontic Lab main page');
    document.body.appendChild(link);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
