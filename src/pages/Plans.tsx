import type { FC } from 'react'

export const PlansPage: FC = () => {
  const mockPlans = [
    { name: 'Petto + Tricipiti', days: 'Lun, Mer, Ven', exerciseCount: 6 },
    { name: 'Schiena + Bicipiti', days: 'Mar, Gio', exerciseCount: 5 },
    { name: 'Gambe + Addome', days: 'Lun, Ven', exerciseCount: 7 },
  ]

  return (
    <div>
      <h1>Schede</h1>
      <button className="btn btn-primary" type="button">Nuova Scheda</button>
      <section>
        {mockPlans.map((plan) => (
          <div key={plan.name} className="glass">
            <p>{plan.name}</p>
            <p>{plan.days} · {plan.exerciseCount} esercizi</p>
          </div>
        ))}
      </section>
    </div>
  )
}

export default PlansPage
