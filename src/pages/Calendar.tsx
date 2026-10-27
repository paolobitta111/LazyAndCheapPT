import { useEffect, useState } from 'react'
import { DaySummaryModal } from '../components/DaySummaryModal'
import { MonthCalendar, monthNames } from '../components/MonthCalendar'
import { mockSchede, octoberMonthIndex, octoberSessions, octoberYear } from './today-mock'
import type { MockDaySession } from './today-mock'
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

function formatDayLabel(year: number, monthIndex: number, day: number): string {
  const date = new Date(year, monthIndex, day)
  const weekday = date.toLocaleDateString('it-IT', { weekday: 'long' })
  const month = monthNames[monthIndex]
  const label = `${weekday} ${day} ${month}`
  return label.charAt(0).toUpperCase() + label.slice(1)
}

export default function Calendar() {
  const [year, setYear] = useState(octoberYear)
  const [monthIndex, setMonthIndex] = useState(octoberMonthIndex)
  const [selectedDay, setSelectedDay] = useState<number | null>(null)

  const isOctober = year === octoberYear && monthIndex === octoberMonthIndex
  const sessions: MockDaySession[] = isOctober ? octoberSessions : []
  const today = isOctober ? { year: octoberYear, monthIndex: octoberMonthIndex, day: 25 } : null

  const selected = selectedDay === null ? null : sessions.find((session) => session.day === selectedDay) ?? null
  const selectedScheda = selected ? mockSchede.find((scheda) => scheda.id === selected.schedaId) : undefined

  function prevMonth() {
    if (monthIndex === 0) {
      setMonthIndex(11)
      setYear((value) => value - 1)
    } else {
      setMonthIndex((value) => value - 1)
    }
    setSelectedDay(null)
  }

  function nextMonth() {
    if (monthIndex === 11) {
      setMonthIndex(0)
      setYear((value) => value + 1)
    } else {
      setMonthIndex((value) => value + 1)
    }
    setSelectedDay(null)
  }

  return (
    <div style={{ height: '100%' }}>
      <MonthCalendar
        year={year}
        monthIndex={monthIndex}
        sessions={sessions}
        today={today}
        onSelectDay={(day) => {
          if (sessions.some((session) => session.day === day)) setSelectedDay(day)
        }}
        onPrev={prevMonth}
        onNext={nextMonth}
      />
      {selected ? (
        <DaySummaryModal
          dateLabel={formatDayLabel(year, monthIndex, selected.day)}
          title={selectedScheda?.name ?? 'Sessione'}
          summary={selected.summary}
          notes={selected.notes}
          onClose={() => setSelectedDay(null)}
        />
      ) : null}
    </div>
  )
}