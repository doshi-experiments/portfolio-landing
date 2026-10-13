#!/usr/bin/env node
// Checks the files that deploy: every local reference resolves to a file, and each archived
// version under versions/<slug>/ only points inside itself or back to the current site.
// Run from anywhere: node tools/check-links.mjs
import {existsSync, readFileSync, readdirSync, statSync} from 'node:fs';
import {dirname, join, relative, resolve, sep} from 'node:path';

const root = resolve(dirname(new URL(import.meta.url).pathname), '..');
const roots = ['index.html', 'portfolio.css', 'portfolio.js', 'design-system', 'versions'];
const failures = [];
let files = 0, refs = 0;

const assetsignore = readFileSync(join(root, '.assetsignore'), 'utf8').split('\n').map(line => line.trim());
for (const name of roots) {
  const isDir = statSync(join(root, name)).isDirectory();
  for (const line of isDir ? [`!${name}/`, `!${name}/**`] : [`!${name}`]) {
    if (!assetsignore.includes(line)) failures.push(`.assetsignore lacks "${line}", so ${name} would not deploy`);
  }
}

function walk(path, out) {
  if (statSync(path).isDirectory()) for (const entry of readdirSync(path)) walk(join(path, entry), out);
  else out.push(path);
  return out;
}

const rel = file => relative(root, file).split(sep).join('/');

function check(file, ref) {
  if (!ref || ref.startsWith('#') || ref.startsWith('//') || /^[a-z][a-z0-9+.-]*:/i.test(ref)) return;
  refs++;
  const clean = ref.split('#')[0].split('?')[0];
  const archive = rel(file).match(/^versions\/([^/]+)\//);
  if (archive && clean.startsWith('/') && clean !== '/' && !clean.startsWith(`/versions/${archive[1]}/`)) {
    failures.push(`${rel(file)}: "${ref}" escapes its archive`);
  }
  if (clean === '') return;
  let target = clean.startsWith('/') ? join(root, clean) : join(dirname(file), clean);
  if (existsSync(target) && statSync(target).isDirectory()) target = join(target, 'index.html');
  if (!existsSync(target)) failures.push(`${rel(file)}: "${ref}" is missing (${rel(target)})`);
}

const cssRefs = (file, css) => {
  for (const m of css.matchAll(/url\(\s*(["']?)([^"')]+)\1\s*\)/g)) check(file, m[2].trim());
  for (const m of css.matchAll(/@import\s+(?:url\()?["']([^"']+)["']/g)) check(file, m[1]);
};
const jsRefs = (file, js) => {
  for (const m of js.matchAll(/\b(?:from|import\(|fetch\(|path:)\s*["']([^"']+)["']/g)) check(file, m[1]);
};
const htmlRefs = (file, html) => {
  for (const m of html.matchAll(/\b(?:href|src|poster|data-src|data-src-narrow|data-screen)="([^"]*)"/g)) check(file, m[1]);
  for (const m of html.matchAll(/\bsrcset="([^"]*)"/g)) for (const part of m[1].split(',')) check(file, part.trim().split(/\s+/)[0]);
  for (const m of html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)) cssRefs(file, m[1]);
  for (const m of html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)) jsRefs(file, m[1]);
};

for (const name of roots) {
  for (const file of walk(join(root, name), [])) {
    const text = () => readFileSync(file, 'utf8');
    if (file.endsWith('.html')) htmlRefs(file, text());
    else if (file.endsWith('.css')) cssRefs(file, text());
    else if (file.endsWith('.js') && !file.endsWith('.min.js')) jsRefs(file, text());
    else continue;
    files++;
  }
}

console.log(`${files} files scanned, ${refs} references checked`);
if (failures.length) {
  for (const failure of failures) console.error(`  ${failure}`);
  process.exit(1);
}
