import { describe, expect, it } from 'vitest'
import { composeExchange } from './llm-prompts'

describe('composeExchange', () => {
  it('omits notes unless requested and keeps performed results', () => {
    const selected = {
      plan: { name: 'Push', notes: 'segreto' },
      performed: [{ exercise: 'Panca', kg: 60, reps: 8 }],
    }
    const hidden = composeExchange('session-feedback', selected, false)
    expect(hidden.json).not.toContain('segreto')
    expect(hidden.json).toContain('Panca')
    expect(hidden.prompt).toContain('session')
    const shown = composeExchange('session-feedback', selected, true)
    expect(shown.json).toContain('segreto')
  })
})
