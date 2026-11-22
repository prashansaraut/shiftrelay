// ShiftRelay SPA-aware static server (Node.js built-in)
// Zero external dependencies. Enables refresh, deep direct URLs (e.g. /app/tasks/TK-1001, /demo).
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = 8000;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
  const urlPath = req.url.split('?')[0];
  let filePath = path.join(__dirname, urlPath);

  // If path does not exist directly, check if it is a static asset requested under a nested route (e.g. /app/js/...)
  if (!fs.existsSync(filePath)) {
    const stripped = urlPath.replace(/^\/(?:app|demo)(?=\/(?:js|css|assets|screenshots)\/)/, '');
    const altPath = path.join(__dirname, stripped);
    if (fs.existsSync(altPath) && !fs.statSync(altPath).isDirectory()) {
      filePath = altPath;
    }
  }

  // If path is a directory or does not exist as a file, fallback to index.html (SPA routing)
  let serveFallback = false;
  try {
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      filePath = path.join(__dirname, 'index.html');
      serveFallback = true;
    }
  } catch {
    filePath = path.join(__dirname, 'index.html');
    serveFallback = true;
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Server Error');
      return;
    }
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`ShiftRelay running at http://localhost:${PORT} and http://127.0.0.1:${PORT}`);
});
