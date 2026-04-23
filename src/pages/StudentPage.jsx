function StudentPage({ assignedTeacher, onLogout, username }) {
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
                  <p>Currently assigned teacher</p>
                </article>
              ) : (
                <article className="dashboard-item plain">
                  <h3>No teacher assigned yet</h3>
                  <p>A teacher can claim you from their dashboard.</p>
                </article>
              )}
            </div>
          </div>

          <div className="dashboard-panel">
            <h2>Status</h2>
            <div className="stat-row">
              <div className="stat-card">
                <strong>{assignedTeacher ? '1' : '0'}</strong>
                <span>teacher assigned</span>
              </div>
              <div className="stat-card">
                <strong>{assignedTeacher ? assignedTeacher.username.slice(0, 1).toUpperCase() : '-'}</strong>
                <span>teacher initial</span>
              </div>
              <div className="stat-card">
                <strong>{assignedTeacher ? 'Linked' : 'Waiting'}</strong>
                <span>assignment status</span>
              </div>
            </div>
          </div>
        </section>
      </section>
    </main>
  )
}

export default StudentPage
