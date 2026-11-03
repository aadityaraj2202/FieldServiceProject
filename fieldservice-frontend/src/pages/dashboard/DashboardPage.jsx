import { AlertTriangle, BarChart3, CalendarDays, CheckCircle2, ClipboardList, TimerReset, Users } from 'lucide-react'
import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useDirectoryData } from '../../data/useDirectoryData.js'
import { formatWorkOrderDate, workOrderStatuses } from '../../data/workOrders.js'
import { StatusBadge } from '../work-orders/WorkOrderBadges.jsx'

const finalStatuses = new Set(['Completed', 'Cancelled', 'Closed'])

function DashboardPage() {
  const { workOrders, technicians, dataLoadStatus, error } = useDirectoryData()
  const hasLoadedData = dataLoadStatus === 'ready'

  const dashboardData = useMemo(() => {
    const today = new Date()
    const todayKey = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const dueSoonCutoff = new Date(todayKey)
    dueSoonCutoff.setDate(dueSoonCutoff.getDate() + 7)

    const statusSummary = workOrderStatuses.reduce((summary, status) => {
      summary[status] = workOrders.filter((workOrder) => workOrder.status === status).length
      return summary
    }, {})

    const overdue = workOrders.filter((workOrder) => {
      if (!workOrder.scheduledDate || finalStatuses.has(workOrder.status)) {
        return false
      }

      const scheduledDate = new Date(`${workOrder.scheduledDate}T00:00:00`)
      return scheduledDate < todayKey
    })

    const dueToday = workOrders.filter((workOrder) => workOrder.scheduledDate && workOrder.scheduledDate === today.toISOString().slice(0, 10))
    const dueSoon = workOrders.filter((workOrder) => {
      if (!workOrder.scheduledDate || finalStatuses.has(workOrder.status)) {
        return false
      }

      const scheduledDate = new Date(`${workOrder.scheduledDate}T00:00:00`)
      return scheduledDate >= todayKey && scheduledDate <= dueSoonCutoff
    })

    const completed = workOrders.filter((workOrder) => workOrder.status === 'Completed' || workOrder.status === 'Closed').length
    const outstanding = workOrders.length - completed

    const technicianLoad = technicians.map((technician) => {
      const assigned = workOrders.filter((workOrder) => workOrder.assignedTechnicianId === technician.id)
      const active = assigned.filter((workOrder) => !finalStatuses.has(workOrder.status)).length

      return {
        technician,
        assignedCount: assigned.length,
        activeCount: active,
      }
    }).sort((left, right) => right.assignedCount - left.assignedCount)

    const slaConfigured = workOrders.some((workOrder) => workOrder.slaTargetHours || workOrder.slaThresholdHours || workOrder.slaTargetMinutes)

    return {
      totalWorkOrders: workOrders.length,
      percentCompleted: workOrders.length === 0 ? 0 : Math.round((completed / workOrders.length) * 100),
      overdues: overdue,
      dueToday,
      dueSoon,
      statusSummary,
      completed,
      outstanding,
      technicianLoad,
      slaConfigured,
    }
  }, [technicians, workOrders])

  return (
    <section className="page-area dashboard-page">
      <div className="page-heading">
        <p className="page-kicker">Project Keystone</p>
        <h1>Manager dashboard</h1>
      </div>

      {dataLoadStatus === 'error' && (
        <p className="local-data-notice" role="alert">Unable to load dashboard data from the Field Service API: {error || 'Request failed.'}</p>
      )}

      <div className="dashboard-summary-grid">
        <article className="dashboard-stat-card">
          <div className="dashboard-stat-icon"><ClipboardList size={18} aria-hidden="true" /></div>
          <div>
            <span>Total work orders</span>
            <strong>{hasLoadedData ? dashboardData.totalWorkOrders : '—'}</strong>
          </div>
        </article>

        <article className="dashboard-stat-card">
          <div className="dashboard-stat-icon"><CheckCircle2 size={18} aria-hidden="true" /></div>
          <div>
            <span>Completed jobs</span>
            <strong>{hasLoadedData ? dashboardData.completed : '—'}</strong>
          </div>
        </article>

        <article className="dashboard-stat-card">
          <div className="dashboard-stat-icon"><AlertTriangle size={18} aria-hidden="true" /></div>
          <div>
            <span>Overdue</span>
            <strong>{hasLoadedData ? dashboardData.overdues.length : '—'}</strong>
          </div>
        </article>

        <article className="dashboard-stat-card">
          <div className="dashboard-stat-icon"><CalendarDays size={18} aria-hidden="true" /></div>
          <div>
            <span>Due today / soon</span>
            <strong>{hasLoadedData ? dashboardData.dueToday.length + dashboardData.dueSoon.length : '—'}</strong>
          </div>
        </article>
      </div>

      <div className="dashboard-grid-two">
        <section className="details-panel">
          <div className="details-panel-heading">
            <h2>Work orders by current status</h2>
            <BarChart3 size={18} aria-hidden="true" />
          </div>
          <div className="status-summary-list">
            {workOrderStatuses.map((status) => (
              <div key={status} className="status-summary-row">
                <span>{status}</span>
                <div className="status-summary-bar-wrap">
                  <div
                    className="status-summary-bar"
                    style={{ width: `${hasLoadedData && dashboardData.totalWorkOrders !== 0 ? (dashboardData.statusSummary[status] / dashboardData.totalWorkOrders) * 100 : 0}%` }}
                  />
                </div>
                <strong>{hasLoadedData ? dashboardData.statusSummary[status] : '—'}</strong>
              </div>
            ))}
          </div>
        </section>

        <section className="details-panel">
          <div className="details-panel-heading">
            <h2>Technician workload</h2>
            <Users size={18} aria-hidden="true" />
          </div>
          <div className="workload-list">
            {!hasLoadedData && <p className="empty-associated-list">Technician workload will appear after dashboard data loads successfully.</p>}
            {hasLoadedData && dashboardData.technicianLoad.map(({ technician, assignedCount, activeCount }) => (
              <div key={technician.id} className="workload-row">
                <div>
                  <strong>{technician.fullName}</strong>
                  <span>{assignedCount} assigned · {activeCount} active</span>
                </div>
                <div className="mini-progress">
                  <span style={{ width: `${Math.min(100, assignedCount * 35)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="dashboard-grid-two">
        <section className="details-panel">
          <div className="details-panel-heading">
            <h2>Overdue and upcoming jobs</h2>
            <TimerReset size={18} aria-hidden="true" />
          </div>
          <div className="mini-list">
            <div>
              <span>Overdue</span>
              <strong>{hasLoadedData ? dashboardData.overdues.length : '—'}</strong>
            </div>
            <div>
              <span>Due today</span>
              <strong>{hasLoadedData ? dashboardData.dueToday.length : '—'}</strong>
            </div>
            <div>
              <span>Due within 7 days</span>
              <strong>{hasLoadedData ? dashboardData.dueSoon.length : '—'}</strong>
            </div>
          </div>
          <div className="summary-list-block">
            {!hasLoadedData ? (
              <p className="empty-associated-list">Overdue work orders will appear after dashboard data loads successfully.</p>
            ) : dashboardData.overdues.length === 0 ? (
              <p className="empty-associated-list">No overdue jobs are currently recorded.</p>
            ) : (
              dashboardData.overdues.slice(0, 5).map((workOrder) => (
                <div key={workOrder.id} className="list-item-row">
                  <Link to={`/work-orders/${workOrder.id}`}>{workOrder.id}</Link>
                  <span>{workOrder.title}</span>
                  <strong>{formatWorkOrderDate(workOrder.scheduledDate)}</strong>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="details-panel">
          <div className="details-panel-heading">
            <h2>Completed versus outstanding</h2>
            <CheckCircle2 size={18} aria-hidden="true" />
          </div>
          <div className="mini-list">
            <div>
              <span>Completed</span>
              <strong>{hasLoadedData ? dashboardData.completed : '—'}</strong>
            </div>
            <div>
              <span>Outstanding</span>
              <strong>{hasLoadedData ? dashboardData.outstanding : '—'}</strong>
            </div>
            <div>
              <span>Completion rate</span>
              <strong>{hasLoadedData ? `${dashboardData.percentCompleted}%` : '—'}</strong>
            </div>
          </div>
          <div className="summary-list-block">
            {!hasLoadedData ? (
              <p className="empty-associated-list">Outstanding work orders will appear after dashboard data loads successfully.</p>
            ) : dashboardData.outstanding === 0 ? (
              <p className="empty-associated-list">All current work orders are complete or closed.</p>
            ) : (
              workOrders.filter((workOrder) => !finalStatuses.has(workOrder.status)).slice(0, 5).map((workOrder) => (
                <div key={workOrder.id} className="list-item-row">
                  <Link to={`/work-orders/${workOrder.id}`}>{workOrder.id}</Link>
                  <span>{workOrder.status}</span>
                  <StatusBadge status={workOrder.status} />
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      <section className="details-panel">
        <div className="details-panel-heading">
          <h2>SLA status</h2>
          <BarChart3 size={18} aria-hidden="true" />
        </div>
        {dashboardData.slaConfigured ? (
          <p className="notes-text">SLA fields are present in the loaded data. The current backend does not define a contractual threshold, so the dashboard shows the available scheduling data only.</p>
        ) : (
          <p className="notes-text">SLA configuration is not exposed by the existing backend API. No project SLA thresholds are being assumed or displayed.</p>
        )}
      </section>
    </section>
  )
}

export default DashboardPage
