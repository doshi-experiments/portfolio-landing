import { defineConfig, fontProviders } from 'astro/config';
import { createHash } from 'node:crypto';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

/* The design-system build id keys the visitor's resolved-token cache: a
   cache written by an older deploy is ignored, never painted. It is a hash
   of everything that can change what a token resolves to. */
function buildId(): string {
  const h = createHash('sha256');
  const walk = (dir: string) => {
    for (const name of readdirSync(dir).sort()) {
      const p = join(dir, name);
      if (statSync(p).isDirectory()) walk(p);
      else h.update(p).update(readFileSync(p));
    }
  };
  for (const d of ['src/design', 'src/content/directions', 'src/styles']) walk(d);
  return h.digest('hex').slice(0, 12);
}

/* Fonts are served from the pinned @fontsource packages through Astro's local
   provider: Astro hashes the files into /_astro/fonts, writes the @font-face
   rules, and generates metric-matched fallbacks so a face that is slow or
   blocked does not move the layout. Only Latin subsets, only the variable
   wght file where one exists (the opsz/wdth files are 1.5–2.4× larger and no
   recipe uses those axes). Sizes measured at install, see README. */
const fs = (pkg: string, file: string) => `@fontsource-variable/${pkg}/files/${file}`;
const st = (pkg: string, file: string) => `@fontsource/${pkg}/files/${file}`;

const variable = (
  name: string,
  cssVariable: string,
  pkg: string,
  file: string,
  fallbacks: string[],
  opts: { italic?: boolean; range?: string } = {},
) => ({
  provider: fontProviders.local(),
  name,
  cssVariable,
  fallbacks,
  options: {
    variants: [
      { src: [fs(pkg, `${file}-normal.woff2`)], weight: opts.range ?? '100 900', style: 'normal' as const },
      ...(opts.italic
        ? [{ src: [fs(pkg, `${file}-italic.woff2`)], weight: opts.range ?? '100 900', style: 'italic' as const }]
        : []),
    ] as [any, ...any[]],
  },
});

export default defineConfig({
  site: 'https://rishabhdoshi.com',
  output: 'static',
  trailingSlash: 'ignore',
  build: {
    format: 'directory',
    inlineStylesheets: 'auto',
  },
  vite: {
    define: { __BUILD_ID__: JSON.stringify(buildId()) },
  },
  markdown: { shikiConfig: { theme: 'github-light' } },
  fonts: [
    variable('Inter', '--font-inter', 'inter', 'inter-latin-wght', ['system-ui', 'sans-serif'], { range: '100 900' }),
    variable('Source Serif 4', '--font-source-serif-4', 'source-serif-4', 'source-serif-4-latin-wght', ['Georgia', 'serif'], { italic: true, range: '200 900' }),
    variable('Source Sans 3', '--font-source-sans-3', 'source-sans-3', 'source-sans-3-latin-wght', ['system-ui', 'sans-serif'], { range: '200 900' }),
    variable('Cormorant Garamond', '--font-cormorant-garamond', 'cormorant-garamond', 'cormorant-garamond-latin-wght', ['Georgia', 'serif'], { italic: true, range: '300 700' }),
    variable('Josefin Sans', '--font-josefin-sans', 'josefin-sans', 'josefin-sans-latin-wght', ['system-ui', 'sans-serif'], { range: '100 700' }),
    variable('Jost', '--font-jost', 'jost', 'jost-latin-wght', ['system-ui', 'sans-serif'], { range: '100 900' }),
    variable('Oswald', '--font-oswald', 'oswald', 'oswald-latin-wght', ['Arial Narrow', 'system-ui', 'sans-serif'], { range: '200 700' }),
    variable('IBM Plex Sans', '--font-ibm-plex-sans', 'ibm-plex-sans', 'ibm-plex-sans-latin-wght', ['system-ui', 'sans-serif'], { range: '100 700' }),
    variable('Space Grotesk', '--font-space-grotesk', 'space-grotesk', 'space-grotesk-latin-wght', ['system-ui', 'sans-serif'], { range: '300 700' }),
    {
      provider: fontProviders.local(),
      name: 'Archivo Black',
      cssVariable: '--font-archivo-black',
      fallbacks: ['Arial Black', 'system-ui', 'sans-serif'],
      options: { variants: [{ src: [st('archivo-black', 'archivo-black-latin-400-normal.woff2')], weight: 400, style: 'normal' }] },
    },
    {
      provider: fontProviders.local(),
      name: 'IBM Plex Mono',
      cssVariable: '--font-ibm-plex-mono',
      fallbacks: ['Menlo', 'Consolas', 'monospace'],
      options: { variants: [{ src: [st('ibm-plex-mono', 'ibm-plex-mono-latin-400-normal.woff2')], weight: 400, style: 'normal' }] },
    },
  ],
});
