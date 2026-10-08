// The portfolio works without JavaScript. This adds the reference's introduction.
const phrase = document.querySelector('[data-typewriter]');
if (phrase) {
  const phrases = ['design experiences.', 'uncover user needs.', 'facilitate conversations.', 'solve business problems.', 'build relationships.'];
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let timeout;
  let index = 0;
  let position = phrases[0].length;
  let deleting = true;
  const tick = () => {
    if (motion.matches || document.hidden) return;
    const text = phrases[index];
    position += deleting ? -1 : 1;
    phrase.textContent = text.slice(0, Math.max(0, position));
    let delay = deleting ? 45 : 100;
    if (!deleting && position === text.length) {deleting = true; delay = 1600;}
    else if (deleting && position === 0) {deleting = false; index = (index + 1) % phrases.length; delay = 250;}
    timeout = setTimeout(tick, delay);
  };
  const reset = () => {
    clearTimeout(timeout);
    phrase.textContent = phrases[0];
    index = 0; position = phrases[0].length; deleting = true;
    if (!motion.matches && !document.hidden) timeout = setTimeout(tick, 2000);
  };
  motion.addEventListener('change', reset);
  document.addEventListener('visibilitychange', reset);
  reset();
}
