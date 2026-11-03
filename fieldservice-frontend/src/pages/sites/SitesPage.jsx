import { Eye, Search, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useDirectoryData } from '../../data/useDirectoryData.js'
import SitesHeader from './SitesHeader.jsx'
import DataLoadNotice from '../../components/DataLoadNotice.jsx'

function fullAddress(site) {
  return `${site.addressLine1}, ${site.city}, ${site.state} ${site.postalCode}`
}

function SitesPage() {
  const { customers, sites, dataLoadStatus, error } = useDirectoryData()
  const [searchParams, setSearchParams] = useSearchParams()
  const [search, setSearch] = useState('')
  const customerFilter = searchParams.get('customer') ?? ''

  const customersById = useMemo(() => new Map(customers.map((customer) => [customer.id, customer])), [customers])
  const filteredSites = useMemo(() => sites.filter((site) => {
    const customer = customersById.get(site.customerId)
    const searchText = search.trim().toLowerCase()
    const searchableText = [
      site.siteName,
      customer?.organization,
      site.addressLine1,
      site.city,
      site.state,
      site.contactName,
      site.contactPhone,
    ].join(' ').toLowerCase()

    return (!searchText || searchableText.includes(searchText))
      && (!customerFilter || site.customerId === customerFilter)
  }), [customerFilter, customersById, search, sites])

  function clearFilters() {
    setSearch('')
    setSearchParams({})
  }

  return (
    <section className="page-area directory-page">
      <SitesHeader
        title="Sites"
        description="Manage customer service locations, site contacts, access notes, and related work."
      />

      <DataLoadNotice status={dataLoadStatus} error={error} resourceName="Sites" />

      <section className="directory-filters sites-filters" aria-label="Site filters">
        <label className="search-field">
          <Search size={18} aria-hidden="true" />
          <span className="visually-hidden">Search sites</span>
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search site, customer, address, or contact" />
        </label>
        <label className="filter-field">
          <span>Customer</span>
          <select value={customerFilter} onChange={(event) => setSearchParams(event.target.value ? { customer: event.target.value } : {})}>
            <option value="">All customers</option>
            {customers.map((customer) => <option key={customer.id} value={customer.id}>{customer.organization}</option>)}
          </select>
        </label>
        <button className="secondary-button clear-filters" type="button" onClick={clearFilters}>
          <X size={16} aria-hidden="true" />
          Clear
        </button>
      </section>

      <p className="result-summary" aria-live="polite">
        {filteredSites.length} site{filteredSites.length === 1 ? '' : 's'} shown
      </p>

      <div className="entity-table-wrapper">
        <table className="entity-table">
          <thead>
            <tr>
              <th scope="col">Site name</th>
              <th scope="col">Customer organization</th>
              <th scope="col">Address</th>
              <th scope="col">Site contact</th>
              <th scope="col"><span className="visually-hidden">Actions</span></th>
            </tr>
          </thead>
          <tbody>
            {filteredSites.map((site) => {
              const customer = customersById.get(site.customerId)
              return (
                <tr key={site.id}>
                  <td><Link className="entity-main-link" to={`/sites/${site.id}`}>{site.siteName}</Link></td>
                  <td>{customer?.organization ?? 'Unknown customer'}</td>
                  <td className="address-cell">{fullAddress(site)}</td>
                  <td><span className="contact-cell"><strong>{site.contactName}</strong>{site.contactPhone}</span></td>
                  <td><Link className="table-action" to={`/sites/${site.id}`}><Eye size={16} aria-hidden="true" /> View</Link></td>
                </tr>
              )
            })}
            {filteredSites.length === 0 && (
              <tr><td className="empty-table-cell" colSpan="5">No sites match the current search and filters.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export default SitesPage
