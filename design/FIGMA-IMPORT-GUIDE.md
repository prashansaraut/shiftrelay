# ShiftRelay Figma Design Package & Import Guide

This package provides editable, vector-based design assets for **ShiftRelay**. Rather than flat image screenshots, every design file in this directory is structured as a standards-compliant SVG vector document with labeled layers, components, typography styles, and layout frames suitable for direct import into **Figma**, **Penpot**, or **Adobe XD**.

---

## 📁 Design Directory Structure

```
design/
├── design-system/
│   ├── design-tokens.json         # Raw tokens: Colors, typography, spacing, elevation
│   ├── design-system-spec.svg     # Visual design system artboard (Palettes, Typography, Components)
│   └── component-library.svg      # Master components: Badges, Buttons, Cards, Inputs, Tables
├── wireframes/
│   ├── wf-landing-desktop.svg     # Low-fidelity wireframe: Public Landing Page (1280px)
│   ├── wf-landing-mobile.svg      # Low-fidelity wireframe: Public Landing Page (390px)
│   ├── wf-demo-milestones.svg     # Low-fidelity wireframe: 5-Milestone Interactive Demo Flow
│   ├── wf-workspace-dashboard.svg # Low-fidelity wireframe: Operations Dashboard
│   ├── wf-workspace-handovers.svg # Low-fidelity wireframe: Handover Preparation & Review
│   └── wf-workspace-tasks.svg     # Low-fidelity wireframe: Task Management & Filter List
└── high-fidelity/
    ├── hifi-landing-desktop.svg   # High-fidelity: Public Landing Page Desktop (1280px)
    ├── hifi-landing-mobile.svg    # High-fidelity: Public Landing Page Mobile (390px)
    ├── hifi-demo-desktop.svg      # High-fidelity: Interactive Demonstration Desktop
    ├── hifi-demo-mobile.svg       # High-fidelity: Interactive Demonstration Mobile
    ├── hifi-dashboard-desktop.svg # High-fidelity: Operational Workspace Dashboard (1280px)
    ├── hifi-dashboard-mobile.svg  # High-fidelity: Operational Workspace Dashboard (390px)
    └── hifi-handover-detail.svg   # High-fidelity: Detailed Handover Sign-Off Portal
```

---

## 🎨 How to Import into Figma

### Method 1: Direct Drag & Drop (Recommended)
1. Open [Figma](https://www.figma.com/) in your browser or desktop application.
2. Create a new empty design file named **"ShiftRelay UI Kit & Prototype"**.
3. Create three distinct pages in the left sidebar:
   - `01. Design System & Tokens`
   - `02. Low-Fidelity Wireframes`
   - `03. High-Fidelity Screens`
4. Drag and drop the SVG files from this package directly into the respective pages on your Figma canvas:
   - Drop `design-system-spec.svg` into page `01`.
   - Drop all `wf-*.svg` files into page `02`.
   - Drop all `hifi-*.svg` files into page `03`.
5. Figma will immediately convert every SVG into editable vector frames, text layers, and auto-layout groups.

### Method 2: Token Studio for Figma
If using the **Tokens Studio for Figma** plugin:
1. Open the plugin.
2. Click **Settings ➔ Import JSON**.
3. Select `design/design-system/design-tokens.json`.
4. All color styles, spacing tokens, and typography definitions will be instantly mapped to native Figma variables.

---

## 📐 Color Tokens Reference

| Token Name | HEX Code | Purpose |
| :--- | :--- | :--- |
| **Relay Ultramarine** | `#2563EB` | Primary brand accent and interactive buttons |
| **Relay Ultramarine Dark** | `#1D4ED8` | Hover state for primary buttons |
| **Kinetic Amber** | `#D97706` | Active handover baton and carry-forward state |
| **Continuity Emerald** | `#059669` | Acknowledged handovers and resolved incidents |
| **Critical Ruby** | `#DC2626` | Critical safety alarms and overdue warnings |
| **Slate Obsidian** | `#0F172A` | Core typography and dark sidebar navigation |
| **Slate Medium** | `#1E293B` | Dark surface containers (Continuity Engine card) |
| **Border Neutral** | `#E2E8F0` | Structural card and table boundaries |
| **Canvas Background** | `#F8FAFC` | Main application background surface |
| **Surface Pure White** | `#FFFFFF` | Elevated cards, forms, and dialog panels |

---

## 🔤 Typography Hierarchy

- **Display (Hero Titles)**: *Plus Jakarta Sans*, 48px / Bold 800 / Tracking -0.03em
- **H1 (Page Titles)**: *Plus Jakarta Sans*, 32px / Bold 800 / Tracking -0.025em
- **H2 (Section Titles)**: *Plus Jakarta Sans*, 24px / SemiBold 700 / Tracking -0.02em
- **H3 (Card Titles)**: *Plus Jakarta Sans*, 18px / SemiBold 700 / Tracking -0.015em
- **Body Regular**: *Inter*, 14px / Regular 400 / Line-height 1.55
- **Body Strong**: *Inter*, 14px / SemiBold 600 / Line-height 1.55
- **Monospace (Ticket IDs)**: *JetBrains Mono*, 12px / Medium 500 / Line-height 1.4
