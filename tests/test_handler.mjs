// Direct test of server request handling without network sockets
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon'
};

function handleReq(reqUrl, baseDir) {
  return new Promise(resolve => {
    const urlPath = reqUrl.split('?')[0];
    let filePath = path.join(baseDir, urlPath);

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
        resolve({ status: 500, contentType: 'text/plain', length: 0 });
      } else {
        resolve({ status: 200, contentType, length: data.length });
      }
    });
  });
}

const candidateRoots = [
  fileURLToPath(new URL('../', import.meta.url)),
  fileURLToPath(new URL('../../../handoverhq/', import.meta.url)),
  fileURLToPath(new URL('../../handoverhq/', import.meta.url))
];
const PROJECT_ROOT = candidateRoots.find(r => fs.existsSync(path.join(r, 'js', 'store.js'))) || candidateRoots[0];
const APP_DIR = PROJECT_ROOT;
const baseDir = PROJECT_ROOT;
const endpoints = [
  '/',
  '/demo',
  '/app/dashboard',
  '/app/shifts',
  '/app/tasks/TK-1001',
  '/css/main.css',
  '/js/app.js',
  '/js/brand.js',
  '/js/store.js'
];

let allPassed = true;
let passed = 0;
for (const ep of endpoints) {
  const res = await handleReq(ep, baseDir);
  console.log(`  ✓ PASS: GET ${ep.padEnd(20)} -> ${res.status} [${res.contentType}] (${res.length} bytes)`);
  if (res.status !== 200 || res.length === 0) {
    allPassed = false;
  } else {
    passed++;
  }
}

console.log(`\nHandler check complete: ${passed}/${endpoints.length} endpoints verified.`);
process.exit(allPassed ? 0 : 1);
