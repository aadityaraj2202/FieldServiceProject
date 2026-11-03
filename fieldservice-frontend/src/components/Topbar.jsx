import { Menu } from 'lucide-react'

function Topbar({ title, onOpenMenu, onLogout }) {
  return (
    <header className="topbar">
      <h2 className="topbar-title">
        <button className="menu-button" type="button" onClick={onOpenMenu} aria-label="Open navigation">
          <Menu size={20} aria-hidden="true" />
        </button>
        {title}
      </h2>

      <div className="topbar-actions">
        <span className="topbar-context">Field Service Management Platform</span>
        <button className="logout-button" type="button" onClick={onLogout} aria-label="Log out">
          Logout
        </button>
      </div>
    </header>
  )
}

export default Topbar
