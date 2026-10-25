import type { FC } from 'react'

interface PlansPageProps {}

export const PlansPage: FC<PlansPageProps> = () => {
  const mockPlans = [
    { name: 'Petto + Tricipiti', days: 'Lun, Mer, Ven', exerciseCount: 6 },
    { name: 'Schiena + Bicipiti', days: 'Mar, Gio', exerciseCount: 5 },
    { name: 'Gambe + Addome', days: 'Lun, Ven', exerciseCount: 7 },
  ]

  return (
    <div className="container">
      <h1 className="title is-4">📋 Schede</h1>

      <div className="mb-4">
        <button className="button is-primary is-fullwidth" type="button">
          <span className="icon is-small mr-2">+</span>
          <span>Nuova Scheda</span>
        </button>
      </div>

      <section>
        {mockPlans.map((plan, idx) => (
          <div key={idx} className="card mb-3">
            <div className="card-content">
              <div className="media">
                <div className="media-content">
                  <p className="title is-5 mb-0">{plan.name}</p>
                  <p className="has-text-grey is-size-7 mt-1">
                    {plan.days} · {plan.exerciseCount} esercizi
                  </p>
                </div>
                <div className="media-right">
                  <span className="icon has-text-grey">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </section>
    </div>
  )
}

export default PlansPage
