import { Eye, Search, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useDirectoryData } from '../../data/useDirectoryData.js'
import CustomersHeader from './CustomersHeader.jsx'
import DataLoadNotice from '../../components/DataLoadNotice.jsx'

const initialFilters = { search: '', siteCoverage: '' }

function CustomersPage() {
  const { customers, sites, dataLoadStatus, error } = useDirectoryData()
  const [filters, setFilters] = useState(initialFilters)

  const filteredCustomers = useMemo(() => customers.filter((customer) => {
    const searchText = filters.search.trim().toLowerCase()
    const searchableText = [
      customer.contactName,
      customer.organization,
      customer.email,
      customer.phone,
    ].join(' ').toLowerCase()
    const siteCount = sites.filter((site) => site.customerId === customer.id).length

    return (!searchText || searchableText.includes(searchText))
      && (!filters.siteCoverage || (filters.siteCoverage === 'with-sites' ? siteCount > 0 : siteCount === 0))
  }), [customers, filters, sites])

  function updateFilter(event) {
    const { name, value } = event.target
    setFilters((currentFilters) => ({ ...currentFilters, [name]: value }))
  }

  return (
    <section className="page-area directory-page">
      <CustomersHeader
        title="Customers"
        description="Manage customer organizations, primary contacts, and their service locations."
      />

      <DataLoadNotice status={dataLoadStatus} error={error} resourceName="Customers" />

      <section className="directory-filters" aria-label="Customer filters">
        <label className="search-field">
          <Search size={18} aria-hidden="true" />
          <span className="visually-hidden">Search customers</span>
          <input name="search" value={filters.search} onChange={updateFilter} placeholder="Search name, email, phone, or organization" />
        </label>
        <label className="filter-field">
          <span>Sites</span>
          <select name="siteCoverage" value={filters.siteCoverage} onChange={updateFilter}>
            <option value="">All customers</option>
            <option value="with-sites">Customers with sites</option>
            <option value="without-sites">Customers without sites</option>
          </select>
        </label>
        <button className="secondary-button clear-filters" type="button" onClick={() => setFilters(initialFilters)}>
          <X size={16} aria-hidden="true" />
          Clear
        </button>
      </section>

      <p className="result-summary" aria-live="polite">
        {filteredCustomers.length} customer{filteredCustomers.length === 1 ? '' : 's'} shown
      </p>

      <div className="entity-table-wrapper">
        <table className="entity-table">
          <thead>
            <tr>
              <th scope="col">Customer name</th>
              <th scope="col">Organization</th>
              <th scope="col">Email</th>
              <th scope="col">Phone</th>
              <th scope="col">Sites</th>
              <th scope="col"><span className="visually-hidden">Actions</span></th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.map((customer) => {
              const siteCount = sites.filter((site) => site.customerId === customer.id).length
              return (
                <tr key={customer.id}>
                  <td><Link className="entity-main-link" to={`/customers/${customer.id}`}>{customer.contactName}</Link></td>
                  <td>{customer.organization}</td>
                  <td><a className="text-link" href={`mailto:${customer.email}`}>{customer.email}</a></td>
                  <td>{customer.phone}</td>
                  <td><Link className="site-count-link" to={`/sites?customer=${customer.id}`}>{siteCount} site{siteCount === 1 ? '' : 's'}</Link></td>
                  <td><Link className="table-action" to={`/customers/${customer.id}`}><Eye size={16} aria-hidden="true" /> View</Link></td>
                </tr>
              )
            })}
            {filteredCustomers.length === 0 && (
              <tr><td className="empty-table-cell" colSpan="6">No customers match the current search and filters.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export default CustomersPage
