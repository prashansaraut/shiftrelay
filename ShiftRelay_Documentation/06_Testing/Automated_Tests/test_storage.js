import fs from 'fs';
// ShiftRelay LocalStorage Migration & Resilience Automated Test Suite (Gaps 3 & 4 Covered)
import { fileURLToPath, pathToFileURL } from 'url';
import path from 'path';

class MockLocalStorage {
  constructor() { this.store = {}; }
  getItem(k) { return this.store[k] ?? null; }
  setItem(k, v) { this.store[k] = String(v); }
  removeItem(k) { delete this.store[k]; }
  clear() { this.store = {}; }
}

globalThis.localStorage = new MockLocalStorage();
globalThis.window = { dispatchEvent: () => {} };
globalThis.CustomEvent = class { constructor(type, detail) { this.type = type; this.detail = detail; } };

const candidateRoots = [
  fileURLToPath(new URL('../', import.meta.url)),
  fileURLToPath(new URL('../../../handoverhq/', import.meta.url)),
  fileURLToPath(new URL('../../handoverhq/', import.meta.url))
];
const PROJECT_ROOT = candidateRoots.find(r => fs.existsSync(path.join(r, 'js', 'store.js'))) || candidateRoots[0];
const APP_DIR = PROJECT_ROOT;
const baseDir = PROJECT_ROOT;
const storePath = path.join(PROJECT_ROOT, 'js', 'store.js');

let passed = 0;
let failed = 0;
const failures = [];

function assert(cond, msg) {
  if (cond) {
    console.log(`  ✓ PASS: ${msg}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${msg}`);
    failed++;
    failures.push(msg);
  }
}

console.log('=== TEST SUITE: LocalStorage Migration & Resilience ===');

// Test 1: Corrupted LocalStorage ("{") falls back to seed data without crashing (Gap 3 Part 1)
{
  localStorage.clear();
  localStorage.setItem('shiftrelay.v1', '{');
  
  const storeModule = await import(pathToFileURL(storePath).href + '?t=' + Date.now());
  const s = storeModule.get();
  assert(s !== null && typeof s === 'object', 'Corrupted JSON "{" falls back to object without crashing');
  assert(Array.isArray(s.shifts) && s.shifts.length === 3, 'Corrupted storage falls back to clean seed shifts');
  assert(Array.isArray(s.tasks) && s.tasks.length === 6, 'Corrupted storage falls back to clean seed tasks');
}

// Test 2: Missing "handovers" array is repaired while existing tasks are preserved (Gap 3 Part 2)
{
  localStorage.clear();
  const customTask = {
    id: 'TK-PRESERVED-99',
    title: 'Verify boiler feedwater valve alignment',
    shiftId: 'SH-MORN',
    status: 'In Progress',
    priority: 'Critical',
    due: '2026-11-25T14:00:00Z',
    carry: 1,
    history: []
  };
  const partialState = {
    role: 'Operations Manager',
    shifts: [{ id: 'SH-MORN', name: 'Morning Shift', dept: 'Warehouse', start: '06:00', end: '14:00', status: 'Active', staff: [] }],
    tasks: [customTask],
    incidents: [],
    // Note: handovers array is completely omitted!
    employees: [{ id: 'E1', name: 'Priya Nair', role: 'Operations Manager' }],
    activity: []
  };
  localStorage.setItem('shiftrelay.v1', JSON.stringify(partialState));

  const storeModule = await import(pathToFileURL(storePath).href + '?t=' + (Date.now() + 1));
  const s = storeModule.get();
  assert(s.tasks.some(t => t.id === 'TK-PRESERVED-99' && t.title === 'Verify boiler feedwater valve alignment'), 'Existing custom task is preserved during repair');
  assert(Array.isArray(s.handovers), 'Missing handovers array is repaired to a valid array');
  assert(s.handovers.length === 0, 'Repaired handovers array initialized cleanly without dropping tasks');
}

// Test 3: Legacy migration from 'handoverhq.v1' with full record verification (Gap 4)
{
  localStorage.clear();
  const legacyData = {
    role: 'Outgoing Shift Employee',
    user: { name: 'Manthan Raut', theme: 'dark', defaultRoute: '/app/tasks', toastDuration: 4000 },
    config: {
      departments: ['Refinery', 'Logistics'],
      categories: ['Mechanical', 'Electrical'],
      incidentCategories: ['Spill', 'Leak'],
      priorities: ['Low', 'Medium', 'High', 'Critical']
    },
    shifts: [
      { id: 'SH-LEG-ALPHA', name: 'Alpha Shift', dept: 'Refinery', start: '06:00', end: '14:00', status: 'Active', staff: ['EMP-01'] },
      { id: 'SH-LEG-BRAVO', name: 'Bravo Shift', dept: 'Refinery', start: '14:00', end: '22:00', status: 'Upcoming', staff: ['EMP-02'] }
    ],
    tasks: [
      { id: 'TK-LEG-101', title: 'Check distillation tower valves', shiftId: 'SH-LEG-ALPHA', status: 'Open', priority: 'Critical', due: '2026-12-01T12:00:00Z', carry: 0 },
      { id: 'TK-LEG-102', title: 'Log pump vibration spectrum', shiftId: 'SH-LEG-ALPHA', status: 'In Progress', priority: 'High', due: '2026-12-01T13:30:00Z', carry: 1 }
    ],
    incidents: [
      { id: 'IN-LEG-201', title: 'Secondary seal leak on pump P-102', shiftId: 'SH-LEG-ALPHA', severity: 'Critical', status: 'Investigating', carry: 0 }
    ],
    handovers: [
      { id: 'HO-LEG-301', title: 'Alpha to Bravo Handover', fromShift: 'SH-LEG-ALPHA', toShift: 'SH-LEG-BRAVO', status: 'Draft', taskIds: ['TK-LEG-101'], incidentIds: ['IN-LEG-201'] }
    ],
    employees: [
      { id: 'EMP-01', name: 'Manthan Raut', role: 'Outgoing Shift Employee' },
      { id: 'EMP-02', name: 'Priya Nair', role: 'Incoming Shift Employee' }
    ],
    activity: [
      { id: 'ACT-LEG-01', text: 'Shift Alpha initiated handover process', time: '2026-11-20T14:00:00Z' }
    ]
  };
  localStorage.setItem('handoverhq.v1', JSON.stringify(legacyData));

  // Load store with legacy key present
  const storeModule = await import(pathToFileURL(storePath).href + '?t=' + (Date.now() + 2));
  const s = storeModule.get();

  // Assert store in-memory state matches legacy data exactly
  assert(s.role === 'Outgoing Shift Employee', 'Legacy role loaded correctly');
  assert(s.user.name === 'Manthan Raut' && s.user.theme === 'dark', 'Legacy user preferences loaded correctly');
  assert(s.shifts.length === 2 && s.shifts[0].id === 'SH-LEG-ALPHA', 'Legacy shifts loaded without data loss');
  assert(s.tasks.length === 2 && s.tasks[0].id === 'TK-LEG-101' && s.tasks[1].id === 'TK-LEG-102', 'Legacy tasks loaded without data loss');
  assert(s.incidents.length === 1 && s.incidents[0].id === 'IN-LEG-201', 'Legacy incidents loaded without data loss');
  assert(s.handovers.length === 1 && s.handovers[0].id === 'HO-LEG-301', 'Legacy handovers loaded without data loss');
  assert(s.employees.length === 2 && s.employees[0].id === 'EMP-01', 'Legacy employees loaded without data loss');
  assert(s.activity.length === 1 && s.activity[0].id === 'ACT-LEG-01', 'Legacy activity loaded without data loss');

  // Assert 'shiftrelay.v1' key was automatically written to localStorage
  const migratedRaw = localStorage.getItem('shiftrelay.v1');
  assert(migratedRaw !== null, 'shiftrelay.v1 key created automatically on legacy load');

  const migrated = JSON.parse(migratedRaw);
  assert(migrated.shifts.length === 2 && migrated.shifts[0].id === 'SH-LEG-ALPHA', 'shiftrelay.v1 persists legacy shifts correctly');
  assert(migrated.tasks.length === 2 && migrated.tasks[0].title === 'Check distillation tower valves', 'shiftrelay.v1 persists legacy tasks correctly');
  assert(migrated.incidents.length === 1 && migrated.incidents[0].title === 'Secondary seal leak on pump P-102', 'shiftrelay.v1 persists legacy incidents correctly');
  assert(migrated.handovers.length === 1 && migrated.handovers[0].title === 'Alpha to Bravo Handover', 'shiftrelay.v1 persists legacy handovers correctly');
  assert(migrated.employees.length === 2 && migrated.employees[1].name === 'Priya Nair', 'shiftrelay.v1 persists legacy employees correctly');
}

// Test 4: QuotaExceeded error handling during save
{
  const storeModule = await import(pathToFileURL(storePath).href + '?t=' + (Date.now() + 3));
  const origSet = localStorage.setItem;
  localStorage.setItem = () => { throw new Error('QuotaExceededError'); };
  
  const saveRes = storeModule.save();
  assert(saveRes.ok === false, 'Safe save returns ok: false when quota exceeded');
  assert(saveRes.error && saveRes.error.includes('quota'), 'Safe save returns descriptive quota error message');
  
  localStorage.setItem = origSet;
}

console.log(`\n========================================`);
console.log(`STORAGE TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
console.log(`========================================`);
process.exit(failed > 0 ? 1 : 0);
