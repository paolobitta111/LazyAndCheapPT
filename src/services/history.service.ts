import type { CardioLog, TrainingPlan, WorkoutLog } from '../models/entities'

export interface HistoryEntry {
  id: string
  date: string
  type: 'workout' | 'cardio'
  durationSec: number
  title: string
  notes?: string
  planId?: string
  planVersion?: number
}

export interface HistoryFilter {
  type: 'all' | 'workout' | 'cardio'
  days: number | null
  query: string
  now?: Date
}

export function buildHistory(
  workouts: WorkoutLog[],
  cardios: CardioLog[],
  plans: TrainingPlan[],
): HistoryEntry[] {
  const planById = new Map(plans.filter((plan) => plan.id).map((plan) => [plan.id as string, plan]))
  const workoutEntries: HistoryEntry[] = workouts.map((workout) => {
    const plan = workout.planId ? planById.get(workout.planId) : undefined
    return {
      id: workout.id ?? `${workout.date}-workout`,
      date: workout.date,
      type: 'workout',
      durationSec: workout.durationSec ?? 0,
      title: workout.planName ?? plan?.name ?? 'Workout',
      notes: workout.notes,
      planId: workout.planId,
      planVersion: workout.planVersion ?? plan?.version,
    }
  })
  const cardioEntries: HistoryEntry[] = cardios.map((cardio) => ({
    id: cardio.id ?? `${cardio.date}-cardio`,
    date: cardio.date,
    type: 'cardio',
    durationSec: cardio.durationSec,
    title: cardio.type === 'running' ? 'Corsa' : cardio.type === 'cycling' ? 'Bici' : 'Cardio',
    notes: cardio.notes,
  }))
  return [...workoutEntries, ...cardioEntries].sort((a, b) => b.date.localeCompare(a.date))
}

export function filterHistory(entries: HistoryEntry[], filter: HistoryFilter): HistoryEntry[] {
  const now = filter.now ?? new Date()
  const query = filter.query.trim().toLowerCase()
  const cutoff = filter.days == null ? null : new Date(now.getTime() - filter.days * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  return entries.filter((entry) => {
    if (filter.type !== 'all' && entry.type !== filter.type) return false
    if (cutoff && entry.date < cutoff) return false
    if (query && !`${entry.title} ${entry.notes ?? ''}`.toLowerCase().includes(query)) return false
    return true
  })
}

export function formatDuration(seconds: number): string {
  return `${Math.round(seconds / 60)} min`
}
