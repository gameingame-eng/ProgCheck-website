import { useEffect, useState } from 'react'
import './App.css'
import { hasSupabaseEnv, supabase } from './supabase'

const highlights = [
  {
    title: 'Fix grading bottlenecks',
    text: 'Keep classes moving with quick edits, cleaner comments, and fewer repetitive clicks.',
  },
  {
    title: 'See student progress faster',
    text: 'Spot missing work, trends, and next steps before grades turn into a fire drill.',
  },
  {
    title: 'Make feedback feel personal',
    text: 'Reuse your best notes, then tailor them so every student gets something useful.',
  },
]

const stats = [
  { value: '4x', label: 'faster rubric updates' },
  { value: '100%', label: 'clearer grading workflow' },
  { value: '1', label: 'organized home for feedback' },
]

const steps = [
  'Import assignments and organize them by class, unit, or deadline.',
  'Review submissions with focused tools for comments, rubric changes, and revisions.',
  'Publish polished feedback without the mess of scattered notes and spreadsheets.',
]

function HomePage({ onNavigate }) {
  return (
    <main>
      <section className="hero-section">
        <div className="hero-copy">
          <p className="eyebrow">ProgCheck</p>
          <h1>Grade your assignments quick, fast, and easy.</h1>
          <p className="hero-text">
            A new grading workflow that helps you spend less time on busywork and
            more time on feedback that helps students grow.
          </p>
          <div className="hero-actions">
            <button
              className="primary-button button-reset"
              type="button"
              onClick={() => onNavigate('/login')}
            >
              Log in
            </button>
          </div>
          <div className="stat-row" aria-label="Product highlights">
            {stats.map((stat) => (
              <div className="stat-card" key={stat.label}>
                <strong>{stat.value}</strong>
                <span>{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="feature-band page-shell" id="features">
        {highlights.map((item) => (
          <article className="feature-card" key={item.title}>
            <p className="feature-kicker">Why teams switch</p>
            <h2>{item.title}</h2>
            <p>{item.text}</p>
          </article>
        ))}
      </section>

      <section className="workflow-section page-shell" id="workflow">
        <div className="workflow-copy">
          <p className="eyebrow">Simple flow</p>
          <h2>A homepage that feels normal, but not boring.</h2>
          <p>
            The layout stays familiar and easy to scan, while the visuals carry
            enough personality to make the product feel current and cared for.
          </p>
        </div>
        <div className="workflow-list">
          {steps.map((step, index) => (
            <div className="workflow-item" key={step}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              <p>{step}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}

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

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: profile.email,
      password,
    })

    setLoading(false)

    if (signInError) {
      setError(signInError.message)
      return
    }

    setMessage('Logged in successfully.')
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

function App() {
  const [path, setPath] = useState(window.location.pathname)

  useEffect(() => {
    function handlePopState() {
      setPath(window.location.pathname)
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  function navigate(nextPath) {
    window.history.pushState({}, '', nextPath)
    setPath(nextPath)
  }

  if (path === '/login') {
    return <LoginPage onNavigate={navigate} />
  }

  return <HomePage onNavigate={navigate} />
}

export default App
