import { BarChart3, Download, FileText, TimerReset } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useDirectoryData } from '../../data/useDirectoryData.js'
import DataLoadNotice from '../../components/DataLoadNotice.jsx'
import { formatWorkOrderDate, getAssignedTechnicianName, priorityOptions, workOrderStatuses } from '../../data/workOrders.js'
import { StatusBadge } from '../work-orders/WorkOrderBadges.jsx'

const finalStatuses = new Set(['Completed', 'Cancelled', 'Closed'])

function ReportsPage() {
  const { workOrders, technicians, dataLoadStatus, error } = useDirectoryData()
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    status: '',
    priority: '',
    technician: '',
    customer: '',
    site: '',
  })

  const customerOptions = useMemo(() => [...new Set(workOrders.map((workOrder) => workOrder.customer))].sort(), [workOrders])
  const siteOptions = useMemo(() => [...new Set(workOrders.map((workOrder) => workOrder.site))].sort(), [workOrders])

  const filteredWorkOrders = useMemo(() => workOrders.filter((workOrder) => {
    const matchesDate = (() => {
      if (!filters.startDate && !filters.endDate) {
        return true
      }

      if (!workOrder.scheduledDate) {
        return false
      }

      const workDate = new Date(`${workOrder.scheduledDate}T00:00:00`)
      const startDate = filters.startDate ? new Date(`${filters.startDate}T00:00:00`) : null
      const endDate = filters.endDate ? new Date(`${filters.endDate}T23:59:59`) : null

      return (!startDate || workDate >= startDate) && (!endDate || workDate <= endDate)
    })()

    return matchesDate
      && (!filters.status || workOrder.status === filters.status)
      && (!filters.priority || workOrder.priority === filters.priority)
      && (!filters.technician || workOrder.assignedTechnicianId === filters.technician)
      && (!filters.customer || workOrder.customer === filters.customer)
      && (!filters.site || workOrder.site === filters.site)
  }), [filters, workOrders])

  const statusSummary = useMemo(() => workOrderStatuses.map((status) => ({
    status,
    count: filteredWorkOrders.filter((workOrder) => workOrder.status === status).length,
  })), [filteredWorkOrders])

  const workloadSummary = useMemo(() => technicians.map((technician) => ({
    technician,
    assignedCount: filteredWorkOrders.filter((workOrder) => workOrder.assignedTechnicianId === technician.id).length,
    activeCount: filteredWorkOrders.filter((workOrder) => workOrder.assignedTechnicianId === technician.id && !finalStatuses.has(workOrder.status)).length,
  })).sort((left, right) => right.assignedCount - left.assignedCount), [filteredWorkOrders, technicians])

  const overdueJobs = useMemo(() => filteredWorkOrders.filter((workOrder) => {
    if (!workOrder.scheduledDate || finalStatuses.has(workOrder.status)) {
      return false
    }

    const scheduledDate = new Date(`${workOrder.scheduledDate}T00:00:00`)
    return scheduledDate < new Date(new Date().setHours(0, 0, 0, 0))
  }), [filteredWorkOrders])

  const closeOutCandidates = useMemo(() => filteredWorkOrders.filter((workOrder) => workOrder.status === 'Completed' || workOrder.status === 'Closed'), [filteredWorkOrders])

  const slaConfigured = workOrders.some((workOrder) => workOrder.slaTargetHours || workOrder.slaThresholdHours || workOrder.slaTargetMinutes)

  function updateFilter(event) {
    const { name, value } = event.target
    setFilters((currentFilters) => ({ ...currentFilters, [name]: value }))
  }

  function exportCsv() {
    if (filteredWorkOrders.length === 0) {
      return
    }

    const rows = [
      ['Work Order ID', 'Title', 'Customer', 'Site', 'Priority', 'Status', 'Technician', 'Scheduled Date', 'Service Type'],
      ...filteredWorkOrders.map((workOrder) => [
        workOrder.id,
        workOrder.title,
        workOrder.customer,
        workOrder.site,
        workOrder.priority,
        workOrder.status,
        getAssignedTechnicianName(workOrder, technicians),
        workOrder.scheduledDate ?? '',
        workOrder.serviceType ?? '',
      ]),
    ]

    const csv = rows.map((row) => row.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `keystone-work-order-report-${new Date().toISOString().slice(0, 10)}.csv`
    anchor.click()
    URL.revokeObjectURL(url)
  }

  return (
    <section className="page-area reports-page">
      <div className="page-heading">
        <p className="page-kicker">Project Keystone</p>
        <h1>Reports</h1>
      </div>

      <DataLoadNotice status={dataLoadStatus} error={error} resourceName="Report data" />

      <section className="report-filter-panel" aria-label="Report filters">
        <div className="report-filters-grid">
          <label className="filter-field">
            <span>Start date</span>
            <input type="date" name="startDate" value={filters.startDate} onChange={updateFilter} />
          </label>
          <label className="filter-field">
            <span>End date</span>
            <input type="date" name="endDate" value={filters.endDate} onChange={updateFilter} />
          </label>
          <label className="filter-field">
            <span>Status</span>
            <select name="status" value={filters.status} onChange={updateFilter}>
              <option value="">All statuses</option>
              {workOrderStatuses.map((status) => <option key={status} value={status}>{status}</option>)}
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
            <span>Technician</span>
            <select name="technician" value={filters.technician} onChange={updateFilter}>
              <option value="">All technicians</option>
              {technicians.map((technician) => <option key={technician.id} value={technician.id}>{technician.fullName}</option>)}
            </select>
          </label>
          <label className="filter-field">
            <span>Customer</span>
            <select name="customer" value={filters.customer} onChange={updateFilter}>
              <option value="">All customers</option>
              {customerOptions.map((customer) => <option key={customer} value={customer}>{customer}</option>)}
            </select>
          </label>
          <label className="filter-field">
            <span>Site</span>
            <select name="site" value={filters.site} onChange={updateFilter}>
              <option value="">All sites</option>
              {siteOptions.map((site) => <option key={site} value={site}>{site}</option>)}
            </select>
          </label>
        </div>

        <div className="report-actions-row">
          <button className="secondary-button" type="button" onClick={() => setFilters({ startDate: '', endDate: '', status: '', priority: '', technician: '', customer: '', site: '' })}>
            Reset filters
          </button>
          <button className="primary-button compact-button" type="button" onClick={exportCsv} disabled={filteredWorkOrders.length === 0}>
            <Download size={16} aria-hidden="true" />
            Export CSV
          </button>
        </div>
      </section>

      <div className="dashboard-summary-grid">
        <article className="dashboard-stat-card">
          <div className="dashboard-stat-icon"><FileText size={18} aria-hidden="true" /></div>
          <div>
            <span>Visible jobs</span>
            <strong>{filteredWorkOrders.length}</strong>
          </div>
        </article>
        <article className="dashboard-stat-card">
          <div className="dashboard-stat-icon"><BarChart3 size={18} aria-hidden="true" /></div>
          <div>
            <span>Completed</span>
            <strong>{filteredWorkOrders.filter((workOrder) => workOrder.status === 'Completed' || workOrder.status === 'Closed').length}</strong>
          </div>
        </article>
        <article className="dashboard-stat-card">
          <div className="dashboard-stat-icon"><TimerReset size={18} aria-hidden="true" /></div>
          <div>
            <span>Overdue</span>
            <strong>{overdueJobs.length}</strong>
          </div>
        </article>
      </div>

      <div className="dashboard-grid-two">
        <section className="details-panel">
          <div className="details-panel-heading">
            <h2>Work orders by status</h2>
            <BarChart3 size={18} aria-hidden="true" />
          </div>
          <div className="report-table-wrapper">
            <table className="entity-table">
              <thead>
                <tr>
                  <th>Status</th>
                  <th>Count</th>
                </tr>
              </thead>
              <tbody>
                {statusSummary.map(({ status, count }) => (
                  <tr key={status}>
                    <td><StatusBadge status={status} /></td>
                    <td>{count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="details-panel">
          <div className="details-panel-heading">
            <h2>Completed vs outstanding</h2>
            <BarChart3 size={18} aria-hidden="true" />
          </div>
          <div className="report-table-wrapper">
            <table className="entity-table">
              <thead>
                <tr>
                  <th>Bucket</th>
                  <th>Count</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Completed / Closed</td>
                  <td>{filteredWorkOrders.filter((workOrder) => workOrder.status === 'Completed' || workOrder.status === 'Closed').length}</td>
                </tr>
                <tr>
                  <td>Outstanding</td>
                  <td>{filteredWorkOrders.filter((workOrder) => !finalStatuses.has(workOrder.status)).length}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <div className="dashboard-grid-two">
        <section className="details-panel">
          <div className="details-panel-heading">
            <h2>Technician workload</h2>
            <BarChart3 size={18} aria-hidden="true" />
          </div>
          <div className="report-table-wrapper">
            <table className="entity-table">
              <thead>
                <tr>
                  <th>Technician</th>
                  <th>Assigned</th>
                  <th>Open</th>
                </tr>
              </thead>
              <tbody>
                {workloadSummary.map(({ technician, assignedCount, activeCount }) => (
                  <tr key={technician.id}>
                    <td>{technician.fullName}</td>
                    <td>{assignedCount}</td>
                    <td>{activeCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="details-panel">
          <div className="details-panel-heading">
            <h2>Overdue jobs</h2>
            <TimerReset size={18} aria-hidden="true" />
          </div>
          <div className="report-table-wrapper">
            <table className="entity-table">
              <thead>
                <tr>
                  <th>Work order</th>
                  <th>Due date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {overdueJobs.length === 0 ? (
                  <tr><td className="empty-table-cell" colSpan="3">No overdue jobs in the current filtered selection.</td></tr>
                ) : (
                  overdueJobs.map((workOrder) => (
                    <tr key={workOrder.id}>
                      <td>{workOrder.id}</td>
                      <td>{formatWorkOrderDate(workOrder.scheduledDate)}</td>
                      <td><StatusBadge status={workOrder.status} /></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <section className="details-panel">
        <div className="details-panel-heading">
          <h2>SLA management</h2>
          <BarChart3 size={18} aria-hidden="true" />
        </div>
        {slaConfigured ? (
          <p className="notes-text">SLA fields are available in the data model, but the current backend does not define a formal project SLA threshold. The page shows the available target timing data only.</p>
        ) : (
          <p className="notes-text">SLA configuration is not exposed by the current backend API. No official SLA thresholds are being inferred or displayed for this project.</p>
        )}

        <div className="report-table-wrapper">
          <table className="entity-table">
            <thead>
              <tr>
                <th>Work order</th>
                <th>Target / due date</th>
                <th>Status</th>
                <th>Compliance</th>
              </tr>
            </thead>
            <tbody>
              {filteredWorkOrders.length === 0 ? (
                <tr><td className="empty-table-cell" colSpan="4">No records are available for SLA review with the current filters.</td></tr>
              ) : (
                filteredWorkOrders.map((workOrder) => (
                  <tr key={workOrder.id}>
                    <td>{workOrder.id}</td>
                    <td>{workOrder.scheduledDate ? formatWorkOrderDate(workOrder.scheduledDate) : 'Not set'}</td>
                    <td><StatusBadge status={workOrder.status} /></td>
                    <td>{slaConfigured ? 'Available target data' : 'Not configured'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="details-panel">
        <div className="details-panel-heading">
          <h2>Manager close-out review</h2>
          <BarChart3 size={18} aria-hidden="true" />
        </div>
        {closeOutCandidates.length === 0 ? (
          <p className="notes-text">No completed or closed work orders need manager review in the current filtered selection.</p>
        ) : (
          <div className="close-out-list">
            {closeOutCandidates.map((workOrder) => (
              <div key={workOrder.id} className="close-out-item">
                <div className="close-out-item-header">
                  <strong>{workOrder.id}</strong>
                  <StatusBadge status={workOrder.status} />
                </div>
                <p>{workOrder.title}</p>
                <span>{workOrder.completionNote || 'No completion note recorded yet.'}</span>
              </div>
            ))}
          </div>
        )}
      </section>
    </section>
  )
}

export default ReportsPage
