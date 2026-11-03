import { useState } from 'react'
import { Link } from 'react-router-dom'
import { technicianAvailabilityOptions } from '../../data/mockTechnicians.js'

const emptyTechnician = {
  fullName: '',
  email: '',
  phone: '',
  skills: '',
  availability: 'Available',
}

function validateTechnician(values) {
  const errors = {}

  if (!values.fullName.trim()) errors.fullName = 'Enter the technician name.'
  if (!values.email.trim()) {
    errors.email = 'Enter an email address.'
  } else if (!/^\S+@\S+\.\S+$/.test(values.email)) {
    errors.email = 'Enter a valid email address.'
  }
  if (!values.phone.trim()) errors.phone = 'Enter a phone number.'
  if (!values.skills.trim()) errors.skills = 'Enter at least one skill or service specialty.'
  if (!values.availability) errors.availability = 'Select an availability status.'

  return errors
}

function prepareInitialValues(initialValues) {
  if (!initialValues) {
    return emptyTechnician
  }

  return {
    ...emptyTechnician,
    ...initialValues,
    skills: initialValues.skills.join(', '),
  }
}

function TechnicianForm({ initialValues, onSubmit, submitLabel, cancelTo }) {
  const [formValues, setFormValues] = useState(() => prepareInitialValues(initialValues))
  const [errors, setErrors] = useState({})
  const [submitError, setSubmitError] = useState('')

  function handleChange(event) {
    const { name, value } = event.target
    setFormValues((currentValues) => ({ ...currentValues, [name]: value }))
    setErrors((currentErrors) => ({ ...currentErrors, [name]: '' }))
    setSubmitError('')
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const nextErrors = validateTechnician(formValues)
    setErrors(nextErrors)

    if (Object.keys(nextErrors).length === 0) {
      const skills = formValues.skills.split(',').map((skill) => skill.trim()).filter(Boolean)
      try {
        await onSubmit({ ...formValues, skills })
      } catch (requestError) {
        setSubmitError(requestError.message || 'Unable to save the technician.')
      }
    }
  }

  return (
    <form className="directory-form" onSubmit={handleSubmit} noValidate>
      <section className="form-section">
        <div className="form-section-heading">
          <h2>Technician profile</h2>
          <p>Fields marked required must be completed.</p>
        </div>
        <div className="form-grid">
          <TechnicianField label="Full name" name="fullName" error={errors.fullName} required>
            <input id="fullName" name="fullName" value={formValues.fullName} onChange={handleChange} aria-invalid={Boolean(errors.fullName)} />
          </TechnicianField>
          <TechnicianField label="Availability" name="availability" error={errors.availability} required>
            <select id="availability" name="availability" value={formValues.availability} onChange={handleChange} aria-invalid={Boolean(errors.availability)}>
              {technicianAvailabilityOptions.map((availability) => <option key={availability}>{availability}</option>)}
            </select>
          </TechnicianField>
          <TechnicianField label="Email" name="email" error={errors.email} required>
            <input id="email" name="email" type="email" value={formValues.email} onChange={handleChange} aria-invalid={Boolean(errors.email)} />
          </TechnicianField>
          <TechnicianField label="Phone" name="phone" error={errors.phone} required>
            <input id="phone" name="phone" type="tel" value={formValues.phone} onChange={handleChange} aria-invalid={Boolean(errors.phone)} />
          </TechnicianField>
          <TechnicianField label="Skills and service specialties" name="skills" error={errors.skills} required className="form-field-wide">
            <input id="skills" name="skills" value={formValues.skills} onChange={handleChange} aria-invalid={Boolean(errors.skills)} placeholder="For example: HVAC service, electrical service" />
          </TechnicianField>
        </div>
      </section>
      {submitError && <p className="field-error" role="alert">{submitError}</p>}
      <div className="form-actions">
        <Link className="secondary-button" to={cancelTo}>Cancel</Link>
        <button className="primary-button" type="submit">{submitLabel}</button>
      </div>
    </form>
  )
}

function TechnicianField({ label, name, error, required, className = '', children }) {
  return (
    <div className={`form-field ${className}`}>
      <label htmlFor={name}>{label}{required && <span aria-hidden="true"> *</span>}</label>
      {children}
      {error && <p className="field-error" role="alert">{error}</p>}
    </div>
  )
}

export default TechnicianForm
