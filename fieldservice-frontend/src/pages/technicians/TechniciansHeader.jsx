import { Plus, Wrench } from 'lucide-react'
import { Link } from 'react-router-dom'

function TechniciansHeader({ title, description }) {
  return (
    <div className="directory-heading">
      <div className="page-heading">
        <p className="page-kicker">Project Keystone</p>
        <h1>{title}</h1>
      </div>
      <div className="work-orders-heading-actions">
        <Link className="secondary-button compact-button" to="/technicians/field-workflow">
          <Wrench size={16} aria-hidden="true" />
          Field workflow
        </Link>
        <Link className="primary-button" to="/technicians/new">
          <Plus size={17} aria-hidden="true" />
          Add technician
        </Link>
      </div>
    </div>
  )
}

export default TechniciansHeader
