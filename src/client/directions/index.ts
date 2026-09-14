/* Per-direction client modules: decorative markup a direction adds into
 * the page's decoration slots, and removes again. Loaded only when applied.
 * A direction with nothing to draw (Swiss) simply has no entry. */

import type { Adjustments, DirectionId } from '@design/schema';

export interface DirectionClient {
  /** Fill decoration slots. Must be a pure function of the adjustments —
   *  it is re-run after `undecorate` whenever a decor control changes. */
  decorate(root: Document, adjustments: Adjustments): void;
  undecorate(root: Document): void;
}

const MODULES: Partial<Record<DirectionId, () => Promise<DirectionClient>>> = {
  'art-nouveau': () => import('./art-nouveau').then((m) => m.default),
};

export const loadDirectionClient = (id: DirectionId): Promise<DirectionClient | null> => {
  const loader = MODULES[id];
  return loader ? loader() : Promise.resolve(null);
};

/** The slots a direction may fill, by name, as they appear in the skeleton. */
export const slot = (root: Document, name: string): HTMLElement[] =>
  Array.from(root.querySelectorAll<HTMLElement>(`[data-slot="${name}"]`));

export const clearSlots = (root: Document, names: string[]): void => {
  for (const n of names) for (const el of slot(root, n)) el.replaceChildren();
};
