function DashboardPage({
  assignedStudents,
  assignmentError,
  assignmentFeedback,
  assignmentLoading,
  availableStudents,
  onAssignStudent,
  onLogout,
  username,
}) {
  const dashboardStats = [
    { value: String(assignedStudents.length), label: 'students assigned' },
    { value: String(availableStudents.length), label: 'students available' },
    { value: assignedStudents.length > 0 ? 'Ready' : 'Empty', label: 'teacher queue' },
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
                  <p>Assigned to you</p>
                </article>
              )) : (
                <article className="dashboard-item plain">
                  <h3>No students yet</h3>
                  <p>Pick from the unassigned list below to build your roster.</p>
                </article>
              )}
            </div>
          </div>
        </section>

        <section className="dashboard-panel dashboard-panel-compact">
          <h2>Unassigned students</h2>
          <p className="dashboard-text">
            Teachers can self-assign students here. Each student can only belong to one teacher at a time.
          </p>
          <div className="dashboard-list">
            {availableStudents.length > 0 ? availableStudents.map((student) => (
              <article className="dashboard-item plain dashboard-action-row" key={student.id}>
                <div>
                  <h3>{student.username}</h3>
                  <p>Available to claim</p>
                </div>
                <button
                  className="primary-button button-reset"
                  type="button"
                  onClick={() => onAssignStudent(student.id)}
                  disabled={assignmentLoading}
                >
                  Assign to me
                </button>
              </article>
            )) : (
              <article className="dashboard-item cool">
                <h3>All students are assigned</h3>
                <p>No open students are waiting right now.</p>
              </article>
            )}
          </div>
          {assignmentError ? <p className="form-message error-message">{assignmentError}</p> : null}
          {assignmentFeedback ? <p className="form-message success-message">{assignmentFeedback}</p> : null}
        </section>
      </section>
    </main>
  )
}

export default DashboardPage
