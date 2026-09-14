/* A static server for dist/ with the same directory-index behaviour as the
 * Workers asset host: /x/ → /x/index.html, /x → /x/index.html. */
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join } from 'node:path';

const TYPES = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.mjs': 'text/javascript',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.webp': 'image/webp', '.woff2': 'font/woff2', '.json': 'application/json',
  '.ico': 'image/x-icon', '.txt': 'text/plain', '.md': 'text/markdown',
};

export async function serve(root, port = 0) {
  const server = createServer(async (req, res) => {
    try {
      let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
      let file = join(root, p);
      try {
        const s = await stat(file);
        if (s.isDirectory()) file = join(file, 'index.html');
      } catch {
        file = join(root, p + (p.endsWith('/') ? '' : '/') + 'index.html');
      }
      const body = await readFile(file);
      res.writeHead(200, { 'content-type': TYPES[extname(file)] || 'application/octet-stream', 'cache-control': 'no-store' });
      res.end(body);
    } catch {
      try {
        const body = await readFile(join(root, '404.html'));
        res.writeHead(404, { 'content-type': 'text/html; charset=utf-8' });
        res.end(body);
      } catch { res.writeHead(404); res.end('not found'); }
    }
  });
  await new Promise((r) => server.listen(port, '127.0.0.1', () => r(null)));
  const addr = /** @type {import('node:net').AddressInfo} */ (server.address());
  const p = addr.port;
  return { url: `http://127.0.0.1:${p}`, close: () => new Promise((r) => server.close(() => r(null))) };
}
