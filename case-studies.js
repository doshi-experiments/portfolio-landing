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
