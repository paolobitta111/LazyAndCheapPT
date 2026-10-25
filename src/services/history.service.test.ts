import { describe, expect, it } from 'vitest'
import type { CardioLog, TrainingPlan, WorkoutLog } from '../models/entities'
import { buildHistory, filterHistory } from './history.service'

const stamp = { createdAt: new Date('2026-10-01'), updatedAt: new Date('2026-10-01') }

describe('history.service', () => {
  it('keeps the plan snapshot name instead of the current plan name', () => {
    const workouts: WorkoutLog[] = [{
      ...stamp,
      id: 'w1',
      date: '2026-10-20',
      planId: 'p1',
      planVersion: 2,
      planName: 'Push v2',
      notes: 'bene',
    }]
    const plans: TrainingPlan[] = [{
      ...stamp,
      id: 'p1',
      name: 'Push v3',
      description: '',
      exercises: [],
      version: 3,
      status: 'active',
    }]
    const [entry] = buildHistory(workouts, [], plans)
    expect(entry.title).toBe('Push v2')
    expect(entry.planVersion).toBe(2)
    expect(entry.notes).toBe('bene')
  })

  it('filters by type, window and query', () => {
    const cardios: CardioLog[] = [{
      ...stamp,
      id: 'c1',
      date: '2026-10-24',
      type: 'running',
      durationSec: 1200,
      notes: 'parco',
    }]
    const entries = buildHistory([], cardios, [])
    const filtered = filterHistory(entries, {
      type: 'cardio',
      days: 7,
      query: 'parco',
      now: new Date('2026-10-25T00:00:00Z'),
    })
    expect(filtered).toHaveLength(1)
    expect(filterHistory(entries, { type: 'workout', days: null, query: '' })).toHaveLength(0)
  })
})
