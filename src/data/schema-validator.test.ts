import { describe, it, expect, beforeEach } from 'vitest'
import { addSchema, validate, validateAll } from './schema-validator'
import trainingPlanSchema from './schemas/training-plan.json'
import validPlan from './fixtures/valid-plan.json'
import invalidPlanNoExercises from './fixtures/invalid-plan-no-exercises.json'

const PLAN_URI = 'https://lazycheapcoach.dev/schemas/training-plan/v1.0.0'

beforeEach(() => {
  addSchema(PLAN_URI, trainingPlanSchema)
})

describe('schema-validator', () => {
  it('validates a correct training plan', () => {
    const result = validateAll(PLAN_URI, validPlan)
    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it('rejects a plan with no exercises', () => {
    const result = validateAll(PLAN_URI, invalidPlanNoExercises)
    expect(result.valid).toBe(false)
    expect(result.errors.length).toBeGreaterThan(0)
  })

  it('rejects a plan with wrong schemaVersion', () => {
    const data = { ...validPlan, schemaVersion: '0.9.0' }
    const result = validateAll(PLAN_URI, data)
    expect(result.valid).toBe(false)
  })

  it('rejects a plan with wrong documentType', () => {
    const data = { ...validPlan, documentType: 'workout' }
    const result = validateAll(PLAN_URI, data)
    expect(result.valid).toBe(false)
  })

  it('rejects a plan with missing required fields', () => {
    const data = { schemaVersion: '1.0.0', documentType: 'training-plan' }
    const result = validateAll(PLAN_URI, data)
    expect(result.valid).toBe(false)
  })

  it('rejects a plan with version 0', () => {
    const data = { ...validPlan, version: 0 }
    const result = validateAll(PLAN_URI, data)
    expect(result.valid).toBe(false)
  })

  it('rejects a plan with invalid exercise id (uppercase)', () => {
    const data = {
      ...validPlan,
      exercises: [{ ...validPlan.exercises[0], id: 'Bench_Press' }],
    }
    const result = validateAll(PLAN_URI, data)
    expect(result.valid).toBe(false)
  })

  it('rejects a plan with extra unknown properties', () => {
    const data = { ...validPlan, extraField: 'should-fail' }
    const result = validateAll(PLAN_URI, data)
    expect(result.valid).toBe(false)
  })

  it('throws when validating an unregistered schema', () => {
    expect(() => validate('unknown-uri', {})).toThrow('Schema not registered')
  })
})
