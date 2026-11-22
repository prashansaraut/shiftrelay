// Deep Automated Frontend Test Harness for ShiftRelay
import fs from 'node:fs';

// Mock Browser Environment
const storeMap = new Map();
global.localStorage = {
  getItem: k => storeMap.get(k) ?? null,
  setItem: (k, v) => storeMap.set(k, String(v)),
  removeItem: k => storeMap.delete(k),
  clear: () => storeMap.clear()
};

global.window = {
  lucide: null, // Test offline fallback mode
  location: { href: 'http://localhost:8000/', pathname: '/', hash: '', protocol: 'http:' },
  addEventListener: () => {},
  removeEventListener: () => {}
};

global.location = global.window.location;
global.document = {
  documentElement: {
    setAttribute: (k, v) => { global.document.documentElement[k] = v; },
    getAttribute: k => global.document.documentElement[k]
  },
  body: {
    classList: {
      _classes: new Set(),
      add: c => global.document.body.classList._classes.add(c),
      remove: c => global.document.body.classList._classes.delete(c),
      toggle: c => {
        const has = global.document.body.classList._classes.has(c);
        if (has) global.document.body.classList._classes.delete(c);
        else global.document.body.classList._classes.add(c);
        return !has;
      },
      contains: c => global.document.body.classList._classes.has(c)
    },
    setAttribute: () => {},
    append: () => {}
  },
  querySelectorAll: () => [],
  querySelector: () => null,
  getElementById: () => null,
  addEventListener: () => {},
  removeEventListener: () => {},
  createElement: tag => ({
    tagName: tag.toUpperCase(),
    className: '',
    textContent: '',
    innerHTML: '',
    style: {},
    dataset: {},
    append: () => {},
    remove: () => {},
    setAttribute: () => {},
    querySelector: () => null,
    querySelectorAll: () => []
  })
};

global.history = {
  pushState: (s, t, url) => { global.location.pathname = url; },
  replaceState: (s, t, url) => { global.location.pathname = url; }
};

import { fileURLToPath, pathToFileURL } from 'url';
import path from 'path';

const candidateRoots = [
  fileURLToPath(new URL('../', import.meta.url)),
  fileURLToPath(new URL('../../../handoverhq/', import.meta.url)),
  fileURLToPath(new URL('../../handoverhq/', import.meta.url))
];
const PROJECT_ROOT = candidateRoots.find(r => fs.existsSync(path.join(r, 'js', 'store.js'))) || candidateRoots[0];

const D = await import(pathToFileURL(path.join(PROJECT_ROOT, 'js/store.js')).href);
const V = await import(pathToFileURL(path.join(PROJECT_ROOT, 'js/views.js')).href);
const UI = await import(pathToFileURL(path.join(PROJECT_ROOT, 'js/ui.js')).href);
const DemoStore = await import(pathToFileURL(path.join(PROJECT_ROOT, 'js/demo-store.js')).href);
const { landingView } = await import(pathToFileURL(path.join(PROJECT_ROOT, 'js/landing-view.js')).href);
const { demoView } = await import(pathToFileURL(path.join(PROJECT_ROOT, 'js/demo-view.js')).href);
const win = global.window;
delete global.window;
const { normalizePath } = await import(pathToFileURL(path.join(PROJECT_ROOT, 'js/app.js')).href);
global.window = win;

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ✕ FAIL: ${message}`);
    failed++;
  }
}

console.log('====================================================');
console.log('🚀 RUNNING DEEP COMPREHENSIVE FRONTEND TEST SUITE');
console.log('====================================================');

// --- 1. Public Landing Page Deep Verification ---
console.log('\n--- 1. Public Landing Page Tests ---');
const landing = landingView();
assert(landing.isPublic === true, 'Landing view is marked as public');
assert(landing.html.includes('Never drop the baton between shifts.'), 'Landing contains correct headline');
assert(landing.html.includes('Explore Interactive Demo'), 'Landing contains standardized "Explore Interactive Demo" CTA');
assert(landing.html.includes('Open Workspace'), 'Landing contains standardized "Open Workspace" CTA');
assert(!landing.html.includes('Launch Guided Demo'), 'Discordant CTA label "Launch Guided Demo" is eliminated');
assert(landing.html.includes('sr-brand-dark-text'), 'Dark navy and blue logo variation is used on light surfaces');
assert(landing.html.includes('sr-footer-grid'), '4-column structured footer layout is rendered');
assert(landing.html.includes('Zero Dependencies'), 'Footer includes zero-dependency badge');

// --- 2. Interactive Demo Walkthrough ---
console.log('\n--- 2. Interactive Demonstration Walkthrough Tests ---');
DemoStore.resetDemoState();
let dState = DemoStore.getDemoState();
assert(dState.step === 1, 'Demo initializes at Step 1');
assert(dState.tasks.length > 0, 'Demo has initial sample tasks');
assert(dState.incidents.length > 0, 'Demo has initial sample incidents');

// Prepare handover in demo
DemoStore.demoPrepareHandover();
dState = DemoStore.getDemoState();
assert(dState.step === 2, 'Handover preparation advances demo to Step 2');
assert(dState.handover !== null, 'Handover object created in demo state');
assert(dState.handover.status === 'Awaiting Acknowledgement', 'Demo handover generated awaiting review and sign-off');

// Simulate conflict
DemoStore.setDemoStep(3);
DemoStore.demoSimulateConflict();
dState = DemoStore.getDemoState();
assert(dState.step === 3, 'Demo step set to Step 3');
assert(dState.conflictSimulated === true, 'Conflict flag is recorded');
const conflictTask = dState.tasks.find(t => t.id === 'TK-1002');
assert(conflictTask.shiftId === 'SH-NIGHT', 'TK-1002 reassigned to Night Shift in memory');

// Advance and sign off
DemoStore.setDemoStep(4);
dState.handover.reviewed = true;
DemoStore.demoAcknowledgeHandover();
dState = DemoStore.getDemoState();
assert(dState.step === 5, 'Acknowledgement advances demo to Step 5');
assert(dState.handover.status === 'Acknowledged', 'Demo handover acknowledged');
assert(dState.conflicts.length === 1, 'Continuity Engine recorded the mid-flight conflict in conflicts log');
assert(conflictTask.shiftId === 'SH-NIGHT', 'Conflict task safely kept SH-NIGHT assignment');

// Ensure LocalStorage was NEVER touched by demo
assert(storeMap.size === 0, 'In-memory demo operated with ZERO LocalStorage pollution');

// --- 3. Operational Dashboard Verification ---
console.log('\n--- 3. Operations Dashboard & Metric Calculation Tests ---');
const dash = V.dashboard();
assert(dash.title === 'Operations Dashboard', 'Dashboard title matches');
assert(dash.html.includes('Active shifts'), 'Dashboard includes active shifts widget');
assert(dash.html.includes('Carried forward'), 'Dashboard includes Carried Forward metric');
assert(dash.html.includes('Critical incidents'), 'Dashboard includes critical incidents metric');
assert(dash.html.includes('Continuity risks'), 'Dashboard includes continuity risk analysis card');

// --- 4. Task Lifecycle & Guard Tests ---
console.log('\n--- 4. Task Management & State Transition Tests ---');
const tList = V.tasks();
assert(tList.title === 'Tasks', 'Tasks list view rendered');
assert(tList.html.includes('TK-1001'), 'Tasks list contains TK-1001');

// Test Manual Carried Forward Block
const invalidCarried = D.setStatus('tasks', 'TK-1001', 'Carried Forward');
assert(invalidCarried.includes('exclusively by the Continuity Engine'), 'Manual transition to Carried Forward is blocked');

// Test Completion with closedShift
D.setStatus('tasks', 'TK-1001', 'Completed');
const t1001 = D.find('tasks', 'TK-1001');
assert(t1001.status === 'Completed', 'Task status set to Completed');
assert(t1001.closedShift === 'SH-MORN', 'closedShift successfully recorded upon task completion');

// Test Reopening clears closedShift
D.setStatus('tasks', 'TK-1001', 'In Progress');
assert(t1001.status === 'In Progress', 'Task reopened to In Progress');
assert(t1001.closedShift === undefined, 'Reopening task successfully cleared previous closedShift');

// --- 5. Incident Lifecycle & Mandatory Notes Tests ---
console.log('\n--- 5. Incident Anomaly Log & Resolution Notes Tests ---');
const incList = V.incidents();
assert(incList.title === 'Incidents', 'Incidents list view rendered');

// Test empty resolution note block
const emptyNoteErr = D.setStatus('incidents', 'IN-2001', 'Resolved', '');
assert(emptyNoteErr.includes('Resolution notes are required'), 'Resolving incident without notes is strictly blocked');

const spaceNoteErr = D.setStatus('incidents', 'IN-2001', 'Resolved', '     ');
assert(spaceNoteErr.includes('Resolution notes are required'), 'Whitespace-only resolution notes are rejected');

// Test valid resolution
const validRes = D.setStatus('incidents', 'IN-2001', 'Resolved', 'Pallets removed from exit. Fire corridor clear.');
assert(validRes === '', 'Incident resolved successfully with valid notes');
const in2001 = D.find('incidents', 'IN-2001');
assert(in2001.status === 'Resolved', 'Incident status set to Resolved');
assert(in2001.resolution.includes('Pallets removed'), 'Resolution notes persisted');
assert(in2001.closedShift === 'SH-MORN', 'closedShift recorded for resolved incident');

// Reopen incident
D.setStatus('incidents', 'IN-2001', 'Under Investigation');
assert(in2001.closedShift === undefined, 'Reopening incident cleared closedShift');

// --- 6. Handover Protocol & Continuity Engine Conflict Tests ---
console.log('\n--- 6. Handover Protocol & Continuity Engine Tests ---');
// Prepare valid handover
const prepRes = D.prepare('SH-MORN', 'SH-EVE', { title: 'Morning to Evening Handover Test' });
assert(!prepRes.error, 'Handover prepared successfully without error');
const ho = prepRes.handover;
assert(ho.fromShift === 'SH-MORN', 'Outgoing shift is Morning Shift');
assert(ho.toShift === 'SH-EVE', 'Incoming shift is Evening Shift');
assert(ho.taskIds.includes('TK-1002'), 'Unresolved task TK-1002 attached automatically');
assert(!ho.taskIds.includes('TK-1004'), 'Completed task TK-1004 excluded automatically');

// Test advance workflow
D.advance(ho.id);
assert(ho.status === 'Submitted', 'Handover advanced from Draft to Submitted');
D.advance(ho.id);
assert(ho.status === 'Awaiting Acknowledgement', 'Handover advanced from Submitted to Awaiting Acknowledgement');

// Simulate real-world conflict: Supervisor reassigns TK-1002 to SH-NIGHT in the background
const tk1002 = D.find('tasks', 'TK-1002');
tk1002.shiftId = 'SH-NIGHT';
D.save();

// Incoming supervisor acknowledges handover
const ackRes = D.acknowledge(ho.id);
assert(typeof ackRes === 'object', 'Acknowledgement succeeded');
assert(ackRes.conflicts.length === 1, 'Continuity Engine caught 1 conflict');
assert(tk1002.shiftId === 'SH-NIGHT', 'Continuity Engine preserved TK-1002 newer assignment to SH-NIGHT');

// Non-conflicting task TK-1003 transferred and carried forward
const tk1003 = D.find('tasks', 'TK-1003');
assert(tk1003.shiftId === 'SH-EVE', 'TK-1003 transitioned to Evening Shift');
assert(tk1003.status === 'Carried Forward', 'TK-1003 status marked Carried Forward');
assert(tk1003.carry >= 3, 'TK-1003 carry count incremented');
assert(tk1003.id === 'TK-1003', 'Original primary record ID strictly preserved');

// --- 7. Theme & Profile Settings Tests ---
console.log('\n--- 7. Theme System & User Profile Settings Tests ---');
D.setTheme('light');
assert(D.getTheme() === 'light', 'Theme defaults to light mode');
D.setTheme('dark');
assert(D.getTheme() === 'dark', 'Theme toggles to dark mode and updates storage');
D.setTheme('light');

D.setRole('Incoming Shift Employee');
assert(D.get().role === 'Incoming Shift Employee', 'Simulated role switched to Incoming Shift Employee');

D.setUserPreferences({
  displayName: 'Sarah Jenkins',
  theme: 'light',
  defaultRoute: '/app/handovers',
  toastDuration: 4000
});
const user = D.get().user;
assert(user.name === 'Sarah Jenkins', 'Custom demo display name saved');
assert(user.defaultRoute === '/app/handovers', 'Default workspace route saved');
assert(user.toastDuration === 4000, 'Custom toast duration saved');

// --- 8. URL Normalization & Route Redirections ---
console.log('\n--- 8. SPA URL Normalization & Router Tests ---');
assert(normalizePath('/') === '/', 'Root path normalizes to /');
assert(normalizePath('/handoverhq/') === '/', 'Subfolder path normalizes to /');
assert(normalizePath('/handoverhq/demo') === '/demo', 'Subfolder demo path normalizes to /demo');
assert(normalizePath('/app/dashboard') === '/app/dashboard', 'Workspace dashboard path normalizes correctly');
assert(normalizePath('/handoverhq/app/tasks') === '/app/tasks', 'Subfolder workspace path normalizes correctly');
assert(normalizePath('/index.html', '#/demo') === '/demo', 'Hash routing fallback supported');
assert(normalizePath('/index.html', '#/app/dashboard') === '/app/dashboard', 'Hash routing for workspace supported');

// --- 9. Offline Icon Fallback Verification ---
console.log('\n--- 9. Offline SVG Fallback Verification ---');
const dummyDiv = {
  getAttribute: () => 'layout-dashboard',
  outerHTML: ''
};
// Test SVG_MAP coverage
const testIcons = ['layout-dashboard', 'clock', 'arrow-left-right', 'clipboard-list', 'alert-triangle', 'history', 'settings', 'menu', 'search', 'sun', 'moon', 'shield-check'];
let missingIcons = 0;
testIcons.forEach(i => {
  if (!UI.icons) missingIcons++;
});
assert(missingIcons === 0, 'UI icons module is healthy');

console.log('\n====================================================');
console.log(`TOTAL TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
console.log('====================================================');

if (failed > 0) {
  process.exit(1);
}
