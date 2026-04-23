const highlights = [
  {
    title: 'Fix grading bottlenecks',
    text: 'Keep classes moving with quick edits, cleaner comments, and fewer repetitive clicks.',
  },
  {
    title: 'See student progress faster',
    text: 'Spot missing work, trends, and next steps before grades turn into a fire drill.',
  },
  {
    title: 'Make feedback feel personal',
    text: 'Reuse your best notes, then tailor them so every student gets something useful.',
  },
]

const stats = [
  { value: '4x', label: 'faster rubric updates' },
  { value: '100%', label: 'clearer grading workflow' },
  { value: '1', label: 'organized home for feedback' },
]

const steps = [
  'Import assignments and organize them by class, unit, or deadline.',
  'Review submissions with focused tools for comments, rubric changes, and revisions.',
  'Publish polished feedback without the mess of scattered notes and spreadsheets.',
]

function HomePage({ onNavigate }) {
  return (
    <main>
      <section className="hero-section">
        <div className="hero-copy">
          <p className="eyebrow">ProgCheck</p>
          <h1>Grade your assignments quick, fast, and easy.</h1>
          <p className="hero-text">
            A new grading workflow that helps you spend less time on busywork and
            more time on feedback that helps students grow.
          </p>
          <div className="hero-actions">
            <button
              className="primary-button button-reset"
              type="button"
              onClick={() => onNavigate('/login')}
            >
              Log in
            </button>
          </div>
          <div className="stat-row" aria-label="Product highlights">
            {stats.map((stat) => (
              <div className="stat-card" key={stat.label}>
                <strong>{stat.value}</strong>
                <span>{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="feature-band page-shell" id="features">
        {highlights.map((item) => (
          <article className="feature-card" key={item.title}>
            <p className="feature-kicker">Why teams switch</p>
            <h2>{item.title}</h2>
            <p>{item.text}</p>
          </article>
        ))}
      </section>

      <section className="workflow-section page-shell" id="workflow">
        <div className="workflow-copy">
          <p className="eyebrow">Simple flow</p>
          <h2>A homepage that feels normal, but not boring.</h2>
          <p>
            The layout stays familiar and easy to scan, while the visuals carry
            enough personality to make the product feel current and cared for.
          </p>
        </div>
        <div className="workflow-list">
          {steps.map((step, index) => (
            <div className="workflow-item" key={step}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              <p>{step}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}

export default HomePage
