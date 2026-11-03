import { useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar.jsx'
import Topbar from '../components/Topbar.jsx'
import { navigationItems } from '../data/navigation.js'
import { useDirectoryData } from '../data/useDirectoryData.js'

function ApplicationLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { logout } = useDirectoryData()

  const currentPage = navigationItems.find(
    (item) => pathname === item.path || pathname.startsWith(`${item.path}/`),
  )

  async function handleLogout() {
    await logout()
    navigate('/sign-in?loggedOut=true', { replace: true })
  }

  return (
    <div className="app-layout">
      {isSidebarOpen && (
        <button className="menu-scrim" type="button" onClick={() => setIsSidebarOpen(false)} aria-label="Close navigation" />
      )}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <main className="main-content">
        <Topbar
          title={currentPage?.label ?? 'KEYSTONE'}
          onOpenMenu={() => setIsSidebarOpen(true)}
          onLogout={handleLogout}
        />
        <Outlet />
      </main>
    </div>
  )
}

export default ApplicationLayout
