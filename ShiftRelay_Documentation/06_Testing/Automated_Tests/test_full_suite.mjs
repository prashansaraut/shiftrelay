// ShiftRelay Master Automated Test Runner
// Executes all reproducible automated test suites in isolated Node.js child processes
// Exits with code 0 on complete pass, or code 1 if any failure occurs.
import { fork } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const TESTS_DIR = fileURLToPath(new URL('./', import.meta.url));

const testFiles = [
  { name: 'Store & Continuity Engine Suite', file: 'test_suite.js' },
  { name: 'LocalStorage Migration & Resilience Suite', file: 'test_storage.js' },
  { name: 'SPA Route Matching & Regex Suite', file: 'test_routes.mjs' },
  { name: 'Server Request & MIME Handler Suite', file: 'test_handler.mjs' },
  { name: 'View Route Handlers Execution Suite', file: 'test_all_handlers.mjs' },
  { name: 'HTTP Socket & Ephemeral Server Suite', file: 'test_server.mjs' },
  { name: 'Theme & Profile Preferences Suite', file: 'test_theme_and_profile.mjs' },
  { name: 'Theme & Mobile Responsiveness Suite', file: 'test_theme_and_phone.mjs' },
  { name: 'Deep Frontend Functional Suite', file: 'test_deep_frontend.mjs' },
  { name: 'Architecture & Design Consistency Suite', file: 'test_comprehensive_frontend.mjs' },
  { name: 'CSS Core Selectors Integrity Suite', file: 'test_check.mjs' }
];

async function runTest(test) {
  return new Promise((resolve) => {
    console.log(`\n============================================================`);
    console.log(`RUNNING: ${test.name} (${test.file})`);
    console.log(`============================================================`);
    
    const filePath = path.join(TESTS_DIR, test.file);
    const child = fork(filePath, { stdio: 'inherit' });

    child.on('exit', (code) => {
      resolve({ name: test.name, file: test.file, passed: code === 0, code });
    });

    child.on('error', (err) => {
      console.error(`Failed to launch test ${test.file}:`, err);
      resolve({ name: test.name, file: test.file, passed: false, code: 1 });
    });
  });
}

async function runAll() {
  const startTime = Date.now();
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║        SHIFTRELAY MASTER AUTOMATED TEST RUNNER          ║');
  console.log('║        Verifying Functional, State & Visual Safety       ║');
  console.log('╚══════════════════════════════════════════════════════════╝');
  console.log(`Date: ${new Date().toISOString()}`);
  console.log(`Node Version: ${process.version}`);
  console.log(`Test Directory: ${TESTS_DIR}\n`);

  const results = [];
  for (const t of testFiles) {
    const res = await runTest(t);
    results.push(res);
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  const totalSuites = results.length;
  const passedSuites = results.filter(r => r.passed).length;
  const failedSuites = results.filter(r => !r.passed).length;

  console.log('\n\n╔══════════════════════════════════════════════════════════╗');
  console.log('║                    TEST SUMMARY REPORT                   ║');
  console.log('╚══════════════════════════════════════════════════════════╝');
  for (const r of results) {
    const status = r.passed ? '✓ PASS' : '✗ FAIL';
    console.log(`  ${status.padEnd(8)} ${r.file.padEnd(35)} [${r.name}]`);
  }

  console.log('────────────────────────────────────────────────────────────');
  console.log(`TOTAL SUITES: ${totalSuites} | PASSED: ${passedSuites} | FAILED: ${failedSuites}`);
  console.log(`Execution Time: ${duration}s`);
  console.log('────────────────────────────────────────────────────────────');

  if (failedSuites > 0) {
    console.error('\n❌ TEST RUN COMPLETED WITH FAILURES.');
    process.exit(1);
  } else {
    console.log('\n🎉 ALL 11 TEST SUITES PASSED WITH 100% SUCCESS!');
    process.exit(0);
  }
}

runAll().catch(err => {
  console.error('Fatal test runner error:', err);
  process.exit(1);
});
