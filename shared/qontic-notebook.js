// Q-Ontic notebook template, 1.0.
// Gives a notebook the same branded header, breadcrumbs, footer and themes as
// the Q-Ontic apps (it uses the apps' shell), and adds what notebooks need:
// a sticky bar of section links, a light/dark switch remembered across
// notebooks, and one shared behaviour for multiple-choice questions.
//
// Page structure expected (see templates/qontic-notebook/index.html):
//   <body class="qontic-notebook">
//   <main class="shell">
//     <header><div><p class="eyebrow"></p><h1>Title</h1></div></header>
//     <div class="qn-intro">…lead, prerequisites…</div>
//     <section class="section" id="s1"><div class="section-head"><h2>…</h2>…</section>
//     …
//   </main>
//
// Questions: <div class="quiz" data-quiz> with <button data-ok="true|false"
// data-fb="feedback">. Each answer dispatches a bubbling `qontic:quiz` event
// with detail {quiz, correct}; notebooks can listen to it (e.g. for progress).
import { mountQonticShell } from './qontic-shell.js?v=3.7';

const THEME_KEY = 'qontic-notebook-theme';

function applyTheme(theme) {
  const light = theme === 'light';
  document.documentElement.classList.toggle('qontic-light', light);
  document.body.classList.toggle('qontic-light', light);
  document.querySelectorAll('.qn-theme').forEach((b) => {
    b.setAttribute('aria-checked', String(light));
    const label = b.querySelector('span');
    if (label) label.textContent = 'Light theme';
  });
}

function sectionLabel(section) {
  const h2 = section.querySelector('.section-head h2, h2');
  return section.dataset.navLabel || (h2 ? h2.textContent.trim() : section.id);
}

function buildBar(shell, header) {
  const sections = [...shell.querySelectorAll(':scope > section.section[id]')];
  const bar = document.createElement('nav');
  bar.className = 'qn-bar';
  bar.setAttribute('aria-label', 'Notebook sections');
  const list = document.createElement('div');
  list.className = 'qn-sections';
  for (const s of sections) {
    const a = document.createElement('a');
    a.href = `#${s.id}`;
    a.textContent = sectionLabel(s);
    list.append(a);
  }
  const theme = document.createElement('button');
  theme.type = 'button';
  theme.className = 'qn-theme';
  theme.setAttribute('role', 'switch');
  theme.innerHTML = '<span>Light theme</span><i aria-hidden="true"></i>';
  theme.addEventListener('click', () => {
    const next = document.documentElement.classList.contains('qontic-light') ? 'dark' : 'light';
    try { localStorage.setItem(THEME_KEY, next); } catch (_) { /* storage unavailable */ }
    applyTheme(next);
  });
  bar.append(list, theme);
  const intro = shell.querySelector(':scope > .qn-intro');
  (intro || header).after(bar);

  // highlight the section being read
  if ('IntersectionObserver' in window && sections.length) {
    const links = new Map([...list.children].map((a) => [a.hash.slice(1), a]));
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        links.forEach((a) => a.classList.remove('current'));
        const a = links.get(e.target.id);
        if (a) { a.classList.add('current'); a.scrollIntoView({ block: 'nearest', inline: 'nearest' }); }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach((s) => io.observe(s));
  }
}

function wireQuizzes(root) {
  root.querySelectorAll('[data-quiz]').forEach((quiz) => {
    if (quiz.dataset.qnWired) return;
    quiz.dataset.qnWired = '1';
    const fb = quiz.querySelector('.fb');
    quiz.querySelectorAll('button[data-ok]').forEach((b) => b.addEventListener('click', () => {
      quiz.querySelectorAll('button[data-ok]').forEach((x) => x.classList.remove('right', 'wrong'));
      const correct = b.dataset.ok === 'true';
      b.classList.add(correct ? 'right' : 'wrong');
      if (fb) { fb.textContent = b.dataset.fb || ''; fb.hidden = false; }
      quiz.dispatchEvent(new CustomEvent('qontic:quiz', { bubbles: true, detail: { quiz, correct } }));
    }));
  });
}

export function mountQonticNotebook(options = {}) {
  const settings = {
    navigation: 'breadcrumbs',
    headerVisibilityControl: false,
    eyebrow: 'Q-Ontic notebook',
    badge: 'Notebook',
    ...options,
  };
  document.body.classList.add('qontic-notebook');
  let stored = null;
  try { stored = localStorage.getItem(THEME_KEY); } catch (_) { /* storage unavailable */ }
  applyTheme(stored || settings.theme || 'dark');
  mountQonticShell(settings);
  const shell = document.querySelector('main.shell');
  const header = shell?.querySelector(':scope > header');
  if (shell && header && settings.sectionBar !== false) buildBar(shell, header);
  applyTheme(document.documentElement.classList.contains('qontic-light') ? 'light' : 'dark');
  wireQuizzes(document);
  return { wireQuizzes: () => wireQuizzes(document), setTheme: (t) => { applyTheme(t); } };
}
