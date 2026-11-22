// ShiftRelay HTTP Server Socket & Routing Test Suite
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const candidateRoots = [
  fileURLToPath(new URL('../', import.meta.url)),
  fileURLToPath(new URL('../../../handoverhq/', import.meta.url)),
  fileURLToPath(new URL('../../handoverhq/', import.meta.url))
];
const PROJECT_ROOT = candidateRoots.find(r => fs.existsSync(path.join(r, 'js', 'store.js'))) || candidateRoots[0];
const APP_DIR = PROJECT_ROOT;
const baseDir = PROJECT_ROOT;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon'
};

// Mirror exact server logic from server.js for isolated ephemeral socket testing
function createShiftRelayServer(baseDir) {
  return http.createServer((req, res) => {
    const urlPath = req.url.split('?')[0];
    let filePath = path.join(baseDir, urlPath);

    if (!fs.existsSync(filePath)) {
      const stripped = urlPath.replace(/^\/(?:app|demo)(?=\/(?:js|css|assets|screenshots)\/)/, '');
      const altPath = path.join(baseDir, stripped);
      if (fs.existsSync(altPath) && !fs.statSync(altPath).isDirectory()) {
        filePath = altPath;
      }
    }

    try {
      const stat = fs.statSync(filePath);
      if (stat.isDirectory()) {
        filePath = path.join(baseDir, 'index.html');
      }
    } catch {
      filePath = path.join(baseDir, 'index.html');
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
}

const server = createShiftRelayServer(PROJECT_ROOT);

await new Promise(resolve => {
  server.listen(0, '127.0.0.1', () => {
    resolve();
  });
});

const port = server.address().port;
console.log(`Server test instance listening on ephemeral port ${port}`);

const endpoints = [
  '/',
  '/demo',
  '/app/dashboard',
  '/app/shifts',
  '/app/tasks',
  '/css/main.css',
  '/js/app.js',
  '/js/brand.js',
  '/js/store.js'
];

let allPassed = true;
let passed = 0;

for (const ep of endpoints) {
  try {
    const res = await new Promise((resolve, reject) => {
      http.get(`http://127.0.0.1:${port}${ep}`, res => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve({ status: res.statusCode, length: data.length, type: res.headers['content-type'] }));
      }).on('error', reject);
    });
    console.log(`  ✓ PASS: GET ${ep.padEnd(18)} -> ${res.status} [${res.type}] (${res.length} bytes)`);
    if (res.status !== 200 || res.length === 0) {
      allPassed = false;
    } else {
      passed++;
    }
  } catch (err) {
    console.error(`  ✗ FAIL: GET ${ep.padEnd(18)} -> FAILED:`, err.message);
    allPassed = false;
  }
}

server.close();
console.log(`\nServer check complete. ${passed}/${endpoints.length} Endpoints Verified over HTTP socket.`);
process.exit(allPassed ? 0 : 1);
