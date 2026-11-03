import { Plus } from 'lucide-react'
import { Link } from 'react-router-dom'

function CustomersHeader({ title, description }) {
  return (
    <div className="directory-heading">
      <div className="page-heading">
        <p className="page-kicker">Project Keystone</p>
        <h1>{title}</h1>
      </div>
      <Link className="primary-button" to="/customers/new">
        <Plus size={17} aria-hidden="true" />
        Add customer
      </Link>
    </div>
  )
}

export default CustomersHeader
