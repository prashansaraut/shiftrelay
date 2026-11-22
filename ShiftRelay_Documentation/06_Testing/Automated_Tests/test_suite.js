// ShiftRelay Core Store & Continuity Engine Automated Test Suite
import { fileURLToPath, pathToFileURL } from 'url';
import path from 'path';
import fs from 'fs';

const candidateRoots = [
  fileURLToPath(new URL('../', import.meta.url)),
  fileURLToPath(new URL('../../../handoverhq/', import.meta.url)),
  fileURLToPath(new URL('../../handoverhq/', import.meta.url))
];
const PROJECT_ROOT = candidateRoots.find(r => fs.existsSync(path.join(r, 'js', 'store.js'))) || candidateRoots[0];
const APP_DIR = PROJECT_ROOT;
const baseDir = PROJECT_ROOT;
const storePath = path.join(PROJECT_ROOT, 'js', 'store.js');
const demoStorePath = path.join(PROJECT_ROOT, 'js', 'demo-store.js');
const viewsPath = path.join(PROJECT_ROOT, 'js', 'views.js');

// Mock minimal DOM environment for views and UI components
global.document = {
  querySelector: () => ({ append: () => {}, appendChild: () => {}, removeChild: () => {} }),
  createElement: () => ({ className: '', style: {}, setAttribute: () => {}, appendChild: () => {}, remove: () => {} })
};
global.FormData = class {
  constructor(f) { this.data = f._data || {}; }
  get(k) { return this.data[k] ?? null; }
  getAll(k) { return this.data[k] ?? []; }
};

const D = await import(pathToFileURL(storePath).href);
const { createDemoState, demoPrepareHandover, demoSimulateConflict, demoAcknowledgeHandover } = await import(pathToFileURL(demoStorePath).href);
const { submitForm } = await import(pathToFileURL(viewsPath).href);

let passed = 0;
let failed = 0;
const failures = [];

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failed++;
    failures.push(message);
  }
}

console.log('=== TEST SUITE 1: Dashboard Statistics ===');
{
  D.reset();
  const st1 = D.stats();
  assert(st1.repeat.some(x => x.id === 'TK-1003'), 'TK-1003 with carry: 2 flagged as repeat risk');
  
  // Add an open incident with carry: 1
  const s = D.get();
  s.incidents[0].carry = 1; // IN-2001 is Reported
  const st2 = D.stats();
  assert(st2.carried.some(x => x.id === 'IN-2001'), 'Carried statistic accounts for carried open incidents');
  assert(st2.carried.some(x => x.id === 'TK-1003'), 'Carried statistic accounts for carried open tasks');
  
  // Add carry: 2 to open incident, verify repeat risk
  s.incidents[0].carry = 2;
  const st3 = D.stats();
  assert(st3.repeat.some(x => x.id === 'IN-2001'), 'Incidents with carry >= 2 flagged in repeat risks');
}

console.log('\n=== TEST SUITE 2: Status Transition Validation ===');
{
  D.reset();
  // Task cannot be manually set to Carried Forward
  const res1 = D.setStatus('tasks', 'TK-1001', 'Carried Forward');
  assert(res1 && res1.includes('Continuity Engine'), 'Tasks cannot be manually set to Carried Forward');
  
  // Completing a task sets closedShift
  D.setStatus('tasks', 'TK-1001', 'Completed');
  const task = D.find('tasks', 'TK-1001');
  assert(task.status === 'Completed' && task.closedShift === 'SH-MORN', 'Completed task records closedShift');
  
  // Reopening a task clears closedShift
  D.setStatus('tasks', 'TK-1001', 'In Progress');
  assert(task.status === 'In Progress' && !task.closedShift, 'Reopening completed task clears closedShift');
  
  // Incident cannot be resolved without notes
  const res2 = D.setStatus('incidents', 'IN-2001', 'Resolved', '');
  assert(res2 && res2.includes('Resolution notes'), 'Incident cannot be resolved without resolution notes');
  
  // Incident cannot be closed without notes
  const res3 = D.setStatus('incidents', 'IN-2001', 'Closed', '   ');
  assert(res3 && res3.includes('Resolution notes'), 'Incident cannot be closed with whitespace notes');
  
  // Resolving with notes records closedShift and logs distinction
  D.setStatus('incidents', 'IN-2001', 'Resolved', 'Area cleared and certified safe.');
  const inc = D.find('incidents', 'IN-2001');
  assert(inc.status === 'Resolved' && inc.closedShift === 'SH-MORN', 'Resolved incident records closedShift');
  
  // Check activity log recorded resolved
  const act1 = D.get().activity[0];
  assert(act1 && act1.text.includes('Incident resolved in'), 'Activity log specifies "Incident resolved"');
  
  // Closing incident logs "closed"
  D.setStatus('incidents', 'IN-2002', 'Closed', 'Replaced hydraulic hose line.');
  const act2 = D.get().activity[0];
  assert(act2 && act2.text.includes('Incident closed in'), 'Activity log specifies "Incident closed"');
  
  // Reopening resolved incident clears closedShift
  D.setStatus('incidents', 'IN-2001', 'Under Investigation');
  assert(inc.status === 'Under Investigation' && !inc.closedShift, 'Reopening resolved incident clears closedShift');
}

console.log('\n=== TEST SUITE 3: Continuity Engine & Handover Validation (Gap 1 Covered) ===');
{
  D.reset();
  // Validate that both shift IDs exist
  const prepBad = D.prepare('SH-NONEXISTENT', 'SH-EVE');
  assert(prepBad.error && prepBad.error.includes('valid existing shifts'), 'Rejects non-existent shift IDs');
  
  const prepSame = D.prepare('SH-MORN', 'SH-MORN');
  assert(prepSame.error && prepSame.error.includes('differ'), 'Rejects identical from and to shifts');
  
  // Prepare valid handover Morning -> Evening
  const prepGood = D.prepare('SH-MORN', 'SH-EVE');
  assert(prepGood.handover && prepGood.handover.fromShift === 'SH-MORN', 'Successfully prepares handover');
  const hId = prepGood.handover.id;
  
  // Gap 1 assertion: Duplicate open handover for the same shift pair is rejected
  const prepDup = D.prepare('SH-MORN', 'SH-EVE');
  assert(prepDup.error && prepDup.error.includes('already exists for this shift pair'), 'Duplicate open handover for the same shift pair is rejected');
  assert(prepDup.handover && prepDup.handover.id === hId, 'Duplicate handover attempt returns existing open handover object');
  
  // Completed task TK-1004 should NOT be in handover
  assert(!prepGood.handover.taskIds.includes('TK-1004'), 'Completed task TK-1004 excluded from handover');
  
  // Advance to Awaiting Acknowledgement
  D.advance(hId); // Draft -> Submitted
  D.advance(hId); // Submitted -> Awaiting Acknowledgement
  
  // Simulate concurrent conflict: someone reassigns task TK-1002 to Night Shift!
  const task1002 = D.find('tasks', 'TK-1002');
  task1002.shiftId = 'SH-NIGHT';
  
  // Now incoming employee acknowledges handover
  const ackRes = D.acknowledge(hId);
  assert(ackRes.ok === true, 'Handover acknowledged successfully');
  assert(ackRes.conflicts.length > 0, 'Continuity Engine detected reassignment conflict');
  assert(task1002.shiftId === 'SH-NIGHT', 'Continuity Engine preserved TK-1002 new assignment to Night Shift');
  
  // Non-conflicting tasks were carried forward to SH-EVE
  const task1001 = D.find('tasks', 'TK-1001');
  assert(task1001.shiftId === 'SH-EVE', 'Non-conflicting task1001 moved to Evening Shift');
  assert(task1001.status === 'Carried Forward', 'Carried task status set to Carried Forward');
  assert(task1001.carry === 1, 'Carry counter incremented');
  assert(task1001.history.some(h => h.text.includes('Carried forward from Morning Shift to Evening Shift')), 'Original ID and audit history preserved');
}

console.log('\n=== TEST SUITE 4: Shift Overlap Validation (Gap 2 Covered) ===');
{
  D.reset();
  // Morning shift is 06:00 to 14:00 in department "Warehouse"
  let errorField = '';
  let errorMessage = '';
  const mockOverlappingForm = {
    dataset: { kind: 'shifts' },
    _data: {
      name: 'Overlapping Logistics Shift',
      dept: 'Warehouse',
      start: '07:00',
      end: '15:00',
      status: 'Upcoming',
      staff: []
    },
    querySelectorAll: (sel) => [
      { dataset: { err: 'start' }, set textContent(v) { if (v) { errorField = 'start'; errorMessage = v; } } },
      { dataset: { err: 'end' }, set textContent(v) { if (v) { errorField = 'end'; errorMessage = v; } } }
    ]
  };

  const submitResult = submitForm(mockOverlappingForm);
  assert(submitResult === null, 'Shift creation with overlapping hours in same department rejected');
  assert(errorMessage.includes('Overlaps Morning Shift in Warehouse'), 'Overlap validator accurately names conflicting shift and department');
  
  // Test same time slot in different department is permitted
  const mockValidForm = {
    dataset: { kind: 'shifts' },
    _data: {
      name: 'Assembly Morning Shift',
      dept: 'Assembly & Packaging',
      start: '06:00',
      end: '14:00',
      status: 'Upcoming',
      staff: []
    },
    querySelectorAll: () => []
  };
  const submitValidResult = submitForm(mockValidForm);
  assert(submitValidResult === '/app/shifts', 'Non-overlapping shift in different department allowed');
}

console.log('\n=== TEST SUITE 5: Repeat-Risk Lifecycle (Gap 5 Covered) ===');
{
  D.reset();
  // Create a fresh task in Morning Shift with carry: 0
  const repeatTask = {
    id: 'TK-REPEAT-CHECK',
    title: 'Critical conveyor vibration monitor',
    shiftId: 'SH-MORN',
    status: 'Open',
    priority: 'Critical',
    due: new Date(Date.now() + 86400000).toISOString(),
    carry: 0,
    history: []
  };
  D.get().tasks.push(repeatTask);

  // Initial check: verify task is not in repeat risks
  const st0 = D.stats();
  assert(!st0.repeat.some(t => t.id === 'TK-REPEAT-CHECK'), 'Initial open task (carry: 0) is not a repeat risk');

  // Handover 1: SH-MORN -> SH-EVE
  const p1 = D.prepare('SH-MORN', 'SH-EVE');
  const hId1 = p1.handover.id;
  D.advance(hId1); // Draft -> Submitted
  D.advance(hId1); // Submitted -> Awaiting Acknowledgement
  const ack1 = D.acknowledge(hId1);
  assert(ack1.ok === true, 'First handover acknowledged');
  assert(repeatTask.carry === 1, 'Task carry count equals 1 after first handover');
  
  const st1 = D.stats();
  assert(!st1.repeat.some(t => t.id === 'TK-REPEAT-CHECK'), 'Task with carry === 1 is carried but not yet a repeat risk');
  assert(st1.carried.some(t => t.id === 'TK-REPEAT-CHECK'), 'Task with carry === 1 is listed under carried items');

  // Handover 2: SH-EVE -> SH-NIGHT
  const p2 = D.prepare('SH-EVE', 'SH-NIGHT');
  const hId2 = p2.handover.id;
  D.advance(hId2); // Draft -> Submitted
  D.advance(hId2); // Submitted -> Awaiting Acknowledgement
  const ack2 = D.acknowledge(hId2);
  assert(ack2.ok === true, 'Second handover acknowledged');
  assert(repeatTask.carry === 2, 'Task carry count equals 2 after second handover');

  // Verify task now appears in repeat risks
  const st2 = D.stats();
  assert(st2.repeat.some(t => t.id === 'TK-REPEAT-CHECK'), 'Task carried twice (carry >= 2) appears in stats().repeat after two real handover acknowledgements');
}

console.log('\n=== TEST SUITE 6: Interactive Demo In-Memory Sandbox Isolation ===');
{
  D.reset();
  const prodBefore = JSON.stringify(D.get());
  
  // Run interactive demo flow
  demoPrepareHandover();
  demoSimulateConflict();
  demoAcknowledgeHandover();
  
  const prodAfter = JSON.stringify(D.get());
  assert(prodBefore === prodAfter, 'Interactive demo NEVER modifies production store data in LocalStorage');
}

console.log(`\n========================================`);
console.log(`TEST SUITE RESULTS: ${passed} PASSED, ${failed} FAILED`);
console.log(`========================================`);
process.exit(failed > 0 ? 1 : 0);
