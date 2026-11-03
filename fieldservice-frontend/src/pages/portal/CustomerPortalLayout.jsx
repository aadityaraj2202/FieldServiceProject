import { Home, ListOrdered, PlusCircle, UserRound } from 'lucide-react'
import { Link, NavLink, Outlet, useLocation, useNavigate, useOutletContext } from 'react-router-dom'
import { useDirectoryData } from '../../data/useDirectoryData.js'

function CustomerPortalLayout() {
  const { customers } = useDirectoryData()
  const location = useLocation()
  const navigate = useNavigate()
  const outletContext = useOutletContext?.() ?? {}
  const customerQuery = new URLSearchParams(location.search).get('customer')
  const selectedCustomerId = customerQuery || outletContext.selectedCustomerId || customers[0]?.id || ''
  const selectedCustomer = customers.find((customer) => customer.id === selectedCustomerId) ?? customers[0]

  return (
    <div className="portal-shell">
      <header className="portal-header">
        <div className="portal-header-copy">
          <p className="page-kicker">Project Keystone</p>
          <h1>Customer Portal</h1>
        </div>
        <div className="portal-header-actions">
          <label className="filter-field">
            <span>Customer</span>
            <select value={selectedCustomerId} onChange={(event) => {
              const nextCustomerId = event.target.value
              const nextPath = location.pathname.startsWith('/portal') ? location.pathname : '/portal'
              navigate(`${nextPath}?customer=${nextCustomerId}`)
            }}>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>{customer.organization}</option>
              ))}
            </select>
          </label>
          <Link className="secondary-button compact-button" to="/dashboard">Back to admin</Link>
        </div>
      </header>

      <nav className="portal-nav" aria-label="Customer portal navigation">
        <NavLink to="/portal" end className={({ isActive }) => `portal-nav-link ${isActive ? 'active' : ''}`}>
          <Home size={16} aria-hidden="true" />
          Home
        </NavLink>
        <NavLink to="/portal/work-orders" className={({ isActive }) => `portal-nav-link ${isActive ? 'active' : ''}`}>
          <ListOrdered size={16} aria-hidden="true" />
          My work orders
        </NavLink>
        <NavLink to="/portal/new-request" className={({ isActive }) => `portal-nav-link ${isActive ? 'active' : ''}`}>
          <PlusCircle size={16} aria-hidden="true" />
          New request
        </NavLink>
        <NavLink to="/portal/profile" className={({ isActive }) => `portal-nav-link ${isActive ? 'active' : ''}`}>
          <UserRound size={16} aria-hidden="true" />
          Profile
        </NavLink>
      </nav>

      <Outlet context={{ selectedCustomerId, selectedCustomer }} />
    </div>
  )
}

export default CustomerPortalLayout
