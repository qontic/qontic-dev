const DEFAULTS = Object.freeze({
  title: 'Quantum demonstration',
  eyebrow: 'Q-Ontic interactive laboratory',
  purpose: '',
  badge: 'Interactive model',
  version: '',
  homeHref: '../../index.html',
  labHref: 'https://qonticlab.rice.edu/'
});

function decorateShell(shell, settings) {
  if (!shell || shell.dataset.qonticShell === 'true') return false;
  const header = shell.querySelector(':scope > header');
  if (!header) return false;

  shell.dataset.qonticShell = 'true';
  shell.classList.add('qontic-template');
  header.classList.add('qontic-app-header');

  const currentTitle = header.querySelector('h1');
  const titleGroup = currentTitle?.parentElement;
  if (titleGroup) {
    titleGroup.classList.add('qontic-app-title');
    const eyebrow = titleGroup.querySelector('.eyebrow');
    if (eyebrow) eyebrow.textContent = settings.eyebrow;
    if (currentTitle) currentTitle.textContent = settings.title;
  }

  const brand = document.createElement('a');
  brand.className = 'qontic-brand';
  brand.href = settings.homeHref;
  brand.setAttribute('aria-label', 'Q-Ontic demonstrations home');
  const logoUrl = new URL('./qontic-logo.png', import.meta.url).href;
  brand.innerHTML = `<img src="${logoUrl}" alt="Q-Ontic"><span>Interactive quantum perspectives</span>`;
  header.prepend(brand);

  const oldBadge = header.querySelector('.truth');
  const actions = document.createElement('div');
  actions.className = 'qontic-header-actions';
  actions.innerHTML = `<a href="${settings.homeHref}">All demonstrations</a><a href="${settings.labHref}">Q-Ontic Lab</a>`;
  if (oldBadge) {
    oldBadge.textContent = settings.badge;
    actions.append(oldBadge);
  }
  header.append(actions);

  if (settings.purpose) {
    const purpose = document.createElement('section');
    purpose.className = 'qontic-purpose';
    purpose.setAttribute('aria-labelledby', 'qontic-purpose-title');
    purpose.innerHTML = `<strong id="qontic-purpose-title">Purpose</strong><p>${settings.purpose}</p>`;
    header.after(purpose);
  }

  const tabs = shell.querySelector(':scope > .tabs');
  tabs?.classList.add('qontic-view-tabs');
  shell.querySelector(':scope > .stagebar')?.setAttribute('aria-label', 'Simulation stages');

  const footer = document.createElement('footer');
  footer.className = 'qontic-footer';
  footer.innerHTML = `<span>${settings.version || 'Q-Ontic interactive demonstration'}</span><nav aria-label="Q-Ontic links"><a href="${settings.homeHref}">All demonstrations</a><a href="${settings.labHref}">Q-Ontic Lab</a></nav>`;
  // Keep shared navigation outside the framework-managed app root. React may
  // replace Demo/Details children, but it will not reorder this sibling.
  shell.after(footer);
  return true;
}

export function mountQonticShell(options = {}) {
  const settings = { ...DEFAULTS, ...options };
  if (decorateShell(document.querySelector('main.shell'), settings)) return;
  const observer = new MutationObserver(() => {
    if (decorateShell(document.querySelector('main.shell'), settings)) observer.disconnect();
  });
  observer.observe(document.body, { childList: true, subtree: true });
}
