import fs from 'fs';
// Test exact regex from app.js against routes in views.js
import { fileURLToPath, pathToFileURL } from 'url';
import path from 'path';

const candidateRoots = [
  fileURLToPath(new URL('../', import.meta.url)),
  fileURLToPath(new URL('../../../handoverhq/', import.meta.url)),
  fileURLToPath(new URL('../../handoverhq/', import.meta.url))
];
const PROJECT_ROOT = candidateRoots.find(r => fs.existsSync(path.join(r, 'js', 'store.js'))) || candidateRoots[0];
const APP_DIR = PROJECT_ROOT;
const baseDir = PROJECT_ROOT;
const viewsModule = await import(pathToFileURL(path.join(PROJECT_ROOT, 'js', 'views.js')).href);
const routes = viewsModule.routes;

const rx = routes.map(([p, h]) => [new RegExp('^' + p.replace(/:(\w+)/g, '(?<$1>[^/]+)') + '/?$'), h, p]);

const testPaths = [
  '/',
  '/index.html',
  '/demo',
  '/app/dashboard',
  '/app/shifts',
  '/app/shifts/new',
  '/app/shifts/SH-MORN',
  '/app/shifts/SH-MORN/edit',
  '/app/handovers',
  '/app/handovers/new',
  '/app/handovers/HO-1001',
  '/app/tasks',
  '/app/tasks/TK-1001',
  '/app/incidents',
  '/app/incidents/IN-2001',
  '/app/activity',
  '/app/settings',
  '/app/search',
  '/dashboard',
  '/shifts',
  '/tasks'
];

let failed = 0;
let passed = 0;
for (const testPath of testPaths) {
  let matched = false;
  for (const [r, h, p] of rx) {
    const m = r.exec(testPath);
    if (m) {
      matched = true;
      try {
        const out = h(m.groups || {}, new URLSearchParams());
        if (!out) {
          console.error(`  ✗ FAIL: Handler for ${testPath} returned null/undefined!`);
          failed++;
        } else {
          console.log(`  ✓ PASS: Path ${testPath.padEnd(25)} -> MATCHED [${p}]`);
          passed++;
        }
      } catch (err) {
        console.error(`  ✗ FAIL: Handler for ${testPath} threw:`, err);
        failed++;
      }
      break;
    }
  }
  if (!matched) {
    console.error(`  ✗ FAIL: Path ${testPath.padEnd(25)} -> NOT MATCHED!`);
    failed++;
  }
}

console.log(`\nRoute check complete. ${passed} Passed, ${failed} Failed.`);
process.exit(failed > 0 ? 1 : 0);
