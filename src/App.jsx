import { useEffect, useState } from 'react'
import './App.css'
import { hasSupabaseEnv, supabase } from './supabase'
import DashboardPage from './pages/DashboardPage'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import StudentPage from './pages/StudentPage'

function App() {
  const [path, setPath] = useState(window.location.pathname)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userRole, setUserRole] = useState(null)
  const [username, setUsername] = useState('')
  const [authReady, setAuthReady] = useState(false)

  useEffect(() => {
    function handlePopState() {
      setPath(window.location.pathname)
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  useEffect(() => {
    let isMounted = true

    async function syncAuthState(session) {
      if (!isMounted) {
        return
      }

      if (!hasSupabaseEnv || !supabase || !session?.user?.id) {
        setIsAuthenticated(false)
        setUserRole(null)
        setUsername('')
        setAuthReady(true)
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('username, role')
        .eq('id', session.user.id)
        .maybeSingle()

      if (!isMounted) {
        return
      }

      setIsAuthenticated(true)
      setUserRole(typeof profile?.role === 'string' ? profile.role.toLowerCase() : null)
      setUsername(profile?.username ?? '')
      setAuthReady(true)
    }

    if (!hasSupabaseEnv || !supabase) {
      setIsAuthenticated(false)
      setUserRole(null)
      setUsername('')
      setAuthReady(true)
      return undefined
    }

    supabase.auth.getSession().then(({ data }) => {
      syncAuthState(data.session)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      syncAuthState(session)
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (!authReady) {
      return
    }

    if (path === '/dashboard' && !isAuthenticated) {
      window.history.replaceState({}, '', '/login')
      setPath('/login')
    }

    if (path === '/dashboard' && isAuthenticated && userRole === 'student') {
      window.history.replaceState({}, '', '/student')
      setPath('/student')
    }

    if (path === '/student' && !isAuthenticated) {
      window.history.replaceState({}, '', '/login')
      setPath('/login')
    }
  }, [authReady, isAuthenticated, path, userRole])

  function navigate(nextPath) {
    window.history.pushState({}, '', nextPath)
    setPath(nextPath)
  }

  async function handleLogout() {
    if (hasSupabaseEnv && supabase) {
      await supabase.auth.signOut()
    }

    window.history.pushState({}, '', '/login')
    setPath('/login')
  }

  if (path === '/login') {
    return <LoginPage onNavigate={navigate} />
  }

  if (path === '/dashboard') {
    if (!authReady) {
      return null
    }

    return <DashboardPage onLogout={handleLogout} username={username} />
  }

  if (path === '/student') {
    if (!authReady) {
      return null
    }

    return <StudentPage onLogout={handleLogout} username={username} />
  }

  return <HomePage onNavigate={navigate} />
}

export default App
