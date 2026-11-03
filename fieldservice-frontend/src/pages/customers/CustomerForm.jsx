import { useState } from 'react'
import { Link } from 'react-router-dom'

const emptyCustomer = {
  contactName: '',
  organization: '',
  email: '',
  phone: '',
  address: '',
}

function validateCustomer(values) {
  const errors = {}

  if (!values.contactName?.trim()) errors.contactName = 'Enter the primary contact name.'
  if (!values.organization?.trim()) errors.organization = 'Enter the customer or organization name.'
  if (!values.email?.trim()) {
    errors.email = 'Enter an email address.'
  } else if (!/^\S+@\S+\.\S+$/.test(values.email)) {
    errors.email = 'Enter a valid email address.'
  }
  if (!values.phone?.trim()) errors.phone = 'Enter a phone number.'
  if (!values.address?.trim()) errors.address = 'Enter a service address.'

  return errors
}

function CustomerForm({ initialValues = emptyCustomer, onSubmit, submitLabel, cancelTo }) {
  const [formValues, setFormValues] = useState({ ...emptyCustomer, ...initialValues })
  const [errors, setErrors] = useState({})
  const [submitError, setSubmitError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  function handleChange(event) {
    const { name, value } = event.target
    setFormValues((currentValues) => ({ ...currentValues, [name]: value }))
    setErrors((currentErrors) => ({ ...currentErrors, [name]: '' }))
    setSubmitError('')
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const nextErrors = validateCustomer(formValues)
    setErrors(nextErrors)

    if (Object.keys(nextErrors).length === 0) {
      setIsSubmitting(true)
      try {
        await onSubmit(formValues)
      } catch (requestError) {
        setSubmitError(requestError.message || 'Unable to save the customer.')
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  return (
    <form className="directory-form" onSubmit={handleSubmit} noValidate>
      <section className="form-section">
        <div className="form-section-heading">
          <h2>Customer details</h2>
          <p>Fields marked required must be completed.</p>
        </div>
        <div className="form-grid">
          <CustomerField label="Customer / Organization Name" name="organization" error={errors.organization} required>
            <input id="organization" name="organization" value={formValues.organization} onChange={handleChange} aria-invalid={Boolean(errors.organization)} />
          </CustomerField>
          <CustomerField label="Primary Contact Name" name="contactName" error={errors.contactName} required>
            <input id="contactName" name="contactName" value={formValues.contactName} onChange={handleChange} aria-invalid={Boolean(errors.contactName)} />
          </CustomerField>
          <CustomerField label="Email" name="email" error={errors.email} required>
            <input id="email" name="email" type="email" value={formValues.email} onChange={handleChange} aria-invalid={Boolean(errors.email)} />
          </CustomerField>
          <CustomerField label="Phone" name="phone" error={errors.phone} required>
            <input id="phone" name="phone" type="tel" value={formValues.phone} onChange={handleChange} aria-invalid={Boolean(errors.phone)} />
          </CustomerField>
          <CustomerField label="Address" name="address" error={errors.address} required className="form-field-wide">
            <input id="address" name="address" value={formValues.address} onChange={handleChange} aria-invalid={Boolean(errors.address)} />
          </CustomerField>
        </div>
      </section>
      {submitError && <p className="field-error" role="alert">{submitError}</p>}
      <div className="form-actions">
        <Link className="secondary-button" to={cancelTo}>Cancel</Link>
        <button className="primary-button" type="submit" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : submitLabel}</button>
      </div>
    </form>
  )
}

function CustomerField({ label, name, error, required, children }) {
  return (
    <div className="form-field">
      <label htmlFor={name}>{label}{required && <span aria-hidden="true"> *</span>}</label>
      {children}
      {error && <p className="field-error" role="alert">{error}</p>}
    </div>
  )
}

export default CustomerForm
