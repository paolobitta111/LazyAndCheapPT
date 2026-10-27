import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { MetricCubes } from './MetricCubes'
import { SessionBox } from './SessionBox'
import { SubstituteCombo } from './SubstituteCombo'

describe('material consolidation', () => {
  it('MetricCubes renders one group with two halves and no inline glass styles', () => {
    const { container } = render(
      <MetricCubes weather={{ tempC: 18, wind: 12 }} health={{}} onEditHealth={() => undefined} />,
    )
    expect(container.querySelector('.metrics-row')).not.toBeNull()
    expect(container.querySelectorAll('.group-half')).toHaveLength(2)
    expect(container.innerHTML).not.toContain('rgba(255,255,255,.10)')
  })

  it('SessionBox uses group, badge and tint CTA', () => {
    const { container } = render(
      <SessionBox
        plan={{ planId: 'p', name: 'Full Body A', description: 'd' }}
        schede={[]}
        onSkip={() => undefined}
        onSelect={() => undefined}
        onCheckIn={() => undefined}
        onOpen={() => undefined}
      />,
    )
    const root = container.querySelector('section') as HTMLElement
    expect(root).toHaveClass('group')
    expect(root.querySelector('.badge')?.textContent).toBe('Previsto')
    expect(root.querySelector('.btn-tint')?.textContent).toBe('AI Check-In')
    expect(root.querySelector('.session-actions')).not.toBeNull()
    expect(root.querySelector('.session-actions')).toHaveStyle({ flexWrap: 'wrap' })
    expect(root.innerHTML).not.toContain('fontSize')
  })

  it('SubstituteCombo menu uses the shared menu class', () => {
    const { container } = render(
      <SubstituteCombo
        schede={[{ planId: 'b', name: 'Upper B', description: '' }]}
        currentId="a"
        open
        onToggle={() => undefined}
        onSelect={() => undefined}
      />,
    )
    expect(container.querySelector('.substitute-menu')).toHaveClass('menu')
    expect(container.querySelector('.substitute-menu')).toHaveStyle({ zIndex: '3' })
  })
})
