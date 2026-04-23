import { useState } from 'react'
import { hasSupabaseEnv, supabase } from '../supabase'

function LoginPage({ onNavigate }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setMessage('')

    if (!hasSupabaseEnv || !supabase) {
      setError('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY.')
      return
    }

    setLoading(true)

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('email')
      .eq('username', username)
      .single()

    if (profileError || !profile?.email) {
      setLoading(false)
      setError('Invalid username or password.')
      return
    }

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email: profile.email,
      password,
    })

    setLoading(false)

    if (signInError) {
      setError(signInError.message)
      return
    }

    const { data: signedInProfile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.session.user.id)
      .maybeSingle()

    setMessage('Logged in successfully.')
    const nextPath = signedInProfile?.role?.toLowerCase() === 'teacher' ? '/dashboard' : '/student'
    window.setTimeout(() => onNavigate(nextPath), 400)
  }

  return (
    <main className="login-page">
      <section className="login-card">
        <button
          className="back-link button-reset"
          type="button"
          onClick={() => onNavigate('/')}
        >
          Back to home
        </button>
        <p className="eyebrow">ProgCheck Login</p>
        <h1 className="login-title">Welcome back</h1>
        <p className="login-text">Log in with your username and password.</p>

        <form className="login-form" onSubmit={handleSubmit}>
          <label className="field">
            <span>Username</span>
            <input
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="your username"
              autoComplete="username"
              required
            />
          </label>

          <label className="field">
            <span>Password</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              autoComplete="current-password"
              required
            />
          </label>

          <button className="primary-button button-reset submit-button" type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Log in'}
          </button>
        </form>

        {error ? <p className="form-message error-message">{error}</p> : null}
        {message ? <p className="form-message success-message">{message}</p> : null}
      </section>
    </main>
  )
}

export default LoginPage
