import { Link } from 'react-router-dom'

function NotFoundPage() {
  return (
    <section className="page-area empty-state-panel" aria-live="polite">
      <div className="empty-state-card">
        <p className="page-kicker">Project Keystone</p>
        <h1>Page not found</h1>
        <p>The route you requested does not exist.</p>
        <Link className="primary-button" to="/dashboard">Return to dashboard</Link>
      </div>
    </section>
  )
}

export default NotFoundPage
