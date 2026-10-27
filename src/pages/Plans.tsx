import { useCallback, useEffect, useState } from 'react'
import { PlanForm } from '../components/PlanForm'
import { useAppData } from '../data/db'
import type { TrainingPlan } from '../models/entities'

const weekdayLetters: Record<number, string> = {
  1: 'L', 2: 'M', 3: 'M', 4: 'G', 5: 'V', 6: 'S', 7: 'D',
}

export default function Plans() {
  const { trainingPlanRepo } = useAppData()
  const [plans, setPlans] = useState<TrainingPlan[]>([])
  const [formPlan, setFormPlan] = useState<TrainingPlan | undefined>(undefined)
  const [formOpen, setFormOpen] = useState(false)

  const refresh = useCallback(async () => {
    setPlans(await trainingPlanRepo.list())
  }, [trainingPlanRepo])

  useEffect(() => {
    void refresh()
  }, [refresh])

  function closeForm() {
    setFormOpen(false)
    setFormPlan(undefined)
    void refresh()
  }

  return (
    <div>
      <h1>Schede</h1>
      <button className="btn btn-primary" type="button" onClick={() => { setFormPlan(undefined); setFormOpen(true) }}>
        Nuova scheda
      </button>
      {formOpen ? <PlanForm plan={formPlan} onDone={closeForm} /> : null}
      <section>
        {plans.map((plan) => (
          <article key={plan.id} className="glass">
            <h3>{plan.name}</h3>
            <p>{plan.sport ?? 'altro'}</p>
            <p>
              {plan.exercises.length === 1 ? '1 esercizio' : `${plan.exercises.length} esercizi`}
            </p>
            {plan.plannedSessions && plan.plannedSessions.length > 0 ? (
              <p aria-label="Giorni assegnati">
                {plan.plannedSessions
                  .slice()
                  .sort((a, b) => a.dayOfWeek - b.dayOfWeek)
                  .map((rule) => weekdayLetters[rule.dayOfWeek] ?? '?')
                  .join(' ')}
              </p>
            ) : null}
            {(plan.dates ?? []).map((date) => (
              <p key={date}>{date}</p>
            ))}
            <button
              className="btn"
              type="button"
              onClick={() => { setFormPlan(plan); setFormOpen(true) }}
            >
              Modifica
            </button>
          </article>
        ))}
        {plans.length === 0 && !formOpen ? <p>Nessuna scheda. Creane una per iniziare.</p> : null}
      </section>
    </div>
  )
}