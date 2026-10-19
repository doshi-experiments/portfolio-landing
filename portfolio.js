// The felt face of the home page.
//
// The typed line: the felt face types the same five phrases as the 2025 page, in step, by copying
// the phrase out of the live 2025 frame as it types. Until the frame loads, it shows the first.
//
// The square where the 2025 page keeps the portrait runs the three experiments, one at a time,
// moving on every 5.5s unless a hand or the keyboard is on it. Keys 1, 2 and 3 pick one.

const typed = document.querySelector('[data-typed]');
const frame = document.querySelector('.then iframe');
if (typed && frame) mirror(typed, frame);
if (frame) twins(frame, [['.hero h1', '.h-h1'], ['.archive-intro', '.h-sub']]);

const obj = document.querySelector('[data-obj]');
if (obj) square(obj);

function mirror(typed, frame) {
  let watcher;
  const hook = () => {
    let doc;
    try { doc = frame.contentDocument; } catch { return; }
    const source = doc && doc.querySelector('[data-typewriter]');
    if (!source) return;
    if (watcher) watcher.disconnect();
    const copy = () => { typed.textContent = source.textContent; };
    watcher = new MutationObserver(copy);
    watcher.observe(source, {childList: true, characterData: true, subtree: true});
    copy();
  };
  frame.addEventListener('load', hook);
  hook();
}

function square(obj) {
  const exps = [
    {title: 'Rent vs. buy', line: 'Your own numbers. Six calculators.'},
    {title: 'Visualizations', line: 'Growth, symmetry and chaos.'},
    {title: 'Mr. Shake', line: 'One phone, a few suspicious friends.'},
  ];
  const win = obj.querySelector('[data-win]');
  const drawings = [...win.querySelectorAll('svg')];
  const keys = [...obj.querySelectorAll('.key')];
  const title = obj.querySelector('[data-exp-title]');
  const line = obj.querySelector('[data-exp-line]');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  let current = 0;
  let held = false;

  function show(i) {
    current = i;
    drawings.forEach((d, j) => d.classList.toggle('on', j === i));
    keys.forEach((k, j) => k.setAttribute('aria-pressed', String(j === i)));
    title.textContent = exps[i].title;
    line.textContent = exps[i].line;
    win.setAttribute('aria-label', exps[i].title + ', in Experiments');
  }
  keys.forEach((k, i) => k.addEventListener('click', () => show(i)));
  obj.addEventListener('pointerenter', () => { held = true; });
  obj.addEventListener('pointerleave', () => { held = false; });
  obj.addEventListener('focusin', () => { held = true; });
  obj.addEventListener('focusout', () => { held = false; });
  setInterval(() => {
    if (held || reduce.matches || document.hidden) return;
    show((current + 1) % exps.length);
  }, 5500);
  show(0);
}

// Where the two faces carry different words, a felt block takes the height of its 2025 twin, so
// everything below still sits on its twin however the words wrap.
function twins(frame, pairs) {
  const hook = () => {
    let doc;
    try { doc = frame.contentDocument; } catch { return; }
    if (!doc || !frame.contentWindow) return;
    const RO = frame.contentWindow.ResizeObserver || ResizeObserver;
    for (const [then, now] of pairs) {
      const a = doc.querySelector(then), b = document.querySelector(now);
      if (!a || !b) continue;
      const fit = () => {
        const cs = frame.contentWindow.getComputedStyle(a);
        const h = a.getBoundingClientRect().height + parseFloat(cs.marginTop) + parseFloat(cs.marginBottom);
        const own = getComputedStyle(b);
        b.style.minHeight = Math.max(0, h - parseFloat(own.marginTop) - parseFloat(own.marginBottom)) + 'px';
      };
      new RO(fit).observe(a);
      fit();
    }
  };
  frame.addEventListener('load', hook);
}
