function DashboardPage({
  assignedStudents,
  assignmentError,
  assignmentFeedback,
  assignmentLoading,
  homeworkAssignments,
  homeworkForm,
  onCreateHomework,
  onHomeworkFormChange,
  onLogout,
  schedules,
  username,
}) {
  function formatTime(time) {
    if (!time || typeof time !== 'string') {
      return null
    }

    const [hourText = '00', minuteText = '00'] = time.split(':')
    const hour = Number(hourText)
    const minute = minuteText.padStart(2, '0')
    const suffix = hour >= 12 ? 'PM' : 'AM'
    const normalizedHour = hour % 12 || 12
    return `${normalizedHour}:${minute} ${suffix}`
  }

  const dashboardStats = [
    { value: String(assignedStudents.length), label: 'students assigned' },
    { value: assignedStudents.length > 0 ? 'Linked' : 'Open', label: 'roster status' },
    { value: String(schedules.length), label: 'schedule entries' },
  ]

  return (
    <main className="dashboard-page">
      <section className="dashboard-shell">
        <header className="dashboard-header">
          <div>
            <p className="eyebrow">ProgCheck</p>
            {username ? <p className="dashboard-user">{username}</p> : null}
            <h1>Home</h1>
            <p className="dashboard-text">A minimal default view for logged-in teachers.</p>
          </div>
          <button
            className="secondary-button button-reset"
            type="button"
            onClick={onLogout}
          >
            Log out
          </button>
        </header>

        <section className="dashboard-grid" aria-label="Dashboard overview">
          <div className="dashboard-panel">
            <h2>Your roster</h2>
            <div className="stat-row">
              {dashboardStats.map((stat) => (
                <div className="stat-card" key={stat.label}>
                  <strong>{stat.value}</strong>
                  <span>{stat.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="dashboard-panel">
            <h2>Assigned students</h2>
            <div className="dashboard-list">
              {assignedStudents.length > 0 ? assignedStudents.map((student) => (
                <article className="dashboard-item warm" key={student.id}>
                  <h3>{student.username}</h3>
                  <p>Scheduled with you</p>
                </article>
              )) : (
                <article className="dashboard-item plain">
                  <h3>No students yet</h3>
                  <p>Students will appear here once an admin builds schedules with your name on them.</p>
                </article>
              )}
            </div>
          </div>
        </section>

        <section className="dashboard-grid" aria-label="Homework tools">
          <div className="dashboard-panel">
            <h2>Give homework</h2>
            <div className="dashboard-form">
              <label className="field">
                <span>Student</span>
                <select
                  className="dashboard-select"
                  value={homeworkForm.studentId}
                  onChange={(event) =>
                    onHomeworkFormChange((current) => ({ ...current, studentId: event.target.value }))
                  }
                >
                  <option value="">Select student</option>
                  {assignedStudents.map((student) => (
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
                  value={homeworkForm.title}
                  onChange={(event) =>
                    onHomeworkFormChange((current) => ({ ...current, title: event.target.value }))
                  }
                  placeholder="Read chapter 4"
                />
              </label>

              <label className="field">
                <span>Details</span>
                <textarea
                  className="dashboard-textarea"
                  value={homeworkForm.details}
                  onChange={(event) =>
                    onHomeworkFormChange((current) => ({ ...current, details: event.target.value }))
                  }
                  placeholder="Directions, questions, or links..."
                />
              </label>

              <label className="field">
                <span>Due date</span>
                <input
                  type="date"
                  value={homeworkForm.dueDate}
                  onChange={(event) =>
                    onHomeworkFormChange((current) => ({ ...current, dueDate: event.target.value }))
                  }
                />
              </label>

              <button
                className="primary-button button-reset"
                type="button"
                onClick={onCreateHomework}
                disabled={assignmentLoading}
              >
                Assign homework
              </button>
            </div>
          </div>

          <div className="dashboard-panel">
            <h2>Assigned homework</h2>
            <div className="dashboard-list">
              {homeworkAssignments.length > 0 ? homeworkAssignments.map((assignment) => (
                <article className="dashboard-item cool" key={assignment.id}>
                  <h3>{assignment.title}</h3>
                  <p>{assignment.studentName}</p>
                  <p>{assignment.dueDate ? `Due: ${assignment.dueDate}` : 'No due date set'}</p>
                  {assignment.details ? <p>{assignment.details}</p> : null}
                </article>
              )) : (
                <article className="dashboard-item plain">
                  <h3>No homework assigned yet</h3>
                  <p>Your homework list will appear here after you assign work to a student.</p>
                </article>
              )}
            </div>
          </div>
        </section>

        <section className="dashboard-panel dashboard-panel-compact">
          <h2>Schedule</h2>
          <div className="dashboard-list">
            {schedules.length > 0 ? schedules.map((schedule) => (
              <article className="dashboard-item plain" key={schedule.id}>
                <h3>{schedule.title}</h3>
                <p>{schedule.studentName}</p>
                <p>{schedule.scheduledFor ? `Date: ${schedule.scheduledFor}` : 'Date not set'}</p>
                {schedule.startTime && schedule.endTime ? (
                  <p>{`Time: ${formatTime(schedule.startTime)} - ${formatTime(schedule.endTime)}`}</p>
                ) : null}
                {schedule.details ? <p>{schedule.details}</p> : null}
              </article>
            )) : (
              <article className="dashboard-item plain">
                <h3>No schedule entries yet</h3>
                <p>Admins can add students and meeting times to your schedule.</p>
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

export default DashboardPage
