import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useDirectoryData } from '../../data/useDirectoryData.js'

function SignInPage() {
  const { login } = useDirectoryData()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [formValues, setFormValues] = useState({ userEmail: '', password: '' })
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const logoutMessage = searchParams.get('loggedOut') === 'true'
    ? 'You have been logged out successfully.'
    : ''

  function handleChange(event) {
    const { name, value } = event.target
    setFormValues((currentValues) => ({ ...currentValues, [name]: value }))
    setError('')
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (!formValues.userEmail.trim() || !formValues.password.trim()) {
      setError('Please enter both your email and password.')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      await login(formValues)
      navigate('/dashboard', { replace: true })
    } catch (requestError) {
      setError(requestError.message || 'Unable to sign in. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card" aria-labelledby="sign-in-title">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true">K</span>
          <div>
            <span className="brand-name">KEYSTONE</span>
            <span className="brand-subtitle">Field Service Management</span>
          </div>
        </div>
        <h1 id="sign-in-title">Sign in</h1>
        {logoutMessage && <p className="auth-status" role="status">{logoutMessage}</p>}
        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="form-field">
            <label htmlFor="userEmail">Email</label>
            <input id="userEmail" name="userEmail" type="email" value={formValues.userEmail} onChange={handleChange} required />
          </div>
          <div className="form-field">
            <label htmlFor="password">Password</label>
            <input id="password" name="password" type="password" value={formValues.password} onChange={handleChange} required />
          </div>
          {error && <p className="field-error" role="alert">{error}</p>}
          <button className="primary-button" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
        <p className="auth-support">New customer? <Link to="/create-account">Create an account</Link></p>
        <Link className="return-link" to="/dashboard">View application shell</Link>
      </section>
    </main>
  )
}

export default SignInPage
