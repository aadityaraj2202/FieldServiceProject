import { Eye, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useOutletContext } from 'react-router-dom'
import { useDirectoryData } from '../../data/useDirectoryData.js'
import { formatWorkOrderDate, priorityOptions } from '../../data/workOrders.js'
import { PriorityBadge, StatusBadge } from '../work-orders/WorkOrderBadges.jsx'

const initialFilters = { search: '', status: '', priority: '' }

function PortalWorkOrdersPage() {
  const { workOrders } = useDirectoryData()
  const { selectedCustomer } = useOutletContext()
  const [filters, setFilters] = useState(initialFilters)

  const customerWorkOrders = useMemo(() => workOrders.filter((workOrder) => workOrder.customerId === selectedCustomer?.id || workOrder.customer === selectedCustomer?.organization), [selectedCustomer, workOrders])

  const filteredWorkOrders = useMemo(() => customerWorkOrders.filter((workOrder) => {
    const searchText = filters.search.trim().toLowerCase()
    const searchable = [workOrder.id, workOrder.title, workOrder.site, workOrder.description].join(' ').toLowerCase()

    return (!searchText || searchable.includes(searchText))
      && (!filters.status || workOrder.status === filters.status)
      && (!filters.priority || workOrder.priority === filters.priority)
  }), [customerWorkOrders, filters])

  function updateFilter(event) {
    const { name, value } = event.target
    setFilters((currentFilters) => ({ ...currentFilters, [name]: value }))
  }

  return (
    <div className="portal-page-wrap">
      <section className="portal-filter-panel" aria-label="Customer work order filters">
        <label className="search-field">
          <Search size={18} aria-hidden="true" />
          <span className="visually-hidden">Search requests</span>
          <input name="search" value={filters.search} onChange={updateFilter} placeholder="Search ID, title, or site" />
        </label>
        <label className="filter-field">
          <span>Status</span>
          <select name="status" value={filters.status} onChange={updateFilter}>
            <option value="">All statuses</option>
            {['New', 'Assigned', 'In Progress', 'On Hold', 'Completed', 'Cancelled', 'Closed'].map((status) => <option key={status}>{status}</option>)}
          </select>
        </label>
        <label className="filter-field">
          <span>Priority</span>
          <select name="priority" value={filters.priority} onChange={updateFilter}>
            <option value="">All priorities</option>
            {priorityOptions.map((priority) => <option key={priority}>{priority}</option>)}
          </select>
        </label>
        <button className="secondary-button clear-filters" type="button" onClick={() => setFilters(initialFilters)}>Clear</button>
      </section>

      <div className="portal-work-orders-wrapper">
        <table className="portal-work-orders-table">
          <thead>
            <tr>
              <th>Request</th>
              <th>Site</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Submitted</th>
              <th>Scheduled</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filteredWorkOrders.map((workOrder) => (
              <tr key={workOrder.id}>
                <td>
                  <div className="portal-work-order-id"><strong>{workOrder.id}</strong><span>{workOrder.title}</span></div>
                </td>
                <td>{workOrder.site}</td>
                <td><PriorityBadge priority={workOrder.priority} /></td>
                <td><StatusBadge status={workOrder.status} /></td>
                <td>{workOrder.submittedAt ? new Date(workOrder.submittedAt).toLocaleDateString() : 'Not set'}</td>
                <td>{formatWorkOrderDate(workOrder.scheduledDate)}</td>
                <td><Link className="table-action" to={`/portal/work-orders/${workOrder.id}`}><Eye size={16} aria-hidden="true" /> View</Link></td>
              </tr>
            ))}
            {filteredWorkOrders.length === 0 && (
              <tr><td className="empty-table-cell" colSpan="7">No work orders match the selected filters for this customer account.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default PortalWorkOrdersPage
