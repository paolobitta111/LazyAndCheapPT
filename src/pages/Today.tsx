import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { SessionBox, type SessionBoxPlan } from '../components/SessionBox'
import { MetricCubes } from '../components/MetricCubes'
import { CheckInModal } from '../components/CheckInModal'
import { dateKey, PlanningService, type ResolvedSession } from '../services/planning.service'
import { formatToday } from './today-mock'
import { useAppData } from '../data/db'

interface CheckInTarget {
  label: string
  promptLabel: string
}

export default function Today() {
  const repos = useAppData()
  const navigate = useNavigate()
  const today = dateKey(new Date())

  const service = useMemo(
    () =>
      new PlanningService(
        repos.trainingPlanRepo,
        repos.plannedSessionRepo,
        repos.workoutLogRepo,
        repos.cardioLogRepo,
      ),
    [repos.trainingPlanRepo, repos.plannedSessionRepo, repos.workoutLogRepo, repos.cardioLogRepo],
  )

  const [day, setDay] = useState<{ sessions: ResolvedSession[]; plans: SessionBoxPlan[] } | null>(null)
  const [checkIn, setCheckIn] = useState<CheckInTarget | null>(null)

  const refresh = useCallback(async () => {
    const [resolved, plans] = await Promise.all([
      service.resolveDay(today),
      repos.trainingPlanRepo.list(),
    ])
    setDay({
      sessions: resolved,
      plans: plans
        .filter((plan) => plan.status === 'active' && plan.id)
        .map((plan) => ({ planId: plan.id!, name: plan.name, description: plan.description })),
    })
  }, [service, repos.trainingPlanRepo, today])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const resolved = day?.sessions ?? []
  const activePlans = day?.plans ?? []
  const toBox = (session: ResolvedSession): SessionBoxPlan => ({
    planId: session.planId,
    name: session.name,
    description: session.description,
  })

  async function openSession(session: ResolvedSession) {
    await service.ensurePlanned(session.planId, today)
    navigate(`/workout/${session.planId}`)
  }

  if (day === null) {
    return <div />
  }

  return (
    <div>
      <p className="today-date">{formatToday()}</p>

      {resolved.length === 0 ? (
        <SessionBox
          plan={null}
          schede={activePlans}
          onSkip={() => undefined}
          onSelect={(planId) => void service.assign(planId, today).then(() => void refresh())}
          onCheckIn={() => setCheckIn({ label: 'Riposo', promptLabel: 'Riposo' })}
          onOpen={() => undefined}
        />
      ) : (
        resolved.map((session) => (
          <SessionBox
            key={session.planId}
            plan={toBox(session)}
            schede={activePlans}
            onSkip={() => void service.skip(session.planId, today).then(() => void refresh())}
            onSelect={(planId) =>
              void service.substitute(session.planId, planId, today).then(() => void refresh())
            }
            onCheckIn={() => setCheckIn({ label: `${session.name} di oggi`, promptLabel: session.name })}
            onOpen={() => void openSession(session)}
          />
        ))
      )}

      <MetricCubes />

      <CheckInModal
        open={checkIn !== null}
        label={checkIn?.label ?? ''}
        promptLabel={checkIn?.promptLabel ?? ''}
        onClose={() => setCheckIn(null)}
      />
    </div>
  )
}