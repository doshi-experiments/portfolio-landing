/* Entry: one engine per page, hydrated once the modules land. The document
 * is already themed by the pre-paint boot; this adds the scene, the
 * decorations, and the controls.
 *
 * Query switches, for previews and the tools:
 *   ?scene=0         hide the scene (caption included)
 *   ?direction=<id>  apply a direction after hydration (the persisted path
 *                    is the one that paints first; this is a convenience) */

import { isBuilt } from '@content/directions';
import { Engine } from './engine';

const params = new URLSearchParams(location.search);
if (params.get('scene') === '0') document.documentElement.dataset['scene'] = 'off';

const engine = new Engine();
window.rd = engine;

const ready = document.readyState === 'loading'
  ? new Promise<void>((r) => document.addEventListener('DOMContentLoaded', () => r(), { once: true }))
  : Promise.resolve();

void ready.then(async () => {
  document.querySelector('.scene__rebuild')?.addEventListener('click', () => engine.rebuildScene());
  // The explorer arrives in the next phase. Until then the trigger hands
  // focus to the development toolbar where one exists, and is inert elsewhere.
  for (const b of document.querySelectorAll<HTMLButtonElement>('[data-explore]')) {
    b.addEventListener('click', () => {
      const first = document.querySelector<HTMLButtonElement>('#devbar [data-dev-direction]');
      if (first) first.focus();
    });
  }
  await engine.hydrate();
  const forced = params.get('direction');
  if (forced && isBuilt(forced) && forced !== engine.applied) await engine.apply(forced, 'query');
  document.documentElement.dataset['hydrated'] = 'true';
});

export { engine };
