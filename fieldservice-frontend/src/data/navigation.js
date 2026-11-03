import {
  BarChart3,
  ClipboardList,
  LayoutDashboard,
  MapPin,
  MonitorSmartphone,
  Users,
  Wrench,
} from 'lucide-react'

export const navigationItems = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Work Orders', path: '/work-orders', icon: ClipboardList },
  { label: 'Customers', path: '/customers', icon: Users },
  { label: 'Sites', path: '/sites', icon: MapPin },
  { label: 'Field Workflow', path: '/technicians/field-workflow', icon: Wrench },
  { label: 'Technicians', path: '/technicians', icon: Wrench },
  { label: 'Reports', path: '/reports', icon: BarChart3 },
  { label: 'Customer Portal', path: '/portal', icon: MonitorSmartphone },
]
