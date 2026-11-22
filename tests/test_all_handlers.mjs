import fs from 'fs';
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
const D = await import(pathToFileURL(path.join(PROJECT_ROOT, 'js', 'store.js')).href);
const routes = viewsModule.routes;

D.reset();

let errorCount = 0;
let passedCount = 0;

for (const [pattern, handler] of routes) {
  try {
    const dummyParams = { id: 'TK-1001' };
    const dummyQuery = new URLSearchParams();
    const result = handler(dummyParams, dummyQuery);
    if (!result) {
      console.error(`  ✗ FAIL: Route [${pattern}] handler returned falsy!`, result);
      errorCount++;
    } else if (result.redirect) {
      console.log(`  ✓ PASS: Route [${pattern}] redirects to -> ${result.redirect}`);
      passedCount++;
    } else if (!result.html) {
      console.error(`  ✗ FAIL: Route [${pattern}] returned object without html!`, result);
      errorCount++;
    } else {
      console.log(`  ✓ PASS: Route [${pattern}] returned valid HTML (${result.html.length} chars)`);
      passedCount++;
    }
  } catch (err) {
    console.error(`  ✗ FAIL: Route [${pattern}] threw exception:`, err);
    errorCount++;
  }
}

console.log(`\nHandler test complete. ${passedCount} Passed, ${errorCount} Errors.`);
process.exit(errorCount > 0 ? 1 : 0);
