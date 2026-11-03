import { useState } from 'react'
import { useNavigate, useOutletContext } from 'react-router-dom'
import { useDirectoryData } from '../../data/useDirectoryData.js'
import { priorityOptions } from '../../data/workOrders.js'

const emptyRequest = {
  title: '',
  serviceType: '',
  description: '',
  priority: '',
  siteId: '',
  scheduledDate: '',
}

function PortalServiceRequestPage() {
  const navigate = useNavigate()
  const { selectedCustomer } = useOutletContext()
  const { sites, createWorkOrder } = useDirectoryData()
  const [formValues, setFormValues] = useState(emptyRequest)
  const [errors, setErrors] = useState({})

  const customerSites = sites.filter((site) => site.customerId === selectedCustomer?.id)

  function handleChange(event) {
    const { name, value } = event.target
    setFormValues((currentValues) => ({ ...currentValues, [name]: value }))
    setErrors((currentErrors) => ({ ...currentErrors, [name]: '' }))
  }

  function validate(values) {
    const nextErrors = {}
    if (!values.title.trim()) nextErrors.title = 'Enter a short request title.'
    if (!values.serviceType) nextErrors.serviceType = 'Select a service type.'
    if (!values.description.trim()) nextErrors.description = 'Describe the issue or service needed.'
    if (!values.priority) nextErrors.priority = 'Select a priority level.'
    if (!values.siteId) nextErrors.siteId = 'Select the site for this request.'
    if (!values.scheduledDate) nextErrors.scheduledDate = 'Choose a requested date.'
    return nextErrors
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const nextErrors = validate(formValues)
    setErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) {
      return
    }

    const selectedSite = sites.find((site) => site.id === formValues.siteId)
    await createWorkOrder({
      title: formValues.title.trim(),
      description: formValues.description.trim(),
      customer: selectedCustomer.organization,
      customerId: selectedCustomer.id,
      site: selectedSite.siteName,
      siteId: selectedSite.id,
      serviceType: formValues.serviceType,
      priority: formValues.priority,
      scheduledDate: formValues.scheduledDate,
      assignedTechnicianId: '',
      status: 'New',
      submittedAt: new Date().toISOString(),
      history: [{ status: 'New', changedAt: new Date().toISOString(), note: 'Customer portal request submitted.' }],
    })

    navigate('/portal/work-orders')
  }

  return (
    <section className="portal-page-wrap">
      <div className="details-panel">
        <div className="details-panel-heading">
          <h2>Create service request</h2>
        </div>

        <form className="customer-request-form" onSubmit={handleSubmit} noValidate>
          <div className="form-grid">
            <div className="form-field">
              <label htmlFor="title">Request title</label>
              <input id="title" name="title" value={formValues.title} onChange={handleChange} aria-invalid={Boolean(errors.title)} />
              {errors.title && <p className="field-error">{errors.title}</p>}
            </div>
            <div className="form-field">
              <label htmlFor="serviceType">Service type</label>
              <select id="serviceType" name="serviceType" value={formValues.serviceType} onChange={handleChange} aria-invalid={Boolean(errors.serviceType)}>
                <option value="">Select service type</option>
                {['Preventive maintenance', 'Electrical service', 'HVAC service', 'Plumbing service', 'Equipment inspection'].map((serviceType) => (
                  <option key={serviceType}>{serviceType}</option>
                ))}
              </select>
              {errors.serviceType && <p className="field-error">{errors.serviceType}</p>}
            </div>
            <div className="form-field form-field-wide">
              <label htmlFor="description">Problem or service description</label>
              <textarea id="description" name="description" value={formValues.description} onChange={handleChange} aria-invalid={Boolean(errors.description)} />
              {errors.description && <p className="field-error">{errors.description}</p>}
            </div>
            <div className="form-field">
              <label htmlFor="siteId">Site</label>
              <select id="siteId" name="siteId" value={formValues.siteId} onChange={handleChange} aria-invalid={Boolean(errors.siteId)}>
                <option value="">Select a site</option>
                {customerSites.map((site) => <option key={site.id} value={site.id}>{site.siteName}</option>)}
              </select>
              {errors.siteId && <p className="field-error">{errors.siteId}</p>}
            </div>
            <div className="form-field">
              <label htmlFor="priority">Priority</label>
              <select id="priority" name="priority" value={formValues.priority} onChange={handleChange} aria-invalid={Boolean(errors.priority)}>
                <option value="">Select priority</option>
                {priorityOptions.map((priority) => <option key={priority}>{priority}</option>)}
              </select>
              {errors.priority && <p className="field-error">{errors.priority}</p>}
            </div>
            <div className="form-field">
              <label htmlFor="scheduledDate">Requested date</label>
              <input id="scheduledDate" name="scheduledDate" type="date" value={formValues.scheduledDate} onChange={handleChange} aria-invalid={Boolean(errors.scheduledDate)} />
              {errors.scheduledDate && <p className="field-error">{errors.scheduledDate}</p>}
            </div>
          </div>

          <div className="form-actions">
            <button className="primary-button" type="submit">Submit service request</button>
          </div>
        </form>
      </div>
    </section>
  )
}

export default PortalServiceRequestPage
