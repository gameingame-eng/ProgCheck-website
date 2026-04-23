const dashboardStats = [
  { value: '24', label: 'submissions to review' },
  { value: '3', label: 'classes active today' },
  { value: '7', label: 'draft comments saved' },
]

const dashboardSections = [
  { title: 'Biology Lab Reports', meta: '12 waiting', tone: 'warm' },
  { title: 'Algebra Exit Tickets', meta: '8 ready to publish', tone: 'cool' },
  { title: 'English Revisions', meta: '4 need follow-up', tone: 'plain' },
]

function DashboardPage({ onLogout, username }) {
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
            <h2>Today</h2>
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
            <h2>Recent work</h2>
            <div className="dashboard-list">
              {dashboardSections.map((section) => (
                <article className={`dashboard-item ${section.tone}`} key={section.title}>
                  <h3>{section.title}</h3>
                  <p>{section.meta}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="dashboard-panel dashboard-panel-compact">
          <h2>Quick note</h2>
          <p className="dashboard-text">
            This is the separate logged-in page, while the homepage stays public.
          </p>
        </section>
      </section>
    </main>
  )
}

export default DashboardPage
