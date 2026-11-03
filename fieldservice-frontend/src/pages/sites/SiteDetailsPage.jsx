import { ArrowLeft, Building2, MapPin, Pencil, Phone, UserRound, Wrench } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { useDirectoryData } from '../../data/useDirectoryData.js'
import DataLoadNotice from '../../components/DataLoadNotice.jsx'
import SitesHeader from './SitesHeader.jsx'

function SiteDetailsPage() {
  const { siteId } = useParams()
  const { customers, sites, workOrders, dataLoadStatus, error } = useDirectoryData()
  const site = sites.find((item) => item.id === siteId)
  const customer = customers.find((item) => item.id === site?.customerId)

  if (!site) {
    return (
      <section className="page-area directory-page">
        <SitesHeader title="Site Not Found" />
        <Link className="secondary-button" to="/sites">Back to sites</Link>
      </section>
    )
  }

  const relatedWorkOrders = workOrders.filter((workOrder) => workOrder.siteId === site.id)

  return (
    <section className="page-area directory-page">
      <SitesHeader title={site.siteName} description={customer?.organization ?? 'Customer association unavailable'} />
      <DataLoadNotice status={dataLoadStatus} error={error} resourceName="Sites" />

      <div className="details-back-link">
        <Link to="/sites"><ArrowLeft size={16} aria-hidden="true" /> Back to sites</Link>
        <Link className="secondary-button" to={`/sites/${site.id}/edit`}><Pencil size={16} aria-hidden="true" /> Edit site</Link>
      </div>

      <div className="directory-details-grid">
        <div className="directory-main-column">
          <section className="details-panel">
            <div className="details-panel-heading">
              <h2>Site information</h2>
              <MapPin size={21} aria-hidden="true" />
            </div>
            <dl className="details-list">
              <div><dt>Site name</dt><dd>{site.siteName}</dd></div>
              <div><dt>Site ID</dt><dd>{site.id}</dd></div>
              <div className="details-list-wide"><dt>Address</dt><dd>{site.addressLine1}, {site.city}, {site.state} {site.postalCode}</dd></div>
            </dl>
          </section>

          <section className="details-panel">
            <div className="details-panel-heading">
              <h2>Related work orders</h2>
              <Wrench size={21} aria-hidden="true" />
            </div>
            {relatedWorkOrders.length > 0 ? (
              <ul className="related-work-order-list">
                {relatedWorkOrders.map((workOrder) => (
                  <li key={workOrder.id}>
                    <Link to={`/work-orders/${workOrder.id}`}>{workOrder.id}</Link>
                    <span>{workOrder.title}</span>
                  </li>
                ))}
              </ul>
            ) : <p className="empty-associated-list">No work orders are associated with this site.</p>}
          </section>
        </div>

        <aside className="directory-side-column">
          <section className="details-panel">
            <h2>Customer</h2>
            {customer ? <Link className="customer-association-link" to={`/customers/${customer.id}`}><Building2 size={18} aria-hidden="true" /> {customer.organization}</Link> : <p className="empty-associated-list">Customer record unavailable.</p>}
          </section>
          <section className="details-panel">
            <h2>Site contact</h2>
            <p className="detail-icon-text"><UserRound size={18} aria-hidden="true" /> {site.contactName}</p>
            <p className="detail-icon-text"><Phone size={18} aria-hidden="true" /> {site.contactPhone}</p>
          </section>
          <section className="details-panel">
            <h2>Access notes</h2>
            <p className="notes-text">{site.accessNotes || 'No access notes have been added.'}</p>
          </section>
        </aside>
      </div>
    </section>
  )
}

export default SiteDetailsPage
