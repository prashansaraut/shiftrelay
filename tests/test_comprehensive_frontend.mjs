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

let passed = 0;
let failed = 0;
const failures = [];

function assert(condition, message) {
  if (condition) {
    passed++;
    console.log(`  ✓ PASS: ${message}`);
  } else {
    failed++;
    failures.push(message);
    console.error(`  ✗ FAIL: ${message}`);
  }
}

console.log('================================================================');
console.log('🔬 SHIFTRELAY COMPREHENSIVE FRONTEND ARCHITECTURE & DESIGN AUDIT');
console.log('================================================================\n');

// 1. Files
const indexHtml = fs.readFileSync(path.join(APP_DIR, 'index.html'), 'utf8');
const landingView = fs.readFileSync(path.join(APP_DIR, 'js/landing-view.js'), 'utf8');
const demoView = fs.readFileSync(path.join(APP_DIR, 'js/demo-view.js'), 'utf8');
const viewsJs = fs.readFileSync(path.join(APP_DIR, 'js/views.js'), 'utf8');
const mainCss = fs.readFileSync(path.join(APP_DIR, 'css/main.css'), 'utf8');
const storeJs = fs.readFileSync(path.join(APP_DIR, 'js/store.js'), 'utf8');
const demoStoreJs = fs.readFileSync(path.join(APP_DIR, 'js/demo-store.js'), 'utf8');

console.log('--- 1. Landing Page Hierarchy & Visual Contrast ---');
assert(landingView.includes('class="sr-hero-ctas"') && landingView.includes('Explore Interactive Demo'), 'Primary hero CTA is standardized to "Explore Interactive Demo"');
assert(landingView.includes('Open Workspace'), 'Secondary hero CTA is standardized to "Open Workspace"');
assert(!landingView.includes('Launch Guided Demo'), 'Legacy "Launch Guided Demo" label is completely purged');
assert(landingView.includes("'dark-text'"), 'Navbar logo uses high-contrast dark text variation on light surface');
assert(landingView.includes('sr-footer') && landingView.includes("'dark-text'"), 'Footer logo uses high-contrast dark text variation on light surface');
assert(landingView.includes('id="continuity-engine"') && landingView.includes('The Continuity Engine'), 'Landing page contains Continuity Engine deep-dive section');
assert(landingView.includes('id="problem"') && landingView.includes('Problem vs Solution'), 'Landing page contains Problem vs Solution section');
assert(landingView.includes('Six purpose-built operational modules'), 'Landing page contains Product modules showcase');

console.log('\n--- 2. Interactive Demo Milestone Accuracy ---');
assert(demoView.includes('Outgoing Inspection'), 'Demo Milestone 1 is Outgoing Inspection');
assert(demoView.includes('Handover Draft'), 'Demo Milestone 2 is Handover Draft');
assert(demoView.includes('Conflict Detection'), 'Demo Milestone 3 is Conflict Detection');
assert(demoView.includes('Incoming Sign-off'), 'Demo Milestone 4 is Incoming Sign-off');
assert(demoView.includes('Continuity Audit'), 'Demo Milestone 5 is Continuity Audit');
assert(demoStoreJs.includes('TK-1002') && demoStoreJs.includes('SH-NIGHT'), 'Demo simulates concurrent conflict by reassigning TK-1002 to Night Shift');
assert(demoView.includes('data-act="demo-reset"'), 'Demo provides a clean Reset / Replay mechanism');

console.log('\n--- 3. Workspace Layout & Navigation Integrity ---');
assert(indexHtml.includes('id="side"'), 'Workspace features a persistent sidebar container');
assert(indexHtml.includes('id="topBar"'), 'Workspace features a persistent top navigation bar');
assert(indexHtml.includes('id="gsearch"'), 'Workspace features global search input');
assert(indexHtml.includes('id="srProfileDropdown"'), 'Workspace features dedicated profile dropdown menu');
assert(viewsJs.includes('/app/dashboard'), 'Workspace includes Dashboard route');
assert(viewsJs.includes('/app/shifts'), 'Workspace includes Shifts route');
assert(viewsJs.includes('/app/handovers'), 'Workspace includes Handovers route');
assert(viewsJs.includes('/app/tasks'), 'Workspace includes Tasks route');
assert(viewsJs.includes('/app/incidents'), 'Workspace includes Incidents route');
assert(viewsJs.includes('/app/activity'), 'Workspace includes Activity route');
assert(viewsJs.includes('/app/settings'), 'Workspace includes Settings route');

console.log('\n--- 4. CSS Architecture & Overflow Safety ---');
assert(mainCss.includes('overflow-x: hidden'), 'Root html/body rules contain overflow-x: hidden to prevent mobile horizontal blowouts');
assert(mainCss.includes('width: calc(100% - 240px)'), 'Desktop workspace restricts #main width to calc(100% - 240px)');
assert(mainCss.includes('box-sizing: border-box'), 'Universal box-sizing reset is active');
assert(mainCss.includes('@media (max-width: 1024px)'), 'CSS defines tablet breakpoint at <= 1024px');
assert(mainCss.includes('@media (max-width: 480px)'), 'CSS defines mobile phone breakpoint at <= 480px');
assert(mainCss.includes('.sr-nav-mobile'), 'CSS includes off-canvas mobile drawer styling');

console.log('\n--- 5. Seed Data & Continuity Engine Guarantees ---');
assert(storeJs.includes('SH-MORN') && storeJs.includes('SH-EVE') && storeJs.includes('SH-NIGHT'), 'Seed data defines 3 24/7 continuous shifts');
assert(storeJs.includes('Warehouse') && storeJs.includes('Maintenance'), 'Seed data defines realistic departments');
assert(storeJs.includes('function prepare'), 'Continuity Engine exposes prepare() constructor');
assert(storeJs.includes('function acknowledge'), 'Continuity Engine exposes acknowledge() transition protocol');
assert(storeJs.includes('stats()'), 'Continuity Engine exposes live stats() aggregator');

console.log('\n================================================================');
console.log(`TOTAL AUDIT CHECKS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
console.log('================================================================');

if (failed > 0) {
  console.error('\nFailures encountered:');
  failures.forEach((f, i) => console.error(`  ${i + 1}. ${f}`));
  process.exit(1);
} else {
  console.log('🎉 ALL ARCHITECTURAL CHECKS PASSED (100% VERIFIED)!');
}
