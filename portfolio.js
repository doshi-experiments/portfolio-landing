// The felt face of the home page.
//
// The typed line: the felt face types the same five phrases as the 2025 page, in step, by copying
// the phrase out of the live 2025 frame as it types. Until the frame loads, it shows the first.
// Where the faces sit side by side, every felt word also takes the box of its 2025 twin, so the
// split line cuts one headline in two typefaces rather than two headlines.
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
  let source = null;
  const line = typed.parentElement;
  const wide = matchMedia('(min-width: 701px)');
  const hook = () => {
    let doc;
    try { doc = frame.contentDocument; } catch { return; }
    source = doc && doc.querySelector('[data-typewriter]');
    if (!source) return;
    if (watcher) watcher.disconnect();
    const copy = () => { typed.textContent = source.textContent; align(); };
    watcher = new MutationObserver(copy);
    watcher.observe(source, {childList: true, characterData: true, subtree: true});
    const RO = frame.contentWindow.ResizeObserver || ResizeObserver;
    new RO(() => align()).observe(doc.documentElement);
    if (doc.fonts) doc.fonts.ready.then(() => align());
    copy();
  };

  // Each felt word starts where its 2025 twin starts and is as wide, by letter-spacing, and the
  // felt line sits on the 2025 baseline. Letters are left to the felt face: spaced one by one they
  // read as gaps. The two lines break in the same places (home-hero.css), so the words pair up one
  // for one; if they ever do not, the felt line keeps its own spacing.
  function align() {
    const words = wrap(line);
    for (const w of words) w.style.cssText = '';
    line.style.position = line.style.top = '';
    if (!wide.matches || !source || !source.isConnected) return;
    const twin = source.parentElement;
    const boxes = wordBoxes(twin);
    if (boxes.length !== words.length || boxes.some((b, i) => b.text !== words[i].textContent)) return;
    const dx = frame.getBoundingClientRect().left;
    const base = parseFloat(getComputedStyle(line).letterSpacing) || 0;
    words.forEach((w, i) => {
      const extra = (boxes[i].width - w.getBoundingClientRect().width) / [...w.textContent].length;
      w.style.letterSpacing = base + extra + 'px';
      w.style.marginInlineEnd = -(base + extra) + 'px';
    });
    words.forEach((w, i) => {
      w.style.marginInlineStart = boxes[i].left + dx - w.getBoundingClientRect().left + 'px';
    });
    const drop = baseline(twin) + frame.getBoundingClientRect().top - baseline(line);
    line.style.position = 'relative';
    line.style.top = drop + 'px';
  }
  addEventListener('resize', align);
  new ResizeObserver(() => align()).observe(line.parentElement);
  wide.addEventListener('change', align);
  if (document.fonts) document.fonts.ready.then(align);
  frame.addEventListener('load', hook);
  hook();
}

// Wraps each word of an element's loose text in a span, once, and returns every word span in order.
function wrap(el) {
  const loose = [];
  const walker = el.ownerDocument.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) if (!walker.currentNode.parentElement.hasAttribute('data-w')) loose.push(walker.currentNode);
  for (const node of loose) {
    const parts = node.data.split(/(\s+)/);
    if (parts.every(p => !p || /^\s+$/.test(p))) continue;
    const frag = el.ownerDocument.createDocumentFragment();
    for (const p of parts) {
      if (!p) continue;
      if (/^\s+$/.test(p)) { frag.append(p); continue; }
      const w = el.ownerDocument.createElement('span');
      w.setAttribute('data-w', '');
      w.textContent = p;
      frag.append(w);
    }
    node.replaceWith(frag);
  }
  return [...el.querySelectorAll('[data-w]')];
}

// The boxes of each word in an element's text, in its own window's coordinates.
function wordBoxes(el) {
  const doc = el.ownerDocument;
  const boxes = [];
  const walker = doc.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    const node = walker.currentNode;
    for (const m of node.data.matchAll(/\S+/g)) {
      const r = doc.createRange();
      r.setStart(node, m.index);
      r.setEnd(node, m.index + m[0].length);
      const b = r.getBoundingClientRect();
      boxes.push({text: m[0], left: b.left, width: b.width});
    }
  }
  return boxes;
}

// Where the first line of an element's text sits, measured with an empty inline block.
function baseline(el) {
  const mark = el.ownerDocument.createElement('i');
  mark.style.cssText = 'display:inline-block;width:0;height:0;vertical-align:baseline';
  el.prepend(mark);
  const y = mark.getBoundingClientRect().top;
  mark.remove();
  return y;
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
