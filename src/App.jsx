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
  const [teacherSchedules, setTeacherSchedules] = useState([])
  const [assignedTeacher, setAssignedTeacher] = useState(null)
  const [studentSchedules, setStudentSchedules] = useState([])
  const [teachers, setTeachers] = useState([])
  const [students, setStudents] = useState([])
  const [assignmentFeedback, setAssignmentFeedback] = useState('')
  const [assignmentError, setAssignmentError] = useState('')
  const [assignmentLoading, setAssignmentLoading] = useState(false)
  const [adminSchedules, setAdminSchedules] = useState([])
  const [scheduleForm, setScheduleForm] = useState({
    studentId: '',
    teacherId: '',
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
        setTeacherSchedules([])
        setAssignedTeacher(null)
        setStudentSchedules([])
        setTeachers([])
        setStudents([])
        setAdminSchedules([])
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
      setTeacherSchedules([])
      setAssignedTeacher(null)
      setStudentSchedules([])
      setTeachers([])
      setStudents([])
      setAdminSchedules([])
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
      const { data: teacherSchedules = [] } = await supabase
        .from('student_schedules')
        .select(`
          id,
          title,
          details,
          scheduled_for,
          start_time,
          end_time,
          teacher_id,
          student_id,
          student:profiles!student_schedules_student_id_fkey(username)
        `)
        .eq('teacher_id', userId)
        .order('scheduled_for', { ascending: true })
        .order('start_time', { ascending: true })

      if (!isMounted) {
        return
      }

      const uniqueStudents = new Map()
      teacherSchedules.forEach((schedule) => {
        if (!uniqueStudents.has(schedule.student_id)) {
          uniqueStudents.set(schedule.student_id, {
            id: schedule.student_id,
            username: schedule.student?.username ?? 'Unnamed student',
          })
        }
      })

      setTeacherStudents(Array.from(uniqueStudents.values()).sort((a, b) => a.username.localeCompare(b.username)))
      setTeacherSchedules(
        teacherSchedules.map((schedule) => ({
          id: schedule.id,
          title: schedule.title,
          details: schedule.details,
          scheduledFor: schedule.scheduled_for,
          startTime: schedule.start_time,
          endTime: schedule.end_time,
          studentName: schedule.student?.username ?? 'Unnamed student',
        })),
      )
      setTeachers([])
      setStudents([])
      setAdminSchedules([])
    }

    async function loadAdminData() {
      const [{ data: teacherProfiles = [] }, { data: studentProfiles = [] }, { data: scheduleRows = [] }] = await Promise.all([
        supabase.from('profiles').select('id, username').eq('role', 'teacher').order('username'),
        supabase.from('profiles').select('id, username').eq('role', 'student').order('username'),
        supabase
          .from('student_schedules')
          .select(`
            id,
            teacher_id,
            student_id,
            title,
            details,
            scheduled_for,
            start_time,
            end_time,
            teacher:profiles!student_schedules_teacher_id_fkey(username),
            student:profiles!student_schedules_student_id_fkey(username)
          `)
          .order('created_at', { ascending: false }),
      ])

      if (!isMounted) {
        return
      }

      setTeachers(teacherProfiles)
      setStudents(studentProfiles)
      setAdminSchedules(
        scheduleRows.map((schedule) => ({
          id: schedule.id,
          teacherId: schedule.teacher_id,
          teacherName: schedule.teacher?.username ?? 'Unknown teacher',
          studentId: schedule.student_id,
          studentName: schedule.student?.username ?? 'Unknown student',
          title: schedule.title,
          details: schedule.details,
          scheduledFor: schedule.scheduled_for,
          startTime: schedule.start_time,
          endTime: schedule.end_time,
        })),
      )
      setTeacherStudents([])
      setTeacherSchedules([])
      setAssignedTeacher(null)
    }

    async function loadStudentData() {
      const { data: schedules = [] } = await supabase
        .from('student_schedules')
        .select(`
          id,
          title,
          details,
          scheduled_for,
          start_time,
          end_time,
          teacher_id,
          teacher:profiles!student_schedules_teacher_id_fkey(username)
        `)
        .eq('student_id', userId)
        .order('created_at', { ascending: false })

      if (!isMounted) {
        return
      }

      const latestTeacher = schedules.find((schedule) => schedule.teacher_id)
      setAssignedTeacher(
        latestTeacher
          ? {
              id: latestTeacher.teacher_id,
              username: latestTeacher.teacher?.username ?? 'Assigned teacher',
            }
          : null,
      )
      setStudentSchedules(schedules)
      setTeacherSchedules([])
      setTeachers([])
      setStudents([])
      setAdminSchedules([])
    }

    setAssignmentFeedback('')
    setAssignmentError('')

    if (userRole === 'admin') {
      setTeacherStudents([])
      setTeacherSchedules([])
      setAssignedTeacher(null)
      setStudentSchedules([])
      loadAdminData()
    }

    if (userRole === 'teacher') {
      setAssignedTeacher(null)
      setStudentSchedules([])
      loadTeacherData()
    }

    if (userRole === 'student') {
      setTeacherStudents([])
      setTeacherSchedules([])
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

  async function handleCreateSchedule() {
    if (!supabase || !userId || !scheduleForm.studentId || !scheduleForm.teacherId || !scheduleForm.title.trim()) {
      setAssignmentError('Choose a student, teacher, and schedule title.')
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
        teacher_id: scheduleForm.teacherId,
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
      teacherId: '',
      title: '',
      details: '',
      scheduledFor: '',
      startTime: '',
      endTime: '',
    })
    const teacher = teachers.find((item) => item.id === scheduleForm.teacherId)
    const student = students.find((item) => item.id === scheduleForm.studentId)
    if (teacher && student) {
      setAdminSchedules((current) => [
        {
          id: `${student.id}-${Date.now()}`,
          teacherId: teacher.id,
          teacherName: teacher.username,
          studentId: student.id,
          studentName: student.username,
          title: scheduleForm.title.trim(),
          details: scheduleForm.details.trim(),
          scheduledFor: scheduleForm.scheduledFor || null,
          startTime: scheduleForm.startTime || null,
          endTime: scheduleForm.endTime || null,
        },
        ...current,
      ])
    }
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
        schedules={teacherSchedules}
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
        schedules={adminSchedules}
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
