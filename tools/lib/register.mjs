/* Lets the tools import the site's TypeScript source directly: Node strips
 * types itself; this hook resolves the tsconfig aliases and adds the .ts
 * extension the bundler would. Use: node --import ./tools/lib/register.mjs */
import { register } from 'node:module';
register('./hooks.mjs', import.meta.url);
