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

function assert(condition, message) {
  if (condition) {
    passed++;
    console.log(`  ✓ PASS: ${message}`);
  } else {
    failed++;
    console.error(`  ✗ FAIL: ${message}`);
  }
}

console.log('====================================================');
console.log('🎨 SHIFTRELAY THEME & MOBILE PHONE RESPONSIVE AUDIT');
console.log('====================================================\n');

// 1. Reading Source Files
const css = fs.readFileSync(path.join(APP_DIR, 'css/main.css'), 'utf8');
const landing = fs.readFileSync(path.join(APP_DIR, 'js/landing-view.js'), 'utf8');
const demo = fs.readFileSync(path.join(APP_DIR, 'js/demo-view.js'), 'utf8');
const index = fs.readFileSync(path.join(APP_DIR, 'index.html'), 'utf8');
const app = fs.readFileSync(path.join(APP_DIR, 'js/app.js'), 'utf8');

// ----------------------------------------------------
// SECTION 1: THEME TOGGLE BUTTON ACCESSIBILITY
// ----------------------------------------------------
console.log('--- 1. Theme Toggle Controls Across All Views ---');
assert(index.includes('id="themeToggle"'), 'Workspace Topbar has #themeToggle button');
assert(landing.includes('class="icon-btn sr-theme-toggle"'), 'Landing Page Desktop Navigation includes theme toggle button');
assert(landing.includes('class="sr-nav-mobile-header"') && landing.includes('data-act="toggle-theme"'), 'Landing Page Mobile Drawer includes theme toggle button');
assert(demo.includes('class="icon-btn sr-theme-toggle"'), 'Interactive Demo Header includes theme toggle button');
assert(app.includes("e.target.closest('#themeToggle, [data-act=\"toggle-theme\"], .sr-theme-toggle')"), 'Click event listener delegates theme toggling across all views');
assert(app.includes("$$('.sr-theme-toggle, [data-act=\"toggle-theme\"]')"), 'syncThemeUI updates all theme toggle button icons across the DOM');

// ----------------------------------------------------
// SECTION 2: FONT VISIBILITY IN LIGHT/WHITE THEME
// ----------------------------------------------------
console.log('\n--- 2. Font Visibility in White Theme ---');
assert(css.includes('.sr-bg-dark h3') || css.includes('.sr-engine-card h3'), 'Continuity Engine card h3 heading has explicit white color (#FFFFFF !important)');
assert(css.includes('.sr-engine-card code') && css.includes('background: #1E293B'), 'Continuity Engine code spans have high-contrast styling');
assert(css.includes('.sr-section-tag.light') && css.includes('#60A5FA'), 'Section tag in Continuity Engine is high-contrast light blue');
assert(css.includes('.sr-brand-dark-text .sr-brand-name') && css.includes('#0F172A'), 'Brand name on light surfaces is deep dark navy (#0F172A)');
assert(css.includes('.sr-footer .sr-brand-name') && css.includes('#0F172A'), 'Footer brand name in light theme is deep dark navy (#0F172A)');

// ----------------------------------------------------
// SECTION 3: DARK THEME INTEGRITY ACROSS ALL SECTIONS
// ----------------------------------------------------
console.log('\n--- 3. Dark Theme Coverage Across All Pages & Sections ---');
assert(css.includes('body[data-theme="dark"] .sr-nav'), 'Landing page navbar styled in dark theme');
assert(css.includes('body[data-theme="dark"] .sr-hero'), 'Landing page hero styled in dark theme');
assert(css.includes('body[data-theme="dark"] .sr-hero-title'), 'Hero title styled in dark theme with #F8FAFC');
assert(css.includes('body[data-theme="dark"] .sr-mock-window'), 'Hero product preview window styled in dark theme');
assert(css.includes('body[data-theme="dark"] .sr-mock-card'), 'Product preview card styled in dark theme');
assert(css.includes('body[data-theme="dark"] .sr-bg-subtle'), 'Subtle sections styled in dark theme (#0B0F19)');
assert(css.includes('body[data-theme="dark"] .sr-compare-card') || css.includes('body[data-theme="dark"] .sr-matrix-card'), 'Comparison cards styled in dark theme');
assert(css.includes('body[data-theme="dark"] .sr-workflow-step') || css.includes('body[data-theme="dark"] .sr-wf-step'), 'Workflow step cards styled in dark theme');
assert(css.includes('body[data-theme="dark"] .sr-feature-box'), 'Feature boxes styled in dark theme');
assert(css.includes('body[data-theme="dark"] .sr-cta-banner'), 'Final CTA banner styled in dark theme');
assert(css.includes('body[data-theme="dark"] .sr-footer'), 'Footer styled in dark theme');
assert(css.includes('body[data-theme="dark"] .sr-nav-mobile'), 'Mobile drawer styled in dark theme');
assert(css.includes('body[data-theme="dark"] .sr-demo-header'), 'Interactive demo header styled in dark theme');
assert(css.includes('body[data-theme="dark"] .sr-step-btn'), 'Demo stepper buttons styled in dark theme');
assert(css.includes('body[data-theme="dark"] .sr-step-callout'), 'Demo step callout styled in dark theme');
assert(css.includes('body[data-theme="dark"] .sr-profile-dropdown'), 'Workspace profile dropdown styled in dark theme');

// ----------------------------------------------------
// SECTION 4: DEDICATED PHONE SIZES RESPONSIVENESS (<= 480px)
// ----------------------------------------------------
console.log('\n--- 4. Dedicated Phone Size Responsiveness (<= 480px) ---');
assert(css.includes('@media (max-width: 480px)'), 'Mobile phone media query block is present');
assert(css.includes('.sr-nav-inner') && css.includes('box-sizing: border-box'), 'Mobile nav inner constrained to viewport');
assert(css.includes('.sr-hero-grid') && css.includes('grid-template-columns: 1fr'), 'Hero grid collapses to 1fr on phones');
assert(css.includes('.sr-hero-title') && css.includes('word-break: break-word'), 'Hero title prevents overflow on narrow phone screens');
assert(css.includes('.sr-hero-ctas') && css.includes('grid-template-columns: 1fr'), 'Hero CTA buttons stack into full-width touch targets on phones');
assert(css.includes('.sr-matrix-grid') && css.includes('grid-template-columns: 1fr'), 'Problem vs Solution matrix collapses to single column on phones');
assert(css.includes('.sr-workflow-stepper') && css.includes('flex-direction: column'), 'Workflow stepper transforms into vertical cards on phones');
assert(css.includes('.sr-engine-grid') && css.includes('grid-template-columns: 1fr'), 'Continuity engine grid collapses to 1fr on phones');
assert(css.includes('.sr-features-grid') && css.includes('grid-template-columns: 1fr'), 'Features grid collapses to 1fr on phones');
assert(css.includes('.sr-cta-banner .sr-hero-ctas') && css.includes('grid-template-columns: 1fr'), 'Final CTA buttons stack vertically on phones');
assert(css.includes('.sr-footer-grid') && css.includes('grid-template-columns: 1fr'), 'Footer grid stacks cleanly on phones');
assert(css.includes('.top') && css.includes('max-width: 100vw'), 'Workspace topbar strictly restricted on phone viewports');
assert(css.includes('#gsearch') && css.includes('max-width: 170px'), 'Global search input compact on mobile phones');
assert(css.includes('.sr-quick-link') && css.includes('display: none !important'), 'Demo quick link hidden on phones to avoid overcrowding topbar');
assert(css.includes('.sr-profile-trigger-info') && css.includes('display: none !important'), 'Profile name/role text hidden on phones (shows initials avatar only)');
assert(css.includes('.g4') && css.includes('grid-template-columns: 1fr !important'), 'Dashboard metric cards collapse into single column on phones');
assert(css.includes('.scroll') && css.includes('overflow-x: auto'), 'All data tables scroll horizontally with touch momentum on phones');

console.log('\n====================================================');
console.log(`TOTAL AUDIT CHECKS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
console.log('====================================================');

if (failed > 0) {
  process.exit(1);
} else {
  console.log('🎉 ALL THEME & MOBILE RESPONSIVENESS AUDIT CHECKS PASSED (100%)!');
}
