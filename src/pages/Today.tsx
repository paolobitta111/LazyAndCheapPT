import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { SessionBox, type SessionBoxPlan } from '../components/SessionBox'
import { MetricCubes } from '../components/MetricCubes'
import { CheckInModal } from '../components/CheckInModal'
import { dateKey, PlanningService, type ResolvedSession } from '../services/planning.service'
import { getWeatherNow, type WeatherNow } from '../services/weather.service'
import { loadHealth, saveHealth, type HealthValues } from '../services/health.service'
import { useAppData } from '../data/db'

interface CheckInTarget {
  label: string
  promptLabel: string
}

function formatToday(date = new Date()): string {
  const label = date.toLocaleDateString('it-IT', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
  return label.charAt(0).toUpperCase() + label.slice(1)
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
  const [weather, setWeather] = useState<WeatherNow>({ tempC: null, wind: null })
  const [health, setHealth] = useState<HealthValues>(() => loadHealth())
  const [healthOpen, setHealthOpen] = useState(false)
  const [healthDraft, setHealthDraft] = useState<HealthValues>({})

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

  useEffect(() => {
    void getWeatherNow().then(setWeather)
  }, [])

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

      <MetricCubes
        weather={weather}
        health={health}
        onEditHealth={() => {
          setHealthDraft(health)
          setHealthOpen(true)
        }}
      />

      {healthOpen ? (
        <div className="glass" role="dialog" aria-label="Modifica salute">
          <p className="label">Salute di oggi (a mano: Apple Salute non è accessibile da web)</p>
          <div style={{ display: 'flex', gap: '6px' }}>
            <input
              className="field"
              type="number"
              aria-label="Sonno ore"
              placeholder="sonno h"
              value={healthDraft.sleep ?? ''}
              onChange={(event) => setHealthDraft({ ...healthDraft, sleep: event.target.value === '' ? undefined : Number(event.target.value) })}
            />
            <input
              className="field"
              type="number"
              aria-label="Battiti a riposo"
              placeholder="FC riposo"
              value={healthDraft.restingHr ?? ''}
              onChange={(event) => setHealthDraft({ ...healthDraft, restingHr: event.target.value === '' ? undefined : Number(event.target.value) })}
            />
            <input
              className="field"
              type="number"
              aria-label="Passi"
              placeholder="passi"
              value={healthDraft.steps ?? ''}
              onChange={(event) => setHealthDraft({ ...healthDraft, steps: event.target.value === '' ? undefined : Number(event.target.value) })}
            />
          </div>
          <button
            className="btn btn-primary"
            type="button"
            onClick={() => {
              saveHealth(healthDraft)
              setHealth(healthDraft)
              setHealthOpen(false)
            }}
          >
            Salva salute
          </button>
        </div>
      ) : null}

      <CheckInModal
        open={checkIn !== null}
        label={checkIn?.label ?? ''}
        promptLabel={checkIn?.promptLabel ?? ''}
        metrics={{
          sleep: health.sleep,
          restingHr: health.restingHr,
          steps: health.steps,
          tempC: weather.tempC,
          wind: weather.wind,
        }}
        onClose={() => setCheckIn(null)}
      />
    </div>
  )
}