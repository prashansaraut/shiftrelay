# ShiftRelay — Shift Continuity System

> **Every shift connected. Nothing left behind.**  
> *Never drop the baton.*

ShiftRelay is an operational shift handover and custody continuity system built with vanilla modern HTML5, CSS3 (Design Tokens), and ES-Module JavaScript. It features client-side History API routing, resilient LocalStorage persistence, a public product showcase landing page, a dedicated 5-milestone interactive demonstration sandbox, and the signature **Continuity Engine**.

Zero frameworks, zero external build dependencies, 100% standards-compliant.

---

## 🚀 Quick Start

Run either the included SPA-aware Python or Node.js server (zero dependencies required):

```bash
# Option A: Python server
python server.py

# Option B: Node.js server
node server.js
```

Then navigate in your browser to:
```
http://localhost:8000
```

Both `server.py` and `server.js` serve `index.html` for any client-side SPA route, enabling direct URL navigation (e.g. `/app/dashboard`, `/demo`, `/app/tasks/TK-1001`) and page reloads without 404 errors. Any standard static file server (`npx serve -s .`) is also fully supported.

---

## 🗺️ Route Architecture

ShiftRelay cleanly separates the public marketing experience, the interactive demonstration, and the operational workspace while maintaining backward compatibility with legacy bookmarks:

### 1. Public & Demonstration Routes
* `/` — **Public Landing Page**: Split-layout hero with live handover interface preview, problem vs. solution breakdown, 5-stage operational workflow diagram, Continuity Engine showcase, feature catalog, and call-to-actions.
* `/demo` — **Interactive Demonstration**: A 5-milestone guided simulation running on an **isolated in-memory sandbox** (never modifies production LocalStorage records). Allows prospective users to inspect an outgoing shift, draft a handover, trigger a simulated shift conflict, experience incoming sign-off, and verify the post-handover audit trail.

### 2. Operational Workspace Routes (`/app/*`)
* `/app/dashboard` — Live operations dashboard with reactive statistics, active shift summary, continuity risk monitors ($\ge 2$ repeat carries, overdue tasks, critical incidents), and recent timeline.
* `/app/shifts` — Shift schedule management, staffing assignments, and time-overlap validation.
* `/app/shifts/:id` — Shift detail view with active tasks, incidents, and carry-forward eligibility.
* `/app/handovers` — Shift handover index with status filters (`Draft`, `Submitted`, `Awaiting Acknowledgement`, `Acknowledged`).
* `/app/handovers/new` — Prepare handover form with automated Continuity Engine item aggregation.
* `/app/handovers/:id` — Detailed handover sign-off portal with mutual review checklists and conflict notices.
* `/app/tasks` — Task management, priority bars, due-date tracking, and carry-forward counts.
* `/app/tasks/:id` — Task detail view with immutable audit history.
* `/app/incidents` — Severity-tiered incident management (`Critical`, `High`, `Medium`, `Low`) requiring mandatory resolution notes.
* `/app/incidents/:id` — Incident detail view with resolution notes and department origin.
* `/app/activity` — Unified operational timeline of all shift activities, reassignments, and handovers.
* `/app/settings` — Simulated role switcher (`Operations Manager`, `Outgoing Shift Employee`, `Incoming Shift Employee`), workplace taxonomy configuration, and clean baseline reset.
* `/app/search` — Global omnisearch across tasks, incidents, handovers, and shifts.

### 3. Legacy Redirects (Preserving Existing Bookmarks)
All previous legacy routes (such as `/dashboard`, `/shifts`, `/handovers`, `/tasks`, `/incidents`, `/activity`, `/settings`) automatically redirect to `/app/...` transparently without breaking user flow.

---

## ⚙️ The Continuity Engine (`js/store.js`)

The Continuity Engine is ShiftRelay's deterministic state machine governing the transfer of operational custody between shifts:

1. **Automatic Item Aggregation Without Record Cloning**:
   `prepare(fromShift, toShift)` gathers unresolved tasks and incidents from the outgoing shift. Items are referenced by their original record IDs (`TK-xxxx`, `IN-xxxx`). Records are **never** cloned or duplicated.
2. **Duplicate & Stale Prevention**:
   Validates that both shift IDs exist, enforces that the incoming shift differs from the outgoing shift, and prevents duplicate active handovers for the same shift pair.
3. **Concurrent Conflict Detection**:
   If an operator reassigns a task's shift in the background while a handover is awaiting sign-off, the Continuity Engine detects the conflict during acknowledgement. It **never** silently overwrites the newer shift assignment, safely preserving both the new assignment and the audit record.
4. **Traceable Carry-Forward Provenance**:
   When acknowledged by the incoming supervisor:
   - Tasks are marked `Carried Forward`.
   - The cumulative carry counter (`carry`) increments. Items carried $\ge 2$ times automatically escalate on the dashboard as repeat continuity risks.
   - History logs the exact transfer: `"Carried forward from Morning Shift to Evening Shift via HO-xxxx"`.
5. **Closed-Shift Provenance**:
   - Resolving or closing an incident mandates non-empty resolution notes.
   - The closing shift is permanently recorded in `closedShift`.
   - Reopening an item safely clears `closedShift` to prevent stale closure data.

---

## 🛡️ Reliability & LocalStorage Resilience

- **Schema Validation & Self-Healing**: Validates all collections (`shifts`, `tasks`, `incidents`, `handovers`, `employees`, `config`, `activity`) on startup. If data is corrupted or incomplete, it falls back gracefully without crashing.
- **Seamless Data Migration**: Automatically migrates stored records from the legacy storage key (`handoverhq.v1`) to the new key (`shiftrelay.v1`) without data loss.
- **Quota Error Handling**: `save()` catches storage exceptions and dispatches user notifications rather than failing silently.
- **Sandboxed Demonstration State**: The `/demo` route operates purely on an in-memory store (`js/demo-store.js`), guaranteeing that testing does not pollute or overwrite production records.

---

## 📁 Project Structure

```
├── index.html                   # Application shell with dual layout (Public & Workspace)
├── css/
│   └── main.css                 # ShiftRelay design system, tokens, landing page & responsive rules
├── js/
│   ├── app.js                   # Client-side router, layout mode switching, event delegation
│   ├── brand.js                 # Distinctive SVG logo mark, wordmark, and favicon definitions
│   ├── demo-store.js            # Isolated in-memory state engine for /demo
│   ├── demo-view.js             # 5-milestone interactive demo walkthrough controller
│   ├── landing-view.js          # Public commercial SaaS landing page controller
│   ├── store.js                 # Production store, Continuity Engine, and LocalStorage persistence
│   ├── ui.js                    # UI helpers: escaping, badges, toasts, dialogs, icons
│   └── views.js                 # Workspace controllers, schema-driven forms, and legacy redirects
├── assets/
│   └── logo.svg                 # Precision vector brand emblem
├── design/
│   ├── FIGMA-IMPORT-GUIDE.md    # Guide to importing vectors and tokens into Figma
│   ├── design-system/
│   │   ├── design-tokens.json   # Full W3C/Figma-compliant design token specification
│   │   └── design-system-spec.svg # Visual vector artboard of tokens, scales & components
│   ├── wireframes/              # Low-fidelity vector blueprints
│   │   ├── wf-landing-desktop.svg
│   │   ├── wf-landing-mobile.svg
│   │   ├── wf-demo-milestones.svg
│   │   ├── wf-workspace-dashboard.svg
│   │   ├── wf-workspace-handovers.svg
│   │   └── wf-workspace-tasks.svg
│   └── high-fidelity/           # Production-ready vector mockups
│       ├── hifi-landing-desktop.svg
│       ├── hifi-landing-mobile.svg
│       ├── hifi-dashboard-desktop.svg
│       ├── hifi-demo-desktop.svg
│       └── hifi-handover-detail.svg
├── diagrams/                    # System diagrams in both editable .mmd and vector .svg
│   ├── system-architecture.mmd / .svg
│   ├── continuity-engine-workflow.mmd / .svg
│   ├── application-workflow.mmd / .svg
│   ├── spa-routing.mmd / .svg
│   └── data-relationship-er.mmd / .svg
├── documentation/
│   ├── technical-report.md      # Comprehensive 32-section academic / enterprise report
│   ├── requirements-compliance.md # Formal Week 5 criteria compliance matrix
│   ├── test-plan.md             # 8-viewport testing plan & strategy
│   └── test-results.md          # 36-scenario test execution table (100% passed)
├── screenshots/                 # Captured responsive UI layouts & viewports
│   ├── landing/                 # Desktop & mobile landing layouts
│   ├── demo/                    # Demo milestone interactive states
│   ├── workspace/               # Dashboard layouts at 1280px & 768px
│   └── responsive/              # 8 verified viewport captures (320px to 1280px)
├── server.py                    # Zero-dependency Python SPA development server
└── server.js                    # Zero-dependency Node.js SPA development server
```

---

## 🧪 Verification & Testing

ShiftRelay includes a comprehensive, reproducible automated test suite with zero external dependencies. All 11 suites execute in isolated Node.js child processes.

### Single Run Command

```bash
npm test
```

*(Alternatively, run directly with Node: `node tests/test_full_suite.mjs`)*

### Test Coverage Highlights
- **Continuity Engine & Provenance**: Duplicate open handover rejection, conflict detection on reassignment, shift overlap validation, and repeated rollover risks ($\ge 2$ carries).
- **LocalStorage Resilience**: Fallback to clean seed data on corrupted JSON (`"{"`), automatic schema repair of missing `handovers` array while preserving user tasks, legacy data migration (`handoverhq.v1` $\to$ `shiftrelay.v1`) with zero data loss, and safe quota handling.
- **Client-Side Routing & View Handlers**: Regex verification and execution of all 46 route patterns across landing, demo, and workspace modules.
- **HTTP Server**: Static MIME delivery, SPA route fallbacks, and nested asset path resolution over ephemeral TCP sockets.
- **Responsive Architecture**: Breakpoint safety (480px, 768px, 1024px, 1280px), off-canvas mobile drawer, theme contrast, and horizontal overflow protection.

### Manual Verification Checklist

To test the application locally in the browser:

1. **Syntax Checks**: Run `node -c js/*.js` to verify ES-module syntax integrity across all JavaScript files.
2. **Local Server Execution**: Start `python server.py` and open `http://localhost:8000`.
3. **Verify Public Landing Page**:
   - Verify split-layout hero, typography, CTAs, product interface mockup, workflow diagrams, and feature sections.
4. **Verify Interactive Demo (`/demo`)**:
   - Step 1: Inspect Morning Shift open tasks and repeat risk flag on `TK-1003`.
   - Step 2: Prepare handover; verify completed task `TK-1004` is excluded.
   - Step 3: Trigger background conflict simulation (reassigns `TK-1002` to Night Shift).
   - Step 4: Toggle review checkbox and acknowledge handover.
   - Step 5: Verify Continuity Engine conflict resolution notice, preserved IDs, incremented carry counts, and audit trail. Verify that LocalStorage remains untouched.
5. **Verify Workspace Functionality (`/app/dashboard`)**:
   - Verify Carried Forward metric tallies both tasks and incidents.
   - Verify repeat risks calculation ($\ge 2$ carries).
   - Test task status transitions (cannot manually set `Carried Forward`; reopening completed task clears `closedShift`).
   - Test incident status transitions (mandatory resolution notes; distinguished "resolved" vs "closed" activity logs).
   - Test legacy redirects (`/dashboard` -> `/app/dashboard`, etc.).
