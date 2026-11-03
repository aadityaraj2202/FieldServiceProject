import { getStatusClassName } from '../../data/workOrders.js'

export function StatusBadge({ status }) {
  return <span className={`status-badge status-${getStatusClassName(status)}`}>{status}</span>
}

export function PriorityBadge({ priority }) {
  return <span className={`priority-badge priority-${priority.toLowerCase()}`}>{priority}</span>
}
