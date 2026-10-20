// Case 04: the map's views, the chapter bar, the viewer for the recordings, and motion off.
// Everything on the page reads without this file; it only adds the moving parts.

document.documentElement.classList.remove('no-js');

// The map: three views of the house, with or without a bear.
const map = document.querySelector('[data-map]');
if (map) {
  const img = map.querySelector('img');
  const cap = map.querySelector('[data-caption]');
  const views = [...map.querySelectorAll('[data-view]')];
  const flip = map.querySelector('[data-bear]');
  const captions = JSON.parse(map.dataset.captions);
  const state = {view: 'outside', bear: true};
  const render = () => {
    img.src = `/household/map-${state.view}-${state.bear ? 'bear' : 'calm'}.webp`;
    img.alt = `Valley Map, ${state.view} view${state.bear ? ', with a bear alert and a red frame' : ''}`;
    cap.textContent = captions[state.view] + (state.bear ? ' The red frame means a bear. Shown with preview states.' : ' Shown with preview states.');
    for (const b of views) b.setAttribute('aria-pressed', String(b.dataset.view === state.view));
    flip.setAttribute('aria-pressed', String(state.bear));
  };
  for (const b of views) b.addEventListener('click', () => { state.view = b.dataset.view; render(); });
  flip.addEventListener('click', () => { state.bear = !state.bear; render(); });
}

// The chapter bar: which chapter is under the reader, as a label and a row of dots.
const spy = document.querySelector('.spy');
const chapters = [...document.querySelectorAll('[data-ch]')];
if (spy && chapters.length) {
  const num = spy.querySelector('[data-num]');
  const title = spy.querySelector('[data-title]');
  const dots = [...spy.querySelectorAll('.dot')];
  let current = null, ticking = false;
  const update = () => {
    ticking = false;
    let i = 0;
    chapters.forEach((el, k) => { if (el.getBoundingClientRect().top < 140) i = k; });
    if (i === current) return;
    current = i;
    const el = chapters[i];
    num.textContent = el.dataset.num;
    title.textContent = el.dataset.title;
    dots.forEach((d, k) => { d.setAttribute('aria-current', String(k === i)); d.classList.toggle('done', k < i); });
  };
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, {passive: true});
  update();
}

// The viewer: a recording, larger, in place. Esc closes it, and focus goes back to the button.
const viewer = document.getElementById('viewer');
if (viewer && typeof viewer.showModal === 'function') {
  const video = viewer.querySelector('video');
  let opener = null;
  for (const b of document.querySelectorAll('[data-enlarge]')) {
    b.addEventListener('click', () => {
      opener = b;
      const src = document.querySelector(`[data-recording="${b.dataset.enlarge}"]`);
      video.src = src.currentSrc || src.src;
      video.poster = src.poster;
      viewer.showModal();
      video.play().catch(() => {});
    });
  }
  const close = () => viewer.close();
  viewer.querySelector('[data-close]').addEventListener('click', close);
  viewer.addEventListener('click', e => { if (e.target === viewer) close(); });
  viewer.addEventListener('close', () => { video.pause(); video.removeAttribute('src'); video.load(); if (opener) opener.focus(); });
}

// Motion off: the recordings wait for a tap instead of looping on their own.
if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
  for (const v of document.querySelectorAll('video[autoplay]')) {
    v.removeAttribute('autoplay');
    v.pause();
    v.controls = true;
  }
}
