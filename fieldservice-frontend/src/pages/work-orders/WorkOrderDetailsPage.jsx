import { ArrowLeft, CalendarDays, UserRound } from 'lucide-react'
import { Link, useOutletContext, useParams } from 'react-router-dom'
import {
  formatHistoryDate,
  formatWorkOrderDate,
  getAssignedTechnicianName,
  getStatusClassName,
  workOrderStatuses,
} from '../../data/workOrders.js'
import WorkOrdersHeader from './WorkOrdersHeader.jsx'
import { PriorityBadge, StatusBadge } from './WorkOrderBadges.jsx'
import DataLoadNotice from '../../components/DataLoadNotice.jsx'

function WorkOrderDetailsPage() {
  const { workOrderId } = useParams()
  const { workOrders, technicians, updateWorkOrder, dataLoadStatus, error } = useOutletContext()
  const workOrder = workOrders.find((item) => item.id === workOrderId)
  const assignedTechnician = technicians.find((item) => item.id === workOrder?.assignedTechnicianId)

  if (!workOrder) {
    return (
      <section className="page-area work-orders-page">
        <WorkOrdersHeader title="Work Order Not Found" />
        <Link className="secondary-button" to="/work-orders">Back to work orders</Link>
      </section>
    )
  }

  return (
    <section className="page-area work-orders-page">
      <WorkOrdersHeader
        title={workOrder.id}
        description={workOrder.title}
      />

      <DataLoadNotice status={dataLoadStatus} error={error} resourceName="Work orders" />

      <div className="details-back-link">
        <Link to="/work-orders"><ArrowLeft size={16} aria-hidden="true" /> Back to work orders</Link>
        <Link className="secondary-button" to={`/work-orders/${workOrder.id}/edit`}>Edit work order</Link>
      </div>

      <div className="work-order-details-grid">
        <div className="details-main-column">
          <section className="details-panel">
            <div className="details-panel-heading">
              <h2>Job information</h2>
              <div className="details-badges"><PriorityBadge priority={workOrder.priority} /><StatusBadge status={workOrder.status} /></div>
            </div>
            <dl className="details-list">
              <div><dt>Customer</dt><dd>{workOrder.customer}</dd></div>
              <div><dt>Site</dt><dd>{workOrder.site}</dd></div>
              <div><dt>Service type</dt><dd>{workOrder.serviceType}</dd></div>
              <div><dt>Work order ID</dt><dd>{workOrder.id}</dd></div>
              <div className="details-list-wide"><dt>Description</dt><dd>{workOrder.description}</dd></div>
            </dl>
          </section>

          <section className="details-panel">
            <h2>Status history</h2>
            <ol className="status-history">
              {workOrder.history.map((entry, index) => (
                <li key={`${entry.changedAt}-${entry.status}`}>
                  <span className={`history-marker status-${getStatusClassName(entry.status)}`} aria-hidden="true" />
                  <div>
                    <strong>{entry.status}</strong>
                    <p>{entry.note}</p>
                    <time dateTime={entry.changedAt}>{formatHistoryDate(entry.changedAt)}</time>
                  </div>
                  {index < workOrder.history.length - 1 && <span className="history-line" aria-hidden="true" />}
                </li>
              ))}
            </ol>
          </section>
        </div>

        <aside className="details-side-column">
          <section className="details-panel">
            <h2>Assignment</h2>
            <p className="detail-icon-text">
              <UserRound size={18} aria-hidden="true" />
              {assignedTechnician ? <Link className="text-link" to={`/technicians/${assignedTechnician.id}`}>{assignedTechnician.fullName}</Link> : getAssignedTechnicianName(workOrder, technicians)}
            </p>
          </section>
          <section className="details-panel">
            <h2>Schedule</h2>
            <p className="detail-icon-text"><CalendarDays size={18} aria-hidden="true" /> {formatWorkOrderDate(workOrder.scheduledDate)}</p>
          </section>
          <section className="details-panel">
            <label className="status-change-label" htmlFor="work-order-status">Current status</label>
            <select
              id="work-order-status"
              className="status-change-select"
              value={workOrder.status}
              onChange={(event) => updateWorkOrder(workOrder.id, { status: event.target.value })}
            >
              {workOrderStatuses.map((status) => <option key={status}>{status}</option>)}
            </select>
          </section>
        </aside>
      </div>
    </section>
  )
}

export default WorkOrderDetailsPage
