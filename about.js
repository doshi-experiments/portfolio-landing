(() => {
  const body = document.body;
  const media = matchMedia('(prefers-reduced-motion: reduce)');
  const container = document.querySelector('.dog-animation');
  const fallback = document.querySelector('.dog-fallback');
  const button = document.querySelector('.motion-toggle');
  const track = document.querySelector('.toolbelt-track');
  let paused = false;
  let animation;
  let dogVisible = true;

  // Duplicate only the visual carousel items; assistive technology reads one set.
  for (const item of [...track.children]) {
    const duplicate = item.cloneNode(true);
    duplicate.setAttribute('aria-hidden', 'true');
    track.append(duplicate);
  }

  function syncMotion() {
    const stop = media.matches || paused || document.hidden;
    body.classList.toggle('motion-paused', stop);
    button.hidden = media.matches;
    button.setAttribute('aria-pressed', String(paused));
    button.querySelector('.motion-label').textContent = paused ? 'Play motion' : 'Pause motion';
    button.querySelector('[aria-hidden]').textContent = paused ? '▷' : 'Ⅱ';
    if (animation) {
      if (stop || !dogVisible) animation.pause();
      else animation.play();
    }
  }

  body.classList.add('motion-ready');
  button.addEventListener('click', () => { paused = !paused; syncMotion(); });
  media.addEventListener('change', syncMotion);
  document.addEventListener('visibilitychange', syncMotion);
  syncMotion();

  if (window.lottie) {
    animation = window.lottie.loadAnimation({
      container,
      renderer: 'svg',
      loop: true,
      autoplay: false,
      path: '/assets/about/dog.json',
      rendererSettings: { preserveAspectRatio: 'xMidYMid meet', progressiveLoad: true }
    });
    animation.addEventListener('DOMLoaded', () => {
      container.classList.add('is-ready');
      fallback.classList.add('is-hidden');
      syncMotion();
    });
    const observer = new IntersectionObserver(([entry]) => {
      dogVisible = entry.isIntersecting;
      syncMotion();
    });
    observer.observe(container);
  }
})();
