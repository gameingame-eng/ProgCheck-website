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
  const [teacherHomework, setTeacherHomework] = useState([])
  const [studentHomework, setStudentHomework] = useState([])
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
  const [homeworkForm, setHomeworkForm] = useState({
    studentId: '',
    title: '',
    details: '',
    dueDate: '',
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
        setTeacherHomework([])
        setStudentHomework([])
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
      setStudentAssignments([])
      setTeacherHomework([])
      setStudentHomework([])
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
      const [{ data: teacherSchedules = [] }, { data: homeworkRows = [] }] = await Promise.all([
        supabase
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
          .order('start_time', { ascending: true }),
        supabase
          .from('teacher_homework_assignments')
          .select(`
            id,
            student_id,
            title,
            details,
            due_date,
            created_at,
            student:profiles!teacher_homework_assignments_student_id_fkey(username)
          `)
          .eq('teacher_id', userId)
          .order('created_at', { ascending: false }),
      ])

      if (!isMounted) {
        return
      }

      const uniqueStudents = new Map()
      teacherSchedules.forEach((schedule) => {
        if (schedule.student_id && !uniqueStudents.has(schedule.student_id)) {
          uniqueStudents.set(schedule.student_id, schedule.student?.username ?? 'Unnamed student')
        }
      })

      setTeacherStudents(
        Array.from(uniqueStudents.entries())
          .map(([studentId, username]) => ({
            id: studentId,
            username,
          }))
          .sort((a, b) => a.username.localeCompare(b.username)),
      )
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
      setTeacherHomework(
        homeworkRows.map((assignment) => ({
          id: assignment.id,
          studentId: assignment.student_id,
          studentName: assignment.student?.username ?? 'Unnamed student',
          title: assignment.title,
          details: assignment.details,
          dueDate: assignment.due_date,
          createdAt: assignment.created_at,
        })),
      )
      setTeachers([])
      setStudents([])
      setTeacherHomework([])
      setStudentHomework([])
      setAdminSchedules([])
    }

    async function loadAdminData() {
      const [
        { data: teacherProfiles = [] },
        { data: studentProfiles = [] },
        { data: scheduleRows = [] },
      ] = await Promise.all([
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
      setTeacherHomework([])
      setStudentHomework([])
    }

    async function loadStudentData() {
      const [{ data: schedules = [] }, { data: homeworkRows = [] }] = await Promise.all([
        supabase
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
          .order('created_at', { ascending: false }),
        supabase
          .from('teacher_homework_assignments')
          .select(`
            id,
            title,
            details,
            due_date,
            created_at,
            teacher_id,
            teacher:profiles!teacher_homework_assignments_teacher_id_fkey(username)
          `)
          .eq('student_id', userId)
          .order('created_at', { ascending: false }),
      ])

      if (!isMounted) {
        return
      }

      // Get the teacher from the latest schedule
      const latestScheduleWithTeacher = schedules.find((schedule) => schedule.teacher_id)
      setAssignedTeacher(
        latestScheduleWithTeacher?.teacher_id
          ? {
              id: latestScheduleWithTeacher.teacher_id,
              username: latestScheduleWithTeacher.teacher?.username ?? 'Your teacher',
            }
          : null,
      )
      setStudentSchedules(schedules)
      setStudentHomework(
        homeworkRows.map((assignmentRow) => ({
          id: assignmentRow.id,
          title: assignmentRow.title,
          details: assignmentRow.details,
          dueDate: assignmentRow.due_date,
          createdAt: assignmentRow.created_at,
          teacherName: assignmentRow.teacher?.username ?? 'Your teacher',
        })),
      )
      setTeacherSchedules([])
      setTeachers([])
      setStudents([])
      setTeacherHomework([])
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

  async function handleCreateHomework() {
    if (!supabase || !userId || !homeworkForm.studentId || !homeworkForm.title.trim()) {
      setAssignmentError('Choose a student and add a homework title.')
      return
    }

    setAssignmentLoading(true)
    setAssignmentFeedback('')
    setAssignmentError('')

    const { data, error } = await supabase
      .from('teacher_homework_assignments')
      .insert({
        teacher_id: userId,
        student_id: homeworkForm.studentId,
        title: homeworkForm.title.trim(),
        details: homeworkForm.details.trim(),
        due_date: homeworkForm.dueDate || null,
      })
      .select(`
        id,
        student_id,
        title,
        details,
        due_date,
        created_at,
        student:profiles!teacher_homework_assignments_student_id_fkey(username)
      `)
      .single()

    setAssignmentLoading(false)

    if (error) {
      setAssignmentError(error.message)
      return
    }

    setTeacherHomework((current) => [
      {
        id: data.id,
        studentId: data.student_id,
        studentName: data.student?.username ?? 'Unnamed student',
        title: data.title,
        details: data.details,
        dueDate: data.due_date,
        createdAt: data.created_at,
      },
      ...current,
    ])
    setHomeworkForm({
      studentId: '',
      title: '',
      details: '',
      dueDate: '',
    })
    setAssignmentFeedback('Homework assigned successfully.')
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
        homeworkAssignments={teacherHomework}
        homeworkForm={homeworkForm}
        onCreateHomework={handleCreateHomework}
        onHomeworkFormChange={setHomeworkForm}
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
        homeworkAssignments={studentHomework}
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
