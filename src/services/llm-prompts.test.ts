import { describe, expect, it } from 'vitest'
import { buildCheckInPrompt, buildCheckInSystemPrompt, composeExchange } from './llm-prompts'

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

describe('check-in prompts', () => {
  it('builds the export prompt with label and message', () => {
    expect(buildCheckInPrompt('Corsa', 'gambe pesanti')).toBe(
      'Check-in di oggi.\nScheda: Corsa\nMessaggio: gambe pesanti',
    )
  })

  it('builds a system prompt mentioning scheda and metrics', () => {
    const prompt = buildCheckInSystemPrompt('Corsa', {
      sleep: 7,
      restingHr: 52,
      steps: 3240,
      tempC: 14,
      wind: 8,
    })
    expect(prompt).toContain('Corsa')
    expect(prompt).toContain('7')
    expect(prompt).toContain('52')
    expect(prompt).toContain('3240')
    expect(prompt).toContain('14')
    expect(prompt).toContain('8')
  })
})
