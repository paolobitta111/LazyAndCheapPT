import type { CardioLog, CardioSegment, CreateCardioLogInput } from '../models/entities'
import type { CardioLogRepo } from '../data/repositories'

export interface CardioMetrics {
  durationSec: number
  distanceKm: number
  segmentCount: number
}

export class CardioLogService {
  constructor(private readonly repo: CardioLogRepo) {}

  async createFreeSession(input: CreateCardioLogInput): Promise<CardioLog> {
    return this.repo.create({
      ...input,
      durationSec: input.durationSec ?? 0,
      distanceKm: input.distanceKm ?? 0,
    })
  }

  async createWithSegments(
    input: Omit<CreateCardioLogInput, 'durationSec' | 'distanceKm' | 'segments'>,
    segments: CardioSegment[],
  ): Promise<CardioLog> {
    const metrics = this.summarize(segments)
    return this.repo.create({
      ...input,
      segments,
      durationSec: metrics.durationSec,
      distanceKm: metrics.distanceKm,
    })
  }

  async listByDate(date: string): Promise<CardioLog[]> {
    return this.repo.listByDate(date)
  }

  summarize(segments: CardioSegment[]): CardioMetrics {
    const durationSec = segments.reduce((sum, segment) => sum + segment.durationSec, 0)
    const distanceKm = segments.reduce((sum, segment) => sum + (segment.distanceKm ?? 0), 0)
    return { durationSec, distanceKm, segmentCount: segments.length }
  }
}
