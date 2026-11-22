import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const candidateRoots = [
  fileURLToPath(new URL('../', import.meta.url)),
  fileURLToPath(new URL('../../../handoverhq/', import.meta.url)),
  fileURLToPath(new URL('../../handoverhq/', import.meta.url))
];
const PROJECT_ROOT = candidateRoots.find(r => fs.existsSync(path.join(r, 'js', 'store.js'))) || candidateRoots[0];
const APP_DIR = PROJECT_ROOT;
const baseDir = PROJECT_ROOT;
const css = fs.readFileSync(path.join(PROJECT_ROOT, 'css/main.css'), 'utf8');

const classesToCheck = ['.tl', '.filters', '.empty', '.card', '.badge', '.btn', '.toast', '.scroll', '.top', '#side'];
let passed = 0;
let failed = 0;

for (const c of classesToCheck) {
  const inCss = css.includes(c);
  if (inCss) {
    console.log(`  ✓ PASS: Core selector "${c}" is defined in main.css`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: Core selector "${c}" is missing from main.css`);
    failed++;
  }
}

console.log(`\nCSS class check complete. ${passed} Passed, ${failed} Failed.`);
process.exit(failed > 0 ? 1 : 0);
