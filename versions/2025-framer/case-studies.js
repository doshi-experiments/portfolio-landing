// The source study presents six annotated screens as a scrolling walkthrough.
// All steps and their images remain available when scripting is disabled.
const walkthrough = document.querySelector('[data-walkthrough]');
if (walkthrough && 'IntersectionObserver' in window) {
  walkthrough.classList.add('walkthrough-enhanced');
  const stage = walkthrough.querySelector('[data-stage-image]');
  const steps = walkthrough.querySelectorAll('[data-screen]');
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      stage.src = entry.target.dataset.screen;
      stage.alt = entry.target.dataset.screenAlt;
    }
  }, { rootMargin: '-25% 0px -25% 0px', threshold: 0 });
  steps.forEach(step => observer.observe(step));
}

// The chapter rail: a red line from the first chapter's dot to where the last one comes to rest,
// filled down to the height at which the sticky chapter headings ride, so it grows as the reader
// scrolls and each dot fills in as it is reached. When the page sits in the portfolio's split, the
// top window does the scrolling, so the rail measures against that window. With reduced motion
// the rail is drawn in full.
{
  const chapters = [...document.querySelectorAll('.case-chapter')];
  if (chapters.length > 1) {
    const root = document.documentElement;
    const host = window.frameElement ? window.parent : window;
    const wide = matchMedia('(min-width: 701px)');
    const still = matchMedia('(prefers-reduced-motion: reduce)');
    let queued = false;
    const draw = () => {
      queued = false;
      root.classList.toggle('rail', wide.matches);
      if (!wide.matches) return;
      const half = chapters[0].querySelector('h2').offsetHeight / 2;
      const frameTop = window.frameElement ? window.frameElement.getBoundingClientRect().top : 0;
      const anchor = 32 + half - frameTop;
      chapters.forEach((chapter, i) => {
        const box = chapter.getBoundingClientRect();
        const style = getComputedStyle(chapter);
        const top = i === 0 ? parseFloat(style.paddingTop) + half : 0;
        const bottom = i === chapters.length - 1 ? parseFloat(style.paddingBottom) + half : 0;
        const length = box.height - top - bottom;
        const fill = still.matches ? length : Math.max(0, Math.min(length, anchor - box.top - top));
        chapter.style.setProperty('--rail-top', `${top}px`);
        chapter.style.setProperty('--rail-bottom', `${bottom}px`);
        chapter.style.setProperty('--rail-fill', `${fill}px`);
        chapter.classList.toggle('reached', still.matches || anchor >= box.top + parseFloat(style.paddingTop) + half);
      });
    };
    const queue = () => { if (!queued) { queued = true; requestAnimationFrame(draw); } };
    host.addEventListener('scroll', queue, { passive: true });
    host.addEventListener('resize', queue);
    wide.addEventListener('change', queue);
    still.addEventListener('change', queue);
    new ResizeObserver(queue).observe(document.body);
    draw();
  }
}
