import { CalendarSlot } from '../components/CalendarSlot'
import { useEffect, useState } from 'react'
import { useAppData } from '../data/db'
import type { PlannedSession, TrainingPlan } from '../models/entities'
import type { PlannedSessionRepo, TrainingPlanRepo } from '../data/repositories'

export interface CalendarSlotData {
  day: string
  date: string
  time: string
  planName: string
  hasPlan: boolean
}

function getWeekStart(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  d.setHours(0, 0, 0, 0)
  return d
}

function getDayName(date: Date): string {
  const days = ['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato', 'Domenica']
  const dayIndex = (date.getDay() + 6) % 7
  return days[dayIndex]
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('it-IT', { day: 'numeric', month: 'short' })
}

export function useCalendarWeek(
  plannedSessionRepo: PlannedSessionRepo,
  trainingPlanRepo: TrainingPlanRepo,
): CalendarSlotData[] {
  const [slots, setSlots] = useState<CalendarSlotData[]>([])

  useEffect(() => {
    let cancelled = false
    const load = async (): Promise<void> => {
      const weekStart = getWeekStart(new Date())
      const fetchedSlots: CalendarSlotData[] = []

      for (let i = 0; i < 7; i++) {
        const d = new Date(weekStart)
        d.setDate(d.getDate() + i)
        const dateStr = d.toISOString().split('T')[0]

        const sessions: PlannedSession[] = await plannedSessionRepo.listByDate(dateStr)

        if (sessions.length > 0) {
          for (const session of sessions) {
            const plan: TrainingPlan | null = await trainingPlanRepo.get(session.planId)
            if (plan) {
              fetchedSlots.push({
                day: getDayName(d),
                date: formatDate(d),
                time: '08:00',
                planName: plan.name,
                hasPlan: true,
              })
            }
          }
        } else {
          fetchedSlots.push({
            day: getDayName(d),
            date: formatDate(d),
            time: '',
            planName: '',
            hasPlan: false,
          })
        }
      }

      if (!cancelled) setSlots(fetchedSlots)
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [plannedSessionRepo, trainingPlanRepo])

  return slots
}

export default function Calendar() {
  const { plannedSessionRepo, trainingPlanRepo } = useAppData()
  const slots = useCalendarWeek(plannedSessionRepo, trainingPlanRepo)

  return (
    <div className="container">
      <h1 className="title is-4">📅 Calendario</h1>

      <div className="tabs is-boxed mb-4">
        <ul>
          <li className="is-active"><a>Settimana</a></li>
          <li><a>Mese</a></li>
        </ul>
      </div>

      <section>
        {slots.map((slot, idx) => (
          <CalendarSlot
            key={idx}
            day={slot.day}
            time={slot.time}
            planName={slot.planName}
            hasPlan={slot.hasPlan}
          />
        ))}
      </section>
    </div>
  )
}
