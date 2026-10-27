import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { type PlannedSession, type TrainingPlan } from '../models/entities'
import type { PlannedSessionRepo, TrainingPlanRepo } from '../data/repositories'
import { useCalendarWeek } from './Calendar'

function makeRepo(overrides: Partial<PlannedSessionRepo> = {}): PlannedSessionRepo {
  const listByDate = vi.fn<(date: string) => Promise<PlannedSession[]>>().mockResolvedValue([])
  return {
    create: vi.fn(),
    get: vi.fn(),
    list: vi.fn(),
    listByDate,
    update: vi.fn(),
    delete: vi.fn(),
    ...overrides,
  }
}

function makePlanRepo(overrides: Partial<TrainingPlanRepo> = {}): TrainingPlanRepo {
  const get = vi.fn<(id: string) => Promise<TrainingPlan | null>>().mockResolvedValue(null)
  return {
    create: vi.fn(),
    update: vi.fn(),
    get,
    list: vi.fn(),
    delete: vi.fn(),
    getByExerciseName: vi.fn(),
    listByStatus: vi.fn(),
    getByVersion: vi.fn(),
    duplicate: vi.fn(),
    archive: vi.fn(),
    ...overrides,
  }
}

beforeEach(() => {
  vi.restoreAllMocks()
})

describe('useCalendarWeek', () => {
  it('returns empty slots when no planned sessions exist', async () => {
    const repo = makeRepo()
    const planRepo = makePlanRepo()
    const { result } = renderHook(() => useCalendarWeek(repo, planRepo))

    await waitFor(() => {
      expect(result.current).toHaveLength(7)
    })

    // All 7 days should be empty (hasPlan: false)
    for (const slot of result.current) {
      expect(slot.hasPlan).toBe(false)
      expect(slot.planName).toBe('')
    }

    expect(repo.listByDate).toHaveBeenCalledTimes(7)
    expect(planRepo.get).not.toHaveBeenCalled()
  })

  it('populates slots with plan names when sessions exist', async () => {
    const plan: TrainingPlan = {
      id: 'plan-1',
      name: 'Full Body',
      description: '',
      exercises: [],
      version: 1,
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const repo = makeRepo({
      listByDate: vi.fn<(date: string) => Promise<PlannedSession[]>>().mockImplementation(
        async (date) => [{ id: 's1', planId: 'plan-1', date, status: 'planned' as const, createdAt: new Date(), updatedAt: new Date() }],
      ),
    })

    const planRepo = makePlanRepo({ get: vi.fn<(id: string) => Promise<TrainingPlan | null>>().mockResolvedValue(plan) })

    const { result } = renderHook(() => useCalendarWeek(repo, planRepo))

    await waitFor(() => {
      expect(result.current).toHaveLength(7)
      expect(result.current.some(s => s.hasPlan && s.planName === 'Full Body')).toBe(true)
    })

    expect(planRepo.get).toHaveBeenCalledWith('plan-1')
  })

  it('calls listByDate for each day of the week', async () => {
    const repo = makeRepo()
    const planRepo = makePlanRepo()
    renderHook(() => useCalendarWeek(repo, planRepo))

    await waitFor(() => {
      expect(repo.listByDate).toHaveBeenCalledTimes(7)
    })

    const callDates = ((repo.listByDate as ReturnType<typeof vi.fn>).mock.calls as [string][]).map(c => c[0])
    expect(callDates.length).toBe(7)
  })
})
