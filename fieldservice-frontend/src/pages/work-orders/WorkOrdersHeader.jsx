import { ClipboardList, Columns3, Plus } from 'lucide-react'
import { Link, NavLink } from 'react-router-dom'

function WorkOrdersHeader({ title, description }) {
  return (
    <div className="work-orders-heading">
      <div className="page-heading">
        <p className="page-kicker">Project Keystone</p>
        <h1>{title}</h1>
      </div>
      <div className="work-orders-heading-actions">
        <nav className="work-order-view-links" aria-label="Work order views">
          <NavLink end to="/work-orders" className={({ isActive }) => `view-link ${isActive ? 'active' : ''}`}>
            <ClipboardList size={16} aria-hidden="true" />
            List
          </NavLink>
          <NavLink to="/work-orders/kanban" className={({ isActive }) => `view-link ${isActive ? 'active' : ''}`}>
            <Columns3 size={16} aria-hidden="true" />
            Kanban
          </NavLink>
        </nav>
        <Link className="primary-button" to="/work-orders/new">
          <Plus size={17} aria-hidden="true" />
          Create work order
        </Link>
      </div>
    </div>
  )
}

export default WorkOrdersHeader
