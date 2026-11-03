import { ArrowLeft, Mail, Pencil, Phone, Wrench } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { useDirectoryData } from '../../data/useDirectoryData.js'
import DataLoadNotice from '../../components/DataLoadNotice.jsx'
import { formatWorkOrderDate } from '../../data/workOrders.js'
import { PriorityBadge, StatusBadge } from '../work-orders/WorkOrderBadges.jsx'
import { AvailabilityBadge, SkillList } from './TechniciansPage.jsx'
import TechniciansHeader from './TechniciansHeader.jsx'

function TechnicianDetailsPage() {
  const { technicianId } = useParams()
  const { technicians, workOrders, dataLoadStatus, error } = useDirectoryData()
  const technician = technicians.find((item) => item.id === technicianId)

  if (!technician) {
    return (
      <section className="page-area directory-page">
        <TechniciansHeader title="Technician Not Found" />
        <Link className="secondary-button" to="/technicians">Back to technicians</Link>
      </section>
    )
  }

  const assignedWorkOrders = workOrders.filter((workOrder) => workOrder.assignedTechnicianId === technician.id)

  return (
    <section className="page-area directory-page">
      <TechniciansHeader title={technician.fullName} />
      <DataLoadNotice status={dataLoadStatus} error={error} resourceName="Technicians and assignments" />

      <div className="details-back-link">
        <Link to="/technicians"><ArrowLeft size={16} aria-hidden="true" /> Back to technicians</Link>
        <Link className="secondary-button" to={`/technicians/${technician.id}/edit`}><Pencil size={16} aria-hidden="true" /> Edit technician</Link>
      </div>

      <div className="directory-details-grid">
        <section className="details-panel">
          <div className="details-panel-heading">
            <h2>Technician information</h2>
            <Wrench size={21} aria-hidden="true" />
          </div>
          <dl className="details-list">
            <div><dt>Technician ID</dt><dd>{technician.id}</dd></div>
            <div><dt>Availability</dt><dd><AvailabilityBadge availability={technician.availability} /></dd></div>
            <div><dt>Email</dt><dd><a className="text-link" href={`mailto:${technician.email}`}><Mail size={16} aria-hidden="true" /> {technician.email}</a></dd></div>
            <div><dt>Phone</dt><dd className="detail-icon-text"><Phone size={17} aria-hidden="true" /> {technician.phone}</dd></div>
            <div className="details-list-wide"><dt>Skills and service specialties</dt><dd><SkillList skills={technician.skills} /></dd></div>
          </dl>
        </section>

        <section className="details-panel assigned-work-orders-panel">
          <div className="details-panel-heading">
            <div>
              <h2>Assigned work orders</h2>
              <p>{assignedWorkOrders.length} work order{assignedWorkOrders.length === 1 ? '' : 's'}</p>
            </div>
          </div>
          <div className="technician-work-orders-wrapper">
            <table className="technician-work-orders-table">
              <thead>
                <tr>
                  <th scope="col">Work order</th>
                  <th scope="col">Priority</th>
                  <th scope="col">Scheduled</th>
                  <th scope="col">Status</th>
                </tr>
              </thead>
              <tbody>
                {assignedWorkOrders.map((workOrder) => (
                  <tr key={workOrder.id}>
                    <td><Link to={`/work-orders/${workOrder.id}`}><strong>{workOrder.id}</strong><span>{workOrder.title}</span></Link></td>
                    <td><PriorityBadge priority={workOrder.priority} /></td>
                    <td>{formatWorkOrderDate(workOrder.scheduledDate)}</td>
                    <td><StatusBadge status={workOrder.status} /></td>
                  </tr>
                ))}
                {assignedWorkOrders.length === 0 && (
                  <tr><td className="empty-table-cell" colSpan="4">No work orders are assigned to this technician.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </section>
  )
}

export default TechnicianDetailsPage
