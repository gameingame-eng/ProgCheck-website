import { useState } from 'react'

function AdminPage({
  assignmentError,
  assignmentFeedback,
  assignmentLoading,
  onAssignTeacher,
  onCreateSchedule,
  onLogout,
  onScheduleFormChange,
  scheduleForm,
  schedules,
  students,
  studentAssignments,
  teachers,
  username,
}) {
  const [selectedStudentId, setSelectedStudentId] = useState('')
  const [selectedTeacherId, setSelectedTeacherId] = useState('')

  const progressTemplates = students.map((student) => ({
    id: student.id,
    username: student.username,
    status: 'Not started',
    summary: 'Progress reports will appear here once the reporting model is added.',
  }))

  const selectedStudent = students.find((student) => student.id === selectedStudentId) ?? null
  const selectedTeacher = teachers.find((teacher) => teacher.id === selectedTeacherId) ?? null
  const visibleSchedules = schedules.filter((schedule) => {
    if (selectedStudentId) {
      return schedule.studentId === selectedStudentId
    }

    if (selectedTeacherId) {
      return schedule.teacherId === selectedTeacherId
    }

    return false
  })

  return (
    <main className="dashboard-page">
      <section className="dashboard-shell">
        <header className="dashboard-header">
          <div>
            <p className="eyebrow">ProgCheck</p>
            {username ? <p className="dashboard-user">{username}</p> : null}
            <h1>Admin</h1>
            <p className="dashboard-text">Assign students to teachers and create student schedules.</p>
          </div>
          <button className="secondary-button button-reset" type="button" onClick={onLogout}>
            Log out
          </button>
        </header>

        <section className="dashboard-grid" aria-label="Admin overview">
          <div className="dashboard-panel">
            <h2>All students</h2>
            <div className="dashboard-list">
              {students.map((student) => (
                <button
                  className={`dashboard-item plain dashboard-select-card${selectedStudentId === student.id ? ' dashboard-select-card-active' : ''}`}
                  key={student.id}
                  type="button"
                  onClick={() => {
                    setSelectedStudentId(student.id)
                    setSelectedTeacherId('')
                  }}
                >
                  <h3>{student.username}</h3>
                  <p>Student account</p>
                </button>
              ))}
            </div>
          </div>

          <div className="dashboard-panel">
            <h2>All teachers</h2>
            <div className="dashboard-list">
              {teachers.map((teacher) => (
                <button
                  className={`dashboard-item warm dashboard-select-card${selectedTeacherId === teacher.id ? ' dashboard-select-card-active' : ''}`}
                  key={teacher.id}
                  type="button"
                  onClick={() => {
                    setSelectedTeacherId(teacher.id)
                    setSelectedStudentId('')
                  }}
                >
                  <h3>{teacher.username}</h3>
                  <p>Teacher account</p>
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="dashboard-grid" aria-label="Admin tools">
          <div className="dashboard-panel">
            <h2>Assign teacher</h2>
            <div className="dashboard-form">
              <label className="field">
                <span>Student</span>
                <select
                  className="dashboard-select"
                  value={scheduleForm.studentId}
                  onChange={(event) =>
                    onScheduleFormChange((current) => ({ ...current, studentId: event.target.value }))
                  }
                >
                  <option value="">Select student</option>
                  {students.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.username}
                    </option>
                  ))}
                </select>
              </label>

              <label className="field">
                <span>Teacher</span>
                <select
                  className="dashboard-select"
                  value={scheduleForm.teacherId}
                  onChange={(event) =>
                    onScheduleFormChange((current) => ({ ...current, teacherId: event.target.value }))
                  }
                >
                  <option value="">Select teacher</option>
                  {teachers.map((teacher) => (
                    <option key={teacher.id} value={teacher.id}>
                      {teacher.username}
                    </option>
                  ))}
                </select>
              </label>

              <button
                className="primary-button button-reset"
                type="button"
                onClick={onAssignTeacher}
                disabled={assignmentLoading}
              >
                Save class assignment
              </button>
            </div>
          </div>

          <div className="dashboard-panel">
            <h2>Create schedule</h2>
            <div className="dashboard-form">
              <label className="field">
                <span>Student</span>
                <select
                  className="dashboard-select"
                  value={scheduleForm.studentId}
                  onChange={(event) =>
                    onScheduleFormChange((current) => ({ ...current, studentId: event.target.value }))
                  }
                >
                  <option value="">Select student</option>
                  {students.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.username}
                    </option>
                  ))}
                </select>
              </label>

              <label className="field">
                <span>Teacher</span>
                <select
                  className="dashboard-select"
                  value={scheduleForm.teacherId}
                  onChange={(event) =>
                    onScheduleFormChange((current) => ({ ...current, teacherId: event.target.value }))
                  }
                >
                  <option value="">Select teacher</option>
                  {teachers.map((teacher) => (
                    <option key={teacher.id} value={teacher.id}>
                      {teacher.username}
                    </option>
                  ))}
                </select>
              </label>

              <label className="field">
                <span>Title</span>
                <input
                  type="text"
                  value={scheduleForm.title}
                  onChange={(event) =>
                    onScheduleFormChange((current) => ({ ...current, title: event.target.value }))
                  }
                  placeholder="Morning support block"
                />
              </label>

              <label className="field">
                <span>Details</span>
                <textarea
                  className="dashboard-textarea"
                  value={scheduleForm.details}
                  onChange={(event) =>
                    onScheduleFormChange((current) => ({ ...current, details: event.target.value }))
                  }
                  placeholder="Room number, timing, notes..."
                />
              </label>

              <label className="field">
                <span>Date</span>
                <input
                  type="date"
                  value={scheduleForm.scheduledFor}
                  onChange={(event) =>
                    onScheduleFormChange((current) => ({ ...current, scheduledFor: event.target.value }))
                  }
                />
              </label>

              <div className="dashboard-time-grid">
                <label className="field">
                  <span>Start time</span>
                  <input
                    type="time"
                    value={scheduleForm.startTime}
                    onChange={(event) =>
                      onScheduleFormChange((current) => ({ ...current, startTime: event.target.value }))
                    }
                    step="60"
                  />
                </label>

                <label className="field">
                  <span>End time</span>
                  <input
                    type="time"
                    value={scheduleForm.endTime}
                    onChange={(event) =>
                      onScheduleFormChange((current) => ({ ...current, endTime: event.target.value }))
                    }
                    step="60"
                  />
                </label>
              </div>

              <button
                className="primary-button button-reset"
                type="button"
                onClick={onCreateSchedule}
                disabled={assignmentLoading}
              >
                Save schedule
              </button>
            </div>
          </div>

          <div className="dashboard-panel">
            <h2>Class assignments</h2>
            <div className="dashboard-list">
              {studentAssignments.length > 0 ? studentAssignments.map((assignment) => (
                <article className="dashboard-item plain" key={assignment.studentId}>
                  <h3>{assignment.studentName}</h3>
                  <p>{assignment.teacherName}</p>
                  <p>Current teacher assignment</p>
                </article>
              )) : progressTemplates.map((report) => (
                <article className="dashboard-item plain" key={report.id}>
                  <h3>{report.username}</h3>
                  <p>{report.status}</p>
                  <p>{report.summary}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="dashboard-panel dashboard-panel-compact">
          <h2>Schedules</h2>
          <div className="dashboard-list">
            {selectedStudent || selectedTeacher ? visibleSchedules.length > 0 ? visibleSchedules.map((schedule) => (
              <article className="dashboard-item cool" key={schedule.id}>
                <h3>{schedule.title}</h3>
                <p>{`${schedule.studentName} with ${schedule.teacherName}`}</p>
                <p>{schedule.scheduledFor ? `Date: ${schedule.scheduledFor}` : 'Date not set'}</p>
              </article>
            )) : (
              <article className="dashboard-item plain">
                <h3>No schedules for this selection</h3>
                <p>Pick a different student or teacher, or create a new schedule above.</p>
              </article>
            ) : (
              <article className="dashboard-item plain">
                <h3>Select a student or teacher</h3>
                <p>Schedules stay hidden until you click into a specific student or teacher.</p>
              </article>
            )}
          </div>
        </section>

        {assignmentError ? <p className="form-message error-message">{assignmentError}</p> : null}
        {assignmentFeedback ? <p className="form-message success-message">{assignmentFeedback}</p> : null}
      </section>
    </main>
  )
}

export default AdminPage
