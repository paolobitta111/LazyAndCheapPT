import { beforeEach, describe, expect, it } from 'vitest'
import type { CardioLog, PlannedSession, TrainingPlan, WorkoutLog } from '../models/entities'
import type { CardioLogRepo, PlannedSessionRepo, TrainingPlanRepo, WorkoutLogRepo } from '../data/repositories'
import { dateKey, weekdayIndex, PlanningService } from './planning.service'

// ---------------------------------------------------------------------------
// In-memory fakes
// ---------------------------------------------------------------------------

interface Store {
  plans: TrainingPlan[]
  rows: PlannedSession[]
  workouts: WorkoutLog[]
  cardios: CardioLog[]
}

function makeStore(): Store {
  return { plans: [], rows: [], workouts: [], cardios: [] }
}

function makePlan(store: Store, id: string, over: Partial<TrainingPlan> = {}): TrainingPlan {
  const plan: TrainingPlan = {
    id,
    name: id,
    description: `${id} description`,
    exercises: [],
    version: 1,
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...over,
  }
  store.plans.push(plan)
  return plan
}

function makeRow(store: Store, planId: string, date: string, status: PlannedSession['status']): PlannedSession {
  const row: PlannedSession = {
    id: `row-${planId}-${date}-${status}-${store.rows.length}`,
    planId,
    date,
    status,
    createdAt: new Date(),
    updatedAt: new Date(),
  }
  store.rows.push(row)
  return row
}

function makeWorkout(store: Store, over: Partial<WorkoutLog>): void {
  store.workouts.push({
    id: `wl-${store.workouts.length}`,
    date: over.date ?? '',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...over,
  } as WorkoutLog)
}

function makeCardio(store: Store, over: Partial<CardioLog>): void {
  store.cardios.push({
    id: `cl-${store.cardios.length}`,
    date: over.date ?? '',
    type: 'running',
    durationSec: 1800,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...over,
  } as CardioLog)
}

function makeService(store: Store): PlanningService {
  const trainingPlanRepo: Pick<TrainingPlanRepo, 'list'> = {
    list: async () => [...store.plans],
  }
  const plannedSessionRepo: PlannedSessionRepo = {
    create: async (input) => {
      const row: PlannedSession = {
        ...input,
        id: `row-${store.rows.length}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as PlannedSession
      store.rows.push(row)
      return row
    },
    update: async (id, data) => {
      const index = store.rows.findIndex((row) => row.id === id)
      if (index < 0) throw new Error(`PlannedSession ${id} not found`)
      store.rows[index] = { ...store.rows[index], ...data, id }
      return store.rows[index]
    },
    get: async (id) => store.rows.find((row) => row.id === id) ?? null,
    list: async () => [...store.rows],
    listByDate: async (date) => store.rows.filter((row) => row.date === date),
    delete: async () => undefined,
  }
  const workoutLogRepo: Pick<WorkoutLogRepo, 'listByDate'> = {
    listByDate: async (date) => store.workouts.filter((log) => log.date === date),
  }
  const cardioLogRepo: Pick<CardioLogRepo, 'listByDate'> = {
    listByDate: async (date) => store.cardios.filter((log) => log.date === date),
  }
  return new PlanningService(
    trainingPlanRepo as TrainingPlanRepo,
    plannedSessionRepo,
    workoutLogRepo as WorkoutLogRepo,
    cardioLogRepo as CardioLogRepo,
  )
}

// ---------------------------------------------------------------------------

let store: Store
let service: PlanningService

beforeEach(() => {
  store = makeStore()
  service = makeService(store)
})

describe('dateKey / weekdayIndex', () => {
  it('keys a 23:30 local date to the same local day, Monday-first', () => {
    expect(dateKey(new Date(2026, 9, 27, 23, 30))).toBe('2026-10-27')
    expect(weekdayIndex(new Date(2026, 9, 27))).toBe(2)
    expect(weekdayIndex(new Date(2026, 9, 26))).toBe(1)
  })
})

describe('resolveDay', () => {
  it('includes rules, dates and planned rows; excludes archived rules', async () => {
    makePlan(store, 'RuleActive', { plannedSessions: [{ dayOfWeek: 2, order: 2 }] })
    makePlan(store, 'DatesActive', { dates: ['2026-10-27'] })
    makePlan(store, 'RuleArchived', { status: 'archived', plannedSessions: [{ dayOfWeek: 2, order: 1 }] })
    makePlan(store, 'RowArchived', { status: 'archived' })
    makeRow(store, 'RowArchived', '2026-10-27', 'planned')

    const resolved = await service.resolveDay('2026-10-27')
    expect(resolved.map((session) => session.planId).sort()).toEqual(['DatesActive', 'RowArchived', 'RuleActive'])
    expect(resolved.find((session) => session.planId === 'RuleActive')?.order).toBe(2)
    expect(resolved.find((session) => session.planId === 'RowArchived')?.name).toBe('RowArchived')
  })

  it('cancelled hides the rule only on that date', async () => {
    makePlan(store, 'P', { plannedSessions: [{ dayOfWeek: 2, order: 1 }] })
    makeRow(store, 'P', '2026-10-27', 'cancelled')

    expect((await service.resolveDay('2026-10-27')).map((s) => s.planId)).toEqual([])
    expect((await service.resolveDay('2026-11-03')).map((s) => s.planId)).toEqual(['P'])
  })

  it('dedups a plan with both a rule and a planned row', async () => {
    makePlan(store, 'P', { plannedSessions: [{ dayOfWeek: 2, order: 1 }] })
    makeRow(store, 'P', '2026-10-27', 'planned')
    expect((await service.resolveDay('2026-10-27')).filter((s) => s.planId === 'P')).toHaveLength(1)
  })

  it('marks done from workout and cardio logs', async () => {
    makePlan(store, 'Strength', { sport: 'strength', plannedSessions: [{ dayOfWeek: 2, order: 1 }] })
    makePlan(store, 'Run', { sport: 'running', plannedSessions: [{ dayOfWeek: 2, order: 2 }] })
    makePlan(store, 'Bike', { sport: 'cycling', plannedSessions: [{ dayOfWeek: 2, order: 3 }] })
    makePlan(store, 'OtherRun', { sport: 'running', plannedSessions: [{ dayOfWeek: 2, order: 4 }] })
    makePlan(store, 'NoLog', { sport: 'cycling', plannedSessions: [{ dayOfWeek: 2, order: 5 }] })

    makeWorkout(store, { planId: 'Strength', date: '2026-10-27' })       // workout log → done
    makeCardio(store, { planId: 'Bike', type: 'cycling', date: '2026-10-27' })  // cardio with planId → done
    makeCardio(store, { type: 'running', date: '2026-10-27' })           // un-owned running log → every running scheda done
    makeCardio(store, { type: 'other', date: '2026-10-27' })             // unrelated type → nothing

    const resolved = await service.resolveDay('2026-10-27')
    const doneFor = (planId: string): boolean => resolved.find((s) => s.planId === planId)?.done ?? false
    expect(doneFor('Strength')).toBe(true)
    expect(doneFor('Run')).toBe(true)
    expect(doneFor('Bike')).toBe(true)
    expect(doneFor('OtherRun')).toBe(true)
    expect(doneFor('NoLog')).toBe(false)
  })
})

describe('writes', () => {
  it('skip creates a cancelled row', async () => {
    makePlan(store, 'P')
    await service.skip('P', '2026-10-27')
    expect(store.rows).toHaveLength(1)
    expect(store.rows[0]).toMatchObject({ planId: 'P', date: '2026-10-27', status: 'cancelled' })
  })

  it('skip updates a planned row instead of adding one', async () => {
    makePlan(store, 'P')
    makeRow(store, 'P', '2026-10-27', 'planned')
    await service.skip('P', '2026-10-27')
    expect(store.rows).toHaveLength(1)
    expect(store.rows[0].status).toBe('cancelled')
  })

  it('substitute leaves old cancelled and new planned', async () => {
    makePlan(store, 'Old')
    makePlan(store, 'New')
    await service.substitute('Old', 'New', '2026-10-27')
    expect(store.rows).toHaveLength(2)
    expect(store.rows.find((row) => row.planId === 'Old')?.status).toBe('cancelled')
    expect(store.rows.find((row) => row.planId === 'New')?.status).toBe('planned')
  })

  it('assign writes a planned row', async () => {
    makePlan(store, 'P')
    await service.assign('P', '2026-10-28')
    expect(store.rows).toHaveLength(1)
    expect(store.rows[0]).toMatchObject({ planId: 'P', date: '2026-10-28', status: 'planned' })
  })

  it('ensurePlanned reuses, flips and creates', async () => {
    makePlan(store, 'P', { plannedSessions: [{ dayOfWeek: 2, order: 1 }] })
    makeRow(store, 'P', '2026-10-27', 'planned')
    const reused = await service.ensurePlanned('P', '2026-10-27')
    expect(reused.id).toBe(store.rows[0].id)
    expect(store.rows).toHaveLength(1)

    await service.skip('P', '2026-10-27')
    const flipped = await service.ensurePlanned('P', '2026-10-27')
    expect(flipped.status).toBe('planned')
    expect(store.rows).toHaveLength(1)

    const created = await service.ensurePlanned('P', '2026-11-03')
    expect(created.status).toBe('planned')
    expect(store.rows).toHaveLength(2)
  })
})

describe('resolveMonth', () => {
  it('returns every day of October with the rule on the 27th', async () => {
    makePlan(store, 'P', { plannedSessions: [{ dayOfWeek: 2, order: 1 }] })
    const days = await service.resolveMonth(2026, 9)
    expect(days).toHaveLength(31)
    expect(days[0]).toEqual({ day: 1, sessions: [] })
    expect(days[26].sessions.map((session) => session.planId)).toEqual(['P'])
    expect(days[26].day).toBe(27)
  })
})