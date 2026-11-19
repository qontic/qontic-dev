// Optional "Quiz" view for Q-Ontic apps: predict before you watch.
//
// The app supplies an empty panel, a top-level tab button for it, and its questions.
// Each question shows a still picture drawn by the app (so the running simulation
// cannot give the answer away), a set of answers and an explanation. After an answer,
// "Watch it in the simulation" switches to the Simulation tab with that state running.
// Opening the page with ?quiz=1 starts on the Quiz tab and keeps the Simulation tab
// locked until the first answer. Apps that do not call mountQonticQuiz are unaffected.
//
// mountQonticQuiz({
//   panel,            // element that receives the quiz markup (e.g. <section id="quiz" hidden>)
//   tab,              // the top-level button that shows the panel (data-view="quiz")
//   simulationTab,    // the top-level button for the simulation
//   title,            // optional heading, default 'Quiz · predict before you watch'
//   answers,          // default answers: [{ id, label }]
//   questions,        // [{ question, answer, explain, caption?, answers?, prepare(), draw(canvas) }]
//   onWatch,          // called after switching to the simulation (e.g. start running)
//   param,            // URL parameter that enables quiz-first mode, default 'quiz'
//   shuffle,          // optional: show the answers in a random order (default false)
//   score,            // optional: show the running score in the step line (default false)
// })
// prepare() sets the app state for the question (paused); draw(canvas) paints the still
// picture onto a 360 × 360 canvas. Returns { show(index), get index() }.

export function mountQonticQuiz({ panel, tab, simulationTab, title = 'Quiz · predict before you watch',
  answers: defaultAnswers = [], questions, onWatch = () => {}, param = 'quiz', shuffle = false, score = false }) {
  panel.classList.add('qontic-panel', 'qontic-quiz');
  panel.innerHTML = `
    <div class="qontic-quiz-layout">
      <figure class="qontic-quiz-figure">
        <canvas width="360" height="360"></canvas>
        <figcaption></figcaption>
      </figure>
      <div class="qontic-quiz-body">
        <p class="qontic-quiz-title"></p>
        <p class="qontic-quiz-step"></p>
        <p class="qontic-quiz-question"></p>
        <div class="qontic-app-toggle-group qontic-quiz-answers"></div>
        <p class="qontic-quiz-feedback" role="status"></p>
        <div class="qontic-quiz-actions">
          <button type="button" class="qontic-app-toggle" data-quiz="watch" hidden>Watch it in the simulation →</button>
          <button type="button" class="qontic-app-toggle" data-quiz="next" hidden>Next question</button>
        </div>
      </div>
    </div>`;
  const $ = selector => panel.querySelector(selector);
  const canvas = $('canvas'), feedback = $('.qontic-quiz-feedback');
  const watch = $('[data-quiz="watch"]'), next = $('[data-quiz="next"]');
  $('.qontic-quiz-title').textContent = title;
  let index = 0, answered = false;
  const results = new Map(); // question index → answered correctly (first answer only)
  const stepText = () => `Question ${index + 1} of ${questions.length}` + (score && results.size ? ` · score ${[...results.values()].filter(Boolean).length} / ${results.size}` : '');

  function show(i) {
    index = ((i % questions.length) + questions.length) % questions.length;
    answered = false;
    const q = questions[index];
    q.prepare?.();
    $('.qontic-quiz-step').textContent = stepText();
    $('.qontic-quiz-question').textContent = q.question;
    $('figcaption').textContent = q.caption || '';
    feedback.textContent = '';
    watch.hidden = true;
    next.hidden = true;
    const box = $('.qontic-quiz-answers');
    const list = [...(q.answers || defaultAnswers)];
    if (shuffle) for (let k = list.length - 1; k > 0; k--) { const r = Math.floor(Math.random() * (k + 1)); [list[k], list[r]] = [list[r], list[k]]; }
    box.replaceChildren(...list.map(({ id, label }) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'qontic-app-toggle';
      b.textContent = label;
      b.setAttribute('aria-pressed', 'false');
      b.addEventListener('click', () => choose(id, b));
      return b;
    }));
    q.draw?.(canvas);
  }

  function choose(id, button) {
    if (answered) return;
    answered = true;
    const q = questions[index];
    for (const b of $('.qontic-quiz-answers').children) {
      b.setAttribute('aria-pressed', String(b === button));
      b.disabled = true;
    }
    if (!results.has(index)) results.set(index, id === q.answer);
    if (score) $('.qontic-quiz-step').textContent = stepText();
    feedback.textContent = `${id === q.answer ? 'Yes.' : 'Not quite.'} ${q.explain}`;
    watch.hidden = false;
    next.hidden = false;
    next.textContent = index + 1 < questions.length ? 'Next question' : 'Start again';
    simulationTab.disabled = false;
    simulationTab.removeAttribute('title');
  }

  watch.addEventListener('click', () => { simulationTab.click(); onWatch(questions[index]); });
  next.addEventListener('click', () => show(index + 1));
  tab.addEventListener('click', () => { if (!answered) show(index); });

  if (new URLSearchParams(location.search).get(param) === '1') {
    simulationTab.disabled = true;
    simulationTab.title = 'Answer the quiz question first';
    tab.click();
  }
  return { show, get index() { return index; } };
}
