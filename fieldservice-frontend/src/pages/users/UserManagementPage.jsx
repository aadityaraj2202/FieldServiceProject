import { Pencil, Plus, Search, UserRound } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useDirectoryData } from '../../data/useDirectoryData.js'
import { userRoleOptions, userStatusOptions } from '../../data/mockUsers.js'

const emptyUser = {
  fullName: '',
  email: '',
  role: 'Customer',
  status: 'Active',
  technicianId: '',
  customerId: '',
}

function UserManagementPage() {
  const { users, technicians, customers, createUser, updateUser } = useDirectoryData()
  const [filters, setFilters] = useState({ search: '', role: '', status: '' })
  const [formValues, setFormValues] = useState(emptyUser)
  const [editingUserId, setEditingUserId] = useState('')

  const filteredUsers = useMemo(() => users.filter((user) => {
    const searchText = filters.search.trim().toLowerCase()
    const searchable = [user.fullName, user.email, user.role].join(' ').toLowerCase()

    return (!searchText || searchable.includes(searchText))
      && (!filters.role || user.role === filters.role)
      && (!filters.status || user.status === filters.status)
  }), [filters, users])

  function handleInputChange(event) {
    const { name, value } = event.target
    setFormValues((currentValues) => ({ ...currentValues, [name]: value }))
  }

  function handleSubmit(event) {
    event.preventDefault()
    const trimmedName = formValues.fullName.trim()
    const trimmedEmail = formValues.email.trim()

    if (!trimmedName || !trimmedEmail || !formValues.role) {
      return
    }

    const payload = {
      fullName: trimmedName,
      email: trimmedEmail,
      role: formValues.role,
      status: formValues.status,
      technicianId: formValues.role === 'Technician' ? formValues.technicianId : '',
      customerId: formValues.role === 'Customer' ? formValues.customerId : '',
    }

    if (editingUserId) {
      updateUser(editingUserId, payload)
    } else {
      createUser(payload)
    }

    setFormValues(emptyUser)
    setEditingUserId('')
  }

  function startEditing(user) {
    setEditingUserId(user.id)
    setFormValues({
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      status: user.status,
      technicianId: user.technicianId || '',
      customerId: user.customerId || '',
    })
  }

  return (
    <section className="page-area directory-page">
      <div className="directory-heading">
        <div className="page-heading">
          <p className="page-kicker">Project Keystone</p>
          <h1>User management</h1>
        </div>
      </div>

      <div className="user-management-grid">
        <section className="details-panel">
          <div className="details-panel-heading">
            <h2>{editingUserId ? 'Edit user' : 'Add user'}</h2>
            <UserRound size={18} aria-hidden="true" />
          </div>

          <form className="user-form" onSubmit={handleSubmit} noValidate>
            <div className="form-grid">
              <div className="form-field">
                <label htmlFor="fullName">Full name</label>
                <input id="fullName" name="fullName" value={formValues.fullName} onChange={handleInputChange} />
              </div>
              <div className="form-field">
                <label htmlFor="email">Email</label>
                <input id="email" name="email" type="email" value={formValues.email} onChange={handleInputChange} />
              </div>
              <div className="form-field">
                <label htmlFor="role">Role</label>
                <select id="role" name="role" value={formValues.role} onChange={handleInputChange}>
                  {userRoleOptions.map((role) => <option key={role}>{role}</option>)}
                </select>
              </div>
              <div className="form-field">
                <label htmlFor="status">Status</label>
                <select id="status" name="status" value={formValues.status} onChange={handleInputChange}>
                  {userStatusOptions.map((status) => <option key={status}>{status}</option>)}
                </select>
              </div>

              {formValues.role === 'Technician' && (
                <div className="form-field form-field-wide">
                  <label htmlFor="technicianId">Linked technician</label>
                  <select id="technicianId" name="technicianId" value={formValues.technicianId} onChange={handleInputChange}>
                    <option value="">Select technician</option>
                    {technicians.map((technician) => <option key={technician.id} value={technician.id}>{technician.fullName}</option>)}
                  </select>
                </div>
              )}

              {formValues.role === 'Customer' && (
                <div className="form-field form-field-wide">
                  <label htmlFor="customerId">Linked customer</label>
                  <select id="customerId" name="customerId" value={formValues.customerId} onChange={handleInputChange}>
                    <option value="">Select customer</option>
                    {customers.map((customer) => <option key={customer.id} value={customer.id}>{customer.organization}</option>)}
                  </select>
                </div>
              )}
            </div>

            <div className="form-actions">
              {editingUserId && (
                <button className="secondary-button" type="button" onClick={() => {
                  setEditingUserId('')
                  setFormValues(emptyUser)
                }}>Cancel</button>
              )}
              <button className="primary-button" type="submit">{editingUserId ? 'Save changes' : 'Add user'}</button>
            </div>
          </form>
        </section>

        <section className="details-panel">
          <div className="details-panel-heading">
            <h2>Users</h2>
            <Plus size={18} aria-hidden="true" />
          </div>

          <div className="user-filter-row">
            <label className="search-field">
              <Search size={18} aria-hidden="true" />
              <input name="search" value={filters.search} onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))} placeholder="Search name or email" />
            </label>
            <label className="filter-field">
              <span>Role</span>
              <select value={filters.role} onChange={(event) => setFilters((current) => ({ ...current, role: event.target.value }))}>
                <option value="">All roles</option>
                {userRoleOptions.map((role) => <option key={role}>{role}</option>)}
              </select>
            </label>
            <label className="filter-field">
              <span>Status</span>
              <select value={filters.status} onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))}>
                <option value="">All status</option>
                {userStatusOptions.map((status) => <option key={status}>{status}</option>)}
              </select>
            </label>
          </div>

          <div className="entity-table-wrapper">
            <table className="entity-table user-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Linked record</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => {
                  const linkedRecord = user.role === 'Technician'
                    ? technicians.find((tech) => tech.id === user.technicianId)
                    : user.role === 'Customer'
                      ? customers.find((customer) => customer.id === user.customerId)
                      : null

                  return (
                    <tr key={user.id}>
                      <td>{user.fullName}</td>
                      <td>{user.email}</td>
                      <td>{user.role}</td>
                      <td>{user.status}</td>
                      <td>
                        {linkedRecord ? (
                          user.role === 'Technician' ? <Link className="text-link" to={`/technicians/${linkedRecord.id}`}>{linkedRecord.fullName}</Link> : <Link className="text-link" to={`/customers/${linkedRecord.id}`}>{linkedRecord.organization}</Link>
                        ) : 'Not linked'}
                      </td>
                      <td><button className="secondary-button compact-button" type="button" onClick={() => startEditing(user)}><Pencil size={14} aria-hidden="true" /> Edit</button></td>
                    </tr>
                  )
                })}
                {filteredUsers.length === 0 && (
                  <tr><td colSpan="6" className="empty-table-cell">No users match the current filters.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </section>
  )
}

export default UserManagementPage
