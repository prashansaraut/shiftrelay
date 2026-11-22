# ShiftRelay

> **Never drop the baton between shifts.**

ShiftRelay is a high-reliability Single Page Application (SPA) designed for 24/7 operational facilities (manufacturing plants, logistics hubs, command centers, healthcare operations) to manage shift transitions, enforce custody handovers, and ensure uninterrupted operational continuity.

---

## 📌 Problem Statement

In continuous 24/7 operations, the shift changeover is the most vulnerable point for operational failure:
- **Fragmented Communication**: Shift notes are frequently scattered across disconnected spreadsheets, paper logbooks, and chat threads.
- **Unresolved Task Blind Spots**: In-progress tasks often get lost in the transition, leading to dropped balls, missed SLAs, or duplicate work.
- **Lost Incident Context**: Critical safety or equipment anomalies reported during an outgoing shift fail to transfer with their full investigation history.
- **Unclear Accountability**: Without structured, recorded mutual sign-offs, incoming teams can inherit unknown risks without explicit acknowledgement.

ShiftRelay eliminates these vulnerabilities by transforming informal shift handovers into a verifiable, structured custody transition process.

---

## ✨ Key Features

All features listed below are fully implemented:

- **Operational Dashboard**: Real-time telemetry displaying active shifts, pending handovers awaiting sign-off, open task monitors, critical incident tallies, and continuity risk summaries.
- **Shift Management**: Full schedule lifecycle management with department categorization, timing configuration, employee assignments, and shift overlap collision detection.
- **Structured Handover Management**: Formal 4-stage handover lifecycle (`Draft` $\to$ `Submitted` $\to$ `Awaiting Acknowledgement` $\to$ `Acknowledged`) with automated item aggregation, important updates, and checklist verification.
- **Task Management**: Task tracking categorized by priority (`Low`, `Medium`, `High`, `Critical`), department, assignee, and target shift. Includes automated tracking of cumulative shift carry-overs.
- **Incident Anomaly Log**: Severity-tiered incident tracking (`Low`, `Medium`, `High`, `Critical`) with mandatory resolution notes enforced before an incident can be closed.
- **The Continuity Engine**:
  - **Primary Record ID Preservation**: Carried items strictly retain their original database identifiers (`TK-1001`, `IN-2001`) across rollovers.
  - **Concurrent Conflict Detection**: Automatically detects mid-flight task reassignments that occur while a handover draft is in review, preserving the newest assignment safely.
  - **Repeat-Risk Telemetry**: Open items carried across two or more shifts ($\ge 2$ rollovers) automatically escalate to the repeat risk monitor.
  - **Closed Shift Attribution**: Records the exact shift during which a task or incident was closed (`closedShift`).
- **Interactive Guided Demonstration**: In-memory, 5-milestone interactive walkthrough (`/demo`) showing outgoing queue inspection, handover drafting, conflict simulation, incoming mutual sign-off, and continuity auditing without mutating production data.
- **Unified Activity Stream**: Chronological system audit log recording status transitions, reassignments, incident closures, and handover sign-offs.
- **Light and Dark Themes**: High-contrast, theme-aware user interface with seamless theme toggling and persistent user preference storage.
- **Fully Responsive Interface**: Tailored layout adaptations for desktops (>1024px with fixed sidebar), tablets (768px–1024px with 280px drawer), and mobile phones ($\le 480$px with single-column collapse and touch-friendly targets).
- **Resilient Local Data Persistence**: Client-side storage layer featuring self-healing schema repair, automatic fallback upon corrupted JSON data, legacy key migration, and quota exception trapping.

---

## 🛠️ Technology Stack

ShiftRelay is built with zero external framework dependencies:

- **Frontend Core**: Vanilla JavaScript (ES2022+ Native ES-Modules), semantic HTML5, and CSS3 using custom properties (Design Tokens).
- **Icons**: Lucide Icons (vanilla browser script with inline SVG fallbacks).
- **Client-Side Routing**: Vanilla HTML5 History API router (`pushState`, `popstate`) with path normalization and 404 recovery.
- **Persistence**: Browser Web Storage API (`localStorage`) with relational schema validation.
- **Runtime Servers**: 
  - Node.js (Built-in `http`, `fs`, `path` modules)
  - Python 3 (Built-in `http.server` with custom SPA request handler)
- **Automated Test Suite**: Custom zero-dependency ES-Module test runner executing 11 isolated test suites (312 assertions).

---

## 📂 Project Structure

```
shiftrelay/
├── .gitignore             # Git ignore rules
├── README.md              # Project documentation
├── index.html             # Single Page Application entry point
├── package.json           # Project manifest, start & test scripts
├── server.js              # Native Node.js SPA-aware HTTP server
├── server.py              # Native Python 3 SPA-aware HTTP server
├── assets/                # Application runtime assets
│   └── logo.svg           # Vector brand logo
├── css/                   # Design token stylesheets
│   └── main.css           # Theme variables, responsive layout & typography
├── js/                    # Native ES-Modules
│   ├── app.js             # Router, event delegation & application bootstrap
│   ├── brand.js           # Dynamic SVG brand generators
│   ├── demo-store.js      # Isolated in-memory state for interactive demo
│   ├── demo-view.js       # 5-milestone guided demonstration views
│   ├── landing-view.js    # Public product showcase landing view
│   ├── store.js           # Continuity Engine, relational state & storage
│   ├── ui.js              # Toast notifications & UI helpers
│   └── views.js           # Operational workspace views (Dashboard, CRUD forms)
└── tests/                 # Automated test suite (11 suites, 312 assertions)
    ├── package.json       # Test runner configuration
    ├── test_all_handlers.mjs
    ├── test_check.mjs
    ├── test_comprehensive_frontend.mjs
    ├── test_deep_frontend.mjs
    ├── test_full_suite.mjs
    ├── test_handler.mjs
    ├── test_routes.mjs
    ├── test_server.mjs
    ├── test_server.py
    ├── test_storage.js
    ├── test_suite.js
    ├── test_theme_and_phone.mjs
    └── test_theme_and_profile.mjs
```

---

## 🚀 Running Locally

Because ShiftRelay uses native ES-Modules and the HTML5 History API for clean URLs (e.g. `/app/dashboard`, `/demo`), files must be served over an HTTP server rather than loaded directly via `file://`.

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+) **OR** [Python 3](https://www.python.org/) (3.8+)
- A modern web browser (Chrome, Edge, Firefox, Safari)

### 1. Clone the Repository
```bash
git clone https://github.com/prashansaraut/shiftrelay.git
cd shiftrelay
```

### 2. Start the Local Server

**Option A — Using Node.js (Recommended):**
```bash
npm start
# or: node server.js
```

**Option B — Using Python 3:**
```bash
python server.py
```

### 3. Open in Browser
Open your browser and navigate to:
```
http://localhost:8000
```

Both included servers automatically serve `index.html` for deep client-side routes, allowing page reloads and direct navigation to any URL.

---

## 🧪 Running the Test Suite

ShiftRelay includes a comprehensive automated test suite with 100% pass coverage across 312 assertions:

```bash
npm test
# or: node tests/test_full_suite.mjs
```

---

## ⚠️ Limitations

- **Frontend Demonstration**: ShiftRelay is designed as an architectural frontend demonstration. It uses browser-based `localStorage` for persistence rather than a remote database server.
- **Simulated Roles**: Role switching (Operations Manager, Outgoing Shift Employee, Incoming Shift Employee) is provided via an interactive switcher to simulate distinct operator workflows without requiring a production backend identity provider (IdP).
- **Single-Client Isolation**: State changes made in one browser instance persist locally to that browser's LocalStorage and do not broadcast across multiple physical devices in real time.

---

## 🔮 Future Scope

- **Backend API & Database Integration**: Transitioning state persistence from LocalStorage to a PostgreSQL / Supabase backend with RESTful/GraphQL endpoints.
- **Multi-Tenant Authentication & RBAC**: Real authentication (OAuth2 / OpenID Connect) with role-based access control for operators, supervisors, and administrators.
- **Real-Time WebSocket Sync**: Live multi-operator updates using WebSockets or Server-Sent Events (SSE) for concurrent handover collaboration.
- **Hardware & IoT Telemetry**: Direct integration with industrial PLC/SCADA systems to auto-populate equipment incident logs during handovers.

---

## 📄 License

ShiftRelay is an open-source educational and portfolio software engineering project.
