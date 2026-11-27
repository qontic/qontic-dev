// N-Slits embedded in the notebook. Each .ns-embed holds an iframe of the app in embed mode
// (?embed=1: compact page, settings kept inside the frame) and buttons that load a set-up,
// given as a share-link hash. A frame loads when it comes near the screen.
// A set-up that differs from the loaded one only in view, slits, λ, geometry, electrons per
// wave, speed or the arrows at P is sent to the running app (no reload); others (level, engine, preset,
// numerical options) reload the frame.
const APP = '../../apps/comparative/n-slits/index.html';
const IN_PLACE = new Set(['view', 'slits', 'wl', 'sep', 'det', 'scr', 'packetCount', 'speed', 'run', 'arrows', 'arrowsY']);
let serial = 0;

const structural = (hash, query) => {
  const h = new URLSearchParams(hash); for (const k of IN_PLACE) h.delete(k);
  return [...h.entries()].sort().map(e => e.join('=')).join('&') + '|' + (query || '');
};
function urlFor(hash, query) {
  const q = new URLSearchParams(query || '');
  q.set('embed', '1'); q.set('s', String(++serial));
  return `${APP}?${q.toString()}#${hash}`;
}
function mark(box, button) {
  box.querySelectorAll('[data-ns-hash]').forEach(b => { const on = b === button; b.classList.toggle('primary', on); b.setAttribute('aria-pressed', String(on)); });
}
function load(box, hash, button, query) {
  const frame = box.querySelector('iframe'), key = structural(hash, query);
  if (box._key === key && box._ready && frame.contentWindow) frame.contentWindow.postMessage({ type: 'ns-setup', hash }, '*');
  else { box._key = key; box._ready = false; frame.src = urlFor(hash, query); }
  mark(box, button);
}

const seen = new IntersectionObserver(entries => {
  for (const e of entries) if (e.isIntersecting) {
    const box = e.target; seen.unobserve(box);
    // First load without starting the run (the reader presses Start or a set-up button).
    if (!box.querySelector('iframe').getAttribute('src')) load(box, box.dataset.hash.replace(/(^|&)run=1/, ''), box.querySelector('[data-ns-hash].primary'), box.dataset.query);
  }
}, { rootMargin: '300px 0px' });

document.querySelectorAll('.ns-embed').forEach(box => {
  const frame = box.querySelector('iframe');
  // The app listens for set-ups once its page has loaded.
  frame.addEventListener('load', () => { box._ready = false; setTimeout(() => { box._ready = true; }, 1200); });
  box.querySelectorAll('[data-ns-hash]').forEach(b => {
    b.type = 'button'; b.setAttribute('aria-pressed', String(b.classList.contains('primary')));
    b.addEventListener('click', () => load(box, b.dataset.nsHash, b, b.dataset.nsQuery || ''));
  });
  const open = box.querySelector('.ns-open');
  if (open) open.addEventListener('click', () => {
    const cur = box.querySelector('[data-ns-hash].primary')?.dataset.nsHash || box.dataset.hash;
    const q = new URLSearchParams(box.dataset.query || ''); q.delete('embed');
    open.href = `${APP}${q.toString() ? '?' + q.toString() : ''}#${cur.replace(/(^|&)run=1/, '')}`;
  });
  seen.observe(box);
});
// The embedded app reports its height; the frame is sized to fit it.
window.addEventListener('message', event => {
  if (event.data?.type !== 'ns-height') return;
  for (const f of document.querySelectorAll('.ns-frame')) if (f.contentWindow === event.source) { const h = Math.max(420, Math.min(2400, +event.data.h || 0)); f.style.height = h + 'px'; }
});
