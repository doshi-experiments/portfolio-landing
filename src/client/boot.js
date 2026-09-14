/* Pre-paint boot. Inlined into <head> by Base.astro with `RD` (the
 * manifest) defined just before it. Runs before the body is parsed, so what
 * it stamps is what the first frame shows. Keep it tiny and dependency-free.
 *
 * RD = { default, css: {id: url}, data: {id: {attr: value}}, fonts: {id: [url]},
 *        buildId, storageKey }
 *
 * 1. Read the persisted state; anything malformed or unknown → the default.
 * 2. Stamp <html>: direction, its recipe attributes, reading size, reduce
 *    effects, and — only when the cache was written by *this* build — the
 *    resolved vars that carry the visitor's Tune deviations.
 * 3. For a non-default direction, insert its stylesheet. Measured, not
 *    assumed (tools/firstpaint.mjs): a script-inserted stylesheet does not
 *    block rendering; `blocking="render"` would, but without any cap. So the
 *    link goes in with media="not all", the body is held invisible by us,
 *    and the hold is released on load or at 1.5 s, whichever comes first —
 *    bounded in every browser. The inline default tokens keep the colours
 *    right if the cap wins; only the composition arrives late. On error,
 *    fall back to the default and forget the stored choice. */
(function () {
  var M = /** @type {any} */ (window).RD;
  if (!M) return;
  var h = document.documentElement;
  var s = null;
  try { s = JSON.parse(localStorage.getItem(M.storageKey) || 'null'); } catch (e) { s = null; }
  var valid = s && s.v === 1 && typeof s.direction === 'string' && M.css[s.direction] !== undefined;
  var id = valid ? s.direction : M.default;
  var g = (valid && s.global) || {};

  function stampDefaults(dir) {
    var d = M.data[dir] || {};
    for (var k in d) h.setAttribute('data-' + k, d[k]);
    h.setAttribute('data-direction', dir);
  }
  function unstamp(dir) {
    var d = M.data[dir] || {};
    for (var k in d) h.removeAttribute('data-' + k);
    h.removeAttribute('style');
  }

  stampDefaults(id);
  if (g.readingSize === 112.5 || g.readingSize === 125) {
    h.setAttribute('data-reading-size', String(g.readingSize));
    h.style.setProperty('--type-reading-size', String(g.readingSize / 100));
  }
  if (g.reduceEffects === true) h.setAttribute('data-reduce-effects', 'true');

  var c = valid && s.cache;
  if (c && c.buildId === M.buildId && c.direction === id && c.vars && c.data) {
    for (var v in c.vars) h.style.setProperty(v, c.vars[v]);
    for (var a in c.data) h.setAttribute('data-' + a, c.data[a]);
  }

  if (id === M.default) return; // the default sheet is in the critical CSS

  var link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = M.css[id];
  link.media = 'not all';
  link.setAttribute('data-direction', id);
  link.setAttribute('data-state', 'loading');
  h.setAttribute('data-css-pending', '');
  var settled = false;
  var release = function () {
    if (settled) return;
    settled = true;
    h.removeAttribute('data-css-pending');
  };
  link.addEventListener('load', function () { link.setAttribute('data-state', 'loaded'); link.media = ''; release(); });
  link.addEventListener('error', function () {
    link.setAttribute('data-state', 'failed');
    unstamp(id);
    stampDefaults(M.default);
    h.setAttribute('data-boot', 'fallback');
    release();
    try { localStorage.removeItem(M.storageKey); } catch (e) {}
  });
  setTimeout(release, 1500);
  document.head.appendChild(link);

  var fonts = M.fonts[id] || [];
  for (var i = 0; i < fonts.length; i++) {
    var p = document.createElement('link');
    p.rel = 'preload';
    p.as = 'font';
    p.type = 'font/woff2';
    p.crossOrigin = '';
    p.href = fonts[i];
    document.head.appendChild(p);
  }
})();
