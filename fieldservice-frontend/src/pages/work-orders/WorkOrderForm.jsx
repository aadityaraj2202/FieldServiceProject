import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  priorityOptions,
  serviceTypeOptions,
} from '../../data/workOrders.js'

const emptyForm = {
  title: '',
  description: '',
  customerId: '',
  siteId: '',
  serviceType: '',
  priority: '',
  scheduledDate: '',
  assignedTechnicianId: '',
}

function validateWorkOrder(values) {
  const errors = {}

  if (!values.title.trim()) errors.title = 'Enter a work order title.'
  if (!values.description.trim()) errors.description = 'Enter a service description.'
  if (!values.customerId) errors.customerId = 'Select a customer.'
  if (!values.siteId) errors.siteId = 'Select a site.'
  if (!values.serviceType) errors.serviceType = 'Select a service type.'
  if (!values.priority) errors.priority = 'Select a priority.'
  if (!values.scheduledDate) errors.scheduledDate = 'Choose a scheduled date.'

  return errors
}

function WorkOrderForm({ customers, sites, technicians, initialValues = emptyForm, onSubmit, submitLabel, cancelTo }) {
  const [formValues, setFormValues] = useState({ ...emptyForm, ...initialValues })
  const [errors, setErrors] = useState({})
  const [submitError, setSubmitError] = useState('')

  function handleChange(event) {
    const { name, value } = event.target
    setFormValues((currentValues) => ({
      ...currentValues,
      [name]: value,
      ...(name === 'customerId' ? { siteId: '' } : {}),
    }))
    setErrors((currentErrors) => ({ ...currentErrors, [name]: '' }))
    setSubmitError('')
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const nextErrors = validateWorkOrder(formValues)
    setErrors(nextErrors)

    if (Object.keys(nextErrors).length === 0) {
      try {
        await onSubmit(formValues)
      } catch (requestError) {
        setSubmitError(requestError.message || 'Unable to save the work order.')
      }
    }
  }

  const assignableTechnicians = technicians.filter((technician) => (
    technician.availability === 'Available' || technician.id === formValues.assignedTechnicianId
  ))
  const availableSites = sites.filter((site) => site.customerId === String(formValues.customerId))

  return (
    <form className="work-order-form" onSubmit={handleSubmit} noValidate>
      <div className="form-section">
        <div className="form-section-heading">
          <h2>Job information</h2>
          <p>Fields marked required must be completed.</p>
        </div>
        <div className="form-grid">
          <FormField label="Title" name="title" error={errors.title} required>
            <input id="title" name="title" value={formValues.title} onChange={handleChange} aria-invalid={Boolean(errors.title)} />
          </FormField>
          <FormField label="Service type" name="serviceType" error={errors.serviceType} required>
            <select id="serviceType" name="serviceType" value={formValues.serviceType} onChange={handleChange} aria-invalid={Boolean(errors.serviceType)}>
              <option value="">Select service type</option>
              {serviceTypeOptions.map((serviceType) => <option key={serviceType}>{serviceType}</option>)}
            </select>
          </FormField>
          <FormField label="Description" name="description" error={errors.description} required className="form-field-wide">
            <textarea id="description" name="description" rows="4" value={formValues.description} onChange={handleChange} aria-invalid={Boolean(errors.description)} />
          </FormField>
        </div>
      </div>

      <div className="form-section">
        <div className="form-section-heading">
          <h2>Customer and site</h2>
          <p>Choose the customer and location for this request.</p>
        </div>
        <div className="form-grid">
          <FormField label="Customer" name="customerId" error={errors.customerId} required>
            <select id="customerId" name="customerId" value={formValues.customerId} onChange={handleChange} aria-invalid={Boolean(errors.customerId)}>
              <option value="">Select customer</option>
              {customers.map((customer) => <option key={customer.id} value={customer.id}>{customer.organization}</option>)}
            </select>
          </FormField>
          <FormField label="Site" name="siteId" error={errors.siteId} required>
            <select id="siteId" name="siteId" value={formValues.siteId} onChange={handleChange} aria-invalid={Boolean(errors.siteId)} disabled={!formValues.customerId}>
              <option value="">Select site</option>
              {availableSites.map((site) => <option key={site.id} value={site.id}>{site.siteName}</option>)}
            </select>
          </FormField>
        </div>
      </div>

      <div className="form-section">
        <div className="form-section-heading">
          <h2>Scheduling and assignment</h2>
            <p>New work orders start in the New status. Only available technicians can be newly assigned.</p>
        </div>
        <div className="form-grid">
          <FormField label="Priority" name="priority" error={errors.priority} required>
            <select id="priority" name="priority" value={formValues.priority} onChange={handleChange} aria-invalid={Boolean(errors.priority)}>
              <option value="">Select priority</option>
              {priorityOptions.map((priority) => <option key={priority}>{priority}</option>)}
            </select>
          </FormField>
          <FormField label="Scheduled date" name="scheduledDate" error={errors.scheduledDate} required>
            <input id="scheduledDate" name="scheduledDate" type="date" value={formValues.scheduledDate} onChange={handleChange} aria-invalid={Boolean(errors.scheduledDate)} />
          </FormField>
          <FormField label="Assigned technician" name="assignedTechnicianId" className="form-field-wide">
            <select id="assignedTechnicianId" name="assignedTechnicianId" value={formValues.assignedTechnicianId} onChange={handleChange}>
              {!initialValues.assignedTechnicianId && <option value="">Unassigned</option>}
              {assignableTechnicians.map((technician) => (
                <option key={technician.id} value={technician.id}>
                  {technician.fullName} — {technician.availability}
                </option>
              ))}
            </select>
          </FormField>
        </div>
      </div>

      {submitError && <p className="field-error" role="alert">{submitError}</p>}
      <div className="form-actions">
        <Link className="secondary-button" to={cancelTo}>Cancel</Link>
        <button className="primary-button" type="submit">{submitLabel}</button>
      </div>
    </form>
  )
}

function FormField({ label, name, error, required, className = '', children }) {
  return (
    <div className={`form-field ${className}`}>
      <label htmlFor={name}>{label}{required && <span aria-hidden="true"> *</span>}</label>
      {children}
      {error && <p className="field-error" role="alert">{error}</p>}
    </div>
  )
}

export default WorkOrderForm
