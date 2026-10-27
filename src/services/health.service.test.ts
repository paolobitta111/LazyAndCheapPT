import { beforeEach, describe, expect, it } from 'vitest'
import { loadHealth, saveHealth } from './health.service'

beforeEach(() => {
  localStorage.clear()
})

describe('health.service', () => {
  it('roundtrips values through localStorage', () => {
    saveHealth({ sleep: 7.2, restingHr: 52, steps: 3240 })
    expect(loadHealth()).toEqual({ sleep: 7.2, restingHr: 52, steps: 3240 })
  })

  it('returns empty values when nothing is stored', () => {
    expect(loadHealth()).toEqual({})
  })
})