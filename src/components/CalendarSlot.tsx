import type { FC } from 'react'

interface CalendarSlotProps {
  day: string
  time: string
  planName?: string
  hasPlan?: boolean
}

export const CalendarSlot: FC<CalendarSlotProps> = ({ day, time, planName, hasPlan }) => (
  <div className={`columns mb-2${hasPlan ? '' : ' is-vcentered'}`}>
    <div className="column is-3">
      <p className="has-text-weight-bold is-size-6">{day}</p>
      <p className="has-text-grey is-size-7">{time}</p>
    </div>
    <div className="column">
      {hasPlan ? (
        <div className="tag is-medium is-primary">
          <span className="mr-2">🏋️</span>
          {planName}
        </div>
      ) : (
        <div className="tag is-medium is-light has-text-grey">
          <span className="mr-2">➕</span>
          Nessun piano
        </div>
      )}
    </div>
  </div>
)
