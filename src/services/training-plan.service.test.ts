import { describe, it, expect, beforeEach, vi } from 'vitest'
import type { TrainingPlan } from '../models/entities'
import type { TrainingPlanRepo } from '../data/repositories'
import { TrainingPlanService } from './training-plan.service'
import validPlan from '../data/fixtures/valid-plan.json'

// Mock repo
const createMockRepo = (): { get: ReturnType<typeof vi.fn>; update: ReturnType<typeof vi.fn>; list: ReturnType<typeof vi.fn>; delete: ReturnType<typeof vi.fn>; getByExerciseName: ReturnType<typeof vi.fn>; listByStatus: ReturnType<typeof vi.fn>; getByVersion: ReturnType<typeof vi.fn>; duplicate: ReturnType<typeof vi.fn>; archive: ReturnType<typeof vi.fn>; create: ReturnType<typeof vi.fn> } => ({
  create: vi.fn().mockImplementation(async (input) => {
    const now = new Date()
    return {
      id: `plan-${Date.now()}`,
      ...input,
      version: 1,
      status: 'active',
      createdAt: now,
      updatedAt: now,
    } as TrainingPlan
  }),
  get: vi.fn().mockResolvedValue({
    id: 'plan-1',
    name: 'Test Plan',
    description: 'Test',
    exercises: [],
    version: 1,
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date(),
  } as TrainingPlan),
  update: vi.fn().mockResolvedValue(null as unknown as TrainingPlan),
  list: vi.fn().mockResolvedValue([]),
  delete: vi.fn().mockResolvedValue(undefined),
  getByExerciseName: vi.fn().mockResolvedValue([]),
  listByStatus: vi.fn().mockResolvedValue([]),
  getByVersion: vi.fn().mockResolvedValue(null),
  duplicate: vi.fn().mockResolvedValue({
    id: 'plan-1-copy',
    name: 'Test Plan (Copy)',
    description: 'Test',
    exercises: [],
    version: 1,
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date(),
  } as TrainingPlan),
  archive: vi.fn().mockResolvedValue({
    id: 'plan-1',
    name: 'Test Plan',
    description: 'Test',
    exercises: [],
    version: 1,
    status: 'archived',
    createdAt: new Date(),
    updatedAt: new Date(),
    archivedAt: new Date(),
  } as TrainingPlan),
})

let service: TrainingPlanService

beforeEach(() => {
  const mockRepo = createMockRepo() as TrainingPlanRepo
  service = new TrainingPlanService(mockRepo)
})

describe('TrainingPlanService', () => {
  it('validates a correct plan', () => {
    const result = service.validate(validPlan)
    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it('rejects a plan with invalid schemaVersion', () => {
    const invalidPlan = { ...validPlan, schemaVersion: '0.9.0' }
    const result = service.validate(invalidPlan)
    expect(result.valid).toBe(false)
  })

  it('creates a plan from valid JSON', async () => {
    const plan = await service.createFromJson(validPlan)
    expect(plan.name).toBe(validPlan.name)
    expect(plan.exercises).toHaveLength(3)
    expect(plan.sport).toBe('strength')
    expect(plan.version).toBe(1)
    expect(plan.status).toBe('active')
  })

  it('throws on invalid JSON', async () => {
    const invalidPlan = { schemaVersion: '1.0.0', documentType: 'training-plan' }
    await expect(service.createFromJson(invalidPlan)).rejects.toThrow('Validation failed')
  })

  it('gets the latest plan by id', async () => {
    const plan = await service.getLatest('plan-1')
    expect(plan).not.toBeNull()
    expect(plan?.name).toBe('Test Plan')
  })

  it('lists plans by status', async () => {
    await service.listByStatus('active')
    expect(service['repo'].listByStatus).toHaveBeenCalledWith('active')
  })

  it('lists all plans', async () => {
    await service.list()
    expect(service['repo'].list).toHaveBeenCalled()
  })

  it('updates a plan', async () => {
    const updated = await service.update('plan-1', { name: 'Updated Plan' })
    expect(updated.name).toBe('Updated Plan')
  })

  it('throws on update for non-existent plan', async () => {
(service['repo'].get as ReturnType<typeof vi.fn>).mockResolvedValue(null)
    await expect(service.update('non-existent', { name: 'Oops' })).rejects.toThrow('not found')
  })

  it('duplicates a plan', async () => {
    const dup = await service.duplicate('plan-1')
    expect(dup.name).toBe('Test Plan (Copy)')
  })

  it('archives a plan', async () => {
    const archived = await service.archive('plan-1')
    expect(archived.status).toBe('archived')
    expect(archived.archivedAt).toBeDefined()
  })
})
