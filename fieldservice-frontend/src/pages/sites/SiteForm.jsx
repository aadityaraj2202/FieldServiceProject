import { useState } from 'react'
import { Link } from 'react-router-dom'

const emptySite = {
  siteName: '',
  customerId: '',
  addressLine1: '',
  city: '',
  state: '',
  postalCode: '',
  contactName: '',
  contactPhone: '',
  accessNotes: '',
}

function validateSite(values) {
  const errors = {}

  if (!values.siteName.trim()) errors.siteName = 'Enter a site name.'
  if (!values.customerId) errors.customerId = 'Select a customer.'
  if (!values.addressLine1.trim()) errors.addressLine1 = 'Enter the site address.'
  if (!values.city.trim()) errors.city = 'Enter the city.'
  if (!values.state.trim()) errors.state = 'Enter the state or region.'
  if (!values.postalCode.trim()) errors.postalCode = 'Enter the postal code.'
  if (!values.contactName.trim()) errors.contactName = 'Enter the site contact name.'
  if (!values.contactPhone.trim()) errors.contactPhone = 'Enter the site contact phone number.'

  return errors
}

function SiteForm({ customers, initialValues = emptySite, onSubmit, submitLabel, cancelTo }) {
  const [formValues, setFormValues] = useState({ ...emptySite, ...initialValues })
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
    const nextErrors = validateSite(formValues)
    setErrors(nextErrors)

    if (Object.keys(nextErrors).length === 0) {
      try {
        await onSubmit(formValues)
      } catch (requestError) {
        setSubmitError(requestError.message || 'Unable to save the site.')
      }
    }
  }

  return (
    <form className="directory-form" onSubmit={handleSubmit} noValidate>
      <section className="form-section">
        <div className="form-section-heading">
          <h2>Site and customer</h2>
          <p>Fields marked required must be completed.</p>
        </div>
        <div className="form-grid">
          <SiteField label="Site name" name="siteName" error={errors.siteName} required>
            <input id="siteName" name="siteName" value={formValues.siteName} onChange={handleChange} aria-invalid={Boolean(errors.siteName)} />
          </SiteField>
          <SiteField label="Customer organization" name="customerId" error={errors.customerId} required>
            <select id="customerId" name="customerId" value={formValues.customerId} onChange={handleChange} aria-invalid={Boolean(errors.customerId)}>
              <option value="">Select customer</option>
              {customers.map((customer) => <option key={customer.id} value={customer.id}>{customer.organization}</option>)}
            </select>
          </SiteField>
        </div>
      </section>

      <section className="form-section">
        <div className="form-section-heading">
          <h2>Site address</h2>
          <p>Provide the service location details.</p>
        </div>
        <div className="form-grid">
          <SiteField label="Address" name="addressLine1" error={errors.addressLine1} required className="form-field-wide">
            <input id="addressLine1" name="addressLine1" value={formValues.addressLine1} onChange={handleChange} aria-invalid={Boolean(errors.addressLine1)} />
          </SiteField>
          <SiteField label="City" name="city" error={errors.city} required>
            <input id="city" name="city" value={formValues.city} onChange={handleChange} aria-invalid={Boolean(errors.city)} />
          </SiteField>
          <SiteField label="State or region" name="state" error={errors.state} required>
            <input id="state" name="state" value={formValues.state} onChange={handleChange} aria-invalid={Boolean(errors.state)} />
          </SiteField>
          <SiteField label="Postal code" name="postalCode" error={errors.postalCode} required>
            <input id="postalCode" name="postalCode" value={formValues.postalCode} onChange={handleChange} aria-invalid={Boolean(errors.postalCode)} />
          </SiteField>
        </div>
      </section>

      <section className="form-section">
        <div className="form-section-heading">
          <h2>Site contact and access</h2>
          <p>Add the person to contact and any relevant access information.</p>
        </div>
        <div className="form-grid">
          <SiteField label="Site contact" name="contactName" error={errors.contactName} required>
            <input id="contactName" name="contactName" value={formValues.contactName} onChange={handleChange} aria-invalid={Boolean(errors.contactName)} />
          </SiteField>
          <SiteField label="Contact phone" name="contactPhone" error={errors.contactPhone} required>
            <input id="contactPhone" name="contactPhone" type="tel" value={formValues.contactPhone} onChange={handleChange} aria-invalid={Boolean(errors.contactPhone)} />
          </SiteField>
          <SiteField label="Access notes" name="accessNotes" className="form-field-wide">
            <textarea id="accessNotes" name="accessNotes" rows="4" value={formValues.accessNotes} onChange={handleChange} />
          </SiteField>
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

function SiteField({ label, name, error, required, className = '', children }) {
  return (
    <div className={`form-field ${className}`}>
      <label htmlFor={name}>{label}{required && <span aria-hidden="true"> *</span>}</label>
      {children}
      {error && <p className="field-error" role="alert">{error}</p>}
    </div>
  )
}

export default SiteForm
