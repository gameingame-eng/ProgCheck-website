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
  const [userId, setUserId] = useState('')
  const [authReady, setAuthReady] = useState(false)
  const [teacherStudents, setTeacherStudents] = useState([])
  const [availableStudents, setAvailableStudents] = useState([])
  const [assignedTeacher, setAssignedTeacher] = useState(null)
  const [assignmentFeedback, setAssignmentFeedback] = useState('')
  const [assignmentError, setAssignmentError] = useState('')
  const [assignmentLoading, setAssignmentLoading] = useState(false)

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
        setUserId('')
        setTeacherStudents([])
        setAvailableStudents([])
        setAssignedTeacher(null)
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
      setUserId(session.user.id)
      setAuthReady(true)
    }

    if (!hasSupabaseEnv || !supabase) {
      setIsAuthenticated(false)
      setUserRole(null)
      setUsername('')
      setUserId('')
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
    if (!authReady || !isAuthenticated || !userId || !supabase) {
      return
    }

    let isMounted = true

    async function loadTeacherData() {
      const [{ data: students = [] }, { data: assignments = [] }] = await Promise.all([
        supabase
          .from('profiles')
          .select('id, username')
          .eq('role', 'student')
          .order('username'),
        supabase
          .from('teacher_student_assignments')
          .select(`
            teacher_id,
            student_id,
            student:profiles!teacher_student_assignments_student_id_fkey(username)
          `),
      ])

      if (!isMounted) {
        return
      }

      const assignedStudentIds = new Set(assignments.map((assignment) => assignment.student_id))
      const mine = assignments
        .filter((assignment) => assignment.teacher_id === userId)
        .map((assignment) => ({
          id: assignment.student_id,
          username: assignment.student?.username ?? 'Unnamed student',
        }))
      const openStudents = students.filter((student) => !assignedStudentIds.has(student.id))

      setTeacherStudents(mine)
      setAvailableStudents(openStudents)
    }

    async function loadStudentData() {
      const { data: assignment } = await supabase
        .from('teacher_student_assignments')
        .select(`
          teacher_id,
          teacher:profiles!teacher_student_assignments_teacher_id_fkey(username)
        `)
        .eq('student_id', userId)
        .maybeSingle()

      if (!isMounted) {
        return
      }

      setAssignedTeacher(
        assignment
          ? {
              id: assignment.teacher_id,
              username: assignment.teacher?.username ?? 'Assigned teacher',
            }
          : null,
      )
    }

    setAssignmentFeedback('')
    setAssignmentError('')

    if (userRole === 'teacher') {
      setAssignedTeacher(null)
      loadTeacherData()
    }

    if (userRole === 'student') {
      setTeacherStudents([])
      setAvailableStudents([])
      loadStudentData()
    }

    return () => {
      isMounted = false
    }
  }, [authReady, isAuthenticated, userId, userRole])

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

    if (path === '/student' && isAuthenticated && userRole === 'teacher') {
      window.history.replaceState({}, '', '/dashboard')
      setPath('/dashboard')
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

  async function handleAssignStudent(studentId) {
    if (!supabase || !userId) {
      return
    }

    setAssignmentLoading(true)
    setAssignmentFeedback('')
    setAssignmentError('')

    const { error } = await supabase
      .from('teacher_student_assignments')
      .insert({
        teacher_id: userId,
        student_id: studentId,
        assigned_by: userId,
      })

    if (error) {
      setAssignmentLoading(false)
      setAssignmentError(error.message)
      return
    }

    const nextStudent = availableStudents.find((student) => student.id === studentId)

    setTeacherStudents((current) =>
      nextStudent ? [...current, nextStudent].sort((a, b) => a.username.localeCompare(b.username)) : current,
    )
    setAvailableStudents((current) => current.filter((student) => student.id !== studentId))
    setAssignmentLoading(false)
    setAssignmentFeedback('Student assigned successfully.')
  }

  if (path === '/login') {
    return <LoginPage onNavigate={navigate} />
  }

  if (path === '/dashboard') {
    if (!authReady) {
      return null
    }

    return (
      <DashboardPage
        assignedStudents={teacherStudents}
        assignmentError={assignmentError}
        assignmentFeedback={assignmentFeedback}
        assignmentLoading={assignmentLoading}
        availableStudents={availableStudents}
        onAssignStudent={handleAssignStudent}
        onLogout={handleLogout}
        username={username}
      />
    )
  }

  if (path === '/student') {
    if (!authReady) {
      return null
    }

    return <StudentPage assignedTeacher={assignedTeacher} onLogout={handleLogout} username={username} />
  }

  return <HomePage onNavigate={navigate} />
}

export default App
