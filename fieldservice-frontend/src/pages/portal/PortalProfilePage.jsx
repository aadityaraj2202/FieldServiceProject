import { Mail, MapPin, Phone, UserRound } from 'lucide-react'
import { Link, useOutletContext } from 'react-router-dom'
import { useDirectoryData } from '../../data/useDirectoryData.js'

function PortalProfilePage() {
  const { selectedCustomer } = useOutletContext()
  const { sites } = useDirectoryData()
  const customerSites = sites.filter((site) => site.customerId === selectedCustomer?.id)

  return (
    <div className="portal-page-wrap">
      <div className="portal-profile-grid">
        <section className="details-panel">
          <div className="details-panel-heading">
            <h2>Account profile</h2>
            <UserRound size={18} aria-hidden="true" />
          </div>
          <dl className="details-list">
            <div className="details-list-item"><dt>Organization</dt><dd>{selectedCustomer?.organization}</dd></div>
            <div className="details-list-item"><dt>Customer ID</dt><dd>{selectedCustomer?.id}</dd></div>
            <div className="details-list-item"><dt>Primary contact</dt><dd>{selectedCustomer?.contactName}</dd></div>
            <div className="details-list-item"><dt>Email</dt><dd><a className="text-link email-link" href={`mailto:${selectedCustomer?.email}`}><Mail size={16} aria-hidden="true" /> <span>{selectedCustomer?.email}</span></a></dd></div>
            <div className="details-list-item details-list-wide"><dt>Phone</dt><dd><span className="detail-icon-text"><Phone size={17} aria-hidden="true" /> <span>{selectedCustomer?.phone}</span></span></dd></div>
          </dl>
        </section>

        <section className="details-panel associated-sites-panel">
          <div className="details-panel-heading">
            <h2>Associated sites</h2>
            <MapPin size={18} aria-hidden="true" />
          </div>
          {customerSites.length === 0 ? (
            <p className="empty-associated-list">No sites are linked to this customer.</p>
          ) : (
            <ul className="associated-site-list">
              {customerSites.map((site) => (
                <li key={site.id}>
                  <Link to={`/sites/${site.id}`}>{site.siteName}</Link>
                  <span>{site.addressLine1}, {site.city}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  )
}

export default PortalProfilePage
