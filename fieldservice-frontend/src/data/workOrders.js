export const workOrderStatuses = [
  'New',
  'Assigned',
  'In Progress',
  'On Hold',
  'Completed',
  'Cancelled',
  'Closed',
]

export const priorityOptions = ['Low', 'Medium', 'High', 'Critical']

export const customerOptions = [
  'Northwind Foods',
  'Harbor Point Offices',
  'Cedar Grove Clinic',
  'Lakeview Apartments',
]

export const siteOptions = [
  'Northwind Cold Storage',
  'Harbor Point Tower',
  'Cedar Grove Main Clinic',
  'Lakeview Building C',
]

export const serviceTypeOptions = [
  'Preventive maintenance',
  'Electrical service',
  'HVAC service',
  'Plumbing service',
  'Equipment inspection',
]

export const mockWorkOrders = [
  {
    id: 'WO-1001',
    title: 'Quarterly generator inspection',
    description: 'Inspect the backup generator and record the required preventive maintenance checks.',
    customer: 'Northwind Foods',
    customerId: 'CUS-1001',
    site: 'Northwind Cold Storage',
    siteId: 'SITE-2001',
    serviceType: 'Preventive maintenance',
    priority: 'High',
    status: 'Assigned',
    assignedTechnician: 'Amir Khan',
    assignedTechnicianId: 'TEC-3001',
    scheduledDate: '2026-10-28',
    submittedAt: '2026-10-20T09:00:00',
    history: [
      { status: 'New', changedAt: '2026-10-20T09:15:00', note: 'Work order created' },
      { status: 'Assigned', changedAt: '2026-10-21T11:40:00', note: 'Assigned to Amir Khan' },
    ],
  },
  {
    id: 'WO-1002',
    title: 'Air conditioning fault assessment',
    description: 'Assess intermittent cooling reported for the second-floor office area.',
    customer: 'Harbor Point Offices',
    customerId: 'CUS-1002',
    site: 'Harbor Point Tower',
    siteId: 'SITE-2002',
    serviceType: 'HVAC service',
    priority: 'Critical',
    status: 'In Progress',
    assignedTechnician: 'Elena Martin',
    assignedTechnicianId: 'TEC-3002',
    scheduledDate: '2026-10-24',
    submittedAt: '2026-10-18T14:00:00',
    history: [
      { status: 'New', changedAt: '2026-10-18T14:05:00', note: 'Work order created' },
      { status: 'Assigned', changedAt: '2026-10-18T15:10:00', note: 'Assigned to Elena Martin' },
      { status: 'In Progress', changedAt: '2026-10-22T08:30:00', note: 'Technician started work' },
    ],
  },
  {
    id: 'WO-1003',
    title: 'Medical refrigerator temperature check',
    description: 'Inspect the refrigerator temperature alarm and confirm calibration requirements.',
    customer: 'Cedar Grove Clinic',
    customerId: 'CUS-1003',
    site: 'Cedar Grove Main Clinic',
    siteId: 'SITE-2003',
    serviceType: 'Equipment inspection',
    priority: 'Medium',
    status: 'On Hold',
    assignedTechnician: 'Priya Shah',
    assignedTechnicianId: 'TEC-3003',
    scheduledDate: '2026-10-25',
    submittedAt: '2026-10-19T10:15:00',
    history: [
      { status: 'New', changedAt: '2026-10-19T10:25:00', note: 'Work order created' },
      { status: 'Assigned', changedAt: '2026-10-20T09:00:00', note: 'Assigned to Priya Shah' },
      { status: 'On Hold', changedAt: '2026-10-21T16:20:00', note: 'Awaiting site access confirmation' },
    ],
  },
  {
    id: 'WO-1004',
    title: 'Common-area lighting repair',
    description: 'Replace failed lighting units in the Building C common-area corridor.',
    customer: 'Lakeview Apartments',
    customerId: 'CUS-1004',
    site: 'Lakeview Building C',
    siteId: 'SITE-2004',
    serviceType: 'Electrical service',
    priority: 'Low',
    status: 'Completed',
    assignedTechnician: 'Rohan Mehta',
    assignedTechnicianId: 'TEC-3004',
    scheduledDate: '2026-10-19',
    submittedAt: '2026-10-16T13:30:00',
    history: [
      { status: 'New', changedAt: '2026-10-16T13:45:00', note: 'Work order created' },
      { status: 'Assigned', changedAt: '2026-10-17T08:50:00', note: 'Assigned to Rohan Mehta' },
      { status: 'In Progress', changedAt: '2026-10-19T09:10:00', note: 'Technician started work' },
      { status: 'Completed', changedAt: '2026-10-19T11:35:00', note: 'Repair completed' },
    ],
  },
  {
    id: 'WO-1005',
    title: 'Kitchen sink leak review',
    description: 'Review a reported leak beneath the kitchen sink before assigning a technician.',
    customer: 'Harbor Point Offices',
    customerId: 'CUS-1002',
    site: 'Harbor Point Tower',
    siteId: 'SITE-2002',
    serviceType: 'Plumbing service',
    priority: 'Medium',
    status: 'New',
    assignedTechnician: '',
    assignedTechnicianId: '',
    scheduledDate: '2026-10-30',
    submittedAt: '2026-10-22T10:10:00',
    history: [
      { status: 'New', changedAt: '2026-10-22T10:20:00', note: 'Work order created' },
    ],
  },
  {
    id: 'WO-1006',
    title: 'Lift control-panel check',
    description: 'Review the reported control-panel error and determine the next service action.',
    customer: 'Lakeview Apartments',
    customerId: 'CUS-1004',
    site: 'Lakeview Building C',
    siteId: 'SITE-2004',
    serviceType: 'Equipment inspection',
    priority: 'High',
    status: 'Cancelled',
    assignedTechnician: '',
    assignedTechnicianId: '',
    scheduledDate: '2026-10-21',
    submittedAt: '2026-10-17T09:30:00',
    history: [
      { status: 'New', changedAt: '2026-10-17T09:45:00', note: 'Work order created' },
      { status: 'Cancelled', changedAt: '2026-10-18T12:15:00', note: 'Request withdrawn by customer' },
    ],
  },
]

export function formatWorkOrderDate(dateValue) {
  if (!dateValue) {
    return 'Not scheduled'
  }

  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(`${dateValue}T12:00:00`))
}

export function formatHistoryDate(dateValue) {
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateValue))
}

export function getStatusClassName(status) {
  return status.toLowerCase().replaceAll(' ', '-')
}

export function getAllowedStatusTransitions(status) {
  const transitionsByStatus = {
    New: ['Assigned', 'Cancelled'],
    Assigned: ['In Progress', 'On Hold', 'Cancelled'],
    'In Progress': ['On Hold', 'Completed', 'Cancelled'],
    'On Hold': ['In Progress', 'Completed', 'Cancelled'],
    Completed: ['Closed'],
    Cancelled: [],
    Closed: [],
  }

  return transitionsByStatus[status] ?? []
}

export function getAssignedTechnicianName(workOrder, technicians) {
  const technician = technicians.find((item) => item.id === workOrder.assignedTechnicianId)
  return technician?.fullName ?? workOrder.assignedTechnician ?? 'Unassigned'
}
