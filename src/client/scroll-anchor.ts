/* A structural theme change reflows the page. We do not promise zero
 * reflow; we promise the reader stays where they were: the heading nearest
 * the top of the viewport is found before the change and put back at the
 * same offset after it, instantly. At the very top of the page nothing is
 * done — no theme change may scroll the reader away from the top. */

const CANDIDATES = 'main h1, main h2, main h3, [data-anchor]';

export interface Anchor { el: Element; top: number }

export function captureAnchor(): Anchor | null {
  if (window.scrollY < 8) return null;
  let best: Anchor | null = null;
  for (const el of document.querySelectorAll(CANDIDATES)) {
    const top = el.getBoundingClientRect().top;
    // the first heading whose top is at or below the viewport top, or the
    // last one above it when none is below
    if (top >= -4) { best = { el, top }; break; }
    best = { el, top };
  }
  return best;
}

export function restoreAnchor(a: Anchor | null): void {
  if (!a || !a.el.isConnected) return;
  const now = a.el.getBoundingClientRect().top;
  const delta = now - a.top;
  if (Math.abs(delta) > 1) window.scrollBy({ top: delta, left: 0, behavior: 'instant' as ScrollBehavior });
}
