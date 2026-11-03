import { Eye, Search, SlidersHorizontal } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useOutletContext } from 'react-router-dom'
import {
  priorityOptions,
  formatWorkOrderDate,
  getAssignedTechnicianName,
  workOrderStatuses,
} from '../../data/workOrders.js'
import WorkOrdersHeader from './WorkOrdersHeader.jsx'
import { PriorityBadge, StatusBadge } from './WorkOrderBadges.jsx'
import DataLoadNotice from '../../components/DataLoadNotice.jsx'

const initialFilters = {
  search: '',
  status: '',
  priority: '',
  technician: '',
}

function WorkOrdersPage() {
  const { workOrders, technicians, dataLoadStatus, error } = useOutletContext()
  const [filters, setFilters] = useState(initialFilters)

  const filteredWorkOrders = useMemo(() => workOrders.filter((workOrder) => {
    const searchText = filters.search.trim().toLowerCase()
    const searchableText = [
      workOrder.id,
      workOrder.title,
      workOrder.customer,
      workOrder.site,
      workOrder.description,
    ].join(' ').toLowerCase()

    return (!searchText || searchableText.includes(searchText))
      && (!filters.status || workOrder.status === filters.status)
      && (!filters.priority || workOrder.priority === filters.priority)
      && (!filters.technician || workOrder.assignedTechnicianId === filters.technician)
  }), [filters, workOrders])

  function updateFilter(event) {
    const { name, value } = event.target
    setFilters((currentFilters) => ({ ...currentFilters, [name]: value }))
  }

  return (
    <section className="page-area work-orders-page">
      <WorkOrdersHeader title="Work Orders" />

      <DataLoadNotice status={dataLoadStatus} error={error} resourceName="Work orders" />

      <section className="work-order-filters" aria-label="Work order filters">
        <label className="search-field">
          <Search size={18} aria-hidden="true" />
          <span className="visually-hidden">Search work orders</span>
          <input
            name="search"
            value={filters.search}
            onChange={updateFilter}
            placeholder="Search ID, customer, site, or service description"
          />
        </label>
        <label className="filter-field">
          <span>Status</span>
          <select name="status" value={filters.status} onChange={updateFilter}>
            <option value="">All statuses</option>
            {workOrderStatuses.map((status) => <option key={status}>{status}</option>)}
          </select>
        </label>
        <label className="filter-field">
          <span>Priority</span>
          <select name="priority" value={filters.priority} onChange={updateFilter}>
            <option value="">All priorities</option>
            {priorityOptions.map((priority) => <option key={priority}>{priority}</option>)}
          </select>
        </label>
        <label className="filter-field">
          <span>Technician</span>
          <select name="technician" value={filters.technician} onChange={updateFilter}>
            <option value="">All technicians</option>
            {technicians.map((technician) => <option key={technician.id} value={technician.id}>{technician.fullName}</option>)}
          </select>
        </label>
        <button className="secondary-button clear-filters" type="button" onClick={() => setFilters(initialFilters)}>
          <SlidersHorizontal size={16} aria-hidden="true" />
          Clear filters
        </button>
      </section>

      <p className="result-summary" aria-live="polite">
        {filteredWorkOrders.length} work order{filteredWorkOrders.length === 1 ? '' : 's'} shown
      </p>

      <div className="work-order-table-wrapper">
        <table className="work-order-table">
          <thead>
            <tr>
              <th scope="col">Work order</th>
              <th scope="col">Customer</th>
              <th scope="col">Site</th>
              <th scope="col">Priority</th>
              <th scope="col">Status</th>
              <th scope="col">Assigned technician</th>
              <th scope="col">Scheduled date</th>
              <th scope="col"><span className="visually-hidden">Actions</span></th>
            </tr>
          </thead>
          <tbody>
            {filteredWorkOrders.map((workOrder) => (
              <tr key={workOrder.id}>
                <td>
                  <Link className="work-order-title" to={`/work-orders/${workOrder.id}`}>
                    <strong>{workOrder.id}</strong>
                    <span>{workOrder.title}</span>
                  </Link>
                </td>
                <td>{workOrder.customer}</td>
                <td>{workOrder.site}</td>
                <td><PriorityBadge priority={workOrder.priority} /></td>
                <td><StatusBadge status={workOrder.status} /></td>
                <td>{getAssignedTechnicianName(workOrder, technicians)}</td>
                <td>{formatWorkOrderDate(workOrder.scheduledDate)}</td>
                <td>
                  <Link className="table-action" to={`/work-orders/${workOrder.id}`}>
                    <Eye size={16} aria-hidden="true" />
                    View
                  </Link>
                </td>
              </tr>
            ))}
            {filteredWorkOrders.length === 0 && (
              <tr>
                <td className="empty-table-cell" colSpan="8">No work orders match the current search and filters.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export default WorkOrdersPage
