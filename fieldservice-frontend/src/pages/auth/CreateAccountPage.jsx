import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useDirectoryData } from '../../data/useDirectoryData.js'

const initialValues = {
  userName: '',
  userEmail: '',
  phone: '',
  password: '',
  confirmPassword: '',
}

function CreateAccountPage() {
  const { register } = useDirectoryData()
  const [formValues, setFormValues] = useState(initialValues)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isComplete, setIsComplete] = useState(false)

  function handleChange(event) {
    const { name, value } = event.target
    setFormValues((currentValues) => ({ ...currentValues, [name]: value }))
    setError('')
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (formValues.password !== formValues.confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      await register(formValues)
      setIsComplete(true)
    } catch (requestError) {
      setError(requestError.message || 'Unable to create your account. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card" aria-labelledby="create-account-title">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true">K</span>
          <div>
            <span className="brand-name">KEYSTONE</span>
            <span className="brand-subtitle">Field Service Management</span>
          </div>
        </div>
        <h1 id="create-account-title">Create customer account</h1>
        {isComplete ? (
          <>
            <p>Your customer account has been created. You can now sign in.</p>
            <Link className="return-link" to="/sign-in">Go to sign in</Link>
          </>
        ) : (
          <>
            <p className="auth-intro">Customer accounts are for portal access. Staff roles are assigned by a manager.</p>
            <form className="auth-form" onSubmit={handleSubmit} noValidate>
              <div className="form-field">
                <label htmlFor="userName">Full name</label>
                <input id="userName" name="userName" value={formValues.userName} onChange={handleChange} required maxLength="100" />
              </div>
              <div className="form-field">
                <label htmlFor="userEmail">Email</label>
                <input id="userEmail" name="userEmail" type="email" value={formValues.userEmail} onChange={handleChange} required maxLength="254" />
              </div>
              <div className="form-field">
                <label htmlFor="phone">Phone <span className="field-optional">(optional)</span></label>
                <input id="phone" name="phone" type="tel" value={formValues.phone} onChange={handleChange} maxLength="30" />
              </div>
              <div className="form-field">
                <label htmlFor="password">Password</label>
                <input id="password" name="password" type="password" value={formValues.password} onChange={handleChange} required minLength="8" maxLength="72" />
              </div>
              <div className="form-field">
                <label htmlFor="confirmPassword">Confirm password</label>
                <input id="confirmPassword" name="confirmPassword" type="password" value={formValues.confirmPassword} onChange={handleChange} required minLength="8" maxLength="72" />
              </div>
              {error && <p className="field-error" role="alert">{error}</p>}
              <button className="primary-button" type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Creating account...' : 'Create account'}
              </button>
            </form>
            <p className="auth-support">Already have an account? <Link to="/sign-in">Sign in</Link></p>
          </>
        )}
      </section>
    </main>
  )
}

export default CreateAccountPage
