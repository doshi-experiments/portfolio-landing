/* The scene caption is generated from the scene's reference, so what the
 * page says the model is after can never drift from what the model is. */

import type { SceneRef } from './schema';

export function captionFor(ref: SceneRef): string {
  const who = [ref.maker, [ref.place, ref.year].filter(Boolean).join(' ')].filter(Boolean).join(', ');
  const head =
    ref.kind === 'specific' ? `After ${ref.title}${who ? ` — ${who}` : ''}.`
    : ref.kind === 'analogy' ? `An analogy: ${ref.title}${who ? ` — ${who}` : ''}.`
    : `An original interpretation: ${ref.title}${who ? ` (after ${who})` : ''}.`;
  return `${head} ${ref.note}`;
}
