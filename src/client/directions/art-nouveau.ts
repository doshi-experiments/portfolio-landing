/* Art Nouveau decorations: an open, asymmetric whiplash frame around the
 * hero text, a small drawn corner at each project frame, and a curling
 * divider under each section heading. All original vector; all inside
 * aria-hidden slots; all a pure function of the line-detail level:
 *   off  → nothing drawn
 *   low  → corners and dividers only
 *   full → the hero frame as well */

import type { Adjustments } from '@design/schema';
import { clearSlots, slot, type DirectionClient } from './index';

const SLOTS = ['hero-ornament', 'section-divider', 'project-backing'];

const svg = (viewBox: string, body: string, cls = '') =>
  `<svg class="whiplash ${cls}" viewBox="${viewBox}" preserveAspectRatio="${cls.includes('an-') ? 'none' : 'xMidYMid meet'}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">${body}</svg>`;

/* The hero frame, in three edge pieces (each stretched along one axis by
   CSS): a stem up the left that curls into a bud at the top; a whip along
   the top edge; a thinner tendril under the copy. */
const HERO_LEFT = svg('0 0 64 520', [
  '<path pathLength="1" stroke-width="2.4" d="M 30 518 C 6 430, 54 350, 24 262 S 14 140, 40 80 C 52 52, 60 38, 44 24 C 32 14, 16 22, 20 36 C 24 48, 40 46, 40 34"/>',
  '<path pathLength="1" class="thin" stroke-width="1" d="M 24 262 C 36 250, 44 230, 42 210"/>',
  '<ellipse class="bud" cx="42" cy="210" rx="3.5" ry="6" transform="rotate(20 42 210)"/>',
  '<ellipse class="bud" cx="30" cy="518" rx="5" ry="9" transform="rotate(30 30 518)"/>',
].join(''), 'drawing an-left');
const HERO_TOP = svg('0 0 620 56', [
  '<path pathLength="1" stroke-width="1.8" d="M 0 30 C 90 4, 220 12, 340 8 S 540 26, 620 4"/>',
  '<path pathLength="1" class="thin" stroke-width="1" d="M 340 8 C 352 18, 368 18, 372 6"/>',
  '<ellipse class="bud" cx="620" cy="4" rx="5" ry="9" transform="rotate(-60 620 4)"/>',
].join(''), 'drawing an-top');
const HERO_BOTTOM = svg('0 0 620 40', [
  '<path pathLength="1" class="thin" stroke-width="1.1" d="M 0 8 C 100 44, 240 10, 380 24 S 540 0, 620 20"/>',
  '<ellipse class="bud" cx="620" cy="20" rx="3.5" ry="6" transform="rotate(50 620 20)"/>',
].join(''), 'drawing an-bottom');

const CORNER = svg('0 0 44 44', [
  '<path pathLength="1" stroke-width="1.2" d="M 2 44 C 2 20, 20 2, 44 2"/>',
  '<path pathLength="1" class="thin" stroke-width="1" d="M 10 34 C 8 20, 20 10, 34 10 C 40 10, 40 18, 34 18 C 30 18, 30 13, 34 12"/>',
  '<ellipse class="bud" cx="10" cy="34" rx="2.2" ry="4" transform="rotate(35 10 34)"/>',
].join(''));

const DIVIDER = svg('0 0 360 28', [
  '<path pathLength="1" stroke-width="1.4" d="M 0 16 C 60 -4, 120 34, 180 16 S 300 -2, 352 14"/>',
  '<path pathLength="1" class="thin" stroke-width="1" d="M 180 16 C 190 24, 204 22, 206 14"/>',
  '<ellipse class="bud" cx="352" cy="14" rx="3.5" ry="6" transform="rotate(60 352 14)"/>',
].join(''), 'drawing');

const client: DirectionClient = {
  decorate(root: Document, adjustments: Adjustments) {
    const level = String(adjustments['lineDetail'] ?? 'full');
    if (level === 'off') return;
    for (const el of slot(root, 'section-divider')) el.innerHTML = DIVIDER;
    for (const el of slot(root, 'project-backing')) el.innerHTML = CORNER + CORNER + CORNER + CORNER;
    if (level === 'full') for (const el of slot(root, 'hero-ornament')) el.innerHTML = HERO_LEFT + HERO_TOP + HERO_BOTTOM;
  },
  undecorate(root: Document) {
    clearSlots(root, SLOTS);
  },
};

export default client;
