import { CalendarDays, UserRound } from 'lucide-react'
import { Link, useOutletContext } from 'react-router-dom'
import { formatWorkOrderDate, getAssignedTechnicianName, getStatusClassName, workOrderStatuses } from '../../data/workOrders.js'
import WorkOrdersHeader from './WorkOrdersHeader.jsx'
import { PriorityBadge } from './WorkOrderBadges.jsx'
import DataLoadNotice from '../../components/DataLoadNotice.jsx'

function WorkOrdersKanbanPage() {
  const { workOrders, technicians, updateWorkOrder, dataLoadStatus, error } = useOutletContext()

  return (
    <section className="page-area work-orders-page">
      <WorkOrdersHeader
        title="Work Orders Kanban"
        description="Review the current work-order workflow by status."
      />

      <DataLoadNotice status={dataLoadStatus} error={error} resourceName="Work orders" />

      <div className="kanban-board" aria-label="Work order Kanban board">
        {workOrderStatuses.map((status) => {
          const statusWorkOrders = workOrders.filter((workOrder) => workOrder.status === status)
          return (
            <section key={status} className="kanban-column">
              <header className="kanban-column-header">
                <span className={`kanban-status-dot status-${getStatusClassName(status)}`} aria-hidden="true" />
                <h2>{status}</h2>
                <span>{statusWorkOrders.length}</span>
              </header>
              <div className="kanban-card-list">
                {statusWorkOrders.map((workOrder) => (
                  <article key={workOrder.id} className="kanban-card">
                    <div className="kanban-card-topline">
                      <span>{workOrder.id}</span>
                      <PriorityBadge priority={workOrder.priority} />
                    </div>
                    <Link to={`/work-orders/${workOrder.id}`}>{workOrder.title}</Link>
                    <p>{workOrder.customer}</p>
                    <p>{workOrder.site}</p>
                    <div className="kanban-card-meta"><UserRound size={14} aria-hidden="true" /> {getAssignedTechnicianName(workOrder, technicians)}</div>
                    <div className="kanban-card-meta"><CalendarDays size={14} aria-hidden="true" /> {formatWorkOrderDate(workOrder.scheduledDate)}</div>
                    <label className="kanban-status-select-label">
                      <span>Move to</span>
                      <select value={workOrder.status} onChange={(event) => updateWorkOrder(workOrder.id, { status: event.target.value })}>
                        {workOrderStatuses.map((statusOption) => <option key={statusOption}>{statusOption}</option>)}
                      </select>
                    </label>
                  </article>
                ))}
                {statusWorkOrders.length === 0 && <p className="empty-kanban-column">No work orders</p>}
              </div>
            </section>
          )
        })}
      </div>
    </section>
  )
}

export default WorkOrdersKanbanPage
