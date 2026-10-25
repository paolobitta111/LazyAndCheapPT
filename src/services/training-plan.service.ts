// ============================================================================
// TrainingPlanService — JSON validation + versioning layer
// ============================================================================

import type { TrainingPlanRepo } from '../data/repositories'
import type { CreateTrainingPlanInput, TrainingPlan } from '../models/entities'
import { addSchema, validateAll } from '../data/schema-validator'
import trainingPlanSchema from '../data/schemas/training-plan.json'
import type { ErrorObject } from 'ajv/dist/2020'

const PLAN_SCHEMA_URI = 'https://lazycheapcoach.dev/schemas/training-plan/v1.0.0'

// Register schema at init
addSchema(PLAN_SCHEMA_URI, trainingPlanSchema)

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

export class TrainingPlanService {
  constructor(private readonly repo: TrainingPlanRepo) {}

  /**
   * Validate raw JSON (e.g. from LLM copy/paste) against the schema.
   * Returns { valid, errors }.
   */
  validate(raw: unknown): { valid: boolean; errors: ErrorObject[] } {
    return validateAll(PLAN_SCHEMA_URI, raw)
  }

  /**
   * Normalize a validated plan: provide sensible defaults for optional fields.
   * Version and status are assigned by the repo create method.
   */
  private normalize(raw: Record<string, unknown>): CreateTrainingPlanInput {
    return {
      name: raw.name as string,
      description: (raw.description as string) ?? '',
      exercises: (raw.exercises as CreateTrainingPlanInput['exercises']) ?? [],
      sport: (raw.sport as string) ?? undefined,
      objective: (raw.objective as string) ?? undefined,
      notes: (raw.notes as string) ?? undefined,
    }
  }

  /**
   * Create a plan from raw JSON. Validates → normalizes → stores (v1).
   */
  async createFromJson(raw: unknown): Promise<TrainingPlan> {
    const { valid, errors } = this.validate(raw)
    if (!valid) throw new Error(`Validation failed: ${errors.map(e => e.message).join(', ')}`)
    const input = this.normalize(raw as Record<string, unknown>)
    return this.repo.create(input)
  }

  /**
   * Get the latest version of a plan.
   */
  async getLatest(id: string): Promise<TrainingPlan | null> {
    return this.repo.get(id)
  }

  /**
   * Get a specific version of a plan.
   */
  async getVersion(planId: string, version: number): Promise<TrainingPlan | null> {
    return this.repo.getByVersion(planId, version)
  }

  /**
   * List plans filtered by status.
   */
  async listByStatus(status: 'draft' | 'active' | 'archived'): Promise<TrainingPlan[]> {
    return this.repo.listByStatus(status)
  }

  /**
   * List all plans (regardless of status).
   */
  async list(): Promise<TrainingPlan[]> {
    return this.repo.list()
  }

  /**
   * Update a plan — creates a new version (immutable versioning).
   * The old version is preserved; a new version with incremented version number is created.
   */
  async update(planId: string, updates: Partial<Omit<TrainingPlan, 'id' | 'version' | 'status' | 'createdAt'>>): Promise<TrainingPlan> {
    const existing = await this.repo.get(planId)
    if (!existing) throw new Error(`TrainingPlan ${planId} not found`)
    const input: CreateTrainingPlanInput = {
      name: updates.name ?? existing.name,
      description: updates.description ?? existing.description,
      exercises: updates.exercises ?? existing.exercises,
      sport: updates.sport ?? existing.sport,
      objective: updates.objective ?? existing.objective,
      notes: updates.notes ?? existing.notes,
    }
    return this.repo.create(input)
  }

  /**
   * Duplicate a plan (new version 1, same name + copy suffix).
   */
  async duplicate(planId: string): Promise<TrainingPlan> {
    return this.repo.duplicate(planId)
  }

  /**
   * Archive a plan (soft delete).
   */
  async archive(planId: string): Promise<TrainingPlan> {
    return this.repo.archive(planId)
  }
}
