import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { CalendarSlot } from './CalendarSlot'
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

describe('glass cards', () => {
  it('uses glass on each card root', () => {
    expect(rootClass(<SessionCard title="Panca" status="active" />)).toContain('glass')
    expect(rootClass(<CalendarSlot day="Lunedì" time="08:00" planName="Petto" hasPlan />)).toContain('glass')
    const history = render(<HistoryItem date="25 ott" type="workout" duration="45 min" />)
    expect(history.container.firstElementChild?.className).toContain('glass')
    expect(history.container.innerHTML).not.toContain('is-primary')
    expect(rootClass(<ExerciseRow name="Panca" sets={4} reps={10} weight="60 kg" />)).toContain('glass')

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
    expect(container.firstElementChild?.className).toContain('glass')
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
    expect(container.firstElementChild?.className).toContain('ink-fallback')
  })
})
