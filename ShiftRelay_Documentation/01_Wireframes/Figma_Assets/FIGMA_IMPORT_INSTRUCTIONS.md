# ShiftRelay — Figma Import & Workspace Organization Guide

This guide provides step-by-step instructions for importing the ShiftRelay Low-Fidelity UI/UX Wireframe package into Figma, setting up page hierarchies, maintaining auto-layout structures, and utilizing the component kit.

---

## 1. Deliverable Package Structure

The `01_Wireframes/` directory contains vector SVGs formatted for vector import into Figma:

```
01_Wireframes/
├── Figma_Assets/
│   ├── wireframe-ui-kit.svg            (Master Low-Fidelity Component Library)
│   └── FIGMA_IMPORT_INSTRUCTIONS.md    (This guide)
├── Landing_Page/
│   └── wf-landing-page-desktop.svg     (1440 x 2800 Desktop Public Landing)
├── Interactive_Demo/
│   ├── wf-demo-milestone-1-queue.svg   (Milestone 1: Outgoing Inspection)
│   ├── wf-demo-milestone-2-draft.svg   (Milestone 2: Handover Draft)
│   ├── wf-demo-milestone-3-conflict.svg(Milestone 3: Conflict Detection)
│   ├── wf-demo-milestone-4-signoff.svg (Milestone 4: Incoming Sign-off)
│   └── wf-demo-milestone-5-audit.svg   (Milestone 5: Continuity Audit)
├── Operational_Workspace/
│   ├── wf-workspace-dashboard.svg      (Dashboard Module: Metrics & Queue)
│   ├── wf-workspace-shifts.svg         (Shift Rostering & Schedule Table)
│   ├── wf-workspace-handovers.svg      (Handover Protocol & Detail Inspection)
│   ├── wf-workspace-tasks.svg          (Task Registry & Carry Counter)
│   ├── wf-workspace-incidents.svg      (Incident Log & Mandatory Notes)
│   ├── wf-workspace-activity.svg       (Immutable Temporal Audit Stream)
│   └── wf-workspace-settings.svg       (Simulated Role Switcher & Theme Mode)
├── Mobile_Wireframes/
│   ├── wf-mobile-landing.svg           (390 x 1400 Mobile Landing Page)
│   ├── wf-mobile-nav-drawer.svg        (390 x 844 Off-Canvas Menu Drawer)
│   ├── wf-mobile-demo.svg              (390 x 844 Mobile Demo Stepper)
│   ├── wf-mobile-workspace-dashboard.svg (390 x 844 Mobile Workspace Metrics)
│   ├── wf-mobile-tasks.svg             (390 x 844 Mobile Task Cards & Badges)
│   ├── wf-mobile-handover-detail.svg   (390 x 844 Mobile Handover Authorization)
│   └── wf-mobile-incidents.svg         (390 x 844 Mobile Anomaly Resolution)
├── Tablet_Wireframes/
│   ├── wf-tablet-landing.svg           (768 x 1200 Tablet Landing Layout)
│   ├── wf-tablet-workspace.svg         (768 x 1024 Tablet Workspace 2x2 Grid)
│   └── wf-tablet-demo.svg              (768 x 1024 Tablet 2-Column Demo)
└── Sitemap/
    ├── visual-sitemap.svg              (1200 x 850 High-Res Architecture Diagram)
    └── visual-sitemap.mmd              (Mermaid Source Definition)
```

---

## 2. Figma Project & Page Organization

To structure the Figma design system, create a new Figma project named **`ShiftRelay — UI/UX Design System & Wireframe Package`**, and organize it into the following 5 distinct pages:

### Page 1: `00. Design System & Master UI Kit`
- Import `wireframe-ui-kit.svg`.
- Right click components → **Create Component** (or `Ctrl+Alt+K` / `Cmd+Option+K`).
- Define component variants for buttons (Primary, Secondary, Ghost), status chips (Active, Scheduled, Signed, Open), and inputs.

### Page 2: `01. Public Landing Page & Sitemap`
- Import `visual-sitemap.svg` (Position at top: X=0, Y=0).
- Import `wf-landing-page-desktop.svg` (Desktop 1440 x 2800).
- Import `wf-tablet-landing.svg` (Tablet 768 x 1200).
- Import `wf-mobile-landing.svg` (Mobile 390 x 1400).
- Import `wf-mobile-nav-drawer.svg` (Mobile 390 x 844 Overlay).

### Page 3: `02. Interactive Demonstration (5 Milestones)`
Arrange the 5 milestones horizontally with 64px gap to demonstrate user progression:
1. Frame 1: `wf-demo-milestone-1-queue.svg` (Outgoing Inspection)
2. Frame 2: `wf-demo-milestone-2-draft.svg` (Handover Draft)
3. Frame 3: `wf-demo-milestone-3-conflict.svg` (Conflict Detection)
4. Frame 4: `wf-demo-milestone-4-signoff.svg` (Incoming Sign-off)
5. Frame 5: `wf-demo-milestone-5-audit.svg` (Continuity Audit)
- Add tablet & mobile demo views below: `wf-tablet-demo.svg` and `wf-mobile-demo.svg`.

### Page 4: `03. Operational Workspace Modules`
Arrange all 7 operational modules in a 2-column or horizontal grid:
- `wf-workspace-dashboard.svg` (Primary Dashboard)
- `wf-workspace-shifts.svg` (Shift Scheduling & Rosters)
- `wf-workspace-handovers.svg` (Handover Protocol & Inspection)
- `wf-workspace-tasks.svg` (Operational Task Registry & Carry Counters)
- `wf-workspace-incidents.svg` (Incident Log & Mandatory Resolution Notes)
- `wf-workspace-activity.svg` (Unified Immutable Audit Stream)
- `wf-workspace-settings.svg` (Simulated Roles & Theme Mode)

### Page 5: `04. Responsive Mobile & Tablet Flows`
- Display the dedicated mobile wireframes:
  - Mobile Dashboard, Tasks, Handover Detail, Incidents, Nav Drawer.
- Display the dedicated tablet wireframes:
  - Tablet Workspace, Tablet Demo.

---

## 3. Step-by-Step SVG Import Workflow

1. Open Figma and create a new design file.
2. Drag and drop the `.svg` files directly from your file explorer into the Figma canvas.
   - Alternatively: In Figma, select **Menu → File → Place Image...** (`Ctrl+Shift+K` / `Cmd+Shift+K`), select all `.svg` files, and click to place.
3. Every SVG will automatically convert into a native Figma Vector Frame with intact text elements, vector shapes, strokes, and hierarchies.
4. Rename each top-level group to its standardized frame name (e.g. `Frame / Desktop / Workspace / Dashboard`).
5. Select each imported frame and set **Constraints** to *Top & Left* or *Scale* as desired for responsive testing.

---

## 4. Visual Language & Grayscale Palette

All wireframes follow the neutral low-fidelity specification:
- Background Surfaces: `#F8FAFC` (Slate 50), `#FFFFFF` (Pure White)
- Primary Accent & High Priority: `#0F172A` (Slate 900)
- Structural Outlines: `#E2E8F0` (Slate 200), `#CBD5E1` (Slate 300)
- Body Text & Secondary Elements: `#475569` (Slate 600), `#64748B` (Slate 500)
- Muted element indicators: `#94A3B8` (Slate 400)