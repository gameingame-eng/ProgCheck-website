function AdminPage({
  assignmentError,
  assignmentFeedback,
  assignmentLoading,
  assignments,
  onAssignStudent,
  onCreateSchedule,
  onLogout,
  onScheduleFormChange,
  scheduleForm,
  students,
  teachers,
  username,
}) {
  function getAssignedTeacherId(studentId) {
    return assignments.find((assignment) => assignment.studentId === studentId)?.teacherId ?? ''
  }

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
            <h2>Assignments</h2>
            <div className="dashboard-list">
              {students.map((student) => (
                <article className="dashboard-item plain dashboard-admin-form" key={student.id}>
                  <div>
                    <h3>{student.username}</h3>
                    <p>
                      {assignments.find((assignment) => assignment.studentId === student.id)
                        ? `Assigned to ${assignments.find((assignment) => assignment.studentId === student.id)?.teacherName}`
                        : 'Not assigned yet'}
                    </p>
                  </div>
                  <select
                    className="dashboard-select"
                    value={getAssignedTeacherId(student.id)}
                    onChange={(event) => onAssignStudent(student.id, event.target.value)}
                    disabled={assignmentLoading}
                  >
                    <option value="">Select teacher</option>
                    {teachers.map((teacher) => (
                      <option key={teacher.id} value={teacher.id}>
                        {teacher.username}
                      </option>
                    ))}
                  </select>
                </article>
              ))}
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
        </section>

        {assignmentError ? <p className="form-message error-message">{assignmentError}</p> : null}
        {assignmentFeedback ? <p className="form-message success-message">{assignmentFeedback}</p> : null}
      </section>
    </main>
  )
}

export default AdminPage
