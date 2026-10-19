// The split: Face B ("now") is clipped from the left over Face A ("then"), which is a live,
// same-origin copy of the 2025 archive. Without JavaScript the page is Face B alone.
//
// data-split   starting position of the divider, in percent of the page width
// data-fit     "content": Face A runs its own full height; "now": Face A is cut where Face B ends
// data-then    the archived page to show as Face A
// data-then-map  archive paths that should open a page of the current site instead

const split = document.querySelector('[data-split]');
if (split) init(split);

function init(split) {
  document.documentElement.classList.add('js');
  const now = split.querySelector('.now');
  const then = split.querySelector('.then');
  const frame = then.querySelector('iframe');
  const strip = split.querySelector('.divider-strip');
  const knob = split.querySelector('.knob');
  const segs = [...split.querySelectorAll('.seg')];
  const panes = split.querySelector('.panes');
  const fit = split.dataset.fit || 'content';
  const map = JSON.parse(split.dataset.thenMap || '{}');
  const wide = matchMedia('(min-width: 720px)');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const thenUrl = new URL(split.dataset.then, location.href);
  // Where the reader last left the line (and, on a phone, which face they chose) carries over
  // to every page. Only the reader's own moves are kept, never the line's automatic ones.
  const STORE = 'split-portfolio';
  const remembered = (() => {
    try { return JSON.parse(localStorage.getItem(STORE)) || {}; } catch { return {}; }
  })();
  const keep = change => {
    try { localStorage.setItem(STORE, JSON.stringify(Object.assign(remembered, change))); } catch { /* storage blocked: the line just resets */ }
  };
  const saved = Number(remembered.split);
  let value = Number.isFinite(saved) ? saved : Number(split.dataset.split) || 50;
  let doc = null;

  // ---- The divider ----
  function set(v, ease = false) {
    value = Math.max(0, Math.min(100, v));
    split.classList.toggle('easing', ease && !reduce.matches);
    split.style.setProperty('--split', value.toFixed(2));
    const n = Math.round(value);
    knob.setAttribute('aria-valuenow', n);
    knob.setAttribute('aria-valuetext', `${n}% shows 2025, made without AI. ${100 - n}% shows 2026, made with AI.`);
  }
  split.addEventListener('transitionend', e => { if (e.propertyName === '--split') split.classList.remove('easing'); });

  // Glass on the line: while a mouse rests on the divider, or the knob has keyboard focus, each
  // side frosts over and names itself. Dragging clears the glass so the pages can be compared,
  // and it stays clear after a drag until the pointer leaves the line. The knob follows the
  // pointer up and down the line; off the line it returns to its resting place.
  const glass = {hover: false, focus: false, dragged: false};
  let dragging = false;
  function frost() {
    const on = !!panes && !dragging && (glass.focus || (glass.hover && !glass.dragged));
    split.classList.toggle('panes-on', on);
  }
  function follow(e) {
    const y = Math.max(120, Math.min(innerHeight - 300, e.clientY));
    split.style.setProperty('--ky', y + 'px');
  }
  const fromPointer = e => {
    const r = split.getBoundingClientRect();
    set(((e.clientX - r.left) / r.width) * 100);
  };
  strip.addEventListener('pointerenter', e => {
    if (e.pointerType === 'touch') return;
    glass.hover = true;
    follow(e);
    frost();
  });
  strip.addEventListener('pointerleave', () => {
    if (dragging) return;
    glass.hover = false;
    glass.dragged = false;
    split.style.removeProperty('--ky');
    frost();
  });
  strip.addEventListener('pointerdown', e => {
    if (e.button !== 0) return;
    e.preventDefault();
    strip.setPointerCapture(e.pointerId);
    dragging = true;
    glass.dragged = true;
    split.classList.add('dragging');
    fromPointer(e);
    follow(e);
    frost();
  });
  strip.addEventListener('pointermove', e => {
    if (dragging) fromPointer(e);
    if (dragging || glass.hover) follow(e);
  });
  const stop = e => {
    if (!dragging) return;
    dragging = false;
    split.classList.remove('dragging');
    const r = strip.getBoundingClientRect();
    const still = e && e.clientX >= r.left && e.clientX <= r.right;
    if (!still) { glass.hover = false; glass.dragged = false; split.style.removeProperty('--ky'); }
    frost();
    keep({split: Math.round(value * 10) / 10});
  };
  strip.addEventListener('pointerup', stop);
  strip.addEventListener('pointercancel', stop);
  strip.addEventListener('lostpointercapture', stop);
  knob.addEventListener('focus', () => { glass.focus = knob.matches(':focus-visible'); frost(); });
  knob.addEventListener('blur', () => { glass.focus = false; frost(); });

  knob.addEventListener('keydown', e => {
    const step = e.shiftKey ? 10 : 2;
    const moves = {ArrowLeft: [value - step], ArrowRight: [value + step], PageDown: [value - 10, true], PageUp: [value + 10, true], Home: [0, true], End: [100, true]};
    if (e.key === 'Escape') { glass.focus = false; frost(); return; }
    const move = moves[e.key];
    if (!move) return;
    e.preventDefault();
    set(...move);
    keep({split: Math.round(value * 10) / 10});
  });

  // Keyboard focus never lands on the hidden side of the line: the line moves to show it.
  function reveal(target, rect, side) {
    if (split.dataset.mode !== 'divide' || !target.matches(':focus-visible')) return;
    const r = split.getBoundingClientRect();
    const x = r.left + (value / 100) * r.width;
    if (side === 'now' && rect.left < x) set(((rect.left - 24 - r.left) / r.width) * 100, true);
    if (side === 'then' && rect.right > x) set(((rect.right + 24 - r.left) / r.width) * 100, true);
  }
  now.addEventListener('focusin', e => reveal(e.target, e.target.getBoundingClientRect(), 'now'));

  // ---- Phone: a two-position toggle ----
  function face(which) {
    if (split.dataset.face === which) return;
    split.dataset.face = which;
    for (const seg of segs) seg.setAttribute('aria-pressed', String(seg.dataset.face === which));
    const incoming = which === 'now' ? now : then;
    incoming.classList.remove('fade');
    void incoming.offsetWidth;
    incoming.classList.add('fade');
    size();
  }
  for (const seg of segs) seg.addEventListener('click', () => { face(seg.dataset.face); keep({face: seg.dataset.face}); });
  if (remembered.face === 'then' || remembered.face === 'now') {
    split.dataset.face = remembered.face;
    for (const seg of segs) seg.setAttribute('aria-pressed', String(seg.dataset.face === remembered.face));
  }

  // "From the archives" lives on the other side of the line: it slides the line all the way
  // across (or flips the phone toggle), and the 2025 archive cards appear in the same place.
  for (const el of split.querySelectorAll('[data-reveal-then]')) {
    el.addEventListener('click', () => {
      if (wide.matches) { set(100, true); keep({split: 100}); }
      else { face('then'); keep({face: 'then'}); }
    });
  }

  // A link followed on either side takes the line all the way across first, so the side the reader
  // chose fills the page, here and on the next page: a 2025 link shows 2025 in full, a felt link
  // shows the felt face in full. Links that open a new tab, or leave for email, move nothing.
  function choose(e, a, side, inPage) {
    if (e.defaultPrevented && !inPage) return;
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || a.hasAttribute('download')) return;
    if (a.target && a.target !== '_top' && a.target !== '_self') return;
    const url = new URL(a.href);
    if (!/^https?:$/.test(url.protocol)) return;
    if (!wide.matches) { keep({face: side}); return; }
    const to = side === 'then' ? 100 : 0;
    const moving = Math.abs(value - to) > 0.5 && !reduce.matches;
    set(to, true);
    keep({split: to});
    if (!moving || inPage) return;
    e.preventDefault();
    setTimeout(() => location.assign(url.href), 380);
  }
  split.addEventListener('click', e => {
    const a = e.target.closest('a[href]');
    if (!a) return;
    const side = a.closest('.then') ? 'then' : a.closest('.now') ? 'now' : null;
    if (!side) return;
    const url = new URL(a.href);
    choose(e, a, side, url.origin === location.origin && url.pathname === location.pathname && !!url.hash);
  });

  function mode() {
    split.dataset.mode = wide.matches ? 'divide' : 'toggle';
    size();
  }

  // ---- Face A: the archive, sized to the page instead of scrolling inside its frame ----
  function size() {
    if (fit === 'now') {
      const h = now.offsetHeight;
      then.style.height = h + 'px';
      frame.style.height = h + 'px';
    } else if (doc) {
      frame.style.height = Math.ceil(doc.documentElement.getBoundingClientRect().height) + 'px';
    }
  }

  // The archive's viewport units would measure the frame, which grows to fit its content and
  // so would grow forever. Rewrite them, at runtime only, against this window's viewport.
  const VH = /(-?\d*\.?\d+)[sdl]?vh\b/g;
  const originals = new Map();
  let shimmed = {w: 0, h: 0};
  function shim(force) {
    if (!doc) return;
    const w = innerWidth, h = document.documentElement.clientHeight;
    if (!force && w === shimmed.w && Math.abs(h - shimmed.h) < 120) return;
    shimmed = {w, h};
    const walk = rules => {
      for (const rule of rules) {
        if (rule.style) {
          let props = originals.get(rule);
          if (!props) {
            props = [];
            for (const p of rule.style) {
              const v = rule.style.getPropertyValue(p);
              if (/vh\b/.test(v)) props.push([p, v, rule.style.getPropertyPriority(p)]);
            }
            originals.set(rule, props);
          }
          for (const [p, v, pri] of props) rule.style.setProperty(p, v.replace(VH, (_, n) => (n * h / 100).toFixed(2) + 'px'), pri);
        }
        if (rule.cssRules) walk(rule.cssRules);
      }
    };
    for (const sheet of doc.styleSheets) {
      try { walk(sheet.cssRules); } catch { /* a cross-origin sheet: nothing to rewrite */ }
    }
    size();
  }

  // Links in the archive open in this window. A few archive pages have a current counterpart.
  function route(doc) {
    for (const a of doc.querySelectorAll('a[href]')) {
      const url = new URL(a.href);
      if (url.origin !== location.origin || a.target === '_blank') continue;
      const samePage = url.pathname === thenUrl.pathname;
      if (samePage && url.hash && fit === 'content') continue;
      // A cut-off study keeps its own section links: they open the full archived page there.
      if (samePage && fit === 'now') { a.target = '_top'; continue; }
      if (map[url.pathname] !== undefined) a.href = map[url.pathname] + url.search + url.hash;
      a.target = '_top';
    }
    // Links within the archive's own page scroll this page to the matching spot.
    doc.addEventListener('click', e => {
      const a = e.target.closest && e.target.closest('a[href]');
      if (!a || a.target) return;
      const url = new URL(a.href);
      if (url.pathname !== thenUrl.pathname || !url.hash) return;
      const el = doc.getElementById(decodeURIComponent(url.hash.slice(1)));
      if (!el) return;
      e.preventDefault();
      const top = el.getBoundingClientRect().top + frame.getBoundingClientRect().top + scrollY - 24;
      scrollTo({top, behavior: reduce.matches ? 'auto' : 'smooth'});
      if (el.tabIndex < 0 && !/^(a|button|input|select|textarea)$/i.test(el.tagName)) el.setAttribute('tabindex', '-1');
      el.focus({preventScroll: true});
    });
  }

  frame.addEventListener('load', () => {
    try { doc = frame.contentDocument; } catch { doc = null; }
    if (!doc) return;
    originals.clear();
    shim(true);
    route(doc);
    doc.addEventListener('click', e => {
      const a = e.target.closest && e.target.closest('a[href]');
      if (!a) return;
      choose(e, a, 'then', !a.target && new URL(a.href).pathname === thenUrl.pathname);
    });
    doc.addEventListener('focusin', e => {
      const r = e.target.getBoundingClientRect();
      const o = frame.getBoundingClientRect();
      reveal(e.target, {left: r.left + o.left, right: r.right + o.left}, 'then');
    });
    const RO = frame.contentWindow.ResizeObserver || ResizeObserver;
    new RO(size).observe(doc.documentElement);
    for (const img of doc.images) if (!img.complete) img.addEventListener('load', size, {once: true});
    size();
  });

  new ResizeObserver(size).observe(now);
  addEventListener('resize', () => shim(false));
  wide.addEventListener('change', mode);

  set(value);
  mode();
  frame.src = thenUrl.pathname;
}
