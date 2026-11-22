// ShiftRelay State, Persistence & Continuity Engine
// High-reliability store with schema validation, migration & conflict-safe handover transitions.

const PRIMARY_KEY = 'shiftrelay.v1';
const LEGACY_KEY = 'handoverhq.v1';

export const uid = p => p + '-' + Math.random().toString(36).slice(2, 7).toUpperCase();
export const now = () => new Date().toISOString();
export const iso = h => new Date(Date.now() + h * 36e5).toISOString();

const t = (id, title, cat, priority, assignee, shiftId, due, status, extra = {}) => ({
  id, title, desc: '', cat, priority, assignee, shiftId, due, status, notes: '',
  created: iso(-9), carry: 0, history: [{ at: iso(-9), by: 'System', text: 'Created' }], ...extra
});

const inc = (id, title, desc, category, dept, severity, assignee, shiftId, status, extra = {}) => ({
  id, title, desc, category, dept, severity, reportedBy: 'Rahul Mehta', assignee, shiftId, status,
  resolution: '', at: iso(-6), carry: 0, history: [{ at: iso(-6), by: 'Rahul Mehta', text: 'Reported' }], ...extra
});

export function seed() {
  return {
    role: 'Operations Manager',
    user: {
      name: 'Priya Nair',
      theme: 'light',
      defaultRoute: '/app/dashboard',
      toastDuration: 3500
    },
    config: {
      departments: ['Warehouse', 'Maintenance', 'Front Desk', 'Security'],
      categories: ['Maintenance', 'Inventory', 'Safety', 'Dispatch', 'Admin'],
      incidentCategories: ['Equipment', 'Safety', 'Security', 'Quality'],
      priorities: ['Low', 'Medium', 'High', 'Critical']
    },
    employees: [
      { id: 'E1', name: 'Priya Nair', role: 'Operations Manager' },
      { id: 'E2', name: 'Rahul Mehta', role: 'Outgoing Shift Employee' },
      { id: 'E3', name: 'Sana Khan', role: 'Incoming Shift Employee' },
      { id: 'E4', name: 'Arjun Patel', role: 'Staff' },
      { id: 'E5', name: 'Meera Iyer', role: 'Staff' }
    ],
    shifts: [
      { id: 'SH-MORN', name: 'Morning Shift', dept: 'Warehouse', start: '06:00', end: '14:00', status: 'Active', staff: ['E2', 'E4'] },
      { id: 'SH-EVE', name: 'Evening Shift', dept: 'Warehouse', start: '14:00', end: '22:00', status: 'Upcoming', staff: ['E3', 'E5'] },
      { id: 'SH-NIGHT', name: 'Night Shift', dept: 'Warehouse', start: '22:00', end: '06:00', status: 'Upcoming', staff: ['E4'] }
    ],
    tasks: [
      t('TK-1001', 'Inspect damaged conveyor belt in Warehouse Zone B', 'Maintenance', 'High', 'Rahul Mehta', 'SH-MORN', iso(2), 'In Progress', { desc: 'Belt 3 is fraying near the drive roller.' }),
      t('TK-1002', 'Restock Zone A pallets', 'Inventory', 'Medium', 'Arjun Patel', 'SH-MORN', iso(3), 'Pending'),
      t('TK-1003', 'Calibrate forklift scanner', 'Maintenance', 'High', 'Arjun Patel', 'SH-MORN', iso(-3), 'Blocked', { carry: 2, notes: 'Waiting on vendor part.' }),
      t('TK-1004', 'Morning dock inspection', 'Safety', 'Low', 'Rahul Mehta', 'SH-MORN', iso(-5), 'Completed', { closedShift: 'SH-MORN' }),
      t('TK-1005', 'Prepare dispatch manifest', 'Dispatch', 'Medium', 'Sana Khan', 'SH-EVE', iso(7), 'Pending'),
      t('TK-1006', 'Night security walk-through', 'Safety', 'Low', 'Arjun Patel', 'SH-NIGHT', iso(12), 'Pending')
    ],
    incidents: [
      inc('IN-2001', 'Fire exit blocked by pallets', 'Pallets stacked in front of the Zone C fire exit.', 'Safety', 'Warehouse', 'Critical', 'Priya Nair', 'SH-MORN', 'Reported'),
      inc('IN-2002', 'Forklift hydraulic leak', 'Slow leak under forklift F-2.', 'Equipment', 'Maintenance', 'High', 'Arjun Patel', 'SH-MORN', 'Under Investigation'),
      inc('IN-2003', 'Minor spill at loading bay', 'Cleaned and signed off.', 'Safety', 'Warehouse', 'Low', 'Rahul Mehta', 'SH-MORN', 'Resolved', { resolution: 'Absorbent applied, area dried.', closedShift: 'SH-MORN' })
    ],
    handovers: [],
    activity: [
      { id: 'AC-0', at: now(), text: 'System initialized with clean shift baseline', ref: '', user: 'System' }
    ]
  };
}

let S = load();

// Load with migration and validation
function load() {
  const seedData = seed();
  let raw = null;
  let usedKey = PRIMARY_KEY;

  try {
    if (typeof localStorage !== 'undefined') {
      raw = localStorage.getItem(PRIMARY_KEY);
      if (!raw) {
        raw = localStorage.getItem(LEGACY_KEY);
        if (raw) {
          usedKey = LEGACY_KEY;
        }
      }
    }
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        const validated = {
          role: parsed.role || seedData.role,
          user: {
            name: typeof parsed.user?.name === 'string' && parsed.user.name.trim() ? parsed.user.name.trim() : 'Priya Nair',
            theme: parsed.user?.theme === 'dark' ? 'dark' : 'light',
            defaultRoute: parsed.user?.defaultRoute || '/app/dashboard',
            toastDuration: Number(parsed.user?.toastDuration) || 3500
          },
          config: {
            departments: Array.isArray(parsed.config?.departments) ? parsed.config.departments : seedData.config.departments,
            categories: Array.isArray(parsed.config?.categories) ? parsed.config.categories : seedData.config.categories,
            incidentCategories: Array.isArray(parsed.config?.incidentCategories) ? parsed.config.incidentCategories : seedData.config.incidentCategories,
            priorities: Array.isArray(parsed.config?.priorities) ? parsed.config.priorities : seedData.config.priorities
          },
          employees: Array.isArray(parsed.employees) && parsed.employees.length ? parsed.employees : seedData.employees,
          shifts: Array.isArray(parsed.shifts) ? parsed.shifts : seedData.shifts,
          tasks: Array.isArray(parsed.tasks) ? parsed.tasks : seedData.tasks,
          incidents: Array.isArray(parsed.incidents) ? parsed.incidents : seedData.incidents,
          handovers: Array.isArray(parsed.handovers) ? parsed.handovers : seedData.handovers,
          activity: Array.isArray(parsed.activity) ? parsed.activity : seedData.activity
        };

        // If loaded from legacy key, write to primary key seamlessly
        if (usedKey === LEGACY_KEY && typeof localStorage !== 'undefined') {
          try {
            localStorage.setItem(PRIMARY_KEY, JSON.stringify(validated));
          } catch {}
        }

        return validated;
      }
    }
  } catch (err) {
    console.warn('ShiftRelay: LocalStorage data corrupted or unreadable. Restoring clean state.', err);
  }
  return seedData;
}

export const get = () => S;

// Safe save with error catching
export const save = () => {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(PRIMARY_KEY, JSON.stringify(S));
    }
    return { ok: true };
  } catch (err) {
    console.error('ShiftRelay Persistence Error:', err);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('sr-save-error', { detail: err.message }));
    }
    return { ok: false, error: 'Storage quota exceeded or storage unavailable.' };
  }
};

export const reset = () => {
  S = seed();
  save();
  return S;
};

export const find = (collection, id) => S[collection]?.find(x => x.id === id);
export const who = () => S.employees.find(e => e.role === S.role)?.name || 'System';
export const shiftName = id => find('shifts', id)?.name || '—';
export const open = x => x && !['Completed', 'Resolved', 'Closed'].includes(x.status);

export function log(text, ref = '') {
  S.activity.unshift({ id: uid('AC'), at: now(), text, ref, user: who() });
  save();
}

export function hist(record, text) {
  record.history = record.history || [];
  record.history.push({ at: now(), by: who(), text });
  save();
}

// Fixed Dashboard statistics
export function stats() {
  const d = Date.now();
  const openTasks = S.tasks.filter(open);
  const openIncidents = S.incidents.filter(open);

  // Both open tasks AND open incidents that have been carried forward
  const carriedTasks = openTasks.filter(x => x.status === 'Carried Forward' || (x.carry || 0) > 0);
  const carriedIncidents = openIncidents.filter(x => (x.carry || 0) > 0);
  const carriedAll = [...carriedTasks, ...carriedIncidents];

  // Repeat risks: open items carried forward 2 or more times
  const repeatRisks = [...openTasks, ...openIncidents].filter(x => (x.carry || 0) >= 2);

  return {
    active: S.shifts.filter(x => x.status === 'Active').length,
    awaiting: S.handovers.filter(h => h.status === 'Awaiting Acknowledgement'),
    openTasks,
    openIncidents,
    critical: openIncidents.filter(x => x.severity === 'Critical'),
    overdue: openTasks.filter(x => new Date(x.due) < d),
    carried: carriedAll,
    repeat: repeatRisks
  };
}

// ---------- Continuity Engine ----------
export const unresolved = sid => ({
  tasks: S.tasks.filter(x => x.shiftId === sid && open(x)),
  incidents: S.incidents.filter(x => x.shiftId === sid && open(x))
});

export function prepare(from, to, extra = {}) {
  if (!from || !to) return { error: 'Both outgoing and incoming shifts are required.' };
  if (from === to) return { error: 'Incoming shift must differ from outgoing shift.' };

  const sf = find('shifts', from);
  const st = find('shifts', to);
  if (!sf || !st) return { error: 'Both outgoing and incoming shifts must be valid existing shifts.' };

  const dup = S.handovers.find(h => h.fromShift === from && h.toShift === to && h.status !== 'Acknowledged');
  if (dup) return { error: `An open handover (${dup.id}) already exists for this shift pair.`, handover: dup };

  const locked = new Set(
    S.handovers.filter(h => h.status !== 'Acknowledged').flatMap(h => [...(h.taskIds || []), ...(h.incidentIds || [])])
  );

  const u = unresolved(from);
  const incomingEmployee = S.employees.find(e => st.staff && st.staff.includes(e.id))?.name || '';

  const h = {
    id: uid('HO'),
    title: `${sf.name} to ${st.name}`,
    outgoing: who(),
    incoming: incomingEmployee,
    priority: 'Medium',
    updates: '',
    completed: '',
    notes: '',
    ...extra,
    fromShift: from,
    toShift: to,
    taskIds: u.tasks.filter(r => !locked.has(r.id)).map(r => r.id),
    incidentIds: u.incidents.filter(r => !locked.has(r.id)).map(r => r.id),
    status: 'Draft',
    created: now()
  };

  S.handovers.unshift(h);
  log(`Handover drafted: ${h.title} (${h.taskIds.length} tasks, ${h.incidentIds.length} incidents)`, h.id);
  save();
  return { handover: h };
}

const FLOW = { Draft: 'Submitted', Submitted: 'Awaiting Acknowledgement' };

export function advance(id) {
  const h = find('handovers', id);
  if (!h) return 'Handover not found.';
  const next = FLOW[h.status];
  if (!next) return `A handover that is ${h.status} cannot be advanced.`;

  h.status = next;
  log(`Handover ${next === 'Submitted' ? 'submitted' : 'sent for acknowledgement'}: ${h.title}`, h.id);
  save();
  return '';
}

export function acknowledge(id) {
  const h = find('handovers', id);
  if (!h || h.status !== 'Awaiting Acknowledgement') {
    return 'Only handovers awaiting acknowledgement can be acknowledged.';
  }

  const targetShift = find('shifts', h.toShift);
  if (!targetShift) return 'Incoming target shift no longer exists.';

  const sourceShift = find('shifts', h.fromShift);
  const fromName = sourceShift ? sourceShift.name : 'Previous Shift';
  const toName = targetShift.name;

  const conflicts = [];
  let carriedCount = 0;

  // Process tasks with conflict handling
  (h.taskIds || []).forEach(tid => {
    const task = find('tasks', tid);
    if (!task) {
      conflicts.push(`Task ${tid} was deleted before acknowledgement.`);
      return;
    }
    if (!open(task)) {
      conflicts.push(`Task ${task.id} (${task.title}) was already completed and was not carried forward.`);
      return;
    }
    // Check if task's shift was modified away from h.fromShift after the handover was drafted!
    if (task.shiftId !== h.fromShift) {
      conflicts.push(`Task ${task.id} (${task.title}) was reassigned to ${shiftName(task.shiftId)} after this handover was drafted. Its new assignment was preserved.`);
      return;
    }

    // Safe transfer
    task.shiftId = h.toShift;
    task.status = 'Carried Forward';
    task.carry = (task.carry || 0) + 1;
    hist(task, `Carried forward from ${fromName} to ${toName} via handover ${h.id}`);
    log(`Task carried forward: ${task.title}`, task.id);
    carriedCount++;
  });

  // Process incidents with conflict handling
  (h.incidentIds || []).forEach(iid => {
    const incident = find('incidents', iid);
    if (!incident) {
      conflicts.push(`Incident ${iid} was deleted before acknowledgement.`);
      return;
    }
    if (!open(incident)) {
      conflicts.push(`Incident ${incident.id} (${incident.title}) was already resolved and was not carried forward.`);
      return;
    }
    if (incident.shiftId !== h.fromShift) {
      conflicts.push(`Incident ${incident.id} (${incident.title}) was reassigned to ${shiftName(incident.shiftId)} after this handover was drafted. Its new assignment was preserved.`);
      return;
    }

    incident.shiftId = h.toShift;
    incident.carry = (incident.carry || 0) + 1;
    hist(incident, `Carried forward from ${fromName} to ${toName} via handover ${h.id}`);
    log(`Incident carried forward: ${incident.title}`, incident.id);
    carriedCount++;
  });

  h.status = 'Acknowledged';
  h.ackBy = who();
  h.ackAt = now();
  if (conflicts.length) {
    h.conflicts = conflicts;
    log(`Handover acknowledged with ${conflicts.length} conflict(s) noted: ${h.title}`, h.id);
  } else {
    log(`Handover acknowledged: ${h.title} (${carriedCount} items carried forward)`, h.id);
  }

  save();
  return { ok: true, conflicts };
}

// Strict status transition validation and closedShift handling
const ALLOWED_TASK_STATUSES = ['Pending', 'In Progress', 'Completed', 'Blocked', 'Carried Forward'];
const ALLOWED_INC_STATUSES = ['Reported', 'Under Investigation', 'In Progress', 'Resolved', 'Closed'];

export function setStatus(collection, id, val, note) {
  const r = find(collection, id);
  if (!r) return 'Record not found.';
  if (r.status === val) return '';

  const isTask = collection === 'tasks';
  const allowed = isTask ? ALLOWED_TASK_STATUSES : ALLOWED_INC_STATUSES;
  if (!allowed.includes(val)) return `Invalid status: ${val}`;

  // Tasks cannot be manually marked as Carried Forward
  if (isTask && val === 'Carried Forward') {
    return 'Carry-forward status is managed exclusively by the Continuity Engine during handover acknowledgement.';
  }

  // Incidents require non-empty resolution notes when resolving or closing
  if (!isTask && ['Resolved', 'Closed'].includes(val)) {
    const cleanNote = (note || r.resolution || '').trim();
    if (!cleanNote) {
      return 'Resolution notes are required to resolve or close an incident.';
    }
    r.resolution = cleanNote;
  }

  const prevStatus = r.status;
  const currentShiftName = shiftName(r.shiftId);

  // Preserve status history
  hist(r, `Status changed from ${prevStatus} to ${val} during ${currentShiftName}`);
  r.status = val;

  const k = isTask ? 'Task' : 'Incident';

  if (!open(r)) {
    // Record closed shift for traceability
    r.closedShift = r.shiftId;
    if (isTask) {
      log(`Task completed in ${currentShiftName}: ${r.title}`, r.id);
    } else {
      if (val === 'Resolved') {
        log(`Incident resolved in ${currentShiftName}: ${r.title}`, r.id);
      } else {
        log(`Incident closed in ${currentShiftName}: ${r.title}`, r.id);
      }
    }
  } else {
    // Reopening an item must clear previous closedShift
    if (r.closedShift) {
      delete r.closedShift;
    }
    log(`${k} status updated to ${val}: ${r.title}`, r.id);
  }

  save();
  return '';
}

export function setRole(newRole) {
  S.role = newRole;
  const match = S.employees.find(e => e.role === newRole);
  if (match) {
    if (!S.user) S.user = { name: match.name, theme: 'light', defaultRoute: '/app/dashboard', toastDuration: 3500 };
    S.user.name = match.name;
  }
  log(`Role switched to ${newRole} (Simulated Profile)`, 'ROLE');
  save();
  return S.role;
}

export function setUserPreferences(prefs) {
  if (!S.user) S.user = { name: 'Priya Nair', theme: 'light', defaultRoute: '/app/dashboard', toastDuration: 3500 };
  if (typeof prefs.displayName === 'string' && prefs.displayName.trim()) S.user.name = prefs.displayName.trim();
  if (prefs.theme) S.user.theme = prefs.theme;
  if (prefs.defaultRoute) S.user.defaultRoute = prefs.defaultRoute;
  if (prefs.toastDuration) S.user.toastDuration = Number(prefs.toastDuration) || 3500;
  save();
  return S.user;
}

export function getTheme() {
  if (typeof localStorage !== 'undefined') {
    const stored = localStorage.getItem('shiftrelay.theme');
    if (stored === 'light' || stored === 'dark') return stored;
  }
  return S.user?.theme || 'light';
}

export function setTheme(theme) {
  const chosen = theme === 'dark' ? 'dark' : 'light';
  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem('shiftrelay.theme', chosen);
    } catch {}
  }
  if (!S.user) S.user = { name: 'Priya Nair', theme: 'light', defaultRoute: '/app/dashboard', toastDuration: 3500 };
  S.user.theme = chosen;
  save();
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-theme', chosen);
    document.body.setAttribute('data-theme', chosen);
  }
  return chosen;
}

