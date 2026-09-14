/* Lazy scene registry: a scene's geometry is imported only when a direction
 * that uses it is applied. Ids are fixed in the schema; entries appear here
 * as scenes are built. */

import type { SceneId } from '@design/schema';
import type { SceneDef } from './engine';

export const SCENES: Partial<Record<SceneId, () => Promise<SceneDef>>> = {
  dessau: () => import('./scenes/dessau').then((m) => m.dessau),
  'hfg-ulm': () => import('./scenes/hfg-ulm').then((m) => m.hfgUlm),
  'metro-entrance': () => import('./scenes/metro-entrance').then((m) => m.metroEntrance),
  'habitat-67': () => import('./scenes/habitat-67').then((m) => m.habitat67),
};

export const loadScene = (id: SceneId): Promise<SceneDef | null> => {
  const loader = SCENES[id];
  return loader ? loader() : Promise.resolve(null);
};
