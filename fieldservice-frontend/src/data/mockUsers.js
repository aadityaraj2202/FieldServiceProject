export const userRoleOptions = ['Dispatcher', 'Technician', 'Manager/Admin', 'Customer']

export const userStatusOptions = ['Active', 'Inactive']

export const mockUsers = [
  {
    id: 'USR-4001',
    fullName: 'Alicia Morgan',
    email: 'alicia.morgan@keystone.example',
    role: 'Dispatcher',
    status: 'Active',
    technicianId: '',
    customerId: '',
  },
  {
    id: 'USR-4002',
    fullName: 'Amir Khan',
    email: 'amir.khan@keystone.example',
    role: 'Technician',
    status: 'Active',
    technicianId: 'TEC-3001',
    customerId: '',
  },
  {
    id: 'USR-4003',
    fullName: 'Elena Martin',
    email: 'elena.martin@keystone.example',
    role: 'Technician',
    status: 'Active',
    technicianId: 'TEC-3002',
    customerId: '',
  },
  {
    id: 'USR-4004',
    fullName: 'Priya Shah',
    email: 'priya.shah@keystone.example',
    role: 'Manager/Admin',
    status: 'Active',
    technicianId: '',
    customerId: '',
  },
  {
    id: 'USR-4005',
    fullName: 'Maya Joshi',
    email: 'maya.joshi@northwindfoods.example',
    role: 'Customer',
    status: 'Active',
    technicianId: '',
    customerId: 'CUS-1001',
  },
  {
    id: 'USR-4006',
    fullName: 'Daniel Morris',
    email: 'daniel.morris@harborpoint.example',
    role: 'Customer',
    status: 'Active',
    technicianId: '',
    customerId: 'CUS-1002',
  },
]
