import { AlertTriangle, CheckCircle2, ClipboardList, MapPin, ShoppingBag } from 'lucide-react'
import { useMemo } from 'react'
import { Link, useOutletContext } from 'react-router-dom'
import { useDirectoryData } from '../../data/useDirectoryData.js'
import { workOrderStatuses } from '../../data/workOrders.js'
import { StatusBadge } from '../work-orders/WorkOrderBadges.jsx'

function PortalHomePage() {
  const { workOrders } = useDirectoryData()
  const { selectedCustomer } = useOutletContext()

  const customerWorkOrders = useMemo(() => workOrders.filter((workOrder) => workOrder.customerId === selectedCustomer?.id || workOrder.customer === selectedCustomer?.organization), [selectedCustomer, workOrders])

  const statusSummary = useMemo(() => workOrderStatuses.reduce((summary, status) => {
    summary[status] = customerWorkOrders.filter((workOrder) => workOrder.status === status).length
    return summary
  }, {}), [customerWorkOrders])

  const recentWorkOrders = [...customerWorkOrders].sort((left, right) => new Date(right.submittedAt || right.scheduledDate || 0) - new Date(left.submittedAt || left.scheduledDate || 0)).slice(0, 4)

  return (
    <div className="portal-page-wrap">
      <section className="portal-summary-grid">
        <article className="portal-summary-card">
          <div className="portal-summary-icon"><ClipboardList size={18} aria-hidden="true" /></div>
          <div>
            <span>Total requests</span>
            <strong>{customerWorkOrders.length}</strong>
          </div>
        </article>
        <article className="portal-summary-card">
          <div className="portal-summary-icon"><AlertTriangle size={18} aria-hidden="true" /></div>
          <div>
            <span>Open jobs</span>
            <strong>{customerWorkOrders.filter((workOrder) => workOrder.status !== 'Completed' && workOrder.status !== 'Closed').length}</strong>
          </div>
        </article>
        <article className="portal-summary-card">
          <div className="portal-summary-icon"><CheckCircle2 size={18} aria-hidden="true" /></div>
          <div>
            <span>Completed</span>
            <strong>{customerWorkOrders.filter((workOrder) => workOrder.status === 'Completed' || workOrder.status === 'Closed').length}</strong>
          </div>
        </article>
      </section>

      <div className="portal-panel-grid">
        <section className="details-panel">
          <div className="details-panel-heading">
            <h2>Request status</h2>
            <ClipboardList size={18} aria-hidden="true" />
          </div>
          <div className="status-summary-list">
            {workOrderStatuses.map((status) => (
              <div key={status} className="status-summary-row">
                <span>{status}</span>
                <div className="status-summary-bar-wrap">
                  <div className="status-summary-bar" style={{ width: `${customerWorkOrders.length === 0 ? 0 : (statusSummary[status] / customerWorkOrders.length) * 100}%` }} />
                </div>
                <strong>{statusSummary[status]}</strong>
              </div>
            ))}
          </div>
        </section>

        <section className="details-panel">
          <div className="details-panel-heading">
            <h2>Recent requests</h2>
            <ShoppingBag size={18} aria-hidden="true" />
          </div>
          <div className="portal-list-block">
            {recentWorkOrders.length === 0 ? (
              <p className="empty-associated-list">No recent service requests have been recorded for this customer.</p>
            ) : (
              recentWorkOrders.map((workOrder) => (
                <div key={workOrder.id} className="portal-list-row">
                  <div>
                    <Link to={`/portal/work-orders/${workOrder.id}`}>{workOrder.id}</Link>
                    <span>{workOrder.title}</span>
                  </div>
                  <StatusBadge status={workOrder.status} />
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      <section className="details-panel">
        <div className="details-panel-heading">
          <h2>Customer profile summary</h2>
          <MapPin size={18} aria-hidden="true" />
        </div>
        <div className="portal-profile-summary">
          <div>
            <span>Organization</span>
            <strong>{selectedCustomer?.organization}</strong>
          </div>
          <div>
            <span>Primary contact</span>
            <strong>{selectedCustomer?.contactName}</strong>
          </div>
          <div>
            <span>Email</span>
            <strong>{selectedCustomer?.email}</strong>
          </div>
        </div>
      </section>
    </div>
  )
}

export default PortalHomePage
