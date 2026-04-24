function StudentPage({ assignedTeacher, homeworkAssignments, onLogout, schedules, username }) {
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

  return (
    <main className="dashboard-page">
      <section className="dashboard-shell">
        <header className="dashboard-header">
          <div>
            <p className="eyebrow">ProgCheck</p>
            {username ? <p className="dashboard-user">{username}</p> : null}
            <h1>Student Home</h1>
            <p className="dashboard-text">Your student view is separate from the teacher dashboard.</p>
          </div>
          <button
            className="secondary-button button-reset"
            type="button"
            onClick={onLogout}
          >
            Log out
          </button>
        </header>

        <section className="dashboard-grid" aria-label="Student overview">
          <div className="dashboard-panel">
            <h2>Your teacher</h2>
            <div className="dashboard-list">
              {assignedTeacher ? (
                <article className="dashboard-item warm">
                  <h3>{assignedTeacher.username}</h3>
                  <p>Teacher from your latest schedule</p>
                </article>
              ) : (
                <article className="dashboard-item plain">
                  <h3>No teacher assigned yet</h3>
                  <p>An admin can add a teacher when they create your schedule.</p>
                </article>
              )}
            </div>
          </div>

          <div className="dashboard-panel">
            <h2>Homework</h2>
            <div className="dashboard-list">
              {homeworkAssignments.length > 0 ? homeworkAssignments.map((assignment) => (
                <article className="dashboard-item warm" key={assignment.id}>
                  <h3>{assignment.title}</h3>
                  <p>{assignment.teacherName}</p>
                  <p>{assignment.dueDate ? `Due: ${assignment.dueDate}` : 'No due date set'}</p>
                  {assignment.details ? <p>{assignment.details}</p> : null}
                </article>
              )) : (
                <article className="dashboard-item plain">
                  <h3>No homework yet</h3>
                  <p>Your teacher will be able to post homework here.</p>
                </article>
              )}
            </div>
          </div>

          <div className="dashboard-panel">
            <h2>Schedule</h2>
            <div className="dashboard-list">
              {schedules.length > 0 ? schedules.map((schedule) => (
                <article className="dashboard-item cool" key={schedule.id}>
                  <h3>{schedule.title}</h3>
                  <p>{schedule.scheduled_for ? `Date: ${schedule.scheduled_for}` : 'Date not set'}</p>
                  {schedule.start_time && schedule.end_time ? (
                    <p>{`Time: ${formatTime(schedule.start_time)} - ${formatTime(schedule.end_time)}`}</p>
                  ) : null}
                  {schedule.details ? <p>{schedule.details}</p> : null}
                </article>
              )) : (
                <article className="dashboard-item plain">
                  <h3>No schedule yet</h3>
                  <p>An admin can create your schedule here once it is ready.</p>
                </article>
              )}
            </div>
          </div>
        </section>
      </section>
    </main>
  )
}

export default StudentPage
