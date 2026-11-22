# ShiftRelay — UI/UX Wireframe Design Specification

**Document Version:** 1.0.0  
**Project:** ShiftRelay (Operational Continuity & Shift Handover Management SPA)  
**Evaluation Scope:** Week 5 Internship Documentation & Design Portfolio  
**Target Viewports:** Desktop (1440px), Tablet (768px), Mobile (390px)  
**Design Philosophy:** Low-fidelity grayscale architectural wireframing focusing on information hierarchy, state continuity, mutual authorization protocols, and responsive reorganization.

---

## 1. Executive Summary & Design Objectives

ShiftRelay is a single-page application engineered to eliminate the "baton drop" during shift turnovers in 24/7 mission-critical operations (manufacturing, energy facilities, data centers, healthcare).

The wireframes are design-stage artifacts that use illustrative sample data, and the final documentation describes the implemented app.

### Key Architectural Invariants Communicated:
1. **Original Record ID Preservation:** Tickets and tasks carry forward into incoming shifts under their original unique identifiers without creating duplicate records.
2. **Carry-Forward Aging Monitors:** Tasks that roll over across shifts display cumulative carry counters (e.g. `carried 2x`) to prevent tasks from quietly lingering across shifts.
3. **Mandatory Incident Resolution Protocols:** An incident anomaly cannot be marked resolved or closed without mandatory documented resolution notes.
4. **Structured Handover Sign-Off Flow:** Handovers transition through a sequential lifecycle (`Draft` → `Submitted` → `Awaiting Acknowledgement` → `Acknowledged`). The outgoing side clicks "Send to incoming shift", and the incoming side reviews the payload, ticks the custody review checkbox, and clicks "Acknowledge handover".
5. **Mid-Flight Concurrency Protection:** Demonstrates engine interception and conflict resolution when items are updated while a handover is in progress.

---

## 2. Layout Grid & Responsive Breakpoints

| Breakpoint | Target Viewport | Screen Width | Grid Columns | Gutter | Margin | Primary Navigation Pattern |
|:---|:---|:---|:---|:---|:---|:---|
| **Desktop** | Standard Monitor | Above 1024px | 12 Columns | 24px | 80px | 240px Fixed Left Sidebar + 64px Topbar |
| **Tablet** | iPad / Small Laptop | 768px to 1024px | 8 Columns | 16px | 32px | Off-Canvas Drawer (280px width) toggled from Header |
| **Mobile** | Modern Smartphone | Below 768px | 4 Columns | 12px | 16px | Off-Canvas Drawer toggled from Header hamburger |

---

## 3. Module-by-Module Wireframe Specifications

### 3.1 Public Landing Page (`/`)
- **Header & Navigation:** 64px height sticky nav with brand wordmark, section navigation links, theme toggle, and CTAs: `Open Workspace` and `Explore Interactive Demo`.
- **Hero Section:** High-contrast headline (*"Never drop the baton between shifts."*), value proposition bullets, and primary/secondary CTAs (`Explore Interactive Demo` and `Open Workspace`).
- **Interactive Handover Mockup:** Compact browser window preview container demonstrating active handover transfer.
- **Problem vs Solution Cards:** Comparative 2-column container illustrating unstructured handover failure modes vs ShiftRelay's deterministic continuity engine.
- **End-to-End Workflow:** 5-step horizontal progression: *Capture → Draft → Review → Sign-Off → Carry Forward*.
- **Continuity Engine Container:** Contrast container explaining client-side state preservation, LocalStorage invariants, and conflict prevention.
- **Operational Modules Grid:** 6 purpose-built cards (*Reactive Dashboard, Shift Management, Handover Protocol, Task Registry, Incident Anomaly Log, Unified Activity Stream*).
- **Footer:** 4-column structured footer with brand overview, quick navigation, workspace module shortcuts, and project attribution.

### 3.2 Interactive Demonstration (`/demo`)
The interactive demonstration is a guided 5-milestone journey:
1. **Milestone 1 (Outgoing Inspection):** Outgoing lead reviews open tasks, active shift parameters, and unresolved anomalies.
2. **Milestone 2 (Handover Draft):** Aggregates open items into a structured draft; outgoing lead prepares handoff remarks.
3. **Milestone 3 (Conflict Detection):** Simulates an out-of-band edit where task TK-1002 is reassigned to Night Shift while the handover is drafted; the Continuity Engine detects the collision and preserves the newer assignment.
4. **Milestone 4 (Incoming Sign-off):** Incoming supervisor reviews the handover payload, checks the mandatory custody acknowledgement checkbox, and clicks "Acknowledge handover".
5. **Milestone 5 (Continuity Audit):** Verifies state transfer: shift rotation advances, uncompleted items carry forward under original IDs with incremented carry counts, and an immutable audit log entry is appended.

### 3.3 Operational Workspace Modules (`/app/*`)

#### A. Reactive Dashboard (`/app/dashboard`)
- **Metric Cards (4x):** Active Rotation status, Active Handover Custody state, Open Task count (with carry flags), and Critical Incidents.
- **Active Custody Widget:** Displays real-time progress between outgoing and incoming shift leads with prominent review button.
- **Priority Task Registry:** Filtered slice of high-priority and carried tasks due in the current shift window.

#### B. Shift Management (`/app/shifts`)
- **Roster Overview:** Badges showing active rotation, next incoming shift, total personnel, and continuity lock status.
- **Master Shift Schedule Table:** Columns for Shift Name, Time Window, Supervisor, Status, and Actions.
- **Shift Creation:** Full-page form route at `/app/shifts/new` (and edit form at `/app/shifts/:id/edit`) to specify shift name, department, start/end times, and staff assignment.

#### C. Handover Protocol & Custody Transfers (`/app/handovers`)
- **Handover Registry Table:** Lists all historical and active handovers with outgoing/incoming shift pairings and status badges (`Draft`, `Submitted`, `Awaiting Acknowledgement`, `Acknowledged`).
- **Handover Inspection & Sign-off:** Dedicated full-page route at `/app/handovers/:id`. The outgoing operator advances the handover by clicking "Send to incoming shift". The incoming operator reviews the attached tasks and incidents, checks the custody review checkbox ("I have reviewed this handover and accept operational custody"), and clicks "Acknowledge handover".
- **Initiating Handover:** Full-page form route at `/app/handovers/new` to assemble the handover from active shifts.

#### D. Task Registry (`/app/tasks`)
- **Filter Toolbar:** Filter by text search, status, and priority (Low, Medium, High, Critical). There is no department filter.
- **Task Master Table:** Columns showing unique Task ID, title, category, priority badge, carry count tag (e.g. `carried 2x`), assignee, shift, and due time.
- **Task Creation & Editing:** Dedicated full-page form route at `/app/tasks/new` (and edit at `/app/tasks/:id/edit`) with title, category, priority, assignee, shift assignment, and due date.

#### E. Incident Anomaly Log (`/app/incidents`)
- **Severity Classification:** Four severity levels: `Critical`, `High`, `Medium`, and `Low`.
- **Incident Reporting:** Full-page form route at `/app/incidents/new` (and edit at `/app/incidents/:id/edit`).
- **Mandatory Resolution Notes:** Resolution notes are enforced by form validation on creation/edit and via a prompt dialog when updating an incident status to Resolved or Closed.

#### F. Unified Activity Stream (`/app/activity`)
- **Immutable Chronological Audit Stream:** Displays all state transitions, handover sign-offs, task rollovers, and conflict resolutions with exact timestamps and actor attribution.

#### G. Settings & Profile Preferences (`/app/settings`)
- **Simulated Role Switcher:** Switch between exactly three simulated roles: `Operations Manager`, `Outgoing Shift Employee`, and `Incoming Shift Employee`.
- **User Display Preferences:** Edit demo display name, default landing route, and toast notification duration.
- **Interface Theme Preference:** Toggle between Light Theme and Dark Theme (stored in LocalStorage under `shiftrelay.theme`). The app supports only Light and Dark themes.
- **Demo State Reset:** One-click reset button to restore seed test data in LocalStorage (`shiftrelay.v1`).

---

## 4. Responsive Adaptation Rules

1. **Desktop → Tablet (1024px and below):**
   - The 240px fixed sidebar transitions to a 280px off-canvas drawer toggled via the header button.
   - Metric rows adapt into flexible grids.
   - Data tables maintain primary columns with horizontal scrolling for wider content.
2. **Tablet → Mobile (Below 768px):**
   - Navigation uses an off-canvas drawer opened from a hamburger button in the sticky header (no lower dock bar).
   - Data tables adapt cleanly to mobile viewports.
   - Handover detail, task creation, shift creation, and incident reporting operate as responsive full-page views.

---

## 5. Design Token Specifications (Grayscale Wireframes)

| Token | Hex Value | Application |
|:---|:---|:---|
| `--wf-canvas` | `#F8FAFC` | Screen background, subtle card wells |
| `--wf-surface` | `#FFFFFF` | Primary card containers, tables |
| `--wf-border` | `#E2E8F0` | Card borders, table dividers |
| `--wf-border-dark` | `#CBD5E1` | Input outlines, secondary buttons |
| `--wf-text-main` | `#0F172A` | Headings, primary buttons, critical chips |
| `--wf-text-muted` | `#64748B` | Subtitles, secondary labels, timestamps |
| `--wf-highlight` | `#F1F5F9` | Active row selection, badge containers |

---

## 6. Design-to-Implementation Variance

The wireframes were generated as design-stage blueprints using illustrative scenario data to explore interface ergonomics. The table below outlines each deliberate variance between the design wireframes and the final implemented application:

| Area | Wireframe design | Implemented app | Rationale |
|:---|:---|:---|:---|
| **View Architecture (Forms & Details)** | Modals and slide-over drawers for creation forms and handover inspection | Full-page views (`/app/handovers/:id`, `/app/shifts/new`, `/app/tasks/new`, `/app/incidents/new`) | Full-page views provide native browser History API navigation, unique bookmarkable URLs, deep linking, and avoid modal state nesting on mobile devices. |
| **Tablet Navigation Structure** | 72px narrow icon column on tablet | 280px off-canvas drawer between 768px and 1024px; fixed 240px sidebar above 1024px | The off-canvas drawer provides full label legibility and touch targets without consuming horizontal canvas on tablets. |
| **Simulated Operator Roles** | 4 hypothetical roles (Facility Supervisor, Operations Lead, Technician, Auditor) | Exactly 3 simulated roles (Operations Manager, Outgoing Shift Employee, Incoming Shift Employee) | The three implemented roles model the exact bilateral custody exchange: one oversight persona, one outgoing handover initiator, and one incoming handover receiver. |
| **Theme Selection** | Three theme options (Light, Dark, System) | Two theme options (Light Theme, Dark Theme) | Eliminates operating-system sync edge cases and provides deterministic, high-contrast visual styling stored in `shiftrelay.theme`. |
| **Mobile Secondary Navigation** | Wireframe shows a lower navigation bar | Off-canvas drawer only (no lower app bar) | Eliminates viewport height clipping, avoids overlap with mobile browser chrome and system gesture bars, and keeps navigation centralized in the drawer. |
| **Task Filtering Controls** | Filter toolbar with Department, Priority, and Status | Search text input, Priority dropdown, and Status dropdown (no Department filter) | The search input already performs substring matching across task titles, IDs, assignees, and categories, making a dedicated department dropdown redundant. |
| **Incident Severity Levels** | 3 severity tiers (Critical, High, Medium) | 4 severity tiers (Critical, High, Medium, Low) | Adding Low severity allows tracking minor observations or non-blocking maintenance flags without escalating them to operational alarms. |
| **Call-to-Action Terminology** | Various design-stage CTAs ("Launch Workspace", "Try Demo") | Standardized to "Open Workspace" and "Explore Interactive Demo" | Consistent, unambiguous terminology across the navbar, hero section, module cards, and footer. |
| **Interactive Demo Milestones** | Generic milestone labels (e.g. Milestone 1: Inspect Queue, Milestone 4: Acknowledgement) | Action-oriented titles: Outgoing Inspection, Handover Draft, Conflict Detection, Incoming Sign-off, Continuity Audit | Names directly align with the five interactive states in `js/demo-view.js`. The conflict scenario specifically reassigns task TK-1002 to Night Shift in `js/demo-store.js`. |
| **Scenario Data & Identifiers** | Illustrative IDs (`TSK-104`, `INC-402`) and personas (Alex Mercer, John Davis) | Seed dataset in `js/store.js` (`TK-1001` through `TK-1004`, `IN-2001`, Priya Nair, Rahul Mehta, Sana Khan) | Wireframe data serves as layout examples. The runtime application initializes reproducible seed data in LocalStorage (`shiftrelay.v1`). |