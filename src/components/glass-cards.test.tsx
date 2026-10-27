import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ErrorBoundary } from './ErrorBoundary'
import { ExerciseRow } from './ExerciseRow'
import { ExerciseSetRow } from './ExerciseSetRow'
import { HistoryItem } from './HistoryItem'
import { SessionCard } from './SessionCard'
import { Timer } from './Timer'

function rootClass(ui: React.ReactElement): string {
  const { container } = render(ui)
  return container.firstElementChild?.className ?? ''
}

describe('content rows and floating controls', () => {
  it('renders list rows inside groups, not glass', () => {
    expect(rootClass(<SessionCard title="Panca" status="active" />)).toContain('group-row')
    const history = render(<HistoryItem date="25 ott" type="workout" duration="45 min" />)
    expect(history.container.firstElementChild?.className).toContain('group-row')
    expect(history.container.innerHTML).not.toContain('is-primary')
    expect(rootClass(<ExerciseRow name="Panca" sets={4} reps={10} weight="60 kg" />)).toContain('group-row')
  })

  it('keeps the timer as a floating glass control', () => {
    const started = new Date('2026-10-25T08:00:00.000Z')
    const ended = new Date(started.getTime() + 60 * 60 * 1000)
    expect(rootClass(<Timer startedAt={started.toISOString()} targetEndAt={ended.toISOString()} />)).toContain('glass')
  })

  it('uses a field for the set weight', () => {
    const { container } = render(
      <ExerciseSetRow
        setLog={{
          id: 's',
          exerciseLogId: 'e',
          repCount: 10,
          kg: 60,
          completed: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        }}
        index={0}
        isCompleted={false}
        onToggleComplete={() => Promise.resolve()}
      />,
    )
    expect(container.firstElementChild?.className).toContain('group-row')
    expect(container.querySelector('[aria-label="Set 1 peso"]')?.className).toContain('field')
  })

  it('falls back to ink when a child throws', () => {
    function Boom(): React.ReactElement {
      throw new Error('boom')
    }
    const { container } = render(
      <ErrorBoundary>
        <Boom />
      </ErrorBoundary>,
    )
    expect(container.firstElementChild?.className).toContain('fallback')
  })
})
