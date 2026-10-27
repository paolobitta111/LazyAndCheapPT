// ============================================================================
// PlanningService — resolves which schede land on which dates, and writes
// the per-date exceptions (skip / substitute / assign).
// ============================================================================

import type { CardioLog, PlannedSession, TrainingPlan } from '../models/entities'
import type {
  CardioLogRepo,
  PlannedSessionRepo,
  TrainingPlanRepo,
  WorkoutLogRepo,
} from '../data/repositories'

// ---------------------------------------------------------------------------
// Date helpers — local time, Monday-first
// ---------------------------------------------------------------------------

/** Local-time YYYY-MM-DD key. Never use toISOString(): it slices UTC. */
export function dateKey(date: Date): string {
  const year = String(date.getFullYear()).padStart(4, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/** 1..7, Monday=1 … Sunday=7. */
export function weekdayIndex(date: Date): number {
  return ((date.getDay() + 6) % 7) + 1
}

// ---------------------------------------------------------------------------
// Resolution types
// ---------------------------------------------------------------------------

export interface ResolvedSession {
  planId: string
  name: string
  description: string
  sport?: string
  order: number
  done: boolean
}

export interface MonthDay {
  day: number
  sessions: ResolvedSession[]
}

// ---------------------------------------------------------------------------

const RULE_LESS_ORDER = 99

export class PlanningService {
  constructor(
    private readonly trainingPlanRepo: TrainingPlanRepo,
    private readonly plannedSessionRepo: PlannedSessionRepo,
    private readonly workoutLogRepo: WorkoutLogRepo,
    private readonly cardioLogRepo: CardioLogRepo,
  ) {}

  /**
   * Resolution: weekly rules + specific dates from ACTIVE plans,
   * plus explicit `planned` rows (any plan status, so an assigned day
   * survives archive), minus `cancelled` planIds for that date,
   * deduped by planId.
   */
  async resolveDay(date: string): Promise<ResolvedSession[]> {
    const [plans, rows, workouts, cardios] = await Promise.all([
      this.trainingPlanRepo.list(),
      this.plannedSessionRepo.listByDate(date),
      this.workoutLogRepo.listByDate(date),
      this.cardioLogRepo.listByDate(date),
    ])
    return this.resolveFrom(date, plans, rows, workouts, cardios)
  }

  async resolveMonth(year: number, monthIndex: number): Promise<MonthDay[]> {
    // Batched: one read per table, then in-memory resolution (a per-day query
    // would be 4 × daysInMonth IndexedDB reads on every month render).
    const [plans, rows, workouts, cardios] = await Promise.all([
      this.trainingPlanRepo.list(),
      this.plannedSessionRepo.list(),
      this.workoutLogRepo.list(),
      this.cardioLogRepo.list(),
    ])
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate()
    const days: MonthDay[] = []
    for (let day = 1; day <= daysInMonth; day++) {
      const date = `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      days.push({
        day,
        sessions: this.resolveFrom(
          date,
          plans,
          rows.filter((row) => row.date === date),
          workouts.filter((log) => log.date === date),
          cardios.filter((log) => log.date === date),
        ),
      })
    }
    return days
  }

  private resolveFrom(
    date: string,
    plans: TrainingPlan[],
    rows: PlannedSession[],
    workouts: { planId?: string; date: string }[],
    cardios: CardioLog[],
  ): ResolvedSession[] {
    const weekday = weekdayIndex(new Date(`${date}T12:00:00`))

    const cancelled = new Set(rows.filter((row) => row.status === 'cancelled').map((row) => row.planId))
    const planned = new Set(rows.filter((row) => row.status === 'planned').map((row) => row.planId))

    const byPlan = new Map<string, { plan: TrainingPlan; order: number }>()

    for (const plan of plans) {
      if (!plan.id || plan.status !== 'active') continue // rules resolve only for active schede
      if (cancelled.has(plan.id)) continue
      const rule = plan.plannedSessions?.find((entry) => entry.dayOfWeek === weekday)
      const onDate = plan.dates?.includes(date)
      if (rule || onDate) byPlan.set(plan.id, { plan: { ...plan, id: plan.id }, order: rule?.order ?? RULE_LESS_ORDER })
    }

    for (const planId of planned) {
      if (cancelled.has(planId) || byPlan.has(planId)) continue
      const plan = plans.find((entry) => entry.id === planId)
      if (!plan) continue
      byPlan.set(planId, { plan: { ...plan, id: planId }, order: RULE_LESS_ORDER })
    }

    const resolved: ResolvedSession[] = [...byPlan.entries()].map(([planId, { plan, order }]) => ({
      planId,
      name: plan.name,
      description: plan.description,
      sport: plan.sport,
      order,
      done: this.isDone(plan, workouts, cardios),
    }))

    return resolved.sort((a, b) => a.order - b.order || a.name.localeCompare(b.name))
  }

  async skip(planId: string, date: string): Promise<void> {
    const existing = await this.findRow(planId, date)
    if (existing) {
      await this.plannedSessionRepo.update(existing.id!, { status: 'cancelled' })
      return
    }
    await this.plannedSessionRepo.create({ planId, date, status: 'cancelled' })
  }

  async substitute(oldPlanId: string, newPlanId: string, date: string): Promise<void> {
    await this.skip(oldPlanId, date)
    await this.assign(newPlanId, date)
  }

  async assign(planId: string, date: string): Promise<void> {
    const existing = await this.findRow(planId, date)
    if (existing) {
      if (existing.status !== 'planned') {
        await this.plannedSessionRepo.update(existing.id!, { status: 'planned' })
      }
      return
    }
    await this.plannedSessionRepo.create({ planId, date, status: 'planned' })
  }

  /** The row backing a Today box tap: reuse, un-skip, or create. */
  async ensurePlanned(planId: string, date: string): Promise<PlannedSession> {
    const existing = await this.findRow(planId, date)
    if (existing) {
      if (existing.status !== 'planned') {
        const updated = await this.plannedSessionRepo.update(existing.id!, { status: 'planned' })
        return updated
      }
      return existing
    }
    return this.plannedSessionRepo.create({ planId, date, status: 'planned' })
  }

  private async findRow(planId: string, date: string): Promise<PlannedSession | null> {
    const rows = await this.plannedSessionRepo.listByDate(date)
    return rows.find((row) => row.planId === planId) ?? null
  }

  private isDone(plan: TrainingPlan, workouts: { planId?: string }[], cardios: CardioLog[]): boolean {
    if (workouts.some((log) => log.planId === plan.id)) return true
    return cardios.some(
      (log) =>
        log.planId === plan.id ||
        (!log.planId && (plan.sport === 'running' || plan.sport === 'cycling') && log.type === plan.sport),
    )
  }
}