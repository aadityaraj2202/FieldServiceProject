import { Eye, Search, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { technicianAvailabilityOptions } from '../../data/mockTechnicians.js'
import { useDirectoryData } from '../../data/useDirectoryData.js'
import TechniciansHeader from './TechniciansHeader.jsx'
import DataLoadNotice from '../../components/DataLoadNotice.jsx'

const initialFilters = { search: '', availability: '', skill: '' }

function TechniciansPage() {
  const { technicians, workOrders, dataLoadStatus, error } = useDirectoryData()
  const [filters, setFilters] = useState(initialFilters)
  const skillOptions = useMemo(() => [...new Set(technicians.flatMap((technician) => technician.skills))].sort(), [technicians])

  const filteredTechnicians = useMemo(() => technicians.filter((technician) => {
    const searchText = filters.search.trim().toLowerCase()
    const searchableText = [
      technician.fullName,
      technician.email,
      technician.phone,
      technician.skills.join(' '),
    ].join(' ').toLowerCase()

    return (!searchText || searchableText.includes(searchText))
      && (!filters.availability || technician.availability === filters.availability)
      && (!filters.skill || technician.skills.includes(filters.skill))
  }), [filters, technicians])

  function updateFilter(event) {
    const { name, value } = event.target
    setFilters((currentFilters) => ({ ...currentFilters, [name]: value }))
  }

  return (
    <section className="page-area directory-page">
      <TechniciansHeader
        title="Technicians"
        description="Manage technician profiles, service specialties, availability, and current assignments."
      />

      <DataLoadNotice status={dataLoadStatus} error={error} resourceName="Technicians and assignments" />

      <section className="technician-filters" aria-label="Technician filters">
        <label className="search-field">
          <Search size={18} aria-hidden="true" />
          <span className="visually-hidden">Search technicians</span>
          <input name="search" value={filters.search} onChange={updateFilter} placeholder="Search name, email, phone, or skill" />
        </label>
        <label className="filter-field">
          <span>Availability</span>
          <select name="availability" value={filters.availability} onChange={updateFilter}>
            <option value="">All availability</option>
            {technicianAvailabilityOptions.map((availability) => <option key={availability}>{availability}</option>)}
          </select>
        </label>
        <label className="filter-field">
          <span>Skill</span>
          <select name="skill" value={filters.skill} onChange={updateFilter}>
            <option value="">All skills</option>
            {skillOptions.map((skill) => <option key={skill}>{skill}</option>)}
          </select>
        </label>
        <button className="secondary-button clear-filters" type="button" onClick={() => setFilters(initialFilters)}>
          <X size={16} aria-hidden="true" />
          Clear
        </button>
      </section>

      <p className="result-summary" aria-live="polite">
        {filteredTechnicians.length} technician{filteredTechnicians.length === 1 ? '' : 's'} shown
      </p>

      <div className="entity-table-wrapper">
        <table className="entity-table technician-table">
          <thead>
            <tr>
              <th scope="col">Technician</th>
              <th scope="col">Contact information</th>
              <th scope="col">Skills</th>
              <th scope="col">Availability</th>
              <th scope="col">Assigned work orders</th>
              <th scope="col"><span className="visually-hidden">Actions</span></th>
            </tr>
          </thead>
          <tbody>
            {filteredTechnicians.map((technician) => {
              const assignmentCount = workOrders.filter((workOrder) => workOrder.assignedTechnicianId === technician.id).length
              return (
                <tr key={technician.id}>
                  <td><Link className="entity-main-link" to={`/technicians/${technician.id}`}>{technician.fullName}</Link></td>
                  <td><span className="contact-cell"><a className="text-link" href={`mailto:${technician.email}`}>{technician.email}</a>{technician.phone}</span></td>
                  <td><SkillList skills={technician.skills} /></td>
                  <td><AvailabilityBadge availability={technician.availability} /></td>
                  <td>{assignmentCount} work order{assignmentCount === 1 ? '' : 's'}</td>
                  <td><Link className="table-action" to={`/technicians/${technician.id}`}><Eye size={16} aria-hidden="true" /> View</Link></td>
                </tr>
              )
            })}
            {filteredTechnicians.length === 0 && (
              <tr><td className="empty-table-cell" colSpan="6">No technicians match the current search and filters.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export function SkillList({ skills }) {
  return <span className="skill-list">{skills.map((skill) => <span key={skill}>{skill}</span>)}</span>
}

export function AvailabilityBadge({ availability }) {
  return <span className={`availability-badge availability-${availability.toLowerCase()}`}>{availability}</span>
}

export default TechniciansPage
