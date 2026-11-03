import { Clock3, Eye, MapPin, Search, SlidersHorizontal, UserRound } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useDirectoryData } from '../../data/useDirectoryData.js'
import DataLoadNotice from '../../components/DataLoadNotice.jsx'
import { formatWorkOrderDate, priorityOptions } from '../../data/workOrders.js'
import { PriorityBadge, StatusBadge } from '../work-orders/WorkOrderBadges.jsx'

const initialFilters = {
  search: '',
  status: '',
  priority: '',
  scheduledDate: '',
}

function TechnicianFieldWorkflowPage() {
  const { technicians, workOrders, dataLoadStatus, error } = useDirectoryData()
  const [selectedTechnicianId, setSelectedTechnicianId] = useState(technicians[0]?.id ?? '')
  const [filters, setFilters] = useState(initialFilters)

  const activeTechnicianId = technicians.some((technician) => technician.id === selectedTechnicianId)
    ? selectedTechnicianId
    : technicians[0]?.id ?? ''
  const selectedTechnician = technicians.find((technician) => technician.id === activeTechnicianId) ?? technicians[0]
  const technicianWorkOrders = useMemo(() => {
    if (!selectedTechnician) {
      return []
    }

    return workOrders.filter((workOrder) => workOrder.assignedTechnicianId === selectedTechnician.id)
  }, [selectedTechnician, workOrders])

  const filteredWorkOrders = useMemo(() => technicianWorkOrders.filter((workOrder) => {
    const searchText = filters.search.trim().toLowerCase()
    const searchableText = [
      workOrder.id,
      workOrder.title,
      workOrder.customer,
      workOrder.site,
      workOrder.description,
      workOrder.serviceType,
    ].join(' ').toLowerCase()

    return (!searchText || searchableText.includes(searchText))
      && (!filters.status || workOrder.status === filters.status)
      && (!filters.priority || workOrder.priority === filters.priority)
      && (!filters.scheduledDate || workOrder.scheduledDate === filters.scheduledDate)
  }), [filters, technicianWorkOrders])

  function updateFilter(event) {
    const { name, value } = event.target
    setFilters((currentFilters) => ({ ...currentFilters, [name]: value }))
  }

  if (!selectedTechnician) {
    return (
      <section className="page-area work-orders-page">
        <div className="page-heading">
          <p className="page-kicker">Project Keystone</p>
          <h1>Technician field workflow</h1>
        </div>
      </section>
    )
  }

  const scheduledDates = [...new Set(technicianWorkOrders.map((workOrder) => workOrder.scheduledDate).filter(Boolean))].sort()

  return (
    <section className="page-area work-orders-page">
      <div className="page-heading">
        <p className="page-kicker">Project Keystone</p>
        <h1>Technician field workflow</h1>
      </div>

      <DataLoadNotice status={dataLoadStatus} error={error} resourceName="Technicians and work orders" />

      <section className="field-workflow-selector" aria-label="Technician selector">
        <label className="filter-field">
          <span>Technician</span>
          <select value={activeTechnicianId} onChange={(event) => setSelectedTechnicianId(event.target.value)}>
            {technicians.map((technician) => (
              <option key={technician.id} value={technician.id}>{technician.fullName}</option>
            ))}
          </select>
        </label>

        <div className="field-brief-card">
          <div className="field-brief-meta">
            <UserRound size={16} aria-hidden="true" />
            <span>{selectedTechnician.fullName}</span>
          </div>
          <div className="field-brief-meta">
            <Clock3 size={16} aria-hidden="true" />
            <span>{selectedTechnician.availability}</span>
          </div>
        </div>
      </section>

      <section className="work-order-filters" aria-label="Job filters">
        <label className="search-field">
          <Search size={18} aria-hidden="true" />
          <span className="visually-hidden">Search work orders</span>
          <input
            name="search"
            value={filters.search}
            onChange={updateFilter}
            placeholder="Search ID, title, customer, or site"
          />
        </label>

        <label className="filter-field">
          <span>Status</span>
          <select name="status" value={filters.status} onChange={updateFilter}>
            <option value="">All statuses</option>
            {['New', 'Assigned', 'In Progress', 'On Hold', 'Completed', 'Cancelled', 'Closed'].map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </label>

        <label className="filter-field">
          <span>Priority</span>
          <select name="priority" value={filters.priority} onChange={updateFilter}>
            <option value="">All priorities</option>
            {priorityOptions.map((priority) => <option key={priority} value={priority}>{priority}</option>)}
          </select>
        </label>

        <label className="filter-field">
          <span>Scheduled date</span>
          <select name="scheduledDate" value={filters.scheduledDate} onChange={updateFilter}>
            <option value="">All dates</option>
            {scheduledDates.map((scheduledDate) => (
              <option key={scheduledDate} value={scheduledDate}>{formatWorkOrderDate(scheduledDate)}</option>
            ))}
          </select>
        </label>

        <button className="secondary-button clear-filters" type="button" onClick={() => setFilters(initialFilters)}>
          <SlidersHorizontal size={16} aria-hidden="true" />
          Clear filters
        </button>
      </section>

      <p className="result-summary" aria-live="polite">
        {filteredWorkOrders.length} job{filteredWorkOrders.length === 1 ? '' : 's'} shown for {selectedTechnician.fullName}
      </p>

      {filteredWorkOrders.length === 0 ? (
        <div className="empty-job-list">
          <p>No jobs match the current schedule or filter settings.</p>
        </div>
      ) : (
        <div className="job-card-list">
          {filteredWorkOrders.map((workOrder) => (
            <article key={workOrder.id} className="job-card">
              <div className="job-card-header">
                <div>
                  <p className="job-card-kicker">{workOrder.id}</p>
                  <h2>{workOrder.title}</h2>
                </div>
                <StatusBadge status={workOrder.status} />
              </div>

              <div className="job-card-meta-row">
                <span className="job-card-meta"><MapPin size={14} aria-hidden="true" /> {workOrder.customer}</span>
                <span className="job-card-meta"><MapPin size={14} aria-hidden="true" /> {workOrder.site}</span>
              </div>

              <p className="job-card-description">{workOrder.description}</p>

              <div className="job-card-details">
                <div>
                  <span>Priority</span>
                  <PriorityBadge priority={workOrder.priority} />
                </div>
                <div>
                  <span>Scheduled</span>
                  <strong>{formatWorkOrderDate(workOrder.scheduledDate)}</strong>
                </div>
                <div>
                  <span>Service</span>
                  <strong>{workOrder.serviceType}</strong>
                </div>
              </div>

              <div className="job-card-actions">
                <Link className="primary-button compact-button" to={`/technicians/field-workflow/${workOrder.id}`}>
                  <Eye size={16} aria-hidden="true" />
                  Open job details
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}

export default TechnicianFieldWorkflowPage
