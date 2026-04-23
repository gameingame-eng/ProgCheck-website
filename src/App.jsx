import { useEffect, useState } from 'react'
import './App.css'
import { hasSupabaseEnv, supabase } from './supabase'
import AdminPage from './pages/AdminPage'
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
  const [assignedTeacher, setAssignedTeacher] = useState(null)
  const [studentSchedules, setStudentSchedules] = useState([])
  const [teachers, setTeachers] = useState([])
  const [students, setStudents] = useState([])
  const [assignments, setAssignments] = useState([])
  const [assignmentFeedback, setAssignmentFeedback] = useState('')
  const [assignmentError, setAssignmentError] = useState('')
  const [assignmentLoading, setAssignmentLoading] = useState(false)
  const [scheduleForm, setScheduleForm] = useState({
    studentId: '',
    title: '',
    details: '',
    scheduledFor: '',
    startTime: '',
    endTime: '',
  })

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
        setAssignedTeacher(null)
        setStudentSchedules([])
        setTeachers([])
        setStudents([])
        setAssignments([])
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
      setTeacherStudents([])
      setAssignedTeacher(null)
      setStudentSchedules([])
      setTeachers([])
      setStudents([])
      setAssignments([])
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
      const { data: teacherAssignments = [] } = await supabase
        .from('teacher_student_assignments')
        .select(`
          teacher_id,
          student_id,
          student:profiles!teacher_student_assignments_student_id_fkey(username)
        `)
        .eq('teacher_id', userId)

      if (!isMounted) {
        return
      }

      const mine = teacherAssignments.map((assignment) => ({
        id: assignment.student_id,
        username: assignment.student?.username ?? 'Unnamed student',
      }))

      setTeacherStudents(mine)
      setAssignments([])
      setTeachers([])
      setStudents([])
    }

    async function loadAdminData() {
      const [{ data: teacherProfiles = [] }, { data: studentProfiles = [] }, { data: assignmentRows = [] }] = await Promise.all([
        supabase.from('profiles').select('id, username').eq('role', 'teacher').order('username'),
        supabase.from('profiles').select('id, username').eq('role', 'student').order('username'),
        supabase
          .from('teacher_student_assignments')
          .select(`
            teacher_id,
            student_id,
            teacher:profiles!teacher_student_assignments_teacher_id_fkey(username),
            student:profiles!teacher_student_assignments_student_id_fkey(username)
          `),
      ])

      if (!isMounted) {
        return
      }

      setTeachers(teacherProfiles)
      setStudents(studentProfiles)
      setAssignments(
        assignmentRows.map((assignment) => ({
          teacherId: assignment.teacher_id,
          teacherName: assignment.teacher?.username ?? 'Unknown teacher',
          studentId: assignment.student_id,
          studentName: assignment.student?.username ?? 'Unknown student',
        })),
      )
      setTeacherStudents([])
      setAssignedTeacher(null)
    }

    async function loadStudentData() {
      const [{ data: assignment }, { data: schedules = [] }] = await Promise.all([
        supabase
          .from('teacher_student_assignments')
          .select(`
            teacher_id,
            teacher:profiles!teacher_student_assignments_teacher_id_fkey(username)
          `)
          .eq('student_id', userId)
          .maybeSingle(),
        supabase
          .from('student_schedules')
          .select('id, title, details, scheduled_for, start_time, end_time')
          .eq('student_id', userId)
          .order('created_at', { ascending: false }),
      ])

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
      setStudentSchedules(schedules)
      setTeachers([])
      setStudents([])
      setAssignments([])
    }

    setAssignmentFeedback('')
    setAssignmentError('')

    if (userRole === 'admin') {
      setTeacherStudents([])
      setAssignedTeacher(null)
      loadAdminData()
    }

    if (userRole === 'teacher') {
      setAssignedTeacher(null)
      loadTeacherData()
    }

    if (userRole === 'student') {
      setTeacherStudents([])
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

    if (path === '/dashboard' && isAuthenticated && userRole === 'admin') {
      window.history.replaceState({}, '', '/admin')
      setPath('/admin')
    }

    if (path === '/student' && !isAuthenticated) {
      window.history.replaceState({}, '', '/login')
      setPath('/login')
    }

    if (path === '/student' && isAuthenticated && userRole === 'teacher') {
      window.history.replaceState({}, '', '/dashboard')
      setPath('/dashboard')
    }

    if (path === '/student' && isAuthenticated && userRole === 'admin') {
      window.history.replaceState({}, '', '/admin')
      setPath('/admin')
    }

    if (path === '/admin' && !isAuthenticated) {
      window.history.replaceState({}, '', '/login')
      setPath('/login')
    }

    if (path === '/admin' && isAuthenticated && userRole === 'teacher') {
      window.history.replaceState({}, '', '/dashboard')
      setPath('/dashboard')
    }

    if (path === '/admin' && isAuthenticated && userRole === 'student') {
      window.history.replaceState({}, '', '/student')
      setPath('/student')
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

  async function handleAdminAssignStudent(studentId, teacherId) {
    if (!supabase || !userId) {
      return
    }

    setAssignmentLoading(true)
    setAssignmentFeedback('')
    setAssignmentError('')

    const { error } = await supabase
      .from('teacher_student_assignments')
      .upsert({
        teacher_id: teacherId,
        student_id: studentId,
        assigned_by: userId,
      }, { onConflict: 'student_id' })

    if (error) {
      setAssignmentLoading(false)
      setAssignmentError(error.message)
      return
    }

    const teacher = teachers.find((item) => item.id === teacherId)
    const student = students.find((item) => item.id === studentId)

    setAssignments((current) => {
      const filtered = current.filter((item) => item.studentId !== studentId)
      if (!teacher || !student) {
        return filtered
      }

      return [...filtered, {
        teacherId,
        teacherName: teacher.username,
        studentId,
        studentName: student.username,
      }].sort((a, b) => a.studentName.localeCompare(b.studentName))
    })
    setAssignmentLoading(false)
    setAssignmentFeedback('Teacher assignment saved.')
  }

  async function handleCreateSchedule() {
    if (!supabase || !userId || !scheduleForm.studentId || !scheduleForm.title.trim()) {
      setAssignmentError('Choose a student and add a schedule title.')
      return
    }

    if ((scheduleForm.startTime && !scheduleForm.endTime) || (!scheduleForm.startTime && scheduleForm.endTime)) {
      setAssignmentError('Choose both a start time and end time.')
      return
    }

    if (scheduleForm.startTime && scheduleForm.endTime && scheduleForm.startTime >= scheduleForm.endTime) {
      setAssignmentError('End time must be later than start time.')
      return
    }

    setAssignmentLoading(true)
    setAssignmentFeedback('')
    setAssignmentError('')

    const { error } = await supabase
      .from('student_schedules')
      .insert({
        student_id: scheduleForm.studentId,
        created_by: userId,
        title: scheduleForm.title.trim(),
        details: scheduleForm.details.trim(),
        scheduled_for: scheduleForm.scheduledFor || null,
        start_time: scheduleForm.startTime || null,
        end_time: scheduleForm.endTime || null,
      })

    setAssignmentLoading(false)

    if (error) {
      setAssignmentError(error.message)
      return
    }

    setScheduleForm({
      studentId: '',
      title: '',
      details: '',
      scheduledFor: '',
      startTime: '',
      endTime: '',
    })
    setAssignmentFeedback('Schedule created successfully.')
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
        onLogout={handleLogout}
        username={username}
      />
    )
  }

  if (path === '/student') {
    if (!authReady) {
      return null
    }

    return (
      <StudentPage
        assignedTeacher={assignedTeacher}
        onLogout={handleLogout}
        schedules={studentSchedules}
        username={username}
      />
    )
  }

  if (path === '/admin') {
    if (!authReady) {
      return null
    }

    return (
      <AdminPage
        assignmentError={assignmentError}
        assignmentFeedback={assignmentFeedback}
        assignmentLoading={assignmentLoading}
        assignments={assignments}
        onAssignStudent={handleAdminAssignStudent}
        onCreateSchedule={handleCreateSchedule}
        onLogout={handleLogout}
        onScheduleFormChange={setScheduleForm}
        scheduleForm={scheduleForm}
        students={students}
        teachers={teachers}
        username={username}
      />
    )
  }

  return <HomePage onNavigate={navigate} />
}

export default App
