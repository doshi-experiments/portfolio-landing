const gallery = document.querySelector('[data-gallery]');
if (gallery) {
  const slides = [...gallery.children];
  const previous = document.querySelector('[data-gallery-prev]');
  const next = document.querySelector('[data-gallery-next]');
  const count = document.querySelector('[data-gallery-count]');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let active = 0;
  function update() {
    const step = slides[1].offsetLeft - slides[0].offsetLeft;
    active = Math.max(0, Math.min(slides.length - 1, Math.round(gallery.scrollLeft / step)));
    previous.disabled = active === 0;
    next.disabled = active === slides.length - 1;
    count.textContent = `${active + 1} / ${slides.length}`;
  }
  function move(direction) {
    const index = Math.max(0, Math.min(slides.length - 1, active + direction));
    gallery.scrollTo({ left: slides[index].offsetLeft - slides[0].offsetLeft, behavior: reducedMotion.matches ? 'instant' : 'smooth' });
  }
  previous.addEventListener('click', () => move(-1));
  next.addEventListener('click', () => move(1));
  gallery.addEventListener('scroll', update, { passive: true });
  gallery.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      move(event.key === 'ArrowRight' ? 1 : -1);
    }
  });
  new ResizeObserver(update).observe(gallery);
  update();
}
