// ShiftRelay Interactive Demonstration View (/demo)
// Guided 5-milestone interactive walkthrough with isolated in-memory state.

import {
  getDemoState, resetDemoState, setDemoStep,
  demoPrepareHandover, demoSimulateConflict, demoAcknowledgeHandover
} from './demo-store.js';
import { esc, fmt, badge } from './ui.js';
import { logoFull } from './brand.js';

export function demoView() {
  const d = getDemoState();
  const step = d.step;

  const steps = [
    { num: 1, title: 'Outgoing Inspection' },
    { num: 2, title: 'Handover Draft' },
    { num: 3, title: 'Conflict Detection' },
    { num: 4, title: 'Incoming Sign-off' },
    { num: 5, title: 'Continuity Audit' }
  ];

  return {
    isPublic: true,
    title: 'Interactive Demonstration',
    html: `
    <div class="sr-demo-wrapper">
      <!-- Demo Top Bar -->
      <header class="sr-demo-header">
        <div class="sr-demo-header-left">
          <a href="/" data-link class="sr-demo-back-link">
            ${logoFull(24, false, 'dark-text')}
          </a>
          <span class="sr-demo-badge">Interactive Demo Sandbox</span>
        </div>
        <div class="sr-demo-header-actions">
          <button class="icon-btn sr-theme-toggle" data-act="toggle-theme" aria-label="Toggle light or dark theme" title="Toggle theme">
            <i data-lucide="moon"></i>
          </button>
          <button class="btn sm" data-act="demo-reset">
            <i data-lucide="rotate-ccw"></i> Restart Demo
          </button>
          <a href="/app/dashboard" data-link class="btn sm primary">
            Open Real Workspace <i data-lucide="arrow-right"></i>
          </a>
        </div>
      </header>

      <!-- Stepper Indicator -->
      <nav class="sr-demo-stepper" aria-label="Demo progress">
        ${steps.map(s => `
          <button class="sr-step-btn ${s.num === step ? 'active' : ''} ${s.num < step ? 'done' : ''}" data-act="demo-step" data-step="${s.num}">
            <span class="sr-step-num">${s.num < step ? '✓' : s.num}</span>
            <span class="sr-step-title">${s.title}</span>
          </button>
        `).join('')}
      </nav>

      <!-- Demo Main Content -->
      <div class="sr-demo-content">
        ${renderStep(step, d)}
      </div>

      <!-- Live Event Telemetry Stream -->
      <div class="sr-demo-telemetry card mt">
        <div class="sr-telemetry-header">
          <i data-lucide="activity"></i>
          <b>In-Memory Sandbox Telemetry</b>
          <span class="muted">(Isolated from LocalStorage — production data untouched)</span>
        </div>
        <ul class="sr-telemetry-list">
          ${d.logs.slice(0, 4).map(l => `<li><span class="time">${esc(l.at)}</span> ${esc(l.text)}</li>`).join('')}
        </ul>
      </div>
    </div>
    `
  };
}

function renderStep(step, d) {
  switch (step) {
    case 1:
      return renderStep1(d);
    case 2:
      return renderStep2(d);
    case 3:
      return renderStep3(d);
    case 4:
      return renderStep4(d);
    case 5:
      return renderStep5(d);
    default:
      return renderStep1(d);
  }
}

// Step 1: Outgoing Inspection
function renderStep1(d) {
  const morningTasks = d.tasks.filter(t => t.shiftId === 'SH-MORN');
  const morningIncidents = d.incidents.filter(i => i.shiftId === 'SH-MORN');

  return `
  <div class="sr-demo-panel">
    <div class="sr-step-callout card">
      <div class="sr-callout-icon"><i data-lucide="clipboard-check"></i></div>
      <div>
        <h3>Step 1 of 5: Inspect the Outgoing Shift</h3>
        <p>You are viewing <b>Morning Shift (06:00 – 14:00)</b> led by <b>Rahul Mehta</b>. Before ending the shift, the team must account for all work. Notice that <b>TK-1003</b> has already been carried forward twice ($\ge 2$ repeat risk) and <b>IN-2001</b> is a Critical safety incident.</p>
      </div>
    </div>

    <div class="grid g2 mt">
      <div class="card">
        <h3>Morning Tasks (${morningTasks.length})</h3>
        <div class="scroll">
          <table>
            <thead><tr><th>ID</th><th>Task</th><th>Priority</th><th>Status</th><th>Carry</th></tr></thead>
            <tbody>
              ${morningTasks.map(t => `
                <tr class="${t.status === 'Completed' ? 'muted-row' : ''}">
                  <td><code>${t.id}</code></td>
                  <td>${esc(t.title)}</td>
                  <td>${badge(t.priority)}</td>
                  <td>${badge(t.status)}</td>
                  <td>${t.carry > 0 ? `<span class="badge ${t.carry >= 2 ? 'red' : 'amber'}">${t.carry}x carry</span>` : '0'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <div class="card">
        <h3>Morning Incidents (${morningIncidents.length})</h3>
        <div class="scroll">
          <table>
            <thead><tr><th>ID</th><th>Incident</th><th>Severity</th><th>Status</th></tr></thead>
            <tbody>
              ${morningIncidents.map(i => `
                <tr class="${i.severity === 'Critical' ? 'hot' : ''}">
                  <td><code>${i.id}</code></td>
                  <td>${esc(i.title)}</td>
                  <td>${badge(i.severity)}</td>
                  <td>${badge(i.status)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div class="sr-step-actions mt">
      <button class="btn primary" data-act="demo-prep">
        <i data-lucide="arrow-left-right"></i> Prepare Shift Handover ➔
      </button>
    </div>
  </div>`;
}

// Step 2: Handover Draft
function renderStep2(d) {
  const h = d.handover;
  if (!h) {
    demoPrepareHandover();
    return renderStep2(getDemoState());
  }

  return `
  <div class="sr-demo-panel">
    <div class="sr-step-callout card">
      <div class="sr-callout-icon"><i data-lucide="file-text"></i></div>
      <div>
        <h3>Step 2 of 5: Continuity Engine Handover Preparation</h3>
        <p>The Continuity Engine aggregated <b>${h.taskIds.length} open tasks</b> and <b>${h.incidentIds.length} unresolved incidents</b> from Morning Shift into a structured handover package for <b>Evening Shift</b>. Completed tasks (like TK-1004) are excluded automatically.</p>
      </div>
    </div>

    <div class="card mt">
      <div class="sr-ho-preview-header">
        <div>
          <h2>${esc(h.title)}</h2>
          <p class="muted">From: <b>${esc(h.outgoing)}</b> (Morning Shift) ➔ To: <b>${esc(h.incoming)}</b> (Evening Shift)</p>
        </div>
        <div>
          ${badge(h.status)}
        </div>
      </div>

      <div class="sr-ho-meta mt">
        <div class="alert">
          <b>Outgoing Shift Notes:</b> ${esc(h.updates)}
        </div>
        <h4>Attached Open Records for Custody Transfer:</h4>
        <div class="sr-pills-row">
          ${h.taskIds.map(tid => `<span class="badge blue"><i data-lucide="clipboard"></i> Task ${tid}</span>`).join('')}
          ${h.incidentIds.map(iid => `<span class="badge amber"><i data-lucide="alert-triangle"></i> Incident ${iid}</span>`).join('')}
        </div>
      </div>
    </div>

    <div class="sr-step-actions mt">
      <button class="btn" data-act="demo-step" data-step="1">← Back</button>
      <button class="btn primary" data-act="demo-step" data-step="3">
        Next: Simulate Shift Reassignment Conflict ➔
      </button>
    </div>
  </div>`;
}

// Step 3: Conflict Detection Simulation
function renderStep3(d) {
  return `
  <div class="sr-demo-panel">
    <div class="sr-step-callout card">
      <div class="sr-callout-icon"><i data-lucide="shield-alert"></i></div>
      <div>
        <h3>Step 3 of 5: Simulate Real-World Shift Conflict</h3>
        <p>In real operations, shifts are dynamic. Imagine an operator floor tech edits task <b>TK-1002 (Restock pallets)</b> and reassigns its shift to <b>Night Shift</b> <i>after</i> Rahul drafted the handover. When Evening Shift acknowledges the handover, the Continuity Engine must <b>never</b> blindly overwrite this newer assignment.</p>
      </div>
    </div>

    <div class="card mt">
      <h3>Target Item: Task TK-1002</h3>
      <p>Currently assigned shift in database: <b>${d.tasks.find(t => t.id === 'TK-1002')?.shiftId === 'SH-NIGHT' ? '<span class="badge red">Night Shift (Edited!)</span>' : '<span class="badge gray">Morning Shift (Original)</span>'}</b></p>
      
      ${d.conflictSimulated ? `
        <div class="alert hot">
          <strong>⚠️ Conflict Injected:</strong> Task <code>TK-1002</code> was reassigned to <b>Night Shift</b> out-of-band. The handover still lists it from Morning Shift. Watch what happens during acknowledgement in Step 4 & 5!
        </div>
      ` : `
        <button class="btn amber" data-act="demo-sim-conflict">
          <i data-lucide="zap"></i> Simulate Background Reassignment of TK-1002 to Night Shift
        </button>
      `}
    </div>

    <div class="sr-step-actions mt">
      <button class="btn" data-act="demo-step" data-step="2">← Back</button>
      <button class="btn primary" data-act="demo-step" data-step="4">
        Proceed to Incoming Review & Signoff ➔
      </button>
    </div>
  </div>`;
}

// Step 4: Incoming Review & Signoff
function renderStep4(d) {
  const h = d.handover;
  return `
  <div class="sr-demo-panel">
    <div class="sr-step-callout card">
      <div class="sr-callout-icon"><i data-lucide="user-check"></i></div>
      <div>
        <h3>Step 4 of 5: Incoming Shift Mutual Sign-Off</h3>
        <p>You are now acting as <b>Sana Khan (Incoming Shift Supervisor, Evening Shift)</b>. ShiftRelay enforces mutual accountability: custody only shifts once the incoming supervisor confirms review of open tasks, critical incidents, and equipment status.</p>
      </div>
    </div>

    <div class="card mt">
      <h2>Review Handover: ${esc(h?.title || 'Morning to Evening')}</h2>
      <p class="muted">Incoming Supervisor: <b>Sana Khan</b></p>

      <div class="sr-review-checklist mt">
        <label class="row" style="font-weight: 600; cursor: pointer;">
          <input type="checkbox" id="demoReviewCheck" style="width: 20px; height: 20px; min-height: 0;" data-act="demo-toggle-review" ${d.handover?.reviewed ? 'checked' : ''}>
          <span>I have reviewed the attached tasks, incidents, and equipment conditions. I accept operational custody for the Evening Shift.</span>
        </label>
      </div>

      <div class="sr-step-actions mt">
        <button class="btn" data-act="demo-step" data-step="3">← Back</button>
        <button class="btn primary" data-act="demo-ack" ${d.handover?.reviewed ? '' : 'disabled'} id="demoAckBtn">
          <i data-lucide="check-circle-2"></i> Acknowledge Handover & Run Continuity Engine
        </button>
      </div>
    </div>
  </div>`;
}

// Step 5: Continuity Audit & Final Results
function renderStep5(d) {
  const eveTasks = d.tasks.filter(t => t.shiftId === 'SH-EVE');
  const eveIncidents = d.incidents.filter(i => i.shiftId === 'SH-EVE');
  const nightTask = d.tasks.find(t => t.id === 'TK-1002');

  return `
  <div class="sr-demo-panel">
    <div class="sr-step-callout card" style="border-left: 4px solid var(--ok);">
      <div class="sr-callout-icon" style="background: #E6F4EE; color: var(--ok);"><i data-lucide="shield-check"></i></div>
      <div>
        <h3>Step 5 of 5: Continuity Engine Audit Complete</h3>
        <p>The handover has been successfully acknowledged by <b>Sana Khan</b>. Operational custody has transferred to <b>Evening Shift</b>. Notice how data integrity and original history were rigorously preserved.</p>
      </div>
    </div>

    ${d.conflicts && d.conflicts.length ? `
      <div class="alert hot mt">
        <div style="font-weight: 700; display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.3rem;">
          <i data-lucide="shield-alert"></i> Continuity Conflict Resolution
        </div>
        ${d.conflicts.map(c => `<p style="margin: 0.2rem 0;">${esc(c)}</p>`).join('')}
        <small class="muted">Result: TK-1002's assignment to Night Shift was preserved without silent data loss.</small>
      </div>
    ` : ''}

    <div class="grid g2 mt">
      <div class="card">
        <h3>Evening Shift Queue (New Custody)</h3>
        <div class="scroll">
          <table>
            <thead><tr><th>ID</th><th>Task</th><th>Status</th><th>Carry</th><th>Provenance</th></tr></thead>
            <tbody>
              ${eveTasks.map(t => `
                <tr>
                  <td><code>${t.id}</code></td>
                  <td>${esc(t.title)}</td>
                  <td><span class="badge amber">${esc(t.status)}</span></td>
                  <td><b>${t.carry}x</b></td>
                  <td><span class="badge blue">Carried to Evening</span></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <div class="card">
        <h3>Unresolved Incidents Transferred</h3>
        <div class="scroll">
          <table>
            <thead><tr><th>ID</th><th>Incident</th><th>Severity</th><th>Carried</th></tr></thead>
            <tbody>
              ${eveIncidents.map(i => `
                <tr>
                  <td><code>${i.id}</code></td>
                  <td>${esc(i.title)}</td>
                  <td>${badge(i.severity)}</td>
                  <td><span class="badge amber">${i.carry}x carry</span></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div class="card mt">
      <h3>Audit Proof: Task TK-1001 Full History Lineage</h3>
      <p class="muted">Original ID preserved. Unbroken chain of custody recorded:</p>
      <ul class="tl">
        ${(d.tasks.find(t => t.id === 'TK-1001')?.history || []).map(h => `
          <li><b>${esc(h.text)}</b><div class="muted">${esc(h.by)} – ${esc(h.at)}</div></li>
        `).join('')}
      </ul>
    </div>

    <div class="sr-demo-final-cta mt">
      <button class="btn" data-act="demo-reset">
        <i data-lucide="rotate-ccw"></i> Replay Demonstration
      </button>
      <a href="/app/dashboard" data-link class="btn primary">
        <i data-lucide="layout-dashboard"></i> Enter Production Workspace
      </a>
    </div>
  </div>`;
}
