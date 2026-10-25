import { describe, expect, it, vi } from 'vitest'
import type { CardioLog, CardioSegment, CreateCardioLogInput } from '../models/entities'
import type { CardioLogRepo } from '../data/repositories'
import { CardioLogService } from './cardio-log.service'

function createRepo(): CardioLogRepo {
  return {
    create: vi.fn(async (input: CreateCardioLogInput): Promise<CardioLog> => ({
      id: 'cardio-1',
      createdAt: new Date('2026-10-25T08:00:00Z'),
      updatedAt: new Date('2026-10-25T08:00:00Z'),
      ...input,
    })),
    update: vi.fn(),
    get: vi.fn(),
    list: vi.fn(),
    listByDate: vi.fn(async () => []),
    delete: vi.fn(),
  }
}

const segment = (durationSec: number, distanceKm: number): CardioSegment => ({
  type: 'interval',
  startTime: new Date('2026-10-25T08:00:00Z'),
  endTime: new Date('2026-10-25T08:05:00Z'),
  durationSec,
  distanceKm,
})

describe('CardioLogService', () => {
  it('creates a free session with zero defaults', async () => {
    const repo = createRepo()
    const service = new CardioLogService(repo)

    const log = await service.createFreeSession({
      date: '2026-10-25',
      type: 'running',
      durationSec: 0,
    })

    expect(log.durationSec).toBe(0)
    expect(log.distanceKm).toBe(0)
    expect(repo.create).toHaveBeenCalledOnce()
  })

  it('sums segment duration and distance', async () => {
    const repo = createRepo()
    const service = new CardioLogService(repo)

    const log = await service.createWithSegments(
      { date: '2026-10-25', type: 'cycling' },
      [segment(300, 1.2), segment(600, 3.4)],
    )

    expect(log.durationSec).toBe(900)
    expect(log.distanceKm).toBeCloseTo(4.6)
    expect(log.segments).toHaveLength(2)
  })
})
