/* Build-time facts the runtime needs: the hashed URL of every direction's
 * stylesheet and the design-system build id that keys the token cache. */

declare const __BUILD_ID__: string;

const cssUrls = import.meta.glob('../styles/directions/*.css', { query: '?url', import: 'default', eager: true }) as Record<string, string>;

/** direction id → stylesheet URL (hashed in production). */
export const DIRECTION_CSS: Record<string, string> = Object.fromEntries(
  Object.entries(cssUrls).map(([path, url]) => [path.replace(/^.*\/([^/]+)\.css$/, '$1'), url]),
);

export const BUILD_ID: string = typeof __BUILD_ID__ === 'string' ? __BUILD_ID__ : 'dev';
