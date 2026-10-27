import { useCallback, useEffect, useMemo, useState } from 'react'
import { AssignModal } from '../components/AssignModal'
import { DaySummaryModal } from '../components/DaySummaryModal'
import { MonthCalendar, monthNames } from '../components/MonthCalendar'
import { PlanningService, type MonthDay, type ResolvedSession } from '../services/planning.service'
import { useAppData } from '../data/db'
import type { CardioLog, WorkoutLog } from '../models/entities'

function formatDayLabel(year: number, monthIndex: number, day: number): string {
  const date = new Date(year, monthIndex, day)
  const weekday = date.toLocaleDateString('it-IT', { weekday: 'long' })
  const month = monthNames[monthIndex]
  const label = `${weekday} ${day} ${month}`
  return label.charAt(0).toUpperCase() + label.slice(1)
}

function dateOfMonth(year: number, monthIndex: number, day: number): string {
  return `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

function formatDuration(durationSec: number): string {
  return `${Math.round(durationSec / 60)} min`
}

export default function Calendar() {
  const repos = useAppData()
  const now = new Date()

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

  const [year, setYear] = useState(now.getFullYear())
  const [monthIndex, setMonthIndex] = useState(now.getMonth())
  const [days, setDays] = useState<MonthDay[] | null>(null)
  const [schede, setSchede] = useState<{ planId: string; name: string }[]>([])
  const [selectedDay, setSelectedDay] = useState<number | null>(null)
  const [assignDay, setAssignDay] = useState<number | null>(null)
  const [dayLogs, setDayLogs] = useState<{ workouts: WorkoutLog[]; cardios: CardioLog[] } | null>(null)

  const refresh = useCallback(async () => {
    const [monthDays, plans] = await Promise.all([
      service.resolveMonth(year, monthIndex),
      repos.trainingPlanRepo.list(),
    ])
    setDays(monthDays)
    setSchede(
      plans
        .filter((plan) => plan.status === 'active' && plan.id)
        .map((plan) => ({ planId: plan.id!, name: plan.name })),
    )
  }, [service, repos.trainingPlanRepo, year, monthIndex])

  useEffect(() => {
    void refresh()
  }, [refresh])

  useEffect(() => {
    if (selectedDay === null) {
      setDayLogs(null)
      return
    }
    const date = dateOfMonth(year, monthIndex, selectedDay)
    void Promise.all([
      repos.workoutLogRepo.listByDate(date),
      repos.cardioLogRepo.listByDate(date),
    ]).then(([workouts, cardios]) => setDayLogs({ workouts, cardios }))
  }, [selectedDay, repos.workoutLogRepo, repos.cardioLogRepo, year, monthIndex])

  const today = { year: now.getFullYear(), monthIndex: now.getMonth(), day: now.getDate() }

  function prevMonth() {
    setSelectedDay(null)
    setAssignDay(null)
    if (monthIndex === 0) {
      setMonthIndex(11)
      setYear((value) => value - 1)
    } else {
      setMonthIndex((value) => value - 1)
    }
  }

  function nextMonth() {
    setSelectedDay(null)
    setAssignDay(null)
    if (monthIndex === 11) {
      setMonthIndex(0)
      setYear((value) => value + 1)
    } else {
      setMonthIndex((value) => value + 1)
    }
  }

  function selectDay(day: number) {
    const sessions = days?.find((entry) => entry.day === day)?.sessions ?? []
    if (sessions.length > 0) {
      setSelectedDay(day)
    } else {
      setAssignDay(day)
    }
  }

  const first = selectedDay === null ? null : days?.find((entry) => entry.day === selectedDay)?.sessions[0] ?? null

  function summaryFor(session: ResolvedSession): { summary: string; notes: string } {
    if (!session.done) return { summary: session.description || session.name, notes: '' }
    const workout = dayLogs?.workouts.find((log) => log.planId === session.planId)
    if (workout?.durationSec) return { summary: formatDuration(workout.durationSec), notes: workout.notes ?? '' }
    const cardio = dayLogs?.cardios.find((log) => log.planId === session.planId || (!log.planId && log.type === session.sport))
    if (cardio) {
      const distance = cardio.distanceKm !== undefined ? ` · ${String(cardio.distanceKm).replace('.', ',')} km` : ''
      return { summary: `${formatDuration(cardio.durationSec)}${distance}`, notes: cardio.notes ?? '' }
    }
    return { summary: session.description || session.name, notes: '' }
  }

  return (
    <div style={{ height: '100%' }}>
      <h1>Calendario</h1>
      <MonthCalendar
        year={year}
        monthIndex={monthIndex}
        days={(days ?? []).map((entry) => ({
          day: entry.day,
          marks: entry.sessions.map((session) => ({ sport: session.sport, done: session.done })),
        }))}
        today={today}
        selectedDay={selectedDay}
        onSelectDay={selectDay}
        onPrev={prevMonth}
        onNext={nextMonth}
      />

      {selectedDay !== null && first ? (
        <DaySummaryModal
          dateLabel={formatDayLabel(year, monthIndex, selectedDay)}
          title={first.name}
          summary={summaryFor(first).summary}
          notes={summaryFor(first).notes}
          onAdd={() => setAssignDay(selectedDay)}
          onClose={() => setSelectedDay(null)}
        />
      ) : null}

      {assignDay !== null ? (
        <AssignModal
          schede={schede}
          onPick={(planId) => {
            void service
              .assign(planId, dateOfMonth(year, monthIndex, assignDay))
              .then(() => {
                setAssignDay(null)
                setSelectedDay(null)
                return refresh()
              })
          }}
          onClose={() => setAssignDay(null)}
        />
      ) : null}
    </div>
  )
}