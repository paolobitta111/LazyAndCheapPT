import '../index.css'

export default function NotFound() {
  return (
    <>
      <nav className="navbar is-light" role="navigation" aria-label="main navigation">
        <div className="container">
          <div className="navbar-brand">
            <a className="navbar-item" href="#/">
              <span className="icon is-medium">
                <svg width="24" height="24" viewBox="0 0 192 192" fill="none">
                  <rect x="36" y="75" width="12" height="42" rx="6" fill="#4a90d9" />
                  <rect x="144" y="75" width="12" height="42" rx="6" fill="#4a90d9" />
                  <rect x="72" y="90" width="48" height="12" rx="6" fill="#4a90d9" />
                </svg>
              </span>
              <span className="ml-2 has-text-weight-bold">LazyCheapCoach</span>
            </a>
          </div>
        </div>
      </nav>

      <main className="main-content">
        <section className="section">
          <div className="container has-text-centered">
            <h1 className="title is-1">404</h1>
            <p className="subtitle is-4">Pagina non trovata</p>
            <a href="#/" className="button is-primary">Torna alla Home</a>
          </div>
        </section>
      </main>

      <footer className="footer has-text-centered">
        <div className="container">
          <p>LazyCheapCoach © {new Date().getFullYear()}</p>
        </div>
      </footer>
    </>
  )
}
