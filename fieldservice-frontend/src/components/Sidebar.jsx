import { NavLink } from 'react-router-dom'
import { X } from 'lucide-react'
import { navigationItems } from '../data/navigation.js'

function Sidebar({ isOpen, onClose }) {
  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`} aria-label="Main navigation">
      <div className="brand">
        <span className="brand-mark" aria-hidden="true">K</span>
        <div>
          <span className="brand-name">KEYSTONE</span>
          <span className="brand-subtitle">Field Service Management</span>
        </div>
        <button className="close-sidebar" type="button" onClick={onClose} aria-label="Close navigation">
          <X size={18} aria-hidden="true" />
        </button>
      </div>

      <p className="sidebar-label">WORKSPACE</p>
      <nav className="main-navigation">
        {navigationItems.map(({ label, path, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            onClick={onClose}
          >
            <Icon size={18} aria-hidden="true" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-note">
        <strong>Initial frontend structure</strong>
        Navigation and module screens are prepared for future API integration.
      </div>
    </aside>
  )
}

export default Sidebar
