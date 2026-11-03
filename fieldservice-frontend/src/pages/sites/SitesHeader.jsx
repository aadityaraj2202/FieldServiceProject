import { Plus } from 'lucide-react'
import { Link } from 'react-router-dom'

function SitesHeader({ title, description }) {
  return (
    <div className="directory-heading">
      <div className="page-heading">
        <p className="page-kicker">Project Keystone</p>
        <h1>{title}</h1>
      </div>
      <Link className="primary-button" to="/sites/new">
        <Plus size={17} aria-hidden="true" />
        Add site
      </Link>
    </div>
  )
}

export default SitesHeader
