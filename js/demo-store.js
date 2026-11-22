// ShiftRelay Interactive Demonstration Store (In-Memory Only)
// Completely isolated from LocalStorage. Interacting here NEVER touches production data.

export function createDemoState() {
  return {
    step: 1, // 1 to 5
    conflictSimulated: false,
    acknowledged: false,
    shifts: [
      { id: 'SH-MORN', name: 'Morning Shift', dept: 'Warehouse Ops', start: '06:00', end: '14:00', status: 'Active', supervisor: 'Rahul Mehta' },
      { id: 'SH-EVE', name: 'Evening Shift', dept: 'Warehouse Ops', start: '14:00', end: '22:00', status: 'Upcoming', supervisor: 'Sana Khan' },
      { id: 'SH-NIGHT', name: 'Night Shift', dept: 'Warehouse Ops', start: '22:00', end: '06:00', status: 'Upcoming', supervisor: 'Arjun Patel' }
    ],
    tasks: [
      {
        id: 'TK-1001',
        title: 'Inspect damaged conveyor belt in Zone B',
        cat: 'Maintenance',
        priority: 'High',
        assignee: 'Rahul Mehta',
        shiftId: 'SH-MORN',
        due: '15:30',
        status: 'In Progress',
        carry: 0,
        history: [{ at: '07:15', by: 'Rahul Mehta', text: 'Created in Morning Shift' }]
      },
      {
        id: 'TK-1002',
        title: 'Restock Zone A heavy pallets',
        cat: 'Inventory',
        priority: 'Medium',
        assignee: 'Arjun Patel',
        shiftId: 'SH-MORN',
        due: '17:00',
        status: 'Pending',
        carry: 0,
        history: [{ at: '08:30', by: 'Arjun Patel', text: 'Created in Morning Shift' }]
      },
      {
        id: 'TK-1003',
        title: 'Calibrate forklift laser scanner',
        cat: 'Maintenance',
        priority: 'High',
        assignee: 'Arjun Patel',
        shiftId: 'SH-MORN',
        due: '12:00',
        status: 'Blocked',
        carry: 2, // Repeat risk!
        notes: 'Awaiting specialized calibration probe.',
        history: [
          { at: 'Yesterday', by: 'Rahul Mehta', text: 'Carried forward from Night to Morning' },
          { at: 'Today 06:00', by: 'Rahul Mehta', text: 'Carried forward from Morning (2nd carry)' }
        ]
      },
      {
        id: 'TK-1004',
        title: 'Morning dock sweep and signoff',
        cat: 'Safety',
        priority: 'Low',
        assignee: 'Rahul Mehta',
        shiftId: 'SH-MORN',
        due: '10:00',
        status: 'Completed',
        carry: 0,
        closedShift: 'SH-MORN',
        history: [{ at: '09:45', by: 'Rahul Mehta', text: 'Completed and signed off in Morning Shift' }]
      }
    ],
    incidents: [
      {
        id: 'IN-2001',
        title: 'Emergency fire exit blocked by excess pallets',
        dept: 'Warehouse Ops',
        severity: 'Critical',
        reportedBy: 'Priya Nair',
        assignee: 'Rahul Mehta',
        shiftId: 'SH-MORN',
        status: 'Reported',
        carry: 0,
        history: [{ at: '11:20', by: 'Priya Nair', text: 'Reported Critical safety hazard' }]
      },
      {
        id: 'IN-2002',
        title: 'Hydraulic leak detected under Forklift F-2',
        dept: 'Warehouse Ops',
        severity: 'High',
        reportedBy: 'Arjun Patel',
        assignee: 'Rahul Mehta',
        shiftId: 'SH-MORN',
        status: 'Under Investigation',
        carry: 1,
        history: [{ at: '08:10', by: 'Arjun Patel', text: 'Reported hydraulic leak' }]
      }
    ],
    handover: null,
    conflicts: [],
    logs: [
      { at: '13:45', text: 'Morning Shift nearing conclusion. Handover preparation recommended.' }
    ]
  };
}

let demoState = createDemoState();

export const getDemoState = () => demoState;

export function resetDemoState() {
  demoState = createDemoState();
  return demoState;
}

export function setDemoStep(n) {
  demoState.step = Math.max(1, Math.min(5, n));
}

// Prepare handover in demo
export function demoPrepareHandover() {
  // Gathers unresolved items of Morning Shift
  const openTasks = demoState.tasks.filter(t => t.shiftId === 'SH-MORN' && t.status !== 'Completed');
  const openIncidents = demoState.incidents.filter(i => i.shiftId === 'SH-MORN' && !['Resolved', 'Closed'].includes(i.status));

  demoState.handover = {
    id: 'HO-DEMO-01',
    title: 'Morning Shift to Evening Shift Handover',
    fromShift: 'SH-MORN',
    toShift: 'SH-EVE',
    outgoing: 'Rahul Mehta',
    incoming: 'Sana Khan',
    priority: 'High',
    updates: 'Zone B conveyor belt is partially operational. Forklift F-2 leak requires immediate contractor service.',
    completed: 'Dock sweep completed; morning manifest submitted.',
    taskIds: openTasks.map(t => t.id),
    incidentIds: openIncidents.map(i => i.id),
    status: 'Awaiting Acknowledgement',
    created: '13:50',
    reviewed: false
  };

  demoState.logs.unshift({
    at: '13:50',
    text: `Handover HO-DEMO-01 prepared with ${demoState.handover.taskIds.length} tasks and ${demoState.handover.incidentIds.length} incidents.`
  });

  demoState.step = 2;
}

// Simulate conflict: Reassign TK-1002 to Night Shift in the background while handover is pending!
export function demoSimulateConflict() {
  const task = demoState.tasks.find(t => t.id === 'TK-1002');
  if (task) {
    task.shiftId = 'SH-NIGHT';
    task.history.push({
      at: '13:55',
      by: 'Arjun Patel (Lead Tech)',
      text: 'Reassigned directly to Night Shift for specialized overnight staging.'
    });
    demoState.conflictSimulated = true;
    demoState.logs.unshift({
      at: '13:55',
      text: '🚨 Out-of-band edit: Task TK-1002 reassigned to Night Shift after handover was drafted!'
    });
  }
}

// Acknowledge handover in demo with Continuity Engine logic
export function demoAcknowledgeHandover() {
  if (!demoState.handover) return;
  const h = demoState.handover;
  const conflicts = [];

  // Tasks transfer
  h.taskIds.forEach(tid => {
    const task = demoState.tasks.find(t => t.id === tid);
    if (!task) return;
    if (task.shiftId !== h.fromShift) {
      conflicts.push(`Task ${task.id} (${task.title}) was reassigned to ${task.shiftId === 'SH-NIGHT' ? 'Night Shift' : task.shiftId} after handover creation. Continuity Engine preserved newer assignment.`);
      return;
    }
    task.shiftId = h.toShift;
    task.status = 'Carried Forward';
    task.carry = (task.carry || 0) + 1;
    task.history.push({
      at: '14:00',
      by: 'Sana Khan',
      text: `Carried forward from Morning Shift to Evening Shift via ${h.id}`
    });
  });

  // Incidents transfer
  h.incidentIds.forEach(iid => {
    const inc = demoState.incidents.find(i => i.id === iid);
    if (!inc) return;
    inc.shiftId = h.toShift;
    inc.carry = (inc.carry || 0) + 1;
    inc.history.push({
      at: '14:00',
      by: 'Sana Khan',
      text: `Carried forward from Morning Shift to Evening Shift via ${h.id}`
    });
  });

  h.status = 'Acknowledged';
  h.ackBy = 'Sana Khan (Incoming Shift Supervisor)';
  h.ackAt = '14:00';
  demoState.conflicts = conflicts;
  demoState.acknowledged = true;
  demoState.step = 5;

  demoState.logs.unshift({
    at: '14:00',
    text: `Handover HO-DEMO-01 acknowledged. Unresolved items transferred to Evening Shift with intact IDs.`
  });
}
