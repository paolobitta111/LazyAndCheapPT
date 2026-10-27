import { describe, expect, it } from 'vitest'
import { buildCheckInPrompt, mockSchede, octoberSessions } from './today-mock'

describe('today mock', () => {
  it('lists seven schede starting with Corsa', () => {
    expect(mockSchede).toHaveLength(7)
    expect(mockSchede[0]).toMatchObject({
      id: 'corsa',
      name: 'Corsa',
      subtitle: 'Fondo lento · 40 min · zona 2',
      sport: 'running',
    })
  })

  it('builds the check-in prompt from label and message', () => {
    expect(buildCheckInPrompt('Corsa', 'ho le gambe pesanti')).toBe(
      'Check-in di oggi.\nScheda: Corsa\nMessaggio: ho le gambe pesanti',
    )
  })

  it('marks 23 October and not the 25th', () => {
    const day23 = octoberSessions.find((session) => session.day === 23)
    expect(day23).toMatchObject({
      summary: '32 min · 5,1 km',
      notes: 'Ginocchio ok. Ritmo comodo.',
    })
    expect(octoberSessions.some((session) => session.day === 25)).toBe(false)
  })
})
