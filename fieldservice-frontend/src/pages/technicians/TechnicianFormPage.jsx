import { Link, useNavigate, useParams } from 'react-router-dom'
import { useDirectoryData } from '../../data/useDirectoryData.js'
import TechnicianForm from './TechnicianForm.jsx'
import TechniciansHeader from './TechniciansHeader.jsx'
import DataLoadNotice from '../../components/DataLoadNotice.jsx'

function TechnicianFormPage() {
  const { technicianId } = useParams()
  const navigate = useNavigate()
  const { technicians, createTechnician, updateTechnician, dataLoadStatus, error } = useDirectoryData()
  const technician = technicians.find((item) => item.id === technicianId)
  const isEditing = Boolean(technicianId)

  if (isEditing && !technician) {
    return (
      <section className="page-area directory-page">
        <TechniciansHeader title="Technician Not Found" />
        <Link className="secondary-button" to="/technicians">Back to technicians</Link>
      </section>
    )
  }

  async function saveTechnician(values) {
    if (isEditing) {
      await updateTechnician(technician.id, values)
      navigate(`/technicians/${technician.id}`)
      return
    }

    const newTechnicianId = await createTechnician(values)
    navigate(`/technicians/${newTechnicianId}`)
  }

  return (
    <section className="page-area directory-page">
      <TechniciansHeader
        title={isEditing ? `Edit ${technician.fullName}` : 'Add Technician'}
        description={isEditing ? 'Update technician profile and availability.' : 'Add a technician profile, skills, and availability.'}
      />
      <DataLoadNotice status={dataLoadStatus} error={error} resourceName="Technicians" />
      <TechnicianForm
        initialValues={technician}
        onSubmit={saveTechnician}
        submitLabel={isEditing ? 'Save technician' : 'Add technician'}
        cancelTo={isEditing ? `/technicians/${technician.id}` : '/technicians'}
      />
    </section>
  )
}

export default TechnicianFormPage
