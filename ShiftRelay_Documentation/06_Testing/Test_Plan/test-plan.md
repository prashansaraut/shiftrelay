# ShiftRelay — Comprehensive Test Plan & Methodology

## 1. Objectives & Scope
The purpose of this test plan is to rigorously validate the **ShiftRelay** platform across all functional modules, responsive device viewports, client-side routing scenarios, and data integrity constraints enforced by the **Continuity Engine**.

Testing covers:
1. **Public Website**: Landing page layout, split hero, feature sections, off-canvas mobile navigation drawer, and standardized CTAs.
2. **Interactive Demonstration (`/demo`)**: In-memory isolation, 5-milestone progression, simulated concurrent shift conflict (`TK-1002` reassignment to Night Shift), incoming sign-off verification, and post-continuity audit.
3. **Operational Workspace (`/app/*`)**: Dashboard risk telemetry, Shift CRUD with overlap protection, Handover lifecycle, Task CRUD with carry counters, Incident CRUD with mandatory resolution notes, Activity history stream, and Workplace settings.
4. **Continuity Engine & Data Integrity**: Shift ID validation, duplicate open handover rejection, concurrent conflict detection, carry count increments, repeat risk alerts ($\ge 2$ carries), and closing-shift provenance (`closedShift`).
5. **LocalStorage Reliability**: Safe schema validation, corrupted state recovery (`"{"`), automatic schema repair of missing `handovers` array while preserving user tasks, legacy data migration (`handoverhq.v1` $\rightarrow$ `shiftrelay.v1`), and QuotaExceededError handling.
6. **Responsive Layouts**: Explicit inspection across 8 target viewports from 320px to 1280px, plus dark mode high-contrast visual verification.

---

## 2. Testing Environment & Tools
* **Runtime**: Node.js v26.13.1 & Modern Chromium / Google Chrome rendering engines.
* **Operating System**: Windows 11 Enterprise (Build 26100.7171).
* **Automated Test Runners**: Custom zero-dependency ES-Module test suite executed via `npm test` (`node tests/test_full_suite.mjs`):
  - `tests/test_suite.js` (Core store, continuity engine, duplicate handover rejection, overlap validation, repeat-risk lifecycle)
  - `tests/test_storage.js` (LocalStorage corrupted state recovery, schema repair, full legacy migration, quota safety)
  - `tests/test_routes.mjs` (All SPA route regex patterns and view handlers)
  - `tests/test_handler.mjs` (Server direct file and SPA fallback handling)
  - `tests/test_all_handlers.mjs` (Execution of all 46 client routes and parameter handlers)
  - `tests/test_server.mjs` (HTTP socket communication on ephemeral port)
  - `tests/test_theme_and_profile.mjs` (Theme persistence, role switching, user preferences, CTA standardization)
  - `tests/test_theme_and_phone.mjs` (Font visibility, theme contrast, 480px phone responsive rules)
  - `tests/test_deep_frontend.mjs` (Comprehensive DOM, forms, state transitions, router, offline fallback)
  - `tests/test_comprehensive_frontend.mjs` (Architectural hierarchy, demo milestones, workspace layout, CSS overflow prevention)
  - `tests/test_check.mjs` (Core CSS selectors integrity)
* **Browser Automation & Evidence Capture**: Headless Google Chrome automated via native Chrome DevTools Protocol (CDP) WebSocket commands capturing real rendered PNG screenshots at defined viewports.
* **Servers Tested**:
  - `node server.js` (Built-in Node.js HTTP server with SPA rewrite and nested static asset resolution)
  - `python server.py` (SimpleHTTPRequestHandler with SPA rewrite)

---

## 3. Responsive Viewport Testing Matrix

| Width | Category | Target Devices | Key Inspection Checkpoints | Evidence Capture |
| :---: | :--- | :--- | :--- | :--- |
| **320px** | Narrow Mobile | iPhone SE (1st gen), iPod Touch | Zero horizontal scrollbar; hamburger menu renders cleanly; logo does not collide with buttons; hero headline wraps cleanly without word clipping; CTAs stack with full touch width. | `screenshots/landing-viewport-320.png` |
| **360px** | Small Mobile | Samsung Galaxy S8/A-series | Hero paragraph line-height; mockup preview window bar title truncates with ellipsis; stat cards on dashboard stack cleanly (1 column); table scroll indicator visible. | `screenshots/landing-viewport-360.png` |
| **375px** | Standard Mobile | iPhone 12/13 Mini, iPhone SE (2nd/3rd gen) | Review checkbox touch target ($\ge 44\text{px}$); conflict alert banner readability; modal dialog max-width bounded to 92vw; drawer nav animations smooth. | `screenshots/landing-viewport-375.png` |
| **390px** | Modern Mobile | iPhone 14/15/16, Google Pixel 7/8 | Split hero single-column flow; 5-milestone demo progression; touch padding on buttons $\ge 48\text{px}$; timeline nodes vertical alignment. | `screenshots/landing-mobile-390.png`, `demo-milestone-1-390.png`, `demo-milestone-3-390.png`, `demo-milestone-5-390.png` |
| **430px** | Large Mobile | iPhone 15/16 Pro Max, Galaxy S24 Ultra | Comfortable content padding; grid cards 1-column layout on dashboard; filters bar stacked; search input full width. | `screenshots/landing-viewport-430.png` |
| **768px** | Tablet Portrait | iPad Mini, iPad 10th gen | Off-canvas drawer (280px) on tablet portrait; header search bar responsive; landing page comparison grid 1 or 2 column flow; workflow steps stacked cleanly. | `screenshots/landing-viewport-768.png`, `workspace-dashboard-768.png` |
| **1024px** | Tablet Landscape | iPad Pro 11", small laptops | Fixed operational sidebar visible (240px); desktop navigation on landing page active; stat card grid layout; table columns visible without cramped headers. | `screenshots/landing-viewport-1024.png` |
| **1280px** | Desktop Baseline | MacBook Air / 1080p monitors | Split-layout landing hero active; full product preview card side-by-side with hero copy; table pagination / scroll clean; ample whitespace. | `screenshots/landing-desktop-1280.png`, `workspace-dashboard-1280.png`, `landing-dark-1280.png`, `dashboard-dark-1280.png` |

---

## 4. Test Case Categorization & Methodology

Every test case in ShiftRelay is bound to a strict, verifiable execution method:

1. **Automated (`tests/*`)**: Executable Node.js assertions verifying business logic, state machines, LocalStorage resilience, and router normalization. Run via `npm test`.
2. **Manual Browser (`screenshots/*`, `screenshots/evidence/*`)**: Visual verification of running application views and state transitions captured via Chrome DevTools Protocol.
3. **Static Source Check**: Structural code verification confirming design token invariants, CSS media query thresholds, and event listener bindings.

### Suite Categorization:
* **`TC-PUB-xx`**: Public Landing Page, typography, high-contrast branding, and mobile drawer.
* **`TC-DEMO-xx`**: Interactive Demonstration Sandbox, step progression, conflict detection, and reset.
* **`TC-ENG-xx`**: Continuity Engine integrity, duplicate handover rejection, shift overlap checks, and carry-over risks.
* **`TC-OPS-xx`**: Operational Workspace modules (Shifts, Tasks, Incidents, and Activity stream).
* **`TC-STOR-xx`**: LocalStorage schema repair, corrupted JSON recovery, legacy migration, and quota handling.
* **`TC-ROUT-xx`**: Client-side routing, deep link refresh, legacy redirects, and 404 recovery.
* **`TC-UX-xx`**: Theme toggling, role switching, user profile preferences, and responsive viewport safety.
