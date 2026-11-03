import { ArrowLeft, CalendarDays, MapPin, UserRound } from 'lucide-react'
import { Link, useOutletContext, useParams } from 'react-router-dom'
import { useDirectoryData } from '../../data/useDirectoryData.js'
import { formatHistoryDate, formatWorkOrderDate, getStatusClassName } from '../../data/workOrders.js'
import { PriorityBadge, StatusBadge } from '../work-orders/WorkOrderBadges.jsx'

function PortalWorkOrderDetailsPage() {
  const { workOrderId } = useParams()
  const { workOrders, technicians } = useDirectoryData()
  const { selectedCustomer } = useOutletContext()
  const workOrder = workOrders.find((item) => item.id === workOrderId && (item.customerId === selectedCustomer?.id || item.customer === selectedCustomer?.organization))

  if (!workOrder) {
    return (
      <section className="portal-page-wrap">
        <div className="details-panel">
          <h2>Request not found</h2>
          <p className="empty-associated-list">This request is not associated with the selected customer context.</p>
          <Link className="secondary-button" to="/portal/work-orders">Back to my work orders</Link>
        </div>
      </section>
    )
  }

  const assignedTechnician = technicians.find((item) => item.id === workOrder.assignedTechnicianId)

  return (
    <section className="portal-page-wrap">
      <div className="details-back-link">
        <Link to="/portal/work-orders"><ArrowLeft size={16} aria-hidden="true" /> Back to my work orders</Link>
      </div>

      <div className="work-order-details-grid">
        <div className="details-main-column">
          <section className="details-panel">
            <div className="details-panel-heading">
              <h2>{workOrder.id}</h2>
              <div className="details-badges"><PriorityBadge priority={workOrder.priority} /><StatusBadge status={workOrder.status} /></div>
            </div>
            <dl className="details-list">
              <div><dt>Title</dt><dd>{workOrder.title}</dd></div>
              <div><dt>Service type</dt><dd>{workOrder.serviceType}</dd></div>
              <div><dt>Customer</dt><dd>{workOrder.customer}</dd></div>
              <div><dt>Site</dt><dd>{workOrder.site}</dd></div>
              <div className="details-list-wide"><dt>Service request</dt><dd>{workOrder.description}</dd></div>
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
            <h2>Schedule and assignment</h2>
            <p className="detail-icon-text"><CalendarDays size={18} aria-hidden="true" /> {formatWorkOrderDate(workOrder.scheduledDate)}</p>
            <p className="detail-icon-text"><UserRound size={18} aria-hidden="true" /> {assignedTechnician ? assignedTechnician.fullName : 'Unassigned'}</p>
            <p className="detail-icon-text"><MapPin size={18} aria-hidden="true" /> {workOrder.site}</p>
          </section>
        </aside>
      </div>
    </section>
  )
}

export default PortalWorkOrderDetailsPage
