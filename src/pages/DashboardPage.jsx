function DashboardPage({
  assignedStudents,
  onLogout,
  username,
}) {
  const dashboardStats = [
    { value: String(assignedStudents.length), label: 'students assigned' },
    { value: assignedStudents.length > 0 ? 'Linked' : 'Open', label: 'roster status' },
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
          <h2>Assignment flow</h2>
          <p className="dashboard-text">
            Student assignments are handled by admins. Your roster updates automatically when an admin links a student to you.
          </p>
          <div className="dashboard-list">
            <article className="dashboard-item plain">
              <h3>Admin-managed roster</h3>
              <p>Reach out to an admin if a student needs to be reassigned or added to your list.</p>
            </article>
          </div>
        </section>
      </section>
    </main>
  )
}

export default DashboardPage
