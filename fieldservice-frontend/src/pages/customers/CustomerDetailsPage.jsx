import { ArrowLeft, Building2, Mail, MapPin, Pencil, Phone, UserRound } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { useDirectoryData } from '../../data/useDirectoryData.js'
import DataLoadNotice from '../../components/DataLoadNotice.jsx'
import CustomersHeader from './CustomersHeader.jsx'

function CustomerDetailsPage() {
  const { customerId } = useParams()
  const { customers, sites, dataLoadStatus, error } = useDirectoryData()
  const customer = customers.find((item) => item.id === customerId)

  if (!customer) {
    return (
      <section className="page-area directory-page">
        <CustomersHeader title="Customer Not Found" />
        <Link className="secondary-button" to="/customers">Back to customers</Link>
      </section>
    )
  }

  const customerSites = sites.filter((site) => site.customerId === customer.id)

  return (
    <section className="page-area directory-page">
      <CustomersHeader title={customer.organization} description={`Customer contact: ${customer.contactName}`} />
      <DataLoadNotice status={dataLoadStatus} error={error} resourceName="Customers" />

      <div className="details-back-link">
        <Link to="/customers"><ArrowLeft size={16} aria-hidden="true" /> Back to customers</Link>
        <Link className="secondary-button" to={`/customers/${customer.id}/edit`}><Pencil size={16} aria-hidden="true" /> Edit customer</Link>
      </div>

      <div className="directory-details-grid">
        <section className="details-panel">
          <div className="details-panel-heading">
            <h2>Organization and contact</h2>
            <Building2 size={21} aria-hidden="true" />
          </div>
          <dl className="details-list">
            <div><dt>Organization</dt><dd>{customer.organization}</dd></div>
            <div><dt>Customer ID</dt><dd>{customer.id}</dd></div>
            <div><dt>Primary contact</dt><dd className="detail-icon-text"><UserRound size={17} aria-hidden="true" /> {customer.contactName}</dd></div>
            <div><dt>Email</dt><dd><a className="text-link" href={`mailto:${customer.email}`}><Mail size={16} aria-hidden="true" /> {customer.email}</a></dd></div>
            <div className="details-list-wide"><dt>Phone</dt><dd className="detail-icon-text"><Phone size={17} aria-hidden="true" /> {customer.phone}</dd></div>
          </dl>
        </section>

        <section className="details-panel associated-sites-panel">
          <div className="details-panel-heading">
            <div>
              <h2>Associated sites</h2>
              <p>{customerSites.length} service location{customerSites.length === 1 ? '' : 's'}</p>
            </div>
            <Link className="secondary-button compact-button" to={`/sites?customer=${customer.id}`}>
              <MapPin size={15} aria-hidden="true" /> View sites
            </Link>
          </div>
          {customerSites.length > 0 ? (
            <ul className="associated-site-list">
              {customerSites.map((site) => (
                <li key={site.id}>
                  <Link to={`/sites/${site.id}`}>{site.siteName}</Link>
                  <span>{site.addressLine1}, {site.city}</span>
                </li>
              ))}
            </ul>
          ) : <p className="empty-associated-list">No sites are associated with this customer yet.</p>}
        </section>
      </div>
    </section>
  )
}

export default CustomerDetailsPage
