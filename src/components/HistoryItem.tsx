import type { FC } from 'react'

interface HistoryItemProps {
  date: string
  type: 'workout' | 'cardio'
  duration: string
  planName?: string
  notes?: string
}

export const HistoryItem: FC<HistoryItemProps> = ({ date, type, duration, planName, notes }) => (
  <div className="glass">
    <p>{type === 'workout' ? 'Workout' : 'Cardio'}</p>
    <p>{date}</p>
    {planName ? <p>{planName}</p> : null}
    <p>{duration}</p>
    {notes ? <p>{notes}</p> : null}
  </div>
)
