function StudentPage({ onLogout, username }) {
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
            <h2>Upcoming</h2>
            <div className="dashboard-list">
              <article className="dashboard-item plain">
                <h3>Essay Revision</h3>
                <p>Due tomorrow</p>
              </article>
              <article className="dashboard-item plain">
                <h3>Biology Reflection</h3>
                <p>Feedback available</p>
              </article>
            </div>
          </div>

          <div className="dashboard-panel">
            <h2>Status</h2>
            <div className="stat-row">
              <div className="stat-card">
                <strong>2</strong>
                <span>assignments due soon</span>
              </div>
              <div className="stat-card">
                <strong>5</strong>
                <span>graded items</span>
              </div>
              <div className="stat-card">
                <strong>1</strong>
                <span>new comment</span>
              </div>
            </div>
          </div>
        </section>
      </section>
    </main>
  )
}

export default StudentPage
