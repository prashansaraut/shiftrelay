// ShiftRelay Public Landing Page View (/)
// Modern, editorial commercial SaaS landing page with split-layout hero,
// realistic interface preview, workflow visualizations, and feature deep-dives.

import { logoFull, logoIcon } from './brand.js';
import { esc } from './ui.js';

export function landingView() {
  return {
    isPublic: true,
    title: 'ShiftRelay | Shift Continuity System',
    html: `
    <div class="sr-landing">
      <!-- Public Top Navigation -->
      <header class="sr-nav">
        <div class="sr-nav-inner">
          <a href="/" data-link class="sr-nav-brand">
            ${logoFull(28, true, 'dark-text')}
          </a>
          <nav class="sr-nav-links" aria-label="Main menu">
            <a href="#problem">Problem vs Solution</a>
            <a href="#how-it-works">How It Works</a>
            <a href="#continuity-engine">Continuity Engine</a>
            <a href="#features">Features</a>
          </nav>
          <div class="sr-nav-actions">
            <!-- Theme Toggle Button -->
            <button class="icon-btn sr-theme-toggle" data-act="toggle-theme" aria-label="Toggle light or dark theme" title="Toggle theme">
              <i data-lucide="moon"></i>
            </button>
            <a href="/demo" data-link class="btn sr-desktop-nav-cta">Explore Interactive Demo</a>
            <a href="/app/dashboard" data-link class="btn primary sr-desktop-nav-cta">Open Workspace</a>
            <!-- Mobile Hamburger Toggle -->
            <button class="sr-nav-toggle" id="srNavToggle" aria-label="Toggle navigation menu" aria-expanded="false" aria-controls="srNavMobile">
              <i data-lucide="menu"></i>
            </button>
          </div>
        </div>
      </header>

      <!-- Mobile Navigation Drawer -->
      <div class="sr-nav-mobile" id="srNavMobile" aria-hidden="true">
        <div class="sr-nav-mobile-header">
          ${logoFull(24, false, 'dark-text')}
          <div style="display:flex;align-items:center;gap:0.5rem;">
            <button class="icon-btn sr-theme-toggle" data-act="toggle-theme" aria-label="Toggle light or dark theme" title="Toggle theme">
              <i data-lucide="moon"></i>
            </button>
            <button class="sr-nav-close" id="srNavClose" aria-label="Close navigation menu">
              <i data-lucide="x"></i>
            </button>
          </div>
        </div>
        <nav class="sr-nav-mobile-links">
          <a href="#problem" class="sr-nav-mobile-item">Problem vs Solution</a>
          <a href="#how-it-works" class="sr-nav-mobile-item">How It Works</a>
          <a href="#continuity-engine" class="sr-nav-mobile-item">Continuity Engine</a>
          <a href="#features" class="sr-nav-mobile-item">Features</a>
        </nav>
        <div class="sr-nav-mobile-ctas">
          <a href="/demo" data-link class="btn primary sr-mobile-btn">
            <i data-lucide="play-circle"></i> Explore Interactive Demo
          </a>
          <a href="/app/dashboard" data-link class="btn sr-mobile-btn">
            <i data-lucide="layout-dashboard"></i> Open Workspace
          </a>
        </div>
      </div>
      <div class="sr-nav-scrim" id="srNavScrim"></div>

      <!-- Hero Section (Split Layout) -->
      <section class="sr-hero">
        <div class="sr-container sr-hero-grid">
          <!-- Left Column: Copy & CTAs -->
          <div class="sr-hero-content">
            <div class="sr-hero-pill">
              <span class="sr-pill-dot"></span>
              ShiftRelay 2.4 — Operational Continuity System
            </div>
            <h1 class="sr-hero-title">
              Never drop the baton between shifts.
            </h1>
            <p class="sr-hero-subtitle">
              Every shift connected. Nothing left behind. ShiftRelay turns handover blind spots into verifiable operational continuity with original record preservation, mutual sign-offs, and conflict-safe state transitions.
            </p>

            <div class="sr-hero-ctas">
              <a href="/demo" data-link class="btn primary lg sr-cta-primary">
                <i data-lucide="play-circle"></i> Explore Interactive Demo
              </a>
              <a href="/app/dashboard" data-link class="btn lg sr-cta-secondary">
                <i data-lucide="layout-dashboard"></i> Open Workspace
              </a>
            </div>

            <div class="sr-hero-proof">
              <div class="sr-proof-item">
                <i data-lucide="shield-check" class="sr-proof-icon"></i>
                <span>Original Record ID Preservation</span>
              </div>
              <div class="sr-proof-item">
                <i data-lucide="history" class="sr-proof-icon"></i>
                <span>Traceable Carry-Forward History</span>
              </div>
              <div class="sr-proof-item">
                <i data-lucide="arrow-left-right" class="sr-proof-icon"></i>
                <span>Recorded Mutual Sign-Offs</span>
              </div>
            </div>
          </div>

          <!-- Right Column: Realistic Handover Interface Preview -->
          <div class="sr-hero-preview">
            <div class="sr-mock-window">
              <div class="sr-mock-header">
                <div class="sr-mock-dots">
                  <span></span><span></span><span></span>
                </div>
                <div class="sr-mock-url">
                  shiftrelay.app/app/handovers/HO-8241
                </div>
                <span class="badge green">● LIVE</span>
              </div>

              <div class="sr-mock-body">
                <!-- Handover protocol card -->
                <div class="sr-mock-card">
                  <div class="sr-mock-card-header">
                    <div>
                      <span class="badge blue">HO-8241</span>
                      <span class="badge amber">Awaiting Acknowledgement</span>
                    </div>
                    <small class="muted">Prepared 12 mins ago</small>
                  </div>
                  <h3>Morning Shift to Evening Shift</h3>
                  <div class="sr-mock-meta">
                    <div><span class="muted">Outgoing Lead:</span> <b>Sarah Jenkins</b></div>
                    <div><span class="muted">Incoming Lead:</span> <b>Marcus Vance</b></div>
                  </div>
                </div>

                <!-- Attached items -->
                <div class="sr-mock-section">
                  <div class="sr-mock-section-title">
                    <span>Continuity Custody Manifest</span>
                    <span class="badge gray">3 Items Attached</span>
                  </div>

                  <!-- Critical Incident -->
                  <div class="sr-mock-item sr-mock-critical">
                    <div class="sr-mock-item-head">
                      <span class="badge red">Critical Incident</span>
                      <code>IN-2001</code>
                    </div>
                    <strong>Pallet barrier blocking fire exit Zone C</strong>
                    <p class="muted">Forklift team alerted; awaiting clearance sign-off.</p>
                  </div>

                  <!-- In-Progress Task -->
                  <div class="sr-mock-item">
                    <div class="sr-mock-item-head">
                      <span class="badge blue">High Priority</span>
                      <code>TK-1001</code>
                    </div>
                    <strong>Inspect damaged conveyor belt Zone B</strong>
                    <p class="muted">Drive roller belt fraying; technician en route.</p>
                  </div>

                  <!-- Carried Forward Task -->
                  <div class="sr-mock-item sr-mock-carried">
                    <div class="sr-mock-item-head">
                      <span class="badge amber">Carried 2x • Risk Escalation</span>
                      <code>TK-1003</code>
                    </div>
                    <strong>Calibrate forklift scanner F-04</strong>
                    <p class="muted">Rolled over 2 consecutive shifts; awaiting vendor part.</p>
                  </div>
                </div>

                <!-- Acknowledgement action -->
                <div class="sr-mock-footer">
                  <div class="sr-mock-engine-status">
                    <i data-lucide="cpu"></i>
                    <span>Continuity Engine: ID Preservation Armed</span>
                  </div>
                  <a href="/demo" data-link class="btn primary sm">
                    Simulate Sign-Off →
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Problem vs Solution Matrix -->
      <section id="problem" class="sr-section sr-bg-subtle">
        <div class="sr-container">
          <div class="sr-section-head text-center">
            <span class="sr-section-tag">Industrial Shift Reality</span>
            <h2>The Handover Blind Spot is costing facilities millions.</h2>
            <p class="sr-section-sub">
              When shifts transition on scribbled paper, disjointed chats, or fragmented spreadsheets, mission-critical operational context falls through the cracks.
            </p>
          </div>

          <div class="sr-matrix-grid">
            <!-- Without ShiftRelay -->
            <div class="card sr-matrix-card sr-matrix-bad">
              <div class="sr-matrix-header">
                <span class="sr-matrix-indicator bad">✕</span>
                <h3>Traditional Handover Vulnerabilities</h3>
              </div>
              <ul class="sr-matrix-list bad">
                <li>
                  <strong>Fragmented Communication:</strong>
                  Notes scattered across paper logs, whiteboards, and WhatsApp groups.
                </li>
                <li>
                  <strong>Vanishing Identity:</strong>
                  Tasks get re-created with new IDs, destroying historical timestamps and root cause trails.
                </li>
                <li>
                  <strong>Unmonitored Rollovers:</strong>
                  Items carried forward repeatedly escape detection until an equipment failure occurs.
                </li>
                <li>
                  <strong>Unilateral Handoffs:</strong>
                  Outgoing team leaves notes without verified receipt or acceptance by arriving personnel.
                </li>
                <li>
                  <strong>Silent Overwrite Collisions:</strong>
                  Mid-flight assignment changes overwritten by stale handover documents.
                </li>
              </ul>
            </div>

            <!-- With ShiftRelay -->
            <div class="card sr-matrix-card sr-matrix-good">
              <div class="sr-matrix-header">
                <span class="sr-matrix-indicator good">✓</span>
                <h3>The ShiftRelay Continuity Guarantee</h3>
              </div>
              <ul class="sr-matrix-list good">
                <li>
                  <strong>Structured Operational Baton:</strong>
                  Centralized protocol binding outgoing and incoming teams into a verifiable contract.
                </li>
                <li>
                  <strong>Permanent Record Preservation:</strong>
                  Original task IDs (<code>TK-1001</code>) and incident logs are preserved forever.
                </li>
                <li>
                  <strong>Repeat Carry-Forward Warning:</strong>
                  Automated risk calculation flags any item rolled over $\ge 2$ shifts.
                </li>
                <li>
                  <strong>Mutual Recorded Acknowledgement:</strong>
                  Explicit digital sign-off records the incoming lead and precise timestamp.
                </li>
                <li>
                  <strong>Concurrency Conflict Protection:</strong>
                  The Continuity Engine detects external edits and preserves the newest assignment.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <!-- How It Works (5-Stage Operational Baton) -->
      <section id="how-it-works" class="sr-section">
        <div class="sr-container">
          <div class="sr-section-head text-center">
            <span class="sr-section-tag">End-to-End Workflow</span>
            <h2>How the Shift Baton passes seamlessly.</h2>
            <p class="sr-section-sub">
              From outgoing shift review to incoming acceptance, every step is structured, transparent, and verified.
            </p>
          </div>

          <div class="sr-workflow-stepper">
            <div class="sr-wf-step">
              <div class="sr-wf-num">1</div>
              <h4>Capture</h4>
              <p>Outgoing shift tracks tasks and incidents in real time. Items link to active shifts.</p>
            </div>
            <div class="sr-wf-connector"></div>
            <div class="sr-wf-step">
              <div class="sr-wf-num">2</div>
              <h4>Draft</h4>
              <p>System automatically pulls all open tasks and unresolved incidents into a handover draft.</p>
            </div>
            <div class="sr-wf-connector"></div>
            <div class="sr-wf-step">
              <div class="sr-wf-num">3</div>
              <h4>Review</h4>
              <p>Outgoing and incoming leads inspect the payload, add priority notes, and check safety alerts.</p>
            </div>
            <div class="sr-wf-connector"></div>
            <div class="sr-wf-step">
              <div class="sr-wf-num">4</div>
              <h4>Sign-Off</h4>
              <p>Incoming supervisor formally acknowledges custody, locking in mutual agreement.</p>
            </div>
            <div class="sr-wf-connector"></div>
            <div class="sr-wf-step">
              <div class="sr-wf-num">5</div>
              <h4>Carry Forward</h4>
              <p>The Continuity Engine rolls uncompleted items into the new shift, preserving original IDs.</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Signature Feature: Continuity Engine Deep Dive -->
      <section id="continuity-engine" class="sr-section sr-bg-dark">
        <div class="sr-container">
          <div class="sr-section-head text-center light">
            <span class="sr-section-tag light">Deterministic State Machine</span>
            <h2 class="text-white">Under the Hood: The Continuity Engine</h2>
            <p class="sr-section-sub light">
              ShiftRelay does not rely on naive form saves. The Continuity Engine enforces strict relational integrity, concurrency conflict rules, and historical provenance.
            </p>
          </div>

          <div class="sr-engine-grid">
            <div class="sr-engine-card">
              <div class="sr-engine-icon">
                <i data-lucide="shield-check"></i>
              </div>
              <h3>Original ID Preservation</h3>
              <p>
                When a task is carried forward across shifts, its identifier (e.g. <code>TK-1001</code>) never changes. History logs append sequentially, preventing duplicate task sprawl.
              </p>
            </div>

            <div class="sr-engine-card">
              <div class="sr-engine-icon">
                <i data-lucide="alert-triangle"></i>
              </div>
              <h3>Concurrent Conflict Detection</h3>
              <p>
                If an operator reassigns a task to another shift while a handover is awaiting sign-off, the Continuity Engine detects the change and preserves the newer assignment without silent overwriting.
              </p>
            </div>

            <div class="sr-engine-card">
              <div class="sr-engine-icon">
                <i data-lucide="history"></i>
              </div>
              <h3>Cumulative Carry Tracking</h3>
              <p>
                Every rollover increments a persistent carry counter. The dashboard immediately elevates items with 2+ carries as critical operational bottlenecks.
              </p>
            </div>

            <div class="sr-engine-card">
              <div class="sr-engine-icon">
                <i data-lucide="check-circle-2"></i>
              </div>
              <h3>Closed-Shift Integrity</h3>
              <p>
                Completed tasks and resolved incidents permanently record the exact shift of closure. Reopening an item cleanly resets closed-shift references to eliminate stale audit data.
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- Core Modules Showcase -->
      <section id="features" class="sr-section">
        <div class="sr-container">
          <div class="sr-section-head text-center">
            <span class="sr-section-tag">Complete System</span>
            <h2>Six purpose-built operational modules.</h2>
            <p class="sr-section-sub">
              Everything needed to run high-reliability 24/7 facilities without framework bloat or third-party tracking.
            </p>
          </div>

          <div class="sr-features-grid">
            <div class="card sr-feature-box">
              <i data-lucide="layout-dashboard" class="sr-feature-icon"></i>
              <h4>Reactive Dashboard</h4>
              <p>Live metrics calculating total carried tasks and incidents, repeat rollover risks, shift timelines, and active custody.</p>
            </div>

            <div class="card sr-feature-box">
              <i data-lucide="clock" class="sr-feature-icon"></i>
              <h4>Shift Management</h4>
              <p>Configure schedules, assign supervisors and staffing rosters, track timing, and prevent overlapping shift misconfigurations.</p>
            </div>

            <div class="card sr-feature-box">
              <i data-lucide="arrow-left-right" class="sr-feature-icon"></i>
              <h4>Handover Protocol</h4>
              <p>Automated item aggregation, safety checklists, mutual sign-off workflows, and conflict notices.</p>
            </div>

            <div class="card sr-feature-box">
              <i data-lucide="clipboard-list" class="sr-feature-icon"></i>
              <h4>Task Registry</h4>
              <p>Priority sorting, due-date monitors, department taxonomies, and immutable audit logs per item.</p>
            </div>

            <div class="card sr-feature-box">
              <i data-lucide="alert-triangle" class="sr-feature-icon"></i>
              <h4>Incident Anomaly Log</h4>
              <p>Severity-tiered incident tracking with mandatory resolution notes upon closure and automatic handover rollover.</p>
            </div>

            <div class="card sr-feature-box">
              <i data-lucide="history" class="sr-feature-icon"></i>
              <h4>Unified Activity Stream</h4>
              <p>Comprehensive temporal audit log of all system state changes, status transitions, and handover sign-offs.</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Refined Final CTA Section -->
      <section class="sr-cta-banner">
        <div class="sr-container text-center">
          <div class="sr-cta-badge">
            <span class="sr-pulse-dot"></span>
            <span>Continuity Engine Active • Zero Dropped Batons</span>
          </div>
          <h2>Never drop the baton between shifts.</h2>
          <p>
            Connect your operations with auditable handovers, conflict-safe task reassignment, and preserved record provenance. Test the guided simulator or open the workspace now.
          </p>
          <div class="sr-hero-ctas justify-center mt">
            <a href="/demo" data-link class="btn primary lg">
              <i data-lucide="play-circle"></i> Explore Interactive Demo
            </a>
            <a href="/app/dashboard" data-link class="btn lg">
              <i data-lucide="layout-dashboard"></i> Open Workspace
            </a>
          </div>
        </div>
      </section>

      <!-- Redesigned High-Contrast Structured Footer -->
      <footer class="sr-footer">
        <div class="sr-container">
          <div class="sr-footer-grid">
            <!-- Col 1: Brand & Identity -->
            <div class="sr-footer-col sr-footer-brand-col">
              ${logoFull(28, true, 'dark-text')}
              <p class="sr-footer-desc">
                ShiftRelay is an operational continuity platform designed to eliminate shift handover blind spots in manufacturing, healthcare, and 24/7 IT operations.
              </p>
              <div class="sr-footer-badge">
                <span class="sr-badge-pill"><i data-lucide="shield-check"></i> 100% Standards Compliant</span>
                <span class="sr-badge-pill"><i data-lucide="cpu"></i> Zero Dependencies</span>
              </div>
            </div>

            <!-- Col 2: Explore Platform -->
            <div class="sr-footer-col">
              <h4>Explore Platform</h4>
              <ul class="sr-footer-links">
                <li><a href="#problem">Problem vs Solution</a></li>
                <li><a href="#how-it-works">How It Works</a></li>
                <li><a href="#continuity-engine">Continuity Engine</a></li>
                <li><a href="#features">Feature Modules</a></li>
                <li><a href="/demo" data-link>Explore Interactive Demo</a></li>
              </ul>
            </div>

            <!-- Col 3: Operational Workspace -->
            <div class="sr-footer-col">
              <h4>Operational Workspace</h4>
              <ul class="sr-footer-links">
                <li><a href="/app/dashboard" data-link>Operations Dashboard</a></li>
                <li><a href="/app/shifts" data-link>Shift Schedules</a></li>
                <li><a href="/app/handovers" data-link>Handover Protocols</a></li>
                <li><a href="/app/tasks" data-link>Task Registry</a></li>
                <li><a href="/app/incidents" data-link>Incident Anomaly Log</a></li>
                <li><a href="/app/activity" data-link>Activity Audit Trail</a></li>
              </ul>
            </div>

            <!-- Col 4: Project Info & Governance -->
            <div class="sr-footer-col">
              <h4>Project &amp; Technology</h4>
              <p class="sr-footer-meta">
                <strong>Yuva Intern Program:</strong> Frontend Web Developer Week 5 Project.<br>
                <strong>Version:</strong> 2.4.0 (Production Candidate)<br>
                <strong>Architecture:</strong> Vanilla ES2022, HTML5 History API, Resilient LocalStorage.
              </p>
              <div class="sr-footer-actions">
                <a href="/app/dashboard" data-link class="btn sm primary">Open Workspace</a>
              </div>
            </div>
          </div>

          <!-- Bottom Copyright Bar -->
          <div class="sr-footer-bottom">
            <div class="sr-footer-copy">
              &copy; 2026 ShiftRelay Continuity System. All rights reserved. Every shift connected. Nothing left behind.
            </div>
            <div class="sr-footer-tags">
              <span>WCAG 2.1 AA Compliant</span>
              <span>•</span>
              <span>Original ID Preservation</span>
              <span>•</span>
              <span>Conflict Safe</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
    `
  };
}
