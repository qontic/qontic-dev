// N-Slits embedded in the notebook. Each .ns-embed holds an iframe of the app in embed mode
// (?embed=1: compact page, settings kept inside the frame) and buttons that load a set-up,
// given as a share-link hash. A frame loads when it comes near the screen.
const APP = '../../apps/comparative/n-slits/index.html';
let serial = 0;

function urlFor(box, hash, query) {
  const q = new URLSearchParams(query ?? box.dataset.query ?? '');
  q.set('embed', '1'); q.set('s', String(++serial));
  return `${APP}?${q.toString()}#${hash}`;
}
function load(box, hash, button) {
  const frame = box.querySelector('iframe');
  frame.src = urlFor(box, hash, button ? (button.dataset.nsQuery || '') : undefined);
  box.querySelectorAll('[data-ns-hash]').forEach(b => { const on = b === button; b.classList.toggle('primary', on); b.setAttribute('aria-pressed', String(on)); });
}

const seen = new IntersectionObserver(entries => {
  for (const e of entries) if (e.isIntersecting) {
    const box = e.target; seen.unobserve(box);
    // First load without starting the run (the reader presses Start or a set-up button).
    if (!box.querySelector('iframe').getAttribute('src')) load(box, box.dataset.hash.replace(/(^|&)run=1/, ''), box.querySelector('[data-ns-hash].primary'));
  }
}, { rootMargin: '300px 0px' });

document.querySelectorAll('.ns-embed').forEach(box => {
  box.querySelectorAll('[data-ns-hash]').forEach(b => {
    b.type = 'button'; b.setAttribute('aria-pressed', String(b.classList.contains('primary')));
    b.addEventListener('click', () => load(box, b.dataset.nsHash, b));
  });
  const open = box.querySelector('.ns-open');
  if (open) open.addEventListener('click', () => {
    const cur = box.querySelector('[data-ns-hash].primary')?.dataset.nsHash || box.dataset.hash;
    const q = new URLSearchParams(box.dataset.query || ''); q.delete('embed');
    open.href = `${APP}${q.toString() ? '?' + q.toString() : ''}#${cur.replace(/(^|&)run=1/, '')}`;
  });
  seen.observe(box);
});
