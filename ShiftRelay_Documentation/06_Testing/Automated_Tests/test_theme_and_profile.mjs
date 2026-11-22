// Test Suite for Theme Toggle, Profile Menu, and CTA Standardization
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const candidateRoots = [
  fileURLToPath(new URL('../', import.meta.url)),
  fileURLToPath(new URL('../../../handoverhq/', import.meta.url)),
  fileURLToPath(new URL('../../handoverhq/', import.meta.url))
];
const PROJECT_ROOT = candidateRoots.find(r => fs.existsSync(path.join(r, 'js', 'store.js'))) || candidateRoots[0];
const APP_DIR = PROJECT_ROOT;
const baseDir = PROJECT_ROOT;

// Mock localStorage for headless Node environment
const storeMap = new Map();
global.localStorage = {
  getItem: k => storeMap.get(k) ?? null,
  setItem: (k, v) => storeMap.set(k, String(v)),
  removeItem: k => storeMap.delete(k),
  clear: () => storeMap.clear()
};

const storeModule = await import(pathToFileURL(path.join(PROJECT_ROOT, 'js', 'store.js')).href);
const { getTheme, setTheme, setRole, setUserPreferences, get, seed } = storeModule;

console.log('=== TEST SUITE: Theme, Profile & Preferences ===');

// Test 1: Theme Default is Light
const defaultTheme = getTheme();
if (defaultTheme === 'light') {
  console.log('  ✓ PASS: Theme defaults to light mode');
} else {
  console.error('  ✕ FAIL: Expected light theme, got', defaultTheme);
  process.exit(1);
}

// Test 2: Theme Persistence
setTheme('dark');
const storedTheme = localStorage.getItem('shiftrelay.theme');
if (storedTheme === 'dark' && getTheme() === 'dark') {
  console.log('  ✓ PASS: setTheme persists dark theme to LocalStorage');
} else {
  console.error('  ✕ FAIL: Theme persistence failed');
  process.exit(1);
}

// Revert to light
setTheme('light');
if (getTheme() === 'light') {
  console.log('  ✓ PASS: setTheme switches back to light theme seamlessly');
}

// Test 3: Simulated Role Switching
setRole('Incoming Shift Employee');
const currentRole = get().role;
if (currentRole === 'Incoming Shift Employee') {
  console.log('  ✓ PASS: setRole correctly switches simulated employee role');
} else {
  console.error('  ✕ FAIL: setRole failed to update role');
  process.exit(1);
}

// Test 4: Profile Preferences
setUserPreferences({
  displayName: 'Marcus Vance',
  theme: 'light',
  defaultRoute: '/app/handovers',
  toastDuration: 4000
});
const u = get().user;
if (u.name === 'Marcus Vance' && u.defaultRoute === '/app/handovers' && u.toastDuration === 4000) {
  console.log('  ✓ PASS: setUserPreferences correctly updates and persists profile settings');
} else {
  console.error('  ✕ FAIL: setUserPreferences failed');
  process.exit(1);
}

// Test 5: Verify Landing View standardization
const landingCode = fs.readFileSync(path.join(PROJECT_ROOT, 'js', 'landing-view.js'), 'utf8');
const hasExploreDemo = landingCode.includes('Explore Interactive Demo');
const hasOpenWorkspace = landingCode.includes('Open Workspace');
const hasDarkLogo = landingCode.includes('dark-text');
const hasOldLaunch = landingCode.includes('Launch Guided Demo');

if (hasExploreDemo && hasOpenWorkspace && hasDarkLogo && !hasOldLaunch) {
  console.log('  ✓ PASS: Landing page CTAs and footer brand contrast standardized');
} else {
  console.error('  ✕ FAIL: Inconsistent CTA terminology or footer branding detected');
  process.exit(1);
}

console.log('========================================');
console.log('ALL THEME & PROFILE TESTS PASSED (100%)');
console.log('========================================');
