// ShiftRelay Views & Schema-Driven Controllers
import * as D from './store.js';
import { esc, fmt, loc, badge, empty, toast, ask } from './ui.js';
import { landingView } from './landing-view.js';
import { demoView } from './demo-view.js';
import {
  demoPrepareHandover, demoSimulateConflict, demoAcknowledgeHandover,
  resetDemoState, setDemoStep, getDemoState
} from './demo-store.js';

const S = D.get, { find, open, shiftName } = D;

const DEF = {
  tasks: { q: '', status: '', priority: '', sort: 'due' },
  incidents: { q: '', severity: '', status: '' },
  handovers: { q: '', status: '' }
};
export const Q = JSON.parse(JSON.stringify(DEF));

const TS = ['Pending', 'In Progress', 'Completed', 'Blocked', 'Carried Forward'];
const IS = ['Reported', 'Under Investigation', 'In Progress', 'Resolved', 'Closed'];
const HS = ['Draft', 'Submitted', 'Awaiting Acknowledgement', 'Acknowledged'];

const opt = (a, v) => a.map(o => {
  const [x, l] = Array.isArray(o) ? o : [o, o];
  return `<option value="${esc(x)}"${x === v ? ' selected' : ''}>${esc(l)}</option>`;
}).join('');

const link = (h, t) => `<a href="${h}" data-link>${esc(t)}</a>`;
const btn = (h, t, i, c = '') => `<a href="${h}" data-link class="btn ${c}"><i data-lucide="${i}"></i>${t}</a>`;
const tbl = (heads, rows) => `<div class="scroll"><table><thead><tr>${heads.map(h => `<th>${h}</th>`).join('')}</tr></thead><tbody>${rows.join('')}</tbody></table></div>`;
const rank = p => S().config.priorities.indexOf(p);
const nf = w => ({ title: 'Not found', html: empty('search-x', `${w} not found.`, `<p>${link('/app/dashboard', 'Back to dashboard')}</p>`) });
const names = () => S().employees.map(e => e.name);
const refPath = r => ({ TK: 'tasks', IN: 'incidents', HO: 'handovers', SH: 'shifts' }[String(r).slice(0, 2)]);
const msg = (m, ok = 'Done.') => m ? toast(m, 'err') : toast(ok);

// ---------- Dashboard ----------
export function dashboard() {
  const s = S(), st = D.stats(), cur = s.shifts.find(x => x.status === 'Active') || s.shifts[0];
  const stat = (i, l, v, c = '') => `<div class="card stat ${c}"><i data-lucide="${i}"></i><div><b>${v}</b><span>${l}</span></div></div>`;
  const n = st.openTasks.length;

  const pri = s.config.priorities.map(p => {
    const c = st.openTasks.filter(t => t.priority === p).length;
    return `<div class="bar"><span>${esc(p)}</span><div><i class="${esc(p)}" style="width:${n ? (c / n * 100) : 0}%"></i></div><b>${c}</b></div>`;
  }).join('');

  const risks = [
    ...st.critical.map(x => [x, 'Critical incident']),
    ...st.overdue.map(x => [x, 'Overdue']),
    ...st.repeat.map(x => [x, `Carried ${x.carry}x`])
  ];

  const done = s.tasks.filter(t => t.status === 'Completed').slice(0, 4);
  const curItems = cur ? D.unresolved(cur.id) : { tasks: [], incidents: [] };

  return {
    title: 'Operations Dashboard',
    actions: btn('/app/handovers/new', 'Prepare next shift handover', 'arrow-left-right', 'primary'),
    html: `
    <div class="grid g4">
      ${stat('clock', 'Active shifts', st.active)}
      ${stat('arrow-left-right', 'Awaiting sign-off', st.awaiting.length, st.awaiting.length ? 'amber' : '')}
      ${stat('clipboard-list', 'Open tasks', n)}
      ${stat('alert-triangle', 'Critical incidents', st.critical.length, st.critical.length ? 'red' : '')}
      ${stat('corner-up-right', 'Carried forward', st.carried.length, st.carried.length ? 'amber' : '')}
      ${stat('timer', 'Overdue tasks', st.overdue.length, st.overdue.length ? 'red' : '')}
    </div>
    <div class="grid g2 mt">
      <section class="card">
        <h2>Continuity risks (${risks.length})</h2>
        ${risks.length ? `<ul class="tl">${risks.map(([x, l]) => `<li>${link('/app/' + refPath(x.id) + '/' + x.id, x.title)} <span class="badge red">${l}</span></li>`).join('')}</ul>` : empty('shield-check', 'No active continuity risks.')}
      </section>
      <section class="card">
        <h2>Open tasks by priority</h2>
        ${n ? pri : empty('check-circle', 'All tasks are complete.')}
      </section>
    </div>
    <div class="grid g2 mt">
      <section class="card">
        <h2>Current shift</h2>
        ${cur ? `
          <h3>${link('/app/shifts/' + cur.id, cur.name)} ${badge(cur.status)}</h3>
          <p class="muted">${cur.start} to ${cur.end} – ${esc(cur.dept)} – ${cur.staff.map(i => esc(find('employees', i)?.name || '')).join(', ') || 'No staff assigned'}</p>
          <p class="mt" style="font-weight: 500;">
            <i data-lucide="corner-up-right" style="vertical-align: middle; width: 16px; height: 16px;"></i>
            ${curItems.tasks.length} open task(s) and ${curItems.incidents.length} unresolved incident(s) ready to carry forward.
          </p>
        ` : empty('clock', 'No shifts scheduled.')}
      </section>
      <section class="card">
        <h2>Recently completed</h2>
        ${done.length ? `<ul class="tl">${done.map(t => `<li>${link('/app/tasks/' + t.id, t.title)}<div class="muted">Closed in: ${esc(shiftName(t.closedShift || t.shiftId))}</div></li>`).join('')}</ul>` : empty('list-checks', 'No tasks completed yet.')}
      </section>
    </div>
    <section class="card mt">
      <h2>Recent shift activity timeline</h2>
      ${timeline(s.activity.slice(0, 6))}
    </section>`
  };
}

const timeline = a => a.length ? `<ul class="tl">${a.map(x => `<li>${esc(x.text)}${x.ref && refPath(x.ref) ? ` <a href="/app/${refPath(x.ref)}/${x.ref}" data-link>${esc(x.ref)}</a>` : ''}<div class="muted">${esc(x.user)} – ${fmt(x.at)}</div></li>`).join('')}</ul>` : empty('history', 'No activity recorded yet.');

export const activity = () => ({
  title: 'Activity history',
  html: `<section class="card">${timeline(S().activity)}</section>`
});

// ---------- Lists ----------
function taskRows() {
  const q = Q.tasks, s = q.q.toLowerCase();
  const a = S().tasks.filter(t => (!s || (t.title + t.assignee + t.id + t.cat).toLowerCase().includes(s)) && (!q.status || t.status === q.status) && (!q.priority || t.priority === q.priority));
  a.sort({ priority: (x, y) => rank(y.priority) - rank(x.priority), status: (x, y) => TS.indexOf(x.status) - TS.indexOf(y.status) }[q.sort] || ((x, y) => new Date(x.due) - new Date(y.due)));
  if (!a.length) return empty('clipboard-list', 'No tasks match these filters.');
  return tbl(['Task', 'Priority', 'Status', 'Assignee', 'Shift', 'Due', ''], a.map(t => `<tr class="${open(t) && new Date(t.due) < Date.now() ? 'hot' : ''}"><td>${link('/app/tasks/' + t.id, t.title)}<div class="muted"><code>${t.id}</code> – ${esc(t.cat)}${t.carry ? ` – <span class="badge ${t.carry >= 2 ? 'red' : 'amber'}">carried ${t.carry}x</span>` : ''}</div></td><td>${badge(t.priority)}</td><td><select data-act="task-status" data-id="${t.id}" aria-label="Status of ${esc(t.title)}">${opt(TS.filter(x => x !== 'Carried Forward' || t.status === x), t.status)}</select></td><td>${esc(t.assignee)}</td><td>${esc(shiftName(t.shiftId))}</td><td>${fmt(t.due)}</td><td><div class="row">${btn('/app/tasks/' + t.id + '/edit', 'Edit', 'pencil', 'sm')}<button class="btn sm danger" data-act="del-task" data-id="${t.id}">Delete</button></div></td></tr>`));
}

function incRows() {
  const q = Q.incidents, s = q.q.toLowerCase();
  const a = S().incidents.filter(i => (!s || (i.title + i.id + i.dept + i.assignee).toLowerCase().includes(s)) && (!q.severity || i.severity === q.severity) && (!q.status || i.status === q.status)).sort((x, y) => rank(y.severity) - rank(x.severity));
  if (!a.length) return empty('alert-triangle', 'No incidents match these filters.');
  return tbl(['Incident', 'Severity', 'Status', 'Assigned to', 'Shift', 'Reported', ''], a.map(i => `<tr class="${open(i) && i.severity === 'Critical' ? 'hot' : ''}"><td>${link('/app/incidents/' + i.id, i.title)}<div class="muted"><code>${i.id}</code> – ${esc(i.dept)}${i.carry ? ` – <span class="badge ${i.carry >= 2 ? 'red' : 'amber'}">carried ${i.carry}x</span>` : ''}</div></td><td>${badge(i.severity)}</td><td><select data-act="inc-status" data-id="${i.id}" aria-label="Status of ${esc(i.title)}">${opt(IS, i.status)}</select></td><td>${esc(i.assignee)}</td><td>${esc(shiftName(i.shiftId))}</td><td>${fmt(i.at)}</td><td><div class="row">${btn('/app/incidents/' + i.id + '/edit', 'Edit', 'pencil', 'sm')}<button class="btn sm danger" data-act="del-inc" data-id="${i.id}">Delete</button></div></td></tr>`));
}

function hoRows() {
  const q = Q.handovers, s = q.q.toLowerCase();
  const a = S().handovers.filter(h => (!s || (h.title + h.id + h.outgoing + h.incoming).toLowerCase().includes(s)) && (!q.status || h.status === q.status));
  if (!a.length) return empty('arrow-left-right', 'No handovers yet. Prepare one to carry unresolved items into the next shift.', `<p>${btn('/app/handovers/new', 'Prepare handover', 'plus', 'primary')}</p>`);
  return tbl(['Handover', 'Route & Personnel', 'Priority', 'Status', 'Items attached', 'Created'], a.map(h => `<tr><td>${link('/app/handovers/' + h.id, h.title)}<div class="muted"><code>${h.id}</code></div></td><td>${esc(shiftName(h.fromShift))} → ${esc(shiftName(h.toShift))}<div class="muted">${esc(h.outgoing)} to ${esc(h.incoming || 'Team')}</div></td><td>${badge(h.priority)}</td><td>${badge(h.status)}</td><td>${(h.taskIds || []).length} tasks, ${(h.incidentIds || []).length} incidents</td><td>${fmt(h.created)}</td></tr>`));
}

export const lists = { tasks: taskRows, incidents: incRows, handovers: hoRows };
const bar = (m, extra) => `<div class="filters"><input data-q="${m}.q" placeholder="Search" aria-label="Search" value="${esc(Q[m].q)}">${extra}<button class="btn" data-act="reset-q" data-id="${m}">Clear filters</button></div>`;
const sel = (m, k, label, a) => `<select data-q="${m}.${k}" aria-label="${label}"><option value="">${label}</option>${opt(a, Q[m][k])}</select>`;

export const tasks = () => ({
  title: 'Tasks',
  actions: btn('/app/tasks/new', 'New task', 'plus', 'primary'),
  html: bar('tasks', sel('tasks', 'status', 'All statuses', TS) + sel('tasks', 'priority', 'All priorities', S().config.priorities) + `<select data-q="tasks.sort" aria-label="Sort">${opt([['due', 'Sort: due date'], ['priority', 'Sort: priority'], ['status', 'Sort: status']], Q.tasks.sort)}</select>`) + `<div id="list">${taskRows()}</div>`
});

export const incidents = () => ({
  title: 'Incidents',
  actions: btn('/app/incidents/new', 'Report incident', 'plus', 'primary'),
  html: bar('incidents', sel('incidents', 'severity', 'All severities', S().config.priorities) + sel('incidents', 'status', 'All statuses', IS)) + `<div id="list">${incRows()}</div>`
});

export const handovers = () => ({
  title: 'Handovers',
  actions: btn('/app/handovers/new', 'New handover', 'plus', 'primary'),
  html: bar('handovers', sel('handovers', 'status', 'All statuses', HS)) + `<div id="list">${hoRows()}</div>`
});

// ---------- Shifts ----------
export function shifts() {
  const s = S();
  return {
    title: 'Shifts',
    actions: btn('/app/shifts/new', 'New shift', 'plus', 'primary'),
    html: s.shifts.length ? tbl(['Shift', 'Department', 'Time', 'Status', 'Staff', 'Open items', ''], s.shifts.map(x => {
      const u = D.unresolved(x.id);
      return `<tr><td>${link('/app/shifts/' + x.id, x.name)}<div class="muted"><code>${x.id}</code></div></td><td>${esc(x.dept)}</td><td>${x.start} to ${x.end}</td><td>${badge(x.status)}</td><td>${x.staff.map(i => esc(find('employees', i)?.name || '')).join(', ') || '—'}</td><td>${u.tasks.length + u.incidents.length}</td><td><div class="row">${btn('/app/shifts/' + x.id + '/edit', 'Edit', 'pencil', 'sm')}<button class="btn sm danger" data-act="del-shift" data-id="${x.id}">Delete</button></div></td></tr>`;
    })) : empty('clock', 'No shifts configured.', `<p>${btn('/app/shifts/new', 'Create shift', 'plus', 'primary')}</p>`)
  };
}

function shiftDetail(id) {
  const x = find('shifts', id);
  if (!x) return nf('Shift');
  const u = D.unresolved(id);
  const all = S().tasks.filter(t => t.shiftId === id), ai = S().incidents.filter(t => t.shiftId === id);
  return {
    title: x.name,
    crumb: link('/app/shifts', 'Shifts') + ' / ' + x.id,
    actions: btn('/app/shifts/' + id + '/edit', 'Edit', 'pencil') + btn('/app/handovers/new?from=' + id, 'Prepare handover', 'arrow-left-right', 'primary') + `<button class="btn danger" data-act="del-shift" data-id="${id}">Delete shift</button>`,
    html: `
    <div class="card">
      <dl class="kv">
        <div><dt>Status</dt><dd>${badge(x.status)}</dd></div>
        <div><dt>Department</dt><dd>${esc(x.dept)}</dd></div>
        <div><dt>Working Hours</dt><dd>${x.start} to ${x.end}</dd></div>
        <div><dt>Assigned Staff</dt><dd>${x.staff.map(i => esc(find('employees', i)?.name || '')).join(', ') || '—'}</dd></div>
      </dl>
    </div>
    <h2 class="mt">Tasks (${all.length})</h2>
    ${all.length ? tbl(['Task', 'Priority', 'Status'], all.map(t => `<tr><td>${link('/app/tasks/' + t.id, t.title)}</td><td>${badge(t.priority)}</td><td>${badge(t.status)}</td></tr>`)) : empty('clipboard-list', 'No tasks in this shift.')}
    <h2 class="mt">Incidents (${ai.length})</h2>
    ${ai.length ? tbl(['Incident', 'Severity', 'Status'], ai.map(t => `<tr><td>${link('/app/incidents/' + t.id, t.title)}</td><td>${badge(t.severity)}</td><td>${badge(t.status)}</td></tr>`)) : empty('shield-check', 'No incidents in this shift.')}
    <p class="muted mt">${u.tasks.length} task(s) and ${u.incidents.length} incident(s) currently open and eligible for carry-forward.</p>`
  };
}

// ---------- Details ----------
const hl = h => `<ul class="tl">${[...(h || [])].reverse().map(x => `<li>${esc(x.text)}<div class="muted">${esc(x.by)} – ${fmt(x.at)}</div></li>`).join('')}</ul>`;

function detail(kind, id) {
  const r = find(kind, id);
  if (!r) return nf(kind === 'tasks' ? 'Task' : 'Incident');
  const t = kind === 'tasks';
  const kv = (a, b) => `<div><dt>${a}</dt><dd>${b || '—'}</dd></div>`;
  return {
    title: r.title,
    crumb: link('/app/' + kind, t ? 'Tasks' : 'Incidents') + ' / ' + id,
    actions: btn(`/app/${kind}/${id}/edit`, 'Edit', 'pencil') + `<button class="btn danger" data-act="del-${t ? 'task' : 'inc'}" data-id="${id}">Delete ${t ? 'task' : 'incident'}</button>`,
    html: `
    <div class="card">
      <p style="font-size: 1rem; margin-bottom: 1rem;">${esc(r.desc) || '<span class="muted">No detailed description.</span>'}</p>
      <dl class="kv">
        ${kv('Status', badge(r.status))}
        ${kv(t ? 'Priority' : 'Severity', badge(r.priority || r.severity))}
        ${kv('Current Shift', esc(shiftName(r.shiftId)))}
        ${kv('Assigned to', esc(r.assignee))}
        ${t ? kv('Category', esc(r.cat)) + kv('Due Date', fmt(r.due)) : kv('Department', esc(r.dept)) + kv('Reported by', esc(r.reportedBy)) + kv('Reported', fmt(r.at))}
        ${kv('Times carried forward', (r.carry || 0) + 'x')}
        ${r.closedShift ? kv('Closed in shift', esc(shiftName(r.closedShift))) : ''}
        ${t && r.notes ? kv('Notes', esc(r.notes)) : ''}
        ${r.resolution ? kv('Resolution', esc(r.resolution)) : ''}
      </dl>
    </div>
    <h2 class="mt">Traceable History</h2>
    <div class="card">${hl(r.history)}</div>`
  };
}

function handoverDetail(id) {
  const h = find('handovers', id);
  if (!h) return nf('Handover');
  const role = S().role, out = role !== 'Incoming Shift Employee', inc = role !== 'Outgoing Shift Employee';
  const ts = (h.taskIds || []).map(i => find('tasks', i)).filter(Boolean);
  const is = (h.incidentIds || []).map(i => find('incidents', i)).filter(Boolean);
  let act = '';

  if (h.status === 'Draft' && out) {
    act = btn(`/app/handovers/${id}/edit`, 'Edit', 'pencil') + `<button class="btn danger" data-act="del-ho" data-id="${id}">Delete draft</button><button class="btn primary" data-act="advance-ho" data-id="${id}">Submit handover</button>`;
  }
  if (h.status === 'Submitted' && out) {
    act = `<button class="btn primary" data-act="advance-ho" data-id="${id}">Send to incoming shift</button>`;
  }
  if (h.status === 'Awaiting Acknowledgement') {
    act = inc ? `<label class="row" style="font-weight: 600;"><input type="checkbox" id="rev" style="width:auto;min-height:0"> I have reviewed this handover and accept operational custody</label><button class="btn primary" data-act="ack-ho" data-id="${id}">Acknowledge handover</button>` : '<span class="muted">Awaiting incoming shift sign-off.</span>';
  }

  const sec = (l, v) => v ? `<h2 class="mt">${l}</h2><div class="card">${esc(v)}</div>` : '';

  return {
    title: h.title,
    crumb: link('/app/handovers', 'Handovers') + ' / ' + id,
    actions: act,
    html: `
    <div class="card">
      <dl class="kv">
        <div><dt>Status</dt><dd>${badge(h.status)}</dd></div>
        <div><dt>Priority</dt><dd>${badge(h.priority)}</dd></div>
        <div><dt>From Shift</dt><dd>${esc(h.outgoing)} (${esc(shiftName(h.fromShift))})</dd></div>
        <div><dt>To Shift</dt><dd>${esc(h.incoming || 'Team')} (${esc(shiftName(h.toShift))})</dd></div>
        <div><dt>Created</dt><dd>${fmt(h.created)}</dd></div>
        ${h.ackBy ? `<div><dt>Acknowledged by</dt><dd>${esc(h.ackBy)}, ${fmt(h.ackAt)}</dd></div>` : ''}
      </dl>
    </div>
    ${h.conflicts && h.conflicts.length ? `
      <div class="alert hot mt">
        <b>Continuity Engine Conflict Notice:</b>
        <ul>${h.conflicts.map(c => `<li>${esc(c)}</li>`).join('')}</ul>
      </div>
    ` : ''}
    ${sec('Important updates', h.updates)}
    ${sec('Completed work summary', h.completed)}
    ${sec('Additional handover instructions', h.notes)}
    <h2 class="mt">Pending tasks attached (${ts.length})</h2>
    ${ts.length ? tbl(['Task', 'Priority', 'Status', 'Current shift assignment'], ts.map(t => `<tr><td>${link('/app/tasks/' + t.id, t.title)}</td><td>${badge(t.priority)}</td><td>${badge(t.status)}</td><td>${esc(shiftName(t.shiftId))}</td></tr>`)) : empty('check-circle', 'No pending tasks attached.')}
    <h2 class="mt">Unresolved incidents attached (${is.length})</h2>
    ${is.length ? tbl(['Incident', 'Severity', 'Status', 'Current shift assignment'], is.map(t => `<tr><td>${link('/app/incidents/' + t.id, t.title)}</td><td>${badge(t.severity)}</td><td>${badge(t.status)}</td><td>${esc(shiftName(t.shiftId))}</td></tr>`)) : empty('shield-check', 'No unresolved incidents attached.')}`
  };
}

// ---------- Forms (schema driven) ----------
const seg = (s, e) => s < e ? [[s, e]] : [[s, 1440], [0, e]], mins = t => { const [a, b] = t.split(':'); return +a * 60 + +b; };
const overlap = (a, b) => seg(mins(a.start), mins(a.end)).some(([x, y]) => seg(mins(b.start), mins(b.end)).some(([p, q]) => x < q && p < y));
const shiftOpts = () => S().shifts.map(s => [s.id, s.name]), first = a => a[0]?.id || '';

const SC = {
  shifts: {
    one: 'Shift', pre: 'SH', to: () => '/app/shifts',
    f: () => [
      { k: 'name', l: 'Shift name', req: 1, ph: 'e.g. Morning Shift' },
      { k: 'dept', l: 'Department', t: 'select', o: S().config.departments },
      { k: 'start', l: 'Start time', t: 'time', req: 1 },
      { k: 'end', l: 'End time', t: 'time', req: 1 },
      { k: 'status', l: 'Status', t: 'select', o: ['Upcoming', 'Active', 'Ended'] },
      { k: 'staff', l: 'Assigned employees', t: 'multi', o: S().employees.map(e => [e.id, e.name]) }
    ],
    def: () => ({ name: '', dept: S().config.departments[0], start: '06:00', end: '14:00', status: 'Upcoming', staff: [] }),
    chk: (d, r) => {
      const e = {};
      if (d.start === d.end) e.end = 'Start and end time must differ.';
      else {
        const c = S().shifts.find(o => o.id !== r?.id && o.dept === d.dept && overlap(o, d));
        if (c) e.start = `Overlaps ${c.name} in ${d.dept}.`;
      }
      return e;
    }
  },
  tasks: {
    one: 'Task', pre: 'TK', to: () => '/app/tasks',
    f: () => [
      { k: 'title', l: 'Title', req: 1, w: 1, ph: 'What needs to be done?' },
      { k: 'desc', l: 'Description', t: 'textarea', w: 1 },
      { k: 'cat', l: 'Category', t: 'select', o: S().config.categories },
      { k: 'priority', l: 'Priority', t: 'select', o: S().config.priorities },
      { k: 'assignee', l: 'Assigned employee', t: 'select', o: names() },
      { k: 'shiftId', l: 'Related shift', t: 'select', o: shiftOpts() },
      { k: 'due', l: 'Due', t: 'datetime-local', req: 1 },
      { k: 'status', l: 'Status', t: 'select', o: TS },
      { k: 'notes', l: 'Notes', t: 'textarea', w: 1 }
    ],
    def: () => ({ title: '', desc: '', cat: S().config.categories[0], priority: 'Medium', assignee: names()[0], shiftId: first(S().shifts), due: D.iso(8), status: 'Pending', notes: '' }),
    chk: (d, r) => d.status === 'Carried Forward' && r?.status !== 'Carried Forward' ? { status: 'Carry-forward status is managed exclusively by the Continuity Engine.' } : {},
    init: r => { r.history = [{ at: D.now(), by: D.who(), text: 'Created' }]; }
  },
  incidents: {
    one: 'Incident', pre: 'IN', to: () => '/app/incidents',
    f: () => [
      { k: 'title', l: 'Title', req: 1, w: 1 },
      { k: 'desc', l: 'Description', t: 'textarea', req: 1, w: 1 },
      { k: 'category', l: 'Category', t: 'select', o: S().config.incidentCategories },
      { k: 'dept', l: 'Location / department', t: 'select', o: S().config.departments },
      { k: 'severity', l: 'Severity', t: 'select', o: S().config.priorities },
      { k: 'status', l: 'Status', t: 'select', o: IS },
      { k: 'reportedBy', l: 'Reported by', t: 'select', o: names() },
      { k: 'assignee', l: 'Assigned to', t: 'select', o: names() },
      { k: 'shiftId', l: 'Shift', t: 'select', o: shiftOpts() },
      { k: 'at', l: 'Date and time', t: 'datetime-local', req: 1 },
      { k: 'resolution', l: 'Resolution notes (Required to resolve or close)', t: 'textarea', w: 1 }
    ],
    def: () => ({ title: '', desc: '', category: S().config.incidentCategories[0], dept: S().config.departments[0], severity: 'Medium', status: 'Reported', reportedBy: D.who(), assignee: names()[0], shiftId: first(S().shifts), at: D.now(), resolution: '' }),
    chk: d => ['Resolved', 'Closed'].includes(d.status) && !d.resolution?.trim() ? { resolution: 'Resolution notes are mandatory to resolve or close an incident.' } : {},
    init: r => { r.history = [{ at: D.now(), by: D.who(), text: 'Reported' }]; }
  },
  handovers: {
    one: 'Handover', pre: 'HO', to: r => '/app/handovers/' + r.id,
    f: r => [
      { k: 'title', l: 'Handover title', req: 1, w: 1, ph: 'e.g. Morning to Evening handover' },
      ...(r ? [] : [{ k: 'fromShift', l: 'Outgoing shift', t: 'select', o: shiftOpts(), req: 1 }, { k: 'toShift', l: 'Incoming shift', t: 'select', o: shiftOpts(), req: 1 }]),
      { k: 'outgoing', l: 'Outgoing employee', t: 'select', o: names() },
      { k: 'incoming', l: 'Incoming employee', t: 'select', o: names() },
      { k: 'priority', l: 'Priority', t: 'select', o: S().config.priorities },
      { k: 'updates', l: 'Important operational updates', t: 'textarea', w: 1 },
      { k: 'completed', l: 'Completed work summary', t: 'textarea', w: 1 },
      { k: 'notes', l: 'Additional shift instructions', t: 'textarea', w: 1 }
    ],
    def: () => ({ title: '', fromShift: first(S().shifts), toShift: S().shifts[1]?.id || '', outgoing: D.who(), incoming: names()[0], priority: 'Medium', updates: '', completed: '', notes: '' }),
    chk: d => {
      if (d.fromShift && d.toShift && d.fromShift === d.toShift) {
        return { toShift: 'Incoming shift must differ from outgoing shift.' };
      }
      return {};
    },
    create: d => D.prepare(d.fromShift, d.toShift, d)
  }
};

function field(f, v) {
  const val = v[f.k];
  const c = f.t === 'textarea' ? `<textarea name="${f.k}" placeholder="${esc(f.ph)}">${esc(val)}</textarea>` :
    f.t === 'select' ? `<select name="${f.k}">${opt(f.o, val)}</select>` :
      f.t === 'multi' ? `<select name="${f.k}" multiple>${f.o.map(([x, l]) => `<option value="${x}"${(val || []).includes(x) ? ' selected' : ''}>${esc(l)}</option>`).join('')}</select>` :
        `<input name="${f.k}" type="${f.t || 'text'}" placeholder="${esc(f.ph)}" value="${esc(f.t === 'datetime-local' ? loc(val) : val)}">`;
  return `<label class="${f.w ? 'wide' : ''}">${f.l}${f.req ? ' *' : ''}${c}<span class="err" data-err="${f.k}"></span></label>`;
}

function formView(kind, id, qs = {}) {
  const sc = SC[kind], r = id ? find(kind, id) : null;
  if (id && !r) return nf(sc.one);
  if (kind === 'handovers' && r && r.status !== 'Draft') {
    return { title: 'Handover locked', html: `<div class="alert">Only drafts can be edited. This handover is ${esc(r.status)}.</div>${btn('/app/handovers/' + id, 'Back to handover', 'arrow-left')}` };
  }
  const v = { ...sc.def(), ...qs, ...(r || {}) };
  return {
    title: (r ? 'Edit ' : kind === 'incidents' ? 'Report ' : 'New ') + sc.one.toLowerCase(),
    crumb: link('/app/' + kind, sc.one + 's'),
    html: (kind === 'handovers' && !r ? '<div class="alert">Unresolved tasks and incidents from the outgoing shift are attached automatically by the Continuity Engine without duplicating records.</div>' : '') +
      `<form class="f card" data-kind="${kind}" data-id="${id || ''}" novalidate>${sc.f(r).map(f => field(f, v)).join('')}<div class="wide row end"><a class="btn" href="/app/${kind}" data-link>Cancel</a><button class="btn primary">Save ${sc.one.toLowerCase()}</button></div></form>`
  };
}

export function submitForm(form) {
  const { kind, id } = form.dataset, sc = SC[kind], r = id ? find(kind, id) : null, fd = new FormData(form), d = {}, e = {};
  sc.f(r).forEach(f => {
    let v = f.t === 'multi' ? fd.getAll(f.k) : String(fd.get(f.k) ?? '').trim();
    if (f.req && !v.length) e[f.k] = 'This field is required.';
    if (f.t === 'datetime-local' && v) v = new Date(v).toISOString();
    d[f.k] = v;
  });

  if (!Object.keys(e).length) Object.assign(e, sc.chk?.(d, r) || {});
  form.querySelectorAll('[data-err]').forEach(x => x.textContent = e[x.dataset.err] || '');
  if (Object.keys(e).length) {
    toast('Please correct the highlighted fields.', 'err');
    return null;
  }

  let rec = r;
  if (r) {
    const st = d.status, old = r.assignee, wf = kind === 'tasks' || kind === 'incidents';
    if (wf) d.status = r.status;
    Object.assign(r, d);
    D.save();

    if (wf && st !== r.status) {
      const m = D.setStatus(kind, r.id, st, d.resolution);
      if (m) {
        toast(m, 'err');
        return null;
      }
    }
    if (wf && old !== r.assignee) {
      D.hist(r, `Reassigned from ${old} to ${r.assignee}`);
      D.log(`${sc.one} reassigned to ${r.assignee}: ${r.title}`, r.id);
    }
    D.log(`${sc.one} updated: ${r.title || r.name}`, r.id);
  } else if (sc.create) {
    const res = sc.create(d);
    if (res.error) {
      toast(res.error, 'err');
      return null;
    }
    rec = res.handover;
  } else {
    rec = { id: D.uid(sc.pre), ...d, created: D.now(), carry: 0, history: [] };
    sc.init?.(rec);
    S()[kind].push(rec);
    D.save();
    D.log(`${sc.one} ${kind === 'incidents' ? 'reported' : 'created'}: ${rec.title || rec.name}`, rec.id);
  }

  toast(`${sc.one} saved.`);
  return sc.to(rec);
}

// ---------- Search & settings ----------
function search(q) {
  const s = (q.get('q') || '').toLowerCase(), db = S();
  const hit = (c, k, f) => db[c].filter(x => s && JSON.stringify(f(x)).toLowerCase().includes(s)).map(x => `<tr><td>${link('/app/' + c + '/' + x.id, x.title || x.name)}</td><td>${k}</td><td>${badge(x.status)}</td></tr>`);
  const rows = [
    ...hit('tasks', 'Task', x => [x.title, x.desc, x.assignee, x.id]),
    ...hit('incidents', 'Incident', x => [x.title, x.desc, x.id]),
    ...hit('handovers', 'Handover', x => [x.title, x.updates, x.id]),
    ...hit('shifts', 'Shift', x => [x.name, x.id])
  ];
  return {
    title: `Search: ${q.get('q') || ''}`,
    html: rows.length ? tbl(['Result', 'Type', 'Status'], rows) : empty('search', s ? 'No matches found.' : 'Enter a query in the search field above.')
  };
}

const cfgFields = [
  ['departments', 'Departments'],
  ['categories', 'Task categories'],
  ['incidentCategories', 'Incident categories'],
  ['priorities', 'Priority levels (lowest to highest)']
];

export function settings() {
  const s = S();
  const user = s.user || { name: 'Priya Nair', theme: 'light', defaultRoute: '/app/dashboard', toastDuration: 3500 };
  const theme = D.getTheme ? D.getTheme() : (user.theme || 'light');

  return {
    title: 'Workspace Settings',
    html: `
    <form class="f card" data-profile-prefs>
      <h2 class="wide">Simulated Profile &amp; Preferences</h2>
      <p class="muted wide">Configure your local demo identity and display options. These settings are persisted locally in your browser.</p>
      
      <label>
        Demo Display Name
        <input name="displayName" value="${esc(user.name)}" required placeholder="e.g. Priya Nair">
      </label>

      <label>
        Interface Theme
        <select name="theme">
          <option value="light"${theme === 'light' ? ' selected' : ''}>Light Theme (Default)</option>
          <option value="dark"${theme === 'dark' ? ' selected' : ''}>Dark Theme</option>
        </select>
      </label>

      <label>
        Default Workspace Route
        <select name="defaultRoute">
          <option value="/app/dashboard"${user.defaultRoute === '/app/dashboard' ? ' selected' : ''}>Operations Dashboard</option>
          <option value="/app/handovers"${user.defaultRoute === '/app/handovers' ? ' selected' : ''}>Handover Protocols</option>
          <option value="/app/tasks"${user.defaultRoute === '/app/tasks' ? ' selected' : ''}>Task Registry</option>
          <option value="/app/incidents"${user.defaultRoute === '/app/incidents' ? ' selected' : ''}>Incident Anomaly Log</option>
        </select>
      </label>

      <label>
        Notification Duration
        <select name="toastDuration">
          <option value="2500"${user.toastDuration == 2500 ? ' selected' : ''}>Fast (2.5 seconds)</option>
          <option value="3500"${user.toastDuration == 3500 ? ' selected' : ''}>Standard (3.5 seconds)</option>
          <option value="6000"${user.toastDuration == 6000 ? ' selected' : ''}>Extended (6.0 seconds)</option>
        </select>
      </label>

      <div class="wide">
        <button class="btn primary">Save Preferences</button>
      </div>
    </form>

    <div class="card mt">
      <h2>Simulated employee role</h2>
      <p class="muted">Switch roles to test outgoing supervisor, incoming supervisor, and operations manager perspectives.</p>
      <select data-act="set-role" aria-label="Role" style="max-width:320px">${opt(['Operations Manager', 'Outgoing Shift Employee', 'Incoming Shift Employee'], s.role)}</select>
    </div>

    <form class="f card mt" data-settings>
      <h2 class="wide">Operational taxonomy & priorities</h2>
      ${cfgFields.map(([k, l]) => `<label class="wide">${l} (comma separated)<input name="${k}" value="${esc(s.config[k].join(', '))}"></label>`).join('')}
      <div class="wide"><button class="btn primary">Save configuration</button></div>
    </form>

    <div class="card mt">
      <h2>Clean baseline reset</h2>
      <p class="muted">Restores clean sample shifts, tasks, and incidents, and clears test handovers and timeline history.</p>
      <button class="btn danger" data-act="reset-demo">Reset demo baseline data</button>
    </div>`
  };
}

export function saveProfilePrefs(f) {
  const fd = new FormData(f);
  const displayName = String(fd.get('displayName') || '').trim();
  const theme = String(fd.get('theme') || 'light');
  const defaultRoute = String(fd.get('defaultRoute') || '/app/dashboard');
  const toastDuration = Number(fd.get('toastDuration')) || 3500;

  if (D.setUserPreferences) {
    D.setUserPreferences({ displayName, theme, defaultRoute, toastDuration });
  }
  if (D.setTheme) {
    D.setTheme(theme);
  }
  toast('Preferences updated and persisted locally.');
}

export function saveSettings(f) {
  const c = S().config;
  cfgFields.forEach(([k]) => {
    const v = String(new FormData(f).get(k)).split(',').map(x => x.trim()).filter(Boolean);
    if (v.length) c[k] = [...new Set(v)];
  });
  D.save();
  toast('Configuration saved.');
}

// ---------- Actions ----------
export const acts = {
  'task-status': (id, el) => msg(D.setStatus('tasks', id, el.value), 'Task status updated.'),
  'inc-status': async (id, el) => {
    let note = '';
    if (['Resolved', 'Closed'].includes(el.value)) {
      const existing = find('incidents', id)?.resolution || '';
      note = await ask(`Enter resolution notes to mark this incident as ${el.value}:`, true);
      if (!note && !existing) {
        return toast('Resolution notes are strictly required to resolve or close an incident.', 'err');
      }
    }
    msg(D.setStatus('incidents', id, el.value, note), `Incident marked as ${el.value}.`);
  },
  'del-task': async id => {
    if (S().handovers.some(h => h.status !== 'Acknowledged' && (h.taskIds || []).includes(id))) {
      return toast('This task is part of an open handover and cannot be deleted.', 'err');
    }
    if (await ask('Delete this task? This cannot be undone.')) {
      S().tasks = S().tasks.filter(t => t.id !== id);
      D.log('Task deleted: ' + id);
      D.save();
      toast('Task deleted.');
      if (location.pathname.includes('/app/tasks/' + id)) {
        history.pushState({}, '', '/app/tasks');
      }
    }
  },
  'del-inc': async id => {
    if (S().handovers.some(h => h.status !== 'Acknowledged' && (h.incidentIds || []).includes(id))) {
      return toast('This incident is part of an open handover and cannot be deleted.', 'err');
    }
    if (await ask('Delete this incident report? This cannot be undone.')) {
      S().incidents = S().incidents.filter(i => i.id !== id);
      D.log('Incident deleted: ' + id);
      D.save();
      toast('Incident deleted.');
      if (location.pathname.includes('/app/incidents/' + id)) {
        history.pushState({}, '', '/app/incidents');
      }
    }
  },
  'del-shift': async id => {
    if (S().tasks.some(t => t.shiftId === id) || S().incidents.some(i => i.shiftId === id)) {
      return toast('This shift has active tasks or incidents assigned and cannot be deleted.', 'err');
    }
    if (S().handovers.some(h => (h.fromShift === id || h.toShift === id) && h.status !== 'Acknowledged')) {
      return toast('This shift is referenced in an active handover protocol and cannot be deleted.', 'err');
    }
    if (await ask('Delete this shift schedule?')) {
      S().shifts = S().shifts.filter(s => s.id !== id);
      D.log('Shift deleted: ' + id);
      D.save();
      toast('Shift deleted.');
      if (location.pathname.includes('/app/shifts/' + id)) {
        history.pushState({}, '', '/app/shifts');
      }
    }
  },
  'del-ho': async id => {
    if (await ask('Delete this draft handover?')) {
      const h = find('handovers', id);
      if (h?.status !== 'Draft') return toast('Only drafts can be deleted.', 'err');
      S().handovers = S().handovers.filter(x => x.id !== id);
      D.log('Draft handover deleted: ' + id);
      toast('Draft deleted.');
      history.pushState({}, '', '/app/handovers');
    }
  },
  'advance-ho': id => msg(D.advance(id), 'Handover workflow updated.'),
  'ack-ho': id => {
    if (!document.getElementById('rev')?.checked) {
      return toast('Please check the review confirmation before acknowledging.', 'err');
    }
    const res = D.acknowledge(id);
    if (typeof res === 'string') {
      return toast(res, 'err');
    }
    if (res.conflicts && res.conflicts.length) {
      toast(`Handover acknowledged with ${res.conflicts.length} conflict(s) resolved safely.`);
    } else {
      toast('Handover acknowledged. Custody and unresolved items transferred.');
    }
  },
  'reset-q': id => Object.assign(Q[id], DEF[id]),
  'set-role': (id, el) => {
    S().role = el.value;
    D.save();
    toast('Switched view role to ' + el.value);
  },
  'reset-demo': async () => {
    if (await ask('Reset all workspace data to clean baseline?')) {
      D.reset();
      toast('Clean baseline data restored.');
    }
  },

  // Interactive Demo Specific Actions
  'demo-reset': () => {
    resetDemoState();
    toast('Demo sandbox reset to initial state.');
  },
  'demo-step': (id, el) => {
    const s = parseInt(el.dataset.step, 10);
    setDemoStep(s);
  },
  'demo-prep': () => {
    demoPrepareHandover();
    toast('Handover prepared. Unresolved tasks attached.');
  },
  'demo-sim-conflict': () => {
    demoSimulateConflict();
    toast('Conflict simulated: TK-1002 reassigned to Night Shift.', 'amber');
  },
  'demo-toggle-review': (id, el) => {
    const d = getDemoState();
    if (d.handover) d.handover.reviewed = el.checked;
    const btn = document.getElementById('demoAckBtn');
    if (btn) btn.disabled = !el.checked;
  },
  'demo-ack': () => {
    demoAcknowledgeHandover();
    toast('Handover acknowledged! Custody transferred to Evening Shift.');
  }
};

// ---------- Routes Table ----------
export const routes = [
  // Public Landing Page & Demo
  ['/', landingView],
  ['/index.html', landingView],
  ['/home', () => ({ redirect: '/' })],
  ['/demo', demoView],

  // Workspace Routes (/app/...)
  ['/app', () => ({ redirect: '/app/dashboard' })],
  ['/app/dashboard', dashboard],
  ['/workspace', () => ({ redirect: '/app/dashboard' })],
  ['/app/shifts', shifts],
  ['/app/shifts/new', () => formView('shifts')],
  ['/app/shifts/:id/edit', p => formView('shifts', p.id)],
  ['/app/shifts/:id', p => shiftDetail(p.id)],

  ['/app/handovers', handovers],
  ['/app/handovers/new', (p, q) => formView('handovers', null, { ...(q.get('from') && { fromShift: q.get('from') }), ...(q.get('to') && { toShift: q.get('to') }) })],
  ['/app/handovers/:id/edit', p => formView('handovers', p.id)],
  ['/app/handovers/:id', p => handoverDetail(p.id)],

  ['/app/tasks', tasks],
  ['/app/tasks/new', () => formView('tasks')],
  ['/app/tasks/:id/edit', p => formView('tasks', p.id)],
  ['/app/tasks/:id', p => detail('tasks', p.id)],

  ['/app/incidents', incidents],
  ['/app/incidents/new', () => formView('incidents')],
  ['/app/incidents/:id/edit', p => formView('incidents', p.id)],
  ['/app/incidents/:id', p => detail('incidents', p.id)],

  ['/app/activity', activity],
  ['/app/settings', settings],
  ['/app/search', (p, q) => search(q)],

  // Legacy Redirect Mappings (Preserves bookmarks and direct links)
  ['/dashboard', () => ({ redirect: '/app/dashboard' })],
  ['/shifts', () => ({ redirect: '/app/shifts' })],
  ['/shifts/new', () => ({ redirect: '/app/shifts/new' })],
  ['/shifts/:id/edit', p => ({ redirect: `/app/shifts/${p.id}/edit` })],
  ['/shifts/:id', p => ({ redirect: `/app/shifts/${p.id}` })],

  ['/handovers', () => ({ redirect: '/app/handovers' })],
  ['/handovers/new', (p, q) => ({ redirect: `/app/handovers/new${q.toString() ? '?' + q.toString() : ''}` })],
  ['/handovers/:id/edit', p => ({ redirect: `/app/handovers/${p.id}/edit` })],
  ['/handovers/:id', p => ({ redirect: `/app/handovers/${p.id}` })],

  ['/tasks', () => ({ redirect: '/app/tasks' })],
  ['/tasks/new', () => ({ redirect: '/app/tasks/new' })],
  ['/tasks/:id/edit', p => ({ redirect: `/app/tasks/${p.id}/edit` })],
  ['/tasks/:id', p => ({ redirect: `/app/tasks/${p.id}` })],

  ['/incidents', () => ({ redirect: '/app/incidents' })],
  ['/incidents/new', () => ({ redirect: '/app/incidents/new' })],
  ['/incidents/:id/edit', p => ({ redirect: `/app/incidents/${p.id}/edit` })],
  ['/incidents/:id', p => ({ redirect: `/app/incidents/${p.id}` })],

  ['/activity', () => ({ redirect: '/app/activity' })],
  ['/settings', () => ({ redirect: '/app/settings' })],
  ['/search', (p, q) => ({ redirect: `/app/search${q.toString() ? '?' + q.toString() : ''}` })]
];
